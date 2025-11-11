# PR-3 — Thumbnail Storage & Migration

## Goal
Durable, lean thumbnail store.

## Files
- src/services/background/ThumbnailStore.ts
- src/service-worker.ts (startup migration)

## Steps
1. Create an IndexedDB store keeping two entries per tab+URL with LRU + 14-day TTL.
2. Migrate legacy `chrome.storage.local` blobs into the new store and clear the old keys.

## Acceptance
- New captures persist through restarts with size capped as designed.
- Existing thumbnails remain available after migration.
