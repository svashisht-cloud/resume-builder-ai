import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppNavbar from '@/components/AppNavbar'
import { DashboardShell } from '@/components/DashboardShell'
import { resolveNavPlan } from '@/lib/utils/plan'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, email, avatar_url, credits_remaining, plan_type, plan_status, plan_current_period_end, experience_level')
    .eq('id', user.id)
    .single()

  const navPlan = resolveNavPlan(
    profile?.plan_type,
    profile?.plan_status,
    profile?.plan_current_period_end,
  )

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <AppNavbar
        user={{
          display_name: profile?.display_name ?? null,
          email: profile?.email ?? user.email ?? null,
          avatar_url: profile?.avatar_url ?? null,
        }}
        credits={profile?.credits_remaining ?? 0}
        plan={navPlan}
      />
      <DashboardShell experienceLevel={
        (profile?.experience_level === 'junior' || profile?.experience_level === 'senior'
          ? profile.experience_level : 'mid') as 'junior' | 'mid' | 'senior'
      }
        plan={navPlan}
        creditsRemaining={profile?.credits_remaining ?? 0}
      />
    </div>
  )
}
