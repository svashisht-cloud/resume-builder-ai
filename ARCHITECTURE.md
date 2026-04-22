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
│   ├── globals.css             # Tailwind v4 @theme inline tokens + keyframes (gradient-flow, fade-in-up, fade-in), .animate-gradient-flow utility + print styles
│   ├── page.tsx                # Root — shows LandingPage or redirects to /dashboard if signed in
│   ├── dashboard/
│   │   └── page.tsx            # Protected dashboard — fetches profile, renders AppNavbar + DashboardShell
│   ├── settings/
│   │   └── page.tsx            # Protected settings — vertical stack: profile (avatar+email+member-since), current plan, switch plan, usage, danger zone
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
│       │   ├── step1/route.ts  # POST /api/tailor/step1 — extract + evaluate original; returns timing+token data
│       │   ├── step2/route.ts  # POST /api/tailor/step2 — generate tailored resume; threads timing data
│       │   └── step3/route.ts  # POST /api/tailor/step3 — evaluate tailored + score; logs to pipeline_runs
│       ├── export-pdf/route.ts # POST /api/export-pdf — render PDF via React-PDF
│       └── export-docx/route.ts# POST /api/export-docx — render DOCX via docx library
│
├── components/
│   ├── PublicHeader.tsx        # Client component — sticky public nav (Logo + Pricing link + Sign In → AuthModal); used on /pricing and legal pages
│   ├── Footer.tsx              # Server component — 4-column footer (Product, Company, Legal, Support) + logo/copyright; used on /pricing and legal pages
│   ├── DashboardShell.tsx      # PRIMARY UI: 3-panel sliding layout (idle→Panel1, loading/keyword-selection→Panel2, result/regen-feedback/style-editing→Panel3); holds regenFeedback + selectedItems + resumeStyle state; regen-feedback and style-editing views are 2-column split layouts (left controls + right live ResumePreview); loading spinner uses conic-gradient ring; progress bar: 33% (step1/pending) → 66% (step2) → 90% (step3)
│   ├── AppNavbar.tsx           # Authenticated top nav — forte mark icon + "Resume Builder" text label, avatar, z-10 nav (backdrop-blur stacking fix), dropdown with Settings + Sign Out
│   ├── LandingPage.tsx         # Marketing page — two-col hero (HeroTrailer), How It Works (text-3xl + subtitle), Testimonials, Pricing (text-3xl + "Start for free" subtitle), footer
│   ├── AuthModal.tsx           # Google OAuth modal — always mounted, data-state open/closed CSS transition (scale+fade), ToS line; uses horizontal logo at h-9
│   ├── EditableName.tsx        # Inline-editable display name field
│   ├── DeleteAccountButton.tsx # Danger zone delete button (used on settings page)
│   ├── ResumePreview.tsx       # Web HTML resume renderer — accepts resumeStyle?: ResumeStyle for dynamic font/size/spacing; supports interactiveMode (SelectionCtx, hover/select bullets + skill rows with amber/cyan highlights)
│   ├── ResumePDFDocument.tsx   # React-PDF resume document — accepts resumeStyle?: ResumeStyle; makeStyles() factory produces dynamic StyleSheet; PdfSectionHeader + PdfBulletList take styles prop
│   ├── landing/
│   │   ├── HeroTrailer.tsx     # Animated product trailer: 9-step loop; step 6 full-width ATS 62→94% counter with delta badge; step 7 full-width resume card + download button (fades in at 600ms); file pill + JD textarea use text-sm for readability; prefersReducedMotion → static step 7
│   │   └── Testimonials.tsx    # Snap carousel with 6 cards, stars, Quote watermark, chevrons, dots, clipping fix; heading text-3xl + subtitle
│   ├── pricing/
│   │   └── PricingCards.tsx    # Shared Free/Pack/Plus credit-tier cards (equal height flex-col, "Everything in X" pattern); used on landing + settings
│   └── settings/
│       ├── AvatarImage.tsx     # Client component — plain <img> with referrerPolicy + onError initials fallback
│       └── SwitchPlanSection.tsx # Client wrapper for PricingCards on settings page (alert Coming soon)
│
├── lib/
│   ├── ai/
│   │   ├── client.ts           # Lazy OpenAI singleton + model name constants (AI_EVAL_MODEL, AI_TAILOR_MODEL)
│   │   ├── pipeline.ts         # Core AI functions: evaluate, tailor, re-evaluate, render text; includes project preservation
│   │   └── prompts.ts          # System prompts + user prompt builders for all 3 AI calls
│   ├── hooks/
│   │   └── useTailorResume.ts  # Custom React hook: all tailoring fetch logic, AbortController, all AI state; viewState: idle|loading|keyword-selection|style-editing|regen-feedback|result; accepts resumeStyle?: ResumeStyle (threaded into PDF/DOCX download bodies); isStyleEditingOpen + handleOpenStyleEditing + handleCloseStyleEditing
│   ├── supabase/
│   │   ├── client.ts           # Browser Supabase client (createBrowserClient via @supabase/ssr)
│   │   ├── server.ts           # Server Supabase client (createServerClient, cookie-based session)
│   │   └── admin.ts            # Service-role admin client (lazy singleton; NEVER import client-side)
│   ├── errors.ts               # Shared isClientError() helper — used by tailor route.ts and step1/route.ts
│   └── resume/
│       ├── extract-text.ts     # Parse PDF/DOCX/TXT → plain text string
│       ├── detect-section-order.ts  # Regex scan of raw resume text → ordered SectionKey[]
│       ├── docx-document.ts    # Build DOCX file from TailoredResume; accepts ResumeStyle param; DOCX_FONT/NAME_HSZ/HEADER_HSZ/BODY_HSZ/LINE_HEIGHT_MAP/SECTION_BEFORE lookup tables
│       └── filename.ts         # Generate slugified export filename (name-role-date-tailored-resume)
│
├── types/
│   ├── resume.ts               # All Zod schemas + inferred TypeScript types (source of truth)
│   ├── resume-style.ts         # ResumeStyle interface + ResumeStyleSchema (Zod) + DEFAULT_RESUME_STYLE; fontFamily/nameSize/headerSize/bodySize/bulletSpacing/sectionSpacing
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
│       └── 20260416000000_initial_schema.sql  # profiles table + RLS policies + triggers
│
├── middleware.ts               # Edge middleware — auth check, disabled_at check, admin route guard
├── CLAUDE.md                   # Instructions for Claude Code agents
├── architecture.md             # This file
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
| `lucide-react` | latest | Icon library — used in landing (Upload, Target, Sparkles, Star, Quote) and HeroTrailer |
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
| `ENABLE_MOCK_PAYMENTS` | No | — | Set to `true` to enable `POST /api/billing/mock-purchase` in production; also shows warning banner in dashboard/settings |
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
   ├─ evaluateResumeAgainstJDRaw()    → ResumeEvaluation (score, gaps, matchedAreas, missingAreas)
   └─ Response: { resumeText, originalEvaluation }
   │
   ▼ Frontend shows initial ATS score + keyword chips (missingAreas or gaps)
   │
   User selects any confirmed missing skills → selectedKeywords[]
   │
   ▼
