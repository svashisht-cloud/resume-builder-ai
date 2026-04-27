# Architecture — Resume Builder

## Purpose

AI-powered resume tailoring app. A user uploads their resume (PDF, DOCX, or TXT) and pastes a job description. The app runs a 3-step AI pipeline — evaluate → tailor → re-evaluate — and returns an ATS-optimized resume grounded strictly in the original. No content is invented; all tailoring must be traceable to the source resume.

---

## High-Level Overview

```
Browser (unauthenticated)
  └─ / → LandingPage (marketing + Google OAuth sign-in)
       └─ Google OAuth → Supabase → /auth/callback → /dashboard

Browser (authenticated)
  └─ /dashboard → AppNavbar + DashboardShell (form state) + useTailorResume (AI/fetch state)
       ├─ POST /api/tailor/step1  →  extract text + evaluate original
       ├─ User confirms/selects missing keywords
       ├─ POST /api/tailor/step2  →  generate tailored resume + changelog
       ├─ POST /api/tailor/step3  →  evaluate tailored resume + score delta
       ├─ POST /api/export-pdf    →  download PDF (React-PDF)
       └─ POST /api/export-docx   →  download DOCX (docx library)

All AI calls go through lib/ai/pipeline.ts → OpenAI API
All resume parsing goes through lib/resume/extract-text.ts
Auth state managed by Supabase (Google OAuth) + middleware.ts
```

---

## Folder Structure

