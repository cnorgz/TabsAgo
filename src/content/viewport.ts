const SESSION_KEY = 'tabsago_viewport_event'

type ViewportEventType = 'visibilitychange' | 'pagehide' | 'pageshow'

interface ViewportEventPayload {
  type: ViewportEventType
  visibilityState: DocumentVisibilityState
  timestamp: number
  persisted?: boolean
}

const persistEvent = async (payload: ViewportEventPayload) => {
  if (typeof chrome === 'undefined' || !chrome.storage?.session) return

  try {
    await chrome.storage.session.set({ [SESSION_KEY]: payload })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('TabsAGO viewport content script failed to persist event', error)
  }
}

document.addEventListener('visibilitychange', () => {
  void persistEvent({
    type: 'visibilitychange',
    visibilityState: document.visibilityState,
    timestamp: Date.now()
  })
})

window.addEventListener('pagehide', () => {
  void persistEvent({
    type: 'pagehide',
    visibilityState: document.visibilityState,
    timestamp: Date.now()
  })
})

window.addEventListener('pageshow', (event) => {
  void persistEvent({
    type: 'pageshow',
    visibilityState: document.visibilityState,
    timestamp: Date.now(),
    persisted: Boolean((event as PageTransitionEvent).persisted)
  })
})

export {}
