export const runtime = 'nodejs'

import { createClient } from '@/lib/supabase/server'
import { CREDIT_PRODUCTS, isValidDodoProduct, SUBSCRIPTION_PRODUCTS } from '@/lib/billing/products'

type CheckoutStatus = 'confirmed' | 'pending' | 'not_found'

function hasActivePlan(
  planType: string | null | undefined,
  planStatus: string | null | undefined,
  periodEnd: string | null | undefined,
) {
  const stillInPeriod = periodEnd ? new Date(periodEnd) > new Date() : false
  return (
    (planType === 'pro_monthly' || planType === 'pro_annual') &&
    (planStatus === 'active' ||
      (planStatus === 'cancelled' && stillInPeriod) ||
      (planStatus === 'past_due' && stillInPeriod))
  )
}

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams
  const type = searchParams.get('type')
  const product = searchParams.get('product')
  const startedAt = searchParams.get('started_at')

  if ((type !== 'subscription' && type !== 'credits') || !product || !startedAt || !isValidDodoProduct(product)) {
    return Response.json({ error: 'Invalid checkout verification request.' }, { status: 400 })
  }

  if (type === 'subscription' && !SUBSCRIPTION_PRODUCTS.includes(product)) {
    return Response.json({ error: 'Product/type mismatch.' }, { status: 400 })
  }
  if (type === 'credits' && !CREDIT_PRODUCTS.includes(product)) {
    return Response.json({ error: 'Product/type mismatch.' }, { status: 400 })
  }

  const startedAtDate = new Date(startedAt)
  if (Number.isNaN(startedAtDate.getTime())) {
    return Response.json({ error: 'Invalid checkout start time.' }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [{ data: profile, error: profileError }, { data: payment, error: paymentError }] = await Promise.all([
    supabase
      .from('profiles')
      .select('plan_type, plan_status, plan_current_period_end')
      .eq('id', user.id)
      .single(),
    supabase
      .from('payments')
      .select('id')
      .eq('user_id', user.id)
      .eq('product', product)
      .eq('status', 'succeeded')
      .gte('paid_at', startedAtDate.toISOString())
      .order('paid_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  if (profileError || paymentError) {
    return Response.json({ error: profileError?.message ?? paymentError?.message ?? 'Verification failed.' }, { status: 500 })
  }

  let status: CheckoutStatus = 'pending'

  if (type === 'subscription') {
    const planType = profile?.plan_type as string | null | undefined
    const planStatus = profile?.plan_status as string | null | undefined
    const periodEnd = profile?.plan_current_period_end as string | null | undefined
    const activeExpectedPlan = planType === product && hasActivePlan(planType, planStatus, periodEnd)

    if (activeExpectedPlan || payment) {
      status = 'confirmed'
    }
  } else if (payment) {
    status = 'confirmed'
  }

  if (status === 'pending' && Date.now() - startedAtDate.getTime() > 10 * 60 * 1000) {
    status = 'not_found'
  }

  return Response.json({ status })
}
