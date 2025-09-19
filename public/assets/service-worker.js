const appUrl = chrome.runtime.getURL('index.html');

async function openOrFocusAppTab(options = {}) {
  const existing = await chrome.tabs.query({ url: appUrl });
  if (existing.length > 0) {
    const tab = existing[0];
    if (tab.id) {
      await chrome.tabs.update(tab.id, { active: true });
      if (tab.windowId !== undefined) {
        await chrome.windows.update(tab.windowId, { focused: true });
      }
    }
    return;
  }
  await chrome.tabs.create({ url: appUrl, pinned: options.pinned ?? true, active: options.active ?? true });
}

chrome.runtime.onInstalled.addListener(() => {
  openOrFocusAppTab({ pinned: true, active: false });
});

chrome.action.onClicked.addListener(() => {
  openOrFocusAppTab({ pinned: true, active: true });
});

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === 'CREATE_TAB' && typeof message.url === 'string') {
    chrome.tabs.create({ url: message.url, active: true });
  }
});


