'use client'

import { Check } from 'lucide-react'

interface Tier {
  id: 'free' | 'pack' | 'plus'
  name: string
  price: string
  suffix: string
  features: string[]
  cta: string
  popular: boolean
}

const TIERS: Tier[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    suffix: '',
    features: [
      '1 resume credit',
      'Credit valid for 12 months',
      'Full tailored generation',
      'Export to PDF',
      'ATS / match report',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    id: 'pack',
    name: 'Resume Pack',
    price: '$19',
    suffix: 'one-time',
    features: [
      'Everything in Free',
      '3 resume credits',
      'Minor edits & regenerations free',
      'Priority email support',
    ],
    cta: 'Buy Pack',
    popular: true,
  },
  {
    id: 'plus',
    name: 'Resume Pack Plus',
    price: '$49',
    suffix: 'one-time',
    features: [
      'Everything in Resume Pack',
      '10 resume credits',
      'Priority generation queue',
      'Version history across resumes',
    ],
    cta: 'Buy Plus',
    popular: false,
  },
]

interface PricingCardsProps {
  onCTAClick: (tier: 'free' | 'pack' | 'plus') => void
  currentPlan?: string
  loadingTier?: string | null
}

export default function PricingCards({ onCTAClick, currentPlan, loadingTier }: PricingCardsProps) {
  return (
    <>
      <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3">
        {TIERS.map((tier) => {
          const isCurrent = currentPlan === tier.id
          const isLoading = loadingTier === tier.id
          return (
            <div
              key={tier.id}
              className={`relative flex h-full flex-col rounded-xl px-6 py-8 transition-all ${
                tier.popular
                  ? 'border border-accent/40 bg-surface shadow-[0_0_40px_rgba(6,182,212,0.12),inset_0_0_0_1px_rgba(6,182,212,0.1)]'
                  : 'border border-border/60 bg-surface hover:border-border'
              }`}
            >
              {tier.popular && (
                <>
                  {/* Top gradient line */}
                  <div className="absolute inset-x-0 top-0 h-px rounded-t-xl bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-gradient-to-r from-accent to-cyan-400 px-3 py-1 text-xs font-semibold text-background shadow-[0_2px_8px_rgba(6,182,212,0.4)]">
                      Most Popular
                    </span>
                  </div>
                </>
              )}

              <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">{tier.name}</div>

              <div className="mb-6 flex items-baseline gap-1.5">
                <span className="font-display text-4xl font-bold text-foreground">{tier.price}</span>
                {tier.suffix && (
                  <span className="text-sm text-text-dim">/ {tier.suffix}</span>
                )}
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check
                      size={15}
                      className={`mt-0.5 flex-shrink-0 ${f.startsWith('Everything') ? 'text-accent-secondary' : 'text-accent'}`}
                    />
                    <span className={f.startsWith('Everything') ? 'font-medium text-foreground' : 'text-muted'}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                <button
                  onClick={() => !isCurrent && !isLoading && onCTAClick(tier.id)}
                  disabled={isCurrent || isLoading}
                  className={`w-full rounded-lg py-2.5 text-sm font-semibold transition-all disabled:cursor-default ${
                    isCurrent
                      ? 'border border-border text-text-dim'
                      : isLoading
                        ? 'border border-border text-text-dim'
                        : tier.popular
                          ? 'bg-gradient-to-r from-accent to-cyan-400 text-background shadow-[0_2px_12px_rgba(6,182,212,0.3)] hover:shadow-[0_2px_16px_rgba(6,182,212,0.45)] hover:opacity-95 active:scale-[0.98]'
                          : 'border border-accent/50 text-accent hover:bg-accent/10 hover:border-accent'
                  }`}
                >
                  {isCurrent ? 'Current Plan' : isLoading ? 'Processing…' : tier.cta}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-10 rounded-xl border border-border/60 bg-surface p-6">
        <p className="text-center text-sm text-muted">
          <span className="font-semibold text-foreground">What&rsquo;s a credit?</span>{' '}
          One credit = one full tailored resume generation for a target job. Includes export and ATS/match
          report. Minor edits and regenerations within that same resume don&rsquo;t burn extra credits.
        </p>
      </div>
    </>
  )
}
