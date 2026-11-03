/* ============================================================
 * sim.js — digital simulator for the trainer kit.
 * Grown out of Better ALUU core/netsim.js.
 *
 * Values: 0, 1, X (2) = unknown / contention, Z (3) = undriven.
 *
 * What it models:
 *  - Gate-level ICs. A chip only works when its VCC pin sits on
 *    +5 V and its GND pin on 0 V; otherwise its outputs float.
 *  - TTL inputs that are left floating read HIGH (and are reported).
 *  - Open-collector outputs (7447) drive LOW or nothing.
 *  - CD4007 MOSFETs at switch level: an ON transistor joins its
 *    source and drain nodes; the joined group takes the value of
 *    whatever drives it (VDD, VSS, ...). VDD and GND in one group
 *    is a short.
 *  - Time: every chip has one unit of propagation delay. settle()
 *    steps all chips in lock-step (unit-delay simulation). If that
 *    does not converge (a symmetric latch race) it falls back to
 *    random-order evaluation, which resolves metastability the way
 *    real silicon does. A loop that still never settles is a real
 *    oscillation (e.g. JK race-around) and is reported as such.
 *  - State persists between runs, so latches and flip-flops remember.
 *
 * netlist = { nodeCount, rails:{node:0|1}, drivers:[{id,node}],
 *             chips:[{ref,type,pinNode,burnt}], resistors:[{a,b}],
 *             leds:[{ref,node}], segs:[{ref,pinNode}], probes:[...] }
 * ============================================================ */
