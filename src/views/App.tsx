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

  return (
    <div className="min-h-screen" data-theme={(localStorage.getItem(STORAGE_KEYS.theme)||'dark')}>
      <div className="app-container">
        <div className="toolbar mb-2">
          <h1 className="app-title">TabsAGO</h1>
          <ThemeToggle />
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

function ThemeToggle() {
  const [theme, setTheme] = React.useState<string>(() => (localStorage.getItem(STORAGE_KEYS.theme) || 'dark'))
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    StorageService.set(STORAGE_KEYS.theme, theme)
  }, [theme])
  return (
    <div className="tabs-toolbar">
      <button className="toggle" onClick={() => setTheme(theme==='dark'?'light':'dark')}>
        {theme === 'dark' ? 'Light mode' : 'Dark mode'}
      </button>
    </div>
  )
}

export default App


