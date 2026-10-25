/* ============================================================
   AetherOS frame-buster (Main World Edition)
   Runs directly in the page's context via manifest.json.
   ============================================================ */
(() => {
  'use strict';

  // Don't run on extension pages or the top-level window
  if (location.protocol === 'chrome-extension:') return;
  if (window.top === window.self) return;

  try {
    Object.defineProperty(window, 'top', { get: () => window.self, configurable: false });
  } catch (e) {}
  
  try {
    Object.defineProperty(window, 'parent', { get: () => window.self, configurable: false });
  } catch (e) {}
  
  try {
    Object.defineProperty(window, 'frameElement', { get: () => null, configurable: false });
  } catch (e) {}
  
  try {
    Object.defineProperty(document, 'referrer', { get: () => '', configurable: false });
  } catch (e) {}
})();