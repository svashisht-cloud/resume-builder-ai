'use client'

import { useEffect, useState } from 'react'
import { CreditCard, X } from 'lucide-react'

type CheckoutProduct = 'pro_monthly' | 'pro_annual' | 'resume_pack' | 'resume_pack_plus'

interface ConfirmChargeModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (billingZip: string) => void
  loading: boolean
  plan: CheckoutProduct
  card: {
    brand: string | null
    last4: string | null
    expiryMonth: number | null
    expiryYear: number | null
    country: string | null
  }
  onUseGateway?: () => void
}

const PLAN_LABELS: Record<CheckoutProduct, { name: string; price: string }> = {
  pro_monthly: { name: 'Pro Monthly', price: '$12/month' },
  pro_annual: { name: 'Pro Annual', price: '$79/year' },
  resume_pack: { name: 'Resume Pack', price: '$9 · 3 credits' },
  resume_pack_plus: { name: 'Resume Pack Plus', price: '$19 · 10 credits' },
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function formatExpiry(month: number | null, year: number | null) {
  if (!month || !year) return null
  return `${String(month).padStart(2, '0')}/${String(year).slice(-2)}`
}

export default function ConfirmChargeModal({
  open,
  onClose,
  onConfirm,
  loading,
  plan,
  card,
  onUseGateway,
}: ConfirmChargeModalProps) {
  const [zip, setZip] = useState('')
  const [zipError, setZipError] = useState('')

  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  const { name, price } = PLAN_LABELS[plan]
  const cardBrand = card.brand ? capitalize(card.brand) : 'Card'
  const cardLabel = card.last4 ? `${cardBrand} •••• ${card.last4}` : cardBrand
  const expiry = formatExpiry(card.expiryMonth, card.expiryYear)

  function handleConfirm() {
    const trimmed = zip.trim()
    if (!trimmed) {
      setZipError('Billing zip code is required.')
      return
    }
    setZipError('')
    onConfirm(trimmed)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-charge-title"
    >
      <div
        className="shadow-elevated relative mx-3 max-h-[calc(100vh-1.5rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-border/80 bg-surface sm:mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

        <div className="p-5 sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-4 sm:mb-5">
            <h2
              id="confirm-charge-title"
              className="font-display text-xl font-bold text-foreground"
            >
              Confirm subscription
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

          <div className="mb-5 space-y-3">
            <div className="flex flex-col items-start gap-1.5 rounded-lg border border-border/60 bg-surface-raised px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm font-medium text-foreground">{name}</span>
              <span className="text-sm font-semibold text-foreground">{price}</span>
            </div>

            <div className="flex flex-col items-start gap-2 rounded-lg border border-border/60 bg-surface-raised px-4 py-3 sm:flex-row sm:items-center sm:gap-3">
              <CreditCard size={15} className="shrink-0 text-muted" />
              <span className="flex-1 text-sm text-foreground">{cardLabel}</span>
              {expiry && <span className="text-xs text-muted">exp {expiry}</span>}
            </div>
            {onUseGateway && (
              <button
                type="button"
                onClick={onUseGateway}
                disabled={loading}
                className="mt-1 text-xs text-accent underline-offset-2 hover:underline disabled:opacity-50"
              >
                Use a different card →
              </button>
            )}

            <div>
              <label htmlFor="billing-zip" className="mb-1.5 block text-xs font-medium text-muted">
                Billing zip code
              </label>
              <input
                id="billing-zip"
                type="text"
                inputMode="numeric"
                autoComplete="postal-code"
                value={zip}
                onChange={(e) => {
                  setZip(e.target.value)
                  if (zipError) setZipError('')
                }}
                disabled={loading}
                placeholder="10001"
                className={`w-full rounded-lg border px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-accent disabled:opacity-50 ${
                  zipError ? 'border-danger-border bg-danger-bg' : 'border-border/60 bg-surface-raised'
                }`}
              />
              {zipError && <p className="mt-1 text-xs text-danger-fg">{zipError}</p>}
            </div>
          </div>

          <p className="mb-5 text-xs text-muted">
            {plan === 'resume_pack' || plan === 'resume_pack_plus'
              ? "You'll be charged immediately. Credits are added to your account right away."
              : "You'll be charged immediately. Cancel anytime from settings."}
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleConfirm}
              disabled={loading || !zip.trim()}
              className="flex h-10 flex-1 items-center justify-center rounded-lg bg-gradient-to-r from-accent to-accent-hover text-sm font-semibold text-accent-foreground shadow-accent-soft transition-all hover:opacity-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Processing…' : 'Confirm & subscribe'}
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className="flex h-10 flex-1 items-center justify-center rounded-lg border border-border/60 text-sm font-semibold text-muted transition-colors hover:border-border hover:text-foreground disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
