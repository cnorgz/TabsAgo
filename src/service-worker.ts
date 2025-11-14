import { TabService } from './services/TabService'
import { StorageService } from './services/StorageService'
import { STORAGE_KEYS } from './constants/storage'
import { CONTEXT_MENU_IDS, COMMAND_IDS } from './constants/ids'
import type { TabItem } from './types/Tab'
import { captureScheduler } from './services/background/CaptureScheduler'
import { thumbnailStore } from './services/background/ThumbnailStore'
import { PREF_KEYS, PREF_DEFAULTS } from './constants/prefs'

const VIEWPORT_SAVE = 'VIEWPORT_SAVE'
const VIEWPORT_REQUEST = 'VIEWPORT_REQUEST'
const VIEWPORT_RESTORE = 'VIEWPORT_RESTORE'
const VIEWPORT_KEY_PREFIX = 'vps'
const AUTO_CAPTURE_PREF_KEY = PREF_KEYS.AUTO_THUMBNAIL_CAPTURE

let autoCaptureEnabled: boolean = PREF_DEFAULTS[AUTO_CAPTURE_PREF_KEY]

const appUrl = chrome.runtime.getURL('index.html')

async function openOrFocusAppTab(options: { pinned?: boolean; active?: boolean } = {}) {
  const existing = await chrome.tabs.query({ url: appUrl })
  if (existing.length > 0) {
    const tab = existing[0]
    if (tab.id) {
      await chrome.tabs.update(tab.id, { active: true })
      if (tab.windowId !== undefined) {
        await chrome.windows.update(tab.windowId, { focused: true })
      }
    }
    return
  }
  await chrome.tabs.create({ url: appUrl, pinned: options.pinned ?? true, active: options.active ?? true })
}

chrome.runtime.onInstalled.addListener(() => {
  openOrFocusAppTab({ pinned: true, active: false })
  // Create context menu to send selected tabs to TabsAGO
  try { chrome.contextMenus.removeAll() } catch { /* ignore */ }
  chrome.contextMenus.create({ id: CONTEXT_MENU_IDS.sendSelected, title: 'Send highlighted tabs to TabsAGO', contexts: ['action', 'page'] })
})

// Ensure the pinned TabsAGO tab is present after a browser restart
chrome.runtime.onStartup.addListener(() => {
  openOrFocusAppTab({ pinned: true, active: false })
})

thumbnailStore.initialize().catch((error) => {
  console.error('ThumbnailStore initialization error', error)
})

captureScheduler.setCaptureHandler(async (metadata) => {
  await thumbnailStore.putCapture(metadata)
})

captureScheduler.bootstrap().catch((error) => {
  console.error('CaptureScheduler bootstrap error', error)
})

initializeAutoCapturePref().catch((error) => {
  console.error('Failed to initialize auto capture pref', error)
})

chrome.action.onClicked.addListener(() => {
  openOrFocusAppTab({ pinned: true, active: true })
})

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== COMMAND_IDS.captureSelectedTabs) return
  // NOTE: Known issue: in some environments highlighted tabs are not detected reliably.
  // Deferred fix tracked in docs/CODE_AUDIT.md (Keyboard + highlighted selection capture).
  const mapped = await TabService.captureCurrentWindowTabs({ onlyHighlightedIfAny: true })
  await TabService.appendCapturedTabs(mapped)
  openOrFocusAppTab({ pinned: true, active: true })
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'CREATE_TAB' && typeof message.url === 'string') {
    chrome.tabs.create({ url: message.url, active: true })
    return
  }
  if (message?.type === VIEWPORT_SAVE) {
    void handleViewportSave(message.payload, sender)
    return
  }
  if (message?.type === VIEWPORT_REQUEST) {
    handleViewportRequest(message.payload, sender, sendResponse)
      .catch((error) => {
        console.error('Failed to handle viewport restore', error)
        sendResponse({ type: VIEWPORT_RESTORE, payload: { scrollX: 0, scrollY: 0 } })
      })
    return true
  }
})

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'local') return
  if (Object.prototype.hasOwnProperty.call(changes, AUTO_CAPTURE_PREF_KEY)) {
    const change = changes[AUTO_CAPTURE_PREF_KEY]
    autoCaptureEnabled = change.newValue !== false
  }
})

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== CONTEXT_MENU_IDS.sendSelected) return
  // NOTE: Same highlighted detection issue as keyboard command; see docs/CODE_AUDIT.md backlog.
  const mapped = await TabService.captureCurrentWindowTabs({ onlyHighlightedIfAny: true })
  await TabService.appendCapturedTabs(mapped)
  openOrFocusAppTab({ pinned: true, active: true })
})

