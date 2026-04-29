# TASKS.md

## Current status
- MR-4 real AI pipeline is implemented
- MR-6 evaluator-based before/after scoring is implemented
- `/api/tailor` accepts `.txt`, `.pdf`, and `.docx` resume uploads
- Raw resume text and raw JD text are the scoring and tailoring truth
- Production pipeline is `evaluate -> tailor -> re-evaluate`
- Tailoring returns structured resume output directly from raw resume/JD text
- Responses include `originalEvaluation`, `tailoredEvaluation`, `scoreComparison`, and `evaluationMode`
- AI output is parsed defensively and validated with Zod
- Section order is detected from raw resume text and preserved across HTML, PDF, and DOCX
- Role subtitle, experience layout, and inline project URL behavior are aligned across all three renderers
- Public landing page is in its current resume-first marketing state with stabilized desktop/mobile behavior
- Theme system, experience-level-aware length controls, auth gating, admin surfaces, mock billing scaffolding, and the sectioned settings IA are all live

## Completed (session: 2026-04-28) - Settings IA refresh
- `/settings` now uses a local section navigation layout instead of a single long undifferentiated stack
- Billing was consolidated into a single `Billing & Credits` area with current subscription state, credit balance, compact purchase controls, an embedded billing explainer, and in-page payment history
- `Usage`, `Appearance`, `Experience Level`, `Account`, and conditional `Admin` remain distinct settings sections, with delete-account controls moved under `Account`
- The old inline `Manage Plan` pricing-card block was removed from settings in favor of an account-first billing presentation
- Settings sidebar items now render focused panels via `/settings?section=...` instead of scrolling through every section
- Settings section changes are handled client-side after the initial `/settings` load, avoiding repeated server/proxy navigations when switching panels
- Active subscribers can cancel or switch Pro plans through first-party API routes backed by the Dodo subscriptions API instead of being sent to the hosted customer portal

## Completed (session: 2026-04-26) - Landing page hero refresh
- `HeroTrailer` was removed from the hero and replaced with `components/landing/InteractiveHeroPreview.tsx`
- `components/LandingPage.tsx` now treats the hero-right area as a static product preview, while `How It Works` reuses the trailer in a separate explanatory section
- Existing auth modal, pricing, testimonials, and export flows were left intact

## Completed (session: 2026-04-27) - Resume-first hero preview polish
- `components/landing/InteractiveHeroPreview.tsx` now renders a compact recruiter-style fictional resume with accent-highlighted skills and grounded ATS before/after proof
- Hero preview uses a mobile ATS footer attached beneath the resume card and a desktop ATS side card beside the resume
- Landing hero fills the first viewport below the navbar via `min-h-[calc(100vh-65px)]`
- `ARCHITECTURE.md` and `ARCHITECTURE_SUMMARY.md` were updated to describe the hero structure

## Completed (session: 2026-04-27) - Landing hero/mobile ATS + tilt polish
- `components/landing/InteractiveHeroPreview.tsx` now docks the mobile ATS score as a footer attached beneath the resume preview while preserving the desktop side-card layout
- `components/landing/TiltCard.tsx` now uses localized cursor-following edge highlights instead of tinting entire borders
- `components/LandingPage.tsx` received a moderate polish pass for hero rhythm, CTA spacing, trust/stats wrapping, and How It Works card spacing

## Completed (session: 2026-04-27) - Landing page visual unification
- Added reusable landing surface, kicker, eyebrow, and glow utilities in `app/globals.css`
- `components/LandingPage.tsx` now uses a stronger editorial hero, a unified proof band, more intentional How It Works framing, and clearer section headers
- `components/landing/Testimonials.tsx`, `components/pricing/PricingCards.tsx`, and `components/Footer.tsx` were restyled into the same visual system

## Completed (session: 2026-04-27) - Landing page consistency cleanup
- `components/landing/Testimonials.tsx` keeps the newer Customer Reviews framing while preserving the simpler testimonial card/carousel format
- `components/pricing/PricingCards.tsx` now anchors the Pro badge correctly above the card, removes the extra fit callout, and shortens plan copy and spacing
- `components/LandingPage.tsx` tightens the hero trust-chip row to stay on one line on smaller widths and normalizes visible marketing copy punctuation
- `components/landing/HeroTrailer.tsx` copy was normalized the same way

