'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarClock, Check, Coins, LoaderCircle } from 'lucide-react'
import PaymentHistory, { clearPaymentHistoryCache } from './PaymentHistory'
import SwitchToAnnualModal from './SwitchToAnnualModal'
import CancelSubscriptionModal from './CancelSubscriptionModal'
import ConfirmChargeModal from './ConfirmChargeModal'

type CheckoutProduct = 'pro_monthly' | 'pro_annual' | 'resume_pack' | 'resume_pack_plus'
type SubscriptionProduct = 'pro_monthly' | 'pro_annual'

interface SavedCard {
  id: string
  brand: string | null
  last4: string | null
  expiryMonth: number | null
  expiryYear: number | null
  country: string | null
}

function formatPeriodEnd(isoDate: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(isoDate))
}

interface BillingSectionProps {
  planType: string | null | undefined
  planStatus: string | null | undefined
  periodEnd: string | null | undefined
  pendingPlanType: string | null | undefined
  pendingPlanDate: string | null | undefined
  creditsRemaining: number
}

export default function BillingSection({
  planType,
  planStatus,
  periodEnd,
  pendingPlanType,
  pendingPlanDate,
  creditsRemaining,
}: BillingSectionProps) {
  const router = useRouter()
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null)
  const [switchModalOpen, setSwitchModalOpen] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [confirmChargeOpen, setConfirmChargeOpen] = useState(false)
  const [pendingProduct, setPendingProduct] = useState<CheckoutProduct | null>(null)
  const [savedCard, setSavedCard] = useState<SavedCard | null>(null)

  useEffect(() => {
    async function fetchSavedCard() {
      try {
        const res = await fetch('/api/billing/payment-method')
        const data = await res.json() as { paymentMethod?: SavedCard | null }
        if (res.ok) setSavedCard(data.paymentMethod ?? null)
      } catch {
        // non-critical — falls back to redirect checkout
      }
    }
    void fetchSavedCard()
  }, [])

  const periodExpired = periodEnd ? new Date(periodEnd) <= new Date() : false
  const isProPlan = planType === 'pro_monthly' || planType === 'pro_annual'
  const hasProAccess =
    isProPlan &&
    (planStatus === 'active' || (planStatus === 'cancelled' && !periodExpired) || (planStatus === 'past_due' && !periodExpired))
  const cancellationScheduled = isProPlan && planStatus === 'cancelled' && !periodExpired
  const pastDue = isProPlan && planStatus === 'past_due' && !periodExpired
  const planLabel = planType === 'pro_monthly' ? 'Pro Monthly' : planType === 'pro_annual' ? 'Pro Annual' : 'Free'
  const alternatePlan: SubscriptionProduct = planType === 'pro_monthly' ? 'pro_annual' : 'pro_monthly'
  const alternatePlanLabel = alternatePlan === 'pro_annual' ? 'Pro Annual' : 'Pro Monthly'
  const creditsContextLine = hasProAccess && !pastDue
    ? 'Used when you exceed 100 resumes per month on your Pro plan.'
    : pastDue
      ? 'Your subscription has a payment issue — credits can be used in the meantime.'
      : creditsRemaining === 0
        ? 'Buy a credit pack below to continue generating resumes.'
        : 'Each tailored resume you generate spends one credit.'

  function showMessage(text: string, ok: boolean) {
    setMessage({ text, ok })
    window.setTimeout(() => setMessage(null), 5000)
  }

  function handleStartCheckout(product: CheckoutProduct) {
    if (savedCard) {
      setPendingProduct(product)
      setConfirmChargeOpen(true)
    } else {
      void startCheckout(product)
    }
  }

  async function startCheckout(product: CheckoutProduct) {
    setLoadingAction(product)
    setMessage(null)

    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product }),
      })
      const data = await res.json() as { checkoutUrl?: string; error?: string }
      if (res.ok && data.checkoutUrl) {
        window.location.href = data.checkoutUrl
        return
      }
      showMessage(data.error ?? 'Could not start checkout. Please try again.', false)
    } catch {
      showMessage('Network error. Please try again.', false)
    } finally {
      setLoadingAction(null)
    }
  }

  async function confirmAndSubscribe(billingZip: string) {
    if (!pendingProduct || !savedCard) return
    setConfirmChargeOpen(false)
    setLoadingAction(pendingProduct)
    setMessage(null)

    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: pendingProduct,
          paymentMethodId: savedCard.id,
          billingZip,
          billingCountry: savedCard.country ?? 'US',
        }),
      })
      const data = await res.json() as { success?: boolean; error?: string }
      if (res.ok && data.success) {
        clearPaymentHistoryCache()
        const isCredits = pendingProduct === 'resume_pack' || pendingProduct === 'resume_pack_plus'
        showMessage(
          isCredits
            ? 'Payment received! Your credits will appear shortly.'
            : 'Pro activated! Your subscription is now live.',
          true,
        )
        router.refresh()
        return
      }
      showMessage(data.error ?? 'Could not complete payment. Please try again.', false)
    } catch {
      showMessage('Network error. Please try again.', false)
    } finally {
      setLoadingAction(null)
      setPendingProduct(null)
    }
  }

  async function confirmCancelSubscription() {
    setCancelModalOpen(false)
    setLoadingAction('cancel')
    setMessage(null)

    try {
      const res = await fetch('/api/billing/cancel-subscription', { method: 'POST' })
      const data = await res.json() as { error?: string }
      if (!res.ok) {
        showMessage(data.error ?? 'Could not cancel subscription. Please try again.', false)
        return
      }
      clearPaymentHistoryCache()
      showMessage('Subscription cancellation scheduled. Pro access remains active through the current billing period.', true)
      router.refresh()
    } catch {
      showMessage('Network error. Please try again.', false)
    } finally {
      setLoadingAction(null)
    }
  }

  async function changePlan(product: SubscriptionProduct) {
    setLoadingAction(product)
    setMessage(null)

    try {
      const res = await fetch('/api/billing/change-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product }),
      })
      const data = await res.json() as { error?: string; pendingStateError?: boolean }
      if (!res.ok) {
        showMessage(data.error ?? 'Could not change plan. Please try again.', false)
        return
      }
      clearPaymentHistoryCache()
      if (data.pendingStateError) {
        showMessage('Annual switch scheduled — please refresh to see your updated status.', true)
        return
      }
      showMessage(
        product === 'pro_annual'
          ? 'Switching to Pro Annual at your next renewal date.'
          : 'Plan changed to Pro Monthly.',
        true,
      )
      router.refresh()
    } catch {
      showMessage('Network error. Please try again.', false)
    } finally {
      setLoadingAction(null)
    }
  }

  return (
    <div className="animate-fade-in space-y-5">
      <div className="surface-card rounded-xl border border-border/50 p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2 border-b border-border/40 pb-3 sm:mb-5 sm:pb-4">
          <Coins size={16} className="text-accent/70" />
          <h2 className="font-display text-[15px] font-semibold text-foreground">Billing &amp; Credits</h2>
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

        <div className="grid gap-5 md:grid-cols-2 md:gap-6">
          <div>
            <p className="text-xs font-semibold uppercase text-muted">Current plan</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <p className="text-xl font-semibold text-foreground">{planLabel}</p>
              {planType === 'pro_annual' ? (
                <span className="inline-flex items-center rounded-full border border-accent/40 bg-accent/20 px-2.5 py-0.5 text-xs font-semibold text-accent">
                  Pro Annual
                </span>
              ) : planType === 'pro_monthly' ? (
                <span className="inline-flex items-center rounded-full border border-accent/30 bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-accent">
                  Pro Monthly
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/20 px-2.5 py-0.5 text-xs font-semibold text-muted">
                  Free
                </span>
              )}
            </div>
            {(cancellationScheduled || pastDue) && (
              <div className="mt-1.5 flex flex-wrap gap-2">
                {cancellationScheduled && (
                  <span className="rounded-full border border-warning-border bg-warning-bg px-2 py-0.5 text-xs font-medium text-warning-fg">
                    Cancels at period end
                  </span>
                )}
                {pastDue && (
                  <span className="rounded-full border border-warning-border bg-warning-bg px-2 py-0.5 text-xs font-medium text-warning-fg">
                    Payment issue
                  </span>
                )}
              </div>
            )}
            <p className="mt-1 text-sm text-muted">
              {cancellationScheduled && periodEnd
                ? `Access continues until ${formatPeriodEnd(periodEnd)}.`
                : hasProAccess && periodEnd
                  ? `Renews on ${formatPeriodEnd(periodEnd)}.`
                  : hasProAccess
                    ? 'Your Pro subscription is active.'
                    : 'No active subscription.'}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase text-muted">Credits</p>
            <div className="mt-2 flex items-end gap-2">
              <p className="font-display text-3xl font-bold text-foreground sm:text-4xl">{creditsRemaining}</p>
              <Coins size={20} className="mb-1 text-accent/60" />
            </div>
            <p className="mt-1 text-sm text-muted">credit{creditsRemaining !== 1 ? 's' : ''} remaining</p>
            <p className="mt-2 text-sm text-muted">{creditsContextLine}</p>
          </div>
        </div>

        {pendingPlanType === 'pro_annual' && pendingPlanDate && (
          <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-accent/30 bg-accent/8 px-4 py-3 text-sm">
            <CalendarClock size={15} className="mt-0.5 shrink-0 text-accent" />
            <span className="text-foreground/80">
              Switching to <span className="font-medium text-foreground">Pro Annual</span> on{' '}
              {formatPeriodEnd(pendingPlanDate)} — you&rsquo;ll be billed $79 at that time.
            </span>
          </div>
        )}

        {(!hasProAccess || (hasProAccess && !cancellationScheduled)) && (
          <div className="mt-5 flex flex-col gap-3 border-t border-border/40 pt-5 sm:flex-row sm:flex-wrap">
            {!hasProAccess && (
              <>
                <button
                  type="button"
                  onClick={() => handleStartCheckout('pro_monthly')}
                  disabled={!!loadingAction}
                  className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-all duration-150 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:py-2"
                >
                  {loadingAction === 'pro_monthly' ? 'Processing...' : 'Start Pro Monthly'}
                </button>
                <button
                  type="button"
                  onClick={() => handleStartCheckout('pro_annual')}
                  disabled={!!loadingAction}
                  className="w-full rounded-lg border border-border/60 px-4 py-2.5 text-sm font-medium text-foreground transition-all duration-150 hover:bg-surface-raised disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:py-2"
                >
                  {loadingAction === 'pro_annual' ? 'Processing...' : 'Start Pro Annual'}
                </button>
              </>
            )}

            {hasProAccess && !cancellationScheduled && (
              <>
                {pendingPlanType !== 'pro_annual' && (
                  <button
                    type="button"
                    onClick={() => alternatePlan === 'pro_annual' ? setSwitchModalOpen(true) : void changePlan('pro_monthly')}
                    disabled={!!loadingAction}
                    className="w-full rounded-lg border border-border/60 px-4 py-2.5 text-sm font-medium text-foreground transition-all duration-150 hover:bg-surface-raised disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:py-2"
                  >
                    {loadingAction === alternatePlan ? 'Changing...' : `Switch to ${alternatePlanLabel}`}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(true)}
                  disabled={!!loadingAction}
                  className="w-full rounded-lg border border-danger-border px-4 py-2.5 text-sm font-medium text-danger-fg transition-all duration-150 hover:bg-danger-bg disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:py-2"
                >
                  Cancel subscription
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="surface-card rounded-xl border border-border/50 p-5 sm:p-6">
        <div className="mb-4 border-b border-border/40 pb-3 sm:mb-5 sm:pb-4">
          <h3 className="font-display text-[15px] font-semibold text-foreground">Buy credits</h3>
          <p className="mt-1 text-sm text-muted">One-time credits are useful when you do not need a subscription.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => handleStartCheckout('resume_pack')}
            disabled={!!loadingAction}
            className="group flex items-start justify-between gap-3 rounded-lg border border-border/60 px-4 py-3 text-left transition-all duration-150 hover:border-accent/50 hover:bg-surface-raised disabled:cursor-not-allowed disabled:opacity-50 sm:items-center"
          >
            <span>
              <span className="block text-sm font-medium text-foreground">Resume Pack</span>
              <span className="mt-0.5 block text-xs text-muted">3 credits</span>
            </span>
            <span className="text-base font-bold text-accent">
              {loadingAction === 'resume_pack' ? <LoaderCircle size={15} className="animate-spin" /> : '$9'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleStartCheckout('resume_pack_plus')}
            disabled={!!loadingAction}
            className="group flex items-start justify-between gap-3 rounded-lg border border-border/60 px-4 py-3 text-left transition-all duration-150 hover:border-accent/50 hover:bg-surface-raised disabled:cursor-not-allowed disabled:opacity-50 sm:items-center"
          >
            <span>
              <span className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-foreground">
                Resume Pack Plus
                <span className="inline-flex items-center rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">Best value</span>
              </span>
              <span className="mt-0.5 block text-xs text-muted">10 credits</span>
            </span>
            <span className="text-base font-bold text-accent">
              {loadingAction === 'resume_pack_plus' ? <LoaderCircle size={15} className="animate-spin" /> : '$19'}
            </span>
          </button>
        </div>
      </div>

      <div className="surface-card-quiet rounded-xl border border-border/30 p-5 sm:p-6">
        <div className="mb-4 border-b border-border/40 pb-3 sm:mb-5 sm:pb-4">
          <h3 className="font-display text-[15px] font-semibold text-foreground">How credits and subscriptions work</h3>
        </div>
        <div className="grid gap-3 text-sm text-muted sm:grid-cols-2">
          {[
            'Free accounts include 1 tailored resume credit.',
            'Credit packs are one-time purchases and expire after 12 months.',
            'Credits are used on the Free plan, or when Pro users generate more than 100 resumes in a month.',
            'Canceling Pro keeps access through the current billing period.',
          ].map((item) => (
            <div key={item} className="flex gap-2">
              <Check size={15} className="mt-0.5 shrink-0 text-accent" />
              <span>{item}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-text-dim">
          Refund details are available in the{' '}
          <a href="/refund-policy" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">
            refund policy
          </a>.
        </p>
      </div>

      <PaymentHistory />

      {confirmChargeOpen && pendingProduct && savedCard && (
        <ConfirmChargeModal
          open={confirmChargeOpen}
          onClose={() => { setConfirmChargeOpen(false); setPendingProduct(null) }}
          onConfirm={(zip) => void confirmAndSubscribe(zip)}
          loading={!!loadingAction}
          plan={pendingProduct}
          card={savedCard}
          onUseGateway={() => {
            setConfirmChargeOpen(false)
            if (pendingProduct) void startCheckout(pendingProduct)
          }}
        />
      )}

      {alternatePlan === 'pro_annual' && (
        <SwitchToAnnualModal
          open={switchModalOpen}
          onClose={() => setSwitchModalOpen(false)}
          onConfirm={() => { setSwitchModalOpen(false); void changePlan('pro_annual') }}
          loading={loadingAction === 'pro_annual'}
        />
      )}

      <CancelSubscriptionModal
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={() => void confirmCancelSubscription()}
        onSwitchToAnnual={() => { setCancelModalOpen(false); setSwitchModalOpen(true) }}
        loading={loadingAction === 'cancel'}
        periodEnd={periodEnd}
        currentPlan={(planType === 'pro_annual' ? 'pro_annual' : 'pro_monthly')}
      />
    </div>
  )
}
