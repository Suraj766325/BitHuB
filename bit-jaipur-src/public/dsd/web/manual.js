/* ============================================================
 * manual.js — lab-manual viewer. Shows the pages of the current
 * experiment (pre-rendered from the PDF, so it works offline and
 * on phones), with zoom, page navigation and the original PDF.
 * ============================================================ */
(function () {
  'use strict';
  const DSD = window.DSD, UI = DSD.UI, { h } = UI;
  const TOTAL = 31;

  UI.openManual = (exp) => {
    let scope = 'exp', zoom = UI.store.get('manualZoom', 1);
    const pagesOf = () => (scope === 'exp' ? exp.pages : Array.from({ length: TOTAL }, (_, i) => i + 1));
    const thumbs = h('div', { class: 'pdf-thumbs' });
    const pages = h('div', { class: 'pdf-pages' });
    const pageLbl = h('span', { class: 'pdf-page-lbl' });
    const pdfLink = h('a', { class: 'dsd-btn ghost small', target: '_blank', rel: 'noopener' }, UI.icon('download'), 'Original PDF');
    const scopeSel = h('div', { class: 'dsd-seg' },
      h('button', { class: 'dsd-seg-btn active', onclick: (e) => setScope('exp', e.currentTarget) }, 'This experiment'),
      h('button', { class: 'dsd-seg-btn', onclick: (e) => setScope('all', e.currentTarget) }, 'Full manual'));
    const zoomCtl = h('div', { class: 'dsd-zoom inline' },
      h('button', { class: 'dsd-icon-btn', title: 'Zoom out', 'aria-label': 'Zoom out', onclick: () => setZoom(zoom / 1.15) }, UI.icon('minus')),
      h('button', { class: 'dsd-icon-btn', title: 'Fit width', 'aria-label': 'Fit width', onclick: () => setZoom(1) }, UI.icon('fit')),
      h('button', { class: 'dsd-icon-btn', title: 'Zoom in', 'aria-label': 'Zoom in', onclick: () => setZoom(zoom * 1.15) }, UI.icon('plus')));
    const body = h('div', { class: 'pdf-viewer' }, h('div', { class: 'pdf-bar' }, scopeSel, pageLbl, h('div', { class: 'pdf-bar-right' }, zoomCtl, pdfLink)), h('div', { class: 'pdf-main' }, thumbs, pages));
    UI.modal({ title: 'Lab manual', sub: `Experiment ${exp.no} · ${exp.title}`, size: 'xl', body });

    function setScope(sc, btn) { scope = sc; body.querySelectorAll('.dsd-seg-btn').forEach((b) => b.classList.toggle('active', b === btn)); fill(); }
    function setZoom(z) { zoom = Math.max(0.6, Math.min(2.4, z)); UI.store.set('manualZoom', zoom); pages.style.setProperty('--pdf-zoom', zoom); }
    function fill() {
      const list = pagesOf();
      pdfLink.href = `manual/DSD_Lab_Manual.pdf#page=${list[0]}`;
      UI.fill(thumbs, list.map((p) => h('button', { class: 'pdf-thumb', onclick: () => pages.querySelector(`[data-p="${p}"]`).scrollIntoView({ behavior: 'smooth', block: 'start' }) },
        h('img', { src: `manual/pages/p${p}.webp`, alt: `Page ${p}`, loading: 'lazy' }), h('span', {}, p))));
      UI.fill(pages, list.map((p) => h('div', { class: 'pdf-page', 'data-p': p }, h('img', { src: `manual/pages/p${p}.webp`, alt: `Lab manual page ${p}`, loading: 'lazy', draggable: 'false' }))));
      pages.scrollTop = 0;
      setZoom(zoom); onScroll();
    }
    function onScroll() {
      const list = [...pages.children];
      const top = pages.scrollTop + 40;
      let cur = list[0];
      for (const el of list) if (el.offsetTop <= top) cur = el;
      if (!cur) return;
      const p = +cur.dataset.p;
      pageLbl.textContent = `Page ${p} of ${TOTAL}`;
      thumbs.querySelectorAll('.pdf-thumb').forEach((t) => t.classList.toggle('active', +t.textContent.replace(/\D/g, '') === p));
    }
    pages.addEventListener('scroll', onScroll, { passive: true });
    fill();
  };
})();
