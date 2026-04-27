# Architecture - Resume Builder

## Purpose

Forte is an AI-powered resume tailoring app. A user uploads a resume (`.pdf`, `.docx`, or `.txt`) and pastes a job description. The app runs a 3-step AI pipeline:

`evaluate -> tailor -> re-evaluate`

The tailored output must remain truthful and evidence-grounded in the source resume. The app then renders recruiter-friendly HTML preview output and exports aligned PDF and DOCX files.

---

## High-level overview

```text
Browser (unauthenticated)
  -> / -> LandingPage
       -> Google OAuth -> Supabase -> /auth/callback -> /dashboard

Browser (authenticated)
  -> /dashboard -> AppNavbar + DashboardShell + useTailorResume
       -> POST /api/tailor/step1   extract + evaluate original
       -> user confirms missing keywords
       -> POST /api/tailor/step2   generate tailored resume + changelog
       -> POST /api/tailor/step3   evaluate tailored + score comparison
       -> POST /api/export-pdf     render PDF
       -> POST /api/export-docx    render DOCX

All AI calls go through lib/ai/pipeline.ts
All upload parsing goes through lib/resume/extract-text.ts
Auth is Supabase SSR cookie auth
Protected routes are guarded by middleware.ts and server checks
```

---

## Current app surfaces

### Public
- `/` marketing landing page
- `/pricing`
- `/terms`
- `/privacy`
- `/refund-policy`

### Protected
- `/dashboard`
- `/settings`
- `/admin/*`

### API
- `/api/tailor/*`
- `/api/export-pdf`
- `/api/export-docx`
- `/api/billing/mock-*`
- `/api/admin/*`

---

## Folder structure

```text
resume-builder/
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── themes.css
│   ├── page.tsx
│   ├── pricing/page.tsx
│   ├── dashboard/page.tsx
│   ├── settings/page.tsx
│   ├── auth/callback/route.ts
│   ├── admin/*
│   ├── api/tailor/*
│   ├── api/export-pdf/route.ts
│   ├── api/export-docx/route.ts
│   ├── api/billing/*
│   └── (legal)/*
├── components/
│   ├── LandingPage.tsx
│   ├── AppNavbar.tsx
│   ├── DashboardShell.tsx
│   ├── ResumePreview.tsx
│   ├── ResumePDFDocument.tsx
│   ├── Footer.tsx
│   ├── PublicHeader.tsx
│   ├── ThemeSync.tsx
│   ├── landing/*
│   ├── pricing/*
│   └── settings/*
├── lib/
│   ├── ai/*
│   ├── resume/*
│   ├── supabase/*
│   ├── themes/*
│   ├── hooks/*
│   └── ratelimit.ts
├── types/*
├── supabase/migrations/*
├── middleware.ts
├── AGENTS.md
├── RULES.md
├── TASKS.md
├── ARCHITECTURE_SUMMARY.md
└── ARCHITECTURE.md
```

---

## Route and page architecture

### `/`
- Server route in `app/page.tsx`
- Shows `LandingPage` for signed-out users
- Redirects signed-in users to `/dashboard`

### Landing page
- `components/LandingPage.tsx`
- Sticky public navbar at top
- Resume-first hero with:
  - left column: headline, copy, CTA buttons, proof chips, stats
  - right column: `InteractiveHeroPreview`
- How It Works section:
  - section eyebrow and left-aligned heading
  - `HeroTrailer` inside a quieter framed panel
  - explainer card describing the evidence-grounded workflow
  - 3 tilt cards using `TiltCard`
- Customer Reviews section:
  - `Testimonials`
  - mobile arrows below the card
  - side arrows on `sm+`
- Pricing section:
  - shared header treatment with narrower pricing-card wrapper
  - `PricingCards`
- Footer:
  - four link columns
  - shorter brand sentence row underneath

### `/pricing`
- Uses `PublicHeader`, `PublicPricingCards`, FAQ content, and `Footer`
- Shares the same pricing card system as landing/settings

### Legal pages
- Located under `app/(legal)/`
- Shared public shell with page-owned width constraints
- `/terms`, `/privacy`, and `/refund-policy` all use accordion-style content sections

### `/dashboard`
- Protected page
- Fetches profile data server-side
- Renders `AppNavbar` + `DashboardShell`
- Passes theme-independent profile state including credits and experience level

