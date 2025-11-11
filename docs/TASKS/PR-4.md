# PR-4 — Content Script Viewport

## Goal
Save/restore scroll.

## Files
- src/content/viewport.ts
- src/service-worker.ts (handler wiring)

## Steps
1. Save `{scrollX, scrollY, vw, vh, dpr}` to `chrome.storage.session` on `visibilitychange→hidden` and `pagehide`.
2. Restore positions on `pageshow`, accounting for BFCache cases.

## Acceptance
- Reopen or BFCache restore returns to the last viewport.
