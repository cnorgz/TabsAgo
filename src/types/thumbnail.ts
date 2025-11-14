export type CaptureKind = 'first' | 'final'

export interface ThumbnailRecord {
  id?: number
  tabId: number
  windowId: number
  url: string
  kind: CaptureKind
  blob: Blob
  width: number
  height: number
  dpr: number
  capturedAt: number
}

export interface LegacyThumbnailEntry {
  tabId: number
  url: string
  dataUrl: string
  capturedAt: number
}

export interface CaptureMetadata {
  tabId: number
  windowId: number
  url: string
  kind: CaptureKind
  dataUrl: string
}
