# App Workspace UX Refresh

## Summary
This deferred plan captures dashboard and settings improvements for after real payments integration. The goal is to make `/dashboard` feel like a focused product workspace and `/settings` feel like a structured account console, while preserving the polished visual direction introduced on the landing page.

Primary targets:
- `components/DashboardShell.tsx`
- `app/settings/page.tsx`
- `components/settings/*`
- `app/globals.css`

## Dashboard Recommendations

### Replace the initial centered form with a two-zone workspace
The current first dashboard panel is clean, but it reads like a generic upload form. Use a desktop layout with a main work column and a right-side readiness column.

Recommended layout:
- Main column: resume upload, job description, resume length, primary action.
- Support column: file status, job description word count, credit status, and selected experience level.
- Desktop grid: `lg:grid-cols-[minmax(0,1.15fr)_360px]`.
- Mobile: single-column flow, with readiness collapsed above the submit button.

### Add a compact workflow rail
Replace the marketing-style in-app header with a compact workflow header.

Recommended copy:
- Title: `New tailored resume`
- Subtitle: `Upload your source resume, paste the target role, then review the grounded changes before export.`

Recommended rail:
- `1 Source`
- `2 Match`
- `3 Export`

Reflect active state from `viewState` and `loadingStep`.

### Upgrade the upload area into a source document panel
Make the upload state feel more like a professional document workflow.

Recommended behavior:
- Empty state shows a quiet document drop area.
- Selected state collapses into file name, file type, completed state, and a clear `Change file` action.
- Validation copy appears only when needed.

### Improve the job description editor
Add lightweight feedback around the textarea.

Recommended controls:
- Word or character count.
- Clear icon button.
- Optional paste-from-clipboard button if browser support is acceptable.
- Short-description warning copy for weak inputs, without blocking unless the pipeline requires it.

### Make the hidden-experience step more recruiter-safe
Reframe the current keyword confirmation step around truthfulness.

Recommended changes:
- Rename `Any hidden experience?` to `Confirm real experience`.
- Keep selectable chips, but make selected state clearer.
- Add concise guardrail copy: `Only select skills you can support from your actual work.`

### Refine the result page hierarchy
The result state is strong, but the action hierarchy can be clearer.

Recommended top summary bar:
- Before score.
- After score.
- Improvement.
- Regenerations left.
- Primary export action.

Recommended action group:
- `Download PDF`
- `Download DOCX`
- `Preview`

Keep the full preview modal, but do not require opening preview before exporting.

### Make refine and style editing feel like side panels
The refine and style layers should feel like focused editing modes rather than separate full-screen pages.

Recommended structure:
- Desktop: persistent split view with controls on the left and live preview on the right.
- Mobile: keep tabs, but use icon plus label tabs such as `Edit` and `Preview`.
- Shared top bar for back, mode title, and save/regenerate action.
- Style controls grouped as `Typography`, `Density`, and `Reset`.

### Reduce decorative gradients inside the workspace
Keep protected app pages calmer than the landing page.

Recommended visual rules:
- Use gradients for primary CTA and score deltas only.
- Use solid surfaces, borders, and accent states elsewhere.
- Add app-specific surface utilities such as `workspace-panel`, `workspace-panel-muted`, `workspace-section-header`, and `metric-tile`.

## Settings Recommendations

### Change settings from a card stack into an account console
The current `max-w-3xl` vertical stack is simple, but unrelated settings feel equally weighted.

Recommended layout:
- Page width: `max-w-6xl`.
- Desktop: left sidebar with profile summary and section nav; right content with grouped panels.
- Mobile: profile summary first, then a horizontal scroll nav or compact segmented section control.

Suggested groups:
- `Account`
- `Plan & credits`
- `Preferences`
- `Billing`
- `Admin`, when applicable
- `Danger zone`

### Add a stronger account header
Use a top account summary to orient the page.

Recommended content:
- Avatar.
- Display name or email.
- Plan badge.
- Credits remaining.
- Member since.

Keep `Back to dashboard` as a small icon/text action rather than the dominant page element.

### Split membership into status and purchase actions
Separate current account state from available purchase actions.

Recommended panels:
- `Plan status`: current plan, renewal or cancellation date, credits remaining, next expiring credits.
- `Buy or change plan`: pricing cards and refund policy link.

Inside settings, pricing cards should feel more like account-management controls than public marketing cards.

### Make usage more actionable
Current usage metrics are useful but not contextual.

Recommended changes:
- Use compact metric tiles for generated resumes, regenerations, and credits spent.
- Add a recent activity area when data exists.
- Use an empty state when no usage exists.

### Improve appearance settings with preview-first design
Theme selection should show the result, not only raw swatches.

Recommended changes:
- Add a small live preview strip showing background, surface, accent button, and text sample.
- Keep palette cards with a clearer selected state: border, check, and label.
- Treat settings as the full theme editor and navbar theme cycling as the quick toggle.

### Reframe experience level as resume output preferences
The setting affects resume output, so the label should describe user-facing impact.

Recommended changes:
- Rename section to `Resume output`.
- Use selectable cards for `Early career`, `Mid-career`, and `Senior`.
- Show direct effects: page count, bullet density, and summary length.
- Reflect the selected output preference in the dashboard readiness panel.

### Make payment history feel like a real billing table
Payment history is a trust surface and should feel auditable.

Recommended behavior:
- Keep lazy loading.
- Desktop: table-like rows for date, product, credits, amount, and status.
- Mobile: stacked rows.
- Empty state: `No purchases yet` with a link or action toward the plan section.

### Move danger zone to an isolated final band
Keep destructive actions findable but visually separated.

Recommended changes:
- Put account deletion at the bottom under `Account removal`.
- Use restrained danger styling until the user initiates deletion.
- Keep strong destructive styling on the actual delete action.
- Add a compact list of deletion consequences.

## Visual System Recommendations

- Create protected-app surface classes separate from landing classes.
- Use `rounded-xl` or smaller for app surfaces; reserve larger radii for marketing panels.
- Prefer restrained borders, subtle shadows, and accent states in `/dashboard` and `/settings`.
- Keep the body background glow, but use more solid app surfaces for legibility.
- Standardize card headers with icon, title, optional description, and optional right-side action.
- Standardize segmented controls across resume length, theme mode, and output preference.
- Use lucide icons consistently without making every row visually busy.

## Priority Order

1. Dashboard first screen redesign.
2. Settings layout restructure.
3. Result page action hierarchy.
4. Settings component polish: membership, appearance, output preference, billing.
5. Shared protected-app CSS primitives.

## Test Plan

- Run `npm run lint`.
- Run `npm run build` because layout and component changes affect client and server routes.
- Manually test `/dashboard` in light and dark themes.
- Manually test `/settings` in light and dark themes.
- Check mobile widths around `360px`, `390px`, `768px`, and desktop `1440px`.
- Verify dashboard states: empty input, file selected, loading, keyword selection, result, refine, style editor, no credits, and download error.
- Verify settings states: free user, pro user, cancelled pro still in period, zero credits, admin user, empty payment history, and populated payment history.

## Assumptions

- This is visual and UX improvement only; AI pipeline behavior should not change.
- Resume export styling should remain untouched.
- Mock billing should continue to be treated as scaffolding until real payment integration lands.
- The landing page's polished style is the reference, but protected app pages should be more compact and workflow-focused than marketing pages.
