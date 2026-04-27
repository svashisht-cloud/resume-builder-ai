# Architecture Summary

`ARCHITECTURE.md` is the full architecture source of truth. `TASKS.md` is the source of truth for current status, completed work, and next steps.

## 1-Page App Summary
- Forte is a Next.js App Router app that tailors resumes against job descriptions using OpenAI.
- Main flow: upload resume (`.pdf`, `.docx`, `.txt`) + paste raw JD -> evaluate original -> tailor structured resume -> re-evaluate -> preview/export.
- Tailoring must be truthful and evidence-grounded in the source resume.
- Auth is Supabase Google OAuth with SSR cookie sessions.
- Supabase stores profiles, resumes, credits, payments, and admin pipeline telemetry.
- Exports generate recruiter-ready PDF and DOCX aligned with the HTML preview.

## Core Product Flow
| Step | Route/Code | Output |
|---|---|---|
| Analyze | `POST /api/tailor/step1` | raw resume text, original evaluation, credit/Pro gate result |
| Confirm gaps | `DashboardShell` | candidate-selected real missing skills |
| Tailor | `POST /api/tailor/step2` | `TailoredResume` + `ChangeLog` |
| Re-score | `POST /api/tailor/step3` | tailored evaluation + score comparison |
| Export | `POST /api/export-pdf`, `POST /api/export-docx` | binary PDF/DOCX |

## Important Routes
| Route | Purpose |
|---|---|
| `/` | Public landing page; redirects signed-in users to `/dashboard` |
| `/pricing` | Public pricing page |
| `/terms`, `/privacy`, `/refund-policy` | Legal pages; privacy/refund still need final reviewed content |
| `/dashboard` | Protected tailoring UI |
| `/settings` | Protected profile, plan, usage, theme, experience level, danger zone |
| `/auth/callback` | Supabase OAuth code exchange |
| `/api/tailor/*` | AI pipeline and regeneration gates |
| `/api/export-pdf`, `/api/export-docx` | Authenticated exports |
| `/api/billing/mock-*` | Mock billing scaffolding only |
| `/admin/*`, `/api/admin/*` | Admin dashboards/actions with layered admin checks |

## Important Components
| Component | Role |
|---|---|
| `DashboardShell` | Primary 3-panel tailoring UI, keyword confirmation, regenerate/refine, style editing |
| `useTailorResume` | Client fetch/state orchestration for step1/2/3, regen, export downloads |
| `ResumePreview` | HTML resume renderer and modal preview |
| `ResumePDFDocument` | React-PDF renderer |
| `AppNavbar` | Authenticated navigation |
| `ThemeSync` | Client profile/cookie theme synchronization to prevent FOUC |
| `PricingCards` | Free/Pro/pack cards and mock purchase/cancel hooks |
| `ExperienceLevelSection` | Profile-level resume length preference |

## Important Libraries
| Area | Files |
|---|---|
| AI | `lib/ai/client.ts`, `lib/ai/pipeline.ts`, `lib/ai/prompts.ts` |
| Schemas | `types/resume.ts`, `types/resume-style.ts`, `types/api.ts` |
| Supabase | `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/admin.ts` |
| Rate limit | `lib/ratelimit.ts` |
| Resume parsing/rendering | `lib/resume/*`, `components/ResumePreview.tsx`, `components/ResumePDFDocument.tsx` |
| Themes | `lib/themes/*`, `app/themes.css`, `app/globals.css` |

## Database/RPC Summary
- `profiles`: user profile, credits cache, Pro plan fields, theme fields, experience level.
- `resumes`: server-created resume records keyed by user + normalized JD hash; tracks regeneration count.
- `payments`: mock one-time pack payments; Pro products do not insert here.
- `credits`: one row per credit; FIFO spend and 12-month expiry.
- `pipeline_runs`: service-role telemetry for AI/admin reporting.
- Key RPCs: `start_or_regen_resume`, `spend_credit`, `restore_credit`, `mock_purchase_credits`, `activate_subscription`, `cancel_subscription`, `reset_monthly_usage`.
- Known RPC error codes: `P0001 -> no_credits`, `P0002 -> regen_limit_reached`, `P0004 -> fair_use_limit_reached`.
- `P0003` / `paid_credit_required` was removed and must not be reintroduced.

## AI Pipeline Summary
- Production path is `evaluate -> tailor -> re-evaluate`.
- Raw resume text and raw JD text are the scoring/tailoring truth.
- `lib/ai/pipeline.ts` calls OpenAI using structured output and validates with Zod.
- Responses may need markdown fence stripping, control-character cleanup, first-object extraction, and schema validation.
- `types/resume.ts` schemas are the contract for `ResumeEvaluation`, `TailoredResume`, and changelog output.
- Section order is detected deterministically from raw resume text and preserved across renderers.
- Refinement/regeneration works from the previously tailored resume and user feedback, not new unsupported content.

## Billing/Credits Summary
- Free signup grants 1 credit.
- Resume Pack grants 3 credits; Pack Plus grants 10 credits.
- Pro monthly/annual gets 100 resumes/month fair-use cap.
- Free/pack users spend credits for new JD tailoring.
- Regen does not spend a new credit.
- Regen limit is 5 per resume.
- Mock billing routes require `ENABLE_MOCK_PAYMENTS=true` and are scaffolding pending real Dodo webhook integration.

## Theme System Summary
- Root layout reads `theme-id` and `theme-mode` cookies server-side and sets HTML data attributes.
- `app/themes.css` defines 8 palettes x 2 modes.
- Default theme is `charcoal-periwinkle` in `light` mode for first-time visitors and future profiles.
- Theme chrome ramps are tightened across all palettes; themes 1-4 use monochromatic chrome, while themes 5-8 retain tinted chrome.
- Themes 1-4 use secondary accents in the same hue family as their primary accent.
- `ThemeSection` writes profile DB values and cookies optimistically.
- `ThemeSync` reconciles profile theme values client-side.
- Forte document tokens (`--forte-ink`, `--forte-paper`, `--forte-stone`) are invariant and should not be themed.

## Export System Summary
- HTML preview, PDF, and DOCX should remain visually/content aligned.
- PDF uses `@react-pdf/renderer`.
- DOCX uses `docx`.
- Export routes are authenticated and rate-limited.
- Resume style and target page settings are threaded into exports.

## Admin/Dashboard Summary
- `middleware.ts` protects dashboard/settings/admin and checks disabled users.
- `app/admin/layout.tsx` rechecks `is_admin`.
- Admin API routes independently check admin status before RPC calls.
- Admin pages read `pipeline_runs`, users, credits, usage, costs, and errors.

## Known TODOs From TASKS.md
- Test with real resumes and tune evaluator/tailoring prompts against validation failures.
- Replace placeholder `/privacy` and `/refund-policy` content with final reviewed policy content.
- Replace mock billing with real Dodo provider/webhook integration.
- Regenerate Supabase types after recent migrations if admin code still relies on `as any`.

## Codex Config
`.codex/config.toml` currently uses:

```toml
model = "gpt-5.4"
approval_policy = "on-request"
sandbox_mode = "workspace-write"
```
