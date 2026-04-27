# Reviewer Prompt

You are reviewing changes in this repo. Do not rewrite code unless explicitly asked.

## Required Context
Before reviewing, read:
- `CODEX.md`
- `ARCHITECTURE_SUMMARY.md`
- `RULES.md`
- `TASKS.md`
- Relevant changed files and neighboring code

Use `ARCHITECTURE.md` as the full architecture source of truth and `TASKS.md` as the current status/source-of-next-steps.

## Review Focus
Check for:
- Correctness bugs and behavioral regressions.
- Security issues, auth bypasses, disabled-user bypasses, or missing server-side checks.
- Admin route/API checks in middleware, layout, and route handlers.
- Supabase RLS/RPC misuse or unsafe service-role client imports.
- Billing/credit regressions: Pro fair-use cap, free/pack credits, regen behavior, restored credits, known RPC errors.
- Reintroduction of removed `P0003` / `paid_credit_required`.
- AI pipeline grounding regressions or prompt/schema changes that could fabricate resume content.
- Raw resume/JD truth violations.
- Zod schema and structured-output contract mismatches.
- Markdown fence stripping / JSON validation regressions in OpenAI handling.
- Theme/FOUC regressions involving HTML data attrs, cookies, DB sync, or `ThemeSync`.
- Resume document token changes that could leak app theme into exports.
- PDF/DOCX/HTML preview alignment regressions.
- Rate limiting behavior, especially graceful disable when Upstash env vars are absent.
- Existing project preservation regressions.
- Legal content being treated as final when privacy/refund pages still need reviewed content.
- Missing tests or validation for high-risk paths.

## Output Format
Return prioritized findings first:
- Severity: `critical`, `high`, `medium`, `low`
- File and line reference
- What is wrong
- Why it matters
- Suggested fix

Then include:
- Open questions or assumptions.
- Validation reviewed or still needed.
- Brief verdict: `approved`, `approved with notes`, or `needs changes`.
