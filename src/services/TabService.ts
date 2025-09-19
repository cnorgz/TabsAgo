import { TabItem } from '../types/Tab'
import { STORAGE_KEYS } from '../constants/storage'

import { StorageService } from './StorageService'

function mapChromeTabToTabItem(t: chrome.tabs.Tab): TabItem | null {
  if (!t.url) return null
  const idSource = typeof t.id === 'number' ? t.id : Math.floor(Math.random() * 100000)
  const url = t.url as string
  let domain = ''
  try { domain = new URL(url).hostname } catch { /* ignore invalid URL parsing */ }
  return {
    id: String(Date.now() + idSource),
    title: t.title || 'Untitled',
    url,
    favicon: t.favIconUrl || '',
    capturedAt: new Date().toISOString(),
    domain,
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
      if (tabs.length === 0) return (await StorageService.get<TabItem[]>(STORAGE_KEYS.tabs)) || []
      const existing = (await StorageService.get<TabItem[]>(STORAGE_KEYS.tabs)) || []
      const existingByUrl = new Set(existing.map(t => t.url))
      const merged = [...existing]
      for (const t of tabs) {
        if (!existingByUrl.has(t.url)) merged.push(t)
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


