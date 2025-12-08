import { CaptureMetadata, LegacyThumbnailEntry, ThumbnailRecord } from '../../types/thumbnail'

const DB_NAME = 'tabsago-thumbnails'
const STORE_NAME = 'thumbnails'
const DB_VERSION = 1
// Default retention favors long-lived tab organization; make configurable later if storage becomes a concern.
const TTL_MS = 365 * 24 * 60 * 60 * 1000
const GLOBAL_CAP = 600
const MAX_PER_KEY = 1
const TARGET_WIDTH = 800
const TARGET_HEIGHT = 500
const TARGET_QUALITY = 0.6

export class ThumbnailStore {
  private dbPromise: Promise<IDBDatabase> | null = null
  private migrationRan = false
  private cache = new Map<string, ThumbnailRecord>() // LRU cache: key is URL, value is ThumbnailRecord

  async initialize() {
    await this.ensureDb()
    await this.runMigrationSafely()
  }

  // Helper to manage LRU cache
  private addToCache(record: ThumbnailRecord) {
    const key = record.url
    // Delete if already exists to move to end (most recent)
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }
    this.cache.set(key, record)

    // Enforce size limit
    if (this.cache.size > CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }
  }

  async putCapture(metadata: CaptureMetadata) {
    try {
      const db = await this.ensureDb()
      const normalized = await this.normalizeImage(metadata.dataUrl)
      
      const record: ThumbnailRecord = {
        tabId: metadata.tabId,
        windowId: metadata.windowId,
        url: metadata.url,
        kind: metadata.kind,
        blob: normalized.blob,
        width: normalized.width,
        height: normalized.height,
        dpr: normalized.dpr,
        capturedAt: Date.now(),
      }
      await this.storeRecord(db, record)
      this.addToCache(record) // Add to cache after successful storage
    } catch (error) {
      console.error('[ThumbnailStore] putCapture FAILED:', error)
    }
  }

  async getLatest(tabId: number, url: string, limit = 2): Promise<ThumbnailRecord[]> {
    try {
      if (!url) return []
      
      // Try to get from cache first
      const cachedRecord = this.cache.get(url)
      if (cachedRecord) {
        // Move to end of LRU (most recently used)
        this.addToCache(cachedRecord) 
        return [cachedRecord]
      }

      const db = await this.ensureDb()
      const items = await new Promise<ThumbnailRecord[]>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly')
        const store = tx.objectStore(STORE_NAME)
        const index = store.index('capturedAt')
        const results: ThumbnailRecord[] = []
        
        const request = index.openCursor(null, 'prev')
        
        request.onsuccess = () => {
          const cursor = request.result
          if (!cursor) {
            resolve(results)
            return
          }
          const value = cursor.value as ThumbnailRecord
          
          if (value.url === url) {
             results.push(value)
             if (results.length >= limit) {
               resolve(results)
               return
             }
          }
          cursor.continue()
        }
        request.onerror = () => reject(request.error)
        tx.onerror = () => reject(tx.error)
      })
      // If we found an item, add it to cache
      if (items.length > 0) {
        this.addToCache(items[0])
      }
      return items
    } catch (error) {
      console.error('[ThumbnailStore] getLatest FAILED:', error)
      return []
    }
  }

  async getLatestRecord(tabId: number, url: string): Promise<ThumbnailRecord | null> {
    const items = await this.getLatest(tabId, url, 1)
    return items[0] ?? null
  }

  async clearAll() {
    try {
      const db = await this.ensureDb()
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite')
        tx.objectStore(STORE_NAME).clear()
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
      })
      this.cache.clear() // Clear in-memory cache as well
    } catch (error) {
      console.warn('ThumbnailStore.clearAll failed', error)
    }
  }

  private async ensureDb(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise
    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)
      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
          store.createIndex('tabUrl', ['tabId', 'url'], { unique: false })
          store.createIndex('capturedAt', 'capturedAt')
        }
      }
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    return this.dbPromise
  }

  private async storeRecord(db: IDBDatabase, record: ThumbnailRecord) {
    await this.pruneExpired(db)
    await this.insertRecord(db, record)
    await this.prunePerKey(db, record.tabId, record.url)
    await this.enforceGlobalCap(db)
  }

  private async insertRecord(db: IDBDatabase, record: ThumbnailRecord) {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
      tx.objectStore(STORE_NAME).add(record)
    })
  }

  private isValidInput(tabId: number, url: string) {
    return Number.isFinite(tabId) && typeof url === 'string' && url.length > 0
  }

  private async prunePerKey(db: IDBDatabase, tabId: number, url: string) {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const index = store.index('tabUrl')
      const request = index.getAll(IDBKeyRange.only([tabId, url]))
      request.onsuccess = () => {
        const items = request.result.sort((a, b) => b.capturedAt - a.capturedAt)
        const toDelete = items.slice(MAX_PER_KEY)
        for (const item of toDelete) {
          if (item.id != null) {
            store.delete(item.id)
          }
        }
      }
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }

  private async pruneExpired(db: IDBDatabase) {
    const cutoff = Date.now() - TTL_MS
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const index = tx.objectStore(STORE_NAME).index('capturedAt')
      const request = index.openCursor()
      request.onsuccess = () => {
        const cursor = request.result
        if (!cursor) return
        if (cursor.value.capturedAt < cutoff) {
          cursor.delete()
          cursor.continue()
        }
      }
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }

  private async enforceGlobalCap(db: IDBDatabase) {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const index = store.index('capturedAt')
      const countRequest = store.count()
      countRequest.onsuccess = () => {
        let toRemove = countRequest.result - GLOBAL_CAP
        if (toRemove <= 0) {
          return
        }
        const cursorRequest = index.openCursor()
        cursorRequest.onsuccess = () => {
          const cursor = cursorRequest.result
          if (!cursor) return
          if (toRemove <= 0) return
          cursor.delete()
          toRemove -= 1
          cursor.continue()
        }
      }
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }

  private async normalizeImage(dataUrl: string) {
    try {
      const blob = await this.dataUrlToBlob(dataUrl)
      if (typeof createImageBitmap === 'function') {
        const bitmap = await createImageBitmap(blob)
        const target = this.calculateTargetDimensions(bitmap.width, bitmap.height)
        if (typeof OffscreenCanvas !== 'undefined' && target.width > 0 && target.height > 0) {
          const canvas = new OffscreenCanvas(target.width, target.height)
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.drawImage(bitmap, 0, 0, target.width, target.height)
            const scaledBlob = await canvas.convertToBlob({ type: 'image/jpeg', quality: TARGET_QUALITY })
            return { blob: scaledBlob, width: target.width, height: target.height, dpr: 1 }
          }
        }
        return { blob, width: bitmap.width, height: bitmap.height, dpr: 1 }
      }
      return { blob, width: TARGET_WIDTH, height: TARGET_HEIGHT, dpr: 1 }
    } catch (error) {
      console.warn('ThumbnailStore.normalizeImage fallback', error)
      const blob = await this.dataUrlToBlob(dataUrl)
      return { blob, width: TARGET_WIDTH, height: TARGET_HEIGHT, dpr: 1 }
    }
  }

  private calculateTargetDimensions(width: number, height: number) {
    const scaledWidth = Math.max(1, width)
    const scaledHeight = Math.max(1, height)
    const ratio = Math.min(TARGET_WIDTH / scaledWidth, TARGET_HEIGHT / scaledHeight, 1)
    return {
      width: Math.max(1, Math.round(scaledWidth * ratio)),
      height: Math.max(1, Math.round(scaledHeight * ratio)),
    }
  }

  private async dataUrlToBlob(dataUrl: string) {
    const response = await fetch(dataUrl)
    return await response.blob()
  }

  private async runMigrationSafely() {
    if (this.migrationRan) return
    this.migrationRan = true
    try {
      const legacy = await chrome.storage.local.get('tabsago_thumbnails')
      const entries = legacy?.tabsago_thumbnails as Record<string, LegacyThumbnailEntry> | undefined
      if (!entries) return
      for (const entry of Object.values(entries)) {
        if (!entry?.dataUrl) continue
        await this.putCapture({
          tabId: entry.tabId,
          windowId: chrome.windows.WINDOW_ID_NONE,
          url: entry.url,
          kind: 'first',
          dataUrl: entry.dataUrl,
        })
      }
      await chrome.storage.local.remove('tabsago_thumbnails')
    } catch (error) {
      console.warn('ThumbnailStore migration failed', error)
    }
  }
}

export const thumbnailStore = new ThumbnailStore()
