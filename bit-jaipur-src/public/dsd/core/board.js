/* ============================================================
 * board.js — trainer kit + 830-point breadboard model.
 * Adapted from Better ALUU core/board.js (single board, plus the
 * trainer's own terminals).
 *
 * Breadboard: columns 1..63, rows a-e (top) and f-j (bottom).
 *   Each column-half (5 holes) is one metal strip.
 *   Four full-length power rails:
 *      T-  top outer (blue)     T+  top inner (red)
 *      B-  bottom inner (blue)  B+  bottom outer (red)
 *   Rails carry nothing until you wire them to the kit's +5V/GND.
 *
 * Trainer terminals (each is one node with several sockets):
 *   VCC, GND           +5 V and ground (top left)
 *   IN0..IN7           logic switch outputs
 *   OUT0..OUT7         logic indicator (LED) inputs
 *   PLS, PLN           mono pulser: P (normally 0), P' (normally 1)
 *   CH1, CH2           oscilloscope probes
 *
 * Hole ids:  "f14"  breadboard row f, column 14
 *            "T+@15" top red rail, hole under column 15
 *            "IN3:1" second socket of logic input 3
 * All geometry is in pitch units (1 = 2.54 mm), kit frame.
 * ============================================================ */
(function (G) {
  'use strict';
  const DSD = (G.DSD = G.DSD || {});

  const NCOL = 63;
  const ROWS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
  const TOP = ['a', 'b', 'c', 'd', 'e'], BOT = ['f', 'g', 'h', 'i', 'j'];
  const RAILS = ['T-', 'T+', 'B-', 'B+'];
  const RAIL_POL = { 'T-': 0, 'T+': 1, 'B-': 0, 'B+': 1 };
  const RAIL_COLS = [];
  for (let g = 0; g < 10; g++) for (let k = 0; k < 5; k++) RAIL_COLS.push(3 + g * 6 + k);
  const RAIL_COLSET = new Set(RAIL_COLS);
  const ROW_Y = { 'T-': 1, 'T+': 2, a: 4, b: 5, c: 6, d: 7, e: 8, f: 11, g: 12, h: 13, i: 14, j: 15, 'B-': 17, 'B+': 18 };
  const BB = { x: 3, y: 15, w: 66, h: 19.6 };   // breadboard placement on the kit
  const KIT = { w: 90, h: 60 };

  /* ---------- trainer terminals ---------- */
  const TERMS = {};
  const term = (id, label, sockets, extra) => { TERMS[id] = Object.assign({ id, label, sockets }, extra); };
  term('VCC', '+5V', [4, 5.5, 7, 8.5].map((x) => ({ x, y: 8 })), { kind: 'power', color: 'red' });
  term('GND', 'GND', [12, 13.5, 15, 16.5].map((x) => ({ x, y: 8 })), { kind: 'power', color: 'black' });
  const OUT_X = (i) => 34 + (7 - i) * 7;   // OUT7 on the left ... OUT0 on the right
  const IN_X = (i) => 8 + (7 - i) * 8;
  for (let i = 0; i < 8; i++) {
    term('OUT' + i, 'L' + i, [{ x: OUT_X(i) - 0.75, y: 10 }, { x: OUT_X(i) + 0.75, y: 10 }], { kind: 'out', index: i, cx: OUT_X(i) });
    term('IN' + i, 'S' + i, [{ x: IN_X(i) - 0.75, y: 38 }, { x: IN_X(i) + 0.75, y: 38 }], { kind: 'in', index: i, cx: IN_X(i) });
  }
  term('PLS', 'P', [{ x: 75.5, y: 26 }, { x: 77, y: 26 }], { kind: 'pulse' });
  term('PLN', 'P′', [{ x: 82.5, y: 26 }, { x: 84, y: 26 }], { kind: 'pulse' });
  term('CH1', 'CH1', [{ x: 75.5, y: 33 }, { x: 77, y: 33 }], { kind: 'probe' });
  term('CH2', 'CH2', [{ x: 82.5, y: 33 }, { x: 84, y: 33 }], { kind: 'probe' });

  const hole = (row, col) => `${row}${col}`;
  const railHole = (rail, col) => `${rail}@${col}`;

  const HOLE_RE = /^([a-j])(\d{1,2})$/, RAIL_RE = /^([TB][+-])@(\d{1,2})$/, TERM_RE = /^([A-Z]+\d?):(\d)$/;
  function parseHole(id) {
    let m = HOLE_RE.exec(id);
    if (m) return { row: m[1], col: +m[2] };
    m = RAIL_RE.exec(id);
    if (m) return { rail: m[1], col: +m[2] };
    m = TERM_RE.exec(id);
    if (m && TERMS[m[1]]) return { term: m[1], idx: +m[2] };
    return null;
  }
  function isValidHole(id) {
    const h = parseHole(id); if (!h) return false;
    if (h.term) return h.idx < TERMS[h.term].sockets.length;
    if (h.rail) return RAIL_COLSET.has(h.col);
    return h.col >= 1 && h.col <= NCOL;
  }
  // electrical node key of a hole
  function stripKey(id) {
    const h = parseHole(id);
    if (h.term) return h.term;
    if (h.rail) return 'R' + h.rail;
    return `${h.col}${TOP.includes(h.row) ? 'T' : 'B'}`;
  }
  function holeXY(id) {
    const h = parseHole(id);
    if (h.term) return TERMS[h.term].sockets[h.idx];
    return { x: BB.x + h.col + 1.5, y: BB.y + ROW_Y[h.rail || h.row] };
  }
  const RAIL_NAME = { 'T-': 'top blue (−) rail', 'T+': 'top red (+) rail', 'B-': 'bottom blue (−) rail', 'B+': 'bottom red (+) rail' };
  function describeHole(id) {
    const h = parseHole(id);
    if (!h) return id;
    if (h.term) {
      const t = TERMS[h.term];
      return { VCC: '+5 V supply terminal', GND: 'Ground terminal', PLS: 'Pulser output P', PLN: 'Pulser output P′', CH1: 'Oscilloscope CH1', CH2: 'Oscilloscope CH2' }[h.term]
        || (t.kind === 'in' ? `Logic input S${t.index}` : `Logic indicator L${t.index}`);
    }
    if (h.rail) return `${RAIL_NAME[h.rail]}, column ${h.col}`;
    return `Row ${h.row}, column ${h.col}`;
  }

  /* ---------- part footprints ---------- */
  // DIP footprint straddles the channel on rows e/f.
  // rot 0 = notch on the LEFT (pin 1 bottom-left, row f). rot 180 = notch on the right.
  function dipPinHole(col, npins, rot, pin) {
    const half = npins / 2;
    if (!rot) return pin <= half ? hole('f', col + pin - 1) : hole('e', col + (npins - pin));
    return pin <= half ? hole('e', col + half - pin) : hole('f', col + (pin - half - 1));
  }
  function partNpins(p) {
    if (p.kind === 'chip') return DSD.LIB[p.type].npins;
    if (p.kind === 'seg7') return 10;
    return 0;
  }
  const dipFits = (col, npins) => col >= 1 && col + npins / 2 - 1 <= NCOL;
  // legs: [{hole, name, pin}]
  function partLegs(p) {
    switch (p.kind) {
      case 'chip': case 'seg7': {
        const n = partNpins(p), out = [];
        for (let i = 1; i <= n; i++) out.push({ hole: dipPinHole(p.col, n, p.rot || 0, i), name: 'pin ' + i, pin: i });
        return out;
      }
      case 'resistor': case 'cap': case 'wire':
        return [{ hole: p.h1, name: 'end 1' }, { hole: p.h2, name: 'end 2' }];
      default: return [];
    }
  }
  // holes a part blocks without being electrically connected (display body)
  function partCovers(p) {
    if (p.kind !== 'seg7') return [];
    const out = [];
    for (let c = p.col; c < p.col + 5; c++) out.push(hole('d', c), hole('g', c));
    return out;
  }

  class UF {
    constructor() { this.p = new Map(); }
    find(a) {
      if (!this.p.has(a)) this.p.set(a, a);
      let r = a; while (this.p.get(r) !== r) r = this.p.get(r);
      let c = a; while (this.p.get(c) !== r) { const n = this.p.get(c); this.p.set(c, r); c = n; }
      return r;
    }
    union(a, b) { const ra = this.find(a), rb = this.find(b); if (ra !== rb) this.p.set(ra, rb); }
  }

  /* ============================================================
   * extract(build, power) -> netlist for DSD.Sim + maps for the UI
   * build = { parts: [...] }, power = supply switched on
   * ============================================================ */
  function extract(build, power) {
    const parts = build.parts;
    const uf = new UF();
    const issues = [];
    const occupied = new Map(); // hole -> {part, leg}
    Object.keys(TERMS).forEach((t) => uf.find(t));

    for (const p of parts) {
      for (const hcov of partCovers(p)) if (!occupied.has(hcov)) occupied.set(hcov, { part: p, leg: 'body', cover: true });
    }
    for (const p of parts) {
      for (const leg of partLegs(p)) {
        if (!leg.hole || !isValidHole(leg.hole)) {
          issues.push({ sev: 'error', kind: 'bad-hole', part: p.id, msg: `${p.ref || p.kind} ${leg.name} is off the board` });
          continue;
        }
        const o = occupied.get(leg.hole);
        if (o && !o.cover) {
          issues.push({ sev: 'error', kind: 'hole-collision', part: p.id, hole: leg.hole,
            msg: `Two legs in one hole (${leg.hole}): ${o.part.ref || o.part.kind} ${o.leg} and ${p.ref || p.kind} ${leg.name}` });
        } else occupied.set(leg.hole, { part: p, leg: leg.name });
        uf.find(stripKey(leg.hole));
      }
      if (p.kind === 'wire' && isValidHole(p.h1) && isValidHole(p.h2)) uf.union(stripKey(p.h1), stripKey(p.h2));
      if (p.kind === 'seg7') uf.union(stripKey(dipPinHole(p.col, 10, p.rot || 0, 3)), stripKey(dipPinHole(p.col, 10, p.rot || 0, 8))); // COM pins are joined inside the display
    }

    const rootIdx = new Map(); const nodeKeys = [];
    const nodeOf = (key) => {
      const r = uf.find(key);
      if (!rootIdx.has(r)) { rootIdx.set(r, nodeKeys.length); nodeKeys.push([]); }
      return rootIdx.get(r);
    };
    for (const k of [...uf.p.keys()]) nodeKeys[nodeOf(k)].push(k);
    const nodeOfHole = (h) => (h && isValidHole(h) && uf.p.has(stripKey(h)) ? nodeOf(stripKey(h)) : null);

    // how many part legs sit on each node (a node with one leg goes nowhere)
    const legCount = new Array(nodeKeys.length).fill(0);
    for (const [h, o] of occupied) if (!o.cover && isValidHole(h)) legCount[nodeOf(stripKey(h))]++;
    for (const t of Object.keys(TERMS)) legCount[nodeOf(t)]++;
    const vccN = nodeOf('VCC'), gndN = nodeOf('GND');
    const short = vccN === gndN;
    if (short) issues.push({ sev: 'fatal', kind: 'dead-short', msg: 'Short circuit: +5V is wired straight to GND. The supply has tripped — remove the wire that bridges them.' });
    const rails = {};
    if (power && !short) { rails[vccN] = 1; rails[gndN] = 0; }

    const chips = [], resistors = [], caps = [], segs = [];
    for (const p of parts) {
      if (p.kind === 'chip' || p.kind === 'seg7') {
        const pinNode = {};
        for (const leg of partLegs(p)) pinNode[leg.pin] = nodeOfHole(leg.hole);
        if (p.kind === 'chip') chips.push({ ref: p.ref, type: p.type, pinNode, partId: p.id, burnt: !!p.burnt });
        else segs.push({ ref: p.ref, pinNode, partId: p.id });
      } else if (p.kind === 'resistor') {
        resistors.push({ id: p.id, ref: p.ref, a: nodeOfHole(p.h1), b: nodeOfHole(p.h2), ohms: p.ohms });
      } else if (p.kind === 'cap') {
        caps.push({ id: p.id, ref: p.ref, a: nodeOfHole(p.h1), b: nodeOfHole(p.h2), farads: p.farads });
      }
    }
    const drivers = [];
    for (let i = 0; i < 8; i++) drivers.push({ id: 'IN' + i, node: nodeOf('IN' + i) });
    drivers.push({ id: 'PLS', node: nodeOf('PLS') }, { id: 'PLN', node: nodeOf('PLN') });
    const leds = [];
    for (let i = 0; i < 8; i++) leds.push({ ref: 'OUT' + i, node: nodeOf('OUT' + i) });
    const probes = [{ ref: 'CH1', node: nodeOf('CH1') }, { ref: 'CH2', node: nodeOf('CH2') }];
    const termNode = (t) => nodeOf(t);
    return {
      netlist: { nodeCount: nodeKeys.length, chips, rails, drivers, resistors, caps, leds, segs, probes },
      nodeOfHole, nodeKeys, legCount, vccN, gndN, short, power: !!power && !short, issues, occupied, parts, termNode,
    };
  }

  DSD.Board = {
    NCOL, ROWS, TOP, BOT, RAILS, RAIL_POL, RAIL_COLS, RAIL_COLSET, ROW_Y, BB, KIT, TERMS, OUT_X, IN_X,
    hole, railHole, parseHole, isValidHole, stripKey, holeXY, describeHole,
    dipPinHole, dipFits, partLegs, partCovers, partNpins, extract, UF,
  };
})(typeof window !== 'undefined' ? window : globalThis);
