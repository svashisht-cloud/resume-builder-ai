# TASKS.md

## Current status
- MR-4 real AI pipeline implemented
- MR-6 LLM evaluator-based before/after scoring implemented
- /api/tailor parses uploaded .txt, .pdf, or .docx resumes
- /api/tailor evaluates raw resume text against raw JD before and after tailoring
- /api/tailor no longer parses job descriptions; JD text is used raw
- /api/tailor no longer parses resumes; tailoring returns structured resume output directly from raw resume/JD text
- /api/tailor returns originalEvaluation, tailoredEvaluation, scoreComparison, and evaluationMode
- /api/tailor preserves source projects after generation if the model drops them
- polished resume preview implemented for tailored results
- /api/export-pdf generates direct recruiter-ready PDF downloads
- browser print remains available as Print / Save as PDF fallback
- schemas updated for OpenAI structured output required fields (no .optional() — only .nullable())
- AI pipeline logs raw model JSON, strips markdown fences, parses a single JSON object, and validates with Zod
- /api/tailor uses raw resume/JD text as scoring and tailoring truth
- deterministic scoring.ts and scorer-aware tailoring plan removed
- sectionOrder detected from raw resume text (deterministic regex), preserved across all three renderers
- roleSubtitle (parenthetical subtitle under name) extracted and rendered in HTML preview, PDF, and DOCX
- experience column layout corrected: company+dates on line 1, role+location on line 2 (all three renderers)
- project URL rendered inline in header (name + techStack + URL on one line); only URL text is clickable
- PDF spacing tuned: bullet marginBottom 3pt, expBlock marginBottom 4pt, name marginBottom 10pt, lineHeight 1.27

## Completed (session: 2026-04-21, continued)
- Credit restore on AI failure: `restore_credit(p_resume_id)` RPC (migration 20260421000001) restores credit within 5-min window if AI pipeline errors after `spend_credit`; called in step1/route.ts and route.ts inner try/catch; P0003 (`paid_credit_required`) now handled in both routes

## Completed (session: 2026-04-25)
- Theme migrated to Aurora · Crimson Mono: `:root` and `[data-theme="light"]` CSS variable blocks replaced wholesale; crimson ramp (--color-crimson-100…700) and forte namespace added to `@theme inline`; all rgba(6,182,212,X) and `from-accent to-cyan-400` replaced across 7 component files; chart accent colors updated; forte document tokens (`--forte-ink/paper/stone`) and protected files (ResumePreview, ResumePDFDocument, DailyRunsChart) untouched


- /terms layout converted from two-column sidebar+article to collapsible accordion sections matching /refund-policy pattern; one <details> per heading, collapsed by default; TermsToc.tsx removed (no longer needed)

## Completed (session: 2026-04-24)
- Terms of Service page at /terms replaced with full Termly-generated 27-section ToS
- Sticky sidebar Table of Contents added to /terms — new Client Component components/TermsToc.tsx with IntersectionObserver scrollspy and active-section highlight
- All 27 section anchors use semantic slugs (e.g. #dispute-resolution, #contribution-license) instead of opaque numeric IDs
- (legal)/layout.tsx container constraint removed; privacy and refund-policy pages carry their own max-w-3xl wrappers

## Completed (session: 2026-04-21)
- Auth gate added to step2, step3, export-pdf, export-docx (were previously unauthenticated)
- Upstash sliding-window rate limiting (10 req / 60 s) applied to all 6 AI/export routes via lib/ratelimit.ts; gracefully degrades when env vars absent
- Public /pricing page at app/pricing/page.tsx — PricingCards + 5-item FAQ, PublicHeader, 4-column Footer
- Legal pages scaffolded at /terms, /privacy, /refund-policy (placeholder content — needs lawyer review before launch)
- Footer extracted from LandingPage inline to components/Footer.tsx (4-column: Product, Company, Legal, Support)
- AuthModal ToS line updated to real Links → /terms and /privacy (open in new tab)
- SwitchPlanSection "View refund policy" link added (opens in new tab)
- UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN added to .env.local.example

## Completed (session: 2026-04-25) — Experience-level-aware resume length
- DB migration: `profiles.experience_level` ('junior'|'mid'|'senior', default 'mid')
- `lib/ai/prompts.ts`: `ExperienceLevel`/`TargetPages` types, `getLengthBudget()` helper, dynamic PAGE LIMITS block in both `buildTailorUserPrompt` and `buildRefineUserPrompt`; static limits removed from `REFINE_SYSTEM_PROMPT`
- `lib/ai/pipeline.ts`: `generateTailoredResumeFromRaw` and `refineTailoredResume` accept and pass `experienceLevel` + `targetPages`
- `app/api/tailor/step2/route.ts`: extracts `experienceLevel` + `targetPages` from request body, passes to pipeline
- `components/settings/ExperienceLevelSection.tsx`: new segmented control (Junior/Mid/Senior) with Supabase save
- `app/settings/page.tsx`: fetches `experience_level`, renders `ExperienceLevelSection`
- `app/dashboard/page.tsx`: fetches `experience_level`, passes to `DashboardShell`
- `components/DashboardShell.tsx`: `experienceLevel` prop, `targetPages` state, senior-only 1/2-page toggle
- `lib/hooks/useTailorResume.ts`: `experienceLevel`/`targetPages` options threaded through step2, PDF, and DOCX requests

## Completed (session: 2026-04-26) — Multi-theme infrastructure + Settings UI
- PR 1: migration (theme_id + theme_mode on profiles), theme registry (lib/themes/registry.ts — 8 palettes), theme CSS (app/themes.css — 16 blocks), client utilities (lib/themes/client.ts), profile sync hook (lib/themes/use-theme-sync.ts + components/ThemeSync.tsx), globals.css migrated to [data-theme-id] selectors, layout.tsx reads cookies server-side for zero-FOUC SSR
- PR 2: ThemeSection (palette grid + mode toggle, optimistic + DB write), AppearanceSection replaced, Footer Logo tone="auto" fix for light mode
- Theme visual polish: `app/themes.css` chrome ramps tightened across all themes; themes 1–4 converted to monochromatic chrome; themes 1–4 secondary accents retuned to match primary hue families while themes 5–8 retained tinted chrome
- App styling pass: added semantic status/shadow/background tokens, replaced hardcoded crimson/cyan effects on main user-facing surfaces, softened card elevation, refreshed settings typography, and added global reduced-motion handling

## Next step
- test with real resumes and tune evaluator/tailoring prompts against validation failures
- replace placeholder content in /privacy and /refund-policy with lawyer-reviewed or Termly/Iubenda-generated policy before launch (/terms is complete)
- wire up real payment provider (Dodo) to replace mock_purchase_credits

## Notes
- using Next.js app router
- requires OPENAI_API_KEY
- evaluator/tailor models default to gpt-5-chat-latest and can be overridden with OPENAI_EVAL_MODEL / OPENAI_TAILOR_MODEL
