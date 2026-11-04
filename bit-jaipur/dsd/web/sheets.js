/* ============================================================
 * sheets.js — schematic sheets for every experiment part, in the
 * style of Better ALUU's full-circuit sheet: framed drawing with
 * zones and a title block, IEEE gate symbols with the IC pin
 * number on every stub, junction dots, live logic levels.
 * Also: DIP pinout drawings for the "IC pinouts" tab.
 *
 * Net names are reference-build endpoints ('IN1', 'IC3.3', ...),
 * so the sheet can colour every wire from the live simulation.
 * ============================================================ */
(function () {
  'use strict';
  const DSD = window.DSD, UI = DSD.UI;
  const { s } = UI;
  const SW = 1000, SH = 660;

  function Sheet() {
    const els = [], wires = [];
    const api = { els, wires };
    const L = (cls, d, net) => els.push({ k: 'path', d, cls, net });
    const T = (x, y, str, cls, anchor) => els.push({ k: 'text', x, y, str, cls, anchor });
    api.text = T;
    api.wire = (net, pts) => wires.push({ net, pts });
    api.route = (net, a, b, mx) => {
      if (Math.abs(a.y - b.y) < 0.01) return api.wire(net, [[a.x, a.y], [b.x, b.y]]);
      mx = mx == null ? (a.x + b.x) / 2 : mx;
      api.wire(net, [[a.x, a.y], [mx, a.y], [mx, b.y], [b.x, b.y]]);
    };
    // gate: centre (cx, cy); pins = [in..., out]; nets = [in..., out]
    api.gate = (type, cx, cy, o) => {
      const one = type === 'NOT' || type === 'BUF';
      const n = one ? 1 : 2, bw = one ? 34 : 48, H = one ? 30 : 36;
      const x0 = cx - bw / 2, y0 = cy - H / 2, x1 = cx + bw / 2;
      const inv = ['NAND', 'NOR', 'XNOR', 'NOT'].includes(type);
      const curved = ['OR', 'NOR', 'XOR', 'XNOR'].includes(type);
      let body;
      if (one) body = `M${x0} ${y0} L${x1} ${cy} L${x0} ${y0 + H} Z`;
      else if (!curved) body = `M${x0} ${y0} H${x1 - H / 2} A${H / 2} ${H / 2} 0 0 1 ${x1 - H / 2} ${y0 + H} H${x0} Z`;
      else body = `M${x0} ${y0} Q${x0 + bw * 0.6} ${y0} ${x1} ${cy} Q${x0 + bw * 0.6} ${y0 + H} ${x0} ${y0 + H} Q${x0 + bw * 0.24} ${cy} ${x0} ${y0} Z`;
      els.push({ k: 'gate', d: body, chip: o.chip });
      if (type === 'XOR' || type === 'XNOR') L('sym', `M${x0 - 6} ${y0} Q${x0 + bw * 0.24 - 6} ${cy} ${x0 - 6} ${y0 + H}`);
      const xo = x1 + (inv ? 8 : 0);
      if (inv) els.push({ k: 'bubble', cx: x1 + 4, cy, r: 4 });
      const ys = one ? [cy] : [cy - 10, cy + 10];
      const ins = ys.map((y, i) => {
        const t = one ? 0 : (y - y0) / H, depth = curved ? 2 * t * (1 - t) * 0.24 * bw * 2 - (type === 'XOR' || type === 'XNOR' ? 6 : 0) : 0;
        L('stub', `M${x0 - 22} ${y}H${x0 + depth}`, o.nets && o.nets[i]);
        T(x0 - 20, y - 3, o.pins[i], 'pinno');
        return { x: x0 - 22, y };
      });
      L('stub', `M${xo} ${cy}H${xo + 22}`, o.nets && o.nets[n]);
      T(xo + 20, cy - 3, o.pins[n], 'pinno', 'end');
      T(cx - (one ? 4 : 0), y0 - 5, o.label, 'gref', 'middle');
      return { in: ins, out: { x: xo + 22, y: cy } };
    };
    // logic input flag (trainer switch / pulser): output point at (x, y)
    api.input = (name, src, x, y) => {
      els.push({ k: 'flag', x, y, name, src });
      return { x, y };
    };
    // trainer LED: input point at (x, y)
    api.led = (name, fn, x, y, net) => {
      L('stub', `M${x} ${y}H${x + 12}`, net);
      els.push({ k: 'led', x: x + 12, y, name, fn, net });
      return { x, y };
    };
    api.probe = (name, x, y, net) => {
      L('stub', `M${x} ${y}H${x + 14}`, net);
      els.push({ k: 'probe', x: x + 14, y, name, net });
    };
    api.vcc = (x, y, up) => els.push({ k: 'vcc', x, y, up: up !== false });
    api.gnd = (x, y) => els.push({ k: 'gnd', x, y });
    api.junction = (x, y, net) => els.push({ k: 'dot', x, y, net });
    // IC block. sides: {left:[pin...], right:[...], top:[...], bottom:[...]} placed evenly
    api.block = (type, ref, x, y, w, hgt, sides, nets) => {
      const def = DSD.LIB[type];
      const pins = {};
      els.push({ k: 'block', x, y, w, h: hgt, ref, type: def.chipText });
      const bub = def.activeLow || [];
      const place = (list, side) => {
        if (!list) return;
        list.forEach((pin, i) => {
          if (pin == null) return;
          const name = def.short ? def.short[pin - 1] : def.pins[pin - 1];
          const net = nets && nets[pin];
          const horiz = side === 'left' || side === 'right';
          const span = horiz ? hgt : w, step = span / (list.length + 1);
          const pos = (horiz ? y : x) + step * (i + 1);
          const inv = bub.includes(pin);
          if (side === 'left') { L('stub', `M${x - 28} ${pos}H${x - (inv ? 8 : 0)}`, net); if (inv) els.push({ k: 'bubble', cx: x - 4, cy: pos, r: 4 }); T(x - 25, pos - 3, pin, 'pinno'); T(x + 5, pos + 3.5, name, 'pinname'); pins[pin] = { x: x - 28, y: pos }; }
          if (side === 'right') { L('stub', `M${x + w + (inv ? 8 : 0)} ${pos}H${x + w + 28}`, net); if (inv) els.push({ k: 'bubble', cx: x + w + 4, cy: pos, r: 4 }); T(x + w + 25, pos - 3, pin, 'pinno', 'end'); T(x + w - 5, pos + 3.5, name, 'pinname', 'end'); pins[pin] = { x: x + w + 28, y: pos }; }
          if (side === 'top') { L('stub', `M${pos} ${y - 26}V${y - (inv ? 8 : 0)}`, net); if (inv) els.push({ k: 'bubble', cx: pos, cy: y - 4, r: 4 }); T(pos + 3, y - 14, pin, 'pinno'); T(pos, y + 13, name, 'pinname', 'middle'); pins[pin] = { x: pos, y: y - 26 }; }
          if (side === 'bottom') { L('stub', `M${pos} ${y + hgt + (inv ? 8 : 0)}V${y + hgt + 26}`, net); if (inv) els.push({ k: 'bubble', cx: pos, cy: y + hgt + 4, r: 4 }); T(pos + 3, y + hgt + 20, pin, 'pinno'); T(pos, y + hgt - 6, name, 'pinname', 'middle'); pins[pin] = { x: pos, y: y + hgt + 26 }; }
        });
      };
      place(sides.left, 'left'); place(sides.right, 'right'); place(sides.top, 'top'); place(sides.bottom, 'bottom');
      return pins;
    };
    api.res = (net1, x1, y1, x2, y2, label) => {
      const vert = Math.abs(x1 - x2) < 0.01, len = vert ? y2 - y1 : x2 - x1, n = 6, k = (len - 20) / n;
      let d = vert ? `M${x1} ${y1}v10` : `M${x1} ${y1}h10`;
      for (let i = 0; i < n; i++) d += vert ? ` l${i % 2 ? -6 : 6} ${k / 2} l${i % 2 ? 6 : -6} ${k / 2}` : ` l${k / 2} ${i % 2 ? 6 : -6} l${k / 2} ${i % 2 ? -6 : 6}`;
      d += vert ? 'v10' : 'h10';
      L('sym', d, net1);
      T(vert ? x1 + 10 : (x1 + x2) / 2, vert ? (y1 + y2) / 2 + 4 : y1 - 10, label, 'partlabel', vert ? 'start' : 'middle');
    };
    api.cap = (x, y1, y2, label) => {
      const m = (y1 + y2) / 2;
      L('sym', `M${x} ${y1}V${m - 3}M${x - 11} ${m - 3}H${x + 11}M${x - 11} ${m + 3}H${x + 11}M${x} ${m + 3}V${y2}`);
      T(x + 15, m + 4, label, 'partlabel');
    };
    // MOSFET, vertical: pins g (left), top, bot; P has the bubble
    api.mos = (type, x, y, name, pins, nets) => {
      const p = type === 'P';
      L('sym', `M${x} ${y - 16}V${y - 7}M${x} ${y - 4}V${y + 4}M${x} ${y + 7}V${y + 16}`);
      L('sym', `M${x - 7} ${y - 14}V${y + 14}`);
      L('sym', `M${x} ${y - 12}H${x + 14}V${y - 34}M${x} ${y + 12}H${x + 14}V${y + 34}M${x} ${y}H${x + 14}${p ? '' : ''}`);
      els.push({ k: 'arrow', x: x + (p ? 9 : 4), y, dir: p ? 1 : -1 });
      if (p) els.push({ k: 'bubble', cx: x - 11, cy: y, r: 4 });
      L('stub', `M${x - 36} ${y}H${x - (p ? 15 : 7)}`, nets && nets.g);
      T(x - 34, y - 4, pins.g, 'pinno');
      T(x + 18, y - 26, pins.top, 'pinno'); T(x + 18, y + 32, pins.bot, 'pinno');
      T(x + 20, y + 4, name, 'gref');
      return { g: { x: x - 36, y }, top: { x: x + 14, y: y - 34 }, bot: { x: x + 14, y: y + 34 } };
    };
    api.seg7 = (x, y, pinMap, nets) => {
      els.push({ k: 'seg7', x, y });
      const pins = {};
      ['a', 'b', 'c', 'd', 'e', 'f', 'g'].forEach((sg, i) => {
        const py = y + 24 + i * 28, pin = pinMap[sg];
        L('stub', `M${x - 26} ${py}H${x}`, nets && nets[sg]); T(x - 23, py - 3, pin, 'pinno'); T(x + 6, py + 3.5, sg, 'pinname');
        pins[sg] = { x: x - 26, y: py };
      });
      L('stub', `M${x + 60} ${y + 230}V${y + 254}`); T(x + 64, y + 246, '3, 8', 'pinno'); T(x + 60, y + 224, 'COM', 'pinname', 'middle');
      pins.com = { x: x + 60, y: y + 254 };
      return pins;
    };
    api.legend = (lines, x, y) => els.push({ k: 'legend', x, y, lines });
    api.note = (str, x, y) => T(x, y, str, 'note');
    return api;
  }

  /* ---------- rendering ---------- */
  function render(sheet, meta, lv) {
    const g = s('g');
    // frame
    const fr = s('g', { class: 'sch-frame' });
    fr.append(s('rect', { x: 8, y: 8, width: SW - 16, height: SH - 16, class: 'fs-frame' }), s('rect', { x: 26, y: 26, width: SW - 52, height: SH - 52, class: 'fs-frame inner' }));
    for (let i = 0; i < 8; i++) {
      const x0 = 8 + ((SW - 16) / 8) * i, xm = x0 + (SW - 16) / 16;
      if (i) fr.appendChild(s('path', { d: `M${x0} 8v18M${x0} ${SH - 8}v-18`, class: 'fs-tick' }));
      [21, SH - 13].forEach((y) => fr.appendChild(s('text', { x: xm, y, class: 'fs-zone' }, i + 1)));
    }
    for (let j = 0; j < 6; j++) {
      const y0 = 8 + ((SH - 16) / 6) * j, ym = y0 + (SH - 16) / 12 + 4;
      if (j) fr.appendChild(s('path', { d: `M8 ${y0}h18M${SW - 8} ${y0}h-18`, class: 'fs-tick' }));
      [17, SW - 17].forEach((x) => fr.appendChild(s('text', { x, y: ym, class: 'fs-zone' }, 'ABCDEF'[j])));
    }
    const tb = s('g', { class: 'sch-title' });
    const tx = SW - 26 - 330, ty = SH - 26 - 64;
    tb.append(s('rect', { x: tx, y: ty, width: 330, height: 64, class: 'tb-box' }),
      s('path', { d: `M${tx} ${ty + 22}h330M${tx} ${ty + 44}h330M${tx + 230} ${ty + 44}v20`, class: 'tb-line' }),
      s('text', { x: tx + 8, y: ty + 15, class: 'tb-org' }, 'BIT Mesra, Off-Campus Jaipur · Digital System Design Lab'),
      s('text', { x: tx + 8, y: ty + 37, class: 'tb-title' }, meta.title),
      s('text', { x: tx + 8, y: ty + 58, class: 'tb-meta' }, meta.sub),
      s('text', { x: tx + 238, y: ty + 58, class: 'tb-meta' }, 'Sheet ' + meta.sheet));
    fr.appendChild(tb);
    g.appendChild(fr);

    const cls = (net) => (net && lv ? lv(net) : '');
    // wires + junctions
    const byNet = {};
    for (const w of sheet.wires) (byNet[w.net] = byNet[w.net] || []).push(w);
    const gw = s('g', { class: 'sch-wires' });
    for (const [net, list] of Object.entries(byNet)) {
      const segs = [];
      let d = '';
      for (const w of list) { for (let i = 1; i < w.pts.length; i++) { segs.push([w.pts[i - 1], w.pts[i]]); d += `M${w.pts[i - 1][0]} ${w.pts[i - 1][1]}L${w.pts[i][0]} ${w.pts[i][1]}`; } }
      gw.appendChild(s('path', { d, class: 'wire ' + cls(net) }));
      const ends = new Map();
      for (const w of list) [w.pts[0], w.pts[w.pts.length - 1]].forEach((p) => { const k = p.join(','); ends.set(k, (ends.get(k) || 0) + 1); });
      for (const sg of segs) sg.forEach((p) => { const k = p.join(','); if (!ends.has(k)) ends.set(k, 0); });
      const dots = new Set();
      for (const w of list) for (const p of [w.pts[0], w.pts[w.pts.length - 1]]) {
        for (const [a, b] of segs) {
          const onH = a[1] === b[1] && p[1] === a[1] && p[0] > Math.min(a[0], b[0]) + 0.01 && p[0] < Math.max(a[0], b[0]) - 0.01;
          const onV = a[0] === b[0] && p[0] === a[0] && p[1] > Math.min(a[1], b[1]) + 0.01 && p[1] < Math.max(a[1], b[1]) - 0.01;
          if (onH || onV) dots.add(p.join(','));
        }
      }
      // corners shared by three or more segment ends
      const cnt = new Map();
      for (const [a, b] of segs) [a, b].forEach((p) => { const k = p.join(','); cnt.set(k, (cnt.get(k) || 0) + 1); });
      for (const [k, n] of cnt) if (n >= 3) dots.add(k);
      for (const k of dots) { const [x, y] = k.split(',').map(Number); gw.appendChild(s('circle', { cx: x, cy: y, r: 3.4, class: 'junction ' + cls(net) })); }
    }
    const ge = s('g', { class: 'sch-els' });
    for (const e of sheet.els) {
      switch (e.k) {
        case 'path': ge.appendChild(s('path', { d: e.d, class: e.cls + ' ' + cls(e.net) })); break;
        case 'text': ge.appendChild(s('text', { x: e.x, y: e.y, class: e.cls, 'text-anchor': e.anchor || 'start' }, e.str)); break;
        case 'gate': ge.appendChild(s('path', { d: e.d, class: 'gate-body' })); break;
        case 'bubble': ge.appendChild(s('circle', { cx: e.cx, cy: e.cy, r: e.r, class: 'gate-body' })); break;
        case 'dot': ge.appendChild(s('circle', { cx: e.x, cy: e.y, r: 3.4, class: 'junction ' + cls(e.net) })); break;
        case 'flag': {
          const { x, y } = e;
          ge.append(s('path', { d: `M${x - 74} ${y - 11}H${x - 14}L${x - 2} ${y}L${x - 14} ${y + 11}H${x - 74}Z`, class: 'flag-body' }),
            s('text', { x: x - 44, y: y + 4, class: 'flag-name', 'text-anchor': 'middle' }, e.name),
            s('text', { x: x - 44, y: y + 23, class: 'flag-src', 'text-anchor': 'middle' }, e.src));
          break;
        }
        case 'led': {
          const { x, y } = e;
          ge.append(s('path', { d: `M${x} ${y - 9}L${x + 15} ${y}L${x} ${y + 9}Z`, class: 'led-sym ' + (lv && lv(e.net) === 'hi' ? 'lit' : '') }),
            s('path', { d: `M${x + 15} ${y - 9}V${y + 9}M${x + 15} ${y}H${x + 26}V${y + 8}M${x + 19} ${y + 8}h14M${x + 22} ${y + 12}h8M${x + 25} ${y + 16}h2`, class: 'sym' }),
            s('path', { d: `M${x + 6} ${y - 11}l6 -8M${x + 11} ${y - 9}l6 -8`, class: 'sym thin' }),
            s('text', { x: x + 38, y: y - 1, class: 'led-name' }, e.name), s('text', { x: x + 38, y: y + 12, class: 'led-fn' }, e.fn));
          break;
        }
        case 'probe': ge.append(s('circle', { cx: e.x + 6, cy: e.y, r: 6, class: 'probe-sym' }), s('text', { x: e.x + 6, y: e.y - 11, class: 'led-name', 'text-anchor': 'middle' }, e.name)); break;
        case 'vcc': ge.append(s('path', { d: e.up ? `M${e.x} ${e.y}V${e.y - 10}M${e.x - 8} ${e.y - 10}H${e.x + 8}` : `M${e.x} ${e.y}H${e.x - 10}M${e.x - 10} ${e.y - 7}V${e.y + 7}`, class: 'sym vcc' }), s('text', { x: e.up ? e.x : e.x - 14, y: e.up ? e.y - 14 : e.y + 4, class: 'vcc-txt', 'text-anchor': e.up ? 'middle' : 'end' }, '+5V')); break;
        case 'gnd': ge.appendChild(s('path', { d: `M${e.x} ${e.y}V${e.y + 8}M${e.x - 8} ${e.y + 8}H${e.x + 8}M${e.x - 5} ${e.y + 12}H${e.x + 5}M${e.x - 2} ${e.y + 16}H${e.x + 2}`, class: 'sym' })); break;
        case 'block': ge.append(s('rect', { x: e.x, y: e.y, width: e.w, height: e.h, rx: 3, class: 'block-body' }),
          s('text', { x: e.x + e.w / 2, y: e.y + e.h / 2 - 4, class: 'block-ref', 'text-anchor': 'middle' }, e.ref),
          s('text', { x: e.x + e.w / 2, y: e.y + e.h / 2 + 11, class: 'block-type', 'text-anchor': 'middle' }, e.type)); break;
        case 'arrow': ge.appendChild(s('path', { d: e.dir > 0 ? `M${e.x - 4} ${e.y - 3.5}L${e.x + 1} ${e.y}L${e.x - 4} ${e.y + 3.5}Z` : `M${e.x + 4} ${e.y - 3.5}L${e.x - 1} ${e.y}L${e.x + 4} ${e.y + 3.5}Z`, class: 'arrowhead' })); break;
        case 'seg7': {
          const gg = s('g', { transform: `translate(${e.x} ${e.y})` });
          gg.append(s('rect', { x: 0, y: 0, width: 120, height: 230, rx: 6, class: 'block-body' }), s('text', { x: 60, y: 18, class: 'block-ref', 'text-anchor': 'middle' }, 'DISP1 (CC)'));
          const sx = 40, sy = 50, w = 50, hh = 120;
          [['a', `M${sx} ${sy}h${w}`], ['b', `M${sx + w} ${sy}v${hh / 2}`], ['c', `M${sx + w} ${sy + hh / 2}v${hh / 2}`], ['d', `M${sx} ${sy + hh}h${w}`], ['e', `M${sx} ${sy + hh / 2}v${hh / 2}`], ['f', `M${sx} ${sy}v${hh / 2}`], ['g', `M${sx} ${sy + hh / 2}h${w}`]]
            .forEach(([k, d]) => { gg.appendChild(s('path', { d, class: 'seg7-sym' })); gg.appendChild(s('text', { x: k === 'a' || k === 'd' || k === 'g' ? sx + w / 2 : k === 'b' || k === 'c' ? sx + w + 8 : sx - 8, y: (k === 'a' ? sy - 4 : k === 'd' ? sy + hh + 12 : k === 'g' ? sy + hh / 2 - 4 : k === 'b' || k === 'f' ? sy + hh / 4 + 4 : sy + 3 * hh / 4 + 4), class: 'pinname', 'text-anchor': 'middle' }, k)); });
          ge.appendChild(gg);
          break;
        }
        case 'legend': {
          const lg = s('g', { class: 'sch-legend' });
          const w = 330, hh = 16 + e.lines.length * 15;
          lg.append(s('rect', { x: e.x, y: e.y, width: w, height: hh, rx: 4, class: 'legend-box' }), s('text', { x: e.x + 8, y: e.y + 13, class: 'legend-head' }, 'POWER  (every IC)'));
          e.lines.forEach((l, i) => lg.appendChild(s('text', { x: e.x + 8, y: e.y + 28 + i * 15, class: 'legend-line' }, l)));
          ge.appendChild(lg);
          break;
        }
        default:
      }
    }
    g.append(gw, ge);
    return g;
  }
  const pw = (ref, type) => { const d = DSD.LIB[type]; return `${ref}  ${d.chipText} ${d.title.toLowerCase()} — pin ${d.vcc} → +5V, pin ${d.gnd} → GND`; };

  /* ================= the sheets ================= */
  const SHEETS = {};

  // one gate, two (or one) switches, one LED
  const gateSheet = (type, chip, pins, fn) => (S) => {
    const one = type === 'NOT';
    const g = S.gate(type, 520, 300, { pins, label: 'IC1A', nets: one ? ['IN0', 'IC1.2'] : ['IN1', 'IN0', 'IC1.3'] });
    if (one) { const a = S.input('A', 'S0', 330, 300); S.wire('IN0', [[a.x, 300], [g.in[0].x, 300]]); }
    else {
      const a = S.input('A', 'S1', 330, 250), b = S.input('B', 'S0', 330, 350);
      S.route('IN1', a, g.in[0], 420); S.route('IN0', b, g.in[1], 420);
    }
    const out = one ? 'IC1.2' : 'IC1.3';
    S.wire(out, [[g.out.x, 300], [700, 300]]); S.led('L0', fn, 700, 300, out);
    S.legend([pw('IC1', chip)], 40, 535);
  };
  SHEETS['gates/not'] = gateSheet('NOT', '7404', [1, 2], 'Y = A′');
  SHEETS['gates/or'] = gateSheet('OR', '7432', [1, 2, 3], 'Y = A + B');
  SHEETS['gates/xor'] = gateSheet('XOR', '7486', [1, 2, 3], 'Y = A ⊕ B');

  SHEETS['half/ha'] = (S) => {
    const A = S.input('A', 'S1', 150, 150), B_ = S.input('B', 'S0', 150, 200);
    S.wire('IN1', [[A.x, 150], [260, 150], [260, 360]]);
    S.wire('IN0', [[B_.x, 200], [300, 200], [300, 380]]);
    const s1 = S.gate('XOR', 520, 250, { pins: [1, 2, 3], label: 'IC1A', nets: ['IN1', 'IN0', 'IC1.3'] });
    const c1 = S.gate('AND', 520, 370, { pins: [1, 2, 3], label: 'IC2A', nets: ['IN1', 'IN0', 'IC2.3'] });
    [s1, c1].forEach((g) => { S.wire('IN1', [[260, g.in[0].y], [g.in[0].x, g.in[0].y]]); S.wire('IN0', [[300, g.in[1].y], [g.in[1].x, g.in[1].y]]); });
    S.led('L0', 'Sum S = A ⊕ B', 720, 250, 'IC1.3'); S.wire('IC1.3', [[s1.out.x, 250], [720, 250]]);
    S.led('L1', 'Carry C = A·B', 720, 370, 'IC2.3'); S.wire('IC2.3', [[c1.out.x, 370], [720, 370]]);
    S.legend([pw('IC1', '7486'), pw('IC2', '7408')], 40, 535);
  };
  SHEETS['half/hs'] = (S) => {
    const A = S.input('A', 'S1', 150, 150), B_ = S.input('B', 'S0', 150, 200);
    S.wire('IN1', [[A.x, 150], [260, 150], [260, 370]]);
    S.wire('IN0', [[B_.x, 200], [300, 200], [300, 400]]);
    const d1 = S.gate('XOR', 520, 250, { pins: [1, 2, 3], label: 'IC3A', nets: ['IN1', 'IN0', 'IC3.3'] });
    const nA = S.gate('NOT', 420, 370, { pins: [1, 2], label: 'IC1A', nets: ['IN1', 'IC1.2'] });
    const b1 = S.gate('AND', 600, 390, { pins: [1, 2, 3], label: 'IC2A', nets: ['IC1.2', 'IN0', 'IC2.3'] });
    S.wire('IN1', [[260, d1.in[0].y], [d1.in[0].x, d1.in[0].y]]); S.wire('IN0', [[300, d1.in[1].y], [d1.in[1].x, d1.in[1].y]]);
    S.wire('IN1', [[260, 370], [nA.in[0].x, 370]]);
    S.route('IC1.2', nA.out, b1.in[0], 510);
    S.wire('IN0', [[300, 400], [b1.in[1].x, 400]]);
    S.led('L0', 'Difference D = A ⊕ B', 740, 250, 'IC3.3'); S.wire('IC3.3', [[d1.out.x, 250], [740, 250]]);
    S.led('L1', 'Borrow Bo = A′·B', 740, 390, 'IC2.3'); S.wire('IC2.3', [[b1.out.x, 390], [740, 390]]);
    S.legend([pw('IC1', '7404'), pw('IC2', '7408'), pw('IC3', '7486')], 40, 520);
  };

  SHEETS['full/fa'] = (S) => {
    const A = S.input('A', 'S2', 130, 150), B_ = S.input('B', 'S1', 130, 190), C = S.input('Cin', 'S0', 130, 230);
    S.wire('IN2', [[A.x, 150], [190, 150], [190, 300]]);
    S.wire('IN1', [[B_.x, 190], [225, 190], [225, 320]]);
    S.wire('IN0', [[C.x, 230], [260, 230], [260, 365]]);
    const x1 = S.gate('XOR', 380, 210, { pins: [1, 2, 3], label: 'IC1A', nets: ['IN2', 'IN1', 'IC1.3'] });
    const x2 = S.gate('XOR', 580, 230, { pins: [4, 5, 6], label: 'IC1B', nets: ['IC1.3', 'IN0', 'IC1.6'] });
    const a1 = S.gate('AND', 380, 310, { pins: [1, 2, 3], label: 'IC2A', nets: ['IN2', 'IN1', 'IC2.3'] });
    const a2 = S.gate('AND', 580, 355, { pins: [4, 5, 6], label: 'IC2B', nets: ['IC1.3', 'IN0', 'IC2.6'] });
    const o1 = S.gate('OR', 750, 325, { pins: [1, 2, 3], label: 'IC3A', nets: ['IC2.3', 'IC2.6', 'IC3.3'] });
    S.wire('IN2', [[190, 200], [x1.in[0].x, 200]]); S.wire('IN1', [[225, 220], [x1.in[1].x, 220]]);
    S.wire('IN2', [[190, 300], [a1.in[0].x, 300]]); S.wire('IN1', [[225, 320], [a1.in[1].x, 320]]);
    S.wire('IC1.3', [[x1.out.x, 210], [500, 210], [500, 345], [a2.in[0].x, 345]]); S.wire('IC1.3', [[500, 220], [x2.in[0].x, 220]]);
    S.wire('IN0', [[260, 240], [x2.in[1].x, 240]]); S.wire('IN0', [[260, 365], [a2.in[1].x, 365]]);
    S.route('IC2.3', a1.out, o1.in[0], 660); S.route('IC2.6', a2.out, o1.in[1], 675);
    S.led('L0', 'Sum S = A⊕B⊕Cin', 830, 230, 'IC1.6'); S.wire('IC1.6', [[x2.out.x, 230], [830, 230]]);
    S.led('L1', 'Carry Cout', 830, 325, 'IC3.3'); S.wire('IC3.3', [[o1.out.x, 325], [830, 325]]);
    S.note('Cout = A·B + Cin·(A⊕B)', 40, 470);
    S.legend([pw('IC1', '7486'), pw('IC2', '7408'), pw('IC3', '7432')], 40, 520);
  };
  SHEETS['full/fs'] = (S) => {
    const A = S.input('A', 'S2', 130, 110), B_ = S.input('B', 'S1', 130, 150), C = S.input('Bin', 'S0', 130, 190);
    S.wire('IN2', [[A.x, 110], [190, 110], [190, 260]]);
    S.wire('IN1', [[B_.x, 150], [225, 150], [225, 285]]);
    S.wire('IN0', [[C.x, 190], [260, 190], [260, 360]]);
    const x3 = S.gate('XOR', 380, 170, { pins: [1, 2, 3], label: 'IC3A', nets: ['IN2', 'IN1', 'IC3.3'] });
    const x4 = S.gate('XOR', 580, 190, { pins: [4, 5, 6], label: 'IC3B', nets: ['IC3.3', 'IN0', 'IC3.6'] });
    const n1 = S.gate('NOT', 350, 260, { pins: [1, 2], label: 'IC1A', nets: ['IN2', 'IC1.2'] });
    const a3 = S.gate('AND', 580, 275, { pins: [1, 2, 3], label: 'IC2A', nets: ['IC1.2', 'IN1', 'IC2.3'] });
    const n2 = S.gate('NOT', 580, 340, { pins: [3, 4], label: 'IC1B', nets: ['IC3.3', 'IC1.4'] });
    const a4 = S.gate('AND', 710, 350, { pins: [4, 5, 6], label: 'IC2B', nets: ['IC1.4', 'IN0', 'IC2.6'] });
    const o2 = S.gate('OR', 830, 310, { pins: [1, 2, 3], label: 'IC4A', nets: ['IC2.3', 'IC2.6', 'IC4.3'] });
    S.wire('IN2', [[190, 160], [x3.in[0].x, 160]]); S.wire('IN1', [[225, 180], [x3.in[1].x, 180]]);
    S.wire('IC3.3', [[x3.out.x, 170], [490, 170], [490, 340], [n2.in[0].x, 340]]); S.wire('IC3.3', [[490, 180], [x4.in[0].x, 180]]);
    S.wire('IN0', [[260, 200], [x4.in[1].x, 200]]);
    S.wire('IN2', [[190, 260], [n1.in[0].x, 260]]);
    S.route('IC1.2', n1.out, a3.in[0], 470);
    S.wire('IN1', [[225, 285], [a3.in[1].x, 285]]);
    S.wire('IC1.4', [[n2.out.x, 340], [a4.in[0].x, 340]]);
    S.wire('IN0', [[260, 360], [a4.in[1].x, 360]]);
    S.route('IC2.3', a3.out, o2.in[0], 760); S.route('IC2.6', a4.out, o2.in[1], 775);
    S.led('L0', 'Difference D', 865, 190, 'IC3.6'); S.wire('IC3.6', [[x4.out.x, 190], [865, 190]]);
    S.wire('IC4.3', [[o2.out.x, 310], [865, 310]]); S.led('L1', 'Borrow Bout', 865, 310, 'IC4.3');
    S.note('Bout = A′B + (A⊕B)′·Bin  (= A′B + B·Bin + Bin·A′)', 40, 455);
    S.legend([pw('IC1', '7404'), pw('IC2', '7408'), pw('IC3', '7486'), pw('IC4', '7432')], 40, 505);
  };

  SHEETS['seg7/seg7'] = (S) => {
    const ins = [['D', 'S3', 6, 'IN3'], ['C', 'S2', 2, 'IN2'], ['B', 'S1', 1, 'IN1'], ['A', 'S0', 7, 'IN0']];
    const nets = { 6: 'IN3', 2: 'IN2', 1: 'IN1', 7: 'IN0', 13: 'IC1.13', 12: 'IC1.12', 11: 'IC1.11', 10: 'IC1.10', 9: 'IC1.9', 15: 'IC1.15', 14: 'IC1.14' };
    const p = S.block('7447', 'IC1', 230, 90, 120, 330, { left: [6, 2, 1, 7, null, 3, 4, 5], right: [13, 12, 11, 10, 9, 15, 14] }, nets);
    ins.forEach(([n, src, pin, net], i) => { const f = S.input(n, src, 130, p[pin].y); S.wire(net, [[f.x, f.y], [p[pin].x, p[pin].y]]); void i; });
    [3, 4, 5].forEach((pin) => { S.wire('VCC', [[p[pin].x, p[pin].y], [180, p[pin].y]]); S.vcc(180, p[pin].y, false); });
    const segs = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    const out = { a: 13, b: 12, c: 11, d: 10, e: 9, f: 15, g: 14 };
    const inv = { a: ['IC2', 1, 2, 'A'], b: ['IC2', 3, 4, 'B'], c: ['IC2', 5, 6, 'C'], d: ['IC2', 9, 8, 'D'], e: ['IC2', 11, 10, 'E'], f: ['IC2', 13, 12, 'F'], g: ['IC3', 1, 2, 'A'] };
    const d7 = S.seg7(760, 90, { a: 7, b: 6, c: 4, d: 2, e: 1, f: 9, g: 10 }, Object.fromEntries(segs.map((sg, i) => [sg, 'R' + (i + 1) + '.2'])));
    segs.forEach((sg, i) => {
      const [ic, a, y, letter] = inv[sg], py = p[out[sg]].y;
      const g = S.gate('NOT', 470, py, { pins: [a, y], label: ic + letter, nets: ['IC1.' + out[sg], `${ic}.${y}`] });
      S.wire('IC1.' + out[sg], [[p[out[sg]].x, py], [g.in[0].x, py]]);
      S.wire(`${ic}.${y}`, [[g.out.x, py], [560, py]]);
      S.res(`${ic}.${y}`, 560, py, 640, py, `R${i + 1} 330Ω`);
      S.route('R' + (i + 1) + '.2', { x: 640, y: py }, d7[sg], 664 + i * 6); // tracks ordered so no two routes cross
    });
    S.wire('GND', [[d7.com.x, d7.com.y], [d7.com.x, d7.com.y + 6]]); S.gnd(d7.com.x, d7.com.y + 6);
    S.note('LT′, BI′/RBO′, RBI′ tied HIGH: normal decoding', 40, 470);
    S.note('7447 outputs are active-LOW (open collector); each 7404 makes them active-HIGH for the CC display.', 40, 488);
    S.legend([pw('IC1', '7447'), pw('IC2', '7404'), pw('IC3', '7404')], 40, 520);
  };

  function graySheet(S, ox, ins, outs, icRef, cascade) {
    {
      const bx = [ox + 150, ox + 180, ox + 210, ox + 240];
      ins.forEach(([n, src, net], i) => { const f = S.input(n, src, ox + 110, 100 + i * 40); S.wire(net, [[f.x, f.y], [bx[i], f.y], [bx[i], (cascade ? [260, 280, 370, 460] : [260, 350, 440, 460])[i]]]); }); // each bus stops at its last tap
      S.wire(ins[0][2], [[bx[0], 100], [ox + 400, 100]]); S.led(outs[0][0], outs[0][1], ox + 400, 100, ins[0][2]);
      const pins = [[1, 2, 3], [4, 5, 6], [9, 10, 8]];
      let prev = null;
      [270, 360, 450].forEach((y, k) => {
        const outNet = `${icRef}.${pins[k][2]}`;
        const aNet = cascade && k > 0 ? prev : ins[k][2];
        const g = S.gate('XOR', ox + 330, y, { pins: pins[k], label: icRef + 'ABC'[k], nets: [aNet, ins[k + 1][2], outNet] });
        if (cascade && k > 0) S.wire(prev, [[ox + 365, y - 45], [ox + 265, y - 45], [ox + 265, g.in[0].y], [g.in[0].x, g.in[0].y]]);
        else S.wire(ins[k][2], [[bx[k], g.in[0].y], [g.in[0].x, g.in[0].y]]);
        if (cascade && k === 0) S.wire(ins[0][2], [[bx[0], g.in[0].y], [g.in[0].x, g.in[0].y]]);
        S.wire(ins[k + 1][2], [[bx[k + 1], g.in[1].y], [g.in[1].x, g.in[1].y]]);
        S.wire(outNet, [[g.out.x, y], [ox + 400, y]]);
        if (cascade && k < 2) S.wire(outNet, [[ox + 365, y], [ox + 365, y + 45]]);
        S.led(outs[k + 1][0], outs[k + 1][1], ox + 400, y, outNet);
        prev = outNet;
      });
    }
  }
  SHEETS['gray/b2g'] = (S) => {
    graySheet(S, 190, [['B3', 'S3', 'IN3'], ['B2', 'S2', 'IN2'], ['B1', 'S1', 'IN1'], ['B0', 'S0', 'IN0']], [['L3', 'G3 = B3'], ['L2', 'G2 = B3\u2295B2'], ['L1', 'G1 = B2\u2295B1'], ['L0', 'G0 = B1\u2295B0']], 'IC1', false);
    S.legend([pw('IC1', '7486')], 40, 535);
  };
  SHEETS['gray/g2b'] = (S) => {
    graySheet(S, 190, [['G3', 'S3', 'IN3'], ['G2', 'S2', 'IN2'], ['G1', 'S1', 'IN1'], ['G0', 'S0', 'IN0']], [['L3', 'B3 = G3'], ['L2', 'B2 = B3\u2295G2'], ['L1', 'B1 = B2\u2295G1'], ['L0', 'B0 = B1\u2295G0']], 'IC1', true);
    S.note('Cascaded: each XOR takes the binary bit just produced above it.', 40, 500);
    S.legend([pw('IC1', '7486')], 40, 535);
  };
  function latch(S, x, sNet, rNet, sPin, rPin) {
    const n1 = S.gate('NAND', x, 170, { pins: [1, 2, 3], label: 'IC1A', nets: [sNet, 'IC1.6', 'IC1.3'] });
    const n2 = S.gate('NAND', x, 310, { pins: [5, 4, 6], label: 'IC1B', nets: ['IC1.3', rNet, 'IC1.6'] });
    S.wire('IC1.3', [[n1.out.x, 170], [x + 260, 170]]);
    S.wire('IC1.3', [[x + 90, 170], [x + 90, 235], [x - 70, 235], [x - 70, n2.in[0].y], [n2.in[0].x, n2.in[0].y]]);
    S.wire('IC1.6', [[n2.out.x, 310], [x + 260, 310]]);
    S.wire('IC1.6', [[x + 110, 310], [x + 110, 250], [x - 90, 250], [x - 90, n1.in[1].y], [n1.in[1].x, n1.in[1].y]]);
    S.led('L1', 'Q', x + 260, 170, 'IC1.3'); S.led('L0', 'Q′', x + 260, 310, 'IC1.6');
    void sPin; void rPin;
    return { s: n1.in[0], r: n2.in[1] };
  }
  SHEETS['ff/srlatch'] = (S) => {
    const l = latch(S, 420, 'IN1', 'IN0');
    const sp = S.input('S′', 'S1', 180, l.s.y), rp = S.input('R′', 'S0', 180, l.r.y);
    S.wire('IN1', [[sp.x, sp.y], [l.s.x, l.s.y]]); S.wire('IN0', [[rp.x, rp.y], [l.r.x, l.r.y]]);
    S.note('S′ and R′ are active-LOW. 11 = hold, 01 = set, 10 = reset, 00 = invalid (Q = Q′ = 1).', 40, 470);
    S.legend([pw('IC1', '7400')], 40, 535);
  };
  SHEETS['ff/srff'] = (S) => {
    const l = latch(S, 540, 'IC1.8', 'IC1.11');
    const g3 = S.gate('NAND', 290, 160, { pins: [9, 10, 8], label: 'IC1C', nets: ['IN1', 'PLS', 'IC1.8'] });
    const g4 = S.gate('NAND', 290, 320, { pins: [13, 12, 11], label: 'IC1D', nets: ['PLS', 'IN0', 'IC1.11'] });
    S.route('IC1.8', g3.out, l.s, 400); S.route('IC1.11', g4.out, l.r, 400);
    const si = S.input('S', 'S1', 150, g3.in[0].y), ck = S.input('CLK', 'P (pulser)', 150, 240), ri = S.input('R', 'S0', 150, g4.in[1].y);
    S.wire('IN1', [[si.x, si.y], [g3.in[0].x, si.y]]); S.wire('IN0', [[ri.x, ri.y], [g4.in[1].x, ri.y]]);
    S.wire('PLS', [[ck.x, 240], [200, 240]]); S.wire('PLS', [[200, g3.in[1].y], [200, g4.in[0].y]]);
    S.wire('PLS', [[200, g3.in[1].y], [g3.in[1].x, g3.in[1].y]]); S.wire('PLS', [[200, g4.in[0].y], [g4.in[0].x, g4.in[0].y]]);
    S.note('Clocked input gates IC1C/IC1D pass S and R to the latch only while CLK = 1.', 40, 470);
    S.legend([pw('IC1', '7400')], 40, 535);
  };
  SHEETS['ff/jkff'] = (S) => {
    const l = latch(S, 600, 'IC1.8', 'IC1.11');
    const g3 = S.gate('NAND', 420, 160, { pins: [9, 10, 8], label: 'IC1C', nets: ['IC2.3', 'PLS', 'IC1.8'] });
    const g4 = S.gate('NAND', 420, 320, { pins: [13, 12, 11], label: 'IC1D', nets: ['PLS', 'IC2.6', 'IC1.11'] });
    S.route('IC1.8', g3.out, l.s, 515); S.route('IC1.11', g4.out, l.r, 515);
    const a1 = S.gate('AND', 270, 150, { pins: [1, 2, 3], label: 'IC2A', nets: ['IN1', 'IC1.6', 'IC2.3'] });
    const a2 = S.gate('AND', 270, 330, { pins: [5, 4, 6], label: 'IC2B', nets: ['IC1.3', 'IN0', 'IC2.6'] });
    S.route('IC2.3', a1.out, g3.in[0], 340); S.route('IC2.6', a2.out, g4.in[1], 340);
    const ji = S.input('J', 'S1', 130, a1.in[0].y), ki = S.input('K', 'S0', 130, a2.in[1].y), ck = S.input('CLK', 'P (pulser)', 130, 240);
    S.wire('IN1', [[ji.x, ji.y], [a1.in[0].x, ji.y]]); S.wire('IN0', [[ki.x, ki.y], [a2.in[1].x, ki.y]]);
    S.wire('PLS', [[ck.x, 240], [365, 240]]); S.wire('PLS', [[365, g3.in[1].y], [365, g4.in[0].y]]);
    S.wire('PLS', [[365, g3.in[1].y], [g3.in[1].x, g3.in[1].y]]); S.wire('PLS', [[365, g4.in[0].y], [g4.in[0].x, g4.in[0].y]]);
    // feedback Q -> AND2 pin 5, Q' -> AND1 pin 2
    S.wire('IC1.3', [[530, 235], [530, 205], [205, 205], [205, a2.in[0].y], [a2.in[0].x, a2.in[0].y]]);
    S.wire('IC1.6', [[510, 250], [510, 275], [190, 275], [190, a1.in[1].y], [a1.in[1].x, a1.in[1].y]]);
    S.note('Q is fed back with K, Q′ with J. Use the PULSE button: with J = K = 1 each pulse toggles Q.', 40, 470);
    S.legend([pw('IC1', '7400'), pw('IC2', '7408')], 40, 535);
  };

  function timer(S, astable) {
    const nets = { 7: 'IC1.7', 6: 'IC1.6', 2: astable ? 'IC1.6' : 'PLN', 3: 'IC1.3', 8: 'VCC', 4: 'VCC', 1: 'GND', 5: 'IC1.5' };
    const p = S.block('555', 'IC1', 440, 190, 150, 190, { left: [7, 6, 2], right: [3], top: [8, 4], bottom: [1, 5] }, nets);
    S.wire('VCC', [[220, 120], [p[4].x + 40, 120]]); S.vcc(220, 120);
    S.wire('VCC', [[p[8].x, p[8].y], [p[8].x, 120]]); S.wire('VCC', [[p[4].x, p[4].y], [p[4].x, 120]]);
    S.wire('GND', [[220, 480], [p[5].x + 40, 480]]); S.gnd(p[5].x + 40, 480);
    S.wire('GND', [[p[1].x, p[1].y], [p[1].x, 480]]);
    S.wire('IC1.5', [[p[5].x, p[5].y], [p[5].x, 425]]); S.cap(p[5].x, 425, 470, 'C2 0.01µF'); S.wire('GND', [[p[5].x, 470], [p[5].x, 480]]);
    const nx = 320;
    if (astable) {
      S.res('VCC', nx, 120, nx, 196, 'RA 4.7kΩ');
      S.wire('IC1.7', [[nx, 196], [nx, p[7].y], [p[7].x, p[7].y]]);
      S.res('IC1.7', nx, p[7].y, nx, p[6].y - 4, 'RB 10kΩ');
      S.wire('IC1.6', [[nx, p[6].y - 4], [nx, p[6].y], [p[6].x, p[6].y]]);
      S.wire('IC1.6', [[nx, p[6].y], [nx, p[2].y], [p[2].x, p[2].y]]);
      S.wire('IC1.6', [[nx, p[2].y], [nx, 400]]);
      S.cap(nx, 400, 470, 'C1 0.1µF'); S.wire('GND', [[nx, 470], [nx, 480]]);
      S.probe('CH2', 230, 340, 'IC1.6'); S.wire('IC1.6', [[nx, 340], [244, 340]]);
    } else {
      S.res('VCC', nx, 120, nx, 196, 'R 1kΩ');
      S.wire('IC1.7', [[nx, 196], [nx, p[7].y], [p[7].x, p[7].y]]);
      S.wire('IC1.7', [[nx, p[7].y], [nx, p[6].y], [p[6].x, p[6].y]]);
      S.wire('IC1.7', [[nx, p[6].y], [nx, 400]]);
      S.cap(nx, 400, 470, 'C1 0.1µF'); S.wire('GND', [[nx, 470], [nx, 480]]);
      const t = S.input('TRIG', 'P′ (pulser)', 250, p[2].y); S.wire('PLN', [[t.x, t.y], [p[2].x, p[2].y]]);
      S.probe('CH2', 230, 270, 'IC1.7'); S.wire('IC1.7', [[nx, 270], [244, 270]]);
    }
    S.wire('IC1.3', [[p[3].x, p[3].y], [760, p[3].y]]); S.led('L0', 'Output', 760, p[3].y, 'IC1.3');
    S.wire('IC1.3', [[700, p[3].y], [700, p[3].y + 60], [760, p[3].y + 60]]); S.probe('CH1', 760, p[3].y + 60, 'IC1.3');
    S.note(astable ? 'T_ON = 0.693 (RA+RB) C    T_OFF = 0.693 RB C    f = 1/(T_ON + T_OFF)' : 'Output pulse width T = 1.1 R C after a negative trigger at pin 2', 40, 520);
    S.legend([pw('IC1', '555')], 40, 540);
  }
  SHEETS['timer/mono'] = (S) => timer(S, false);
  SHEETS['timer/astable'] = (S) => timer(S, true);

  SHEETS['decmux/dec'] = (S) => {
    const nets = { 1: 'IN0', 2: 'IN1', 3: 'IN2', 6: 'IN5', 4: 'IN4', 5: 'IN3' };
    [15, 14, 13, 12, 11, 10, 9, 7].forEach((pin) => (nets[pin] = 'IC1.' + pin));
    const p = S.block('74138', 'IC1', 430, 90, 150, 380, { left: [1, 2, 3, null, 6, 4, 5], right: [15, 14, 13, 12, 11, 10, 9, 7] }, nets);
    [[1, 'S0', 'S0', 'IN0'], [2, 'S1', 'S1', 'IN1'], [3, 'S2', 'S2', 'IN2'], [6, 'EN1', 'S5', 'IN5'], [4, 'EN2′', 'S4', 'IN4'], [5, 'EN3′', 'S3', 'IN3']]
      .forEach(([pin, n, src, net]) => { const f = S.input(n, src, 300, p[pin].y); S.wire(net, [[f.x, f.y], [p[pin].x, p[pin].y]]); });
    [15, 14, 13, 12, 11, 10, 9, 7].forEach((pin, i) => { S.wire('IC1.' + pin, [[p[pin].x, p[pin].y], [700, p[pin].y]]); S.led('L' + i, 'Y' + i + ' (active-LOW)', 700, p[pin].y, 'IC1.' + pin); });
    S.note('Enabled when EN1 = 1, EN2′ = 0, EN3′ = 0. The selected Yn goes LOW: its LED turns OFF.', 40, 500);
    S.legend([pw('IC1', '74138')], 40, 535);
  };
  SHEETS['decmux/mux'] = (S) => {
    const D = [4, 3, 2, 1, 15, 14, 13, 12];
    const nets = { 9: 'IN2', 10: 'IN1', 11: 'IN0', 7: 'IN3', 5: 'IC1.5' };
    const hi = [false, true, true, false, false, false, true, true];
    D.forEach((pin, i) => (nets[pin] = hi[i] ? 'VCC' : 'GND'));
    const p = S.block('74151', 'IC1', 440, 80, 150, 420, { left: [...D, null, 7, 9, 10, 11], right: [null, null, 5, null, 6, null] }, nets);
    D.forEach((pin, i) => {
      if (hi[i]) { S.wire('VCC', [[p[pin].x, p[pin].y], [370, p[pin].y]]); S.vcc(370, p[pin].y, false); }
      else { S.wire('GND', [[p[pin].x, p[pin].y], [380, p[pin].y], [380, p[pin].y + 2]]); S.gnd(380, p[pin].y + 2); }
    });
    [[7, 'EN′', 'S3', 'IN3'], [9, 'A (MSB)', 'S2', 'IN2'], [10, 'B', 'S1', 'IN1'], [11, 'C (LSB)', 'S0', 'IN0']]
      .forEach(([pin, n, src, net]) => { const f = S.input(n, src, 300, p[pin].y); S.wire(net, [[f.x, f.y], [p[pin].x, p[pin].y]]); });
    S.wire('IC1.5', [[p[5].x, p[5].y], [720, p[5].y]]); S.led('L0', 'Y = F(A,B,C)', 720, p[5].y, 'IC1.5');
    S.text(p[6].x + 4, p[6].y + 4, '× (W unused)', 'note');
    S.note('F(A,B,C) = Σm(1,2,6,7): D1, D2, D6, D7 = 1 and D0, D3, D4, D5 = 0.', 40, 520);
    S.legend([pw('IC1', '74151')], 640, 420);
  };
  SHEETS['cmp/cmp'] = (S) => {
    const nets = { 15: 'IN7', 13: 'IN6', 12: 'IN5', 10: 'IN4', 1: 'IN3', 14: 'IN2', 11: 'IN1', 9: 'IN0', 2: 'GND', 3: 'VCC', 4: 'GND', 5: 'IC1.5', 6: 'IC1.6', 7: 'IC1.7' };
    const p = S.block('7485', 'IC1', 440, 70, 150, 450, { left: [15, 13, 12, 10, 1, 14, 11, 9, null, 4, 3, 2], right: [null, 5, 6, 7, null] }, nets);
    [[15, 'A3', 'S7', 'IN7'], [13, 'A2', 'S6', 'IN6'], [12, 'A1', 'S5', 'IN5'], [10, 'A0', 'S4', 'IN4'], [1, 'B3', 'S3', 'IN3'], [14, 'B2', 'S2', 'IN2'], [11, 'B1', 'S1', 'IN1'], [9, 'B0', 'S0', 'IN0']]
      .forEach(([pin, n, src, net]) => { const f = S.input(n, src, 300, p[pin].y); S.wire(net, [[f.x, f.y], [p[pin].x, p[pin].y]]); });
    [[4, false], [3, true], [2, false]].forEach(([pin, h]) => {
      if (h) { S.wire('VCC', [[p[pin].x, p[pin].y], [370, p[pin].y]]); S.vcc(370, p[pin].y, false); }
      else { S.wire('GND', [[p[pin].x, p[pin].y], [380, p[pin].y], [380, p[pin].y + 2]]); S.gnd(380, p[pin].y + 2); }
    });
    [[5, 'L2', 'A > B'], [6, 'L1', 'A = B'], [7, 'L0', 'A < B']].forEach(([pin, l, fn]) => { S.wire('IC1.' + pin, [[p[pin].x, p[pin].y], [720, p[pin].y]]); S.led(l, fn, 720, p[pin].y, 'IC1.' + pin); });
    S.note('Single chip: cascade inputs IA>B = 0, IA=B = 1, IA<B = 0.', 40, 560);
    S.legend([pw('IC1', '7485')], 640, 480);
  };

  function cmosFrame(S) {
    S.wire('VCC', [[300, 100], [760, 100]]); S.vcc(300, 100);
    S.wire('GND', [[300, 500], [760, 500]]); S.gnd(760, 500);
    S.text(770, 104, 'VDD (pin 14)', 'note'); S.text(770, 496, 'VSS (pin 7)', 'note');
  }
  SHEETS['cmosnot/cmosnot'] = (S) => {
    cmosFrame(S);
    const p1 = S.mos('P', 500, 230, 'P1', { g: 6, top: 14, bot: 13 }, { g: 'IN0' });
    const n1 = S.mos('N', 500, 370, 'N1', { g: 6, top: 8, bot: 7 }, { g: 'IN0' });
    S.wire('VCC', [[p1.top.x, p1.top.y], [p1.top.x, 100]]); S.wire('GND', [[n1.bot.x, n1.bot.y], [n1.bot.x, 500]]);
    S.wire('IC1.13', [[p1.bot.x, p1.bot.y], [n1.top.x, n1.top.y]]);
    S.wire('IC1.13', [[p1.bot.x, 300], [680, 300]]); S.led('L0', 'Y = A′', 680, 300, 'IC1.13');
    S.wire('IN0', [[p1.g.x, p1.g.y], [400, p1.g.y], [400, n1.g.y], [n1.g.x, n1.g.y]]);
    const a = S.input('A', 'S0', 330, 300); S.wire('IN0', [[a.x, 300], [400, 300]]);
    S.note('Drains 13 and 8 joined = output. Unused gates (pins 3, 10) tied to GND.', 40, 560);
  };
  SHEETS['cmosnn/nand'] = (S) => {
    cmosFrame(S);
    const p1 = S.mos('P', 440, 190, 'P1', { g: 6, top: 14, bot: 13 }, { g: 'IN1' });
    const p2 = S.mos('P', 600, 190, 'P2', { g: 3, top: 2, bot: 1 }, { g: 'IN0' });
    const n2 = S.mos('N', 520, 320, 'N2', { g: 3, top: 5, bot: 4 }, { g: 'IN0' });
    const n1 = S.mos('N', 520, 430, 'N1', { g: 6, top: 8, bot: 7 }, { g: 'IN1' });
    S.wire('VCC', [[p1.top.x, p1.top.y], [p1.top.x, 100]]); S.wire('VCC', [[p2.top.x, p2.top.y], [p2.top.x, 100]]);
    S.wire('IC1.13', [[p1.bot.x, p1.bot.y], [p1.bot.x, 255], [p2.bot.x, 255], [p2.bot.x, p2.bot.y]]);
    S.wire('IC1.13', [[n2.top.x, n2.top.y], [n2.top.x, 255]]);
    S.wire('IC1.13', [[p2.bot.x, 255], [700, 255]]); S.led('L0', 'Y = (A·B)′', 700, 255, 'IC1.13');
    S.wire('IC1.4', [[n2.bot.x, n2.bot.y], [n1.top.x, n1.top.y]]);
    S.wire('GND', [[n1.bot.x, n1.bot.y], [n1.bot.x, 500]]);
    S.wire('IN1', [[p1.g.x, p1.g.y], [360, p1.g.y], [360, n1.g.y], [n1.g.x, n1.g.y]]);
    S.wire('IN0', [[p2.g.x, p2.g.y], [545, p2.g.y], [545, 272], [470, 272], [470, n2.g.y], [n2.g.x, n2.g.y]]);
    const a = S.input('A', 'S1', 300, 380), b = S.input('B', 'S0', 300, 230);
    S.wire('IN1', [[a.x, 380], [360, 380]]); S.wire('IN0', [[b.x, 230], [330, 230], [330, 272], [470, 272]]);
    S.note('PMOS in parallel (pull-up), NMOS in series (pull-down). Pin 10 tied to GND.', 40, 560);
  };
  SHEETS['cmosnn/nor'] = (S) => {
    cmosFrame(S);
    const p1 = S.mos('P', 520, 170, 'P1', { g: 6, top: 14, bot: 13 }, { g: 'IN1' });
    const p2 = S.mos('P', 520, 280, 'P2', { g: 3, top: 2, bot: 1 }, { g: 'IN0' });
    const n1 = S.mos('N', 440, 420, 'N1', { g: 6, top: 8, bot: 7 }, { g: 'IN1' });
    const n2 = S.mos('N', 610, 420, 'N2', { g: 3, top: 5, bot: 4 }, { g: 'IN0' });
    S.wire('VCC', [[p1.top.x, p1.top.y], [p1.top.x, 100]]);
    S.wire('IC1.13', [[p1.bot.x, p1.bot.y], [p2.top.x, p2.top.y]]);
    S.wire('IC1.1', [[p2.bot.x, p2.bot.y], [p2.bot.x, 350]]);
    S.wire('IC1.1', [[n1.top.x, n1.top.y], [n1.top.x, 350], [n2.top.x, 350], [n2.top.x, n2.top.y]]);
    S.wire('IC1.1', [[n2.top.x, 350], [700, 350]]); S.led('L0', 'Y = (A+B)′', 700, 350, 'IC1.1');
    S.wire('GND', [[n1.bot.x, n1.bot.y], [n1.bot.x, 500]]); S.wire('GND', [[n2.bot.x, n2.bot.y], [n2.bot.x, 500]]);
    S.wire('IN1', [[p1.g.x, p1.g.y], [380, p1.g.y], [380, n1.g.y], [n1.g.x, n1.g.y]]);
    S.wire('IN0', [[p2.g.x, p2.g.y], [470, p2.g.y], [470, 368], [560, 368], [560, n2.g.y], [n2.g.x, n2.g.y]]);
    const a = S.input('A', 'S1', 310, 240), b = S.input('B', 'S0', 310, 280);
    S.wire('IN1', [[a.x, 240], [380, 240]]); S.wire('IN0', [[b.x, 280], [350, 280], [350, 368], [470, 368]]);
    S.note('PMOS in series (pull-up), NMOS in parallel (pull-down). Pin 10 tied to GND.', 40, 560);
  };

  /* ---------- public ---------- */
  UI.sheetFor = (part, lv) => {
    const f = SHEETS[part.key];
    if (!f) return null;
    const S = Sheet(); f(S);
    const meta = { title: `Exp ${part.exp.no}: ${part.title}`, sub: part.exp.short, sheet: `${part.exp.no}${part.exp.parts.length > 1 ? 'ABC'[part.exp.parts.indexOf(part)] : ''}/1` };
    const svg = s('svg', { class: 'sch-svg', viewBox: `0 0 ${SW} ${SH}`, role: 'img', 'aria-label': 'Circuit diagram' });
    svg.appendChild(s('rect', { x: -2000, y: -2000, width: SW + 4000, height: SH + 4000, class: 'sch-bg' }));
    svg.appendChild(render(S, meta, lv));
    return svg;
  };
  UI.SHEET_SIZE = { w: SW, h: SH };

  // DIP pinout, top view, notch up
  UI.pinout = (type) => {
    const d = DSD.LIB[type], n = d.npins, half = n / 2, pitch = 26, w = 120, x0 = 110, y0 = 40, hh = half * pitch + 14;
    const svg = s('svg', { class: 'pinout-svg', viewBox: `0 0 ${x0 * 2 + w} ${y0 + hh + 40}`, role: 'img', 'aria-label': `${d.chipText} pinout` });
    svg.appendChild(s('rect', { x: x0, y: y0, width: w, height: hh, rx: 6, class: 'po-body' }));
    svg.appendChild(s('path', { d: `M${x0 + w / 2 - 10} ${y0} a10 10 0 0 0 20 0`, class: 'po-notch' }));
    svg.appendChild(s('text', { x: x0 + w / 2, y: y0 + hh / 2 - 6, class: 'po-type', 'text-anchor': 'middle' }, d.chipText));
    svg.appendChild(s('text', { x: x0 + w / 2, y: y0 + hh / 2 + 12, class: 'po-title', 'text-anchor': 'middle' }, d.title.length > 18 ? d.title.split(' ').slice(0, 3).join(' ') : d.title));
    const role = (p) => (p === d.vcc ? 'vcc' : p === d.gnd ? 'gnd' : d.role[p] === 'out' ? 'out' : d.role[p] === 'nc' ? 'nc' : 'in');
    for (let p = 1; p <= n; p++) {
      const left = p <= half, k = left ? p - 1 : n - p, y = y0 + 20 + k * pitch;
      const x = left ? x0 - 14 : x0 + w;
      svg.appendChild(s('rect', { x, y: y - 5, width: 14, height: 10, rx: 2, class: 'po-pin ' + role(p) }));
      svg.appendChild(s('text', { x: left ? x0 + 8 : x0 + w - 8, y: y + 4, class: 'po-num', 'text-anchor': left ? 'start' : 'end' }, p));
      svg.appendChild(s('text', { x: left ? x0 - 20 : x0 + w + 20, y: y + 4, class: 'po-name ' + role(p), 'text-anchor': left ? 'end' : 'start' }, d.pins[p - 1]));
    }
    return svg;
  };
})();
