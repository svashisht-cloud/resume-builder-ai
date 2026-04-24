import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppNavbar from '@/components/AppNavbar'
import { DashboardShell } from '@/components/DashboardShell'
import MockPaymentsBanner from '@/components/MockPaymentsBanner'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, email, avatar_url, credits_remaining, plan_type, plan_status, plan_current_period_end')
    .eq('id', user.id)
    .single()

  const planType = profile?.plan_type as string | null | undefined
  const planStatus = profile?.plan_status as string | null | undefined
  const planPeriodEnd = profile?.plan_current_period_end as string | null | undefined
  const stillInPeriod = planPeriodEnd ? new Date(planPeriodEnd) > new Date() : false
  const navPlan: 'free' | 'pro_monthly' | 'pro_annual' =
    (planType === 'pro_monthly' || planType === 'pro_annual') &&
    (planStatus === 'active' || (planStatus === 'cancelled' && stillInPeriod))
      ? (planType as 'pro_monthly' | 'pro_annual')
      : 'free'

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <MockPaymentsBanner />
      <AppNavbar
        user={{
          display_name: profile?.display_name ?? null,
          email: profile?.email ?? user.email ?? null,
          avatar_url: profile?.avatar_url ?? null,
        }}
        credits={profile?.credits_remaining ?? 0}
        plan={navPlan}
      />
      <DashboardShell />
    </div>
  )
}
