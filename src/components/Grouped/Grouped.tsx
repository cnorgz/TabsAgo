import React, { useEffect, useState } from 'react'

import { buildGroupedHistory, QueryCluster } from '../../utils/historyClusters'

const Grouped: React.FC = () => {
  const [clusters, setClusters] = useState<QueryCluster[] | null>(null)
  const [, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const c = await buildGroupedHistory(7)
      setClusters(c)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Auto-load clusters. If permission was not granted yet, user will be prompted once.
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // TODO(style): Replace inline styles with Tailwind utility classes in Phase 2 polish.
  return (
    <div className="section">
      <div className="toolbar mb-2">
        <h3 className="title">Grouped (from History)</h3>
      </div>

      {clusters && clusters.length === 0 && (
        <div style={{color:'#9aa3b2'}}>No grouped results found.</div>
      )}

      {clusters && clusters.length > 0 && (
        <div className="list">
          {clusters.map((c, idx) => (
            <div key={idx} className="card">
              <div className="card-header">
                <div className="title">“{c.query}”</div>
                <div className="domain">{c.dayBucket}</div>
              </div>
              <ul className="list card-body">
                {c.visits.slice(0,5).map(v => (
                  <li key={v.url}>
                    <div className="row-button" onClick={() => window.open(v.url, '_blank', 'noopener,noreferrer')}>
                      <div className="favicon" />
                      <div className="min-w-0">
                        <div className="title" title={v.title}>{v.title}</div>
                        <div className="domain">{v.domain}</div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Grouped