```
resume-builder/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root HTML shell (Space Grotesk + Inter + JetBrains Mono fonts, CSS vars, metadata)
│   ├── globals.css             # Tailwind v4 @theme inline tokens + keyframes; imports themes.css; :root holds only --forte-ink/paper/stone; crimson ramp crimson-100…700 in @theme inline; forte document tokens invariant
│   ├── themes.css              # 16 CSS blocks — 8 palettes × 2 modes using [data-theme-id="<id>"] selectors; tightened chrome ramps; themes 1–4 use monochromatic chrome with same-family secondary accents; themes 5–8 keep tinted chrome
│   ├── page.tsx                # Root — shows LandingPage or redirects to /dashboard if signed in
│   ├── (legal)/
│   │   ├── layout.tsx          # Shared legal layout — PublicHeader + Footer; no width constraint (each page manages its own max-width)
│   │   ├── terms/page.tsx      # /terms — full Termly 27-section ToS; collapsible accordion layout (one <details> per section, collapsed by default)
│   │   ├── privacy/page.tsx    # /privacy — placeholder; max-w-3xl single column
│   │   └── refund-policy/page.tsx  # /refund-policy — placeholder; max-w-3xl single column
│   ├── dashboard/
│   │   └── page.tsx            # Protected dashboard — fetches profile, renders AppNavbar + DashboardShell
│   ├── settings/
│   │   └── page.tsx            # Protected settings — vertical stack: profile (avatar+email+member-since), current plan label, credits, switch plan, usage, danger zone
│   ├── auth/
│   │   └── callback/route.ts   # GET /auth/callback — exchanges OAuth code for session, redirects to /dashboard
│   └── api/
│       ├── auth/
│       │   └── signout/route.ts# POST /api/auth/signout — signs out and redirects to /
│       ├── admin/
│       │   ├── grant-credits/route.ts  # POST /api/admin/grant-credits — auth+admin check, calls admin_grant_credits RPC
│       │   └── disable-user/route.ts   # POST /api/admin/disable-user — auth+admin check, calls disable_user RPC
│       ├── tailor/
│       │   ├── route.ts        # POST /api/tailor — full pipeline in one call (legacy/test path)
│       │   ├── route.test.ts   # Vitest tests for the combined route
│       │   ├── step1/route.ts  # POST /api/tailor/step1 — extract + evaluate original; Pro-aware isPaidCredit; P0004 → fair_use_limit_reached
│       │   ├── step2/route.ts  # POST /api/tailor/step2 — generate tailored resume; threads timing data
│       │   ├── step3/route.ts  # POST /api/tailor/step3 — evaluate tailored + score; logs to pipeline_runs
│       │   └── regen-init/route.ts  # POST /api/tailor/regen-init — gates regen; P0004 → fair_use_limit_reached
│       ├── billing/
│       │   ├── mock-purchase/route.ts  # POST /api/billing/mock-purchase — credits (resume_pack/plus) or Pro subscription (pro_monthly/pro_annual); 404 without ENABLE_MOCK_PAYMENTS
│       │   ├── mock-cancel/route.ts    # POST /api/billing/mock-cancel — calls cancel_subscription RPC; 404 without ENABLE_MOCK_PAYMENTS
│       │   └── payment-history/route.ts
│       ├── export-pdf/route.ts # POST /api/export-pdf — render PDF via React-PDF
│       └── export-docx/route.ts# POST /api/export-docx — render DOCX via docx library
│
├── components/
│   ├── PublicHeader.tsx        # Client component — sticky public nav (Logo + Pricing link + Sign In → AuthModal); used on /pricing and legal pages
│   ├── Footer.tsx              # Server component — 4-column footer (Product, Company, Legal, Support) + logo/copyright; used on /pricing and legal pages
│   ├── DashboardShell.tsx      # PRIMARY UI: 3-panel sliding layout; Regenerate button gated only by regen_count >= 5 (isPaidCredit gate removed); Style button still requires isPaidCredit
│   ├── ThemeSync.tsx           # Null-render client component that calls useThemeSync — mounted in root layout for cross-device sync
│   ├── AppNavbar.tsx           # Authenticated top nav — forte mark icon + "Resume Builder" text label, avatar, z-10 nav (backdrop-blur stacking fix), dropdown with Settings + Sign Out
│   ├── LandingPage.tsx         # Marketing page — full-viewport hero with InteractiveHeroPreview (static resume card) + trust badges (✓ No credit card, ✓ Cancel anytime, ⚡ Instant results) + stats row (12k+ Users, 94% Pass rate, 30s Avg time); How It Works with HeroTrailer + explainer card (product-focused copy, no animation badge) and TiltCard step cards; Testimonials; Pricing; footer
│   ├── AuthModal.tsx           # Google OAuth modal — always mounted, data-state open/closed CSS transition (scale+fade), ToS line; uses horizontal logo at h-9
│   ├── EditableName.tsx        # Inline-editable display name field
│   ├── DeleteAccountButton.tsx # Danger zone delete button (used on settings page)
│   ├── ResumePreview.tsx       # Web HTML resume renderer — accepts resumeStyle?: ResumeStyle for dynamic font/size/spacing; supports interactiveMode
│   ├── ResumePDFDocument.tsx   # React-PDF resume document — accepts resumeStyle?: ResumeStyle; makeStyles() factory produces dynamic StyleSheet
│   ├── landing/
│   │   ├── InteractiveHeroPreview.tsx # Static hero resume card — mobile: ATS Score horizontal strip (Before 63 amber | +31 pts | After 94 green) appears ABOVE resume for dashboard feel; desktop: ATS vertical card sits beside resume (sm:flex-row, self-center); resume max-w-[380px] with accent top border, contact icons, skills (accent-highlighted), experience (success-highlighted bullets), education
│   │   ├── TiltCard.tsx        # Client component — Stripe-style 3D perspective tilt wrapper; tracks cursor position, applies rotateX/rotateY + scale on hover; directional border highlight (thin 1.5px accent line, intensity proportional to cursor proximity to each edge, no shadow blur); glare overlay follows cursor; spring-back on leave; respects prefers-reduced-motion; used for How It Works step cards
│   │   ├── ResumeTransformSection.tsx # Scroll-driven transformation section (currently unused/removed from LandingPage); sticky resume transforms across 4 phases as user scrolls; maxScrollProgress one-way latch; preserved on disk for later use
│   │   ├── HeroTrailer.tsx     # Animated product trailer reused in How It Works; prefersReducedMotion → static
│   │   └── Testimonials.tsx    # Snap carousel with 6 cards, stars, Quote watermark, chevrons, dots
│   ├── pricing/
│   │   ├── PricingCards.tsx    # Three-card grid: Free / Pro (monthly+annual toggle, Most Popular/Best Value badge) / Resume Pack ($9, Pack Plus as upsell link). Props: currentPlan?, onAuthRequired?. Internal auth check via createClient(). Cancel plan button for Pro users.
│   │   └── PublicPricingCards.tsx  # Thin wrapper for public /pricing page; passes onAuthRequired → router.push('/dashboard')
│   └── settings/
│       ├── AvatarImage.tsx     # Client component — plain <img> with referrerPolicy + onError initials fallback
│       ├── ThemeSection.tsx    # Self-fetching client component — palette grid (8 cards) + Dark/Light mode toggle; optimistic writes to profiles.theme_id/theme_mode + cookies
│       └── SwitchPlanSection.tsx # Self-fetching client component — reads plan_type/plan_status from profiles, passes currentPlan to PricingCards; heading "Manage Plan"
│
├── lib/
│   ├── themes/
│   │   ├── registry.ts         # THEMES array (8 entries), DEFAULT_THEME_ID/MODE (charcoal-periwinkle/light), isValidThemeId/isValidThemeMode
│   │   ├── client.ts           # Browser utilities: applyTheme(id, mode), getCurrentTheme() — writes cookies + html data attrs
│   │   └── use-theme-sync.ts   # useThemeSync hook — on mount, fetches profile theme_id/theme_mode and calls applyTheme if diverged
│   ├── ai/
│   │   ├── client.ts           # Lazy OpenAI singleton + model name constants (AI_EVAL_MODEL, AI_TAILOR_MODEL)
│   │   ├── pipeline.ts         # Core AI functions: evaluate, tailor, re-evaluate, render text; includes project preservation
│   │   └── prompts.ts          # System prompts + user prompt builders for all 3 AI calls
│   ├── hooks/
│   │   └── useTailorResume.ts  # Custom React hook: all tailoring fetch logic, AbortController, all AI state; handles fair_use_limit_reached (402 P0004); paid_credit_required handler removed
│   ├── supabase/
│   │   ├── client.ts           # Browser Supabase client (createBrowserClient via @supabase/ssr)
│   │   ├── server.ts           # Server Supabase client (createServerClient, cookie-based session)
│   │   └── admin.ts            # Service-role admin client (lazy singleton; NEVER import client-side)
│   ├── errors.ts               # Shared isClientError() helper
│   └── resume/
│       ├── extract-text.ts     # Parse PDF/DOCX/TXT → plain text string
│       ├── detect-section-order.ts  # Regex scan of raw resume text → ordered SectionKey[]
│       ├── docx-document.ts    # Build DOCX file from TailoredResume; accepts ResumeStyle param
│       └── filename.ts         # Generate slugified export filename
│
├── types/
│   ├── resume.ts               # All Zod schemas + inferred TypeScript types (source of truth)
│   ├── resume-style.ts         # ResumeStyle interface + ResumeStyleSchema (Zod) + DEFAULT_RESUME_STYLE
│   ├── api.ts                  # TailorResponse API response type
│   └── index.ts                # Re-exports from resume.ts, resume-style.ts, and api.ts
│
├── .claude/
│   ├── agents/
│   │   ├── implementer.md      # Claude Code sub-agent: writes features
│   │   └── reviewer.md         # Claude Code sub-agent: audits changes
│   └── plans/                  # Saved plan files from plan-mode sessions
│
├── supabase/
│   └── migrations/
│       ├── 20260416000000_initial_schema.sql           # profiles table + RLS policies + triggers
│       ├── 20260419000000_credits_payments_resumes.sql # credits, payments, resumes tables + spend_credit, mock_purchase_credits RPCs
│       ├── 20260420000000_fix_regen_count_ambiguous.sql
│       ├── 20260420000001_start_or_regen_fresh_flag.sql
│       ├── 20260421000000_regen_requires_paid_credit.sql
│       ├── 20260421000001_restore_credit_on_failure.sql
│       ├── 20260422000000_admin_dashboard.sql
│       ├── 20260422000001_pipeline_runs_fk_profiles.sql
│       └── 20260424000000_subscription_support.sql     # Pro plan columns + activate/cancel/reset_monthly_usage RPCs + updated start_or_regen_resume + Pro-aware restore_credit
│
├── middleware.ts               # Edge middleware — auth check, disabled_at check, admin route guard
├── CLAUDE.md                   # Instructions for Claude Code agents
├── ARCHITECTURE.md             # This file
├── TASKS.md                    # Active and completed work items
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
└── vitest.config.ts
```

