/* ============================================================
   AetherOS v7.0 — Foundation Edition (Chrome MV3 compliant)
   Includes: Alt+Tab, Video Wallpaper, Context Menu integration
   ============================================================ */
const IS_MAC = /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
const MOD_KEY = IS_MAC ? 'metaKey' : 'ctrlKey';
const MOD_LABEL = IS_MAC ? '⌘' : 'Ctrl';
const IS_TOUCH = (typeof window !== 'undefined') && (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || matchMedia('(pointer: coarse)').matches);
const LONG_PRESS_MS = 500;

let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
  const now = Date.now();
  if (now - lastTouchEnd <= 300) e.preventDefault();
  lastTouchEnd = now;
}, { passive: false });

function setupViewport() {
  const setVH = () => {
    const h = (window.visualViewport ? window.visualViewport.height : window.innerHeight);
    document.documentElement.style.setProperty('--app-h', h + 'px');
  };
  setVH();
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', setVH);
    window.visualViewport.addEventListener('scroll', setVH);
  } else {
    window.addEventListener('resize', setVH);
  }
  window.addEventListener('orientationchange', () => setTimeout(setVH, 200));
}
setupViewport();

function addLongPress(el, handler, duration = LONG_PRESS_MS) {
  let timer = null, startX = 0, startY = 0, triggered = false;
  const start = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    triggered = false;
    startX = e.clientX; startY = e.clientY;
    timer = setTimeout(() => {
      timer = null; triggered = true;
      if (navigator.vibrate) try { navigator.vibrate(15); } catch(_) {}
      handler(e);
    }, duration);
  };
  const cancel = () => { if (timer) { clearTimeout(timer); timer = null; } };
  const move = (e) => {
    if (!timer) return;
    if (Math.abs(e.clientX - startX) > 10 || Math.abs(e.clientY - startY) > 10) cancel();
  };
  el.addEventListener('pointerdown', start);
  el.addEventListener('pointerup', cancel);
  el.addEventListener('pointercancel', cancel);
  el.addEventListener('pointerleave', cancel);
  el.addEventListener('pointermove', move);
  el.addEventListener('contextmenu', (e) => { if (e.pointerType && e.pointerType !== 'mouse') e.preventDefault(); });
  el.__wasLongPress = () => triggered;
}

/* ============ VFS ============ */
const VFS = {
  home: { 'welcome.txt': 'Welcome to AetherOS v7.0!\n\nNew in this release:\n- Window tabs\n- Global search (Ctrl+K)\n- Quick Look\n- Storage dashboard\n- Trash Undo\n- AI right-click actions\n- Corner snap\n- Screenshot tool\n- Custom apps with auto-fill\n- Full mobile/touch support\n- Drag & Drop Uploads\n- Full Media Player (Audio & Video)' },
  documents: {
    'welcome.txt': 'AetherOS v7.0 — Foundation Edition.\n\nEvery feature you asked for is here. Type Ctrl+K to search across files, notes, chat history, and kanban.',
    'todo.txt': '1. Open Files and press Space on a file to Quick Look it\n2. Right-click any file → "Ask Aura"\n3. Try Ctrl+Shift+S for screenshot\n4. Check Storage dashboard in Settings\n5. Add custom apps — name auto-fills from URL!'
  },
  downloads: {}, pictures: {}, music: {},
  system: { 'version.info': 'AetherOS 7.0.0-foundation-edition' }
};

const CORE_APPS = ['explorer','terminal','settings','store'];

const EXTERNAL_OS = [
  { id:'paperos', name:'PaperOS', icon:'📜', url:'https://paperos.paperproductions.org/', desc:'Minimal terminal-focused web OS.' },
  { id:'hyggshios', name:'Hyggshi OS', icon:'🌐', url:'https://hyggshiosdeveloper.github.io/hyggshi-os-website/OSmain.html', desc:'Modern browser-based desktop OS.' },
  { id:'rebornxp', name:'Reborn XP', icon:'🪟', url:'https://quenq.com/', desc:'High-fidelity Windows XP simulation.' },
  { id:'windows96', name:'Windows 96', icon:'💾', url:'https://windows96.net/', desc:'Browser-based parody OS.' },
  { id:'win98js', name:'98.js', icon:'🖥️', url:'https://98.js.org/', desc:'Web-based Windows 98 desktop.' },
  { id:'ubuntuweb', name:'Ubuntu Web', icon:'🟠', url:'https://vivek9patel.github.io/', desc:'Ubuntu 20.04 desktop simulation.' },
  { id:'macosweb', name:'macOS Web', icon:'🍎', url:'https://macos-web.app/', desc:'macOS desktop simulation.' },
  { id:'winxpvercel', name:'WinXP React', icon:'🟦', url:'https://winxp.vercel.app/', desc:'Windows XP desktop recreation.' },
  { id:'win10web', name:'Windows 10', icon:'🖥️', url:'https://win-10.vercel.app/', desc:'Windows 10 desktop recreation.' },
  { id:'win11react', name:'Windows 11', icon:'💠', url:'https://win11.blueedge.me/', desc:'Windows 11 desktop recreation.' }
];

const APPS = [
    { id:'paint', name:'Aura Paint', icon:'🎨', category:'tools', desc:'Draw and save images.' },
  { id:'camera', name:'Camera', icon:'📷', category:'tools', desc:'Take webcam photos.' },
  { id:'synth', name:'Beat Maker', icon:'🎹', category:'tools', desc:'Make music with Web Audio.' },
      { id:'quicksearch', name:'Quick Search', icon:'🌐', category:'internet', desc:'Floating web search panel.' },
  { id:'explorer', name:'Files', icon:'📁', category:'system', desc:'Browse, create, and manage your virtual files.' },
  { id:'terminal', name:'Terminal', icon:'⌨️', category:'system', desc:'AetherOS command shell.' },
  { id:'settings', name:'Settings', icon:'⚙️', category:'system', desc:'Customize everything about AetherOS.' },
  { id:'store', name:'App Store', icon:'🛍️', category:'system', desc:'Install and uninstall apps.' },
  { id:'profile', name:'Profiles', icon:'👤', category:'system', desc:'Export PNG cards and JSON backups.' },
  { id:'trash', name:'Trash', icon:'🗑️', category:'system', desc:'Restore or permanently delete removed files.' },
  { id:'aurasearch', name:'Aura Search', icon:'🔎', category:'internet', desc:'Multi-engine search with YouTube routing.' },
  { id:'aurayt', name:'Aura YouTube', icon:'▶️', category:'internet', desc:'Play YouTube videos and playlists.' },
  { id:'browser', name:'Wiki Search', icon:'🌍', category:'internet', desc:'Lightweight internal web browser.' },
  { id:'editor', name:'Text Editor', icon:'📝', category:'tools', desc:'Create and edit text files.' },
  { id:'calculator', name:'Calculator', icon:'🧮', category:'tools', desc:'Fast offline calculator with history.' },
  { id:'notes', name:'Sticky Notes', icon:'🗒️', category:'tools', desc:'Floating notes that live on your desktop.' },
  { id:'clipboard', name:'Clipboard', icon:'📋', category:'tools', desc:'History of your last 30 copies.' },
  { id:'password', name:'Password Gen', icon:'🔑', category:'tools', desc:'Cryptographically secure passwords.' },
  { id:'converter', name:'Unit Converter', icon:'📐', category:'tools', desc:'Length, mass, temperature, time, area.' },
  { id:'colorpicker', name:'Color Picker', icon:'🎨', category:'tools', desc:'Pick colors and generate palettes.' },
  { id:'aurachat', name:'Aura Chat', icon:'🤖', category:'tools', desc:'AI assistant powered by Puter.js.' },
  { id:'imageviewer', name:'Image Viewer', icon:'🖼️', category:'tools', desc:'View images with zoom and rotate.' },
  { id:'weather', name:'Weather', icon:'🌤️', category:'tools', desc:'Current weather and 5-day forecast.' },
  { id:'mediaplayer', name:'Media Player', icon:'📺', category:'media', desc:'Play videos and music from VFS.' },
  { id:'json', name:'JSON Tools', icon:'{ }', category:'dev', desc:'Format, minify and validate JSON.' },
  { id:'base64', name:'Base64', icon:'🔤', category:'dev', desc:'Encode and decode Base64.' },
  { id:'uuid', name:'UUID Gen', icon:'🆔', category:'dev', desc:'Generate UUID v4 in bulk.' },
  { id:'timestamp', name:'Timestamp', icon:'⏱️', category:'dev', desc:'Convert Unix timestamps.' },
  { id:'markdown', name:'Markdown Editor', icon:'📖', category:'dev', desc:'Write markdown with live preview.' },
  { id:'kanban', name:'Kanban', icon:'📊', category:'dev', desc:'Drag-and-drop task board.' },
  { id:'music', name:'Aura Player', icon:'🎵', category:'media', desc:'Play local audio with visualizer.' },
  { id:'g2048', name:'2048', icon:'🎮', category:'games', desc:'Slide tiles to reach 2048.' },
  { id:'tictactoe', name:'Tic-Tac-Toe', icon:'❌', category:'games', desc:'Play against an unbeatable AI.' },
  { id:'dice', name:'Dice Roller', icon:'🎲', category:'games', desc:'Roll D4–D20 dice.' },
  { id:'coin', name:'Coin Flip', icon:'🪙', category:'games', desc:'Heads or tails.' },
  ...EXTERNAL_OS.map(o => ({ id:o.id, name:o.name, icon:o.icon, category:'os', desc:o.desc, isExternalOS:true }))
];

const SEARCH_ENGINES = {
  google:{name:'Google',url:'https://www.google.com/search?q='},
  bing:{name:'Bing',url:'https://www.bing.com/search?q='},
  duckduckgo:{name:'DuckDuckGo',url:'https://duckduckgo.com/?q='},
  brave:{name:'Brave',url:'https://search.brave.com/search?q='},
  wikipedia:{name:'Wikipedia',url:'https://en.wikipedia.org/wiki/Special:Search?search='},
  youtube:{name:'YouTube',url:'https://www.youtube.com/results?search_query='},
  github:{name:'GitHub',url:'https://github.com/search?q='},
  stackoverflow:{name:'Stack Overflow',url:'https://stackoverflow.com/search?q='}
};

let windows=[],activeWindowId=null,zIndexCounter=100,currentWorkspace=0;
const WORKSPACE_COUNT=4,notifications=[];
let slideshowTimer=null,liveWallTimer=null;
let quickLookFile=null;
let quickLookContent='';
let altTabActive=false, altTabIndex=0;

const USER_VFS_KEY='aether_user_vfs_v1',HISTORY_KEY='aether_history_v1',THEME_KEY='aether_theme_v1',FUN_KEY='aether_fun_v1',ICON_COLOR_KEY='aether_icon_colors_v1',PINNED_KEY='aether_pinned_v1',TERM_HISTORY_KEY='aether_term_history_v1',STICKIES_KEY='aether_stickies_v1',WINDOW_STYLE_KEY='aether_window_style_v1',CALC_HISTORY_KEY='aether_calculator_history_v1',TRASH_KEY='aether_trash_v1',CLIPBOARD_KEY='aether_clipboard_v1',KANBAN_KEY='aether_kanban_v1',PIN_KEY='aether_pin_v1',SOUND_KEY='aether_sound_v1',LOCK_KEY='aether_lock_v1',WEATHER_KEY='aether_weather_v1',SLIDESHOW_KEY='aether_slideshow_v1',LIVEWALL_KEY='aether_livewall_v1',MD_KEY='aether_md_draft_v1',INSTALLED_KEY='aether_installed_v1',SESSION_KEY='aether_session_v1',CUSTOM_APPS_KEY='aether_custom_apps_v1';
const AI_HISTORY_KEY='aether_ai_history_v1',AI_SYSTEM_KEY='aether_ai_system_v1',AI_MODEL_KEY='aether_ai_model_v1';

/* ============ Custom Apps ============ */
function getCustomApps(){try{const x=JSON.parse(localStorage.getItem(CUSTOM_APPS_KEY)||'[]');return Array.isArray(x)?x:[];}catch(e){return[];}}
function saveCustomApps(a){try{localStorage.setItem(CUSTOM_APPS_KEY,JSON.stringify(a));}catch(e){}}
function getAllApps(){return [...APPS,...getCustomApps()];}
function isCustomApp(id){return typeof id==='string'&&id.startsWith('custom-');}

function iconHtml(icon){
  const s=String(icon||'📦');
  if(/^(https?:|data:image\/)/i.test(s)){
    return `<img src="${sanitizeHTML(s)}" alt="" style="width:1em;height:1em;object-fit:contain;vertical-align:middle;display:inline-block;">`;
  }
  return sanitizeHTML(s);
}

let customAppNameAuto = true;
let customAppIconAuto = true;
let autoFillTitleTimer = null;

function deriveNameFromUrl(rawUrl) {
  try {
    let u = String(rawUrl || '').trim();
    if (!u) return '';
    if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
    const host = new URL(u).hostname.replace(/^www\./, '');
    if (!host) return '';
    let parts = host.split('.');
    if (parts.length < 2) return host;
    parts = parts.slice(0, -1);
    const secondLevel = ['co', 'com', 'org', 'net', 'gov', 'edu', 'ac'];
    if (parts.length > 1 && secondLevel.includes(parts[parts.length - 1].toLowerCase())) {
      parts = parts.slice(0, -1);
    }
    let name = parts.join(' ').replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
    name = name.split(' ').filter(Boolean).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    return name || host;
  } catch { return ''; }
}

function getFaviconUrl(rawUrl) {
  try {
    let u = String(rawUrl || '').trim();
    if (!u) return '';
    if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
    const host = new URL(u).hostname;
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`;
  } catch { return ''; }
}

async function tryFetchPageTitle(rawUrl) {
  try {
    let u = String(rawUrl || '').trim();
    if (!u) return '';
    if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
    new URL(u);
    const proxy = 'https://api.allorigins.win/get?url=' + encodeURIComponent(u);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 5000);
    const r = await fetch(proxy, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!r.ok) return '';
    const j = await r.json();
    const html = j.contents || '';
    const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (!m) return '';
    let title = m[1].replace(/\s+/g, ' ').trim();
    title = title.replace(/\s*[|\-–—·:]\s*[^|\-–—·:]{1,30}$/, '').trim();
    return title.length >= 2 ? title.slice(0, 60) : '';
  } catch { return ''; }
}

function autoFillCustomAppFields(forceTitleFetch) {
  const urlInput  = document.getElementById('ca-url');
  const nameInput = document.getElementById('ca-name');
  const iconInput = document.getElementById('ca-icon');
  if (!urlInput || !nameInput || !iconInput) return;
  const url = urlInput.value.trim();
  if (!url) return;

  if (customAppNameAuto && !nameInput.value.trim()) {
    const derived = deriveNameFromUrl(url);
    if (derived) nameInput.value = derived;
  }
  if (customAppIconAuto && (!iconInput.value.trim() || iconInput.value.trim() === '🌐')) {
    const fav = getFaviconUrl(url);
    if (fav) { iconInput.value = fav; updateCaPreview(); }
  }

  if (autoFillTitleTimer) clearTimeout(autoFillTitleTimer);
  const delay = forceTitleFetch ? 0 : 700;
  autoFillTitleTimer = setTimeout(async () => {
    if (!customAppNameAuto) return;
    const currentUrl  = urlInput.value.trim();
    const derived     = deriveNameFromUrl(currentUrl);
    const currentName = nameInput.value.trim();
    if (currentName && currentName !== derived) return;
    const real = await tryFetchPageTitle(currentUrl);
    if (real && customAppNameAuto) nameInput.value = real;
  }, delay);
}

let editingCustomAppId=null;

function updateCaPreview(){
  const icon=(document.getElementById('ca-icon').value||'🌐').trim();
  const p=document.getElementById('ca-preview');
  if(/^(https?:|data:image\/)/i.test(icon)) p.innerHTML=`<img src="${sanitizeHTML(icon)}" alt="">`;
  else p.textContent=icon||'🌐';
}

function openCustomAppModal(id){
  editingCustomAppId = id || null;
  const t = document.getElementById('custom-app-title');
  if (id) {
    customAppNameAuto = false;
    customAppIconAuto = false;
    const app = getCustomApps().find(a => a.id === id);
    if (!app) return;
    t.textContent = 'Edit Custom App';
    document.getElementById('ca-name').value = app.name;
    document.getElementById('ca-url').value  = app.url;
    document.getElementById('ca-icon').value = app.icon || '🌐';
    document.getElementById('ca-desc').value = app.desc || '';
  } else {
    customAppNameAuto = true;
    customAppIconAuto = true;
    t.textContent = 'Add Custom App';
    document.getElementById('ca-name').value = '';
    document.getElementById('ca-url').value  = '';
    document.getElementById('ca-icon').value = '🌐';
    document.getElementById('ca-desc').value = '';
  }
  updateCaPreview();
  document.getElementById('custom-app-modal').classList.add('open');
  setTimeout(() => document.getElementById('ca-url').focus(), 100);
}
function closeCustomAppModal(){
  document.getElementById('custom-app-modal').classList.remove('open');
  editingCustomAppId = null;
  if (autoFillTitleTimer) { clearTimeout(autoFillTitleTimer); autoFillTitleTimer = null; }
}

function refreshStoreWindows(){
  windows.forEach(w=>{
    const activeTab=w.tabs[w.activeTabIndex];
    if(activeTab&&activeTab.appId==='store'){
      const body=document.getElementById(`body-${w.id}`);
      if(body)renderStore(body,w.id);
    }
  });
}

function saveCustomApp(){
  const name=document.getElementById('ca-name').value.trim();
  const rawUrl=document.getElementById('ca-url').value.trim();
  const icon=(document.getElementById('ca-icon').value||'🌐').trim()||'🌐';
  const desc=document.getElementById('ca-desc').value.trim();

  if(!name){toast('Custom App','Enter a name.','warn',2000);return;}
  if(!rawUrl){toast('Custom App','Enter a URL.','warn',2000);return;}
  let url=rawUrl;
  if(!/^https?:\/\//i.test(url)) url='https://'+url;

  const apps=getCustomApps();
  if(editingCustomAppId){
    const i=apps.findIndex(a=>a.id===editingCustomAppId);
    if(i>=0) apps[i]={...apps[i],name,url,icon,desc};
    toast('Custom App',`"${name}" updated.`,'success',2000);
  }else{
    apps.push({id:'custom-'+Date.now()+'-'+Math.random().toString(36).slice(2,6),name,url,icon,desc,category:'custom',isCustom:true});
    toast('Custom App',`"${name}" added.`,'success',2000);
  }
  saveCustomApps(apps);
  closeCustomAppModal();
  refreshDesktop();refreshStartMenu();refreshLaunchpad();updateTaskbar();renderCustomAppsList();
  refreshStoreWindows();
}

function deleteCustomApp(id){
  if(!confirm('Delete this custom app?'))return;
  const apps=getCustomApps().filter(a=>a.id!==id);
  saveCustomApps(apps);
  windows.slice().forEach(w=>{
    if(w.tabs.some(t=>t.appId===id)){
      w.tabs=w.tabs.filter(t=>t.appId!==id);
      if(w.tabs.length===0){closeWindow(w.id);}
      else{
        if(w.activeTabIndex>=w.tabs.length)w.activeTabIndex=w.tabs.length-1;
        renderTabs(w);renderActiveTab(w);
      }
    }
  });
  refreshDesktop();refreshStartMenu();refreshLaunchpad();updateTaskbar();renderCustomAppsList();
  refreshStoreWindows();
  toast('Custom App','Deleted.','info',2000);
}

function renderCustomAppsList(){
  document.querySelectorAll('[id^="custom-apps-list-"]').forEach(c=>{
    const apps=getCustomApps();
    if(!apps.length){
      c.innerHTML='<div style="padding:12px;text-align:center;color:var(--text-muted);font-size:11px;">No custom apps yet. Click “+ Add App” above.</div>';
      return;
    }
    c.innerHTML=apps.map(a=>`
      <div style="display:flex;align-items:center;gap:10px;padding:8px 10px;background:rgba(0,0,0,.25);border:1px solid var(--glass-border);border-radius:8px;font-size:12px;">
        <div style="width:32px;height:32px;border-radius:8px;background:rgba(255,255,255,.08);border:1px solid var(--glass-border);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;overflow:hidden;">${iconHtml(a.icon)}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${sanitizeHTML(a.name)}</div>
          <div style="font-size:10px;color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${sanitizeHTML(a.url)}</div>
        </div>
        <button class="mini-btn" data-edit-custom="${a.id}" style="padding:4px 8px;font-size:10px;" title="Edit">✏️</button>
        <button class="mini-btn danger" data-del-custom="${a.id}" style="padding:4px 8px;font-size:10px;" title="Delete">🗑️</button>
      </div>`).join('');
    c.querySelectorAll('[data-edit-custom]').forEach(b=>b.onclick=()=>openCustomAppModal(b.dataset.editCustom));
    c.querySelectorAll('[data-del-custom]').forEach(b=>b.onclick=()=>deleteCustomApp(b.dataset.delCustom));
  });
}

function renderCustomApp(container,winId,app){
  container.innerHTML=`<div style="display:flex;flex-direction:column;flex:1;min-height:0;background:#0a0a0a;">
    <div style="display:flex;gap:6px;padding:8px;background:rgba(15,23,42,.92);border-bottom:1px solid var(--glass-border);flex-wrap:wrap;flex-shrink:0;">
      <span style="flex:1;min-width:120px;font-size:11px;color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">🌐 ${sanitizeHTML(app.name)}</span>
      <button class="mini-btn" id="cust-nt-${winId}">↗ New Tab</button>
      <button class="mini-btn" id="cust-edit-${winId}">✏️ Edit</button>
    </div>
    <iframe id="cust-frame-${winId}" src="${sanitizeHTML(app.url)}" style="flex:1;border:none;background:#fff;min-height:0;"  referrerpolicy="no-referrer"></iframe>
  </div>`;
  document.getElementById(`cust-nt-${winId}`).onclick=()=>window.open(app.url,'_blank','noopener,noreferrer');
  document.getElementById(`cust-edit-${winId}`).onclick=()=>openCustomAppModal(app.id);

  // Detect silent refusal (some sites load a blank page instead of throwing)
  const frame = document.getElementById(`cust-frame-${winId}`);
  let loaded = false;
  frame.addEventListener('load', () => { loaded = true; });
  setTimeout(() => {
    if (!loaded) {
      toast('Embed Blocked',
        `"${app.name}" refused to connect. Try the ↗ New Tab button.`,
        'warn', 6000,
        '↗ Open in Tab', () => window.open(app.url, '_blank', 'noopener,noreferrer'));
    }
  }, 8000);
}
function initCustomAppModal(){
  document.getElementById('ca-cancel').onclick = closeCustomAppModal;
  document.getElementById('ca-x').onclick      = closeCustomAppModal;
  document.getElementById('ca-save').onclick   = saveCustomApp;

  const urlInput  = document.getElementById('ca-url');
  const nameInput = document.getElementById('ca-name');
  const iconInput = document.getElementById('ca-icon');
  const fetchBtn  = document.getElementById('ca-fetch');

  nameInput.addEventListener('input', () => {
    customAppNameAuto = nameInput.value.trim() === '';
  });
  iconInput.addEventListener('input', () => {
    const v = iconInput.value.trim();
    customAppIconAuto = (v === '' || v === '🌐');
    updateCaPreview();
  });

  urlInput.addEventListener('input', () => autoFillCustomAppFields(false));
  urlInput.addEventListener('blur',  () => autoFillCustomAppFields(false));

  if (fetchBtn) fetchBtn.addEventListener('click', () => {
    customAppNameAuto = true;
    autoFillCustomAppFields(true);
  });

  document.getElementById('custom-app-modal').addEventListener('click', (e) => {
    if (e.target.id === 'custom-app-modal') closeCustomAppModal();
  });
}

/* ============ AI ============ */
const AI_MODELS = [
  { id:'openai/gpt-5.5', name:'GPT-5.5', desc:'OpenAI flagship' },
  { id:'openai/gpt-5.4-nano', name:'GPT-5.4 Nano', desc:'Fast' },
  { id:'anthropic/claude-opus-5', name:'Claude Opus 5', desc:'Writing and code' },
  { id:'anthropic/claude-sonnet-5', name:'Claude Sonnet 5', desc:'Balanced' },
  { id:'google/gemini-3.7-flash', name:'Gemini 3.7 Flash', desc:'Multimodal' },
  { id:'x-ai/grok-4.6', name:'Grok 4.6', desc:'Current events' },
  { id:'mistral/mistral-large', name:'Mistral Large', desc:'Efficient' }
];
const DEFAULT_AI_SYSTEM = `You are Aura, the built-in AI assistant of AetherOS. You help the user with coding, writing, brainstorming, analysis, and general questions. Be concise, friendly, and helpful. Use short paragraphs. If you write code, format it clearly.`;

function getAIHistory(){try{return JSON.parse(localStorage.getItem(AI_HISTORY_KEY)||'[]');}catch(e){return[];}}
function saveAIHistory(h){try{localStorage.setItem(AI_HISTORY_KEY,JSON.stringify(h.slice(-100)));}catch(e){}}
function getAISystem(){return localStorage.getItem(AI_SYSTEM_KEY)||DEFAULT_AI_SYSTEM;}
function setAISystem(s){try{localStorage.setItem(AI_SYSTEM_KEY,s);}catch(e){}}
function getAIModel(){return localStorage.getItem(AI_MODEL_KEY)||'openai/gpt-5.5';}
function setAIModel(m){try{localStorage.setItem(AI_MODEL_KEY,m);}catch(e){}}

function localFallbackAI(prompt){
  const p=prompt.toLowerCase();
  if(/^(hi|hello|hey|yo)/.test(p))return 'Hi! I\'m Aura. Ask me anything. (Currently using local replies.)';
  if(p.includes('time'))return 'The current time is '+new Date().toLocaleTimeString()+'.';
  if(p.includes('date'))return 'Today is '+new Date().toLocaleDateString(undefined,{weekday:'long',year:'numeric',month:'long',day:'numeric'})+'.';
  if(p.includes('your name'))return 'I\'m Aura, the AI assistant built into AetherOS.';
  if(p.includes('joke'))return 'Why do programmers prefer dark mode? Because light attracts bugs. 🐛';
  if(p.includes('who are you'))return 'I\'m Aura — AetherOS\'s built-in AI assistant, powered by Puter.js.';
  if(p.includes('thank'))return 'You\'re welcome! 😊';
  return 'Hmm, I can\'t reach the AI service right now. Try again in a moment.';
}

async function callAuraAI(prompt, modelOverride) {
  const model = modelOverride || getAIModel();
  const system = getAISystem();
  if (typeof puter !== 'undefined' && puter.ai && puter.ai.chat) {
    try {
      const messages = [{ role:'system', content: system }, { role:'user', content: prompt }];
      const response = await puter.ai.chat(messages, { model });
      if (typeof response === 'string') return response;
      if (response?.message?.content) {
        const c = response.message.content;
        if (typeof c === 'string') return c;
        if (Array.isArray(c)) return c.map(b => b.text || '').join('');
      }
      if (response?.text) return response.text;
      if (response?.choices?.[0]?.message?.content) return response.choices[0].message.content;
      return String(response);
    } catch (e) { console.warn('Puter.js error:', e); }
  }
  try {
    const r = await fetch('https://text.pollinations.ai/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [{ role:'system', content: system }, { role:'user', content: prompt }], model:'openai' }) });
    if (r.ok) { const text = await r.text(); if (text && !text.startsWith('{')) return text.trim(); }
  } catch (e) {}
  return localFallbackAI(prompt);
}

/* ============ Audio ============ */
let audioCtx=null;
function beep(freq=440,dur=80,type='sine',gain=.05){
  if(localStorage.getItem(SOUND_KEY)==='off')return;
  try{
    if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();
    const o=audioCtx.createOscillator(),g=audioCtx.createGain();
    o.type=type;o.frequency.value=freq;g.gain.value=gain;
    o.connect(g);g.connect(audioCtx.destination);
    o.start();g.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+dur/1000);
    o.stop(audioCtx.currentTime+dur/1000);
  }catch(e){}
}
const sfx={
  click:()=>beep(1200,40,'sine',.03),
  success:()=>{beep(880,80);setTimeout(()=>beep(1320,120),80);},
  error:()=>beep(200,200,'sawtooth',.04),
  notify:()=>{beep(660,60);setTimeout(()=>beep(880,100),60);},
  startup:()=>{beep(523,120);setTimeout(()=>beep(659,120),120);setTimeout(()=>beep(880,200),240);}
};

/* ============ File icons ============ */
const FILE_ICONS = {
  // Documents
  docx:'📘', doc:'📘', pdf:'📕', txt:'📄', rtf:'📄', odt:'📄', pages:'📄', tex:'📄', wpd:'📄', log:'📋',
  // Spreadsheets
  xlsx:'📊', xls:'📊', csv:'📊', accdb:'📊', mdb:'📊', db:'📊', dbf:'📊', sql:'📊', tsv:'📊', dif:'📊',
  // Images
  jpg:'🖼️', jpeg:'🖼️', png:'🖼️', gif:'🖼️', bmp:'🖼️', tiff:'🖼️', tif:'🖼️', webp:'🖼️', heic:'🖼️', ico:'🖼️', psd:'🎨', ai:'🎨', xcf:'🎨', raw:'📷', dng:'📷',
  // Vector
  svg:'🖼️', eps:'🖼️', dwg:'📐', dxf:'📐', cdr:'📐', '3ds':'🧊', obj:'🧊', stl:'🧊',
  // Video
  mp4:'🎬', mkv:'🎬', mov:'🎬', avi:'🎬', wmv:'🎬', flv:'🎬', webm:'🎬', mpeg:'🎬', mpg:'🎬', vob:'🎬', '3gp':'🎬',
  // Audio
  mp3:'🎵', wav:'🎵', flac:'🎵', m4a:'🎵', aac:'🎵', wma:'🎵', ogg:'🎵', mid:'🎵', midi:'🎵', aif:'🎵', aiff:'🎵', m3u:'🎵',
  // Compressed
  zip:'🗜️', rar:'🗜️', '7z':'🗜️', tar:'🗜️', gz:'🗜️', gzip:'🗜️', iso:'💿', dmg:'💿', vcd:'💿', cab:'🗜️',
  // Executables
  exe:'⚙️', msi:'⚙️', bat:'⚙️', cmd:'⚙️', sh:'⚙️', jar:'☕', apk:'📱', com:'⚙️',
  // Programming
  html:'🌐', htm:'🌐', css:'🎨', js:'📜', php:'🐘', py:'🐍', c:'📜', cpp:'📜', cs:'📜', java:'☕', class:'☕', xml:'📋', json:'{ }', md:'📖', aspx:'🌐',
  // System
  dll:'⚙️', sys:'⚙️', ini:'⚙️', cfg:'⚙️', cpl:'⚙️', cur:'🖱️', ani:'🖱️', lnk:'🔗', tmp:'🗑️', bak:'💾', reg:'⚙️', font:'🔤', ttf:'🔤', otf:'🔤',
  // Presentations
  pptx:'📽️', ppt:'📽️', pps:'📽️', pub:'📰', key:'📽️', srt:'📝', vsdx:'📐'
};
function fileIcon(name) {
  const m = String(name).match(/\.([^.]+)$/);
  if (!m) return '📄';
  return FILE_ICONS[m[1].toLowerCase()] || '📄';
}

/* ============ Install state ============ */
function getUninstalled(){try{const x=JSON.parse(localStorage.getItem(INSTALLED_KEY)||'[]');return Array.isArray(x)?x:[];}catch(e){return[];}}
function isInstalled(id){
  if(isCustomApp(id))return true;
  if(CORE_APPS.includes(id))return true;
  return !getUninstalled().includes(id);
}
function installApp(id){
  if(isInstalled(id))return;
  const u=getUninstalled().filter(x=>x!==id);
  try{localStorage.setItem(INSTALLED_KEY,JSON.stringify(u));}catch(e){}
  refreshDesktop();refreshStartMenu();refreshLaunchpad();
  toast('Installed',(getAllApps().find(a=>a.id===id)||{}).name+' added.','success',2200);
  sfx.success();
}
function uninstallApp(id){
  if(isCustomApp(id)){deleteCustomApp(id);return;}
  if(!isInstalled(id))return;
  if(CORE_APPS.includes(id)){toast('Protected','Core app — cannot uninstall.','warn',2200);return;}
  const u=getUninstalled();
  if(!u.includes(id))u.push(id);
  try{localStorage.setItem(INSTALLED_KEY,JSON.stringify(u));}catch(e){}
  windows.filter(w=>w.tabs.some(t=>t.appId===id)).forEach(w=>closeWindow(w.id));
  refreshDesktop();refreshStartMenu();refreshLaunchpad();
  toast('Uninstalled',(getAllApps().find(a=>a.id===id)||{}).name+' removed.','info',2200);
}
function getInstalledApps(){return getAllApps().filter(a=>isInstalled(a.id));}

/* ============ Init ============ */
document.addEventListener('DOMContentLoaded',()=>{
  setTimeout(()=>{document.getElementById('boot-screen').classList.add('fadeout');setTimeout(()=>{const b=document.getElementById('boot-screen'); if(b) b.remove(); sfx.startup();},700);},1600);
  loadUserVFS();loadThemeSettings();loadIconColors();loadSavedWallpaper();
  purgeOldTrash();
  refreshDesktop();initStartMenu();initClock();initWorkspaces();initGlobalShortcuts();
  initContextMenu();initCommandPalette();initTrayIcons();initStickyNotes();initMiniPlayer();
  initClockPanel();initShortcutsOverlay();initLaunchpad();initLockScreen();initLiveWallpaper();
  initSlideshow();initClipboardHistory();initWeather();handleDeepLinks();bindGlobalClicks();initQuickLook();
  initCustomAppModal();
    initCustomAppModal();
  initWidgets();
  initScreensaver();
  initPowerMenu(); // <-- Add this
  document.body.style.cursor = localStorage.getItem('aether_cursor') || 'default';
    initWidgets();
  initScreensaver();
  document.body.style.cursor = localStorage.getItem('aether_cursor') || 'default';
  if (getSavedSession() && getSavedSession().length > 0) {
    setTimeout(offerSessionRestore, 2200);
  }
  toast('Welcome to AetherOS v7.0', IS_TOUCH ? 'Tap an icon · Long-press for menu' : 'Alt+Tab for windows · Ctrl+K for search','info',6000);
  
  // Handle Chrome Context Menu data
  setTimeout(checkContextMenuData, 2000);
});

function checkContextMenuData() {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['contextMenuText', 'contextMenuAction'], (result) => {
      if (result.contextMenuText && result.contextMenuAction) {
        const text = result.contextMenuText;
        if (result.contextMenuAction === 'ask-aura') {
          openApp('aurachat');
          setTimeout(() => {
            const inp = document.querySelector('[id^="ai-in-"]');
            if (inp) { inp.value = `Explain this text:\n\n"${text}"`; inp.focus(); }
          }, 300);
        } else if (result.contextMenuAction === 'save-note') {
          createSticky(text);
        }
        // Clear the storage so it doesn't trigger again
        chrome.storage.local.remove(['contextMenuText', 'contextMenuAction']);
      }
    });
  }
}

function purgeOldTrash(){
  const t = getTrash();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  const cleaned = t.filter(x => Date.now() - (x.time || 0) < thirtyDays);
  if (cleaned.length !== t.length) {
    saveTrash(cleaned);
    setTimeout(() => toast('Trash', (t.length - cleaned.length) + ' old items auto-purged (30+ days).', 'info', 3000), 2000);
  }
}

function bindGlobalClicks(){
  document.addEventListener('click',(e)=>{
    const sm=document.getElementById('start-menu'),sb=document.getElementById('start-btn');
    if(sm&&!sm.contains(e.target)&&!sb.contains(e.target))sm.classList.remove('open');
    const np=document.getElementById('notif-panel'),nb=document.getElementById('tray-notif');
    if(np&&!np.contains(e.target)&&!nb.contains(e.target))np.classList.remove('open');
    const cp=document.getElementById('clock-panel'),cb=document.getElementById('clock');
    if(cp&&!cp.contains(e.target)&&!cb.contains(e.target))cp.classList.remove('open');
    if(!e.target.closest('#context-menu'))hideContextMenu();
  });
  document.getElementById('launchpad').addEventListener('click', (e) => {
    if (e.target.id === 'launchpad') closeLaunchpad();
  });
}

/* ============ Toast ============ */
function toast(title,message='',type='info',duration=4000,actionLabel=null,actionFn=null){
  const c=document.getElementById('toast-container'),icons={success:'✅',error:'❌',info:'ℹ️',warn:'⚠️'};
  const el=document.createElement('div');el.className='toast '+type;
  el.innerHTML=`<div class="toast-icon">${icons[type]||'ℹ️'}</div><div class="toast-content"><div class="toast-title">${sanitizeHTML(title)}</div>${message?`<div class="toast-msg">${sanitizeHTML(message)}</div>`:''}${actionLabel?`<button class="toast-action">${sanitizeHTML(actionLabel)}</button>`:''}</div><button class="toast-close" aria-label="Dismiss">✕</button><div class="toast-progress"></div>`;
  c.appendChild(el);
  const remove=()=>{el.classList.add('removing');setTimeout(()=>el.remove(),220);};
  el.querySelector('.toast-close').onclick=remove;
  if (actionLabel && actionFn) el.querySelector('.toast-action').onclick = () => { actionFn(); remove(); };
  if(duration>0)setTimeout(remove,duration);
  notifications.unshift({title,message,type,time:new Date()});if(notifications.length>40)notifications.pop();updateNotifBadge();
  if(type==='error')sfx.error();else if(type==='success')sfx.success();else sfx.notify();
}
function updateNotifBadge(){const b=document.getElementById('notif-badge');if(!b)return;const u=notifications.filter(n=>!n.read).length;b.style.display=u>0?'flex':'none';if(u>0)b.textContent=String(u);}
function renderNotifPanel(){const l=document.getElementById('notif-list');if(!l)return;l.innerHTML=notifications.length?notifications.map(n=>`<div class="notif-item"><div class="notif-item-title">${sanitizeHTML(n.title)}</div>${n.message?`<div>${sanitizeHTML(n.message)}</div>`:''}<div class="notif-item-time">${n.time.toLocaleTimeString()}</div></div>`).join(''):'<div class="empty-state">No notifications yet.</div>';}

/* ============ Icon colors & theme ============ */
const DEFAULT_ICON_COLORS={labelColor:'#f8fafc',glowColor:'#06b6d4',titleColor:'#f8fafc'};
function getIconColors(){try{return{...DEFAULT_ICON_COLORS,...(JSON.parse(localStorage.getItem(ICON_COLOR_KEY)||'null')||{})};}catch(e){return{...DEFAULT_ICON_COLORS};}}
function saveIconColors(c){try{localStorage.setItem(ICON_COLOR_KEY,JSON.stringify(c));}catch(e){}applyIconColors(c);}
function applyIconColors(c){
  const r=document.documentElement;
  r.style.setProperty('--icon-label-color',c.labelColor||DEFAULT_ICON_COLORS.labelColor);
  r.style.setProperty('--icon-glow-color',c.glowColor||DEFAULT_ICON_COLORS.glowColor);
  r.style.setProperty('--window-title-color',c.titleColor||DEFAULT_ICON_COLORS.titleColor);
}
function loadIconColors(){applyIconColors(getIconColors());}
function applyThemeSettings(s){
  if(!s)return;
  const r=document.documentElement;
  if(s.accent){r.style.setProperty('--accent',s.accent);r.style.setProperty('--accent-hover',s.accentHover||s.accent);r.style.setProperty('--aura-cyan',s.accent);r.style.setProperty('--aura-cyan-glow',s.glow||'rgba(6,182,212,.4)');}
  if(s.glassOpacity!=null)r.style.setProperty('--glass-bg',`rgba(15,23,42,${Number(s.glassOpacity)})`);
}
function loadThemeSettings(){try{const s=JSON.parse(localStorage.getItem(THEME_KEY)||'null');if(s)applyThemeSettings(s);}catch(e){}}
function saveThemeSettings(s){try{localStorage.setItem(THEME_KEY,JSON.stringify(s));}catch(e){}applyThemeSettings(s);}
function hexToRgba(hex,a=.4){const h=String(hex).replace('#','');if(!/^[0-9a-f]{6}$/i.test(h))return`rgba(6,182,212,${a})`;const n=parseInt(h,16);return`rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${a})`;}

/* ============ VFS persistence ============ */
function loadUserVFS(){try{const s=JSON.parse(localStorage.getItem(USER_VFS_KEY)||'{}');if(!s||typeof s!=='object')return;['home','documents','downloads','pictures','music'].forEach(k=>{if(s[k]&&typeof s[k]==='object')VFS[k]={...VFS[k],...s[k]};});}catch(e){}}
function saveUserVFS(){try{localStorage.setItem(USER_VFS_KEY,JSON.stringify({home:VFS.home,documents:VFS.documents,downloads:VFS.downloads,pictures:VFS.pictures,music:VFS.music}));}catch(e){}}

/* ============ History ============ */
function getHistory(){try{const h=JSON.parse(localStorage.getItem(HISTORY_KEY)||'[]');return Array.isArray(h)?h:[];}catch(e){return[];}}
function addHistory(type,title,detail,meta={}){const e={id:Date.now()+'-'+Math.random().toString(36).slice(2,7),type,title:String(title||''),detail:String(detail||''),time:new Date().toISOString(),...meta};try{const l=getHistory();l.unshift(e);localStorage.setItem(HISTORY_KEY,JSON.stringify(l.slice(0,150)));}catch(e){}}
function clearHistory(){try{localStorage.removeItem(HISTORY_KEY);}catch(e){}}

/* ============ Wallpaper ============ */
function setDesktopWallpaper(v){
  const d=document.getElementById('desktop');if(!d)return;
  const video = document.getElementById('video-wallpaper');
  
  if (v.startsWith('data:video/') || /\.(mp4|webm|ogg)$/i.test(v)) {
    if(video) {
      video.src = v;
      video.style.display = 'block';
    }
    d.style.background = '#050505';
  } else {
    if(video) {
      video.pause();
      video.src = '';
      video.style.display = 'none';
    }
    if(v.startsWith('url(')||v.startsWith('linear-gradient')||v.startsWith('radial-gradient'))d.style.background=v;
    else d.style.background=`url("${v}") center/cover no-repeat`;
    d.style.backgroundSize='cover';d.style.backgroundPosition='center';
  }
  try{localStorage.setItem('aether_wallpaper',v);}catch(e){}
}
function loadSavedWallpaper(){try{const s=localStorage.getItem('aether_wallpaper');if(s)setDesktopWallpaper(s);}catch(e){}}
function applyRandomWallpaper(){
  const w=Math.max(1080,window.innerWidth*2),h=Math.max(720,window.innerHeight*2);
  setDesktopWallpaper(`https://picsum.photos/seed/${Math.floor(Math.random()*10000)}/${w}/${h}`);
  toast('Wallpaper','Random wallpaper applied.','success',2000);
}

