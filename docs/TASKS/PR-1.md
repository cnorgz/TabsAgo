# PR-1 — Manifest & Settings Foundations

## Goal
Permissions + content script + settings flag.

## Files
- public/manifest.json
- src/content/viewport.ts (placeholder)
- src/views/App.tsx
- src/constants/prefs.ts

## Steps
1. Add `"webNavigation"`, `"tabGroups"` (and optionally `"idle"`) permissions plus register `src/content/viewport.ts` as a content script (`run_at: "document_idle"`, `<all_urls>`).
2. Introduce `AUTO_THUMBNAIL_CAPTURE` (default `true`) and surface the settings toggle UI.
3. Wire the toggle through `chrome.storage.local`.

## Acceptance
- Manifest builds; toggle displays.
- No behavior change yet beyond exposing the toggle.