---

## Tech Stack & Key Dependencies

| Package | Version | Role |
|---------|---------|------|
| `next` | 16.2.3 | App Router framework — API routes + React server/client components |
| `react` / `react-dom` | 19.2.4 | UI rendering |
| `typescript` | ^5 | Language |
| `tailwindcss` | ^4 | Utility CSS (PostCSS plugin, no tailwind.config.ts needed in v4) |
| `openai` | ^6.34.0 | OpenAI SDK — structured outputs via `zodResponseFormat` |
| `zod` | 4.3.6 | Schema validation for all AI responses and API payloads |
| `@react-pdf/renderer` | 4.3.3 | Server-side PDF generation from React components |
| `docx` | ^9.6.1 | DOCX generation (paragraphs, tabs, borders, hyperlinks) |
| `mammoth` | ^1.12.0 | Extract raw text from .docx uploads |
| `pdf-parse` | ^2.4.5 | Extract raw text from .pdf uploads (loaded dynamically due to Node.js 18 DOMMatrix issue) |
| `@supabase/supabase-js` | ^2 | Supabase client SDK |
| `@supabase/ssr` | ^0.6 | SSR-safe Supabase helpers for Next.js App Router (cookie-based sessions) |
| `lucide-react` | latest | Icon library |
| `vitest` | ^4.1.4 | Unit test runner |

