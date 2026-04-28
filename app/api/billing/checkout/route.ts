export const runtime = 'nodejs'

import { createClient } from '@/lib/supabase/server'
import { makeDodoClient, getAppUrl } from '@/lib/billing/dodo-client'
import { getDodoProductId, isValidDodoProduct, SUBSCRIPTION_PRODUCTS } from '@/lib/billing/products'
import type { DodoProduct } from '@/lib/billing/products'

export async function POST(request: Request) {
  const body = await request.json() as { product?: string }
  const { product } = body

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

  try {
    const dodo = makeDodoClient()
    const appUrl = getAppUrl()
    const productId = getDodoProductId(product as DodoProduct)

    const session = await dodo.checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: existingCustomerId
        ? { customer_id: existingCustomerId }
        : { email: userEmail },
      return_url: `${appUrl}/settings?checkout=success${SUBSCRIPTION_PRODUCTS.includes(product as DodoProduct) ? '&type=subscription' : ''}`,
      cancel_url: `${appUrl}/settings?checkout=cancelled`,
      metadata: { supabase_user_id: user.id },
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