// Auto-capture tabs when window is closing
chrome.windows.onRemoved.addListener(async () => {
  try {
    // Check if auto-capture is enabled
    const autoCapture = await StorageService.get<boolean>(STORAGE_KEYS.autoCaptureOnClose)
    if (autoCapture === false) return // Skip if explicitly disabled
    
    // Get all remaining windows
    const remainingWindows = await chrome.windows.getAll()
    
    // If this was the last window, don't capture (browser is closing completely)
    if (remainingWindows.length === 0) return
    
    const storedSnapshots = await StorageService.get<TabItem[]>(STORAGE_KEYS.tabSave)
    if (!storedSnapshots?.length) {
      return
    }
    
    // TODO: Implement auto-capture by tracking tabs before window closes.
    // Placeholder intentionally left for future implementation tracked in docs/CODE_AUDIT.md.
    
  } catch (error) {
    console.error('Failed to auto-capture tabs on window close:', error)
  }
})

chrome.tabs.onActivated.addListener((activeInfo) => {
  captureScheduler.handleTabActivated(activeInfo).catch((error) => {
    console.error('Failed to process tab activation', error)
  })
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  captureScheduler.handleTabUpdated(tabId, changeInfo, tab).catch((error) => {
    console.error('Failed to process tab update', error)
  })
})

chrome.tabs.onRemoved.addListener((tabId) => {
  captureScheduler.handleTabRemoved(tabId).catch((error) => {
    console.error('Failed to cleanup removed tab', error)
  })
})

chrome.windows.onFocusChanged.addListener((windowId) => {
  captureScheduler.handleWindowFocusChanged(windowId).catch((error) => {
    console.error('Failed to process window focus change', error)
  })
})

chrome.webNavigation.onCommitted.addListener((details) => {
  captureScheduler.handleNavigationCommitted(details).catch((error) => {
    console.error('Failed to process navigation commit', error)
  })
})

chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
  captureScheduler.handleHistoryStateUpdated(details).catch((error) => {
    console.error('Failed to process history state update', error)
  })
})

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
captureScheduler.handleBeforeNavigate(details).catch((error) => {
  console.error('Failed to process before navigate', error)
})
})

async function initializeAutoCapturePref() {
  try {
    const stored = await chrome.storage.local.get(AUTO_CAPTURE_PREF_KEY)
    const value = stored?.[AUTO_CAPTURE_PREF_KEY]
    autoCaptureEnabled = value !== false
  } catch (error) {
    console.error('Failed to read auto capture pref', error)
    autoCaptureEnabled = true
  }
}

async function handleViewportSave(payload: any, sender: chrome.runtime.MessageSender) {
  if (!autoCaptureEnabled) return
  const tabId = sender.tab?.id
  const url = typeof payload?.url === 'string' ? payload.url : ''
  if (tabId == null || !url) return
  const key = getViewportKey(tabId, url)
  const data = {
    scrollX: Number(payload?.scrollX) || 0,
    scrollY: Number(payload?.scrollY) || 0,
    vw: Number(payload?.vw) || 0,
    vh: Number(payload?.vh) || 0,
    dpr: Number(payload?.dpr) || 1,
    ts: Number(payload?.ts) || Date.now(),
  }
  try {
    await chrome.storage.session.set({ [key]: data })
  } catch (error) {
    console.warn('Failed to save viewport state', error)
  }
}

async function handleViewportRequest(
  payload: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: any) => void,
) {
  const defaultPayload = { scrollX: 0, scrollY: 0 }
  if (!autoCaptureEnabled) {
    sendResponse({ type: VIEWPORT_RESTORE, payload: defaultPayload })
    return
  }
  const tabId = sender.tab?.id
  const url = typeof payload?.url === 'string' ? payload.url : ''
  if (tabId == null || !url) {
    sendResponse({ type: VIEWPORT_RESTORE, payload: defaultPayload })
    return
  }
  const key = getViewportKey(tabId, url)
  try {
    const stored = await chrome.storage.session.get(key)
    const value = stored?.[key]
    if (value) {
      sendResponse({ type: VIEWPORT_RESTORE, payload: { scrollX: value.scrollX ?? 0, scrollY: value.scrollY ?? 0 } })
      return
    }
  } catch (error) {
    console.warn('Failed to read viewport state', error)
  }
  sendResponse({ type: VIEWPORT_RESTORE, payload: defaultPayload })
}

const getViewportKey = (tabId: number, url: string) => `${VIEWPORT_KEY_PREFIX}:${tabId}:${url}`