---

## Configuration Files

| File | Controls |
|------|---------|
| `next.config.ts` | Minimal Next.js config — no custom settings currently |
| `tsconfig.json` | TypeScript: `target: ES2017`, strict mode, `@/*` → root path alias, `allowJs: true` |
| `eslint.config.mjs` | ESLint with `eslint-config-next` |
| `postcss.config.mjs` | Tailwind v4 PostCSS plugin |
| `vitest.config.ts` | Node.js test environment, `@` path alias mirroring tsconfig |
| `.env.local` | Runtime secrets (not committed) |
| `.env.local.example` | Template showing required env vars |

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | Yes | — | OpenAI credentials |
| `OPENAI_EVAL_MODEL` | No | `gpt-4.1-mini` | Model for resume evaluation (steps 1 & 3) |
| `OPENAI_TAILOR_MODEL` | No | `gpt-5-chat-latest` | Model for resume generation (step 2) |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | — | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | — | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | — | Admin operations — service-role client; never expose to client |
| `ENABLE_MOCK_PAYMENTS` | No | — | Set to `true` to enable `POST /api/billing/mock-purchase` and `mock-cancel` in production; also shows warning banner in dashboard/settings |
| `UPSTASH_REDIS_REST_URL` | No | — | Upstash Redis REST endpoint for rate limiting. If absent, rate limiting is disabled (local dev safe). |
| `UPSTASH_REDIS_REST_TOKEN` | No | — | Upstash Redis REST token. Required together with `UPSTASH_REDIS_REST_URL`. |

---

## Data Flow

### 3-Step Pipeline (production path)

```
1. User uploads resume file + pastes JD text
   │
   ▼
POST /api/tailor/step1
   ├─ extractResumeText(file)         → plain text string
   ├─ start_or_regen_resume RPC       → credit/Pro gate; returns (resumeId, isRegen, regenCount)
   ├─ evaluateResumeAgainstJDRaw()    → ResumeEvaluation (score, gaps, matchedAreas, missingAreas)
   └─ Response: { resumeText, originalEvaluation, resumeId, isRegen, regenCount, isPaidCredit }
   │
   ▼ Frontend shows initial ATS score + keyword chips (missingAreas or gaps)
   │
   User selects any confirmed missing skills → selectedKeywords[]
   │
   ▼
POST /api/tailor/step2
   ├─ generateTailoredResumeFromRaw() → TailoredResume + ChangeLog
   └─ Response: { tailoredResume, changeLog }
   │
   ▼
POST /api/tailor/step3
   ├─ evaluateTailoredResumeAgainstJDRaw() → tailoredEvaluation
   ├─ buildScoreComparison(original, tailored) → { before, after, delta }
   └─ Response: full TailorResponse
   │
   ▼ Frontend renders score comparison, changelog, resume preview card
   │
   User downloads:
   ├─ POST /api/export-pdf  → renderToBuffer(ResumePDFDocument) → binary PDF
   └─ POST /api/export-docx → buildDocxDocument(tailoredResume) → binary DOCX
```

