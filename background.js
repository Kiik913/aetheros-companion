const OS_PAGE = 'aetheros.html';

function openOrFocusOs(cb) {
  const osUrl = chrome.runtime.getURL(OS_PAGE);
  chrome.tabs.query({}, (tabs) => {
    const hit = tabs.find(t => t.url && t.url.startsWith(osUrl));
    if (hit) {
      chrome.tabs.update(hit.id, { active: true }, () => {
        if (hit.windowId != null) chrome.windows.update(hit.windowId, { focused: true });
        cb && cb(hit);
      });
    } else {
      chrome.tabs.create({ url: osUrl }, cb);
    }
  });
}

chrome.action.onClicked.addListener(() => openOrFocusOs());

// Setup Context Menus (Text, Images, Links)
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({ id: 'ask-aura', title: "Ask Aura about '%s'", contexts: ['selection'] });
    chrome.contextMenus.create({ id: 'save-note', title: "Save '%s' to AetherOS Notes", contexts: ['selection'] });
    chrome.contextMenus.create({ id: 'clip-image', title: "Save Image to AetherOS", contexts: ['image'] });
    chrome.contextMenus.create({ id: 'clip-link', title: "Save Link to AetherOS", contexts: ['link'] });
  });
});

// Handle Context Menu Clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'ask-aura' || info.menuItemId === 'save-note') {
    chrome.storage.local.set({
      contextMenuText: info.selectionText || '',
      contextMenuAction: info.menuItemId,
      contextMenuSourceUrl: (tab && tab.url) || '',
      contextMenuSourceTitle: (tab && tab.title) || ''
    }, () => openOrFocusOs());
  } 
  else if (info.menuItemId === 'clip-image') {
    chrome.storage.local.set({
      clippedItem: { type: 'image', url: info.srcUrl, title: 'Clipped Image' }
    }, () => openOrFocusOs());
  } 
  else if (info.menuItemId === 'clip-link') {
    chrome.storage.local.set({
      clippedItem: { type: 'link', url: info.linkUrl, title: info.selectionText || 'Clipped Link' }
    }, () => openOrFocusOs());
  }
});

// Messages from content.js (Selection Popover & Clipboard)
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'aether:context-action') {
    chrome.storage.local.set({
      contextMenuText: msg.text || '',
      contextMenuAction: msg.action,
      contextMenuSourceUrl: msg.url || '',
      contextMenuSourceTitle: msg.title || ''
    }, () => openOrFocusOs(() => sendResponse({ ok: true })));
    return true;
  }
  
  if (msg.type === 'aether:clipboard-sync') {
    chrome.storage.local.get(['globalClipboard'], (res) => {
      let cb = res.globalClipboard || [];
      if (cb.length === 0 || cb[0].text !== msg.text) {
        cb.unshift({ text: msg.text, time: new Date().toISOString() });
        chrome.storage.local.set({ globalClipboard: cb.slice(0, 30) });
      }
    });
  }
});

// Broadcast Chrome Tabs to AetherOS
function broadcastTabs() {
  chrome.tabs.query({}, (tabs) => {
    const formatted = tabs.filter(t => t.url && !t.url.startsWith('chrome-extension://')).map(t => ({
      id: t.id, title: t.title || 'New Tab', favIconUrl: t.favIconUrl, active: t.active
    }));
    chrome.runtime.sendMessage({ type: 'aether:update-tabs', tabs: formatted }).catch(() => {});
  });
}

chrome.tabs.onUpdated.addListener(broadcastTabs);
chrome.tabs.onRemoved.addListener(broadcastTabs);
chrome.tabs.onCreated.addListener(broadcastTabs);