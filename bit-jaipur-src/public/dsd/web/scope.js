/* ============================================================
 * scope.js — dual-channel CRO fed by the transient simulation.
 * Normal trigger on CH1 rising through 2.5 V, 1-2-5 timebase,
 * 2 V/div, automatic period / duty / pulse-width measurement.
 * ============================================================ */
(function () {
  'use strict';
  const DSD = window.DSD, UI = DSD.UI, { h } = UI;
  const TB = [1e-6, 2e-6, 5e-6, 1e-5, 2e-5, 5e-5, 1e-4, 2e-4, 5e-4, 1e-3, 2e-3, 5e-3, 1e-2, 2e-2, 5e-2, 0.1, 0.2, 0.5, 1];
  const CAP = 60000;

  UI.Scope = function () {
    const t = new Float64Array(CAP), v1 = new Float32Array(CAP), v2 = new Float32Array(CAP);
    let n = 0, head = 0, tbi = 9, auto = true, last1 = 0, edges = [];
    const canvas = h('canvas', { class: 'cro-canvas', width: 560, height: 360, 'aria-label': 'Oscilloscope screen' });
    const readout = h('div', { class: 'cro-read' });
    const tbLabel = h('span', { class: 'cro-tb' });
    const root = h('div', { class: 'cro' },
      h('div', { class: 'cro-bezel' }, canvas,
        h('div', { class: 'cro-knobs' },
          h('span', { class: 'cro-ch ch1' }, 'CH1 2 V/div'), h('span', { class: 'cro-ch ch2' }, 'CH2 2 V/div'),
          h('div', { class: 'cro-tbctl' },
            h('button', { class: 'dsd-icon-btn small', title: 'Faster timebase', 'aria-label': 'Faster timebase', onclick: () => { auto = false; tbi = Math.max(0, tbi - 1); draw(); } }, UI.icon('minus')),
            tbLabel,
            h('button', { class: 'dsd-icon-btn small', title: 'Slower timebase', 'aria-label': 'Slower timebase', onclick: () => { auto = false; tbi = Math.min(TB.length - 1, tbi + 1); draw(); } }, UI.icon('plus')),
            h('button', { class: 'dsd-chip-btn', title: 'Pick the timebase from the signal', onclick: () => { auto = true; draw(); } }, 'AUTO')))),
      readout);

    const api = { root };
    api.reset = () => { n = 0; head = 0; edges = []; last1 = 0; draw(); };
    api.push = (tt, a, b) => {
      // interpolated CH1 edge times for the measurements
      if (n && (last1 < 2.5) !== (a < 2.5)) {
        const tp = t[(head - 1 + CAP) % CAP], f = (2.5 - last1) / ((a - last1) || 1e-9);
        edges.push({ t: tp + (tt - tp) * f, q: a >= 2.5 ? 1 : 0 });
        if (edges.length > 80) edges.shift();
      }
      last1 = a;
      t[head] = tt; v1[head] = a; v2[head] = b;
      head = (head + 1) % CAP; if (n < CAP) n++;
    };
    api.edges = () => edges;
    api.measure = () => DSD.Checks.measureEdges(edges);
    api.lastPulse = () => { // most recent complete HIGH pulse
      for (let i = edges.length - 1; i > 0; i--) if (edges[i].q === 0 && edges[i - 1].q === 1) return { start: edges[i - 1].t, width: edges[i].t - edges[i - 1].t };
      return null;
    };
    const at = (k) => (head - n + k + CAP) % CAP;

    function draw() {
      const m = api.measure();
      if (auto) {
        const want = m ? (m.T * 2.5) / 10 : (api.lastPulse() ? api.lastPulse().width * 3 / 10 : null);
        if (want) { let k = TB.findIndex((x) => x >= want); tbi = k < 0 ? TB.length - 1 : k; }
      }
      const tdiv = TB[tbi], span = tdiv * 10;
      tbLabel.textContent = DSD.fmtTime(tdiv) + '/div';
      const ctx = canvas.getContext('2d'), W = canvas.width, H = canvas.height;
      ctx.fillStyle = '#0b1410'; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(120,200,160,0.16)'; ctx.lineWidth = 1;
      for (let i = 0; i <= 10; i++) { const x = (i * W) / 10; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let j = 0; j <= 8; j++) { const y = (j * H) / 8; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      ctx.strokeStyle = 'rgba(120,200,160,0.35)';
      ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke();
      if (!n) { ctx.fillStyle = 'rgba(160,230,190,0.6)'; ctx.font = '13px ui-monospace, monospace'; ctx.fillText('No signal — wire CH1 / CH2 and power the kit', 16, 24); readout.textContent = ''; return; }
      const tEnd = t[at(n - 1)];
      // normal trigger: latest rising edge with a full sweep after it
      let t0 = null;
      for (let i = edges.length - 1; i >= 0; i--) if (edges[i].q === 1 && edges[i].t + span * 0.9 <= tEnd) { t0 = edges[i].t - span * 0.1; break; }
      const trig = t0 !== null;
      if (!trig) t0 = tEnd - span;
      const yOf = (v, ch) => H - (H / 8) * (ch === 1 ? 4.5 : 0.5) - (v / 2) * (H / 8);
      const trace = (arr, ch, color) => {
        ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.shadowColor = color; ctx.shadowBlur = 6; ctx.beginPath();
        let started = false, prevY = null;
        for (let k = 0; k < n; k++) {
          const i = at(k), tt = t[i];
          if (tt < t0) continue;
          if (tt > t0 + span) break;
          const x = ((tt - t0) / span) * W, y = yOf(arr[i], ch);
          if (!started) { ctx.moveTo(x, y); started = true; } else { if (prevY !== null && Math.abs(y - prevY) > 2) ctx.lineTo(x, prevY); ctx.lineTo(x, y); }
          prevY = y;
        }
        ctx.stroke(); ctx.shadowBlur = 0;
      };
      trace(v2, 2, '#4fd1e8');
      trace(v1, 1, '#f5d142');
      ctx.fillStyle = trig ? 'rgba(160,230,190,0.75)' : 'rgba(240,180,90,0.85)';
      ctx.font = '12px ui-monospace, monospace';
      ctx.fillText(trig ? 'TRIG ↑ CH1 2.5 V' : 'AUTO (untriggered)', 10, 18);
      ctx.fillStyle = '#f5d142'; ctx.fillText('1▸', 2, yOf(0, 1) + 4); ctx.fillStyle = '#4fd1e8'; ctx.fillText('2▸', 2, yOf(0, 2) + 4);
      const lp = api.lastPulse();
      UI.fill(readout,
        m ? [h('span', {}, 'f ', h('b', {}, DSD.fmtFreq(m.f))), h('span', {}, 'T ', h('b', {}, DSD.fmtTime(m.T))), h('span', {}, 'T', h('sub', {}, 'ON'), ' ', h('b', {}, DSD.fmtTime(m.ton))), h('span', {}, 'T', h('sub', {}, 'OFF'), ' ', h('b', {}, DSD.fmtTime(m.toff))), h('span', {}, 'Duty ', h('b', {}, (m.duty * 100).toFixed(1) + '%'))]
          : lp ? h('span', {}, 'Last pulse width ', h('b', {}, DSD.fmtTime(lp.width))) : h('span', { class: 'muted' }, 'Waiting for edges on CH1…'));
    }
    api.draw = draw;
    draw();
    return api;
  };
})();
