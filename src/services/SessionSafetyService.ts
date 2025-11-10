import { TabItem } from '../types/Tab'
import { STORAGE_KEYS } from '../constants/storage'

import { StorageService } from './StorageService'

export const SessionSafetyService = {
  /**
   * Setup session safety features
   * - Add beforeunload listener for confirm dialog
   * - Auto-save tabs on window close
   */
  setup() {
    // Add beforeunload listener for confirm dialog
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this))

    // Auto-save on window close (without confirmation)
    window.addEventListener('unload', this.handleWindowUnload.bind(this))
  },

  /**
   * Handle beforeunload event - show confirm dialog
   */
  async handleBeforeUnload(event: BeforeUnloadEvent) {
    // Only show confirm dialog if user has tabs in TabsAGO
    const storedTabs = await StorageService.get<TabItem[]>(STORAGE_KEYS.tabs)
    if (storedTabs && storedTabs.length > 0) {
      const message = 'Are you sure you want to close this window? This will close all tabs in Chrome.'
      event.preventDefault()
      event.returnValue = message
      return message
    }
  },

  /**
   * Handle window unload - auto-save current tabs to lifeboat
   */
  async handleWindowUnload() {
    try {
      // Capture current window tabs and save to lifeboat
      const currentTabs = await this.captureCurrentTabs()
      if (currentTabs.length > 0) {
        await StorageService.set(STORAGE_KEYS.lifeboat, currentTabs)
        await StorageService.set(STORAGE_KEYS.showLifeboat, true)
      }
    } catch (error) {
      console.error('Failed to save lifeboat tabs:', error)
    }
  },

  /**
   * Capture current window tabs for lifeboat
   */
  async captureCurrentTabs(): Promise<TabItem[]> {
    try {
      const all = await chrome.tabs.query({ currentWindow: true })
      const filtered = all.filter(t => t.url && !t.url.includes('chrome-extension://'))

      return filtered.map(t => ({
        id: `lifeboat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: t.title || 'Untitled',
        url: t.url!,
        favicon: t.favIconUrl || '',
        capturedAt: new Date().toISOString(),
        domain: t.url ? new URL(t.url).hostname : 'Unknown',
        lastAccessed: typeof t.lastAccessed === 'number' ? t.lastAccessed : undefined,
      }))
    } catch (error) {
      console.error('Failed to capture current tabs:', error)
      return []
    }
  },

  /**
   * Get lifeboat tabs
   */
  async getLifeboatTabs(): Promise<TabItem[]> {
    return (await StorageService.get<TabItem[]>(STORAGE_KEYS.lifeboat)) || []
  },

  /**
   * Clear lifeboat tabs
   */
  async clearLifeboat(): Promise<void> {
    await StorageService.set(STORAGE_KEYS.lifeboat, [])
    await StorageService.set(STORAGE_KEYS.showLifeboat, false)
  },

  /**
   * Check if lifeboat should be shown
   */
  async shouldShowLifeboat(): Promise<boolean> {
    return (await StorageService.get<boolean>(STORAGE_KEYS.showLifeboat)) || false
  },

  /**
   * Restore lifeboat tabs to main storage
   */
  async restoreLifeboatToMain(): Promise<TabItem[]> {
    try {
      const lifeboatTabs = await this.getLifeboatTabs()
      const existingTabs = (await StorageService.get<TabItem[]>(STORAGE_KEYS.tabs)) || []

      // Merge lifeboat tabs with existing tabs (avoid duplicates)
      const existingUrls = new Set(existingTabs.map(t => t.url))
      const merged = [...existingTabs]

      for (const tab of lifeboatTabs) {
        if (!existingUrls.has(tab.url)) {
          merged.push(tab)
        }
      }

      await StorageService.set(STORAGE_KEYS.tabs, merged)
      await this.clearLifeboat()

      return merged
    } catch (error) {
      console.error('Failed to restore lifeboat tabs:', error)
      throw error
    }
  }
}
