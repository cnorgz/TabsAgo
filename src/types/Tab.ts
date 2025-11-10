export interface TabItem {
  id: string
  title: string
  url: string
  favicon: string
  capturedAt: string
  domain: string
  lastAccessed?: number
  sourceTabId?: number
  thumbnailKey?: string
}

export interface TabGroup {
  id: string
  name: string
  tabs: TabItem[]
  color?: string
}


