import React, { useEffect, useMemo, useState } from 'react'

import { STORAGE_KEYS } from '../../constants/storage'
import { useChromeStorage } from '../../hooks/useChromeStorage'
import { TabService } from '../../services/TabService'
import { TabItem } from '../../types/Tab'

const TabManager: React.FC = () => {
  const { value: storedTabs, setValue: setStoredTabs } = useChromeStorage<TabItem[]>(STORAGE_KEYS.tabs, [])
  const [loading, setLoading] = useState<boolean>(true)
  const [sortBy, setSortBy] = useState<'capturedAtDesc' | 'domainAsc' | 'titleAsc'>(() => {
    const saved = localStorage.getItem('tabsago_sort') as 'capturedAtDesc' | 'domainAsc' | 'titleAsc' | null
    return saved ?? 'capturedAtDesc'
  })
  useEffect(() => {
    localStorage.setItem('tabsago_sort', sortBy)
  }, [sortBy])

  useEffect(() => {
    // initial load handled by hook state
    setLoading(false)
  }, [])

  const tabs = useMemo(() => {
    const copy = [...storedTabs]
    switch (sortBy) {
      case 'domainAsc':
        return copy.sort((a, b) => a.domain.localeCompare(b.domain) || a.title.localeCompare(b.title))
      case 'titleAsc':
        return copy.sort((a, b) => a.title.localeCompare(b.title))
      case 'capturedAtDesc':
      default:
        return copy.sort((a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime())
    }
  }, [storedTabs, sortBy])

  // Removed single-tab capture per product decision

  const captureAllTabsInWindow = async () => {
    const mapped = await TabService.captureCurrentWindowTabs({ onlyHighlightedIfAny: false })
    const merged = await TabService.appendCapturedTabs(mapped)
    await setStoredTabs(merged)
  }

  const removeTab = async (id: string) => {
    const updated = storedTabs.filter(t => t.id !== id)
    await setStoredTabs(updated)
  }

  const clearAll = async () => {
    await setStoredTabs([])
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="toolbar">
        <h2 className="title">Grabbed Tabs ({tabs.length})</h2>
        <div className="toolbar-group">
          <button className="btn" onClick={captureAllTabsInWindow}>Grab Tabs</button>
          <select className="select" value={sortBy} onChange={(e) => setSortBy(e.target.value as 'capturedAtDesc' | 'domainAsc' | 'titleAsc')} aria-label="Sort">
            <option value="capturedAtDesc">Newest</option>
            <option value="titleAsc">Title A-Z</option>
            <option value="domainAsc">Domain A-Z</option>
          </select>
          <button className="btn" onClick={clearAll}>Clear All</button>
        </div>
      </div>

      {tabs.length === 0 ? (
        <div className="muted-text" style={{textAlign:'center', padding:'48px 0'}}>No tabs captured yet. Click &quot;Capture/Refresh (All Tabs)&quot; to get started.</div>
      ) : (
        <ul className="list">
          {tabs.map(tab => (
            <li key={tab.id}>
              <div className="row-button" onClick={() => window.open(tab.url, '_blank', 'noopener,noreferrer')}> 
                {tab.favicon ? (
                  <img src={tab.favicon} alt="" className="favicon" />
                ) : (
                  <div className="favicon" />
                )}
                <div className="min-w-0">
                  <div className="title" title={tab.title}>{tab.title}</div>
                  <div className="domain">{tab.domain}</div>
                </div>
                <button className="icon-btn" aria-label="Remove" title="Remove"
                        onClick={(e) => { e.stopPropagation(); removeTab(tab.id) }}>✕</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default TabManager


