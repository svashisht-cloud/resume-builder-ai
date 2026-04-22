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

## Completed (session: 2026-04-21)
- Auth gate added to step2, step3, export-pdf, export-docx (were previously unauthenticated)
- Upstash sliding-window rate limiting (10 req / 60 s) applied to all 6 AI/export routes via lib/ratelimit.ts; gracefully degrades when env vars absent
- Public /pricing page at app/pricing/page.tsx — PricingCards + 5-item FAQ, PublicHeader, 4-column Footer
- Legal pages scaffolded at /terms, /privacy, /refund-policy (placeholder content — needs lawyer review before launch)
- Footer extracted from LandingPage inline to components/Footer.tsx (4-column: Product, Company, Legal, Support)
- AuthModal ToS line updated to real Links → /terms and /privacy (open in new tab)
- SwitchPlanSection "View refund policy" link added (opens in new tab)
- UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN added to .env.local.example

## Next step
- test with real resumes and tune evaluator/tailoring prompts against validation failures
- replace placeholder legal content with lawyer-reviewed or Termly/Iubenda-generated policy before launch
- wire up real payment provider (Dodo) to replace mock_purchase_credits

## Notes
- using Next.js app router
- requires OPENAI_API_KEY
- evaluator/tailor models default to gpt-5-chat-latest and can be overridden with OPENAI_EVAL_MODEL / OPENAI_TAILOR_MODEL
