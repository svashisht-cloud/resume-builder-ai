export const runtime = 'nodejs'

import { createClient } from '@/lib/supabase/server'
import { makeDodoClient } from '@/lib/billing/dodo-client'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('dodo_customer_id')
    .eq('id', user.id)
    .single()

  if (profileError) {
    return Response.json({ error: profileError.message }, { status: 500 })
  }

  const customerId = profile?.dodo_customer_id as string | null
  if (!customerId) {
    return Response.json({ paymentMethod: null })
  }

  try {
    const dodo = makeDodoClient()
    const result = await dodo.customers.retrievePaymentMethods(customerId)
    const methods = Array.isArray(result) ? result : (result as { items?: unknown[] }).items ?? []
    const recurring = (methods as Array<{
      payment_method_id: string
      payment_method: string
      recurring_enabled?: boolean | null
      card?: {
        last4_digits?: string | null
        card_network?: string | null
        expiry_month?: number | null
        expiry_year?: number | null
        card_issuing_country?: string | null
      } | null
    }>).find((m) => m.recurring_enabled === true)

    if (!recurring) {
      return Response.json({ paymentMethod: null })
    }

    return Response.json({
      paymentMethod: {
        id: recurring.payment_method_id,
        type: recurring.payment_method,
        last4: recurring.card?.last4_digits ?? null,
        brand: recurring.card?.card_network ?? null,
        expiryMonth: recurring.card?.expiry_month ?? null,
        expiryYear: recurring.card?.expiry_year ?? null,
        country: recurring.card?.card_issuing_country ?? null,
      },
    })
  } catch (err) {
    console.error('[payment-method] Dodo API error:', err)
    return Response.json({ error: 'Failed to fetch payment method.' }, { status: 500 })
  }
}
