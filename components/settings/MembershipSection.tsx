import { Coins } from 'lucide-react'
import SwitchPlanSection from './SwitchPlanSection'

function formatCreditExpiry(isoDate: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(new Date(isoDate))
}

function formatCreditSource(source: string) {
  if (source === 'free_signup') return 'Free signup'
  if (source === 'resume_pack') return 'Resume Pack'
  if (source === 'resume_pack_plus') return 'Resume Pack Plus'
  if (source === 'admin_grant') return 'Admin grant'
  return source
}

function formatPeriodEnd(isoDate: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(isoDate))
}

interface MembershipSectionProps {
  planType: string | null | undefined
  planStatus: string | null | undefined
  periodEnd: string | null | undefined
  creditsRemaining: number
  unspentCredits: Array<{ source: string; expires_at: string }>
}

export default function MembershipSection({
  planType,
  planStatus,
  periodEnd,
  creditsRemaining,
  unspentCredits,
}: MembershipSectionProps) {
  const periodExpired = periodEnd ? new Date(periodEnd) <= new Date() : false
  const hasProAccess =
    (planType === 'pro_monthly' || planType === 'pro_annual') &&
    (planStatus === 'active' || (planStatus === 'cancelled' && !periodExpired) || (planStatus === 'past_due' && !periodExpired))
  const cancellationScheduled = planStatus === 'cancelled' && !periodExpired && (planType === 'pro_monthly' || planType === 'pro_annual')
  const planLabel = planType === 'pro_monthly' ? 'Pro · Monthly' : planType === 'pro_annual' ? 'Pro · Annual' : null

  return (
    <div className="space-y-5">
      {/* Plan status card */}
      <div className="surface-card-quiet rounded-xl p-6">
        <div className="mb-5 flex items-center gap-2">
          <Coins size={16} className="text-muted" />
          <h2 className="font-display text-base font-semibold text-foreground">Membership</h2>
        </div>

        {/* Plan badge + status */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            {hasProAccess ? (
              <>
                <div className="mb-1 flex items-center gap-2">
                  <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent">
                    Pro
                  </span>
                  {cancellationScheduled && (
                    <span className="rounded-full border border-warning-border bg-warning-bg px-2 py-0.5 text-xs font-medium text-warning-fg">
                      Cancellation scheduled
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-foreground">{planLabel}</p>
                {periodEnd && (
                  <p className="mt-0.5 text-xs text-muted">
                    {cancellationScheduled || planStatus === 'past_due' ? 'Access until' : 'Renews'} {formatPeriodEnd(periodEnd)}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-foreground">Free plan</p>
                <p className="mt-0.5 text-xs text-muted">1 resume credit included</p>
              </>
            )}
          </div>

          {/* Credits pill */}
          <div className="shrink-0 text-right">
            <span className="font-display text-3xl font-bold text-foreground">{creditsRemaining}</span>
            <p className="text-xs text-muted">credit{creditsRemaining !== 1 ? 's' : ''} remaining</p>
          </div>
        </div>

        {/* Credit expiry list */}
        {unspentCredits.length > 0 && (
          <ul className="mb-1 space-y-1.5 border-t border-border/60 pt-4">
            {unspentCredits.map((credit, i) => (
              <li key={i} className="text-xs text-muted">
                1 credit expires{' '}
                <span className="font-medium text-foreground">
                  {formatCreditExpiry(credit.expires_at as string)}
                </span>
                {' '}(from {formatCreditSource(credit.source as string)})
              </li>
            ))}
          </ul>
        )}

        {creditsRemaining === 0 && !hasProAccess && (
          <p className="mt-2 text-sm text-muted">No credits remaining. Upgrade or buy a pack below.</p>
        )}
      </div>

      {/* Manage Plan / upgrade */}
      <SwitchPlanSection />
    </div>
  )
}
