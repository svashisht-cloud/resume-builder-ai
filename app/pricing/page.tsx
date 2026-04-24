import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'
import PublicHeader from '@/components/PublicHeader'
import Footer from '@/components/Footer'
import PublicPricingCards from '@/components/pricing/PublicPricingCards'

export const metadata: Metadata = {
  title: 'Pricing — Forte',
  description:
    'Free to try. Pro for serious job seekers. Resume packs for occasional use. No surprise fees.',
  openGraph: {
    title: 'Pricing — Forte',
    description:
      'Free to try. Pro for serious job seekers. Resume packs for occasional use. No surprise fees.',
  },
}

// ── Comparison table ─────────────────────────────────────────────────────────

type CellValue = boolean | string

function Cell({ value }: { value: CellValue }) {
  if (value === true)  return <Check size={15} className="mx-auto text-accent" strokeWidth={2.5} />
  if (value === false) return <span className="text-text-dim">—</span>
  return <span className="font-medium text-foreground">{value}</span>
}

const COMPARISON: Array<{
  label: string
  free: CellValue
  proM: CellValue
  proA: CellValue
  pack: CellValue
  plus: CellValue
}> = [
  { label: 'Resumes included',       free: '1',        proM: 'Unlimited*', proA: 'Unlimited*', pack: '3 credits',  plus: '10 credits' },
  { label: 'Regenerations per job',  free: 'Up to 5',  proM: 'Unlimited',  proA: 'Unlimited',  pack: 'Up to 5',    plus: 'Up to 5'    },
  { label: 'ATS match report',       free: true,       proM: true,         proA: true,         pack: true,         plus: true         },
  { label: 'PDF & DOCX export',      free: true,       proM: true,         proA: true,         pack: true,         plus: true         },
  { label: 'Resume version history', free: false,      proM: true,         proA: true,         pack: false,        plus: true         },
  { label: 'Priority email support', free: false,      proM: true,         proA: true,         pack: false,        plus: true         },
  { label: 'Billing',                free: 'Free',     proM: 'Monthly',    proA: 'Annual',     pack: 'One-time',   plus: 'One-time'   },
]

// ── FAQ ───────────────────────────────────────────────────────────────────────

const FAQ_ITEMS: Array<{ q: string; a: ReactNode }> = [
  {
    q: "What's the difference between Pro and Resume Pack?",
    a: 'Pro is a monthly or annual subscription — it gives you unlimited resume tailoring for as long as you\'re subscribed, ideal if you\'re actively job searching. Resume Packs are one-time credit bundles (3 or 10 credits) that never expire within 12 months, great if you only need a few resumes.',
  },
  {
    q: 'What is fair use on Pro?',
    a: 'The typical job search involves 5–15 tailored resumes. Pro is designed to cover that comfortably and then some. A fair use cap exists only to prevent automated abuse — the vast majority of users will never approach it.',
  },
  {
    q: 'Can I cancel Pro anytime?',
    a: 'Yes. You can cancel from your settings page at any time. Your Pro access remains active until the end of the current billing period — no immediate cutoff.',
  },
  {
    q: 'What happens to my credits if I upgrade to Pro?',
    a: 'Your existing credits stay in your account and remain valid. Pro tailoring takes priority and does not consume credits, so your credits will be there if you ever downgrade.',
  },
  {
    q: 'Can I get a refund?',
    a: (
      <>
        Unused credits may be eligible for a refund within a limited window. See our{' '}
        <Link
          href="/refund-policy"
          className="underline underline-offset-2 transition-colors hover:text-foreground"
        >
          Refund Policy
        </Link>{' '}
        for details.
      </>
    ),
  },
  {
    q: 'Is my resume used to train AI?',
    a: 'No. Your resume and job description data are never used to train AI models. Data is sent to OpenAI for processing and discarded after the response.',
  },
]

// ── Page ─────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  return (
    <>
      <PublicHeader />
      <main>

        {/* Hero + Cards */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-accent/5 blur-3xl" />
          <div className="relative mx-auto max-w-5xl px-6 pt-16 pb-10">
            <div className="mb-12 text-center">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                <span className="text-xs font-medium text-accent">Simple, flexible pricing</span>
              </div>
              <h1 className="font-display mb-4 text-5xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-6xl">
                The fastest way to land{' '}
                <span className="bg-gradient-to-r from-accent to-cyan-400 bg-clip-text text-transparent">
                  your next role.
                </span>
              </h1>
              <p className="mx-auto max-w-md text-lg leading-relaxed text-muted">
                Free to try. Pro for serious job seekers. Packs for occasional use.
              </p>
            </div>
            <PublicPricingCards />
          </div>
        </section>

        {/* Comparison table */}
        <section className="mx-auto max-w-5xl px-6 pb-4">
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-surface-2/50">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                    Feature
                  </th>
                  <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-muted">
                    Free
                  </th>
                  <th className="bg-accent/[0.06] px-5 py-3.5 text-center">
                    <span className="text-xs font-semibold uppercase tracking-wider text-accent">Pro</span>
                    <span className="ml-1.5 text-xs font-normal text-muted">$12/mo</span>
                  </th>
                  <th className="bg-accent/[0.06] px-5 py-3.5 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold uppercase tracking-wider text-accent">Pro Annual</span>
                        <span className="rounded-full bg-green-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-green-400">-45%</span>
                      </div>
                      <span className="text-xs font-normal text-muted">$79/yr · ~$6.58/mo</span>
                    </div>
                  </th>
                  <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-muted">
                    Pack
                    <span className="ml-1.5 font-normal normal-case tracking-normal">$9</span>
                  </th>
                  <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-muted">
                    Pack Plus
                    <span className="ml-1.5 font-normal normal-case tracking-normal">$19</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map(({ label, free, proM, proA, pack, plus }) => (
                  <tr
                    key={label}
                    className="border-b border-border/60 last:border-0 transition-colors hover:bg-surface-raised/30"
                  >
                    <td className="px-5 py-3 text-muted">{label}</td>
                    <td className="px-5 py-3 text-center"><Cell value={free} /></td>
                    <td className="bg-accent/[0.03] px-5 py-3 text-center"><Cell value={proM} /></td>
                    <td className="bg-accent/[0.03] px-5 py-3 text-center"><Cell value={proA} /></td>
                    <td className="px-5 py-3 text-center"><Cell value={pack} /></td>
                    <td className="px-5 py-3 text-center"><Cell value={plus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-center text-xs text-text-dim">* Fair use applies on Pro plans</p>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-2xl px-6 pb-16 pt-8">
          <h2 className="font-display mb-6 text-center text-xl font-bold text-foreground">
            Common questions
          </h2>
          <div className="space-y-2">
            {FAQ_ITEMS.map(({ q, a }) => (
              <details
                key={q}
                className="group rounded-xl border border-border/60 bg-surface"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-medium text-foreground select-none">
                  {q}
                  <span className="ml-4 flex-shrink-0 text-muted transition-transform duration-200 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="border-t border-border/60 px-5 py-4 text-sm leading-relaxed text-muted">
                  {a}
                </div>
              </details>
            ))}
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