POST /api/tailor/step2
   ├─ generateTailoredResumeFromRaw() → TailoredResume + ChangeLog
   │    ├─ builds matchedBlock / gapsBlock / suggestionsBlock from evaluation
   │    ├─ appends confirmedKeywordsBlock if selectedKeywords present
   │    ├─ calls OpenAI with TAILOR_SYSTEM_PROMPT + buildTailorUserPrompt()
   │    └─ overrides sectionOrder via detectSectionOrder(resumeText)
   └─ Response: { tailoredResume, changeLog }
   │
   ▼
POST /api/tailor/step3
   ├─ renderTailoredResumeText(tailoredResume)         → plain text for re-evaluation
   ├─ evaluateTailoredResumeAgainstJDRaw()             → tailoredEvaluation
   ├─ buildScoreComparison(original, tailored)         → { before, after, delta }
   └─ Response: full TailorResponse
   │
   ▼ Frontend renders score comparison, changelog, resume preview card
   │
   User downloads:
   ├─ POST /api/export-pdf  → renderToBuffer(ResumePDFDocument) → binary PDF
   └─ POST /api/export-docx → buildDocxDocument(tailoredResume) → binary DOCX
```

### Combined route

`POST /api/tailor` runs the same pipeline in a single request. Also gated by auth + credit check. Used for the Vitest tests and as a fallback. The 3-step routes are what the browser calls.

### Credit lifecycle

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

4. Regeneration (same JD hash, regen_count < 2, paid credit required)
              → start_or_regen_resume: checks paid-credit gate (P0003 if free-only),
                then increments regen_count, no credit spent
              → regen-init returns { resumeId, regenCount: 1 or 2 }

5. Regen blocked — free credit (no resume_pack/resume_pack_plus credit on resume)
              → start_or_regen_resume raises P0003 → regen-init returns 402 "paid_credit_required"
              → UI shows "Pack required" badge; Regenerate and Style buttons disabled

6. Regen limit (regen_count >= 2)
              → start_or_regen_resume raises P0002 → regen-init returns 403
              → UI shows "Limit reached (2/2)" badge

7. No credits (credits_remaining = 0 and new JD)
              → spend_credit raises P0001 → step1 returns 402
              → NoCreditsModal shown; user directed to /settings
```

