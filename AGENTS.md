<!-- BEGIN:nextjs-agent-rules -->
# AGENTS.md

## Project
Forte is an AI resume tailoring app.
- Input: uploaded resume (`.pdf`, `.docx`, `.txt`) + pasted raw job description
- Output: ATS-optimized but truthful tailored resume grounded in the source resume
- Exports: PDF and DOCX

## Current product shape
- Public marketing site at `/` with resume-first hero, How It Works, customer reviews, pricing, and footer
- Protected dashboard at `/dashboard` for the 3-step tailoring flow
- Protected settings at `/settings` for plan, credits, theme, experience level, and danger-zone actions
- Public pricing and legal pages
- Admin surface under `/admin`

## Tech stack
- Next.js App Router
- TypeScript
- Tailwind v4
- Supabase auth + database
- OpenAI API
- React PDF + `docx` export

## Core rules
- Never invent experience, titles, tools, dates, metrics, credentials, or projects
- Resume tailoring must stay evidence-grounded in the original resume or explicit user-confirmed additions
- Prefer structured JSON plus Zod validation between AI pipeline stages
- Keep recruiter-facing resume output clean and conventional
- Keep landing/UI work scoped; do not disturb export styling unless the task is about exports
- Minimize unnecessary dependencies

## Commands
- install: `npm install`
- dev: `npm run dev`
- lint: `npm run lint`
- build: `npm run build`
- test: `npm run test`

## Repo conventions
- `app/` for routes and layouts
- `components/` for UI
- `components/landing/` for landing-specific sections
- `components/pricing/` and `components/settings/` for feature areas
- `lib/ai/` for prompts and pipeline
- `lib/resume/` for parsing and export helpers
- `lib/themes/` for theme registry and sync
- `types/` for shared Zod schemas and inferred types

## High-signal architecture facts
- Pipeline order is `evaluate -> tailor -> re-evaluate`
- Raw resume text and raw JD text are the scoring/tailoring truth
- `types/resume.ts` is the schema contract for AI output
- Auth is Supabase Google OAuth with SSR cookie sessions
- Export routes are authenticated and rate-limited
- Billing routes are still mock/scaffolding until real Dodo integration lands
- Theme selection is cookie + profile backed; resume document tokens remain invariant across themes

## Definition of done
- Feature works locally
- `npm run lint` passes
- `npm run build` passes when type/build behavior is affected
- No fabricated resume content introduced
- `TASKS.md` updated after major architecture or product-surface changes
- Docs updated when the app shape or operating constraints materially change

## Do not
- Do not rewrite the whole app unnecessarily
- Do not add unsupported resume claims
- Do not weaken AI grounding safeguards
- Do not change PDF/DOCX styling randomly
- Do not import `lib/supabase/admin.ts` into client code
- Do not treat mock billing routes as production billing
- Do not refactor unrelated files in feature MRs
<!-- END:nextjs-agent-rules -->
