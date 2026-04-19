// TODO: profiles table does not yet have credits_remaining — hardcoded below until schema is extended
// TODO: no resumes table in schema yet — usage count hardcoded to 0 until table is added
// TODO: plan column only supports 'free'|'pro' — extend enum when billing tiers are wired

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppNavbar from '@/components/AppNavbar'
import DeleteAccountButton from '@/components/DeleteAccountButton'
import SwitchPlanSection from '@/components/settings/SwitchPlanSection'
import AvatarImage from '@/components/settings/AvatarImage'

function formatMemberSince(isoDate: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(
    new Date(isoDate),
  )
}

function PlanBadge({ plan }: { plan: string }) {
  const label =
    plan === 'pro' ? 'Pro' : plan === 'pack' ? 'Resume Pack' : plan === 'plus' ? 'Resume Pack Plus' : 'Free'
  return (
    <span className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
      {label}
    </span>
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

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, email, avatar_url, plan')
    .eq('id', user.id)
    .single()

  const email = profile?.email ?? user.email ?? ''
  // Check both avatar_url and picture (Supabase sometimes uses either)
  const avatarUrl =
    profile?.avatar_url ??
    (user.user_metadata?.avatar_url as string | undefined) ??
    (user.user_metadata?.picture as string | undefined) ??
    null
  const plan = profile?.plan ?? 'free'
  const memberSince = user.created_at ? formatMemberSince(user.created_at) : null
  const initial = (email[0] ?? '?').toUpperCase()

  // TODO: replace with profile.credits_remaining once column exists
  const creditsRemaining = 1
  const creditsTotal = 1

  // TODO: replace with count query once resumes table exists
  const resumesGenerated = 0

  return (
    <>
      <AppNavbar
        user={{
          display_name: profile?.display_name ?? null,
          email: email,
          avatar_url: avatarUrl,
        }}
      />

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-10">
        <h1 className="font-display text-2xl font-bold text-foreground">Settings</h1>

        {/* Profile */}
        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="font-display mb-5 text-lg font-semibold text-foreground">Profile</h2>
          <div className="flex items-center gap-4">
            <AvatarImage src={avatarUrl} initial={initial} />
            <div className="flex flex-col">
              <p className="text-sm text-foreground">{email}</p>
              {memberSince && (
                <p className="mt-0.5 text-xs text-muted">Member since {memberSince}</p>
              )}
            </div>
          </div>
        </div>

        {/* Current Plan */}
        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="font-display mb-5 text-lg font-semibold text-foreground">Current Plan</h2>
          <div className="flex items-center gap-3">
            <PlanBadge plan={plan} />
            <p className="text-sm text-muted">
              {creditsRemaining} of {creditsTotal} credit{creditsTotal !== 1 ? 's' : ''} remaining
            </p>
          </div>
        </div>

        {/* Switch Plan */}
        <SwitchPlanSection currentPlan={plan} />

        {/* Usage */}
        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="font-display mb-5 text-lg font-semibold text-foreground">Usage</h2>
          <div>
            <p className="font-display text-3xl font-bold text-foreground">{resumesGenerated}</p>
            <p className="text-sm text-muted">Resumes generated</p>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-xl border border-red-900/50 bg-surface p-6">
          <h2 className="mb-1 text-sm font-semibold text-red-400">Danger Zone</h2>
          <p className="mb-4 text-sm text-muted">Permanently delete your account and all data.</p>
          <DeleteAccountButton />
        </div>
      </main>
    </>
  )
}