(function (G) {
  'use strict';
  const DSD = (G.DSD = G.DSD || {});
  const X = 2, Z = 3;
  const T = { AND: 1, OR: 2, NOT: 3, XOR: 4, NAND: 5, NOR: 6, XNOR: 7, BUF: 8 };
  const nrm = (v) => (v === 0 || v === 1 ? v : X);

  function mulberry(seed) {
    return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }

  function create(nl, opts) {
    opts = opts || {};
    const N = nl.nodeCount;
    const railVal = new Int8Array(N).fill(-1);
    for (const [n, v] of Object.entries(nl.rails || {})) railVal[+n] = v;
    const drivers = (nl.drivers || []).filter((d) => d.node != null);
    const inputVal = Object.assign({}, opts.inputs || {});
    const powered = Object.keys(nl.rails || {}).length > 0; // switches need the supply too
    const rnd = mulberry(opts.seed || 12345);

    /* ---- chips ---- */
    let nsig = 0;
    const chips = [], fets = [], timers = [];
    for (const c of nl.chips) {
      const def = DSD.LIB[c.type];
      if (!def) throw new Error('Unknown chip type ' + c.type);
      const vn = c.pinNode[def.vcc], gn = c.pinNode[def.gnd];
      const vOk = vn != null && railVal[vn] === 1, gOk = gn != null && railVal[gn] === 0;
      let power = 'ok';
      if (c.burnt) power = 'burnt';
      else if (!vOk || !gOk) {
        if (vn != null && gn != null && railVal[vn] === 0 && railVal[gn] === 1) power = 'reversed';
        else if (!vOk && !gOk) power = 'unpowered';
        else power = vOk ? 'no-gnd' : 'no-vcc';
      }
      const chip = { ref: c.ref, type: c.type, def, pinNode: c.pinNode, partId: c.partId, power, pinSig: {}, internal: {}, ops: [], ext: 0 };
      if (def.kind === 'gates') {
        for (let p = 1; p <= def.npins; p++) chip.pinSig[p] = nsig++;
        const sigOf = (s) => {
          if (typeof s === 'number') return chip.pinSig[s];
          if (!(s in chip.internal)) chip.internal[s] = nsig++;
          return chip.internal[s];
        };
        // split the chip into independent gate groups ("units"), as in netsim.js
        const gs = def.gates, parent = gs.map((_, i) => i), producer = {};
        const root = (i) => (parent[i] === i ? i : (parent[i] = root(parent[i])));
        gs.forEach((g, i) => { producer[String(g.out)] = i; });
        gs.forEach((g, i) => g.in.forEach((x) => {
          if (String(x) in producer && (typeof x === 'string' || def.role[x] === 'out')) parent[root(i)] = root(producer[String(x)]);
        }));
        const groups = {};
        gs.forEach((g, i) => { (groups[root(i)] = groups[root(i)] || []).push(g); });
        chip.units = Object.values(groups).map((list) => {
          const u = { chip, ops: [], inPins: [], outPins: [] };
          for (const g of list) {
            u.ops.push({ t: T[g.t], ins: g.in.map(sigOf), out: sigOf(g.out) });
            for (const x of g.in) if (typeof x === 'number' && def.role[x] === 'in' && !u.inPins.includes(x)) u.inPins.push(x);
            if (typeof g.out === 'number') u.outPins.push(g.out);
          }
          return u;
        });
      } else if (def.kind === 'mos') {
        if (power === 'ok') for (const f of def.fets) fets.push({ n: f.type === 'N', g: c.pinNode[f.g], s: c.pinNode[f.s], d: c.pinNode[f.d], chip, name: f.name });
      } else if (def.kind === 'timer') {
        timers.push(chip);
      }
      chips.push(chip);
    }
    const gateChips = chips.filter((c) => c.def.kind === 'gates' && c.power === 'ok');
    const units = gateChips.flatMap((c) => c.units);
    // nodes on an open-collector output: a TTL input there floating HIGH is the intended "off" state
    const ocNode = new Set();
    for (const c of gateChips) if (c.def.oc) for (const p of c.def.out) if (c.pinNode[p] != null) ocNode.add(c.pinNode[p]);
    const sig = new Uint8Array(nsig).fill(0);
    // carry state across recompiles (keeps latches latched while you edit)
    if (opts.prev) {
      for (const c of gateChips) {
        const o = opts.prev[c.ref]; if (!o || o.type !== c.type) continue;
        for (const p of c.def.out) if (o.pins[p] !== undefined) sig[c.pinSig[p]] = o.pins[p];
      }
      for (const t of timers) { const o = opts.prev[t.ref]; if (o && o.type === t.type) t.ext = o.ext; }
    }

    const resNbr = Array.from({ length: N }, () => []);
    for (const r of nl.resistors || []) {
      if (r.a == null || r.b == null || r.a === r.b) continue;
      resNbr[r.a].push(r.b); resNbr[r.b].push(r.a);
    }

    let val = new Uint8Array(N).fill(Z), nv = new Uint8Array(N);
    const strong = new Int8Array(N), conflict = new Uint8Array(N);
    const parent = new Int32Array(N), gst = new Int8Array(N), gconf = new Uint8Array(N), gsize = new Int32Array(N);
    const find = (a) => { while (parent[a] !== a) { parent[a] = parent[parent[a]]; a = parent[a]; } return a; };

    function evalUnit(u) {
      const c = u.chip, def = c.def;
      for (const p of u.inPins) {
        const n = c.pinNode[p];
        let v = n == null ? Z : val[n];
        if (v === Z && def.ttl) v = 1; // floating TTL input floats HIGH
        sig[c.pinSig[p]] = v;
      }
      for (const op of u.ops) {
        const ins = op.ins;
        let r;
        switch (op.t) {
          case 1: case 5: {
            r = 1; for (let k = 0; k < ins.length; k++) { const v = nrm(sig[ins[k]]); if (v === 0) { r = 0; break; } if (v === X) r = X; }
            if (op.t === 5 && r !== X) r = 1 - r; break;
          }
          case 2: case 6: {
            r = 0; for (let k = 0; k < ins.length; k++) { const v = nrm(sig[ins[k]]); if (v === 1) { r = 1; break; } if (v === X) r = X; }
            if (op.t === 6 && r !== X) r = 1 - r; break;
          }
          case 4: case 7: {
            r = 0; for (let k = 0; k < ins.length; k++) { const v = nrm(sig[ins[k]]); if (v === X) { r = X; break; } r ^= v; }
            if (op.t === 7 && r !== X) r = 1 - r; break;
          }
          case 3: { const v = nrm(sig[ins[0]]); r = v === X ? X : 1 - v; break; }
          default: r = nrm(sig[ins[0]]);
        }
        sig[op.out] = r;
      }
    }

    // node values from the drivers; transistor gates read `cur`
    function resolve(cur, out) {
      strong.fill(-1); conflict.fill(0);
      const put = (n, v) => {
        if (strong[n] === -1) strong[n] = v;
        else if (strong[n] !== v) { if (v !== X && strong[n] !== X) conflict[n] = 1; strong[n] = X; }
      };
      for (let n = 0; n < N; n++) if (railVal[n] >= 0) strong[n] = railVal[n];
      for (const d of drivers) { const v = inputVal[d.id]; if (powered && (v === 0 || v === 1)) put(d.node, v); }
      for (const c of gateChips) {
        for (const p of c.def.out) {
          const n = c.pinNode[p]; if (n == null) continue;
          const v = sig[c.pinSig[p]];
          if (v === Z || (c.def.oc && v === 1)) continue;
          put(n, nrm(v));
        }
      }
      for (const t of timers) if (t.power === 'ok' && t.pinNode[3] != null) put(t.pinNode[3], t.ext);
      if (fets.length) {
        for (let n = 0; n < N; n++) { parent[n] = n; }
        const maybe = [];
        for (const f of fets) {
          if (f.s == null || f.d == null) continue;
          const gv = f.g == null ? X : nrm(cur[f.g]);
          const on = f.n ? gv === 1 : gv === 0;
          if (on) { const a = find(f.s), b = find(f.d); if (a !== b) parent[a] = b; } else if (gv === X) maybe.push(f);
        }
        gst.fill(-1); gconf.fill(0); gsize.fill(0);
        for (let n = 0; n < N; n++) {
          const r = find(n); gsize[r]++;
          const v = strong[n]; if (v === -1) continue;
          if (conflict[n]) gconf[r] = 1;
          if (gst[r] === -1) gst[r] = v; else if (gst[r] !== v) { if (v !== X && gst[r] !== X) gconf[r] = 1; gst[r] = X; }
        }
        for (const f of maybe) { const a = find(f.s), b = find(f.d); if (gst[a] !== gst[b]) { gst[a] = X; gst[b] = X; } }
        for (let n = 0; n < N; n++) { const r = find(n); if (gsize[r] > 1) { strong[n] = gst[r]; conflict[n] = gconf[r]; } }
      }
      for (let n = 0; n < N; n++) {
        if (strong[n] >= 0) { out[n] = strong[n]; continue; }
        let w = Z;
        for (const m of resNbr[n]) { const s = strong[m]; if (s < 0) continue; w = w === Z ? s : w === s ? w : X; }
        out[n] = w;
      }
    }
    const swap = () => { const t = val; val = nv; nv = t; };
    const differs = () => { for (let n = 0; n < N; n++) if (nv[n] !== val[n]) return true; return false; };

    // one unit of delay: every chip looks at the old node values
    function step() {
      for (const u of units) evalUnit(u);
      resolve(val, nv);
      const ch = differs(); swap(); return ch;
    }
    // random-order evaluation: breaks symmetric races
    function gsPass() {
      let ch = false;
      const order = units.map((_, i) => i);
      for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
      for (const i of order) { evalUnit(units[i]); resolve(val, nv); if (differs()) ch = true; swap(); }
      resolve(val, nv); if (differs()) ch = true; swap();
      return ch;
    }

    const status = { settled: true, metastable: false, oscillating: false, oscNodes: [] };
    function settle() {
      status.metastable = false; status.oscillating = false; status.oscNodes = [];
      for (let k = 0; k < 64; k++) if (!step()) { status.settled = true; return status; }
      status.metastable = true;
      for (let k = 0; k < 64; k++) if (!gsPass()) { status.settled = true; return status; }
      status.settled = false; status.oscillating = true;
      const before = val.slice(); step();
      for (let n = 0; n < N; n++) if (before[n] !== val[n]) status.oscNodes.push(n);
      return status;
    }

    resolve(val, nv); swap();

    /* ---- readouts ---- */
    const api = {
      N, chips, units, fets, timers, status, netlist: nl,
      get val() { return val; },
      strongOf: (n) => strong[n],
      setInput(id, v) { inputVal[id] = v; },
      input: (id) => inputVal[id],
      setExt(ref, v) { const t = timers.find((x) => x.ref === ref); if (t) t.ext = v; },
      settle, step,
      // narrow clock pulse: P high (P' low) for `width` delays, then released
      pulse(width) {
        const p = inputVal.PLS, q = inputVal.PLN;
        inputVal.PLS = 1; inputVal.PLN = 0;
        for (let k = 0; k < (width || 2); k++) step();
        inputVal.PLS = p; inputVal.PLN = q;
        return settle();
      },
      nodeVal: (n) => (n == null ? Z : val[n]),
      pinValue(ref, pin) {
        const c = chips.find((x) => x.ref === ref); if (!c) return Z;
        if (c.def.kind === 'gates' && c.def.role[pin] === 'out') {
          if (c.power !== 'ok') return Z;
          const v = sig[c.pinSig[pin]];
          return c.def.oc && v === 1 ? Z : v;
        }
        if (c.def.kind === 'timer' && pin === 3) return c.power === 'ok' ? c.ext : Z;
        const n = c.pinNode[pin]; return n == null ? Z : val[n];
      },
      leds() { const o = {}; for (const d of nl.leds || []) o[d.ref] = d.node == null ? Z : val[d.node]; return o; },
      segs() {
        const out = {};
        const S = DSD.COMPONENTS.seg7;
        for (const s of nl.segs || []) {
          const com = S.com.map((p) => s.pinNode[p]).filter((n) => n != null);
          const comLow = com.some((n) => val[n] === 0);
          const lit = {}, noRes = [];
          for (const [seg, pin] of Object.entries(S.segPin)) {
            const n = s.pinNode[pin];
            lit[seg] = comLow && n != null && val[n] === 1;
            if (lit[seg] && strong[n] === 1 && com.some((m) => strong[m] === 0)) noRes.push(seg);
          }
          out[s.ref] = { lit, noRes };
        }
        return out;
      },
      contention() { const o = []; for (let n = 0; n < N; n++) if (conflict[n]) o.push(n); return o; },
      floating() {
        const o = [];
        for (const c of chips) {
          if (c.power !== 'ok') continue;
          if (c.def.kind === 'gates') {
            for (const u of c.units) for (const p of u.inPins) {
              const n = c.pinNode[p];
              if ((n == null || val[n] === Z) && !ocNode.has(n)) o.push({ ref: c.ref, pin: p, ttl: true, outs: u.outPins.map((q) => c.pinNode[q]) });
            }
          } else if (c.def.kind === 'mos') {
            for (const g of [6, 3, 10]) {
              const n = c.pinNode[g];
              if (n == null || val[n] === Z) o.push({ ref: c.ref, pin: g, ttl: false, outs: c.def.fets.filter((f) => f.g === g).map((f) => c.pinNode[f.d]) });
            }
          } else if (c.def.kind === 'timer') {
            for (const p of [2, 4, 6]) { const n = c.pinNode[p]; if (n == null) o.push({ ref: c.ref, pin: p, ttl: false, outs: [c.pinNode[3]] }); }
          }
        }
        return o;
      },
      snapshot() {
        const o = {};
        for (const c of gateChips) { const pins = {}; for (const p of c.def.out) pins[p] = sig[c.pinSig[p]]; o[c.ref] = { type: c.type, pins }; }
        for (const t of timers) o[t.ref] = { type: t.type, ext: t.ext };
        return o;
      },
    };
    return api;
  }

  DSD.Sim = { create, X, Z };
})(typeof window !== 'undefined' ? window : globalThis);
