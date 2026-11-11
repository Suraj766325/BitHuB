/* ============================================================
 * viz/core.js — visualizer registry, drawing helpers and the
 * panel that hosts a visualizer (controls, stage, caption,
 * pseudocode, transport).
 *
 * A visualizer is a definition:
 *   DSA.viz.define('stack', {
 *     title, blurb,
 *     variants: [{ id, label }],                 // optional
 *     args: { value: { label, type, def, fresh } },
 *     ops:  [{ id, label, uses: ['value'], primary }],
 *     create(variant) -> state,
 *     draw(state, marks) -> { nodes, edges },     // see stage.js
 *     run(state, op, args, snap),                 // snap(note, marks) records a frame
 *     code: { op: ['pseudocode line', ...] },     // marks.line indexes into it
 *     demo: [['push', { value: 5 }], ...],        // script used by the slides
 *   });
 * run() executes the real algorithm on `state` and calls snap() at
 * every step worth showing, so what is animated is what was computed.
 * ============================================================ */
(function () {
  'use strict';
  const DSA = window.DSA;
  const { h, icon, fill } = DSA.UI;

  const defs = {};
  DSA.viz = {
    define(id, def) { def.id = id; defs[id] = def; },
    get: (id) => defs[id],
    all: () => Object.values(defs),
  };
  class VizError extends Error {}
  DSA.VizError = VizError;

  /** `code`, **bold** and line breaks in captions and study text. */
  DSA.fmt = (t) => DSA.UI.esc(t == null ? '' : t)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    .replace(/\n/g, '<br>');

  /* ---------- drawing helpers shared by the visualizers ---------- */
  const D = (DSA.draw = {});
  /** A row of array cells. items: values or { v, k } (k = stable identity so swaps glide). */
  D.cells = (items, o) => {
    o = Object.assign({ id: 'c', x: 0, y: 0, cw: 50, ch: 44, gap: 6, marks: {}, index: true, base: 0 }, o);
    return items.map((it, i) => {
      const v = it != null && typeof it === 'object' ? it.v : it;
      const k = it != null && typeof it === 'object' && it.k != null ? it.k : i;
      return { id: o.id + k, shape: 'rect', x: o.x + i * (o.cw + o.gap), y: o.y, w: o.cw, h: o.ch, text: v == null ? '' : v, sub: o.index ? i + o.base : undefined, cls: (v == null ? 'n-empty ' : '') + (o.marks[i] || '') };
    });
  };
  D.tag = (id, text, x, y, dir, cls) => ({ id, shape: 'tag', text, x, y, dir: dir || 'down', cls: cls || '' });
  D.text = (id, text, x, y, cls, anchor) => ({ id, shape: 'text', text, x, y, cls: cls || '', anchor: anchor || 'middle' });

  /** Linked-list node [ value | next ]. */
  D.lnode = (id, v, x, y, cls) => ({ id, shape: 'rect', x, y, w: 76, h: 40, text: v, tx: -13, divs: [0.66], cls: cls || '' });
  D.next = (from, to, cls) => ({ id: from + '>next', from, to, fa: [25, 0], cls: cls || '' });
  /** A vertical stack growing upwards from (x, y). items: { v, k }. */
  D.vstack = (items, o) => {
    o = Object.assign({ id: 's', x: 0, y: 0, cw: 64, ch: 38, gap: 4, marks: {}, cap: 0, label: 'stack' }, o);
    const nodes = [];
    const rows = Math.max(o.cap, items.length, 1);
    nodes.push({ id: o.id + '-frame', shape: 'rect', x: o.x, y: o.y - ((rows - 1) * (o.ch + o.gap)) / 2, w: o.cw + 16, h: rows * (o.ch + o.gap) + 12, cls: 'n-frame', sub: o.label });
    items.forEach((it, i) => nodes.push({ id: o.id + it.k, shape: 'rect', x: o.x, y: o.y - i * (o.ch + o.gap), w: o.cw, h: o.ch, text: it.v, cls: o.marks[i] || '', enter: [0, -40] }));
    return nodes;
  };
  /* ---------- the panel ---------- */
  /**
   * Mount visualizer `id` into `host`.
   * opts.mode   'full' (interactive) | 'slide' (plays opts.script, no controls)
   * Returns { destroy() }.
   */
  DSA.mountViz = function (host, id, opts) {
    const def = defs[id];
    opts = Object.assign({ mode: 'full' }, opts);
    if (!def) { host.appendChild(h('p', { class: 'muted' }, 'Visualizer not found: ' + id)); return { destroy() {} }; }
    const full = opts.mode === 'full';
    let variant = opts.variant || (def.variants ? def.variants[0].id : null);
    let state;

    const stageBox = h('div', { class: 'viz-stage' });
    const note = h('div', { class: 'viz-note', 'aria-live': 'polite' });
    const codeBox = h('div', { class: 'viz-code' });
    const bar = h('div', { class: 'viz-bar' });
    const controls = h('div', { class: 'viz-controls' });
    const root = h('div', { class: 'viz ' + (full ? 'viz-full' : 'viz-slide') },
      full ? controls : null,
      h('div', { class: 'viz-body' }, h('div', { class: 'viz-main' }, stageBox, note, bar), full ? codeBox : null));
    host.appendChild(root);

    const stage = new DSA.Stage(stageBox);
    let codeLines = [], codeOp = null;
    const player = new DSA.Player(stage, Object.assign({
      onFrame(fr, i, n) {
        note.innerHTML = DSA.fmt(fr.note || '');
        note.className = 'viz-note ' + (fr.tone || '');
        prog.max = Math.max(1, n - 1); prog.value = i;
        count.textContent = n > 1 ? `${i + 1} / ${n}` : '';
        if (full) showCode(fr.op, fr.line);
      },
      onState(playing) { fill(btnPlay, icon(playing ? 'pause' : 'play')); btnPlay.title = playing ? 'Pause' : 'Play'; },
    }, def.view || {}));

    /* transport */
    const btnPlay = h('button', { class: 'viz-tbtn primary', title: 'Play', onclick: () => player.toggle() }, icon('play'));
    const prog = h('input', { class: 'viz-prog', type: 'range', min: 0, max: 1, value: 0, 'aria-label': 'Step', oninput: () => player.seek(+prog.value) });
    const count = h('span', { class: 'viz-count' });
    const speed = h('select', { class: 'viz-speed', title: 'Speed', onchange: () => player.setSpeed(+speed.value) },
      [['0.5', '0.5×'], ['1', '1×'], ['1.75', '1.75×'], ['3', '3×']].map(([v, l]) => h('option', { value: v, selected: v === '1' }, l)));
    bar.append(
      h('button', { class: 'viz-tbtn', title: 'Previous step', onclick: () => player.step(-1) }, icon('stepb')),
      btnPlay,
      h('button', { class: 'viz-tbtn', title: 'Next step', onclick: () => player.step(1) }, icon('stepf')),
      prog, count, speed);

    function showCode(op, line) {
      if (op !== codeOp) {
        codeOp = op;
        const lines = (def.code && def.code[op]) || null;
        codeLines = [];
        if (!lines) { fill(codeBox, h('div', { class: 'viz-code-empty' }, def.blurb || 'Run an operation to see its algorithm here.')); return; }
        const pre = h('ol', { class: 'viz-code-list' });
        lines.forEach((l) => { const li = h('li', {}, h('span', { style: { paddingLeft: (l.length - l.trimStart().length) * 0.55 + 'em' } }, l.trim())); codeLines.push(li); pre.appendChild(li); });
        fill(codeBox, h('div', { class: 'viz-code-title' }, (def.codeTitle && def.codeTitle[op]) || 'Algorithm'), pre);
      }
      codeLines.forEach((li, i) => li.classList.toggle('on', Array.isArray(line) ? line.includes(i) : i === line));
    }

    /** Run one operation on the live state and return its frames. */
    function record(op, args) {
      const frames = [];
      const snap = (noteText, marks, extra) => {
        marks = marks || {};
        frames.push(Object.assign({ note: noteText, line: marks.line, op, tone: marks.tone }, def.draw(state, marks), extra));
      };
      def.run(state, op, args || {}, snap);
      if (!frames.length) snap('');
      return frames;
    }
    const idle = (text) => [Object.assign({ note: text == null ? (def.hint || 'Pick an operation above.') : text }, def.draw(state, {}))];

    /* controls (full mode) */
    const inputs = {};
    function buildControls() {
      fill(controls);
      if (def.variants && !opts.lock) {
        controls.appendChild(h('div', { class: 'seg' }, def.variants.map((v) => h('button', { class: 'seg-btn' + (v.id === variant ? ' active' : ''), onclick: () => { variant = v.id; reset(); buildControls(); } }, v.label))));
      }
      const ops = (def.ops || []).filter((o) => !o.only || o.only.includes(variant));
      const used = new Set(ops.flatMap((o) => o.uses || []));
      const fields = h('div', { class: 'viz-fields' });
      for (const key of Object.keys(def.args || {})) {
        if (!used.has(key)) continue;
        const a = def.args[key];
        const val = typeof a.def === 'function' ? a.def(state) : a.def;
        const inp = h('input', { class: 'viz-input' + (a.type === 'text' || a.type === 'list' ? ' wide' : ''), type: 'text', inputmode: a.type === 'int' ? 'numeric' : 'text', value: val, 'aria-label': a.label, spellcheck: 'false' });
        inputs[key] = inp;
        fields.appendChild(h('label', { class: 'viz-field' }, h('span', {}, a.label), inp));
        if (a.examples) fields.appendChild(h('div', { class: 'viz-examples' }, a.examples.map((ex) => h('button', { class: 'chip-btn', title: 'Use this example', onclick: () => { inp.value = ex; } }, ex))));
      }
      if (fields.children.length) controls.appendChild(fields);
      controls.appendChild(h('div', { class: 'viz-ops' },
        ops.map((o) => h('button', { class: 'btn' + (o.primary ? ' primary' : ''), onclick: () => runOp(o) }, o.label)),
        h('button', { class: 'btn ghost', title: 'Start again', onclick: () => { reset(); buildControls(); } }, icon('replay'), 'Reset')));
    }
    function readArgs(o) {
      const out = {};
      for (const key of o.uses || []) {
        const a = def.args[key], raw = inputs[key].value.trim();
        if (a.type === 'int') {
          if (!/^-?\d+$/.test(raw)) throw new VizError(`${a.label} must be a whole number.`);
          const v = parseInt(raw, 10);
          if (v < (a.min == null ? -999 : a.min) || v > (a.max == null ? 999 : a.max)) throw new VizError(`${a.label} must be between ${a.min == null ? -999 : a.min} and ${a.max == null ? 999 : a.max}.`);
          out[key] = v;
        } else if (a.type === 'list') {
          const parts = raw.split(/[\s,]+/).filter(Boolean);
          if (!parts.length || parts.some((p) => !/^-?\d+$/.test(p))) throw new VizError(`${a.label}: enter whole numbers separated by commas.`);
          if (parts.length > (a.max || 12)) throw new VizError(`${a.label}: at most ${a.max || 12} values.`);
          out[key] = parts.map(Number);
        } else {
          if (!raw) throw new VizError(`${a.label} is empty.`);
          out[key] = raw;
        }
      }
      return out;
    }
    function runOp(o) {
      try {
        const args = readArgs(o);
        const frames = record(o.id, args);
        player.load(frames);
        for (const key of o.uses || []) { const a = def.args[key]; if (a.fresh && typeof a.def === 'function') inputs[key].value = a.def(state); }
      } catch (e) {
        if (!(e instanceof VizError)) throw e;
        note.textContent = e.message; note.className = 'viz-note bad';
      }
    }
    function reset() {
      state = def.create(variant);
      codeOp = undefined;
      stage.clear();
      player.load(idle(), { autoplay: false, instant: true });
    }

    /* slide mode: play a fixed script from a fresh state */
    function playScript() {
      state = def.create(variant);
      let frames = [];
      for (const step of opts.script || def.demo || []) {
        try { frames = frames.concat(record(step[0], step[1])); } catch (e) { if (!(e instanceof VizError)) throw e; }
      }
      if (!frames.length) frames = idle('');
      stage.clear();
      player.load(frames, { autoplay: opts.autoplay !== false, instant: true });
    }

    if (full) { reset(); buildControls(); if (opts.autodemo && (opts.script || def.demo)) playScript(); }
    else playScript();

    return { destroy() { player.destroy(); root.remove(); }, replay: playScript, player };
  };
})();
