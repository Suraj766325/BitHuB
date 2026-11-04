/* ============================================================
 * refbuild.js — turns a logical description of an experiment
 * (chips, passives and nets) into a real breadboard build:
 * every connection becomes a jumper wire in a free hole, chips get
 * their VCC/GND wired to the rails, the rails to the kit supply.
 * The result is an ordinary build, run by the same simulator.
 *
 * spec = {
 *   chips: [{ ref, type, col, rot }], segs: [{ ref, col }],
 *   res:   [{ ref, ohms, h1, h2 }],   caps: [{ ref, farads, h1, h2 }],
 *   nets:  [[endpoint, ...], ...]  endpoint: 'IC1.3' | 'IN0' | 'OUT2' |
 *          'PLS' | 'PLN' | 'CH1' | 'VCC' | 'GND' | 'R1.2' | 'DISP1.7'
 * }
 * ============================================================ */
(function (G) {
  'use strict';
  const DSD = (G.DSD = G.DSD || {});
  const B = DSD.Board;

  function build(spec) {
    const parts = [];
    const used = new Set();
    let wid = 0;
    const take = (h) => { if (used.has(h)) throw new Error('refbuild: hole used twice ' + h); used.add(h); };
    let optional = false; // wires of nets marked optional (redundant on TTL, good practice)
    const wire = (h1, h2, color) => {
      take(h1); take(h2);
      const w = { id: 'w' + (++wid), kind: 'wire', h1, h2, color };
      if (optional) w.optional = true;
      parts.push(w);
    };

    for (const c of spec.chips || []) {
      const p = { id: c.ref.toLowerCase(), kind: 'chip', ref: c.ref, type: c.type, col: c.col, rot: c.rot || 0 };
      B.partLegs(p).forEach((l) => take(l.hole)); parts.push(p);
    }
    for (const s of spec.segs || []) {
      const p = { id: s.ref.toLowerCase(), kind: 'seg7', ref: s.ref, col: s.col, rot: 0 };
      B.partLegs(p).forEach((l) => take(l.hole)); B.partCovers(p).forEach((h) => used.add(h)); parts.push(p);
    }
    for (const r of spec.res || []) { take(r.h1); take(r.h2); parts.push({ id: r.ref.toLowerCase(), kind: 'resistor', ref: r.ref, ohms: r.ohms, h1: r.h1, h2: r.h2 }); }
    for (const c of spec.caps || []) { take(c.h1); take(c.h2); parts.push({ id: c.ref.toLowerCase(), kind: 'cap', ref: c.ref, farads: c.farads, h1: c.h1, h2: c.h2 }); }

    const partByRef = {}; parts.forEach((p) => { if (p.ref) partByRef[p.ref] = p; });
    const legHole = (ref, n) => {
      const p = partByRef[ref]; if (!p) throw new Error('refbuild: unknown part ' + ref);
      if (p.kind === 'resistor' || p.kind === 'cap') return n === 1 ? p.h1 : p.h2;
      return B.dipPinHole(p.col, B.partNpins(p), p.rot || 0, n);
    };

    // a free hole on the strip of `h` (nearest the channel first)
    const stripFree = (h) => {
      const q = B.parseHole(h);
      if (q.rail) { // any free hole on that rail, nearest column
        const cols = B.RAIL_COLS.slice().sort((a, b) => Math.abs(a - q.col) - Math.abs(b - q.col));
        for (const c of cols) { const r = B.railHole(q.rail, c); if (!used.has(r)) return r; }
        throw new Error('refbuild: rail full ' + q.rail);
      }
      const rows = B.TOP.includes(q.row) ? ['d', 'c', 'b', 'a', 'e'] : ['g', 'h', 'i', 'j', 'f'];
      for (const r of rows) { const x = B.hole(r, q.col); if (!used.has(x)) return x; }
      throw new Error('refbuild: strip full at ' + h);
    };
    const termFree = (t) => {
      const n = B.TERMS[t].sockets.length;
      for (let i = 0; i < n; i++) { const x = `${t}:${i}`; if (!used.has(x)) return x; }
      throw new Error('refbuild: terminal full ' + t);
    };
    const railFor = (h, pol) => {
      const q = B.parseHole(h);
      const top = q.rail ? q.rail[0] === 'T' : B.TOP.includes(q.row);
      return B.railHole((top ? 'T' : 'B') + (pol ? '+' : '-'), q.col || 3);
    };

    /* ---- supply: kit terminals -> top rails, top rails -> bottom rails ---- */
    wire('VCC:0', 'T+@3', 'red'); wire('GND:0', 'T-@4', 'black');
    for (const p of parts) {
      if (p.kind !== 'chip') continue;
      const def = DSD.LIB[p.type];
      for (const [pin, pol] of [[def.vcc, 1], [def.gnd, 0]]) {
        const h = legHole(p.ref, pin);
        wire(stripFree(h), stripFree(railFor(h, pol)), pol ? 'red' : 'black');
      }
    }

    /* ---- nets ---- */
    const anchor = (ep) => {
      if (ep === 'VCC' || ep === 'GND') return { rail: ep === 'VCC' ? 1 : 0 };
      if (B.TERMS[ep]) { const s = B.TERMS[ep].sockets[0]; return { term: ep, x: s.x, y: s.y }; }
      const m = /^([A-Z]+\d+)\.(\d+)$/.exec(ep);
      if (!m) throw new Error('refbuild: bad endpoint ' + ep);
      const h = legHole(m[1], +m[2]), xy = B.holeXY(h);
      return { hole: h, x: xy.x, y: xy.y };
    };
    const freeAt = (a) => (a.term ? termFree(a.term) : stripFree(a.hole));
    for (const net of spec.nets || []) {
      const eps = Array.isArray(net) ? net : net.pins;
      optional = !!net.optional;
      const has = (re) => eps.some((e) => re.test(e));
      const color = net.color || (has(/^IN/) ? 'yellow' : has(/^OUT/) ? 'green' : has(/^PL/) ? 'orange' : has(/^CH/) ? 'purple' : has(/^VCC$/) ? 'red' : has(/^GND$/) ? 'black' : 'blue');
      const anchors = eps.map(anchor);
      const rails = anchors.filter((a) => a.rail !== undefined), rest = anchors.filter((a) => a.rail === undefined);
      rest.sort((a, b) => a.x - b.x || a.y - b.y);
      for (let i = 1; i < rest.length; i++) wire(freeAt(rest[i - 1]), freeAt(rest[i]), color);
      for (const r of rails) {
        const a = rest[0];
        wire(freeAt(a), stripFree(railFor(a.hole || 'a3', r.rail)), r.rail ? 'red' : 'black');
      }
    }
    // bridge top and bottom rails only where the bottom rail is used; the bridge is
    // optional when everything on that rail is
    const railUsers = (r) => parts.filter((p) => (p.h1 || '').startsWith(r + '@') || (p.h2 || '').startsWith(r + '@'));
    for (const [top, bot, color] of [['T+', 'B+', 'red'], ['T-', 'B-', 'black']]) {
      const users = railUsers(bot);
      if (!users.length) continue;
      optional = users.every((p) => p.optional);
      wire(top + (bot === 'B+' ? '@60' : '@61'), bot + (bot === 'B+' ? '@60' : '@61'), color);
    }
    optional = false;
    return { parts };
  }

  DSD.RefBuild = { build };
})(typeof window !== 'undefined' ? window : globalThis);