---

## Key Modules & How They Interact

### `lib/ai/pipeline.ts`

Central orchestrator. Exports:

| Function | What it does |
|----------|-------------|
| `evaluateResumeAgainstJDRaw(text, jd)` | Calls OpenAI with EVAL_SYSTEM_PROMPT → returns `ResumeEvaluation` |
| `evaluateTailoredResumeAgainstJDRaw(text, jd)` | Same but with TAILORED_EVAL_SYSTEM_PROMPT (calibrated for tailored resumes) |
| `generateTailoredResumeFromRaw({...})` | Calls OpenAI with TAILOR_SYSTEM_PROMPT → returns `{ tailoredResume, changeLog }`, then overwrites `sectionOrder` |
| `renderTailoredResumeText(resume)` | Converts `TailoredResume` → plain text string for re-evaluation |
| `buildScoreComparison({...})` | Simple arithmetic: `{ before, after, delta }` |
| `runStructuredCall({...})` | Internal: calls OpenAI, logs cost, strips markdown fences, parses JSON, validates with Zod |

All OpenAI calls use `zodResponseFormat(schema, name)` for structured outputs. Parsing pipeline:
1. Strip markdown fences (case-insensitive regex)
2. `JSON.parse` directly
3. If fails: sanitize control chars, retry
4. If fails: extract first `{...}` object, retry
5. Validate with `schema.safeParse()` — throw on failure

### `lib/ai/prompts.ts`

Three system prompts + three user prompt builders:

| Symbol | Role |
|--------|------|
| `EVAL_SYSTEM_PROMPT` | "Expert recruiter" — score 0–100, credit domain inferences, don't penalize implied skills |
| `TAILORED_EVAL_SYSTEM_PROMPT` | Same but calibrated to expect 90–100 for well-tailored resumes |
| `TAILOR_SYSTEM_PROMPT` | "Senior technical resume writer" — ATS keyword mirroring, no fabrication, page-limit rules |
| `buildEvalUserPrompt(resume, jd)` | Injects resume + JD text |
| `buildTailoredEvalUserPrompt(resume, jd)` | Same, gives extra credit for exact keyword matches |
| `buildTailorUserPrompt({...})` | Injects matched areas, gaps, suggestions, confirmed keywords, raw texts |

### `types/resume.ts` — schema definitions (source of truth)

All Zod schemas live here. Key types:

- `TailoredResumeSchema` → the tailored resume object (contact, summary, skills[], experience[], education[], projects[], certifications[], sectionOrder)
- `ResumeEvaluationSchema` → score, summary, strengths, gaps, improvementSuggestions, matchedAreas, missingAreas, rubric
- `ChangeLogSchema` → array of `{ section, originalText, tailoredText, reason, evidenceIds[] }`
- `ScoreComparisonSchema` → `{ before, after, delta }`

All shared — never redefine inline.

### `components/DashboardShell.tsx`

Client-side UI shell (~280 lines). Manages only form state (`resumeFile`, `resumeFileName`, `jobDescription`). All fetch/AI state is delegated to `useTailorResume`. Uses a **3-panel sliding layout** (300vw container, CSS `translateX`):

