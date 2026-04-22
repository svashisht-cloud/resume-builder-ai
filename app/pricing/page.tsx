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
    'Simple credit-based pricing. One credit, one tailored resume. Pay only for what you use — no subscription.',
  openGraph: {
    title: 'Pricing — Forte',
    description:
      'Simple credit-based pricing. One credit, one tailored resume. Pay only for what you use — no subscription.',
  },
}

// ── Comparison table ─────────────────────────────────────────────────────────

type CellValue = boolean | string

function Cell({ value }: { value: CellValue }) {
  if (value === true)  return <Check size={15} className="mx-auto text-accent" strokeWidth={2.5} />
  if (value === false) return <span className="text-text-dim">—</span>
  return <span className="font-medium text-foreground">{value}</span>
}

const COMPARISON: Array<{ label: string; free: CellValue; pack: CellValue; plus: CellValue }> = [
  { label: 'Credits included',       free: '1',    pack: '3',        plus: '10'       },
  { label: 'Tailored generation',    free: true,   pack: true,       plus: true       },
  { label: 'ATS match report',       free: true,   pack: true,       plus: true       },
  { label: 'PDF & DOCX export',      free: true,   pack: true,       plus: true       },
  { label: 'Regenerations per job',  free: false,  pack: 'Up to 2',  plus: 'Up to 2'  },
  { label: 'Priority email support', free: false,  pack: true,       plus: true       },
  { label: 'Priority queue',         free: false,  pack: false,      plus: true       },
  { label: 'Version history',        free: false,  pack: false,      plus: true       },
]

// ── FAQ ───────────────────────────────────────────────────────────────────────

const FAQ_ITEMS: Array<{ q: string; a: ReactNode }> = [
  {
    q: "What's a credit?",
    a: "One credit unlocks one full tailored resume generation for a specific job. That includes the ATS match report, changelog, and PDF/DOCX export. Minor edits and regenerations within the same job don't consume a new credit.",
  },
  {
    q: 'Do credits expire?',
    a: 'Yes — credits expire 12 months from the date of purchase. Your free signup credit also expires 12 months from account creation.',
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
    q: "What if the tailored resume isn't what I wanted?",
    a: 'You can regenerate up to 2 times per job description at no extra credit cost when you have a paid credit. Each regeneration lets you provide feedback or adjust selected keywords.',
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
                <span className="text-xs font-medium text-accent">No subscription · No seat fees</span>
              </div>
              <h1 className="font-display mb-4 text-5xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-6xl">
                One credit,{' '}
                <span className="bg-gradient-to-r from-accent to-cyan-400 bg-clip-text text-transparent">
                  one tailored resume.
                </span>
              </h1>
              <p className="mx-auto max-w-md text-base leading-relaxed text-muted">
                Buy what you need, use it when you&rsquo;re ready.
                Credits are valid for 12 months from purchase.
              </p>
            </div>
            <PublicPricingCards />
          </div>
        </section>

        {/* Comparison table */}
        <section className="mx-auto max-w-5xl px-6 pb-10">
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-surface-2/50">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                    Feature
                  </th>
                  <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-muted">
                    Free
                  </th>
                  <th className="bg-accent/[0.06] px-5 py-3.5 text-center">
                    <span className="text-xs font-semibold uppercase tracking-wider text-accent">Pack</span>
                    <span className="ml-1.5 text-xs font-normal text-muted">$19</span>
                  </th>
                  <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-muted">
                    Plus
                    <span className="ml-1.5 font-normal normal-case tracking-normal">$49</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map(({ label, free, pack, plus }) => (
                  <tr
                    key={label}
                    className="border-b border-border/60 last:border-0 transition-colors hover:bg-surface-raised/20"
                  >
                    <td className="px-5 py-3 text-muted">{label}</td>
                    <td className="px-5 py-3 text-center"><Cell value={free} /></td>
                    <td className="bg-accent/[0.03] px-5 py-3 text-center"><Cell value={pack} /></td>
                    <td className="px-5 py-3 text-center"><Cell value={plus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-2xl px-6 pb-16 pt-4">
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
