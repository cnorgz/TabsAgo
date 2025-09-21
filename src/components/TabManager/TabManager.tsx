import React from 'react'

import { TabItem } from '../../types/Tab'

interface TabManagerProps {
  tabs: TabItem[]
  loading: boolean
  error: string | null
  search: string
  setSearch: (search: string) => void
  sortBy: 'capturedAtDesc' | 'domainAsc' | 'titleAsc' | 'lastAccessedAsc' | 'lastAccessedDesc'
  setSortBy: (sortBy: 'capturedAtDesc' | 'domainAsc' | 'titleAsc' | 'lastAccessedAsc' | 'lastAccessedDesc') => void
  captureAllTabsInWindow: () => Promise<void>
  removeTab: (id: string) => Promise<void>
  openTab: (id: string) => void
  handleSelect: (id: string, checked: boolean) => void
  handleSelectAll: () => void
  selected: Set<string>
  bulkOpen: () => void
  bulkRemove: () => Promise<void>
  clearAll: () => Promise<void>
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
  removeTab,
  openTab,
  handleSelect,
  handleSelectAll,
  selected,
  bulkOpen,
  bulkRemove,
  clearAll
}) => {

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
          <button className="btn" onClick={captureAllTabsInWindow}>Grab Tabs</button>
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
        <ul className="list">
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
          {tabs.map(tab => (
            <li key={tab.id} style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0'}}>
              <input
                type="checkbox"
                checked={selected.has(tab.id)}
                onChange={(e) => handleSelect(tab.id, e.target.checked)}
                aria-label={`Select ${tab.title}`}
              />
              <div className="row-button" onClick={() => openTab(tab.id)} style={{flex: 1, display: 'flex', alignItems: 'center', gap: '12px'}}>
                {tab.favicon ? (
                  <img src={tab.favicon} alt="" className="favicon" />
                ) : (
                  <div className="favicon" />
                )}
                <div className="min-w-0" style={{flex: 1}}>
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


