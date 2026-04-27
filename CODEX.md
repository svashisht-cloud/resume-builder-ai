# CODEX.md

## Purpose of This Repo
- AI-powered resume tailoring app for converting a source resume + job description into an ATS-optimized, truthful tailored resume.
- Product pipeline: `evaluate -> tailor -> re-evaluate`.
- Export targets: HTML preview, PDF, and DOCX.
- Full source of truth: `ARCHITECTURE.md`.
- Current status, completed work, and next steps: `TASKS.md`.

## How Codex Should Work Here
- Read the repo guidance before editing: `CODEX.md`, `ARCHITECTURE_SUMMARY.md`, `RULES.md`, and `TASKS.md`.
- Use `ARCHITECTURE.md` for deeper design details and route/data-flow specifics.
- Make minimal, focused changes. Do not refactor unrelated files.
- Preserve existing project behavior, especially auth gates, credit/billing logic, AI grounding, project preservation, themes, and export rendering.
- Prefer structured JSON and existing Zod schemas over new freeform text contracts.
- Keep UI recruiter-friendly and avoid changing PDF/DOCX styling unless the task explicitly requires it.

## Files to Read Before Changes
| Task Area | Read First |
|---|---|
| Any feature/fix | `ARCHITECTURE.md`, `TASKS.md`, `RULES.md` |
| AI pipeline/prompts | `lib/ai/pipeline.ts`, `lib/ai/prompts.ts`, `types/resume.ts`, `types/api.ts` |
| Dashboard tailoring UI | `components/DashboardShell.tsx`, `lib/hooks/useTailorResume.ts` |
| Auth/Supabase | `middleware.ts`, `lib/supabase/server.ts`, `lib/supabase/client.ts`, `lib/supabase/admin.ts`, relevant migrations |
| Billing/credits | `app/api/billing/*`, `app/api/tailor/step1/route.ts`, `app/api/tailor/regen-init/route.ts`, migrations |
| Themes | `app/layout.tsx`, `app/globals.css`, `app/themes.css`, `lib/themes/*`, `components/ThemeSync.tsx` |
| Exports | `components/ResumePreview.tsx`, `components/ResumePDFDocument.tsx`, `lib/resume/docx-document.ts`, export routes |

## Implementation Workflow
1. Confirm scope and identify the narrowest files needed.
2. Inspect current implementation before editing.
3. Apply changes with minimal surface area.
4. Validate with available commands when safe.
5. Update `TASKS.md` after major work or status changes.
6. Update `ARCHITECTURE.md` only when behavior, architecture, routes, schema, env vars, or data flow materially change.

## Commands
| Purpose | Command |
|---|---|
| Install | `npm install` |
| Dev server | `npm run dev` |
| Lint | `npm run lint` |
| Build / type validation | `npm run build` |
| Tests | `npm run test` |

Notes:
- `package.json` does not currently define a dedicated `typecheck` or `format` script.
- Use `npm run build` when a full Next.js type/build validation is appropriate and safe.

## Safety Rules
- Never invent experience, tools, metrics, titles, credentials, companies, dates, projects, or unsupported resume claims.
- Raw resume text and raw job description are the truth for scoring and tailoring.
- Tailored output must remain grounded in the source resume or explicit candidate-confirmed additions.
- Zod schemas in `types/` are the source of truth for structured AI/API output.
- OpenAI responses may require markdown fence stripping, JSON extraction, and Zod validation.
- Do not break source project preservation, section ordering, role subtitles, or renderer alignment.
- Do not import `lib/supabase/admin.ts` into client components or browser bundles.
- Keep service-role operations server-only.
- Do not reintroduce `P0003` / `paid_credit_required`; it was removed.
- Mock billing routes are scaffolding only and must not be treated as production Dodo integration.
- Theme SSR cookies + HTML data attrs + `ThemeSync` must keep zero-FOUC behavior.
- Forte resume document tokens must remain invariant across themes.

## When to Ask for Approval
- Before adding dependencies.
- Before changing migrations, RLS policies, RPCs, auth middleware, billing/credit semantics, or service-role usage.
- Before changing PDF/DOCX visual styling or resume document tokens.
- Before replacing mock billing with real payment flow.
- Before broad refactors, destructive operations, or edits outside the requested scope.

## Updating Docs
- Update `TASKS.md` after major implementation, completed work, new TODOs, or changed status.
- Update `ARCHITECTURE.md` when behavior, data flow, routes, database schema/RPCs, auth, env vars, AI pipeline, billing, exports, or theme architecture changes.
- Do not edit `ARCHITECTURE.md` or `TASKS.md` for documentation-only Codex guidance unless resolving a clear contradiction is explicitly requested.
