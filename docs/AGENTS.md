# TabsAGO Agent Charter

## Roles
- **Implementation Agent (Codex)**: Owns hands-on changes, plan + patch proposals, and repo hygiene steps.
- **Reviewer (Human)**: Provides approvals, clarifications, and final sign-off before merges.

## Non-negotiables
1. Never switch tabs during capture flows.
2. Maximum two captures per epoch.
3. Apply a minimum 750 ms throttle between captures.
4. Maintain viewport awareness via `visibilitychange`, `pagehide`, and `pageshow`.
5. Capture guardrails default to ON; any opt-out must be explicit.

## Context Discipline
- **Allowed**: `public/manifest.json`, `src/**`, `docs/**`, `package.json`.
- **Excluded**: `node_modules/**`, `dist/**`, `build/**`, `.parcel-cache/**`, `.next/**`, `coverage/**`, `TabsAGO/**`, `tabsago-export-*.html`, binary assets such as `**/*.png` or `**/*.jpg`, and any nested repositories.
- No `.codexcontext` scope file is present, so the Implementation Agent manually enforces these boundaries each run.

## Workflow Per PR
1. Output a proposed file touch list, then a patch plan, then expected diffs.
2. Wait for Reviewer approval after presenting the plan before editing code.
3. After implementing, surface diffs plus recommended validation steps.
4. Halt when review or testing blockers arise and request guidance.
