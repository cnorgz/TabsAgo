# Title: TabsAGO — Automatic Thumbnails & Last-Viewport (Playbook)

Goal (non-negotiable)

Replace manual, disruptive batch capture.

Automatic, lightweight thumbnails with no tab switching.

Max two captures per “visit epoch” of the active tab: first (after load/route commit) and final (just before leaving).

Save/restore viewport via visibilitychange/pagehide/pageshow (no beforeunload/unload).

Default ON with a single opt-out toggle.

Current code anchors (where to change)

Batch capture loop to deprecate:
https://github.com/xavstack/TabsAgo/blob/master/src/services/ThumbnailService.ts#L60-L116

Manual trigger + help copy to change:
https://github.com/xavstack/TabsAgo/blob/master/src/views/App.tsx#L197-L226

https://github.com/xavstack/TabsAgo/blob/master/src/views/App.tsx#L730-L733

Legacy unload hooks to replace:
https://github.com/xavstack/TabsAgo/blob/master/src/services/SessionSafetyService.ts#L11-L17

Manifest perms to expand:
https://github.com/xavstack/TabsAgo/blob/master/public/manifest.json#L13-L22

APIs & docs

Tabs: https://developer.chrome.com/docs/extensions/reference/api/tabs

captureVisibleTab: https://developer.chrome.com/docs/extensions/reference/api/tabs#method-captureVisibleTab

WebNavigation: https://developer.chrome.com/docs/extensions/reference/api/webNavigation

Storage / storage.session: https://developer.chrome.com/docs/extensions/reference/api/storage

https://developer.chrome.com/docs/extensions/reference/api/storage#property-StorageArea-session

Sessions: https://developer.chrome.com/docs/extensions/reference/api/sessions

Tab Groups: https://developer.chrome.com/docs/extensions/reference/api/tabGroups

Offscreen (optional): https://developer.chrome.com/docs/extensions/reference/api/offscreen

Idle (optional): https://developer.chrome.com/docs/extensions/reference/api/idle

Lifecycle:
visibilitychange: https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event

pagehide: https://developer.mozilla.org/en-US/docs/Web/API/Window/pagehide_event

pageshow: https://developer.mozilla.org/en-US/docs/Web/API/Window/pageshow_event

BFCache: https://developer.chrome.com/docs/web-platform/bfcache/

Deliver PRs in this order

PR-1: Manifest & settings foundations

public/manifest.json: add "webNavigation", "tabGroups" (optional "idle", and later "unlimitedStorage" if needed).

Register content script src/content/viewport.ts (run_at: "document_idle", <all_urls>).

Add settings flag AUTO_THUMBNAIL_CAPTURE (default true).

PR-2: Background event wiring & scheduler

In src/service-worker.ts, wire webNavigation.onCommitted, onBeforeNavigate, onHistoryStateUpdated, and tabs.onUpdated(status:"complete") (only for active tab).

Create src/services/background/CaptureScheduler.ts (throttle ≥750 ms, dedupe events, skip minimized/occluded windows, never activate other tabs).

PR-3: Thumbnail storage migration

Implement src/services/background/ThumbnailStore.ts (IndexedDB; keep two latest per tab+url; global LRU, TTL 14d).

Migrate any chrome.storage.local thumbnails, then clear legacy key.

PR-4: Content script for viewport

src/content/viewport.ts: save {scrollX,scrollY,vw,vh,dpr} on visibilitychange→hidden and pagehide; restore on pageshow (BFCache aware) using storage.session.

PR-5: UI updates

In src/views/App.tsx, demote “Capture All” to a secondary Refresh.

Update Help copy; show neutral placeholder when none.

PR-6: Tests & docs

Add docs/TEST_CHECKLIST_Thumbnails.md; update README & docs/CHANGELOG.md.

PR-7: Cleanup

Remove tab-switch capture paths; replace unload hooks in SessionSafetyService.

Acceptance criteria (applies to all PRs where relevant)

No programmatic tab activation for capture.

First + final only (one each per epoch).

Viewport restore works after reopen/pageshow (BFCache too).

Opt-out disables auto captures; placeholders shown.

Minimized/occluded windows skipped gracefully.