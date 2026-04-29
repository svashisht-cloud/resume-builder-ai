'use client'

import { useEffect } from 'react'
import { Check, X } from 'lucide-react'

interface SwitchToAnnualModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  loading: boolean
}

const BENEFITS = [
  'Unlimited tailoring, same as monthly',
  'Prorated charge applied immediately',
  'Switch back to monthly anytime',
]

export default function SwitchToAnnualModal({ open, onClose, onConfirm, loading }: SwitchToAnnualModalProps) {
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
      aria-labelledby="switch-annual-title"
    >
      <div
        className="shadow-elevated relative mx-4 w-full max-w-md overflow-hidden rounded-2xl border border-border/80 bg-surface"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

        <div className="p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <h2
              id="switch-annual-title"
              className="font-display text-xl font-bold text-foreground"
            >
              Switch to Pro Annual
            </h2>
            <button
              onClick={onClose}
              disabled={loading}
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-border/60 bg-surface-raised text-muted transition-colors hover:bg-border hover:text-foreground disabled:opacity-50"
              aria-label="Close"
            >
              <X size={14} />
            </button>
          </div>

          <div className="mb-5 flex items-baseline gap-2">
            <span className="font-display text-4xl font-bold text-foreground">$79</span>
            <span className="text-sm text-muted">/ year</span>
            <span className="ml-1 text-xs text-muted">~$6.58/month</span>
            <span className="ml-auto rounded-full bg-success-bg px-2.5 py-0.5 text-xs font-semibold text-success-fg">
              Save 45%
            </span>
          </div>

          <ul className="mb-6 space-y-2">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-center gap-2.5 text-sm text-muted">
                <Check size={14} className="shrink-0 text-accent" />
                {b}
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex h-10 flex-1 items-center justify-center rounded-lg bg-gradient-to-r from-accent to-accent-hover text-sm font-semibold text-accent-foreground shadow-accent-soft transition-all hover:opacity-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Switching...' : 'Switch to Annual'}
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className="flex h-10 flex-1 items-center justify-center rounded-lg border border-border/60 text-sm font-semibold text-muted transition-colors hover:border-border hover:text-foreground disabled:opacity-50"
            >
              Keep Monthly
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
