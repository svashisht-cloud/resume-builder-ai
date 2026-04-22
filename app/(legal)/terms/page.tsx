import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — Forte',
  description: 'Terms of Service for Forte — the AI resume tailoring app.',
}

export default function TermsPage() {
  return (
    <article className="space-y-6 text-sm leading-7">
      <div>
        <h1 className="font-display mb-1 text-3xl font-bold text-foreground">Terms of Service</h1>
        <p className="text-text-dim">Last updated: April 21, 2026</p>
      </div>

      <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 px-5 py-4 text-amber-300">
        <strong>⚠ Placeholder content.</strong> Replace with lawyer-reviewed or Termly/Iubenda-generated
        policy before public launch.
      </div>

      <section>
        <h2 className="mb-2 text-base font-semibold text-foreground">1. Acceptance of Terms</h2>
        <p className="text-muted">
          By accessing or using Forte (&ldquo;the Service&rdquo;) you agree to be bound by these Terms of
          Service. If you do not agree, do not use the Service.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-foreground">2. Account</h2>
        <p className="text-muted">
          You must sign in with a valid Google account to use the Service. You are responsible for
          maintaining the security of your account and for all activity that occurs under it. Forte is
          not liable for any loss resulting from unauthorised access to your account.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-foreground">3. Acceptable Use</h2>
        <p className="text-muted">
          You agree not to use the Service to upload content that infringes third-party rights, to
          attempt to reverse-engineer the AI pipeline, or to resell or sublicense access without written
          permission. We reserve the right to suspend accounts that violate this policy.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-foreground">4. Credits &amp; Payments</h2>
        <p className="text-muted">
          Access to tailored resume generations is gated by credits. Credits are purchased on a one-time
          basis and expire 12 months from the date of purchase. Prices are listed in USD and are subject
          to change. Payment processing terms are governed by our payment provider.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-foreground">5. Intellectual Property</h2>
        <p className="text-muted">
          You retain ownership of your original resume content and the tailored output generated for you.
          We do not claim any rights over your resume data. We do not use your data to train AI models.
          Forte&rsquo;s brand, UI, and codebase are our exclusive property.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-foreground">6. Disclaimers</h2>
        <p className="text-muted">
          The Service provides AI-generated resume suggestions. We do not guarantee that tailored
          resumes will result in interview invitations, job offers, or specific ATS scores. AI output
          should be reviewed for accuracy before use. The Service is provided &ldquo;as is&rdquo; without
          warranties of any kind.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-foreground">7. Limitation of Liability</h2>
        <p className="text-muted">
          To the maximum extent permitted by law, Forte shall not be liable for any indirect, incidental,
          or consequential damages arising from your use of the Service. Our total liability to you shall
          not exceed the amount you paid us in the 12 months preceding the claim.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-foreground">8. Termination</h2>
        <p className="text-muted">
          We may suspend or terminate your account for material breach of these Terms. You may delete
          your account at any time from the Settings page. On termination, unused credits are
          non-refundable unless otherwise stated in our Refund Policy.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-foreground">9. Governing Law</h2>
        <p className="text-muted">
          These Terms are governed by the laws of [jurisdiction TBD]. Any disputes shall be resolved
          in the courts of [jurisdiction TBD].
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-foreground">10. Contact</h2>
        <p className="text-muted">
          Questions about these Terms? Email us at{' '}
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
