export const runtime = 'nodejs'

import { createClient } from '@/lib/supabase/server'
import { makeDodoClient } from '@/lib/billing/dodo-client'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json() as { paymentMethodId?: string }
  const paymentMethodId = body.paymentMethodId
  if (!paymentMethodId || typeof paymentMethodId !== 'string') {
    return Response.json({ error: 'paymentMethodId is required.' }, { status: 400 })
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
    return Response.json({ error: 'No Dodo customer found.' }, { status: 400 })
  }

  try {
    const dodo = makeDodoClient()
    await dodo.customers.deletePaymentMethod(paymentMethodId, { customer_id: customerId })
    return Response.json({ success: true })
  } catch (err) {
    console.error('[delete-payment-method] Dodo API error:', err)
    return Response.json({ error: 'Failed to remove payment method.' }, { status: 500 })
  }
}