### `/settings`
- Protected page
- Server-fetched profile state
- Contains plan, credits, usage, theme selector, experience level selector, and account actions

### `/admin/*`
- Protected by middleware and layout re-checks
- Admin routes and APIs independently re-check `is_admin`

---

## Main UI components

### `LandingPage`
- Main public marketing surface
- Owns auth modal open state
- Uses `Sora` only for the textual `forte` wordmark in the public navbar
- Uses landing utility classes from `app/globals.css`:
  - `.landing-kicker`
  - `.landing-eyebrow`
  - `.landing-panel`
  - `.landing-panel-quiet`
  - `.landing-section-glow`

### `InteractiveHeroPreview`
- Static fictional resume card used only on landing
- Uses theme-aware shell gradients and a white recruiter-style document interior
- Mobile layout:
  - resume card first
  - ATS score footer attached beneath the resume
- Desktop layout:
  - resume card plus narrow ATS side card
- No longer uses the earlier hover-driven ATS animation/callout behavior

### `HeroTrailer`
- Animated product walkthrough reused inside How It Works
- Lives outside the hero now

### `TiltCard`
- Reusable landing interaction wrapper
- Applies 3D tilt on hover
- Border-lighting behavior is localized to the nearest edges and corners
- No shadow or glare overlay remains
- Respects `prefers-reduced-motion`

### `Testimonials`
- Customer review carousel
- 1, 2, or 3 visible cards depending on container width
- Dots represent stop positions
- Mobile arrows are below the track to preserve card width

### `PricingCards`
- Shared pricing surface for landing, pricing page, and settings
- Plans:
  - Free
  - Pro with monthly/annual toggle
  - Resume Pack with Pack Plus upsell link
- Uses mock purchase and cancel routes
- Hides the Free card for active Pro users

### `DashboardShell`
- Primary tailoring UI
- Coordinates upload, gap confirmation, tailoring, re-score, regeneration, export, and style controls

### `ResumePreview`
- HTML renderer for the tailored resume
- Recruiter-facing canonical preview

### `ResumePDFDocument`
- React-PDF renderer
- Must remain layout-aligned with the HTML preview

---

## AI pipeline

### Source of truth
- Raw resume text
- Raw job description text

### Order
1. Evaluate original resume against JD
2. Generate tailored structured resume from raw resume + raw JD + user-confirmed inputs
3. Re-evaluate tailored resume against the same raw JD

### Key files
- `lib/ai/client.ts`
- `lib/ai/pipeline.ts`
- `lib/ai/prompts.ts`
- `types/resume.ts`

### Output contracts
- Zod schemas in `types/resume.ts` are authoritative
- Structured output is parsed defensively
- Expected cleanup path includes:
  - markdown fence stripping
  - control-character cleanup
  - extracting the first valid JSON object
  - Zod validation

### Important constraints
- No fabricated claims
- Tailoring must remain grounded
- Refinement/regeneration can only build on the tailored resume plus grounded user feedback

---

## Tailoring data flow

```text
Upload resume + paste JD
  -> POST /api/tailor/step1
     - extract text
     - credit / plan gate
     - evaluate original
  -> dashboard shows original score + missing areas
  -> user confirms missing keywords
  -> POST /api/tailor/step2
     - generate TailoredResume + changeLog
  -> POST /api/tailor/step3
     - evaluate tailored output
     - build scoreComparison
  -> ResumePreview / PDF / DOCX
```

### `step1`
- Parses uploaded file into plain text
- Calls `start_or_regen_resume`
- Returns:
  - `resumeText`
  - `originalEvaluation`
  - `resumeId`
  - `isRegen`
  - `regenCount`
  - gate-related flags

### `step2`
- Accepts raw resume text, raw JD, selected keywords, experience-level metadata, and length target
- Returns structured tailored resume plus changelog

### `step3`
- Re-scores the tailored resume
- Builds before/after comparison payload

---

## Resume parsing and rendering

### Parsing
- `lib/resume/extract-text.ts`
- Supports:
  - `.txt`
  - `.pdf`
  - `.docx`

### Renderer alignment rules
- HTML preview, PDF, and DOCX should stay aligned in:
  - section order
  - role subtitle behavior
  - experience row layout
  - inline project URL behavior
  - contact fields

