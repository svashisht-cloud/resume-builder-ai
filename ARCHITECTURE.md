# ARCHITECTURE.md

## Product goal
Generate ATS-optimized resumes from an existing resume + JD while preserving truthfulness. The system should maximize match quality without inventing skills, tools, metrics, titles, or experience.

## Pipeline
1. Parse resume
2. Parse JD
3. Gap analysis
4. Safe tailoring
5. Score output
6. Render preview
7. Export PDF

## Safety model
- supported keywords can be surfaced
- unsupported keywords cannot be introduced
- all edits should be traceable to source content
- the system should optimize toward the highest truthful score, not guarantee a fixed score

## Core entities
- ResumeSession
- ParsedResume
- ParsedJD
- TailoredResume
- ChangeLog
- ATSScore

## API contracts
- POST /api/parse-resume
- POST /api/parse-jd
- POST /api/tailor
- POST /api/score
- POST /api/export-pdf