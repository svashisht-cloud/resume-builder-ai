import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — Forte',
  description: 'Privacy Policy for Forte — the AI resume tailoring app.',
}

export default function PrivacyPage() {
  return (
    <article className="space-y-6 text-sm leading-7">
      <div>
        <h1 className="font-display mb-1 text-3xl font-bold text-foreground">Privacy Policy</h1>
        <p className="text-text-dim">Last updated: April 21, 2026</p>
      </div>

      <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 px-5 py-4 text-amber-300">
        <strong>⚠ Placeholder content.</strong> Replace with lawyer-reviewed or Termly/Iubenda-generated
        policy before public launch.
      </div>

      <section>
        <h2 className="mb-2 text-base font-semibold text-foreground">1. What We Collect</h2>
        <p className="text-muted">
          We collect information you provide directly: your name, email address, and profile photo
          (via Google OAuth). When you use the Service we also collect your uploaded resume text,
          job description text, and the tailored resume output generated for you.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-foreground">2. How We Use It</h2>
        <p className="text-muted">
          We use your data to provide, operate, and improve the Service — specifically to run the AI
          tailoring pipeline, track credit usage, and send transactional emails. We do not sell your
          data to third parties, use it for advertising, or use it to train AI models.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-foreground">3. Sub-processors</h2>
        <p className="text-muted mb-3">
          We share data with the following sub-processors only to the extent necessary to operate
          the Service:
        </p>
        <ul className="space-y-1 text-muted">
          <li><span className="font-medium text-foreground">OpenAI</span> — AI model inference (resume text and JD text are sent; not retained for training)</li>
          <li><span className="font-medium text-foreground">Supabase</span> — Authentication and database hosting</li>
          <li><span className="font-medium text-foreground">Vercel</span> — Application hosting and serverless functions</li>
          <li><span className="font-medium text-foreground">Upstash</span> — Rate limiting (user IDs only, no resume content)</li>
          <li><span className="font-medium text-foreground">Email provider</span> — Transactional email (TBD)</li>
          <li><span className="font-medium text-foreground">Analytics</span> — Usage analytics (TBD — privacy-friendly provider preferred)</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-foreground">4. Data Retention</h2>
        <p className="text-muted">
          We retain your account data for as long as your account is active. Resume and job description
          text associated with a tailoring session is retained in our database. You can delete your
          account at any time from the Settings page, which will permanently remove your profile and
          associated data.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-foreground">5. Your Rights (GDPR)</h2>
        <p className="text-muted">
          If you are located in the European Economic Area you have the right to access, correct,
          export, or delete your personal data. To exercise any of these rights, email us at{' '}
          <a
            href="mailto:support@forte.app"
            className="underline underline-offset-2 transition-colors hover:text-foreground"
          >
            support@forte.app
          </a>
          . We will respond within 30 days.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-foreground">6. Cookies</h2>
        <p className="text-muted">
          We use session cookies managed by Supabase to maintain your authenticated session. We do
          not use third-party tracking or advertising cookies. You can clear cookies at any time via
          your browser settings, which will sign you out.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-foreground">7. Contact</h2>
        <p className="text-muted">
          Questions or data requests? Email us at{' '}
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
