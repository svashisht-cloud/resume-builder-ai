# Architecture Summary

`ARCHITECTURE.md` is the full technical reference. `TASKS.md` is the current-state and next-steps reference.

## 1-page app summary
- Forte is a Next.js App Router app for truthful, evidence-grounded resume tailoring.
- Main flow: upload resume + paste raw job description -> evaluate original -> tailor structured resume -> re-evaluate -> preview/export.
- Auth is Supabase Google OAuth with SSR cookie sessions.
- Data lives in Supabase; AI runs through OpenAI; exports are PDF and DOCX.

## Core flow
| Step | Route | Result |
|---|---|---|
| Analyze | `POST /api/tailor/step1` | extracted resume text, original evaluation, credit/plan gate result |
| Confirm | `DashboardShell` | user-selected missing keywords or gaps |
| Tailor | `POST /api/tailor/step2` | `TailoredResume` + changelog |
| Re-score | `POST /api/tailor/step3` | tailored evaluation + score comparison |
| Export | `POST /api/export-pdf`, `POST /api/export-docx` | recruiter-ready files |

## Main routes
| Route | Purpose |
|---|---|
| `/` | Public landing page; redirects signed-in users to `/dashboard` |
| `/pricing` | Public pricing page |
| `/terms`, `/privacy`, `/refund-policy` | Public legal pages with accordion-style content |
| `/dashboard` | Protected tailoring UI |
| `/settings` | Protected profile, credits, plan, theme, and experience-level settings |
| `/admin/*` | Protected admin dashboards and actions |
| `/api/tailor/*` | AI pipeline endpoints |
| `/api/export-*` | Authenticated export endpoints |
| `/api/billing/mock-*` | Mock billing scaffolding only |

## Main UI surfaces
| Component | Role |
|---|---|
| `LandingPage` | Public marketing page with resume-first hero, How It Works, customer reviews, pricing, footer |
| `InteractiveHeroPreview` | Static resume preview card; mobile ATS footer attached below the resume, desktop ATS side card |
| `HeroTrailer` | Animated walkthrough used inside How It Works |
| `TiltCard` | How It Works tilt interaction with localized edge and corner border lighting only |
| `Testimonials` | Customer review carousel; mobile arrows below the card, side arrows on larger screens |
| `PricingCards` | Free / Pro / Resume Pack pricing cards with mock purchase/cancel hooks |
| `DashboardShell` | Main tailoring workspace |
| `ResumePreview` | HTML resume renderer |
| `ResumePDFDocument` | PDF renderer |
| `ThemeSync` | Client-side theme/profile sync |

## Important libraries
| Area | Files |
|---|---|
| AI | `lib/ai/client.ts`, `lib/ai/pipeline.ts`, `lib/ai/prompts.ts` |
| Resume parsing/export | `lib/resume/*`, `components/ResumePreview.tsx`, `components/ResumePDFDocument.tsx` |
| Themes | `lib/themes/*`, `app/themes.css`, `app/globals.css` |
| Supabase | `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/admin.ts` |
| Shared schemas | `types/resume.ts`, `types/resume-style.ts`, `types/api.ts` |
| Rate limiting | `lib/ratelimit.ts` |

## Database and billing summary
- `profiles` stores identity, credits cache, plan fields, theme fields, admin flags, and `experience_level`.
- `resumes` tracks normalized resume/JD runs and regeneration count.
- `credits` stores individual credit rows with FIFO spend and expiry.
- `payments` stores mock purchase records.
- `pipeline_runs` stores admin telemetry.
- Key RPCs: `start_or_regen_resume`, `spend_credit`, `restore_credit`, `mock_purchase_credits`, `activate_subscription`, `cancel_subscription`, `reset_monthly_usage`.
- Known RPC errors:
  - `P0001 -> no_credits`
  - `P0002 -> regen_limit_reached`
  - `P0004 -> fair_use_limit_reached`

## Theme and export summary
- Theme is driven by `theme-id` and `theme-mode` cookies plus profile persistence.
- Default theme is `charcoal-periwinkle` in `light` mode.
- Resume document tokens stay fixed across themes.
- HTML preview, PDF, and DOCX should remain aligned in content and layout.

## Current known work left
- Replace mock billing with real Dodo billing/webhooks.
- Test with real resumes and keep tuning evaluator/tailoring prompts.
- Rename `middleware.ts` to the new Next.js `proxy` convention when convenient; current build warns but still passes.
