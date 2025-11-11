# Contributing to TabsAgo

Scope: Implement only the current PR’s scope. Propose changes, don’t pre-empt.

Plan first: For each PR, output a “Files to touch” list + diff synopsis before editing.

No tab switching: Never use chrome.tabs.update(..., { active: true }) to capture.

Two captures max per epoch: first (post load/commit), final (pre-navigate/SPA).

Throttle: ≥ 750 ms between captures extension-wide; coalesce duplicates.

Minimized windows: Detect and skip.

Storage: Thumbnails → IndexedDB; viewport → storage.session; preferences → storage.local.

Small diffs: ≤ ~8 files per PR unless justified.

Tests: Provide manual checklist; run type-check, lint, build.

Commits: feat(thumbnails): …, refactor(bg): …, chore(storage): …

Compliance: Auto capture ON by default; provide a single opt-out.

No external screenshot services; no speculative deps.