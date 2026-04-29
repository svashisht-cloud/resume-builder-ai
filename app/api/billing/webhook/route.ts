export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { getAdminClient } from '@/lib/supabase/admin'
import { makeDodoClient } from '@/lib/billing/dodo-client'
import { getProductFromDodoId, CREDIT_PRODUCTS, SUBSCRIPTION_PRODUCTS } from '@/lib/billing/products'
import type { DodoProduct } from '@/lib/billing/products'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AdminDb = any

async function findUserBySubscriptionId(db: AdminDb, subscriptionId: string): Promise<string | null> {
  const { data } = await db
    .from('profiles')
    .select('id')
    .eq('dodo_subscription_id', subscriptionId)
    .single()
  return (data as { id: string } | null)?.id ?? null
}

async function findUserByCustomerId(db: AdminDb, customerId: string): Promise<string | null> {
  const { data } = await db
    .from('profiles')
    .select('id')
    .eq('dodo_customer_id', customerId)
    .single()
  return (data as { id: string } | null)?.id ?? null
}

async function resolveSubscriptionUserId(
  db: AdminDb,
  subscriptionId: string,
  customerId: string,
  metadata?: Record<string, string>,
): Promise<string | null> {
  let userId = await findUserBySubscriptionId(db, subscriptionId)
  if (!userId) userId = await findUserByCustomerId(db, customerId)
  if (!userId) userId = metadata?.supabase_user_id ?? null
  return userId
}

