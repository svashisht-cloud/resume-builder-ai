'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type BillingPeriod = 'monthly' | 'annual'
type PlanType = 'free' | 'pro_monthly' | 'pro_annual'

interface PricingCardsProps {
  currentPlan?: PlanType
  onAuthRequired?: () => void
  stacked?: boolean
  cancellationScheduled?: boolean
}

const PRO_FEATURES = [
  'Unlimited tailored resumes (fair use applies)',
  "Unlimited edits & regenerations until it's perfect. 🔥",
  'Full ATS match report',
  'PDF + DOCX export',
  'Resume version history',
  'Apply to more jobs, faster — with tailored resumes for every role 🔥',
]

const FREE_FEATURES = [
  '1 tailored resume',
  '5 regenerations',
  'Full ATS report',
  'PDF + DOCX export',
]

const PACK_FEATURES = [
  '3 resume credits',
  '5 regenerations per resume',
  'Full ATS report',
  'Valid for 12 months',
]

export default function PricingCards({ currentPlan, onAuthRequired, stacked, cancellationScheduled }: PricingCardsProps) {
  const [period, setPeriod] = useState<BillingPeriod>('monthly')
  const [loadingProduct, setLoadingProduct] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; ok: boolean } | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const router = useRouter()

  function showToast(message: string, ok: boolean) {
    setToast({ message, ok })
    setTimeout(() => setToast(null), 5000)
  }

  async function getUser() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }

  async function handleProCTA() {
    const user = await getUser()
    if (!user) { onAuthRequired?.(); return }

    const product = period === 'annual' ? 'pro_annual' : 'pro_monthly'
    setLoadingProduct(product)
    setToast(null)

    try {
      const res = await fetch('/api/billing/mock-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product }),
      })
      if (res.status === 404) {
        alert('Pro subscriptions are coming soon!')
        return
      }
      const data = await res.json() as { success?: boolean; plan?: string; error?: string }
      if (res.ok) {
        router.push('/settings')
      } else {
        showToast(data.error ?? 'Purchase failed. Please try again.', false)
      }
    } catch {
      showToast('Network error — please try again.', false)
    } finally {
      setLoadingProduct(null)
    }
  }

  async function handleCreditCTA(product: 'resume_pack' | 'resume_pack_plus') {
    const user = await getUser()
    if (!user) { onAuthRequired?.(); return }

    setLoadingProduct(product)
    setToast(null)

    try {
      const res = await fetch('/api/billing/mock-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product }),
      })
      if (res.status === 404) {
        alert('Credit packs are coming soon!')
        return
      }
      const data = await res.json() as { success?: boolean; payment_id?: string; error?: string }
      if (res.ok) {
        const count = product === 'resume_pack' ? 3 : 10
        showToast(`${count} credits added to your account`, true)
      } else {
        showToast(data.error ?? 'Purchase failed. Please try again.', false)
      }
    } catch {
      showToast('Network error — please try again.', false)
    } finally {
      setLoadingProduct(null)
    }
  }

  async function handleCancelPlan() {
    setLoadingProduct('cancel')
    setToast(null)
    try {
      const res = await fetch('/api/billing/mock-cancel', { method: 'POST' })
      const data = await res.json() as { success?: boolean; error?: string }
      if (res.ok) {
        router.push('/settings')
      } else {
        showToast(data.error ?? 'Cancellation failed. Please try again.', false)
      }
    } catch {
      showToast('Network error — please try again.', false)
    } finally {
      setLoadingProduct(null)
    }
  }

  const isProPlan = currentPlan === 'pro_monthly' || currentPlan === 'pro_annual'
  const proProduct = period === 'annual' ? 'pro_annual' : 'pro_monthly'
  const isCurrentProCard = currentPlan === proProduct

  return (
    <div className="w-full">
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="shadow-elevated w-full max-w-md rounded-2xl border border-border/60 bg-surface p-8">
            <h2 className="font-display mb-3 text-xl font-bold text-foreground">Are you sure you want to cancel Pro?</h2>
            <p className="mb-5 text-sm text-muted">
              You&apos;ll lose access to tools that help you apply faster and land more interviews.
            </p>
            <ul className="mb-5 space-y-2.5">
              {[
                'Generate tailored resumes for every job',
                'Refine your resume until it\'s perfect',
                'Stay consistent across all your applications',
              ].map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-muted">
                  <span className="mt-0.5 shrink-0 text-danger">✕</span>
                  {f}
                </li>
              ))}
            </ul>
            <p className="mb-6 text-xs text-text-dim">
              💡 Most users create 5–15 resumes during their job search
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="w-full rounded-lg bg-gradient-to-r from-accent to-accent-hover py-2.5 text-sm font-semibold text-accent-foreground shadow-accent-soft transition-all hover:opacity-95"
              >
                Keep Pro
              </button>
              <p className="text-center text-[10px] text-text-dim">Cancel anytime. No commitment.</p>
              <button
                type="button"
                disabled={loadingProduct === 'cancel'}
                onClick={async () => { setShowCancelModal(false); await handleCancelPlan() }}
                className="w-full py-2 text-xs text-muted transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadingProduct === 'cancel' ? 'Cancelling…' : 'Cancel anyway'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          className={`mb-6 rounded-lg border px-4 py-3 text-sm font-medium ${
            toast.ok
              ? 'border-success-border bg-success-bg text-success-fg'
              : 'border-danger-border bg-danger-bg text-danger-fg'
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className={stacked ? 'flex flex-col gap-6' : 'grid grid-cols-1 items-stretch gap-6 md:grid-cols-3'}>

        {/* ── FREE — hidden for active Pro users ── */}
        {!isProPlan && <div className="surface-card-quiet flex flex-col rounded-xl px-6 py-8">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted">Free</div>
            <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] font-medium text-muted">Free forever</span>
          </div>
          <div className="mb-6 flex items-baseline gap-1.5">
            <span className="font-display text-4xl font-bold text-foreground">$0</span>
          </div>
          <p className="mb-5 text-sm text-muted">Try Forte risk-free with 1 tailored resume</p>

          <ul className="mb-8 flex-1 space-y-3">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-foreground/70">
                <Check size={15} className="mt-0.5 shrink-0 text-accent" />
                {f}
              </li>
            ))}
          </ul>

          {currentPlan === 'free' ? (
            <div className="mt-auto rounded-lg border border-border/60 py-2.5 text-center text-sm font-medium text-muted">
              Current plan
            </div>
          ) : (
            <button
              type="button"
              disabled={!!loadingProduct}
              onClick={() => onAuthRequired?.()}
              className="mt-auto rounded-lg border border-accent/50 py-2.5 text-sm font-semibold text-accent transition-all hover:bg-accent/10 hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              Get started free
            </button>
          )}
        </div>}

        {/* ── PRO ── */}
        <div className="surface-card-accent relative flex flex-col rounded-xl px-6 py-8">
          <div className="absolute inset-x-0 top-0 h-px rounded-t-xl bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <span className="rounded-full bg-gradient-to-r from-accent to-accent-hover px-3 py-1 text-xs font-semibold text-accent-foreground shadow-accent-soft">
              {period === 'annual' ? 'Best Value' : 'Most Popular'}
            </span>
          </div>

          {/* Monthly / Annual toggle */}
          <div className="mb-4 flex justify-center">
            <div className="inline-flex rounded-full border border-border/60 bg-surface-raised p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setPeriod('monthly')}
                className={`rounded-full px-3 py-1 font-medium transition-colors ${
                  period === 'monthly'
                    ? 'bg-gradient-to-r from-accent to-accent-secondary text-accent-foreground'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setPeriod('annual')}
                className={`flex items-center gap-1 rounded-full px-3 py-1 font-medium transition-colors ${
                  period === 'annual'
                    ? 'bg-gradient-to-r from-accent to-accent-secondary text-accent-foreground'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                Annual
                {period !== 'annual' && (
                  <span className="text-[10px] font-bold text-success-fg">-45%</span>
                )}
              </button>
            </div>
          </div>

          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted">Pro</div>
            <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">Subscription</span>
          </div>
          <div className="mb-1 flex items-baseline gap-1.5">
            {period === 'monthly' ? (
              <>
                <span className="font-display text-4xl font-bold text-foreground">$12</span>
                <span className="text-sm text-text-dim">/ month</span>
              </>
            ) : (
              <>
                <span className="font-display text-4xl font-bold text-foreground">$79</span>
                <span className="text-sm text-text-dim">/ year</span>
              </>
            )}
          </div>
          {period === 'annual' && (
            <div className="mb-1 flex items-center gap-2">
              <span className="text-xs text-muted">~$6.58/month</span>
              <span className="rounded-full bg-success-bg px-2 py-0.5 text-[10px] font-semibold text-success-fg">
                Save 45%
              </span>
            </div>
          )}
          <p className="mb-5 text-sm italic text-muted">
            Apply to more jobs, faster — without rewriting your resume each time
          </p>

          <ul className="mb-4 flex-1 space-y-3">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-foreground/70">
                <Check size={15} className="mt-0.5 shrink-0 text-accent" />
                {f}
              </li>
            ))}
          </ul>

          <p className="mb-6 text-center text-xs italic text-text-dim">
            Most users generate 5–15 resumes per job search
          </p>

          <div className="mt-auto">
            {isCurrentProCard ? (
              <div className="rounded-lg border border-accent/40 py-2.5 text-center text-sm font-semibold text-accent">
                Current plan
              </div>
            ) : (
              <button
                type="button"
                disabled={!!loadingProduct}
                onClick={handleProCTA}
                className="w-full rounded-lg bg-gradient-to-r from-accent to-accent-hover py-2.5 text-sm font-semibold text-accent-foreground shadow-accent-soft transition-all hover:shadow-accent-strong hover:opacity-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadingProduct === proProduct ? 'Processing…' : 'Start Pro'}
              </button>
            )}

            {isProPlan && !cancellationScheduled && (
              <button
                type="button"
                disabled={loadingProduct === 'cancel'}
                onClick={() => setShowCancelModal(true)}
                className="mt-3 w-full text-center text-xs text-muted underline underline-offset-2 transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel plan
              </button>
            )}
            {cancellationScheduled && (
              <p className="mt-3 text-center text-xs text-muted">
                Cancellation scheduled · access continues until period end
              </p>
            )}
          </div>

          <p className="mt-3 text-center text-[10px] text-text-dim">
            Fair use applies
          </p>
        </div>

        {/* ── RESUME PACK ── */}
        <div className="surface-card-quiet flex flex-col rounded-xl px-6 py-8">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted">Resume Pack</div>
            <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] font-medium text-muted">One-time purchase</span>
          </div>
          <div className="mb-6 flex items-baseline gap-1.5">
            <span className="font-display text-4xl font-bold text-foreground">$9</span>
            <span className="text-sm text-text-dim">/ one-time</span>
          </div>
          <p className="mb-5 text-sm text-muted">No subscription needed</p>

          <ul className="mb-8 flex-1 space-y-3">
            {PACK_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-foreground/70">
                <Check size={15} className="mt-0.5 shrink-0 text-accent" />
                {f}
              </li>
            ))}
          </ul>

          <div className="mt-auto">
            <button
              type="button"
              disabled={!!loadingProduct}
              onClick={() => handleCreditCTA('resume_pack')}
              className="w-full rounded-lg border border-accent/50 py-2.5 text-sm font-semibold text-accent transition-all hover:bg-accent/10 hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingProduct === 'resume_pack' ? 'Processing…' : 'Buy Pack'}
            </button>

            <p className="mt-3 text-center text-xs text-muted">
              Need more?{' '}
              <button
                type="button"
                disabled={!!loadingProduct}
                onClick={() => handleCreditCTA('resume_pack_plus')}
                className="underline underline-offset-2 transition-colors hover:text-foreground disabled:opacity-50"
              >
                10 credits for $19
              </button>
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
