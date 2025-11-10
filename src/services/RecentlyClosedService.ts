export interface RecentlyClosedSession {
  id: string
  title: string
  session: chrome.sessions.Session
  timestamp: number
}

/**
 * Get title for session display
 */
function getSessionTitle(session: chrome.sessions.Session): string {
  if (session.tab) {
    return session.tab.title || session.tab.url || 'Untitled Tab'
  } else if (session.window) {
    const tabCount = session.window.tabs?.length || 0
    return `Window (${tabCount} tab${tabCount !== 1 ? 's' : ''})`
  }
  return 'Unknown Session'
}

export const RecentlyClosedService = {
  /**
   * Get recently closed tabs and windows
   */
  async getRecentlyClosed(): Promise<RecentlyClosedSession[]> {
    try {
      const sessions = await chrome.sessions.getRecentlyClosed()

      return sessions.map((session, index) => ({
        id: `recent-${index}-${Date.now()}`,
        title: getSessionTitle(session),
        session,
        timestamp: Date.now(),
      }))
    } catch (error) {
      console.error('Failed to get recently closed sessions:', error)
      return []
    }
  },

  /**
   * Restore a recently closed session
   */
  async restoreSession(session: RecentlyClosedSession): Promise<void> {
    try {
      const sessionId = session.session.tab?.sessionId ?? session.session.window?.sessionId
      if (sessionId) {
        await chrome.sessions.restore(sessionId)
      }
    } catch (error) {
      console.error('Failed to restore session:', error)
      throw new Error('Failed to restore recently closed item. Please try again.')
    }
  }
}
