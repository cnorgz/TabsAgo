/**
 * ThumbnailService - Clean rebuild
 * Captures and manages tab screenshots/thumbnails
 * 
 * Core Design Principles:
 * - Only captures the active/visible tab (chrome.tabs.captureVisibleTab)
 * - Stores thumbnails in chrome.storage.local with LRU eviction
 * - Provides explicit methods for capture, retrieval, and cache management
 * - Uses tab ID as primary key for thumbnail storage
 */

const THUMBNAIL_STORAGE_KEY = 'tabsago_thumbnails'
const MAX_THUMBNAILS = 100 // LRU limit to prevent storage overflow

interface ThumbnailData {
  tabId: string
  dataUrl: string
  capturedAt: number
}

interface ThumbnailCache {
  [tabId: string]: ThumbnailData
}

export class ThumbnailService {
  /**
   * Capture screenshot of the currently active/visible tab
   * @param tabId - The ID of the tab being captured
   * @param quality - JPEG quality (20-100, default 70)
   * @returns Data URL of captured thumbnail or null on failure
   */
  static async captureActiveTab(tabId: string, quality: number = 70): Promise<string | null> {
    try {
      const currentWindow = await chrome.windows.getCurrent()
      
      if (!currentWindow.id) {
        console.error('ThumbnailService: No window ID available')
        return null
      }
      
      const dataUrl = await chrome.tabs.captureVisibleTab(currentWindow.id, {
        format: 'jpeg',
        quality: Math.max(20, Math.min(100, quality))
      })

      await this.storeThumbnail(tabId, dataUrl)
      return dataUrl
    } catch (error) {
      console.error('ThumbnailService: Failed to capture tab thumbnail:', error)
      return null
    }
  }

  /**
   * Capture screenshots for all tabs in current window
   * This is a disruptive operation that switches between tabs
   * @param onProgress - Optional callback for progress updates
   * @param quality - JPEG quality (20-100, default 70)
   * @returns Statistics object with success/failed/skipped counts
   */
  // Deprecated: manual capture has been removed from the UI. Retained for potential debugging only.
  static async captureAllTabsInWindow(
    onProgress?: (current: number, total: number) => void,
    quality: number = 70
  ): Promise<{ success: number; failed: number; skipped: number }> {
    const stats = { success: 0, failed: 0, skipped: 0 }
    
    try {
      const currentWindow = await chrome.windows.getCurrent()
      const tabs = await chrome.tabs.query({ windowId: currentWindow.id })
      
      // Remember original active tab to restore later
      const originalTab = tabs.find(t => t.active)
      
      // Filter to capturable tabs only
      const capturableTabs = tabs.filter(tab => 
        tab.id && 
        !tab.discarded && 
        tab.url && 
        !tab.url.startsWith('chrome://') &&
        !tab.url.startsWith('chrome-extension://') &&
        !tab.url.startsWith('about:')
      )
      
      // Capture each tab sequentially
      for (let i = 0; i < capturableTabs.length; i++) {
        const tab = capturableTabs[i]
        
        try {
          // Switch to tab and wait for it to be visible
          await chrome.tabs.update(tab.id!, { active: true })
          await new Promise(resolve => setTimeout(resolve, 300))
          
          // Capture the now-visible tab
          const result = await this.captureActiveTab(String(tab.id), quality)
          
          if (result) {
            stats.success++
          } else {
            stats.failed++
          }
          
          // Report progress
          if (onProgress) {
            onProgress(i + 1, capturableTabs.length)
          }
        } catch (error) {
          console.warn(`ThumbnailService: Failed to capture tab ${tab.id}:`, error)
          stats.failed++
        }
      }
      
      stats.skipped = tabs.length - capturableTabs.length
      
      // Restore original active tab
      if (originalTab?.id) {
        await chrome.tabs.update(originalTab.id, { active: true })
      }
      
      return stats
    } catch (error) {
      console.error('ThumbnailService: Failed to capture all thumbnails:', error)
      return stats
    }
  }

