import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — Forte',
  description: 'Privacy Policy for Forte Resume Builder — the AI resume tailoring app.',
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

function SubHeading({ children }: { children: React.ReactNode }) {
  return <p className="font-medium text-foreground">{children}</p>
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

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <article className="text-sm leading-7">
        {/* Always-visible header */}
        <div className="mb-8 space-y-4">
          <div>
            <h1 className="font-display mb-1 text-3xl font-bold text-foreground">Privacy Policy</h1>
            <p className="text-text-dim">Effective Date: April 25, 2026</p>
          </div>
          <p className="text-muted">
            Forte Resume Builder is operated by Forte LLC (&ldquo;Forte,&rdquo; &ldquo;we,&rdquo;{' '}
            &ldquo;us,&rdquo; or &ldquo;our&rdquo;), based in New Delhi, India.
          </p>
          <p className="text-muted">
            This Privacy Policy explains how we collect, use, store, share, and protect your
            information when you use Forte Resume Builder, including our website, application, resume
            generation tools, ATS analysis tools, and related services.
          </p>
          <p className="text-muted">
            By using Forte Resume Builder, you agree to the practices described in this Privacy
            Policy.
          </p>
          <p className="text-muted">
            For privacy-related questions or requests, contact us at{' '}
            <ContactLink email="privacy@forteresume.com" />. For general support, contact us at{' '}
            <ContactLink email="support@forteresume.com" />.
          </p>
        </div>

        {/* Accordion sections */}
        <div className="border-t border-border">
          <Section title="1. Information We Collect">
            <p className="text-muted">
              We collect only the information needed to provide and improve Forte Resume Builder.
            </p>
            <SubHeading>A. Account Information</SubHeading>
            <p className="text-muted">
              When you create an account or use our service, we may collect:
            </p>
            <BulletList items={['Name', 'Email address', 'Login and authentication-related information']} />
            <p className="text-muted">We do not collect phone numbers.</p>

            <SubHeading>B. Resume and Job Application Content</SubHeading>
            <p className="text-muted">
              To provide resume tailoring, ATS analysis, and related services, we may collect:
            </p>
            <BulletList
              items={[
                'Resumes you upload',
                'Resume text',
                'Job descriptions you provide',
                'AI-generated resume edits',
                'ATS/match reports',
                'Resume versions or outputs generated through the service',
              ]}
            />
            <p className="text-muted">
              You retain ownership of all resume content and other materials you upload or generate
              through Forte Resume Builder.
            </p>

            <SubHeading>C. Usage and Service Data</SubHeading>
            <p className="text-muted">
              We collect limited usage data to operate the service, track product limits, and manage
              system cost. This may include:
            </p>
            <BulletList
              items={[
                'Number of resumes generated',
                'Token usage',
                'Total AI-processing cost associated with your account',
                'Feature usage related to resume generation and ATS reports',
              ]}
            />
            <p className="text-muted">
              We currently do not use third-party analytics tools such as Google Analytics, PostHog,
              or advertising trackers.
            </p>

            <SubHeading>D. Payment Information</SubHeading>
            <p className="text-muted">Payments are processed by Dodo Payments.</p>
            <p className="text-muted">
              We do not collect, store, or process your full payment card details ourselves. Payment
              information is handled by Dodo Payments according to its own privacy and security
              practices. We may receive limited payment-related information, such as:
            </p>
            <BulletList
              items={[
                'Payment status',
                'Transaction confirmation',
                'Plan or credit purchase information',
                'Billing-related identifiers',
              ]}
            />

            <SubHeading>E. Cookies and Similar Technologies</SubHeading>
            <p className="text-muted">We use essential cookies for:</p>
            <BulletList items={['Account login', 'Authentication', 'Session management', 'Security']} />
            <p className="text-muted">
              We do not currently use advertising cookies, third-party tracking cookies, or
              behavioral advertising cookies.
            </p>
          </Section>

          <Section title="2. How We Use Your Information">
            <p className="text-muted">We use your information to:</p>
            <BulletList
              items={[
                'Create and manage your account',
                'Provide resume tailoring and ATS analysis',
                'Generate resume edits, reports, and outputs',
                'Process purchases, credits, and subscriptions',
                'Track usage limits and service costs',
                'Improve product quality and reliability',
                'Respond to support requests',
                'Maintain security and prevent abuse',
                'Comply with legal obligations',
              ]}
            />
            <p className="text-muted">We do not use your personal data for advertising.</p>
          </Section>

          <Section title="3. AI Processing">
            <p className="text-muted">
              Forte Resume Builder uses artificial intelligence services, including OpenAI, to
              provide resume parsing, tailoring, and ATS-related functionality.
            </p>
            <p className="text-muted">
              When you use AI-powered features, we may send the following to our AI service
              providers:
            </p>
            <BulletList
              items={[
                'Resume text',
                'Job description text',
                'Instructions needed to generate resume edits or ATS analysis',
              ]}
            />
            <p className="text-muted">We do not send payment information to AI providers.</p>
            <p className="text-muted">
              We do not store AI conversations, because Forte Resume Builder is not designed as a
              chat-history product.
            </p>
            <p className="text-muted">
              We do not use your resume content to train our own AI models.
            </p>
            <p className="text-muted">
              Third-party AI providers may process submitted content according to their own terms,
              policies, and data-processing practices.
            </p>
          </Section>

          <Section title="4. Legal Bases for Processing Under GDPR">
            <p className="text-muted">
              If you are located in the European Economic Area, United Kingdom, or Switzerland, we
              process your personal data under the following legal bases:
            </p>
            <SubHeading>A. Contractual Necessity</SubHeading>
            <p className="text-muted">
              We process your data when it is necessary to provide the service you requested,
              including:
            </p>
            <BulletList
              items={[
                'Creating your account',
                'Generating resumes',
                'Providing ATS reports',
                'Processing service usage',
                'Delivering purchased credits or paid features',
              ]}
            />
            <SubHeading>B. Legitimate Interests</SubHeading>
            <p className="text-muted">
              We may process certain information for legitimate business interests, including:
            </p>
            <BulletList
              items={[
                'Improving the service',
                'Preventing fraud or abuse',
                'Maintaining platform security',
                'Debugging and monitoring service performance',
                'Tracking token usage and system cost',
              ]}
            />
            <p className="text-muted">
              We only rely on legitimate interests where those interests are not overridden by your
              privacy rights.
            </p>
            <SubHeading>C. Consent</SubHeading>
            <p className="text-muted">
              We may rely on your consent where required by law, such as if we later introduce
              optional marketing emails, non-essential cookies, or analytics tools. You may withdraw
              consent at any time where processing is based on consent.
            </p>
            <SubHeading>D. Legal Obligation</SubHeading>
            <p className="text-muted">
              We may process or retain certain information where necessary to comply with applicable
              laws, tax rules, accounting requirements, payment disputes, or legal requests.
            </p>
          </Section>

          <Section title="5. Data Controller and Data Processors">
            <p className="text-muted">
              For purposes of GDPR and similar privacy laws, Forte LLC is the data controller for
              the personal information collected through Forte Resume Builder. This means Forte LLC
              determines why and how your personal data is processed.
            </p>
            <p className="text-muted">
              Some third-party services act as data processors or service providers on our behalf.
              These may include:
            </p>
            <ul className="space-y-1 text-muted">
              <li>
                <span className="font-medium text-foreground">Supabase</span> — backend and database
                infrastructure
              </li>
              <li>
                <span className="font-medium text-foreground">Vercel</span> — hosting and deployment
              </li>
              <li>
                <span className="font-medium text-foreground">Dodo Payments</span> — payment
                processing
              </li>
              <li>
                <span className="font-medium text-foreground">OpenAI</span> — AI processing
              </li>
              <li>
                <span className="font-medium text-foreground">GoDaddy</span> — domain-related
                services
              </li>
            </ul>
            <p className="text-muted">
              These providers may process your information only as needed to provide services to us,
              subject to their own contractual and legal obligations.
            </p>
          </Section>

          <Section title="6. How We Share Information">
            <p className="text-muted">We do not sell your personal information.</p>
            <p className="text-muted">
              We do not share your personal information with advertisers.
            </p>
            <p className="text-muted">
              We may share limited information with third-party service providers only when necessary
              to operate Forte Resume Builder, including:
            </p>
            <BulletList
              items={[
                'Cloud hosting providers',
                'Database providers',
                'AI-processing providers',
                'Payment processors',
                'Security or infrastructure providers',
              ]}
            />
            <p className="text-muted">We may also disclose information if required to:</p>
            <BulletList
              items={[
                'Comply with applicable law',
                'Respond to lawful legal requests',
                'Protect our rights, users, or service',
                'Investigate fraud, abuse, or security issues',
                'Complete a merger, acquisition, restructuring, or sale of assets',
              ]}
            />
            <p className="text-muted">
              If a business transfer occurs, we will take reasonable steps to ensure your
              information remains protected.
            </p>
          </Section>

          <Section title="7. Data Retention">
            <p className="text-muted">
              We retain your information for as long as your account remains active or as needed to
              provide the service.
            </p>
            <p className="text-muted">
              Because Forte Resume Builder allows users to access previously generated resumes and
              reports, we may retain account data, resume content, and generated outputs indefinitely
              unless you request deletion.
            </p>
            <p className="text-muted">
              You may request account deletion at any time by contacting{' '}
              <ContactLink email="privacy@forteresume.com" />.
            </p>
            <p className="text-muted">
              After deletion, we may retain limited information if necessary for:
            </p>
            <BulletList
              items={[
                'Legal compliance',
                'Fraud prevention',
                'Dispute resolution',
                'Tax, accounting, or payment records',
                'Security logs or backup systems',
              ]}
            />
            <p className="text-muted">
              Where backup deletion is not immediate, data will be deleted or isolated according to
              our backup retention practices.
            </p>
          </Section>

          <Section title="8. Your Privacy Rights">
            <p className="text-muted">
              Depending on your location, you may have certain rights regarding your personal
              information. These may include the right to:
            </p>
            <BulletList
              items={[
                'Access the personal information we hold about you',
                'Request correction of inaccurate information',
                'Request deletion of your account or personal information',
                'Object to certain processing',
                'Restrict certain processing',
                'Request a copy of your data, where required by law',
                'Withdraw consent where processing is based on consent',
                'File a complaint with a data protection authority',
              ]}
            />
            <p className="text-muted">
              To exercise your rights, contact <ContactLink email="privacy@forteresume.com" />. We
              may need to verify your identity before completing your request.
            </p>
          </Section>

          <Section title="9. GDPR Rights for EU/UK Users">
            <p className="text-muted">
              If GDPR or UK GDPR applies to you, you may have the right to:
            </p>
            <BulletList
              items={[
                'Access your personal data',
                'Correct inaccurate or incomplete personal data',
                'Request deletion of your personal data',
                'Restrict processing of your personal data',
                'Object to processing based on legitimate interests',
                'Request data portability, where applicable',
                'Withdraw consent, where processing is based on consent',
                'Lodge a complaint with your local data protection authority',
              ]}
            />
            <p className="text-muted">
              Forte LLC is based in India. If required by applicable law, we will take appropriate
              steps to support international data transfer compliance.
            </p>
          </Section>

          <Section title="10. California Privacy Rights: CCPA/CPRA">
            <p className="text-muted">
              If you are a California resident, you may have rights under the California Consumer
              Privacy Act, as amended by the California Privacy Rights Act. These rights may
              include:
            </p>
            <BulletList
              items={[
                'The right to know what personal information we collect',
                'The right to know how we use personal information',
                'The right to request access to personal information',
                'The right to request deletion of personal information',
                'The right to correct inaccurate personal information',
                'The right to opt out of the sale or sharing of personal information',
                'The right to limit use of sensitive personal information, where applicable',
                'The right not to be discriminated against for exercising privacy rights',
              ]}
            />
            <p className="text-muted">We do not sell your personal information.</p>
            <p className="text-muted">
              We do not share your personal information for cross-context behavioral advertising.
            </p>
            <p className="text-muted">
              We do not knowingly collect sensitive personal information for the purpose of inferring
              characteristics about you.
            </p>
            <p className="text-muted">
              To exercise California privacy rights, contact{' '}
              <ContactLink email="privacy@forteresume.com" />.
            </p>
          </Section>

          <Section title="11. Categories of Personal Information Collected">
            <p className="text-muted">
              For California privacy purposes, we may collect the following categories of personal
              information:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2 pr-4 text-left font-semibold text-foreground">Category</th>
                    <th className="py-2 pr-4 text-left font-semibold text-foreground">Examples</th>
                    <th className="py-2 text-left font-semibold text-foreground">Collected?</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-muted">
                  <tr>
                    <td className="py-2 pr-4 align-top font-medium text-foreground">Identifiers</td>
                    <td className="py-2 pr-4 align-top">Name, email address</td>
                    <td className="py-2 align-top">Yes</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 align-top font-medium text-foreground">Customer records</td>
                    <td className="py-2 pr-4 align-top">Account and billing-related information</td>
                    <td className="py-2 align-top">Yes</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 align-top font-medium text-foreground">Commercial information</td>
                    <td className="py-2 pr-4 align-top">Purchase history, credits, plan status</td>
                    <td className="py-2 align-top">Yes</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 align-top font-medium text-foreground">
                      Internet or network activity
                    </td>
                    <td className="py-2 pr-4 align-top">Login/session activity, product usage</td>
                    <td className="py-2 align-top">Limited</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 align-top font-medium text-foreground">
                      Professional or employment-related information
                    </td>
                    <td className="py-2 pr-4 align-top">Resume content, job descriptions</td>
                    <td className="py-2 align-top">Yes</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 align-top font-medium text-foreground">Inferences</td>
                    <td className="py-2 pr-4 align-top">
                      ATS/match analysis based on resume/job description
                    </td>
                    <td className="py-2 align-top">Yes</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 align-top font-medium text-foreground">
                      Sensitive personal information
                    </td>
                    <td className="py-2 pr-4 align-top">
                      Government IDs, health data, precise location, financial account credentials
                    </td>
                    <td className="py-2 align-top">No</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-muted">We collect this information from:</p>
            <BulletList
              items={[
                'You directly',
                'Your uploaded resume or job description',
                'Your use of the service',
                'Payment processors',
                'Authentication and infrastructure providers',
              ]}
            />
          </Section>

          <Section title="12. Purposes for Collecting Personal Information">
            <p className="text-muted">
              We collect personal information for the following purposes:
            </p>
            <BulletList
              items={[
                'Providing resume generation and tailoring',
                'Creating ATS/match reports',
                'Managing accounts',
                'Processing payments and credits',
                'Maintaining platform security',
                'Preventing misuse or fraud',
                'Improving product functionality',
                'Providing customer support',
                'Complying with legal obligations',
              ]}
            />
          </Section>

          <Section title='13. California "Do Not Sell or Share" Notice'>
            <p className="text-muted">Forte Resume Builder does not sell personal information.</p>
            <p className="text-muted">
              Forte Resume Builder does not share personal information for cross-context behavioral
              advertising.
            </p>
            <p className="text-muted">
              Because we do not sell or share personal information as defined by CCPA/CPRA, we
              currently do not provide a separate &ldquo;Do Not Sell or Share My Personal
              Information&rdquo; link.
            </p>
            <p className="text-muted">
              If our practices change, we will update this Privacy Policy and provide any required
              opt-out mechanism.
            </p>
          </Section>

          <Section title="14. CalOPPA Disclosures">
            <p className="text-muted">
              In accordance with the California Online Privacy Protection Act:
            </p>
            <BulletList
              items={[
                'This Privacy Policy is available through a clear link on our website.',
                'This Privacy Policy identifies the categories of personal information we collect.',
                'This Privacy Policy explains how we use and share information.',
                'This Privacy Policy explains how users can request deletion or correction.',
                'This Privacy Policy includes an effective date.',
                'We will update this page if our privacy practices materially change.',
              ]}
            />
            <p className="font-medium text-foreground">Do Not Track Signals</p>
            <p className="text-muted">
              Some browsers provide &ldquo;Do Not Track&rdquo; signals. Forte Resume Builder does
              not currently respond to Do Not Track signals because we do not currently use
              advertising cookies or third-party behavioral tracking.
            </p>
            <p className="font-medium text-foreground">Third-Party Tracking</p>
            <p className="text-muted">
              We do not currently allow third-party advertising networks to collect personally
              identifiable information about your online activities across different websites when
              you use Forte Resume Builder. If this changes, we will update this Privacy Policy.
            </p>
          </Section>

          <Section title="15. International Data Transfers">
            <p className="text-muted">
              Forte LLC is based in India, and our service providers may process data in countries
              where they operate.
            </p>
            <p className="text-muted">
              If you access Forte Resume Builder from outside India, you understand that your
              information may be processed in India, the United States, or other countries where our
              service providers maintain infrastructure.
            </p>
            <p className="text-muted">
              Where required, we will take reasonable steps to protect international transfers of
              personal information.
            </p>
          </Section>

          <Section title="16. Security">
            <p className="text-muted">
              We use reasonable technical and organizational measures to protect your information.
              These measures may include:
            </p>
            <BulletList
              items={[
                'Authentication controls',
                'Secure cloud infrastructure',
                'Limited access to user data',
                'Encrypted data transmission where applicable',
                'Access controls for backend systems',
                'Monitoring for abuse or misuse',
              ]}
            />
            <p className="text-muted">
              However, no system is completely secure. We cannot guarantee absolute security of your
              information.
            </p>
          </Section>

          <Section title="17. User Content Ownership">
            <p className="text-muted">
              You retain ownership of the resumes, job descriptions, and other content you upload or
              generate through Forte Resume Builder.
            </p>
            <p className="text-muted">We do not claim ownership over your resume content.</p>
            <p className="text-muted">
              You grant us a limited right to process your content only as needed to provide,
              maintain, secure, and improve the service.
            </p>
          </Section>

          <Section title="18. Children's Privacy">
            <p className="text-muted">
              Forte Resume Builder is not intended for children under 13.
            </p>
            <p className="text-muted">
              We do not knowingly collect personal information from children under 13.
            </p>
            <p className="text-muted">
              If we learn that we have collected personal information from a child under 13, we will
              take reasonable steps to delete it.
            </p>
          </Section>

          <Section title="19. Marketing Communications">
            <p className="text-muted">We do not currently send marketing emails.</p>
            <p className="text-muted">
              If we introduce marketing emails in the future, you will be able to unsubscribe or opt
              out.
            </p>
            <p className="text-muted">
              We may still send service-related emails, such as account, payment, security, or
              support messages.
            </p>
          </Section>

          <Section title="20. Changes to This Privacy Policy">
            <p className="text-muted">We may update this Privacy Policy from time to time.</p>
            <p className="text-muted">
              If we make material changes, we may notify users by:
            </p>
            <BulletList
              items={[
                'Updating the effective date',
                'Posting a notice on our website or app',
                'Sending an email notice, where appropriate',
              ]}
            />
            <p className="text-muted">
              Your continued use of Forte Resume Builder after an updated Privacy Policy is posted
              means you accept the updated policy.
            </p>
          </Section>

          <Section title="21. Contact Us">
            <p className="text-muted">For privacy requests, contact:</p>
            <address className="not-italic text-muted">
              <a
                href="mailto:privacy@forteresume.com"
                className="underline underline-offset-2 transition-colors hover:text-foreground"
              >
                privacy@forteresume.com
              </a>
            </address>
            <p className="text-muted">For general support, contact:</p>
            <address className="not-italic text-muted">
              <a
                href="mailto:support@forteresume.com"
                className="underline underline-offset-2 transition-colors hover:text-foreground"
              >
                support@forteresume.com
              </a>
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
