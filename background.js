/* ============================================================
   AetherOS — background service worker (MV3)
   - Toolbar click: open or focus the AetherOS tab
   - Context menus (selection): forward to the OS
   - Receives messages from content.js selection popover
   ============================================================ */

const OS_PAGE = 'aetheros.html';

/* Open a fresh AetherOS tab, or focus the existing one. */
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

/* ---- Toolbar button ------------------------------------------------ */
chrome.action.onClicked.addListener(() => openOrFocusOs());

/* ---- Context menus (right-click on selection) ---------------------- */
chrome.runtime.onInstalled.addListener(() => {
  // removeAll first so updates don't spam "duplicate id" errors
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'ask-aura',
      title: "Ask Aura about '%s'",
      contexts: ['selection']
    });
    chrome.contextMenus.create({
      id: 'save-note',
      title: "Save '%s' to AetherOS Notes",
      contexts: ['selection']
    });
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== 'ask-aura' && info.menuItemId !== 'save-note') return;

  chrome.storage.local.set({
    contextMenuText:        info.selectionText || '',
    contextMenuAction:      info.menuItemId,
    contextMenuSourceUrl:   (tab && tab.url)   || '',
    contextMenuSourceTitle: (tab && tab.title) || ''
  }, () => openOrFocusOs());
});

/* ---- Messages from content.js selection popover -------------------- */
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (!msg || msg.type !== 'aether:context-action') return;
  if (msg.action !== 'ask-aura' && msg.action !== 'save-note') return;

  chrome.storage.local.set({
    contextMenuText:        msg.text  || '',
    contextMenuAction:      msg.action,
    contextMenuSourceUrl:   msg.url   || '',
    contextMenuSourceTitle: msg.title || ''
  }, () => openOrFocusOs(() => sendResponse({ ok: true })));

  return true; // keep the message channel open for the async reply
});