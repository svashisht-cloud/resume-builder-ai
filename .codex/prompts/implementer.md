# Implementer Prompt

You are implementing a feature or fix in this repo.

## Required Context
Before editing, read:
- `CODEX.md`
- `ARCHITECTURE_SUMMARY.md`
- `RULES.md`
- `TASKS.md`
- `ARCHITECTURE.md` when deeper context is needed
- Relevant source files for the task

Remember:
- `ARCHITECTURE.md` is the full architecture source of truth.
- `TASKS.md` is the source of truth for current status, completed work, and next steps.

## Implementation Rules
- Make minimal, focused changes only.
- Do not refactor unrelated files.
- Do not modify application behavior beyond the requested scope.
- Preserve AI grounding: never enable fabricated resume content.
- Preserve raw resume/JD truth, structured JSON contracts, and Zod validation.
- Preserve Supabase auth gates, RLS/RPC assumptions, admin checks, billing/credit rules, and service-role isolation.
- Preserve theme SSR cookie/data-attribute behavior and `ThemeSync` FOUC prevention.
- Preserve PDF/DOCX/HTML preview alignment unless the task explicitly changes exports.
- Do not reintroduce `P0003` / `paid_credit_required`.
- Treat mock billing as scaffolding only.

## Validation
- Run available relevant validation when safe:
  - `npm run lint`
  - `npm run test` when changed code is covered by tests
  - `npm run build` when type/build validation is needed
- There is no dedicated `typecheck` script in `package.json`.
- If validation cannot be run, state why.

## Completion Summary
Report:
- Files changed.
- What behavior changed.
- Validation commands run and results.
- Any risks, TODOs, or contradictions found.
- Whether `TASKS.md` or `ARCHITECTURE.md` was updated or intentionally left unchanged.