- Panel 1 (idle): file upload + JD textarea + submit button
- Panel 2 (working): loading progress bar + keyword chip panel (slides in from right)
- Panel 3 (result): score cards + changelog + resume preview thumbnail → opens fullscreen modal

State machine via `viewState` derived from `loadingStep`, `pendingEvalData`, and `result`:
```
idle → loading (step1 running)
     → keyword-selection (step1 done, gaps exist)
     → loading (step2/3 running)
     → result
```

### `lib/hooks/useTailorResume.ts`

Custom hook holding all tailoring logic extracted from `DashboardShell`. Contains: `AbortController` ref (aborts previous request on each new submission), all AI state (`result`, `error`, `downloadError`, `loadingStep`, `initialScore`, `pendingEvalData`, `selectedKeywords`, `isDownloadingPdf`, `isDownloadingDocx`, `isModalOpen`, `noTransition`), derived `viewState`, ESC-key effect, `runStep2And3`, `handleTailorResume` (validates step1 response with Zod), `handleGenerateResume`, `toggleKeyword`, `handleDownloadPdf`, `handleDownloadDocx`, `handlePrintResume`, `handleReset` (double rAF for CSS transition suppression), `openModal`, `closeModal`.

### `lib/errors.ts`

Exports `isClientError(error: unknown): boolean` — shared helper used by `/api/tailor/route.ts` and `/api/tailor/step1/route.ts` to distinguish 4xx user errors (unsupported format, empty file) from 5xx server errors.

### `components/ResumePreview.tsx`

Web HTML rendering of `TailoredResume`. Times New Roman, 816px wide (LETTER at 96 DPI). Used in the preview card (scaled down) and fullscreen modal. Also used by `window.print()`. Does **not** render the summary section (intentional — summary goes only in the tailoring prompt).

### `components/ResumePDFDocument.tsx`

React-PDF version of the same layout. Rendered server-side in the export-pdf route via `renderToBuffer()`. Times New Roman, 32pt margins. Used only on the server.

### `lib/resume/extract-text.ts`

Handles PDF, DOCX, TXT. Key implementation detail: `pdf-parse` is loaded **dynamically** (not statically imported) because `pdfjs-dist` references `DOMMatrix` at module evaluation time, which doesn't exist in Node.js 18. A minimal stub is polyfilled before the dynamic import.

### `lib/resume/detect-section-order.ts`

Scans raw resume text line-by-line with regex patterns to detect section headers. Returns a `SectionKey[]` in the order they appear, with any undetected sections appended at the end. Result is assigned to `tailoredResume.sectionOrder` in the pipeline, so the tailored output mirrors the original resume's structure.

---

