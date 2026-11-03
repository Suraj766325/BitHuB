/* ============================================================
 * analog.js — transient circuit solver for the 555 experiments.
 *
 * Every node touched by a resistor, a capacitor or a 555 pin is an
 * analog node. Nodes the digital simulator drives strongly (rails,
 * switches, pulser, the 555 output) are voltage sources; all other
 * analog nodes are solved by nodal analysis each time step:
 *   resistor   conductance 1/R
 *   capacitor  backward-Euler companion model (C/dt with history)
 *   555 CTRL   internal 5k/5k/5k divider  -> 3.33 V behind 3.33 kΩ
 *   555 DIS    20 Ω switch to ground while the output is LOW
 * The 555 comparators then compare THR with V(CTRL) and TRIG with
 * V(CTRL)/2 and drive the internal SR flip-flop. When the output
 * changes, the digital simulator is re-settled.
 * ============================================================ */
(function (G) {
  'use strict';
  const DSD = (G.DSD = G.DSD || {});
  const VCC = 5, R_DIS = 20, G_CTRL = 1 / 3333.33, V_CTRL = VCC * 2 / 3, GMIN = 1e-9;

  function create(ex, eng) {
    const nl = ex.netlist;
    const timers = eng.timers.filter((t) => t.power === 'ok');
    if (!timers.length) return null;
    const N = nl.nodeCount;
    const isA = new Uint8Array(N);
    const res = nl.resistors.filter((r) => r.a != null && r.b != null && r.a !== r.b && r.ohms > 0);
    const caps = nl.caps.filter((c) => c.a != null && c.b != null && c.a !== c.b && c.farads > 0);
    res.forEach((r) => { isA[r.a] = 1; isA[r.b] = 1; });
    caps.forEach((c) => { isA[c.a] = 1; isA[c.b] = 1; });
    timers.forEach((t) => [2, 3, 4, 5, 6, 7].forEach((p) => { const n = t.pinNode[p]; if (n != null) isA[n] = 1; }));
    const V = new Float64Array(N), Vp = new Float64Array(N);
    const idx = new Int32Array(N).fill(-1);
    let unk = [];

    // which analog nodes are pinned by digital drivers right now
    function classify() {
      unk = []; idx.fill(-1);
      for (let n = 0; n < N; n++) {
        if (!isA[n]) continue;
        const s = eng.strongOf(n);
        if (s === 0 || s === 1) V[n] = s * VCC;
        else { idx[n] = unk.length; unk.push(n); }
      }
    }
    classify();

    /* ---- base time step from the circuit's own time constants ---- */
    const ctrlNodes = new Set(timers.map((t) => t.pinNode[5]).filter((n) => n != null));
    const gAt = (n) => res.reduce((s, r) => s + (r.a === n || r.b === n ? 1 / r.ohms : 0), 0) + (ctrlNodes.has(n) ? G_CTRL : 0);
    let tauMin = Infinity;
    for (const c of caps) {
      if (ctrlNodes.has(c.a) || ctrlNodes.has(c.b)) continue;
      const g = Math.max(gAt(c.a), gAt(c.b), 1e-7);
      tauMin = Math.min(tauMin, c.farads / g);
    }
    const dt0 = isFinite(tauMin) ? Math.min(2e-3, Math.max(1e-7, tauMin / 200)) : 1e-5;
    let dt = dt0, quiet = 0;

    const st = timers.map((t) => ({ t, q: t.ext ? 1 : 0, dis: !t.ext }));
    let time = 0;

    function solve(h) {
      const u = unk.length;
      if (!u) return;
      const A = Array.from({ length: u }, () => new Float64Array(u)), b = new Float64Array(u);
      const g2 = (a, c, g) => {
        const ia = idx[a], ic = idx[c];
        if (ia >= 0) { A[ia][ia] += g; if (ic >= 0) A[ia][ic] -= g; else b[ia] += g * V[c]; }
        if (ic >= 0) { A[ic][ic] += g; if (ia >= 0) A[ic][ia] -= g; else b[ic] += g * V[a]; }
      };
      const toV = (a, g, v) => { const ia = idx[a]; if (ia >= 0) { A[ia][ia] += g; b[ia] += g * v; } };
      for (const r of res) g2(r.a, r.b, 1 / r.ohms);
      for (const c of caps) {
        const g = c.farads / h, ieq = g * (Vp[c.a] - Vp[c.b]);
        g2(c.a, c.b, g);
        if (idx[c.a] >= 0) b[idx[c.a]] += ieq;
        if (idx[c.b] >= 0) b[idx[c.b]] -= ieq;
      }
      for (const s of st) {
        const p5 = s.t.pinNode[5], p7 = s.t.pinNode[7];
        if (p5 != null) toV(p5, G_CTRL, V_CTRL);
        if (p7 != null && s.dis) toV(p7, 1 / R_DIS, 0);
      }
      for (let i = 0; i < u; i++) A[i][i] += GMIN;
      // Gaussian elimination with partial pivoting
      for (let k = 0; k < u; k++) {
        let p = k; for (let i = k + 1; i < u; i++) if (Math.abs(A[i][k]) > Math.abs(A[p][k])) p = i;
        if (p !== k) { [A[p], A[k]] = [A[k], A[p]]; [b[p], b[k]] = [b[k], b[p]]; }
        const d = A[k][k]; if (Math.abs(d) < 1e-300) continue;
        for (let i = k + 1; i < u; i++) {
          const f = A[i][k] / d; if (!f) continue;
          for (let j = k; j < u; j++) A[i][j] -= f * A[k][j];
          b[i] -= f * b[k];
        }
      }
      for (let k = u - 1; k >= 0; k--) {
        let s = b[k]; for (let j = k + 1; j < u; j++) s -= A[k][j] * V[unk[j]];
        V[unk[k]] = A[k][k] ? s / A[k][k] : 0;
      }
    }

    const nodeV = (n) => (n == null ? NaN : isA[n] ? V[n] : (eng.nodeVal(n) === 1 ? VCC : eng.nodeVal(n) === 0 ? 0 : NaN));

    // advance one step; returns true if a 555 output changed
    function tick(h) {
      Vp.set(V);
      solve(h);
      time += h;
      let changed = false;
      for (const s of st) {
        const pin = s.t.pinNode;
        const vc = pin[5] != null ? V[pin[5]] : V_CTRL;
        const v2 = nodeV(pin[2]), v6 = nodeV(pin[6]);
        const rv = pin[4] == null ? 1 : eng.nodeVal(pin[4]);
        const trig = v2 < vc / 2, thr = v6 > vc;
        let q = s.q;
        if (rv === 0) q = 0; else if (trig) q = 1; else if (thr) q = 0;
        s.dis = !q;
        if (q !== s.q) { s.q = q; eng.setExt(s.t.ref, q); changed = true; }
      }
      if (changed) { eng.settle(); classify(); }
      return changed;
    }

    let maxDv = 0;
    const api = {
      dt0, get time() { return time; }, get dt() { return dt; }, st,
      nodeV, isAnalog: (n) => n != null && !!isA[n],
      // digital side changed under us (switch flipped, pulse...)
      refresh() { classify(); dt = dt0; quiet = 0; },
      // run until `until` (absolute sim time) or step budget; onStep(t, h) after each step
      run(until, budget, onStep) {
        let steps = 0;
        while (time < until && steps < budget) {
          const h = Math.min(dt, until - time);
          const ch = tick(h);
          maxDv = 0;
          for (const n of unk) maxDv = Math.max(maxDv, Math.abs(V[n] - Vp[n]));
          // nothing moving: stretch the step (backward Euler stays stable)
          if (ch || maxDv > 1e-4) { dt = dt0; quiet = 0; } else if (++quiet > 20) dt = Math.min(dt * 2, 5e-3);
          steps++;
          if (onStep) onStep(time, h);
        }
        return steps;
      },
    };
    return api;
  }

  /* timing components around each 555 (for theory values and hints) */
  function timing(ex, chipRef) {
    const nl = ex.netlist, c = nl.chips.find((x) => x.ref === chipRef);
    if (!c) return null;
    const n7 = c.pinNode[7], n6 = c.pinNode[6], n2 = c.pinNode[2], v = ex.vccN, g = ex.gndN;
    const between = (list, a, b) => list.filter((r) => a != null && b != null && ((r.a === a && r.b === b) || (r.a === b && r.b === a)));
    const ra = between(nl.resistors, v, n7), rb = n7 !== n6 ? between(nl.resistors, n7, n6) : [];
    const ct = between(nl.caps, n6, g);
    const C = ct.reduce((s, x) => s + x.farads, 0);
    const par = (rs) => (rs.length ? 1 / rs.reduce((s, r) => s + 1 / r.ohms, 0) : null);
    return { RA: par(ra), RB: par(rb), C: C || null, joined67: n7 != null && n7 === n6, joined26: n2 != null && n2 === n6, n2, n6, n7 };
  }

  DSD.Analog = { create, timing, VCC };
})(typeof window !== 'undefined' ? window : globalThis);
