// TODO: profiles table does not yet have credits_remaining — hardcoded below until schema is extended
// TODO: no resumes table in schema yet — usage count hardcoded to 0 until table is added
// TODO: plan column only supports 'free'|'pro' — extend enum when billing tiers are wired

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import AppNavbar from '@/components/AppNavbar'
import DeleteAccountButton from '@/components/DeleteAccountButton'
import SwitchPlanSection from '@/components/settings/SwitchPlanSection'
import AvatarImage from '@/components/settings/AvatarImage'
import { ArrowLeft, CreditCard, BarChart2, User } from 'lucide-react'

function formatMemberSince(isoDate: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(
    new Date(isoDate),
  )
}

function PlanBadge({ plan }: { plan: string }) {
  const label =
    plan === 'pro' ? 'Pro' : plan === 'pack' ? 'Resume Pack' : plan === 'plus' ? 'Resume Pack Plus' : 'Free'
  const isPaid = plan !== 'free'
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        isPaid
          ? 'bg-gradient-to-r from-accent/20 to-accent-secondary/20 text-accent border border-accent/30'
          : 'bg-surface-raised text-muted border border-border'
      }`}
    >
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

        {/* Current Plan */}
        <div className="rounded-xl border border-border/60 bg-surface p-6">
          <div className="mb-5 flex items-center gap-2">
            <CreditCard size={15} className="text-muted" />
            <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted">Current Plan</h2>
          </div>
          <div className="flex items-center gap-3">
            <PlanBadge plan={plan} />
            <span className="text-border">·</span>
            <p className="text-sm text-muted">
              {creditsRemaining} of {creditsTotal} credit{creditsTotal !== 1 ? 's' : ''} remaining
            </p>
          </div>
        </div>

        {/* Switch Plan */}
        <SwitchPlanSection currentPlan={plan} />

        {/* Usage */}
        <div className="rounded-xl border border-border/60 bg-surface p-6">
          <div className="mb-5 flex items-center gap-2">
            <BarChart2 size={15} className="text-muted" />
            <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted">Usage</h2>
          </div>
          <div className="flex items-end gap-2">
            <p className="font-display text-4xl font-bold text-foreground">{resumesGenerated}</p>
            <p className="mb-1 text-sm text-muted">resumes generated</p>
          </div>
        </div>

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
