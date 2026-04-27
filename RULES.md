# RULES.md

`ARCHITECTURE.md` is the deep technical source of truth. `TASKS.md` is the source of truth for current status, recent completions, and next steps.

## Hard engineering constraints
- Keep changes minimal, scoped, and behavior-preserving unless a behavior change is explicitly requested.
- Do not rewrite the app or refactor unrelated files to satisfy local cleanup preferences.
- Prefer existing dependencies and existing project patterns.
- Keep TypeScript strict-compatible and preserve Zod validation boundaries.
- Update `TASKS.md`, `ARCHITECTURE_SUMMARY.md`, or `ARCHITECTURE.md` only when the app state or architecture materially changes.

## AI resume constraints
- Never invent companies, titles, dates, tools, credentials, metrics, projects, or unsupported skills.
- Raw resume text and raw JD text are the tailoring and scoring truth.
- Tailored output must be grounded in the source resume or explicit user-confirmed additions.
- Pipeline order remains `evaluate -> tailor -> re-evaluate`.
- `types/resume.ts` is the source of truth for structured AI output.
- OpenAI responses must be parsed defensively: strip fences, extract JSON, validate with Zod, fail safely.
- Regeneration and refinement may only build on existing tailored content plus grounded user feedback.

## Auth, security, and Supabase constraints
- Auth is Supabase Google OAuth with SSR cookie sessions.
- Protected pages and API routes must verify the authenticated user server-side.
- Admin access must stay enforced in middleware, layout, and admin API routes.
- Disabled users must remain blocked from protected surfaces.
- Never expose service-role credentials or server-only operations to the client bundle.
- `lib/supabase/admin.ts` must never be imported by client components.
- Respect existing RLS boundaries and security-definer RPC behavior.

## Billing and credit constraints
- Free users get 1 tailored resume.
- Resume Pack grants 3 credits; Pack Plus grants 10 credits.
- Pro monthly and annual plans use a 100 resumes/month fair-use cap.
- Free and pack users spend credits only for fresh tailoring, not regeneration.
- Regen limit is 5 per resume.
- RPC error mapping must remain:
  - `P0001 -> no_credits`
  - `P0002 -> regen_limit_reached`
  - `P0004 -> fair_use_limit_reached`
- Do not reintroduce `P0003` / `paid_credit_required`.
- Mock billing routes are scaffolding only until verified Dodo webhook billing replaces them.

## Theme and UI constraints
- Theme system uses HTML data attributes, cookies, profile persistence, and `ThemeSync`.
- Root layout must keep server-side cookie theme application to avoid FOUC.
- `theme_id` and `theme_mode` must stay validated against `lib/themes/registry.ts`.
- Forte resume document tokens must remain invariant across all themes.
- Do not retheme recruiter-facing resume exports as part of landing or app chrome work.

## Export constraints
- HTML preview, PDF, and DOCX content/styling must remain aligned.
- Preserve section order, role subtitle, project URL handling, contact fields, and experience layout across renderers.
- Resume style and target page count must stay threaded consistently into exports.
- Export routes must remain authenticated and rate-limited.

## Validation expectations
- Run the narrowest safe validation for the change.
- Use `npm run lint` for lint validation.
- Use `npm run test` when tests cover the changed area.
- Use `npm run build` when build/type behavior, routing, or server/client boundaries may be affected.
- For AI/schema changes, validate parsing and Zod boundaries.
- For billing/auth/admin changes, verify unauthorized, disabled, non-admin, no-credit, regen-limit, and fair-use paths.

## Things Codex must not do
- Do not fabricate resume content or loosen prompts in a way that allows fabrication.
- Do not remove auth gates from dashboard, settings, admin, tailoring, export, or billing flows.
- Do not treat mock payments as production billing.
- Do not break Upstash graceful-disable behavior when env vars are absent.
- Do not alter legal policy content as if it were lawyer-approved unless the task is explicitly legal-copy work.
- Do not alter PDF/DOCX layout incidentally while doing landing or app-shell cleanup.