/* ============ Slideshow ============ */
function initSlideshow(){
  if(slideshowTimer)clearInterval(slideshowTimer);
  const cfg=getSlideshowConfig();
  if(cfg.enabled)slideshowTimer=setInterval(()=>{const c=getSlideshowConfig();if(!c.enabled){clearInterval(slideshowTimer);return;}applyRandomWallpaper();},cfg.intervalMin*60000);
}
function getSlideshowConfig(){try{return{enabled:false,intervalMin:15,...(JSON.parse(localStorage.getItem(SLIDESHOW_KEY)||'{}'))};}catch(e){return{enabled:false,intervalMin:15};}}
function setSlideshowConfig(c){try{localStorage.setItem(SLIDESHOW_KEY,JSON.stringify(c));}catch(e){}initSlideshow();}

/* ============ Live wallpaper ============ */
function initLiveWallpaper(){
  const canvas=document.getElementById('live-wallpaper');if(!canvas)return;
  const enabled=localStorage.getItem(LIVEWALL_KEY)!=='off';
  if(!enabled){canvas.style.display='none';return;}
  canvas.style.display='block';
  let W,H;const ctx=canvas.getContext('2d');
  const resize=()=>{W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight-56;};
  resize();window.addEventListener('resize',resize);
  const N = IS_TOUCH ? 28 : 45;
  const parts=Array.from({length:N},()=>({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.35,vy:(Math.random()-.5)*.35,r:Math.random()*2+.6}));
  if(liveWallTimer)cancelAnimationFrame(liveWallTimer);
  const draw=()=>{
    const accent=getComputedStyle(document.documentElement).getPropertyValue('--aura-cyan').trim()||'#06b6d4';
    ctx.clearRect(0,0,W,H);
    for(let i=0;i<parts.length;i++){
      const p=parts[i];p.x+=p.vx;p.y+=p.vy;
      if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1;
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=hexToRgba(accent,.5);ctx.fill();
      for(let j=i+1;j<parts.length;j++){
        const q=parts[j];const dx=p.x-q.x,dy=p.y-q.y;const dist=Math.sqrt(dx*dx+dy*dy);
        if(dist<140){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.strokeStyle=hexToRgba(accent,(1-dist/140)*.12);ctx.lineWidth=1;ctx.stroke();}
      }
    }
    liveWallTimer=requestAnimationFrame(draw);
  };
  draw();
}
function toggleLiveWallpaper(on){
  try{localStorage.setItem(LIVEWALL_KEY,on?'on':'off');}catch(e){}
  const c=document.getElementById('live-wallpaper');
  if(on){if(!liveWallTimer)initLiveWallpaper();c.style.display='block';}
  else{if(liveWallTimer)cancelAnimationFrame(liveWallTimer);liveWallTimer=null;c.style.display='none';}
}

/* ============ Lock Screen ============ */
function initLockScreen(){
  const sc=document.getElementById('lock-screen'),input=document.getElementById('lock-input'),btn=document.getElementById('lock-btn'),err=document.getElementById('lock-error');
  const upd=()=>{
    const now=new Date();
    document.getElementById('lock-time').textContent=now.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
    document.getElementById('lock-date').textContent=now.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'});
    document.getElementById('lock-user').textContent=getFunConfig().displayName||'User';
  };
  setInterval(()=>{if(sc.classList.contains('open'))upd();},1000);
  const tryU=()=>{
    const pin=getPin();
    if(input.value===pin){sc.classList.remove('open');input.value='';err.textContent='';try{localStorage.setItem(LOCK_KEY,'off');}catch(e){}sfx.success();toast('Unlocked','Welcome back.','success',1500);}
    else{err.textContent='Incorrect PIN';input.classList.add('error');sfx.error();setTimeout(()=>input.classList.remove('error'),400);}
  };
  btn.onclick=tryU;input.onkeydown=(e)=>{if(e.key==='Enter')tryU();};
  if(localStorage.getItem(LOCK_KEY)==='on')setTimeout(()=>lockScreen(),1900);
  window.updateLockTime=upd;
}
function getPin(){return localStorage.getItem(PIN_KEY)||'1234';}
function lockScreen(){const sc=document.getElementById('lock-screen');sc.classList.add('open');if(window.updateLockTime)window.updateLockTime();setTimeout(()=>document.getElementById('lock-input').focus(),150);try{localStorage.setItem(LOCK_KEY,'on');}catch(e){}}

/* ============ Launchpad ============ */
function initLaunchpad(){
  const grid=document.getElementById('launchpad-grid'),search=document.getElementById('launchpad-search');
  const render=(q='')=>{
    grid.innerHTML='';
    const list=getInstalledApps().filter(a=>!q||a.name.toLowerCase().includes(q.toLowerCase()));
    list.forEach(app=>{
      const div=document.createElement('button');
      div.className='launchpad-item';div.type='button';
      div.innerHTML=`<div class="launchpad-icon">${iconHtml(app.icon)}</div><div class="launchpad-label">${sanitizeHTML(app.name)}</div>`;
      div.onclick=()=>{openApp(app.id);closeLaunchpad();};
      div.setAttribute('aria-label','Open '+app.name);
      grid.appendChild(div);
    });
  };
  search.oninput=()=>render(search.value);render('');
  window._launchpadRender=render;
}
function refreshLaunchpad(){const grid=document.getElementById('launchpad-grid');if(!grid)return;const s=document.getElementById('launchpad-search');if(window._launchpadRender)window._launchpadRender(s?s.value:'');}
function openLaunchpad(){const lp=document.getElementById('launchpad');lp.classList.add('open');const s=document.getElementById('launchpad-search');s.value='';if(!IS_TOUCH)s.focus();refreshLaunchpad();}
function closeLaunchpad(){document.getElementById('launchpad').classList.remove('open');}

/* ============ Clipboard ============ */
function initClipboardHistory(){
  document.addEventListener('copy',()=>{
    setTimeout(()=>{navigator.clipboard.readText().then(t=>{if(t)addClipboardItem(t);}).catch(()=>{});},50);
  });
}
function addClipboardItem(t){
  if(!t||typeof t!=='string')return;
  const l=getClipboardList();if(l[0]?.text===t)return;
  l.unshift({text:t,time:new Date().toISOString()});
  try{localStorage.setItem(CLIPBOARD_KEY,JSON.stringify(l.slice(0,30)));}catch(e){}
}
function getClipboardList(){try{const l=JSON.parse(localStorage.getItem(CLIPBOARD_KEY)||'[]');return Array.isArray(l)?l:[];}catch(e){return[];}}

