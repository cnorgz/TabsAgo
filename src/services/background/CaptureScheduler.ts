import type { CaptureKind, CaptureMetadata } from '../../types/thumbnail'

import { thumbnailStore } from './ThumbnailStore'

const CAPTURE_COOLDOWN_MS = 1000 * 60 * 15 // 15 minutes
const MIN_CAPTURE_DELAY_MS = 800
const SUPPORTED_PROTOCOL = /^https?:\/\//i
const QUALITY = 50

export class CaptureScheduler {
  private captureHandler?: (metadata: CaptureMetadata) => Promise<void> | void
  private autoCaptureEnabled = true
  private pendingCaptures = new Map<number, NodeJS.Timeout>()

  async bootstrap() {
    // No-op for stateless scheduler
  }

  setCaptureHandler(handler: (metadata: CaptureMetadata) => Promise<void> | void) {
    this.captureHandler = handler
  }

  setAutoCaptureEnabled(enabled: boolean) {
    this.autoCaptureEnabled = enabled
  }

  async handleTabUpdated(tabId: number, changeInfo: chrome.tabs.OnUpdatedInfo, tab: chrome.tabs.Tab) {
    if (!this.autoCaptureEnabled) return
    if (changeInfo.status === 'complete' && tab.active) {
      this.scheduleCapture(tab.windowId, tabId, tab.url, 'first')
    }
  }

  async handleTabActivated(activeInfo: chrome.tabs.OnActivatedInfo) {
    if (!this.autoCaptureEnabled) return
    try {
      const tab = await chrome.tabs.get(activeInfo.tabId)
      if (tab.status === 'complete' && tab.active) {
        // We use 'final' here as a legacy indicator for "update", or just to refresh stale thumbs
        this.scheduleCapture(activeInfo.windowId, activeInfo.tabId, tab.url, 'final')
      }
    } catch {
      // Tab might have closed immediately
    }
  }

  async handleWindowFocusChanged(windowId: number) {
    if (windowId === chrome.windows.WINDOW_ID_NONE || !this.autoCaptureEnabled) return
    try {
      const tabs = await chrome.tabs.query({ windowId, active: true })
      const tab = tabs[0]
      if (tab && tab.id && tab.status === 'complete') {
        this.scheduleCapture(windowId, tab.id, tab.url, 'final')
      }
    } catch {
      // ignore
    }
  }

  private scheduleCapture(windowId: number, tabId: number, url: string | undefined, kind: CaptureKind) {
    if (this.pendingCaptures.has(tabId)) {
      clearTimeout(this.pendingCaptures.get(tabId))
    }

    const timeout = setTimeout(() => {
      this.pendingCaptures.delete(tabId)
      void this.executeCapture(windowId, tabId, url, kind)
    }, MIN_CAPTURE_DELAY_MS)

    this.pendingCaptures.set(tabId, timeout)
  }

  private async executeCapture(windowId: number, tabId: number, url: string | undefined, kind: CaptureKind) {
    if (!url || !SUPPORTED_PROTOCOL.test(url)) return

    try {
      // 1. Check if tab is still active and valid
      const tab = await chrome.tabs.get(tabId)
      if (!tab.active || tab.windowId !== windowId || tab.url !== url) {
        return // User switched away
      }

      // 2. Check freshness (Stateless check!)
      // If we have a very recent capture, skip unless it's a "final" (forced update) or different URL
      // Actually, even for 'final', we don't want to spam if we just captured 5 seconds ago.
      const lastRecord = await thumbnailStore.getLatestRecord(tabId, url)
      if (lastRecord) {
        const age = Date.now() - lastRecord.capturedAt
        // If it's fresh enough (< 15 mins), skip.
        // But if it's a 'first' capture attempt and we already have one from < 15 mins, skip.
        if (age < CAPTURE_COOLDOWN_MS) {
           return
        }
      }

      // 3. Capture
      // Ensure the window is focused or at least we can capture it. 
      // captureVisibleTab works on the *active* tab of the *specified* window.
      // We already checked tab.active above.
      
      const dataUrl = await chrome.tabs.captureVisibleTab(windowId, { format: 'jpeg', quality: QUALITY })

      const metadata: CaptureMetadata = {
        tabId,
        windowId,
        url,
        kind,
        dataUrl,
      }

      if (this.captureHandler) {
        await this.captureHandler(metadata)
      } else {
        await thumbnailStore.putCapture(metadata)
      }
      
    } catch (error: unknown) {
        // Common errors: "Tabs cannot be edited...", "The tab was closed", etc.
        // We just ignore them.
        const msg = error instanceof Error ? error.message : String(error)
        if (!msg.includes('closed') && !msg.includes('drag')) {
             console.debug('Capture failed', msg)
        }
    }
  }
}

export const captureScheduler = new CaptureScheduler()
