export const runtime = 'nodejs'

import { createClient } from '@/lib/supabase/server'
import { makeDodoClient, getAppUrl } from '@/lib/billing/dodo-client'
import {
  CREDIT_PRODUCTS,
  getDodoProductId,
  isValidDodoProduct,
  SUBSCRIPTION_PRODUCTS,
} from '@/lib/billing/products'
import type { DodoProduct } from '@/lib/billing/products'
import type DodoPayments from 'dodopayments'

export async function POST(request: Request) {
  const body = await request.json() as { product?: string; paymentMethodId?: string; billingZip?: string; billingCountry?: string }
  const { product, paymentMethodId, billingZip, billingCountry } = body

  if (!product || !isValidDodoProduct(product)) {
    return Response.json({ error: 'Invalid product' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('email, dodo_customer_id')
    .eq('id', user.id)
    .single()

  const existingCustomerId = profile?.dodo_customer_id as string | null
  const userEmail = profile?.email ?? user.email ?? ''

  // Confirm flow requires an existing customer ID and billing address
  if (paymentMethodId && !existingCustomerId) {
    return Response.json({ error: 'No saved customer found. Please use the standard checkout.' }, { status: 400 })
  }
  if (paymentMethodId && (!billingZip || !billingCountry)) {
    return Response.json({ error: 'Billing zip code and country are required.' }, { status: 400 })
  }

  try {
    const dodo = makeDodoClient()
    const appUrl = getAppUrl()
    const productId = getDodoProductId(product as DodoProduct)
    const checkoutType = SUBSCRIPTION_PRODUCTS.includes(product as DodoProduct) ? 'subscription' : 'credits'
    const startedAt = new Date().toISOString()
    const returnUrl = new URL('/settings', appUrl)
    returnUrl.searchParams.set('section', 'billing')
    returnUrl.searchParams.set('checkout', 'success')
    returnUrl.searchParams.set('type', checkoutType)
    returnUrl.searchParams.set('product', product)
    returnUrl.searchParams.set('started_at', startedAt)

    const cancelUrl = new URL('/settings', appUrl)
    cancelUrl.searchParams.set('section', 'billing')
    cancelUrl.searchParams.set('checkout', 'cancelled')
    if (CREDIT_PRODUCTS.includes(product as DodoProduct)) {
      cancelUrl.searchParams.set('type', 'credits')
    } else {
      cancelUrl.searchParams.set('type', 'subscription')
    }

    if (paymentMethodId && existingCustomerId && billingZip && billingCountry) {
      // Charge card on file — no redirect needed
      await dodo.checkoutSessions.create({
        product_cart: [{ product_id: productId, quantity: 1 }],
        customer: { customer_id: existingCustomerId },
        confirm: true,
        payment_method_id: paymentMethodId,
        minimal_address: true,
        billing_address: { country: billingCountry as DodoPayments.CheckoutSessionBillingAddress['country'], zipcode: billingZip },
        return_url: returnUrl.toString(),
        metadata: { supabase_user_id: user.id, product },
      })
      return Response.json({ success: true })
    }

    // Standard hosted checkout — redirect
    const session = await dodo.checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: existingCustomerId
        ? { customer_id: existingCustomerId }
        : { email: userEmail },
      return_url: returnUrl.toString(),
      cancel_url: cancelUrl.toString(),
      metadata: { supabase_user_id: user.id, product },
    })

    if (!session.checkout_url) {
      return Response.json({ error: 'Checkout session creation failed' }, { status: 500 })
    }

    return Response.json({ checkoutUrl: session.checkout_url })
  } catch (err) {
    console.error('[checkout] Dodo API error:', err)
    return Response.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
