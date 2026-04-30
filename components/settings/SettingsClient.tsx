'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, ArrowLeft, BarChart2, ChevronLeft, Coins, RefreshCw, ShieldCheck, User, Wallet, Zap } from 'lucide-react'
import AvatarImage from '@/components/settings/AvatarImage'
import BillingSection from '@/components/settings/BillingSection'
import CheckoutStatusBanner from '@/components/settings/CheckoutStatusBanner'
import ExperienceLevelSection from '@/components/settings/ExperienceLevelSection'
import MobileSettingsIndex from '@/components/settings/MobileSettingsIndex'
import SettingsSectionNav from '@/components/settings/SettingsSectionNav'
import ThemeSection from '@/components/settings/ThemeSection'
import DeleteAccountButton from '@/components/DeleteAccountButton'
import PaymentMethodSection from '@/components/settings/PaymentMethodSection'

type ExperienceLevel = 'junior' | 'mid' | 'senior'

interface SettingsClientProps {
  initialSection: string
  sections: Array<{ id: string; label: string }>
  highlight?: string
  profile: {
    email: string
    avatarUrl: string | null
    initial: string
    memberSince: string | null
    planType: string | null | undefined
    planStatus: string | null | undefined
    periodEnd: string | null | undefined
    pendingPlanType: string | null | undefined
    pendingPlanDate: string | null | undefined
    creditsRemaining: number
    experienceLevel: ExperienceLevel
    isAdmin: boolean
  }
  usage: {
    resumesGenerated: number
    regensUsed: number
    creditsSpentLifetime: number
  }
}

