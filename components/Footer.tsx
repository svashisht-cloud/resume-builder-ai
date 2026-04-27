import Link from 'next/link'
import { Logo } from '@/components/brand'

export default function Footer() {
  return (
    <footer className="relative border-t border-border/60 py-10">
      <div className="landing-section-glow opacity-60" />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-2 gap-x-8 gap-y-7 border-b border-border/60 pb-8 md:grid-cols-4">
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/pricing" className="block py-1.5 text-muted transition-colors hover:text-foreground">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="block py-1.5 text-muted transition-colors hover:text-foreground">
                  How it works
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:support@forte.app" className="block py-1.5 text-muted transition-colors hover:text-foreground">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="block py-1.5 text-muted transition-colors hover:text-foreground">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="block py-1.5 text-muted transition-colors hover:text-foreground">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="block py-1.5 text-muted transition-colors hover:text-foreground">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="mailto:support@forte.app"
                  className="block py-1.5 text-muted transition-colors hover:text-foreground"
                >
                  support@forte.app
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="flex max-w-2xl flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
            <Logo variant="stacked" tone="auto" className="h-12 flex-shrink-0" />
            <p className="text-sm leading-6 text-muted">
              ATS-safe, evidence-grounded resume tailoring with recruiter-ready exports.
            </p>
          </div>
          <span className="text-sm text-muted sm:text-right">© 2026 Forte</span>
        </div>
      </div>
    </footer>
  )
}
