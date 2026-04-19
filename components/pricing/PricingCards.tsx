'use client'

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
    suffix: '/ one-time',
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
    suffix: '/ one-time',
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
}

export default function PricingCards({ onCTAClick, currentPlan }: PricingCardsProps) {
  return (
    <>
      <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3">
        {TIERS.map((tier) => {
          const isCurrent = currentPlan === tier.id
          return (
            <div
              key={tier.id}
              className={`relative flex h-full flex-col rounded-xl border px-6 py-8 ${
                tier.popular ? 'border-accent bg-surface' : 'border-border bg-surface'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-background">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-1 text-sm font-medium text-muted">{tier.name}</div>

              <div className="mb-6 flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold text-foreground">{tier.price}</span>
                {tier.suffix && (
                  <span className="text-sm text-muted">{tier.suffix}</span>
                )}
              </div>

              {/* Feature list grows to fill — pushes CTA to bottom */}
              <ul className="mb-8 flex-1 space-y-3">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <span className="mt-0.5 flex-shrink-0 text-accent">✓</span>
                    <span className={f.startsWith('Everything') ? 'font-medium text-foreground' : 'text-muted'}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA always at the bottom */}
              <div className="mt-auto">
                <button
                  onClick={() => !isCurrent && onCTAClick(tier.id)}
                  disabled={isCurrent}
                  className={`w-full rounded-lg py-2.5 text-sm font-medium transition-colors disabled:cursor-default ${
                    isCurrent
                      ? 'border border-border text-text-dim'
                      : tier.popular
                        ? 'bg-accent text-background hover:bg-accent-hover'
                        : 'border border-accent text-accent hover:bg-accent/10'
                  }`}
                >
                  {isCurrent ? 'Current Plan' : tier.cta}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* What's a credit? */}
      <div className="mt-10 rounded-xl border border-border bg-surface p-6">
        <p className="text-center text-sm text-muted">
          <span className="font-semibold text-foreground">What&rsquo;s a credit?</span>{' '}
          One credit = one full tailored resume generation for a target job. Includes export and ATS/match
          report. Minor edits and regenerations within that same resume don&rsquo;t burn extra credits.
        </p>
      </div>
    </>
  )
}
