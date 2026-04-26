import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import AppNavbar from '@/components/AppNavbar'
import DeleteAccountButton from '@/components/DeleteAccountButton'
import MembershipSection from '@/components/settings/MembershipSection'
import PaymentHistory from '@/components/settings/PaymentHistory'
import AvatarImage from '@/components/settings/AvatarImage'
import MockPaymentsBanner from '@/components/MockPaymentsBanner'
import AppearanceSection from '@/components/settings/AppearanceSection'
import ExperienceLevelSection from '@/components/settings/ExperienceLevelSection'
import { ArrowLeft, BarChart2, User, ShieldCheck } from 'lucide-react'

function formatMemberSince(isoDate: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(
    new Date(isoDate),
  )
}


export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const [profileResult, unspentCreditsResult, resumesResult, spentCreditsResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('display_name, email, avatar_url, credits_remaining, is_admin, plan_type, plan_status, plan_current_period_end, experience_level')
      .eq('id', user.id)
      .single(),
    supabase
      .from('credits')
      .select('source, expires_at')
      .is('spent_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('expires_at', { ascending: true })
      .limit(3),
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
  const unspentCredits = unspentCreditsResult.data ?? []
  const resumesGenerated = resumesResult.data?.length ?? 0
  const regensUsed = resumesResult.data?.reduce((s, r) => s + r.regen_count, 0) ?? 0
  const creditsSpentLifetime = spentCreditsResult.count ?? 0
  const experienceLevel = (
    profile?.experience_level === 'junior' || profile?.experience_level === 'senior'
      ? profile.experience_level : 'mid'
  ) as 'junior' | 'mid' | 'senior'

  return (
    <>
      <MockPaymentsBanner />
      <AppNavbar
        user={{
          display_name: profile?.display_name ?? null,
          email: email,
          avatar_url: avatarUrl,
        }}
        credits={creditsRemaining}
        plan={navPlan}
      />

      <main className="mx-auto max-w-3xl space-y-5 px-4 py-8">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
          >
            <ArrowLeft size={14} />
            Dashboard
          </Link>
        </div>

        <h1 className="font-display text-2xl font-bold text-foreground">Settings</h1>

        {/* Profile */}
        <div className="rounded-xl border border-border/60 bg-surface p-6">
          <div className="mb-5 flex items-center gap-2">
            <User size={15} className="text-muted" />
            <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted">Profile</h2>
          </div>
          <div className="flex items-center gap-4">
            <AvatarImage src={avatarUrl} initial={initial} />
            <div className="flex flex-col">
              <p className="font-medium text-foreground">{email}</p>
              {memberSince && (
                <p className="mt-0.5 text-xs text-muted">Member since {memberSince}</p>
              )}
            </div>
          </div>
        </div>

        {/* Membership */}
        <MembershipSection
          planType={profile?.plan_type as string | null | undefined}
          planStatus={profile?.plan_status as string | null | undefined}
          periodEnd={profile?.plan_current_period_end as string | null | undefined}
          creditsRemaining={creditsRemaining}
          unspentCredits={unspentCredits as Array<{ source: string; expires_at: string }>}
        />

        {/* Payment history — lazy-loaded on expand */}
        <PaymentHistory />

        {/* Usage */}
        <div className="rounded-xl border border-border/60 bg-surface p-6">
          <div className="mb-5 flex items-center gap-2">
            <BarChart2 size={15} className="text-muted" />
            <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted">Usage</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <p className="font-display text-4xl font-bold text-foreground">{resumesGenerated}</p>
              <p className="mt-1 text-xs text-muted">resumes generated</p>
            </div>
            <div>
              <p className="font-display text-4xl font-bold text-foreground">{regensUsed}</p>
              <p className="mt-1 text-xs text-muted">regenerations used</p>
            </div>
            <div>
              <p className="font-display text-4xl font-bold text-foreground">{creditsSpentLifetime}</p>
              <p className="mt-1 text-xs text-muted">credits spent (all time)</p>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <AppearanceSection />

        {/* Experience Level */}
        <ExperienceLevelSection initialLevel={experienceLevel} />

        {/* Admin */}
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {(profile as any)?.is_admin && (
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={15} className="text-indigo-400" />
                <h2 className="text-sm font-semibold text-indigo-400">Admin</h2>
              </div>
              <Link
                href="/admin/overview"
                className="rounded-lg bg-indigo-500/15 px-3 py-1.5 text-sm font-medium text-indigo-400 transition-colors hover:bg-indigo-500/25"
              >
                Open Admin Dashboard →
              </Link>
            </div>
          </div>
        )}

        {/* Danger Zone */}
        <div className="rounded-xl border border-red-500/20 bg-red-950/20 p-6">
          <h2 className="mb-1 text-sm font-semibold text-red-400">Danger Zone</h2>
          <p className="mb-4 text-sm text-muted">Permanently delete your account and all data. This cannot be undone.</p>
          <DeleteAccountButton />
        </div>
      </main>
    </>
  )
}
