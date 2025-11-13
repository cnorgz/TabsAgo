import React, { useEffect, useMemo, useState } from 'react'

import { ErrorBoundary } from '../components/Common/ErrorBoundary'
// Grouped history view removed from scope
import TabManager from '../components/TabManager/TabManager'
import TabsView from '../components/ViewModes/TabsView'
import { PREF_DEFAULTS, PREF_KEYS } from '../constants/prefs'
import { STORAGE_KEYS } from '../constants/storage'
import { useChromeStorage } from '../hooks/useChromeStorage'
import { TabService } from '../services/TabService'
import { StorageService } from '../services/StorageService'
import { ExportService } from '../services/ExportService'
import { SessionSafetyService } from '../services/SessionSafetyService'
import { RecentlyClosedService, RecentlyClosedSession } from '../services/RecentlyClosedService'
import { ThumbnailService } from '../services/ThumbnailService'
import { TabItem } from '../types/Tab'

const AUTO_CAPTURE_PREF_KEY = PREF_KEYS.AUTO_THUMBNAIL_CAPTURE
const DEFAULT_AUTO_CAPTURE_PREF = PREF_DEFAULTS[AUTO_CAPTURE_PREF_KEY]

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
  const [lifeboatTabs, setLifeboatTabs] = useState<TabItem[]>([])
  const [showLifeboat, setShowLifeboat] = useState<boolean>(false)
  const [recentlyClosed, setRecentlyClosed] = useState<RecentlyClosedSession[]>([])
  const [showRecentlyClosed, setShowRecentlyClosed] = useState<boolean>(true)
  
  // Thumbnail state
  const [thumbnailsEnabled, setThumbnailsEnabledState] = useState<boolean>(DEFAULT_AUTO_CAPTURE_PREF)
  const [thumbnailQuality, setThumbnailQuality] = useState<number>(() => {
    const saved = localStorage.getItem('tabsago_thumbnail_quality')
    return saved ? parseInt(saved, 10) : 70
  })
  const [capturingThumbnails, setCapturingThumbnails] = useState<boolean>(false)
  const [captureProgress, setCaptureProgress] = useState<string>('')

  // Persist sort preference
  useEffect(() => {
    localStorage.setItem('tabsago_sort', sortBy)
  }, [sortBy])
  
  useEffect(() => {
    if (typeof chrome === 'undefined' || !chrome.storage?.local) return
    let cancelled = false

    const hydratePreference = async () => {
      try {
        const stored = await chrome.storage.local.get(AUTO_CAPTURE_PREF_KEY)
        if (cancelled) return
        const storedValue = stored?.[AUTO_CAPTURE_PREF_KEY]
        if (typeof storedValue === 'boolean') {
          setThumbnailsEnabledState(storedValue)
        } else {
          await chrome.storage.local.set({ [AUTO_CAPTURE_PREF_KEY]: DEFAULT_AUTO_CAPTURE_PREF })
          if (!cancelled) setThumbnailsEnabledState(DEFAULT_AUTO_CAPTURE_PREF)
        }
      } catch {
        // Ignore hydration errors; UI will fall back to defaults.
      }
    }

    void hydratePreference()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (typeof chrome === 'undefined' || !chrome.storage?.onChanged) return

    const handleChange = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
      if (areaName !== 'local') return
      if (Object.prototype.hasOwnProperty.call(changes, AUTO_CAPTURE_PREF_KEY)) {
        const change = changes[AUTO_CAPTURE_PREF_KEY]
        if (change && typeof change.newValue === 'boolean') {
          setThumbnailsEnabledState(change.newValue)
        }
      }
    }

    chrome.storage.onChanged.addListener(handleChange)
    return () => {
      chrome.storage.onChanged.removeListener(handleChange)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('tabsago_thumbnail_quality', String(thumbnailQuality))
  }, [thumbnailQuality])

  const updateThumbnailsEnabled = (value: boolean) => {
    setThumbnailsEnabledState(value)
    if (typeof chrome === 'undefined' || !chrome.storage?.local) return
    void chrome.storage.local.set({ [AUTO_CAPTURE_PREF_KEY]: value })
  }

  // Handle initial load
  useEffect(() => {
    const setupServices = async () => {
      // Setup session safety service
      SessionSafetyService.setup()

      // Check for lifeboat tabs
      const [shouldShow, lifeboat] = await Promise.all([
        SessionSafetyService.shouldShowLifeboat(),
        SessionSafetyService.getLifeboatTabs()
      ])

      setShowLifeboat(shouldShow)
      setLifeboatTabs(lifeboat)

      // Load recently closed sessions
      const recent = await RecentlyClosedService.getRecentlyClosed()
      setRecentlyClosed(recent)

      setLoading(false)
    }

    setupServices()
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

  const captureCurrentTab = async () => {
    try {
      const tab = await TabService.captureActiveTab()
      if (tab) {
        const merged = await TabService.appendCapturedTabs([tab])
        await setStoredTabs(merged)
        setError(null)
      }
    } catch {
      setError('Failed to capture current tab.')
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

  const exportTabs = async () => {
    try {
      await ExportService.downloadBookmarksHTML(tabs)
      setError(null)
    } catch {
      setError('Failed to export tabs. Please try again.')
      setTimeout(() => setError(null), 3000)
    }
  }

  const importTabs = async () => {
    try {
      const importedTabs = await ExportService.importFromBookmarksHTML()
      if (importedTabs.length === 0) {
        setError('No tabs found in the selected file.')
        setTimeout(() => setError(null), 3000)
        return
      }
      
      // Merge imported tabs with existing tabs (avoiding duplicates by URL)
      const merged = await TabService.appendCapturedTabs(importedTabs)
      await setStoredTabs(merged)
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to import tabs. Please try again.'
      if (!errorMessage.includes('cancelled')) {
        setError(errorMessage)
        setTimeout(() => setError(null), 3000)
      }
    }
  }

  // Thumbnail operations
  const captureThumbnailsNow = async () => {
    if (capturingThumbnails) return
    
    setCapturingThumbnails(true)
    setCaptureProgress('Starting capture...')
    
    try {
      const stats = await ThumbnailService.captureAllTabsInWindow(
        (current, total) => {
          setCaptureProgress(`Capturing ${current} of ${total} tabs...`)
        },
        thumbnailQuality
      )
      
      setCaptureProgress(
        `Complete! ${stats.success} captured, ${stats.failed} failed, ${stats.skipped} skipped.`
      )
      
      setTimeout(() => {
        setCapturingThumbnails(false)
        setCaptureProgress('')
      }, 3000)
    } catch (err) {
      console.error('Failed to capture thumbnails:', err)
      setError('Failed to capture thumbnails.')
      setTimeout(() => setError(null), 3000)
      setCapturingThumbnails(false)
      setCaptureProgress('')
    }
  }

  const clearThumbnailCache = async () => {
    try {
      await ThumbnailService.clearAllThumbnails()
      setError('Thumbnail cache cleared successfully.')
      setTimeout(() => setError(null), 2000)
    } catch (err) {
      console.error('Failed to clear thumbnail cache:', err)
      setError('Failed to clear thumbnail cache.')
      setTimeout(() => setError(null), 3000)
    }
  }


  const restoreLifeboat = async () => {
    try {
      await SessionSafetyService.restoreLifeboatToMain()
      const updated = await StorageService.get<TabItem[]>(STORAGE_KEYS.tabs)
      await setStoredTabs(updated || [])
      setShowLifeboat(false)
      setLifeboatTabs([])
      setError(null)
    } catch {
      setError('Failed to restore lifeboat tabs. Please try again.')
      setTimeout(() => setError(null), 3000)
    }
  }

  const clearLifeboat = async () => {
    try {
      await SessionSafetyService.clearLifeboat()
      setShowLifeboat(false)
      setLifeboatTabs([])
      setError(null)
    } catch {
      setError('Failed to clear lifeboat tabs. Please try again.')
      setTimeout(() => setError(null), 3000)
    }
  }

  const restoreRecentlyClosed = async (session: RecentlyClosedSession) => {
    try {
      await RecentlyClosedService.restoreSession(session)
      // Remove from recently closed list
      setRecentlyClosed(prev => prev.filter(s => s.id !== session.id))
      setError(null)
    } catch {
      setError('Failed to restore recently closed item. Please try again.')
      setTimeout(() => setError(null), 3000)
    }
  }

  const refreshRecentlyClosed = async () => {
    try {
      const recent = await RecentlyClosedService.getRecentlyClosed()
      setRecentlyClosed(recent)
      setError(null)
    } catch {
      setError('Failed to refresh recently closed items. Please try again.')
      setTimeout(() => setError(null), 3000)
    }
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

  const openAsPinnedTab = () => {
    const extensionId = chrome.runtime.id
    const extensionUrl = `chrome-extension://${extensionId}/index.html`
    
    chrome.tabs.query({}, (allTabs) => {
      const existingTab = allTabs.find(tab => tab.url === extensionUrl)
      
      if (existingTab) {
        // Tab exists, make it pinned and focus it
        chrome.tabs.update(existingTab.id!, { pinned: true, active: true })
      } else {
        // Create new pinned tab
        chrome.tabs.create({ url: extensionUrl, pinned: true })
      }
    })
  }

  return (
    <div className="min-h-screen" data-theme={theme}>
      <div className="app-container">
        <div className="toolbar mb-2">
          <h1 className="app-title">TabsAGO</h1>
          <div className="toolbar-group">
            <button 
              className="toggle" 
              onClick={openAsPinnedTab}
              title="Open as pinned tab"
              aria-label="Pin this tab"
            >
              📌
            </button>
            <HelpModal 
              thumbnailsEnabled={thumbnailsEnabled}
              setThumbnailsEnabled={updateThumbnailsEnabled}
              thumbnailQuality={thumbnailQuality}
              setThumbnailQuality={setThumbnailQuality}
              captureThumbnailsNow={captureThumbnailsNow}
              clearThumbnailCache={clearThumbnailCache}
              capturingThumbnails={capturingThumbnails}
              captureProgress={captureProgress}
            />
            <ThemeToggle theme={theme} setTheme={setTheme} />
          </div>
        </div>
        <ErrorBoundary>
          {showLifeboat && lifeboatTabs.length > 0 && (
            <div className="lifeboat-section" style={{
              marginBottom: '16px',
              padding: '12px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '8px'
            }}>
              <div className="toolbar">
                <h3 className="title" style={{margin: 0}}>🔗 Last Session ({lifeboatTabs.length} tabs)</h3>
                <div className="toolbar-group">
                  <button className="btn" onClick={restoreLifeboat} title="Restore all lifeboat tabs">Restore All</button>
                  <button className="btn" onClick={clearLifeboat} style={{background: 'rgba(248,113,113,0.15)', borderColor: '#f87171'}} title="Clear lifeboat tabs">Clear</button>
                </div>
              </div>
              <div className="lifeboat-tabs" style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginTop: '8px'
              }}>
                {lifeboatTabs.slice(0, 6).map(tab => (
                  <div key={tab.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 8px',
                    background: 'var(--panel)',
                    borderRadius: '4px',
                    border: '1px solid var(--border)',
                    fontSize: '12px',
                    maxWidth: '200px'
                  }}>
                    {tab.favicon && (
                      <img src={tab.favicon} alt="" style={{width: '16px', height: '16px'}} />
                    )}
                    <span style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {tab.title}
                    </span>
                  </div>
                ))}
                {lifeboatTabs.length > 6 && (
                  <div style={{
                    padding: '6px 8px',
                    fontSize: '12px',
                    color: 'var(--muted)'
                  }}>
                    +{lifeboatTabs.length - 6} more
                  </div>
                )}
              </div>
            </div>
          )}
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
              captureCurrentTab={captureCurrentTab}
              removeTab={removeTab}
              openTab={openTab}
              handleSelect={handleSelect}
              handleSelectAll={handleSelectAll}
              selected={selected}
              bulkOpen={bulkOpen}
              bulkRemove={bulkRemove}
              clearAll={clearAll}
              exportTabs={exportTabs}
              importTabs={importTabs}
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
              captureCurrentTab={captureCurrentTab}
              removeTab={removeTab}
              openTab={openTab}
              handleSelect={handleSelect}
              handleSelectAll={handleSelectAll}
              selected={selected}
              bulkOpen={bulkOpen}
              bulkRemove={bulkRemove}
              clearAll={clearAll}
              exportTabs={exportTabs}
              importTabs={importTabs}
            />
          )}
          {showRecentlyClosed && recentlyClosed.length > 0 && (
            <div className="recently-closed-section" style={{
              marginTop: '16px',
              padding: '12px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '8px'
            }}>
              <div className="toolbar">
                <h3 className="title" style={{margin: 0}}>🕒 Recently Closed ({recentlyClosed.length})</h3>
                <div className="toolbar-group">
                  <button className="btn" onClick={refreshRecentlyClosed} title="Refresh recently closed items">🔄</button>
                  <button className="btn" onClick={() => setShowRecentlyClosed(false)} style={{background: 'rgba(248,113,113,0.15)', borderColor: '#f87171'}} title="Hide recently closed">✕</button>
                </div>
              </div>
              <div className="recently-closed-list" style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                marginTop: '8px'
              }}>
                {recentlyClosed.slice(0, 5).map(session => (
                  <div key={session.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px',
                    background: 'var(--panel)',
                    borderRadius: '4px',
                    border: '1px solid var(--border)'
                  }}>
                    <span style={{
                      fontSize: '14px',
                      flex: 1,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {session.title}
                    </span>
                    <button
                      className="btn"
                      onClick={() => restoreRecentlyClosed(session)}
                      style={{fontSize: '12px', padding: '4px 8px'}}
                      title="Restore this item"
                    >
                      ↻ Restore
                    </button>
                  </div>
                ))}
                {recentlyClosed.length > 5 && (
                  <div style={{
                    padding: '8px',
                    fontSize: '12px',
                    color: 'var(--muted)',
                    textAlign: 'center'
                  }}>
                    +{recentlyClosed.length - 5} more items
                  </div>
                )}
              </div>
            </div>
          )}
        </ErrorBoundary>
      </div>
    </div>
  )
}

