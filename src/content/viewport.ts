const VIEWPORT_SAVE = 'VIEWPORT_SAVE'
const VIEWPORT_REQUEST = 'VIEWPORT_REQUEST'
const VIEWPORT_RESTORE = 'VIEWPORT_RESTORE'

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

const sendMessage = (message: any) => {
  try {
    chrome.runtime.sendMessage(message)
  } catch (error) {
    console.debug('viewport message failed', error)
  }
}

const handleSave = () => {
  const payload = getViewportPayload()
  if (!payload.url) return
  sendMessage({ type: VIEWPORT_SAVE, payload })
}

const handleRestoreRequest = () => {
  const url = getUrl()
  if (!url) return
  try {
    chrome.runtime.sendMessage({ type: VIEWPORT_REQUEST, payload: { url } }, (response) => {
      if (chrome.runtime.lastError || !response) {
        return
      }
      if (response.type === VIEWPORT_RESTORE && response.payload) {
        const { scrollX = 0, scrollY = 0 } = response.payload
        window.scrollTo({ left: scrollX, top: scrollY, behavior: 'auto' })
      }
    })
  } catch (error) {
    console.debug('viewport restore request failed', error)
  }
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
