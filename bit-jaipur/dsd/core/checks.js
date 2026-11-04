/* ============================================================
 * checks.js — observation tables, circuit verification and
 * diagnosis. Shared by the UI and the Node test suite.
 *
 * Task kinds:
 *   comb    combinational truth table (optionally `rows` subset,
 *           or `free: n` rows of the student's own choosing)
 *   seg     BCD input -> 7-segment display pattern
 *   latch   SR latch (no clock): set / reset / hold / invalid
 *   ff      clocked flip-flop: rows (in1, in2, Qn) -> Qn+1 on a pulse
 *   mono    555 monostable pulse width
 *   astable 555 astable timing
 * ============================================================ */
(function (G) {
  'use strict';
  const DSD = (G.DSD = G.DSD || {});
  const X = 2, Z = 3;
  const bitsOf = (k, n) => Array.from({ length: n }, (_, i) => (k >> (n - 1 - i)) & 1);
  const SEGS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

  /* ---------- expected rows of an observation table ---------- */
  function rows(task) {
    switch (task.kind) {
      case 'comb': {
        if (task.free) return [];
        const list = task.rows || Array.from({ length: 1 << task.ins.length }, (_, k) => bitsOf(k, task.ins.length));
        return list.map((ins) => ({ key: ins.join(''), ins, want: task.f(ins) }));
      }
      case 'seg': {
        const on = task.segOn();
        return Array.from({ length: task.digits }, (_, d) => ({
          key: bitsOf(d, 4).join(''), ins: bitsOf(d, 4), digit: d,
          want: SEGS.filter((s) => on[s].includes(d)).join(''),
        }));
      }
      case 'latch':
        return [
          { key: '01', ins: [0, 1], want: [1, 0], label: 'Set' },
          { key: '10', ins: [1, 0], want: [0, 1], label: 'Reset' },
          { key: '11q1', ins: [1, 1], prev: 1, want: [1, 0], label: 'Hold (Q was 1)' },
          { key: '11q0', ins: [1, 1], prev: 0, want: [0, 1], label: 'Hold (Q was 0)' },
          { key: '00', ins: [0, 0], want: [1, 1], label: 'Invalid (not allowed)' },
        ];
      case 'ff': {
        const out = [];
        for (const [a, b] of [[0, 0], [0, 1], [1, 0], [1, 1]]) for (const q of [0, 1]) {
          const n = task.next(a, b, q);
          if (n === null) continue;
          out.push({ key: `${a}${b}${q}`, ins: [a, b], prev: q, want: [n, 1 - n], label: task.names[a * 2 + b] });
        }
        return out;
      }
      default: return [];
    }
  }
  const same = (got, want) => (Array.isArray(want) ? want.every((w, i) => got[i] === w) : got === want);

  /* ---------- live observation (called by the UI after every change) ----------
   * ctx = { inputs: {IN0..}, leds: {OUT0..}, segs, prevLeds, event: 'change'|'pulse', before }
   * returns { key, got } to store in the table, or null */
  function observe(task, ctx) {
    const ins = (task.ins || []).map((id) => ctx.inputs[id] | 0);
    const led = (id) => ctx.leds[id];
    // an output LED that nothing drives means that part of the circuit is not built yet
    if (task.outs && task.outs.some((id) => led(id) === Z)) return null;
    switch (task.kind) {
      case 'comb': {
        if (ctx.event !== 'change') return null;
        return { key: ins.join(''), ins, got: task.outs.map(led) };
      }
      case 'seg': {
        if (ctx.event !== 'change') return null;
        const s = ctx.segs[task.display];
        return { key: ins.join(''), ins, got: s ? SEGS.filter((k) => s.lit[k]).join('') : '' };
      }
      case 'latch': {
        if (ctx.event !== 'change') return null;
        const got = task.outs.map(led);
        let key = ins.join('');
        if (key === '11') {
          const pq = ctx.prevLeds ? ctx.prevLeds[task.outs[0]] : undefined;
          if (pq !== 0 && pq !== 1) return null;
          key += 'q' + pq;
        }
        return { key, ins, got };
      }
      case 'ff': {
        if (ctx.event !== 'pulse') return null;
        const q0 = ctx.before[task.outs[0]];
        if (q0 !== 0 && q0 !== 1) return null;
        if (ins[0] && ins[1] && task.next(1, 1, 0) === null) return { key: '11' + q0, ins, got: task.outs.map(led), invalid: true };
        return { key: `${ins.join('')}${q0}`, ins, got: task.outs.map(led) };
      }
      default: return null;
    }
  }
  // merge an observation into the stored table state; returns the updated table
  function record(task, table, obs) {
    table = table || { rows: {}, order: [] };
    if (!obs) return table;
    if (task.kind === 'comb' && task.free) {
      const want = task.f(obs.ins);
      table.rows[obs.key] = { ins: obs.ins, got: obs.got, want, ok: same(obs.got, want) };
      table.order = table.order.filter((k) => k !== obs.key).concat(obs.key);
      while (table.order.length > task.free) delete table.rows[table.order.shift()];
      return table;
    }
    const exp = rows(task).find((r) => r.key === obs.key);
    if (!exp) return table;
    table.rows[obs.key] = { got: obs.got, ok: same(obs.got, exp.want) };
    return table;
  }
  function progress(task, table) {
    const t = table || { rows: {}, order: [] };
    if (task.kind === 'comb' && task.free) {
      const list = t.order.map((k) => t.rows[k]);
      const ok = list.filter((r) => r.ok).length;
      return { done: ok, total: task.free, complete: ok >= task.free && (!task.need || task.need(list)) };
    }
    if (task.kind === 'mono') { const ok = (t.pulses || []).filter((p) => p.ok).length; return { done: Math.min(ok, 3), total: 3, complete: ok >= 3 }; }
    if (task.kind === 'astable') { const ok = !!(t.meas && t.meas.ok); return { done: ok ? 1 : 0, total: 1, complete: ok }; }
    if (task.kind === 'hdl') { return { done: t.done || 0, total: 4, complete: !!t.complete }; }
    const R = rows(task);
    const done = R.filter((r) => t.rows[r.key] && t.rows[r.key].ok).length;
    return { done, total: R.length, complete: done === R.length };
  }

  /* ---------- diagnosis of a board ---------- */
  function describeNode(ex, n) {
    if (n == null) return 'nothing';
    const bits = [];
    for (const c of ex.netlist.chips) for (const [p, m] of Object.entries(c.pinNode)) if (m === n) bits.push(`${c.ref} pin ${p}`);
    for (const k of ex.nodeKeys[n] || []) if (DSD.Board.TERMS[k]) bits.push(DSD.Board.TERMS[k].label);
    if (n === ex.vccN) bits.unshift('+5V'); if (n === ex.gndN) bits.unshift('GND');
    return bits.slice(0, 5).join(', ') || 'an empty strip';
  }
  function apparatusStatus(part, build) {
    const have = {}, extra = [];
    for (const p of build.parts) {
      const k = p.kind === 'chip' ? 'chip:' + p.type : p.kind === 'resistor' ? 'res:' + p.ohms : p.kind === 'cap' ? 'cap:' + p.farads : p.kind === 'seg7' ? 'seg7' : null;
      if (k) have[k] = (have[k] || 0) + 1;
    }
    const items = part.apparatus.map((a) => {
      const k = a.type ? 'chip:' + a.type : a.kind === 'resistor' ? 'res:' + a.ohms : a.kind === 'cap' ? 'cap:' + a.farads : 'seg7';
      const n = have[k] || 0; delete have[k];
      return Object.assign({ have: n, ok: n >= a.qty }, a);
    });
    for (const [k, n] of Object.entries(have)) if (k.startsWith('chip:')) extra.push({ type: k.slice(5), n });
    return { items, extra, ok: items.every((i) => i.ok) };
  }
  const POWER_MSG = {
    unpowered: 'has no power', 'no-vcc': 'has GND but no +5 V', 'no-gnd': 'has +5 V but no GND',
    reversed: 'is wired backwards (+5 V on its GND pin)', burnt: 'is burnt out — remove it and place a new one',
  };
  function diagnose(part, ex, eng) {
    const out = [];
    for (const i of ex.issues) out.push({ sev: i.sev === 'fatal' ? 'error' : 'warn', msg: i.msg });
    if (!ex.power) return out;
    for (const c of eng.chips) {
      if (c.power === 'ok') continue;
      out.push({ sev: 'error', msg: `${c.ref} (${c.def.label}) ${POWER_MSG[c.power]}: pin ${c.def.vcc} → +5V, pin ${c.def.gnd} → GND.`, chip: c.ref });
    }
    const termLabel = (id) => DSD.Board.TERMS[id].label;
    for (const t of part.io || []) {
      const n = ex.termNode(t.id);
      if ((ex.nodeKeys[n] || []).length <= 1) out.push({ sev: 'info', msg: `${termLabel(t.id)} (${t.name}) is not connected yet.` });
    }
    const used = (n) => n != null && ex.legCount[n] > 1;
    for (const f of eng.floating()) {
      if (!f.outs.some(used)) continue;
      const c = eng.chips.find((x) => x.ref === f.ref);
      out.push({ sev: 'warn', msg: `${f.ref} pin ${f.pin} (${c.def.pinName(f.pin)}) is floating${f.ttl ? ' — TTL reads it as HIGH' : ''}.` });
    }
    for (const n of eng.contention()) out.push({ sev: 'error', msg: `Short: outputs fight on the node of ${describeNode(ex, n)}.` });
    for (const [ref, s] of Object.entries(eng.segs())) if (s.noRes.length) out.push({ sev: 'warn', msg: `${ref}: segment ${s.noRes.join(', ')} has no current-limiting resistor.` });
    if (eng.status.oscillating) out.push({ sev: 'warn', msg: 'The circuit is oscillating (a feedback loop never settles — e.g. JK race-around with the clock held HIGH).' });
    return out;
  }

  /* ---------- automatic verification ---------- */
  function freshEngine(build) {
    const ex = DSD.Board.extract(build, true);
    const inputs = { PLS: 0, PLN: 1 }; for (let i = 0; i < 8; i++) inputs['IN' + i] = 0;
    const eng = DSD.Sim.create(ex.netlist, { inputs, seed: 7 });
    eng.settle();
    return { ex, eng };
  }
  const fmtV = (v) => (v === 0 ? '0' : v === 1 ? '1' : v === Z ? 'Z' : 'X');

  function verifyTask(task, build) {
    const { ex, eng } = freshEngine(build);
    if (ex.short) return { pass: false, fails: [{ msg: 'Supply short circuit' }] };
    const fails = [];
    const set = (ids, vals) => ids.forEach((id, i) => eng.setInput(id, vals[i]));
    const read = (ids) => { const l = eng.leds(); return ids.map((id) => l[id]); };
    switch (task.kind) {
      case 'comb': {
        const n = task.ins.length;
        for (let k = 0; k < (1 << n); k++) {
          const v = bitsOf(k, n); set(task.ins, v); eng.settle();
          const got = read(task.outs), want = task.f(v);
          if (!same(got, want)) fails.push({ ins: v, got: got.map(fmtV), want });
        }
        return { pass: !fails.length, fails, tested: 1 << n };
      }
      case 'seg': {
        for (const r of rows(task)) {
          set(task.ins, r.ins); eng.settle();
          const s = eng.segs()[task.display];
          const got = s ? SEGS.filter((k) => s.lit[k]).join('') : '';
          if (got !== r.want) fails.push({ ins: r.ins, got: got || '(dark)', want: r.want, digit: r.digit });
        }
        return { pass: !fails.length, fails, tested: task.digits };
      }
      case 'latch': {
        const seq = [[[1, 0], [0, 1]], [[1, 1], [0, 1]], [[0, 1], [1, 0]], [[1, 1], [1, 0]], [[1, 0], [0, 1]], [[0, 0], [1, 1]], [[1, 0], [0, 1]]];
        for (const [v, want] of seq) {
          set(task.ins, v); eng.settle();
          const got = read(task.outs);
          if (!same(got, want)) fails.push({ ins: v, got: got.map(fmtV), want });
        }
        return { pass: !fails.length, fails, tested: seq.length };
      }
      case 'ff': {
        let q = null;
        const reset = [0, 1]; // in2 = R or K: clears Q
        set(task.ins, reset); eng.settle(); eng.pulse(); q = 0;
        const g0 = read(task.outs);
        if (!same(g0, [0, 1])) fails.push({ ins: reset, pulse: true, got: g0.map(fmtV), want: [0, 1] });
        // inputs alone must not change Q while the clock is LOW
        set(task.ins, [1, 0]); eng.settle();
        const g1 = read(task.outs);
        if (!same(g1, [0, 1])) fails.push({ ins: [1, 0], pulse: false, got: g1.map(fmtV), want: [0, 1], msg: 'Q changed without a clock pulse' });
        const seq = task.next(1, 1, 0) === null ? [[1, 0], [0, 0], [0, 1], [0, 0], [1, 0], [1, 0], [0, 1]] : [[1, 0], [0, 0], [0, 1], [1, 1], [1, 1], [1, 1], [0, 0], [1, 0], [0, 1]];
        for (const v of seq) {
          set(task.ins, v); eng.settle();
          const held = read(task.outs);
          if (held[0] !== q) { fails.push({ ins: v, pulse: false, got: held.map(fmtV), want: [q, 1 - q], msg: 'Q changed without a clock pulse' }); q = held[0] === 1 ? 1 : 0; }
          eng.pulse();
          q = task.next(v[0], v[1], q);
          const got = read(task.outs);
          if (!same(got, [q, 1 - q])) { fails.push({ ins: v, pulse: true, got: got.map(fmtV), want: [q, 1 - q] }); q = got[0] === 1 ? 1 : 0; }
        }
        return { pass: !fails.length, fails, tested: seq.length + 2 };
      }
      case 'mono': case 'astable': return verify555(task, ex, eng);
      default: return { pass: true, fails: [] };
    }
  }

  // run the 555 circuit offline and measure it
  function verify555(task, ex, eng) {
    const tm = DSD.Analog.timing(ex, task.chip);
    const chip = eng.chips.find((c) => c.ref === task.chip);
    if (!chip || chip.power !== 'ok') return { pass: false, fails: [{ msg: `${task.chip} (555) is not placed or not powered.` }] };
    const probe = ex.termNode(task.probe);
    if (probe == null || probe !== chip.pinNode[3]) return { pass: false, fails: [{ msg: `Connect ${task.probe} (oscilloscope) to the 555 output, pin 3.` }] };
    const an = DSD.Analog.create(ex, eng);
    const edges = [];
    let last = an.st[0].q;
    const onStep = (t) => { const q = an.st[0].q; if (q !== last) { edges.push({ t, q }); last = q; } };
    if (task.kind === 'mono') {
      const R = tm.RA || task.defaults.R, C = tm.C || task.defaults.C, T = 1.1 * R * C;
      an.run(Math.max(5 * R * C, 2e-3), 2e5, onStep);
      if (an.st[0].q) return { pass: false, fails: [{ msg: 'Output is not LOW in the stable state — check that pins 6 and 7 are joined and C goes to GND.' }], theory: T };
      edges.length = 0;
      const t0 = an.time, w = Math.min(10e-6, T / 20);
      eng.setInput('PLN', 0); eng.settle(); an.refresh();
      an.run(t0 + w, 2e5, onStep);
      eng.setInput('PLN', 1); eng.settle(); an.refresh();
      an.run(t0 + 4 * T + 1e-3, 4e5, onStep);
      const rise = edges.find((e) => e.q === 1), fall = edges.find((e) => e.q === 0 && rise && e.t > rise.t);
      if (!rise) return { pass: false, fails: [{ msg: 'No output pulse after the trigger — the trigger (pin 2) should come from the pulser P′.' }], theory: T };
      if (!fall) return { pass: false, fails: [{ msg: 'The output went HIGH but never came back LOW.' }], theory: T };
      const width = fall.t - rise.t, ok = Math.abs(width - T) / T < 0.1;
      return { pass: ok, fails: ok ? [] : [{ msg: `Pulse width ${DSD.fmtTime(width)}, expected 1.1RC = ${DSD.fmtTime(T)}.` }], width, theory: T, R, C };
    }
    const RA = tm.RA || task.defaults.RA, RB = tm.RB || task.defaults.RB, C = tm.C || task.defaults.C;
    const Ton = 0.693 * (RA + RB) * C, Toff = 0.693 * RB * C, Tp = Ton + Toff;
    an.run(Math.min(14 * Tp, 30), 6e5, onStep);
    const m = measureEdges(edges);
    if (!m) return { pass: false, fails: [{ msg: 'The output does not oscillate. Check RA (+5V→pin 7), RB (pin 7→pin 6), pins 6 and 2 joined, C to GND.' }], theory: { Ton, Toff, T: Tp } };
    const ok = Math.abs(m.f - 1 / Tp) * Tp < 0.1;
    return { pass: ok, fails: ok ? [] : [{ msg: `Frequency ${DSD.fmtFreq(m.f)}, expected ${DSD.fmtFreq(1 / Tp)}.` }], meas: m, theory: { Ton, Toff, T: Tp, f: 1 / Tp, duty: Ton / Tp }, RA, RB, C };
  }
  // edges [{t,q}] -> timing of the last full cycle
  function measureEdges(edges) {
    const r = edges.filter((e) => e.q === 1), f = edges.filter((e) => e.q === 0);
    if (r.length < 3 || f.length < 2) return null;
    const r2 = r[r.length - 1], r1 = r[r.length - 2];
    const fm = f.filter((e) => e.t > r1.t && e.t < r2.t).pop();
    if (!fm) return null;
    const T = r2.t - r1.t, ton = fm.t - r1.t;
    return { T, ton, toff: T - ton, f: 1 / T, duty: ton / T };
  }

  function verify(part, build) {
    const results = part.tasks.map((t) => Object.assign({ task: t }, verifyTask(t, build)));
    return { pass: results.every((r) => r.pass), results };
  }

  DSD.Checks = { rows, observe, record, progress, diagnose, describeNode, apparatusStatus, verify, verifyTask, measureEdges, freshEngine, SEGS, bitsOf };
})(typeof window !== 'undefined' ? window : globalThis);
