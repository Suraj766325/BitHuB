/* ============================================================
 * ics.js — IC library for the DSD lab (74xx TTL + CMOS + 555).
 * Adapted from Better ALUU core/ics.js.
 *
 * Gate-level ICs are described by:
 *   pins     : pin names, index 0 = pin 1 (real DIP pinout)
 *   out/vcc/gnd/nc : pin roles (all other pins are inputs)
 *   gates    : internal gate network (topologically ordered).
 *              This is what the simulator executes.
 *   spec     : an INDEPENDENT behavioural model written from the
 *              datasheet (used only to verify the gate network).
 *   ttl      : floating inputs read HIGH (real TTL behaviour)
 *   oc       : outputs are open-collector (drive LOW or nothing)
 *
 * Two ICs are not gate networks:
 *   CD4007 : kind 'mos' — six MOSFETs simulated at switch level
 *   555    : kind 'timer' — mixed-signal, handled by analog.js
 *
 * DSD.verifyIC(id) exhaustively checks gates against spec.
 * ============================================================ */
(function (G) {
  'use strict';
  const DSD = (G.DSD = G.DSD || {});

  const QUAD2_PINS = ['1A', '1B', '1Y', '2A', '2B', '2Y', 'GND', '3Y', '3A', '3B', '4Y', '4A', '4B', 'VCC'];
  const QUAD2_MAP = [{ A: 1, B: 2, Y: 3 }, { A: 4, B: 5, Y: 6 }, { A: 9, B: 10, Y: 8 }, { A: 12, B: 13, Y: 11 }];
  function quad2(id, t, title, f, extra) {
    return Object.assign({
      id, title, kind: 'gates', ttl: true, npins: 14, pins: QUAD2_PINS,
      out: [3, 6, 8, 11], vcc: 14, gnd: 7, nc: [],
      gates: QUAD2_MAP.map((m, i) => ({ t, in: [m.A, m.B], out: m.Y, name: 'Gate ' + (i + 1) })),
      spec: (p) => { const o = {}; for (const m of QUAD2_MAP) o[m.Y] = f(p(m.A), p(m.B)); return o; },
    }, extra);
  }

  const LIB = {};
  const add = (d) => { LIB[d.id] = d; };

  /* ---------- SSI gates ---------- */
  add(quad2('7400', 'NAND', 'Quad 2-input NAND', (a, b) => +!(a & b), { desc: 'Y = (A·B)′. Universal gate.' }));
  add(quad2('7408', 'AND', 'Quad 2-input AND', (a, b) => a & b, { desc: 'Y = A·B for each of 4 gates.' }));
  add(quad2('7432', 'OR', 'Quad 2-input OR', (a, b) => a | b, { desc: 'Y = A+B for each of 4 gates.' }));
  add(quad2('7486', 'XOR', 'Quad 2-input EXOR', (a, b) => a ^ b, { desc: 'Y = A⊕B for each of 4 gates.' }));

  const NOR_MAP = [{ A: 2, B: 3, Y: 1 }, { A: 5, B: 6, Y: 4 }, { A: 8, B: 9, Y: 10 }, { A: 11, B: 12, Y: 13 }];
  add({
    id: '7402', title: 'Quad 2-input NOR', kind: 'gates', ttl: true, npins: 14,
    pins: ['1Y', '1A', '1B', '2Y', '2A', '2B', 'GND', '3A', '3B', '3Y', '4A', '4B', '4Y', 'VCC'],
    out: [1, 4, 10, 13], vcc: 14, gnd: 7, nc: [],
    gates: NOR_MAP.map((m, i) => ({ t: 'NOR', in: [m.A, m.B], out: m.Y, name: 'Gate ' + (i + 1) })),
    spec: (p) => { const o = {}; for (const m of NOR_MAP) o[m.Y] = +!(p(m.A) | p(m.B)); return o; },
    desc: 'Y = (A+B)′. Output pin comes first — pinout differs from the 7400.',
  });

  const INV_MAP = [{ A: 1, Y: 2 }, { A: 3, Y: 4 }, { A: 5, Y: 6 }, { A: 9, Y: 8 }, { A: 11, Y: 10 }, { A: 13, Y: 12 }];
  add({
    id: '7404', title: 'Hex inverter', kind: 'gates', ttl: true, npins: 14,
    pins: ['1A', '1Y', '2A', '2Y', '3A', '3Y', 'GND', '4Y', '4A', '5Y', '5A', '6Y', '6A', 'VCC'],
    out: [2, 4, 6, 8, 10, 12], vcc: 14, gnd: 7, nc: [],
    gates: INV_MAP.map((m, i) => ({ t: 'NOT', in: [m.A], out: m.Y, name: 'Inverter ' + (i + 1) })),
    spec: (p) => { const o = {}; for (const m of INV_MAP) o[m.Y] = +!p(m.A); return o; },
    desc: 'Six independent NOT gates.',
  });

  /* ---------- MSI: 74151 8-to-1 multiplexer (from Better ALUU) ---------- */
  {
    const D = [4, 3, 2, 1, 15, 14, 13, 12]; // D0..D7 pins
    const gates = [
      { t: 'NOT', in: [11], out: 'nA', name: 'A inverter' }, { t: 'NOT', in: [10], out: 'nB', name: 'B inverter' },
      { t: 'NOT', in: [9], out: 'nC', name: 'C inverter' }, { t: 'NOT', in: [7], out: 'en', name: 'Enable inverter (active-low)' }];
    D.forEach((d, i) => gates.push({ t: 'AND', in: [d, i & 4 ? 9 : 'nC', i & 2 ? 10 : 'nB', i & 1 ? 11 : 'nA', 'en'], out: 'd' + i, name: `D${i} select` }));
    gates.push({ t: 'OR', in: D.map((_, i) => 'd' + i), out: 'y', name: 'Output OR' },
      { t: 'BUF', in: ['y'], out: 5, name: 'Y buffer' }, { t: 'NOT', in: ['y'], out: 6, name: 'W (Y′) inverter' });
    add({
      id: '74151', title: '8-to-1 data selector / multiplexer', kind: 'gates', ttl: true, npins: 16,
      pins: ['D3', 'D2', 'D1', 'D0', 'Y', 'W', 'EN′', 'GND', 'C', 'B', 'A', 'D7', 'D6', 'D5', 'D4', 'VCC'],
      out: [5, 6], vcc: 16, gnd: 8, nc: [], gates,
      spec: (p) => { const y = p(7) ? 0 : p(D[p(9) * 4 + p(10) * 2 + p(11)]); return { 5: y, 6: 1 - y }; },
      activeLow: [6, 7],
      desc: 'Y = selected data input Dn, n = CBA (C is the MSB). W = Y′. EN′ is active-LOW.',
    });
  }

  /* ---------- MSI: 74138 3-to-8 decoder (from Better ALUU) ---------- */
  {
    const Y = [15, 14, 13, 12, 11, 10, 9, 7]; // Y0..Y7 pins
    const gates = [
      { t: 'NOT', in: [1], out: 'nA', name: 'A inverter' }, { t: 'NOT', in: [2], out: 'nB', name: 'B inverter' },
      { t: 'NOT', in: [3], out: 'nC', name: 'C inverter' },
      { t: 'NOT', in: [4], out: 'e1', name: 'G2A inverter (active-low)' }, { t: 'NOT', in: [5], out: 'e2', name: 'G2B inverter (active-low)' },
      { t: 'AND', in: [6, 'e1', 'e2'], out: 'en', name: 'Enable AND' }];
    Y.forEach((y, i) => gates.push({ t: 'NAND', in: [i & 4 ? 3 : 'nC', i & 2 ? 2 : 'nB', i & 1 ? 1 : 'nA', 'en'], out: y, name: `Y${i} decode NAND` }));
    add({
      id: '74138', title: '3-to-8 line decoder / demultiplexer', kind: 'gates', ttl: true, npins: 16,
      pins: ['A (S0)', 'B (S1)', 'C (S2)', 'G2A (EN2′)', 'G2B (EN3′)', 'G1 (EN1)', 'Y7', 'GND', 'Y6', 'Y5', 'Y4', 'Y3', 'Y2', 'Y1', 'Y0', 'VCC'],
      short: ['S0', 'S1', 'S2', 'EN2′', 'EN3′', 'EN1', 'Y7', 'GND', 'Y6', 'Y5', 'Y4', 'Y3', 'Y2', 'Y1', 'Y0', 'VCC'],
      out: Y.slice(), vcc: 16, gnd: 8, nc: [], gates,
      spec: (p) => {
        const en = p(6) && !p(4) && !p(5), s = p(3) * 4 + p(2) * 2 + p(1), o = {};
        Y.forEach((y, i) => (o[y] = en && i === s ? 0 : 1)); return o;
      },
      activeLow: [4, 5, 7, 9, 10, 11, 12, 13, 14, 15],
      desc: 'Enabled when EN1=1, EN2′=EN3′=0. The selected output goes LOW, all others stay HIGH.',
    });
  }

  /* ---------- MSI: 7447 BCD to 7-segment decoder/driver ---------- */
  {
    // segment -> digits (0..15) for which it is lit (SN7447 datasheet; 6 and 9 have no tails)
    const ON = {
      a: [0, 2, 3, 5, 7, 8, 9, 13], b: [0, 1, 2, 3, 4, 7, 8, 9, 12], c: [0, 1, 3, 4, 5, 6, 7, 8, 9, 11],
      d: [0, 2, 3, 5, 6, 8, 10, 11, 13, 14], e: [0, 2, 6, 8, 10, 14], f: [0, 4, 5, 6, 8, 9, 12, 13, 14],
      g: [2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14],
    };
    const SEG_PIN = { a: 13, b: 12, c: 11, d: 10, e: 9, f: 15, g: 14 };
    const IN = { A: 7, B: 1, C: 2, D: 6 }; // A = LSB
    const gates = [
      { t: 'NOT', in: [IN.A], out: 'nA', name: 'A inverter' }, { t: 'NOT', in: [IN.B], out: 'nB', name: 'B inverter' },
      { t: 'NOT', in: [IN.C], out: 'nC', name: 'C inverter' }, { t: 'NOT', in: [IN.D], out: 'nD', name: 'D inverter' },
      { t: 'NOT', in: [3], out: 'lt', name: 'Lamp test (active-low)' },
      { t: 'NOT', in: [5], out: 'rbi', name: 'Ripple blanking in (active-low)' }];
    for (let m = 0; m < 16; m++) {
      gates.push({ t: 'AND', in: [m & 8 ? IN.D : 'nD', m & 4 ? IN.C : 'nC', m & 2 ? IN.B : 'nB', m & 1 ? IN.A : 'nA'], out: 'm' + m, name: `Decode ${m}` });
    }
    gates.push({ t: 'AND', in: ['rbi', 'm0'], out: 'blank0', name: 'Zero blanking' }, { t: 'NOT', in: ['blank0'], out: 'nb0', name: 'Zero blanking inverter' });
    for (const [s, digits] of Object.entries(ON)) {
      gates.push({ t: 'OR', in: digits.map((d) => 'm' + d), out: 'on_' + s, name: `Segment ${s} decode` },
        { t: 'AND', in: ['on_' + s, 'nb0'], out: 'v_' + s, name: `Segment ${s} blanking` },
        { t: 'OR', in: ['v_' + s, 'lt'], out: 'u_' + s, name: `Segment ${s} lamp test` },
        { t: 'NAND', in: ['u_' + s, 4], out: SEG_PIN[s], name: `Segment ${s} driver (BI)` });
    }
    add({
      id: '7447', title: 'BCD to 7-segment decoder/driver', kind: 'gates', ttl: true, oc: true, npins: 16,
      pins: ['B', 'C', 'LT′', 'BI′/RBO′', 'RBI′', 'D', 'A', 'GND', 'e', 'd', 'c', 'b', 'a', 'g', 'f', 'VCC'],
      out: [13, 12, 11, 10, 9, 15, 14], vcc: 16, gnd: 8, nc: [], gates,
      spec: (p) => {
        const n = p(IN.D) * 8 + p(IN.C) * 4 + p(IN.B) * 2 + p(IN.A), o = {};
        for (const s of Object.keys(ON)) {
          let on = ON[s].includes(n);
          if (!p(5) && n === 0) on = false;
          if (!p(3)) on = true;
          if (!p(4)) on = false;
          o[SEG_PIN[s]] = on ? 0 : 1;
        }
        return o;
      },
      activeLow: [3, 4, 5, 9, 10, 11, 12, 13, 14, 15],
      segOn: ON, segPin: SEG_PIN,
      desc: 'Active-LOW open-collector segment outputs a–g. Built for common-anode displays; a common-cathode display needs an inverter on every segment line.',
    });
  }

  /* ---------- MSI: 7485 4-bit magnitude comparator ---------- */
  {
    const A = [10, 12, 13, 15], B = [9, 11, 14, 1]; // index = bit
    const gates = [];
    for (let i = 0; i < 4; i++) {
      gates.push({ t: 'XNOR', in: [A[i], B[i]], out: 'e' + i, name: `Bit ${i} equal` },
        { t: 'NOT', in: [A[i]], out: 'na' + i, name: `A${i} inverter` }, { t: 'NOT', in: [B[i]], out: 'nb' + i, name: `B${i} inverter` });
    }
    const hi = (i) => [3, 2, 1, 0].filter((k) => k > i).map((k) => 'e' + k);
    for (let i = 3; i >= 0; i--) {
      gates.push({ t: 'AND', in: [...hi(i), A[i], 'nb' + i], out: 'g' + i, name: `A>B decided at bit ${i}` },
        { t: 'AND', in: [...hi(i), 'na' + i, B[i]], out: 'l' + i, name: `A<B decided at bit ${i}` });
    }
    gates.push(
      { t: 'OR', in: ['g3', 'g2', 'g1', 'g0'], out: 'gt', name: 'A>B' },
      { t: 'OR', in: ['l3', 'l2', 'l1', 'l0'], out: 'lt', name: 'A<B' },
      { t: 'AND', in: ['e3', 'e2', 'e1', 'e0'], out: 'eq', name: 'A=B' },
      { t: 'NOR', in: [3, 2], out: 'cg', name: 'Cascade > (IA=B′·IA<B′)' },
      { t: 'NOR', in: [3, 4], out: 'cl', name: 'Cascade < (IA=B′·IA>B′)' },
      { t: 'AND', in: ['eq', 'cg'], out: 'tg', name: 'Equal: pass cascade >' },
      { t: 'AND', in: ['eq', 'cl'], out: 'tl', name: 'Equal: pass cascade <' },
      { t: 'OR', in: ['gt', 'tg'], out: 5, name: 'A>B output' },
      { t: 'AND', in: ['eq', 3], out: 6, name: 'A=B output' },
      { t: 'OR', in: ['lt', 'tl'], out: 7, name: 'A<B output' });
    add({
      id: '7485', title: '4-bit magnitude comparator', kind: 'gates', ttl: true, npins: 16,
      pins: ['B3', 'IA<B', 'IA=B', 'IA>B', 'A>B', 'A=B', 'A<B', 'GND', 'B0', 'A0', 'B1', 'A1', 'A2', 'B2', 'A3', 'VCC'],
      out: [5, 6, 7], vcc: 16, gnd: 8, nc: [], gates,
      spec: (p) => {
        const a = A.reduce((s, pin, i) => s | (p(pin) << i), 0), b = B.reduce((s, pin, i) => s | (p(pin) << i), 0);
        if (a > b) return { 5: 1, 6: 0, 7: 0 };
        if (a < b) return { 5: 0, 6: 0, 7: 1 };
        const ig = p(4), il = p(2), ie = p(3);
        return { 5: +(!ie && !il), 6: ie, 7: +(!ie && !ig) };
      },
      desc: 'Compares A3..A0 with B3..B0. For a single chip tie IA>B=0, IA=B=1, IA<B=0.',
    });
  }

  /* ---------- 555 timer (mixed-signal: see analog.js) ---------- */
  add({
    id: '555', title: 'Timer', kind: 'timer', ttl: false, npins: 8,
    pins: ['GND', 'TRIG', 'OUT', 'RESET', 'CTRL', 'THR', 'DIS', 'VCC'],
    out: [3], vcc: 8, gnd: 1, nc: [], gates: [],
    activeLow: [2, 4],
    desc: 'Two comparators (2/3 Vcc on THR, 1/3 Vcc on TRIG), an SR flip-flop and a discharge transistor on DIS.',
  });

  /* ---------- CD4007 dual complementary pair + inverter ---------- */
  add({
    id: 'CD4007', title: 'CMOS dual complementary pair + inverter', kind: 'mos', ttl: false, npins: 14,
    pins: ['D P2', 'S P2', 'G2', 'S N2', 'D N2', 'G1', 'VSS', 'D N1', 'S N3', 'G3', 'S P3', 'D P3/N3', 'D P1', 'VDD'],
    out: [], vcc: 14, gnd: 7, nc: [], gates: [],
    fets: [
      { name: 'P1', type: 'P', g: 6, s: 14, d: 13 }, { name: 'N1', type: 'N', g: 6, s: 7, d: 8 },
      { name: 'P2', type: 'P', g: 3, s: 2, d: 1 }, { name: 'N2', type: 'N', g: 3, s: 4, d: 5 },
      { name: 'P3', type: 'P', g: 10, s: 11, d: 12 }, { name: 'N3', type: 'N', g: 10, s: 9, d: 12 },
    ],
    desc: 'Three P-channel and three N-channel MOSFETs with their gates, sources and drains brought out to pins.',
  });

  /* ---------- derive pin roles ---------- */
  for (const d of Object.values(LIB)) {
    d.role = {};
    for (let p = 1; p <= d.npins; p++) d.role[p] = 'in';
    d.out.forEach((p) => (d.role[p] = 'out'));
    d.nc.forEach((p) => (d.role[p] = 'nc'));
    if (d.kind === 'mos') for (let p = 1; p <= d.npins; p++) d.role[p] = 'io';
    if (d.kind === 'timer') { d.role[7] = 'io'; d.role[5] = 'io'; }
    d.role[d.vcc] = 'vcc'; d.role[d.gnd] = 'gnd';
    d.inputs = Object.keys(d.role).map(Number).filter((p) => d.role[p] === 'in');
    d.pinName = (p) => d.pins[p - 1];
    d.label = d.id === 'CD4007' ? 'CD4007' : d.id === '555' ? 'NE555' : 'IC ' + d.id;
    // text printed on the package
    d.chipText = d.id === '555' ? 'NE555' : d.id === 'CD4007' ? 'CD4007' : '74LS' + d.id.slice(2);
  }

  /* ---------- board components (not ICs) ---------- */
  DSD.COMPONENTS = {
    resistor: { title: 'Resistor', values: [220, 330, 1000, 4700, 10000, 100000], unit: 'Ω' },
    cap: { title: 'Capacitor', values: [0.01e-6, 0.1e-6, 1e-6, 10e-6], unit: 'F' },
    seg7: { title: '7-segment display (common cathode)', npins: 10,
      pins: ['e', 'd', 'COM', 'c', 'dp', 'b', 'a', 'COM', 'f', 'g'],
      segPin: { a: 7, b: 6, c: 4, d: 2, e: 1, f: 9, g: 10, dp: 5 }, com: [3, 8] },
  };

  DSD.fmtOhms = (r) => (r >= 1e6 ? +(r / 1e6).toFixed(2) + ' MΩ' : r >= 1000 ? +(r / 1000).toFixed(2) + ' kΩ' : r + ' Ω');
  DSD.fmtFarads = (c) => (c >= 1e-6 ? +(c * 1e6).toFixed(2) + ' µF' : c >= 1e-9 ? +(c * 1e9).toFixed(1) + ' nF' : +(c * 1e12).toFixed(0) + ' pF');
  DSD.fmtTime = (t) => (t >= 1 ? t.toFixed(3) + ' s' : t >= 1e-3 ? +(t * 1e3).toFixed(t >= 0.1 ? 1 : 3) + ' ms' : +(t * 1e6).toFixed(1) + ' µs');
  DSD.fmtFreq = (f) => (f >= 1e3 ? +(f / 1e3).toFixed(3) + ' kHz' : +f.toFixed(2) + ' Hz');

  DSD.LIB = LIB;

  /* exhaustive check of the gate network against the datasheet spec */
  DSD.verifyIC = function (id) {
    const d = LIB[id];
    if (d.kind !== 'gates') return { id, pass: true, vectors: 0, skipped: true };
    const ins = d.inputs, N = 1 << ins.length;
    let fail = 0, first = null;
    for (let m = 0; m < N; m++) {
      const val = {}; ins.forEach((p, i) => (val[p] = (m >> i) & 1));
      const get = (p) => val[p];
      const gate = DSD.evalGates(d.gates, get).pins;
      const spec = d.spec(get);
      for (const p of d.out) if (gate[p] !== spec[p]) { fail++; if (!first) first = { inputs: { ...val }, pin: p, got: gate[p], want: spec[p] }; }
    }
    return { id, vectors: N, fail, first, pass: fail === 0 };
  };
})(typeof window !== 'undefined' ? window : globalThis);