/* ============ Weather ============ */
async function initWeather(){
  const cached=getCachedWeather();
  if(cached&&Date.now()-cached.ts<1800000){renderWeatherBadge(cached.data);return;}
  try{
    const pos=await new Promise((res,rej)=>{if(!navigator.geolocation)return rej('no geo');navigator.geolocation.getCurrentPosition(res,rej,{timeout:5000});});
    const{latitude:lat,longitude:lon}=pos.coords;
    const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`);
    const d=await r.json();cacheWeather(d);renderWeatherBadge(d);
  }catch(e){}
}
function getCachedWeather(){try{return JSON.parse(localStorage.getItem(WEATHER_KEY)||'null');}catch(e){return null;}}
function cacheWeather(d){try{localStorage.setItem(WEATHER_KEY,JSON.stringify({data:d,ts:Date.now()}));}catch(e){}}
function weatherCodeInfo(c){
  const m={0:['☀️','Clear'],1:['🌤️','Mostly clear'],2:['⛅','Partly cloudy'],3:['☁️','Overcast'],45:['🌫️','Fog'],48:['🌫️','Fog'],51:['🌦️','Drizzle'],53:['🌦️','Drizzle'],55:['🌧️','Drizzle'],61:['🌧️','Rain'],63:['🌧️','Rain'],65:['🌧️','Heavy rain'],71:['❄️','Snow'],73:['❄️','Snow'],75:['❄️','Heavy snow'],80:['🌦️','Showers'],81:['🌧️','Showers'],82:['⛈️','Heavy showers'],95:['⛈️','Thunderstorm'],96:['⛈️','Thunder'],99:['⛈️','Thunder']};
  return m[c]||['🌡️','—'];
}
function renderWeatherBadge(data){
  if(!data?.current)return;
  const[emoji,desc]=weatherCodeInfo(data.current.weather_code);
  const el=document.getElementById('clock');
  if(el){
    el.innerHTML=`<span>${emoji}</span> <span id="clock-text">${new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span>`;
    el.title=`${desc} · ${Math.round(data.current.temperature_2m)}°C`;
  }
  const w=document.getElementById('clock-panel-weather');
  if(w){
    w.innerHTML=`<div style="display:flex;align-items:center;justify-content:center;gap:10px;padding:8px 0 12px;border-bottom:1px solid var(--glass-border);margin-bottom:8px;"><span style="font-size:28px">${emoji}</span><div style="text-align:left"><div style="font-size:18px;font-weight:700">${Math.round(data.current.temperature_2m)}°C</div><div style="font-size:11px;color:var(--text-muted)">${desc}</div></div></div>`;
  }
}

/* ============ Deep Links ============ */
function handleDeepLinks(){
  const hash=window.location.hash.replace('#','');
  const params=new URLSearchParams(window.location.search);
  const open=params.get('open')||hash.replace(/^app=/,'');
  if(open){const id=open.toLowerCase();if(getAllApps().find(a=>a.id===id))setTimeout(()=>openApp(id),1900);}
}

/* ============ Desktop Icons ============ */
function refreshDesktop(){
  const grid=document.getElementById('desktop-icons');if(!grid)return;
  grid.innerHTML='';
  getInstalledApps().forEach(app=>{
    const icon=document.createElement('button');
    icon.className='desktop-icon';icon.type='button';
    icon.setAttribute('aria-label',app.name);
    icon.innerHTML=`<div class="icon-emoji">${iconHtml(app.icon)}</div><span>${sanitizeHTML(app.name)}</span>`;

    const ctxItems = () => {
      const items=[
        { label:'Open', action:()=>openApp(app.id) },
        { label:'Open in new workspace', action:()=>{switchWorkspace((currentWorkspace+1)%WORKSPACE_COUNT);openApp(app.id);} }
      ];
      if(app.isExternalOS){
        const os=EXTERNAL_OS.find(x=>x.id===app.id);
        if(os)items.push({ label:'↗ Open in Browser Tab', action:()=>window.open(os.url,'_blank','noopener,noreferrer') });
      }
      if(app.isCustom){
        items.push({ label:'✏️ Edit App', action:()=>openCustomAppModal(app.id) });
        items.push({ label:'🗑️ Delete App', action:()=>deleteCustomApp(app.id) });
        items.push({ label:'↗ Open URL in Browser', action:()=>window.open(app.url,'_blank','noopener,noreferrer') });
      }
      items.push({ divider:true });
      items.push({ label:'Pin to taskbar', action:()=>pinApp(app.id) });
      if(!CORE_APPS.includes(app.id) && !app.isCustom)items.push({ label:'🗑️ Uninstall', action:()=>uninstallApp(app.id) });
      return items;
    };

    if (IS_TOUCH) {
      icon.addEventListener('click', (e) => {
        if (icon.__lpFired) { icon.__lpFired = false; return; }
        
        // --- MOBILE TAP LOGIC ---
        if (['coin', 'dice', 'tictactoe', 'calculator'].includes(app.id)) {
            openApp(app.id, { width: 380, height: 420 });
        } else {
            openApp(app.id);
        }
      });
      
      addLongPress(icon, (e) => {
        icon.__lpFired = true;
        showContextMenu(e.clientX, e.clientY, ctxItems());
      });
    } else {
      // --- DESKTOP DOUBLE-CLICK LOGIC ---
      icon.ondblclick=()=>{
        if (['coin', 'dice', 'tictactoe', 'calculator'].includes(app.id)) {
            openApp(app.id, { width: 380, height: 420 });
        } else {
            openApp(app.id);
        }
      };
      
      icon.oncontextmenu=(e)=>{e.preventDefault();showContextMenu(e.clientX,e.clientY,ctxItems());};
    }
    grid.appendChild(icon);
  });
  applyIconColors(getIconColors());
}

/* ============ Start Menu ============ */
function fuzzyScore(q,t){q=q.toLowerCase();t=t.toLowerCase();if(!q)return 1;if(t.includes(q))return 100-t.indexOf(q);let qi=0,s=0,lm=-1;for(let i=0;i<t.length&&qi<q.length;i++){if(t[i]===q[qi]){s+=lm===i-1?3:1;lm=i;qi++;}}return qi===q.length?s:0;}
function initStartMenu(){
  const btn=document.getElementById('start-btn'),menu=document.getElementById('start-menu'),list=document.getElementById('start-apps-list'),si=document.getElementById('start-search');
  btn.onclick=(e)=>{e.stopPropagation();menu.classList.toggle('open');if(!IS_TOUCH)si.focus();sfx.click();};
  const renderList=(f='')=>{
    list.innerHTML='';
    let apps=getInstalledApps().slice();
    if(f)apps=apps.map(a=>({a,s:fuzzyScore(f,a.name)})).filter(x=>x.s>0).sort((x,y)=>y.s-x.s).map(x=>x.a);
    const pinned=getPinned();
    if(!f&&pinned.length){
      const l1=document.createElement('div');l1.className='start-section-label';l1.textContent='Pinned';list.appendChild(l1);
      pinned.forEach(id=>{const app=getAllApps().find(a=>a.id===id);if(app&&isInstalled(id))list.appendChild(mk(app));});
      const l2=document.createElement('div');l2.className='start-section-label';l2.textContent='All Apps';list.appendChild(l2);
      apps=apps.filter(a=>!pinned.includes(a.id));
    }
    apps.forEach(a=>list.appendChild(mk(a)));
  };
  const mk=(app)=>{
    const item=document.createElement('button');
    item.className='start-app-item';item.type='button';
    const isPinned=getPinned().includes(app.id);
    item.innerHTML=`<span class="start-app-icon">${iconHtml(app.icon)}</span><span>${sanitizeHTML(app.name)}</span><button class="pin-btn" aria-label="Pin">${isPinned?'★':'☆'}</button>`;
    item.onclick=(e)=>{if(e.target.classList.contains('pin-btn'))return;openApp(app.id);menu.classList.remove('open');};
    item.querySelector('.pin-btn').onclick=(e)=>{e.stopPropagation();if(isPinned)unpinApp(app.id);else pinApp(app.id);renderList(si.value);};
    return item;
  };
  si.oninput=(e)=>renderList(e.target.value);
  si.onkeydown=(e)=>{if(e.key==='Enter'){const f=list.querySelector('.start-app-item');if(f)f.click();}};
  renderList();
  window._startMenuRender=renderList;
}
function refreshStartMenu(){if(window._startMenuRender){const s=document.getElementById('start-search');window._startMenuRender(s?s.value:'');}}
function getPinned(){try{const x=JSON.parse(localStorage.getItem(PINNED_KEY)||'[]');return Array.isArray(x)?x:[];}catch(e){return[];}}
function savePinned(x){try{localStorage.setItem(PINNED_KEY,JSON.stringify(x));}catch(e){}updateTaskbar();}
function pinApp(id){const p=getPinned();if(!p.includes(id)){p.push(id);savePinned(p);toast('Pinned',(getAllApps().find(a=>a.id===id)||{}).name+' pinned.','success',2000);}}
function unpinApp(id){const p=getPinned().filter(x=>x!==id);savePinned(p);toast('Unpinned','Removed.','info',1500);}

/* ============ Workspaces ============ */
function initWorkspaces(){
  const c=document.getElementById('workspace-switcher');c.innerHTML='';
  for(let i=0;i<WORKSPACE_COUNT;i++){
    const d=document.createElement('button');
    d.className='workspace-dot'+(i===currentWorkspace?' active':'');d.type='button';
    d.textContent=String(i+1);d.title=`Workspace ${i+1}`;
    d.setAttribute('aria-label','Workspace '+(i+1));
    d.onclick=()=>switchWorkspace(i);c.appendChild(d);
  }
}
function switchWorkspace(idx){
  if(idx===currentWorkspace||idx<0||idx>=WORKSPACE_COUNT)return;
  currentWorkspace=idx;
  windows.forEach(w=>w.element.classList.toggle('hidden',w.workspace!==idx));
  document.querySelectorAll('.workspace-dot').forEach((d,i)=>d.classList.toggle('active',i===idx));
  document.querySelectorAll('.sticky-note').forEach(n=>n.style.display=(parseInt(n.dataset.workspace||'0')===idx)?'flex':'none');
  toast('Workspace',`Workspace ${idx+1}`,'info',1200);
}

/* ============ Clock ============ */
function initClock(){
  const el=document.getElementById('clock');
  const upd=()=>{
    const now=new Date();
    const txt=now.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
    const ct=document.getElementById('clock-text');
    if(ct)ct.textContent=txt;else el.textContent=txt;
    const big=document.getElementById('clock-panel-time');
    if(big&&document.getElementById('clock-panel').classList.contains('open'))big.textContent=now.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  };
  upd();setInterval(upd,1000);
  el.onclick=(e)=>{e.stopPropagation();document.getElementById('clock-panel').classList.toggle('open');renderCalendar();};
}
let calOffset=0;
function initClockPanel(){
  document.getElementById('clock-panel-date').textContent=new Date().toLocaleDateString(undefined,{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  renderCalendar();
  document.getElementById('cal-prev').onclick=()=>{calOffset--;renderCalendar();};
  document.getElementById('cal-next').onclick=()=>{calOffset++;renderCalendar();};
}
function renderCalendar(){
  const g=document.getElementById('cal-grid'),l=document.getElementById('cal-month');if(!g)return;
  const now=new Date();
  const d=new Date(now.getFullYear(),now.getMonth()+calOffset,1);
  l.textContent=d.toLocaleDateString(undefined,{month:'long',year:'numeric'});
  const days=['S','M','T','W','T','F','S'];
  let html=days.map(x=>`<div class="cal-day-name">${x}</div>`).join('');
  const fd=d.getDay();
  const dim=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();
  const pd=new Date(d.getFullYear(),d.getMonth(),0).getDate();
  for(let i=fd-1;i>=0;i--)html+=`<div class="cal-day other-month">${pd-i}</div>`;
  for(let i=1;i<=dim;i++){
    const today=calOffset===0&&i===now.getDate();
    html+=`<div class="cal-day ${today?'today':''}">${i}</div>`;
  }
  const tr=(7-((fd+dim)%7))%7;
  for(let i=1;i<=tr;i++)html+=`<div class="cal-day other-month">${i}</div>`;
  g.innerHTML=html;
}

/* ============ Tray ============ */
function initTrayIcons(){
  document.getElementById('tray-notif').onclick=(e)=>{e.stopPropagation();const p=document.getElementById('notif-panel');p.classList.toggle('open');if(p.classList.contains('open')){renderNotifPanel();notifications.forEach(n=>n.read=true);updateNotifBadge();}};
  document.getElementById('notif-clear').onclick=(e)=>{e.stopPropagation();notifications.length=0;renderNotifPanel();updateNotifBadge();};
  document.getElementById('tray-cmd').onclick=(e)=>{e.stopPropagation();openCommandPalette();};
  document.getElementById('tray-music').onclick=(e)=>{e.stopPropagation();toggleMiniPlayer();};
  document.getElementById('tray-launchpad').onclick=(e)=>{e.stopPropagation();openLaunchpad();};
  document.getElementById('tray-lock').onclick=(e)=>{e.stopPropagation();lockScreen();};
}

/* ============ Context Menu ============ */
function initContextMenu(){
  const desktop = document.getElementById('desktop');
  const items = () => [
    { label:'🤖  Open Aura Chat (AI)', action:()=>openApp('aurachat') },
    { divider:true },
    { label:'📱  Add Custom App', action:()=>openCustomAppModal() },
    { label:'🖥️  Display Settings', action:()=>openApp('settings') },
    { label:'🎨  Change Wallpaper', action:()=>openApp('settings') },
    { label:'📸  Take Screenshot', action:()=>takeScreenshot() },
    { divider:true },
    { label:'📁  Open Files', action:()=>openApp('explorer') },
    { label:'⌨️  Open Terminal', action:()=>openApp('terminal') },
    { label:'🗒️  New Sticky Note', action:()=>createSticky() },
    { divider:true },
    { label:'⊞  Launchpad', action:()=>openLaunchpad() },
    { label:'🛍️  App Store', action:()=>openApp('store') },
    { label:'🔒  Lock Screen', action:()=>lockScreen() },
    { label:'🔍  Global Search', action:()=>openCommandPalette() }
  ];
  desktop.addEventListener('contextmenu',(e)=>{
    if(e.target.closest('.window')||e.target.closest('.sticky-note')||e.target.closest('.desktop-icon'))return;
    e.preventDefault();showContextMenu(e.clientX,e.clientY,items());
  });
  if (IS_TOUCH) {
    addLongPress(desktop, (e) => {
      if (e.target.closest('.window') || e.target.closest('.sticky-note') || e.target.closest('.desktop-icon')) return;
      showContextMenu(e.clientX, e.clientY, items());
    }, 600);
  }
}
function showContextMenu(x,y,items){
  const m=document.getElementById('context-menu');
  m.innerHTML=items.map(it=>{
    if(it.divider)return'<div class="ctx-divider"></div>';
    if(it.label && !it.action)return`<div class="ctx-label">${sanitizeHTML(it.label)}</div>`;
    return`<button class="ctx-item" data-action type="button"><span>${it.label}</span>${it.shortcut?`<span class="ctx-shortcut">${it.shortcut}</span>`:''}</button>`;
  }).join('');
  m.classList.add('open');
  const acts=items.filter(i=>!i.divider&&i.action);
  m.querySelectorAll('[data-action]').forEach((el,i)=>{el.onclick=()=>{hideContextMenu();if(acts[i]?.action)acts[i].action();};});
  const r=m.getBoundingClientRect();
  const pad = 8;
  let lx = x, ty = y;
  if (lx + r.width > window.innerWidth - pad) lx = window.innerWidth - r.width - pad;
  if (ty + r.height > window.innerHeight - pad) ty = window.innerHeight - r.height - pad;
  m.style.left=Math.max(pad,lx)+'px';
  m.style.top=Math.max(pad,ty)+'px';
}
function hideContextMenu(){document.getElementById('context-menu').classList.remove('open');}

/* ============ Command Palette ============ */
let cmdCommands=[];
function initCommandPalette(){
  const i=document.getElementById('cmd-input'),l=document.getElementById('cmd-list');
  i.addEventListener('input',()=>renderCmdList(i.value));
  i.addEventListener('keydown',(e)=>{
    const items=l.querySelectorAll('.cmd-item'),sel=l.querySelector('.cmd-item.selected');
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){
      e.preventDefault();
      let idx=Array.from(items).indexOf(sel);
      idx=e.key==='ArrowDown'?Math.min(idx+1,items.length-1):Math.max(idx-1,0);
      items.forEach((it,i)=>it.classList.toggle('selected',i===idx));
      if(items[idx])items[idx].scrollIntoView({block:'nearest'});
    }else if(e.key==='Enter'){e.preventDefault();(sel||items[0])?.click();}
    else if(e.key==='Escape')closeCommandPalette();
  });
  document.getElementById('cmd-palette').addEventListener('click',(e)=>{if(e.target.id==='cmd-palette')closeCommandPalette();});
}
function openCommandPalette(){
  document.getElementById('cmd-palette').classList.add('open');
  const i=document.getElementById('cmd-input');i.value='';if(!IS_TOUCH)i.focus();
  buildCommandList('');renderCmdList('');
}
function closeCommandPalette(){document.getElementById('cmd-palette').classList.remove('open');}

function buildCommandList(f){
  const q=(f||'').toLowerCase().trim();
  const cmds=[];
  getInstalledApps().forEach(a=>cmds.push({group:'Apps',id:'app:'+a.id,icon:a.icon,label:a.name,action:()=>openApp(a.id),score:fuzzyScore(q,a.name)+15}));
  if(!q||fuzzyScore(q,'settings')>0)cmds.push({group:'System',id:'sys:settings',icon:'⚙️',label:'Open Settings',action:()=>openApp('settings'),score:fuzzyScore(q,'settings')+5});
  if(!q||fuzzyScore(q,'custom app')>0)cmds.push({group:'System',id:'sys:customapp',icon:'📱',label:'Add Custom App',action:()=>openCustomAppModal(),score:fuzzyScore(q,'custom app')+5});
  if(!q||fuzzyScore(q,'screenshot')>0)cmds.push({group:'System',id:'sys:ss',icon:'📸',label:'Take Screenshot',action:()=>takeScreenshot(),score:fuzzyScore(q,'screenshot')+5});
  if(!q||fuzzyScore(q,'lock')>0)cmds.push({group:'System',id:'sys:lock',icon:'🔒',label:'Lock Screen',action:()=>lockScreen(),score:fuzzyScore(q,'lock')+5});
  if(!q||fuzzyScore(q,'storage')>0)cmds.push({group:'System',id:'sys:storage',icon:'💾',label:'Storage Dashboard',action:()=>{openApp('settings');setTimeout(()=>{const el=document.querySelector('[data-storage-anchor]');if(el)el.scrollIntoView({behavior:'smooth'});},400);},score:fuzzyScore(q,'storage')+5});
  if(!q||fuzzyScore(q,'wallpaper')>0)cmds.push({group:'System',id:'sys:randwall',icon:'🎲',label:'Random Wallpaper',action:()=>applyRandomWallpaper(),score:fuzzyScore(q,'wallpaper')+5});
  if(!q||fuzzyScore(q,'sticky')>0)cmds.push({group:'System',id:'sys:sticky',icon:'🗒️',label:'New Sticky Note',action:()=>createSticky(),score:fuzzyScore(q,'sticky')+5});
  if(!q||fuzzyScore(q,'shortcuts')>0)cmds.push({group:'System',id:'sys:shortcuts',icon:'⌨️',label:'Keyboard Shortcuts',action:()=>document.getElementById('shortcuts-overlay').classList.add('open'),score:fuzzyScore(q,'shortcuts')+5});
  if(!q||fuzzyScore(q,'export')>0)cmds.push({group:'System',id:'sys:export',icon:'💾',label:'Export JSON backup',action:()=>exportProfile(),score:fuzzyScore(q,'export')+5});
  if(q){
    Object.entries(VFS).forEach(([folder,files])=>{
      Object.entries(files).forEach(([name,content])=>{
        const nameScore = fuzzyScore(q, name) * 2;
        const contentMatch = typeof content === 'string' && content.toLowerCase().includes(q);
        const score = nameScore + (contentMatch ? 8 : 0);
        if(score > 0){
          let sub = folder + '/' + name;
          if(contentMatch && typeof content === 'string'){
            const idx = content.toLowerCase().indexOf(q);
            const snippet = content.slice(Math.max(0,idx-20), idx+q.length+20).replace(/\n/g,' ');
            sub += ' · ' + (idx > 20 ? '…' : '') + snippet + '…';
          }
          cmds.push({group:'Files',id:'file:'+folder+'/'+name,icon:fileIcon(name),label:name,sub,action:()=>openApp('editor',{file:name,folder,title:name}),score:score+12});
        }
      });
    });
    getStickies().forEach(s=>{
      if(s.text && s.text.toLowerCase().includes(q)){
        const idx = s.text.toLowerCase().indexOf(q);
        const snippet = s.text.slice(Math.max(0,idx-20), idx+q.length+30).replace(/\n/g,' ');
        cmds.push({group:'Notes',id:'sticky:'+s.id,icon:'🗒️',label:s.text.slice(0,50)+(s.text.length>50?'…':''),sub:(idx>20?'…':'')+snippet+'…',action:()=>{switchWorkspace(s.workspace||0);const el=document.querySelector(`.sticky-note[data-id="${s.id}"]`);if(el){el.style.transform='scale(1.05)';el.style.boxShadow='0 0 30px var(--aura-cyan-glow)';setTimeout(()=>{el.style.transform='';el.style.boxShadow='';},1200);}},score:9});
      }
    });
    const kb = getKanban();
    Object.entries(kb).forEach(([col,cards])=>{
      (cards||[]).forEach((card,i)=>{
        if(card.toLowerCase().includes(q)){
          cmds.push({group:'Kanban',id:`kanban:${col}:${i}`,icon:'📊',label:card,sub:'In '+col,action:()=>openApp('kanban'),score:7});
        }
      });
    });
    getAIHistory().forEach((m,i)=>{
      if(m.content && m.content.toLowerCase().includes(q)){
        const idx = m.content.toLowerCase().indexOf(q);
        const snippet = m.content.slice(Math.max(0,idx-20), idx+q.length+30).replace(/\n/g,' ');
        cmds.push({group:'Chat',id:'chat:'+i,icon:m.role==='user'?'👤':'🤖',label:(m.role==='user'?'You: ':'Aura: ')+m.content.slice(0,40)+(m.content.length>40?'…':''),sub:(idx>20?'…':'')+snippet+'…',action:()=>openApp('aurachat'),score:6});
      }
    });
    getTermHistory().forEach((h,i)=>{
      if(h.toLowerCase().includes(q)){
        cmds.push({group:'Terminal',id:'term:'+i,icon:'⌨️',label:h,sub:'Terminal history',action:()=>openApp('terminal'),score:5});
      }
    });
    cmds.push({group:'AI',id:'ai:ask',icon:'🤖',label:`Ask Aura: "${f}"`,action:()=>{openApp('aurachat');setTimeout(()=>{const inp=document.querySelector('[id^="ai-in-"]');if(inp){inp.value=f;inp.focus();}},300);},score:25});
    cmds.push({group:'Web',id:'web:g',icon:'🔎',label:`Google: "${f}"`,action:()=>performAuraSearch(f,'google'),score:4});
    cmds.push({group:'Web',id:'web:y',icon:'▶️',label:`YouTube: "${f}"`,action:()=>performAuraSearch(f,'youtube'),score:4});
  }
  cmdCommands = cmds;
}
function renderCmdList(f){
  buildCommandList(f);
  const l=document.getElementById('cmd-list');
  const q=(f||'').trim();
  let items;
  if (!q) {
    items = cmdCommands.filter(c=>c.group==='Apps'||c.group==='System').sort((a,b)=>b.score-a.score).slice(0,14);
  } else {
    items = cmdCommands.filter(c=>c.score>0).sort((a,b)=>b.score-a.score).slice(0,20);
  }
  if(!items.length){l.innerHTML='<div class="cmd-empty">No results. Try another search term.</div>';return;}
  const groups = {};
  items.forEach(c => { (groups[c.group] = groups[c.group] || []).push(c); });
  let html = '';
  Object.entries(groups).forEach(([g, list]) => {
    html += `<div class="cmd-group-label">${g}</div>`;
    list.forEach(c => {
      html += `<div class="cmd-item" data-id="${c.id}"><span class="cmd-item-icon">${iconHtml(c.icon)}</span><span class="cmd-item-body"><div class="cmd-item-label">${sanitizeHTML(c.label)}</div>${c.sub?`<div class="cmd-item-sub">${sanitizeHTML(c.sub)}</div>`:''}</span></div>`;
    });
  });
  l.innerHTML = html;
  const firstItem = l.querySelector('.cmd-item');
  if(firstItem)firstItem.classList.add('selected');
  l.querySelectorAll('.cmd-item').forEach(el=>{
    el.onclick=()=>{closeCommandPalette();cmdCommands.find(c=>c.id===el.dataset.id)?.action();};
  });
}

/* ============ Shortcuts overlay ============ */
function initShortcutsOverlay(){
  const c=document.getElementById('shortcuts-content');
  const row=(k,d)=>`<div class="shortcut-row"><span>${d}</span><span class="shortcut-keys">${k.map(x=>`<span class="kbd">${x}</span>`).join('')}</span></div>`;
  c.innerHTML=`
    <div class="shortcut-section">Global</div>
    ${row([MOD_LABEL,'K'],'Global search')}
    ${row([MOD_LABEL,'J'],'Aura Chat')}
    ${row([MOD_LABEL,'Shift','S'],'Screenshot')}
    ${row(['Alt','Tab'],'Window Switcher')}
    ${row(['F4'],'Launchpad')}
    ${row(['?'],'Shortcuts help')}
    ${row(['Esc'],'Close overlays')}
    <div class="shortcut-section">Windows</div>
    ${row([MOD_LABEL,'T'],'New tab (same app)')}
    ${row([MOD_LABEL,'W'],'Close active tab')}
    ${row([MOD_LABEL,'←/→'],'Snap left/right')}
    ${row([MOD_LABEL,'↑/↓'],'Maximize/Restore')}
    ${row([MOD_LABEL,'Tab'],'Cycle windows')}
    <div class="shortcut-section">Files</div>
    ${row(['Space'],'Quick Look')}
    ${row(['Enter'],'Open in editor')}
    <div class="shortcut-section">Workspaces</div>
    ${row([MOD_LABEL,'1..4'],'Switch workspace')}
    <div class="shortcut-section">Touch</div>
    ${row(['Tap'],'Open app / item')}
    ${row(['Long-press'],'Context menu')}
  `;
  const closeBtn=document.getElementById('shortcuts-close-btn');
  if(closeBtn) closeBtn.onclick=()=>document.getElementById('shortcuts-overlay').classList.remove('open');
}

/* ============ Global Shortcuts & Alt+Tab ============ */
function initGlobalShortcuts(){
  document.addEventListener('keydown',(e)=>{
    const isInput=['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName);

    // Alt + Tab Switcher logic
    if(e.key === 'Tab' && e.altKey && !isInput) {
      e.preventDefault();
      if (!altTabActive) {
        altTabActive = true;
        altTabIndex = 0;
        renderAltTab();
      } else {
        const vis = windows.filter(w => w.workspace === currentWorkspace);
        if (vis.length > 1) {
          altTabIndex = (altTabIndex + 1) % vis.length;
          renderAltTab();
        }
      }
      return;
    }

    if(e.key==='F4'&&!isInput){e.preventDefault();const lp=document.getElementById('launchpad');lp.classList.contains('open')?closeLaunchpad():openLaunchpad();return;}

    if(e.key==='Escape'){
      if(document.getElementById('custom-app-modal').classList.contains('open')){closeCustomAppModal();return;}
      if(document.getElementById('quick-look').classList.contains('open')){closeQuickLook();return;}
      if(document.getElementById('launchpad').classList.contains('open')){closeLaunchpad();return;}
      closeCommandPalette();hideContextMenu();
      document.getElementById('shortcuts-overlay').classList.remove('open');
      document.getElementById('notif-panel').classList.remove('open');
      document.getElementById('clock-panel').classList.remove('open');
      document.getElementById('start-menu').classList.remove('open');
      return;
    }

    if(e[MOD_KEY]&&(e.key==='k'||e.key==='K')){e.preventDefault();openCommandPalette();return;}
    if(e[MOD_KEY]&&(e.key==='j'||e.key==='J')&&!isInput){e.preventDefault();openApp('aurachat');return;}
    if(e[MOD_KEY]&&e.shiftKey&&(e.key==='S'||e.key==='s')){e.preventDefault();takeScreenshot();return;}

    if(e[MOD_KEY]&&(e.key==='t'||e.key==='T')&&!isInput&&activeWindowId){
      e.preventDefault();
      const w = windows.find(x => x.id === activeWindowId);
      if (w && w.tabs[w.activeTabIndex]) {
        const t = w.tabs[w.activeTabIndex];
        addTabToWindow(w, t.appId, {});
      }
      return;
    }
    if(e[MOD_KEY]&&(e.key==='w'||e.key==='W')&&activeWindowId&&!isInput){
      e.preventDefault();
      const w = windows.find(x => x.id === activeWindowId);
      if (w) { if (w.tabs.length > 1) closeTab(w, w.activeTabIndex); else closeWindow(w.id); }
      return;
    }
    if(e[MOD_KEY]&&e.key==='Tab'){
      e.preventDefault();
      const vis=windows.filter(w=>w.workspace===currentWorkspace);
      if(vis.length<2)return;
      const idx=vis.findIndex(w=>w.id===activeWindowId);
      focusWindow(vis[(idx+1)%vis.length].id);
      return;
    }
    if(e[MOD_KEY]&&['1','2','3','4'].includes(e.key)){e.preventDefault();switchWorkspace(parseInt(e.key)-1);return;}
    if(e[MOD_KEY]&&activeWindowId&&e.key.startsWith('Arrow')){
      e.preventDefault();
      const w=windows.find(x=>x.id===activeWindowId);if(!w)return;
      if(e.key==='ArrowLeft')snapWindow(w,'left');
      if(e.key==='ArrowRight')snapWindow(w,'right');
      if(e.key==='ArrowUp')snapWindow(w,'maximize');
      if(e.key==='ArrowDown')snapWindow(w,'restore');
      return;
    }
    if(e.key==='?'&&!isInput&&!e[MOD_KEY]){e.preventDefault();document.getElementById('shortcuts-overlay').classList.toggle('open');return;}
    if(e.altKey&&e.key==='F4'&&activeWindowId){e.preventDefault();closeWindow(activeWindowId);}
  });

  document.addEventListener('keyup', (e) => {
    if (e.key === 'Alt' && altTabActive) {
      altTabActive = false;
      document.getElementById('alt-tab-overlay').classList.remove('open');
      const vis = windows.filter(w => w.workspace === currentWorkspace);
      if (vis[altTabIndex]) {
        focusWindow(vis[altTabIndex].id);
      }
    }
  });
}

function renderAltTab() {
  const vis = windows.filter(w => w.workspace === currentWorkspace);
  const grid = document.getElementById('alt-tab-grid');
  grid.innerHTML = vis.map((w, i) => {
    const tab = w.tabs[w.activeTabIndex];
    const app = getAllApps().find(a => a.id === tab?.appId) || { name: 'App', icon: '📦' };
    return `<div class="alt-tab-item ${i === altTabIndex ? 'selected' : ''}">
      <div class="alt-tab-icon">${iconHtml(app.icon)}</div>
      <div class="alt-tab-title">${sanitizeHTML(tab.meta.title || app.name)}</div>
    </div>`;
  }).join('');
  document.getElementById('alt-tab-overlay').classList.add('open');
}

/* ============ Windows ============ */
function openApp(appId,meta={}){
  const app=getAllApps().find(a=>a.id===appId);
  if(!app){toast('App not found',appId,'error',3000);return null;}
  if(!isInstalled(appId)){toast('Not installed',app.name+' is not installed. Visit the Store.','warn',2500);return null;}
  if(appId==='notes'){createSticky(meta.text);return null;}
  if(appId==='music'){toggleMiniPlayer(true);return null;}
  if(appId==='quicksearch'){openQuickSearchPanel();return null;}
  
  const existing = windows.find(w => w.workspace === currentWorkspace && w.tabs.some(t => t.appId === appId));
  if (existing) { addTabToWindow(existing, appId, meta); focusWindow(existing.id); return existing; }

  const winId='win-'+Date.now()+'-'+Math.floor(Math.random()*1000);
  const winEl=document.createElement('div');
  winEl.className='window focused';winEl.id=winId;
  const isMobile = window.innerWidth <= 700;
  const width=isMobile ? window.innerWidth : Math.min(window.innerWidth-20,meta.width||680);
  const height=isMobile ? (window.innerHeight - 56) : Math.min(window.innerHeight-80,meta.height||460);
  winEl.style.width=width+'px';winEl.style.height=height+'px';
  if (!isMobile) {
    const off=(windows.length%8)*22;
    winEl.style.top=Math.max(10,40+off)+'px';winEl.style.left=Math.max(10,60+off)+'px';
  }
  winEl.style.zIndex=++zIndexCounter;

  const tabId = 'tab-' + Date.now() + '-' + Math.floor(Math.random()*1000);
  const tab = { id: tabId, appId, meta: {...meta} };

  const style=getWindowStyle();
  const ccls=style==='buttons'?'window-controls buttons-style':'window-controls';
  const cHtml=style==='buttons'?`
    <button class="control-btn btn-min" data-wc="min" title="Minimize" aria-label="Minimize">—</button>
    <button class="control-btn btn-max" data-wc="max" title="Maximize" aria-label="Maximize">▢</button>
    <button class="control-btn btn-close" data-wc="close" title="Close" aria-label="Close">✕</button>
  `:`
    <button class="control-btn btn-min" data-wc="min" aria-label="Minimize"></button>
    <button class="control-btn btn-max" data-wc="max" aria-label="Maximize"></button>
    <button class="control-btn btn-close" data-wc="close" aria-label="Close"></button>
  `;

  winEl.innerHTML=`
    <div class="window-header">
      <div class="window-tabs" id="tabs-${winId}" role="tablist"></div>
      <div style="display:flex; align-items:center; gap:6px;">
        <button class="mini-btn" data-wc="popout" title="Pop out to real window" style="padding:2px 8px; font-size:10px; height:22px;">↗</button>
        <div class="${ccls}">${cHtml}</div>
      </div>
    </div>
    <div class="window-body" id="body-${winId}"></div>`;
    document.getElementById('desktop').appendChild(winEl);

  winEl.querySelectorAll('[data-wc]').forEach(b=>{
    const act=b.dataset.wc;
    b.addEventListener('click',(ev)=>{
      ev.stopPropagation();
      if(act==='min') minimizeWindow(winId);
      else if(act==='max') maximizeWindow(winId);
      else if(act==='popout') window.open(`aetheros.html?app=${tab.appId}`, '_blank', `width=800,height=600`);
      else closeWindow(winId);
    });
  });
  const winObj={
    id: winId, tabs: [tab], activeTabIndex: 0, element: winEl,
    isMaximized: false, workspace: currentWorkspace, snap: null
  };
  windows.push(winObj);

  makeDraggable(winEl, winObj);
  winEl.addEventListener('pointerdown', () => focusWindow(winId), { passive: true });

  const ctxMenu = (x, y) => {
    focusWindow(winId);
    showContextMenu(x, y, [
      { label: 'Minimize', action: () => minimizeWindow(winId) },
      { label: 'Maximize / Restore', action: () => maximizeWindow(winId) },
      { divider:true },
      { label: 'Snap Left', action: () => snapWindow(winObj, 'left') },
      { label: 'Snap Right', action: () => snapWindow(winObj, 'right') },
      { label: 'Snap Top-Left (¼)', action: () => snapWindow(winObj, 'tl') },
      { label: 'Snap Top-Right (¼)', action: () => snapWindow(winObj, 'tr') },
      { label: 'Snap Bottom-Left (¼)', action: () => snapWindow(winObj, 'bl') },
      { label: 'Snap Bottom-Right (¼)', action: () => snapWindow(winObj, 'br') },
      { divider:true },
      { label: 'Close Tab', action: () => closeTab(winObj, winObj.activeTabIndex) },
      { label: 'Close Window', action: () => closeWindow(winId) }
    ]);
  };
  winEl.addEventListener('contextmenu', (e) => {
    if(e.target.closest('.window-body')) return;
    e.preventDefault();
    ctxMenu(e.clientX, e.clientY);
  });
  const headerEl = winEl.querySelector('.window-header');
  if (IS_TOUCH) {
    addLongPress(headerEl, (e) => ctxMenu(e.clientX, e.clientY), 550);
  }

  renderTabs(winObj);
  renderActiveTab(winObj);
  focusWindow(winId);
  updateTaskbar();
  sfx.click();
  saveSessionDebounced();
  return winObj;
}

function addTabToWindow(w, appId, meta) {
  const app = getAllApps().find(a => a.id === appId);
  if (!app) return;
  const tabId = 'tab-' + Date.now() + '-' + Math.floor(Math.random()*1000);
  w.tabs.push({ id: tabId, appId, meta: {...meta} });
  w.activeTabIndex = w.tabs.length - 1;
  renderTabs(w);
  renderActiveTab(w);
  saveSessionDebounced();
}
function closeTab(w, idx) {
  if (idx < 0 || idx >= w.tabs.length) return;
  if (w.tabs.length === 1) { closeWindow(w.id); return; }
  w.tabs.splice(idx, 1);
  if (w.activeTabIndex >= w.tabs.length) w.activeTabIndex = w.tabs.length - 1;
  if (w.activeTabIndex < 0) w.activeTabIndex = 0;
  renderTabs(w);
  renderActiveTab(w);
  saveSessionDebounced();
}
function switchTab(w, idx) {
  if (idx < 0 || idx >= w.tabs.length) return;
  w.activeTabIndex = idx;
  renderTabs(w);
  renderActiveTab(w);
  saveSessionDebounced();
}
function renderTabs(w) {
  const c = document.getElementById(`tabs-${w.id}`);
  if (!c) return;
  c.innerHTML = w.tabs.map((t, i) => {
    const app = getAllApps().find(a => a.id === t.appId);
    if (!app) return '';
    const active = i === w.activeTabIndex;
    const label = t.meta.title || app.name;
    return `<div class="window-tab${active?' active':''}" role="tab" aria-selected="${active}" data-tab-index="${i}">
      <span>${iconHtml(app.icon)}</span>
      <span class="tab-label">${sanitizeHTML(label)}</span>
      ${w.tabs.length > 1 ? `<span class="tab-close" data-tab-close="${i}" aria-label="Close tab">✕</span>` : ''}
    </div>`;
  }).join('') + `<button class="window-tab-add" data-tab-add title="New tab" aria-label="New tab">+</button>`;
  c.querySelectorAll('[data-tab-index]').forEach(el => {
    el.onclick = (e) => {
      if (e.target.closest('[data-tab-close]')) return;
      switchTab(w, +el.dataset.tabIndex);
    };
  });
  c.querySelectorAll('[data-tab-close]').forEach(el => {
    el.onclick = (e) => { e.stopPropagation(); closeTab(w, +el.dataset.tabClose); };
  });
  c.querySelector('[data-tab-add]').onclick = () => {
    const current = w.tabs[w.activeTabIndex];
    if (current) addTabToWindow(w, current.appId, {});
  };
}

function renderActiveTab(w) {
  const body = document.getElementById(`body-${w.id}`);
  const tab = w.tabs[w.activeTabIndex];
  if (!body || !tab) return;
  saveSessionDebounced();

  const ext = EXTERNAL_OS.find(o => o.id === tab.appId);
  if (ext) return safeRender(() => renderExternalOS(body, w.id, ext), body, w.id, tab.meta);

  const custom = getCustomApps().find(a => a.id === tab.appId);
  if (custom) return safeRender(() => renderCustomApp(body, w.id, custom), body, w.id, tab.meta);

    const handlers = {
    aurasearch: renderAuraSearch, aurayt: renderAuraYouTube, terminal: renderTerminal,
    editor: renderEditor, explorer: renderExplorer, browser: renderBrowser,
    history: renderHistory, store: renderStore, calculator: renderCalculator,
    settings: renderSettings, profile: renderProfile, imageviewer: renderImageViewer,
    trash: renderTrash, clipboard: renderClipboard, password: renderPasswordGen,
    converter: renderConverter, colorpicker: renderColorPicker, markdown: renderMarkdown,
    kanban: renderKanban, json: renderJSONTools, base64: renderBase64, uuid: renderUUID,
    timestamp: renderTimestamp, weather: renderWeatherApp, g2048: render2048,
    tictactoe: renderTicTacToe, dice: renderDice, coin: renderCoin, aurachat: renderAuraChat,
        mediaplayer: renderMediaPlayer, 
    paint: renderPaint, camera: renderCamera, synth: renderSynth,
    quicksearch: () => { openQuickSearchPanel(); }
  };
  const fn = handlers[tab.appId];
  if (!fn) { body.innerHTML = '<div class="empty-state">App not yet implemented.</div>'; return; }
  safeRender(fn, body, w.id, tab.meta);
}
function safeRender(fn, body, winId, meta) {
  try { fn(body, winId, meta); }
  catch (e) {
    console.error('App render error:', e);
    body.innerHTML = `<div class="app-crash">
      <div class="app-crash-icon">💥</div>
      <div class="app-crash-title">App crashed</div>
      <div class="app-crash-msg">${sanitizeHTML(e.message || 'Unknown error')}</div>
      <button class="mini-btn primary" id="crash-reload">↻ Reload App</button>
    </div>`;
    const b = body.querySelector('#crash-reload');
    if (b) b.onclick = () => safeRender(fn, body, winId, meta);
  }
}

function focusWindow(id){
  activeWindowId=id;
  windows.forEach(w=>w.element.classList.toggle('focused',w.id===id));
  const w=windows.find(x=>x.id===id);
  if(w)w.element.style.zIndex=++zIndexCounter;
  updateTaskbar();
}
function closeWindow(id){
  const w=windows.find(x=>x.id===id);
  if(w){
    if(w.element._cleanup)w.element._cleanup();
    w.element.remove();
    windows=windows.filter(x=>x.id!==id);
    if(activeWindowId===id)activeWindowId=windows[windows.length-1]?.id||null;
    updateTaskbar();
    sfx.click();
    saveSessionDebounced();
  }
}
function minimizeWindow(id){const w=windows.find(x=>x.id===id);if(w){w.element.classList.add('minimized');updateTaskbar();}}
function maximizeWindow(id){
  const w=windows.find(x=>x.id===id);
  if(w){w.isMaximized=!w.isMaximized;w.element.classList.toggle('maximized',w.isMaximized);w.snap=w.isMaximized?'maximize':null;saveSessionDebounced();}
}
function snapWindow(w,pos){
  const el=w.element,H=window.innerHeight-56,W=window.innerWidth;
  el.classList.add('snapping');el.classList.remove('maximized');w.isMaximized=false;
  if(pos==='left'){el.style.left='0px';el.style.top='0px';el.style.width=(W/2)+'px';el.style.height=H+'px';w.snap='left';}
  else if(pos==='right'){el.style.left=(W/2)+'px';el.style.top='0px';el.style.width=(W/2)+'px';el.style.height=H+'px';w.snap='right';}
  else if(pos==='tl'){el.style.left='0px';el.style.top='0px';el.style.width=(W/2)+'px';el.style.height=(H/2)+'px';w.snap='tl';}
  else if(pos==='tr'){el.style.left=(W/2)+'px';el.style.top='0px';el.style.width=(W/2)+'px';el.style.height=(H/2)+'px';w.snap='tr';}
  else if(pos==='bl'){el.style.left='0px';el.style.top=(H/2)+'px';el.style.width=(W/2)+'px';el.style.height=(H/2)+'px';w.snap='bl';}
  else if(pos==='br'){el.style.left=(W/2)+'px';el.style.top=(H/2)+'px';el.style.width=(W/2)+'px';el.style.height=(H/2)+'px';w.snap='br';}
  else if(pos==='maximize'){el.classList.add('maximized');w.isMaximized=true;w.snap='maximize';}
  else if(pos==='restore'){el.classList.remove('maximized');el.style.width='680px';el.style.height='460px';el.style.top='60px';el.style.left='80px';w.snap=null;}
  setTimeout(()=>el.classList.remove('snapping'),220);
}

function updateTaskbar(){
  const c=document.getElementById('taskbar-apps');
  c.innerHTML='';
  const pinned=getPinned();
  
  // 1. Render Pinned Apps
  pinned.forEach(id=>{
    const app=getAllApps().find(a=>a.id===id);if(!app||!isInstalled(id))return;
    const item=document.createElement('button');
    item.className='taskbar-item pinned';item.type='button';
    item.setAttribute('aria-label',app.name);
    item.innerHTML=`<span>${iconHtml(app.icon)}</span> <span>${sanitizeHTML(app.name)}</span>`;
    item.onclick=()=>{
      const ex=windows.find(w=>w.tabs.some(t=>t.appId===id)&&w.workspace===currentWorkspace);
      if(ex){ex.element.classList.remove('minimized');focusWindow(ex.id);}
      else openApp(id);
    };
    item.oncontextmenu=(e)=>{e.preventDefault();showContextMenu(e.clientX,e.clientY,[{label:'Unpin from taskbar',action:()=>unpinApp(id)}]);};
    if (IS_TOUCH) addLongPress(item, (e) => showContextMenu(e.clientX,e.clientY,[{label:'Unpin from taskbar',action:()=>unpinApp(id)}]), 500);
    c.appendChild(item);
  });

  // 2. Render Open AetherOS Windows
  windows.filter(w=>w.workspace===currentWorkspace).forEach(w=>{
    const tab = w.tabs[w.activeTabIndex];
    const app=getAllApps().find(a=>a.id===tab?.appId);
    if(!app)return;
    const item=document.createElement('button');
    item.className=`taskbar-item ${activeWindowId===w.id&&!w.element.classList.contains('minimized')?'active':''}`;
    item.type='button';
    item.setAttribute('aria-label',app.name);
    item.innerHTML=`<span>${iconHtml(app.icon)}</span> <span>${sanitizeHTML(app.name)}${w.tabs.length>1?` (${w.tabs.length})`:''}</span>`;
    item.onclick=()=>{
      if(w.element.classList.contains('minimized')){w.element.classList.remove('minimized');focusWindow(w.id);}
      else if(activeWindowId===w.id)minimizeWindow(w.id);
      else focusWindow(w.id);
    };
    c.appendChild(item);
  });

  // 3. Render REAL Chrome Tabs safely
  if (typeof chrome !== 'undefined' && chrome.tabs) {
    chrome.tabs.query({}, (tabs) => {
      const container = document.getElementById('chrome-tabs-container');
      if(!container) return;
      
      const validTabs = tabs.filter(t => t.url && !t.url.startsWith('chrome-extension://'));
      
      container.innerHTML = validTabs.map(t => `
        <div class="taskbar-item chrome-tab-item" data-tabid="${t.id}" style="max-width:120px; opacity:${t.active?1:0.7}; font-size:10px; padding:4px 8px; cursor:pointer;">
          <img src="${t.favIconUrl || 'https://www.google.com/s2/favicons?domain=google.com'}" style="width:12px;height:12px;">
          <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${sanitizeHTML(t.title)}</span>
        </div>
      `).join('');

      // Attach safe event listeners (This fixes the 9 errors!)
      container.querySelectorAll('.chrome-tab-item').forEach(item => {
        item.addEventListener('click', () => {
          const tabId = parseInt(item.dataset.tabid, 10);
          if (typeof chrome !== 'undefined' && chrome.tabs) {
            chrome.tabs.update(tabId, { active: true });
          }
        });
      });
    });
  }
}

function makeDraggable(winEl,winObj){
  const header=winEl.querySelector('.window-header');
  const snapEl=document.getElementById('snap-preview');
  let drag=null;

  const onMove=(e)=>{
    if(!drag)return;
    e.preventDefault && e.preventDefault();
    const dx=e.clientX-drag.ox,dy=e.clientY-drag.oy;
    if(!drag.moved&&Math.abs(dx)<4&&Math.abs(dy)<4)return;
    drag.moved=true;
    if(winEl.classList.contains('maximized')){
      const ratio=(e.clientX-winEl.offsetLeft)/winEl.offsetWidth;
      winEl.classList.remove('maximized');winObj.isMaximized=false;
      winEl.style.width='680px';winEl.style.height='460px';
      drag.ox=680*ratio;drag.oy=20;
    }
    winEl.style.left=Math.max(0,e.clientX-drag.ox)+'px';
    winEl.style.top=Math.max(0,e.clientY-drag.oy)+'px';

    const edge=60,H=window.innerHeight-56,W=window.innerWidth;
    const inLeft = e.clientX < edge;
    const inRight = e.clientX > W - edge;
    const inTop = e.clientY < edge;
    const inBottom = e.clientY > H - edge + 56;
    let proposed = null, preview = null;
    if(inTop && inLeft){proposed='tl';preview={l:0,t:0,w:W/2,h:H/2};}
    else if(inTop && inRight){proposed='tr';preview={l:W/2,t:0,w:W/2,h:H/2};}
    else if(inBottom && inLeft){proposed='bl';preview={l:0,t:H/2,w:W/2,h:H/2};}
    else if(inBottom && inRight){proposed='br';preview={l:W/2,t:H/2,w:W/2,h:H/2};}
    else if(inTop){proposed='maximize';preview={l:0,t:0,w:W,h:H};}
    else if(inLeft){proposed='left';preview={l:0,t:0,w:W/2,h:H};}
    else if(inRight){proposed='right';preview={l:W/2,t:0,w:W/2,h:H};}
    if(preview){
      snapEl.className='show';
      snapEl.style.left=preview.l+'px';
      snapEl.style.top=preview.t+'px';
      snapEl.style.width=preview.w+'px';
      snapEl.style.height=preview.h+'px';
      drag.proposed=proposed;
    } else {
      snapEl.className='';
      drag.proposed=null;
    }
  };

  const onUp=()=>{
    if(!drag)return;
    snapEl.className='';
    if(drag.proposed)snapWindow(winObj,drag.proposed);
    else saveSessionDebounced();
    drag=null;
  };

  header.addEventListener('pointerdown',(e)=>{
    if(e.target.closest('.control-btn'))return;
    if(e.target.closest('.window-tab'))return;
    if(e.target.closest('.window-tab-add'))return;
    if(e.pointerType==='mouse' && e.button!==0)return;
    if (IS_TOUCH && e.pointerType !== 'mouse') return;
    drag={ox:e.clientX-winEl.offsetLeft,oy:e.clientY-winEl.offsetTop,moved:false,proposed:null};
    focusWindow(winObj.id);
    header.setPointerCapture && header.setPointerCapture(e.pointerId);
  });
  header.addEventListener('pointermove',onMove);
  header.addEventListener('pointerup',onUp);
  header.addEventListener('pointercancel',onUp);
  
  header.addEventListener('dblclick', (e) => {
    if(e.target.closest('.control-btn') || e.target.closest('.window-tab') || e.target.closest('.window-tab-add')) return;
    maximizeWindow(winObj.id);
  });

  winEl._cleanup=()=>{};
}

function getWindowStyle(){return localStorage.getItem(WINDOW_STYLE_KEY)||'traffic';}
function setWindowStyle(s){localStorage.setItem(WINDOW_STYLE_KEY,s);toast('Window Style',`Switched to ${s==='buttons'?'Windows/Linux':'macOS'}.`,'success',2000);}
function sanitizeHTML(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}

/* ============ Session ============ */
let sessionSaveTimer=null;
function saveSessionDebounced(){
  if(sessionSaveTimer)clearTimeout(sessionSaveTimer);
  sessionSaveTimer=setTimeout(saveSession, 800);
}
function saveSession(){
  try{
    const session = windows.map(w => ({
      workspace: w.workspace, left: w.element.style.left, top: w.element.style.top,
      width: w.element.style.width, height: w.element.style.height,
      isMaximized: w.isMaximized, activeTabIndex: w.activeTabIndex,
      tabs: w.tabs.map(t => ({ appId: t.appId, meta: t.meta }))
    })).filter(w => w.tabs.length > 0);
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }catch(e){}
}
function getSavedSession(){try{const s=JSON.parse(localStorage.getItem(SESSION_KEY)||'[]');return Array.isArray(s)?s:[];}catch(e){return[];}}
function offerSessionRestore(){
  const s = getSavedSession();
  if (!s.length) return;
  const count = s.reduce((n, w) => n + w.tabs.length, 0);
  toast('Restore session?', `${count} window${count===1?'':'s'} from last session.`, 'info', 8000, '↻ Restore', () => restoreSession());
}
function restoreSession(){
  const s = getSavedSession();
  if (!s.length) { toast('Nothing to restore', '', 'info', 1500); return; }
  const originalWorkspace = currentWorkspace;
  s.forEach(sw => {
    currentWorkspace = sw.workspace || 0;
    const firstTab = sw.tabs[0];
    if (!firstTab) return;
    const w = openApp(firstTab.appId, firstTab.meta || {});
    if (!w) return;
    for (let i = 1; i < sw.tabs.length; i++) addTabToWindow(w, sw.tabs[i].appId, sw.tabs[i].meta || {});
    if (sw.left && window.innerWidth > 700) w.element.style.left = sw.left;
    if (sw.top && window.innerWidth > 700) w.element.style.top = sw.top;
    if (sw.width && window.innerWidth > 700) w.element.style.width = sw.width;
    if (sw.height && window.innerWidth > 700) w.element.style.height = sw.height;
    if (sw.isMaximized) { w.isMaximized = true; w.element.classList.add('maximized'); }
    if (typeof sw.activeTabIndex === 'number') switchTab(w, sw.activeTabIndex);
  });
  currentWorkspace = originalWorkspace;
  windows.forEach(w => w.element.classList.toggle('hidden', w.workspace !== currentWorkspace));
  updateTaskbar();
  toast('Session restored', `${s.length} window${s.length===1?'':'s'} reopened.`, 'success', 2500);
}
function clearSession(){try{localStorage.removeItem(SESSION_KEY);}catch(e){}}

/* ============ External OS ============ */
function renderExternalOS(container,winId,os){
  container.innerHTML=`<div style="display:flex;flex-direction:column;flex:1;min-height:0;background:#0a0a0a;">
    <div style="display:flex;gap:6px;padding:8px;background:rgba(15,23,42,.92);border-bottom:1px solid var(--glass-border);flex-wrap:wrap;flex-shrink:0;">
      <span style="flex:1;min-width:120px;font-size:11px;color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">🌐 ${sanitizeHTML(os.name)}</span>
      <button class="mini-btn" id="ext-nt-${winId}">↗ New Tab</button>
    </div>
    <iframe src="${sanitizeHTML(os.url)}" style="flex:1;border:none;background:#fff;min-height:0;" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" referrerpolicy="no-referrer"></iframe>
  </div>`;
  document.getElementById(`ext-nt-${winId}`).onclick=()=>window.open(os.url,'_blank','noopener,noreferrer');
}

/* ============ Terminal ============ */
function getTermHistory(){try{const x=JSON.parse(localStorage.getItem(TERM_HISTORY_KEY)||'[]');return Array.isArray(x)?x:[];}catch(e){return[];}}
function saveTermHistory(x){try{localStorage.setItem(TERM_HISTORY_KEY,JSON.stringify(x.slice(-200)));}catch(e){}}
function renderTerminal(body,winId){
  body.innerHTML=`<div style="background:#050505;color:#10b981;font-family:monospace;padding:12px;flex:1;display:flex;flex-direction:column;min-height:0;">
    <div id="to-${winId}" style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;margin-bottom:8px;white-space:pre-wrap;word-break:break-all;min-height:0;font-size:12px;">AetherOS v7.0 terminal — try "ai <question>" for Aura.\nType "help" for commands.\n\n</div>
    <div style="display:flex;gap:8px;align-items:center;flex-shrink:0;">
      <span style="font-size:12px;">user@aether:~$</span>
      <input type="text" id="ti-${winId}" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" style="background:transparent;border:none;color:#10b981;font-family:monospace;outline:none;flex:1;font-size:12px;min-width:0;" aria-label="Terminal input">
    </div>
  </div>`;
  const input=document.getElementById(`ti-${winId}`),output=document.getElementById(`to-${winId}`);
  let hist=getTermHistory(),hIdx=hist.length;
  const cmds=['help','clear','ls','echo','date','open','fun','hello','joke','quote','mood','fortune','aura','whoami','neofetch','coffee','dance','matrix','hack','apps','files','uptime','alias','unalias','pwd','cat','tree','theme','lock','randomwall','install','uninstall','ai','ask'];
  input.onkeydown=async(e)=>{
    if(e.key==='ArrowUp'){e.preventDefault();if(hist.length){hIdx=Math.max(0,hIdx-1);input.value=hist[hIdx]||'';}return;}
    if(e.key==='ArrowDown'){e.preventDefault();if(hIdx<hist.length-1){hIdx++;input.value=hist[hIdx]||'';}else{hIdx=hist.length;input.value='';}return;}
    if(e.key==='Tab'){
      e.preventDefault();
      const v=input.value,parts=v.split(/\s+/);
      if(parts.length===1){
        const m=cmds.filter(c=>c.startsWith(v));
        if(m.length===1)input.value=m[0]+' ';
        else if(m.length>1)output.innerText+='\n'+m.join('  ')+'\n';
      }
      return;
    }
    if(e.key!=='Enter')return;
    const raw=input.value.trim();
    output.innerText+=`user@aether:~$ ${raw}\n`;
    input.value='';
    if(!raw)return;
    hist.push(raw);saveTermHistory(hist);hIdx=hist.length;
    const parts=raw.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g)||[];
    const cmd=(parts.shift()||'').toLowerCase();
    const args=parts.map(x=>x.replace(/^['"]|['"]$/g,''));
    const f=getFunConfig();
    if(f.aliases[cmd]){output.innerText+=f.aliases[cmd]+'\n';output.scrollTop=output.scrollHeight;return;}
    if(['fun','hello','joke','quote','mood','fortune','aura','whoami','neofetch','coffee','dance','matrix','hack','apps','files','uptime','alias','unalias'].includes(cmd)){runFunCommand(cmd,args,output);output.scrollTop=output.scrollHeight;return;}
    switch(cmd){
      case'help':output.innerText+='Core: help, clear, ls, echo, date, open, pwd, cat, tree, theme, lock, randomwall, install, uninstall, ai <question>\n'+funHelp()+'\n';break;
      case'ai':case'ask':if(!args.length){output.innerText+='Usage: ai <question>\n';break;}output.innerText+='🤖 Thinking...\n';callAuraAI(args.join(' ')).then(r=>{output.innerText+='🤖 '+r+'\n';output.scrollTop=output.scrollHeight;});break;
      case'clear':output.innerText='';break;
      case'ls':output.innerText+=Object.entries(VFS).map(([k,v])=>`${k}/ (${Object.keys(v).length})`).join('  ')+'\n';break;
      case'tree':output.innerText+='.\n'+Object.entries(VFS).map(([k,v])=>`├── ${k}/\n${Object.keys(v).map(f=>`│   └── ${f}`).join('\n')}`).join('\n')+'\n';break;
      case'pwd':output.innerText+='/home/user\n';break;
      case'cat':if(!args[0])output.innerText+='Usage: cat folder/file\n';else{const[fold,...rest]=args[0].split('/');const c=VFS[fold]?.[rest.join('/')];output.innerText+=(c!==undefined?c:`cat: not found`)+'\n';}break;
      case'echo':output.innerText+=args.join(' ')+'\n';break;
      case'date':output.innerText+=new Date().toString()+'\n';break;
      case'open':if(args[0])openApp(args[0]);else output.innerText+='Usage: open [id]\n';break;
      case'install':if(args[0]){installApp(args[0]);output.innerText+='Installing '+args[0]+'\n';}else{const u=getUninstalled();output.innerText+=(u.length?u.map(id=>`  ${id}`).join('\n'):'All apps installed.')+'\n';}break;
      case'uninstall':if(args[0]){uninstallApp(args[0]);output.innerText+='Uninstalling '+args[0]+'\n';}else output.innerText+='Usage: uninstall [id]\n';break;
      case'lock':lockScreen();break;
      case'randomwall':applyRandomWallpaper();break;
      case'theme':if(args[0]&&/^#?[0-9a-f]{6}$/i.test(args[0])){const h=args[0].startsWith('#')?args[0]:'#'+args[0];saveThemeSettings({accent:h,accentHover:h,glow:hexToRgba(h,.4),glassOpacity:.75});output.innerText+=`Accent set to ${h}\n`;}else output.innerText+='Usage: theme #RRGGBB\n';break;
      default:output.innerText+=`Command not recognized: ${raw}\n`;
    }
    output.scrollTop=output.scrollHeight;
  };
  if (!IS_TOUCH) input.focus();
}

/* ============ Editor ============ */
function renderEditor(body,winId,meta){
  const folder=meta.folder||'documents';
  const initial=meta.file?(VFS[folder]?.[meta.file]||''):'';
  body.innerHTML=`<div style="padding:6px;background:rgba(0,0,0,.2);border-bottom:1px solid var(--glass-border);display:flex;gap:8px;flex-shrink:0;flex-wrap:wrap;">
    <button class="mini-btn" id="save-${winId}">💾 Save</button>
    ${meta.file?`<button class="mini-btn" id="ask-${winId}">🤖 Ask Aura</button>`:''}
  </div>
  <textarea id="text-${winId}" placeholder="Start typing…" style="flex:1;min-height:0;width:100%;background:transparent;border:none;color:#fff;padding:12px;outline:none;resize:none;font-family:inherit;font-size:14px;touch-action:auto;">${sanitizeHTML(initial)}</textarea>`;
  document.getElementById(`save-${winId}`).onclick=()=>{
    const name=meta.file||prompt('Filename:','untitled.txt');
    if(!name)return;
    VFS[folder]=VFS[folder]||{};
    VFS[folder][name]=document.getElementById(`text-${winId}`).value;
    saveUserVFS();meta.file=name;
    toast('Saved',`"${name}" saved to ${folder}/`,'success',2500);
  };
  const askBtn = document.getElementById(`ask-${winId}`);
  if (askBtn) askBtn.onclick = () => {
    const content = document.getElementById(`text-${winId}`).value.slice(0, 2000);
    openApp('aurachat');
    setTimeout(() => {
      const inp = document.querySelector('[id^="ai-in-"]');
      if (inp) { inp.value = `Please explain this file "${meta.file}":\n\n${content}`; inp.focus(); }
    }, 300);
  };
}

/* ============ Browser ============ */
function renderBrowser(body,winId,meta){
  const url=meta.url||'https://wikipedia.org';
  body.innerHTML=`<div style="display:flex;gap:8px;padding:8px;background:rgba(0,0,0,.2);border-bottom:1px solid var(--glass-border);flex-shrink:0;flex-wrap:wrap;">
    <input type="text" id="bu-${winId}" value="${sanitizeHTML(url)}" autocapitalize="off" autocorrect="off" spellcheck="false" style="flex:1;min-width:120px;background:rgba(0,0,0,.4);border:1px solid var(--glass-border);border-radius:4px;padding:8px 10px;color:#fff;font-size:12px;outline:none;" aria-label="URL">
    <button class="mini-btn" id="go-${winId}">Go</button>
    <button class="mini-btn" id="nt-${winId}">↗</button>
  </div>
  <iframe id="fr-${winId}" src="${sanitizeHTML(url)}" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" style="flex:1;border:none;background:#fff;min-height:0;"></iframe>`;
  const nav=()=>{let u=document.getElementById(`bu-${winId}`).value.trim();if(!u.startsWith('http'))u='https://'+u;document.getElementById(`fr-${winId}`).src=u;};
  document.getElementById(`go-${winId}`).onclick=nav;
  document.getElementById(`bu-${winId}`).onkeydown=(e)=>{if(e.key==='Enter')nav();};
  document.getElementById(`nt-${winId}`).onclick=()=>{let u=document.getElementById(`bu-${winId}`).value.trim();if(!u.startsWith('http'))u='https://'+u;window.open(u,'_blank','noopener,noreferrer');};
}

/* ============ History ============ */
function renderHistory(body,winId){
  const items=getHistory();
  body.innerHTML=`<div style="padding:16px;overflow:auto;-webkit-overflow-scrolling:touch;flex:1;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;gap:10px;flex-wrap:wrap;">
      <div><div style="font-size:18px;font-weight:700;">🕘 History</div><div class="setting-subtext">Searches and videos.</div></div>
      <button class="mini-btn danger" id="ch-${winId}">Clear</button>
    </div>
    <div style="display:grid;gap:8px;">
      ${items.length?items.map(h=>`<div style="background:rgba(0,0,0,.22);border:1px solid var(--glass-border);border-radius:9px;padding:10px;display:flex;gap:10px;">
        <div style="font-size:18px;">${h.type==='youtube'?'▶️':h.type==='search'?'🔎':'🌐'}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:600;font-size:12px;word-break:break-word;">${sanitizeHTML(h.title)}</div>
          <div style="font-size:10px;color:var(--text-muted);margin-top:3px;">${sanitizeHTML(h.detail)}</div>
        </div>
        ${h.url?`<button class="mini-btn" data-url="${sanitizeHTML(h.url)}">Open</button>`:''}
      </div>`).join(''):'<div class="empty-state">No history yet.</div>'}
    </div>
  </div>`;
  document.getElementById(`ch-${winId}`).onclick=()=>{if(confirm('Clear all history?')){clearHistory();renderHistory(body,winId);toast('History','Cleared.','success',2000);}};
  body.querySelectorAll('[data-url]').forEach(b=>b.onclick=()=>{const u=b.dataset.url;if(validateYoutubeUrl(u).valid)openApp('aurayt',{initialUrl:u});else openApp('browser',{url:u});});
}

/* ============ Store ============ */
let storeActiveTab='all';
function renderStore(body,winId){
  const categories=[
    {id:'all',label:'All Apps',icon:'✨'},
    {id:'custom',label:'My Apps',icon:'📱'},
    {id:'system',label:'System',icon:'⚙️'},
    {id:'internet',label:'Internet',icon:'🌐'},
    {id:'tools',label:'Tools',icon:'🔧'},
    {id:'dev',label:'Developer',icon:'💻'},
    {id:'media',label:'Media',icon:'🎵'},
    {id:'games',label:'Games',icon:'🎮'},
    {id:'os',label:'External OS',icon:'🖥️'}
  ];
  const installedCount=getInstalledApps().length;
  const totalCount=getAllApps().length;
  body.innerHTML=`<div class="store-wrap">
    <div class="store-header">
      <div>
        <div class="store-title">🛍️ AetherOS Store</div>
        <div class="setting-subtext" style="margin-top:4px;">Install and uninstall apps · ${installedCount} of ${totalCount} apps installed</div>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;">
        <button class="mini-btn primary" id="st-add-custom-${winId}">+ Add Custom App</button>
        <button class="mini-btn" id="st-reinstall-${winId}">↻ Reinstall All</button>
      </div>
    </div>
    <div class="store-tabs" id="st-tabs-${winId}">
      ${categories.map(c=>`<button class="store-tab${c.id===storeActiveTab?' active':''}" data-cat="${c.id}" type="button">${c.icon} ${c.label}</button>`).join('')}
    </div>
    <div class="store-grid" id="st-grid-${winId}"></div>
  </div>`;

  document.getElementById(`st-add-custom-${winId}`).onclick=()=>openCustomAppModal();

  const renderGrid=()=>{
    const grid=document.getElementById(`st-grid-${winId}`);
    const source = storeActiveTab==='all'   ? getAllApps()
                 : storeActiveTab==='custom'? getCustomApps()
                 : getAllApps().filter(a=>a.category===storeActiveTab);

    if(!source.length){
      grid.innerHTML=`<div class="empty-state" style="grid-column:1/-1;padding:40px;text-align:center;">
        ${storeActiveTab==='custom'
          ? 'No custom apps yet. Add your own web apps by link.<div style="margin-top:14px;"><button class="mini-btn primary" id="store-add-custom-${winId}">+ Add Custom App</button></div>'
          : 'No apps in this category.'}
      </div>`;
      if(storeActiveTab==='custom'){
        const b=document.getElementById(`store-add-custom-${winId}`);
        if(b)b.onclick=()=>openCustomAppModal();
      }
      return;
    }

    grid.innerHTML=source.map(app=>{
      const installed=isInstalled(app.id);
      const isCore=CORE_APPS.includes(app.id);
      const catLabel=(categories.find(c=>c.id===app.category)||{}).label||app.category;
      const badge = app.isCustom ? '<span class="badge custom">Custom</span>'
                    : isCore ? '<span class="badge core">Core</span>'
                    : '<span class="badge new">'+(installed?'Installed':'Available')+'</span>';
      return `<div class="store-card ${installed?'installed':''} ${isCore?'core':''} ${app.isCustom?'custom':''}">
        ${badge}
        <div class="store-card-head">
          <div class="store-card-icon">${iconHtml(app.icon)}</div>
          <div class="store-card-info">
            <div class="store-card-name">${sanitizeHTML(app.name)}</div>
            <div class="store-card-cat">${sanitizeHTML(catLabel)}</div>
          </div>
        </div>
        <div class="store-card-desc">${sanitizeHTML(app.desc||'')}</div>
        <div class="store-card-actions">
          ${installed?`<button class="mini-btn primary" data-open="${app.id}">Open</button>`:`<button class="mini-btn success" data-install="${app.id}">⬇ Install</button>`}
          ${installed&&!isCore&&!app.isCustom?`<button class="mini-btn danger" data-uninstall="${app.id}">🗑️ Remove</button>`:''}
          ${app.isCustom?`<button class="mini-btn" data-edit-custom-card="${app.id}">✏️ Edit</button><button class="mini-btn danger" data-custom-del="${app.id}">🗑️ Delete</button>`:''}
          ${app.isExternalOS?`<button class="mini-btn" data-newtab="${sanitizeHTML(app.id)}">↗ Tab</button>`:''}
        </div>
      </div>`;
    }).join('');
    grid.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>openApp(b.dataset.open));
    grid.querySelectorAll('[data-install]').forEach(b=>b.onclick=()=>{installApp(b.dataset.install);renderGrid();});
    grid.querySelectorAll('[data-uninstall]').forEach(b=>b.onclick=()=>{uninstallApp(b.dataset.uninstall);renderGrid();});
    grid.querySelectorAll('[data-newtab]').forEach(b=>b.onclick=()=>{const os=EXTERNAL_OS.find(o=>o.id===b.dataset.newtab);if(os)window.open(os.url,'_blank','noopener,noreferrer');});
    grid.querySelectorAll('[data-edit-custom-card]').forEach(b=>b.onclick=()=>openCustomAppModal(b.dataset.editCustomCard));
    grid.querySelectorAll('[data-custom-del]').forEach(b=>b.onclick=()=>deleteCustomApp(b.dataset.customDel));
  };
  body.querySelectorAll('[data-cat]').forEach(t=>t.onclick=()=>{storeActiveTab=t.dataset.cat;body.querySelectorAll('[data-cat]').forEach(x=>x.classList.toggle('active',x.dataset.cat===storeActiveTab));renderGrid();});
  document.getElementById(`st-reinstall-${winId}`).onclick=()=>{if(!confirm('Reinstall all uninstalled apps?'))return;try{localStorage.setItem(INSTALLED_KEY,'[]');}catch(e){}refreshDesktop();refreshStartMenu();refreshLaunchpad();renderGrid();toast('Store','All apps reinstalled.','success',2200);};
  renderGrid();
}

/* ============ Calculator (CSP-safe, no Function()) ============ */
function getCalcHist(){try{const d=JSON.parse(localStorage.getItem(CALC_HISTORY_KEY)||'[]');return Array.isArray(d)?d:[];}catch(e){return[];}}
function saveCalcHist(x){try{localStorage.setItem(CALC_HISTORY_KEY,JSON.stringify(x.slice(0,20)));}catch(e){}}

function safeCalculate(expr){
  let x=String(expr||'').replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-');
  if(!x || !/^[0-9+\-*/%.()\s]+$/.test(x)) throw new Error('Invalid');
  x = x.replace(/\s+/g,'');
  x = x.replace(/(\d+(?:\.\d+)?)%/g,'($1/100)');
  if(/[+\-*/.]$/.test(x)) throw new Error('Incomplete');
  let pos = 0;
  const peek = () => x[pos];
  const eat = (c) => { if(x[pos]===c){ pos++; return true; } return false; };
  function parseExpression(){
    let v = parseTerm();
    while(pos < x.length && (x[pos]==='+' || x[pos]==='-')){
      const op = x[pos++];
      const r = parseTerm();
      v = op==='+' ? v+r : v-r;
    }
    return v;
  }
  function parseTerm(){
    let v = parseFactor();
    while(pos < x.length && (x[pos]==='*' || x[pos]==='/')){
      const op = x[pos++];
      const r = parseFactor();
      if(op==='/'){ if(r===0) throw new Error('Division by zero'); v = v/r; }
      else v = v*r;
    }
    return v;
  }
  function parseFactor(){
    if(peek()==='+'){ pos++; return parseFactor(); }
    if(peek()==='-'){ pos++; return -parseFactor(); }
    if(eat('(')){
      const v = parseExpression();
      if(!eat(')')) throw new Error('Missing )');
      return v;
    }
    const start = pos;
    while(pos<x.length && /[0-9.]/.test(x[pos])) pos++;
    if(start===pos) throw new Error('Unexpected');
    const num = parseFloat(x.slice(start,pos));
    if(!isFinite(num)) throw new Error('Bad number');
    return num;
  }
  const r = parseExpression();
  if(pos !== x.length) throw new Error('Incomplete');
  if(!Number.isFinite(r)) throw new Error('Math');
  return Number(r.toPrecision(12));
}

function renderCalculator(body,winId){
  const isNarrow = window.innerWidth <= 700;
  body.innerHTML=`<div style="display:flex;flex-direction:${isNarrow?'column':'row'};flex:1;min-height:0;gap:12px;padding:14px;">
    <div style="flex:1;display:flex;flex-direction:column;gap:10px;min-height:0;">
      <div style="background:rgba(0,0,0,.42);border:1px solid var(--glass-border);border-radius:12px;padding:14px;min-height:86px;display:flex;flex-direction:column;justify-content:center;align-items:flex-end;">
        <div id="ce-${winId}" style="width:100%;color:var(--text-muted);font-size:12px;text-align:right;min-height:18px;overflow:hidden;"></div>
        <div id="cr-${winId}" style="width:100%;color:#fff;font-size:30px;font-weight:700;text-align:right;overflow:hidden;">0</div>
      </div>
      <div id="cg-${winId}" style="display:grid;grid-template-columns:repeat(4,1fr);gap:7px;flex:1;">
        ${['AC,clear','⌫,backspace','%,%','÷,/','7,7','8,8','9,9','×,*','4,4','5,5','6,6','−,-','1,1','2,2','3,3','+,+','±,sign','0,0','.,.','=,='].map(x=>{const[l,a]=x.split(',');return`<button data-calc="${a}" style="border:1px solid var(--glass-border);border-radius:9px;background:rgba(255,255,255,.07);color:#fff;font-size:16px;cursor:pointer;min-height:52px;touch-action:manipulation;">${l}</button>`;}).join('')}
      </div>
    </div>
    <aside style="width:${isNarrow?'100%':'180px'};display:flex;flex-direction:column;gap:8px;background:rgba(0,0,0,.2);border:1px solid var(--glass-border);border-radius:12px;padding:10px;max-height:${isNarrow?'200px':'none'};">
      <div style="display:flex;justify-content:space-between;font-size:12px;font-weight:700;"><span>History</span><button class="mini-btn danger" id="cch-${winId}" style="padding:2px 6px;font-size:10px;">Clear</button></div>
      <div id="chl-${winId}" style="overflow:auto;-webkit-overflow-scrolling:touch;flex:1;display:flex;flex-direction:column;gap:6px;"></div>
    </aside>
  </div>`;
  let expr='',justCalc=false;
  const ee=document.getElementById(`ce-${winId}`),re=document.getElementById(`cr-${winId}`),hl=document.getElementById(`chl-${winId}`);
  const rH=()=>{
    const it=getCalcHist();
    hl.innerHTML=it.length?it.map((x,i)=>`<div data-hi="${i}" style="padding:6px;background:rgba(255,255,255,.04);border:1px solid var(--glass-border);border-radius:6px;cursor:pointer;font-size:11px;"><div style="color:var(--text-muted);font-size:10px;">${sanitizeHTML(x.expression)}</div><div style="color:#fff;font-weight:700;margin-top:2px;">= ${sanitizeHTML(String(x.result))}</div></div>`).join(''):'<div class="empty-state" style="font-size:11px;">No calculations.</div>';
    hl.querySelectorAll('[data-hi]').forEach(el=>el.onclick=()=>{const h=getCalcHist()[+el.dataset.hi];if(!h)return;expr=String(h.result);justCalc=true;ee.textContent=h.expression+' =';re.textContent=h.result;});
  };
  const uD=()=>{ee.textContent=expr||'';if(!expr)re.textContent='0';else{try{re.textContent=String(safeCalculate(expr));}catch(e){re.textContent=expr.trim()||'0';}}};
  const addH=(e,r)=>{const it=getCalcHist();it.unshift({expression:e,result:r});saveCalcHist(it);rH();};
  const append=(v)=>{
    if(justCalc&&/[0-9.]/.test(v))expr='';
    justCalc=false;
    if(v==='.'){const cur=expr.split(/[+\-*/]/).pop();if(cur.includes('.'))return;if(!cur||cur==='-')expr+='0';}
    if(/^[+\-*/]$/.test(v)){if(!expr){if(v==='-')expr='-';else return;}else if(/[+\-*/]$/.test(expr))expr=expr.slice(0,-1)+v;else expr+=v;}else expr+=v;
    uD();
  };
  const calc=()=>{if(!expr)return;try{const e=expr,r=safeCalculate(e);re.textContent=String(r);ee.textContent=e+' =';addH(e,r);expr=String(r);justCalc=true;}catch(err){re.textContent='Error';ee.textContent=err.message;justCalc=true;}};
  document.getElementById(`cg-${winId}`).onclick=(ev)=>{const b=ev.target.closest('[data-calc]');if(!b)return;const a=b.dataset.calc;if(a==='clear'){expr='';justCalc=false;uD();}else if(a==='backspace'){if(justCalc){expr='';justCalc=false;}else expr=expr.slice(0,-1);uD();}else if(a==='=')calc();else if(a==='sign'){if(!expr){expr='-';uD();return;}if(/^-?\d+(?:\.\d+)?$/.test(expr))expr=expr.startsWith('-')?expr.slice(1):'-'+expr;else try{expr=String(-safeCalculate(expr));}catch(e){}justCalc=false;uD();}else append(a);};
  document.getElementById(`cch-${winId}`).onclick=()=>{if(confirm('Clear calculator history?')){saveCalcHist([]);rH();}};
  const kh=(e)=>{if(!document.getElementById(`body-${winId}`)){document.removeEventListener('keydown',kh);return;}if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA')return;if(e.key>='0'&&e.key<='9')append(e.key);else if(['+','-','*','/','.','%'].includes(e.key))append(e.key);else if(e.key==='Enter'||e.key==='='){e.preventDefault();calc();}else if(e.key==='Backspace'){e.preventDefault();append('backspace');}};
  document.addEventListener('keydown',kh);
  rH();uD();
}

/* ============ Image Viewer ============ */
function renderImageViewer(body,winId,meta){
  const imgs=[];
  ['pictures','downloads','home', 'documents'].forEach(f=>Object.keys(VFS[f]||{}).forEach(n=>{
    const content = VFS[f][n];
    if (typeof content === 'string' && content.startsWith('data:image/')) {
        imgs.push({folder:f,name:n});
    } else if (/\.(png|jpe?g|gif|webp|svg|bmp|tiff|tif|heic|ico|psd|ai|xcf|raw|dng|eps)$/i.test(n)) {
        imgs.push({folder:f,name:n});
    }
  }));
  
  body.innerHTML=`<div style="display:flex;flex-direction:column;flex:1;min-height:0;background:#050505;">
    <div class="iv-toolbar">
      <button class="mini-btn" id="iv-open-${winId}">📁 Open</button>
      <select id="iv-sel-${winId}" class="mini-btn" style="max-width:160px;">
        <option value="">VFS…</option>
        ${imgs.map(i=>`<option value="${i.folder}/${i.name}">${i.name}</option>`).join('')}
      </select>
      <button class="mini-btn" id="iv-zi-${winId}">＋</button>
      <button class="mini-btn" id="iv-zo-${winId}">－</button>
      <button class="mini-btn" id="iv-rot-${winId}">↻</button>
      <button class="mini-btn" id="iv-reset-${winId}">Reset</button>
    </div>
    <div class="iv-viewport" id="iv-vp-${winId}"><div class="iv-empty">Open an image or pick one from the list.</div></div>
  </div>`;
  const vp=document.getElementById(`iv-vp-${winId}`);
  let scale=1,rot=0;
  const setImg=(src)=>{
    vp.innerHTML=`<img class="iv-img" src="${src}" draggable="false" alt="Image">`;
    const img=vp.querySelector('img');
    const apply=()=>img.style.transform=`scale(${scale}) rotate(${rot}deg)`;
    document.getElementById(`iv-zi-${winId}`).onclick=()=>{scale=Math.min(6,scale+.2);apply();};
    document.getElementById(`iv-zo-${winId}`).onclick=()=>{scale=Math.max(.2,scale-.2);apply();};
    document.getElementById(`iv-rot-${winId}`).onclick=()=>{rot=(rot+90)%360;apply();};
    document.getElementById(`iv-reset-${winId}`).onclick=()=>{scale=1;rot=0;apply();};
    let pinch=null;
    vp.addEventListener('touchstart',(e)=>{
      if(e.touches.length===2){
        const dx=e.touches[0].clientX-e.touches[1].clientX;
        const dy=e.touches[0].clientY-e.touches[1].clientY;
        pinch={dist:Math.hypot(dx,dy),scale};
      }
    },{passive:true});
    vp.addEventListener('touchmove',(e)=>{
      if(e.touches.length===2&&pinch){
        e.preventDefault();
        const dx=e.touches[0].clientX-e.touches[1].clientX;
        const dy=e.touches[0].clientY-e.touches[1].clientY;
        const d=Math.hypot(dx,dy);
        scale=Math.max(.2,Math.min(6,pinch.scale*(d/pinch.dist)));
        apply();
      }
    },{passive:false});
    vp.addEventListener('touchend',()=>pinch=null);
  };
  
  document.getElementById(`iv-open-${winId}`).onclick=()=>{
    const i=document.createElement('input');i.type='file';i.accept='image/*';
    i.onchange=(e)=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>setImg(ev.target.result);r.readAsDataURL(f);};
    i.click();
  };
  
  const sel = document.getElementById(`iv-sel-${winId}`);
  sel.onchange=(e)=>{
    if(!e.target.value)return;
    const[f,n]=e.target.value.split('/');
    const c=VFS[f]?.[n];if(c)setImg(c);
  };

  if (meta && meta.file && meta.folder) {
    const c = VFS[meta.folder]?.[meta.file];
    if (c) {
      setImg(c);
      sel.value = `${meta.folder}/${meta.file}`;
    }
  }
}

/* ============ Trash ============ */
function getTrash(){try{const t=JSON.parse(localStorage.getItem(TRASH_KEY)||'[]');return Array.isArray(t)?t:[];}catch(e){return[];}}
function saveTrash(t){try{localStorage.setItem(TRASH_KEY,JSON.stringify(t));}catch(e){}}
function moveToTrash(name, folder) {
  if (folder === 'system') { toast('Protected', 'System files cannot be deleted.', 'warn', 2000); return false; }
  const content = VFS[folder][name];
  const trash = getTrash();
  const trashItem = { name, folder, content, time: Date.now() };
  trash.unshift(trashItem);
  saveTrash(trash);
  delete VFS[folder][name];
  saveUserVFS();
  toast('Moved to Trash', `"${name}" — 5s to undo`, 'info', 5000, '↩ Undo', () => {
    const t = getTrash();
    const idx = t.findIndex(x => x.time === trashItem.time && x.name === name);
    if (idx >= 0) {
      t.splice(idx, 1);
      saveTrash(t);
      VFS[folder] = VFS[folder] || {};
      let finalName = name, n = 2;
      while (VFS[folder][finalName] !== undefined) {
        finalName = name.replace(/(\.[^.]+)?$/, ` (${n})$1`);
        n++;
      }
      VFS[folder][finalName] = content;
      saveUserVFS();
      toast('Restored', `"${finalName}" back to ${folder}/`, 'success', 2000);
    }
  });
  return true;
}
function renderTrash(body,winId){
  const render=()=>{
    const items=getTrash();
    body.innerHTML=`<div style="padding:14px;display:flex;flex-direction:column;flex:1;min-height:0;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;gap:10px;flex-wrap:wrap;">
        <div><div style="font-size:18px;font-weight:700;">🗑️ Trash</div><div class="setting-subtext">${items.length} item${items.length===1?'':'s'} · Auto-purges after 30 days</div></div>
        <button class="mini-btn danger" id="tr-empty-${winId}">Empty Trash</button>
      </div>
      <div style="flex:1;overflow:auto;-webkit-overflow-scrolling:touch;display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;">
        ${items.length?items.map((it,i)=>`<div style="display:flex;align-items:center;gap:8px;padding:10px;border:1px solid var(--glass-border);border-radius:8px;background:rgba(255,255,255,.035);">
          <div style="font-size:22px;">${fileIcon(it.name)}</div>
          <div style="flex:1;min-width:0;">
            <div style="font-weight:600;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${sanitizeHTML(it.name)}</div>
            <div style="font-size:10px;color:var(--text-muted);">from ${sanitizeHTML(it.folder)} · ${new Date(it.time).toLocaleDateString()}</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:3px;">
            <button class="mini-btn" data-restore="${i}" style="padding:4px 8px;font-size:10px;">Restore</button>
            <button class="mini-btn danger" data-del="${i}" style="padding:4px 8px;font-size:10px;">✕</button>
          </div>
        </div>`).join(''):'<div class="empty-state" style="grid-column:1/-1;">Trash is empty.</div>'}
      </div>
    </div>`;
    document.getElementById(`tr-empty-${winId}`).onclick=()=>{if(confirm('Empty trash permanently? This cannot be undone.')){saveTrash([]);render();toast('Trash','Emptied.','success',2000);}};
    body.querySelectorAll('[data-restore]').forEach(b=>b.onclick=()=>{
      const idx=+b.dataset.restore,it=getTrash()[idx];if(!it)return;
      if(!VFS[it.folder])VFS[it.folder]={};
      let name=it.name,n=2;
      while(VFS[it.folder][name]!==undefined){name=it.name.replace(/(\.[^.]+)?$/,` (${n})$1`);n++;}
      VFS[it.folder][name]=it.content;
      saveUserVFS();
      const l=getTrash();l.splice(idx,1);saveTrash(l);render();
      toast('Restored',`"${name}"`,'success',2000);
    });
    body.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{const idx=+b.dataset.del,l=getTrash();l.splice(idx,1);saveTrash(l);render();});
  };
  render();
}

