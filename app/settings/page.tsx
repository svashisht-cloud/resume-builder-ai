// TODO: profiles table does not yet have credits_remaining — hardcoded below until schema is extended
// TODO: no resumes table in schema yet — usage count hardcoded to 0 until table is added
// TODO: plan column only supports 'free'|'pro' — extend enum when billing tiers are wired

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppNavbar from '@/components/AppNavbar'
import EditableName from '@/components/EditableName'
import DeleteAccountButton from '@/components/DeleteAccountButton'
import SwitchPlanSection from '@/components/settings/SwitchPlanSection'

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

  const displayName = profile?.display_name ?? ''
  const email = profile?.email ?? user.email ?? ''
  const avatarUrl = profile?.avatar_url ?? null
  const plan = profile?.plan ?? 'free'
  const memberSince = user.created_at ? formatMemberSince(user.created_at) : null

  // TODO: replace with profile.credits_remaining once column exists
  const creditsRemaining = 1
  const creditsTotal = 1

  // TODO: replace with count query once resumes table exists
  const resumesGenerated = 0

  const initial = (profile?.display_name ?? user.email ?? '?')[0].toUpperCase()

  return (
    <>
      <AppNavbar
        user={{
          display_name: profile?.display_name ?? null,
          email: email,
          avatar_url: avatarUrl,
        }}
      />

      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="font-display mb-8 text-2xl font-bold text-foreground">Settings</h1>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_2fr]">
          {/* Left column */}
          <div className="space-y-6">
            {/* Profile card */}
            <div className="rounded-xl border border-border bg-surface p-6">
              <h2 className="font-display mb-5 text-lg font-semibold text-foreground">Profile</h2>

              {/* Avatar */}
              <div className="mb-5 flex items-center gap-4">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-xl font-bold text-accent">
                    {initial}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {profile?.display_name ?? 'User'}
                  </p>
                  <p className="truncate text-xs text-muted">{email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted">Display Name</label>
                  <EditableName initialName={displayName} userId={user.id} />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">Email</label>
                  <p className="text-sm text-foreground">{email}</p>
                </div>

                {memberSince && (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted">Member since</label>
                    <p className="text-sm text-foreground">{memberSince}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="rounded-xl border border-red-900/50 bg-surface p-6">
              <h2 className="mb-1 text-sm font-semibold text-red-400">Danger Zone</h2>
              <p className="mb-4 text-sm text-muted">Permanently delete your account and all data.</p>
              <DeleteAccountButton />
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
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
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-display text-3xl font-bold text-foreground">{resumesGenerated}</p>
                  <p className="text-sm text-muted">Resumes generated</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
