<!-- BEGIN:nextjs-agent-rules -->
# AGENTS.md

## Project
AI resume tailoring app:
- input: resume + job description
- output: ATS-optimized but truthful tailored resume
- export: PDF

## Tech stack
- Next.js
- TypeScript
- Tailwind
- Supabase
- OpenAI API
- HTML/CSS PDF rendering

## Core rules
- Never invent experience, tools, metrics, or titles
- Tailoring must remain evidence-grounded in original resume
- Prefer structured JSON over freeform text between pipeline stages
- Keep UI simple and recruiter-friendly
- Minimize unnecessary dependencies

## Commands
- install: npm install
- dev: npm run dev
- lint: npm run lint
- build: npm run build
- test: npm run test

## Repo conventions
- app/ for routes
- components/ for UI
- lib/ for business logic
- lib/ai/ for prompt pipelines
- lib/pdf/ for export
- types/ for shared schemas

## Definition of done
- feature works locally
- lint passes
- types pass
- no fabricated resume content
- update TASKS.md after major changes

## Do not
- do not rewrite the whole app unnecessarily
- do not add unsupported resume claims
- do not change PDF styling randomly
- do not refactor unrelated files in feature MRs
<!-- END:nextjs-agent-rules -->
