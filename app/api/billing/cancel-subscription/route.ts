export const runtime = 'nodejs'

import { createClient } from '@/lib/supabase/server'
import { makeDodoClient } from '@/lib/billing/dodo-client'

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
  const periodEnd = profile?.plan_current_period_end as string | null
  const stillInPeriod = periodEnd ? new Date(periodEnd) > new Date() : false
  const hasSubscription =
    !!subscriptionId &&
    (planType === 'pro_monthly' || planType === 'pro_annual') &&
    stillInPeriod

  if (!hasSubscription) {
    return Response.json({ error: 'No active subscription found.' }, { status: 400 })
  }

  try {
    const dodo = makeDodoClient()
    await dodo.subscriptions.update(subscriptionId, {
      cancel_at_next_billing_date: true,
      cancel_reason: 'cancelled_by_customer',
    })

    const { error: cancelError } = await supabase.rpc('cancel_subscription', {
      p_user_id: user.id,
    })

    if (cancelError) {
      return Response.json({ error: cancelError.message }, { status: 500 })
    }

    return Response.json({ success: true })
  } catch (err) {
    console.error('[cancel-subscription] Dodo API error:', err)
    return Response.json({ error: 'Failed to cancel subscription.' }, { status: 500 })
  }
}
