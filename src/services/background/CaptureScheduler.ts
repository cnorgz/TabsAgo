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
      const lastRecord = await thumbnailStore.getLatestRecord(tabId, url)
      if (lastRecord) {
        const age = Date.now() - lastRecord.capturedAt
        if (age < CAPTURE_COOLDOWN_MS) {
           return
        }
      }

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
        const msg = error instanceof Error ? error.message : String(error)
        // Log errors that aren't expected interruptions
        if (!msg.includes('closed') && !msg.includes('drag')) {
             console.error(`[CaptureScheduler] Capture FAILED: ${msg}`)
        }
    }
  }
}

export const captureScheduler = new CaptureScheduler()
