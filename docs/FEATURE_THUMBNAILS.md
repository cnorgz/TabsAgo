# Feature: Thumbnail Capture & Preview

**Status**: ✅ Active / Stable
**Last Updated**: Dec 8, 2025

## Overview
TabsAGO automatically captures low-res screenshots (thumbnails) of tabs as you browse. These thumbnails are displayed when you hover over a tab in the TabsAGO manager (List or Grid view).

The feature is designed to be **non-invasive**, **stateless**, and **performance-conscious**.

## Architecture

### 1. Capture Scheduler (`CaptureScheduler.ts`)
The scheduler is a background service that decides *when* to take a screenshot.
- **Triggers**: Listens to `chrome.tabs.onUpdated` (when a page finishes loading) and `chrome.tabs.onActivated` (when you switch tabs).
- **Stateless**: Does not track "epochs" or complex session history. It simply checks the database for freshness.
- **Cooldown**: Enforces a strict **15-minute cooldown** per URL/TabID pair. If a valid thumbnail exists and is younger than 15 minutes, the capture is skipped. This prevents high CPU usage during browsing.
- **API**: Uses `chrome.tabs.captureVisibleTab` (JPEG, Quality 50) to minimize memory footprint.

### 2. Thumbnail Store (`ThumbnailStore.ts`)
The storage layer manages persistence.
- **Backend**: Uses **IndexedDB** (via `idb` pattern) to store binary Blobs. We do NOT use `chrome.storage.local` for images to avoid quota limits.
- **Normalization**: Resizes images to a max of 800x500px before storing.
- **Retrieval Logic (Important)**:
    - Primary: Match by `[TabID, URL]`.
    - Fallback: If TabID is missing (e.g., imported/grabbed tabs where ID is 0), it falls back to finding the most recent capture for that `URL`.

### 3. UI Display (`ThumbnailPreview.tsx`)
- **Interaction**: Displays on `onMouseEnter` of a tab row/card.
- **Performance**: Does **not** track mouse movement coordinates to avoid React re-renders. It appears at a fixed position relative to the cursor entry point.
- **Data Fetching**: Sends a `THUMBS_GET_LATEST` message to the Service Worker. The Service Worker queries IndexedDB and returns a `dataUrl` (base64).

## Configuration
- **Auto-Capture**: Can be toggled in the Help/Settings modal.
- **Quality**: Customizable (default 50%).
- **Cache**: Users can manually "Clear Cache" via the UI, which wipes the IndexedDB store.

## Known Limitations / Trade-offs
- **Active Tab Only**: Chrome only allows capturing the *visible* tab. We cannot capture background tabs. Thumbnails are only generated when you actually visit the tab.
- **Protected Pages**: Cannot capture `chrome://` URLs or the Chrome Web Store (browser restriction).
- **"Grabbed" Tabs**: Tabs imported via "Grab Tabs" will show thumbnails *only* if you have previously visited that URL while the extension was running. It does not go out and capture them actively (which would require activating each tab).
