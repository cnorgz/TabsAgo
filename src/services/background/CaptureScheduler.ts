import type { CaptureKind, CaptureMetadata } from '../../types/thumbnail'

interface VisitEpoch {
  tabId: number
  url: string
  epochStart: number
  firstCompleted: boolean
  finalCompleted: boolean
  firstPending: boolean
  finalPending: boolean
}

interface CaptureRequest {
  tabId: number
  windowId: number
  url: string
  kind: CaptureKind
}

const MIN_CAPTURE_INTERVAL_MS = 750
const SUPPORTED_PROTOCOL = /^https?:\/\//i

export class CaptureScheduler {
  private visitEpochs = new Map<number, VisitEpoch>()
  private tabWindows = new Map<number, number>()
  private activeTabsByWindow = new Map<number, number>()
  private windowVisibility = new Map<number, { minimized: boolean }>()
  private captureQueue: CaptureRequest[] = []
  private processingQueue = false
  private focusedWindowId: number | null = null
  private lastCaptureAt = 0
  private captureHandler?: (metadata: CaptureMetadata) => Promise<void> | void

  async bootstrap() {
    try {
      const windows = await chrome.windows.getAll({ populate: true })
      for (const win of windows) {
        if (win.id == null) continue
        this.windowVisibility.set(win.id, { minimized: win.state === 'minimized' })
        if (win.focused) {
          this.focusedWindowId = win.id
        }
        if (!win.tabs) continue
        const activeTab = win.tabs.find((tab) => tab.active)
        if (activeTab?.id != null) {
          this.activeTabsByWindow.set(win.id, activeTab.id)
          this.tabWindows.set(activeTab.id, win.id)
          const url = activeTab.url ?? ''
          if (url) {
            this.startEpoch(activeTab.id, url)
          }
        }
      }
    } catch (error) {
      console.warn('CaptureScheduler bootstrap failed', error)
    }
  }

  setCaptureHandler(handler: (metadata: CaptureMetadata) => Promise<void> | void) {
    this.captureHandler = handler
  }

  async handleWindowFocusChanged(windowId: number) {
    const previousFocused = this.focusedWindowId
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
      this.focusedWindowId = null
      if (previousFocused != null) {
        const prevTabId = this.activeTabsByWindow.get(previousFocused)
        if (prevTabId != null) {
          await this.scheduleFinalCapture(prevTabId)
        }
      }
      return
    }