/* ============ Clipboard ============ */
function renderClipboard(body,winId){
  const render=()=>{
    const items=getClipboardList();
    body.innerHTML=`<div style="display:flex;flex-direction:column;flex:1;min-height:0;">
      <div style="padding:12px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--glass-border);gap:8px;">
        <div><div style="font-size:18px;font-weight:700;">📋 Clipboard</div><div class="setting-subtext">Last 30 items</div></div>
        <button class="mini-btn danger" id="cl-clear-${winId}">Clear</button>
      </div>
      <div style="flex:1;overflow:auto;-webkit-overflow-scrolling:touch;padding:12px;display:flex;flex-direction:column;gap:6px;">
        ${items.length?items.map((it,i)=>`<div data-idx="${i}" style="padding:10px;background:rgba(0,0,0,.25);border:1px solid var(--glass-border);border-radius:8px;cursor:pointer;font-size:12px;word-break:break-all;">
          <div>${sanitizeHTML(it.text.length>200?it.text.slice(0,200)+'…':it.text)}</div>
          <div style="font-size:10px;color:var(--text-muted);margin-top:3px;">${new Date(it.time).toLocaleString()}</div>
        </div>`).join(''):'<div class="empty-state">Nothing copied yet.</div>'}
      </div>
    </div>`;
    document.getElementById(`cl-clear-${winId}`).onclick=()=>{if(confirm('Clear clipboard history?')){localStorage.removeItem(CLIPBOARD_KEY);render();}};
    body.querySelectorAll('[data-idx]').forEach(el=>el.onclick=async()=>{
      const it=getClipboardList()[+el.dataset.idx];
      try{await navigator.clipboard.writeText(it.text);toast('Copied','','success',1500);}catch(e){}
    });
  };
  render();
}

