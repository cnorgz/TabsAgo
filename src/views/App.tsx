import React, { useEffect, useMemo, useState } from 'react'

import { ErrorBoundary } from '../components/Common/ErrorBoundary'
// Grouped history view removed from scope
import TabManager from '../components/TabManager/TabManager'
import TabsView from '../components/ViewModes/TabsView'
import { STORAGE_KEYS } from '../constants/storage'
import { useChromeStorage } from '../hooks/useChromeStorage'
import { TabService } from '../services/TabService'
import { StorageService } from '../services/StorageService'
import { TabItem } from '../types/Tab'

function App() {
  const [mode, setMode] = React.useState<'list' | 'tabs'>(() => (localStorage.getItem(STORAGE_KEYS.mode) as 'list' | 'tabs' | null) || 'list')
  const { value: storedTabs, setValue: setStoredTabs } = useChromeStorage<TabItem[]>(STORAGE_KEYS.tabs, [])

  const initialTheme = React.useMemo(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.theme)
    if (saved === 'dark' || saved === 'light') return saved
    const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    return prefersDark ? 'dark' : 'light'
  }, [])
  const [theme, setTheme] = React.useState<string>(initialTheme)

  // Centralized tab management state
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState<string>('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<'capturedAtDesc' | 'domainAsc' | 'titleAsc' | 'lastAccessedAsc' | 'lastAccessedDesc'>(() => {
    const saved = localStorage.getItem('tabsago_sort') as 'capturedAtDesc' | 'domainAsc' | 'titleAsc' | 'lastAccessedAsc' | 'lastAccessedDesc' | null
    return saved ?? 'capturedAtDesc'
  })

  // Persist sort preference
  useEffect(() => {
    localStorage.setItem('tabsago_sort', sortBy)
  }, [sortBy])

  // Handle initial load
  useEffect(() => {
    setLoading(false)
  }, [])

  // Centralized tab operations
  const captureAllTabsInWindow = async () => {
    try {
      const mapped = await TabService.captureCurrentWindowTabs({ onlyHighlightedIfAny: false })
      const merged = await TabService.appendCapturedTabs(mapped)
      await setStoredTabs(merged)
      setError(null)
    } catch {
      setError('Failed to grab tabs. Please try again.')
      setTimeout(() => setError(null), 3000)
    }
  }

  const removeTab = async (id: string) => {
    const updated = storedTabs.filter(t => t.id !== id)
    await setStoredTabs(updated)
    setSelected(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  const openTab = (id: string) => {
    const tab = storedTabs.find(t => t.id === id)
    if (tab) window.open(tab.url, '_blank', 'noopener,noreferrer')
  }

  const handleSelect = (id: string, checked: boolean) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const handleSelectAll = () => {
    setSelected(prev => prev.size === tabs.length ? new Set() : new Set(tabs.map(t => t.id)))
  }

  const bulkOpen = () => {
    selected.forEach(id => openTab(id))
    setSelected(new Set())
  }

  const bulkRemove = async () => {
    const updated = storedTabs.filter(t => !selected.has(t.id))
    await setStoredTabs(updated)
    setSelected(new Set())
  }

  const clearAll = async () => {
    await setStoredTabs([])
    setSelected(new Set())
  }

  // Centralized filtering and sorting
  const tabs = useMemo(() => {
    const normalizedQuery = search.trim().toLowerCase()
    const filtered = normalizedQuery
      ? storedTabs.filter(t =>
          (t.title?.toLowerCase() || '').includes(normalizedQuery) ||
          (t.url?.toLowerCase() || '').includes(normalizedQuery)
        )
      : storedTabs
    const copy = [...filtered]
    const getLastAccessed = (t: TabItem) => (typeof t.lastAccessed === 'number' ? t.lastAccessed : new Date(t.capturedAt).getTime())
    switch (sortBy) {
      case 'domainAsc':
        return copy.sort((a, b) => a.domain.localeCompare(b.domain) || a.title.localeCompare(b.title))
      case 'titleAsc':
        return copy.sort((a, b) => a.title.localeCompare(b.title))
      case 'lastAccessedAsc':
        return copy.sort((a, b) => getLastAccessed(a) - getLastAccessed(b))
      case 'lastAccessedDesc':
        return copy.sort((a, b) => getLastAccessed(b) - getLastAccessed(a))
      case 'capturedAtDesc':
      default:
        return copy.sort((a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime())
    }
  }, [storedTabs, sortBy, search])

  // Effects
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
          <div className="toolbar-group">
            <HelpModal />
            <ThemeToggle theme={theme} setTheme={setTheme} />
          </div>
        </div>
        <ErrorBoundary>
          <div className="tabs-toolbar">
            <button className={`toggle ${mode==='list'?'active':''}`} onClick={() => setMode('list')}>List</button>
            <button className={`toggle ${mode==='tabs'?'active':''}`} onClick={() => setMode('tabs')}>Tabs</button>
          </div>
          {mode === 'list' ? (
            <TabManager
              tabs={tabs}
              loading={loading}
              error={error}
              search={search}
              setSearch={setSearch}
              sortBy={sortBy}
              setSortBy={setSortBy}
              captureAllTabsInWindow={captureAllTabsInWindow}
              removeTab={removeTab}
              openTab={openTab}
              handleSelect={handleSelect}
              handleSelectAll={handleSelectAll}
              selected={selected}
              bulkOpen={bulkOpen}
              bulkRemove={bulkRemove}
              clearAll={clearAll}
            />
          ) : (
            <TabsView
              tabs={tabs}
              loading={loading}
              error={error}
              search={search}
              setSearch={setSearch}
              sortBy={sortBy}
              setSortBy={setSortBy}
              captureAllTabsInWindow={captureAllTabsInWindow}
              removeTab={removeTab}
              openTab={openTab}
              handleSelect={handleSelect}
              handleSelectAll={handleSelectAll}
              selected={selected}
              bulkOpen={bulkOpen}
              bulkRemove={bulkRemove}
              clearAll={clearAll}
            />
          )}
        </ErrorBoundary>
      </div>
    </div>
  )
}

function HelpModal() {
  const [isOpen, setIsOpen] = React.useState(false)

  if (!isOpen) {
    return (
      <div className="tabs-toolbar">
        <button
          className="toggle"
          aria-label="Help"
          onClick={() => setIsOpen(true)}
          style={{fontSize: '16px', padding: '8px 10px'}}
        >
          ?
        </button>
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'var(--panel)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '500px',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
          <h2 style={{margin: 0, color: 'var(--text)'}}>TabsAGO Help</h2>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--muted)',
              fontSize: '18px',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        <div style={{color: 'var(--text)', lineHeight: '1.5'}}>
          <h3>Basic Usage</h3>
          <ul>
            <li><strong>Grab Tabs:</strong> Click &quot;Grab Tabs&quot; to capture all open tabs</li>
            <li><strong>Search:</strong> Use the search box to filter tabs by title or URL</li>
            <li><strong>Sort:</strong> Choose from Latest/Oldest, Title A-Z, or Domain A-Z</li>
            <li><strong>Theme:</strong> Toggle between light and dark modes</li>
          </ul>

          <h3>Multi-Select</h3>
          <ul>
            <li>Check individual tabs or use &quot;Select All&quot;</li>
            <li>Selected tabs show a bulk action bar</li>
            <li>Choose &quot;Open All&quot; to open selected tabs</li>
            <li>Choose &quot;Remove Selected&quot; to remove them</li>
          </ul>

          <h3>Views</h3>
          <ul>
            <li><strong>List View:</strong> Detailed list with full information</li>
            <li><strong>Tabs View:</strong> Chrome-like tab preview</li>
          </ul>

          <h3>Keyboard Shortcuts</h3>
          <p style={{color: 'var(--muted)', fontStyle: 'italic'}}>
            Configure shortcuts in Chrome: <br/>
            <code style={{background: 'var(--bg)', padding: '2px 4px', borderRadius: '4px'}}>
              chrome://extensions/shortcuts
            </code>
          </p>

          <p style={{marginTop: '16px', color: 'var(--muted)'}}>
            <strong>Note:</strong> Keyboard shortcuts must be enabled in Chrome Extensions settings.
            The extension provides visual feedback for all actions.
          </p>
        </div>
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