## Completed (session: 2026-04-27) - Pricing radius + footer hybrid refinement
- `components/pricing/PricingCards.tsx` uses tighter `rounded-xl` pricing card geometry while keeping the newer spacing cleanup and fixed Pro badge placement
- `components/Footer.tsx` now uses an open footer layout with four link columns and a shorter brand sentence row below

## Completed (session: 2026-04-27) - Landing section header alignment
- Added `landing-eyebrow` in `app/globals.css` as a lighter alternative to the pill-style section kicker
- `components/LandingPage.tsx` and `components/landing/Testimonials.tsx` now use the eyebrow treatment for How It Works, Customer Reviews, and Pricing
- Pricing header alignment now uses the same max-width page rail as the other landing sections, with pricing cards still constrained in a narrower centered wrapper

## Completed (session: 2026-04-27) - Landing polish review fixes
- `components/landing/TiltCard.tsx` now keeps the How It Works hover effect to localized edge/corner border lighting only, with no glare overlay
- `components/LandingPage.tsx` removes the How It Works hover shadow and tightens the hero trust-chip row for very narrow screens
- `components/landing/Testimonials.tsx` moves carousel arrows below the testimonial card on mobile while preserving side arrows on larger screens

## Completed (session: 2026-04-25) - Legal pages expanded
- `/terms` now uses accordion sections for the full Termly-generated Terms of Service
- `/privacy` and `/refund-policy` now use full accordion-style policy content instead of placeholder copy
- Legal pages retain the public shell and their own centered content width

## Completed (session: 2026-04-21, continued)
- Credit restore on AI failure: `restore_credit(p_resume_id)` RPC restores credit or decrements Pro usage within the safety window if the AI pipeline fails after `spend_credit`
- `P0003` / `paid_credit_required` was removed and must stay removed

## Completed (session: 2026-04-25) - Theme migration
- Theme system migrated to user-selectable palettes backed by cookies and profile persistence
- `app/themes.css`, `lib/themes/*`, `components/ThemeSync.tsx`, and settings theme controls now provide 8 palettes x 2 modes
- Default theme was changed to `charcoal-periwinkle` in `light` mode
- Resume document tokens remain invariant across all themes

## Completed (session: 2026-04-25) - Experience-level-aware resume length
- DB migration added `profiles.experience_level` with `junior | mid | senior`
- AI prompts and pipeline now accept `experienceLevel` and `targetPages`
- Settings and dashboard now expose and thread the experience-level/length controls through tailoring and export flows

## Completed (session: 2026-04-21) - Auth, rate limits, pricing, and legal shell
- Auth gates were added to step2, step3, export-pdf, and export-docx
- Upstash sliding-window rate limiting was applied to AI and export routes with graceful-disable behavior when env vars are absent
- Public `/pricing` page was added with FAQ, public header, and footer
- Footer was extracted into `components/Footer.tsx`
- Auth modal and plan management surfaces now link to the public legal pages

## Completed (session: 2026-04-26) - Admin and theme infrastructure
- Admin dashboards/actions are live under `/admin` with middleware, layout, and route-level checks
- `pipeline_runs` telemetry supports admin usage, cost, and error reporting
- Theme sync is server-cookie driven in the root layout to avoid FOUC

## Next step
- Replace mock billing routes with real Dodo integration and verified webhook handling
- Deferred: dashboard/settings UX refresh plan lives in `specs/App-Workspace-UX-Refresh.md`
- Test with real resumes and keep tuning evaluator/tailoring prompts against validation failures
- Rename `middleware.ts` to the Next.js `proxy` convention to remove the current build warning
- Review legal copy/contact details before launch if a final legal pass is still required

## Notes
- Next.js App Router project
- Requires `OPENAI_API_KEY`
- Default AI models are `gpt-4.1-mini` for evaluation and `gpt-5-chat-latest` for tailoring unless overridden by env vars