### Credit lifecycle

**Pro users bypass the credit table entirely:**
```
1. New JD   → start_or_regen_resume: insert resume row + increment plan_monthly_usage
              → Fair-use cap: 100/month (P0004 → fair_use_limit_reached 402)
              → restore_credit: decrements plan_monthly_usage within 5-min window

2. Regen    → start_or_regen_resume: check regen_count (P0002 if >= 5)
              → No monthly_usage increment for regen (only for new JD / force_fresh)

3. Force-fresh → reset regen_count=0 + increment plan_monthly_usage
```

**Credit users (free + pack):**
```
1. Signup   → handle_new_user trigger inserts 1 credit (free_signup, 12-month expiry)
              → credits_refresh_count trigger sets profiles.credits_remaining = 1

2. Purchase → POST /api/billing/mock-purchase → mock_purchase_credits RPC
              → inserts payment row + N credit rows (3 for resume_pack, 10 for plus)
              → trigger fires, credits_remaining updated

3. New tailoring (new JD hash)
              → start_or_regen_resume: insert resume row + call spend_credit
              → spend_credit: FIFO by expiry, marks credit spent_at = now()
              → trigger fires, credits_remaining decremented
              → step1 returns { resumeId, isRegen: false, regenCount: 0 }
              → if AI pipeline errors after deduction: restore_credit(resumeId) called
                → sets spent_at = null within 5-min safety window
                → trigger fires, credits_remaining restored

4. Regeneration (same JD hash, regen_count < 5)
              → start_or_regen_resume: checks P0002 only (P0003 removed — all credits allow regen)
              → increments regen_count, no credit spent
              → regen-init returns { resumeId, regenCount: 1 through 5 }

5. Regen limit (regen_count >= 5)
              → start_or_regen_resume raises P0002 → regen-init returns 403 regen_limit_reached
              → UI shows "Limit reached (5/5)" badge

6. No credits (credits_remaining = 0 and new JD)
              → spend_credit raises P0001 → step1 returns 402 no_credits
              → NoCreditsModal shown; user directed to /settings
```

**Error codes:**
- `P0001` → `no_credits` (402) — no credits available
- `P0002` → `regen_limit_reached` (403) — regen_count >= 5
- `P0004` → `fair_use_limit_reached` (402) — Pro user at 100 resumes/month
- ~~`P0003`~~ — removed; `paid_credit_required` no longer exists

---

## Database Schema

### `profiles` (auto-created on signup via `handle_new_user` trigger)

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | FK → auth.users |
| `display_name` | text | From Google OAuth full_name |
| `email` | text | |
| `avatar_url` | text | |
| `dodo_customer_id` | text | Reserved for real Dodo integration |
| `credits_remaining` | int not null default 0 | Cache kept in sync by `credits_refresh_count` trigger |
| `created_at` | timestamptz | |
| `plan_type` | text not null default 'free' | `free` / `pro_monthly` / `pro_annual` |
| `plan_status` | text not null default 'inactive' | `active` / `inactive` / `cancelled` / `past_due` |
| `plan_current_period_end` | timestamptz | Pro subscription period end; null = no period limit |
| `plan_monthly_usage` | int not null default 0 | Resumes generated this billing cycle (Pro only) |
| `plan_usage_reset_at` | timestamptz | When monthly_usage was last reset to 0 |
| `theme_id` | text not null default 'charcoal-periwinkle' | Selected palette; check constraint lists all 8 valid IDs |
| `theme_mode` | text not null default 'light' | `dark` or `light` |

### `resumes` (server-side only — no client insert/update policy)

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `user_id` | uuid | FK → auth.users |
| `job_description_hash` | text | SHA-256 of normalised JD text |
| `job_title` | text | Extracted from JD (nullable) |
| `company_name` | text | Extracted from JD (nullable) |
| `regen_count` | int default 0 | Incremented on each regen; capped at 5 |
| `created_at` | timestamptz | |
| `last_generated_at` | timestamptz | Updated on every regen |

