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

## Next step
- test with real resumes and tune evaluator/tailoring prompts against validation failures

## Notes
- using Next.js app router
- requires OPENAI_API_KEY
- evaluator/tailor models default to gpt-5-chat-latest and can be overridden with OPENAI_EVAL_MODEL / OPENAI_TAILOR_MODEL