/* ============ Password Gen ============ */
function renderPasswordGen(body,winId){
  body.innerHTML=`<div class="app-pad">
    <h3>🔑 Password Generator</h3>
    <div class="output-box" id="pw-out-${winId}" style="font-size:16px;min-height:60px;word-break:break-all;">Click Generate</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
      <div><label>Length: <span id="pw-len-${winId}" style="color:var(--aura-cyan);">20</span></label><input type="range" id="pw-len-r-${winId}" min="4" max="64" value="20" style="width:100%;"></div>
      <div><label>Strength: <span id="pw-str-${winId}" style="color:var(--aura-cyan);">—</span></label></div>
    </div>
    <div style="display:flex;flex-direction:column;gap:6px;">
      <label><input type="checkbox" id="pw-u-${winId}" checked> Uppercase</label>
      <label><input type="checkbox" id="pw-l-${winId}" checked> Lowercase</label>
      <label><input type="checkbox" id="pw-d-${winId}" checked> Digits</label>
      <label><input type="checkbox" id="pw-s-${winId}" checked> Symbols</label>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;">
      <button class="mini-btn primary" id="pw-gen-${winId}" style="flex:1;padding:12px;">Generate</button>
      <button class="mini-btn" id="pw-copy-${winId}" style="padding:12px;">Copy</button>
    </div>
  </div>`;
  const out=document.getElementById(`pw-out-${winId}`),lenR=document.getElementById(`pw-len-r-${winId}`),lenV=document.getElementById(`pw-len-${winId}`),strEl=document.getElementById(`pw-str-${winId}`);
  lenR.oninput=()=>lenV.textContent=lenR.value;
  const gen=()=>{
    const len=+lenR.value;
    const u=document.getElementById(`pw-u-${winId}`).checked,l=document.getElementById(`pw-l-${winId}`).checked,d=document.getElementById(`pw-d-${winId}`).checked,s=document.getElementById(`pw-s-${winId}`).checked;
    let chars='';if(u)chars+='ABCDEFGHIJKLMNOPQRSTUVWXYZ';if(l)chars+='abcdefghijklmnopqrstuvwxyz';if(d)chars+='0123456789';if(s)chars+='!@#$%^&*()_+-=[]{}|;:,.<>?';
    if(!chars){toast('Password','Select at least one set.','warn',2000);return;}
    let pw='';const arr=new Uint32Array(len);crypto.getRandomValues(arr);for(let i=0;i<len;i++)pw+=chars[arr[i]%chars.length];
    out.textContent=pw;
    const bits=len*Math.log2(chars.length);
    strEl.textContent=bits>128?'Excellent':bits>80?'Strong':bits>60?'Good':bits>40?'Fair':'Weak';
    sfx.success();
  };
  document.getElementById(`pw-gen-${winId}`).onclick=gen;
  document.getElementById(`pw-copy-${winId}`).onclick=async()=>{try{await navigator.clipboard.writeText(out.textContent);addClipboardItem(out.textContent);toast('Copied','','success',1500);}catch(e){}};
  gen();
}

/* ============ Unit Converter ============ */
const UNITS={length:{Meters:1,Kilometers:1000,Miles:1609.344,Feet:.3048,Inches:.0254,Yards:.9144,Centimeters:.01},mass:{Kilograms:1,Grams:.001,Pounds:.453592,Ounces:.0283495,Tons:1000},temperature:{Celsius:'c',Fahrenheit:'f',Kelvin:'k'},time:{Seconds:1,Minutes:60,Hours:3600,Days:86400,Weeks:604800},area:{'Square meters':1,'Square feet':.092903,Acres:4046.86,Hectares:10000}};
function convert(cat,f,t,v){
  if(cat==='temperature'){let c=v;if(f==='Fahrenheit')c=(v-32)*5/9;else if(f==='Kelvin')c=v-273.15;if(t==='Fahrenheit')return c*9/5+32;if(t==='Kelvin')return c+273.15;return c;}
  return v*UNITS[cat][f]/UNITS[cat][t];
}
function renderConverter(body,winId){
  body.innerHTML=`<div class="app-pad">
    <h3>📐 Unit Converter</h3>
    <div><label>Category</label><select id="uc-cat-${winId}">${Object.keys(UNITS).map(k=>`<option value="${k}">${k.charAt(0).toUpperCase()+k.slice(1)}</option>`).join('')}</select></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
      <div><label>From</label><select id="uc-from-${winId}"></select></div>
      <div><label>To</label><select id="uc-to-${winId}"></select></div>
    </div>
    <div><label>Value</label><input type="number" id="uc-val-${winId}" value="1" step="any" inputmode="decimal"></div>
    <div class="result-display" id="uc-out-${winId}">1</div>
  </div>`;
  const cat=document.getElementById(`uc-cat-${winId}`),from=document.getElementById(`uc-from-${winId}`),to=document.getElementById(`uc-to-${winId}`),val=document.getElementById(`uc-val-${winId}`),out=document.getElementById(`uc-out-${winId}`);
  const updU=()=>{
    const u=Object.keys(UNITS[cat.value]);
    from.innerHTML=u.map(x=>`<option>${x}</option>`).join('');
    to.innerHTML=u.map((x,i)=>`<option ${i===1?'selected':''}>${x}</option>`).join('');
    cnv();
  };
  const cnv=()=>{try{const r=convert(cat.value,from.value,to.value,parseFloat(val.value)||0);out.textContent=(Math.round(r*1000000)/1000000).toString();}catch(e){out.textContent='—';}};
  cat.onchange=updU;from.onchange=cnv;to.onchange=cnv;val.oninput=cnv;updU();
}

/* ============ Color Picker ============ */
function renderColorPicker(body,winId){
  body.innerHTML=`<div class="app-pad">
    <h3>🎨 Color Picker</h3>
    <div id="cp-pv-${winId}" style="height:80px;border-radius:10px;border:1px solid var(--glass-border);display:flex;align-items:flex-end;padding:10px;font-family:ui-monospace,monospace;font-size:13px;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.9);background:#6366f1;">#6366F1</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
      <div><label>Hex</label><input type="text" id="cp-hex-${winId}" value="#6366f1" autocapitalize="off" autocorrect="off" spellcheck="false"></div>
      <div><label>RGB</label><input type="text" id="cp-rgb-${winId}" readonly></div>
      <div><label>HSL</label><input type="text" id="cp-hsl-${winId}" readonly></div>
      <div><label>Pick</label><input type="color" id="cp-pick-${winId}" value="#6366f1" style="width:100%;height:40px;border:1px solid var(--glass-border);border-radius:8px;background:rgba(0,0,0,.25);cursor:pointer;"></div>
    </div>
    <div><label>Palette</label><div id="cp-pal-${winId}" style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-top:8px;"></div></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;"><button class="mini-btn" id="cp-copy-${winId}">📋 Copy</button><button class="mini-btn" id="cp-wall-${winId}">🖼️ Use as Accent</button></div>
  </div>`;
  const hex=document.getElementById(`cp-hex-${winId}`),rgb=document.getElementById(`cp-rgb-${winId}`),hsl=document.getElementById(`cp-hsl-${winId}`),pv=document.getElementById(`cp-pv-${winId}`),pick=document.getElementById(`cp-pick-${winId}`),pal=document.getElementById(`cp-pal-${winId}`);
  const h2r=(h)=>{const m=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h);return m?{r:parseInt(m[1],16),g:parseInt(m[2],16),b:parseInt(m[3],16)}:null;};
  const r2h=(r,g,b)=>{r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let h=0,s=0,l=(mx+mn)/2;if(mx!==mn){const d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);switch(mx){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;case b:h=(r-g)/d+4;}h/=6;}return[Math.round(h*360),Math.round(s*100),Math.round(l*100)];};
  const hslToHex=(h,s,l)=>{l/=100;s/=100;const k=n=>(n+h/30)%12;const a=s*Math.min(l,1-l);const f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));const th=x=>Math.round(x*255).toString(16).padStart(2,'0');return`#${th(f(0))}${th(f(8))}${th(f(4))}`;};
  const upd=(h)=>{
    if(!/^#?[0-9a-f]{6}$/i.test(h))return;h='#'+h.replace('#','').toLowerCase();
    const c=h2r(h);if(!c)return;
    rgb.value=`${c.r}, ${c.g}, ${c.b}`;
    const[hh,ss,ll]=r2h(c.r,c.g,c.b);hsl.value=`${hh}°, ${ss}%, ${ll}%`;
    pv.style.background=h;pv.textContent=h.toUpperCase();pick.value=h;hex.value=h;
    const sw=[];for(let i=0;i<5;i++){const shift=(i-2)*30;const[h2,s2,l2]=r2h(c.r,c.g,c.b);const nh=((h2+shift)%360+360)%360;const nl=Math.max(15,Math.min(85,l2+(i-2)*8));sw.push(hslToHex(nh,s2,nl));}
    pal.innerHTML=sw.map(s=>`<div data-c="${s}" style="background:${s};aspect-ratio:1;border-radius:8px;border:1px solid var(--glass-border);cursor:pointer;" title="${s}"></div>`).join('');
    pal.querySelectorAll('[data-c]').forEach(el=>el.onclick=()=>upd(el.dataset.c));
  };
  hex.oninput=()=>upd(hex.value);pick.oninput=()=>upd(pick.value);
  document.getElementById(`cp-copy-${winId}`).onclick=async()=>{try{await navigator.clipboard.writeText(hex.value);addClipboardItem(hex.value);toast('Copied',hex.value,'success',1500);}catch(e){}};
  document.getElementById(`cp-wall-${winId}`).onclick=()=>{const c=hex.value;saveThemeSettings({accent:c,accentHover:c,glow:hexToRgba(c,.4),glassOpacity:.75});toast('Accent',`Applied ${c}`,'success',2000);};
  upd('#6366f1');
}

