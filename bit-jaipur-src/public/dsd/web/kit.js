/* ============================================================
 * kit.js — the trainer kit: drawing + interaction.
 * Breadboard drawing follows Better ALUU web/bbview.js.
 *
 * Interactions
 *   drag from a free hole to another hole ...... jumper wire
 *   drag a wire end ............................ re-plug it
 *   drag a chip ................................ move (drop off the kit to remove)
 *   click a part, then Del / R ................. remove / rotate
 *   right-click or double-click a part ......... remove
 *   armed resistor/capacitor + drag hole->hole . place it
 *   click a toggle switch / PULSE / POWER ...... operate the kit
 * ============================================================ */
(function () {
  'use strict';
  const DSD = window.DSD, UI = DSD.UI, B = DSD.Board;
  const { s } = UI;
  const P = 10;
  const W = B.KIT.w * P, H = B.KIT.h * P;
  const WIRE = { red: '#d43c3c', black: '#26221f', yellow: '#e8b10b', green: '#2f9e44', blue: '#2f6fdb', orange: '#ef7d22', white: '#efece6', purple: '#8e44ad' };
  UI.WIRE_COLORS = WIRE;
  const BAND = ['#1b1b1b', '#7a4a1e', '#d0312d', '#f28c28', '#f5d000', '#2e9e44', '#2563eb', '#7c3aed', '#8a8a8a', '#fafafa'];
  const bands = (ohms) => { const e = Math.floor(Math.log10(ohms)) - 1; const d = String(Math.round(ohms / 10 ** e)); return [BAND[+d[0]], BAND[+d[1]], BAND[e], '#c9a227']; };
  const px = (h) => { const p = B.holeXY(h); return { x: p.x * P, y: p.y * P }; };
  const capCode = (f) => { const pf = Math.round(f * 1e12); const e = Math.floor(Math.log10(pf)) - 1; return String(Math.round(pf / 10 ** e)) + e; };

  /* ---------- static kit artwork ---------- */
  function defs() {
    const lin = (id, stops, x2, y2) => s('linearGradient', { id, x1: 0, y1: 0, x2: x2 == null ? 0 : x2, y2: y2 == null ? 1 : y2 }, stops.map(([o, c]) => s('stop', { offset: o, 'stop-color': c })));
    const rad = (id, stops, cx, cy) => s('radialGradient', { id, cx: cx || 0.35, cy: cy || 0.3, r: 0.75 }, stops.map(([o, c]) => s('stop', { offset: o, 'stop-color': c })));
    return s('defs', {},
      lin('kitBody', [[0, 'var(--kit-top)'], [1, 'var(--kit-bot)']]),
      lin('bbBody', [[0, '#fbfaf5'], [1, '#efece2']]),
      lin('termRed', [[0, '#e0494a'], [1, '#9e1f22']]), lin('termBlack', [[0, '#4a4542'], [1, '#141211']]),
      lin('header', [[0, '#3a3633'], [1, '#191716']]),
      lin('plate', [[0, '#5d5955'], [0.5, '#3b3835'], [1, '#2a2725']]),
      lin('lever', [[0, '#f4f4f2'], [0.45, '#b9bcc0'], [1, '#6f7378']], 1, 0),
      rad('bushing', [[0, '#f7f7f5'], [0.5, '#a9adb2'], [1, '#55595e']]),
      rad('ledRedOn', [[0, '#fff3ee'], [0.25, '#ff6b5e'], [1, '#c3150c']]), rad('ledRedOff', [[0, '#e9a59c'], [0.3, '#8f2a22'], [1, '#4c0f0b']]),
      rad('ledGrnOn', [[0, '#f3fff2'], [0.25, '#5cf27c'], [1, '#12902f']]), rad('ledGrnOff', [[0, '#a8d8b0'], [0.3, '#2b6a37'], [1, '#123018']]),
      rad('btnRed', [[0, '#ff8f84'], [0.5, '#d42c25'], [1, '#7c0e0b']]),
      lin('rocker', [[0, '#e04646'], [1, '#8f1717']]),
      lin('chipBody', [[0, '#34312f'], [0.5, '#1f1d1c'], [1, '#141312']]),
      lin('resBody', [[0, '#f0dcb4'], [0.5, '#d9be8a'], [1, '#b6965f']]),
      rad('ceramic', [[0, '#f0a35c'], [0.6, '#c46a26'], [1, '#8a4512']]),
      lin('ecap', [[0, '#3c64c8'], [0.5, '#2448a0'], [1, '#15306f']], 1, 0),
      s('pattern', { id: 'dots', width: 10, height: 10, patternUnits: 'userSpaceOnUse' }, s('rect', { x: 3.6, y: 3.6, width: 2.8, height: 2.8, rx: 0.6, fill: 'var(--kit-dot)' })),
      s('filter', { id: 'shadow', x: '-20%', y: '-20%', width: '140%', height: '150%' }, s('feDropShadow', { dx: 0, dy: 1.6, stdDeviation: 1.4, 'flood-color': '#000', 'flood-opacity': 0.35 })),
      s('filter', { id: 'glow', x: '-100%', y: '-100%', width: '300%', height: '300%' }, s('feGaussianBlur', { stdDeviation: 5 })),
      s('filter', { id: 'smoke', x: '-50%', y: '-50%', width: '200%', height: '200%' }, s('feGaussianBlur', { stdDeviation: 3 })));
  }
  const section = (x, y, w, h, title) => s('g', { class: 'kit-section' },
    s('rect', { x: x * P, y: y * P, width: w * P, height: h * P, rx: 9, class: 'kit-sec-box' }),
    s('rect', { x: x * P + 12, y: y * P - 6, width: title.length * 6.3 + 14, height: 12, rx: 6, class: 'kit-sec-tab' }),
    s('text', { x: x * P + 19, y: y * P + 3.6, class: 'kit-sec-title' }, title));
  function socketBlock(t, cls) {
    const ss = t.sockets, x1 = Math.min(...ss.map((q) => q.x)) - 1.1, x2 = Math.max(...ss.map((q) => q.x)) + 1.1, y = ss[0].y;
    return s('g', { class: 'kit-term ' + (cls || '') },
      s('rect', { x: x1 * P, y: (y - 1.15) * P, width: (x2 - x1) * P, height: 2.3 * P, rx: 3, fill: cls === 'red' ? 'url(#termRed)' : cls === 'black' ? 'url(#termBlack)' : 'url(#header)', filter: 'url(#shadow)' }),
      ss.map((q) => s('rect', { x: q.x * P - 2.2, y: q.y * P - 2.2, width: 4.4, height: 4.4, rx: 1, class: 'kit-socket' })));
  }
  function breadboard() {
    const x0 = B.BB.x * P, y0 = B.BB.y * P, w = B.BB.w * P, hgt = B.BB.h * P;
    const g = s('g', { class: 'bb' });
    g.appendChild(s('rect', { x: x0, y: y0, width: w, height: hgt, rx: 7, fill: 'url(#bbBody)', class: 'bb-body', filter: 'url(#shadow)' }));
    g.appendChild(s('rect', { x: x0 + 8, y: y0 + 9.05 * P, width: w - 16, height: 0.9 * P, rx: 2, class: 'bb-channel' }));
    const ry = (r) => y0 + B.ROW_Y[r] * P;
    [['T-', -0.75, 'blue'], ['T+', 0.75, 'red'], ['B-', -0.75, 'blue'], ['B+', 0.75, 'red']].forEach(([r, off, c]) => {
      g.appendChild(s('line', { x1: x0 + 2.4 * P, x2: x0 + 63.6 * P, y1: ry(r) + off * P, y2: ry(r) + off * P, class: 'rail-line ' + c }));
      g.appendChild(s('text', { x: x0 + 1.2 * P, y: ry(r) + 3.4, class: 'rail-sign ' + c }, r[1] === '+' ? '+' : '−'));
      g.appendChild(s('text', { x: x0 + 64.8 * P, y: ry(r) + 3.4, class: 'rail-sign ' + c }, r[1] === '+' ? '+' : '−'));
    });
    let d = '';
    const sq = (x, y) => { d += `M${x - 1.75} ${y - 1.75}h3.5v3.5h-3.5z`; };
    for (let c = 1; c <= B.NCOL; c++) for (const r of B.ROWS) { const p = px(B.hole(r, c)); sq(p.x, p.y); }
    for (const r of B.RAILS) for (const c of B.RAIL_COLS) { const p = px(B.railHole(r, c)); sq(p.x, p.y); }
    g.appendChild(s('path', { d, class: 'bb-holes' }));
    for (const c of [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60]) {
      const x = x0 + (c + 1.5) * P;
      g.appendChild(s('text', { x, y: y0 + 3.05 * P, class: 'bb-num' }, c));
      g.appendChild(s('text', { x, y: y0 + 16.35 * P, class: 'bb-num' }, c));
    }
    for (const r of B.ROWS) {
      const y = y0 + B.ROW_Y[r] * P + 2.6;
      g.appendChild(s('text', { x: x0 + 1.0 * P, y, class: 'bb-row' }, r));
      g.appendChild(s('text', { x: x0 + 65.0 * P, y, class: 'bb-row' }, r));
    }
    return g;
  }
  function toggleSwitch(i, onClick) {
    const cx = B.IN_X(i) * P, cy = 48.6 * P;
    const lever = s('g', { class: 'sw-lever', style: `transform-origin:${cx}px ${cy}px` },
      s('path', { d: `M${cx - 4.2} ${cy} L${cx - 2.4} ${cy - 40} Q${cx} ${cy - 45} ${cx + 2.4} ${cy - 40} L${cx + 4.2} ${cy} Z`, fill: 'url(#lever)', stroke: '#4d5156', 'stroke-width': 0.6 }),
      s('ellipse', { cx, cy: cy - 40.5, rx: 3.3, ry: 2.2, fill: '#f8f8f6', stroke: '#6f7378', 'stroke-width': 0.6 }));
    const g = s('g', { class: 'kit-switch', role: 'button', tabindex: 0, 'data-sw': i, 'aria-label': `Logic switch S${i}`, onclick: () => onClick(i),
      onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(i); } } },
      s('rect', { x: cx - 26, y: cy - 52, width: 52, height: 102, fill: 'transparent' }),
      s('rect', { x: cx - 19, y: cy - 46, width: 38, height: 92, rx: 5, fill: 'url(#plate)', filter: 'url(#shadow)' }),
      s('circle', { cx: cx - 13, cy: cy - 40, r: 2, class: 'kit-screw' }), s('circle', { cx: cx + 13, cy: cy + 40, r: 2, class: 'kit-screw' }),
      s('text', { x: cx + 13, y: cy - 30, class: 'sw-mark' }, '1'), s('text', { x: cx + 13, y: cy + 36, class: 'sw-mark' }, '0'),
      s('ellipse', { cx, cy: cy + 3, rx: 15, ry: 6, fill: '#000', opacity: 0.25 }),
      s('circle', { cx, cy, r: 13, fill: 'url(#bushing)', stroke: '#3c3f43', 'stroke-width': 0.8 }),
      s('circle', { cx, cy, r: 7.5, fill: '#2b2d30' }),
      lever);
    return { g, lever };
  }
  function led(cx, cy, r, color) {
    const glow = s('circle', { cx, cy, r: r * 2.6, class: 'led-glow ' + color, filter: 'url(#glow)' });
    const dome = s('circle', { cx, cy, r, fill: color === 'grn' ? 'url(#ledGrnOff)' : 'url(#ledRedOff)', class: 'led-dome' });
    const g = s('g', { class: 'kit-led' }, glow, s('circle', { cx, cy, r: r + 2.4, class: 'led-rim' }), dome, s('ellipse', { cx: cx - r * 0.35, cy: cy - r * 0.4, rx: r * 0.3, ry: r * 0.2, class: 'led-shine' }));
    return { g, glow, dome, color };
  }

  /* ---------- parts ---------- */
  function chipSvg(p, cls, opts) {
    const def = p.kind === 'chip' ? DSD.LIB[p.type] : null;
    const n = B.partNpins(p), half = n / 2;
    const xa = (B.BB.x + p.col + 1.5) * P, xb = (B.BB.x + p.col + half - 1 + 1.5) * P;
    const g = s('g', { class: `part ${p.kind} ${cls}`, 'data-id': p.id });
    if (p.kind === 'seg7') return seg7Svg(p, g, xa, xb);
    const yt = (B.BB.y + 8.45) * P, yb = (B.BB.y + 10.55) * P;
    for (let i = 1; i <= n; i++) {
      const q = px(B.dipPinHole(p.col, n, p.rot || 0, i));
      const top = q.y < yt;
      g.appendChild(s('rect', { x: q.x - 2.4, y: top ? q.y - 1.6 : yb - 1, width: 4.8, height: top ? yt - q.y + 2.6 : q.y - yb + 2.6, rx: 0.8, class: 'leg' }));
    }
    g.appendChild(s('rect', { x: xa - 5, y: yt, width: xb - xa + 10, height: yb - yt, rx: 2.4, fill: 'url(#chipBody)', class: 'chip-body', filter: 'url(#shadow)' }));
    const nx = p.rot ? xb + 5 : xa - 5, my = (yt + yb) / 2;
    g.appendChild(s('path', { d: `M${nx} ${my - 4.2} a4.2 4.2 0 0 ${p.rot ? 0 : 1} 0 8.4`, class: 'chip-notch' }));
    const pin1 = px(B.dipPinHole(p.col, n, p.rot || 0, 1));
    g.appendChild(s('circle', { cx: pin1.x, cy: p.rot ? yt + 4 : yb - 4, r: 1.4, class: 'chip-dot' }));
    g.appendChild(s('text', { x: (xa + xb) / 2, y: my - 0.5, class: 'chip-type' }, def.chipText));
    g.appendChild(s('text', { x: (xa + xb) / 2, y: my + 7.5, class: 'chip-ref' }, p.ref));
    if (p.burnt) {
      g.appendChild(s('ellipse', { cx: (xa + xb) / 2, cy: my, rx: (xb - xa) / 2 + 4, ry: 11, class: 'chip-scorch' }));
      [0, 1, 2].forEach((k) => g.appendChild(s('circle', { cx: (xa + xb) / 2 + (k - 1) * 9, cy: my - 8, r: 6, class: 'smoke s' + k, filter: 'url(#smoke)' })));
    }
    if (opts.powerWarn) g.appendChild(s('rect', { x: xa - 8, y: yt - 3, width: xb - xa + 16, height: yb - yt + 6, rx: 4, class: 'chip-warn' }));
    return g;
  }
  const SEG_PATH = (() => {
    // 7-segment digit in a 20 x 34 box, slanted
    const w = 20, h = 34, t = 3.2, sl = 0.12;
    const sk = (x, y) => `${(x + (h - y) * sl).toFixed(2)} ${y.toFixed(2)}`;
    const hseg = (y) => `M${sk(t, y)} L${sk(t + 1.6, y - t / 2)} L${sk(w - t - 1.6, y - t / 2)} L${sk(w - t, y)} L${sk(w - t - 1.6, y + t / 2)} L${sk(t + 1.6, y + t / 2)} Z`;
    const vseg = (x, y1, y2) => `M${sk(x, y1)} L${sk(x + t / 2, y1 + 1.6)} L${sk(x + t / 2, y2 - 1.6)} L${sk(x, y2)} L${sk(x - t / 2, y2 - 1.6)} L${sk(x - t / 2, y1 + 1.6)} Z`;
    return { a: hseg(t / 2 + 0.4), g: hseg(h / 2), d: hseg(h - t / 2 - 0.4), f: vseg(t / 2, t, h / 2 - 0.6), b: vseg(w - t / 2, t, h / 2 - 0.6), e: vseg(t / 2, h / 2 + 0.6, h - t), c: vseg(w - t / 2, h / 2 + 0.6, h - t) };
  })();
  function seg7Svg(p, g, xa, xb) {
    const y1 = (B.BB.y + 6.55) * P, y2 = (B.BB.y + 12.45) * P;
    g.appendChild(s('rect', { x: xa - 6, y: y1, width: xb - xa + 12, height: y2 - y1, rx: 3, class: 'seg-body', filter: 'url(#shadow)' }));
    const ox = (xa + xb) / 2 - 12, oy = (y1 + y2) / 2 - 17;
    const dg = s('g', { transform: `translate(${ox} ${oy})`, class: 'seg-digit' });
    for (const [k, d] of Object.entries(SEG_PATH)) dg.appendChild(s('path', { d, class: 'seg seg-' + k, 'data-seg': k }));
    dg.appendChild(s('circle', { cx: 23.5, cy: 32.5, r: 1.8, class: 'seg seg-dp', 'data-seg': 'dp' }));
    g.appendChild(dg);
    g.appendChild(s('text', { x: (xa + xb) / 2, y: y2 - 3, class: 'seg-ref' }, p.ref + ' CC'));
    return g;
  }
  const leads = (a, b) => s('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, class: 'lead' });
  function resistorSvg(p, cls) {
    const a = px(p.h1), b = px(p.h2);
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
    const len = Math.min(24, Math.max(10, Math.hypot(b.x - a.x, b.y - a.y) - 6));
    const g = s('g', { class: `part resistor ${cls}`, 'data-id': p.id });
    g.appendChild(leads(a, b));
    [a, b].forEach((q) => g.appendChild(s('circle', { cx: q.x, cy: q.y, r: 1.6, class: 'leg-end' })));
    const body = s('g', { transform: `translate(${mx} ${my}) rotate(${ang})`, filter: 'url(#shadow)' });
    body.appendChild(s('rect', { x: -len / 2, y: -3.6, width: len, height: 7.2, rx: 3.4, fill: 'url(#resBody)', class: 'res-body' }));
    bands(p.ohms || 1000).forEach((c, i) => body.appendChild(s('rect', { x: -len / 2 + 2.6 + i * (len - 6) / 3.6 + (i === 3 ? 1.6 : 0), y: -3.6, width: 1.7, height: 7.2, fill: c })));
    g.appendChild(body);
    return g;
  }
  function capSvg(p, cls) {
    const a = px(p.h1), b = px(p.h2);
    const g = s('g', { class: `part cap ${cls}`, 'data-id': p.id });
    g.appendChild(leads(a, b));
    [a, b].forEach((q) => g.appendChild(s('circle', { cx: q.x, cy: q.y, r: 1.6, class: 'leg-end' })));
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    if (p.farads >= 1e-6) {
      g.appendChild(s('rect', { x: mx - 6.5, y: my - 8, width: 13, height: 16, rx: 3, fill: 'url(#ecap)', filter: 'url(#shadow)' }));
      g.appendChild(s('rect', { x: mx + 2.5, y: my - 8, width: 3, height: 16, fill: '#d7dcef', opacity: 0.85 }));
      g.appendChild(s('text', { x: mx - 1.6, y: my + 2.4, class: 'cap-txt light' }, Math.round(p.farads * 1e6)));
    } else {
      g.appendChild(s('ellipse', { cx: mx, cy: my, rx: 7.2, ry: 6, fill: 'url(#ceramic)', filter: 'url(#shadow)' }));
      g.appendChild(s('text', { x: mx, y: my + 2.2, class: 'cap-txt' }, capCode(p.farads)));
    }
    return g;
  }
  function wirePath(a, b, seed) {
    const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
    const bow = Math.min(len * 0.14, 16) * (seed % 2 ? 1 : -1);
    const cx = (a.x + b.x) / 2 - (dy / len) * bow, cy = (a.y + b.y) / 2 + (dx / len) * bow - Math.min(10, len * 0.08);
    return `M${a.x} ${a.y} Q${cx} ${cy} ${b.x} ${b.y}`;
  }
  function wireSvg(p, cls) {
    const a = px(p.h1), b = px(p.h2);
    const seed = [...p.id].reduce((t, c) => t + c.charCodeAt(0), 0);
    const d = wirePath(a, b, seed), col = WIRE[p.color] || p.color || WIRE.blue;
    return s('g', { class: `part wire ${cls}`, 'data-id': p.id },
      s('path', { d, class: 'wire-hit' }),
      s('path', { d, class: 'wire-under' }),
      s('path', { d, class: 'wire-core', stroke: col }),
      s('path', { d, class: 'wire-gloss' }),
      s('circle', { cx: a.x, cy: a.y, r: 2.3, class: 'wire-tip', 'data-end': 'h1' }),
      s('circle', { cx: b.x, cy: b.y, r: 2.3, class: 'wire-tip', 'data-end': 'h2' }));
  }

  /* ============================================================ */
  UI.Kit = function (container, opts) {
    const svg = s('svg', { class: 'kit-svg', role: 'application', 'aria-label': 'Digital trainer kit with breadboard' });
    const gBase = s('g'), gParts = s('g', { class: 'kit-parts' }), gOver = s('g', { class: 'kit-overlay' }), gDrag = s('g', { class: 'kit-drag' });
    svg.append(defs(), gBase, gParts, gOver, gDrag);
    const wrap = UI.h('div', { class: 'kit-wrap' }, svg);
    container.appendChild(wrap);

    /* ---- static base ---- */
    gBase.appendChild(s('rect', { x: 0, y: 0, width: W, height: H, rx: 22, fill: 'url(#kitBody)', class: 'kit-body' }));
    gBase.appendChild(s('rect', { x: 0, y: 0, width: W, height: H, rx: 22, fill: 'url(#dots)', opacity: 0.55 }));
    gBase.appendChild(s('rect', { x: 5, y: 5, width: W - 10, height: H - 10, rx: 18, class: 'kit-inner' }));
    [[12, 12], [W - 12, 12], [12, H - 12], [W - 12, H - 12]].forEach(([x, y]) => gBase.appendChild(s('circle', { cx: x, cy: y, r: 4, class: 'kit-screw' })));
    gBase.append(section(1.5, 1.8, 26, 11.4, 'POWER SUPPLY'), section(28.5, 1.8, 60, 11.4, 'LOGIC INDICATORS'),
      section(71, 15, 17.5, 13.6, 'MONO PULSER'), section(71, 30, 17.5, 5.4, 'CRO PROBES'),
      section(1.5, 36.4, 68, 22.2, 'LOGIC INPUTS'));
    // power terminals
    gBase.append(socketBlock(B.TERMS.VCC, 'red'), socketBlock(B.TERMS.GND, 'black'),
      s('text', { x: 6.25 * P, y: 5.6 * P, class: 'kit-label red' }, '+5 V'), s('text', { x: 14.25 * P, y: 5.6 * P, class: 'kit-label' }, 'GND'));
    // power rocker
    const rocker = s('g', { class: 'kit-power', role: 'button', tabindex: 0, 'aria-label': 'Power switch', onclick: () => opts.onPower(),
      onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); opts.onPower(); } } },
      s('rect', { x: 19.1 * P, y: 2.9 * P, width: 6.2 * P, height: 7.6 * P, rx: 7, class: 'rocker-hint' }),
      s('rect', { x: 19.6 * P, y: 3.4 * P, width: 5.2 * P, height: 6.6 * P, rx: 4, class: 'rocker-frame', filter: 'url(#shadow)' }),
      s('rect', { x: 20.2 * P, y: 4 * P, width: 4 * P, height: 5.4 * P, rx: 3, fill: 'url(#rocker)', class: 'rocker-face' }),
      s('rect', { x: 20.2 * P, y: 4 * P, width: 4 * P, height: 2.7 * P, rx: 3, class: 'rocker-top' }),
      s('text', { x: 22.2 * P, y: 5.9 * P, class: 'rocker-txt' }, 'I'), s('text', { x: 22.2 * P, y: 8.6 * P, class: 'rocker-txt' }, 'O'));
    const pled = led(22.2 * P, 11.4 * P, 4.5, 'grn');
    gBase.append(rocker, pled.g, s('text', { x: 25.4 * P, y: 11.8 * P, class: 'kit-mini' }, 'ON'));
    // output LEDs
    const outLeds = [];
    for (let i = 7; i >= 0; i--) {
      const t = B.TERMS['OUT' + i], cx = t.cx * P;
      const l = led(cx, 5.2 * P, 8.5, 'red'); outLeds[i] = l;
      gBase.append(l.g, s('text', { x: cx, y: 8.15 * P, class: 'kit-label' }, 'L' + i), socketBlock(t));
    }
    gBase.appendChild(breadboard());
    // pulser + probes
    const pbtn = s('g', { class: 'kit-pulse', role: 'button', tabindex: 0, 'aria-label': 'Pulse button', onclick: () => opts.onPulse(),
      onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); opts.onPulse(); } } },
      s('rect', { x: 76.2 * P, y: 16.4 * P, width: 7.1 * P, height: 6.4 * P, rx: 6, class: 'pulse-frame', filter: 'url(#shadow)' }),
      s('circle', { cx: 79.75 * P, cy: 19.6 * P, r: 2.3 * P, class: 'pulse-ring' }),
      s('circle', { cx: 79.75 * P, cy: 19.6 * P, r: 1.8 * P, fill: 'url(#btnRed)', class: 'pulse-cap' }));
    gBase.append(pbtn,
      socketBlock(B.TERMS.PLS), socketBlock(B.TERMS.PLN),
      s('text', { x: 76.25 * P, y: 24.4 * P, class: 'kit-label' }, 'P'), s('text', { x: 83.25 * P, y: 24.4 * P, class: 'kit-label' }, 'P′'),
      socketBlock(B.TERMS.CH1), socketBlock(B.TERMS.CH2),
      s('circle', { cx: 73.6 * P, cy: 33 * P, r: 4, class: 'probe-dot ch1' }), s('circle', { cx: 80.6 * P, cy: 33 * P, r: 4, class: 'probe-dot ch2' }),
      s('text', { x: 76.25 * P, y: 31.6 * P, class: 'kit-label' }, 'CH1'), s('text', { x: 83.25 * P, y: 31.6 * P, class: 'kit-label' }, 'CH2'));
    // inputs
    const inLeds = [], levers = [];
    for (let i = 7; i >= 0; i--) {
      const t = B.TERMS['IN' + i], cx = t.cx * P;
      gBase.appendChild(socketBlock(t));
      const l = led(cx, 41.4 * P, 6, 'grn'); inLeds[i] = l; gBase.appendChild(l.g);
      const sw = toggleSwitch(i, (k) => opts.onToggle(k)); levers[i] = sw; gBase.appendChild(sw.g);
      gBase.appendChild(s('text', { x: cx, y: 57.2 * P, class: 'kit-label strong' }, 'S' + i));
    }
    // brand plate
    gBase.append(
      s('rect', { x: 71 * P, y: 36.4 * P, width: 17.5 * P, height: 22.2 * P, rx: 10, class: 'kit-plate' }),
      s('text', { x: 79.75 * P, y: 44.6 * P, class: 'kit-brand' }, 'DSD'),
      s('text', { x: 79.75 * P, y: 47.6 * P, class: 'kit-brand-sub' }, 'DIGITAL TRAINER'),
      s('line', { x1: 73.5 * P, x2: 86 * P, y1: 49.4 * P, y2: 49.4 * P, class: 'kit-rule' }),
      s('text', { x: 79.75 * P, y: 51.8 * P, class: 'kit-mini' }, 'BIT MESRA · JAIPUR'),
      s('text', { x: 79.75 * P, y: 54.2 * P, class: 'kit-mini' }, '+5 V DC · TTL / CMOS'),
      s('text', { x: 79.75 * P, y: 56.6 * P, class: 'kit-mini faint' }, 'BitHub DSD Lab'));

    const pz = new UI.PanZoom(svg, { x: -14, y: -14, w: W + 28, h: H + 28 }, { minW: 160, maxW: W * 1.6, canPan: () => !handled });

    /* ---- state ---- */
    let ex = null, selected = null, handled = false, drag = null, hoverHole = null;
    const view = { svg, pz, wrap };
    const build = () => opts.getBuild();
    const ro = () => opts.readOnly && opts.readOnly();

    view.render = () => {
      const bd = build(), v = opts.getView();
      ex = v.ex;
      const order = { chip: 0, seg7: 0, cap: 1, resistor: 2, wire: 3 };
      const parts = bd.parts.slice().sort((a, b) => (order[a.kind] ?? 9) - (order[b.kind] ?? 9));
      UI.fill(gParts);
      for (const p of parts) {
        const cls = (p.id === selected ? 'sel ' : '') + (ro() ? 'ro' : '');
        let el;
        if (p.kind === 'chip' || p.kind === 'seg7') el = chipSvg(p, cls, { powerWarn: v.power && p.kind === 'chip' && v.chipPower && v.chipPower[p.ref] && v.chipPower[p.ref] !== 'ok' && !p.burnt });
        else if (p.kind === 'resistor') el = resistorSvg(p, cls);
        else if (p.kind === 'cap') el = capSvg(p, cls);
        else if (p.kind === 'wire') el = wireSvg(p, cls);
        if (el) gParts.appendChild(el);
      }
      view.update();
      if (hoverHole) showNode(hoverHole);
    };
    // live state only (LEDs, switches, segments)
    view.update = () => {
      const v = opts.getView();
      svg.classList.toggle('powered', !!v.power);
      pled.g.classList.toggle('on', !!v.power);
      pled.dome.setAttribute('fill', v.power ? 'url(#ledGrnOn)' : 'url(#ledGrnOff)');
      for (let i = 0; i < 8; i++) {
        const b = v.power ? (v.ledLevel ? v.ledLevel[i] : 0) : 0;
        const l = outLeds[i];
        l.glow.style.opacity = String(Math.max(0, Math.min(1, b)) * 0.9);
        l.dome.setAttribute('fill', b > 0.08 ? 'url(#ledRedOn)' : 'url(#ledRedOff)');
        l.g.classList.toggle('flicker', !!(v.ledX && v.ledX[i]));
        const on = !!v.inputs['IN' + i];
        levers[i].g.classList.toggle('off', !on);
        const il = inLeds[i], lit = on && v.power;
        il.glow.style.opacity = lit ? '0.85' : '0';
        il.dome.setAttribute('fill', lit ? 'url(#ledGrnOn)' : 'url(#ledGrnOff)');
      }
      for (const el of gParts.querySelectorAll('.part.seg7')) {
        const st = v.segs && v.segs[el.dataset.id];
        for (const sg of el.querySelectorAll('.seg')) sg.classList.toggle('lit', !!(v.power && st && st.lit[sg.dataset.seg]));
      }
    };

    /* ---- hole picking ---- */
    function pick(pt) {
      const x = pt.x / P, y = pt.y / P;
      for (const t of Object.values(B.TERMS)) t.sockets.forEach((q, i) => { if (Math.abs(q.x - x) < 0.65 && Math.abs(q.y - y) < 0.75) pick.hit = `${t.id}:${i}`; });
      if (pick.hit) { const r = pick.hit; pick.hit = null; return r; }
      const lx = x - B.BB.x, ly = y - B.BB.y;
      if (lx < 0 || ly < 0 || lx > B.BB.w || ly > B.BB.h) return null;
      let best = null, bd = 0.55;
      for (const [r, ry] of Object.entries(B.ROW_Y)) { const d = Math.abs(ry - ly); if (d < bd) { bd = d; best = r; } }
      if (!best) return null;
      const colF = lx - 1.5;
      if (best.length === 2) {
        let c = null, cd = 0.6;
        for (const rc of B.RAIL_COLS) { const d = Math.abs(rc - colF); if (d < cd) { cd = d; c = rc; } }
        return c == null ? null : B.railHole(best, c);
      }
      const col = Math.round(colF);
      if (col < 1 || col > B.NCOL || Math.abs(col - colF) > 0.6) return null;
      return B.hole(best, col);
    }
    const occupant = (h) => (ex && ex.occupied.get(h)) || null;
    const free = (h, except) => { const o = occupant(h); return !o || (except && o.part === except); };

    /* ---- hover: trace the node under the cursor ---- */
    function holeRing(hole, cls) { const q = px(hole); return s('rect', { x: q.x - 4, y: q.y - 4, width: 8, height: 8, rx: 2, class: cls }); }
    function showNode(hole) {
      UI.fill(gOver);
      if (!hole || !ex) return;
      const n = ex.nodeOfHole(hole);
      const v = opts.getView();
      const val = n == null ? 3 : v.nodeVal ? v.nodeVal(n) : 3;
      const lv = v.power ? UI.lvl(val) : 'z';
      const keys = n == null ? [B.stripKey(hole)] : ex.nodeKeys[n];
      for (const k of keys) {
        let m = /^(\d+)([TB])$/.exec(k);
        if (m) { for (const r of m[2] === 'T' ? B.TOP : B.BOT) gOver.appendChild(holeRing(B.hole(r, +m[1]), 'node-ring ' + lv)); continue; }
        m = /^R(.+)$/.exec(k);
        if (m) { for (const c of B.RAIL_COLS) gOver.appendChild(holeRing(B.railHole(m[1], c), 'node-ring rail ' + lv)); continue; }
        if (B.TERMS[k]) B.TERMS[k].sockets.forEach((_, i) => gOver.appendChild(holeRing(`${k}:${i}`, 'node-ring ' + lv)));
      }
      gOver.appendChild(holeRing(hole, 'hover-ring'));
    }
    function hoverInfo(hole) {
      if (!hole) { opts.onHover(null); return; }
      const o = occupant(hole), v = opts.getView();
      const n = ex ? ex.nodeOfHole(hole) : null;
      let what = '';
      if (o && o.part.kind === 'chip') { const def = DSD.LIB[o.part.type]; const pin = +o.leg.replace('pin ', ''); what = `${o.part.ref} pin ${pin} (${def.pinName(pin)})`; }
      else if (o && o.part.kind === 'seg7') { const pin = +o.leg.replace('pin ', ''); what = `${o.part.ref} pin ${pin} (${DSD.COMPONENTS.seg7.pins[pin - 1]})`; }
      else if (o) what = `${o.part.ref || o.part.kind} ${o.leg}`;
      opts.onHover({ hole, desc: B.describeHole(hole), what, node: n, val: n == null ? 3 : v.nodeVal(n), power: v.power, on: n != null && ex ? DSD.Checks.describeNode(ex, n) : '' });
    }

    /* ---- pointer handling ---- */
    const toPt = (e) => pz.toSvg(e.clientX, e.clientY);
    const partOf = (el) => { const g = el && el.closest && el.closest('.part'); return g ? build().parts.find((p) => p.id === g.dataset.id) : null; };
    const insideKit = (pt) => pt.x >= 0 && pt.y >= 0 && pt.x <= W && pt.y <= H;
    function dipCol(pt, grabOff) { return Math.round(pt.x / P - B.BB.x - 1.5 - grabOff); }
    function dipValid(part, col) {
      const n = B.partNpins(part);
      if (!B.dipFits(col, n)) return false;
      const t = Object.assign({}, part, { col });
      const holes = B.partLegs(t).map((l) => l.hole).concat(B.partCovers(t));
      return holes.every((h) => free(h, part.id ? build().parts.find((p) => p.id === part.id) : null));
    }
    function ghostDip(part, col, ok) {
      UI.fill(gDrag);
      if (col == null || !B.dipFits(col, B.partNpins(part))) return;
      const g = chipSvg(Object.assign({}, part, { col, id: '__ghost', ref: part.ref || '' }), 'ghost ' + (ok ? 'ok' : 'bad'), {});
      gDrag.appendChild(g);
    }
    function ghostLine(a, b, kind, ok) {
      UI.fill(gDrag);
      const col = kind === 'wire' ? WIRE[opts.wireColor()] : kind === 'resistor' ? '#c9a36a' : '#c46a26';
      gDrag.appendChild(s('path', { d: wirePath(a, b, 1), class: 'drag-line ' + (ok ? '' : 'bad'), stroke: col }));
      gDrag.appendChild(s('circle', { cx: a.x, cy: a.y, r: 4, class: 'drag-end' }));
    }

    svg.addEventListener('pointerdown', (e) => {
      handled = false;
      if (e.button === 2) return;
      if (e.target.closest('.kit-switch, .kit-power, .kit-pulse')) { handled = true; return; }
      const pt = toPt(e);
      if (ro()) return;
      const part = partOf(e.target);
      const hole = pick(pt);
      if (part && part.kind === 'wire' && e.target.classList.contains('wire-tip')) {
        handled = true; drag = { type: 'end', part, end: e.target.dataset.end, moved: false };
      } else if (hole && free(hole) && (!part || part.kind === 'wire')) {
        // a free hole wins over a wire lying across it; a plain click still selects the wire
        handled = true; drag = { type: 'line', from: hole, kind: opts.armed() ? opts.armed().kind : 'wire', moved: false, under: part };
      } else if (part && (part.kind === 'chip' || part.kind === 'seg7')) {
        handled = true; drag = { type: 'dip', part, grab: pt.x / P - B.BB.x - 1.5 - part.col, moved: false, start: pt };
      } else if (part && (part.kind === 'resistor' || part.kind === 'cap') && hole && (hole === part.h1 || hole === part.h2)) {
        handled = true; drag = { type: 'end', part, end: hole === part.h1 ? 'h1' : 'h2', moved: false };
      } else if (part) {
        handled = true; drag = { type: 'select', part };
      } else if (hole && occupant(hole)) {
        handled = true; drag = { type: 'select', part: occupant(hole).part };
      }
      if (handled) { e.stopImmediatePropagation(); svg.setPointerCapture(e.pointerId); }
    }, true); // capture phase: runs before the pan/zoom handler, which then never sees it
    svg.addEventListener('pointermove', (e) => {
      const pt = toPt(e);
      if (!drag) {
        const hh = pick(pt);
        if (hh !== hoverHole) { hoverHole = hh; showNode(hh); hoverInfo(hh); }
        return;
      }
      drag.moved = true;
      const hole = pick(pt);
      if (drag.type === 'line') {
        const ok = hole && hole !== drag.from && free(hole) && lenOk(drag.kind, drag.from, hole);
        ghostLine(px(drag.from), hole ? px(hole) : pt, drag.kind, ok);
      } else if (drag.type === 'end') {
        const other = drag.part[drag.end === 'h1' ? 'h2' : 'h1'];
        const ok = hole && hole !== other && free(hole, drag.part) && lenOk(drag.part.kind, other, hole);
        ghostLine(px(other), hole ? px(hole) : pt, drag.part.kind, ok);
        gParts.querySelector(`[data-id="${drag.part.id}"]`).classList.add('dragging');
      } else if (drag.type === 'dip') {
        const col = dipCol(pt, drag.grab);
        gParts.querySelector(`[data-id="${drag.part.id}"]`).classList.add('dragging');
        ghostDip(drag.part, insideKit(pt) ? col : null, dipValid(drag.part, col));
      }
    });
    const lenOk = (kind, a, b) => {
      if (kind === 'wire') return true;
      const p = B.holeXY(a), q = B.holeXY(b), d = Math.hypot(p.x - q.x, p.y - q.y);
      return d >= 0.9 && d <= 10.5;
    };
    svg.addEventListener('pointerup', (e) => {
      if (!drag) return;
      const d = drag; drag = null;
      UI.fill(gDrag);
      const pt = toPt(e), hole = pick(pt);
      gParts.querySelectorAll('.dragging').forEach((x) => x.classList.remove('dragging'));
      if (d.type === 'select' || (!d.moved && d.type !== 'line')) { select(d.part); return; }
      if (d.type === 'line') {
        if (!d.moved && d.under) { select(d.under); return; }
        if (!d.moved || !hole || hole === d.from || !free(hole) || !lenOk(d.kind, d.from, hole)) return;
        if (d.kind === 'wire') opts.onAdd({ kind: 'wire', h1: d.from, h2: hole, color: autoColor(d.from, hole) });
        else opts.onAdd(Object.assign({}, opts.armed(), { h1: d.from, h2: hole }));
      } else if (d.type === 'end') {
        const other = d.part[d.end === 'h1' ? 'h2' : 'h1'];
        if (!hole || hole === other || !free(hole, d.part) || !lenOk(d.part.kind, other, hole)) return;
        opts.onModify(d.part.id, { [d.end]: hole });
      } else if (d.type === 'dip') {
        if (!insideKit(pt)) { opts.onRemove(d.part.id); return; }
        const col = dipCol(pt, d.grab);
        if (col !== d.part.col && dipValid(d.part, col)) opts.onModify(d.part.id, { col });
        else if (col !== d.part.col) UI.toast('That spot is taken — chips must straddle the centre channel on free holes.', 'warn');
      }
    });
    svg.addEventListener('pointerleave', () => { if (!drag) { hoverHole = null; showNode(null); hoverInfo(null); } });
    svg.addEventListener('contextmenu', (e) => { const p = partOf(e.target); if (p && !ro()) { e.preventDefault(); opts.onRemove(p.id); } });
    svg.addEventListener('dblclick', (e) => { const p = partOf(e.target); if (p && !ro() && p.kind === 'wire') opts.onRemove(p.id); });
    const autoColor = (a, b) => {
      const t = [a, b].map((h) => B.parseHole(h));
      if (t.some((q) => q.term === 'VCC' || (q.rail && q.rail[1] === '+'))) return 'red';
      if (t.some((q) => q.term === 'GND' || (q.rail && q.rail[1] === '-'))) return 'black';
      return opts.wireColor();
    };
    function select(p) { selected = p ? p.id : null; view.render(); opts.onSelect(p || null); }
    view.select = select;
    view.selected = () => selected && build().parts.find((p) => p.id === selected);
    view.clearSelection = () => { selected = null; };

    /* ---- drag a new chip / display from the parts bin ---- */
    view.dragNew = (proto, e, remarkHtml) => {
      if (ro()) return;
      const n = B.partNpins(proto);
      const grab = (n / 2 - 1) / 2;
      const move = (ev) => {
        if (remarkHtml) UI.tip(`<div class="tip-remark">${remarkHtml}</div>`, ev.clientX, ev.clientY);
        const pt = toPt(ev);
        const r = svg.getBoundingClientRect();
        const over = ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom;
        if (!over || !insideKit(pt)) { ghostDip(proto, null); return; }
        const col = dipCol(pt, grab);
        ghostDip(proto, col, dipValid(proto, col));
      };
      const up = (ev) => {
        window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up);
        UI.fill(gDrag); UI.tip(null);
        const pt = toPt(ev);
        const r = svg.getBoundingClientRect();
        if (ev.clientX < r.left || ev.clientX > r.right || ev.clientY < r.top || ev.clientY > r.bottom || !insideKit(pt)) return;
        const col = dipCol(pt, grab);
        if (dipValid(proto, col)) opts.onAdd(Object.assign({}, proto, { col, rot: 0 }));
        else UI.toast('Drop the chip across the centre channel, on free holes.', 'warn');
      };
      window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
      move(e);
    };
    // pulse animation for the button
    view.pressPulse = () => { pbtn.classList.add('pressed'); setTimeout(() => pbtn.classList.remove('pressed'), 160); };
    return view;
  };
})();
