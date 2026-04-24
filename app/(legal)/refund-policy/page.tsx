import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Refund Policy - Forte',
  description: 'Refund Policy for Forte - credit-based AI resume tailoring.',
}

export default function RefundPolicyPage() {
  return (
    <article className="space-y-6 text-sm leading-7">
      <div>
        <h1 className="font-display mb-1 text-3xl font-bold text-foreground">Refund Policy</h1>
        <p className="text-text-dim">Last updated: April 21, 2026</p>
      </div>

      <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 px-5 py-4 text-amber-300">
        <strong>⚠ Placeholder content.</strong> Replace with lawyer-reviewed or Termly/Iubenda-generated
        policy before public launch.
      </div>

      <section>
        <h2 className="mb-2 text-base font-semibold text-foreground">1. Credit-Based Pricing Explained</h2>
        <p className="text-muted">
          Forte uses a credit system. Each credit entitles you to one full tailored resume generation
          for a specific job description, including the ATS match report, changelog, and PDF/DOCX
          export. Credits are purchased on a one-time basis and have no recurring fee.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-foreground">2. Eligibility</h2>
        <p className="text-muted">
          Refund requests for unused credits may be considered within [X] days of purchase. To be
          eligible, the credits must not have been spent on a resume generation. Free signup credits
          are not eligible for refund.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-foreground">3. How to Request a Refund</h2>
        <p className="text-muted">
          Email us at{' '}
          <a
            href="mailto:support@forte.app"
            className="underline underline-offset-2 transition-colors hover:text-foreground"
          >
            support@forte.app
          </a>{' '}
          with the subject line &ldquo;Refund Request&rdquo; and include the email address associated
          with your account and the date of purchase. We will review your request and respond within
          5 business days.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-foreground">4. Processing Time</h2>
        <p className="text-muted">
          Approved refunds are processed within [X] business days. Depending on your bank or card
          issuer, the refund may take an additional 5–10 business days to appear on your statement.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-foreground">5. Exceptions</h2>
        <p className="text-muted">
          Credits that have been used to generate a resume are non-refundable, regardless of whether
          you were satisfied with the output. If the AI output does not meet your expectations, we
          encourage you to use your included regenerations (up to 2 per job) or contact support.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-foreground">6. Contact</h2>
        <p className="text-muted">
          For refund requests or questions, email{' '}
          <a
            href="mailto:support@forte.app"
            className="underline underline-offset-2 transition-colors hover:text-foreground"
          >
            support@forte.app
          </a>
          .
        </p>
      </section>
    </article>
  )
}
