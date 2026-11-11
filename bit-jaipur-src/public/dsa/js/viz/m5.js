/* ============================================================
 * viz/m5.js — Module V: binary search tree, AVL tree, heap,
 * disjoint sets, graph traversal (BFS / DFS) and spanning trees.
 * ============================================================ */
(function () {
  'use strict';
  const DSA = window.DSA;
  const D = DSA.draw;
  const { rand } = DSA.UI;
  const VizError = DSA.VizError;

  /* ---------- binary tree layout (inorder column, depth row) ---------- */
  const XG = 54, YG = 70;
  function layout(root) {
    const pos = new Map(); let col = 0;
    const walk = (t, d) => { if (!t) return; walk(t.l, d + 1); pos.set(t, [col++ * XG, d * YG]); walk(t.r, d + 1); };
    walk(root, 0);
    return pos;
  }
  const height = (t) => (t ? t.h : 0);
  const upd = (t) => { t.h = 1 + Math.max(height(t.l), height(t.r)); return t; };
  const bf = (t) => height(t.l) - height(t.r);
  function treeNodes(root, m, opts) {
    const nodes = [], edges = [], pos = layout(root);
    const walk = (t) => {
      if (!t) return;
      const [x, y] = pos.get(t);
      nodes.push({ id: 'k' + t.id, shape: 'circle', x, y, w: 44, text: t.v, sub: opts.avl ? `bf ${bf(t)}` : undefined, cls: (m.hl && m.hl[t.v]) || '', enter: [0, -30] });
      [t.l, t.r].forEach((c) => { if (c) { edges.push({ id: `e${t.id}>${c.id}`, from: 'k' + t.id, to: 'k' + c.id, arrow: false, cls: m.edge && m.edge[c.v] ? m.edge[c.v] : '' }); walk(c); } });
    };
    walk(root);
    return { nodes, edges, pos };
  }
  function outRow(out, x0, y) {
    return out.map((v, i) => ({ id: 'out' + i, shape: 'rect', x: x0 + i * 40, y, w: 34, h: 32, text: v, cls: 'n-token n-ok', enter: [0, -16] }));
  }

  /* ---------------- BST / AVL ---------------- */
  const INSERT_BST = ['node = root', 'if value < node.data: go left, else go right', 'repeat until an empty child is found', 'attach the new node there'];
  const TREE_CODE = {
    bst: { insert: INSERT_BST, search: ['node = root', 'while node != NULL:', '  if key == node.data: return FOUND', '  node = (key < node.data) ? node.left : node.right', 'return NOT FOUND'], delete: ['find the node', 'leaf: just remove it', 'one child: replace it by that child', 'two children: copy the inorder successor (smallest in the right subtree) here, then delete the successor'], inorder: ['inorder(node): inorder(left); visit(node); inorder(right)'], preorder: ['preorder(node): visit(node); preorder(left); preorder(right)'], postorder: ['postorder(node): postorder(left); postorder(right); visit(node)'], level: ['queue = [root]', 'while queue is not empty: node = dequeue(); visit(node)', '  enqueue node.left and node.right (if present)'] },
  };
  TREE_CODE.avl = Object.assign({}, TREE_CODE.bst, { insert: ['insert as in a BST', 'on the way back up, update heights', 'balance factor = height(left) - height(right)', 'if it becomes +2 or -2: rotate (LL, RR, LR or RL)'], delete: ['delete as in a BST', 'on the way back up, update heights and balance factors', 'rotate any node whose balance factor is +2 or -2'] });
  DSA.viz.define('tree', {
    title: 'Binary search tree',
    blurb: 'Left subtree < node < right subtree, so search, insert and delete follow one root-to-leaf path: O(height). An AVL tree rotates to keep the height O(log n).',
    variants: [{ id: 'bst', label: 'BST' }, { id: 'avl', label: 'AVL (height balanced)' }],
    args: { value: { label: 'Value', type: 'int', def: () => rand(1, 99), fresh: true, min: 0, max: 99 }, list: { label: 'Build from list', type: 'list', def: '50, 30, 70, 20, 40, 60, 80', max: 12 } },
    ops: [{ id: 'insert', label: 'Insert', uses: ['value'], primary: true }, { id: 'search', label: 'Search', uses: ['value'] }, { id: 'delete', label: 'Delete', uses: ['value'] }, { id: 'build', label: 'Build from list', uses: ['list'] },
      { id: 'inorder', label: 'Inorder' }, { id: 'preorder', label: 'Preorder' }, { id: 'postorder', label: 'Postorder' }, { id: 'level', label: 'Level order' }],
    create: (variant) => ({ variant, root: null, size: 0 }),
    draw(st, m) {
      const { nodes, edges, pos } = treeNodes(st.root, m, { avl: st.variant === 'avl' });
      if (m.out) { const xs = [...pos.values()].map((p) => p[0]), maxY = Math.max(0, ...[...pos.values()].map((p) => p[1])); nodes.push(D.text('olbl', 'visited:', Math.min(0, ...xs) - 30, maxY + 90, 't-muted', 'end'), ...outRow(m.out, Math.min(0, ...xs) - 10, maxY + 90)); }
      if (!st.root) nodes.push(D.text('empty', 'empty tree', 0, 0, 't-muted'));
      return { nodes, edges };
    },
    run(st, op, a, snap) {
      const avl = st.variant === 'avl', def = DSA.viz.get('tree');
      def.code = TREE_CODE[st.variant];
      const mk = (v) => ({ v, l: null, r: null, h: 1, id: (st.uid = (st.uid || 0) + 1) });   // the id (not the value) names the node on screen: deleting copies a value into another node
      const hl = {};

      /* AVL rebalancing, with a before/after frame for each rotation */
      const rotR = (y) => { const x = y.l; y.l = x.r; x.r = y; upd(y); upd(x); return x; };
      const rotL = (x) => { const y = x.r; x.r = y.l; y.l = x; upd(x); upd(y); return y; };
      const rebalance = (t, line) => {
        upd(t); if (!avl) return t;
        const b = bf(t);
        if (Math.abs(b) < 2) return t;
        const kind = b > 1 ? (bf(t.l) >= 0 ? 'LL' : 'LR') : (bf(t.r) <= 0 ? 'RR' : 'RL');
        const why = { LL: 'left-left: one right rotation at this node', RR: 'right-right: one left rotation at this node', LR: 'left-right: rotate the left child left, then this node right', RL: 'right-left: rotate the right child right, then this node left' }[kind];
        snap(`Node ${t.v} has balance factor **${b > 0 ? '+' : ''}${b}**: the tree is out of balance (${why}).`, { line, hl: { [t.v]: 'n-bad' } }, { hold: 1.2 });
        let res;
        if (kind === 'LL') res = rotR(t); else if (kind === 'RR') res = rotL(t);
        else if (kind === 'LR') { t.l = rotL(t.l); res = rotR(t); } else { t.r = rotR(t.r); res = rotL(t); }
        return { rotated: res, kind, from: t };
      };
      const settle = (root, line) => { if (st.pending) { const p = st.pending; st.pending = null; snap(`After the ${p.kind} rotation ${p.rotated.v} is the root of this subtree and every balance factor is back in −1…+1.`, { line, hl: { [p.rotated.v]: 'n-ok' } }); } return root; };

      const insert = (t, v) => {
        if (!t) return mk(v);
        hl[t.v] = 'n-cmp';
        if (v < t.v) { snap(`${v} < ${t.v}: go left.`, { line: 1, hl: { [t.v]: 'n-cmp' }, edge: {} }, { hold: 0.6 }); t.l = insert(t.l, v); }
        else { snap(`${v} > ${t.v}: go right.`, { line: 1, hl: { [t.v]: 'n-cmp' } }, { hold: 0.6 }); t.r = insert(t.r, v); }
        return fixUp(t, 2);
      };
      const fixUp = (t, line) => { const r = rebalance(t, line); if (r && r.rotated) { st.pending = r; return r.rotated; } return r || t; };
      const minNode = (t) => { while (t.l) t = t.l; return t; };
      const remove = (t, v) => {
        if (!t) return null;
        if (v < t.v) { snap(`${v} < ${t.v}: go left.`, { line: 0, hl: { [t.v]: 'n-cmp' } }, { hold: 0.6 }); t.l = remove(t.l, v); }
        else if (v > t.v) { snap(`${v} > ${t.v}: go right.`, { line: 0, hl: { [t.v]: 'n-cmp' } }, { hold: 0.6 }); t.r = remove(t.r, v); }
        else if (!t.l || !t.r) { const c = t.l || t.r; snap(!c ? `${v} is a leaf: simply remove it.` : `${v} has one child (${c.v}): the child takes its place.`, { line: !c ? 1 : 2, hl: { [t.v]: 'n-bad' } }); return c; }
        else { const s = minNode(t.r); snap(`${v} has two children. Its inorder successor is ${s.v} (the smallest value in the right subtree): copy ${s.v} here, then delete the original ${s.v}.`, { line: 3, hl: { [t.v]: 'n-bad', [s.v]: 'n-hl' } }, { hold: 1.3 }); t.v = s.v; t.r = remove(t.r, s.v); }
        return fixUp(t, 1);
      };
      const has = (t, v) => { while (t) { if (v === t.v) return true; t = v < t.v ? t.l : t.r; } return false; };

      if (op === 'insert' || op === 'build') {
        const vals = op === 'build' ? a.list : [a.value];
        if (op === 'build') { st.root = null; snap('Starting from an empty tree; each value is inserted in turn.', {}); }
        for (const v of vals) {
          if (has(st.root, v)) { snap(`${v} is already in the tree (this demo keeps keys distinct).`, { tone: 'bad' }); continue; }
          if (!st.root) { st.root = mk(v); snap(`The tree is empty: ${v} becomes the root.`, { line: 3, hl: { [v]: 'n-ok' } }); continue; }
          st.pending = null;
          st.root = insert(st.root, v);
          if (st.pending) settle(st.root, 2);
          snap(`${v} inserted. ${avl ? 'Height of the tree: ' + height(st.root) + '.' : 'Cost = number of levels visited: O(height).'}`, { line: 3, hl: { [v]: 'n-ok' }, tone: 'good' });
        }
        return;
      }
      if (op === 'search') {
        let t = st.root;
        if (!t) return snap('The tree is empty.', { tone: 'bad' });
        while (t) {
          if (a.value === t.v) return snap(`${a.value} = ${t.v}: **found**.`, { line: 2, hl: { [t.v]: 'n-ok' }, tone: 'good' });
          snap(`${a.value} ${a.value < t.v ? '<' : '>'} ${t.v}: go ${a.value < t.v ? 'left' : 'right'}.`, { line: 3, hl: { [t.v]: 'n-cmp' } }, { hold: 0.7 });
          t = a.value < t.v ? t.l : t.r;
        }
        return snap(`Reached an empty child: ${a.value} is **not in the tree**.`, { line: 4, tone: 'bad' });
      }
      if (op === 'delete') {
        if (!has(st.root, a.value)) return snap(`${a.value} is not in the tree.`, { tone: 'bad' });
        st.pending = null; st.root = remove(st.root, a.value);
        if (st.pending) settle(st.root, 2);
        return snap(`${a.value} deleted.`, { tone: 'good' });
      }
      // traversals
      if (!st.root) return snap('The tree is empty.', { tone: 'bad' });
      const out = [];
      const visit = (t, why) => { out.push(t.v); snap(`Visit ${t.v}. ${why || ''}`, { line: 0, hl: { [t.v]: 'n-ok' }, out: out.slice() }, { hold: 0.8 }); };
      const go = (t) => {
        if (!t) return;
        if (op === 'preorder') visit(t, '(node first)');
        go(t.l);
        if (op === 'inorder') visit(t, '(left subtree done, now the node)');
        go(t.r);
        if (op === 'postorder') visit(t, '(both subtrees done, now the node)');
      };
      if (op === 'level') {
        const q = [st.root];
        while (q.length) { const t = q.shift(); out.push(t.v); snap(`Dequeue and visit ${t.v}${t.l || t.r ? ', enqueue its children' : ''}. Queue: ${q.concat([t.l, t.r].filter(Boolean)).map((x) => x.v).join(', ') || 'empty'}.`, { line: 1, hl: { [t.v]: 'n-ok' }, out: out.slice() }, { hold: 0.8 }); if (t.l) q.push(t.l); if (t.r) q.push(t.r); }
      } else go(st.root);
      snap(`${op[0].toUpperCase() + op.slice(1)} order: **${out.join(', ')}**${op === 'inorder' ? ' (sorted, which is the key property of a BST)' : ''}.`, { out, tone: 'good' });
    },
    code: TREE_CODE.bst,
    demo: [['build', { list: [50, 30, 70, 20, 40, 60, 80] }], ['inorder']],
    view: { minW: 620, minH: 320 },
  });

  /* ---------------- heap ---------------- */
  DSA.viz.define('heap', {
    title: 'Heap',
    blurb: 'A complete binary tree stored in an array: the children of i are 2i+1 and 2i+2. In a max-heap every parent is ≥ its children, so the maximum is always at the root.',
    variants: [{ id: 'max', label: 'Max-heap' }, { id: 'min', label: 'Min-heap' }],
    args: { value: { label: 'Value', type: 'int', def: () => rand(1, 99), fresh: true, min: 0, max: 99 }, list: { label: 'Build from list', type: 'list', def: '4, 10, 3, 5, 1, 8, 7', max: 12 } },
    ops: [{ id: 'insert', label: 'Insert', uses: ['value'], primary: true }, { id: 'extract', label: 'Extract root' }, { id: 'build', label: 'Build heap (heapify)', uses: ['list'] }],
    create: (variant) => ({ variant, a: [], uid: 0 }),
    draw(st, m) {
      const nodes = [], edges = [], n = st.a.length;
      const depthOf = (i) => Math.floor(Math.log2(i + 1)), W = 62;
      st.a.forEach((it, i) => {
        const d = depthOf(i), levels = Math.max(1, depthOf(Math.max(n - 1, 0)) + 1), span = Math.pow(2, levels - 1) * W;
        const idxInLevel = i - (Math.pow(2, d) - 1), slots = Math.pow(2, d);
        const x = (idxInLevel + 0.5) * (span / slots) - span / 2, y = d * 66;
        nodes.push({ id: 'h' + it.k, shape: 'circle', x, y, w: 42, text: it.v, cls: (m.hl && m.hl[i]) || '', enter: [0, -20] });
        if (i > 0) edges.push({ id: 'he' + it.k, from: 'h' + st.a[(i - 1) >> 1].k, to: 'h' + it.k, arrow: false });
      });
      const base = Math.max(0, depthOf(Math.max(n - 1, 0))) * 66 + 90, total = Math.max(n, 1);
      st.a.forEach((it, i) => nodes.push({ id: 'ac' + it.k, shape: 'rect', x: (i - (total - 1) / 2) * 46, y: base, w: 40, h: 36, text: it.v, sub: i, cls: 'n-token ' + ((m.hl && m.hl[i]) || '') }));
      if (!n) nodes.push(D.text('empty', 'empty heap', 0, 0, 't-muted'));
      return { nodes, edges };
    },
    run(st, op, a, snap) {
      const max = st.variant === 'max', better = (x, y) => (max ? x > y : x < y), A = st.a;
      DSA.viz.get('heap').code = { insert: ['append the value at the end (next free leaf)', 'while it has a parent and it beats the parent: swap with the parent', '(sift-up: at most log n swaps)'], extract: ['save the root (the max/min)', 'move the last element to the root', 'sift-down: swap with the better child until the heap property holds', 'return the saved root'], build: ['for i = ⌊n/2⌋ - 1 down to 0: heapify(i)', 'heapify(i): swap with the better child and continue down'] };
      const siftUp = (i) => { for (;;) { if (i === 0) return; const p = (i - 1) >> 1; snap(`Compare ${A[i].v} with its parent ${A[p].v}.`, { line: 1, hl: { [i]: 'n-cmp', [p]: 'n-cmp' } }, { hold: 0.7 }); if (!better(A[i].v, A[p].v)) { snap(`Heap property holds: ${A[p].v} is ${max ? '≥' : '≤'} ${A[i].v}. Stop.`, { line: 1, hl: { [i]: 'n-ok', [p]: 'n-ok' } }); return; } [A[i], A[p]] = [A[p], A[i]]; snap(`${A[p].v} ${max ? '>' : '<'} ${A[i].v}: swap upward.`, { line: 1, hl: { [p]: 'n-hl' } }, { hold: 0.7 }); i = p; } };
      const siftDown = (i, n, line) => { for (;;) { let b = i; const l = 2 * i + 1, r = l + 1; if (l < n && better(A[l].v, A[b].v)) b = l; if (r < n && better(A[r].v, A[b].v)) b = r; const hl = { [i]: 'n-cmp' }; if (l < n) hl[l] = 'n-alt'; if (r < n) hl[r] = 'n-alt'; snap(`Check ${A[i].v} against its children ${[l, r].filter((c) => c < n).map((c) => A[c].v).join(' and ') || '(none)'}.`, { line, hl }, { hold: 0.7 }); if (b === i) { snap('Heap property restored at this node.', { line, hl: { [i]: 'n-ok' } }); return; } [A[i], A[b]] = [A[b], A[i]]; snap(`Swap ${A[b].v} down with the ${max ? 'larger' : 'smaller'} child ${A[i].v}.`, { line, hl: { [b]: 'n-hl' } }, { hold: 0.7 }); i = b; } };
      if (op === 'insert') {
        if (A.length >= 15) return snap('This demo heap holds 15 values.', { tone: 'bad' });
        A.push({ v: a.value, k: st.uid++ }); snap(`Insert ${a.value} as the next leaf, index ${A.length - 1}: the tree stays complete.`, { line: 0, hl: { [A.length - 1]: 'n-hl' } });
        siftUp(A.length - 1); snap(`Done in O(log n): ${A.length} value(s).`, { tone: 'good' });
      } else if (op === 'extract') {
        if (!A.length) return snap('The heap is empty.', { tone: 'bad' });
        const top = A[0].v; snap(`The ${max ? 'maximum' : 'minimum'} is the root, ${top}.`, { line: 0, hl: { 0: 'n-ok' } });
        const last = A.pop(); if (!A.length) return snap(`${top} was the only value. The heap is now empty.`, { tone: 'good' });
        A[0] = last; snap(`Move the last leaf (${last.v}) to the root and shrink the heap.`, { line: 1, hl: { 0: 'n-hl' } });
        siftDown(0, A.length, 2); snap(`Extracted ${top} in O(log n).`, { line: 3, tone: 'good' });
      } else {
        A.length = 0; a.list.forEach((v) => A.push({ v, k: st.uid++ }));
        snap(`The list as a complete tree (not yet a heap). The last parent is index ⌊${A.length}/2⌋ − 1 = ${(A.length >> 1) - 1}; leaves are already trivial heaps.`, { line: 0 });
        for (let i = (A.length >> 1) - 1; i >= 0; i--) { snap(`Heapify the subtree rooted at index ${i}.`, { line: 1, hl: { [i]: 'n-hl' } }); siftDown(i, A.length, 1); }
        snap('Heap built bottom-up in **O(n)** (cheaper than n inserts, which cost O(n log n)).', { tone: 'good' });
      }
    },
    code: {},
    demo: [['build', { list: [4, 10, 3, 5, 1, 8, 7] }], ['extract']],
    view: { minW: 560, minH: 320 },
  });

  /* ---------------- disjoint set ---------------- */
  DSA.viz.define('dsu', {
    title: 'Disjoint set (union-find)',
    blurb: 'Tracks which elements are in the same group. find(x) walks to the root; union joins two roots. Union by rank and path compression make both almost O(1).',
    variants: [{ id: 'plain', label: 'Union by rank' }, { id: 'compress', label: '+ path compression' }],
    args: { x: { label: 'x', type: 'int', def: 1, min: 0, max: 9 }, y: { label: 'y', type: 'int', def: 2, min: 0, max: 9 } },
    ops: [{ id: 'union', label: 'Union(x, y)', uses: ['x', 'y'], primary: true }, { id: 'find', label: 'Find(x)', uses: ['x'] }, { id: 'same', label: 'Same set?', uses: ['x', 'y'] }],
    create: (variant) => ({ variant, p: Array.from({ length: 10 }, (_, i) => i), r: new Array(10).fill(0) }),
    draw(st, m) {
      const nodes = [], edges = [], kids = st.p.map(() => []);
      st.p.forEach((p, i) => { if (p !== i) kids[p].push(i); });
      let col = 0; const pos = [];
      const place = (i, d) => { if (!kids[i].length) { pos[i] = [col++ * 54, d * 64]; return; } kids[i].forEach((c) => place(c, d + 1)); const xs = kids[i].map((c) => pos[c][0]); pos[i] = [(Math.min(...xs) + Math.max(...xs)) / 2, d * 64]; };
      st.p.forEach((p, i) => { if (p === i) place(i, 0); });
      st.p.forEach((p, i) => { nodes.push({ id: 'd' + i, shape: 'circle', x: pos[i][0], y: pos[i][1], w: 40, text: i, sub: p === i ? 'rank ' + st.r[i] : undefined, cls: (m.hl && m.hl[i]) || '' }); if (p !== i) edges.push({ id: 'p' + i, from: 'd' + i, to: 'd' + p, cls: m.edge === i ? 'e-hl' : '' }); });
      const base = 220; nodes.push(D.text('pl', 'parent[ ]', -40, base, 't-muted', 'end'));
      st.p.forEach((p, i) => nodes.push({ id: 'pa' + i, shape: 'rect', x: i * 44, y: base, w: 38, h: 32, text: p, sub: i, cls: 'n-token ' + (m.hl && m.hl[i] ? m.hl[i] : '') }));
      return { nodes, edges };
    },
    run(st, op, a, snap) {
      const comp = st.variant === 'compress';
      DSA.viz.get('dsu').code = { union: ['rx = find(x); ry = find(y)', 'if rx == ry: already in the same set', 'attach the root of lower rank under the higher rank', 'if equal ranks: pick either and increase its rank'], find: comp ? ['while parent[x] != x: x = parent[x]', 'point every node on the path straight at the root (path compression)'] : ['while parent[x] != x: x = parent[x]', 'return x'], same: ['return find(x) == find(y)'] };
      const find = (x) => {
        const path = [x]; let c = x;
        while (st.p[c] !== c) { c = st.p[c]; path.push(c); snap(`parent[${path[path.length - 2]}] = ${c}: keep climbing.`, { line: 0, hl: { [c]: 'n-cmp' } }, { hold: 0.7 }); }
        snap(`${c} is its own parent: it is the **root** (representative) of the set.`, { line: 0, hl: { [c]: 'n-ok' } });
        if (comp && path.length > 2) { path.slice(0, -1).forEach((n) => { st.p[n] = c; }); snap(`Path compression: every node on the path now points directly at ${c}, so the next find is one step.`, { line: 1, hl: Object.fromEntries(path.map((n) => [n, 'n-ok'])) }); }
        return c;
      };
      if (op === 'find') { const r = find(a.x); return snap(`find(${a.x}) = **${r}**.`, { tone: 'good', hl: { [r]: 'n-ok' } }); }
      if (op === 'same') { const rx = find(a.x), ry = find(a.y); return snap(rx === ry ? `Both have root ${rx}: **same set**.` : `Roots ${rx} and ${ry} differ: **different sets**.`, { tone: rx === ry ? 'good' : 'bad' }); }
      const rx = find(a.x), ry = find(a.y);
      if (rx === ry) return snap(`${a.x} and ${a.y} already share root ${rx}: nothing to do (joining would create a cycle).`, { line: 1, tone: 'bad' });
      let hi = rx, lo = ry; if (st.r[rx] < st.r[ry]) { hi = ry; lo = rx; }
      snap(`Roots ${rx} (rank ${st.r[rx]}) and ${ry} (rank ${st.r[ry]}). The shorter tree goes under the taller one so trees stay shallow.`, { line: 2, hl: { [rx]: 'n-cmp', [ry]: 'n-cmp' } });
      st.p[lo] = hi; if (st.r[rx] === st.r[ry]) st.r[hi]++;
      snap(`parent[${lo}] = ${hi}. ${a.x} and ${a.y} are now in one set.`, { line: 3, hl: { [hi]: 'n-ok', [lo]: 'n-ok' }, edge: lo, tone: 'good' });
    },
    code: {},
    demo: [['union', { x: 1, y: 2 }], ['union', { x: 3, y: 4 }], ['union', { x: 2, y: 4 }], ['find', { x: 3 }]],
    view: { minW: 560, minH: 330 },
  });

  /* ---------------- graph: BFS / DFS / spanning trees ---------------- */
  const GN = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const GP = { A: [0, 70], B: [110, 0], C: [110, 140], D: [240, 0], E: [240, 140], F: [360, 70], G: [470, 70] };
  const GE = [['A', 'B', 4], ['A', 'C', 2], ['B', 'D', 7], ['C', 'E', 3], ['B', 'C', 1], ['D', 'F', 5], ['E', 'F', 6], ['D', 'E', 8], ['F', 'G', 9]];
  const adj = (v) => GE.filter((e) => e[0] === v || e[1] === v).map((e) => (e[0] === v ? e[1] : e[0])).sort();
  const eid = (a, b) => [a, b].sort().join('');
  DSA.viz.define('graph', {
    title: 'Graph algorithms',
    blurb: 'Traversals visit every vertex reachable from a start vertex (neighbours in alphabetical order). Kruskal and Prim build a minimum spanning tree: V − 1 edges, no cycle, least total weight.',
    variants: [{ id: 'bfs', label: 'BFS' }, { id: 'dfs', label: 'DFS' }, { id: 'kruskal', label: 'Kruskal MST' }, { id: 'prim', label: 'Prim MST' }, { id: 'dijkstra', label: 'Dijkstra' }],
    args: { start: { label: 'Start vertex', type: 'text', def: 'A' } },
    ops: [{ id: 'go', label: 'Run', uses: ['start'], primary: true }],
    create: (variant) => ({ variant, vis: {}, tree: {}, ds: [], order: [], note: '', dist: null }),
    draw(st, m) {
      const nodes = [], edges = [], X = 120;
      GN.forEach((v) => nodes.push({ id: 'g' + v, shape: 'circle', x: GP[v][0], y: GP[v][1], w: 44, text: v, cls: (m.hl && m.hl[v]) || (st.vis[v] ? 'n-ok' : '') }));
      GE.forEach(([u, v, w]) => { const k = eid(u, v); edges.push({ id: 'ge' + k, from: 'g' + u, to: 'g' + v, arrow: false, label: st.variant === 'bfs' || st.variant === 'dfs' ? undefined : w, cls: (m.eh && m.eh[k]) || (st.tree[k] ? 'e-ok' : st.running ? 'e-dim' : '') }); });
      const y0 = 230;
      if (st.variant === 'bfs' || st.variant === 'dfs') {
        nodes.push(D.text('dsl', st.variant === 'bfs' ? 'queue (front →)' : 'stack (top →)', -50, y0, 't-accent', 'start'));
        st.ds.forEach((v, i) => nodes.push({ id: 'q' + v + i, shape: 'rect', x: 100 + i * 40, y: y0 + 26, w: 34, h: 32, text: v, cls: 'n-token' }));
      } else if (st.variant === 'kruskal') {
        nodes.push(D.text('dsl', 'edges, lightest first', -50, y0, 't-accent', 'start'));
        st.ds.forEach((e, i) => nodes.push({ id: 'q' + e.k, shape: 'rect', x: i * 52, y: y0 + 34, w: 48, h: 40, text: e.w, sub: e.k, cls: 'n-token ' + (e.cls || '') }));
      } else nodes.push(D.text('dsl', st.note, -50, y0, 't-muted', 'start'));
      if (st.variant === 'dijkstra' && st.dist) GN.forEach((g) => nodes.push(D.text('dd' + g, st.dist[g] === Infinity ? '∞' : st.dist[g], GP[g][0], GP[g][1] + 36, st.vis[g] ? 't-ok' : 't-accent')));
      if (st.order.length) { nodes.push(D.text('ol', st.variant === 'kruskal' || st.variant === 'prim' ? 'total weight' : st.variant === 'dijkstra' ? 'settled order' : 'visit order', 490, y0 - 4 + 90, 't-accent', 'end')); st.order.forEach((v, i) => nodes.push({ id: 'o' + i, shape: 'rect', x: 120 + i * 36, y: y0 + 100, w: 32, h: 32, text: v, cls: 'n-token n-ok', enter: [0, -12] })); }
      void X;
      return { nodes, edges };
    },
    run(st, op, a, snap) {
      const v = st.variant, start = a.start.trim().toUpperCase();
      if (!GN.includes(start)) throw new VizError('Start vertex must be one of A, B, C, D, E, F, G.');
      st.vis = {}; st.tree = {}; st.ds = []; st.order = []; st.note = ''; st.running = true; st.dist = null;
      DSA.viz.get('graph').code = { go: {
        bfs: ['queue = [start]; mark start visited', 'while queue is not empty:', '  u = dequeue(); visit(u)', '  for each unvisited neighbour w of u: mark w, enqueue(w)'],
        dfs: ['push start', 'while stack is not empty:', '  u = pop()', '  if u is unvisited: mark and visit(u); push its unvisited neighbours (in reverse order)'],
        kruskal: ['sort all edges by weight', 'for each edge (u, v) in that order:', '  if find(u) != find(v): add the edge to the tree; union(u, v)', '  else: skip (it would form a cycle)', 'stop after V - 1 edges'],
        dijkstra: ['dist[start] = 0, all others = ∞', 'repeat: u = unsettled vertex with the smallest dist; settle u', '  for each edge (u, w) with weight c:', '    if dist[u] + c < dist[w]: dist[w] = dist[u] + c', 'until every reachable vertex is settled'],
        prim: ['tree = {start}', 'repeat V - 1 times:', '  among edges leaving the tree, pick the lightest', '  add that edge and its new vertex to the tree'],
      }[v] };
      if (v === 'bfs') {
        st.vis[start] = true; st.ds = [start];
        snap(`BFS visits vertices level by level using a **queue**. Mark ${start} and enqueue it.`, { line: 0, hl: { [start]: 'n-hl' } });
        while (st.ds.length) {
          const u = st.ds.shift(); st.order.push(u);
          snap(`Dequeue ${u} and visit it. Look at its neighbours: ${adj(u).join(', ')}.`, { line: 2, hl: { [u]: 'n-hl' } }, { hold: 0.9 });
          const eh = {};
          adj(u).forEach((w) => { if (!st.vis[w]) { st.vis[w] = true; st.ds.push(w); eh[eid(u, w)] = 'e-hl'; st.tree[eid(u, w)] = true; } });
          snap(eh && Object.keys(eh).length ? `Enqueue the unvisited neighbours (they are now marked, so nobody enqueues them twice).` : `${u} has no unvisited neighbours.`, { line: 3, hl: { [u]: 'n-cmp' }, eh }, { hold: 0.8 });
        }
        return snap(`BFS order: **${st.order.join(' → ')}**. Every vertex and edge is touched once: O(V + E). In an unweighted graph BFS finds shortest paths (fewest edges).`, { tone: 'good' });
      }
      if (v === 'dfs') {
        st.ds = [start];
        snap('DFS goes as deep as possible before backing up, using a **stack** (or recursion). Push the start vertex.', { line: 0, hl: { [start]: 'n-hl' } });
        const parent = {};
        while (st.ds.length) {
          const u = st.ds.pop();
          if (st.vis[u]) { snap(`Pop ${u}: already visited, skip.`, { line: 2 }, { hold: 0.6 }); continue; }
          st.vis[u] = true; st.order.push(u); if (parent[u]) st.tree[eid(parent[u], u)] = true;
          const nb = adj(u).filter((w) => !st.vis[w]);
          nb.slice().reverse().forEach((w) => { st.ds.push(w); parent[w] = u; });
          snap(`Pop and visit ${u}. Push its unvisited neighbours${nb.length ? ' (' + nb.join(', ') + '; the alphabetically first ends on top)' : ' (none)'}.`, { line: 3, hl: { [u]: 'n-hl' } }, { hold: 0.9 });
        }
        return snap(`DFS order: **${st.order.join(' → ')}**. O(V + E). DFS is the basis of cycle detection, topological sort and finding connected components.`, { tone: 'good' });
      }
      if (v === 'kruskal') {
        const sorted = GE.slice().sort((x, y) => x[2] - y[2]).map(([x, y, w]) => ({ x, y, w, k: eid(x, y) }));
        st.ds = sorted; const par = {}; GN.forEach((g) => { par[g] = g; }); const find = (g) => (par[g] === g ? g : (par[g] = find(par[g])));
        let total = 0, used = 0;
        snap('Kruskal: sort the edges by weight, then take each edge unless it joins two vertices that are already connected (that would make a cycle).', { line: 0 });
        for (const e of sorted) {
          const ru = find(e.x), rv = find(e.y);
          if (ru !== rv) { par[ru] = rv; st.tree[e.k] = true; e.cls = 'n-ok'; total += e.w; used++; st.order = [total]; snap(`Edge ${e.x}–${e.y} (${e.w}): different components, **accept**. Total weight ${total}.`, { line: 2, eh: { [e.k]: 'e-ok' } }, { hold: 0.9 }); }
          else { e.cls = 'n-bad'; snap(`Edge ${e.x}–${e.y} (${e.w}): both ends are already connected, **reject** (cycle).`, { line: 3, eh: { [e.k]: 'e-bad' } }, { hold: 0.9 }); }
          if (used === GN.length - 1) break;
        }
        return snap(`Minimum spanning tree: ${used} edges (V − 1 = ${GN.length - 1}), total weight **${total}**. O(E log E), dominated by sorting.`, { line: 4, tone: 'good' });
      }
      if (v === 'dijkstra') {
        const dist = {}, prev = {}; GN.forEach((g) => { dist[g] = Infinity; }); dist[start] = 0; st.dist = dist;
        snap(`Dijkstra: dist[${start}] = 0 and every other distance starts at ∞. Repeatedly settle the unsettled vertex with the smallest distance, then relax its edges. (Edge weights must not be negative.)`, { line: 0, hl: { [start]: 'n-hl' } });
        for (let r = 0; r < GN.length; r++) {
          const u = GN.filter((g) => !st.vis[g] && dist[g] < Infinity).sort((p, q) => dist[p] - dist[q] || (p < q ? -1 : 1))[0];
          if (!u) break;
          st.vis[u] = true; st.order.push(u);
          snap(`Smallest unsettled distance: **${u}** (${dist[u]}). Its distance is now final.`, { line: 1, hl: { [u]: 'n-ok' } }, { hold: 0.9 });
          for (const [x, y, w] of GE) {
            const o = x === u ? y : y === u ? x : null;
            if (!o || st.vis[o]) continue;
            const nd = dist[u] + w, k = eid(u, o);
            if (nd < dist[o]) {
              if (prev[o]) delete st.tree[eid(prev[o], o)];
              snap(`Relax ${u}–${o} (${w}): ${dist[u]} + ${w} = ${nd} is better than ${dist[o] === Infinity ? '∞' : dist[o]}. Update dist[${o}] = ${nd}.`, { line: 3, hl: { [o]: 'n-cmp' }, eh: { [k]: 'e-cmp' } }, { hold: 0.9 });
              dist[o] = nd; prev[o] = u; st.tree[k] = true;
              snap(`dist[${o}] = ${nd}.`, { line: 3, hl: { [o]: 'n-hl' }, eh: { [k]: 'e-hl' } }, { hold: 0.5 });
            } else snap(`Relax ${u}–${o} (${w}): ${dist[u]} + ${w} = ${nd} is not better than ${dist[o]}. Keep it.`, { line: 3, hl: { [o]: 'n-cmp' }, eh: { [k]: 'e-dim' } }, { hold: 0.7 });
          }
        }
        st.dijkstra = dist;
        return snap(`Shortest distances from ${start}: ${GN.map((g) => g + '=' + (dist[g] === Infinity ? '∞' : dist[g])).join(', ')}. The highlighted edges form the shortest-path tree. O(E log V) with a heap.`, { tone: 'good' });
      }
      const inT = { [start]: true }; let total = 0; st.vis[start] = true;
      snap(`Prim: grow one tree from ${start}. Each step adds the lightest edge that leaves the tree.`, { line: 0, hl: { [start]: 'n-hl' } });
      for (let i = 1; i < GN.length; i++) {
        const cand = GE.filter(([x, y]) => inT[x] !== inT[y]).sort((p, q) => p[2] - q[2]);
        const [x, y, w] = cand[0], nv = inT[x] ? y : x;
        st.note = 'candidate edges: ' + cand.map(([p, q, ww]) => `${p}${q}=${ww}`).join('  ');
        const eh = {}; cand.forEach(([p, q]) => { eh[eid(p, q)] = 'e-cmp'; });
        snap(`Edges leaving the tree: ${cand.map(([p, q, ww]) => `${p}–${q} (${ww})`).join(', ')}. The lightest is ${x}–${y} (${w}).`, { line: 2, eh }, { hold: 1 });
        inT[nv] = true; st.vis[nv] = true; st.tree[eid(x, y)] = true; total += w; st.order = [total];
        snap(`Add ${x}–${y} and vertex ${nv}. Total weight ${total}.`, { line: 3, eh: { [eid(x, y)]: 'e-ok' }, hl: { [nv]: 'n-hl' } }, { hold: 0.8 });
      }
      st.note = '';
      snap(`Minimum spanning tree, total weight **${total}**. O(E log V) with a heap. (Both Prim and Kruskal give the same total, though they may pick different but equal-weight trees.)`, { tone: 'good' });
    },
    code: {},
    demo: [['go', { start: 'A' }]],
    view: { minW: 560, minH: 330 },
  });
  /* ---------------- topological sort (directed acyclic graph) ---------------- */
  const TN = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const TP = { A: [0, 20], B: [0, 130], C: [130, 0], D: [130, 90], E: [260, 40], F: [260, 140], G: [390, 90] };
  const TE = [['A', 'C'], ['A', 'D'], ['B', 'D'], ['C', 'E'], ['D', 'E'], ['D', 'F'], ['E', 'G'], ['F', 'G']];
  DSA.viz.define('toposort', {
    title: 'Topological sort',
    blurb: 'A linear order of a directed acyclic graph in which every edge u → v has u before v (think of course prerequisites). Kahn\'s algorithm repeatedly removes a vertex with no incoming edges; the DFS version outputs vertices in reverse finishing order.',
    variants: [{ id: 'kahn', label: "Kahn (in-degree)" }, { id: 'dfs', label: 'DFS (finish order)' }],
    args: {},
    ops: [{ id: 'go', label: 'Sort', primary: true }],
    create: (variant) => ({ variant, indeg: null, done: {}, queue: [], order: [], stack: [], removed: {} }),
    draw(st, m) {
      const nodes = [], edges = [], kahn = st.variant === 'kahn';
      TN.forEach((v) => {
        nodes.push({ id: 't' + v, shape: 'circle', x: TP[v][0], y: TP[v][1], w: 44, text: v, cls: (m.hl && m.hl[v]) || (st.done[v] ? 'n-ok' : '') });
        if (kahn && st.indeg) nodes.push(D.text('ti' + v, 'in ' + st.indeg[v], TP[v][0], TP[v][1] + 36, st.indeg[v] === 0 && !st.done[v] ? 't-accent' : 't-muted'));
      });
      TE.forEach(([u, v]) => edges.push({ id: 'te' + u + v, from: 't' + u, to: 't' + v, cls: st.removed[u] ? 'e-dim' : (m.eh && m.eh[u + v]) || '' }));
      nodes.push(D.text('ql', kahn ? 'queue (in-degree 0)' : 'stack of finished vertices', -20, 230, 't-accent', 'start'));
      (kahn ? st.queue : st.stack).forEach((v, i) => nodes.push({ id: 'tq' + v, shape: 'rect', x: 130 + i * 40, y: 254, w: 34, h: 32, text: v, cls: 'n-token' }));
      nodes.push(D.text('ol', 'order', 480, 322, 't-accent', 'end'));
      st.order.forEach((v, i) => nodes.push({ id: 'to' + v, shape: 'rect', x: 120 + i * 40, y: 322, w: 34, h: 32, text: v, cls: 'n-token n-ok', enter: [0, -20] }));
      return { nodes, edges };
    },
    run(st, op, a, snap) {
      const out = (v) => TE.filter((e) => e[0] === v).map((e) => e[1]);
      Object.assign(st, { done: {}, queue: [], order: [], stack: [], removed: {} });
      if (st.variant === 'kahn') {
        st.indeg = {}; TN.forEach((v) => { st.indeg[v] = TE.filter((e) => e[1] === v).length; });
        DSA.viz.get('toposort').code = { go: ['compute in-degree of every vertex', 'queue = all vertices with in-degree 0', 'while queue is not empty:', '  u = dequeue(); output u', '  for each edge u -> w: in-degree[w]--; if it becomes 0, enqueue w', 'if fewer than V vertices were output: the graph has a cycle'] };
        st.queue = TN.filter((v) => st.indeg[v] === 0);
        snap(`In-degree = number of incoming edges. Vertices with in-degree 0 have no prerequisite, so they can go first: **${st.queue.join(', ')}**.`, { line: 1 });
        while (st.queue.length) {
          const u = st.queue.shift(); st.order.push(u); st.done[u] = true;
          snap(`Dequeue ${u} and output it.`, { line: 3, hl: { [u]: 'n-hl' } }, { hold: 0.8 });
          st.removed[u] = true;
          const eh = {}, born = [];
          out(u).forEach((w) => { st.indeg[w]--; eh[u + w] = 'e-hl'; if (st.indeg[w] === 0) { st.queue.push(w); born.push(w); } });
          snap(out(u).length ? `Remove ${u}'s outgoing edges: in-degrees drop${born.length ? '; **' + born.join(', ') + '** reach 0 and join the queue' : ', but none reaches 0 yet'}.` : `${u} has no outgoing edges.`, { line: 4, hl: { [u]: 'n-ok' }, eh }, { hold: 1 });
        }
        return snap(`Topological order: **${st.order.join(' → ')}**. Each vertex and edge is handled once: O(V + E). If the queue ran dry before all V vertices were output, the graph would contain a cycle.`, { line: 5, tone: 'good' });
      }
      st.indeg = null;
      DSA.viz.get('toposort').code = { go: ['visit(u): mark u visited', '  for each edge u -> w: if w is unvisited, visit(w)', '  push u onto the stack (u is finished)', 'run visit on every unvisited vertex', 'the stack, read from top to bottom, is the topological order'] };
      const seen = {};
      const visit = (u) => {
        seen[u] = true; snap(`Visit ${u}: explore everything that depends on it first.`, { line: 0, hl: { [u]: 'n-cmp' } }, { hold: 0.7 });
        out(u).forEach((w) => { if (!seen[w]) visit(w); });
        st.stack.unshift(u); st.done[u] = true;
        snap(`${u} is finished: push it. (A vertex is pushed only after everything reachable from it.)`, { line: 2, hl: { [u]: 'n-ok' } }, { hold: 0.8 });
      };
      TN.forEach((v) => { if (!seen[v]) visit(v); });
      st.order = st.stack.slice(); st.stack = [];
      snap(`Reading the stack from the top gives the topological order: **${st.order.join(' → ')}**. O(V + E).`, { line: 4, tone: 'good' });
    },
    code: {},
    demo: [['go', {}]],
    view: { minW: 560, minH: 380 },
  });
})();