Unique constraint: `(user_id, job_description_hash)`. RLS: select-only.

### `payments`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `user_id` | uuid | FK → auth.users |
| `dodo_payment_id` | text unique | `mock_<uuid>` during mock phase |
| `product` | text | `resume_pack` or `resume_pack_plus` (CHECK constraint — Pro products do NOT insert here) |
| `amount_cents` | int | |
| `currency` | text default `usd` | |
| `credits_granted` | int | 3 or 10 |
| `status` | text | `succeeded` / `refunded` / `disputed` |
| `paid_at` | timestamptz | |

RLS: select-only.

### `credits` (one row per credit)

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `user_id` | uuid | FK → auth.users |
| `source` | text | `free_signup` / `resume_pack` / `resume_pack_plus` / `admin_grant` |
| `payment_id` | uuid | FK → payments (nullable) |
| `granted_at` | timestamptz | |
| `expires_at` | timestamptz | 12 months from grant |
| `spent_at` | timestamptz | null = unspent |
| `spent_on_resume_id` | uuid | FK → resumes (nullable) |

Partial index: `(user_id, expires_at) where spent_at is null`. RLS: select-only.

### Trigger: `credits_refresh_count`

Fires `after insert or update or delete` on `credits`. Calls `refresh_credits_remaining()` which recomputes `count(*) where spent_at is null and expires_at > now()` and writes it to `profiles.credits_remaining`.

### Key RPCs (all `security definer`)

| RPC | Purpose |
|-----|---------|
| `spend_credit(p_resume_id)` | FIFO by expiry, `for update skip locked`; raises `P0001` if no credits |
| `start_or_regen_resume(p_jd_hash, p_job_title, p_company_name, p_force_fresh)` | **Pro path**: no credit spend; atomic fair-use increment (P0004 if >= 100); P0002 regen cap. **Credit path**: P0003 removed — free credits allow regen; P0001 if no credits; P0002 regen cap. Returns `(resume_id, is_regen, regen_count)` |
| `restore_credit(p_resume_id)` | **Pro path**: decrements `plan_monthly_usage` within 5-min window (uses `resumes.last_generated_at`). **Credit path**: sets `spent_at = null` within 5-min window. |
| `mock_purchase_credits(p_product)` | Inserts payment + N credit rows for `resume_pack`/`resume_pack_plus`. **Remove when real Dodo lands.** |
| `activate_subscription(p_user_id, p_plan_type, p_period_end)` | Sets Pro plan columns; `plan_status='active'`, resets `plan_monthly_usage=0`. Caller must be `p_user_id`. |
| `cancel_subscription(p_user_id)` | Sets `plan_status='cancelled'`; `plan_type` and `plan_current_period_end` unchanged — user retains Pro access until period end. Caller must be `p_user_id`. |
| `reset_monthly_usage(p_user_id)` | Resets `plan_monthly_usage=0` and `plan_usage_reset_at=now()`. Service-role only (called on billing renewal). |

---

