# RULES.md

`ARCHITECTURE.md` is the full source of truth. `TASKS.md` is the current status and next-steps source of truth.

## Hard Engineering Constraints
- Keep changes minimal, scoped, and behavior-preserving unless a behavior change is explicitly requested.
- Do not rewrite the whole app or refactor unrelated files.
- Prefer existing dependencies and project patterns; avoid unnecessary new packages.
- Keep TypeScript strict-compatible and preserve Zod validation boundaries.
- Preserve existing project preservation, section order, role subtitle, and renderer alignment behavior.
- Do not change `ARCHITECTURE.md` or `TASKS.md` unless the task materially changes architecture/status or explicitly asks for it.

## AI Resume Tailoring Constraints
- Never invent companies, titles, dates, tools, credentials, metrics, projects, or unsupported skills.
- Raw resume text and raw job description are the truth for scoring/tailoring.
- Tailored output must be grounded in the source resume or explicit candidate-confirmed additions.
- Pipeline order is `evaluate -> tailor -> re-evaluate`.
- Zod schemas in `types/` are the source of truth for structured AI output.
- OpenAI output must be parsed defensively: markdown fences, control chars, JSON extraction, and Zod validation.
- Regeneration/refinement may only use existing tailored content plus supported user feedback.
- Do not weaken safeguards that prevent fabricated resume claims.

## Auth/Security Constraints
- Auth is Supabase Google OAuth with SSR cookie sessions.
- Protected UI and API routes must verify authenticated users server-side.
- Admin routes require checks in middleware, layout, and API route layers.
- Disabled users must remain blocked by middleware.
- Never expose secrets or service-role operations to client bundles.
- `lib/supabase/admin.ts` must never be imported from client components.

## Supabase/RLS Constraints
- Respect existing RLS boundaries: user-facing tables are generally select-limited; writes happen through server routes/RPCs.
- Keep security-definer RPC behavior intentional and narrow.
- Do not bypass credit, Pro, admin, or disabled-user checks.
- Migrations must be reviewed carefully because billing/auth failures are high-impact.

## Billing/Credit Constraints
- Pro users have a 100 resumes/month fair-use cap.
- Free/pack users use credits for fresh tailoring.
- Regen does not spend new credits.
- Regen limit is 5 per resume.
- RPC errors: `P0001 -> no_credits`, `P0002 -> regen_limit_reached`, `P0004 -> fair_use_limit_reached`.
- Do not reintroduce `P0003` / `paid_credit_required`.
- Mock payment routes are scaffolding only; real billing should come from verified Dodo webhook integration.

## Theme/FOUC Constraints
- Theme system uses HTML data attributes, cookies, profile DB sync, and `ThemeSync`.
- Root layout must keep server-side cookie theme application to prevent FOUC.
- `theme_id` and `theme_mode` must stay validated against the registry.
- Resume document tokens must remain invariant across all app themes.
- Do not randomly retheme resume exports or protected document colors.

## Export/PDF/DOCX Constraints
- HTML preview, PDF, and DOCX content/styling must stay aligned.
- Do not change PDF/DOCX styling randomly.
- Preserve section order, role subtitle, project URLs, contact fields, and experience layout across renderers.
- Resume style controls and target page count must be threaded consistently to exports.
- Export routes must remain authenticated and rate-limited.

## Testing/Validation Expectations
- Run the narrowest safe validation for the change.
- Use `npm run lint` for lint validation.
- Use `npm run test` when tests cover the changed area.
- Use `npm run build` when type/build behavior needs validation; no dedicated `typecheck` script exists.
- For AI/schema changes, include Zod validation and consider tests around parsing/shape failures.
- For billing/auth/admin changes, verify unauthorized, non-admin, disabled, no-credit, regen-limit, and fair-use paths.

## Things Codex Must Not Do
- Do not fabricate resume content or make prompts allow fabrication.
- Do not reintroduce parsed JD/resume intermediary contracts unless intentionally redesigning the pipeline.
- Do not remove auth gates from step2, step3, export, billing, settings, dashboard, or admin routes.
- Do not import the Supabase service-role client client-side.
- Do not treat mock payments as production billing.
- Do not reintroduce `paid_credit_required`.
- Do not break Upstash graceful-disable behavior when env vars are absent.
- Do not change legal policy content as if it were lawyer-approved.
- Do not alter document tokens, PDF layout, or DOCX layout as incidental UI cleanup.
- Do not edit unrelated files to satisfy style preferences.
