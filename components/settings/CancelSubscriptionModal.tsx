'use client'

import { useEffect } from 'react'
import { ArrowRight, AlertTriangle, Sparkles, X } from 'lucide-react'
import SettingsModalPortal from './SettingsModalPortal'

interface CancelSubscriptionModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  onSwitchToAnnual: () => void
  loading: boolean
  periodEnd: string | null | undefined
  currentPlan: 'pro_monthly' | 'pro_annual'
}

const LOSSES = [
  'Unlimited tailored resumes',
  'ATS match reports',
  'Resume version history',
  'Priority email support',
]

function formatPeriodEnd(isoDate: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(isoDate))
}

export default function CancelSubscriptionModal({
  open,
  onClose,
  onConfirm,
  onSwitchToAnnual,
  loading,
  periodEnd,
  currentPlan,
}: CancelSubscriptionModalProps) {
  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <SettingsModalPortal>
      <div
        className="fixed inset-0 z-50 overflow-y-auto bg-black/80 p-3 backdrop-blur-sm sm:p-4 md:p-6"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-sub-title"
      >
        <div className="flex min-h-full items-center justify-center">
          <div
            className="shadow-elevated relative w-full max-w-md overflow-hidden rounded-3xl border border-border/80 bg-surface"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-px bg-gradient-to-r from-transparent via-danger-border/60 to-transparent" />

            <div className="max-h-[calc(100dvh-1.5rem)] overflow-y-auto p-4 sm:max-h-[calc(100dvh-2rem)] sm:p-6">
              <div className="mb-4 flex items-start justify-between gap-3 sm:mb-5 sm:gap-4">
                <div className="space-y-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-danger-border/70 bg-danger-bg px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-danger-fg">
                    <AlertTriangle size={12} />
                    Billing change
                  </span>
                  <div className="space-y-1.5">
                    <h2
                      id="cancel-sub-title"
                      className="font-display text-lg font-bold text-foreground sm:text-xl"
                    >
                      Cancel your subscription?
                    </h2>
                    <p className="max-w-sm text-sm leading-relaxed text-muted">
                      You&rsquo;ll keep access through the end of the billing period, then drop back to credit-based usage.
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-border/60 bg-surface-raised text-muted transition-colors hover:bg-border hover:text-foreground disabled:opacity-50"
                  aria-label="Close"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="mb-4 rounded-2xl border border-border/60 bg-surface-raised/70 p-4 sm:mb-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted/70">
                  What you lose
                </p>
                <ul className="space-y-2.5">
                  {LOSSES.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-foreground/85">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-danger-fg" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {periodEnd && (
                <div className="mb-4 rounded-2xl border border-border/60 bg-surface-raised/50 px-4 py-3 sm:mb-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted/70">
                    Access window
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    Your Pro access stays active until{' '}
                    <span className="font-medium text-foreground">{formatPeriodEnd(periodEnd)}</span>.
                  </p>
                </div>
              )}

              {currentPlan === 'pro_monthly' && (
                <div className="mb-4 rounded-2xl border border-accent/20 bg-accent/8 p-4 sm:mb-5">
                  <div className="flex items-start gap-3">
                    <Sparkles size={16} className="mt-0.5 shrink-0 text-accent" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">Want a cheaper option instead?</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted">
                        Annual keeps the same Pro features at a lower effective monthly price.
                      </p>
                      <button
                        type="button"
                        onClick={onSwitchToAnnual}
                        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-accent transition-opacity hover:opacity-80"
                      >
                        Switch to Annual and save 45%
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-accent to-accent-hover px-4 text-sm font-semibold text-accent-foreground shadow-accent-soft transition-all hover:opacity-95 active:scale-[0.98] disabled:opacity-50"
                >
                  Keep Pro
                </button>
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className="flex h-11 w-full items-center justify-center rounded-xl border border-danger-border bg-danger-bg/30 px-4 text-sm font-semibold text-danger-fg transition-colors hover:bg-danger-bg disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? 'Cancelling...' : 'Cancel subscription'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SettingsModalPortal>
  )
}
