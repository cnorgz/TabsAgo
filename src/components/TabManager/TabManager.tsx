import React from 'react'

import { TabItem } from '../../types/Tab'
import { getRelativeTime } from '../../utils/timeUtils'
import { ThumbnailPreview } from '../Common/ThumbnailPreview'

interface TabManagerProps {
  tabs: TabItem[]
  loading: boolean
  error: string | null
  search: string
  setSearch: (search: string) => void
  sortBy: 'capturedAtDesc' | 'domainAsc' | 'titleAsc' | 'lastAccessedAsc' | 'lastAccessedDesc'
  setSortBy: (sortBy: 'capturedAtDesc' | 'domainAsc' | 'titleAsc' | 'lastAccessedAsc' | 'lastAccessedDesc') => void
  captureAllTabsInWindow: () => Promise<void>
  captureCurrentTab: () => Promise<void>
  removeTab: (id: string) => Promise<void>
  openTab: (id: string) => void
  handleSelect: (id: string, checked: boolean) => void
  handleSelectAll: () => void
  selected: Set<string>
  bulkOpen: () => void
  bulkRemove: () => Promise<void>
  clearAll: () => Promise<void>
  exportTabs: () => Promise<void>
  importTabs: () => Promise<void>
}

const TabManager: React.FC<TabManagerProps> = ({
  tabs,
  loading,
  error,
  search,
  setSearch,
  sortBy,
  setSortBy,
  captureAllTabsInWindow,
  captureCurrentTab,
  removeTab,
  openTab,
  handleSelect,
  handleSelectAll,
  selected,
  bulkOpen,
  bulkRemove,
  clearAll,
  exportTabs,
  importTabs
}) => {
  const [showDropdown, setShowDropdown] = React.useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_focusedIndex, setFocusedIndex] = React.useState<number>(0)
  const [lastSelectedIndex, setLastSelectedIndex] = React.useState<number>(-1)
  const tabRefs = React.useRef<(HTMLLIElement | null)[]>([])
  const [hoveredTab, setHoveredTab] = React.useState<{ id: string; x: number; y: number } | null>(null)

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    switch(e.key) {
      case 'ArrowDown': {
        e.preventDefault()
        const nextIndex = Math.min(index + 1, tabs.length - 1)
        setFocusedIndex(nextIndex)
        tabRefs.current[nextIndex]?.focus()
        break
      }
        
      case 'ArrowUp': {
        e.preventDefault()
        const prevIndex = Math.max(index - 1, 0)
        setFocusedIndex(prevIndex)
        tabRefs.current[prevIndex]?.focus()
        break
      }
        
      case 'Enter':
        e.preventDefault()
        openTab(tabs[index].id)
        break
        
      case ' ':
        e.preventDefault()
        handleSelect(tabs[index].id, !selected.has(tabs[index].id))
        break
        
      case 'a':
        if (e.metaKey || e.ctrlKey) {
          e.preventDefault()
          handleSelectAll()
        }
        break
    }
  }

  const handleRowClick = (index: number, e: React.MouseEvent) => {
    if (e.shiftKey && lastSelectedIndex !== -1) {
      // Range selection
      e.preventDefault()
      const start = Math.min(lastSelectedIndex, index)
      const end = Math.max(lastSelectedIndex, index)
      
      // Select all tabs in range
      for (let i = start; i <= end; i++) {
        if (!selected.has(tabs[i].id)) {
          handleSelect(tabs[i].id, true)
        }
      }
    } else {
      setLastSelectedIndex(index)
    }
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
      {error && (
        <div role="alert" style={{
          marginBottom: 8,
          padding: '8px 12px',
          borderRadius: 8,
          border: '1px solid var(--border)',
          background: 'rgba(248,113,113,0.10)',
          color: '#fca5a5'
        }}>{error}</div>
      )}
      <div className="toolbar">
        <h2 className="title">Grabbed Tabs ({tabs.length})</h2>
        <div className="toolbar-group">
          <div className="btn-group" style={{position: 'relative'}}>
            <button className="btn" onClick={captureAllTabsInWindow}>Grab Tabs</button>
            <button 
              className="btn" 
              onClick={() => setShowDropdown(!showDropdown)}
              style={{padding: '8px 6px', marginLeft: '-1px'}}
            >
              ▼
            </button>
            {showDropdown && (
              <div className="dropdown-menu" style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '4px',
                background: 'var(--panel)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                boxShadow: 'var(--shadow)',
                zIndex: 1000,
                minWidth: '150px'
              }}>
                <button 
                  className="dropdown-item"
                  onClick={() => {
                    captureCurrentTab()
                    setShowDropdown(false)
                  }}
                >
                  Current Tab Only
                </button>
                <button 
                  className="dropdown-item"
                  onClick={() => {
                    captureAllTabsInWindow()
                    setShowDropdown(false)
                  }}
                >
                  All Tabs in Window
                </button>
              </div>
            )}
          </div>
          <input
            className="select"
            type="text"
            placeholder="Search tabs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search"
          />
          <select
            className="select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'capturedAtDesc' | 'domainAsc' | 'titleAsc' | 'lastAccessedAsc' | 'lastAccessedDesc')}
            aria-label="Sort"
          >
            <option value="lastAccessedDesc">Latest → Oldest</option>
            <option value="lastAccessedAsc">Oldest → Latest</option>
            <option value="titleAsc">Title A–Z</option>
            <option value="domainAsc">Domain A–Z</option>
          </select>
          <button
            className="btn"
            onClick={exportTabs}
            disabled={tabs.length === 0}
            title="Export tabs to bookmarks HTML file"
          >
            📄 Export
          </button>
          <button
            className="btn"
            onClick={importTabs}
            title="Import tabs from bookmarks HTML file"
          >
            📥 Import
          </button>
          <button className="btn" onClick={clearAll}>Clear All</button>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="toolbar" style={{marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)'}}>
          <div className="title">Selected {selected.size} tab{selected.size > 1 ? 's' : ''}</div>
          <div className="toolbar-group">
            <button className="btn" onClick={bulkOpen}>Open All</button>
            <button className="btn" onClick={bulkRemove} style={{background: 'rgba(248,113,113,0.15)', borderColor: '#f87171'}}>Remove Selected</button>
          </div>
        </div>
      )}

      {tabs.length === 0 ? (
        <div className="muted-text" style={{textAlign:'center', padding:'48px 0'}}>No tabs yet. Click &quot;Grab Tabs&quot; to start.</div>
      ) : (
        <ul 
          className="list"
          role="listbox"
          aria-label="Grabbed tabs list"
          aria-multiselectable="true"
        >
          <li style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0'}}>
            <input
              type="checkbox"
              checked={selected.size === tabs.length}
              onChange={handleSelectAll}
              aria-label="Select all tabs"
            />
            <div className="row-button" style={{cursor: 'pointer', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', flex: 1, display: 'flex', alignItems: 'center'}}>
              <span style={{fontWeight: 'bold', color: 'var(--accent)'}}>Select All</span>
            </div>
          </li>
          {tabs.map((tab, index) => (
            <li 
              key={tab.id}
              role="option"
              aria-selected={selected.has(tab.id)}
              aria-posinset={index + 1}
              aria-setsize={tabs.length}
              tabIndex={0}
              ref={el => { tabRefs.current[index] = el }}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onClick={(e) => handleRowClick(index, e)}
              style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0'}}
            >
              <input
                type="checkbox"
                checked={selected.has(tab.id)}
                onChange={(e) => handleSelect(tab.id, e.target.checked)}
                aria-label={`Select ${tab.title}`}
              />
              <div 
                className="row-button" 
                onClick={() => openTab(tab.id)}
                onMouseEnter={(e) => setHoveredTab({ id: tab.id, x: e.clientX, y: e.clientY })}
                onMouseLeave={() => setHoveredTab(null)}
                onMouseMove={(e) => hoveredTab?.id === tab.id && setHoveredTab({ id: tab.id, x: e.clientX, y: e.clientY })}
                style={{flex: 1, display: 'flex', alignItems: 'center', gap: '12px'}}
              >
                {tab.favicon ? (
                  <img src={tab.favicon} alt="" className="favicon" />
                ) : (
                  <div className="favicon" />
                )}
                <div className="min-w-0" style={{flex: 1}}>
                  <div className="title" title={tab.title}>{tab.title}</div>
                  <div className="domain">
                  {tab.domain}
                  <span className="time-ago">
                    {' · '}
                    {getRelativeTime(tab.lastAccessed || tab.capturedAt)}
                  </span>
                </div>
                </div>
                <button className="icon-btn" aria-label="Remove" title="Remove"
                        onClick={(e) => { e.stopPropagation(); removeTab(tab.id) }}>✕</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      
      {hoveredTab && (
        <ThumbnailPreview
          tabId={hoveredTab.id}
          title={tabs.find(t => t.id === hoveredTab.id)?.title || ''}
          isHovering={true}
          mouseX={hoveredTab.x}
          mouseY={hoveredTab.y}
        />
      )}
    </div>
  )
}

export default TabManager


