'use client'

import { useEffect } from 'react'
import { ArrowRight, BadgeDollarSign, Check, X } from 'lucide-react'
import SettingsModalPortal from './SettingsModalPortal'

interface SwitchToAnnualModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  loading: boolean
}

const BENEFITS = [
  'Unlimited tailoring, same as monthly',
  '$79 billed at your next renewal date',
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
    <SettingsModalPortal>
      <div
        className="fixed inset-0 z-50 overflow-y-auto bg-black/80 p-3 backdrop-blur-sm sm:p-4 md:p-6"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="switch-annual-title"
      >
        <div className="flex min-h-full items-center justify-center">
          <div
            className="shadow-elevated relative w-full max-w-md overflow-hidden rounded-3xl border border-border/80 bg-surface"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

            <div className="max-h-[calc(100dvh-1.5rem)] overflow-y-auto p-4 sm:max-h-[calc(100dvh-2rem)] sm:p-6">
              <div className="mb-4 flex items-start justify-between gap-3 sm:mb-5 sm:gap-4">
                <div className="space-y-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
                    <BadgeDollarSign size={12} />
                    Better value
                  </span>
                  <div className="space-y-1.5">
                    <h2
                      id="switch-annual-title"
                      className="font-display text-lg font-bold text-foreground sm:text-xl"
                    >
                      Switch to Pro Annual
                    </h2>
                    <p className="max-w-sm text-sm leading-relaxed text-muted">
                      Keep the same Pro features, lower your effective monthly cost — billed $79 at your next renewal date.
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

              <div className="mb-4 rounded-2xl border border-accent/20 bg-accent/8 p-4 sm:mb-5">
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-3xl font-bold text-foreground sm:text-4xl">$79</p>
                      <p className="mt-1 text-sm text-muted">per year</p>
                    </div>
                    <span className="rounded-full bg-success-bg px-2.5 py-1 text-xs font-semibold text-success-fg">
                      Save 45%
                    </span>
                  </div>
                  <p className="text-sm text-muted">About $6.58/month billed annually.</p>
                </div>
              </div>

              <div className="mb-5 rounded-2xl border border-border/60 bg-surface-raised/65 p-4 sm:mb-6">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted/70">
                  What changes
                </p>
                <ul className="space-y-2.5">
                  {BENEFITS.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-sm text-foreground/85">
                      <Check size={15} className="mt-0.5 shrink-0 text-accent" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-accent to-accent-hover px-4 text-sm font-semibold text-accent-foreground shadow-accent-soft transition-all hover:opacity-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? 'Switching...' : 'Switch to Annual'}
                  {!loading && <ArrowRight size={15} />}
                </button>
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex h-11 w-full items-center justify-center rounded-xl border border-border/60 bg-surface-raised/45 px-4 text-sm font-semibold text-muted transition-colors hover:border-border hover:text-foreground disabled:opacity-50"
                >
                  Keep Monthly
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SettingsModalPortal>
  )
}