  /**
   * Capture on-demand for a specific tab (with optional focus)
   * @param tabId - The tab ID to capture
   * @param shouldFocus - Whether to switch to the tab before capture (default true)
   * @param quality - JPEG quality (20-100, default 70)
   * @returns Data URL of captured thumbnail or null on failure
   */
  static async captureTabById(
    tabId: number,
    shouldFocus: boolean = true,
    quality: number = 70
  ): Promise<string | null> {
    try {
      if (shouldFocus) {
        await chrome.tabs.update(tabId, { active: true })
        await new Promise(resolve => setTimeout(resolve, 300))
      }
      
      return await this.captureActiveTab(String(tabId), quality)
    } catch (error) {
      console.error(`ThumbnailService: Failed to capture tab ${tabId}:`, error)
      return null
    }
  }

  /**
   * Store thumbnail in cache with LRU eviction
   * @param tabId - The tab ID
   * @param dataUrl - The thumbnail data URL
   */
  static async storeThumbnail(tabId: string, dataUrl: string): Promise<void> {
    try {
      const cache = await this.getThumbnailCache()
      
      // Add/update thumbnail
      cache[tabId] = {
        tabId,
        dataUrl,
        capturedAt: Date.now()
      }

      // Implement LRU eviction if cache exceeds max size
      const entries = Object.values(cache)
      if (entries.length > MAX_THUMBNAILS) {
        const sorted = entries.sort((a, b) => a.capturedAt - b.capturedAt)
        const toRemove = sorted.slice(0, entries.length - MAX_THUMBNAILS)
        toRemove.forEach(item => delete cache[item.tabId])
      }

      await chrome.storage.local.set({ [THUMBNAIL_STORAGE_KEY]: cache })
    } catch (error) {
      console.error('ThumbnailService: Failed to store thumbnail:', error)
    }
  }

  /**
   * Get thumbnail for a specific tab
   * @param tabId - The tab ID
   * @returns Thumbnail data URL or null if not found
   */
  static async getThumbnail(tabId: string): Promise<string | null> {
    try {
      const cache = await this.getThumbnailCache()
      return cache[tabId]?.dataUrl || null
    } catch (error) {
      console.error('ThumbnailService: Failed to get thumbnail:', error)
      return null
    }
  }

  /**
   * Get all thumbnails from cache
   * @returns Complete thumbnail cache
   */
  static async getThumbnailCache(): Promise<ThumbnailCache> {
    try {
      const result = await chrome.storage.local.get(THUMBNAIL_STORAGE_KEY)
      return result[THUMBNAIL_STORAGE_KEY] || {}
    } catch (error) {
      console.error('ThumbnailService: Failed to get thumbnail cache:', error)
      return {}
    }
  }

  /**
   * Clear thumbnail for specific tab
   * @param tabId - The tab ID to clear
   */
  static async clearThumbnail(tabId: string): Promise<void> {
    try {
      const cache = await this.getThumbnailCache()
      delete cache[tabId]
      await chrome.storage.local.set({ [THUMBNAIL_STORAGE_KEY]: cache })
    } catch (error) {
      console.error('ThumbnailService: Failed to clear thumbnail:', error)
    }
  }

  /**
   * Clear all thumbnails from cache
   */
  static async clearAllThumbnails(): Promise<void> {
    try {
      await chrome.storage.local.remove(THUMBNAIL_STORAGE_KEY)
    } catch (error) {
      console.error('ThumbnailService: Failed to clear all thumbnails:', error)
    }
  }

  /**
   * Get cache size information
   * @returns Object with count and estimated size
   */
  static async getCacheInfo(): Promise<{ count: number; estimatedSize: string }> {
    try {
      const cache = await this.getThumbnailCache()
      const count = Object.keys(cache).length
      
      // Rough estimate: each JPEG thumbnail is ~20-50KB depending on quality
      const estimatedBytes = count * 35000
      const estimatedSize = this.formatBytes(estimatedBytes)
      
      return { count, estimatedSize }
    } catch (error) {
      console.error('ThumbnailService: Failed to get cache info:', error)
      return { count: 0, estimatedSize: '0 B' }
    }
  }

  /**
   * Format bytes to human-readable string
   * @param bytes - Number of bytes
   * @returns Formatted string (e.g., "1.5 MB")
   */
  private static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }
}
