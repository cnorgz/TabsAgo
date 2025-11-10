import { TabItem } from '../types/Tab'
import { STORAGE_KEYS } from '../constants/storage'

import { StorageService } from './StorageService'

function mapChromeTabToTabItem(t: chrome.tabs.Tab): TabItem | null {
  if (!t.url) return null
  const generatedId =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `tab-${Date.now()}-${Math.floor(Math.random() * 100000)}`
  const url = t.url as string
  let domain = ''
  try { domain = new URL(url).hostname } catch { /* ignore invalid URL parsing */ }
  return {
    id: generatedId,
    title: t.title || 'Untitled',
    url,
    favicon: t.favIconUrl || '',
    capturedAt: new Date().toISOString(),
    domain,
    lastAccessed: typeof t.lastAccessed === 'number' ? t.lastAccessed : undefined,
    sourceTabId: typeof t.id === 'number' ? t.id : undefined,
    thumbnailKey: generatedId,
  }
}

export const TabService = {
  async captureActiveTab(): Promise<TabItem | null> {
    try {
      const [active] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!active) return null
      return mapChromeTabToTabItem(active)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('captureActiveTab failed', error)
      return null
    }
  },

  async captureCurrentWindowTabs({ onlyHighlightedIfAny = true }: { onlyHighlightedIfAny?: boolean } = {}): Promise<TabItem[]> {
    try {
      const all = await chrome.tabs.query({ currentWindow: true })
      const highlighted = all.filter(t => (t as unknown as { highlighted?: boolean }).highlighted)
      const useTabs = (onlyHighlightedIfAny && highlighted.length > 0) ? highlighted : all
      const mapped = useTabs
        .map(mapChromeTabToTabItem)
        .filter((x): x is TabItem => Boolean(x))
      return mapped
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('captureCurrentWindowTabs failed', error)
      return []
    }
  },

  async appendCapturedTabs(tabs: TabItem[]): Promise<TabItem[]> {
    try {
      const existing = (await StorageService.get<TabItem[]>(STORAGE_KEYS.tabs)) || []
      if (tabs.length === 0) return existing

      const merged = [...existing]
      const existingByUrl = new Map<string, { index: number; tab: TabItem }>()
      merged.forEach((tab, index) => {
        existingByUrl.set(tab.url, { index, tab })
      })

      for (const captured of tabs) {
        const match = existingByUrl.get(captured.url)

        if (match) {
          const current = merged[match.index]
          merged[match.index] = {
            ...current,
            title: captured.title || current.title,
            favicon: captured.favicon || current.favicon,
            domain: captured.domain || current.domain,
            capturedAt: captured.capturedAt || current.capturedAt,
            lastAccessed: typeof captured.lastAccessed === 'number' ? captured.lastAccessed : current.lastAccessed,
            sourceTabId: typeof captured.sourceTabId === 'number' ? captured.sourceTabId : current.sourceTabId,
            thumbnailKey: current.thumbnailKey || captured.thumbnailKey || current.id,
          }
        } else {
          merged.push({
            ...captured,
            thumbnailKey: captured.thumbnailKey || captured.id,
          })
        }
      }

      await StorageService.set(STORAGE_KEYS.tabs, merged)
      return merged
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('appendCapturedTabs failed', error)
      return (await StorageService.get<TabItem[]>(STORAGE_KEYS.tabs)) || []
    }
  }
}


