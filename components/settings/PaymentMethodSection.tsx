'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, CreditCard, LoaderCircle } from 'lucide-react'

interface PaymentMethod {
  id: string
  type: string
  last4: string | null
  brand: string | null
  expiryMonth: number | null
  expiryYear: number | null
}

function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(isoDate))
}

interface PaymentMethodSectionProps {
  hasSubscription: boolean
  pendingPlanType?: string | null
  pendingPlanDate?: string | null
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function formatExpiry(month: number | null, year: number | null) {
  if (!month || !year) return null
  return `${String(month).padStart(2, '0')}/${String(year).slice(-2)}`
}

export default function PaymentMethodSection({ hasSubscription, pendingPlanType, pendingPlanDate }: PaymentMethodSectionProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null)
  const [confirmingRemove, setConfirmingRemove] = useState(false)

  function showMessage(text: string, ok: boolean) {
    setMessage({ text, ok })
    window.setTimeout(() => setMessage(null), 5000)
  }

  useEffect(() => {
    async function fetchPaymentMethod() {
      try {
        const res = await fetch('/api/billing/payment-method')
        const data = await res.json() as { paymentMethod?: PaymentMethod | null; error?: string }
        if (res.ok) {
          setPaymentMethod(data.paymentMethod ?? null)
        }
      } finally {
        setLoading(false)
      }
    }
    void fetchPaymentMethod()
  }, [])

  async function handleUpdateCard() {
    setActionLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/billing/update-payment-method', { method: 'POST' })
      const data = await res.json() as { paymentLink?: string; error?: string }
      if (res.ok && data.paymentLink) {
        window.location.href = data.paymentLink
        return
      }
      showMessage(data.error ?? 'Could not start card update. Please try again.', false)
    } catch {
      showMessage('Network error. Please try again.', false)
    } finally {
      setActionLoading(false)
    }
  }

  async function handleRemoveCard() {
    if (!paymentMethod) return
    setActionLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/billing/delete-payment-method', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethodId: paymentMethod.id }),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) {
        showMessage(data.error ?? 'Could not remove card. Please try again.', false)
        return
      }
      setPaymentMethod(null)
      setConfirmingRemove(false)
      showMessage('Card removed.', true)
    } catch {
      showMessage('Network error. Please try again.', false)
    } finally {
      setActionLoading(false)
    }
  }

  const expiry = paymentMethod ? formatExpiry(paymentMethod.expiryMonth, paymentMethod.expiryYear) : null
  const cardLabel = paymentMethod
    ? `${paymentMethod.brand ? capitalize(paymentMethod.brand) : capitalize(paymentMethod.type)}${paymentMethod.last4 ? ` •••• ${paymentMethod.last4}` : ''}`
    : null

  return (
    <div className="space-y-5">
      <div className="surface-card-quiet rounded-xl p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2 border-b border-border/40 pb-3 sm:mb-5 sm:pb-4">
          <CreditCard size={16} className="text-muted" />
          <h2 className="font-display text-base font-semibold text-foreground">Payment Method</h2>
        </div>

        {message && (
          <div
            className={`mb-5 rounded-lg border px-4 py-3 text-sm ${
              message.ok
                ? 'border-success-border bg-success-bg text-success-fg'
                : 'border-danger-border bg-danger-bg text-danger-fg'
            }`}
          >
            {message.text}
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted">
            <LoaderCircle size={14} className="animate-spin" />
            Loading…
          </div>
        ) : paymentMethod ? (
          <div>
            <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-surface-raised px-4 py-3">
              <CreditCard size={16} className="shrink-0 text-muted" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{cardLabel}</p>
                {expiry && <p className="mt-0.5 text-xs text-muted">Expires {expiry}</p>}
              </div>
            </div>

            {confirmingRemove ? (
              <div className="mt-4 rounded-lg border border-danger-border bg-danger-bg px-4 py-3">
                <p className="mb-3 text-sm text-danger-fg">
                  Remove this card? You&rsquo;ll need to add a new one before your next billing date.
                </p>
                {pendingPlanType === 'pro_annual' && pendingPlanDate && (
                  <div className="mb-3 flex items-start gap-2 rounded-md border border-warning-border bg-warning-bg px-3 py-2.5">
                    <AlertTriangle size={13} className="mt-0.5 shrink-0 text-warning-fg" />
                    <p className="text-xs text-warning-fg">
                      You have an Annual switch scheduled for{' '}
                      <span className="font-semibold">{formatDate(pendingPlanDate)}</span>. Without a card on file that charge will fail and the switch won&rsquo;t complete.
                    </p>
                  </div>
                )}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => void handleRemoveCard()}
                    disabled={actionLoading}
                    className="w-full rounded-lg bg-danger-fg px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:py-1.5"
                  >
                    {actionLoading ? 'Removing…' : 'Confirm remove'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingRemove(false)}
                    disabled={actionLoading}
                    className="w-full rounded-lg border border-border/60 px-3 py-2 text-xs font-medium text-muted transition-colors hover:bg-surface-raised disabled:opacity-50 sm:w-auto sm:py-1.5"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <button
                  type="button"
                  onClick={() => void handleUpdateCard()}
                  disabled={actionLoading}
                  className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:py-2"
                >
                  {actionLoading ? 'Processing…' : 'Update card'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingRemove(true)}
                  disabled={actionLoading}
                  className="w-full rounded-lg border border-danger-border px-4 py-2.5 text-sm font-medium text-danger-fg transition-colors hover:bg-danger-bg disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:py-2"
                >
                  Remove card
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            <p className="text-sm text-muted">No payment method saved.</p>
            {hasSubscription && (
              <button
                type="button"
                onClick={() => void handleUpdateCard()}
                disabled={actionLoading}
                className="mt-4 w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:py-2"
              >
                {actionLoading ? 'Processing…' : 'Add a card'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
