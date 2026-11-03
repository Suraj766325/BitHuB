/* ============================================================
 * util.js — DOM helpers, pan/zoom, storage, tooltip, modal
 * and toast. Adapted from Better ALUU web/util.js.
 * ============================================================ */
(function () {
  'use strict';
  const DSD = window.DSD;
  const UI = (DSD.UI = {});
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
      if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v);
    }
    for (const kid of kids.flat(Infinity)) {
      if (kid == null || kid === false) continue;
      el.appendChild(typeof kid === 'string' || typeof kid === 'number' ? document.createTextNode(String(kid)) : kid);
    }
    return el;
  }
  const clean = (kids) => kids.flat(Infinity).filter((k) => k != null && k !== false).map((k) => (typeof k === 'object' ? k : document.createTextNode(String(k))));
  UI.fill = (el, ...kids) => { el.replaceChildren(...clean(kids)); return el; };
  UI.add = (el, ...kids) => { el.append(...clean(kids)); return el; };
  UI.h = h; UI.s = s;
  UI.esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- storage (always guarded) ---------- */
  UI.store = {
    get(k, d) { try { const v = localStorage.getItem('dsd.v1.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('dsd.v1.' + k, JSON.stringify(v)); } catch (e) { /* private mode: memory only */ } },
    del(k) { try { localStorage.removeItem('dsd.v1.' + k); } catch (e) { /* ignore */ } },
  };

  /* ---------- tooltip ---------- */
  let tip;
  UI.tip = (html, x, y) => {
    if (!tip) { tip = h('div', { class: 'tooltip', role: 'status' }); document.body.appendChild(tip); }
    if (!html) { tip.style.display = 'none'; return; }
    tip.innerHTML = html;
    tip.style.display = 'block';
    const r = tip.getBoundingClientRect();
    tip.style.left = Math.max(8, Math.min(window.innerWidth - r.width - 8, x + 16)) + 'px';
    tip.style.top = Math.max(8, Math.min(window.innerHeight - r.height - 8, y + 16)) + 'px';
  };

  /* ---------- toast ---------- */
  let toastEl, toastT;
  UI.toast = (msg, kind) => {
    if (!toastEl) { toastEl = h('div', { class: 'dsd-toast', role: 'status', 'aria-live': 'polite' }); document.body.appendChild(toastEl); }
    toastEl.className = 'dsd-toast show ' + (kind || '');
    toastEl.textContent = msg;
    clearTimeout(toastT);
    toastT = setTimeout(() => { toastEl.className = 'dsd-toast ' + (kind || ''); }, 3200);
  };

  /* ---------- modal (BitHub lab-modal style) ---------- */
  UI.modal = (opts) => {
    const close = () => { ov.remove(); document.removeEventListener('keydown', onKey); if (opts.onClose) opts.onClose(); };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    const box = h('div', { class: 'dsd-modal ' + (opts.size || ''), role: 'dialog', 'aria-modal': 'true', 'aria-label': opts.title },
      h('div', { class: 'dsd-modal-head' },
        h('div', { class: 'dsd-modal-titles' }, h('h2', { class: 'dsd-modal-title' }, opts.title), opts.sub ? h('div', { class: 'dsd-modal-sub' }, opts.sub) : null),
        h('div', { class: 'dsd-modal-tools' }, opts.tools || null,
          h('button', { class: 'dsd-icon-btn', title: 'Close', 'aria-label': 'Close', onclick: close }, UI.icon('close')))),
      h('div', { class: 'dsd-modal-body' }, opts.body),
      opts.actions ? h('div', { class: 'dsd-modal-actions' }, opts.actions) : null);
    const ov = h('div', { class: 'dsd-modal-overlay', onpointerdown: (e) => { if (e.target === ov) close(); } }, box);
    document.body.appendChild(ov);
    document.addEventListener('keydown', onKey);
    return { close, box, body: box.querySelector('.dsd-modal-body') };
  };
  UI.confirm = (title, text, yes, onYes) => {
    const m = UI.modal({ title, size: 'small', body: h('p', { class: 'dsd-confirm-text' }, text),
      actions: [h('button', { class: 'dsd-btn ghost', onclick: () => m.close() }, 'Cancel'), h('button', { class: 'dsd-btn primary', onclick: () => { m.close(); onYes(); } }, yes)] });
  };

  /* ---------- icons (stroke icons, 24x24) ---------- */
  const ICONS = {
    close: 'M6 6l12 12M18 6L6 18',
    power: 'M12 3v8M6.3 7.2a7.5 7.5 0 1 0 11.4 0',
    book: 'M4 19.5V5a2 2 0 0 1 2-2h13v16H6.5A2.5 2.5 0 0 0 4 21.5zM8 7h7M8 11h5',
    diagram: 'M3 6h5v4H3zM16 14h5v4h-5zM8 8h4v8h4M3 16h5M5.5 10v6',
    check: 'M5 12.5l4.5 4.5L19 7',
    eye: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    play: 'M7 5v14l11-7z',
    undo: 'M9 14L4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11',
    trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
    plus: 'M12 5v14M5 12h14', minus: 'M5 12h14', fit: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
    left: 'M15 18l-6-6 6-6', right: 'M9 18l6-6-6-6', down: 'M6 9l6 6 6-6',
    list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
    bolt: 'M13 2L4 14h7l-1 8 9-12h-7z', home: 'M3 10l9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10',
    chip: 'M7 4h10v16H7zM4 7h3M4 11h3M4 15h3M17 7h3M17 11h3M17 15h3', wave: 'M2 12h3l2-6 3 12 3-12 3 12 2-6h4',
    rotate: 'M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7', info: 'M12 8h.01M11 12h1v5h1M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z',
    copy: 'M9 9h11v11H9zM5 15H4V4h11v1', target: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
    sun: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41',
    moon: 'M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z', help: 'M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z', download: 'M12 3v12M7 10l5 5 5-5M5 21h14',
  };
  UI.icon = (name, cls) => s('svg', { viewBox: '0 0 24 24', class: 'ic ' + (cls || ''), 'aria-hidden': 'true', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, s('path', { d: ICONS[name] || '' }));

  /* ---------- pan / zoom for an <svg> (from Better ALUU) ---------- */
  class PanZoom {
    constructor(svg, box, opts) {
      this.svg = svg; this.full = { ...box }; this.vb = { ...box }; this.opts = opts || {};
      this.minW = this.opts.minW || 40; this.maxW = this.opts.maxW || box.w * 3;
      this.apply();
      const pts = new Map();
      let drag = null, pinch = null;
      svg.addEventListener('wheel', (e) => {
        e.preventDefault();
        const p = this.toSvg(e.clientX, e.clientY);
        this.zoomAt(p, Math.exp(e.deltaY * (e.ctrlKey ? 0.01 : 0.0018)));
      }, { passive: false });
      svg.addEventListener('pointerdown', (e) => {
        if (this.opts.canPan && !this.opts.canPan(e)) return;
        if (e.button !== 0 && e.pointerType === 'mouse') return;
        pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pts.size === 1) drag = { x: e.clientX, y: e.clientY, vb: { ...this.vb }, moved: false, id: e.pointerId };
        if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), vb: { ...this.vb } }; drag = null; }
      });
      svg.addEventListener('pointermove', (e) => {
        if (!pts.has(e.pointerId)) return;
        pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pinch && pts.size === 2) {
          const [a, b] = [...pts.values()];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          const c = this.toSvg((a.x + b.x) / 2, (a.y + b.y) / 2);
          this.vb = { ...pinch.vb };
          this.zoomAt(c, pinch.d / d);
          return;
        }
        if (!drag) return;
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        if (!drag.moved && Math.hypot(dx, dy) < 4) return;
        if (!drag.moved) { drag.moved = true; svg.setPointerCapture(e.pointerId); svg.classList.add('panning'); }
        const r = svg.getBoundingClientRect();
        const k = Math.max(drag.vb.w / r.width, drag.vb.h / r.height);
        this.vb.x = drag.vb.x - dx * k; this.vb.y = drag.vb.y - dy * k;
        this.apply();
      });
      const end = (e) => {
        pts.delete(e.pointerId);
        if (pts.size < 2) pinch = null;
        if (drag && drag.moved) { this.justPanned = true; setTimeout(() => (this.justPanned = false), 0); }
        if (pts.size === 0) { drag = null; svg.classList.remove('panning'); }
      };
      svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', end);
      svg.addEventListener('click', (e) => { if (this.justPanned) { e.stopPropagation(); e.preventDefault(); } }, true);
    }
    toSvg(cx, cy) {
      const pt = this.svg.createSVGPoint(); pt.x = cx; pt.y = cy;
      const m = this.svg.getScreenCTM();
      return m ? pt.matrixTransform(m.inverse()) : { x: 0, y: 0 };
    }
    zoomAt(p, f) {
      const w = Math.min(this.maxW, Math.max(this.minW, this.vb.w * f));
      const k = w / this.vb.w;
      this.vb = { x: p.x - (p.x - this.vb.x) * k, y: p.y - (p.y - this.vb.y) * k, w, h: this.vb.h * k };
      this.apply();
    }
    zoom(f) { this.zoomAt({ x: this.vb.x + this.vb.w / 2, y: this.vb.y + this.vb.h / 2 }, f); }
    fit() { this.vb = { ...this.full }; this.apply(); }
    apply() {
      const { x, y, w, h: hh } = this.vb;
      this.svg.setAttribute('viewBox', `${x} ${y} ${w} ${hh}`);
      if (this.opts.onChange) this.opts.onChange(this.vb);
    }
  }
  UI.PanZoom = PanZoom;
  UI.zoomControls = (pz) => h('div', { class: 'dsd-zoom' },
    h('button', { class: 'dsd-icon-btn', title: 'Zoom in', 'aria-label': 'Zoom in', onclick: () => pz().zoom(0.75) }, UI.icon('plus')),
    h('button', { class: 'dsd-icon-btn', title: 'Zoom out', 'aria-label': 'Zoom out', onclick: () => pz().zoom(1 / 0.75) }, UI.icon('minus')),
    h('button', { class: 'dsd-icon-btn', title: 'Fit to view', 'aria-label': 'Fit to view', onclick: () => pz().fit() }, UI.icon('fit')));

  UI.lvl = (v) => (v === 0 ? 'lo' : v === 1 ? 'hi' : v === 3 ? 'z' : 'x');
  UI.lvlText = (v) => (v === 0 ? 'LOW (0 V)' : v === 1 ? 'HIGH (5 V)' : v === 3 ? 'floating' : 'unknown / conflict');
  UI.bit = (v) => (v === 0 ? '0' : v === 1 ? '1' : v === 3 ? 'Z' : 'X');
})();
