export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { getAdminClient } from '@/lib/supabase/admin'
import { makeDodoClient } from '@/lib/billing/dodo-client'
import { getProductFromDodoId, CREDIT_PRODUCTS, SUBSCRIPTION_PRODUCTS } from '@/lib/billing/products'

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

      const dodoProductId = productCart?.[0]?.product_id ?? null
      const product = dodoProductId ? getProductFromDodoId(dodoProductId) : null

      if (!product) break

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
      break
    }

    // FIX 3: payment failure / dunning — keep access but flag as past_due
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
      break
    }

    // FIX 3: subscription fully expired — mark inactive
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
      break
    }

    // Sync plan metadata only — do NOT reset monthly usage.
    // subscription.updated fires for any field change (payment method, metadata, etc.)
    // subscription.plan_changed fires on plan tier changes.
    // Neither represents a new billing cycle, so usage counters must be preserved.
    case 'subscription.updated':
    case 'subscription.plan_changed': {
      const data = event.data
      const subscriptionId: string = data.subscription_id
      const customerId: string = data.customer.customer_id
      const productId: string = data.product_id
      const nextBillingDate: string = data.next_billing_date
      const metadata = (data as { metadata?: Record<string, string> }).metadata

      const product = getProductFromDodoId(productId)
      if (!product || !SUBSCRIPTION_PRODUCTS.includes(product)) {
        console.warn(`[webhook] ${event.type}: unknown product_id`, productId)
        break
      }

      const userId = await resolveSubscriptionUserId(db, subscriptionId, customerId, metadata)
      if (!userId) {
        console.error(`[webhook] ${event.type}: no user found for subscription`, subscriptionId)
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
        console.error(`[webhook] sync_subscription error (${event.type}):`, error)
        return Response.json({ error: 'Failed to sync subscription' }, { status: 500 })
      }
      break
    }

    default:
      break
  }

  return Response.json({ received: true }, { status: 200 })
}
