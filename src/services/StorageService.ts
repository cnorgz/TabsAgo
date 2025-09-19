import { STORAGE_KEYS, StorageKey } from '../constants/storage'

export type ChromeStorageArea = 'local' | 'sync' | 'session'

export const StorageService = {
  keys: STORAGE_KEYS,

  async get<T>(key: StorageKey, area: ChromeStorageArea = 'local'): Promise<T | undefined> {
    const result = await chrome.storage[area].get([key])
    return result[key] as T | undefined
  },

  async set<T>(key: StorageKey, value: T, area: ChromeStorageArea = 'local'): Promise<void> {
    await chrome.storage[area].set({ [key]: value })
  },

  async update<T extends object>(key: StorageKey, updater: (curr: T | undefined) => T, area: ChromeStorageArea = 'local'): Promise<T> {
    const current = await this.get<T>(key, area)
    const next = updater(current)
    await this.set<T>(key, next, area)
    return next
  }
}


