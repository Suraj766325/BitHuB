/* ============================================================
 * stage.js — the animation engine every visualizer shares.
 *
 * A visualizer never draws: it emits FRAMES. A frame is a plain
 * snapshot { nodes, edges, note, line } where
 *   node = { id, x, y, w, h, shape, text, sub, top, cls, ... }
 *   edge = { id, from, to, cls, label, bend, shift, fa, ta, arrow }
 * (x, y are centres). The Stage keeps one SVG element per id and
 * tweens position/size/opacity between frames, so a swap, a node
 * insertion or a tree rotation animates without any per-visualizer
 * animation code. The Player steps through a list of frames.
 * ============================================================ */
(function () {
  'use strict';
  const DSA = window.DSA;
  const { s } = DSA.UI;
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const lerp = (a, b, t) => a + (b - a) * t;
  const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const tagWidth = (t) => Math.max(30, String(t).length * 7.4 + 16);
  const sizeOf = (n) => {
    if (n.shape === 'circle') { const d = n.w || 44; return [d, d]; }
    if (n.shape === 'tag') return [n.w || tagWidth(n.text), 22];
    if (n.shape === 'text') return [n.w || String(n.text == null ? '' : n.text).length * 7.5, n.h || 18];
    return [n.w || 48, n.h == null ? 44 : n.h];
  };

  /** Bounding box [x0, y0, x1, y1] of a frame, labels included. */
  function bbox(frame) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const n of frame.nodes || []) {
      const [w, h] = sizeOf(n);
      let l = n.x - w / 2, r = n.x + w / 2, t = n.y - h / 2, b = n.y + h / 2;
      if (n.shape === 'bar') { t = n.y - h - 20; b = n.y + (n.sub != null ? 20 : 4); }
      if (n.shape === 'text' && n.anchor === 'start') { l = n.x; r = n.x + w; }
      if (n.shape === 'text' && n.anchor === 'end') { l = n.x - w; r = n.x; }
      if (n.shape === 'tag') { t -= 8; b += 8; l -= 8; r += 8; }
      if (n.sub != null && n.shape !== 'bar') b += 18;
      if (n.top != null) t -= 18;
      x0 = Math.min(x0, l); x1 = Math.max(x1, r); y0 = Math.min(y0, t); y1 = Math.max(y1, b);
    }
    return x0 === Infinity ? [0, 0, 100, 100] : [x0, y0, x1, y1];
  }

  class Stage {
    constructor(host) {
      this.svg = s('svg', { class: 'stage-svg', role: 'img', 'aria-label': 'Animation' });
      this.gE = s('g', { class: 'stage-edges' });
      this.gN = s('g', { class: 'stage-nodes' });
      this.svg.append(this.gE, this.gN);
      host.appendChild(this.svg);
      this.items = new Map();
      this.edges = new Map();
      this.view = null; this.viewFrom = null; this.viewTo = null;
      this.raf = 0;
    }

    /** Move to `frame` over `ms` milliseconds. view = [x, y, w, h]. */
    set(frame, ms, view) {
      if (reduceMotion()) ms = 0;
      const seen = new Set();
      for (const n of frame.nodes || []) {
        seen.add(n.id);
        const [w, h] = sizeOf(n);
        let it = this.items.get(n.id);
        if (!it) {
          const g = s('g', { class: 'n' });
          this.gN.appendChild(g);
          const e = n.enter || [0, 0];
          it = { g, sig: '', cur: { x: n.x + e[0], y: n.y + e[1], w, h, o: 0 } };
          this.items.set(n.id, it);
        }
        it.dead = false;
        it.spec = n;
        it.from = { ...it.cur };
        it.to = { x: n.x, y: n.y, w, h, o: n.o == null ? 1 : n.o };
        this.build(it);
      }
      for (const [id, it] of this.items) {
        if (seen.has(id) || it.dead) continue;
        it.dead = true; it.from = { ...it.cur }; it.to = { ...it.cur, o: 0 };
      }
      const seenE = new Set();
      for (const e of frame.edges || []) {
        const id = e.id || (typeof e.from === 'string' ? e.from : e.from.join(',')) + '>' + (typeof e.to === 'string' ? e.to : e.to.join(','));
        seenE.add(id);
        let ed = this.edges.get(id);
        if (!ed) {
          const g = s('g', { class: 'e' });
          ed = { g, line: s('path', { class: 'e-line' }), head: s('path', { class: 'e-head' }), text: s('text', { class: 'e-label' }), o: 0 };
          g.append(ed.line, ed.head, ed.text);
          this.gE.appendChild(g);
          this.edges.set(id, ed);
        }
        ed.dead = false; ed.spec = e; ed.fromO = ed.o; ed.toO = 1;
        ed.g.setAttribute('class', 'e ' + (e.cls || ''));
        ed.text.textContent = e.label == null ? '' : e.label;
      }
      for (const [id, ed] of this.edges) {
        if (seenE.has(id) || ed.dead) continue;
        ed.dead = true; ed.fromO = ed.o; ed.toO = 0;
      }
      if (view) {
        if (!this.view) { this.view = view.slice(); this.viewFrom = this.viewTo = view.slice(); }
        else { this.viewFrom = this.view.slice(); this.viewTo = view.slice(); }
      }
      cancelAnimationFrame(this.raf);
      if (!ms) { this.tick(1); this.sweep(); return; }
      const t0 = performance.now();
      const loop = (now) => {
        const t = Math.min(1, (now - t0) / ms);
        this.tick(ease(t));
        if (t < 1) this.raf = requestAnimationFrame(loop); else this.sweep();
      };
      this.raf = requestAnimationFrame(loop);
    }

    /** (Re)build a node's inner SVG when anything but its geometry changed. */
    build(it) {
      const n = it.spec;
      const sig = [n.shape, n.text, n.sub, n.top, n.dir, n.anchor, (n.divs || []).join('/'), n.tx].join('|');
      it.g.setAttribute('class', 'n n-' + (n.shape || 'rect') + ' ' + (n.cls || ''));
      if (sig === it.sig) return;
      it.sig = sig;
      it.g.replaceChildren();
      it.parts = {};
      const p = it.parts;
      const txt = (cls, t) => s('text', { class: cls }, t == null ? '' : String(t));
      if (n.shape === 'circle') {
        p.shape = s('circle', { class: 'n-shape' });
      } else if (n.shape === 'tag') {
        p.shape = s('rect', { class: 'n-shape' }); p.tip = s('path', { class: 'n-tip' });
      } else if (n.shape !== 'text') {
        p.shape = s('rect', { class: 'n-shape' });
        p.divs = (n.divs || []).map(() => s('line', { class: 'n-div' }));
      }
      if (p.shape) it.g.appendChild(p.shape);
      if (p.tip) it.g.appendChild(p.tip);
      if (p.divs) it.g.append(...p.divs);
      p.text = txt('n-text', n.text);
      if (n.shape === 'text' && n.anchor) p.text.style.textAnchor = n.anchor; // inline: the stylesheet centres .n-text
      it.g.appendChild(p.text);
      if (n.sub != null) { p.sub = txt('n-sub', n.sub); it.g.appendChild(p.sub); }
      if (n.top != null) { p.top = txt('n-top', n.top); it.g.appendChild(p.top); }
    }

    /** Apply interpolated geometry at progress t (already eased). */
    tick(t) {
      for (const it of this.items.values()) {
        const c = it.cur, a = it.from, b = it.to;
        c.x = lerp(a.x, b.x, t); c.y = lerp(a.y, b.y, t); c.w = lerp(a.w, b.w, t); c.h = lerp(a.h, b.h, t); c.o = lerp(a.o, b.o, t);
        this.place(it);
      }
      for (const ed of this.edges.values()) {
        ed.o = lerp(ed.fromO, ed.toO, t);
        this.route(ed);
      }
      if (this.viewTo) {
        this.view = this.viewFrom.map((v, i) => lerp(v, this.viewTo[i], t));
        this.svg.setAttribute('viewBox', this.view.map((v) => v.toFixed(1)).join(' '));
      }
    }

    place(it) {
      const c = it.cur, n = it.spec, p = it.parts;
      it.g.setAttribute('transform', `translate(${c.x.toFixed(2)},${c.y.toFixed(2)})`);
      it.g.setAttribute('opacity', c.o.toFixed(3));
      const w = c.w, hh = c.h;
      if (n.shape === 'circle') {
        p.shape.setAttribute('r', w / 2);
        if (p.sub) p.sub.setAttribute('y', w / 2 + 14);
        if (p.top) p.top.setAttribute('y', -w / 2 - 6);
      } else if (n.shape === 'tag') {
        p.shape.setAttribute('x', -w / 2); p.shape.setAttribute('y', -11); p.shape.setAttribute('width', w); p.shape.setAttribute('height', 22); p.shape.setAttribute('rx', 11);
        const d = { down: 'M-5,11 L5,11 L0,18 Z', up: 'M-5,-11 L5,-11 L0,-18 Z', left: `M${-w / 2},-5 L${-w / 2},5 L${-w / 2 - 7},0 Z`, right: `M${w / 2},-5 L${w / 2},5 L${w / 2 + 7},0 Z` }[n.dir || 'down'];
        p.tip.setAttribute('d', n.dir === 'none' ? '' : d);
      } else if (n.shape === 'bar') {
        p.shape.setAttribute('x', -w / 2); p.shape.setAttribute('y', -hh); p.shape.setAttribute('width', w); p.shape.setAttribute('height', Math.max(0, hh)); p.shape.setAttribute('rx', 5);
        p.text.setAttribute('y', -hh - 8);
        if (p.sub) p.sub.setAttribute('y', 15);
      } else if (n.shape !== 'text') {
        p.shape.setAttribute('x', -w / 2); p.shape.setAttribute('y', -hh / 2); p.shape.setAttribute('width', w); p.shape.setAttribute('height', hh); p.shape.setAttribute('rx', n.rx == null ? 9 : n.rx);
        (n.divs || []).forEach((f, i) => { const x = -w / 2 + w * f; const l = p.divs[i]; l.setAttribute('x1', x); l.setAttribute('x2', x); l.setAttribute('y1', -hh / 2); l.setAttribute('y2', hh / 2); });
        if (n.tx) p.text.setAttribute('x', n.tx);
        if (p.sub) p.sub.setAttribute('y', hh / 2 + 15);
        if (p.top) p.top.setAttribute('y', -hh / 2 - 7);
      }
    }

    /** Point where the segment centre→(tx,ty) leaves the node's outline. */
    clip(it, tx, ty, gap) {
      const c = it.cur, n = it.spec;
      const dx = tx - c.x, dy = ty - c.y, len = Math.hypot(dx, dy) || 1;
      if (n.shape === 'circle') { const r = c.w / 2 + gap; return [c.x + (dx / len) * r, c.y + (dy / len) * r]; }
      const hw = c.w / 2 + gap, hh = (n.shape === 'tag' ? 11 : c.h / 2) + gap;
      const k = Math.min(dx ? hw / Math.abs(dx) : Infinity, dy ? hh / Math.abs(dy) : Infinity);
      return [c.x + dx * k, c.y + dy * k];
    }

    route(ed) {
      const e = ed.spec;
      const A = typeof e.from === 'string' ? this.items.get(e.from) : null;
      const B = typeof e.to === 'string' ? this.items.get(e.to) : null;
      if ((typeof e.from === 'string' && !A) || (typeof e.to === 'string' && !B)) { ed.g.setAttribute('opacity', 0); return; }
      let a = A ? [A.cur.x, A.cur.y] : e.from.slice(), b = B ? [B.cur.x, B.cur.y] : e.to.slice();
      if (e.fa && A) a = [a[0] + e.fa[0], a[1] + e.fa[1]];
      if (e.ta && B) b = [b[0] + e.ta[0], b[1] + e.ta[1]];
      let dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len, ny = dx / len;
      if (e.shift) { a = [a[0] + nx * e.shift, a[1] + ny * e.shift]; b = [b[0] + nx * e.shift, b[1] + ny * e.shift]; }
      const bend = e.bend || 0;
      const ctrl = [(a[0] + b[0]) / 2 + nx * bend, (a[1] + b[1]) / 2 + ny * bend];
      // clip to outlines (skip when an explicit anchor was given)
      const shifted = (it, pt) => ({ cur: { ...it.cur, x: pt[0], y: pt[1] }, spec: it.spec });
      if (A && !e.fa) a = this.clip(e.shift ? shifted(A, a) : A, bend ? ctrl[0] : b[0], bend ? ctrl[1] : b[1], 2);
      if (B && !e.ta) b = this.clip(e.shift ? shifted(B, b) : B, bend ? ctrl[0] : a[0], bend ? ctrl[1] : a[1], e.arrow === false ? 2 : 4);
      const f = (v) => v.toFixed(1);
      ed.line.setAttribute('d', bend ? `M${f(a[0])},${f(a[1])} Q${f(ctrl[0])},${f(ctrl[1])} ${f(b[0])},${f(b[1])}` : `M${f(a[0])},${f(a[1])} L${f(b[0])},${f(b[1])}`);
      if (e.arrow === false) ed.head.setAttribute('d', '');
      else {
        const sx = bend ? ctrl[0] : a[0], sy = bend ? ctrl[1] : a[1];
        const ang = Math.atan2(b[1] - sy, b[0] - sx), L = 9, W = 4.5;
        const p1 = [b[0] - L * Math.cos(ang) + W * Math.sin(ang), b[1] - L * Math.sin(ang) - W * Math.cos(ang)];
        const p2 = [b[0] - L * Math.cos(ang) - W * Math.sin(ang), b[1] - L * Math.sin(ang) + W * Math.cos(ang)];
        ed.head.setAttribute('d', `M${f(b[0])},${f(b[1])} L${f(p1[0])},${f(p1[1])} L${f(p2[0])},${f(p2[1])} Z`);
      }
      if (e.label != null) {
        const mx = bend ? (a[0] + 2 * ctrl[0] + b[0]) / 4 : (a[0] + b[0]) / 2, my = bend ? (a[1] + 2 * ctrl[1] + b[1]) / 4 : (a[1] + b[1]) / 2;
        ed.text.setAttribute('x', f(mx + nx * -11)); ed.text.setAttribute('y', f(my + ny * -11 + 4));
      }
      const o = Math.min(ed.o, A ? A.cur.o : 1, B ? B.cur.o : 1);
      ed.g.setAttribute('opacity', o.toFixed(3));
    }

    sweep() {
      for (const [id, it] of this.items) if (it.dead) { it.g.remove(); this.items.delete(id); }
      for (const [id, ed] of this.edges) if (ed.dead) { ed.g.remove(); this.edges.delete(id); }
    }

    clear() { cancelAnimationFrame(this.raf); this.items.clear(); this.edges.clear(); this.gE.replaceChildren(); this.gN.replaceChildren(); this.view = null; }
    destroy() { cancelAnimationFrame(this.raf); this.svg.remove(); }
  }

  /** Steps a Stage through a list of frames; owns timing only. */
  class Player {
    constructor(stage, opts) {
      this.stage = stage;
      this.opts = Object.assign({ minW: 640, minH: 300, pad: 26, onFrame() {}, onState() {}, onEnd() {} }, opts);
      this.frames = []; this.i = 0; this.playing = false; this.speed = 1; this.timer = 0;
    }
    /** Fit a view to every frame of the sequence so the picture never jumps mid-run. */
    fit(frames) {
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (const fr of frames) { const b = bbox(fr); x0 = Math.min(x0, b[0]); y0 = Math.min(y0, b[1]); x1 = Math.max(x1, b[2]); y1 = Math.max(y1, b[3]); }
      const { minW, minH, pad } = this.opts;
      let w = x1 - x0 + pad * 2, h = y1 - y0 + pad * 2;
      const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      w = Math.max(w, minW); h = Math.max(h, minH);
      return [cx - w / 2, cy - h / 2, w, h];
    }
    load(frames, o) {
      o = o || {};
      this.pause();
      this.frames = frames;
      this.view = o.view || this.fit(frames);
      this.i = 0;
      this.show(0, o.instant ? 0 : 350);
      if (o.autoplay !== false && frames.length > 1) this.play();
    }
    show(i, ms) {
      this.i = Math.max(0, Math.min(this.frames.length - 1, i));
      const fr = this.frames[this.i];
      if (!fr) return;
      this.stage.set(fr, ms == null ? 480 / this.speed : ms, this.view);
      this.opts.onFrame(fr, this.i, this.frames.length);
    }
    play() {
      if (this.i >= this.frames.length - 1) this.show(0, 0);
      this.playing = true; this.opts.onState(true);
      this.queue();
    }
    queue() {
      clearTimeout(this.timer);
      const fr = this.frames[this.i] || {};
      this.timer = setTimeout(() => {
        if (!this.playing) return;
        if (this.i >= this.frames.length - 1) { this.playing = false; this.opts.onState(false); this.opts.onEnd(); return; }
        this.show(this.i + 1);
        this.queue();
      }, (1150 * (fr.hold || 1)) / this.speed);
    }
    pause() { clearTimeout(this.timer); if (this.playing) { this.playing = false; this.opts.onState(false); } }
    toggle() { if (this.playing) this.pause(); else this.play(); }
    step(d) { this.pause(); this.show(this.i + d); }
    seek(i) { this.pause(); this.show(i, 200); }
    setSpeed(v) { this.speed = v; if (this.playing) this.queue(); }
    destroy() { this.pause(); this.stage.destroy(); }
  }

  DSA.Stage = Stage; DSA.Player = Player; DSA.bbox = bbox;
})();
