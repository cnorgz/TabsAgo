import React from 'react'

import { TabItem } from '../../types/Tab'
import { ThumbnailPreview } from '../Common/ThumbnailPreview'

interface TabsViewProps {
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

const TabsView: React.FC<TabsViewProps> = ({
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleSelect: _handleSelect,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleSelectAll: _handleSelectAll,
  selected,
  bulkOpen,
  bulkRemove,
  clearAll,
  exportTabs,
  importTabs
}) => {
  const [showDropdown, setShowDropdown] = React.useState(false)
  const [hoveredTab, setHoveredTab] = React.useState<{ id: string; x: number; y: number } | null>(null)
  
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
      ) : null}

      <div className="tabs-grid wide-row">
        {tabs.map(item => (
          <div key={item.id}
               className="chrome-tab"
               title={item.title}
               onClick={() => openTab(item.id)}
               onMouseEnter={(e) => setHoveredTab({ id: item.id, x: e.clientX, y: e.clientY })}
               onMouseLeave={() => setHoveredTab(null)}
          >
            {item.favicon ? (
              <img src={item.favicon} alt="" className="tab-favicon" />
            ) : (
              <div className="tab-favicon" style={{background:'#2a2d31'}} />
            )}
            <div className="tab-title">{item.title}</div>
            <button
              className="tab-close"
              aria-label="Close"
              title="Remove"
              onClick={(e) => { e.stopPropagation(); removeTab(item.id) }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      
      {hoveredTab && (
        <ThumbnailPreview
          tabId={Number(hoveredTab.id)}
          title={tabs.find(t => t.id === hoveredTab.id)?.title || ''}
          url={tabs.find(t => t.id === hoveredTab.id)?.url || ''}
          isHovering={true}
          mouseX={hoveredTab.x}
          mouseY={hoveredTab.y}
        />
      )}
    </div>
  )
}

export default TabsView
