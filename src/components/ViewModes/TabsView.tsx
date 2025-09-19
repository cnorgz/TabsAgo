import React from 'react'

import { TabItem } from '../../types/Tab'

interface TabsViewProps {
  items: TabItem[]
  onRemove: (id: string) => void
}

const TabsView: React.FC<TabsViewProps> = ({ items, onRemove }) => {
  return (
    <div className="tabs-grid wide-row">
      {items.map(item => (
        <div key={item.id}
             className="chrome-tab"
             title={item.title}
             onClick={() => window.open(item.url, '_blank', 'noopener,noreferrer')}
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
            onClick={(e) => { e.stopPropagation(); onRemove(item.id) }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}

export default TabsView


