/* ============================================================
 * util.js — DOM helpers, icons, storage, theme and site config.
 * Same idiom as the DSD simulator's web/util.js.
 * ============================================================ */
(function () {
  'use strict';
  const DSA = (window.DSA = window.DSA || {});
  const UI = (DSA.UI = {});
  const SVGNS = 'http://www.w3.org/2000/svg';

  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (k === 'html') el.innerHTML = v;
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat(Infinity)) {
      if (kid == null || kid === false) continue;
      el.appendChild(typeof kid === 'string' || typeof kid === 'number' ? document.createTextNode(String(kid)) : kid);
    }
    return el;
  }
  function s(tag, attrs, ...kids) {
    const el = document.createElementNS(SVGNS, tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      el.setAttribute(k, v);
    }
    for (const kid of kids.flat(Infinity)) {
      if (kid == null || kid === false) continue;
      el.appendChild(typeof kid === 'string' || typeof kid === 'number' ? document.createTextNode(String(kid)) : kid);
    }
    return el;
  }
  const clean = (kids) => kids.flat(Infinity).filter((k) => k != null && k !== false).map((k) => (typeof k === 'object' ? k : document.createTextNode(String(k))));
  UI.fill = (el, ...kids) => { el.replaceChildren(...clean(kids)); return el; };
  UI.h = h; UI.s = s;
  UI.esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- storage (always guarded) ---------- */
  UI.store = {
    get(k, d) { try { const v = localStorage.getItem('dsa.v1.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('dsa.v1.' + k, JSON.stringify(v)); } catch (e) { /* private mode: memory only */ } },
  };

  /* ---------- icons (stroke style, as in BitHub) ---------- */
  const ICONS = {
    book: '<path d="M4 19.5V15a2 2 0 0 1 2-2h14M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V17"/><path d="M6 2v11"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    right: '<polyline points="9 18 15 12 9 6"/>',
    left: '<polyline points="15 18 9 12 15 6"/>',
    down: '<polyline points="6 9 12 15 18 9"/>',
    play: '<polygon points="6 4 20 12 6 20 6 4" fill="currentColor"/>',
    pause: '<rect x="6" y="4" width="4" height="16" fill="currentColor"/><rect x="14" y="4" width="4" height="16" fill="currentColor"/>',
    stepf: '<polygon points="5 4 15 12 5 20 5 4" fill="currentColor"/><line x1="19" y1="5" x2="19" y2="19"/>',
    stepb: '<polygon points="19 20 9 12 19 4 19 20" fill="currentColor"/><line x1="5" y1="19" x2="5" y2="5"/>',
    replay: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',
    code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
    slides: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M12 16v4M8 20h8"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    list: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>',
    pencil: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    expand: '<path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/>',
    link: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>',
    clock: '<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/>',
    layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
    zip: '<path d="M21 8v13H3V3h13z"/><path d="M10 3v4M10 9v2M10 13v2"/>',
    video: '<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>',
    terminal: '<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>',
    bulb: '<path d="M9 18h6M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.800 1-2.300A7 7 0 0 0 12 2Z"/>',
  };
  UI.icon = (name, cls) => {
    const el = s('svg', { class: cls || 'ic', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' });
    el.innerHTML = ICONS[name] || '';
    return el;
  };

  /* ---------- site config ---------- */
  const qs = new URLSearchParams(location.search);
  DSA.EMBED = qs.get('from') === 'bithub' || /\/dsa\/?(index\.html)?$/.test(location.pathname) && !/^(localhost|127\.)/.test(location.hostname) && qs.get('from') !== 'standalone';
  // Backend that serves /study-material. js/env.js (written by the Vite build from VITE_API_BASE_URL, the same
  // value as src/config.js API_BASE) sets window.DSA_API, so a backend move only changes .env.production.
  // ?api= overrides it for testing; without either, localhost uses a local backend and anything else the same origin.
  const LOCAL = /^(localhost|127\.|\[::1\])/.test(location.hostname);
  const DEFAULT_API = typeof window.DSA_API === 'string' ? window.DSA_API : LOCAL ? 'http://localhost:3001' : '';
  let api = qs.get('api');
  try { if (api) sessionStorage.setItem('dsa.api', api); else api = sessionStorage.getItem('dsa.api'); } catch (e) { /* ignore */ }
  DSA.API = (api && /^https?:\/\//.test(api) ? api : DEFAULT_API).replace(/\/$/, '');
  DSA.material = (path) => DSA.API + '/study-material/CS24201/' + path.split('/').map(encodeURIComponent).join('/');

  /* ---------- theme (BitHub uses html[data-theme]) ---------- */
  DSA.theme = qs.get('theme') === 'dark' || qs.get('theme') === 'light' ? qs.get('theme') : UI.store.get('theme', 'light');
  DSA.applyTheme = () => { document.documentElement.setAttribute('data-theme', DSA.theme); UI.store.set('theme', DSA.theme); };
  DSA.applyTheme();

  /* ---------- small helpers ---------- */
  UI.toast = (msg) => {
    let t = document.querySelector('.toast');
    if (!t) { t = h('div', { class: 'toast', role: 'status' }); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show');
    clearTimeout(UI.toast.t); UI.toast.t = setTimeout(() => t.classList.remove('show'), 2600);
  };
  UI.fmtSize = (b) => (b >= 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB');
  UI.fmtTime = (sec) => Math.floor(sec / 60) + ':' + String(Math.floor(sec % 60)).padStart(2, '0');
  UI.rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
})();
