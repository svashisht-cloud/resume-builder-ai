# Codex Usage

Use this directory for Codex-specific context and reusable prompts.

## Read Order
1. `CODEX.md` first for working instructions.
2. `ARCHITECTURE_SUMMARY.md` for a concise map of the app.
3. `RULES.md` for constraints that must not be violated.
4. `TASKS.md` for current status, completed work, and next steps.
5. `ARCHITECTURE.md` for the full architecture source of truth.

## File Roles
| File | Role |
|---|---|
| `CODEX.md` | Practical workflow for future Codex sessions |
| `ARCHITECTURE_SUMMARY.md` | Concise implementation context |
| `RULES.md` | Hard constraints and safety boundaries |
| `ARCHITECTURE.md` | Full architecture source of truth |
| `TASKS.md` | Current status, completed work, and next steps |
| `.codex/prompts/implementer.md` | Reusable feature/fix implementation prompt |
| `.codex/prompts/reviewer.md` | Reusable code review prompt |

## Current Codex Config
`.codex/config.toml` currently uses:

```toml
model = "gpt-5.4"
approval_policy = "on-request"
sandbox_mode = "workspace-write"
```

## Suggested Codex Prompts

### Implement a Small Fix
```text
Use .codex/prompts/implementer.md. Fix [specific bug]. Keep the change scoped, do not alter unrelated behavior, and run the narrowest relevant validation.
```

### Add a Feature
```text
Use .codex/prompts/implementer.md. Implement [feature] in the existing architecture. Preserve AI grounding, auth gates, billing/credit rules, theme FOUC behavior, and export alignment.
```

### Review a Diff
```text
Use .codex/prompts/reviewer.md. Review the current diff for correctness, security, auth, billing/credits, AI grounding, theme/export regressions, and missing tests. Do not rewrite code unless asked.
```

### Update Architecture Docs
```text
Update ARCHITECTURE.md and TASKS.md to reflect the completed change. Keep docs concise and source-of-truth accurate.
```

### Investigate Before Editing
```text
Read CODEX.md, ARCHITECTURE_SUMMARY.md, RULES.md, TASKS.md, ARCHITECTURE.md, and the relevant source files. Explain the current implementation and the safest minimal change path before editing.
```
