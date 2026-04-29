import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import AppNavbar from '@/components/AppNavbar'
import SettingsClient from '@/components/settings/SettingsClient'
import { ArrowLeft } from 'lucide-react'

function formatMemberSince(isoDate: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(
    new Date(isoDate),
  )
}

const BASE_SETTINGS_SECTIONS = [
  { id: 'profile', label: 'Profile' },
  { id: 'billing', label: 'Billing & Credits' },
  { id: 'payment', label: 'Payment Method' },
  { id: 'usage', label: 'Usage' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'experience', label: 'Experience Level' },
  { id: 'account', label: 'Account' },
]

interface SettingsPageProps {
  searchParams?: Promise<{ section?: string }>
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const resolvedSearchParams = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const [profileResult, resumesResult, spentCreditsResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('display_name, email, avatar_url, credits_remaining, is_admin, plan_type, plan_status, plan_current_period_end, experience_level, pending_plan_type, pending_plan_date')
      .eq('id', user.id)
      .single(),
    supabase
      .from('resumes')
      .select('regen_count'),
    supabase
      .from('credits')
      .select('id', { count: 'exact', head: true })
      .not('spent_at', 'is', null),
  ])

  const profile = profileResult.data
  const email = profile?.email ?? user.email ?? ''
  const avatarUrl =
    profile?.avatar_url ??
    (user.user_metadata?.avatar_url as string | undefined) ??
    (user.user_metadata?.picture as string | undefined) ??
    null
  const memberSince = user.created_at ? formatMemberSince(user.created_at) : null
  const initial = (email[0] ?? '?').toUpperCase()

  const creditsRemaining = profile?.credits_remaining ?? 0
  const settingsPlanType = profile?.plan_type as string | null | undefined
  const settingsPlanStatus = profile?.plan_status as string | null | undefined
  const settingsPeriodEnd = profile?.plan_current_period_end as string | null | undefined
  const settingsStillInPeriod = settingsPeriodEnd ? new Date(settingsPeriodEnd) > new Date() : false
  const navPlan: 'free' | 'pro_monthly' | 'pro_annual' =
    (settingsPlanType === 'pro_monthly' || settingsPlanType === 'pro_annual') &&
    (settingsPlanStatus === 'active' || (settingsPlanStatus === 'cancelled' && settingsStillInPeriod))
      ? (settingsPlanType as 'pro_monthly' | 'pro_annual')
      : 'free'
  const resumesGenerated = resumesResult.data?.length ?? 0
  const regensUsed = resumesResult.data?.reduce((s, r) => s + r.regen_count, 0) ?? 0
  const creditsSpentLifetime = spentCreditsResult.count ?? 0
  const experienceLevel = (
    profile?.experience_level === 'junior' || profile?.experience_level === 'senior'
      ? profile.experience_level : 'mid'
  ) as 'junior' | 'mid' | 'senior'
  const isAdmin = profile?.is_admin === true
  const settingsSections = [
    ...BASE_SETTINGS_SECTIONS,
    ...(isAdmin ? [{ id: 'admin', label: 'Admin' }] : []),
  ]
  const requestedSection = resolvedSearchParams?.section ?? 'profile'
  const activeSection = settingsSections.some((section) => section.id === requestedSection)
    ? requestedSection
    : 'profile'

  return (
    <>
      <AppNavbar
        user={{
          display_name: profile?.display_name ?? null,
          email: email,
          avatar_url: avatarUrl,
        }}
        credits={creditsRemaining}
        plan={navPlan}
      />

      <main className="mx-auto max-w-6xl px-4 py-7 sm:px-6">
        <div className="hidden lg:block mb-7 border-b border-border/40 pb-6">
          <Link
            href="/dashboard"
            className="mb-4 inline-flex items-center gap-2 rounded-lg border border-border/60 bg-surface-raised/60 px-3 py-2 text-sm font-medium text-muted transition-colors hover:border-border hover:text-foreground"
          >
            <ArrowLeft size={14} />
            Dashboard
          </Link>
          <h1 className="font-display text-3xl font-bold text-foreground">Settings</h1>
          <p className="mt-1 text-sm text-muted">
            Manage your account, billing, preferences, and resume defaults.
          </p>
        </div>

        <SettingsClient
          initialSection={activeSection}
          sections={settingsSections}
          profile={{
            email,
            avatarUrl,
            initial,
            memberSince,
            planType: profile?.plan_type as string | null | undefined,
            planStatus: profile?.plan_status as string | null | undefined,
            periodEnd: profile?.plan_current_period_end as string | null | undefined,
            pendingPlanType: profile?.pending_plan_type as string | null | undefined,
            pendingPlanDate: profile?.pending_plan_date as string | null | undefined,
            creditsRemaining,
            experienceLevel,
            isAdmin,
          }}
          usage={{
            resumesGenerated,
            regensUsed,
            creditsSpentLifetime,
          }}
        />
      </main>
    </>
  )
}