export async function POST(request: Request) {
  const rawBody = await request.text()
  const webhookSecret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('[webhook] DODO_PAYMENTS_WEBHOOK_SECRET is not set')
    return Response.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  const dodo = makeDodoClient()

  let event: Awaited<ReturnType<typeof dodo.webhooks.unwrap>>
  try {
    const headers: Record<string, string> = {}
    request.headers.forEach((value, key) => { headers[key] = value })
    event = dodo.webhooks.unwrap(rawBody, { headers, key: webhookSecret })
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err)
    return Response.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const db: AdminDb = getAdminClient()

  switch (event.type) {
    case 'payment.succeeded': {
      const data = event.data
      const paymentId: string = data.payment_id
      const customerId: string = data.customer.customer_id
      const totalAmount: number = data.total_amount
      const currency: string = (data as { currency?: string }).currency ?? 'usd'
      const productCart = (data as { product_cart?: Array<{ product_id: string }> }).product_cart

      const subscriptionId = (data as { subscription_id?: string }).subscription_id ?? null

      const dodoProductId = productCart?.[0]?.product_id ?? null
      let product = dodoProductId ? getProductFromDodoId(dodoProductId) : null

      // Subscription payments have product_cart = null; resolve product via fallbacks.
      // NOTE: Fallback 1 relies on Dodo propagating checkout-session metadata into the
      // payment.succeeded payload. Validate this holds in test mode before relying on it
      // for production first-time subscriptions.
      let metaProduct: string | null = null
      if (!product && subscriptionId) {
        // Fallback 1: product embedded in checkout session metadata (new subscriptions).
        metaProduct = (data.metadata as { product?: string } | undefined)?.product ?? null
        if (metaProduct && SUBSCRIPTION_PRODUCTS.includes(metaProduct as DodoProduct)) {
          product = metaProduct as DodoProduct
        }
        // Fallback 2: subscription_id → profile lookup (renewals and deferred switches).
        // Select pending_plan_type alongside plan_type: on the billing date of a monthly→annual
        // switch, payment.succeeded may arrive before subscription.plan_changed, so plan_type
        // is still the old value. pending_plan_type is the authoritative "switching to" plan.
        if (!product) {
          const { data: subProfile } = await db
            .from('profiles')
            .select('plan_type, pending_plan_type, pending_plan_date')
            .eq('dodo_subscription_id', subscriptionId)
            .single()
          const pendingType = subProfile?.pending_plan_type as string | null | undefined
          const pendingDate = subProfile?.pending_plan_date as string | null | undefined
          // Use pending_plan_type only when this payment is for the switch billing cycle.
          // event.timestamp is when Dodo emitted payment.succeeded (i.e. success time),
          // which is a better proxy than data.created_at (payment creation time) for the
          // dunning/retry case where a payment is created before the switch date but
          // confirmed after it. Assumes Dodo emits the event at or after the billing date
          // for the actual annual charge — validate this once in test mode.
          const usesPendingPlan =
            pendingType &&
            pendingDate &&
            SUBSCRIPTION_PRODUCTS.includes(pendingType as DodoProduct) &&
            new Date(event.timestamp) >= new Date(pendingDate)
          const pt = usesPendingPlan
            ? pendingType
            : (subProfile?.plan_type as string | null | undefined)
          if (pt && SUBSCRIPTION_PRODUCTS.includes(pt as DodoProduct)) {
            product = pt as DodoProduct
          }
        }
      }

      if (!product) {
        console.error('[webhook] payment.succeeded: could not resolve product', {
          paymentId, dodoProductId, subscriptionId, customerId, metaProduct,
        })
        break
      }

      let userId = await findUserByCustomerId(db, customerId)

      // FIX 2: if customer_id lookup failed, try metadata fallback and upsert
      // dodo_customer_id onto the profile so the RPC can find the user
      if (!userId) {
        const metaUserId = (data as { metadata?: { supabase_user_id?: string } }).metadata?.supabase_user_id ?? null
        if (metaUserId) {
          await db.from('profiles').update({ dodo_customer_id: customerId }).eq('id', metaUserId)
          userId = metaUserId
        }
      }

      if (!userId) {
        console.error('[webhook] payment.succeeded: no user found for customer', customerId, paymentId)
        return Response.json({ error: 'User not found' }, { status: 500 })
      }

      if (CREDIT_PRODUCTS.includes(product)) {
        const { error } = await db.rpc('purchase_credits', {
          p_product: product,
          p_dodo_payment_id: paymentId,
          p_dodo_customer_id: customerId,
          p_amount_cents: totalAmount,
          p_currency: currency,
        })
        if (error) {
          console.error('[webhook] purchase_credits error:', error)
          return Response.json({ error: 'Failed to grant credits' }, { status: 500 })
        }
      } else if (SUBSCRIPTION_PRODUCTS.includes(product)) {
        const { error } = await db.rpc('record_subscription_payment', {
          p_user_id: userId,
          p_dodo_payment_id: paymentId,
          p_dodo_customer_id: customerId,
          p_product: product,
          p_amount_cents: totalAmount,
          p_currency: currency,
        })
        if (error) {
          console.error('[webhook] record_subscription_payment error (payment.succeeded):', error)
          return Response.json({ error: 'Failed to record subscription payment' }, { status: 500 })
        }
      }
      break
    }

    case 'subscription.active': {
      const data = event.data
      const subscriptionId: string = data.subscription_id
      const customerId: string = data.customer.customer_id
      const productId: string = data.product_id
      const nextBillingDate: string = data.next_billing_date
      const metadata = data.metadata as Record<string, string>

      const product = getProductFromDodoId(productId)
      if (!product || !SUBSCRIPTION_PRODUCTS.includes(product)) {
        console.warn('[webhook] subscription.active: unknown product_id', productId)
        break
      }

      const userId = await resolveSubscriptionUserId(db, subscriptionId, customerId, metadata)
      if (!userId) {
        console.error('[webhook] subscription.active: no user found for subscription', subscriptionId)
        return Response.json({ error: 'User not found' }, { status: 500 })
      }

      const { error } = await db.rpc('activate_subscription_webhook', {
        p_user_id: userId,
        p_plan_type: product,
        p_period_end: nextBillingDate,
        p_dodo_subscription_id: subscriptionId,
        p_dodo_customer_id: customerId,
      })
      if (error) {
        console.error('[webhook] activate_subscription_webhook error:', error)
        return Response.json({ error: 'Failed to activate subscription' }, { status: 500 })
      }

      break
    }

    case 'subscription.renewed': {
      const data = event.data
      const subscriptionId: string = data.subscription_id
      const customerId: string = data.customer.customer_id
      const nextBillingDate: string = data.next_billing_date
      const metadata = (data as { metadata?: Record<string, string> }).metadata

      const userId = await resolveSubscriptionUserId(db, subscriptionId, customerId, metadata)
      if (!userId) {
        console.error('[webhook] subscription.renewed: no user found for subscription', subscriptionId)
        return Response.json({ error: 'User not found' }, { status: 500 })
      }

      const { error } = await db.rpc('renew_subscription', {
        p_user_id: userId,
        p_new_period_end: nextBillingDate,
      })
      if (error) {
        console.error('[webhook] renew_subscription error:', error)
        return Response.json({ error: 'Failed to renew subscription' }, { status: 500 })
      }

      break
    }

    case 'subscription.cancelled': {
      const data = event.data
      const subscriptionId: string = data.subscription_id
      const customerId: string = data.customer.customer_id

      let userId = await findUserBySubscriptionId(db, subscriptionId)
      if (!userId) userId = await findUserByCustomerId(db, customerId)
      if (!userId) {
        console.error('[webhook] subscription.cancelled: no user found for subscription', subscriptionId)
        return Response.json({ error: 'User not found' }, { status: 500 })
      }

      const { error } = await db.rpc('cancel_subscription_webhook', { p_user_id: userId })
      if (error) {
        console.error('[webhook] cancel_subscription_webhook error:', error)
        return Response.json({ error: 'Failed to cancel subscription' }, { status: 500 })
      }
      // Any deferred plan change can no longer activate — clear pending state.
      await db.from('profiles').update({ pending_plan_type: null, pending_plan_date: null }).eq('id', userId)
      break
    }

    // payment failure / dunning — keep access but flag as past_due
    case 'subscription.on_hold':
    case 'subscription.failed': {
      const data = event.data
      const subscriptionId: string = data.subscription_id
      const customerId: string = data.customer.customer_id

      let userId = await findUserBySubscriptionId(db, subscriptionId)
      if (!userId) userId = await findUserByCustomerId(db, customerId)
      if (!userId) {
        console.error(`[webhook] ${event.type}: no user found for subscription`, subscriptionId)
        return Response.json({ error: 'User not found' }, { status: 500 })
      }

      const { error } = await db.rpc('set_subscription_status', { p_user_id: userId, p_status: 'past_due' })
      if (error) {
        console.error(`[webhook] set_subscription_status error (${event.type}):`, error)
        return Response.json({ error: 'Failed to update subscription status' }, { status: 500 })
      }
      // Payment failed so any deferred plan change (e.g. monthly→annual) won't proceed.
      await db.from('profiles').update({ pending_plan_type: null, pending_plan_date: null }).eq('id', userId)
      break
    }

    // subscription fully expired — mark inactive
    case 'subscription.expired': {
      const data = event.data
      const subscriptionId: string = data.subscription_id
      const customerId: string = data.customer.customer_id

      let userId = await findUserBySubscriptionId(db, subscriptionId)
      if (!userId) userId = await findUserByCustomerId(db, customerId)
      if (!userId) {
        console.error('[webhook] subscription.expired: no user found for subscription', subscriptionId)
        return Response.json({ error: 'User not found' }, { status: 500 })
      }

      const { error } = await db.rpc('set_subscription_status', { p_user_id: userId, p_status: 'inactive' })
      if (error) {
        console.error('[webhook] set_subscription_status error (expired):', error)
        return Response.json({ error: 'Failed to update subscription status' }, { status: 500 })
      }
      // Subscription is gone — no pending plan change can ever activate.
      await db.from('profiles').update({ pending_plan_type: null, pending_plan_date: null }).eq('id', userId)
      break
    }

    // subscription.updated fires for any field change (payment method, metadata, scheduled
    // plan changes, etc.) — do NOT sync plan_type here because a deferred plan change
    // (effective_at: next_billing_date) will carry the future product_id in the payload
    // before billing has actually switched. Only sync ancillary fields.
    case 'subscription.updated': {
      const data = event.data
      const subscriptionId: string = data.subscription_id
      const customerId: string = data.customer.customer_id
      const nextBillingDate: string = data.next_billing_date
      const metadata = (data as { metadata?: Record<string, string> }).metadata

      const userId = await resolveSubscriptionUserId(db, subscriptionId, customerId, metadata)
      if (!userId) {
        console.error('[webhook] subscription.updated: no user found for subscription', subscriptionId)
        return Response.json({ error: 'User not found' }, { status: 500 })
      }

      const { error } = await db.rpc('sync_subscription_meta', {
        p_user_id: userId,
        p_period_end: nextBillingDate,
        p_dodo_subscription_id: subscriptionId,
        p_dodo_customer_id: customerId,
      })
      if (error) {
        console.error('[webhook] sync_subscription_meta error (subscription.updated):', error)
        return Response.json({ error: 'Failed to sync subscription' }, { status: 500 })
      }
      break
    }

    // subscription.plan_changed fires only when the plan tier actually activates —
    // safe to sync plan_type here. Does not represent a new billing cycle so usage
    // counters must be preserved.
    case 'subscription.plan_changed': {
      const data = event.data
      const subscriptionId: string = data.subscription_id
      const customerId: string = data.customer.customer_id
      const productId: string = data.product_id
      const nextBillingDate: string = data.next_billing_date
      const metadata = (data as { metadata?: Record<string, string> }).metadata

      const product = getProductFromDodoId(productId)
      if (!product || !SUBSCRIPTION_PRODUCTS.includes(product)) {
        console.warn('[webhook] subscription.plan_changed: unknown product_id', productId)
        break
      }

      const userId = await resolveSubscriptionUserId(db, subscriptionId, customerId, metadata)
      if (!userId) {
        console.error('[webhook] subscription.plan_changed: no user found for subscription', subscriptionId)
        return Response.json({ error: 'User not found' }, { status: 500 })
      }

      const { error } = await db.rpc('sync_subscription', {
        p_user_id: userId,
        p_plan_type: product,
        p_period_end: nextBillingDate,
        p_dodo_subscription_id: subscriptionId,
        p_dodo_customer_id: customerId,
      })
      if (error) {
        console.error('[webhook] sync_subscription error (subscription.plan_changed):', error)
        return Response.json({ error: 'Failed to sync subscription' }, { status: 500 })
      }
      break
    }

    default:
      break
  }

  return Response.json({ received: true }, { status: 200 })
}
