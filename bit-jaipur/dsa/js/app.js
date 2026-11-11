/* ============================================================
 * app.js — BitHub DSA: router, pages and components.
 * Routes (hash based, so the static host never needs rewrites):
 *   #/                      home
 *   #/m/<n>[/<tab>[/<sub>]] module page; tab = slides | visualize | algorithms | practice | notes
 *   #/practice              all coding problems
 *   #/p/<id>                one problem with the online compiler
 *   #/pyq                   all previous year questions
 *   #/notes                 all notes
 *   #/play                  free online compiler
 * ============================================================ */
(function () {
  'use strict';
  const DSA = window.DSA;
  const { h, icon, fill, store, toast, esc } = DSA.UI;
  const app = document.getElementById('app');
  const MODS = DSA.modules;
  const qs = new URLSearchParams(location.search);
  const STAY = 'from=' + (DSA.EMBED ? 'bithub' : 'standalone');
  let theme = DSA.theme;
  let cleanup = [];                        // functions run when the page changes
  const onLeave = (fn) => cleanup.push(fn);

  /* ---------- small shared pieces ---------- */
  const backHref = () => (DSA.EMBED ? `../?view=jaipur&theme=${DSA.theme}` : 'https://bithub.co.in');
  const go = (hash) => { if (location.hash === hash) route(); else location.hash = hash; };

  /** Plain paragraphs, "- " bullet lists, `code`, **bold** and ``` fenced blocks. */
  DSA.rich = (text) => {
    const out = h('div', { class: 'prose' });
    String(text || '').split(/```/).forEach((chunk, i) => {
      if (i % 2) { out.appendChild(h('pre', {}, chunk.replace(/^[a-z+#]*\n/, '').replace(/\n$/, ''))); return; }
      chunk.split(/\n{2,}/).forEach((para) => {
        para = para.trim(); if (!para) return;
        const lines = para.split('\n');
        if (/^###\s/.test(lines[0])) { out.appendChild(h('h4', { html: DSA.fmt(lines[0].replace(/^###\s+/, '')) })); if (lines.length > 1) out.appendChild(DSA.rich(lines.slice(1).join('\n'))); return; }
        const tbl = lines.findIndex((l) => /^\|/.test(l));
        if (tbl > 0) { out.appendChild(DSA.rich(lines.slice(0, tbl).join('\n'))); out.appendChild(DSA.rich(lines.slice(tbl).join('\n'))); return; }
        if (tbl === 0 && lines.every((l) => /^\|/.test(l))) {
          const cells = (l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
          const rows = lines.filter((l) => !/^\|[\s|:-]+\|?$/.test(l)).map(cells);
          out.appendChild(h('div', { class: 'tbl-wrap' }, h('table', { class: 'tbl' }, h('thead', {}, h('tr', {}, rows[0].map((c) => h('th', { html: DSA.fmt(c) })))), h('tbody', {}, rows.slice(1).map((r) => h('tr', {}, r.map((c) => h('td', { html: DSA.fmt(c) }))))))));
          return;
        }
        if (lines.every((l) => /^\s*[-•]\s+/.test(l))) out.appendChild(h('ul', {}, lines.map((l) => h('li', { html: DSA.fmt(l.replace(/^\s*[-•]\s+/, '')) }))));
        else if (lines.every((l) => /^\s*\d+[.)]\s+/.test(l))) out.appendChild(h('ol', {}, lines.map((l) => h('li', { html: DSA.fmt(l.replace(/^\s*\d+[.)]\s+/, '')) }))));
        else out.appendChild(h('p', { html: DSA.fmt(para) }));
      });
    });
    return out;
  };

  const modOf = (n) => MODS.find((m) => m.n === +n);
  const diffPill = (d) => h('span', { class: 'pill ' + ({ Easy: 'good', Medium: 'warn', Hard: 'bad' }[d] || 'plain') }, d);

  function header(crumb) {
    const toggle = h('button', { class: 'theme-toggle-btn', title: `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`, 'aria-label': 'Toggle theme', onclick: () => { theme = theme === 'light' ? 'dark' : 'light'; DSA.theme = theme; DSA.applyTheme(); route(true); } },
      icon(theme === 'light' ? 'sun' : 'moon', 'toggle-icon'), h('span', { class: 'theme-toggle-slider' }, h('span', { class: 'theme-toggle-knob' })));
    const cur = (location.hash.replace(/^#\/?/, '').split('/')[0]) || '';
    const nav = [['', 'Home', ''], ['practice', 'Practice', 'practice'], ['pyq', 'Past papers', 'pyq'], ['notes', 'Notes', 'notes'], ['play', 'Compiler', 'play']];
    return h('header', { class: 'dash-header' },
      h('div', { class: 'dash-header__left' },
        h('a', { class: 'logo-container', href: backHref(), title: DSA.EMBED ? 'Back to BitHub Jaipur' : 'BitHub' }, h('div', { class: 'logo-icon-wrapper' }, icon('book', 'logo-icon')), h('span', { class: 'logo-text' }, 'BitHub')),
        h('a', { class: 'crumb', href: '#/' }, 'DSA'),
        h('nav', { class: 'top-nav', 'aria-label': 'Sections' }, nav.map(([hash, label, key]) => h('a', { href: '#/' + hash, class: (cur === key || (key === '' && cur === 'm')) ? 'on' : '' }, label)))),
      h('div', { class: 'dash-header__right' }, toggle,
        h('a', { class: 'campus-select-btn', href: backHref() }, icon('home'), h('span', {}, 'Jaipur Campus'))));
  }
  const shell = (crumb, body, wide) => { fill(app, header(crumb), h('main', { class: 'page' + (wide ? ' wide' : '') }, body)); window.scrollTo(0, 0); };

  /* ---------- code blocks (pseudocode + four languages) ---------- */
  const LANG_ORDER = [['pseudo', 'Pseudocode'], ['c', 'C'], ['cpp', 'C++'], ['java', 'Java'], ['py', 'Python 3']];
  function codeCard(item, opts) {
    opts = opts || {};
    const tabs = LANG_ORDER.filter(([k]) => (k === 'pseudo' ? item.pseudo && item.pseudo.length : item.code && item.code[k]));
    let cur = store.get('lang', 'c'); if (!tabs.some(([k]) => k === cur)) cur = tabs[0] && tabs[0][0];
    const view = h('div', { class: 'code-view' });
    const out = h('div', { class: 'io one', style: { margin: '10px' } });
    const tabBar = h('div', { class: 'code-tabs' });
    let cm = null;
    function show() {
      tabs.forEach(([k], i) => tabBar.children[i].classList.toggle('on', k === cur));
      view.replaceChildren(); cm = null;
      if (cur === 'pseudo') view.appendChild(h('pre', { class: 'pseudo' }, item.pseudo.map((l) => h('span', { class: 'l' }, l + '\n'))));
      else {
        const t = h('div'); view.appendChild(t);
        cm = CodeMirror(t, { value: item.code[cur], mode: DSA.compiler.LANGS[cur].mode, readOnly: true, lineNumbers: true, viewportMargin: Infinity });
      }
      runBtn.style.display = cur === 'pseudo' ? 'none' : '';
    }
    const runBtn = h('button', { class: 'btn small primary', title: 'Compile and run this program online', onclick: async () => {
      fill(out); out.style.display = 'grid'; fill(out, h('div', { class: 'io-box' }, h('span', {}, 'Output'), h('pre', {}, 'Running…')));
      const r = await DSA.compiler.run(cur, item.code[cur], '');
      const text = r.compileError || (r.stdout + (r.stderr ? '\n' + r.stderr : '')) || '(no output)';
      fill(out, h('div', { class: 'io-box' }, h('span', {}, r.compileError ? 'Compile error' : r.ok ? 'Output' : 'Output (exited with an error)'), h('pre', { class: r.compileError || !r.ok ? 'err' : '' }, text.trim())));
    } }, icon('play'), 'Run');
    const copyBtn = h('button', { class: 'btn small ghost', title: 'Copy', onclick: async () => { const t = cur === 'pseudo' ? item.pseudo.join('\n') : item.code[cur]; try { await navigator.clipboard.writeText(t); toast('Copied'); } catch (e) { toast('Select the code and press Ctrl+C'); } } }, icon('file'), 'Copy');
    tabs.forEach(([k, label]) => tabBar.appendChild(h('button', { class: 'code-tab', onclick: () => { cur = k; if (k !== 'pseudo') store.set('lang', k); show(); } }, label)));
    tabBar.appendChild(h('div', { class: 'code-tools' }, copyBtn, opts.noRun ? null : runBtn));
    out.style.display = 'none';
    const card = h('div', { class: 'code-card' }, tabBar, view, out);
    show();
    setTimeout(() => cm && cm.refresh(), 0);
    return card;
  }

  /* ============================================================
   * HOME
   * ============================================================ */
  function pageHome() {
    const nProblems = (DSA.problems || []).length, nPyq = (DSA.pyqs || []).length;
    const done = (DSA.problems || []).filter((p) => store.get('solved.' + p.id, false)).length;
    shell('', [
      h('div', { class: 'module-grid' }, MODS.map((m) => h('a', { class: 'card bar module-card', href: `#/m/${m.n}`, id: 'module-' + m.n },
        h('div', { class: 'module-head' }, h('span', { class: 'module-no' }, 'M' + m.n)),
        h('h2', {}, m.title), h('p', {}, m.blurb),
        h('div', { class: 'topic-chips' }, m.topics.slice(0, 6).map((t) => h('span', { class: 'topic-chip' }, t))),
        h('div', { class: 'module-foot' }, h('span', {}, `${(DSA.slides[m.n] || []).length} slides · ${m.viz.length} visualizers`), h('span', { class: 'go' }, 'Open', icon('right')))))),
      h('h2', { class: 'section-title' }, 'Practice and resources'),
      h('div', { class: 'resource-grid' },
        rowBtn('#/practice', 'code', 'Coding problems', `${nProblems} problems with an online compiler${done ? ' · ' + done + ' solved' : ''}`, true),
        rowBtn('#/pyq', 'pencil', 'Previous year questions', `${nPyq} questions from the MO23 and MO25 papers, with answers`),
        rowBtn('#/notes', 'download', 'Notes', 'Handwritten notes, textbook pages, slides and C programs'),
        rowBtn('#/play', 'terminal', 'Online compiler', 'C, C++, Java and Python 3, with your own input')),
      h('h2', { class: 'section-title' }, 'How to study a module'),
      h('div', { class: 'how-grid' },
        how('slides', 'Slides', 'Read the animated deck first: each concept appears with a picture that moves.'),
        how('eye', 'Visualize', 'Run the operations yourself with your own values and watch the pointers change.'),
        how('code', 'Algorithms', 'Pseudocode with C, C++, Java and Python 3, ready to run.'),
        how('pencil', 'Practice', 'Past paper questions, then coding problems, then a quick check.')),
      h('p', { class: 'foot' }, 'Syllabus text from the CS24201 course information sheet. ', h('a', { href: DSA.material('CS24201 Syllabus.pdf'), target: '_blank', rel: 'noopener' }, 'Open the syllabus PDF'), '.'),
    ]);
  }
  const rowBtn = (href, ic, title, sub, accent) => h('a', { class: 'row-btn' + (accent ? ' accent' : ''), href }, h('div', { class: 'row-icon' + (accent ? ' solid' : '') }, icon(ic)), h('div', { class: 'row-text' }, h('span', { class: 'row-title' }, title), h('span', { class: 'row-sub' }, sub)), icon('right', 'row-arrow'));
  const how = (ic, title, text) => h('div', { class: 'card how' }, h('b', {}, icon(ic), title), h('p', {}, text));

  /* ============================================================
   * MODULE
   * ============================================================ */
  const TABS = [['slides', 'Slides', 'slides'], ['visualize', 'Visualize', 'eye'], ['algorithms', 'Algorithms', 'code'], ['practice', 'Practice', 'pencil'], ['notes', 'Notes', 'download']];
  function pageModule(n, tab, sub) {
    const m = modOf(n); if (!m) return go('#/');
    tab = TABS.some((t) => t[0] === tab) ? tab : 'slides';
    const body = h('div', { class: 'tab-body', id: 'tab-' + tab });
    const counts = { algorithms: ((DSA.library || {})[n] || []).length, practice: (DSA.problems || []).filter((p) => p.module === m.n).length + (DSA.pyqs || []).filter((q) => q.module === m.n).length };
    shell('M' + n, [
      h('a', { class: 'back-link', href: '#/' }, icon('left'), 'All modules'),
      h('div', { class: 'mod-hero' + (tab === 'visualize' || tab === 'practice' ? ' compact' : '') },
        h('div', {}, h('div', { class: 'eyebrow' }, h('span', { class: 'pill' }, 'Module ' + n)),
          h('h1', { class: 'display title-bar' }, m.title), h('p', { class: 'syll' }, m.syllabus)),
        h('div', { class: 'mod-switch', 'aria-label': 'Switch module' }, MODS.map((x) => h('a', { href: `#/m/${x.n}/${tab}`, class: x.n === m.n ? 'on' : '', title: x.title }, x.n)))),
      h('div', { class: 'tabs', role: 'tablist' }, TABS.map(([k, label, ic]) => h('a', { class: 'tab' + (k === tab ? ' active' : '') + (k === 'notes' ? ' tab-notes' : ''), href: `#/m/${n}/${k}`, role: 'tab' }, icon(ic), label, counts[k] ? h('span', { class: 'tab-count' }, counts[k]) : null))),
      body,
    ], true);
    ({ slides: tabSlides, visualize: tabVisualize, algorithms: tabAlgorithms, practice: tabPractice, notes: tabNotes })[tab](body, m, sub);
  }

  /* ---------- slides ---------- */
  function tabSlides(host, m, sub) {
    const slides = DSA.slides[m.n] || [];
    let i = Math.min(Math.max(parseInt(sub, 10) || 0, 0), Math.max(0, slides.length - 1)), mounted = null, dir = 1;
    const frame = h('div', { class: 'deck-frame' });
    const dots = h('div', { class: 'deck-dots' }, slides.map((s, k) => h('button', { class: 'deck-dot', 'aria-label': 'Slide ' + (k + 1), onclick: () => to(k) })));
    const count = h('span', { class: 'deck-count' });
    const prev = h('button', { class: 'btn', onclick: () => to(i - 1) }, icon('left'), 'Back');
    const next = h('button', { class: 'btn primary', onclick: () => to(i + 1) }, 'Next', icon('right'));
    const replay = h('button', { class: 'btn ghost', title: 'Play the animation again', onclick: () => mounted && mounted.replay && mounted.replay() }, icon('replay'));
    const full = h('button', { class: 'btn ghost', title: 'Full screen', onclick: () => { if (document.fullscreenElement) document.exitFullscreen(); else deck.requestFullscreen && deck.requestFullscreen(); } }, icon('expand'));
    const deck = h('div', { class: 'deck' }, frame, h('div', { class: 'deck-bar' }, prev, dots, count, replay, full, next), h('p', { class: 'deck-hint' }, 'Use the ← → keys to move between slides.'));
    host.appendChild(deck);

    function bullets(list) { return h('ul', {}, list.map((b) => h('li', { html: DSA.fmt(b) }))); }
    function build(s) {
      if (s.kind === 'cover') {
        return h('div', { class: 'slide cover' + (dir < 0 ? ' back' : '') },
          h('div', { class: 'slide-kicker' }, 'Module ' + m.n), h('h2', {}, m.title), h('p', { class: 'slide-lead' }, m.long + '.'),
          h('div', { class: 'slide-cover-chips' }, m.topics.map((t, k) => h('span', { class: 'topic-chip', style: { animationDelay: 150 + k * 70 + 'ms' } }, t))));
      }
      const text = h('div', { class: 'slide-text' }, h('div', { class: 'slide-kicker' }, s.kicker || ''), h('h2', {}, s.title), s.lead ? h('p', { class: 'slide-lead', html: DSA.fmt(s.lead) }) : null, s.bullets ? bullets(s.bullets) : null,
        s.key ? h('div', { class: 'slide-key' }, icon('bulb'), h('span', { html: DSA.fmt(s.key) })) : null);
      if (s.kind === 'table') {
        return h('div', { class: 'slide solo' + (dir < 0 ? ' back' : '') }, h('div', { class: 'slide-text' }, h('div', { class: 'slide-kicker' }, s.kicker), h('h2', {}, s.title), s.lead ? h('p', { class: 'slide-lead', html: DSA.fmt(s.lead) }) : null,
          h('div', { class: 'tbl-wrap' }, h('table', { class: 'tbl' }, h('thead', {}, h('tr', {}, s.table.head.map((c) => h('th', {}, c)))), h('tbody', {}, s.table.rows.map((r) => h('tr', {}, r.map((c) => h('td', { html: DSA.fmt(c) }))))))),
          s.key ? h('div', { class: 'slide-key' }, icon('bulb'), h('span', { html: DSA.fmt(s.key) })) : null));
      }
      const visual = h('div', { class: 'slide-visual' });
      return { el: h('div', { class: 'slide' + (dir < 0 ? ' back' : '') }, text, visual), visual };
    }
    function to(k) {
      if (k < 0 || k >= slides.length) return;
      dir = k >= i ? 1 : -1; i = k; render();
    }
    function render() {
      if (mounted) { mounted.destroy(); mounted = null; }
      const s = slides[i], b = build(s);
      frame.replaceChildren(b.el || b);
      if (s.kind === 'viz') mounted = DSA.mountViz(b.visual, s.viz.id, { mode: 'slide', variant: s.viz.variant, script: s.viz.script });
      else if (s.kind === 'widget') mounted = DSA.widgets[s.widget](b.visual);
      [...dots.children].forEach((d, k) => d.classList.toggle('on', k === i));
      count.textContent = `${i + 1} / ${slides.length}`;
      prev.disabled = i === 0; next.disabled = i === slides.length - 1;
      replay.style.display = s.kind === 'viz' ? '' : 'none';
      store.set('slide.' + m.n, i);
    }
    const key = (e) => { if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return; if (e.key === 'ArrowRight') to(i + 1); else if (e.key === 'ArrowLeft') to(i - 1); };
    document.addEventListener('keydown', key);
    onLeave(() => { document.removeEventListener('keydown', key); if (mounted) mounted.destroy(); if (document.fullscreenElement) document.exitFullscreen(); });
    if (!/^\d+$/.test(sub || '')) i = Math.min(store.get('slide.' + m.n, 0), slides.length - 1) || 0;   // a number in the address wins over the remembered slide
    render();
  }

  /* ---------- visualize ---------- */
  function tabVisualize(host, m, sub) {
    const items = m.viz, keyOf = (v) => v.key || v.id;
    let cur = items.find((v) => keyOf(v) === sub) || items.find((v) => v.id === sub) || items[0], mounted = null;
    const panel = h('div', { class: 'viz-panel' });
    const list = h('div', { class: 'side-list' });
    const btns = new Map();
    function pick(v) {
      cur = v; if (mounted) mounted.destroy(); mounted = null;
      btns.forEach((b, k) => b.classList.toggle('on', k === v));
      const def = DSA.viz.get(v.id);
      const holder = h('div');
      fill(panel, h('div', { class: 'viz-head' }, h('h2', {}, v.label), h('p', {}, v.blurb || (def && def.blurb) || '')), holder);
      mounted = v.widget ? DSA.widgets[v.id](holder) : DSA.mountViz(holder, v.id, { mode: 'full', variant: v.variant, lock: !!v.variant, script: v.script, autodemo: !!v.script });
      history.replaceState(null, '', `#/m/${m.n}/visualize/${keyOf(v)}`);
    }
    let group = null;
    items.forEach((v) => {
      if (v.group && v.group !== group) { group = v.group; list.appendChild(h('div', { class: 'side-group' }, group)); }
      const b = h('button', { class: 'side-item', onclick: () => pick(v) }, v.label); btns.set(v, b); list.appendChild(b);
    });
    host.appendChild(h('div', { class: 'viz-layout' }, list, panel));
    onLeave(() => mounted && mounted.destroy());
    pick(cur);
  }

  /* ---------- algorithms ---------- */
  function tabAlgorithms(host, m, sub) {
    const algos = (DSA.library || {})[m.n] || [];
    if (!algos.length) return host.appendChild(h('div', { class: 'empty' }, 'Algorithms for this module are on the way.'));
    const acc = h('div', { class: 'acc' });
    algos.forEach((a) => {
      let open = sub === a.id;
      const body = h('div');
      const item = h('div', { class: 'acc-item' + (open ? ' open' : ''), id: 'algo-' + a.id });
      const render = () => {
        item.classList.toggle('open', open); body.replaceChildren();
        if (!open) return;
        const info = h('div', { class: 'prose' },
          h('h4', {}, 'Idea'), DSA.rich(a.idea),
          a.steps ? [h('h4', {}, 'Steps'), h('ol', {}, a.steps.map((s) => h('li', { html: DSA.fmt(s) })))] : null,
          h('h4', {}, 'Complexity'),
          h('div', { class: 'cx-grid' }, [['Time (best)', a.best], ['Time (avg / worst)', a.time], ['Space', a.space]].filter((x) => x[1]).map(([k, v]) => h('div', { class: 'cx' }, h('span', {}, k), h('b', {}, v)))),
          a.note ? [h('h4', {}, 'Remember'), DSA.rich(a.note)] : null,
          a.viz ? h('div', { class: 'actions' }, h('a', { class: 'btn small', href: `#/m/${m.n}/visualize/${a.viz}` }, icon('eye'), 'Watch it animated')) : null);
        body.appendChild(h('div', { class: 'acc-body' }, info, codeCard(a)));
      };
      item.append(h('button', { class: 'acc-head', 'aria-expanded': String(open), onclick: () => { open = !open; render(); } },
        h('div', {}, h('div', { class: 'acc-title' }, a.title), h('div', { class: 'acc-sub' }, a.summary)),
        h('div', { class: 'acc-meta' }, a.time ? h('span', { class: 'pill' }, a.time) : null, a.tags ? a.tags.map((t) => h('span', { class: 'pill plain' }, t)) : null, icon('down', 'acc-chev'))), body);
      acc.appendChild(item); render();
    });
    host.appendChild(acc);
    if (sub) setTimeout(() => { const el = document.getElementById('algo-' + sub); el && el.scrollIntoView({ block: 'start', behavior: 'smooth' }); }, 60);
  }

  /* ---------- practice tab: PYQ | Problems | Quick check ---------- */
  function tabPractice(host, m, sub) {
    const parts = [['pyq', 'Past paper questions'], ['problems', 'Coding problems'], ['quiz', 'Quick check']];
    let cur = parts.some((p) => p[0] === sub) ? sub : 'pyq';
    const area = h('div', { style: { marginTop: '1.1rem' } });
    const seg = h('div', { class: 'seg' }, parts.map(([k, l]) => h('button', { class: 'seg-btn' + (k === cur ? ' active' : ''), onclick: () => { cur = k; [...seg.children].forEach((b, i) => b.classList.toggle('active', parts[i][0] === cur)); history.replaceState(null, '', `#/m/${m.n}/practice/${cur}`); draw(); } }, l)));
    function draw() {
      fill(area);
      if (cur === 'pyq') area.appendChild(pyqList((DSA.pyqs || []).filter((q) => q.module === m.n), { module: m }));
      else if (cur === 'problems') area.appendChild(problemGrid((DSA.problems || []).filter((p) => p.module === m.n)));
      else quiz(area, m);
    }
    host.append(seg, area); draw();
  }

  /* ---------- notes ---------- */
  const fileRow = (f) => h('a', { class: 'row-btn', href: DSA.material(f.path), target: '_blank', rel: 'noopener', download: f.path.split('/').pop() },
    h('div', { class: 'row-icon' }, icon(f.kind === 'code' ? 'code' : f.kind === 'slides' ? 'slides' : 'file')),
    h('div', { class: 'row-text' }, h('span', { class: 'row-title' }, f.title), h('span', { class: 'row-sub' }, DSA.KIND[f.kind] + ' · ' + f.topic + ' · ' + f.ext.toUpperCase())), icon('download', 'row-arrow'));
  function zipAll(files, name, status, btn) {
    const load = () => new Promise((res, rej) => { if (window.JSZip) return res(); const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'; s.onload = res; s.onerror = () => rej(new Error('Could not load the zip library.')); document.head.appendChild(s); });
    return async () => {
      btn.disabled = true;
      try {
        status.textContent = 'Preparing…'; await load();
        const zip = new JSZip(); let k = 0;
        for (const f of files) { status.textContent = `Downloading ${++k} of ${files.length}: ${f.title}`; const r = await fetch(DSA.material(f.path)); if (!r.ok) throw new Error(`${f.title} could not be fetched (HTTP ${r.status}).`); zip.file(f.path.split('/').pop(), await r.blob()); }
        status.textContent = 'Zipping…';
        const blob = await zip.generateAsync({ type: 'blob' });
        const a = h('a', { href: URL.createObjectURL(blob), download: name }); document.body.appendChild(a); a.click(); a.remove();
        status.textContent = `Done: ${name} (${DSA.UI.fmtSize(blob.size)}).`;
      } catch (e) { status.textContent = 'Failed: ' + e.message + ' You can still download each file separately below.'; }
      btn.disabled = false;
    };
  }
  function tabNotes(host, m, sub) {
    const files = DSA.notes[m.n] || [], status = h('span', { class: 'zip-status' }), btn = h('button', { class: 'btn primary big' }, icon('zip'), `Download all notes (${files.length} files)`);
    btn.onclick = zipAll(files, `CS24201-Module-${m.n}-notes.zip`, status, btn);
    const study = (DSA.studyNotes || {})[m.n] || [];
    host.append(
      h('div', { class: 'notes-hero' },
        h('div', {}, h('div', { class: 'card-title' }, 'Notes for module ' + m.n), h('p', { class: 'muted' }, (study.length ? `${study.length} study notes to read here, and ` : '') + `${files.length} original class files (handwritten notes, textbook pages, slides, C programs) to download.`)),
        h('div', { class: 'notes-actions' }, status, btn)),
      study.length ? studyNotes(m, study, sub) : null,
      h('h2', { class: 'section-title' }, 'Class files'),
      groupedNotes(files));
  }
  /** Written study notes of a module: a topic list on the left, the selected note on the right. */
  function studyNotes(m, study, sub) {
    let cur = Math.max(0, study.findIndex((s) => s.id === sub));
    const list = h('div', { class: 'side-list' }), panel = h('article', { class: 'note-panel card' });
    const btns = study.map((s, i) => h('button', { class: 'side-item', onclick: () => show(i, true) }, s.title));
    btns.forEach((b) => list.appendChild(b));
    function show(i, scroll) {
      cur = i; const s = study[i];
      btns.forEach((b, k) => b.classList.toggle('on', k === i));
      const rel = [];
      if (s.viz) rel.push(h('a', { class: 'btn small', href: `#/m/${m.n}/visualize/${s.viz}` }, icon('eye'), 'Watch it animated'));
      if (s.slide != null) rel.push(h('a', { class: 'btn small ghost', href: `#/m/${m.n}/slides/${s.slide}` }, icon('slides'), 'Slides'));
      if (s.algos) rel.push(h('a', { class: 'btn small ghost', href: `#/m/${m.n}/algorithms` }, icon('code'), 'Code in C, C++, Java, Python'));
      fill(panel, h('div', { class: 'eyebrow' }, h('span', { class: 'pill' }, `${i + 1} / ${study.length}`)), h('h2', { class: 'note-title' }, s.title), DSA.rich(s.body),
        rel.length ? h('div', { class: 'actions' }, rel) : null,
        h('div', { class: 'note-nav' }, i > 0 ? h('button', { class: 'btn small ghost', onclick: () => show(i - 1, true) }, icon('left'), study[i - 1].title) : h('span'), i < study.length - 1 ? h('button', { class: 'btn small', onclick: () => show(i + 1, true) }, study[i + 1].title, icon('right')) : h('span')));
      history.replaceState(null, '', `#/m/${m.n}/notes/${s.id}`);
      if (scroll) panel.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
    show(cur, false);
    return h('div', { class: 'viz-layout notes-layout' }, list, panel);
  }
  function groupedNotes(files) {
    const wrap = h('div');
    ['hand', 'slides', 'book', 'code'].forEach((k) => {
      const fs = files.filter((f) => f.kind === k); if (!fs.length) return;
      wrap.appendChild(h('div', { class: 'notes-group' }, h('h3', {}, icon(k === 'code' ? 'code' : k === 'slides' ? 'slides' : 'pencil'), DSA.KIND[k] + ' (' + fs.length + ')'), h('div', { class: 'notes-list' }, fs.map(fileRow))));
    });
    return wrap;
  }
  function pageNotes() {
    const all = MODS.flatMap((m) => DSA.notes[m.n].map((f) => Object.assign({ mod: m.n }, f))).concat(DSA.notesExtra.map((f) => Object.assign({ mod: 0 }, f)));
    const status = h('span', { class: 'zip-status' }), btn = h('button', { class: 'btn primary big' }, icon('zip'), `Download everything (${all.length} files)`);
    btn.onclick = zipAll(all, 'CS24201-all-notes.zip', status, btn);
    shell('Notes', [
      h('div', { class: 'eyebrow' }, h('span', { class: 'pill' }, 'CS24201'), 'Notes'), h('h1', { class: 'display title-bar', style: { margin: '0.6rem 0 1rem' } }, 'All notes'),
      h('div', { class: 'notes-top' }, h('p', { class: 'muted' }, 'Everything shared for this course, by module. Each module page also has its own download-all.'), h('div', { style: { display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' } }, status, btn)),
      MODS.map((m) => h('div', { class: 'notes-group' }, h('h3', {}, 'Module ' + m.n + ' · ' + m.title, h('a', { class: 'btn small ghost', href: `#/m/${m.n}/notes` }, 'Open')), h('div', { class: 'notes-list' }, DSA.notes[m.n].map(fileRow)))),
      h('div', { class: 'notes-group' }, h('h3', {}, 'Complete notes and syllabus'), h('div', { class: 'notes-list' }, DSA.notesExtra.map(fileRow))),
    ]);
  }

  /* ============================================================
   * PAST PAPERS
   * ============================================================ */
  function pyqList(qs0, opts) {
    opts = opts || {};
    const wrap = h('div');
    let exam = 'All', year = 'All';
    const filt = h('div', { class: 'practice-head' });
    const list = h('div', { class: 'q-list' });
    const years = ['All', ...[...new Set(qs0.map((q) => q.year))].sort((a, b) => b - a)];
    const mk = (opts2, cur, set) => h('div', { class: 'seg' }, opts2.map((o) => h('button', { class: 'seg-btn' + (o === cur() ? ' active' : ''), onclick: (e) => { set(o); [...e.currentTarget.parentNode.children].forEach((b) => b.classList.toggle('active', b === e.currentTarget)); draw(); } }, o)));
    filt.append(mk(['All', 'Mid', 'End'], () => exam, (v) => { exam = v; }), mk(years.map(String), () => year, (v) => { year = v; }),
      h('div', { class: 'row-sub' }, 'Original papers: ', DSA.pyqPapers.map((p, i) => [i ? ' · ' : '', h('a', { href: DSA.material(p.path), target: '_blank', rel: 'noopener', style: { color: 'var(--accent)' } }, p.title.replace(' semester', '').replace('Monsoon ', 'MO'))])));
    function draw() {
      const rows = qs0.filter((q) => (exam === 'All' || q.exam === exam) && (year === 'All' || String(q.year) === year));
      fill(list, rows.length ? rows.map(pyqCard) : h('div', { class: 'empty' }, 'No questions match these filters.'));
    }
    wrap.append(filt, list); draw(); return wrap;
  }
  function pyqCard(q) {
    const ans = h('div'); let open = false;
    const btn = h('button', { class: 'btn small', onclick: () => { open = !open; btn.replaceChildren(icon(open ? 'x' : 'eye'), open ? 'Hide answer' : 'Show answer'); fill(ans, open ? h('div', { class: 'q-answer' }, h('div', { class: 'card-title' }, 'Answer'), DSA.rich(q.answer), q.code ? codeCard({ code: q.code, pseudo: q.pseudo }) : null) : null); } }, icon('eye'), 'Show answer');
    return h('div', { class: 'q', id: 'q-' + q.id },
      h('div', { class: 'q-meta' }, h('span', { class: 'pill' }, `${q.exam === 'Mid' ? 'Mid sem' : 'End sem'} · MO${String(q.year).slice(2)}`), h('span', { class: 'pill plain' }, q.no), h('span', { class: 'pill plain' }, q.marks + (q.marks === 1 ? ' mark' : ' marks')), h('span', { class: 'pill plain' }, 'Module ' + q.module), q.topic ? h('span', { class: 'pill plain' }, q.topic) : null,
        q.ref ? h('span', { class: 'pill warn', title: 'Written for this site, in the style of the course textbooks' }, q.ref) : null),
      h('div', { class: 'q-text' }, DSA.rich(q.q)), h('div', { class: 'q-foot' }, btn, q.viz ? h('a', { class: 'btn small ghost', href: `#/m/${q.module}/visualize/${q.viz}` }, icon('play'), 'Animate it') : null), ans);
  }
  function pagePyq() {
    const all = DSA.pyqs || [];
    shell('Past papers', [
      h('div', { class: 'eyebrow' }, h('span', { class: 'pill' }, 'CS24201'), 'Previous year questions'), h('h1', { class: 'display title-bar', style: { margin: '0.6rem 0 1rem' } }, 'Past papers'),
      h('p', { class: 'muted', style: { marginBottom: '1.2rem', maxWidth: '760px' } }, `${all.filter((q) => !q.ref).length} questions from the mid and end semester papers of 2023 and 2025, sorted by module, each with a worked answer. Questions marked "textbook" are extra practice on the same topics, written for this site.`),
      pyqList(all),
    ]);
  }

  /* ============================================================
   * CODING PROBLEMS
   * ============================================================ */
  function problemGrid(list) {
    if (!list.length) return h('div', { class: 'empty' }, 'No problems here yet.');
    return h('div', { class: 'prob-grid' }, list.map((p) => {
      const solved = store.get('solved.' + p.id, false);
      return h('a', { class: 'prob', href: '#/p/' + p.id },
        h('div', { class: 'prob-top' }, diffPill(p.difficulty), solved ? h('span', { class: 'solved' }, icon('check'), 'Solved') : null), h('h3', {}, p.title), h('p', {}, p.blurb),
        h('div', { class: 'prob-foot' }, h('span', {}, 'Module ' + p.module + (p.tags ? ' · ' + p.tags.join(', ') : '')), h('span', {}, p.source)));
    }));
  }
  function pagePractice() {
    const all = DSA.problems || []; let mod = 0, diff = 'All';
    const area = h('div');
    const draw = () => fill(area, problemGrid(all.filter((p) => (!mod || p.module === mod) && (diff === 'All' || p.difficulty === diff))));
    const seg = (items, get, set) => h('div', { class: 'seg' }, items.map(([v, l]) => h('button', { class: 'seg-btn' + (get() === v ? ' active' : ''), onclick: (e) => { set(v); [...e.currentTarget.parentNode.children].forEach((b) => b.classList.toggle('active', b === e.currentTarget)); draw(); } }, l)));
    shell('Practice', [
      h('div', { class: 'eyebrow' }, h('span', { class: 'pill' }, 'CS24201'), 'Coding problems'), h('h1', { class: 'display title-bar', style: { margin: '0.6rem 0 1rem' } }, 'Practice'),
      h('p', { class: 'muted', style: { marginBottom: '1.2rem', maxWidth: '760px' } }, 'Classic problems on every module. Write your solution in C, C++, Java or Python 3, run it on the sample input, then submit it against the hidden tests. Each problem has a full solution in all four languages.'),
      h('div', { class: 'practice-head' }, seg([[0, 'All modules'], ...MODS.map((m) => [m.n, 'Module ' + m.n])], () => mod, (v) => { mod = v; }), seg([['All', 'Any level'], ['Easy', 'Easy'], ['Medium', 'Medium'], ['Hard', 'Hard']], () => diff, (v) => { diff = v; })),
      area]);
    draw();
  }

  /* ---------- editor + runner shared by the problem page and the playground ---------- */
  const STARTER = {
    c: '#include <stdio.h>\n\nint main(void) {\n    int n;\n    if (scanf("%d", &n) == 1) printf("%d\\n", n * 2);\n    return 0;\n}\n',
    cpp: '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n;\n    if (cin >> n) cout << n * 2 << "\\n";\n    return 0;\n}\n',
    java: 'import java.util.*;\n\nclass Main {\n    public static void main(String[] args) {\n        Scanner in = new Scanner(System.in);\n        if (in.hasNextInt()) System.out.println(in.nextInt() * 2);\n    }\n}\n',
    py: 'n = int(input())\nprint(n * 2)\n',
  };
  function editor(key, starters) {
    let lang = store.get('lang', 'cpp'); if (!DSA.compiler.LANGS[lang]) lang = 'cpp';
    const box = h('div', { class: 'editor' });
    let cm = null;
    const saved = (l) => store.get('code.' + key + '.' + l, null);
    const sel = h('select', { class: 'sel', 'aria-label': 'Language', onchange: () => { persist(); lang = sel.value; store.set('lang', lang); load(); } }, Object.entries(DSA.compiler.LANGS).map(([k, v]) => h('option', { value: k, selected: k === lang }, v.label)));
    function persist() { if (cm) store.set('code.' + key + '.' + lang, cm.getValue()); }
    function load() {
      const code = saved(lang) != null ? saved(lang) : starters[lang] || STARTER[lang];
      if (!cm) { cm = CodeMirror(box, { value: code, lineNumbers: true, indentUnit: 4, matchBrackets: true, autoCloseBrackets: true, mode: DSA.compiler.LANGS[lang].mode, extraKeys: { Tab: (c) => c.replaceSelection('    ') } }); cm.on('change', persist); }
      else { cm.setOption('mode', DSA.compiler.LANGS[lang].mode); cm.setValue(code); }
      setTimeout(() => cm.refresh(), 0);
    }
    load();
    return { box, sel, get lang() { return lang; }, code: () => cm.getValue(), reset() { store.set('code.' + key + '.' + lang, null); cm.setValue(starters[lang] || STARTER[lang]); }, setCode: (c) => cm.setValue(c) };
  }

  function pageProblem(id) {
    const p = (DSA.problems || []).find((x) => x.id === id); if (!p) return go('#/practice');
    const ed = editor(p.id, p.starter || {});
    const stdin = h('textarea', { spellcheck: 'false', 'aria-label': 'Input', placeholder: 'Input' }, (p.examples[0] || {}).in || '');
    const outBox = h('div', { class: 'io-box' }, h('span', {}, 'Output'), h('pre', {}, 'Press Run to execute your code on the input on the left.'));
    const results = h('div', { class: 'tests' });
    const sol = h('div');
    const runBtn = h('button', { class: 'btn' }, icon('play'), 'Run'), subBtn = h('button', { class: 'btn primary' }, icon('check'), 'Submit');
    const busy = (b, on, label, ic) => { b.disabled = on; b.replaceChildren(on ? h('i', { class: 'spin' }) : icon(ic), on ? 'Working…' : label); };
    runBtn.onclick = async () => {
      busy(runBtn, true, 'Run', 'play'); fill(outBox, h('span', {}, 'Output'), h('pre', {}, 'Running…'));
      const r = await DSA.compiler.run(ed.lang, ed.code(), stdin.value);
      const err = r.compileError || (r.stderr ? r.stderr : '');
      fill(outBox, h('span', {}, r.compileError ? 'Compile error' : 'Output'), h('pre', { class: r.compileError || (!r.ok && err) ? 'err' : '' }, ((r.compileError || r.stdout + (err ? '\n' + err : '')).trim()) || '(no output)'));
      busy(runBtn, false, 'Run', 'play');
    };
    subBtn.onclick = async () => {
      busy(subBtn, true, 'Submit', 'check'); fill(results, h('div', { class: 'test' }, 'Running ' + p.tests.length + ' tests…'));
      const rows = new Array(p.tests.length).fill(null);
      const draw = () => fill(results, rows.map((r, i) => r ? testRow(r, i, p.tests[i]) : h('div', { class: 'test' }, `Test ${i + 1}: running…`)));
      draw();
      const res = await DSA.compiler.runTests(ed.lang, ed.code(), p.tests, (i, r) => { rows[i] = r; draw(); });
      const passed = res.filter((r) => r && r.pass).length;
      if (res.some((r) => r && (r.err && !r.got && !r.pass && /error/i.test(r.err)) && res[0] && res[0].err && !res[0].got && res.every((x) => !x || !x.got))) { /* compile error shown on test 1 */ }
      if (passed === p.tests.length) { store.set('solved.' + p.id, true); toast('All ' + p.tests.length + ' tests passed'); }
      fill(results, h('div', { class: 'test ' + (passed === p.tests.length ? 'pass' : 'fail') }, h('b', {}, passed === p.tests.length ? `All ${passed} tests passed. Solved.` : `${passed} of ${p.tests.length} tests passed.`)), rows.map((r, i) => r ? testRow(r, i, p.tests[i]) : null));
      busy(subBtn, false, 'Submit', 'check');
    };
    function testRow(r, i, t) {
      const hidden = i >= p.examples.length;
      return h('details', { class: 'test ' + (r.pass ? 'pass' : 'fail'), open: !r.pass && i === 0 },
        h('summary', {}, icon(r.pass ? 'check' : 'x'), `Test ${i + 1}${hidden ? ' (hidden)' : ''}: ${r.pass ? 'passed' : r.service ? 'could not run' : r.err && !r.got ? 'error' : 'wrong answer'}`),
        r.pass && hidden ? null : h('dl', {}, h('dt', {}, 'Input'), h('dd', {}, h('pre', {}, hidden ? '(hidden)' : t.in)), h('dt', {}, 'Expected'), h('dd', {}, h('pre', {}, hidden ? '(hidden)' : t.out)), h('dt', {}, 'Your output'), h('dd', {}, h('pre', {}, (r.got || '').trim() || '(empty)')), r.err ? [h('dt', {}, 'Messages'), h('dd', {}, h('pre', { class: 'err' }, r.err.trim().slice(0, 1500)))] : null));
    }
    const solBtn = h('button', { class: 'btn small ghost', onclick: () => {
      if (sol.firstChild) return fill(sol);
      fill(sol, h('div', { class: 'card', style: { marginTop: '8px' } }, h('div', { class: 'card-title' }, 'Solution'), DSA.rich(p.explain || ''), h('p', { class: 'muted', style: { margin: '8px 0', fontSize: '0.84rem' } }, `Time ${p.time || ''}${p.space ? ' · Space ' + p.space : ''}`), codeCard({ code: p.solution, pseudo: p.pseudo }, { noRun: true })));
    } }, icon('eye'), 'Show / hide solution');
    shell('Practice', [
      h('a', { class: 'back-link', href: '#/practice' }, icon('left'), 'All problems'),
      h('div', { class: 'ws' },
        h('div', { class: 'ws-left' },
          h('div', {}, h('div', { class: 'eyebrow' }, diffPill(p.difficulty), h('span', { class: 'pill plain' }, 'Module ' + p.module), p.tags ? p.tags.map((t) => h('span', { class: 'pill plain' }, t)) : null), h('h1', { style: { marginTop: '0.6rem' } }, p.title)),
          DSA.rich(p.statement),
          h('div', { class: 'card-title', style: { marginBottom: 0 } }, 'Input and output format'), DSA.rich(p.format),
          p.examples.map((e, i) => h('div', { class: 'example' }, h('b', {}, 'Example ' + (i + 1)), h('pre', {}, 'Input:\n' + e.in.trim() + '\n\nOutput:\n' + e.out.trim()), e.why ? h('div', { class: 'muted', style: { marginTop: '4px', fontSize: '0.84rem' }, html: DSA.fmt(e.why) }) : null)),
          p.constraints ? [h('div', { class: 'card-title', style: { marginBottom: 0 } }, 'Constraints'), DSA.rich(p.constraints)] : null,
          p.link ? h('a', { class: 'btn small ghost', href: p.link, target: '_blank', rel: 'noopener' }, icon('link'), p.source) : null,
          h('div', {}, solBtn, sol)),
        h('div', { class: 'ws-right' },
          h('div', { class: 'ws-bar' }, ed.sel, h('div', { class: 'spacer' }), h('button', { class: 'btn small ghost', title: 'Discard your code and restore the starter', onclick: () => ed.reset() }, icon('replay'), 'Reset'), runBtn, subBtn),
          ed.box,
          h('div', { class: 'io' }, h('div', { class: 'io-box' }, h('span', {}, 'Input'), stdin), outBox), results)),
    ], true);
  }

  function pagePlay() {
    const ed = editor('playground', {});
    const stdin = h('textarea', { spellcheck: 'false', 'aria-label': 'Input', placeholder: 'Input for scanf / cin / Scanner / input()' }, store.get('play.stdin', '21'));
    stdin.oninput = () => store.set('play.stdin', stdin.value);
    const outBox = h('div', { class: 'io-box' }, h('span', {}, 'Output'), h('pre', {}, 'Press Run.'));
    const runBtn = h('button', { class: 'btn primary' }, icon('play'), 'Run');
    runBtn.onclick = async () => {
      runBtn.disabled = true; fill(outBox, h('span', {}, 'Output'), h('pre', {}, 'Running…'));
      const r = await DSA.compiler.run(ed.lang, ed.code(), stdin.value);
      const err = r.compileError || r.stderr || '';
      fill(outBox, h('span', {}, r.compileError ? 'Compile error' : 'Output'), h('pre', { class: r.compileError || (!r.ok && err) ? 'err' : '' }, ((r.compileError || r.stdout + (err ? '\n' + err : '')).trim()) || '(no output)'));
      runBtn.disabled = false;
    };
    shell('Compiler', [
      h('div', { class: 'eyebrow' }, h('span', { class: 'pill' }, 'CS24201'), 'Online compiler'), h('h1', { class: 'display title-bar', style: { margin: '0.6rem 0 1rem' } }, 'Compiler'),
      h('p', { class: 'muted', style: { marginBottom: '1rem', maxWidth: '760px' } }, 'C, C++, Java and Python 3 run on public online compilers (normally GCC 14, Java 17 and Python 3.12). Programs read from standard input. Your code is kept in this browser.'),
      h('div', { class: 'ws solo' }, h('div', { class: 'ws-right', style: { position: 'static' } }, h('div', { class: 'ws-bar' }, ed.sel, h('div', { class: 'spacer' }), h('button', { class: 'btn small ghost', onclick: () => ed.reset() }, icon('replay'), 'Reset'), runBtn), ed.box, h('div', { class: 'io' }, h('div', { class: 'io-box' }, h('span', {}, 'Input'), stdin), outBox)))]);
  }

  /* ============================================================
   * QUICK CHECK (multiple choice, timed, no scoring tricks)
   * ============================================================ */
  function quiz(host, m) {
    const bank = ((DSA.quiz || {})[m.n]) || [];
    if (!bank.length) return host.appendChild(h('div', { class: 'empty' }, 'No questions for this module yet.'));
    const box = h('div', { class: 'quiz card' });
    host.appendChild(box);
    let order, i, score, t0, wrongs, timer;
    const best = () => store.get('quiz.best.' + m.n, null);
    function start() {
      order = bank.map((_, k) => k).sort(() => Math.random() - 0.5).slice(0, 10); i = 0; score = 0; wrongs = []; t0 = Date.now();
      clearInterval(timer); show();
    }
    function show() {
      if (i >= order.length) return finish();
      const q = bank[order[i]], idx = q.opts.map((_, k) => k).sort(() => Math.random() - 0.5);
      const clock = h('span', { class: 'quiz-clock' }, icon('clock'), '0:00');
      clearInterval(timer); timer = setInterval(() => { clock.lastChild.textContent = DSA.UI.fmtTime((Date.now() - t0) / 1000); }, 500); onLeave(() => clearInterval(timer));
      const why = h('div'), nextBtn = h('button', { class: 'btn primary', style: { display: 'none', marginTop: '12px' }, onclick: () => { i++; show(); } }, i === order.length - 1 ? 'See result' : 'Next', icon('right'));
      const opts = idx.map((k, pos) => h('button', { class: 'quiz-opt', onclick: () => {
        const right = k === q.a; if (right) score++; else wrongs.push(q);
        [...opts.children || []].forEach(() => {});
        optEls.forEach((el, j) => { el.disabled = true; if (idx[j] === q.a) el.classList.add('right'); else if (j === pos) el.classList.add('wrong'); });
        fill(why, h('div', { class: 'quiz-why', html: (right ? '**Correct.** ' : '**Not quite.** ') .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>') + DSA.fmt(q.why) }));
        nextBtn.style.display = '';
      } }, h('span', { class: 'key' }, 'ABCD'[pos]), h('span', { html: DSA.fmt(q.opts[k]) })));
      const optEls = opts;
      fill(box, h('div', { class: 'quiz-top' }, h('span', { class: 'pill' }, `Question ${i + 1} of ${order.length}`), h('div', { class: 'quiz-progress' }, h('i', { style: { width: (i / order.length) * 100 + '%' } })), clock),
        h('div', { class: 'quiz-q', html: DSA.fmt(q.q) }), h('div', { class: 'quiz-opts' }, opts), why, nextBtn);
    }
    function finish() {
      clearInterval(timer);
      const secs = Math.round((Date.now() - t0) / 1000), b = best();
      if (!b || score > b.score || (score === b.score && secs < b.secs)) store.set('quiz.best.' + m.n, { score, secs });
      const nb = best();
      fill(box, h('div', { class: 'quiz-result' }, h('div', { class: 'quiz-score' }, `${score} / ${order.length}`),
        h('div', { class: 'quiz-stats' }, h('div', {}, h('b', {}, Math.round((score / order.length) * 100) + '%'), 'accuracy'), h('div', {}, h('b', {}, DSA.UI.fmtTime(secs)), 'time'), nb ? h('div', {}, h('b', {}, `${nb.score}/10 · ${DSA.UI.fmtTime(nb.secs)}`), 'best on this device') : null),
        h('div', { style: { display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' } }, h('button', { class: 'btn primary', onclick: start }, icon('replay'), 'Try another set'), h('a', { class: 'btn', href: `#/m/${m.n}/slides` }, icon('slides'), 'Back to slides')),
        wrongs.length ? h('div', { class: 'review-list' }, h('div', { class: 'card-title' }, 'To review'), wrongs.map((q) => h('div', { class: 'review' }, h('b', { html: DSA.fmt(q.q) }), h('span', { html: DSA.fmt('Answer: ' + q.opts[q.a] + '. ' + q.why) })))) : null));
    }
    box.appendChild(h('div', { class: 'quiz-result' }, h('div', { class: 'card-title' }, 'Quick check'), h('h2', { class: 'display', style: { marginBottom: '8px' } }, 'Ten questions on module ' + m.n), h('p', { class: 'muted', style: { marginBottom: '1rem' } }, 'Pick the best answer. You see the explanation after each one.' + (best() ? `  Best on this device: ${best().score}/10 in ${DSA.UI.fmtTime(best().secs)}.` : '')), h('button', { class: 'btn primary big', onclick: start }, 'Start')));
  }

  /* ============================================================
   * ROUTER
   * ============================================================ */
  function route(keepScroll) {
    cleanup.forEach((f) => { try { f(); } catch (e) { /* ignore */ } }); cleanup = [];
    const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
    const y = window.scrollY;
    try {
      if (!parts.length) pageHome();
      else if (parts[0] === 'm') pageModule(parts[1], parts[2], parts[3]);
      else if (parts[0] === 'practice') pagePractice();
      else if (parts[0] === 'p') pageProblem(parts[1]);
      else if (parts[0] === 'pyq') pagePyq();
      else if (parts[0] === 'notes') pageNotes();
      else if (parts[0] === 'play') pagePlay();
      else pageHome();
    } catch (e) { console.error(e); fill(app, header(''), h('main', { class: 'page' }, h('div', { class: 'empty' }, 'Something went wrong while drawing this page. ', h('a', { href: '#/', style: { color: 'var(--accent)' } }, 'Back to the start')))); }
    if (keepScroll === true) window.scrollTo(0, y);
    document.title = (parts[0] === 'm' ? 'Module ' + parts[1] + ' · ' : parts[0] === 'p' ? 'Problem · ' : '') + 'DSA · BitHub';
  }
  window.addEventListener('hashchange', () => route());
  route();
})();