## Entry Points & Routing

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/` | GET | Public | Landing page; redirects to `/dashboard` if signed in |
| `/pricing` | GET | Public | Standalone pricing page — PricingCards + FAQ; CTA routes to `/dashboard` |
| `/terms` | GET | Public | Terms of Service (placeholder — needs legal review before launch) |
| `/privacy` | GET | Public | Privacy Policy (placeholder — needs legal review before launch) |
| `/refund-policy` | GET | Public | Refund Policy (placeholder — needs legal review before launch) |
| `/dashboard` | GET | Required | Main app — AppNavbar + DashboardShell |
| `/settings` | GET | Required | Profile settings |
| `/auth/callback` | GET | Public | OAuth code exchange → session → redirect to `/dashboard` |
| `/api/auth/signout` | POST | Public | Signs out, redirects to `/` |
| `/api/tailor/step1` | POST | **Required** | FormData: `resumeFile` + `jobDescriptionText`; runs credit/regen check via `start_or_regen_resume` RPC; returns 401 (no auth), 402 (`no_credits`), 403 (`regen_limit_reached`); response includes `isPaidCredit: boolean` |
| `/api/tailor/step2` | POST | Public | JSON: `resumeText`, `jobDescriptionText`, `originalEvaluation`, `selectedKeywords?` |
| `/api/tailor/step3` | POST | Public | JSON: `tailoredResume`, `jobDescriptionText`, `originalEvaluation`, `changeLog` |
| `/api/tailor` | POST | Public | FormData (same as step1) — full pipeline in one call |
| `/api/export-pdf` | POST | Public | JSON: `tailoredResume`, `role?` → binary PDF |
| `/api/export-docx` | POST | Public | JSON: `tailoredResume`, `role?` → binary DOCX |
| `/api/billing/mock-purchase` | POST | Required | JSON: `{ product }` → grants credits via `mock_purchase_credits` RPC; 404 in production without `ENABLE_MOCK_PAYMENTS=true` |
| `/admin/overview` | GET | Admin | KPI dashboard |
| `/admin/users` | GET | Admin | User management |
| `/admin/users/[id]` | GET | Admin | User detail + actions |
| `/admin/analytics` | GET | Admin | Charts and top users |
| `/admin/credits` | GET | Admin | Credit ledger |
| `/admin/system` | GET | Admin | Cost and error monitoring |
| `/api/admin/grant-credits` | POST | Admin | Grant credits to a user |
| `/api/admin/disable-user` | POST | Admin | Disable a user account |

All AI/export API routes use `export const runtime = "nodejs"` (not Edge) because resume parsing libraries and React-PDF require Node.js APIs. Auth routes use the default Edge runtime.

---

## External Integrations

### OpenAI

- SDK: `openai` v6 (new v2-style API)
- Client initialized lazily in `lib/ai/client.ts` (singleton, checked against `OPENAI_API_KEY`)
- Structured outputs: `zodResponseFormat(schema, name)` enforces JSON shape at the API level
- Cost logging: `logOpenAICost()` logs token usage and estimated USD cost to stdout after every call. Pricing table is hardcoded for `gpt-4.1`, `gpt-4.1-mini`, `gpt-4.1-nano`. Unknown models fall back to `gpt-4.1` pricing.
- Temperature: 0 for evaluations (deterministic), 0.2 for tailoring (slight variation)

### Supabase

- Auth: Google OAuth via `supabase.auth.signInWithOAuth({ provider: 'google' })` in `AuthModal.tsx`
- Session management: cookie-based via `@supabase/ssr` — `lib/supabase/server.ts` for server components/routes, `lib/supabase/client.ts` for client components
- Database: see **Database Schema** section below
- Route protection: `middleware.ts` redirects unauthenticated requests to `/dashboard` or `/settings` back to `/`
- Redirect flow: Google → `https://<project>.supabase.co/auth/v1/callback` → `/auth/callback` → `/dashboard`

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

> **Dropped in migration 20260419:** `plan`, `plan_status`, `plan_expires_at`

### `resumes` (server-side only — no client insert/update policy)

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `user_id` | uuid | FK → auth.users |
| `job_description_hash` | text | SHA-256 of normalised JD text |
| `job_title` | text | Extracted from JD (nullable) |
| `company_name` | text | Extracted from JD (nullable) |
| `regen_count` | int default 0 | Incremented on each regen; capped at 2 |
| `created_at` | timestamptz | |
| `last_generated_at` | timestamptz | Updated on every regen |

Unique constraint: `(user_id, job_description_hash)`. RLS: select-only.

### `payments`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `user_id` | uuid | FK → auth.users |
| `dodo_payment_id` | text unique | `mock_<uuid>` during mock phase |
| `product` | text | `resume_pack` or `resume_pack_plus` |
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

Fires `after insert or update or delete` on `credits`. Calls `refresh_credits_remaining()` which recomputes `count(*) where spent_at is null and expires_at > now()` and writes it to `profiles.credits_remaining`. Keeps the cache column always in sync.

### Key RPCs (all `security definer`)

| RPC | Purpose |
|-----|---------|
| `spend_credit(p_resume_id)` | FIFO by expiry, `for update skip locked`; raises `P0001` if no credits |
| `start_or_regen_resume(p_jd_hash, p_job_title, p_company_name, p_force_fresh)` | New JD → insert + spend credit; regen → checks paid credit (raises `P0003` if free-only), then increments regen_count (max 2, raises `P0002`); force_fresh → resets regen_count + spends credit; returns `(resume_id, is_regen, regen_count)` |
| `restore_credit(p_resume_id)` | Reverses a `spend_credit` on failure; sets `spent_at = null` within a 5-min safety window; only affects the calling user's credit; trigger fires to restore `credits_remaining` |
| `mock_purchase_credits(p_product)` | Inserts payment + N credit rows; trigger fires to update cache. **Remove when real Dodo lands.** |

