'use client'

import { useEffect } from 'react'
import { X, AlertTriangle } from 'lucide-react'

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-sub-title"
    >
      <div
        className="shadow-elevated relative mx-4 w-full max-w-md overflow-hidden rounded-2xl border border-border/80 bg-surface"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-px bg-gradient-to-r from-transparent via-danger-border/60 to-transparent" />

        <div className="p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <AlertTriangle size={18} className="shrink-0 text-warning-fg" />
              <h2
                id="cancel-sub-title"
                className="font-display text-xl font-bold text-foreground"
              >
                Cancel your subscription?
              </h2>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-border/60 bg-surface-raised text-muted transition-colors hover:bg-border hover:text-foreground disabled:opacity-50"
              aria-label="Close"
            >
              <X size={14} />
            </button>
          </div>

          <p className="mb-4 text-sm text-muted">
            You&rsquo;ll lose access to everything that makes job searching faster:
          </p>

          <ul className="mb-4 space-y-1.5">
            {LOSSES.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-foreground/80">
                <span className="h-1 w-1 shrink-0 rounded-full bg-danger-fg" />
                {item}
              </li>
            ))}
          </ul>

          {periodEnd && (
            <p className="mb-4 rounded-lg border border-border/60 bg-surface-raised px-3 py-2.5 text-sm text-muted">
              Your Pro access stays active until{' '}
              <span className="font-medium text-foreground">{formatPeriodEnd(periodEnd)}</span>.
            </p>
          )}

          {currentPlan === 'pro_monthly' && (
            <p className="mb-5 text-xs text-muted">
              Looking to save money instead?{' '}
              <button
                type="button"
                onClick={onSwitchToAnnual}
                className="font-medium text-accent underline underline-offset-2 hover:opacity-80"
              >
                Switch to Annual and save 45%
              </button>
              .
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex h-10 flex-1 items-center justify-center rounded-lg bg-gradient-to-r from-accent to-accent-hover text-sm font-semibold text-accent-foreground shadow-accent-soft transition-all hover:opacity-95 active:scale-[0.98] disabled:opacity-50"
            >
              Keep Pro
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex h-10 flex-1 items-center justify-center rounded-lg border border-danger-border px-4 text-sm font-semibold text-danger-fg transition-colors hover:bg-danger-bg disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Cancelling...' : 'Cancel subscription'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
