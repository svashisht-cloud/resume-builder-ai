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
  highlight?: string
}

export default function BillingSection({
  planType,
  planStatus,
  periodEnd,
  pendingPlanType,
  pendingPlanDate,
  creditsRemaining,
  highlight,
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
  const isMonthly = planType === 'pro_monthly'
  const isAnnual = planType === 'pro_annual'
  const canSwitchPlan = hasProAccess && !cancellationScheduled && !pastDue
  const planLabel = planType === 'pro_monthly' ? 'Pro Monthly' : planType === 'pro_annual' ? 'Pro Annual' : 'Free'
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

        <div className="mt-5 border-t border-border/40 pt-5">
          <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 rounded-xl transition-shadow ${highlight === 'pro' ? 'ring-2 ring-accent/40' : ''}`}>

            {/* Pro Monthly card */}
            <div className={`flex flex-col overflow-hidden rounded-xl border transition-all duration-200 ${
              isMonthly
                ? 'border-accent/40 bg-accent/5'
                : 'border-border/60 bg-surface-raised/60 hover:border-border hover:bg-surface-raised/80 hover:shadow-accent-soft'
            }`}>
              <div className={`h-px bg-gradient-to-r from-transparent ${isMonthly ? 'via-accent/60' : 'via-border/60'} to-transparent`} />
              <div className="flex flex-1 flex-col p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${isMonthly ? 'text-accent' : 'text-muted'}`}>Monthly</p>
                  {isMonthly && (
                    <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">Current plan</span>
                  )}
                </div>
                <p className="mt-2 font-display text-2xl font-bold leading-none tracking-tight text-foreground">
                  $12<span className="text-sm font-normal tracking-normal text-muted"> / month</span>
                </p>
                <p className="mt-1 text-xs text-muted">
                  {isMonthly && hasProAccess
                    ? cancellationScheduled && periodEnd
                      ? `Access until ${formatPeriodEnd(periodEnd)}`
                      : pastDue
                        ? 'Payment issue'
                        : periodEnd ? `Renews on ${formatPeriodEnd(periodEnd)}` : 'Active'
                    : 'Billed monthly · cancel any time'}
                </p>
                <ul className="mt-3 space-y-1.5">
                  <li className="flex items-center gap-2 text-xs text-muted">
                    <Check size={11} className="shrink-0 text-accent" />Full Pro access
                  </li>
                  <li className="flex items-center gap-2 text-xs text-muted">
                    <Check size={11} className="shrink-0 text-accent" />Cancel any time
                  </li>
                  <li className="flex items-center gap-2 text-xs text-muted">
                    <Check size={11} className="shrink-0 text-accent" />Start tailoring today
                  </li>
                </ul>
                <div className="flex-1 min-h-3" />
                {isMonthly ? (
                  <button
                    type="button"
                    disabled
                    className="mt-4 w-full rounded-lg border border-border/40 bg-muted/10 px-4 py-2 text-sm font-semibold text-muted cursor-not-allowed"
                  >
                    Current plan
                  </button>
                ) : isAnnual ? (
                  <>
                    <button
                      type="button"
                      onClick={() => { if (canSwitchPlan) void changePlan('pro_monthly') }}
                      disabled={!canSwitchPlan || !!loadingAction}
                      className="mt-4 w-full rounded-lg border border-accent/50 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent transition-all hover:bg-accent/20 hover:border-accent/60 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loadingAction === 'pro_monthly' ? 'Changing...' : 'Switch to Pro Monthly'}
                    </button>
                    {!canSwitchPlan && (
                      <p className="mt-1.5 text-center text-xs text-muted">
                        {cancellationScheduled
                          ? periodEnd
                            ? `This subscription ends on ${formatPeriodEnd(periodEnd)}. Plan changes are disabled until a new subscription is started.`
                            : 'Plan changes are unavailable after cancellation is scheduled.'
                          : 'Update payment to switch plans'}
                      </p>
                    )}
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleStartCheckout('pro_monthly')}
                    disabled={!!loadingAction}
                    className="mt-4 w-full rounded-lg border border-accent/50 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent transition-all hover:bg-accent/20 hover:border-accent/60 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loadingAction === 'pro_monthly' ? 'Processing...' : 'Start Pro Monthly'}
                  </button>
                )}
              </div>
            </div>

            {/* Pro Annual card */}
            <div className="flex flex-col overflow-hidden rounded-xl border border-accent/40 bg-accent/5 transition-all duration-200 hover:border-accent/55 hover:bg-accent/8">
              <div className="h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
              <div className="flex flex-1 flex-col p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">Annual</p>
                  {isAnnual ? (
                    <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">Current plan</span>
                  ) : (
                    <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">Best value</span>
                  )}
                </div>
                <p className="mt-2 font-display text-2xl font-bold leading-none tracking-tight text-foreground">
                  $79<span className="text-sm font-normal tracking-normal text-muted"> / year</span>
                </p>
                <p className="mt-1 text-xs text-muted">
                  {isAnnual && hasProAccess
                    ? cancellationScheduled && periodEnd
                      ? `Access until ${formatPeriodEnd(periodEnd)}`
                      : pastDue
                        ? 'Payment issue'
                        : periodEnd ? `Renews on ${formatPeriodEnd(periodEnd)}` : 'Active'
                    : '~$6.58/mo · save ~45%'}
                </p>
                <ul className="mt-3 space-y-1.5">
                  <li className="flex items-center gap-2 text-xs text-muted">
                    <Check size={11} className="shrink-0 text-accent" />Unlimited tailoring &amp; regenerations
                  </li>
                  <li className="flex items-center gap-2 text-xs text-muted">
                    <Check size={11} className="shrink-0 text-accent" />Save ~45% vs monthly
                  </li>
                  <li className="flex items-center gap-2 text-xs text-muted">
                    <Check size={11} className="shrink-0 text-accent" />All export formats
                  </li>
                </ul>
                <div className="flex-1 min-h-3" />
                {isAnnual ? (
                  <button
                    type="button"
                    disabled
                    className="mt-4 w-full rounded-lg border border-border/40 bg-muted/10 px-4 py-2 text-sm font-semibold text-muted cursor-not-allowed"
                  >
                    Current plan
                  </button>
                ) : pendingPlanType === 'pro_annual' ? (
                  <div className="mt-4 rounded-lg border border-accent/30 bg-accent/8 px-4 py-2 text-center text-sm font-semibold text-accent">
                    Switching soon
                  </div>
                ) : isMonthly ? (
                  <>
                    <button
                      type="button"
                      onClick={() => { if (canSwitchPlan) setSwitchModalOpen(true) }}
                      disabled={!canSwitchPlan || !!loadingAction}
                      className="mt-4 w-full rounded-lg bg-gradient-to-r from-accent to-accent-hover px-4 py-2 text-sm font-semibold text-accent-foreground shadow-accent-soft transition-all hover:opacity-95 hover:shadow-accent-strong disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loadingAction === 'pro_annual' ? 'Changing...' : 'Switch to Pro Annual'}
                    </button>
                    {!canSwitchPlan && (
                      <p className="mt-1.5 text-center text-xs text-muted">
                        {cancellationScheduled
                          ? periodEnd
                            ? `This subscription ends on ${formatPeriodEnd(periodEnd)}. Plan changes are disabled until a new subscription is started.`
                            : 'Plan changes are unavailable after cancellation is scheduled.'
                          : 'Update payment to switch plans'}
                      </p>
                    )}
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleStartCheckout('pro_annual')}
                    disabled={!!loadingAction}
                    className="mt-4 w-full rounded-lg bg-gradient-to-r from-accent to-accent-hover px-4 py-2 text-sm font-semibold text-accent-foreground shadow-accent-soft transition-all hover:opacity-95 hover:shadow-accent-strong disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loadingAction === 'pro_annual' ? 'Processing...' : 'Start Pro Annual'}
                  </button>
                )}
              </div>
            </div>

          </div>

          {hasProAccess && !cancellationScheduled && (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setCancelModalOpen(true)}
                disabled={!!loadingAction}
                className="rounded-lg border border-danger-border px-4 py-2.5 text-sm font-medium text-danger-fg transition-all duration-150 hover:bg-danger-bg disabled:cursor-not-allowed disabled:opacity-50 sm:py-2"
              >
                Cancel subscription
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={`surface-card rounded-xl border border-border/50 p-5 sm:p-6 transition-shadow ${highlight === 'credits' ? 'ring-2 ring-accent/40' : ''}`}>
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

      {isMonthly && (
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
