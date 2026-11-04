/* ============================================================
 * app.js — the DSD lab simulator shell.
 *   header + experiment navigator, parts bin, trainer kit,
 *   procedure checklist / observation tables / diagnostics, CRO,
 *   persistence.
 * ============================================================ */
(function () {
  'use strict';
  const DSD = window.DSD, UI = DSD.UI, B = DSD.Board, C = DSD.Checks;
  const { h, s, store } = UI;
  const qs = new URLSearchParams(location.search);
  const EMBED = qs.get('from') === 'bithub' || /\/dsd(\/|\/index\.html)?$/.test(location.pathname);

  /* ---------- theme (BitHub uses html[data-theme]) ---------- */
  let theme = qs.get('theme') || store.get('theme', 'light');
  const applyTheme = () => { document.documentElement.setAttribute('data-theme', theme); store.set('theme', theme); };
  applyTheme();

  /* ---------- progress: observation tables + checklist flags ---------- */
  const progress = store.get('progress', {});
  const prog = (key) => (progress[key] = progress[key] || { tables: {}, flags: {} });
  const doneOf = (key) => { const f = prog(key).flags; return !!(f.tables && f.verified); };
  const saveProgress = () => store.set('progress', progress);
  // set a checklist flag once; returns true the first time
  function mark(key, flag, msg) {
    const p = prog(key);
    if (p.flags[flag]) return false;
    p.flags[flag] = true; saveProgress();
    if (msg) UI.toast(msg, 'good');
    return true;
  }

  /* ---------- state ---------- */
  const allParts = DSD.allParts();
  const state = {
    key: (allParts.find((p) => p.key === (qs.get('exp') || store.get('lastKey'))) || allParts[0]).key,
    build: { parts: [] }, inputs: {}, power: false, view: 'mine', wireColor: store.get('wireColor', 'blue'), armed: null, history: [],
  };
  const part = () => DSD.partByKey(state.key);
  const refCache = {};
  const refBuild = (p) => refCache[p.key] || (refCache[p.key] = p.ref ? DSD.RefBuild.build(p.ref) : { parts: [] });
  const curBuild = () => (state.view === 'ref' ? refBuild(part()) : state.build);
  let ex = null, eng = null, analog = null, diag = [], snap = null, ledLevel = [0, 0, 0, 0, 0, 0, 0, 0], ledX = [], scope = null;
  let uid = Date.now() % 100000;

  function loadPart(key) {
    state.key = key; store.set('lastKey', key);
    const saved = store.get('board.' + key, null);
    state.build = saved && Array.isArray(saved.parts) ? { parts: saved.parts } : { parts: [] };
    state.inputs = (saved && saved.inputs) || {};
    for (let i = 0; i < 8; i++) state.inputs['IN' + i] = state.inputs['IN' + i] | 0;
    state.power = false; state.view = 'mine'; state.history = []; state.armed = null; snap = null;
    if (kit) kit.clearSelection();
    if (scope) scope.reset();
    renderAll();
  }
  const saveBoard = () => store.set('board.' + state.key, { parts: state.build.parts, inputs: state.inputs });

  /* ---------- simulation ---------- */
  function recompute() {
    const p = part();
    if (p.exp.software) return;
    if (eng) snap = eng.snapshot();
    ex = B.extract(curBuild(), state.power);
    if (ex.short && state.power) {
      state.power = false; ex = B.extract(curBuild(), false);
      UI.toast('Short circuit! +5 V touches GND — the supply tripped.', 'bad');
    }
    const inputs = Object.assign({ PLS: 0, PLN: 1 }, state.inputs);
    eng = DSD.Sim.create(ex.netlist, { inputs, prev: snap });
    eng.settle();
    // reversed supply burns a chip (only on your own board)
    if (state.power && state.view === 'mine') {
      const burnt = eng.chips.filter((c) => c.power === 'reversed');
      if (burnt.length) {
        burnt.forEach((c) => { const bp = state.build.parts.find((x) => x.id === c.partId); if (bp) bp.burnt = true; });
        UI.toast(`${burnt.map((c) => c.ref).join(', ')} burnt out — +5 V was on its GND pin. Remove it and place a new one.`, 'bad');
        saveBoard();
        return recompute();
      }
    }
    analog = state.power ? DSD.Analog.create(ex, eng) : null;
    diag = C.diagnose(p, ex, eng);
    digitalLeds();
    updateObsApparatus();
    loop();
  }
  function digitalLeds() {
    if (!eng) return;
    const l = eng.leds();
    for (let i = 0; i < 8; i++) { const v = l['OUT' + i]; ledLevel[i] = v === 1 ? 1 : 0; ledX[i] = v === 2; }
  }
  const view = () => ({
    ex, power: state.power, inputs: state.inputs, ledLevel, ledX,
    segs: eng ? Object.fromEntries(Object.entries(eng.segs()).map(([ref, v]) => [curBuild().parts.find((x) => x.ref === ref && x.kind === 'seg7').id, v])) : {},
    nodeVal: (n) => (eng ? eng.nodeVal(n) : 3),
    chipPower: eng ? Object.fromEntries(eng.chips.map((c) => [c.ref, c.power])) : {},
  });

  /* ---------- observation ---------- */
  function observe(event, before) {
    if (!state.power || !eng || state.view !== 'mine') return;
    const p = part();
    const ctx = { inputs: state.inputs, leds: eng.leds(), segs: eng.segs(), prevLeds: before, before, event };
    const pr = prog(p.key);
    let changed = false;
    for (const t of p.tasks) {
      const o = C.observe(t, ctx);
      if (!o) continue;
      const tb = C.record(t, pr.tables[t.id], o);
      pr.tables[t.id] = tb; changed = true;
    }
    if (changed) { saveProgress(); afterTables(); }
  }
  function afterTables() {
    const p = part(), pr = prog(p.key);
    let all = true;
    for (const t of p.tasks) {
      const g = C.progress(t, pr.tables[t.id]);
      if (g.complete) mark(p.key, 'task:' + t.id, `${t.title}: observation table complete`); else all = false;
    }
    if (all && mark(p.key, 'tables')) { renderHero(); renderHeader(); }
    renderRight();
  }
  function updateObsApparatus() {
    const p = part();
    if (state.view !== 'mine') return;
    const ap = C.apparatusStatus(p, state.build);
    if (ap.ok && p.apparatus.length) mark(p.key, 'apparatus');
    if (state.power && eng.chips.length && eng.chips.every((c) => c.power === 'ok') && ap.ok) mark(p.key, 'powered');
  }

  /* ---------- animation loop: 555 transient, CRO, oscillation ---------- */
  let raf = 0, lastT = 0, pulseEnd = null, lastQ = null;
  function loop() {
    const need = state.power && (analog || (eng && eng.status.oscillating));
    if (need && !raf) { lastT = performance.now(); raf = requestAnimationFrame(frame); }
    if (!need && raf) { cancelAnimationFrame(raf); raf = 0; }
    if (!need && kit) kit.update();
  }
  function frame(now) {
    raf = 0;
    const dtReal = Math.min(0.05, (now - lastT) / 1000); lastT = now;
    if (analog) {
      const p = part();
      const ch1 = ex.termNode('CH1'), ch2 = ex.termNode('CH2');
      const ch1On = ex.legCount[ch1] > 1, ch2On = ex.legCount[ch2] > 1;
      const acc = [0, 0, 0, 0, 0, 0, 0, 0]; let simDt = 0;
      const t0 = analog.time, until = t0 + dtReal;
      let target = until;
      if (pulseEnd !== null && pulseEnd < target) target = pulseEnd;
      const onStep = (t, hstep) => {
        const l = eng.leds();
        for (let i = 0; i < 8; i++) if (l['OUT' + i] === 1) acc[i] += hstep;
        simDt += hstep;
        if (scope && (ch1On || ch2On)) scope.push(t, ch1On ? analog.nodeV(ch1) : 0, ch2On ? analog.nodeV(ch2) : 0);
      };
      analog.run(target, 8000, onStep);
      if (pulseEnd !== null && analog.time >= pulseEnd) {
        pulseEnd = null;
        eng.setInput('PLS', 0); eng.setInput('PLN', 1); eng.settle(); analog.refresh();
        analog.run(until, 8000, onStep);
      }
      for (let i = 0; i < 8; i++) ledLevel[i] = simDt ? acc[i] / simDt : 0;
      if (scope) {
        scope.draw();
        if (state.view === 'mine') timerObservation(p);
      }
    } else if (eng && eng.status.oscillating) {
      for (let k = 0; k < 3; k++) eng.step();
      const l = eng.leds();
      for (let i = 0; i < 8; i++) ledLevel[i] = l['OUT' + i] === 1 ? 1 : 0;
    }
    kit.update();
    loop();
  }
  function timerObservation(p) {
    const t = p.tasks[0];
    if (t.kind !== 'mono' && t.kind !== 'astable') return;
    const pr = prog(p.key), tb = (pr.tables[t.id] = pr.tables[t.id] || {});
    const tm = DSD.Analog.timing(ex, t.chip) || {};
    if (t.kind === 'mono') {
      const lp = scope.lastPulse();
      if (lp && lp.start !== lastQ) {
        lastQ = lp.start;
        const R = tm.RA || t.defaults.R, Cc = tm.C || t.defaults.C, T = 1.1 * R * Cc;
        tb.pulses = (tb.pulses || []).concat({ width: lp.width, theory: T, ok: Math.abs(lp.width - T) / T < 0.1 }).slice(-3);
        saveProgress(); afterTables();
      }
    } else {
      const m = scope.measure();
      if (m && (!tb.meas || Math.abs(tb.meas.f - m.f) / m.f > 0.002)) {
        const RA = tm.RA || t.defaults.RA, RB = tm.RB || t.defaults.RB, Cc = tm.C || t.defaults.C;
        const Ton = 0.693 * (RA + RB) * Cc, Toff = 0.693 * RB * Cc;
        tb.meas = Object.assign({}, m, { theory: { ton: Ton, toff: Toff, T: Ton + Toff, f: 1 / (Ton + Toff), duty: Ton / (Ton + Toff) }, ok: Math.abs(m.f * (Ton + Toff) - 1) < 0.1 });
        saveProgress(); afterTables();
      }
    }
  }

  /* ---------- actions ---------- */
  function mutate(fn) {
    if (state.view !== 'mine') return;
    state.history.push(JSON.stringify(state.build.parts)); if (state.history.length > 60) state.history.shift();
    fn(state.build);
    saveBoard(); recompute(); kit.render(); renderLeft(); renderRight(); renderStatus();
  }
  const nextRef = (prefix) => { let i = 1; while (state.build.parts.some((p) => p.ref === prefix + i)) i++; return prefix + i; };
  function onAdd(proto) {
    mutate((b) => {
      const p = Object.assign({ id: 'p' + (++uid).toString(36) + Math.random().toString(36).slice(2, 5) }, proto);
      if (p.kind === 'chip') p.ref = nextRef('IC');
      if (p.kind === 'seg7') p.ref = nextRef('DISP');
      if (p.kind === 'resistor') p.ref = nextRef('R');
      if (p.kind === 'cap') p.ref = nextRef('C');
      b.parts.push(p);
    });
    if (proto.kind === 'resistor' || proto.kind === 'cap') { state.armed = null; renderLeft(); }
  }
  function onModify(id, patch) { mutate((b) => { b.parts = b.parts.map((p) => (p.id === id ? Object.assign({}, p, patch) : p)); }); }
  function onRemove(id) { mutate((b) => { b.parts = b.parts.filter((p) => p.id !== id); }); kit.clearSelection(); renderStatus(); }
  function undo() {
    if (!state.history.length) { UI.toast('Nothing to undo'); return; }
    state.build.parts = JSON.parse(state.history.pop());
    saveBoard(); recompute(); kit.render(); renderLeft(); renderRight();
  }
  function togglePower() {
    state.power = !state.power;
    if (scope) scope.reset();
    lastQ = null; pulseEnd = null;
    recompute(); kit.render(); renderToolbar(); renderRight(); renderStatus();
    if (state.power) observe('change', null);
  }
  function toggleInput(i) {
    state.inputs['IN' + i] ^= 1; saveBoard();
    if (eng) {
      const before = eng.leds();
      eng.setInput('IN' + i, state.inputs['IN' + i]);
      eng.settle();
      if (analog) analog.refresh();
      digitalLeds();
      diag = C.diagnose(part(), ex, eng);
      observe('change', before);
      loop();
    }
    kit.update(); renderStatus();
  }
  function pulse() {
    kit.pressPulse();
    if (!state.power) { UI.toast('The kit is switched off — press POWER first.', 'warn'); return; }
    if (analog) {
      eng.setInput('PLS', 1); eng.setInput('PLN', 0); eng.settle(); analog.refresh();
      const t = part().tasks[0], tm = DSD.Analog.timing(ex, t.chip || 'IC1') || {};
      const T = 1.1 * (tm.RA || 1000) * (tm.C || 1e-7);
      pulseEnd = analog.time + Math.min(10e-6, T / 20);
      loop(); return;
    }
    const before = eng.leds();
    eng.pulse();
    digitalLeds();
    diag = C.diagnose(part(), ex, eng);
    observe('pulse', before);
    loop(); kit.update(); renderRight();
  }

  /* ============================================================
   * DOM
   * ============================================================ */
  const root = document.getElementById('app');
  const header = h('header', { class: 'dash-header dsd-header' });
  const hero = h('section', { class: 'dsd-hero' });
  const left = h('aside', { class: 'dsd-left' });
  const center = h('section', { class: 'dsd-center' });
  const right = h('aside', { class: 'dsd-right' });
  const toolbar = h('div', { class: 'dsd-toolbar' });
  const stage = h('div', { class: 'dsd-stage' });
  const banner = h('div', { class: 'dsd-banner' });
  const status = h('div', { class: 'dsd-status' });
  center.append(toolbar, h('div', { class: 'dsd-stage-wrap' }, stage), banner, status);
  root.append(header, hero, h('main', { class: 'dsd-main' }, left, center, right));

  let kit = null;
  function ensureKit() {
    if (kit) return;
    kit = UI.Kit(stage, {
      getBuild: curBuild, getView: view, readOnly: () => state.view !== 'mine',
      onPower: togglePower, onToggle: toggleInput, onPulse: pulse,
      onAdd, onModify, onRemove,
      wireColor: () => state.wireColor, armed: () => state.armed,
      onSelect: () => { renderStatus(); renderToolbar(); },
      onHover: (info) => { hoverInfo = info; renderStatus(); },
    });
    stage.appendChild(UI.zoomControls(() => kit.pz));
  }
  let hoverInfo = null;

  /* ---------- header ---------- */
  function renderHeader() {
    const p = part();
    const nDone = allParts.filter((q) => doneOf(q.key)).length;
    UI.fill(header,
      h('div', { class: 'dash-header__left' },
        h('a', { class: 'logo-container', href: EMBED ? `../?view=jaipur&theme=${theme}` : 'https://bithub.co.in', title: EMBED ? 'Back to BitHub Jaipur' : 'BitHub' },
          h('div', { class: 'logo-icon-wrapper' }, s('svg', { class: 'logo-icon', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2.5 }, s('path', { d: 'M4 19.5V15a2 2 0 0 1 2-2h14M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V17' }), s('path', { d: 'M6 2v11' }))),
          h('span', { class: 'logo-text' }, 'BitHub')),
        h('span', { class: 'dsd-crumb' }, h('span', { class: 'dsd-crumb-sep' }, '/'), 'DSD Lab')),
      h('div', { class: 'dsd-nav' },
        h('button', { class: 'dsd-icon-btn', title: 'Previous experiment', 'aria-label': 'Previous experiment', onclick: () => stepExp(-1) }, UI.icon('left')),
        h('button', { class: 'dsd-nav-btn', onclick: openNavigator, title: 'Choose an experiment' },
          h('span', { class: 'dsd-nav-no' }, String(p.exp.no).padStart(2, '0')), h('span', { class: 'dsd-nav-title' }, p.exp.short), UI.icon('down')),
        h('button', { class: 'dsd-icon-btn', title: 'Next experiment', 'aria-label': 'Next experiment', onclick: () => stepExp(1) }, UI.icon('right'))),
      h('div', { class: 'dash-header__right' },
        h('span', { class: 'dsd-done-count', title: 'Experiment parts with tables recorded and circuit verified' }, UI.icon('check'), `${nDone} / ${allParts.length} done`),
        h('button', { class: 'dsd-icon-btn round', id: 'dsd-help', title: 'Show the tour again', 'aria-label': 'Show the tour again', onclick: () => UI.startTour() }, UI.icon('help')),
        h('button', { class: 'theme-toggle-btn', title: `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`, 'aria-label': 'Toggle theme', onclick: () => { theme = theme === 'light' ? 'dark' : 'light'; applyTheme(); renderHeader(); } },
          UI.icon(theme === 'light' ? 'sun' : 'moon', 'toggle-icon'), h('span', { class: 'theme-toggle-slider' }, h('span', { class: 'theme-toggle-knob' }))),
        EMBED ? h('a', { class: 'campus-select-btn', href: `../?view=jaipur&theme=${theme}` }, UI.icon('home'), h('span', {}, 'Jaipur Campus')) : null));
  }
  function stepExp(d) {
    const E = DSD.EXPERIMENTS, i = E.indexOf(part().exp);
    const e = E[(i + d + E.length) % E.length];
    loadPart(e.parts[0].key);
  }

  /* ---------- hero: title, aim, part tabs ---------- */
  function renderHero() {
    const p = part(), e = p.exp;
    UI.fill(hero,
      h('div', { class: 'dsd-hero-text' },
        h('div', { class: 'dsd-eyebrow' }, `Experiment ${e.no}`, e.software ? h('span', { class: 'dsd-tag' }, 'Software') : null),
        h('h1', { class: 'dsd-title' }, e.title),
        h('p', { class: 'dsd-aim' }, h('b', {}, 'Aim. '), e.aim)),
      e.parts.length > 1 ? h('div', { class: 'dsd-tabs', role: 'tablist' }, e.parts.map((q, i) => h('button', {
        class: 'dsd-tab' + (q.key === p.key ? ' active' : ''), role: 'tab', 'aria-selected': String(q.key === p.key), onclick: () => loadPart(q.key),
      }, h('span', { class: 'dsd-tab-no' }, `${e.no}${'ABC'[i]}`), q.title, doneOf(q.key) ? h('span', { class: 'dsd-tab-done', title: 'Done' }, UI.icon('check')) : null))) : null);
  }

  /* ---------- left: the parts this experiment needs ---------- */
  const remark = (type) => {
    const d = DSD.LIB[type];
    return `<div class="tip-title">${UI.esc(d.label)} · ${UI.esc(d.title)}</div><div>${UI.esc(d.desc)}</div><div class="tip-sub">VCC pin ${d.vcc} · GND pin ${d.gnd} · drop it across the centre channel</div>`;
  };
  function renderLeft() {
    const p = part();
    if (p.exp.software) return renderISELeft();
    const ap = C.apparatusStatus(p, state.build);
    const blocked = (e) => { if (state.view === 'mine') return false; UI.toast('You are viewing the completed experiment — go back to your board to edit.', 'warn'); e.preventDefault(); return true; };
    const count = (a) => h('span', { class: 'bin-count' + (a.ok ? ' ok' : '') }, a.ok ? UI.icon('check') : null, `${Math.min(a.have, a.qty)}/${a.qty}`);
    const chipCard = (a) => {
      const d = DSD.LIB[a.type];
      return h('button', { class: 'bin-card' + (a.ok ? ' done' : ''), title: `${d.chipText} — ${d.title}. Drag onto the breadboard.`,
        onpointerdown: (e) => { if (blocked(e)) return; e.preventDefault(); kit.dragNew({ kind: 'chip', type: a.type }, e, remark(a.type)); } },
        h('span', { class: 'bin-top' }, h('span', { class: 'bin-dip' }, h('i'), h('i'), h('i')), count(a)),
        h('span', { class: 'bin-name' }, d.label), h('span', { class: 'bin-sub' }, d.title));
    };
    const armBtn = (a) => {
      const kind = a.kind, value = a.kind === 'resistor' ? a.ohms : a.farads;
      const on = state.armed && state.armed.kind === kind && (state.armed.ohms === value || state.armed.farads === value);
      return h('button', { class: 'comp-card' + (on ? ' on' : '') + (a.ok ? ' done' : ''), onclick: () => { state.armed = on ? null : kind === 'resistor' ? { kind, ohms: value } : { kind, farads: value }; renderLeft(); renderStatus(); } },
        h('span', { class: 'comp-glyph ' + kind }), h('span', { class: 'comp-txt' }, h('b', {}, kind === 'resistor' ? DSD.fmtOhms(value) : DSD.fmtFarads(value)), h('small', {}, on ? 'drag between two holes' : kind === 'resistor' ? 'resistor · click, then drag' : 'capacitor · click, then drag')), count(a));
    };
    const chips = ap.items.filter((a) => a.type), comps = ap.items.filter((a) => !a.type);
    const done = ap.items.filter((i) => i.ok).length;
    UI.fill(left,
      h('div', { class: 'dsd-card' },
        h('div', { class: 'dsd-card-head' }, h('h3', {}, 'IC drawer'), h('span', { class: 'dsd-pill ' + (ap.ok ? 'good' : '') }, `${done}/${ap.items.length}`)),
        h('div', { class: 'bin-grid' }, chips.map(chipCard)),
        comps.length ? h('div', { class: 'comp-list' }, comps.map((a) => (a.kind === 'seg7'
          ? h('button', { class: 'comp-card' + (a.ok ? ' done' : ''), onpointerdown: (e) => { if (blocked(e)) return; e.preventDefault(); kit.dragNew({ kind: 'seg7' }, e, '<div class="tip-title">7-segment display · common cathode</div><div>Segments a–g light when their pin is HIGH and COM (pins 3, 8) is at GND. Use a 330 Ω resistor per segment.</div>'); } },
            h('span', { class: 'bin-seg' }, '8.'), h('span', { class: 'comp-txt' }, h('b', {}, '7-segment'), h('small', {}, 'common cathode · drag')), count(a))
          : armBtn(a)))) : null,
        ap.extra.length ? h('p', { class: 'dsd-tip warn' }, `Not needed here: ${ap.extra.map((x) => DSD.LIB[x.type].label).join(', ')}.`) : null,
        h('p', { class: 'dsd-tip' }, 'Drag an IC onto the breadboard. While dragging, its remark shows what it does.')),
      h('div', { class: 'dsd-card' },
        h('div', { class: 'dsd-card-head' }, h('h3', {}, 'Jumper wire')),
        h('div', { class: 'wire-swatches' }, Object.entries(UI.WIRE_COLORS).map(([k, c]) => h('button', {
          class: 'swatch' + (state.wireColor === k ? ' on' : ''), style: { background: c }, title: k, 'aria-label': k + ' wire',
          onclick: () => { state.wireColor = k; store.set('wireColor', k); renderLeft(); },
        }))),
        h('p', { class: 'dsd-tip' }, 'Drag from a free hole to another hole. Right-click a part to remove it.')));
  }

  /* ---------- toolbar ---------- */
  function renderToolbar() {
    const p = part();
    if (p.exp.software) { UI.fill(toolbar, h('div', { class: 'dsd-tool-main' }, h('button', { class: 'dsd-btn big', onclick: () => UI.openManual(p.exp) }, UI.icon('book'), 'View lab manual')), h('div', { class: 'dsd-spacer' }), h('button', { class: 'dsd-btn ghost', onclick: () => ise && ise.reset() }, UI.icon('trash'), 'Reset project')); return; }
    const sel = kit && kit.selected();
    UI.fill(toolbar,
      h('button', { class: 'dsd-btn big power' + (state.power ? ' on' : ' off'), onclick: togglePower, 'aria-pressed': String(state.power), title: 'Switch the trainer kit on or off' }, h('span', { class: 'pwr-dot' }), UI.icon('power'), state.power ? 'Power ON' : 'Power OFF'),
      h('div', { class: 'dsd-tool-main' },
        h('button', { class: 'dsd-btn big', onclick: () => UI.openManual(p.exp) }, UI.icon('book'), 'View lab manual'),
        h('button', { class: 'dsd-btn big', onclick: openDiagram }, UI.icon('diagram'), 'Show diagram'),
        h('button', { class: 'dsd-btn big' + (state.view === 'ref' ? ' active' : ''), onclick: toggleCompleted }, UI.icon('eye'), state.view === 'ref' ? 'Back to my board' : 'Completed experiment'),
        h('button', { class: 'dsd-btn big primary', onclick: openVerify, disabled: state.view !== 'mine' }, UI.icon('check'), 'Verify circuit')),
    );
    void sel;
  }
  // board actions live in the status bar under the kit
  function boardTools() {
    const sel = kit && kit.selected(), ro = state.view !== 'mine';
    return h('div', { class: 'st-tools' },
      sel && (sel.kind === 'chip' || sel.kind === 'seg7') ? h('button', { class: 'dsd-icon-btn small', title: 'Rotate (R)', 'aria-label': 'Rotate', onclick: () => onModify(sel.id, { rot: sel.rot ? 0 : 180 }) }, UI.icon('rotate')) : null,
      sel ? h('button', { class: 'dsd-icon-btn small', title: 'Remove (Del)', 'aria-label': 'Remove', onclick: () => onRemove(sel.id) }, UI.icon('close')) : null,
      h('button', { class: 'dsd-icon-btn small', title: 'Undo (Ctrl+Z)', 'aria-label': 'Undo', onclick: undo, disabled: ro }, UI.icon('undo')),
      h('button', { class: 'dsd-icon-btn small', title: 'Clear the board', 'aria-label': 'Clear the board', disabled: ro, onclick: () => UI.confirm('Clear the board?', 'Every chip, component and wire on your breadboard will be removed. You can undo this.', 'Clear board', () => mutate((b) => { b.parts = []; })) }, UI.icon('trash')));
  }
  function renderBanner() {
    if (state.view === 'ref') {
      UI.fill(banner, h('div', { class: 'dsd-banner-in' }, UI.icon('eye'),
        h('span', {}, h('b', {}, 'Completed experiment. '), 'This is the reference build — flip the switches to watch it work.'),
        h('button', { class: 'dsd-btn small', onclick: toggleCompleted }, 'Back to my board'),
        h('button', { class: 'dsd-btn small ghost', onclick: copyReference }, UI.icon('copy'), 'Copy to my board')));
      banner.classList.add('show');
    } else { banner.classList.remove('show'); UI.fill(banner); }
  }
  function toggleCompleted() {
    state.view = state.view === 'ref' ? 'mine' : 'ref';
    snap = null; eng = null; kit.clearSelection(); recompute(); kit.render(); renderToolbar(); renderBanner(); renderRight(); renderStatus();
  }
  function copyReference() {
    UI.confirm('Copy the reference onto your board?', 'Your current board will be replaced by the completed build (you can undo).', 'Copy', () => {
      state.view = 'mine';
      mutate((b) => { b.parts = JSON.parse(JSON.stringify(refBuild(part()).parts)); });
      renderToolbar(); renderBanner();
    });
  }

  /* ---------- status bar ---------- */
  function renderStatus() {
    const sel = kit && kit.selected();
    let msg;
    if (hoverInfo) {
      const lv = hoverInfo.power && hoverInfo.node != null ? UI.lvl(hoverInfo.val) : 'z';
      msg = [h('span', { class: 'st-hole' }, hoverInfo.desc), hoverInfo.what ? h('span', { class: 'st-what' }, hoverInfo.what) : null,
        h('span', { class: 'st-lvl ' + lv }, hoverInfo.power ? UI.lvlText(hoverInfo.val) : 'power off'),
        hoverInfo.on ? h('span', { class: 'st-on' }, 'Node: ' + hoverInfo.on) : null];
    } else if (state.armed) msg = h('span', { class: 'st-armed' }, `Placing ${state.armed.kind === 'resistor' ? 'a ' + DSD.fmtOhms(state.armed.ohms) + ' resistor' : 'a ' + DSD.fmtFarads(state.armed.farads) + ' capacitor'}: drag from one hole to another (1–10 holes apart). Esc cancels.`);
    else if (sel) msg = h('span', {}, h('b', {}, sel.ref || 'Wire'), sel.kind === 'chip' ? ` ${DSD.LIB[sel.type].chipText} — drag to move, R rotates, Del removes` : sel.kind === 'wire' ? ' selected — Del removes, drag an end to re-plug' : ' selected — Del removes');
    else msg = h('span', { class: 'muted' }, state.power ? (eng && eng.status.oscillating ? 'Simulating · the circuit is oscillating' : 'Simulating · hover any hole to trace its net and see its logic level') : 'Power is off · build your circuit, then switch the kit on');
    UI.fill(status, h('div', { class: 'st-msg' }, msg), part().exp.software ? null : boardTools());
  }

  /* ---------- right: collapsible pills ---------- */
  const openPills = new Set(store.get('pills', []));
  function pill(id, title, badge, badgeCls, body) {
    const open = openPills.has(id);
    return h('div', { class: 'dsd-pillsec' + (open ? ' open' : '') },
      h('button', { class: 'dsd-pillbtn', 'aria-expanded': String(open), onclick: () => { if (open) openPills.delete(id); else openPills.add(id); store.set('pills', [...openPills]); renderRight(); } },
        h('span', { class: 'dsd-pillbtn-title' }, title), badge != null && badge !== '' ? h('span', { class: 'dsd-pill ' + (badgeCls || '') }, badge) : null, UI.icon('down', 'chev')),
      open ? h('div', { class: 'dsd-pillbody' }, body) : null);
  }
  function renderRight() {
    const p = part();
    if (p.exp.software) return renderISERight();
    const pr = prog(p.key), f = pr.flags;
    const ap = C.apparatusStatus(p, state.build);
    const tasksDone = p.tasks.every((t) => C.progress(t, pr.tables[t.id]).complete);
    const step = (done, title, sub) => h('li', { class: done ? 'done' : '' }, h('span', { class: 'ms-dot' }, done ? UI.icon('check') : null), h('div', {}, h('b', {}, title), sub ? h('small', {}, sub) : null));
    const isTimer = p.tasks.some((t) => t.kind === 'mono' || t.kind === 'astable');
    const nDone = [ap.ok, !!f.powered, tasksDone, !!f.verified].filter(Boolean).length;
    const nIssues = diag.filter((d) => d.sev !== 'info').length;
    UI.fill(right,
      pill('check', 'Checklist', doneOf(p.key) ? 'Done' : `${nDone}/4`, doneOf(p.key) ? 'good' : '',
        h('ol', { class: 'ms-list' },
          step(ap.ok, 'Collect the apparatus', `${ap.items.filter((i) => i.ok).length} of ${ap.items.length} on the board`),
          step(!!f.powered, 'Power every IC', 'VCC to +5 V, GND to ground, kit switched on'),
          step(tasksDone, 'Record the observations', isTimer ? 'Measure on the CRO' : 'Flip the switches — rows fill in as you go'),
          step(!!f.verified, 'Verify the circuit', 'Automatic test of every input combination'))),
      pill('proc', 'Procedure', `${p.steps.length} steps`, '', h('ol', { class: 'proc-list' }, p.steps.map((t) => h('li', {}, t)))),
      pill('io', 'Trainer connections', `${p.io.length}`, '',
        h('table', { class: 'io-table' }, h('tbody', {}, p.io.map((r) => h('tr', {},
          h('td', {}, h('span', { class: 'io-term ' + B.TERMS[r.id].kind }, B.TERMS[r.id].label)), h('td', { class: 'io-name' }, r.name), h('td', { class: 'io-note' }, r.note || '')))))),
      p.tasks.map((t, i) => tableCard(t, pr.tables[t.id], i)),
      isTimer ? croCard() : null,
      pill('diag', 'Diagnostics', state.power ? (nIssues || 'OK') : 'off', !state.power ? '' : diag.some((d) => d.sev === 'error') ? 'bad' : nIssues ? 'warn' : 'good',
        [state.power ? null : h('p', { class: 'dsd-tip' }, 'Switch the kit on to check power and logic levels.'),
          h('ul', { class: 'diag-list' }, diag.length ? diag.slice(0, 12).map((d) => h('li', { class: d.sev }, d.msg)) : (state.power ? h('li', { class: 'good' }, 'No problems found on the board.') : null))]));
    if (isTimer && scope) scope.draw();
  }
  function croCard() {
    if (!scope) scope = UI.Scope();
    return pill('cro', 'Oscilloscope', 'CH1 · CH2', '', scope.root);
  }
  const cell = (v, ok) => h('td', { class: 'obs ' + (v === undefined ? 'empty' : ok ? 'ok' : 'bad') }, v === undefined ? '—' : UI.bit(v));
  function tableCard(t, tb, idx) {
    const g = C.progress(t, tb);
    tb = tb || { rows: {}, order: [] };
    let table;
    if (t.kind === 'comb' && t.free) {
      const heads = [...t.groups.map((x) => x.name), ...t.outNames];
      table = h('table', { class: 'obs-table' }, h('thead', {}, h('tr', {}, h('th', {}, 'S.No.'), heads.map((x) => h('th', {}, x)))),
        h('tbody', {}, Array.from({ length: t.free }, (_, i) => {
          const k = tb.order[i], r = k && tb.rows[k];
          if (!r) return h('tr', { class: 'pending' }, h('td', {}, i + 1), heads.map(() => h('td', { class: 'obs empty' }, '—')));
          return h('tr', {}, h('td', {}, i + 1), h('td', { class: 'mono' }, r.ins.slice(0, 4).join('')), h('td', { class: 'mono' }, r.ins.slice(4).join('')), r.got.map((v, j) => cell(v, v === r.want[j])));
        })));
    } else if (t.kind === 'comb') {
      const R = C.rows(t);
      table = h('table', { class: 'obs-table' },
        h('thead', {}, h('tr', {}, h('th', {}, 'S.No.'), t.inNames.map((x) => h('th', {}, x)), t.bits ? h('th', {}, t.bits) : t.outNames.map((x) => h('th', { class: 'out' }, x)))),
        h('tbody', {}, R.map((r, i) => {
          const o = tb.rows[r.key];
          const cur = state.power && t.ins.every((id, j) => (state.inputs[id] | 0) === r.ins[j]);
          return h('tr', { class: cur ? 'current' : '' }, h('td', {}, i + 1), r.ins.map((v) => h('td', {}, v)),
            t.bits ? h('td', { class: 'obs mono ' + (o ? (o.ok ? 'ok' : 'bad') : 'empty') }, o ? o.got.map(UI.bit).join('') : '—')
              : r.want.map((w, j) => cell(o ? o.got[j] : undefined, o && o.got[j] === w)));
        })));
    } else if (t.kind === 'seg') {
      table = h('table', { class: 'obs-table' },
        h('thead', {}, h('tr', {}, h('th', {}, 'S.No.'), t.inNames.map((x) => h('th', {}, x)), h('th', {}, 'Decimal'), h('th', { class: 'out' }, 'Segments glowing'))),
        h('tbody', {}, C.rows(t).map((r, i) => {
          const o = tb.rows[r.key];
          const cur = state.power && t.ins.every((id, j) => (state.inputs[id] | 0) === r.ins[j]);
          return h('tr', { class: cur ? 'current' : '' }, h('td', {}, i + 1), r.ins.map((v) => h('td', {}, v)), h('td', {}, r.digit),
            h('td', { class: 'obs mono ' + (o ? (o.ok ? 'ok' : 'bad') : 'empty') }, o ? (o.got || 'dark') : '—'));
        })));
    } else if (t.kind === 'latch' || t.kind === 'ff') {
      const ff = t.kind === 'ff';
      table = h('table', { class: 'obs-table' },
        h('thead', {}, h('tr', {}, h('th', {}, 'S.No.'), ff ? h('th', {}, 'Clock') : null, t.inNames.map((x) => h('th', {}, x)), ff ? h('th', {}, 'Qn') : null, h('th', { class: 'out' }, ff ? 'Qn+1' : 'Q'), h('th', { class: 'out' }, ff ? 'Qn+1′' : 'Q′'), h('th', {}, 'State'))),
        h('tbody', {}, C.rows(t).map((r, i) => {
          const o = tb.rows[r.key];
          return h('tr', {}, h('td', {}, i + 1), ff ? h('td', {}, '⎍') : null, r.ins.map((v) => h('td', {}, v)), ff ? h('td', {}, r.prev) : null,
            cell(o ? o.got[0] : undefined, o && o.got[0] === r.want[0]), cell(o ? o.got[1] : undefined, o && o.got[1] === r.want[1]), h('td', { class: 'state' }, r.label));
        })));
    } else if (t.kind === 'mono') {
      const ps = tb.pulses || [];
      table = h('table', { class: 'obs-table' }, h('thead', {}, h('tr', {}, h('th', {}, 'S.No.'), h('th', {}, 'Trigger applied'), h('th', { class: 'out' }, 'Output pulse width'), h('th', {}, 'Theory 1.1RC'))),
        h('tbody', {}, [0, 1, 2].map((i) => { const q = ps[i]; return h('tr', {}, h('td', {}, i + 1), h('td', {}, 'Yes'), h('td', { class: 'obs ' + (q ? (q.ok ? 'ok' : 'bad') : 'empty') }, q ? DSD.fmtTime(q.width) : '—'), h('td', {}, q ? DSD.fmtTime(q.theory) : '—')); })));
    } else if (t.kind === 'astable') {
      const m = tb.meas;
      const row = (name, obs, th, fmt) => h('tr', {}, h('td', { class: 'param' }, name), h('td', { class: 'obs ' + (m ? (m.ok ? 'ok' : 'bad') : 'empty') }, m ? fmt(obs) : '—'), h('td', {}, m ? fmt(th) : '—'));
      const pc = (x) => (x * 100).toFixed(1) + ' %';
      table = h('table', { class: 'obs-table' }, h('thead', {}, h('tr', {}, h('th', {}, 'Parameter'), h('th', { class: 'out' }, 'Observed'), h('th', {}, 'Theory'))),
        h('tbody', {}, m ? [row('ON time T_ON', m.ton, m.theory.ton, DSD.fmtTime), row('OFF time T_OFF', m.toff, m.theory.toff, DSD.fmtTime), row('Time period T', m.T, m.theory.T, DSD.fmtTime), row('Frequency f', m.f, m.theory.f, DSD.fmtFreq), row('Duty cycle', m.duty, m.theory.duty, pc)]
          : ['ON time T_ON', 'OFF time T_OFF', 'Time period T', 'Frequency f', 'Duty cycle'].map((n) => h('tr', {}, h('td', { class: 'param' }, n), h('td', { class: 'obs empty' }, '—'), h('td', {}, '—')))));
    }
    return pill('obs:' + idx, 'Observation \u00b7 ' + t.title, `${g.done}/${g.total}`, g.complete ? 'good' : '',
      [h('div', { class: 'obs-scroll' }, table),
        h('div', { class: 'obs-foot' }, h('button', { class: 'dsd-link', onclick: () => { prog(part().key).tables[t.id] = undefined; saveProgress(); renderRight(); } }, 'Clear table'))]);
  }

  /* ---------- modals ---------- */
  function openNavigator() {
    let m;
    const body = h('div', { class: 'nav-grid' }, DSD.EXPERIMENTS.map((e) => {
      const done = e.parts.filter((q) => doneOf(q.key)).length;
      return h('button', { class: 'subject-selection-btn nav-item' + (e === part().exp ? ' current' : ''), onclick: () => { m.close(); loadPart(e.parts[0].key); } },
        h('span', { class: 'nav-no' }, String(e.no).padStart(2, '0')),
        h('div', { class: 'btn-content-left' }, h('span', { class: 'btn-primary-title' }, e.short), h('span', { class: 'btn-secondary-code' }, e.title)),
        h('span', { class: 'nav-done' + (done === e.parts.length ? ' all' : '') }, done ? [UI.icon('check'), e.parts.length > 1 ? `${done}/${e.parts.length}` : ''] : (e.parts.length > 1 ? `${e.parts.length} parts` : '')));
    }));
    m = UI.modal({ title: 'Experiments', sub: 'Digital System Design Lab · pick an experiment', size: 'large', body });
  }
  function openVerify() {
    const p = part();
    const res = C.verify(p, state.build);
    const ap = C.apparatusStatus(p, state.build);
    const fmtIns = (r, t) => (r.ins ? (t.inNames ? r.ins.map((v, i) => `${(t.inNames[i] || '')}=${v}`).join(' ') : r.ins.join('')) : '');
    const body = h('div', { class: 'verify' },
      h('div', { class: 'verify-sum ' + (res.pass ? 'good' : 'bad') }, UI.icon(res.pass ? 'check' : 'info'),
        h('div', {}, h('b', {}, res.pass ? 'Your circuit works.' : 'Not quite yet.'), h('span', {}, res.pass ? 'Every task passed the automatic test.' : 'Some tasks failed — details below.'))),
      !ap.ok ? h('p', { class: 'verify-note' }, 'Apparatus: ' + ap.items.filter((i) => !i.ok).map((i) => (i.type ? DSD.LIB[i.type].label : i.kind)).join(', ') + ' still missing.') : null,
      res.results.map((r) => h('div', { class: 'verify-task ' + (r.pass ? 'good' : 'bad') },
        h('div', { class: 'verify-head' }, h('b', {}, r.task.title), h('span', { class: 'dsd-pill ' + (r.pass ? 'good' : 'bad') }, r.pass ? 'pass' : 'fail'), r.tested ? h('small', {}, `${r.tested} cases`) : null),
        r.fails.length ? h('table', { class: 'obs-table small' }, h('thead', {}, h('tr', {}, h('th', {}, 'Inputs'), h('th', {}, 'Got'), h('th', {}, 'Expected'))),
          h('tbody', {}, r.fails.slice(0, 6).map((f) => h('tr', {}, h('td', { class: 'mono' }, f.msg && !f.ins ? '—' : fmtIns(f, r.task) + (f.pulse ? ' ↑CLK' : '')), h('td', { class: 'mono bad' }, f.msg && !f.got ? f.msg : [].concat(f.got).join(' ')), h('td', { class: 'mono' }, f.want === undefined ? '' : [].concat(f.want).join(' ')))))) : null,
        r.width ? h('p', { class: 'verify-note' }, `Pulse width ${DSD.fmtTime(r.width)} (theory ${DSD.fmtTime(r.theory)})`) : null,
        r.meas ? h('p', { class: 'verify-note' }, `f = ${DSD.fmtFreq(r.meas.f)} (theory ${DSD.fmtFreq(r.theory.f)}), duty ${(r.meas.duty * 100).toFixed(1)} %`) : null)),
      diag.filter((d) => d.sev !== 'info').length ? h('div', { class: 'verify-diag' }, h('b', {}, 'Board diagnostics'), h('ul', { class: 'diag-list' }, diag.filter((d) => d.sev !== 'info').map((d) => h('li', { class: d.sev }, d.msg)))) : null);
    UI.modal({ title: 'Circuit verification', sub: p.title, size: 'medium', body });
    if (res.pass && mark(p.key, 'verified')) { renderRight(); renderHero(); renderHeader(); }
  }
  function openDiagram() {
    const p = part();
    let live = store.get('liveDiagram', true);
    const host = h('div', { class: 'sch-host' });
    let pz = null;
    const refLevels = () => {
      if (!live) return null;
      const rb = refBuild(p), rex = B.extract(rb, true);
      const e2 = DSD.Sim.create(rex.netlist, { inputs: Object.assign({ PLS: 0, PLN: 1 }, state.inputs), seed: 3 });
      e2.settle();
      return (net) => {
        if (net === 'VCC') return 'hi'; if (net === 'GND') return 'lo';
        if (B.TERMS[net]) return UI.lvl(e2.nodeVal(rex.termNode(net)));
        const m = /^([A-Z]+\d+)\.(\d+)$/.exec(net);
        if (m) { const c = rex.netlist.chips.find((x) => x.ref === m[1]); if (c) return UI.lvl(e2.nodeVal(c.pinNode[+m[2]])); const r = rb.parts.find((x) => x.ref === m[1]); if (r) return UI.lvl(e2.nodeVal(rex.nodeOfHole(+m[2] === 1 ? r.h1 : r.h2))); }
        return '';
      };
    };
    const draw = () => {
      const vb = pz ? { ...pz.vb } : null;
      const svg = UI.sheetFor(p, refLevels());
      UI.fill(host, svg || h('p', {}, 'No diagram for this part.'));
      if (svg) { pz = new UI.PanZoom(svg, { x: 0, y: 0, w: UI.SHEET_SIZE.w, h: UI.SHEET_SIZE.h }, { minW: 200, maxW: 1600 }); if (vb) { pz.vb = vb; pz.apply(); } }
    };
    const tabs = h('div', { class: 'dsd-seg' });
    const panes = {
      sch: h('div', { class: 'diag-pane' }, h('div', { class: 'diag-bar' },
        h('label', { class: 'dsd-check' }, h('input', { type: 'checkbox', checked: live, onchange: (e) => { live = e.target.checked; store.set('liveDiagram', live); draw(); } }), 'Live logic levels (reference circuit, your switch settings)'),
        h('span', { class: 'sch-key' }, h('i', { class: 'hi' }), 'HIGH', h('i', { class: 'lo' }), 'LOW'),
        UI.zoomControls(() => pz)), host),
      pins: h('div', { class: 'diag-pane pins' }, [...new Set(p.apparatus.filter((a) => a.type).map((a) => a.type))].map((t) => h('figure', { class: 'po-fig' }, UI.pinout(t), h('figcaption', {}, DSD.LIB[t].chipText, ' · ', DSD.LIB[t].title, h('small', {}, DSD.LIB[t].desc))))),
      io: h('div', { class: 'diag-pane' }, h('table', { class: 'io-table big' }, h('thead', {}, h('tr', {}, h('th', {}, 'Trainer'), h('th', {}, 'Signal'), h('th', {}, 'Where'))), h('tbody', {}, p.io.map((r) => h('tr', {}, h('td', {}, h('span', { class: 'io-term ' + B.TERMS[r.id].kind }, B.TERMS[r.id].label)), h('td', {}, r.name), h('td', {}, r.note || '')))))),
    };
    const content = h('div', { class: 'diag-content' });
    const show = (k, btn) => { UI.fill(content, panes[k]); tabs.querySelectorAll('button').forEach((b) => b.classList.toggle('active', b === btn)); if (k === 'sch') draw(); };
    [['sch', 'Circuit diagram'], ['pins', 'IC pinouts'], ['io', 'Trainer connections']].forEach(([k, label], i) => tabs.appendChild(h('button', { class: 'dsd-seg-btn' + (i === 0 ? ' active' : ''), onclick: (e) => show(k, e.currentTarget) }, label)));
    UI.modal({ title: 'Circuit diagram', sub: `Experiment ${p.exp.no} · ${p.title}`, size: 'xl', tools: tabs, body: content });
    show('sch', tabs.firstChild);
  }

  /* ---------- experiment 12: the ISE mock ---------- */
  let ise = null;
  function renderISELeft() { UI.fill(left, ise ? ise.stepsCard() : null); }
  function renderISERight() { UI.fill(right, ise ? ise.obsCard().map((c) => pill(c.id, c.title, c.badge, c.cls, c.body)) : null); }
  function mountISE() {
    UI.fill(stage); kit = null;
    const p = part();
    ise = UI.ISE(stage, {
      mark: (flag, msg) => mark(p.key, flag, msg),
      progress: prog(p.key), save: saveProgress,
      refresh: () => { renderISELeft(); renderISERight(); renderHero(); renderHeader(); },
    });
  }

  /* ---------- whole page ---------- */
  function renderAll() {
    const p = part();
    document.title = `Exp ${p.exp.no}: ${p.exp.short} · DSD Lab · BitHub`;
    root.classList.toggle('software', !!p.exp.software);
    renderHeader(); renderHero();
    if (p.exp.software) {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      eng = null; ex = null; analog = null;
      mountISE(); renderToolbar(); renderLeft(); renderRight(); UI.fill(status, h('span', { class: 'muted' }, 'Xilinx ISE Project Navigator (simulated) · Verilog HDL'));
      banner.classList.remove('show');
      return;
    }
    if (ise) { ise.destroy(); ise = null; UI.fill(stage); }
    ensureKit();
    eng = null; scope = null; recompute(); kit.render();
    renderLeft(); renderToolbar(); renderRight(); renderBanner(); renderStatus();
  }

  /* ---------- keyboard ---------- */
  document.addEventListener('keydown', (e) => {
    if (e.target.closest && e.target.closest('input, textarea, select, [contenteditable], .ise')) return;
    if (document.querySelector('.dsd-modal-overlay')) return;
    if (part().exp.software) return;
    const sel = kit && kit.selected();
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); undo(); return; }
    if (e.key === 'Escape') { state.armed = null; kit.select(null); renderLeft(); renderStatus(); return; }
    if ((e.key === 'Delete' || e.key === 'Backspace') && sel) { e.preventDefault(); onRemove(sel.id); return; }
    if ((e.key === 'r' || e.key === 'R') && sel && (sel.kind === 'chip' || sel.kind === 'seg7')) { onModify(sel.id, { rot: sel.rot ? 0 : 180 }); return; }
    if (/^[0-7]$/.test(e.key)) { toggleInput(+e.key); return; }
    if (e.key === 'p' || e.key === 'P') { pulse(); return; }
  });

  loadPart(state.key);
  // first visit: a short tour of the interface
  if (!store.get('tourSeen', false)) setTimeout(() => UI.startTour(() => store.set('tourSeen', true)), 500);
  window.DSDApp = { state, recompute: () => { recompute(); kit && kit.render(); }, part };
})();
