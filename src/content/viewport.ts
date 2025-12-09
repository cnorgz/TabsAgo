const VPS_SAVE = 'VPS_SAVE'
const VPS_REQUEST = 'VPS_REQUEST'
const VPS_RESTORE = 'VPS_RESTORE'

const getUrl = () => {
  try {
    return window.location.href
  } catch {
    return ''
  }
}

const getViewportPayload = () => {
  return {
    scrollX: window.scrollX,
    scrollY: window.scrollY,
    vw: window.innerWidth,
    vh: window.innerHeight,
    dpr: window.devicePixelRatio || 1,
    url: getUrl(),
    ts: Date.now(),
  }
}

const sendMessage = (message: unknown, callback?: (response: unknown) => void) => {
  try {
    if (callback) {
      chrome.runtime.sendMessage(message, callback)
    } else {
      chrome.runtime.sendMessage(message)
    }
  } catch (error) {
    console.error('viewport message failed', error)
  }
}

const handleSave = () => {
  const payload = getViewportPayload()
  if (!payload.url) return
  sendMessage({ type: VPS_SAVE, payload })
}

const handleRestoreRequest = () => {
  const url = getUrl()
  if (!url) return
  sendMessage({ type: VPS_REQUEST, payload: { url } }, (response: unknown) => {
    if (chrome.runtime.lastError || !response) {
      return
    }
    const res = response as { type?: string; payload?: { scrollX?: number; scrollY?: number } }
    if (res.type === VPS_RESTORE && res.payload) {
      const { scrollX = 0, scrollY = 0 } = res.payload
      window.scrollTo({ left: scrollX, top: scrollY, behavior: 'auto' })
    }
  })
}

const setup = () => {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      handleSave()
    }
  })

  window.addEventListener('pagehide', handleSave)
  window.addEventListener('pageshow', handleRestoreRequest)
}

setup()
