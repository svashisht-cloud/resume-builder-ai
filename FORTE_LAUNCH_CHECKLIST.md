# Forte — Production Launch Checklist

A comprehensive checklist of everything needed to take Forte from "architecturally complete prototype" to "real product accepting real payments from real users."

Items are ordered roughly by priority. Check off as you go.

---

## Phase 1 — Public pages (legal + marketing)

- [ ] `/terms` — Terms of Service page
- [ ] `/privacy` — Privacy Policy page
- [ ] `/refund-policy` — Refund & Cancellation Policy page
- [ ] `/pricing` — Public pricing page (extracted from landing)
- [ ] FAQ section on `/pricing` with refund question linking to `/refund-policy`
- [ ] Footer on LandingPage with four columns: Product, Company, Legal, Support
- [ ] AuthModal ToS line has actual `<Link>` tags for clickwrap consent
- [ ] Settings page links to `/refund-policy` near purchase CTAs
- [ ] `mailto:support@forte.app` (or your domain) in footer
- [ ] Sub-processor list in Privacy Policy (OpenAI, Supabase, Vercel, email provider, analytics)

---

## Phase 2 — Blockers before accepting money

- [ ] Rate limiting on `/api/tailor/step1`, `step2`, `step3`, `/api/tailor`
- [ ] Auth check on `/api/tailor/step2` and `/api/tailor/step3` (step1 already gated)
- [ ] Auth check on `/api/export-pdf` and `/api/export-docx`
- [ ] Real payment integration (Dodo webhooks replacing `mock_purchase_credits`)
- [ ] Webhook signature verification on payment events
- [ ] Refund webhook handler that revokes credits
- [ ] `dodo_customer_id` field on `profiles` actually populated on first purchase
- [ ] Remove `/api/billing/mock-purchase` route in production
- [ ] Remove `mock_purchase_credits` RPC (or gate behind `ENABLE_MOCK_PAYMENTS`)
- [ ] Transactional email provider set up (Resend / Postmark / SES)
- [ ] Domain DKIM / SPF / DMARC verified
- [ ] Receipt email sent after successful purchase
- [ ] Custom domain attached on Vercel with auto-renewing SSL
- [ ] All `NEXT_PUBLIC_*` and server-only env vars set in production
- [ ] Legal content is actually lawyer-reviewed or Termly/Iubenda-generated (not self-written templates)

---

## Phase 3 — Operational readiness

- [ ] Sentry (or equivalent) wired into API routes + client
- [ ] Analytics set up (Plausible / Umami / PostHog)
- [ ] Funnel tracking: landing → signup → first tailor → first purchase
- [ ] File upload size cap enforced in route handlers (not just Next.js default)
- [ ] MIME-type verification beyond extension checking on uploads
- [ ] Supabase on a paid tier with daily backups enabled
- [ ] Status page set up (Instatus / BetterStack) — optional but cheap
- [ ] Error budget / alert rules defined (OpenAI failure rate, 500 rate)

---

## Phase 4 — GDPR / privacy compliance

- [ ] Cookie consent banner if using analytics with cookies
- [ ] Data export mechanism (profiles + resumes + credits dump for a user)
- [ ] DeleteAccountButton cascade-deletes across all tables (verify)
- [ ] Privacy policy lists all sub-processors with their privacy links
- [ ] Data retention policy documented
- [ ] User-facing "Download my data" button in Settings

---

## Phase 5 — Product polish before scaling

- [ ] Admin dashboard at `/admin` gated on founder email
    - [ ] Recent payments table
    - [ ] Recent resumes table
    - [ ] "Grant credits" button for support cases
    - [ ] "Refund" button wired to payment processor
- [ ] Onboarding flow on first dashboard visit
    - [ ] Sample resume pre-fill option
    - [ ] Sample JD pre-fill option
    - [ ] 2-step inline tutorial overlay
- [ ] Empty-state improvements on Panel 1
- [ ] About page or founder story
- [ ] `/changelog` page with recent releases
- [ ] AI output disclaimer visible in UI ("review before submitting")
- [ ] Error recovery UX — what happens when step2 fails after step1 charged a credit?
- [ ] Dashboard navbar credit count live-updates after purchase (currently requires reload)

---

## Phase 6 — Growth infrastructure

- [ ] OpenGraph meta tags on all public pages
- [ ] Sitemap.xml generation
- [ ] Robots.txt
- [ ] Structured data (JSON-LD) for pricing, product
- [ ] Blog or content marketing setup (optional but high-ROI for SEO)
- [ ] Email capture on landing page for users who don't sign up immediately
- [ ] Referral program or share prompt after successful tailor

---

## Suggested sequence

1. **Week 1:** Phase 1 (all public pages + footer links)
2. **Week 1–2:** Phase 2 items 1–3 (rate limit + auth on AI routes) — Claude Code can do this
3. **Week 2:** Phase 2 payment integration (Dodo webhooks)
4. **Week 3:** Phase 2 email + Phase 3 monitoring
5. **Week 3–4:** Phase 4 GDPR basics
6. **Post-launch:** Phase 5 and 6 as users give feedback

---

## Notes

- **Don't self-write legal content.** Use Termly, Iubenda, or GetTerms ($50–200) for a solo pre-revenue project. Lawyer review ($500–2000) once you have real revenue.
- **Rate limiting is more urgent than it looks.** Your AI routes are currently open endpoints. Someone could script them and burn your OpenAI budget in a day.
- **Mock payment code is a production liability.** Delete or gate `/api/billing/mock-purchase` before launch — a forgotten test endpoint granting free credits is a common post-launch embarrassment.