## Entry Points & Routing

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/` | GET | Public | Landing page; redirects to `/dashboard` if signed in |
| `/pricing` | GET | Public | Standalone pricing page — PricingCards + FAQ; CTA routes to `/dashboard` |
| `/terms` | GET | Public | Terms of Service — full Termly 27-section ToS; collapsible accordion layout (one section per heading, collapsed by default) |
| `/privacy` | GET | Public | Privacy Policy |
| `/refund-policy` | GET | Public | Refund Policy |
| `/dashboard` | GET | Required | Main app — AppNavbar + DashboardShell |
| `/settings` | GET | Required | Profile settings — profile, plan label, credits, manage plan, usage, danger zone |
| `/auth/callback` | GET | Public | OAuth code exchange → session → redirect to `/dashboard` |
| `/api/auth/signout` | POST | Public | Signs out, redirects to `/` |
| `/api/tailor/step1` | POST | **Required** | Main tailoring step; P0001→402 no_credits, P0002→403 regen_limit_reached, P0004→402 fair_use_limit_reached |
| `/api/tailor/regen-init` | POST | **Required** | Regen gate; same error codes as step1 |
| `/api/tailor/step2` | POST | Required | JSON: tailoring generation |
| `/api/tailor/step3` | POST | Required | JSON: re-evaluation + score |
| `/api/tailor` | POST | Public | FormData (same as step1) — full pipeline in one call |
| `/api/export-pdf` | POST | Required | JSON: `tailoredResume`, `role?` → binary PDF |
| `/api/export-docx` | POST | Required | JSON: `tailoredResume`, `role?` → binary DOCX |
| `/api/billing/mock-purchase` | POST | Required | JSON: `{ product }` — `resume_pack`/`resume_pack_plus` → credits; `pro_monthly`/`pro_annual` → `activate_subscription`; 404 without `ENABLE_MOCK_PAYMENTS=true` |
| `/api/billing/mock-cancel` | POST | Required | Calls `cancel_subscription`; 404 without `ENABLE_MOCK_PAYMENTS=true` |
| `/admin/overview` | GET | Admin | KPI dashboard |
| `/admin/users` | GET | Admin | User management |
| `/admin/users/[id]` | GET | Admin | User detail + actions |
| `/admin/analytics` | GET | Admin | Charts and top users |
| `/admin/credits` | GET | Admin | Credit ledger |
| `/admin/system` | GET | Admin | Cost and error monitoring |
| `/api/admin/grant-credits` | POST | Admin | Grant credits to a user |
| `/api/admin/disable-user` | POST | Admin | Disable a user account |

---

## Pricing Tiers

| Tier | Price | Resume allowance | Regen limit |
|------|-------|-----------------|-------------|
| Free | $0 | 1 (one free credit) | 5 per resume |
| Resume Pack | $9 one-time | 3 credits | 5 per resume |
| Resume Pack Plus | $19 one-time | 10 credits | 5 per resume |
| Pro Monthly | $12/month | 100/month (fair use) | 5 per resume |
| Pro Annual | $79/year | 100/month (fair use) | 5 per resume |

Pack Plus is not shown as a primary card in `PricingCards.tsx` — it surfaces as an upsell link inside the Resume Pack card ("10 credits for $19").

---

## Known TODOs

- **Replace `mock_purchase_credits` / mock routes with real Dodo webhook handler** — the RPCs and billing mock routes are scaffolding only. When Dodo is wired, delete the mock routes, add a webhook handler that verifies signatures and calls `spend_credit` / `activate_subscription` equivalents.
- **Add refund handling when Dodo integration lands** — `payments` table has `status` and `refunded_at` columns ready.
- **Navbar credit count is not live-updated after mock purchase** — dashboard navbar requires a full page reload.
- **Regenerate Supabase types after running migration 20260424** — admin pages use `getAdminClient() as any` because the generated types in `types/supabase.ts` predate several columns. Run `supabase gen types typescript --project-id <id> > types/supabase.ts`.
- **Recharts adds ~300KB to the JS bundle** — currently loaded only inside `app/admin/` which is not user-facing.

---

## Admin Dashboard (MR-7)

### Access control
- `middleware.ts` checks `disabled_at` on every protected route (`/dashboard`, `/settings`, `/admin`). Disabled users are signed out and redirected to `/?reason=disabled`.
- `app/admin/layout.tsx` re-verifies `is_admin` via the SSR client. Non-admins redirect to `/dashboard`.
- Both API routes independently re-check `is_admin` before calling any RPC.

### `pipeline_runs` table
Logs every AI pipeline execution. RLS enabled with no policies (service-role access only).

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `user_id` | uuid | FK → auth.users |
| `resume_id` | uuid | FK → resumes (nullable) |
| `is_regen` | boolean | |
| `step1_duration_ms` | int | |
| `step2_duration_ms` | int | |
| `step3_duration_ms` | int | |
| `total_duration_ms` | int | |
| `score_before` | int | |
| `score_after` | int | |
| `score_delta` | int | after − before |
| `tokens_eval1` | int | |
| `tokens_tailor` | int | |
| `tokens_eval2` | int | |
| `estimated_cost_usd` | numeric(8,5) | |
| `error_step` | text | 'step1'/'step2'/'step3' if failed |
| `error_code` | text | Error message |
| `created_at` | timestamptz | |
