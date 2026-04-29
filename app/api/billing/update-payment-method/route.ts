export const runtime = 'nodejs'

import { createClient } from '@/lib/supabase/server'
import { makeDodoClient, getAppUrl } from '@/lib/billing/dodo-client'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('dodo_subscription_id, plan_type, plan_status, plan_current_period_end')
    .eq('id', user.id)
    .single()

  if (profileError) {
    return Response.json({ error: profileError.message }, { status: 500 })
  }

  const subscriptionId = profile?.dodo_subscription_id as string | null
  const planType = profile?.plan_type as string | null
  const planStatus = profile?.plan_status as string | null
  const periodEnd = profile?.plan_current_period_end as string | null
  const stillInPeriod = periodEnd ? new Date(periodEnd) > new Date() : false
  const hasSubscription =
    !!subscriptionId &&
    (planType === 'pro_monthly' || planType === 'pro_annual') &&
    (planStatus === 'active' ||
      ((planStatus === 'cancelled' || planStatus === 'past_due') && stillInPeriod))

  if (!hasSubscription) {
    return Response.json({ error: 'No active subscription found.' }, { status: 400 })
  }

  try {
    const dodo = makeDodoClient()
    const result = await dodo.subscriptions.updatePaymentMethod(subscriptionId, {
      type: 'new',
      return_url: `${getAppUrl()}/settings?section=payment`,
    })

    if (!result.payment_link) {
      return Response.json({ error: 'No payment link returned from Dodo.' }, { status: 500 })
    }

    return Response.json({ paymentLink: result.payment_link })
  } catch (err) {
    console.error('[update-payment-method] Dodo API error:', err)
    return Response.json({ error: 'Failed to initiate payment method update.' }, { status: 500 })
  }
}
