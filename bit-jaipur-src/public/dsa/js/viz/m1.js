/* ============================================================
 * viz/m1.js — Module I: arrays, sparse matrix, polynomials,
 * recursion (call trees) and the growth-of-functions chart.
 * ============================================================ */
(function () {
  'use strict';
  const DSA = window.DSA;
  const D = DSA.draw;
  const { rand, h, s } = DSA.UI;
  const VizError = DSA.VizError;

  /* ---------------- array ---------------- */
  const CAP = 8;
  DSA.viz.define('array', {
    title: 'Array',
    blurb: 'Elements sit in consecutive memory, so a[i] is found in O(1). Inserting or deleting in the middle has to shift everything after it: O(n).',
    args: {
      value: { label: 'Value', type: 'int', def: () => rand(1, 99), fresh: true },
      pos: { label: 'Index', type: 'int', def: 2, min: 0, max: CAP - 1 },
    },
    ops: [
      { id: 'insert', label: 'Insert at index', uses: ['value', 'pos'], primary: true }, { id: 'delete', label: 'Delete at index', uses: ['pos'] },
      { id: 'access', label: 'Access a[i]', uses: ['pos'] }, { id: 'search', label: 'Linear search', uses: ['value'] },
    ],
    create: () => ({ slots: [{ v: 12, k: 0 }, { v: 7, k: 1 }, { v: 25, k: 2 }, { v: 9, k: 3 }, { v: 31, k: 4 }, null, null, null], uid: 5 }),
    draw(st, m) {
      const nodes = [];
      for (let i = 0; i < CAP; i++) {
        nodes.push({ id: 's' + i, shape: 'rect', x: i * 62, y: 0, w: 54, h: 46, text: '', sub: i, cls: 'n-empty' });
      }
      st.slots.forEach((it, i) => { if (it) nodes.push({ id: 'v' + it.k, shape: 'rect', x: i * 62, y: 0, w: 54, h: 46, text: it.v, cls: (m.hl && m.hl[i]) || '', enter: [0, -60] }); });
      if (m.ghost) nodes.push({ id: 'v' + m.ghost.k, shape: 'rect', x: m.gx * 62, y: -72, w: 54, h: 46, text: m.ghost.v, cls: 'n-hl' });
      if (m.i != null) nodes.push(D.tag('i', 'i = ' + m.i, m.i * 62, -50, 'down', 'n-ptr'));
      const used = st.slots.filter(Boolean).length;
      nodes.push(D.text('len', `length = ${used} of ${CAP}`, (CAP * 62 - 8) / 2, 76, 't-muted'));
      return { nodes };
    },
    run(st, op, a, snap) {
      const n = st.slots.filter(Boolean).length;
      if (op === 'insert') {
        if (n === CAP) return snap('**Overflow.** The array is full (fixed size).', { line: 0, tone: 'bad' });
        if (a.pos > n) throw new VizError(`Index must be between 0 and ${n}: arrays have no gaps.`);
        const it = { v: a.value, k: st.uid++ };
        snap(`Insert ${a.value} at index ${a.pos}. Everything from index ${a.pos} on must move one place right to open a gap.`, { line: 0, ghost: it, gx: a.pos });
        for (let i = n - 1; i >= a.pos; i--) {
          st.slots[i + 1] = st.slots[i]; st.slots[i] = null;
          snap(`Shift a[${i}] = ${st.slots[i + 1].v} to a[${i + 1}] (starting from the end so nothing is overwritten).`, { line: 1, i, ghost: it, gx: a.pos, hl: { [i + 1]: 'n-cmp' } }, { hold: 0.7 });
        }
        st.slots[a.pos] = it;
        snap(`Store ${a.value} at a[${a.pos}]. ${n - a.pos} element(s) moved: worst case O(n), best case (at the end) O(1).`, { line: 2, hl: { [a.pos]: 'n-ok' }, tone: 'good' });
      } else if (op === 'delete') {
        if (a.pos >= n) throw new VizError(n ? `Index must be between 0 and ${n - 1}.` : 'The array is empty.');
        snap(`Delete a[${a.pos}] = ${st.slots[a.pos].v}.`, { line: 0, hl: { [a.pos]: 'n-bad' } });
        st.slots[a.pos] = null;
        snap('Remove it, leaving a gap. Arrays cannot have gaps, so close it by shifting left.', { line: 1 });
        for (let i = a.pos + 1; i < n; i++) { st.slots[i - 1] = st.slots[i]; st.slots[i] = null; snap(`Shift a[${i}] to a[${i - 1}].`, { line: 1, i, hl: { [i - 1]: 'n-cmp' } }, { hold: 0.7 }); }
        snap(`Length is now ${n - 1}. Worst case O(n) (deleting the first element).`, { line: 2, tone: 'good' });
      } else if (op === 'access') {
        if (a.pos >= n) throw new VizError(n ? `Index must be between 0 and ${n - 1}.` : 'The array is empty.');
        snap(`address of a[${a.pos}] = base + ${a.pos} × size. One multiplication and one addition, whatever the index: **O(1)**.`, { hl: { [a.pos]: 'n-ok' }, tone: 'good' });
      } else {
        for (let i = 0; i < n; i++) {
          const hit = st.slots[i].v === a.value;
          snap(hit ? `a[${i}] = ${a.value}. **Found** at index ${i}.` : `a[${i}] = ${st.slots[i].v} ≠ ${a.value}.`, { line: hit ? 1 : 0, i, hl: { [i]: hit ? 'n-ok' : 'n-cmp' }, tone: hit ? 'good' : '' }, { hold: 0.7 });
          if (hit) return;
        }
        snap(`${a.value} is not in the array after ${n} comparisons: O(n).`, { tone: 'bad' });
      }
    },
    code: {
      insert: ['for i = n - 1 down to pos: a[i + 1] = a[i]', 'shift right to make room', 'a[pos] = value;  n = n + 1'],
      delete: ['x = a[pos]', 'for i = pos + 1 to n - 1: a[i - 1] = a[i]', 'n = n - 1'],
      access: ['return a[i]   // base + i * size'],
      search: ['for i = 0 to n - 1:', '  if a[i] == value: return i', 'return NOT FOUND'],
    },
    demo: [['insert', { value: 18, pos: 1 }], ['delete', { pos: 3 }], ['search', { value: 31 }]],
    view: { minW: 560, minH: 220 },
  });

  /* ---------------- sparse matrix ---------------- */
  const SM = [[0, 0, 0, 5, 0], [0, 3, 0, 0, 0], [0, 0, 0, 0, 7], [2, 0, 0, 4, 0]];
  DSA.viz.define('sparse', {
    title: 'Sparse matrix',
    blurb: 'Most entries are zero, so store only the non-zero ones as (row, column, value) triplets, preceded by a header (rows, columns, count).',
    variants: [{ id: 'triplet', label: 'Triplet form' }, { id: 'transpose', label: 'Transpose' }],
    args: {},
    ops: [{ id: 'go', label: 'Run', primary: true }],
    create: (variant) => ({ variant }),
    draw(st, m) {
      const nodes = [], tr = st.variant === 'transpose';
      const nz = []; SM.forEach((row, r) => row.forEach((v, c) => { if (v) nz.push([r, c, v]); }));
      SM.forEach((row, r) => row.forEach((v, c) => nodes.push({ id: `m${r}_${c}`, shape: 'rect', x: c * 40, y: r * 40, w: 36, h: 36, text: v, rx: 7, cls: (v === 0 ? 'n-empty ' : '') + (m.cell === r + '_' + c ? 'n-hl' : '') })));
      nodes.push(D.text('mt', `${SM.length} × ${SM[0].length} matrix, ${SM.length * SM[0].length} cells`, 80, -34, 't-muted'));
      const rows = m.rows || [];
      const X = 280;
      nodes.push(D.text('hr', 'row', X, -34, 't-muted')); nodes.push(D.text('hc', 'col', X + 56, -34, 't-muted')); nodes.push(D.text('hv', 'val', X + 112, -34, 't-muted'));
      const hdr = tr ? [SM[0].length, SM.length, nz.length] : [SM.length, SM[0].length, nz.length];
      hdr.forEach((v, j) => nodes.push({ id: 'h' + j, shape: 'rect', x: X + j * 56, y: 0, w: 52, h: 30, text: v, cls: 'n-alt' }));
      rows.forEach((t, i) => t.forEach((v, j) => nodes.push({ id: `t${t.k}_${j}`, shape: 'rect', x: X + j * 56, y: 40 + i * 34, w: 52, h: 30, text: v, cls: m.new === i ? 'n-ok' : '', enter: [0, -10] })));
      nodes.push(D.text('tl', 'header: rows, columns, non-zero count', X + 56, 160 + 24 + Math.max(0, rows.length - 4) * 34, 't-muted'));
      return { nodes };
    },
    run(st, op, a, snap) {
      const nz = []; SM.forEach((row, r) => row.forEach((v, c) => { if (v) nz.push([r, c, v]); }));
      const rows = []; let k = 0;
      if (st.variant === 'triplet') {
        snap(`Dense storage needs ${SM.length * SM[0].length} cells. Scan row by row and keep only the non-zero entries.`, { line: 0 });
        nz.forEach(([r, c, v]) => { const t = [r, c, v]; t.k = k++; rows.push(t); snap(`Found ${v} at (${r}, ${c}): store the triplet (${r}, ${c}, ${v}).`, { line: 1, rows: rows.slice(), cell: r + '_' + c, new: rows.length - 1 }, { hold: 0.8 }); });
        snap(`${nz.length} triplets + 1 header = ${(nz.length + 1) * 3} numbers instead of ${SM.length * SM[0].length}. Savings grow as the matrix gets sparser.`, { rows, tone: 'good' });
      } else {
        snap('Transpose swaps rows and columns: (r, c, v) becomes (c, r, v). The triplets must then be ordered by the new row.', { line: 0 });
        for (let c = 0; c < SM[0].length; c++) {
          nz.filter((e) => e[1] === c).forEach(([r, cc, v]) => { const t = [cc, r, v]; t.k = k++; rows.push(t); snap(`Column ${c} of the original becomes row ${c}: (${r}, ${c}, ${v}) → (${c}, ${r}, ${v}).`, { line: 2, rows: rows.slice(), cell: r + '_' + cc, new: rows.length - 1 }, { hold: 0.8 }); });
        }
        snap(`Simple transpose scans the triplets once per column: O(columns × non-zero) time. Fast transpose uses a count of entries per column to reach O(columns + non-zero).`, { rows, tone: 'good' });
      }
    },
    code: {
      go: ['for each row r, column c of the matrix:', '  if a[r][c] != 0: append (r, c, a[r][c]) to triplets', 'for each column c of the original, in order:', '  for each triplet (r, c, v): append (c, r, v)'],
    },
    demo: [['go']],
    view: { minW: 520, minH: 260 },
  });

  /* ---------------- polynomial addition ---------------- */
  function parsePoly(src) {
    const t = src.replace(/\s+/g, '').replace(/-/g, '+-');
    const terms = t.split('+').filter(Boolean).map((p) => {
      const m = /^(-?\d*)(?:x(?:\^(\d+))?)?$/.exec(p);
      if (!m || (m[1] === '' && p.indexOf('x') < 0)) throw new VizError(`Cannot read "${p}". Write terms like 3x^4 + 2x^2 - x + 5.`);
      const c = m[1] === '' ? 1 : m[1] === '-' ? -1 : parseInt(m[1], 10);
      const e = p.indexOf('x') < 0 ? 0 : m[2] == null ? 1 : parseInt(m[2], 10);
      return [c, e];
    });
    if (!terms.length || terms.length > 5) throw new VizError('Use 1 to 5 terms per polynomial.');
    const map = new Map(); terms.forEach(([c, e]) => map.set(e, (map.get(e) || 0) + c));
    return [...map].map(([e, c]) => [c, e]).sort((a, b) => b[1] - a[1]);
  }
  const showTerm = (c, e) => (e === 0 ? `${c}` : e === 1 ? `${c}x` : `${c}x^${e}`);
  DSA.viz.define('poly', {
    title: 'Polynomial addition (linked lists)',
    blurb: 'Each term is a node (coefficient, exponent) and lists are kept in decreasing exponent order. Adding is a merge: compare exponents, add equal ones, copy the larger.',
    args: { p: { label: 'P(x)', type: 'text', def: '5x^4 + 3x^2 + 7', examples: ['5x^4 + 3x^2 + 7', '2x^3 - x + 4'] }, q: { label: 'Q(x)', type: 'text', def: '4x^3 + 6x^2 - 3', examples: ['4x^3 + 6x^2 - 3', '3x^4 - 2x^3 + 8x^2'] } },
    ops: [{ id: 'add', label: 'Add P + Q', uses: ['p', 'q'], primary: true }],
    create: () => ({ p: [], q: [], r: [], uid: 0 }),
    draw(st, m) {
      const nodes = [], edges = [], rowY = [0, 96, 220], lists = [st.p, st.q, st.r], names = ['P', 'Q', 'R = P + Q'];
      lists.forEach((L, li) => {
        nodes.push(D.text('nm' + li, names[li], -78, rowY[li], 't-accent', 'end'));
        L.forEach((t, i) => {
          const id = `${li}_${t.k}`;
          nodes.push(Object.assign({ id, shape: 'rect', x: i * 118, y: rowY[li], w: 104, h: 40, text: showTerm(t.c, t.e), divs: [0.72], tx: -13, cls: (m.hl && m.hl[id]) || '' }, li === 2 ? { enter: [0, -40] } : {}));
          const nx = i < L.length - 1 ? `${li}_${L[i + 1].k}` : 'null' + li;
          edges.push({ id: id + '>n', from: id, to: nx, fa: [38, 0] });
        });
        nodes.push(D.text('null' + li, 'NULL', L.length * 118 - 10, rowY[li], 't-null'));
      });
      if (m.p != null) nodes.push(D.tag('pp', 'p', m.p * 118, -40, 'down', 'n-ptr'));
      if (m.q != null) nodes.push(D.tag('qp', 'q', m.q * 118, 56, 'up', 'n-ptr2'));
      return { nodes, edges };
    },
    run(st, op, a, snap) {
      const mk = (L) => L.map(([c, e], i) => ({ c, e, k: i }));
      st.p = mk(parsePoly(a.p)); st.q = mk(parsePoly(a.q)); st.r = []; st.uid = 0;
      const add = (c, e) => { if (c !== 0) st.r.push({ c, e, k: st.uid++ }); };
      let i = 0, j = 0;
      snap('Two pointers `p` and `q` walk the lists from the highest exponent down.', { line: 0, p: 0, q: 0 });
      while (i < st.p.length || j < st.q.length) {
        const P = st.p[i], Q = st.q[j], at = { p: i < st.p.length ? i : st.p.length, q: j < st.q.length ? j : st.q.length };
        const hl = {};
        if (P && Q) {
          if (P.e === Q.e) {
            hl[`0_${P.k}`] = hl[`1_${Q.k}`] = 'n-cmp';
            const c = P.c + Q.c; add(c, P.e);
            snap(`Exponents are equal (${P.e}): add the coefficients, ${P.c} + ${Q.c} = ${c}${c === 0 ? ', which cancels, so no node is created' : ''}.`, Object.assign({ line: 2, hl }, at)); i++; j++;
          } else if (P.e > Q.e) { hl[`0_${P.k}`] = 'n-ok'; add(P.c, P.e); snap(`${P.e} > ${Q.e}: copy P's term ${showTerm(P.c, P.e)} and advance \`p\`.`, Object.assign({ line: 3, hl }, at)); i++; }
          else { hl[`1_${Q.k}`] = 'n-ok'; add(Q.c, Q.e); snap(`${Q.e} > ${P.e}: copy Q's term ${showTerm(Q.c, Q.e)} and advance \`q\`.`, Object.assign({ line: 4, hl }, at)); j++; }
        } else if (P) { add(P.c, P.e); snap(`Q is exhausted: copy the rest of P (${showTerm(P.c, P.e)}).`, Object.assign({ line: 5, hl: { [`0_${P.k}`]: 'n-ok' } }, at)); i++; }
        else { add(Q.c, Q.e); snap(`P is exhausted: copy the rest of Q (${showTerm(Q.c, Q.e)}).`, Object.assign({ line: 5, hl: { [`1_${Q.k}`]: 'n-ok' } }, at)); j++; }
      }
      snap(`P + Q = **${st.r.map((t) => showTerm(t.c, t.e)).join(' + ').replace(/\+ -/g, '- ') || '0'}**. Each node is visited once: O(m + n).`, { line: 6, tone: 'good' });
    },
    code: { add: ['p = P.head; q = Q.head', 'while p != NULL and q != NULL:', '  if p.exp == q.exp: append (p.coef + q.coef, p.exp); advance both', '  else if p.exp > q.exp: append p\'s term; p = p.next', '  else: append q\'s term; q = q.next', 'append whatever remains of P or Q', 'return R'] },
    demo: [['add', { p: '5x^4 + 3x^2 + 7', q: '4x^3 + 6x^2 - 3' }]],
    view: { minW: 640, minH: 300 },
  });

  /* ---------------- recursion call tree ---------------- */
  DSA.viz.define('recursion', {
    title: 'Recursion',
    blurb: 'Every call waits for the calls it makes. The call tree shows how many times work is repeated, and why fib(n) takes O(2ⁿ) while factorial takes O(n).',
    variants: [{ id: 'fact', label: 'Factorial' }, { id: 'fib', label: 'Fibonacci' }],
    args: { n: { label: 'n', type: 'int', def: 4, min: 0, max: 6 } },
    ops: [{ id: 'run', label: 'Trace the calls', uses: ['n'], primary: true }],
    create: (variant) => ({ variant, calls: [], layout: {} }),
    draw(st, m) {
      const nodes = [], edges = [];
      for (const c of st.calls) {
        if (c.state === 'new') continue;
        const p = st.layout[c.id];
        nodes.push({ id: 'c' + c.id, shape: 'rect', x: p[0], y: p[1], w: st.variant === 'fib' ? 74 : 112, h: 36, text: c.label, sub: c.state === 'done' ? '→ ' + c.val : undefined, cls: c.id === m.cur ? 'n-hl' : c.state === 'done' ? 'n-ok' : '', enter: [0, -24] });
        if (c.parent != null) edges.push({ id: `e${c.id}`, from: 'c' + c.parent, to: 'c' + c.id, cls: c.id === m.cur ? 'e-hl' : '' });
      }
      return { nodes, edges };
    },
    run(st, op, a, snap) {
      const fact = st.variant === 'fact', calls = []; st.calls = calls;
      const build = (n, parent) => {
        const c = { id: calls.length, n, parent, label: fact ? `fact(${n})` : `fib(${n})`, state: 'new', kids: [] };
        calls.push(c);
        if (fact ? n > 1 : n > 1) {
          if (fact) c.kids.push(build(n - 1, c.id)); else { c.kids.push(build(n - 1, c.id)); c.kids.push(build(n - 2, c.id)); }
        }
        return c;
      };
      if (fact && a.n > 6) throw new VizError('n up to 6.');
      if (!fact && a.n > 5) throw new VizError('For Fibonacci use n up to 5 so the tree fits.');
      const root = build(a.n, null);
      // layout: leaves left to right, parents centred above
      let leaf = 0; const lay = {};
      const place = (c, d) => { if (!c.kids.length) { lay[c.id] = [fact ? 0 : leaf++ * 84, d * 78]; return; } c.kids.forEach((k) => place(k, d + 1)); const xs = c.kids.map((k) => lay[k.id][0]); lay[c.id] = [(Math.min(...xs) + Math.max(...xs)) / 2, d * 78]; };
      place(root, 0); st.layout = lay;
      const value = (c) => (fact ? (c.n <= 1 ? 1 : c.n * c.kids[0].val) : (c.n <= 1 ? c.n : c.kids[0].val + c.kids[1].val));
      let count = 0;
      snap(fact ? 'factorial(n) = n × factorial(n − 1), with factorial(1) = 1 as the base case. Watch the calls pile up, then return one by one.' : 'fib(n) = fib(n−1) + fib(n−2), with fib(0) = 0 and fib(1) = 1. Notice how the same values get computed again and again.', { line: 0 });
      const go = (c) => {
        c.state = 'open'; count++;
        snap(c.n <= 1 ? `${c.label} is the **base case**: it returns ${fact ? 1 : c.n} without calling anything.` : `${c.label} calls ${c.kids.map((k) => k.label).join(' and ')}.`, { line: c.n <= 1 ? 1 : 2, cur: c.id }, { hold: 0.8 });
        c.kids.forEach(go);
        c.val = value(c); c.state = 'done';
        snap(c.n <= 1 ? `${c.label} returns ${c.val}.` : `${c.label} receives ${c.kids.map((k) => k.val).join(' and ')} and returns ${fact ? `${c.n} × ${c.kids[0].val}` : c.kids.map((k) => k.val).join(' + ')} = **${c.val}**.`, { line: 3, cur: c.id }, { hold: 0.8 });
      };
      go(root);
      snap(fact ? `${count} calls for n = ${a.n}: the work is linear, O(n), and so is the stack depth.` : `${count} calls for n = ${a.n}. The call count grows by about 1.6× with each n: exponential, O(2ⁿ). Memoisation would cut it to O(n).`, { tone: 'good' });
    },
    code: { run: ['function f(n):', '  if n <= 1: return base value', '  recursive call(s): f(n - 1) ' + '(+ f(n - 2) for Fibonacci)', '  combine the results and return'] },
    demo: [['run', { n: 4 }]],
    view: { minW: 620, minH: 320 },
  });

  /* ---------------- growth chart (no frames: a live widget) ---------------- */
  DSA.widgets = DSA.widgets || {};
  DSA.widgets.growth = function (host) {
    const FN = [
      { id: 'log', label: 'log n', f: (n) => Math.log2(Math.max(n, 1)), c: '#2f8a4a' },
      { id: 'n', label: 'n', f: (n) => n, c: '#2f6fdb' },
      { id: 'nlogn', label: 'n log n', f: (n) => n * Math.log2(Math.max(n, 1)), c: '#b7791f' },
      { id: 'n2', label: 'n²', f: (n) => n * n, c: '#c65575' },
      { id: 'exp', label: '2ⁿ', f: (n) => Math.pow(2, n), c: '#7a5cc4' },
    ];
    const on = new Set(FN.map((f) => f.id)); let N = 12;
    const svg = s('svg', { viewBox: '0 0 640 300', role: 'img', 'aria-label': 'Growth of common running times' });
    const legend = h('div', { class: 'growth-legend' });
    const slider = h('input', { type: 'range', min: 4, max: 30, value: N, 'aria-label': 'Maximum n', oninput: () => { N = +slider.value; label.textContent = 'n up to ' + N; draw(); } });
    const label = h('span', {}, 'n up to ' + N);
    function draw() {
      const L = 44, T = 14, W = 640 - L - 16, H = 300 - T - 34;
      const cap = Math.max(...FN.filter((f) => on.has(f.id) && f.id !== 'exp').map((f) => f.f(N)), N * 2);
      const Y = (v) => T + H - Math.min(v / cap, 1.04) * H, X = (n) => L + ((n - 1) / (N - 1)) * W;
      svg.replaceChildren();
      for (let i = 0; i <= 4; i++) { const y = T + (H * i) / 4; svg.append(s('line', { class: 'g-grid', x1: L, x2: L + W, y1: y, y2: y }), s('text', { class: 'g-lbl', x: L - 6, y: y + 4, 'text-anchor': 'end' }, Math.round(cap * (1 - i / 4)))); }
      svg.append(s('line', { class: 'g-axis', x1: L, x2: L + W, y1: T + H, y2: T + H }), s('line', { class: 'g-axis', x1: L, x2: L, y1: T, y2: T + H }));
      for (let n = 1; n <= N; n += Math.ceil(N / 8)) svg.append(s('text', { class: 'g-lbl', x: X(n), y: T + H + 18, 'text-anchor': 'middle' }, n));
      svg.append(s('text', { class: 'g-lbl', x: L + W, y: T + H + 30, 'text-anchor': 'end' }, 'input size n →'));
      FN.filter((f) => on.has(f.id)).forEach((f) => {
        let d = ''; for (let n = 1; n <= N; n += 0.25) { const y = Y(f.f(n)); d += (d ? 'L' : 'M') + X(n).toFixed(1) + ',' + y.toFixed(1); if (f.f(n) > cap * 1.04) break; }
        svg.append(s('path', { class: 'g-line', d, stroke: f.c }));
      });
    }
    FN.forEach((f) => { const b = h('button', { class: 'growth-key', onclick: () => { if (on.has(f.id)) on.delete(f.id); else on.add(f.id); b.classList.toggle('off', !on.has(f.id)); draw(); } }, h('i', { style: { background: f.c } }), f.label); legend.appendChild(b); });
    host.append(h('div', { class: 'growth' }, svg, legend, h('div', { class: 'growth-row' }, label, slider)));
    draw();
    return { destroy() { host.replaceChildren(); } };
  };
})();
