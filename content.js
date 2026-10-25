/* ============================================================
   AetherOS content script
   Adds a small "Ask Aura / Save to Notes / Copy" popover when
   the user selects text on a page, and forwards the selection
   to the extension via chrome.runtime.sendMessage.
   ============================================================ */
(() => {
  'use strict';

  // ---- guards: top frame only, skip extension pages, no double inject
  if (window.top !== window) return;
  if (location.protocol === 'chrome-extension:') return;
  if (window.__aetherContentLoaded) return;
  window.__aetherContentLoaded = true;

  const MIN_LEN     = 3;
  const MAX_LEN     = 4000;
  const HIDE_DELAY  = 120;
  const HOST_ID     = 'aether-selection-host';

  let hostEl   = null;   // shadow host
  let shadow   = null;
  let toolbar  = null;
  let hideTimer = null;
  let lastText  = '';
  let enabled   = true;

  // ---- kill switch (toggled from Settings later, if you add one)
  try {
    chrome.storage.local.get({ aether_content_enabled: true }, (r) => {
      enabled = r.aether_content_enabled !== false;
      if (!enabled) teardown();
    });
  } catch (_) { /* storage unavailable — stay enabled */ }

  // ---- UI -------------------------------------------------------------
  function ensureUi() {
    if (hostEl && document.documentElement.contains(hostEl)) return;

    hostEl = document.createElement('div');
    hostEl.id = HOST_ID;
    // zero-size absolute host: never intercepts page clicks
    hostEl.style.cssText =
      'all:initial;position:absolute;top:0;left:0;z-index:2147483647;';
    shadow = hostEl.attachShadow({ mode: 'closed' });

    const style = document.createElement('style');
    style.textContent = `
      .bar {
        display: flex; gap: 4px; padding: 4px;
        background: rgba(15,23,42,.96);
        border: 1px solid rgba(255,255,255,.14);
        border-radius: 10px;
        box-shadow: 0 8px 28px rgba(0,0,0,.45);
        font: 500 12px/1 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
        opacity: 0; transform: translateY(4px);
        transition: opacity .12s ease, transform .12s ease;
        pointer-events: auto;
      }
      .bar.show { opacity: 1; transform: translateY(0); }
      button {
        all: unset; cursor: pointer; white-space: nowrap;
        padding: 7px 11px; border-radius: 7px;
        color: #f8fafc; background: transparent;
        display: flex; align-items: center; gap: 5px;
      }
      button:hover  { background: rgba(255,255,255,.10); }
      button:active { background: rgba(255,255,255,.18); }
      button.primary       { background: #6366f1; }
      button.primary:hover { background: #4f46e5; }
      .sep { width: 1px; background: rgba(255,255,255,.14); margin: 4px 1px; }
    `;

    toolbar = document.createElement('div');
    toolbar.className = 'bar';
    toolbar.setAttribute('role', 'toolbar');
    toolbar.setAttribute('aria-label', 'AetherOS actions');

    toolbar.append(
      mkBtn('🤖 Ask Aura',       'ask-aura', 'primary'),
      mkBtn('🗒️ Save to Notes', 'save-note'),
      Object.assign(document.createElement('div'), { className: 'sep' }),
      mkBtn('📋 Copy',           'copy')
    );

    shadow.append(style, toolbar);
    document.documentElement.appendChild(hostEl);
  }

  function mkBtn(label, action, cls) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    if (cls) b.className = cls;
    b.dataset.action = action;
    // keep the page selection alive while clicking
    b.addEventListener('mousedown', (e) => e.preventDefault());
    b.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      run(action);
    });
    return b;
  }

  // ---- placement ------------------------------------------------------
  function place(rect) {
    ensureUi();

    const pad = 8;
    toolbar.classList.remove('show');
    hostEl.style.visibility = 'hidden';       // measure without flash

    const w = toolbar.getBoundingClientRect().width;
    const h = toolbar.getBoundingClientRect().height;

    let left = rect.left + rect.width / 2 - w / 2 + window.scrollX;
    let top  = rect.top - h - 10 + window.scrollY;

    if (top < window.scrollY + pad) top = rect.bottom + 10 + window.scrollY; // flip below
    left = Math.max(
      window.scrollX + pad,
      Math.min(left, window.scrollX + document.documentElement.clientWidth - w - pad)
    );

    hostEl.style.left = left + 'px';
    hostEl.style.top  = top  + 'px';
    hostEl.style.visibility = '';

    requestAnimationFrame(() => toolbar.classList.add('show'));
  }

  function hide() {
    if (toolbar) toolbar.classList.remove('show');
  }

  function teardown() {
    hide();
    if (hostEl) { hostEl.remove(); hostEl = null; shadow = null; toolbar = null; }
  }

  // ---- selection ------------------------------------------------------
  function currentText() {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return { text: '', rect: null };

    const text = String(sel).replace(/\s+/g, ' ').trim();
    if (text.length < MIN_LEN) return { text: '', rect: null };

    let rect = null;
    try {
      const r = sel.getRangeAt(0).getBoundingClientRect();
      if (r && (r.width || r.height)) rect = r;
    } catch (_) {}
    if (!rect) return { text: '', rect: null };

    return { text: text.slice(0, MAX_LEN), rect };
  }

  function onSelectionChange() {
    if (!enabled) return;
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      const { text, rect } = currentText();
      if (!text || !rect) { hide(); return; }
      lastText = text;
      place(rect);
    }, HIDE_DELAY);
  }

  // ---- actions --------------------------------------------------------
  function run(action) {
    const text = currentText().text || lastText;
    if (!text) { hide(); return; }

    if (action === 'copy') {
      navigator.clipboard.writeText(text).catch(() => {});
      hide();
      return;
    }

    try {
      chrome.runtime.sendMessage({
        type: 'aether:context-action',
        action,
        text,
        url:   location.href,
        title: document.title
      }, () => { void chrome.runtime.lastError; }); // swallow "no receiver"
    } catch (_) {}

    hide();
  }

  // ---- listeners ------------------------------------------------------
  document.addEventListener('selectionchange', onSelectionChange, { passive: true });

  document.addEventListener('mousedown', (e) => {
    if (hostEl && e.composedPath().includes(hostEl)) return;
    hide();
  }, true);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hide();
  }, true);

  window.addEventListener('scroll',  hide, { passive: true, capture: true });
  window.addEventListener('resize',  hide, { passive: true });
  window.addEventListener('pagehide', teardown, { once: true });

  // ---- optional: pull current selection on demand from the OS --------
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (!msg || msg.type !== 'aether:get-selection') return;
    const sel = window.getSelection();
    sendResponse({
      text: sel && !sel.isCollapsed ? String(sel).trim().slice(0, MAX_LEN) : '',
      url:   location.href,
      title: document.title
    });
  });
})();
  // ---- Persistent Clipboard Sync ----
  document.addEventListener('copy', () => {
    const text = window.getSelection().toString().trim();
    if (text.length > 0) {
      chrome.runtime.sendMessage({ type: 'aether:clipboard-sync', text: text }).catch(() => {});
    }
  });