interface HelpModalProps {
  thumbnailsEnabled: boolean
  setThumbnailsEnabled: (value: boolean) => void
  thumbnailQuality: number
  setThumbnailQuality: (value: number) => void
  captureThumbnailsNow: () => Promise<void>
  clearThumbnailCache: () => Promise<void>
  capturingThumbnails: boolean
  captureProgress: string
}

function HelpModal({
  thumbnailsEnabled,
  setThumbnailsEnabled,
  thumbnailQuality,
  setThumbnailQuality,
  captureThumbnailsNow,
  clearThumbnailCache,
  capturingThumbnails,
  captureProgress
}: HelpModalProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  if (!isOpen) {
    return (
      <button
        className="toggle"
        aria-label="Help"
        onClick={() => setIsOpen(true)}
      >
        ?
      </button>
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

          <h3>Keyboard Navigation</h3>
          <ul>
            <li><strong>↑/↓ Arrow Keys:</strong> Navigate up/down through tab list</li>
            <li><strong>Enter:</strong> Open the focused tab</li>
            <li><strong>Space:</strong> Toggle selection of focused tab</li>
            <li><strong>Cmd/Ctrl+A:</strong> Select all tabs</li>
            <li><strong>Shift+Click:</strong> Select range of tabs</li>
          </ul>

          <h3>Extension Shortcuts</h3>
          <p style={{color: 'var(--muted)', fontStyle: 'italic'}}>
            Configure global shortcuts in Chrome: <br/>
            <code style={{background: 'var(--bg)', padding: '2px 4px', borderRadius: '4px'}}>
              chrome://extensions/shortcuts
            </code>
          </p>

          <h3>Thumbnail Settings</h3>
          <div style={{display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px'}}>
            <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
              <input
                type="checkbox"
                checked={thumbnailsEnabled}
                onChange={(e) => setThumbnailsEnabled(e.target.checked)}
                style={{cursor: 'pointer'}}
              />
              <span>Enable thumbnail previews on hover</span>
            </label>
            
            <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
              <label style={{fontSize: '13px'}}>
                Quality: {thumbnailQuality}%
              </label>
              <input
                type="range"
                min="20"
                max="100"
                step="10"
                value={thumbnailQuality}
                onChange={(e) => setThumbnailQuality(parseInt(e.target.value, 10))}
                style={{width: '100%'}}
              />
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--muted)'}}>
                <span>Low (faster)</span>
                <span>High (clearer)</span>
              </div>
            </div>
            
            <div style={{display: 'flex', gap: '8px', marginTop: '8px'}}>
              <button
                className="btn"
                onClick={captureThumbnailsNow}
                disabled={capturingThumbnails || !thumbnailsEnabled}
                style={{
                  fontSize: '12px',
                  padding: '6px 12px',
                  opacity: (capturingThumbnails || !thumbnailsEnabled) ? 0.5 : 1,
                  cursor: (capturingThumbnails || !thumbnailsEnabled) ? 'not-allowed' : 'pointer'
                }}
              >
                📸 Capture All Thumbnails
              </button>
              <button
                className="btn"
                onClick={clearThumbnailCache}
                disabled={capturingThumbnails}
                style={{
                  fontSize: '12px',
                  padding: '6px 12px',
                  opacity: capturingThumbnails ? 0.5 : 1,
                  cursor: capturingThumbnails ? 'not-allowed' : 'pointer'
                }}
              >
                🗑️ Clear Cache
              </button>
            </div>
            
            {captureProgress && (
              <div style={{
                fontSize: '12px',
                color: 'var(--accent)',
                padding: '8px',
                background: 'var(--bg)',
                borderRadius: '6px',
                border: '1px solid var(--border)'
              }}>
                {captureProgress}
              </div>
            )}
          </div>
          <p style={{marginTop: '12px', color: 'var(--muted)', fontSize: '11px'}}>
            💡 <strong>How it works:</strong> Click &quot;Capture All Thumbnails&quot; to take screenshots of all open tabs.
            The extension will briefly switch between tabs to capture each one. Hover over any tab in List view to see its preview.
          </p>

          <p style={{marginTop: '16px', color: 'var(--muted)'}}>
            <strong>Note:</strong> Arrow key navigation works in List view. Keyboard shortcuts must be 
            enabled in Chrome Extensions settings for global access.
          </p>
        </div>
      </div>
    </div>
  )
}

function ThemeToggle({ theme, setTheme }: { theme: string; setTheme: (t: 'dark'|'light') => void }) {
  const isDark = theme === 'dark'
  return (
    <button className="toggle" aria-label="Toggle theme" onClick={() => setTheme(isDark ? 'light' : 'dark')}>
      {isDark ? '☀️' : '🌙'}
    </button>
  )
}

export default App
