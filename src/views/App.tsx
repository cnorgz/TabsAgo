import React from 'react'

import { ErrorBoundary } from '../components/Common/ErrorBoundary'
// Grouped history view removed from scope
import TabManager from '../components/TabManager/TabManager'
import TabsView from '../components/ViewModes/TabsView'
import { STORAGE_KEYS } from '../constants/storage'
import { StorageService } from '../services/StorageService'
import { TabItem } from '../types/Tab'

function App() {
  const [mode, setMode] = React.useState<'list' | 'tabs'>(() => (localStorage.getItem(STORAGE_KEYS.mode) as 'list' | 'tabs' | null) || 'list')
  const [items, setItems] = React.useState<TabItem[]>([])
  const initialTheme = React.useMemo(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.theme)
    if (saved === 'dark' || saved === 'light') return saved
    const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    return prefersDark ? 'dark' : 'light'
  }, [])
  const [theme, setTheme] = React.useState<string>(initialTheme)

  // Lightweight way to receive updates from TabManager: listen to storage
  React.useEffect(() => {
    const key = STORAGE_KEYS.tabs
    const load = () => chrome.storage.local.get([key], r => setItems(r[key] || []))
    load()
    const handler = (changes: { [k:string]: chrome.storage.StorageChange }, area: string) => {
      if (area === 'local' && changes[key]) setItems(changes[key].newValue || [])
    }
    chrome.storage.onChanged.addListener(handler)
    return () => chrome.storage.onChanged.removeListener(handler)
  }, [])

  React.useEffect(() => { StorageService.set(STORAGE_KEYS.mode, mode) }, [mode])
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    StorageService.set(STORAGE_KEYS.theme, theme)
  }, [theme])

  return (
    <div className="min-h-screen" data-theme={theme}>
      <div className="app-container">
        <div className="toolbar mb-2">
          <h1 className="app-title">TabsAGO</h1>
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
        <ErrorBoundary>
          <div className="tabs-toolbar">
            <button className={`toggle ${mode==='list'?'active':''}`} onClick={() => setMode('list')}>List</button>
            <button className={`toggle ${mode==='tabs'?'active':''}`} onClick={() => setMode('tabs')}>Tabs</button>
          </div>
          {mode === 'list' ? (
            <TabManager />
          ) : (
            <TabsView items={items} onRemove={(id) => {
              const updated = items.filter(i => i.id !== id)
              setItems(updated)
              chrome.storage.local.set({ [STORAGE_KEYS.tabs]: updated })
            }} />
          )}
        </ErrorBoundary>
      </div>
    </div>
  )
}

function ThemeToggle({ theme, setTheme }: { theme: string; setTheme: (t: 'dark'|'light') => void }) {
  const isDark = theme === 'dark'
  return (
    <div className="tabs-toolbar">
      <button className="toggle" aria-label="Toggle theme" onClick={() => setTheme(isDark ? 'light' : 'dark')}>
        {isDark ? '☀️' : '🌙'}
      </button>
    </div>
  )
}

export default App


