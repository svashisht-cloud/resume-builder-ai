export const runtime = 'nodejs'

import { createClient } from '@/lib/supabase/server'
import { makeDodoClient } from '@/lib/billing/dodo-client'
import { getDodoProductId } from '@/lib/billing/products'

type SubscriptionProduct = 'pro_monthly' | 'pro_annual'

function isSubscriptionProduct(value: unknown): value is SubscriptionProduct {
  return value === 'pro_monthly' || value === 'pro_annual'
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { product?: unknown } | null
  const product = body?.product

  if (!isSubscriptionProduct(product)) {
    return Response.json({ error: 'Invalid product.' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('dodo_subscription_id, plan_type, plan_status, plan_current_period_end, pending_plan_type')
    .eq('id', user.id)
    .single()

  if (profileError) {
    return Response.json({ error: profileError.message }, { status: 500 })
  }

  const subscriptionId = profile?.dodo_subscription_id as string | null
  const currentPlan = profile?.plan_type as string | null
  const currentStatus = profile?.plan_status as string | null
  const periodEnd = profile?.plan_current_period_end as string | null
  const pendingPlanType = profile?.pending_plan_type as string | null
  const stillInPeriod = periodEnd ? new Date(periodEnd) > new Date() : false
  const canChange =
    !!subscriptionId &&
    (currentPlan === 'pro_monthly' || currentPlan === 'pro_annual') &&
    currentStatus === 'active' &&
    stillInPeriod

  if (!canChange) {
    return Response.json({ error: 'No active subscription found.' }, { status: 400 })
  }

  if (currentPlan === product || pendingPlanType === product) {
    return Response.json({ success: true, unchanged: true })
  }

  try {
    const dodo = makeDodoClient()
    await dodo.subscriptions.changePlan(subscriptionId, {
      product_id: getDodoProductId(product),
      quantity: 1,
      proration_billing_mode: 'full_immediately',
      effective_at: 'next_billing_date',
      on_payment_failure: 'prevent_change',
      metadata: { supabase_user_id: user.id },
    })

    // Record the pending switch so the UI can show "Annual starts on [date]"
    // and so the webhook guard knows when the activation is expected.
    const { error: pendingError } = await supabase
      .from('profiles')
      .update({ pending_plan_type: product, pending_plan_date: periodEnd })
      .eq('id', user.id)

    if (pendingError) {
      console.error('[change-plan] Failed to persist pending plan state:', pendingError)
      // Dodo switch is scheduled but local state couldn't be recorded.
      // Signal the client so it can prompt a refresh instead of a silent gap.
      return Response.json({ success: true, pendingStateError: true })
    }

    return Response.json({ success: true })
  } catch (err) {
    console.error('[change-plan] Dodo API error:', err)
    return Response.json({ error: 'Failed to change subscription plan.' }, { status: 500 })
  }
}
