export function resolveNavPlan(
  planType: string | null | undefined,
  planStatus: string | null | undefined,
  periodEnd: string | null | undefined,
): 'free' | 'pro_monthly' | 'pro_annual' {
  const stillInPeriod = periodEnd ? new Date(periodEnd) > new Date() : false
  if (
    (planType === 'pro_monthly' || planType === 'pro_annual') &&
    (planStatus === 'active' ||
      (planStatus === 'cancelled' && stillInPeriod) ||
      (planStatus === 'past_due' && stillInPeriod))
  ) {
    return planType as 'pro_monthly' | 'pro_annual'
  }
  return 'free'
}
