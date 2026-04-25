import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Refund Policy — Forte',
  description: 'Refund Policy for Forte Resume Builder — the AI resume tailoring app.',
}

function ChevronDown() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 flex-shrink-0 transition-transform group-open:rotate-180"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="group border-b border-border">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-base font-semibold text-foreground hover:text-foreground/80 [&::-webkit-details-marker]:hidden">
        <span>{title}</span>
        <ChevronDown />
      </summary>
      <div className="space-y-3 pb-6 text-sm leading-7">{children}</div>
    </details>
  )
}

function BulletList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="list-disc space-y-1 pl-5 text-muted">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  )
}

function ContactLink({ email }: { email: string }) {
  return (
    <a
      href={`mailto:${email}`}
      className="underline underline-offset-2 transition-colors hover:text-foreground"
    >
      {email}
    </a>
  )
}

export default function RefundPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <article className="text-sm leading-7">
        {/* Always-visible header */}
        <div className="mb-8 space-y-4">
          <div>
            <h1 className="font-display mb-1 text-3xl font-bold text-foreground">Refund Policy</h1>
            <p className="text-text-dim">Effective Date: April 25, 2026</p>
          </div>
          <p className="text-muted">
            This Refund Policy explains how refunds, cancellations, credits, and subscription access
            work for Forte Resume Builder.
          </p>
          <p className="text-muted">
            Forte Resume Builder is operated by Forte LLC (&ldquo;Forte,&rdquo; &ldquo;we,&rdquo;{' '}
            &ldquo;us,&rdquo; or &ldquo;our&rdquo;).
          </p>
          <p className="text-muted">
            For refund questions, contact <ContactLink email="support@forteresume.com" />.
          </p>
        </div>

        {/* Accordion sections */}
        <div className="border-t border-border">
          <Section title="1. Overview">
            <p className="text-muted">
              Forte Resume Builder provides AI-assisted resume generation, resume tailoring, ATS
              reports, and related resume tools.
            </p>
            <p className="text-muted">
              Because our service uses AI processing and compute resources immediately when a resume
              is generated, refund eligibility depends on whether the purchased product or credit has
              been used.
            </p>
            <p className="text-muted">
              We aim to be fair to customers while also preventing misuse, abuse, and excessive
              refund requests after paid services have already been consumed.
            </p>
          </Section>

          <Section title="2. Refund Window">
            <p className="text-muted">
              Refund requests must be submitted within 7 days of purchase.
            </p>
            <p className="text-muted">
              Refund requests submitted after 7 days are generally not eligible, except where
              required by law or where we determine that a billing, payment, or technical error
              occurred.
            </p>
            <p className="text-muted">
              To request a refund, email <ContactLink email="support@forteresume.com" />.
            </p>
            <p className="text-muted">Please include:</p>
            <BulletList
              items={[
                'The email address used for your Forte account',
                'The plan or product purchased',
                'The date of purchase',
                'A brief reason for the refund request',
              ]}
            />
          </Section>

          <Section title="3. One-Time Credit Pack Refunds">
            <p className="text-muted">
              Forte Resume Builder offers one-time credit packs, including:
            </p>
            <BulletList items={['Resume Pack', 'Resume Pack Plus']} />
            <p className="text-muted">
              One-time credit packs are eligible for a refund within 7 days of purchase only if no
              paid resume credit has been used.
            </p>
            <p className="text-muted">
              Once a paid resume credit has been used to generate or tailor a resume, the purchase
              becomes non-refundable.
            </p>
            <p className="text-muted">
              This is because AI processing costs are incurred immediately once resume generation
              begins.
            </p>
          </Section>

          <Section title="4. Subscription Refunds">
            <p className="text-muted">
              Forte Resume Builder offers subscription plans, including:
            </p>
            <BulletList items={['Pro Monthly', 'Pro Annual']} />
            <p className="text-muted">
              Subscription purchases may be eligible for a refund within 7 days of purchase only if
              the subscription has not been used to generate, tailor, or regenerate any resume during
              that billing period.
            </p>
            <p className="text-muted">
              Once a resume has been generated, tailored, or regenerated using a paid subscription,
              the subscription payment becomes non-refundable.
            </p>
          </Section>

          <Section title="5. Pro Annual Refunds">
            <p className="text-muted">
              Pro Annual purchases are eligible for a full refund within 7 days of purchase only if
              the plan has not been used.
            </p>
            <p className="text-muted">
              A Pro Annual plan is considered used if you have generated, tailored, or regenerated
              any resume using the subscription.
            </p>
            <p className="text-muted">
              After the 7-day refund window, Pro Annual purchases are non-refundable.
            </p>
            <p className="text-muted">
              We do not offer prorated refunds for Pro Annual cancellations after the refund window.
            </p>
          </Section>

          <Section title="6. Subscription Cancellations">
            <p className="text-muted">You may cancel your subscription at any time.</p>
            <p className="text-muted">
              When you cancel a subscription, you will continue to have access to your paid plan
              until the end of your current billing period.
            </p>
            <p className="text-muted">
              Cancellation does not automatically result in a refund.
            </p>
            <p className="text-muted">
              For example, if you cancel your Pro Monthly plan in the middle of a billing cycle, you
              may continue using Pro features until the end of that billing cycle, subject to plan
              limits and fair-use rules.
            </p>
          </Section>

          <Section title="7. Fair-Use Limit for Pro Plans">
            <p className="text-muted">
              Pro Monthly and Pro Annual include access to up to 100 tailored resumes per month
              under our fair-use policy.
            </p>
            <p className="text-muted">
              This limit exists to prevent automated abuse, account sharing, excessive usage, and
              third parties using Forte Resume Builder as a backend service.
            </p>
            <p className="text-muted">
              Reaching or exceeding the fair-use limit does not create a right to a refund.
            </p>
            <p className="text-muted">
              If you believe your usage was limited incorrectly, contact{' '}
              <ContactLink email="support@forteresume.com" />.
            </p>
          </Section>

          <Section title="8. AI Output Quality and Dissatisfaction">
            <p className="text-muted">
              Forte Resume Builder uses AI to assist with resume generation, tailoring, and ATS
              analysis. AI-generated outputs may vary depending on the resume content, job
              description, user inputs, and system behavior.
            </p>
            <p className="text-muted">
              If you are unhappy with the quality of an AI-generated resume or ATS report, contact
              us at <ContactLink email="support@forteresume.com" />.
            </p>
            <p className="text-muted">
              We may, at our discretion, offer one or more of the following:
            </p>
            <BulletList
              items={[
                'Help improving the generated resume',
                'Additional guidance',
                'A corrected output',
                'A replacement credit',
                'A refund in limited cases',
              ]}
            />
            <p className="text-muted">However, we do not guarantee:</p>
            <BulletList
              items={[
                'A specific ATS score',
                'Interview calls',
                'Job offers',
                'Hiring outcomes',
                'Perfect compatibility with every ATS system',
              ]}
            />
            <p className="text-muted">
              Refunds for AI-output dissatisfaction are reviewed case by case and are not automatic
              once a paid generation has been used.
            </p>
          </Section>

          <Section title="9. Technical Issues and Failed Generations">
            <p className="text-muted">
              You may be eligible for a refund, replacement credit, or account correction if:
            </p>
            <BulletList
              items={[
                'You were charged but did not receive credits or subscription access',
                'Resume generation failed due to a system error',
                'PDF or DOCX export failed and could not be restored',
                'A duplicate charge occurred',
                'Your payment succeeded but your Forte account was not updated',
                'A technical issue prevented you from accessing the paid product',
              ]}
            />
            <p className="text-muted">
              In many cases, we may first attempt to resolve the issue by restoring access, adding
              the missing credit, regenerating the resume, or correcting the account issue.
            </p>
            <p className="text-muted">
              If the issue cannot be reasonably resolved, we may approve a refund.
            </p>
          </Section>

          <Section title="10. Expired Credits">
            <p className="text-muted">
              Resume credits are valid for 12 months from the date of purchase unless otherwise
              stated.
            </p>
            <p className="text-muted">Expired credits are not refundable.</p>
            <p className="text-muted">
              Unused credits are also not refundable after the refund window has passed.
            </p>
          </Section>

          <Section title="11. Abuse and Refund Denial">
            <p className="text-muted">
              We may deny a refund request if we believe there has been abuse, misuse, or violation
              of our Terms of Service. Examples include:
            </p>
            <BulletList
              items={[
                'Using paid credits and then requesting a refund',
                'Repeated refund requests',
                'Account sharing',
                'Automated or scripted usage',
                'Attempting to bypass plan limits',
                'Reselling access to Forte Resume Builder',
                'Using Forte Resume Builder as part of another commercial service without permission',
                'Violating fair-use limits',
                'Fraudulent payment activity',
                'Chargeback abuse',
              ]}
            />
            <p className="text-muted">
              We reserve the right to suspend or terminate accounts involved in abuse, fraud, or
              misuse.
            </p>
          </Section>

          <Section title="12. Payment Processor Timing">
            <p className="text-muted">
              Approved refunds are typically processed within 5–10 business days.
            </p>
            <p className="text-muted">
              However, the exact timing may depend on:
            </p>
            <BulletList
              items={[
                'Dodo Payments',
                'Your bank',
                'Your card provider',
                'Your payment method',
                'Regional payment processing rules',
              ]}
            />
            <p className="text-muted">
              Once a refund is approved and submitted, we cannot control how long your bank or
              payment provider takes to post the funds back to your account.
            </p>
          </Section>

          <Section title="13. Chargebacks">
            <p className="text-muted">
              If you have an issue with your purchase, please contact us first at{' '}
              <ContactLink email="support@forteresume.com" />.
            </p>
            <p className="text-muted">
              Filing a chargeback without first contacting support may result in account suspension
              while the payment dispute is investigated.
            </p>
            <p className="text-muted">
              If a chargeback is filed after paid credits or subscription benefits have been used, we
              may provide evidence of usage to the payment processor.
            </p>
          </Section>

          <Section title="14. Changes to This Refund Policy">
            <p className="text-muted">We may update this Refund Policy from time to time.</p>
            <p className="text-muted">
              If we make material changes, we will update the effective date and may provide notice
              through the website, application, or email.
            </p>
            <p className="text-muted">
              Your continued use of Forte Resume Builder after an updated Refund Policy is posted
              means you accept the updated policy.
            </p>
          </Section>

          <Section title="15. Contact Us">
            <p className="text-muted">For refund requests or billing questions, contact:</p>
            <address className="not-italic text-muted">
              <ContactLink email="support@forteresume.com" />
            </address>
            <p className="text-muted">Operator:</p>
            <address className="not-italic text-muted">
              <p>Forte LLC</p>
              <p>New Delhi, India</p>
            </address>
          </Section>
        </div>
      </article>
    </div>
  )
}
