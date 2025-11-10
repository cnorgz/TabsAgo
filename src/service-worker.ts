import { TabService } from './services/TabService'
import { StorageService } from './services/StorageService'
import { STORAGE_KEYS } from './constants/storage'
import { CONTEXT_MENU_IDS, COMMAND_IDS } from './constants/ids'
import type { TabItem } from './types/Tab'

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

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === 'CREATE_TAB' && typeof message.url === 'string') {
    chrome.tabs.create({ url: message.url, active: true })
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