---

## Architecture Patterns

- **API Route per pipeline step** — each step is independently callable, making the flow debuggable and testable in isolation
- **Zod-first types** — all types are inferred from Zod schemas (`z.infer<typeof Schema>`), never defined separately
- **Structured outputs** — OpenAI's `zodResponseFormat` enforces schema at the API boundary; fallback parsing handles edge cases
- **Server-side document generation** — both PDF (React-PDF) and DOCX are rendered on the server, never in the browser
- **Hook-extracted UI orchestration** — `DashboardShell.tsx` holds only form state and rendering; all fetch/AI logic lives in `useTailorResume` hook. Avoids prop drilling while keeping the component testable and the 3-panel layout readable.

---

## Non-Obvious Implementation Details

1. **PDF parsing dynamic import**: `pdf-parse` / `pdfjs-dist` is never statically imported. If imported at module load time in Node.js 18, it crashes because `DOMMatrix` is undefined. The workaround patches `globalThis.DOMMatrix` before the dynamic `import()`.

2. **Section order preservation**: `detectSectionOrder(resumeText)` scans the *original* resume text and the result overwrites the model's `sectionOrder` field, ensuring the tailored resume maintains the same section sequence the candidate originally used.

3. **Summary excluded from rendering**: `TailoredResume` carries a `summary` field, but neither `ResumePreview.tsx` nor `ResumePDFDocument.tsx` renders it. It exists for the tailoring prompt context only.

4. **Evidence IDs are semantic labels, not verbatim quotes**: `evidenceIds` (e.g. `"exp-1-bullet-2"`) are traceability labels for the change log. They are not validated against the source resume.

