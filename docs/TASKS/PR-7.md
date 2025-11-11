# PR-7 — Cleanup

## Goal
Remove legacy paths.

## Files
- src/services/ThumbnailService.ts
- src/services/SessionSafetyService.ts

## Steps
1. Remove or disable any tab-switch capture logic and mark deprecated paths.
2. Replace unload hooks with the new content-script lifecycle.

## Acceptance
- No remaining code path switches tabs to capture.