function PlanBadge({ planType }: { planType: string | null | undefined }) {
  if (planType === 'pro_annual') {
    return (
      <span className="inline-flex items-center rounded-full border border-accent/40 bg-accent/20 px-2.5 py-0.5 text-xs font-semibold text-accent">
        Pro Annual
      </span>
    )
  }
  if (planType === 'pro_monthly') {
    return (
      <span className="inline-flex items-center rounded-full border border-accent/30 bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-accent">
        Pro Monthly
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/20 px-2.5 py-0.5 text-xs font-semibold text-muted">
      Free
    </span>
  )
}

export default function SettingsClient({
  initialSection,
  sections,
  highlight,
  profile,
  usage,
}: SettingsClientProps) {
  const [activeSection, setActiveSection] = useState(initialSection)
  const [mobileView, setMobileView] = useState<'index' | 'detail'>(
    initialSection !== 'profile' ? 'detail' : 'index'
  )

  useEffect(() => {
    function handlePopState(e: PopStateEvent) {
      if ((e.state as { mobileDetail?: boolean } | null)?.mobileDetail) {
        const section = (e.state as { section?: string }).section ?? 'profile'
        setActiveSection(section)
        setMobileView('detail')
      } else {
        const params = new URLSearchParams(window.location.search)
        const requestedSection = params.get('section') ?? 'profile'
        const nextSection = sections.some((s) => s.id === requestedSection)
          ? requestedSection
          : 'profile'
        setActiveSection(nextSection)
        setMobileView('index')
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [sections])

  function handleSectionChange(sectionId: string) {
    if (sectionId === activeSection) return
    setActiveSection(sectionId)
    const url = new URL(window.location.href)
    url.searchParams.set('section', sectionId)
    window.history.pushState(null, '', url)
  }

  function handleMobileSelect(sectionId: string) {
    setActiveSection(sectionId)
    setMobileView('detail')
    const url = new URL(window.location.href)
    url.searchParams.set('section', sectionId)
    window.history.pushState({ mobileDetail: true, section: sectionId }, '', url)
  }

  function handleMobileBack() {
    setMobileView('index')
    const url = new URL(window.location.href)
    url.searchParams.delete('section')
    window.history.pushState({}, '', url)
  }

  function renderSectionPanels() {
    return (
      <>
        <CheckoutStatusBanner />

        {activeSection === 'profile' && (
          <section className="surface-card animate-fade-in rounded-xl border border-border/50 p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2 border-b border-border/40 pb-3 sm:mb-5 sm:pb-4">
              <User size={15} className="text-accent/70" />
              <h2 className="font-display text-[15px] font-semibold text-foreground">Profile</h2>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <AvatarImage src={profile.avatarUrl} initial={profile.initial} />
              <p className="min-w-0 break-all font-medium text-foreground">{profile.email}</p>
            </div>
            <div className="mt-4 flex flex-col gap-3 border-t border-border/40 pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-2">
              <div className="flex items-center justify-between gap-3 sm:justify-start">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted/60">Plan</span>
                <PlanBadge planType={profile.planType} />
              </div>
              {profile.memberSince && (
                <div className="flex items-center justify-between gap-3 sm:justify-start">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted/60">Member since</span>
                  <span className="text-sm text-foreground">{profile.memberSince}</span>
                </div>
              )}
            </div>
          </section>
        )}

        {activeSection === 'billing' && (
          <BillingSection
            planType={profile.planType}
            planStatus={profile.planStatus}
            periodEnd={profile.periodEnd}
            pendingPlanType={profile.pendingPlanType}
            pendingPlanDate={profile.pendingPlanDate}
            creditsRemaining={profile.creditsRemaining}
            highlight={highlight}
          />
        )}

        {activeSection === 'payment' && (
          <PaymentMethodSection
            hasSubscription={
              (profile.planType === 'pro_monthly' || profile.planType === 'pro_annual') &&
              (profile.planStatus === 'active' ||
                ((profile.planStatus === 'cancelled' || profile.planStatus === 'past_due') &&
                  !!profile.periodEnd &&
                  new Date(profile.periodEnd) > new Date()))
            }
            pendingPlanType={profile.pendingPlanType}
            pendingPlanDate={profile.pendingPlanDate}
          />
        )}

        {activeSection === 'usage' && (
          <section className="surface-card animate-fade-in rounded-xl border border-border/50 p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2 border-b border-border/40 pb-3 sm:mb-5 sm:pb-4">
              <BarChart2 size={15} className="text-accent/70" />
              <h2 className="font-display text-[15px] font-semibold text-foreground">Usage</h2>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
              <div className="rounded-lg border border-border/40 bg-surface/50 p-4">
                <Zap size={16} className="mb-2 text-accent/70" />
                <p className="font-display text-3xl font-bold text-foreground sm:text-4xl">
                  {Math.max(0, usage.resumesGenerated - usage.creditsSpentLifetime)}
                </p>
                <p className="mt-1 text-xs text-muted">via subscription</p>
              </div>
              <div className="rounded-lg border border-border/40 bg-surface/50 p-4">
                <Coins size={16} className="mb-2 text-accent/70" />
                <p className="font-display text-3xl font-bold text-foreground sm:text-4xl">{usage.creditsSpentLifetime}</p>
                <p className="mt-1 text-xs text-muted">via credits</p>
              </div>
              <div className="rounded-lg border border-border/40 bg-surface/50 p-4">
                <RefreshCw size={16} className="mb-2 text-accent/70" />
                <p className="font-display text-3xl font-bold text-foreground sm:text-4xl">{usage.regensUsed}</p>
                <p className="mt-1 text-xs text-muted">regenerations</p>
              </div>
            </div>
          </section>
        )}

        {activeSection === 'appearance' && <ThemeSection />}

        {activeSection === 'experience' && (
          <ExperienceLevelSection initialLevel={profile.experienceLevel} />
        )}

        {activeSection === 'account' && (
          <section className="surface-card animate-fade-in rounded-xl border border-border/50 p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2 border-b border-border/40 pb-3 sm:mb-5 sm:pb-4">
              <Wallet size={15} className="text-accent/70" />
              <h2 className="font-display text-[15px] font-semibold text-foreground">Account</h2>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{profile.email}</p>
              {profile.memberSince && (
                <p className="mt-0.5 text-xs text-muted">Member since {profile.memberSince}</p>
              )}
            </div>
            <div className="mt-6 rounded-xl border border-danger-border/80 bg-danger-bg p-4 sm:p-5">
              <h3 className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-danger-fg">
                <AlertTriangle size={14} />
                Danger Zone
              </h3>
              <p className="mb-4 text-sm text-muted">
                Permanently delete your account and all data. This cannot be undone.
              </p>
              <DeleteAccountButton />
            </div>
          </section>
        )}

        {activeSection === 'admin' && profile.isAdmin && (
          <section className="animate-fade-in rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-5 sm:p-6">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <ShieldCheck size={15} className="text-indigo-400" />
                  <h2 className="text-sm font-semibold text-indigo-400">Admin</h2>
                </div>
                <p className="text-sm text-indigo-200/80">
                  Open admin reporting, credits, and operational tooling.
                </p>
              </div>
              <Link
                href="/admin/overview"
                className="rounded-lg bg-indigo-500/15 px-3 py-1.5 text-sm font-medium text-indigo-400 transition-colors hover:bg-indigo-500/25"
              >
                Open Admin Dashboard →
              </Link>
            </div>
          </section>
        )}
      </>
    )
  }

  return (
    <>
      {/* ===== MOBILE (< lg) ===== */}
      <div className="lg:hidden">
        {mobileView === 'index' ? (
          <>
            <div className="mb-5 border-b border-border/35 pb-4 sm:mb-6 sm:pb-5">
              <Link
                href="/dashboard"
                className="mb-3 inline-flex items-center gap-2 rounded-lg border border-border/60 bg-surface-raised/60 px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:border-border hover:text-foreground sm:mb-4 sm:py-2"
              >
                <ArrowLeft size={14} />
                Dashboard
              </Link>
              <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Settings</h1>
              <p className="mt-1 max-w-sm text-sm text-muted">
                Manage your account, billing, preferences, and resume defaults.
              </p>
            </div>
            <MobileSettingsIndex sections={sections} onSelect={handleMobileSelect} />
          </>
        ) : (
          <div key={activeSection} className="animate-slide-in-right">
            <div className="mb-5 border-b border-border/35 pb-4 sm:mb-6 sm:pb-5">
              <button
                type="button"
                onClick={handleMobileBack}
                className="mb-3 inline-flex items-center gap-2 rounded-lg border border-border/60 bg-surface-raised/60 px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:border-border hover:text-foreground sm:mb-4 sm:py-2"
              >
                <ChevronLeft size={14} />
                Settings
              </button>
              <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
                {sections.find((s) => s.id === activeSection)?.label ?? ''}
              </h1>
            </div>
            <div className="space-y-4 sm:space-y-5">
              {renderSectionPanels()}
            </div>
          </div>
        )}
      </div>

      {/* ===== DESKTOP (≥ lg) ===== */}
      <div className="hidden lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-7">
        <SettingsSectionNav
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          sections={sections}
        />
        <div className="space-y-5">
          {renderSectionPanels()}
        </div>
      </div>
    </>
  )
}