5. **Keyword chip fallback**: The keyword chip panel shows `missingAreas` (genuine gaps the candidate can't cover) first. If that array is empty, it falls back to `gaps` (broader weaknesses). This means the user always sees something to confirm.

6. **Project preservation**: Enforced via prompt rules in `buildTailorUserPrompt` — the model is instructed to keep every project from the source resume and reduce to 1 bullet rather than drop an entry entirely. The previous code-level fallback (`extractProjectsFromRawText` + fuzzy re-append) was removed because its line-by-line parser misidentified description fragments as project names.

7. **Raw model response logging**: `runStructuredCall` logs the raw OpenAI response string before any parsing (`[pipeline] raw model response (label): ...`). This makes Zod validation failures and malformed output debuggable in production server logs.

8. **AbortController for concurrent submissions**: `useTailorResume` holds an `AbortController` ref. Each new tailor submission calls `abort()` on the previous controller before creating a new one. AbortErrors are silently swallowed in all catch blocks.

9. **All AI routes are auth-gated and rate-limited**: Every AI/export route (`/api/tailor`, `/api/tailor/step1–3`, `/api/export-pdf`, `/api/export-docx`) requires an authenticated Supabase session. Unauthenticated requests return 401 before any Redis or AI work is done. All six routes also apply an Upstash sliding-window rate limit (10 req / 60 s per user ID). When env vars `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` are absent the limiter degrades gracefully (always passes) so local dev works without Redis. Rate-limit helpers live in `lib/ratelimit.ts`.

10. **Dashboard layout uses flex column**: `app/dashboard/page.tsx` wraps everything in `flex h-screen flex-col overflow-hidden`. `AppNavbar` is `flex-shrink-0`; `DashboardShell` is `flex-1 overflow-hidden`. This ensures the navbar sits solidly at the top and the 3-panel sliding layout fills the remaining viewport height without overlap.

11. **`maxDuration = 60` on all AI routes**: All four tailor routes (`/api/tailor`, step1, step2, step3) export `maxDuration = 60`. Requires Vercel Pro plan for the override to take effect (Hobby plan hard-caps at 10s regardless).

12. **Tailwind v4 design tokens in CSS only**: No `tailwind.config.ts` exists. All named color and font tokens are declared in `app/globals.css` under `:root` and `@theme inline`. Colors: `bg`, `surface`, `surface-2`, `surface-raised`, `border`, `accent`, `accent-hover`, `accent-2`, `foreground`, `muted`, `text-dim`. Fonts: `display` (Space Grotesk), `sans` (Inter), `mono` (JetBrains Mono) — loaded via `next/font` in `layout.tsx` and exposed as CSS variables.

13. **AppNavbar z-index stacking fix**: The `nav` element carries `z-10` so its `backdrop-blur-sm` stacking context renders above `DashboardShell`'s transform-based stacking contexts. The dropdown itself also carries `z-50`. Both are needed — z-10 on nav elevates the context, z-50 on the dropdown ensures it's on top within that context.

14. **AuthModal always-mounted animation**: `AuthModal` no longer uses `if (!isOpen) return null`. Instead it uses `data-state="open|closed"` attributes with Tailwind `data-[state=closed]:opacity-0 data-[state=closed]:scale-95` transitions so the close animation plays before unmounting. `pointer-events-none` is applied when closed.

15. **Avatar `referrerPolicy="no-referrer"`**: Google avatar URLs (`lh3.googleusercontent.com`) return 403 without this header. `AvatarImage` is a client component that renders a plain `<img>` (not Next `<Image>`) with `referrerPolicy="no-referrer"` and an `onError` handler that falls back to an initials div.

16. **All tailor/export routes are auth-gated**: After migration 20260419, step1 and the combined `/api/tailor` were auth-gated. Step2, step3, `/api/export-pdf`, and `/api/export-docx` are now gated as well — all return 401 if there is no authenticated session. Step1 additionally returns 402 (`no_credits`) or 403 (`regen_limit_reached`) depending on credit/regen state.

---

## Known TODOs

- **Replace `mock_purchase_credits` with real Dodo webhook handler** — the RPC and `POST /api/billing/mock-purchase` route are scaffolding only. When Dodo is wired, delete the mock route and RPC, add a webhook handler that verifies signatures and calls `spend_credit` equivalents.
- **Add refund handling when Dodo integration lands** — the `payments` table has `status` and `refunded_at` columns ready; refunds need to mark the corresponding credit rows as expired/revoked and decrement `credits_remaining`.
- **Navbar credit count is not live-updated after mock purchase** — the settings page refreshes on navigation; the dashboard navbar requires a full page reload. Consider a client-side credit context or SWR if live updates are needed.
- **Regenerate Supabase types after running migration 20260422** — admin pages use `getAdminClient() as any` because the generated types in `types/supabase.ts` predate the `pipeline_runs` table, `is_admin`, and `disabled_at` columns. Run `supabase gen types typescript --project-id <id> > types/supabase.ts` and remove the `as any` casts.
- **Recharts adds ~300KB to the JS bundle** — currently loaded only inside `app/admin/` which is not user-facing. No action required unless bundle size becomes a concern.

---

## Admin Dashboard (MR-7)

### Access control
- `middleware.ts` checks `disabled_at` on every protected route (`/dashboard`, `/settings`, `/admin`). Disabled users are signed out and redirected to `/?reason=disabled`.
- `app/admin/layout.tsx` re-verifies `is_admin` via the SSR client. Non-admins redirect to `/dashboard`.
- Both API routes (`/api/admin/grant-credits`, `/api/admin/disable-user`) independently re-check `is_admin` before calling any RPC.

### Admin route map
| Route | Purpose |
|-------|---------|
| `/admin/overview` | KPI cards (users, runs today, avg Δ, cost today) + recent runs feed |
| `/admin/users` | Paginated user list with email search |
| `/admin/users/[id]` | User detail: profile, credit ledger, resume history, grant/disable actions |
| `/admin/analytics` | Daily runs chart, score delta histogram, avg score chart, step latency chart, top users |
| `/admin/credits` | Paginated credit ledger with source filter |
| `/admin/system` | Monthly cost KPIs, cost chart, model config, error breakdown |
| `POST /api/admin/grant-credits` | Calls `admin_grant_credits(p_user_id, p_count, p_reason)` |
| `POST /api/admin/disable-user` | Calls `disable_user(p_user_id)` |

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

### Admin RPCs (all `security definer`)
| RPC | Purpose |
|-----|---------|
| `admin_grant_credits(p_user_id, p_count, p_reason)` | Inserts N credit rows with 12-month expiry |
| `disable_user(p_user_id)` | Sets `profiles.disabled_at = now()` |
