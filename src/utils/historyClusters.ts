export interface HistoryVisitNode {
  id: string
  url: string
  title: string
  visitTime: number
  transition?: string
  referringVisitId?: string
  domain: string
}

export interface QueryCluster {
  query: string
  dayBucket: 'Today' | 'Yesterday' | 'This Week' | 'Older'
  visits: HistoryVisitNode[]
}

const ONE_DAY = 24 * 60 * 60 * 1000

function getDayBucket(ts: number): QueryCluster['dayBucket'] {
  const now = Date.now()
  const diff = now - ts
  if (diff < ONE_DAY) return 'Today'
  if (diff < 2 * ONE_DAY) return 'Yesterday'
  if (diff < 7 * ONE_DAY) return 'This Week'
  return 'Older'
}

function extractQueryFromUrl(url: string): string | null {
  try {
    const u = new URL(url)
    const host = u.hostname
    if (/google\./.test(host) && u.pathname.startsWith('/search')) {
      return u.searchParams.get('q')
    }
    if (/bing\./.test(host) && u.pathname === '/search') {
      return u.searchParams.get('q')
    }
    if (/duckduckgo\.com/.test(host) && u.pathname === '/') {
      return u.searchParams.get('q')
    }
    return null
  } catch {
    return null
  }
}

function normalizeQuery(q: string): string {
  return q.trim().toLowerCase()
}

export async function buildGroupedHistory(days: number = 7): Promise<QueryCluster[]> {
  const startTime = Date.now() - days * ONE_DAY

  const results = await chrome.history.search({ text: '', startTime, maxResults: 5000 })

  // Map url -> visits for quick lookup
  const urlToMeta = new Map<string, { title: string }>()
  results.forEach(r => urlToMeta.set(r.url!, { title: r.title ?? r.url! }))

  // Gather SERP entries and their visits to get visitId chains
  const serpEntries = results.filter(r => r.url && extractQueryFromUrl(r.url))

  const clustersByQuery = new Map<string, QueryCluster>()

  for (const serp of serpEntries) {
    const queryRaw = extractQueryFromUrl(serp.url!)
    if (!queryRaw) continue
    const query = normalizeQuery(queryRaw)

    const visits = await chrome.history.getVisits({ url: serp.url! })
    // For each visit, find children visits that reference it within a time window
    for (const v of visits) {
      const parentId = v.visitId
      const parentTime = v.visitTime ?? serp.lastVisitTime ?? Date.now()
      const windowMs = 30 * 60 * 1000
      const lower = parentTime - 1
      const upper = parentTime + windowMs

      // Find candidate result urls around that time (heuristic)
      const nearby = results.filter(r => {
        const t = r.lastVisitTime ?? 0
        return t >= lower && t <= upper && r.url !== serp.url
      })

      const children: HistoryVisitNode[] = []
      for (const n of nearby) {
        if (!n.url) continue
        const childVisits = await chrome.history.getVisits({ url: n.url })
        const hasRef = childVisits.some((cv: { referringVisitId?: string }) => cv.referringVisitId === parentId)
        if (!hasRef) continue
        try {
          const u = new URL(n.url)
          children.push({
            id: `${parentId}-${n.id}`,
            url: n.url!,
            title: urlToMeta.get(n.url!)?.title ?? n.url!,
            visitTime: (n.lastVisitTime ?? parentTime) as number,
            domain: u.hostname,
            referringVisitId: parentId,
          })
        } catch { /* ignore invalid URL */ }
      }

      if (children.length > 0) {
        const bucket = getDayBucket(parentTime as number)
        const cluster = clustersByQuery.get(query) ?? { query, dayBucket: bucket, visits: [] }
        cluster.dayBucket = bucket // last write wins, they should be similar within a day
        // de-dup by url
        const existing = new Set(cluster.visits.map(v => v.url))
        for (const c of children) {
          if (!existing.has(c.url)) cluster.visits.push(c)
        }
        clustersByQuery.set(query, cluster)
      }
    }
  }

  // Sort clusters by most recent
  const clusters = Array.from(clustersByQuery.values())
  clusters.forEach(c => c.visits.sort((a, b) => b.visitTime - a.visitTime))
  clusters.sort((a, b) => (b.visits[0]?.visitTime ?? 0) - (a.visits[0]?.visitTime ?? 0))
  return clusters
}


