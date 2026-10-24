/* ============================================================
   AetherOS frame-buster
   Runs at document_start in ALL frames (not top-level).
   Neutralizes window.top / window.parent / window.frameElement
   so sites can't detect they're inside an iframe and escape.
   ============================================================ */
(() => {
  'use strict';

  // Only run inside iframes — never touch the top-level page
  if (window.top === window.self) return;

  // Inject into the page's MAIN world (bypasses the page's own CSP,
  // which we stripped anyway via rules.json — belt and suspenders).
  const CODE = `
    (function () {
      try {
        Object.defineProperty(window, 'top', {
          get: function () { return window.self; },
          configurable: false
        });
      } catch (e) {}
      try {
        Object.defineProperty(window, 'parent', {
          get: function () { return window.self; },
          configurable: false
        });
      } catch (e) {}
      try {
        Object.defineProperty(window, 'frameElement', {
          get: function () { return null; },
          configurable: false
        });
      } catch (e) {}
      // Belt-and-suspenders: also kill document.referrer checks
      try {
        Object.defineProperty(document, 'referrer', {
          get: function () { return ''; },
          configurable: false
        });
      } catch (e) {}
    })();
  `;

  const inject = () => {
    try {
      const s = document.createElement('script');
      s.textContent = CODE;
      const target = document.head || document.documentElement;
      if (!target) return false;
      target.appendChild(s);
      s.remove();
      return true;
    } catch (e) {
      return false;
    }
  };

  if (!inject()) {
    // Very early document_start — wait for documentElement to exist
    const obs = new MutationObserver(() => {
      if (document.documentElement) {
        obs.disconnect();
        inject();
      }
    });
    obs.observe(document, { childList: true, subtree: true });
    // Safety net
    document.addEventListener('DOMContentLoaded', () => {
      obs.disconnect();
      inject();
    }, { once: true });
  }
})();