    await this.refreshWindowState(windowId)
    this.focusedWindowId = windowId
    if (previousFocused != null && previousFocused !== windowId) {
      const prevTabId = this.activeTabsByWindow.get(previousFocused)
      if (prevTabId != null) {
        await this.scheduleFinalCapture(prevTabId)
      }
    }
  }

  async handleTabActivated(activeInfo: chrome.tabs.OnActivatedInfo) {
    const prevTabId = this.activeTabsByWindow.get(activeInfo.windowId)
    if (prevTabId != null && prevTabId !== activeInfo.tabId) {
      await this.scheduleFinalCapture(prevTabId)
    }

    this.activeTabsByWindow.set(activeInfo.windowId, activeInfo.tabId)
    this.tabWindows.set(activeInfo.tabId, activeInfo.windowId)
    await this.ensureEpochFromTab(activeInfo.tabId)
  }

  async handleTabUpdated(tabId: number, changeInfo: chrome.tabs.OnUpdatedInfo, tab?: chrome.tabs.Tab) {
    if (tab?.windowId != null) {
      this.tabWindows.set(tabId, tab.windowId)
    }
    const updatedUrl = changeInfo.url ?? tab?.url
    if (updatedUrl) {
      this.updateEpochUrl(tabId, updatedUrl)
    }
    if (changeInfo.status === 'complete') {
      await this.scheduleFirstCapture(tabId)
    }
  }

  async handleNavigationCommitted(details: chrome.webNavigation.WebNavigationTransitionCallbackDetails) {
    if (details.frameId !== 0) return
    this.startEpoch(details.tabId, details.url)
  }

  async handleHistoryStateUpdated(details: chrome.webNavigation.WebNavigationTransitionCallbackDetails) {
    if (details.frameId !== 0) return
    await this.scheduleFinalCapture(details.tabId)
    this.startEpoch(details.tabId, details.url)
    setTimeout(() => {
      void this.scheduleFirstCapture(details.tabId)
    }, 100)
  }

  async handleBeforeNavigate(details: chrome.webNavigation.WebNavigationFramedCallbackDetails) {
    if (details.frameId !== 0) return
    await this.scheduleFinalCapture(details.tabId)
  }

  async handleTabRemoved(tabId: number) {
    this.visitEpochs.delete(tabId)
    const windowId = this.tabWindows.get(tabId)
    this.tabWindows.delete(tabId)
    if (windowId != null) {
      const activeTab = this.activeTabsByWindow.get(windowId)
      if (activeTab === tabId) {
        this.activeTabsByWindow.delete(windowId)
      }
    }
  }

  private startEpoch(tabId: number, url: string) {
    if (!url || !this.isSupportedUrl(url)) {
      this.visitEpochs.delete(tabId)
      return
    }
    const epoch: VisitEpoch = {
      tabId,
      url,
      epochStart: Date.now(),
      firstCompleted: false,
      finalCompleted: false,
      firstPending: false,
      finalPending: false,
    }
    this.visitEpochs.set(tabId, epoch)
  }

  private updateEpochUrl(tabId: number, url: string) {
    if (!url) return
    const epoch = this.visitEpochs.get(tabId)
    if (!epoch) {
      this.startEpoch(tabId, url)
      return
    }
    epoch.url = url
  }

  private async ensureEpochFromTab(tabId: number) {
    const epoch = this.visitEpochs.get(tabId)
    if (epoch?.url) return
    try {
      const tab = await chrome.tabs.get(tabId)
      if (tab.url) {
        this.startEpoch(tabId, tab.url)
      }
      if (tab.windowId != null) {
        this.tabWindows.set(tabId, tab.windowId)
      }
    } catch (error) {
      console.warn('Failed to ensure epoch for tab', tabId, error)
    }
  }

  private async refreshWindowState(windowId: number) {
    try {
      const win = await chrome.windows.get(windowId)
      this.windowVisibility.set(windowId, { minimized: win.state === 'minimized' })
    } catch (error) {
      console.warn('Unable to inspect window state', windowId, error)
      this.windowVisibility.set(windowId, { minimized: false })
    }
  }

  private isWindowEligible(windowId: number | undefined) {
    if (windowId == null || windowId === chrome.windows.WINDOW_ID_NONE) return false
    if (this.focusedWindowId == null) return false
    if (this.focusedWindowId !== windowId) return false
    const visibility = this.windowVisibility.get(windowId)
    if (!visibility || visibility.minimized) return false
    return true
  }

  private async scheduleFirstCapture(tabId: number) {
    const epoch = this.visitEpochs.get(tabId)
    if (!epoch || epoch.firstCompleted || epoch.firstPending || !this.isSupportedUrl(epoch.url)) return
    if (!(await this.ensureTabActive(tabId))) return
    epoch.firstPending = true
    const windowId = this.tabWindows.get(tabId)
    if (windowId == null || windowId === chrome.windows.WINDOW_ID_NONE) {
      epoch.firstPending = false
      return
    }
    this.enqueueCapture({ tabId, windowId, url: epoch.url, kind: 'first' })
  }

  private async scheduleFinalCapture(tabId: number) {
    const epoch = this.visitEpochs.get(tabId)
    if (!epoch || epoch.finalCompleted || epoch.finalPending || !this.isSupportedUrl(epoch.url)) return
    if (!(await this.ensureTabActive(tabId))) return
    epoch.finalPending = true
    const windowId = this.tabWindows.get(tabId)
    if (windowId == null || windowId === chrome.windows.WINDOW_ID_NONE) {
      epoch.finalPending = false
      return
    }
    this.enqueueCapture({ tabId, windowId, url: epoch.url, kind: 'final' })
  }

  private enqueueCapture(request: CaptureRequest) {
    const exists = this.captureQueue.some((queued) => queued.tabId === request.tabId && queued.kind === request.kind)
    if (exists) return
    this.captureQueue.push(request)
    this.processQueue().catch((error) => {
      console.error('Capture queue failure', error)
    })
  }

  private async processQueue() {
    if (this.processingQueue) return
    this.processingQueue = true
    while (this.captureQueue.length > 0) {
      const request = this.captureQueue.shift()
      if (!request) {
        break
      }
      const epoch = this.visitEpochs.get(request.tabId)
      if (!epoch) {
        continue
      }
      if (!this.isWindowEligible(request.windowId)) {
        this.resetPending(epoch, request.kind)
        continue
      }
      const now = Date.now()
      const elapsed = now - this.lastCaptureAt
      if (elapsed < MIN_CAPTURE_INTERVAL_MS) {
        await this.delay(MIN_CAPTURE_INTERVAL_MS - elapsed)
      }
      const success = await this.executeCapture(request)
      this.lastCaptureAt = Date.now()
      if (success) {
        this.markCompleted(epoch, request.kind)
      } else {
        this.resetPending(epoch, request.kind)
      }
    }
    this.processingQueue = false
  }

  private markCompleted(epoch: VisitEpoch, kind: CaptureKind) {
    if (kind === 'first') {
      epoch.firstCompleted = true
      epoch.firstPending = false
    } else {
      epoch.finalCompleted = true
      epoch.finalPending = false
    }
  }

  private resetPending(epoch: VisitEpoch, kind: CaptureKind) {
    if (kind === 'first') {
      epoch.firstPending = false
    } else {
      epoch.finalPending = false
    }
  }

  private async executeCapture(request: CaptureRequest) {
    try {
      const currentActive = this.activeTabsByWindow.get(request.windowId)
      if (currentActive !== request.tabId) {
        return false
      }
      const dataUrl = await this.captureVisibleTab(request.windowId)
      const metadata: CaptureMetadata = {
        tabId: request.tabId,
        windowId: request.windowId,
        url: request.url,
        kind: request.kind,
        dataUrl,
      }
      if (this.captureHandler) {
        await this.captureHandler(metadata)
      }
      console.info('[CaptureScheduler]', request.kind, 'capture scheduled for', request.tabId, request.url)
      try {
        await chrome.runtime.sendMessage({
          type: 'CAPTURE_SCHEDULED',
          kind: request.kind,
          tabId: request.tabId,
          url: request.url,
        })
      } catch (error) {
        console.debug('CAPTURE_SCHEDULED message not handled', error)
      }
      return true
    } catch (error) {
      console.warn('Capture failed', error)
      return false
    }
  }

  private async ensureTabActive(tabId: number) {
    let windowId = this.tabWindows.get(tabId)
    if (windowId == null) {
      try {
        const tab = await chrome.tabs.get(tabId)
        if (tab.windowId != null) {
          this.tabWindows.set(tabId, tab.windowId)
          if (tab.active) {
            this.activeTabsByWindow.set(tab.windowId, tabId)
          }
          windowId = tab.windowId
          if (!tab.active || !this.isWindowEligible(windowId)) {
            return false
          }
          return true
        }
      } catch {
        return false
      }
    }
    if (windowId == null || !this.isWindowEligible(windowId)) {
      return false
    }
    const activeTabId = this.activeTabsByWindow.get(windowId)
    return activeTabId === tabId
  }

  private delay(ms: number) {
    return new Promise<void>((resolve) => setTimeout(resolve, ms))
  }

  private captureVisibleTab(windowId: number) {
    return new Promise<string>((resolve, reject) => {
      chrome.tabs.captureVisibleTab(windowId, { format: 'jpeg', quality: 80 }, (dataUrl) => {
        if (chrome.runtime.lastError || !dataUrl) {
          reject(chrome.runtime.lastError ?? new Error('captureVisibleTab failed'))
          return
        }
        resolve(dataUrl)
      })
    })
  }

  private isSupportedUrl(url: string) {
    return SUPPORTED_PROTOCOL.test(url)
  }
}

export const captureScheduler = new CaptureScheduler()