### Deterministic formatting helpers
- `lib/resume/detect-section-order.ts`
- `lib/resume/docx-document.ts`
- `components/ResumePreview.tsx`
- `components/ResumePDFDocument.tsx`

---

## Theme system

### Current shape
- HTML data attributes drive the active theme
- Cookies persist the current theme for SSR
- Profile fields persist the user's chosen theme
- `ThemeSync` reconciles profile state and current HTML/cookie state client-side

### Theme source files
- `lib/themes/registry.ts`
- `lib/themes/client.ts`
- `lib/themes/use-theme-sync.ts`
- `components/ThemeSync.tsx`
- `components/settings/ThemeSection.tsx`
- `app/themes.css`
- `app/globals.css`

### Current defaults
- `theme_id = charcoal-periwinkle`
- `theme_mode = light`

### Invariant document tokens
- `--forte-ink`
- `--forte-paper`
- `--forte-stone`

These must not change with app theme selection.

---

## Billing, credits, and plans

### Product model
- Free: 1 tailored resume
- Resume Pack: 3 credits
- Resume Pack Plus: 10 credits
- Pro Monthly / Pro Annual: 100 resumes per month fair-use cap

### Current implementation state
- Billing routes are still mock/scaffold routes
- Real Dodo integration is not complete yet

### Important behavior
- Fresh tailoring spends a credit for free/pack users
- Regen does not spend a new credit
- Regen limit is 5 per resume
- Pro usage is tracked with `plan_monthly_usage`
- `restore_credit` compensates for AI failures after a spend event

### RPC errors
- `P0001 -> no_credits`
- `P0002 -> regen_limit_reached`
- `P0004 -> fair_use_limit_reached`

`P0003` / `paid_credit_required` has been removed and should not be reintroduced.

---

## Database summary

### `profiles`
Stores:
- identity fields
- `credits_remaining`
- plan fields
- `theme_id`
- `theme_mode`
- `experience_level`
- admin flags such as `is_admin`
- disable state via `disabled_at`

### `resumes`
Stores:
- user-owned resume/JD run records
- regeneration count
- normalized JD hash behavior for reuse/regeneration

### `credits`
- one row per credit
- FIFO spend behavior
- expiry-aware

### `payments`
- mock payment records

### `pipeline_runs`
- admin telemetry for usage, errors, and cost reporting

---

## Auth and security model

### Auth
- Google OAuth through Supabase
- Session established through `/auth/callback`
- SSR cookie-based auth clients on server routes/pages

### Protected route enforcement
- `middleware.ts` guards `/dashboard`, `/settings`, and `/admin`
- middleware also blocks disabled users
- admin pages re-check `is_admin`
- admin API routes re-check `is_admin`

### Important note
- Next.js currently warns that the `middleware` file convention is deprecated in favor of `proxy`
- The app still builds and works with `middleware.ts` today, but the rename remains a cleanup task

---

## Export system

### Routes
- `POST /api/export-pdf`
- `POST /api/export-docx`

### Libraries
- PDF: `@react-pdf/renderer`
- DOCX: `docx`

### Constraints
- Exports must stay authenticated
- Exports must remain rate-limited
- Exported content must stay aligned with the HTML preview

---

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `OPENAI_API_KEY` | Yes | OpenAI credentials |
| `OPENAI_EVAL_MODEL` | No | Evaluation model, defaults to `gpt-4.1-mini` |
| `OPENAI_TAILOR_MODEL` | No | Tailoring model, defaults to `gpt-5-chat-latest` |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-only admin operations |
| `ENABLE_MOCK_PAYMENTS` | No | Enables mock billing routes |
| `UPSTASH_REDIS_REST_URL` | No | Rate limiting backend |
| `UPSTASH_REDIS_REST_TOKEN` | No | Rate limiting auth token |

If Upstash vars are absent, rate limiting degrades gracefully rather than breaking local development.

---

## Current known gaps / next work

- Real Dodo billing and webhook integration
- Continued evaluator/tailor prompt tuning against real resumes
- `middleware.ts` -> `proxy` migration
- Final legal-content review if needed before launch

---

## Validation commands

- `npm run lint`
- `npm run test`
- `npm run build`

For architecture-changing work, keep `TASKS.md`, `ARCHITECTURE_SUMMARY.md`, and this file in sync.
