/* ============================================================
 * viz/m2.js — Module II: singly / doubly / circular linked
 * list operations, list reversal, Floyd's cycle detection and
 * a multi-linked (orthogonal) list for a sparse matrix.
 * ============================================================ */
(function () {
  'use strict';
  const DSA = window.DSA;
  const D = DSA.draw;
  const { rand } = DSA.UI;
  const VizError = DSA.VizError;

  /* ---------------- linked list (three variants) ---------------- */
  const GAP = { singly: 116, circular: 116, doubly: 142 };
  const CODE = {
    singly: {
      insF: ['node = new Node(value)', 'node.next = head', 'head = node'],
      insE: ['node = new Node(value); node.next = NULL', 'ptr = head', 'while ptr.next != NULL: ptr = ptr.next', 'ptr.next = node'],
      insAt: ['node = new Node(value)', 'ptr = head; move ptr to position pos - 1', 'node.next = ptr.next', 'ptr.next = node'],
      delF: ['if head == NULL: report UNDERFLOW', 'temp = head', 'head = head.next', 'free(temp)'],
      delE: ['if head == NULL: report UNDERFLOW', 'move ptr to the second-last node', 'free(ptr.next)', 'ptr.next = NULL'],
      delV: ['prev = NULL; cur = head', 'while cur != NULL and cur.data != value: prev = cur; cur = cur.next', 'if cur == NULL: value not found', 'prev.next = cur.next   (or head = cur.next)', 'free(cur)'],
      search: ['ptr = head; pos = 0', 'while ptr != NULL:', '  if ptr.data == value: return pos', '  ptr = ptr.next; pos = pos + 1', 'return NOT FOUND'],
      reverse: ['prev = NULL; cur = head', 'while cur != NULL:', '  next = cur.next', '  cur.next = prev', '  prev = cur; cur = next', 'head = prev'],
    },
    doubly: {
      insF: ['node = new Node(value)', 'node.next = head; node.prev = NULL', 'if head != NULL: head.prev = node', 'head = node'],
      insE: ['node = new Node(value); node.next = NULL', 'move ptr to the last node', 'node.prev = ptr', 'ptr.next = node'],
      insAt: ['node = new Node(value)', 'move ptr to position pos - 1', 'node.next = ptr.next; node.prev = ptr', 'ptr.next.prev = node; ptr.next = node'],
      delF: ['if head == NULL: report UNDERFLOW', 'temp = head', 'head = head.next; head.prev = NULL', 'free(temp)'],
      delE: ['if head == NULL: report UNDERFLOW', 'move ptr to the last node', 'ptr.prev.next = NULL', 'free(ptr)'],
      delV: ['cur = head', 'while cur != NULL and cur.data != value: cur = cur.next', 'if cur == NULL: value not found', 'cur.prev.next = cur.next; cur.next.prev = cur.prev', 'free(cur)'],
      search: ['ptr = head; pos = 0', 'while ptr != NULL:', '  if ptr.data == value: return pos', '  ptr = ptr.next; pos = pos + 1', 'return NOT FOUND'],
    },
    circular: {
      insF: ['node = new Node(value)', 'node.next = head', 'move ptr to the last node; ptr.next = node', 'head = node'],
      insE: ['node = new Node(value)', 'move ptr to the last node', 'node.next = head', 'ptr.next = node'],
      insAt: ['node = new Node(value)', 'move ptr to position pos - 1', 'node.next = ptr.next', 'ptr.next = node'],
      delF: ['if head == NULL: report UNDERFLOW', 'move ptr to the last node', 'ptr.next = head.next; temp = head; head = head.next', 'free(temp)'],
      delE: ['if head == NULL: report UNDERFLOW', 'move ptr to the second-last node', 'free(ptr.next)', 'ptr.next = head'],
      delV: ['prev = last node; cur = head', 'do: if cur.data == value: stop;  prev = cur; cur = cur.next;  while cur != head', 'if not found: stop', 'prev.next = cur.next   (move head if cur was head)', 'free(cur)'],
      search: ['ptr = head; pos = 0', 'do:', '  if ptr.data == value: return pos', '  ptr = ptr.next; pos = pos + 1', 'while ptr != head; return NOT FOUND'],
    },
  };
  DSA.viz.define('list', {
    title: 'Linked list',
    blurb: 'Nodes live anywhere in memory and are chained by pointers. Insertion and deletion only rewire pointers; nothing is shifted.',
    variants: [{ id: 'singly', label: 'Singly' }, { id: 'doubly', label: 'Doubly' }, { id: 'circular', label: 'Circular' }],
    args: {
      value: { label: 'Value', type: 'int', def: () => rand(1, 99), fresh: true },
      pos: { label: 'Position', type: 'int', def: 2, min: 0, max: 9 },
    },
    ops: [
      { id: 'insF', label: 'Insert at front', uses: ['value'], primary: true }, { id: 'insE', label: 'Insert at end', uses: ['value'] }, { id: 'insAt', label: 'Insert at position', uses: ['value', 'pos'] },
      { id: 'delF', label: 'Delete front' }, { id: 'delE', label: 'Delete end' }, { id: 'delV', label: 'Delete value', uses: ['value'] },
      { id: 'search', label: 'Search', uses: ['value'] }, { id: 'reverse', label: 'Reverse', only: ['singly'] },
    ],
    create: (variant) => ({ variant, a: [{ v: 10, k: 0 }, { v: 15, k: 1 }, { v: 23, k: 2 }, { v: 40, k: 3 }], uid: 4 }),
    draw(st, m) {
      const nodes = [], edges = [], v = st.variant, gap = GAP[v], n = st.a.length, dbl = v === 'doubly', circ = v === 'circular';
      const id = (it) => 'n' + it.k;
      const nx = (i) => i * gap;
      const mk = (it, x, y, cls) => (dbl ? { id: id(it), shape: 'rect', x, y, w: 100, h: 40, text: it.v, divs: [0.25, 0.75], cls } : D.lnode(id(it), it.v, x, y, cls));
      const nextEdge = (from, to, cls, back) => {
        if (!to) return null;
        const e = dbl ? { id: from + '>next', from, to, fa: [37, -7], cls } : D.next(from, to, cls);
        if (back) { e.bend = -Math.max(54, back * 9); e.ta = [-10, 21]; e.fa = dbl ? e.fa : [25, 6]; }
        return e;
      };
      const rev = m.rev == null ? -1 : m.rev;
      st.a.forEach((it, i) => {
        nodes.push(Object.assign(mk(it, nx(i), 0, (m.hl && m.hl[i]) || ''), { enter: [0, -86] }));
        // forward link (possibly overridden while pointers are being rewired)
        let to, cls = '', back = 0;
        if (m.nextOf && it.k in m.nextOf) { to = m.nextOf[it.k]; cls = 'e-hl'; }
        else if (i < rev) { to = i === 0 ? 'nullL' : id(st.a[i - 1]); cls = 'e-ok'; }
        else if (i < n - 1) to = id(st.a[i + 1]);
        else if (circ) { to = id(st.a[0]); back = n; }
        else to = 'null';
        if (circ && to === id(st.a[0]) && i === n - 1) back = n;
        if (to === id(it)) { edges.push({ id: id(it) + '>next', from: id(it), to: id(it), fa: [25, 6], ta: [-10, 21], bend: -34, cls }); }
        else { const e = nextEdge(id(it), to, cls, back); if (e) edges.push(e); }
        if (dbl) {
          const pto = m.prevOf && it.k in m.prevOf ? m.prevOf[it.k] : i > 0 ? id(st.a[i - 1]) : 'nullL';
          if (pto) edges.push({ id: id(it) + '>prev', from: id(it), to: pto, fa: [-37, 7], cls: m.prevOf && it.k in m.prevOf ? 'e-hl' : 'e-alt' });
        }
      });
      if (!circ) nodes.push(D.text('null', 'NULL', n * gap - (dbl ? 4 : 12), 0, 't-null'));
      if (dbl || rev >= 0) nodes.push(D.text('nullL', 'NULL', -gap + (dbl ? 26 : 34), 0, 't-null'));
      if (m.ghost) {
        const g = m.ghost;
        nodes.push(mk(g.it, g.x, -86, 'n-hl'));
        if (g.next) edges.push(nextEdge(id(g.it), g.next, 'e-hl', 0));
        if (dbl && g.prev) edges.push({ id: id(g.it) + '>prev', from: id(g.it), to: g.prev, fa: [-37, 7], cls: 'e-hl' });
      }
      const headAt = m.head == null ? 0 : m.head;
      if (m.headOnGhost) nodes.push(D.tag('head', 'head', m.ghost.x, -126, 'down', 'n-ptr'));
      else nodes.push(D.tag('head', n ? 'head' : 'head = NULL', n ? nx(headAt) : 0, -40, n ? 'down' : 'none', 'n-ptr'));
      (m.ptrs || []).forEach((p, j) => nodes.push(D.tag('ptr-' + p.name, p.name, p.i < 0 ? -gap + 34 : p.i >= n && !circ ? n * gap - 12 : nx(p.i % Math.max(n, 1)), 44 + (p.row || 0) * 28, 'up', p.cls || 'n-ptr2')));
      return { nodes, edges };
    },
    run(st, op, a, snap) {
      const def = DSA.viz.get('list');
      def.code = CODE[st.variant];
      const v = st.variant, dbl = v === 'doubly', circ = v === 'circular', gap = GAP[v];
      const id = (it) => 'n' + it.k;
      const n = st.a.length;
      const walk = (to, line, why) => { for (let i = 0; i <= to; i++) snap(i === to ? why : `Move \`ptr\` along the list…`, { line, ptrs: [{ name: 'ptr', i }], hl: { [i]: 'n-cmp' } }, { hold: i === to ? 1 : 0.55 }); };

      if (op === 'insF' || op === 'insE' || op === 'insAt') {
        if (n >= 8) return snap('This demo list holds at most 8 nodes. Delete one first.', { tone: 'bad' });
        const p = op === 'insF' ? 0 : op === 'insE' ? n : a.pos;
        if (p > n) throw new VizError(`Position must be between 0 and ${n} (the list has ${n} node${n === 1 ? '' : 's'}).`);
        const it = { v: a.value, k: st.uid++ };
        const gx = p * gap - gap / 2;
        const succ = p < n ? id(st.a[p]) : circ ? (n ? id(st.a[0]) : null) : 'null';
        const pred = p > 0 ? st.a[p - 1] : circ && n ? st.a[n - 1] : null;
        const ghost = { it, x: gx };
        snap(`Allocate a new node holding ${a.value}.`, { line: 0, ghost });
        if (p > 0) walk(p - 1, op === 'insE' ? 2 : 1, op === 'insE' ? '`ptr` is at the last node.' : `\`ptr\` is at position ${p - 1}, just before the insertion point.`);
        else if (circ && n) walk(n - 1, 2, 'In a circular list the last node must be updated too, so walk to it.');
        const ptrs = p > 0 ? [{ name: 'ptr', i: p - 1 }] : circ && n ? [{ name: 'ptr', i: n - 1 }] : [];
        const g2 = { it, x: gx, next: succ || undefined, prev: dbl ? (p > 0 ? id(st.a[p - 1]) : 'nullL') : undefined };
        if (circ && !n) { st.a.push(it); return snap('The list was empty: the node points to itself and `head` points to it.', { line: 2, hl: { 0: 'n-ok' } }); }
        snap(`Set the new node's \`next\` to ${p < n ? 'the node now at position ' + p : circ ? 'the head (the list is circular)' : 'NULL'}${dbl ? ' and its `prev` to ' + (p > 0 ? 'the node before it' : 'NULL') : ''}. Nothing in the list has changed yet.`, { line: dbl ? (op === 'insF' ? 1 : 2) : op === 'insF' ? 1 : op === 'insE' ? (circ ? 2 : 0) : 2, ghost: g2, ptrs });
        const nextOf = pred ? { [pred.k]: id(it) } : {};
        const prevOf = dbl && p < n ? { [st.a[p].k]: id(it) } : {};
        snap(p === 0 ? `${circ ? 'Point the last node at the new node and move' : dbl && n ? 'Set the old head\'s `prev` to the new node and move' : 'Move'} \`head\` to the new node.` : `Rewire: the previous node's \`next\` now points to the new node${dbl && p < n ? ', and the following node\'s `prev` points back to it' : ''}.`, { line: 3, ghost: g2, nextOf, prevOf, ptrs, headOnGhost: p === 0 });
        st.a.splice(p, 0, it);
        snap(`${a.value} is in the list at position ${p}. ${p === 0 && !circ ? 'Inserting at the front is O(1).' : 'Finding the place is O(n); the rewiring itself is O(1).'}`, { hl: { [p]: 'n-ok' }, tone: 'good' });
        return;
      }

      if (op === 'search') {
        if (!n) return snap('The list is empty.', { tone: 'bad' });
        for (let i = 0; i < n; i++) {
          const hit = st.a[i].v === a.value;
          snap(hit ? `Node at position ${i} holds ${a.value}. **Found** after ${i + 1} comparison(s).` : `${st.a[i].v} ≠ ${a.value}, move to the next node.`, { line: hit ? 2 : 3, ptrs: [{ name: 'ptr', i }], hl: { [i]: hit ? 'n-ok' : 'n-cmp' }, tone: hit ? 'good' : '' }, { hold: hit ? 1 : 0.7 });
          if (hit) return;
        }
        return snap(`${circ ? '`ptr` is back at `head`' : '`ptr` reached NULL'}: ${a.value} is **not in the list**. Linear search on a list is O(n); binary search is not possible because there is no random access.`, { line: 4, ptrs: circ ? [{ name: 'ptr', i: 0 }] : [{ name: 'ptr', i: n }], tone: 'bad' });
      }

      if (op === 'reverse') {
        if (n < 2) return snap('A list with fewer than two nodes is already its own reverse.', {});
        snap('Three pointers: `prev` (the part already reversed), `cur` (the node being turned) and `next` (so the rest is not lost).', { line: 0, rev: 0, ptrs: [{ name: 'prev', i: -1, cls: 'n-ptr3' }, { name: 'cur', i: 0, row: 0 }] });
        for (let i = 0; i < n; i++) {
          snap(`Save \`next = cur.next\` before breaking the link.`, { line: 2, rev: i, hl: { [i]: 'n-cmp' }, ptrs: [{ name: 'prev', i: i - 1, cls: 'n-ptr3' }, { name: 'cur', i }, { name: 'next', i: i + 1, cls: 'n-good', row: 1 }] }, { hold: 0.8 });
          snap(`Turn the arrow around: \`cur.next = prev\`.`, { line: 3, rev: i + 1, hl: { [i]: 'n-ok' }, ptrs: [{ name: 'prev', i: i - 1, cls: 'n-ptr3' }, { name: 'cur', i }, { name: 'next', i: i + 1, cls: 'n-good', row: 1 }] });
          snap('Slide the pointers one node ahead.', { line: 4, rev: i + 1, ptrs: [{ name: 'prev', i, cls: 'n-ptr3' }, { name: 'cur', i: i + 1 }] }, { hold: 0.7 });
        }
        snap('`cur` is NULL, so `prev` is the new head.', { line: 5, rev: n, head: n - 1, ptrs: [{ name: 'prev', i: n - 1, cls: 'n-ptr3' }] });
        st.a.reverse();
        return snap('Reversed in one pass: O(n) time, O(1) extra space. (Redrawn with the head on the left.)', { tone: 'good' });
      }

      // deletions
      if (!n) return snap('**Underflow.** The list is empty (`head == NULL`).', { line: 0, tone: 'bad' });
      let p;
      if (op === 'delF') p = 0;
      else if (op === 'delE') p = n - 1;
      else {
        p = -1;
        for (let i = 0; i < n && p < 0; i++) {
          const hit = st.a[i].v === a.value;
          snap(hit ? `Found ${a.value} at position ${i}.` : `${st.a[i].v} ≠ ${a.value}, keep going${dbl ? '' : ' (remember the previous node)'}.`, { line: 1, ptrs: dbl || i === 0 ? [{ name: 'cur', i }] : [{ name: 'prev', i: i - 1, cls: 'n-ptr3' }, { name: 'cur', i, row: 0 }], hl: { [i]: hit ? 'n-bad' : 'n-cmp' } }, { hold: hit ? 1 : 0.7 });
          if (hit) p = i;
        }
        if (p < 0) return snap(`${a.value} is not in the list, so nothing is deleted.`, { line: 2, tone: 'bad' });
      }
      const it = st.a[p];
      if (op === 'delE' && n > 1) walk(dbl ? n - 1 : n - 2, 1, dbl ? '`ptr` is at the last node; its `prev` gives the second-last directly.' : '`ptr` stops at the second-last node, because the last node has no way back.');
      if (op === 'delF' && circ && n > 1) walk(n - 1, 1, 'Walk to the last node: its `next` must skip the old head.');
      const succ = p < n - 1 ? id(st.a[p + 1]) : circ ? (n > 1 ? id(st.a[0]) : null) : 'null';
      const pred = p > 0 ? st.a[p - 1] : circ && n > 1 ? st.a[n - 1] : null;
      const nextOf = pred ? { [pred.k]: p === n - 1 && circ ? id(st.a[0]) : succ } : {};
      if (p === 0 && circ && n > 1) nextOf[st.a[n - 1].k] = id(st.a[1]);
      const prevOf = dbl && p < n - 1 ? { [st.a[p + 1].k]: p > 0 ? id(st.a[p - 1]) : 'nullL' } : {};
      snap(p === 0 ? `Unlink the first node: \`head\` moves to the next node${circ && n > 1 ? ' and the last node now points to the new head' : ''}${dbl && n > 1 ? ', whose `prev` becomes NULL' : ''}.` : `Bypass the node: the previous node's \`next\` now points ${p === n - 1 ? (circ ? 'back to the head' : 'to NULL') : 'to the node after it'}${dbl && p < n - 1 ? ', and that node\'s `prev` points back' : ''}.`, { line: op === 'delV' ? 3 : 2, hl: { [p]: 'n-bad' }, nextOf, prevOf, head: p === 0 && n > 1 ? 1 : 0 });
      st.a.splice(p, 1);
      snap(`free() the node holding ${it.v}. ${p === 0 && !circ ? 'Deleting the front is O(1).' : dbl && op === 'delE' ? 'With a tail pointer a doubly linked list does this in O(1).' : 'Reaching the node is O(n); unlinking is O(1).'}`, { line: op === 'delV' ? 4 : 3, tone: 'good' });
    },
    code: CODE.singly,
    demo: [['insF', { value: 5 }], ['insAt', { value: 35, pos: 4 }], ['delV', { value: 15 }], ['search', { value: 40 }]],
    view: { minW: 720, minH: 300 },
  });

  /* ---------------- Floyd's cycle detection ---------------- */
  DSA.viz.define('cycle', {
    title: 'Cycle detection (Floyd)',
    blurb: 'A slow pointer moves one node at a time, a fast pointer two. If the list loops they must meet; if the fast pointer reaches NULL there is no cycle.',
    args: { link: { label: 'Last node links to position (-1 = NULL)', type: 'int', def: 2, min: -1, max: 6 } },
    ops: [{ id: 'detect', label: 'Detect cycle', uses: ['link'], primary: true }],
    create: () => ({ vals: [3, 8, 12, 5, 21, 9, 17], link: 2 }),
    draw(st, m) {
      const n = st.vals.length, gap = 104, nodes = [], edges = [];
      st.vals.forEach((v, i) => {
        nodes.push(D.lnode('n' + i, v, i * gap, 0, (m.hl && m.hl[i]) || ''));
        if (i < n - 1) edges.push(D.next('n' + i, 'n' + (i + 1)));
      });
      if (st.link >= 0) edges.push({ id: 'back', from: 'n' + (n - 1), to: 'n' + st.link, fa: [25, 6], ta: [0, 21], bend: -Math.max(60, (n - 1 - st.link) * 16), cls: 'e-hl' });
      else { nodes.push(D.text('null', 'NULL', n * gap - 12, 0, 't-null')); edges.push(D.next('n' + (n - 1), 'null')); }
      nodes.push(D.tag('head', 'head', 0, -42, 'down', 'n-ptr'));
      if (m.slow != null) nodes.push(D.tag('slow', 'slow', m.slow >= n ? n * gap - 12 : m.slow * gap - 18, -42 - (m.slow === 0 ? 28 : 0), 'down', 'n-ptr3'));
      if (m.fast != null) nodes.push(D.tag('fast', 'fast', m.fast >= n ? n * gap - 12 : m.fast * gap + 18, -42 - (m.fast === 0 ? 56 : 0), 'down', 'n-good'));
      return { nodes, edges };
    },
    run(st, op, a, snap) {
      st.link = a.link;
      const n = st.vals.length;
      const next = (i) => (i === n - 1 ? (st.link >= 0 ? st.link : n) : i + 1);
      let slow = 0, fast = 0, steps = 0;
      snap('Both pointers start at `head`.', { line: 0, slow, fast });
      for (;;) {
        if (fast >= n || next(fast) >= n) return snap('`fast` ran off the end of the list (NULL), so there is **no cycle**. O(n) time, O(1) space.', { line: 5, slow, fast: n, tone: 'good' });
        slow = next(slow); fast = next(next(fast)); steps++;
        const met = slow === fast;
        snap(met ? `After ${steps} step(s) \`slow\` and \`fast\` are on the same node: the list **has a cycle**. Inside a loop the gap shrinks by one every step, so they always meet. O(n) time, O(1) space.` : `Step ${steps}: \`slow\` moves 1 node, \`fast\` moves 2.`, { line: met ? 4 : 2, slow, fast, hl: met ? { [slow]: 'n-ok' } : { [slow]: 'n-alt', [fast]: 'n-cmp' }, tone: met ? 'good' : '' });
        if (met) return;
      }
    },
    code: { detect: ['slow = head; fast = head', 'while fast != NULL and fast.next != NULL:', '  slow = slow.next', '  fast = fast.next.next', '  if slow == fast: return CYCLE', 'return NO CYCLE'] },
    demo: [['detect', { link: 2 }]],
    view: { minW: 760, minH: 300 },
  });

  /* ---------------- multi-linked list (sparse matrix) ---------------- */
  const SPARSE = [[0, 0, 5], [0, 3, 8], [1, 1, 3], [2, 0, 6], [2, 2, 7], [3, 1, 4], [3, 3, 9]];
  DSA.viz.define('multilist', {
    title: 'Multi-linked list',
    blurb: 'A node may sit on more than one list at once. Here every non-zero element of a sparse matrix is on its row list (→ right) and its column list (↓ down).',
    args: { r: { label: 'Row', type: 'int', def: 2, min: 0, max: 3 }, c: { label: 'Column', type: 'int', def: 1, min: 0, max: 3 } },
    ops: [{ id: 'row', label: 'Traverse row', uses: ['r'], primary: true }, { id: 'col', label: 'Traverse column', uses: ['c'] }],
    create: () => ({}),
    draw(st, m) {
      const nodes = [], edges = [], X = (c) => c * 112, Y = (r) => r * 70;
      const hl = m.hl || {};
      for (let i = 0; i < 4; i++) {
        nodes.push({ id: 'R' + i, shape: 'rect', x: -108, y: Y(i), w: 58, h: 34, text: 'row ' + i, cls: 'n-head ' + (m.rowHead === i ? 'n-hl' : '') });
        nodes.push({ id: 'C' + i, shape: 'rect', x: X(i), y: -72, w: 58, h: 34, text: 'col ' + i, cls: 'n-head ' + (m.colHead === i ? 'n-hl' : '') });
      }
      SPARSE.forEach(([r, c, v]) => nodes.push({ id: `e${r}_${c}`, shape: 'rect', x: X(c), y: Y(r), w: 62, h: 40, text: v, sub: `(${r},${c})`, cls: hl[r + '_' + c] || '' }));
      for (let r = 0; r < 4; r++) { let prev = 'R' + r; SPARSE.filter((e) => e[0] === r).forEach(([, c]) => { edges.push({ id: prev + '>r', from: prev, to: `e${r}_${c}`, cls: m.rowHead === r ? 'e-hl' : '' }); prev = `e${r}_${c}`; }); }
      for (let c = 0; c < 4; c++) { let prev = 'C' + c; SPARSE.filter((e) => e[1] === c).sort((p, q) => p[0] - q[0]).forEach(([r]) => { edges.push({ id: prev + '>d', from: prev, to: `e${r}_${c}`, cls: m.colHead === c ? 'e-hl' : 'e-alt' }); prev = `e${r}_${c}`; }); }
      return { nodes, edges };
    },
    run(st, op, a, snap) {
      const row = op === 'row', k = row ? a.r : a.c;
      const items = SPARSE.filter((e) => e[row ? 0 : 1] === k).sort((p, q) => p[row ? 1 : 0] - q[row ? 1 : 0]);
      const hl = {}, key = row ? 'rowHead' : 'colHead';
      snap(`Start at the header of ${row ? 'row' : 'column'} ${k} and follow the ${row ? '`right`' : '`down`'} links.`, { [key]: k, line: 0 });
      items.forEach(([r, c, v]) => { hl[r + '_' + c] = 'n-ok'; snap(`Visit (${r}, ${c}) = ${v}.`, { [key]: k, hl: Object.assign({}, hl, { [r + '_' + c]: 'n-hl' }), line: 1 }); });
      snap(`${row ? 'Row' : 'Column'} ${k} has ${items.length} non-zero element(s): ${items.map((e) => e[2]).join(', ') || 'none'}. Only non-zero cells were touched, never the zeros. The same nodes are reachable along the other direction too, which is what makes the list *multi*-linked.`, { [key]: k, hl, line: 2, tone: 'good' });
    },
    code: {
      row: ['ptr = rowHeader[r].right', 'while ptr != NULL: visit ptr; ptr = ptr.right', 'done'],
      col: ['ptr = colHeader[c].down', 'while ptr != NULL: visit ptr; ptr = ptr.down', 'done'],
    },
    demo: [['row', { r: 2 }], ['col', { c: 1 }]],
    view: { minW: 620, minH: 380 },
  });
})();
