# CLAUDE.md

## Architecture awareness — always follow these steps

- **Before any command or change**: read `architecture.md` to understand the current project state.
- **After every change** (file edit, creation, deletion, refactor, config update): update `architecture.md` to reflect what changed — keep it accurate and current at all times.
- **Never skip either step**, even for small or single-line changes.

## Project overview
AI resume tailoring app. Takes a resume + job description as input and produces an
ATS-optimized (but truthful) tailored resume with before/after scoring and PDF export.

## Tech stack
- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase
- OpenAI API (`OPENAI_API_KEY` required)
- HTML/CSS PDF rendering via `/api/export-pdf`

## Environment variables
- `OPENAI_API_KEY` — required
- `OPENAI_EVAL_MODEL` — optional override (default: `gpt-5-chat-latest`)
- `OPENAI_TAILOR_MODEL` — optional override (default: `gpt-5-chat-latest`)

## Commands
```bash
npm install     # install deps
npm run dev     # local dev server
npm run lint    # lint
npm run build   # production build
npm run test    # run tests
```

## Repo layout
```
app/            # Next.js routes and API handlers
components/     # UI components
lib/            # Business logic
lib/ai/         # Prompt pipelines and AI orchestration
lib/pdf/        # PDF export logic
types/          # Shared Zod schemas and TypeScript types
```

## Current pipeline state (as of MR-6)
- `/api/tailor` accepts `.txt`, `.pdf`, or `.docx` resume uploads
- JD text is passed raw (no parsing step)
- Resume text is passed raw; tailored output is structured JSON directly from raw inputs
- Returns: `originalEvaluation`, `tailoredEvaluation`, `scoreComparison`, `evaluationMode`
- Source projects from the original resume are preserved if the model drops them
- Scoring is LLM evaluator-based (before/after)
- `/api/export-pdf` generates recruiter-ready PDF downloads; browser print is a fallback
- AI pipeline: logs raw model JSON → strips markdown fences → parses single JSON object → validates with Zod
- OpenAI structured outputs used; schemas enforce required fields

## Core constraints — never violate these
- **Never fabricate** experience, tools, metrics, titles, or any resume content
- All tailoring must be **grounded in the original resume**; no invention
- Structured JSON between pipeline stages — avoid freeform text
- Do not change PDF styling arbitrarily
- Do not refactor unrelated files within a feature MR

## Definition of done
- Feature works locally
- `npm run lint` passes
- TypeScript types pass (`tsc --noEmit`)
- No fabricated resume content introduced
- `TASKS.md` updated after major changes

## What not to do
- Do not rewrite the whole app for a scoped task
- Do not add unsupported claims to resume output
- Do not introduce unnecessary dependencies
- Do not touch unrelated files in a focused MR

## Agents
Two subagents are defined in `.claude/agents/`:

- **implementer** — writes and modifies code for features and fixes. Scoped to
  relevant files only; runs lint and type-check before declaring done.
- **reviewer** — audits changes after implementation. Checks correctness, AI
  pipeline integrity (no fabrication paths), scope discipline, and type safety.
  Returns a verdict of `approved`, `approved with notes`, or `needs changes`.

Typical workflow for a feature:
1. Prompt the **implementer** with the task
2. Pass the diff to the **reviewer** to audit
3. Fix any flagged issues, then merge

## Active work
Next priority: test with real resumes and tune evaluator/tailoring prompts against
Zod validation failures. See `TASKS.md` for full status.