/* ============ Markdown ============ */
function mdToHtml(md){
  let h=sanitizeHTML(md);
  h=h.replace(/```([\s\S]*?)```/g,(_,c)=>`<pre style="background:rgba(0,0,0,.5);padding:10px;border-radius:8px;overflow:auto;"><code>${c.trim()}</code></pre>`);
  h=h.replace(/^### (.+)$/gm,'<h3>$1</h3>');
  h=h.replace(/^## (.+)$/gm,'<h2>$1</h2>');
  h=h.replace(/^# (.+)$/gm,'<h1 style="font-size:22px;margin:14px 0 8px;border-bottom:1px solid var(--glass-border);padding-bottom:6px;">$1</h1>');
  h=h.replace(/^> (.+)$/gm,'<blockquote style="border-left:3px solid var(--aura-cyan);padding-left:12px;color:var(--text-muted);margin:8px 0;">$1</blockquote>');
  h=h.replace(/\*\*(.+?)\*\*/g,'<b>$1</b>');
  h=h.replace(/\*(.+?)\*/g,'<i>$1</i>');
  h=h.replace(/`(.+?)`/g,'<code style="background:rgba(0,0,0,.4);padding:2px 5px;border-radius:4px;">$1</code>');
  h=h.replace(/\[(.+?)\]\((.+?)\)/g,'<a href="$2" target="_blank" rel="noopener" style="color:var(--aura-cyan);">$1</a>');
  h=h.replace(/^\- (.+)$/gm,'<li>$1</li>');
  h=h.replace(/(<li>[\s\S]*?<\/li>)/g,'<ul style="margin:8px 0 8px 20px;">$1</ul>');
  h=h.split(/\n\n+/).map(p=>/^<(h\d|ul|pre|blockquote)/.test(p.trim())?p:`<p>${p.replace(/\n/g,'<br>')}</p>`).join('');
  return h;
}
function renderMarkdown(body,winId){
  const draft=localStorage.getItem(MD_KEY)||'# Markdown Editor\n\nWrite **markdown** on the left, see live preview on the right.\n\n- Lists\n- **Bold** and *italic*\n- `code` and [links](https://example.com)\n\n> Save drafts with the button.';
  const narrow = window.innerWidth <= 700;
  body.innerHTML=`<div style="display:flex;flex-direction:column;flex:1;min-height:0;">
    <div style="padding:6px;background:rgba(0,0,0,.2);border-bottom:1px solid var(--glass-border);display:flex;gap:8px;flex-shrink:0;flex-wrap:wrap;">
      <button class="mini-btn primary" id="md-save-${winId}">💾 Save Draft</button>
      <button class="mini-btn" id="md-exp-${winId}">⬇ Export HTML</button>
    </div>
    <div style="display:flex;flex-direction:${narrow?'column':'row'};flex:1;min-height:0;">
      <textarea id="md-in-${winId}" spellcheck="false" autocapitalize="off" autocorrect="off" style="flex:1;background:transparent;border:none;color:#fff;padding:12px;outline:none;resize:none;font-family:ui-monospace,monospace;font-size:13px;min-height:120px;"></textarea>
      <div id="md-pv-${winId}" style="flex:1;overflow:auto;-webkit-overflow-scrolling:touch;padding:14px 18px;font-size:13px;line-height:1.6;border-${narrow?'top':'left'}:1px solid var(--glass-border);"></div>
    </div>
  </div>`;
  const input=document.getElementById(`md-in-${winId}`),preview=document.getElementById(`md-pv-${winId}`);
  input.value=draft;
  const upd=()=>{preview.innerHTML=mdToHtml(input.value);};
  input.oninput=upd;upd();
  document.getElementById(`md-save-${winId}`).onclick=()=>{localStorage.setItem(MD_KEY,input.value);toast('Markdown','Draft saved.','success',2000);};
  document.getElementById(`md-exp-${winId}`).onclick=()=>{
    const html=`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Export</title><style>body{font-family:system-ui;max-width:720px;margin:40px auto;padding:0 20px;line-height:1.6;}</style></head><body>${mdToHtml(input.value)}</body></html>`;
    const b=new Blob([html],{type:'text/html'});const u=URL.createObjectURL(b);
    const a=document.createElement('a');a.href=u;a.download='markdown-export.html';a.click();
    setTimeout(()=>URL.revokeObjectURL(u),1000);
    toast('Markdown','Exported.','success',2000);
  };
}

/* ============ Kanban ============ */
function getKanban(){try{const k=JSON.parse(localStorage.getItem(KANBAN_KEY)||'null');if(k)return k;}catch(e){}return{todo:[],doing:[],done:[]};}
function saveKanban(k){try{localStorage.setItem(KANBAN_KEY,JSON.stringify(k));}catch(e){}}
function renderKanban(body,winId){
  const render=()=>{
    const k=getKanban();
    const cols=[{id:'todo',name:'To Do'},{id:'doing',name:'Doing'},{id:'done',name:'Done'}];
    body.innerHTML=`<div class="kanban-wrap">
      ${cols.map(c=>`<div class="kanban-col" data-col="${c.id}">
        <h4>${c.name} <span style="color:var(--text-muted);">(${(k[c.id]||[]).length})</span></h4>
        <div class="kanban-cards" data-col="${c.id}">${(k[c.id]||[]).map((card,i)=>`<div class="kanban-card" draggable="true" data-col="${c.id}" data-idx="${i}">${sanitizeHTML(card)}<span class="del" data-del="${c.id}:${i}">✕</span></div>`).join('')}</div>
        <div style="display:flex;gap:4px;margin-top:6px;"><input type="text" placeholder="New card..." data-add="${c.id}" style="flex:1;font-size:12px;padding:8px;background:rgba(0,0,0,.4);border:1px solid var(--glass-border);border-radius:6px;color:#fff;outline:none;"><button class="mini-btn" data-addbtn="${c.id}">+</button></div>
      </div>`).join('')}
    </div>`;
    body.querySelectorAll('[data-del]').forEach(el=>el.onclick=(e)=>{e.stopPropagation();const[col,idx]=el.dataset.del.split(':');k[col].splice(+idx,1);saveKanban(k);render();});
    body.querySelectorAll('[data-addbtn]').forEach(b=>b.onclick=()=>{const col=b.dataset.addbtn;const inp=body.querySelector(`[data-add="${col}"]`);const v=inp.value.trim();if(!v)return;k[col]=k[col]||[];k[col].push(v);saveKanban(k);render();});
    body.querySelectorAll('[data-add]').forEach(inp=>inp.onkeydown=(e)=>{if(e.key==='Enter'){const col=inp.dataset.add;const v=inp.value.trim();if(!v)return;k[col]=k[col]||[];k[col].push(v);saveKanban(k);render();}});
    if (IS_TOUCH) {
      body.querySelectorAll('.kanban-card').forEach(card=>{
        card.addEventListener('pointerdown', (e)=>{
          if (e.pointerType === 'mouse') return;
          if (e.target.closest('.del')) return;
          const startX = e.clientX, startY = e.clientY;
          let ghost = null, activated = false;
          const col = card.dataset.col, idx = +card.dataset.idx;
          const move = (ev) => {
            const dx = ev.clientX - startX, dy = ev.clientY - startY;
            if (!activated && Math.hypot(dx, dy) > 8) {
              activated = true;
              ghost = card.cloneNode(true);
              ghost.classList.add('dragging-touch');
              const r = card.getBoundingClientRect();
              ghost.style.width = r.width + 'px';
              ghost.style.left = r.left + 'px';
              ghost.style.top = r.top + 'px';
              document.body.appendChild(ghost);
              card.style.opacity = '.3';
            }
            if (activated && ghost) {
              ev.preventDefault();
              ghost.style.left = (ev.clientX - 40) + 'px';
              ghost.style.top = (ev.clientY - 20) + 'px';
            }
          };
          const up = (ev) => {
            document.removeEventListener('pointermove', move);
            document.removeEventListener('pointerup', up);
            document.removeEventListener('pointercancel', up);
            if (!activated) return;
            if (ghost) ghost.remove();
            card.style.opacity = '';
            const el = document.elementFromPoint(ev.clientX, ev.clientY);
            const colEl = el && el.closest('.kanban-col');
            if (colEl) {
              const targetCol = colEl.dataset.col;
              if (targetCol && targetCol !== col) {
                const list = k[col]; const [moved] = list.splice(idx, 1);
                k[targetCol] = k[targetCol] || []; k[targetCol].push(moved);
                saveKanban(k); render();
              }
            }
          };
          document.addEventListener('pointermove', move, { passive: false });
          document.addEventListener('pointerup', up);
          document.addEventListener('pointercancel', up);
        });
      });
    }
    body.querySelectorAll('.kanban-card').forEach(card=>{
      card.ondragstart=(e)=>{e.dataTransfer.setData('application/json',JSON.stringify({col:card.dataset.col,idx:+card.dataset.idx}));card.classList.add('dragging');};
      card.ondragend=()=>card.classList.remove('dragging');
    });
    body.querySelectorAll('.kanban-col').forEach(c=>{
      c.ondragover=(e)=>e.preventDefault();
      c.ondrop=(e)=>{
        e.preventDefault();
        try{const d=JSON.parse(e.dataTransfer.getData('application/json'));const t=c.dataset.col;const list=k[d.col];const[moved]=list.splice(d.idx,1);k[t]=k[t]||[];k[t].push(moved);saveKanban(k);render();}catch(err){}
      };
    });
  };
  render();
}

/* ============ Dev Tools ============ */
function renderJSONTools(body,winId){
  body.innerHTML=`<div class="app-pad">
    <h3>JSON Tools</h3>
    <div style="display:flex;gap:6px;flex-wrap:wrap;">
      <button class="mini-btn primary" id="js-f-${winId}">Format</button>
      <button class="mini-btn" id="js-m-${winId}">Minify</button>
      <button class="mini-btn" id="js-c-${winId}">Copy</button>
    </div>
    <textarea id="js-i-${winId}" placeholder='{"hello":"world"}' autocapitalize="off" autocorrect="off" spellcheck="false" style="min-height:120px;"></textarea>
    <div class="output-box" id="js-o-${winId}" style="max-height:220px;overflow:auto;"></div>
  </div>`;
  const inp=document.getElementById(`js-i-${winId}`),out=document.getElementById(`js-o-${winId}`);
  document.getElementById(`js-f-${winId}`).onclick=()=>{try{out.textContent=JSON.stringify(JSON.parse(inp.value),null,2);}catch(e){out.textContent='Error: '+e.message;}};
  document.getElementById(`js-m-${winId}`).onclick=()=>{try{out.textContent=JSON.stringify(JSON.parse(inp.value));}catch(e){out.textContent='Error: '+e.message;}};
  document.getElementById(`js-c-${winId}`).onclick=async()=>{try{await navigator.clipboard.writeText(out.textContent);toast('Copied','','success',1500);}catch(e){}};
}
function renderBase64(body,winId){
  body.innerHTML=`<div class="app-pad">
    <h3>Base64</h3>
    <div style="display:flex;gap:6px;flex-wrap:wrap;">
      <button class="mini-btn primary" id="b-e-${winId}">Encode →</button>
      <button class="mini-btn" id="b-d-${winId}">← Decode</button>
      <button class="mini-btn" id="b-c-${winId}">Copy</button>
    </div>
    <label>Input</label><textarea id="b-a-${winId}" autocapitalize="off" autocorrect="off" spellcheck="false" style="min-height:90px;"></textarea>
    <label>Output</label><textarea id="b-b-${winId}" style="min-height:90px;color:#67e8f9;"></textarea>
  </div>`;
  const a=document.getElementById(`b-a-${winId}`),b=document.getElementById(`b-b-${winId}`);
  document.getElementById(`b-e-${winId}`).onclick=()=>{try{b.value=btoa(unescape(encodeURIComponent(a.value)));}catch(e){toast('Base64','Encode failed.','error',2000);}};
  document.getElementById(`b-d-${winId}`).onclick=()=>{try{a.value=decodeURIComponent(escape(atob(b.value.trim())));b.value=a.value;}catch(e){toast('Base64','Invalid base64.','error',2000);}};
  document.getElementById(`b-c-${winId}`).onclick=async()=>{try{await navigator.clipboard.writeText(b.value);toast('Copied','','success',1500);}catch(e){}};
}
function renderUUID(body,winId){
  body.innerHTML=`<div class="app-pad">
    <h3>UUID Generator</h3>
    <div><label>Count</label><input type="number" id="uu-n-${winId}" value="5" min="1" max="100" style="width:80px;"></div>
    <div style="display:flex;gap:6px;"><button class="mini-btn primary" id="uu-g-${winId}">Generate</button><button class="mini-btn" id="uu-c-${winId}">Copy All</button></div>
    <div class="output-box" id="uu-o-${winId}" style="white-space:pre;max-height:300px;overflow:auto;"></div>
  </div>`;
  const out=document.getElementById(`uu-o-${winId}`);
  const gen=()=>{
    const n=Math.min(100,Math.max(1,+document.getElementById(`uu-n-${winId}`).value||1));
    const arr=[];for(let i=0;i<n;i++)arr.push(crypto.randomUUID());
    out.textContent=arr.join('\n');
  };
  document.getElementById(`uu-g-${winId}`).onclick=gen;
  document.getElementById(`uu-c-${winId}`).onclick=async()=>{try{await navigator.clipboard.writeText(out.textContent);toast('Copied','','success',1500);}catch(e){}};
  gen();
}
function renderTimestamp(body,winId){
  body.innerHTML=`<div class="app-pad">
    <h3>Timestamp Converter</h3>
    <div class="result-display" id="ts-now-${winId}" style="font-size:20px;padding:12px;background:rgba(0,0,0,.3);border:1px solid var(--glass-border);border-radius:10px;"></div>
    <div><label>Unix or Date</label><input type="text" id="ts-in-${winId}" placeholder="1700000000 or 2024-01-01" autocapitalize="off" autocorrect="off" spellcheck="false"></div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;">
      <button class="mini-btn primary" id="ts-t-${winId}">Convert</button>
      <button class="mini-btn" id="ts-n-${winId}">Use Now</button>
    </div>
    <div class="output-box" id="ts-o-${winId}"></div>
  </div>`;
  const upd=()=>document.getElementById(`ts-now-${winId}`).textContent=`${Math.floor(Date.now()/1000)} · ${new Date().toISOString()}`;
  upd();setInterval(()=>{if(document.getElementById(`ts-now-${winId}`))upd();},1000);
  document.getElementById(`ts-t-${winId}`).onclick=()=>{
    const v=document.getElementById(`ts-in-${winId}`).value.trim(),o=document.getElementById(`ts-o-${winId}`);
    if(!v)return;
    if(/^\d+$/.test(v)){const d=new Date(+v*1000);o.textContent=`Unix: ${v}\nUTC: ${d.toUTCString()}\nLocal: ${d.toLocaleString()}\nISO: ${d.toISOString()}`;}
    else{const d=new Date(v);if(isNaN(d))return o.textContent='Invalid date.';o.textContent=`Unix: ${Math.floor(d.getTime()/1000)}\nUTC: ${d.toUTCString()}\nLocal: ${d.toLocaleString()}\nISO: ${d.toISOString()}`;}
  };
  document.getElementById(`ts-n-${winId}`).onclick=()=>{document.getElementById(`ts-in-${winId}`).value=String(Math.floor(Date.now()/1000));};
}

/* ============ Weather app ============ */
function renderWeatherApp(body,winId){
  const cached=getCachedWeather();
  const render=(data)=>{
    if(!data?.current){
      body.innerHTML=`<div class="app-pad" style="text-align:center;">
        <div style="font-size:48px;">🌍</div>
        <div>Weather unavailable. Location access may be blocked.</div>
        <button class="mini-btn primary" id="w-r-${winId}" style="margin-top:12px;">Retry</button>
      </div>`;
      const b=document.getElementById(`w-r-${winId}`);
      if(b)b.onclick=()=>{localStorage.removeItem(WEATHER_KEY);initWeather();setTimeout(()=>renderWeatherApp(body,winId),2500);};
      return;
    }
    const[emoji,desc]=weatherCodeInfo(data.current.weather_code);
    const d=data.daily||{};
    body.innerHTML=`<div class="weather-wrap">
      <div class="weather-emoji">${emoji}</div>
      <div class="weather-temp">${Math.round(data.current.temperature_2m)}°C</div>
      <div style="font-size:14px;color:var(--text-muted);">${desc}</div>
      <div class="weather-forecast">
        ${(d.time||[]).slice(0,5).map((t,i)=>{const[em]=weatherCodeInfo(d.weather_code[i]);const dt=new Date(t);return`<div class="weather-day"><div>${dt.toLocaleDateString(undefined,{weekday:'short'})}</div><div style="font-size:20px;margin:4px 0;">${em}</div><b style="font-size:13px;">${Math.round(d.temperature_2m_max[i])}° / ${Math.round(d.temperature_2m_min[i])}°</b></div>`;}).join('')}
      </div>
    </div>`;
  };
  if(cached)render(cached.data);
  else{body.innerHTML='<div class="app-pad">Fetching…</div>';setTimeout(()=>render(getCachedWeather()?.data),2500);}
}

/* ============ 2048 ============ */
const G2048_KEY='aether_g2048_v1';
function render2048(body,winId){
  let s=JSON.parse(localStorage.getItem(G2048_KEY)||'null')||{grid:[[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],score:0,best:0,over:false};
  const addR=(st)=>{const empty=[];for(let r=0;r<4;r++)for(let c=0;c<4;c++)if(!st.grid[r][c])empty.push([r,c]);if(!empty.length)return;const[r,c]=empty[Math.floor(Math.random()*empty.length)];st.grid[r][c]=Math.random()<.9?2:4;};
  if(s.grid.flat().every(v=>!v)){addR(s);addR(s);}
  const save=()=>{try{localStorage.setItem(G2048_KEY,JSON.stringify(s));}catch(e){}};
  const move=(dir)=>{
    const g=s.grid;
    const slide=(row)=>{let arr=row.filter(v=>v);for(let i=0;i<arr.length-1;i++)if(arr[i]===arr[i+1]){arr[i]*=2;s.score+=arr[i];arr[i+1]=0;}arr=arr.filter(v=>v);while(arr.length<4)arr.push(0);return arr;};
    const b=JSON.stringify(g);
    if(dir==='left')for(let r=0;r<4;r++)g[r]=slide(g[r]);
    if(dir==='right')for(let r=0;r<4;r++)g[r]=slide(g[r].slice().reverse()).reverse();
    if(dir==='up'){for(let c=0;c<4;c++){const col=g.map(r=>r[c]);const sl=slide(col);for(let r=0;r<4;r++)g[r][c]=sl[r];}}
    if(dir==='down'){for(let c=0;c<4;c++){const col=g.map(r=>r[c]).reverse();const sl=slide(col);const rev=sl.reverse();for(let r=0;r<4;r++)g[r][c]=rev[r];}}
    if(JSON.stringify(g)!==b){addR(s);if(s.score>s.best)s.best=s.score;}
    if(!canMove(s))s.over=true;
    save();render();
  };
  const canMove=(st)=>{if(st.grid.flat().includes(0))return true;for(let r=0;r<4;r++)for(let c=0;c<4;c++){if(r<3&&st.grid[r][c]===st.grid[r+1][c])return true;if(c<3&&st.grid[r][c]===st.grid[r][c+1])return true;}return false;};
  const render=()=>{
    const colors={2:'#3b3f5c',4:'#4a4f73',8:'#f59e0b',16:'#f97316',32:'#ef4444',64:'#dc2626',128:'#a855f7',256:'#8b5cf6',512:'#06b6d4',1024:'#0891b2',2048:'#10b981'};
    body.innerHTML=`<div class="g2048-wrap">
      <div style="display:flex;gap:16px;font-size:12px;color:var(--text-muted);">Score <b style="color:#fff;font-size:14px;">${s.score}</b> · Best <b style="color:#fff;font-size:14px;">${s.best}</b></div>
      <div class="g2048-board">${s.grid.flat().map(v=>`<div class="g2048-cell" style="${v?`background:${colors[v]||'#10b981'};color:#fff;`:'background:rgba(255,255,255,.06);'}">${v||''}</div>`).join('')}</div>
      <div style="display:flex;gap:8px;">${s.over?'<span style="color:#f87171;font-weight:700;">Game Over</span>':''}</div>
      <div style="display:flex;gap:8px;"><button class="mini-btn" id="g-new-${winId}">New Game</button></div>
      <div style="font-size:11px;color:var(--text-muted);text-align:center;">${IS_TOUCH ? 'Swipe to move' : 'Arrow keys to move.'}</div>
    </div>`;
    document.getElementById(`g-new-${winId}`).onclick=()=>{s={grid:[[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],score:0,best:s.best,over:false};addR(s);addR(s);save();render();};
    const board = body.querySelector('.g2048-board');
    let tsx=0,tsy=0,tracking=false;
    board.addEventListener('touchstart',(e)=>{if(e.touches.length!==1)return;tracking=true;tsx=e.touches[0].clientX;tsy=e.touches[0].clientY;},{passive:true});
    board.addEventListener('touchmove',(e)=>{
      if(!tracking)return;
      const dx=e.touches[0].clientX-tsx, dy=e.touches[0].clientY-tsy;
      if(Math.hypot(dx,dy)>30){
        e.preventDefault();
        tracking=false;
        if(Math.abs(dx)>Math.abs(dy)) move(dx>0?'right':'left');
        else move(dy>0?'down':'up');
      }
    },{passive:false});
    board.addEventListener('touchend',()=>tracking=false);
  };
  const kh=(e)=>{
    if(!document.getElementById(`body-${winId}`)){document.removeEventListener('keydown',kh);return;}
    if(s.over)return;
    if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();move({ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'}[e.key]);}
  };
  document.addEventListener('keydown',kh);
  render();
}

/* ============ Tic-Tac-Toe ============ */
function renderTicTacToe(body,winId){
  let board=Array(9).fill(''),human='X',ai='O',turn='X';
  const winner=(b)=>{const L=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];for(const[a,b1,c]of L)if(b[a]&&b[a]===b[b1]&&b[a]===b[c])return b[a];return b.every(v=>v)?'draw':null;};
  const mm=(b,d,max)=>{
    const w=winner(b);if(w===ai)return 10-d;if(w===human)return d-10;if(w==='draw')return 0;
    if(max){let best=-Infinity;for(let i=0;i<9;i++)if(!b[i]){b[i]=ai;best=Math.max(best,mm(b,d+1,false));b[i]='';}return best;}
    else{let best=Infinity;for(let i=0;i<9;i++)if(!b[i]){b[i]=human;best=Math.min(best,mm(b,d+1,true));b[i]='';}return best;}
  };
  const aiMove=()=>{let best=-Infinity,move=-1;for(let i=0;i<9;i++)if(!board[i]){board[i]=ai;const sc=mm(board,0,false);board[i]='';if(sc>best){best=sc;move=i;}}if(move>=0)board[move]=ai;};
  const render=()=>{
    const w=winner(board);
    const status=w==='X'?'🎉 You win!':w==='O'?'🤖 AI wins':w==='draw'?'Draw':turn===human?'Your turn':'AI thinking…';
    body.innerHTML=`<div class="ttt-wrap">
      <div style="font-size:14px;font-weight:600;">${status}</div>
      <div class="ttt-board">${board.map((v,i)=>`<div class="ttt-cell ${v.toLowerCase()}" data-i="${i}">${v}</div>`).join('')}</div>
      <button class="mini-btn primary" id="ttt-n-${winId}">New Game</button>
    </div>`;
    body.querySelectorAll('.ttt-cell').forEach(c=>c.onclick=()=>{
      const i=+c.dataset.i;
      if(board[i]||winner(board)||turn!==human)return;
      board[i]=human;turn=ai;
      const w=winner(board);
      if(!w){setTimeout(()=>{aiMove();turn=human;render();},220);}else render();
      sfx.click();
    });
    document.getElementById(`ttt-n-${winId}`).onclick=()=>{board=Array(9).fill('');turn=human;render();};
  };
  render();
}

/* ============ Dice & Coin ============ */
function renderDice(body,winId){
  // Removed the redundant <h3> and fixed the flexbox to center perfectly
  body.innerHTML=`<div class="app-pad" style="align-items:center;justify-content:center;text-align:center;flex:1;padding:10px;">
    <div id="dc-out-${winId}" style="font-size:70px;margin-bottom:10px;">🎲</div>
    <div style="margin-bottom:12px;"><label style="margin-right:8px;">Dice</label><select id="dc-n-${winId}" style="width:auto;"><option>D4</option><option>D6</option><option selected>D8</option><option>D10</option><option>D12</option><option>D20</option></select></div>
    <button class="mini-btn primary" id="dc-r-${winId}" style="padding:10px 30px;font-size:14px;">Roll</button>
    <div class="output-box" id="dc-h-${winId}" style="min-height:60px;width:100%;text-align:left;margin-top:16px;overflow-y:auto;max-height:100px;">Ready to roll.</div>
  </div>`;
  const out=document.getElementById(`dc-out-${winId}`),hist=document.getElementById(`dc-h-${winId}`);
  document.getElementById(`dc-r-${winId}`).onclick=()=>{
    const sides=+document.getElementById(`dc-n-${winId}`).value.replace('D','');
    const n=Math.floor(Math.random()*sides)+1;
    out.textContent=['⚀','⚁','⚂','⚃','⚄','⚅'][Math.min(5,Math.floor(n/6))]||'🎲';
    hist.textContent=`Rolled D${sides} → ${n}\n`+hist.textContent;
    sfx.success();
  };
}

function renderCoin(body,winId){
  body.innerHTML=`<div class="app-pad" style="align-items:center;justify-content:center;text-align:center;flex:1;padding:10px;">
    <div id="co-out-${winId}" style="font-size:80px;margin-bottom:10px;">🪙</div>
    <button class="mini-btn primary" id="co-f-${winId}" style="padding:10px 30px;font-size:14px;margin-bottom:16px;">Flip Coin</button>
    <div class="output-box" id="co-h-${winId}" style="min-height:60px;width:100%;text-align:left;overflow-y:auto;max-height:100px;">Ready.</div>
  </div>`;
  const out=document.getElementById(`co-out-${winId}`),hist=document.getElementById(`co-h-${winId}`);
  document.getElementById(`co-f-${winId}`).onclick=()=>{
    const r=Math.random()<.5?'Heads':'Tails';
    out.textContent=r==='Heads'?'👑':'🪙';
    hist.textContent=`${r}\n`+hist.textContent;
    sfx.success();
  };
}

/* ============ Aura Search ============ */
function renderAuraSearch(container,winId,meta){
  const savedEngine=localStorage.getItem('aura_search_engine')||'google';
  container.innerHTML=`<div style="display:flex;flex-direction:column;flex:1;padding:20px;gap:16px;background:radial-gradient(circle at top, rgba(6,182,212,.1) 0%, transparent 70%);">
    <div style="text-align:center;"><div style="font-size:20px;font-weight:700;color:#fff;text-shadow:0 0 12px var(--aura-cyan-glow);">🔎 AURA SEARCH</div><div class="setting-subtext" style="margin-top:4px;">Unified search · prefix with <b>?</b> for AI answer</div></div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;">
      ${Object.keys(SEARCH_ENGINES).map(k=>`<button data-engine="${k}" style="background:${k===savedEngine?'rgba(6,182,212,.2)':'rgba(255,255,255,.05)'};border:1px solid ${k===savedEngine?'var(--aura-cyan)':'var(--glass-border)'};color:${k===savedEngine?'#fff':'var(--text-muted)'};padding:8px 12px;border-radius:20px;font-size:12px;cursor:pointer;touch-action:manipulation;">${SEARCH_ENGINES[k].name}</button>`).join('')}
    </div>
    <div style="position:relative;width:100%;max-width:560px;margin:0 auto;">
      <input type="text" id="aura-in-${winId}" placeholder="Type query…" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" style="width:100%;padding:14px 60px 14px 18px;font-size:14px;background:rgba(0,0,0,.5);border:1px solid var(--glass-border);border-radius:24px;color:#fff;outline:none;" aria-label="Search query">
      <button id="aura-nt-${winId}" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);width:38px;height:38px;border-radius:50%;background:rgba(6,182,212,.15);border:1px solid var(--aura-cyan);color:var(--aura-cyan);cursor:pointer;font-size:15px;touch-action:manipulation;" aria-label="New tab">↗</button>
    </div>
    <div id="aura-ai-${winId}" style="display:none;max-width:560px;margin:0 auto;padding:14px;background:rgba(6,182,212,.08);border:1px solid var(--aura-cyan);border-radius:12px;font-size:13px;line-height:1.6;color:var(--text-main);white-space:pre-wrap;word-break:break-word;"></div>
    <div class="setting-subtext" style="text-align:center;font-size:11px;"><b style="color:var(--aura-cyan);">Enter</b> search · <b style="color:var(--aura-cyan);">?</b> AI answer</div>
  </div>`;
  let ae=savedEngine;
  container.querySelectorAll('[data-engine]').forEach(b=>b.onclick=()=>{
    container.querySelectorAll('[data-engine]').forEach(x=>{x.style.background='rgba(255,255,255,.05)';x.style.borderColor='var(--glass-border)';x.style.color='var(--text-muted)';});
    b.style.background='rgba(6,182,212,.2)';b.style.borderColor='var(--aura-cyan)';b.style.color='#fff';
    ae=b.dataset.engine;
    try{localStorage.setItem('aura_search_engine',ae);}catch(e){}
  });
  const input=document.getElementById(`aura-in-${winId}`);
  const aiBox=document.getElementById(`aura-ai-${winId}`);
  const openNew=()=>{
    const q=input.value.trim();if(!q)return;
    const e=SEARCH_ENGINES[ae]||SEARCH_ENGINES.google;
    const url=e.url+encodeURIComponent(q);
    addHistory('search',q,`New tab · ${e.name}`,{url});
    window.open(url,'_blank','noopener,noreferrer');
    toast('New tab',`${e.name}: ${q}`,'success',2000);
  };
  document.getElementById(`aura-nt-${winId}`).onclick=(e)=>{e.stopPropagation();openNew();};
  input.onkeydown=(e)=>{
    if(e.key!=='Enter')return;
    e.preventDefault();
    const q = input.value.trim();
    if(e[MOD_KEY])return openNew();
    if(e.shiftKey)return openApp('aurayt',{initialUrl:q});
    if(q.startsWith('?')){
      const prompt = q.slice(1).trim();
      if(!prompt) return;
      aiBox.style.display='block';
      aiBox.textContent='🤔 Asking Aura…';
      callAuraAI(prompt).then(r=>{aiBox.textContent = '🤖 ' + r;});
      return;
    }
    if(validateYoutubeUrl(q).valid)return openApp('aurayt',{initialUrl:q});
    performAuraSearch(q,ae,winId);
  };
  if(!IS_TOUCH) input.focus();
}
function performAuraSearch(q,ek,winId){
  if(!q)return;
  const e=SEARCH_ENGINES[ek]||SEARCH_ENGINES.google;
  const url=e.url+encodeURIComponent(q);
  addHistory('search',q,`Search: ${e.name}`,{url});
  openApp('browser',{url,title:`${e.name}: ${q}`});
}
function parseYoutubeUrl(raw){
  if(!raw||typeof raw!=='string')return{valid:false};
  let s=raw.trim();if(!s.startsWith('http'))s='https://'+s;
  try{
    const u=new URL(s);
    const h=u.hostname.replace('www.','').toLowerCase();
    if(!['youtube.com','youtu.be','m.youtube.com','youtube-nocookie.com'].includes(h))return{valid:false,error:'Not YouTube.'};
    let vid=null,pl=u.searchParams.get('list')||null;
    const t=u.searchParams.get('t')||u.searchParams.get('start');
    let st=0;
    if(t){if(/^\d+$/.test(t))st=+t;else{const hh=t.match(/(\d+)h/i),mm=t.match(/(\d+)m/i),ss=t.match(/(\d+)s/i);if(hh)st+=+hh[1]*3600;if(mm)st+=+mm[1]*60;if(ss)st+=+ss[1];}}
    if(h==='youtu.be')vid=u.pathname.substring(1).split('/')[0];
    else if(u.pathname.startsWith('/watch'))vid=u.searchParams.get('v');
    else if(u.pathname.startsWith('/shorts/'))vid=u.pathname.split('/shorts/')[1]?.split('/')[0];
    else if(u.pathname.startsWith('/embed/'))vid=u.pathname.split('/embed/')[1]?.split('/')[0];
    else if(u.pathname.startsWith('/live/'))vid=u.pathname.split('/live/')[1]?.split('/')[0];
    if(!vid&&!pl)return{valid:false,error:'No video/playlist.'};
    return{valid:true,videoId:vid||'',playlistId:pl||'',startTime:st,originalUrl:raw};
  }catch(e){return{valid:false,error:'Malformed.'};}
}
function validateYoutubeUrl(u){return parseYoutubeUrl(u);}
function buildYoutubeEmbed(p){
  if(!p||!p.valid)return'';
  if(p.playlistId&&!p.videoId)return`https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(p.playlistId)}`;
  let u=`https://www.youtube-nocookie.com/embed/${encodeURIComponent(p.videoId)}?autoplay=1`;
  if(p.playlistId)u+=`&list=${encodeURIComponent(p.playlistId)}`;
  if(p.startTime>0)u+=`&start=${p.startTime}`;
  return u;
}
function renderAuraYouTube(container,winId,meta){
  const initial=meta.initialUrl||localStorage.getItem('lastYoutubeUrl')||'';
  container.innerHTML=`<div style="display:flex;flex-direction:column;flex:1;background:#000;min-height:0;">
    <div style="display:flex;gap:8px;padding:10px;background:rgba(15,23,42,.9);border-bottom:1px solid var(--glass-border);flex-wrap:wrap;flex-shrink:0;">
      <input type="text" id="yt-in-${winId}" placeholder="Paste YouTube link…" value="${sanitizeHTML(initial)}" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" style="flex:1;min-width:180px;padding:8px 12px;font-size:12px;background:rgba(0,0,0,.6);border:1px solid var(--glass-border);border-radius:6px;color:#fff;outline:none;" aria-label="YouTube URL">
      <button class="mini-btn primary" id="yt-p-${winId}">▶ Play</button>
    </div>
    <div id="yt-s-${winId}" style="font-size:11px;padding:4px 10px;background:rgba(0,0,0,.4);color:var(--text-muted);border-bottom:1px solid var(--glass-border);flex-shrink:0;">Ready</div>
    <div id="yt-vp-${winId}" style="flex:1;display:flex;align-items:center;justify-content:center;background:#050505;min-height:0;color:var(--text-muted);font-size:13px;text-align:center;padding:20px;">Paste a YouTube URL above.</div>
  </div>`;
  const input=document.getElementById(`yt-in-${winId}`),status=document.getElementById(`yt-s-${winId}`),vp=document.getElementById(`yt-vp-${winId}`);
  const play=()=>{
    const url=input.value.trim();
    if(!url){status.textContent='Enter URL.';return;}
    const p=parseYoutubeUrl(url);
    if(!p.valid){status.textContent='Error: '+p.error;sfx.error();return;}
    status.textContent=`Playing [${p.videoId||p.playlistId}]`;
    try{localStorage.setItem('lastYoutubeUrl',p.originalUrl);}catch(e){}
    addHistory('youtube',p.videoId?'YouTube Video':'Playlist',p.originalUrl,{url:p.originalUrl});
    vp.innerHTML=`<iframe style="width:100%;height:100%;border:none;" src="${buildYoutubeEmbed(p)}" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture;web-share" allowfullscreen></iframe>`;
  };
  document.getElementById(`yt-p-${winId}`).onclick=play;
  input.onkeydown=(e)=>{if(e.key==='Enter')play();};
  if(initial)play();
}

/* ============ Explorer ============ */
const explorerStates={};
function renderExplorer(container,winId){
  explorerStates[winId]={folder:'home',selected:null};
  const narrow = window.innerWidth <= 700;
  container.innerHTML=`<div style="display:flex;flex-direction:${narrow?'column':'row'};flex:1;min-height:0;">
    <aside style="width:${narrow?'100%':'160px'};padding:10px;border-${narrow?'bottom':'right'}:1px solid var(--glass-border);background:rgba(2,6,23,.28);overflow:auto;-webkit-overflow-scrolling:touch;display:flex;flex-direction:${narrow?'row':'column'};gap:4px;flex-wrap:${narrow?'wrap':'nowrap'};" id="sb-${winId}"></aside>
    <div style="display:flex;flex-direction:column;flex:1;min-width:0;min-height:0;">
      <div style="display:flex;gap:8px;padding:8px;border-bottom:1px solid var(--glass-border);flex-shrink:0;flex-wrap:wrap;">
        <button class="mini-btn" id="nf-${winId}">＋ New File</button>
        <button class="mini-btn" id="up-${winId}">📤 Upload</button>
        <input type="file" id="uf-${winId}" style="display:none" multiple>
        <button class="mini-btn" id="tr-${winId}">🗑️ Trash</button>
        <input id="fs-${winId}" placeholder="Search files..." autocapitalize="off" autocorrect="off" spellcheck="false" style="flex:1;min-width:120px;background:rgba(0,0,0,.4);border:1px solid var(--glass-border);border-radius:6px;padding:8px 10px;color:#fff;font-size:12px;outline:none;" aria-label="Search files">
      </div>
      <div style="padding:12px;overflow:auto;-webkit-overflow-scrolling:touch;flex:1;display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:8px;" id="fz-${winId}" tabindex="0"></div>
    </div>
  </div>`;
  const sb=document.getElementById(`sb-${winId}`),fz=document.getElementById(`fz-${winId}`),fs=document.getElementById(`fs-${winId}`);
  const folders=['home','documents','downloads','pictures','music','system'];
  const icons={home:'🏠',documents:'📄',downloads:'📥',pictures:'🖼️',music:'🎵',system:'⚙️'};
  
  const renderSb=()=>{
    const st=explorerStates[winId];
    if (narrow) {
      sb.innerHTML = folders.map(f=>`<button data-f="${f}" style="display:flex;align-items:center;gap:6px;padding:8px 12px;border-radius:8px;cursor:pointer;background:${st.folder===f?'rgba(255,255,255,.1)':'transparent'};color:${st.folder===f?'var(--text-main)':'var(--text-muted)'};border:1px solid ${st.folder===f?'var(--aura-cyan)':'transparent'};font-family:inherit;font-size:12px;touch-action:manipulation;"><span>${icons[f]}</span><span>${f}</span></button>`).join('');
    } else {
      sb.innerHTML=`<div style="font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:var(--text-muted);padding:6px 8px;">Locations</div>`+
        folders.map(f=>`<button data-f="${f}" style="display:flex;align-items:center;gap:9px;padding:9px 10px;margin:3px 0;border-radius:8px;cursor:pointer;background:${st.folder===f?'rgba(255,255,255,.07)':'transparent'};color:${st.folder===f?'var(--text-main)':'var(--text-muted)'};border:none;width:100%;text-align:left;font-family:inherit;font-size:12px;touch-action:manipulation;"><span>${icons[f]}</span><span>${f}</span></button>`).join('');
    }
    sb.querySelectorAll('[data-f]').forEach(el=>el.onclick=()=>{explorerStates[winId].folder=el.dataset.f;explorerStates[winId].selected=null;renderSb();renderFiles();});
  };

  const renderFiles=()=>{
    const st=explorerStates[winId],folder=VFS[st.folder]||{},q=(fs.value||'').toLowerCase();
    const names=Object.keys(folder).filter(n=>!q||n.toLowerCase().includes(q));
    fz.innerHTML=names.length?names.map(n=>{
      const isSelected = st.selected === n;
      return `<div data-n="${sanitizeHTML(n)}" tabindex="0" style="display:flex;align-items:center;gap:10px;padding:12px;background:${isSelected?'rgba(6,182,212,.2)':'rgba(255,255,255,.035)'};border:1px solid ${isSelected?'var(--aura-cyan)':'var(--glass-border)'};border-radius:10px;cursor:pointer;touch-action:manipulation;" aria-label="${sanitizeHTML(n)}">
        <div style="font-size:22px;">${fileIcon(n)}</div>
        <div style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;">${sanitizeHTML(n)}</div>
        <button class="mini-btn danger" data-del="${sanitizeHTML(n)}" style="padding:6px 10px;font-size:11px;" aria-label="Delete">✕</button>
      </div>`;
    }).join(''):'<div class="empty-state" style="grid-column:1/-1;">This folder is empty.</div>';
    
    fz.querySelectorAll('[data-n]').forEach(el=>{
      const name = el.dataset.n;
      const fileCtx = (x, y) => {
        const menuItems = [
          { label:'👁️ Quick Look', action:()=>openQuickLook(name, st.folder) },
          { label:'📝 Open in Text Editor', action:()=>openApp('editor',{file:name,folder:st.folder,title:name}) },
          { label:'📖 Open in Markdown', action:()=>openApp('markdown', {file:name, folder:st.folder}) },
        ];
        if (/\.(html|htm)$/i.test(name)) {
            menuItems.push({ label:'🌐 Open in Browser', action:()=>{
                 const blob = new Blob([VFS[st.folder][name]], {type:'text/html'});
                 const url = URL.createObjectURL(blob);
                 openApp('browser', { url: url });
            }});
        }
        menuItems.push(
            { divider:true },
            { label:'🤖 Ask Aura about this', action:()=>askAuraAboutFile(name, st.folder) },
            { label:'✍️ Summarize with Aura', action:()=>summarizeFileWithAura(name, st.folder) },
            { label:'📋 Copy File URL (Data URI)', action:()=>{
                navigator.clipboard.writeText(VFS[st.folder][name]).then(()=>toast('Copied','File URL copied to clipboard.','success',2000));
            }},
            { divider:true },
            { label:'🗑️ Delete (move to Trash)', action:()=>{
              if (moveToTrash(name, st.folder)) { st.selected=null; renderFiles(); }
            } }
        );
        showContextMenu(x, y, menuItems);
      };
      if (IS_TOUCH) {
        el.onclick=(e)=>{
          if(e.target.closest('[data-del]'))return;
          if (el.__lpFired) { el.__lpFired = false; return; }
          if (st.selected === name) { openQuickLook(name, st.folder); }
          else { st.selected = name; renderFiles(); }
        };
        addLongPress(el, (e) => { el.__lpFired = true; fileCtx(e.clientX, e.clientY); });
      } else {
        el.onclick=(e)=>{if(e.target.closest('[data-del]'))return;st.selected=el.dataset.n;renderFiles();};
        el.ondblclick=()=>openApp('editor',{file:name,folder:st.folder,title:name});
        el.oncontextmenu=(e)=>{e.preventDefault();fileCtx(e.clientX,e.clientY);};
      }
    });
    fz.querySelectorAll('[data-del]').forEach(b=>b.onclick=(e)=>{
      e.stopPropagation();
      const name=b.dataset.del;
      if (moveToTrash(name, st.folder)) { st.selected=null; renderFiles(); }
    });
  };

  document.getElementById(`nf-${winId}`).onclick=()=>{
    if(explorerStates[winId].folder==='system')return toast('Protected','Cannot create here.','warn',2000);
    const name=prompt('New file name:','new-file.txt');if(!name)return;
    const clean=name.trim();
    if(!clean||/[\\/:*?"<>|]/.test(clean))return toast('Invalid','Bad name.','error',2000);
    if(VFS[explorerStates[winId].folder][clean]!==undefined)return toast('Exists','Already exists.','warn',2000);
    VFS[explorerStates[winId].folder][clean]='';saveUserVFS();renderFiles();
    openApp('editor',{file:clean,folder:explorerStates[winId].folder,title:clean});
  };

  const handleUploadedFiles = (files) => {
    let loaded = 0;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target.result;
        const currentFolder = explorerStates[winId].folder;
        VFS[currentFolder][file.name] = content;
        loaded++;
        
        if (loaded === files.length) {
          saveUserVFS();
          renderFiles();
          toast('Uploaded', `${files.length} file(s) added.`, 'success', 2000);

          const ext = file.name.split('.').pop().toLowerCase();
          const isImage = file.type.startsWith('image/') || content.startsWith('data:image/') || /^(jpg|jpeg|png|gif|bmp|tiff|tif|webp|heic|ico|psd|ai|xcf|raw|dng|svg|eps)$/i.test(ext);
          const isVideo = file.type.startsWith('video/') || content.startsWith('data:video/') || /^(mp4|mkv|mov|avi|wmv|flv|webm|mpeg|mpg|vob|3gp)$/i.test(ext);
          const isAudio = file.type.startsWith('audio/') || content.startsWith('data:audio/') || /^(mp3|wav|flac|m4a|aac|wma|ogg|mid|midi|aif|aiff|m3u)$/i.test(ext);

          if (isImage) {
            openApp('imageviewer', { file: file.name, folder: currentFolder });
          } else if (isVideo || isAudio) {
            openApp('mediaplayer', { file: file.name, folder: currentFolder });
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  document.getElementById(`up-${winId}`).onclick = () => document.getElementById(`uf-${winId}`).click();
  document.getElementById(`uf-${winId}`).onchange = (e) => {
    if(e.target.files.length) handleUploadedFiles(e.target.files);
  };

  const dropZone = document.getElementById(`fz-${winId}`);
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.border = '2px dashed var(--aura-cyan)';
    dropZone.style.background = 'rgba(6,182,212,.1)';
  });
  dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.style.border = 'none';
    dropZone.style.background = 'transparent';
  });
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.border = 'none';
    dropZone.style.background = 'transparent';
    if(e.dataTransfer.files.length) handleUploadedFiles(e.dataTransfer.files);
  });

  document.getElementById(`tr-${winId}`).onclick=()=>openApp('trash');
  fs.oninput=renderFiles;
  renderSb();renderFiles();
}

/* ============ AI file actions ============ */
function askAuraAboutFile(name, folder) {
  const content = VFS[folder]?.[name] || '';
  if (!content) { toast('Aura','File is empty.','info',2000); return; }
  openApp('aurachat');
  setTimeout(() => {
    const inp = document.querySelector('[id^="ai-in-"]');
    if (inp) { inp.value = `Explain the file "${name}" from ${folder}/:\n\n${content.slice(0,3000)}`; inp.focus(); }
  }, 300);
}
async function summarizeFileWithAura(name, folder) {
  const content = VFS[folder]?.[name] || '';
  if (!content) { toast('Aura','File is empty.','info',2000); return; }
  toast('Aura','Summarizing…','info',2000);
  try {
    const summary = await callAuraAI(`Summarize the following file content in a few short bullet points:\n\n${content.slice(0,4000)}`);
    const summaryName = name.replace(/(\.[^.]+)?$/, '-summary.md');
    let finalName = summaryName, n = 2;
    while (VFS[folder][finalName] !== undefined) {
      finalName = summaryName.replace(/(\.[^.]+)?$/, ` (${n})$1`);
      n++;
    }
    VFS[folder][finalName] = `# Summary of ${name}\n\n_Generated by Aura on ${new Date().toLocaleString()}_\n\n---\n\n${summary}`;
    saveUserVFS();
    toast('Aura',`Created "${finalName}"`,'success',2500);
  } catch (e) {
    toast('Aura','Summary failed: ' + e.message,'error',3000);
  }
}
async function suggestRenameWithAura(name, folder, winId) {
  const content = VFS[folder]?.[name] || '';
  toast('Aura','Thinking of better names…','info',2000);
  try {
    const reply = await callAuraAI(`Suggest exactly 3 short filenames (one per line, no explanations, keep the extension) that better describe this file content. Original name: "${name}". Content:\n\n${content.slice(0,2000)}`);
    const suggestions = reply.split('\n').map(s => s.replace(/^[-\d.\s]+/,'').trim()).filter(s => s.length > 0 && s.length < 80).slice(0,3);
    if (!suggestions.length) { toast('Aura','No suggestions.','info',2000); return; }
    const choice = prompt('Aura suggests:\n\n' + suggestions.map((s,i)=>`${i+1}. ${s}`).join('\n') + '\n\nEnter 1-3 to rename, or type your own:', suggestions[0]);
    if (!choice) return;
    let newName = choice;
    const idx = parseInt(choice);
    if (idx >= 1 && idx <= suggestions.length) newName = suggestions[idx-1];
    if (newName === name) return;
    if (/[\\/:*?"<>|]/.test(newName)) { toast('Invalid','Bad name.','error',2000); return; }
    if (VFS[folder][newName] !== undefined) { toast('Exists','Already exists.','warn',2000); return; }
    VFS[folder][newName] = VFS[folder][name];
    delete VFS[folder][name];
    saveUserVFS();
    toast('Renamed',`"${name}" → "${newName}"`,'success',3000);
    windows.forEach(w => w.tabs.forEach(t => {
      if (t.appId === 'explorer') { const body = document.getElementById(`body-${w.id}`); if (body) renderExplorer(body, w.id); }
    }));
  } catch (e) {
    toast('Aura','Rename failed: ' + e.message,'error',3000);
  }
}

/* ============ Quick Look ============ */
function initQuickLook() {
  document.getElementById('ql-close').onclick = closeQuickLook;
  document.getElementById('quick-look').addEventListener('click', (e) => {
    if (e.target.id === 'quick-look') closeQuickLook();
  });
  document.getElementById('ql-copy').onclick = async () => {
    if(!quickLookContent) return;
    try {
      await navigator.clipboard.writeText(quickLookContent);
      toast('Copied', 'File Data URI/URL copied to clipboard.', 'success', 2000);
    } catch(e) {
      toast('Error', 'Clipboard failed.', 'error', 2000);
    }
  };
}

function openQuickLook(name, folder) {
  const content = VFS[folder]?.[name];
  if (content === undefined) return;
  quickLookContent = content;
  
  const ql = document.getElementById('quick-look');
  const body = document.getElementById('ql-body');
  const title = document.getElementById('ql-title');
  const meta = document.getElementById('ql-meta');
  
  title.textContent = fileIcon(name) + ' ' + name;
  const ext = (name.match(/\.([^.]+)$/) || ['', ''])[1].toLowerCase();
  quickLookFile = { name, folder };

  let handled = false;

  if (typeof content === 'string') {
    if (content.startsWith('data:image/')) {
      body.innerHTML = `<img src="${content}" style="max-width:100%; max-height:100%; border-radius:8px; display:block; margin:0 auto;" alt="${sanitizeHTML(name)}">`;
      handled = true;
    } else if (content.startsWith('data:audio/')) {
      body.innerHTML = `<audio controls autoplay src="${content}" style="width:100%; margin-top:20px;"></audio>`;
      handled = true;
    } else if (content.startsWith('data:video/')) {
      body.innerHTML = `<video controls autoplay src="${content}" style="max-width:100%; max-height:100%; border-radius:8px; display:block; margin:0 auto;"></video>`;
      handled = true;
    }
  }

  if (!handled) {
    if (/^(jpg|jpeg|png|gif|bmp|tiff|tif|webp|heic|ico|psd|ai|xcf|raw|dng|svg|eps)$/i.test(ext)) {
      body.innerHTML = `<img src="${content}" alt="${sanitizeHTML(name)}" style="max-width:100%; max-height:100%; border-radius:8px; display:block; margin:0 auto;">`;
    } 
    else if (/^(mp4|mkv|mov|avi|wmv|flv|webm|mpeg|mpg|vob|3gp)$/i.test(ext)) {
      body.innerHTML = `<video controls autoplay src="${content}" style="max-width:100%; max-height:100%; border-radius:8px; display:block; margin:0 auto;"></video>`;
    } 
    else if (/^(mp3|wav|flac|m4a|aac|wma|ogg|mid|midi|aif|aiff|m3u)$/i.test(ext)) {
      body.innerHTML = `<audio controls autoplay src="${content}"></audio>`;
    } 
    else if (ext === 'pdf') {
      body.innerHTML = `<iframe src="${content}" style="width:100%; height:60vh; border:none; border-radius:8px;"></iframe>`;
    }
    else if (ext === 'html' || ext === 'htm') {
      body.innerHTML = `<iframe srcdoc="${sanitizeHTML(content)}" style="width:100%; height:60vh; border:none; border-radius:8px; background:#fff;"></iframe>`;
    }
    else if (ext === 'csv' || ext === 'tsv') {
      const rows = content.split('\n').map(r => r.split(ext === 'csv' ? ',' : '\t'));
      let table = '<table style="width:100%; border-collapse:collapse; font-size:12px;">';
      rows.forEach((row, i) => {
        table += '<tr>';
        row.forEach(cell => {
          table += `<${i === 0 ? 'th' : 'td'} style="border:1px solid var(--glass-border); padding:6px 8px; text-align:left;">${sanitizeHTML(cell)}</${i === 0 ? 'th' : 'td'}>`;
        });
        table += '</tr>';
      });
      table += '</table>';
      body.innerHTML = table;
    }
    else if (ext === 'md') {
      body.innerHTML = `<div style="line-height:1.7">${mdToHtml(content)}</div>`;
    } 
    else if (ext === 'json') {
      try { body.innerHTML = `<pre>${sanitizeHTML(JSON.stringify(JSON.parse(content), null, 2))}</pre>`; }
      catch { body.innerHTML = `<pre>${sanitizeHTML(content)}</pre>`; }
    } 
    else {
      body.innerHTML = `<pre>${sanitizeHTML(String(content).slice(0, 10000))}${content.length > 10000 ? '\n\n… (truncated)' : ''}</pre>`;
    }
  }

  const size = new Blob([String(content)]).size;
  meta.textContent = `${folder}/${name} · ${size < 1024 ? size + ' B' : (size/1024).toFixed(1) + ' KB'}`;
  ql.classList.add('open');
}
function closeQuickLook() { document.getElementById('quick-look').classList.remove('open'); quickLookFile = null; quickLookContent = ''; }

/* ============ Screenshot ============ */
async function takeScreenshot() {
  try {
    const flash = document.getElementById('screenshot-flash');
    flash.classList.add('flash');
    setTimeout(() => flash.classList.remove('flash'), 400);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      toast('Screenshot','Not supported in this browser.','error',2500);
      return;
    }
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: { displaySurface: 'browser' }, audio: false });
    const video = document.createElement('video');
    video.srcObject = stream;
    video.muted = true;
    await video.play();
    await new Promise(r => setTimeout(r, 150));
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    stream.getTracks().forEach(t => t.stop());
    const dataUrl = canvas.toDataURL('image/png');
    const name = `screenshot-${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.png`;
    VFS.pictures = VFS.pictures || {};
    VFS.pictures[name] = dataUrl;
    saveUserVFS();
    toast('Screenshot', `Saved to Pictures/${name}`, 'success', 3000, '📁 Open', () => openApp('imageviewer'));
  } catch (e) {
    if (e.name !== 'NotAllowedError') toast('Screenshot','Failed: ' + e.message,'error',2500);
  }
}

/* ============ Settings ============ */
function renderSettings(body,winId){
  let cur={accent:'#6366f1',accentHover:'#4f46e5',glassOpacity:.75};
  try{cur={...cur,...(JSON.parse(localStorage.getItem(THEME_KEY)||'{}'))};}catch(e){}
  const ic=getIconColors();
  const ss=getSlideshowConfig();
  const lw=localStorage.getItem(LIVEWALL_KEY)!=='off';
  const snd=localStorage.getItem(SOUND_KEY)!=='off';
  body.innerHTML=`<div class="settings-view">
    <div class="setting-group"><label>Appearance & Theme</label>
      <div class="setting-subtext">Accent color and glass intensity.</div>
      <div class="color-row"><input type="color" id="ac-${winId}" class="color-input" value="${cur.accent}"><div><div id="acl-${winId}">${cur.accent}</div><div class="setting-subtext">Accent</div></div></div>
      <div class="range-row"><span>Glass</span><input type="range" id="gl-${winId}" min=".35" max=".92" step=".01" value="${cur.glassOpacity}"><span id="gll-${winId}">${Math.round(cur.glassOpacity*100)}%</span></div>
      <div class="settings-actions">
        <button class="mini-btn" id="t-cy-${winId}">Cyan</button><button class="mini-btn" id="t-pu-${winId}">Purple</button>
        <button class="mini-btn" id="t-gr-${winId}">Emerald</button><button class="mini-btn" id="t-pi-${winId}">Pink</button>
      </div>
    </div>
    <div class="setting-group"><label>Window Controls</label>
      <select id="ws-${winId}" style="width:100%;background:rgba(0,0,0,.4);border:1px solid var(--glass-border);border-radius:8px;padding:9px 12px;color:#fff;font-size:12px;outline:none;">
        <option value="traffic" ${getWindowStyle()==='traffic'?'selected':''}>macOS Traffic Lights</option>
        <option value="buttons" ${getWindowStyle()==='buttons'?'selected':''}>Windows/Linux Buttons</option>
      </select>
    </div>
    <div class="setting-group"><label>Desktop Icon Colors</label>
      <div class="icon-color-grid">
        <div class="icon-color-card"><label>Label</label><input type="color" id="il-${winId}" class="color-input" value="${ic.labelColor}" style="width:100%"></div>
        <div class="icon-color-card"><label>Glow</label><input type="color" id="ig-${winId}" class="color-input" value="${ic.glowColor}" style="width:100%"></div>
        <div class="icon-color-card"><label>Title</label><input type="color" id="it-${winId}" class="color-input" value="${ic.titleColor}" style="width:100%"></div>
        <div class="icon-color-card"><label>Presets</label>
          <div class="settings-actions">
            <button class="mini-btn" id="ipd-${winId}">Default</button><button class="mini-btn" id="ipn-${winId}">Neon</button>
            <button class="mini-btn" id="ips-${winId}">Sunset</button><button class="mini-btn" id="ipo-${winId}">Ocean</button>
          </div>
        </div>
      </div>
    </div>
    <div class="setting-group"><label>Desktop Effects</label>
      <div class="toggle-row" style="margin-bottom:6px;"><span>Live wallpaper particles</span><input type="checkbox" id="lw-${winId}" ${lw?'checked':''}></div>
      <div class="toggle-row" style="margin-bottom:6px;"><span>Sound effects</span><input type="checkbox" id="sf-${winId}" ${snd?'checked':''}></div>
      <div class="toggle-row"><span>Wallpaper slideshow</span><input type="checkbox" id="ss-${winId}" ${ss.enabled?'checked':''}></div>
      <div class="range-row" style="margin-top:6px;"><span>Every</span><input type="range" id="ssi-${winId}" min="1" max="60" step="1" value="${ss.intervalMin}"><span id="ssil-${winId}">${ss.intervalMin}m</span></div>
    </div>
    <div class="setting-group"><label>Gradient Presets</label>
      <select id="bg-${winId}" style="width:100%;background:rgba(0,0,0,.4);border:1px solid var(--glass-border);border-radius:8px;padding:9px 12px;color:#fff;font-size:12px;outline:none;">
        <option value="linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311042 100%)">Deep Cosmos</option>
        <option value="linear-gradient(135deg, #059669 0%, #064e3b 100%)">Emerald City</option>
        <option value="linear-gradient(135deg, #b91c1c 0%, #450a0a 100%)">Crimson Dusk</option>
        <option value="linear-gradient(135deg, #1e293b 0%, #0f172a 100%)">Slate Dark</option>
        <option value="linear-gradient(135deg, #7c3aed 0%, #db2777 100%)">Neon Pulse</option>
      </select>
      <button class="mini-btn" id="rw-${winId}" style="margin-top:6px;">🎲 Random Wallpaper</button>
    </div>
        <div class="setting-group"><label>Custom Cursor</label>
      <select id="cursor-${winId}" style="width:100%;background:rgba(0,0,0,.4);border:1px solid var(--glass-border);border-radius:8px;padding:9px 12px;color:#fff;font-size:12px;outline:none;">
        <option value="default">Default System Cursor</option>
        <option value="crosshair">Crosshair</option>
        <option value="pointer">Pointer</option>
        <option value="cell">Cell</option>
      </select>
    </div>
    <div class="setting-group"><label>Free Stock Image Websites</label>
      <div class="stock-sites-grid">
        <a class="stock-site-card" href="https://unsplash.com/s/photos/wallpaper" target="_blank" rel="noopener"><div class="stock-site-icon">📸</div><div><div class="stock-site-name">Unsplash</div><div class="stock-site-desc">High-res photos.</div></div></a>
        <a class="stock-site-card" href="https://www.pexels.com/search/wallpaper/" target="_blank" rel="noopener"><div class="stock-site-icon">🎬</div><div><div class="stock-site-name">Pexels</div><div class="stock-site-desc">Photos and videos.</div></div></a>
        <a class="stock-site-card" href="https://pixabay.com/images/search/wallpaper/" target="_blank" rel="noopener"><div class="stock-site-icon">🎨</div><div><div class="stock-site-name">Pixabay</div><div class="stock-site-desc">Royalty-free.</div></div></a>
      </div>
    </div>
    <div class="setting-group"><label>Paste Image URL / Video URL</label>
      <div style="display:flex;gap:8px;flex-wrap:wrap;"><input type="text" id="bu-${winId}" placeholder="https://…" autocapitalize="off" autocorrect="off" spellcheck="false" style="flex:1;min-width:160px;background:rgba(0,0,0,.4);border:1px solid var(--glass-border);border-radius:8px;padding:9px 12px;color:#fff;font-size:12px;outline:none;"><button class="mini-btn primary" id="buap-${winId}">Apply</button></div>
      <input type="file" id="bf-${winId}" accept="image/*,video/*" style="width:100%;background:rgba(0,0,0,.4);border:1px solid var(--glass-border);border-radius:8px;padding:9px 12px;color:#fff;font-size:12px;margin-top:6px;">
    </div>
    <div class="setting-group"><label>Security</label>
      <div class="setting-subtext">Lock screen PIN (default 1234).</div>
      <div style="display:flex;gap:8px;"><input type="text" id="pin-${winId}" placeholder="New PIN" maxlength="12" inputmode="numeric" style="flex:1;background:rgba(0,0,0,.4);border:1px solid var(--glass-border);border-radius:8px;padding:9px 12px;color:#fff;font-size:12px;outline:none;"><button class="mini-btn primary" id="pins-${winId}">Save</button></div>
    </div>
    <div class="setting-group"><label>Aura Chat AI (Puter.js)</label>
      <div class="setting-subtext">Default AI model for Aura Chat.</div>
      <select id="aim-${winId}" style="width:100%;background:rgba(0,0,0,.4);border:1px solid var(--glass-border);border-radius:8px;padding:9px 12px;color:#fff;font-size:12px;outline:none;">
        ${AI_MODELS.map(m=>`<option value="${m.id}" ${m.id===getAIModel()?'selected':''}>${m.name} — ${m.desc}</option>`).join('')}
      </select>
      <button class="mini-btn" id="aip-${winId}" style="margin-top:6px;">✏️ Edit System Prompt</button>
    </div>
    <div class="setting-group" data-storage-anchor><label>💾 Storage Dashboard</label>
      <div class="setting-subtext">What's using your storage space.</div>
      <div id="storage-bars-${winId}"></div>
      <div class="settings-actions" style="margin-top:8px;">
        <button class="mini-btn danger" id="storage-clear-trash-${winId}">Empty Trash</button>
        <button class="mini-btn danger" id="storage-clear-chat-${winId}">Clear AI Chat</button>
        <button class="mini-btn danger" id="storage-clear-term-${winId}">Clear Terminal</button>
      </div>
    </div>
    <div class="setting-group"><label>📱 My Custom Apps</label>
      <div class="setting-subtext">Add your own web apps by link. Change the logo any time.</div>
      <div class="settings-actions" style="margin-top:6px;">
        <button class="mini-btn primary" id="add-custom-${winId}">+ Add App</button>
      </div>
      <div id="custom-apps-list-${winId}" style="margin-top:8px;display:flex;flex-direction:column;gap:6px;"></div>
    </div>
    <div class="setting-group"><label>Installed Apps (${getInstalledApps().length}/${getAllApps().length})</label>
      <div class="installed-list" id="inst-list-${winId}"></div>
      <button class="mini-btn primary" id="open-store-${winId}" style="margin-top:6px;">Open App Store</button>
    </div>
    <div class="setting-group"><label>Session</label>
      <div class="setting-subtext">Save and restore open windows across reloads.</div>
      <div class="settings-actions">
        <button class="mini-btn" id="session-save-${winId}">💾 Save Now</button>
        <button class="mini-btn primary" id="session-restore-${winId}">↻ Restore</button>
        <button class="mini-btn danger" id="session-clear-${winId}">✕ Clear</button>
      </div>
    </div>
    <div class="setting-group"><label>Personal Fun</label>
      <div class="fun-profile-grid">
        <div class="fun-card"><label>Display name</label><input id="fn-${winId}" maxlength="40" style="width:100%;background:rgba(0,0,0,.4);border:1px solid var(--glass-border);border-radius:8px;padding:9px 12px;color:#fff;font-size:12px;outline:none;"></div>
        <div class="fun-card"><label>Favorite command</label><input id="ff-${winId}" style="width:100%;background:rgba(0,0,0,.4);border:1px solid var(--glass-border);border-radius:8px;padding:9px 12px;color:#fff;font-size:12px;outline:none;"></div>
        <div class="fun-card fun-full"><label>Custom greeting</label><input id="fg-${winId}" style="width:100%;background:rgba(0,0,0,.4);border:1px solid var(--glass-border);border-radius:8px;padding:9px 12px;color:#fff;font-size:12px;outline:none;"></div>
        <div class="fun-card fun-full"><label>Custom fortune</label><input id="fo-${winId}" style="width:100%;background:rgba(0,0,0,.4);border:1px solid var(--glass-border);border-radius:8px;padding:9px 12px;color:#fff;font-size:12px;outline:none;"></div>
        <div class="fun-card fun-full"><div class="toggle-row"><span>Fun Mode</span><input type="checkbox" id="fm-${winId}"></div></div>
      </div>
      <div class="settings-actions"><button class="mini-btn primary" id="fSave-${winId}">Save Personal Fun</button></div>
    </div>
    <div class="setting-group"><label>Reset</label>
      <div class="settings-actions">
        <button class="mini-btn" id="rth-${winId}">Reset Theme</button>
        <button class="mini-btn danger" id="rall-${winId}">Reset All</button>
      </div>
    </div>
  </div>`;

  const fun=getFunConfig();
  document.getElementById(`fn-${winId}`).value=fun.displayName;
  document.getElementById(`ff-${winId}`).value=fun.favoriteCommand;
  document.getElementById(`fg-${winId}`).value=fun.customGreeting;
  document.getElementById(`fo-${winId}`).value=fun.customFortune;
  document.getElementById(`fm-${winId}`).checked=!!fun.funMode;
  document.getElementById(`fSave-${winId}`).onclick=()=>{
    const n=getFunConfig();
    n.displayName=document.getElementById(`fn-${winId}`).value.trim()||'User';
    n.favoriteCommand=document.getElementById(`ff-${winId}`).value.trim()||'neofetch';
    n.customGreeting=document.getElementById(`fg-${winId}`).value.trim()||'Welcome back, {name}! 👋';
    n.customFortune=document.getElementById(`fo-${winId}`).value.trim();
    n.funMode=document.getElementById(`fm-${winId}`).checked;
    saveFunConfig(n);toast('Personal Fun','Saved.','success',2000);
  };
  document.getElementById(`ws-${winId}`).onchange=(e)=>setWindowStyle(e.target.value);
  const ac=document.getElementById(`ac-${winId}`),acl=document.getElementById(`acl-${winId}`),gl=document.getElementById(`gl-${winId}`),gll=document.getElementById(`gll-${winId}`);
  const uT=(c,o)=>{saveThemeSettings({accent:c,accentHover:c,glow:hexToRgba(c,.4),glassOpacity:+o});ac.value=c;acl.textContent=c;gl.value=o;gll.textContent=Math.round(+o*100)+'%';};
  ac.oninput=()=>uT(ac.value,gl.value);gl.oninput=()=>uT(ac.value,gl.value);
  document.getElementById(`t-cy-${winId}`).onclick=()=>uT('#06b6d4',gl.value);
  document.getElementById(`t-pu-${winId}`).onclick=()=>uT('#6366f1',gl.value);
  document.getElementById(`t-gr-${winId}`).onclick=()=>uT('#10b981',gl.value);
  document.getElementById(`t-pi-${winId}`).onclick=()=>uT('#ec4899',gl.value);
  const uI=()=>saveIconColors({labelColor:document.getElementById(`il-${winId}`).value,glowColor:document.getElementById(`ig-${winId}`).value,titleColor:document.getElementById(`it-${winId}`).value});
  document.getElementById(`il-${winId}`).oninput=uI;
  document.getElementById(`ig-${winId}`).oninput=uI;
  document.getElementById(`it-${winId}`).oninput=uI;
  document.getElementById(`ipd-${winId}`).onclick=()=>{document.getElementById(`il-${winId}`).value='#f8fafc';document.getElementById(`ig-${winId}`).value='#06b6d4';document.getElementById(`it-${winId}`).value='#f8fafc';uI();};
  document.getElementById(`ipn-${winId}`).onclick=()=>{document.getElementById(`il-${winId}`).value='#a5f3fc';document.getElementById(`ig-${winId}`).value='#06b6d4';document.getElementById(`it-${winId}`).value='#67e8f9';uI();};
  document.getElementById(`ips-${winId}`).onclick=()=>{document.getElementById(`il-${winId}`).value='#fed7aa';document.getElementById(`ig-${winId}`).value='#f97316';document.getElementById(`it-${winId}`).value='#fdba74';uI();};
  document.getElementById(`ipo-${winId}`).onclick=()=>{document.getElementById(`il-${winId}`).value='#bfdbfe';document.getElementById(`ig-${winId}`).value='#3b82f6';document.getElementById(`it-${winId}`).value='#93c5fd';uI();};
  document.getElementById(`lw-${winId}`).onchange=(e)=>toggleLiveWallpaper(e.target.checked);
  document.getElementById(`sf-${winId}`).onchange=(e)=>{try{localStorage.setItem(SOUND_KEY,e.target.checked?'on':'off');}catch(err){}if(e.target.checked)sfx.click();};
  document.getElementById(`ss-${winId}`).onchange=(e)=>setSlideshowConfig({...getSlideshowConfig(),enabled:e.target.checked});
  document.getElementById(`ssi-${winId}`).oninput=(e)=>{document.getElementById(`ssil-${winId}`).textContent=e.target.value+'m';setSlideshowConfig({...getSlideshowConfig(),intervalMin:+e.target.value});};
  document.getElementById(`bg-${winId}`).onchange=(e)=>setDesktopWallpaper(e.target.value);
    document.getElementById(`cursor-${winId}`).value = localStorage.getItem('aether_cursor') || 'default';
  document.getElementById(`cursor-${winId}`).onchange = (e) => {
    localStorage.setItem('aether_cursor', e.target.value);
    document.body.style.cursor = e.target.value;
  };
  document.getElementById(`rw-${winId}`).onclick=()=>applyRandomWallpaper();
  document.getElementById(`buap-${winId}`).onclick=()=>{
    const v=document.getElementById(`bu-${winId}`).value.trim();if(!v)return;
    if (v.match(/\.(mp4|webm|ogg)$/i)) {
        setDesktopWallpaper(v);
        toast('Wallpaper','Video wallpaper applied.','success',2000);
    } else {
        const i=new Image();
        i.onload=()=>{setDesktopWallpaper(v);toast('Wallpaper','Applied.','success',2000);};
        i.onerror=()=>toast('Wallpaper','Failed.','error',2500);
        i.src=v;
    }
  };
  document.getElementById(`bf-${winId}`).onchange=(e)=>{
    const f=e.target.files[0];if(!f)return;
    const r=new FileReader();r.onload=ev=>{setDesktopWallpaper(ev.target.result);toast('Wallpaper','Applied.','success',2000);};r.readAsDataURL(f);
  };
  document.getElementById(`pins-${winId}`).onclick=()=>{
    const p=document.getElementById(`pin-${winId}`).value.trim();if(!p)return;
    localStorage.setItem(PIN_KEY,p);toast('PIN','Updated.','success',2000);
    document.getElementById(`pin-${winId}`).value='';
  };
  document.getElementById(`aim-${winId}`).onchange=(e)=>setAIModel(e.target.value);
  document.getElementById(`aip-${winId}`).onclick=()=>{
    const cur=getAISystem();
    const next=prompt('System prompt:',cur);
    if(next&&next.trim()){setAISystem(next.trim());toast('Aura Chat','System prompt updated.','success',2000);}
  };
  document.getElementById(`rth-${winId}`).onclick=()=>{uT('#6366f1',.75);toast('Theme','Reset.','success',2000);};
  document.getElementById(`rall-${winId}`).onclick=()=>{if(!confirm('Reset ALL AetherOS settings? This will clear everything including files, chat, and session.'))return;localStorage.clear();toast('Reset','Reloading…','warn',2500);setTimeout(()=>location.reload(),1200);};
  document.getElementById(`open-store-${winId}`).onclick=()=>openApp('store');
  document.getElementById(`session-save-${winId}`).onclick=()=>{saveSession();toast('Session','Saved.','success',2000);};
  document.getElementById(`session-restore-${winId}`).onclick=()=>{
    const s = getSavedSession();
    if (!s.length) { toast('Session','Nothing saved.','info',2000); return; }
    if (!confirm('Restore last session?')) return;
    restoreSession();
  };
  document.getElementById(`session-clear-${winId}`).onclick=()=>{clearSession();toast('Session','Cleared.','info',2000);};
  renderStorageDashboard(winId);
  document.getElementById(`storage-clear-trash-${winId}`).onclick=()=>{if(confirm('Empty Trash permanently?')){saveTrash([]);toast('Trash','Emptied.','success',2000);renderStorageDashboard(winId);}};
  document.getElementById(`storage-clear-chat-${winId}`).onclick=()=>{if(confirm('Clear AI chat history?')){saveAIHistory([]);toast('Chat','Cleared.','success',2000);renderStorageDashboard(winId);}};
  document.getElementById(`storage-clear-term-${winId}`).onclick=()=>{if(confirm('Clear terminal history?')){localStorage.removeItem(TERM_HISTORY_KEY);toast('Terminal','Cleared.','success',2000);renderStorageDashboard(winId);}};

  document.getElementById(`add-custom-${winId}`).onclick=()=>openCustomAppModal();
  renderCustomAppsList();

  const instList=document.getElementById(`inst-list-${winId}`);
  instList.innerHTML=getAllApps().map(a=>`<div class="installed-item"><span class="inst-icon">${iconHtml(a.icon)}</span><span class="inst-name">${sanitizeHTML(a.name)}</span>${isInstalled(a.id)?'<span style="color:#6ee7b7;font-size:10px;">✓</span>':'<span style="color:#fca5a5;font-size:10px;">✗</span>'}</div>`).join('');
}

function renderStorageDashboard(winId) {
  const c = document.getElementById(`storage-bars-${winId}`);
  if (!c) return;
  const calcSize = (obj) => new Blob([JSON.stringify(obj)]).size;
  const fmt = (b) => b < 1024 ? b + ' B' : b < 1024*1024 ? (b/1024).toFixed(1) + ' KB' : (b/(1024*1024)).toFixed(2) + ' MB';
  const items = [
    { label:'📁 Files', size: calcSize(VFS), color:'#06b6d4' },
    { label:'🤖 AI Chat', size: calcSize(getAIHistory()), color:'#a855f7' },
    { label:'🗒️ Stickies', size: calcSize(getStickies()), color:'#fbbf24' },
    { label:'🗑️ Trash', size: calcSize(getTrash()), color:'#ef4444' },
    { label:'📋 Clipboard', size: calcSize(getClipboardList()), color:'#10b981' },
    { label:'📊 Kanban', size: calcSize(getKanban()), color:'#f472b6' },
    { label:'📱 Custom Apps', size: calcSize(getCustomApps()), color:'#ec4899' },
    { label:'⌨️ Terminal', size: calcSize(getTermHistory()), color:'#94a3b8' },
    { label:'🕘 History', size: calcSize(getHistory()), color:'#facc15' }
  ];
  const maxSize = Math.max(...items.map(i => i.size), 1);
  const total = items.reduce((n, i) => n + i.size, 0);
  c.innerHTML = items.map(i => `
    <div class="storage-bar">
      <div class="storage-bar-label">${i.label}</div>
      <div class="storage-bar-track"><div class="storage-bar-fill" style="width:${(i.size/maxSize*100).toFixed(1)}%;background:${i.color};"></div></div>
      <div class="storage-bar-val">${fmt(i.size)}</div>
    </div>`).join('') + `<div style="text-align:right;font-size:11px;color:var(--text-muted);padding:6px 4px;">Total: <b style="color:#fff;">${fmt(total)}</b></div>`;
}

/* ============ Profile ============ */
function renderProfile(body,winId){
  const size=new Blob(Object.values(localStorage)).size;
  body.innerHTML=`<div class="settings-view">
    <div class="setting-group"><label>🖼️ Share Profile Card (PNG)</label>
      <div class="setting-subtext">Download a beautiful PNG card.</div>
      <button class="mini-btn primary" id="png-${winId}">⬇ Download PNG</button>
    </div>
    <div class="setting-group"><label>💾 JSON Backup</label>
      <div class="settings-actions">
        <button class="mini-btn" id="exp-${winId}">Export</button>
        <input type="file" id="imp-${winId}" accept="application/json" style="flex:1;min-width:140px;background:rgba(0,0,0,.4);border:1px solid var(--glass-border);border-radius:8px;padding:9px 12px;color:#fff;font-size:12px;">
      </div>
    </div>
    <div class="setting-group"><label>Storage</label><div class="setting-subtext">Using ~${(size/1024).toFixed(1)} KB</div></div>
  </div>`;
  document.getElementById(`png-${winId}`).onclick=exportProfileCard;
  document.getElementById(`exp-${winId}`).onclick=exportProfile;
  document.getElementById(`imp-${winId}`).onchange=(e)=>{const f=e.target.files[0];if(f)importProfileFile(f);};
}
function exportProfileCard(){
  const f=getFunConfig();
  const W=900,H=520;
  const c=document.createElement('canvas');c.width=W;c.height=H;
  const x=c.getContext('2d');
  const g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,'#0f172a');g.addColorStop(.5,'#1e1b4b');g.addColorStop(1,'#311042');
  x.fillStyle=g;x.fillRect(0,0,W,H);
  const accent=getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()||'#6366f1';
  const gg=x.createRadialGradient(W-180,90,0,W-180,90,380);gg.addColorStop(0,hexToRgba(accent,.45));gg.addColorStop(1,'rgba(0,0,0,0)');
  x.fillStyle=gg;x.fillRect(0,0,W,H);
  x.fillStyle='rgba(255,255,255,.03)';
  for(let i=0;i<W;i+=30)for(let j=0;j<H;j+=30){x.beginPath();x.arc(i,j,1,0,Math.PI*2);x.fill();}
  x.strokeStyle='rgba(255,255,255,.15)';x.lineWidth=2;rr(x,30,30,W-60,H-60,24);x.stroke();
  const lg=x.createLinearGradient(80,80,150,150);lg.addColorStop(0,accent);lg.addColorStop(1,hexToRgba(accent,.6));
  x.fillStyle=lg;rr(x,70,70,80,80,18);x.fill();
  x.fillStyle='#fff';x.font='bold 46px -apple-system,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('A',110,112);
  x.textAlign='left';x.textBaseline='alphabetic';x.font='bold 32px -apple-system,sans-serif';x.fillText('AetherOS Profile',175,108);
  x.fillStyle='#94a3b8';x.font='15px -apple-system,sans-serif';x.fillText('Version 7.0.0 · Foundation Edition',175,136);
  x.fillStyle='#fff';x.font='bold 54px -apple-system,sans-serif';x.fillText(f.displayName||'User',70,260);
  x.fillStyle=accent;x.font='bold 18px -apple-system,sans-serif';x.fillText('@'+(f.displayName||'User').toLowerCase().replace(/\s+/g,''),72,292);
  x.fillStyle=accent;rr(x,72,306,60,3,2);x.fill();
  const stats=[
    { l:'Apps', v:String(getInstalledApps().length)+'/'+getAllApps().length },
    { l:'Files', v:String(Object.values(VFS).reduce((n,xx)=>n+Object.keys(xx).length,0)) },
    { l:'AI Msgs', v:String(getAIHistory().length) },
    { l:'Windows', v:String(windows.length) }
  ];
  stats.forEach((s,i)=>{
    const bx=70+i*200;
    x.fillStyle='rgba(255,255,255,.05)';rr(x,bx,340,180,96,12);x.fill();
    x.strokeStyle='rgba(255,255,255,.10)';x.lineWidth=1;rr(x,bx,340,180,96,12);x.stroke();
    x.fillStyle=accent;rr(x,bx,340,4,96,2);x.fill();
    x.fillStyle='#fff';x.font='bold 30px -apple-system,sans-serif';x.fillText(s.v,bx+18,388);
    x.fillStyle='#94a3b8';x.font='12px -apple-system,sans-serif';x.fillText(s.l,bx+18,412);
  });
  x.fillStyle='#64748b';x.font='12px -apple-system,sans-serif';x.fillText(`Generated ${new Date().toLocaleString()}`,70,H-55);
  x.textAlign='right';x.fillStyle=accent;x.font='bold 13px -apple-system,sans-serif';x.fillText('⚡ AetherOS',W-70,H-55);
  c.toBlob(b=>{
    const u=URL.createObjectURL(b);
    const a=document.createElement('a');a.href=u;a.download=`aetheros-${(f.displayName||'user').toLowerCase().replace(/\s+/g,'-')}.png`;a.click();
    setTimeout(()=>URL.revokeObjectURL(u),1000);
    toast('Profile Card','PNG downloaded.','success',2500);
  },'image/png');
}
function rr(x,px,py,w,h,r){x.beginPath();x.moveTo(px+r,py);x.arcTo(px+w,py,px+w,py+h,r);x.arcTo(px+w,py+h,px,py+h,r);x.arcTo(px,py+h,px,py,r);x.arcTo(px,py,px+w,py,r);x.closePath();}
function exportProfile(){
  const d={};
  Object.keys(localStorage).forEach(k=>{if(k.startsWith('aether_')||k==='aura_search_engine'||k==='lastYoutubeUrl')d[k]=localStorage.getItem(k);});
  const b=new Blob([JSON.stringify({version:7,exportedAt:new Date().toISOString(),data:d},null,2)],{type:'application/json'});
  const u=URL.createObjectURL(b);
  const a=document.createElement('a');a.href=u;a.download=`aetheros-backup-${Date.now()}.json`;a.click();
  setTimeout(()=>URL.revokeObjectURL(u),1000);
  toast('Backup','Downloaded.','success',2000);
}
function importProfileFile(f){
  const r=new FileReader();
  r.onload=(ev)=>{
    try{
      const j=JSON.parse(ev.target.result);
      if(!j.data)throw new Error('Bad file');
      if(!confirm('Import? Current state will be replaced.'))return;
      Object.keys(localStorage).forEach(k=>{if(k.startsWith('aether_')||k==='aura_search_engine'||k==='lastYoutubeUrl')localStorage.removeItem(k);});
      Object.entries(j.data).forEach(([k,v])=>{try{localStorage.setItem(k,v);}catch(e){}});
      toast('Import','Loaded. Reloading…','success',2000);
      setTimeout(()=>location.reload(),900);
    }catch(e){toast('Import failed',e.message,'error',3000);}
  };
  r.readAsText(f);
}

/* ============ Sticky Notes ============ */
function initStickyNotes(){let s=[];try{s=JSON.parse(localStorage.getItem(STICKIES_KEY)||'[]');}catch(e){}s.forEach(spawnSticky);}
function getStickies(){try{return JSON.parse(localStorage.getItem(STICKIES_KEY)||'[]');}catch(e){return[];}}
function saveStickies(s){try{localStorage.setItem(STICKIES_KEY,JSON.stringify(s));}catch(e){}}
function createSticky(text){
  const colors=['yellow','pink','blue','green','purple'];
  const n={id:'note-'+Date.now(),x:40+Math.random()*Math.max(40,window.innerWidth-260),y:60+Math.random()*Math.max(40,window.innerHeight-260),w:200,h:150,color:colors[Math.floor(Math.random()*colors.length)],text:text||'',workspace:currentWorkspace};
  const l=getStickies();l.push(n);saveStickies(l);spawnSticky(n);
  toast('Sticky Note','Created.','success',1500);
}
function spawnSticky(s){
  const el=document.createElement('div');
  el.className='sticky-note '+(s.color||'yellow');
  el.dataset.id=s.id;el.dataset.workspace=s.workspace||0;
  el.style.left=s.x+'px';el.style.top=s.y+'px';el.style.width=s.w+'px';el.style.height=s.h+'px';
  if(s.workspace!==currentWorkspace)el.style.display='none';
  el.innerHTML=`<div class="sticky-note-header"></div><button class="sticky-close" aria-label="Delete note">✕</button><textarea class="sticky-text" placeholder="Write…" aria-label="Note text"></textarea><button class="sticky-color-btn" aria-label="Change color">🎨</button><div class="sticky-resize"></div>`;
  document.getElementById('desktop').appendChild(el);
  const ta=el.querySelector('.sticky-text');
  ta.value=s.text||'';
  ta.oninput=()=>{const l=getStickies();const t=l.find(x=>x.id===s.id);if(t){t.text=ta.value;saveStickies(l);}};
  el.querySelector('.sticky-close').onclick=(e)=>{
    e.stopPropagation();
    if(!confirm('Delete note?'))return;
    const l=getStickies().filter(x=>x.id!==s.id);saveStickies(l);el.remove();
  };
  el.querySelector('.sticky-color-btn').onclick=(e)=>{
    e.stopPropagation();
    const colors=['yellow','pink','blue','green','purple'];
    const idx=colors.indexOf(s.color);const nx=colors[(idx+1)%colors.length];
    colors.forEach(c=>el.classList.remove(c));el.classList.add(nx);s.color=nx;
    const l=getStickies();const t=l.find(x=>x.id===s.id);if(t){t.color=nx;saveStickies(l);}
  };
  const header=el.querySelector('.sticky-note-header');
  let drag=null;
  const startDrag=(clientX,clientY) => {
    drag={ox:clientX-el.offsetLeft,oy:clientY-el.offsetTop};
    el.style.zIndex = 999;
  };
  const moveDrag=(clientX,clientY) => {
    if(!drag)return;
    el.style.left=Math.max(0,Math.min(window.innerWidth-60,clientX-drag.ox))+'px';
    el.style.top=Math.max(0,Math.min(window.innerHeight-60,clientY-drag.oy))+'px';
  };
  const endDrag=() => {
    if(!drag)return;
    const l=getStickies();const t=l.find(x=>x.id===s.id);
    if(t){t.x=el.offsetLeft;t.y=el.offsetTop;saveStickies(l);}
    drag=null;
    el.style.zIndex='';
  };
  header.addEventListener('pointerdown',(e)=>{ if(e.pointerType==='mouse'&&e.button!==0)return; e.stopPropagation(); startDrag(e.clientX,e.clientY); header.setPointerCapture&&header.setPointerCapture(e.pointerId); });
  header.addEventListener('pointermove',(e)=>{ if(drag){ e.preventDefault(); moveDrag(e.clientX,e.clientY); } });
  header.addEventListener('pointerup',endDrag);
  header.addEventListener('pointercancel',endDrag);
  const rz=el.querySelector('.sticky-resize');
  let rs=null;
  rz.addEventListener('pointerdown',(e)=>{ if(e.pointerType==='mouse'&&e.button!==0)return; e.stopPropagation(); e.preventDefault(); rs={sx:e.clientX,sy:e.clientY,w:el.offsetWidth,h:el.offsetHeight}; rz.setPointerCapture&&rz.setPointerCapture(e.pointerId); });
  rz.addEventListener('pointermove',(e)=>{
    if(!rs)return; e.preventDefault();
    el.style.width=Math.max(140,rs.w+(e.clientX-rs.sx))+'px';
    el.style.height=Math.max(100,rs.h+(e.clientY-rs.sy))+'px';
  });
  const endRs=()=>{if(!rs)return;const l=getStickies();const t=l.find(x=>x.id===s.id);if(t){t.w=el.offsetWidth;t.h=el.offsetHeight;saveStickies(l);}rs=null;};
  rz.addEventListener('pointerup',endRs);
  rz.addEventListener('pointercancel',endRs);
}

/* ============ Mini Music Player ============ */
let mpAudio=null,mpCtx=null,mpAnalyser=null,mpSource=null,mpRaf=null;
function initMiniPlayer(){
  document.getElementById('mp-close').onclick=()=>document.getElementById('mini-player').classList.remove('open');
  document.getElementById('mp-play').onclick=toggleAudio;
  document.getElementById('mp-stop').onclick=()=>{if(mpAudio){mpAudio.pause();mpAudio.currentTime=0;updateMpPlay();}};
  document.getElementById('mp-prev').onclick=()=>{if(mpAudio){mpAudio.currentTime=0;mpAudio.play();updateMpPlay();}};
  document.getElementById('mp-file').onchange=(e)=>{
    const f=e.target.files[0];if(!f)return;
    if(mpAudio)mpAudio.pause();
    mpAudio=new Audio(URL.createObjectURL(f));
    document.getElementById('mp-title').textContent='▶ '+f.name;
    setupAG();
    mpAudio.onloadedmetadata=()=>document.getElementById('mp-duration').textContent=fmtT(mpAudio.duration);
    mpAudio.ontimeupdate=()=>{
      document.getElementById('mp-time').textContent=fmtT(mpAudio.currentTime);
      const fill=document.getElementById('mp-bar-fill');
      if(mpAudio.duration)fill.style.width=(mpAudio.currentTime/mpAudio.duration*100)+'%';
    };
    mpAudio.play().catch(()=>{});
    updateMpPlay();startViz();
    toast('Music',`Loaded "${f.name}"`,'success',2000);
  };
}
function toggleMiniPlayer(o){const p=document.getElementById('mini-player');if(o)p.classList.add('open');else p.classList.toggle('open');}
function toggleAudio(){if(!mpAudio){document.getElementById('mp-file').click();return;}if(mpAudio.paused){mpAudio.play();startViz();}else mpAudio.pause();updateMpPlay();}
function updateMpPlay(){const b=document.getElementById('mp-play');if(b)b.textContent=(mpAudio&&!mpAudio.paused)?'⏸':'▶';}
function setupAG(){
  if(!mpCtx)try{mpCtx=new(window.AudioContext||window.webkitAudioContext)();mpAnalyser=mpCtx.createAnalyser();mpAnalyser.fftSize=64;}catch(e){}
  try{if(mpSource)mpSource.disconnect();mpSource=mpCtx.createMediaElementSource(mpAudio);mpSource.connect(mpAnalyser);mpAnalyser.connect(mpCtx.destination);}catch(e){}
}
function startViz(){
  if(mpRaf)return;
  const c=document.getElementById('mp-canvas');if(!c)return;
  const ctx=c.getContext('2d');
  const draw=()=>{
    mpRaf=requestAnimationFrame(draw);
    ctx.clearRect(0,0,c.width,c.height);
    if(mpAnalyser){
      const d=new Uint8Array(mpAnalyser.frequencyBinCount);
      mpAnalyser.getByteFrequencyData(d);
      const bw=c.width/d.length;
      for(let i=0;i<d.length;i++){const h=(d[i]/255)*c.height;ctx.fillStyle=`hsl(${190+i*3},80%,55%)`;ctx.fillRect(i*bw,c.height-h,bw-1,h);}
    }
  };
  draw();
}
function fmtT(s){if(!s||!isFinite(s))return'0:00';const m=Math.floor(s/60),sec=Math.floor(s%60).toString().padStart(2,'0');return`${m}:${sec}`;}

/* ============ Fun helpers ============ */
const DEFAULT_FUN={displayName:'User',customGreeting:'Welcome back, {name}! 👋',funMode:true,randomJokes:true,customFortune:'',favoriteCommand:'neofetch',aliases:{}};
function getFunConfig(){try{const x=JSON.parse(localStorage.getItem(FUN_KEY)||'{}');return{...DEFAULT_FUN,...x,aliases:{...DEFAULT_FUN.aliases,...(x.aliases||{})}};}catch(e){return{...DEFAULT_FUN,aliases:{}};}}
function saveFunConfig(x){try{localStorage.setItem(FUN_KEY,JSON.stringify(x));}catch(e){}}
function randomFrom(a){return a[Math.floor(Math.random()*a.length)];}
function funJokeFallback(){return randomFrom(['Why do programmers prefer dark mode? Because light attracts bugs.','There are 10 kinds of people: those who understand binary and those who do not.']);}
async function fetchJoke(cat=''){
  const url='https://v2.jokeapi.dev/joke/'+(cat&&['programming','pun','misc'].includes(cat)?cat:'Programming,Misc,Pun')+'?safe-mode&blacklistFlags=nsfw,religious,racist,sexist,explicit';
  try{const r=await fetch(url);if(!r.ok)throw new Error();const j=await r.json();return j.type==='single'?j.joke:`${j.setup}\n${j.delivery}`;}catch(e){return'⚠️ '+funJokeFallback();}
}
function funHelp(){return`Fun: hello, joke, quote, mood, fortune, aura, whoami, neofetch, coffee, dance, matrix, hack, apps, files, uptime, alias, unalias, fun`;}
const AETHER_BOOT=Date.now();
function runFunCommand(cmd,args,output){
  const f=getFunConfig(),name=f.displayName||'User';
  switch(cmd){
    case'fun':output.innerText+=funHelp()+'\n';break;
    case'hello':output.innerText+=(f.customGreeting||'Welcome back, {name}! 👋').replace(/\{name\}/gi,name)+'\n';break;
    case'joke':output.innerText+='😂 Fetching...\n';fetchJoke((args[0]||'').toLowerCase()).then(x=>{output.innerText+=x+'\n';output.scrollTop=output.scrollHeight;});break;
    case'quote':output.innerText+=randomFrom(['Keep building, one feature at a time.','Great software grows from curious questions.','Make it useful, then delightful.'])+'\n';break;
    case'mood':output.innerText+=randomFrom(['🌟 You are doing better than you think.','🚀 One bug at a time. You have got this.','✨ Today is a good day to build something.'])+'\n';break;
    case'fortune':output.innerText+=(f.customFortune||randomFrom(['A clever idea is closer than you think.','Your next bug fix will teach you something.','Keep experimenting.']))+'\n';break;
    case'aura':output.innerText+='🔷 AURA CORE: calm systems, useful tools, positive energy.\n';break;
    case'whoami':output.innerText+=`👤 ${name}\nFun: ${f.funMode?'ON':'OFF'}\nFavorite: ${f.favoriteCommand}\n`;break;
    case'neofetch':output.innerText+=`╭─ AetherOS ─────────────────╮\n│ User: ${name}\n│ Version: 7.0.0 Foundation Ed.\n│ Platform: ${IS_MAC?'macOS':(IS_TOUCH?'Mobile':'Desktop')}\n│ Apps: ${getInstalledApps().length}/${getAllApps().length}\n│ Windows: ${windows.length}\n│ Tabs: ${windows.reduce((n,w)=>n+w.tabs.length,0)}\n│ AI Messages: ${getAIHistory().length}\n│ Files: ${Object.values(VFS).reduce((n,x)=>n+Object.keys(x).length,0)}\n╰─────────────────────────────╯\n`;break;
    case'coffee':output.innerText+='☕ Developer fuel loaded.\n';break;
    case'dance':output.innerText+='🕺 ♪┏(・o･)┛♪ AetherOS is dancing!\n';break;
    case'matrix':output.innerText+='🟢 Wake up, user...\n01000001 01010101\n';break;
    case'hack':output.innerText+='😎 Just kidding.\n';break;
    case'apps':output.innerText+=getAllApps().map(a=>`${a.id} — ${a.name} ${isInstalled(a.id)?'✓':'✗'}`).join('\n')+'\n';break;
    case'files':output.innerText+=Object.entries(VFS).map(([k,v])=>`${k}/ (${Object.keys(v).length})`).join('  ')+'\n';break;
    case'uptime':output.innerText+=`⏱️ ${Math.floor((Date.now()-AETHER_BOOT)/1000)}s\n`;break;
    case'alias':if(!args.length){const k=Object.keys(f.aliases);output.innerText+=(k.length?k.map(x=>`${x} = ${f.aliases[x]}`).join('\n'):'No aliases.')+'\n';}else{const m=args.join(' ').match(/^([\w-]+)\s*=\s*["']?(.+?)["']?$/);if(m){f.aliases[m[1]]=m[2];saveFunConfig(f);output.innerText+=`Alias ${m[1]} saved.\n`;}}break;
    case'unalias':if(args[0]){delete f.aliases[args[0]];saveFunConfig(f);output.innerText+='Alias removed.\n';}break;
    default:return false;
  }
  return true;
}

/* ============ Aura Chat ============ */
function renderAuraChat(body,winId){
  const model=getAIModel();
  const puterReady = typeof puter !== 'undefined';
  const narrow = window.innerWidth <= 700;
  body.innerHTML=`
    <div style="display:flex;flex-direction:column;flex:1;min-height:0;background:radial-gradient(circle at top, rgba(6,182,212,.06), transparent 60%);">
      <div style="display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid var(--glass-border);flex-shrink:0;background:rgba(15,23,42,.5);flex-wrap:wrap;">
        <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--aura-cyan));display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 0 20px var(--aura-cyan-glow);">🤖</div>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:700;font-size:13px;">Aura Chat</div>
          <div id="ai-status-${winId}" style="font-size:10px;color:var(--text-muted);">${puterReady ? 'Ready' : 'Local AI (Puter not loaded)'}</div>
        </div>
        <select id="ai-model-${winId}" title="Model" style="background:rgba(0,0,0,.4);border:1px solid var(--glass-border);border-radius:6px;padding:6px 8px;color:#fff;font-size:11px;outline:none;max-width:${narrow?'120px':'200px'};" aria-label="Model">
          ${AI_MODELS.map(m=>`<option value="${m.id}" ${m.id===model?'selected':''}>${m.name}</option>`).join('')}
        </select>
        <button class="mini-btn" id="ai-settings-${winId}" title="System prompt" aria-label="Settings">⚙️</button>
        <button class="mini-btn" id="ai-export-${winId}" title="Export" aria-label="Export">⬇</button>
        <button class="mini-btn danger" id="ai-clear-${winId}" title="Clear" aria-label="Clear">🗑️</button>
      </div>
      <div id="ai-msgs-${winId}" style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:16px;display:flex;flex-direction:column;gap:12px;min-height:0;"></div>
      <div id="ai-quick-${winId}" style="display:flex;gap:6px;padding:8px 12px;overflow-x:auto;-webkit-overflow-scrolling:touch;border-top:1px solid var(--glass-border);background:rgba(0,0,0,.2);flex-shrink:0;"></div>
      <div style="display:flex;gap:8px;padding:10px 12px;border-top:1px solid var(--glass-border);background:rgba(0,0,0,.2);flex-shrink:0;align-items:flex-end;">
        <textarea id="ai-in-${winId}" placeholder="Ask Aura anything…" rows="1" style="flex:1;background:rgba(0,0,0,.4);border:1px solid var(--glass-border);border-radius:12px;padding:10px 14px;color:#fff;font-size:14px;outline:none;resize:none;font-family:inherit;max-height:120px;line-height:1.4;touch-action:auto;" aria-label="Message"></textarea>
        <button class="mini-btn primary" id="ai-send-${winId}" style="padding:10px 16px;border-radius:12px;font-size:13px;">Send</button>
      </div>
    </div>`;
  const msgs=document.getElementById(`ai-msgs-${winId}`),input=document.getElementById(`ai-in-${winId}`),status=document.getElementById(`ai-status-${winId}`),quick=document.getElementById(`ai-quick-${winId}`);
  input.addEventListener('input',()=>{input.style.height='auto';input.style.height=Math.min(120,input.scrollHeight)+'px';});
  const appendMessage=(role,content,id)=>{
    const isUser=role==='user';
    const el=document.createElement('div');
    el.dataset.msgId=id||'';
    el.style.cssText=`display:flex;gap:10px;max-width:100%;${isUser?'flex-direction:row-reverse;':''}`;
    const avatar=isUser?`<div style="width:30px;height:30px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;">👤</div>`:`<div style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--aura-cyan));display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;">🤖</div>`;
    const formatted=sanitizeHTML(content).replace(/```([\s\S]*?)```/g,(_,c)=>`<pre style="background:rgba(0,0,0,.5);padding:10px;border-radius:8px;overflow:auto;margin:8px 0;font-family:ui-monospace,monospace;font-size:11px;white-space:pre-wrap;">${c.trim()}</pre>`).replace(/`([^`\n]+)`/g,'<code style="background:rgba(0,0,0,.4);padding:2px 5px;border-radius:4px;font-family:ui-monospace,monospace;font-size:11px;">$1</code>').replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/\n/g,'<br>');
    el.innerHTML=`${avatar}<div style="flex:1;min-width:0;background:${isUser?'var(--accent)':'rgba(255,255,255,.05)'};border:1px solid ${isUser?'transparent':'var(--glass-border)'};border-radius:12px;padding:10px 14px;font-size:13px;line-height:1.55;color:${isUser?'#fff':'var(--text-main)'};word-break:break-word;">${formatted}<div style="display:flex;gap:4px;margin-top:6px;justify-content:flex-end;opacity:.7;"><button class="mini-btn" style="padding:4px 8px;font-size:10px;background:transparent;border:none;color:${isUser?'#fff':'var(--text-muted)'};" data-copy-msg="${id}">📋 Copy</button></div></div>`;
    msgs.appendChild(el);
    el.querySelector('[data-copy-msg]').onclick=async()=>{try{await navigator.clipboard.writeText(content);toast('Copied','Message copied.','success',1500);}catch(e){}};
    msgs.scrollTop=msgs.scrollHeight;
    return el;
  };
  const appendTyping=()=>{
    const el=document.createElement('div');
    el.id=`ai-typing-${winId}`;
    el.style.cssText='display:flex;gap:10px;max-width:100%;';
    el.innerHTML=`<div style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--aura-cyan));display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;">🤖</div><div style="background:rgba(255,255,255,.05);border:1px solid var(--glass-border);border-radius:12px;padding:12px 16px;display:flex;gap:5px;align-items:center;"><span style="width:6px;height:6px;border-radius:50%;background:var(--aura-cyan);animation:aiBounce 1.2s infinite;"></span><span style="width:6px;height:6px;border-radius:50%;background:var(--aura-cyan);animation:aiBounce 1.2s infinite .2s;"></span><span style="width:6px;height:6px;border-radius:50%;background:var(--aura-cyan);animation:aiBounce 1.2s infinite .4s;"></span></div>`;
    msgs.appendChild(el);
    msgs.scrollTop=msgs.scrollHeight;
  };
  const removeTyping=()=>{const el=document.getElementById(`ai-typing-${winId}`);if(el)el.remove();};
  const history=getAIHistory();
  if(history.length===0){
    appendMessage('assistant','Hi! I\'m **Aura**, your AetherOS AI assistant. 👋\n\nI run on **Puter.js**.\n\nTip: right-click (or long-press) any file in Files → "Ask Aura".');
  }else{
    history.forEach(h=>appendMessage(h.role,h.content,h.id));
  }
  const QUICK=['💡 Explain quantum computing','🐍 Python hello world','✍️ Haiku about coding','🧠 What is recursion?','🎨 Color palette ideas','📝 Summarize AetherOS'];
  quick.innerHTML=QUICK.map(q=>`<button class="mini-btn" data-q="${sanitizeHTML(q)}" style="flex-shrink:0;font-size:11px;white-space:nowrap;">${q}</button>`).join('');
  quick.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>{input.value=b.dataset.q.replace(/^[^\s]+\s/,'');send();});
  let sending=false;
  const send=async()=>{
    if(sending)return;
    const text=input.value.trim();
    if(!text)return;
    input.value='';input.style.height='auto';
    sending=true;
    status.textContent='Thinking…';status.style.color='var(--aura-cyan)';
    const uid='m-'+Date.now();
    const userMsg={id:uid,role:'user',content:text,time:new Date().toISOString()};
    appendMessage('user',text,uid);
    const h=getAIHistory();h.push(userMsg);saveAIHistory(h);
    appendTyping();
    try{
      const reply=await callAuraAI(text);
      removeTyping();
      const aid='m-'+(Date.now()+1);
      const aiMsg={id:aid,role:'assistant',content:reply,time:new Date().toISOString()};
      appendMessage('assistant',reply,aid);
      const h2=getAIHistory();h2.push(aiMsg);saveAIHistory(h2);
      status.textContent='Ready';
      status.style.color='var(--text-muted)';
    }catch(e){
      removeTyping();
      appendMessage('assistant','⚠️ Something went wrong: '+e.message);
      status.textContent='Error';status.style.color='#f87171';
    }
    sending=false;
  };
  document.getElementById(`ai-send-${winId}`).onclick=send;
  input.addEventListener('keydown',(e)=>{if(e.key==='Enter'&&!e.shiftKey&&!IS_TOUCH){e.preventDefault();send();}});
  document.getElementById(`ai-model-${winId}`).onchange=(e)=>{
    setAIModel(e.target.value);
    toast('Aura','Model: '+(AI_MODELS.find(m=>m.id===e.target.value)?.name||e.target.value),'info',2000);
    status.textContent='Ready · '+AI_MODELS.find(m=>m.id===e.target.value)?.name;
  };
  document.getElementById(`ai-clear-${winId}`).onclick=()=>{if(!confirm('Clear chat history?'))return;saveAIHistory([]);renderAuraChat(body,winId);toast('Aura','Chat cleared.','info',1800);};
  document.getElementById(`ai-export-${winId}`).onclick=()=>{
    const hist=getAIHistory();
    const md=`# Aura Chat Export\n\n_Exported ${new Date().toLocaleString()}_\n\n---\n\n`+hist.map(m=>`**${m.role==='user'?'👤 You':'🤖 Aura'}:**\n\n${m.content}\n`).join('\n---\n\n');
    const blob=new Blob([md],{type:'text/markdown'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download=`aura-chat-${Date.now()}.md`;a.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    toast('Aura','Chat exported.','success',2000);
  };
  document.getElementById(`ai-settings-${winId}`).onclick=()=>{
    const cur=getAISystem();
    const next=prompt('System prompt:',cur);
    if(next&&next.trim()){setAISystem(next.trim());toast('Aura','System prompt updated.','success',2000);}
  };
  if (!IS_TOUCH) input.focus();
}

/* ============ Media Player ============ */
function renderMediaPlayer(body, winId, meta) {
  const isNarrow = window.innerWidth <= 700;
  
  body.innerHTML = `
    <div style="display:flex;flex-direction:${isNarrow?'column':'row'};flex:1;min-height:0;background:#050505;">
      <div style="width:${isNarrow?'100%':'220px'};background:rgba(15,23,42,.8);border-${isNarrow?'bottom':'right'}:1px solid var(--glass-border);display:flex;flex-direction:column;max-height:${isNarrow?'200px':'none'};">
        <div style="padding:12px;border-bottom:1px solid var(--glass-border);display:flex;justify-content:space-between;align-items:center;">
          <span style="font-weight:700;font-size:13px;">🎵 Playlist</span>
          <button class="mini-btn" id="mp-add-${winId}">+ Add</button>
          <input type="file" id="mp-upload-${winId}" accept="audio/*,video/*" style="display:none">
        </div>
        <div id="mp-list-${winId}" style="flex:1;overflow:auto;padding:8px;display:flex;flex-direction:column;gap:4px;"></div>
      </div>
      
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;position:relative;">
        <div id="mp-media-container-${winId}" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;">
          <div class="empty-state">No media loaded. Click "+ Add" or select a file.</div>
        </div>
        
        <div style="width:100%;max-width:600px;margin-top:16px;background:rgba(0,0,0,.4);border:1px solid var(--glass-border);border-radius:12px;padding:12px;display:flex;flex-direction:column;gap:8px;">
          <div style="font-size:14px;font-weight:700;text-align:center;" id="mp-title-${winId}">No Track</div>
          <div style="display:flex;align-items:center;gap:10px;font-size:11px;color:var(--text-muted);">
            <span id="mp-curr-${winId}">0:00</span>
            <input type="range" id="mp-seek-${winId}" value="0" max="100" style="flex:1;accent-color:var(--aura-cyan);" disabled>
            <span id="mp-dur-${winId}">0:00</span>
          </div>
          <div style="display:flex;justify-content:center;gap:16px;">
            <button class="mini-btn" id="mp-play-${winId}" style="width:48px;height:48px;border-radius:50%;font-size:18px;">▶</button>
            <button class="mini-btn" id="mp-stop-${winId}" style="width:48px;height:48px;border-radius:50%;font-size:16px;">⏹</button>
          </div>
        </div>
      </div>
    </div>
  `;

  const listEl = document.getElementById(`mp-list-${winId}`);
  const container = document.getElementById(`mp-media-container-${winId}`);
  const titleEl = document.getElementById(`mp-title-${winId}`);
  const seekEl = document.getElementById(`mp-seek-${winId}`);
  const currEl = document.getElementById(`mp-curr-${winId}`);
  const durEl = document.getElementById(`mp-dur-${winId}`);
  const playBtn = document.getElementById(`mp-play-${winId}`);
  const stopBtn = document.getElementById(`mp-stop-${winId}`);
  
  let mediaEl = null;

  const getMediaFiles = () => {
    const files = [];
    ['music','pictures','downloads','home','documents'].forEach(folder => {
      Object.keys(VFS[folder] || {}).forEach(name => {
        const content = VFS[folder][name];
        const isMediaExt = /\.(mp3|wav|flac|m4a|aac|wma|ogg|mid|midi|aif|aiff|m3u|mp4|mkv|mov|avi|wmv|flv|webm|mpeg|mpg|vob|3gp)$/i.test(name);
        const isMediaData = typeof content === 'string' && (content.startsWith('data:audio/') || content.startsWith('data:video/'));
        
        if (isMediaExt || isMediaData) {
          files.push({ folder, name, content: VFS[folder][name] });
        }
      });
    });
    return files;
  };

  const fmtTime = (s) => {
    if (!s || !isFinite(s)) return '0:00';
    const m = Math.floor(s / 60), sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const loadMedia = (fileObj) => {
    if (mediaEl) { mediaEl.pause(); mediaEl = null; }
    container.innerHTML = '';
    
    const ext = fileObj.name.split('.').pop().toLowerCase();
    const isVideo = /^(mp4|mkv|mov|avi|wmv|flv|webm|mpeg|mpg|vob|3gp)$/.test(ext) || (typeof fileObj.content === 'string' && fileObj.content.startsWith('data:video/'));

    if (isVideo) {
      mediaEl = document.createElement('video');
      mediaEl.style.cssText = 'max-width:100%; max-height:100%; border-radius:8px; box-shadow:0 10px 30px rgba(0,0,0,.5);';
      mediaEl.controls = false;
    } else {
      mediaEl = document.createElement('audio');
      container.innerHTML = `<div style="font-size:80px; filter:drop-shadow(0 0 20px var(--aura-cyan));">🎵</div>`;
    }

    mediaEl.src = fileObj.content;
    mediaEl.autoplay = true;
    if (isVideo) container.appendChild(mediaEl);

    titleEl.textContent = fileObj.name;
    playBtn.textContent = '⏸';
    seekEl.disabled = false;

    mediaEl.addEventListener('timeupdate', () => {
      currEl.textContent = fmtTime(mediaEl.currentTime);
      durEl.textContent = fmtTime(mediaEl.duration);
      if (mediaEl.duration) seekEl.value = (mediaEl.currentTime / mediaEl.duration) * 100;
    });
    
    mediaEl.addEventListener('ended', () => {
      playBtn.textContent = '▶';
    });

    playBtn.onclick = () => {
      if (mediaEl.paused) { mediaEl.play(); playBtn.textContent = '⏸'; }
      else { mediaEl.pause(); playBtn.textContent = '▶'; }
    };
    
    stopBtn.onclick = () => {
      mediaEl.pause(); mediaEl.currentTime = 0; playBtn.textContent = '▶';
    };

    seekEl.oninput = () => {
      if (mediaEl.duration) mediaEl.currentTime = (seekEl.value / 100) * mediaEl.duration;
    };
  };

  const renderList = () => {
    const files = getMediaFiles();
    if (!files.length) {
      listEl.innerHTML = '<div class="empty-state" style="font-size:11px;">No media in VFS.</div>';
      return;
    }
    listEl.innerHTML = files.map((f, i) => `
      <div class="mini-btn" data-media-idx="${i}" style="text-align:left;padding:8px;display:flex;align-items:center;gap:8px;cursor:pointer;overflow:hidden;">
        <span style="font-size:16px;">${f.name.match(/\.(mp4|mkv|mov|avi|wmv|flv|webm|mpeg|mpg|vob|3gp)$/i) || (typeof f.content === 'string' && f.content.startsWith('data:video/')) ? '📺':'🎵'}</span>
        <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:normal;">${sanitizeHTML(f.name)}</span>
      </div>
    `).join('');
    
    listEl.querySelectorAll('[data-media-idx]').forEach(el => {
      el.onclick = () => loadMedia(files[+el.dataset.mediaIdx]);
    });
  };

  document.getElementById(`mp-add-${winId}`).onclick = () => document.getElementById(`mp-upload-${winId}`).click();
  document.getElementById(`mp-upload-${winId}`).onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      VFS.music[file.name] = ev.target.result;
      saveUserVFS();
      renderList();
      loadMedia({ folder: 'music', name: file.name, content: ev.target.result });
      toast('Media Added', file.name, 'success', 2000);
    };
    reader.readAsDataURL(file);
  };

  renderList();

  if (meta && meta.file) {
    const targetFile = getMediaFiles().find(f => f.name === meta.file && f.folder === (meta.folder || 'music'));
    if (targetFile) {
        loadMedia(targetFile);
    }
  }
}
/* ============ Aura Paint ============ */
function renderPaint(body, winId) {
  body.innerHTML = `
    <div style="display:flex; flex-direction:column; flex:1; padding:10px; background:#1e293b;">
      <div class="iv-toolbar" style="margin-bottom:10px;">
        <input type="color" id="paint-color-${winId}" value="#06b6d4" class="color-input" style="width:40px; height:32px; padding:0; border:none;">
        <input type="range" id="paint-size-${winId}" min="1" max="30" value="5" style="flex:1; accent-color:var(--aura-cyan);">
        <button class="mini-btn" id="paint-clear-${winId}">Clear</button>
        <button class="mini-btn primary" id="paint-save-${winId}">💾 Save</button>
      </div>
      <canvas id="paint-canvas-${winId}" style="flex:1; background:#fff; cursor:crosshair; border-radius:8px;"></canvas>
    </div>`;
  
  const canvas = document.getElementById(`paint-canvas-${winId}`);
  const ctx = canvas.getContext('2d');
  let drawing = false;
  
  const resize = () => { canvas.width = canvas.clientWidth; canvas.height = canvas.clientHeight; ctx.fillStyle='#fff'; ctx.fillRect(0,0,canvas.width,canvas.height); };
  setTimeout(resize, 100); 
  
  const draw = (e) => {
    if(!drawing) return;
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  
  canvas.addEventListener('pointerdown', (e) => {
    drawing = true;
    ctx.beginPath();
    ctx.moveTo(e.clientX - canvas.getBoundingClientRect().left, e.clientY - canvas.getBoundingClientRect().top);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = document.getElementById(`paint-color-${winId}`).value;
    ctx.lineWidth = document.getElementById(`paint-size-${winId}`).value;
    draw(e);
  });
  canvas.addEventListener('pointermove', draw);
  canvas.addEventListener('pointerup', () => drawing = false);
  canvas.addEventListener('pointerleave', () => drawing = false);
  
  document.getElementById(`paint-clear-${winId}`).onclick = resize;
  document.getElementById(`paint-save-${winId}`).onclick = () => {
    const data = canvas.toDataURL('image/png');
    const name = `drawing-${Date.now()}.png`;
    VFS.pictures[name] = data;
    saveUserVFS();
    toast('Paint', 'Saved to Pictures!', 'success', 2000);
  };
}

/* ============ Camera ============ */
function renderCamera(body, winId) {
  body.innerHTML = `
    <div style="display:flex; flex-direction:column; flex:1; background:#000; align-items:center;">
      <video id="cam-video-${winId}" autoplay playsinline style="flex:1; max-width:100%; object-fit:cover; border-radius:0 0 8px 8px;"></video>
      <div style="padding:10px; display:flex; gap:10px;">
        <button class="mini-btn primary" id="cam-snap-${winId}">📸 Take Photo</button>
      </div>
    </div>`;
    
  const video = document.getElementById(`cam-video-${winId}`);
  navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then(stream => { video.srcObject = stream; })
    .catch(err => { toast('Camera', 'Access denied or no camera found.', 'error', 3000); });
    
  document.getElementById(`cam-snap-${winId}`).onclick = () => {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const data = canvas.toDataURL('image/png');
    const name = `photo-${Date.now()}.png`;
    VFS.pictures[name] = data;
    saveUserVFS();
    toast('Camera', 'Photo saved to Pictures!', 'success', 2000);
  };
}

/* ============ Beat Maker (Synth) ============ */
function renderSynth(body, winId) {
  body.innerHTML = `
    <div class="app-pad" style="flex:1; justify-content:center; align-items:center;">
      <h3>🎹 Beat Maker</h3>
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px; margin-top:20px;">
        <button class="mini-btn primary" data-freq="261.63">Do (C4)</button>
        <button class="mini-btn primary" data-freq="293.66">Re (D4)</button>
        <button class="mini-btn primary" data-freq="329.63">Mi (E4)</button>
        <button class="mini-btn primary" data-freq="349.23">Fa (F4)</button>
        <button class="mini-btn primary" data-freq="392.00">Sol (G4)</button>
        <button class="mini-btn primary" data-freq="440.00">La (A4)</button>
        <button class="mini-btn primary" data-freq="493.88">Si (B4)</button>
        <button class="mini-btn primary" data-freq="523.25">Do (C5)</button>
      </div>
    </div>`;
  body.querySelectorAll('[data-freq]').forEach(btn => {
    btn.onclick = () => beep(parseFloat(btn.dataset.freq), 300, 'square', 0.05);
  });
}
/* ============ Power Menu Logic ============ */
function initPowerMenu() {
  const btnPower = document.getElementById('tray-power');
  const popup = document.getElementById('power-menu-popup');
  
  if (!btnPower || !popup) return;

  // Toggle menu
  btnPower.onclick = (e) => {
    e.stopPropagation();
    popup.classList.toggle('open');
  };

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!popup.contains(e.target) && !btnPower.contains(e.target)) {
      popup.classList.remove('open');
    }
  });

  // Sleep (Triggers the screensaver manually)
  document.getElementById('power-sleep').onclick = () => {
    popup.classList.remove('open');
    const screensaver = document.getElementById('screensaver');
    if (screensaver) screensaver.style.display = 'flex';
    sfx.click();
  };

  // Restart
  document.getElementById('power-restart').onclick = () => {
    popup.classList.remove('open');
    sfx.click();
    setTimeout(() => location.reload(), 200);
  };

  // Shut Down
  document.getElementById('power-shutdown').onclick = () => {
    popup.classList.remove('open');
    sfx.click();
    const shutdown = document.getElementById('shutdown-screen');
    if (shutdown) shutdown.style.display = 'flex';
  };

  // ✅ FIX FOR THE SHUTDOWN SCREEN CSP ERROR
  const restartBtn = document.getElementById('shutdown-restart-btn');
  if (restartBtn) {
    restartBtn.onclick = () => location.reload();
  }
}
/* ============ Widgets & Screensaver ============ */
function initWidgets() {
  const timeEl = document.getElementById('widget-time');
  const dateEl = document.getElementById('widget-date');
  if(!timeEl) return;
  const updateWidgets = () => {
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    dateEl.textContent = now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  };
  updateWidgets();
  setInterval(updateWidgets, 10000); 
}

function initScreensaver() {
  let idleTimer;
  const screensaver = document.getElementById('screensaver');
  const logo = document.getElementById('screensaver-logo');
  if(!screensaver) return;
  let vx = 2, vy = 2, x = 100, y = 100;

  const resetTimer = () => {
    if (screensaver.style.display === 'flex') return;
    clearTimeout(idleTimer);
    idleTimer = setTimeout(showScreensaver, 60000); 
  };

  const showScreensaver = () => {
    screensaver.style.display = 'flex';
    x = Math.random() * window.innerWidth; y = Math.random() * window.innerHeight;
    moveLogo();
  };

  const moveLogo = () => {
    if (screensaver.style.display !== 'flex') return;
    x += vx; y += vy;
    if (x <= 0 || x >= window.innerWidth - 80) vx *= -1;
    if (y <= 0 || y >= window.innerHeight - 80) vy *= -1;
    logo.style.left = x + 'px'; logo.style.top = y + 'px';
    requestAnimationFrame(moveLogo);
  };

  screensaver.addEventListener('click', () => { screensaver.style.display = 'none'; resetTimer(); });
  document.addEventListener('mousemove', resetTimer);
  document.addEventListener('keydown', resetTimer);
  resetTimer();
}

window.minimizeWindow=minimizeWindow;
window.maximizeWindow=maximizeWindow;
window.closeWindow=closeWindow;
/* ============ Floating Quick Search Panel ============ */
function openQuickSearchPanel() {
  const panel = document.getElementById('quick-search-panel');
  panel.style.display = 'flex';
  
  // Bring to front
  panel.style.zIndex = ++zIndexCounter + 10000000;
  
  // Focus input
  setTimeout(() => document.getElementById('qs-input').focus(), 100);
}

// Drag logic for the floating panel
let qsDrag = null;
const qsHeader = document.getElementById('qs-header');
const qsPanel = document.getElementById('quick-search-panel');

if (qsHeader && qsPanel) {
  qsHeader.addEventListener('pointerdown', (e) => {
    // Don't drag if clicking the window controls
    if (e.target.closest('.window-controls')) return;
    
    qsDrag = {
      ox: e.clientX - qsPanel.offsetLeft,
      oy: e.clientY - qsPanel.offsetTop
    };
    qsHeader.setPointerCapture(e.pointerId);
  });

  qsHeader.addEventListener('pointermove', (e) => {
    if (!qsDrag) return;
    e.preventDefault();
    qsPanel.style.left = Math.max(0, e.clientX - qsDrag.ox) + 'px';
    qsPanel.style.top = Math.max(0, e.clientY - qsDrag.oy) + 'px';
  });

  qsHeader.addEventListener('pointerup', () => { qsDrag = null; });
  qsHeader.addEventListener('pointercancel', () => { qsDrag = null; });

  // Window Controls Logic
  document.getElementById('qs-min').onclick = () => { 
    qsPanel.style.display = 'none'; 
  };

  document.getElementById('qs-max').onclick = () => {
    if (qsPanel.dataset.maximized === 'true') {
      // RESTORE
      qsPanel.dataset.maximized = 'false';
      qsPanel.style.width = '500px'; 
      qsPanel.style.height = '600px';
      qsPanel.style.top = '50px'; 
      qsPanel.style.left = '50px';
      qsPanel.style.maxWidth = '90vw';  // Restore the limits
      qsPanel.style.maxHeight = '80vh';
      qsPanel.style.borderRadius = '12px';
      qsPanel.style.resize = 'both';
    } else {
      // MAXIMIZE (Mimics standard .window.maximized)
      qsPanel.dataset.maximized = 'true';
      qsPanel.style.width = '100vw'; 
      qsPanel.style.height = 'calc(100dvh - var(--taskbar-h))';
      qsPanel.style.top = '0px'; 
      qsPanel.style.left = '0px';
      qsPanel.style.maxWidth = 'none';  // Remove limits so it goes full screen
      qsPanel.style.maxHeight = 'none';
      qsPanel.style.borderRadius = '0px'; // Remove rounded corners
      qsPanel.style.resize = 'none'; // Disable manual resizing when maximized
    }
  };

  document.getElementById('qs-close').onclick = () => {
    qsPanel.style.display = 'none';
    document.getElementById('qs-iframe').style.display = 'none';
    document.getElementById('qs-iframe').src = '';
    
    // Reset back to default state for the next time it opens
    qsPanel.dataset.maximized = 'false';
    qsPanel.style.width = '500px'; 
    qsPanel.style.height = '600px';
    qsPanel.style.top = '50px'; 
    qsPanel.style.left = '50px';
    qsPanel.style.maxWidth = '90vw';
    qsPanel.style.maxHeight = '80vh';
    qsPanel.style.borderRadius = '12px';
    qsPanel.style.resize = 'both';
  };

  // Search logic
  const performSearch = () => {
    let q = document.getElementById('qs-input').value.trim();
    if (!q) return;
    
    // If it doesn't look like a URL, search it on Google
    if (!q.startsWith('http') && !q.includes('.')) {
      q = 'https://www.google.com/search?igu=1&q=' + encodeURIComponent(q);
    } else if (!q.startsWith('http')) {
      q = 'https://' + q;
    }
    
    const iframe = document.getElementById('qs-iframe');
    iframe.src = q;
    iframe.style.display = 'block';
  };

  document.getElementById('qs-go').onclick = performSearch;
  document.getElementById('qs-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') performSearch();
  });
}