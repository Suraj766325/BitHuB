/* ============================================================
 * viz/m4.js — Module IV: searching, the sorting algorithms of
 * the syllabus, hashing and external (k-way) merging.
 * ============================================================ */
(function () {
  'use strict';
  const DSA = window.DSA;
  const D = DSA.draw;
  const { rand } = DSA.UI;
  const VizError = DSA.VizError;
  const randList = (n, lo, hi) => Array.from({ length: n }, () => rand(lo, hi)).join(', ');

  /* ---------------- searching ---------------- */
  DSA.viz.define('search', {
    title: 'Searching',
    blurb: 'Linear search checks every element: O(n). Binary search halves a sorted list each step: O(log n).',
    variants: [{ id: 'binary', label: 'Binary search' }, { id: 'linear', label: 'Linear search' }],
    args: {
      list: { label: 'List', type: 'list', def: () => randList(9, 5, 90), fresh: true, max: 14 },
      key: { label: 'Search for', type: 'int', def: 23, min: 0, max: 99 },
    },
    ops: [{ id: 'go', label: 'Search', uses: ['list', 'key'], primary: true }],
    create: (variant) => ({ variant, a: [] }),
    draw(st, m) {
      const nodes = D.cells(st.a.map((v, i) => ({ v, k: i })), { cw: 52, marks: m.hl || {}, id: 'c' });
      const gx = (i) => i * 58;
      if (m.lo != null) nodes.push(D.tag('lo', 'low', gx(m.lo), -52, 'down', 'n-ptr'));
      if (m.hi != null) nodes.push(D.tag('hi', 'high', gx(m.hi), 74, 'up', 'n-ptr2'));
      if (m.mid != null) nodes.push(D.tag('mid', 'mid', gx(m.mid), -52 - (m.lo === m.mid ? 28 : 0), 'down', 'n-good'));
      if (m.i != null) nodes.push(D.tag('i', 'i', gx(m.i), -52, 'down', 'n-ptr'));
      return { nodes };
    },
    run(st, op, a, snap) {
      const bin = st.variant === 'binary';
      DSA.viz.get('search').code = { go: bin ? ['low = 0; high = n - 1', 'while low <= high:', '  mid = (low + high) / 2', '  if a[mid] == key: return mid', '  else if a[mid] < key: low = mid + 1', '  else: high = mid - 1', 'return NOT FOUND'] : ['for i = 0 to n - 1:', '  if a[i] == key: return i', 'return NOT FOUND'] };
      st.a = a.list.slice();
      if (bin) { const s0 = st.a.slice().sort((x, y) => x - y); if (s0.some((v, i) => v !== st.a[i])) { st.a = s0; snap('Binary search needs sorted data, so the list was sorted first.', {}); } }
      const n = st.a.length;
      if (!bin) {
        for (let i = 0; i < n; i++) { const hit = st.a[i] === a.key; snap(hit ? `a[${i}] = ${a.key}. **Found** after ${i + 1} comparison(s).` : `a[${i}] = ${st.a[i]} ≠ ${a.key}, try the next one.`, { line: hit ? 1 : 0, i, hl: { [i]: hit ? 'n-ok' : 'n-cmp' }, tone: hit ? 'good' : '' }, { hold: 0.7 }); if (hit) return; }
        return snap(`${a.key} is not present: n = ${n} comparisons.`, { line: 2, tone: 'bad' });
      }
      let lo = 0, hi = n - 1, steps = 0;
      snap(`Search ${a.key} in ${n} sorted elements. At most ⌊log₂ ${n}⌋ + 1 = ${Math.floor(Math.log2(n)) + 1} comparisons are needed.`, { line: 0, lo, hi });
      while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2); steps++;
        const hl = {}; for (let i = lo; i <= hi; i++) hl[i] = 'n-alt'; hl[mid] = 'n-cmp';
        snap(`mid = ⌊(${lo} + ${hi}) / 2⌋ = ${mid}. Compare a[${mid}] = ${st.a[mid]} with ${a.key}.`, { line: 2, lo, hi, mid, hl });
        if (st.a[mid] === a.key) return snap(`Equal: **found** at index ${mid} after ${steps} comparison(s).`, { line: 3, lo, hi, mid, hl: { [mid]: 'n-ok' }, tone: 'good' });
        if (st.a[mid] < a.key) { snap(`${st.a[mid]} < ${a.key}: the key can only be to the right, so low = ${mid + 1}.`, { line: 4, lo, hi, mid, hl: Object.assign({}, hl, { [mid]: 'n-bad' }) }); lo = mid + 1; }
        else { snap(`${st.a[mid]} > ${a.key}: the key can only be to the left, so high = ${mid - 1}.`, { line: 5, lo, hi, mid, hl: Object.assign({}, hl, { [mid]: 'n-bad' }) }); hi = mid - 1; }
      }
      snap(`low > high: the search range is empty, so ${a.key} is **not present** (${steps} comparisons).`, { line: 6, tone: 'bad' });
    },
    code: { go: [] },
    demo: [['go', { list: [4, 9, 15, 23, 31, 42, 58, 67, 80], key: 42 }]],
    view: { minW: 620, minH: 230 },
  });

  /* ---------------- sorting ---------------- */
  const SORT_CODE = {
    bubble: ['for pass = 1 to n - 1:', '  for j = 0 to n - pass - 1:', '    if a[j] > a[j + 1]: swap a[j], a[j + 1]', '  if no swap happened in this pass: stop'],
    selection: ['for i = 0 to n - 2:', '  min = i', '  for j = i + 1 to n - 1: if a[j] < a[min]: min = j', '  swap a[i], a[min]'],
    insertion: ['for i = 1 to n - 1:', '  key = a[i]; j = i - 1', '  while j >= 0 and a[j] > key: a[j + 1] = a[j]; j = j - 1', '  a[j + 1] = key'],
    merge: ['mergeSort(lo, hi):', '  if lo >= hi: return', '  mid = (lo + hi) / 2', '  mergeSort(lo, mid); mergeSort(mid + 1, hi)', '  merge the two sorted halves into one'],
    quick: ['quick(beg, end):', '  pivot = a[beg]; left = beg; right = end', '  scan from right while a[right] >= pivot', '  scan from left while a[left] <= pivot', '  swap a[left], a[right]; repeat until they cross', '  swap pivot into place; sort both sides'],
    heap: ['build a max-heap from the array', 'for last = n - 1 down to 1:', '  swap a[0], a[last]', '  heapify(0, last)'],
    radix: ['for each digit, from least to most significant:', '  distribute the numbers into buckets 0..9 by that digit', '  collect the buckets in order (keeps earlier order: stable)'],
  };
  const SORT_INFO = {
    bubble: 'Bubble sort: compare neighbours and swap, so the largest value bubbles to the end of each pass. O(n²), O(n) if already sorted.',
    selection: 'Selection sort: find the smallest remaining value and put it in place. Always O(n²) comparisons but at most n − 1 swaps.',
    insertion: 'Insertion sort: grow a sorted prefix by sliding each new element into position. O(n²), O(n) on nearly sorted data.',
    merge: 'Merge sort: split in half, sort each half, merge. Always O(n log n), needs O(n) extra space, stable.',
    quick: 'Quick sort: the first element is the pivot and is moved to its final position, which splits the list in two. Average O(n log n), worst case O(n²).',
    heap: 'Heap sort: build a max-heap, then repeatedly swap the root with the last element and re-heapify the rest. O(n log n), in place.',
    radix: 'Radix sort: sort by the least significant digit first, then the next, using a stable pass each time. O(d·(n + 10)); no comparisons.',
  };
  function bars(st, m) {
    const nodes = [], max = Math.max(...st.a.map((x) => x.v), 1), sc = 150 / max, bw = 46;
    st.a.forEach((it, i) => {
      let cls = (m.hl && m.hl[i]) || '';
      if (m.sorted && m.sorted.has && m.sorted.has(i) && !cls) cls = 'n-ok';
      if (m.dim && m.dim(i) && !cls) cls = 'n-dim';
      nodes.push({ id: 'b' + it.k, shape: 'bar', x: i * (bw + 8), y: 0, w: bw, h: Math.max(8, it.v * sc), text: it.v, sub: m.digit ? undefined : i, cls });
      if (m.digit) nodes.push(D.text('dg' + it.k, `digit ${m.digit.d}: ${Math.floor(it.v / m.digit.p) % 10}`, i * (bw + 8), 24, 't-muted'));
    });
    return nodes;
  }
  DSA.viz.define('sort', {
    title: 'Sorting',
    blurb: 'Pick an algorithm, press Sort and watch the bars. Colours: amber = being compared, pink = pivot / key, green = in its final place.',
    variants: [{ id: 'bubble', label: 'Bubble' }, { id: 'selection', label: 'Selection' }, { id: 'insertion', label: 'Insertion' }, { id: 'merge', label: 'Merge' }, { id: 'quick', label: 'Quick' }, { id: 'heap', label: 'Heap' }, { id: 'radix', label: 'Radix' }],
    args: { list: { label: 'List (0 to 999)', type: 'list', def: () => randList(8, 5, 90), fresh: true, max: 12 } },
    ops: [{ id: 'sort', label: 'Sort', uses: ['list'], primary: true }],
    create: (variant) => { const d = DSA.viz.get('sort'); d.code = { sort: SORT_CODE[variant] }; d.hint = SORT_INFO[variant]; return { variant, a: [38, 27, 43, 3, 9, 82, 10, 55].map((v, k) => ({ v, k })), cmp: 0, swp: 0 }; },
    draw(st, m) {
      const nodes = bars(st, m);
      if (m.tags) m.tags.forEach((t) => nodes.push(D.tag('t' + t.name, t.name, t.i * 54, t.y == null ? 22 : t.y, 'up', t.cls || 'n-ptr')));
      if (m.stats) nodes.push(D.text('stats', `comparisons: ${st.cmp}   ·   swaps / moves: ${st.swp}`, (st.a.length * 54 - 8) / 2, -190, 't-muted'));
      return { nodes };
    },
    run(st, op, a, snap) {
      const v = st.variant, def = DSA.viz.get('sort');
      def.code = { sort: SORT_CODE[v] };
      if (a.list.some((x) => x < 0 || x > 999)) throw new VizError('Use values from 0 to 999.');
      st.a = a.list.map((x, k) => ({ v: x, k })); st.cmp = 0; st.swp = 0;
      const A = st.a, n = A.length, S = { stats: true };
      const mark = (o) => Object.assign({}, S, o);
      const swap = (i, j) => { const t = A[i]; A[i] = A[j]; A[j] = t; st.swp++; };
      const done = new Set();
      snap(SORT_INFO[v], mark({ line: 0 }));

      if (v === 'bubble') {
        for (let p = 0; p < n - 1; p++) {
          let sw = false;
          for (let j = 0; j < n - 1 - p; j++) {
            st.cmp++;
            const bad = A[j].v > A[j + 1].v;
            snap(`Pass ${p + 1}: compare ${A[j].v} and ${A[j + 1].v}${bad ? ': out of order, swap.' : ': already in order.'}`, mark({ line: 2, hl: { [j]: 'n-cmp', [j + 1]: 'n-cmp' }, sorted: done }), { hold: 0.55 });
            if (bad) { swap(j, j + 1); sw = true; snap(`Swapped: ${A[j].v} and ${A[j + 1].v}.`, mark({ line: 2, hl: { [j + 1]: 'n-hl' }, sorted: done }), { hold: 0.55 }); }
          }
          done.add(n - 1 - p);
          snap(`End of pass ${p + 1}: ${A[n - 1 - p].v} has bubbled to its final place.`, mark({ line: 1, sorted: done }));
          if (!sw) { for (let i = 0; i < n; i++) done.add(i); snap('No swaps in this pass, so the list is already sorted. Stop early (best case O(n)).', mark({ line: 3, sorted: done, tone: 'good' })); return; }
        }
      } else if (v === 'selection') {
        for (let i = 0; i < n - 1; i++) {
          let mn = i;
          snap(`Pass ${i + 1}: assume a[${i}] = ${A[i].v} is the smallest of the unsorted part.`, mark({ line: 1, hl: { [mn]: 'n-hl' }, sorted: done }));
          for (let j = i + 1; j < n; j++) {
            st.cmp++;
            const less = A[j].v < A[mn].v;
            snap(`${A[j].v} ${less ? '<' : '≥'} ${A[mn].v}${less ? ': new minimum.' : '.'}`, mark({ line: 2, hl: { [mn]: 'n-hl', [j]: 'n-cmp' }, sorted: done }), { hold: 0.55 });
            if (less) mn = j;
          }
          if (mn !== i) { swap(i, mn); snap(`Swap the minimum ${A[i].v} into position ${i}.`, mark({ line: 3, hl: { [i]: 'n-ok' }, sorted: done })); } else snap(`${A[i].v} is already in place.`, mark({ line: 3, sorted: done }));
          done.add(i);
        }
        done.add(n - 1);
      } else if (v === 'insertion') {
        done.add(0);
        for (let i = 1; i < n; i++) {
          const key = A[i]; let j = i - 1;
          snap(`Take a[${i}] = ${key.v} as the key; the part before it is sorted.`, mark({ line: 1, hl: { [i]: 'n-hl' }, sorted: new Set([...Array(i).keys()]) }));
          while (j >= 0) {
            st.cmp++;
            if (A[j].v > key.v) { A[j + 1] = A[j]; A[j] = key; st.swp++; snap(`${A[j + 1].v} > ${key.v}: shift it one place right.`, mark({ line: 2, hl: { [j]: 'n-hl', [j + 1]: 'n-cmp' }, sorted: new Set([...Array(i + 1).keys()]) }), { hold: 0.6 }); j--; }
            else { snap(`${A[j].v} ≤ ${key.v}: the key belongs right after it.`, mark({ line: 2, hl: { [j]: 'n-ok', [j + 1]: 'n-hl' }, sorted: new Set([...Array(i + 1).keys()]) }), { hold: 0.6 }); break; }
          }
          snap(`${key.v} is inserted; the first ${i + 1} elements are sorted.`, mark({ line: 3, sorted: new Set([...Array(i + 1).keys()]) }));
        }
        for (let i = 0; i < n; i++) done.add(i);
      } else if (v === 'merge') {
        const ms = (lo, hi) => {
          if (lo >= hi) return;
          const mid = (lo + hi) >> 1, range = {}; for (let i = lo; i <= hi; i++) range[i] = 'n-alt';
          snap(`Split [${lo}..${hi}] at ${mid}: left [${lo}..${mid}], right [${mid + 1}..${hi}].`, mark({ line: 2, hl: range }), { hold: 0.7 });
          ms(lo, mid); ms(mid + 1, hi);
          const L = A.slice(lo, mid + 1), R = A.slice(mid + 1, hi + 1), outp = []; let i = 0, j = 0;
          while (i < L.length || j < R.length) {
            let takeL;
            if (i < L.length && j < R.length) { st.cmp++; takeL = L[i].v <= R[j].v; snap(`Merge: compare ${L[i].v} (left) with ${R[j].v} (right): take ${takeL ? L[i].v : R[j].v}.`, mark({ line: 4, hl: Object.assign({}, range) }), { hold: 0.55 }); } else takeL = i < L.length;
            outp.push(takeL ? L[i++] : R[j++]); st.swp++;
            // the merged prefix is written back; the unmerged rest of each half follows it
            outp.concat(L.slice(i), R.slice(j)).forEach((it, q) => { A[lo + q] = it; });
            const hl = Object.assign({}, range); for (let q = 0; q < outp.length; q++) hl[lo + q] = 'n-ok';
            snap(`Place ${outp[outp.length - 1].v} at position ${lo + outp.length - 1}.`, mark({ line: 4, hl }), { hold: 0.55 });
          }
          const fin = {}; for (let q = lo; q <= hi; q++) fin[q] = 'n-ok';
          snap(`[${lo}..${hi}] is now sorted.`, mark({ line: 4, hl: fin }));
          if (lo === 0 && hi === n - 1) for (let q = 0; q < n; q++) done.add(q);
        };
        ms(0, n - 1);
      } else if (v === 'quick') {
        const qs = (beg, end) => {
          if (beg >= end) { if (beg === end) { done.add(beg); } return; }
          let left = beg, right = end, loc = beg;
          const hlr = () => { const o = {}; for (let i = beg; i <= end; i++) o[i] = 'n-alt'; return o; };
          snap(`Sort [${beg}..${end}]: the pivot is the first element, ${A[loc].v}.`, mark({ line: 1, hl: Object.assign(hlr(), { [loc]: 'n-hl' }), tags: [{ name: 'pivot', i: loc, cls: 'n-ptr' }], sorted: done }));
          for (;;) {
            while (loc < right && A[loc].v <= A[right].v) { st.cmp++; snap(`Scan from the right: ${A[right].v} ≥ pivot ${A[loc].v}, move left.`, mark({ line: 2, hl: Object.assign(hlr(), { [loc]: 'n-hl', [right]: 'n-cmp' }), tags: [{ name: 'right', i: right, cls: 'n-ptr2' }], sorted: done }), { hold: 0.5 }); right--; }
            if (loc === right) break;
            st.cmp++; swap(loc, right);
            snap(`${A[loc].v} < pivot ${A[right].v}: swap. The pivot is now at ${right}.`, mark({ line: 4, hl: Object.assign(hlr(), { [right]: 'n-hl', [loc]: 'n-cmp' }), sorted: done })); loc = right;
            while (left < loc && A[left].v <= A[loc].v) { st.cmp++; snap(`Scan from the left: ${A[left].v} ≤ pivot ${A[loc].v}, move right.`, mark({ line: 3, hl: Object.assign(hlr(), { [loc]: 'n-hl', [left]: 'n-cmp' }), tags: [{ name: 'left', i: left, cls: 'n-ptr3' }], sorted: done }), { hold: 0.5 }); left++; }
            if (loc === left) break;
            st.cmp++; swap(loc, left);
            snap(`${A[loc].v} > pivot ${A[left].v}: swap. The pivot is now at ${left}.`, mark({ line: 4, hl: Object.assign(hlr(), { [left]: 'n-hl', [loc]: 'n-cmp' }), sorted: done })); loc = left;
          }
          done.add(loc);
          snap(`Both scans met: the pivot ${A[loc].v} is in its final position ${loc}. Everything left of it is smaller, everything right is larger.`, mark({ line: 5, sorted: done }));
          qs(beg, loc - 1); qs(loc + 1, end);
        };
        qs(0, n - 1);
      } else if (v === 'heap') {
        const sift = (i, size, line) => {
          for (;;) {
            let big = i; const l = 2 * i + 1, r = l + 1;
            if (l < size) { st.cmp++; if (A[l].v > A[big].v) big = l; }
            if (r < size) { st.cmp++; if (A[r].v > A[big].v) big = r; }
            const hl = { [i]: 'n-hl' }; if (l < size) hl[l] = 'n-cmp'; if (r < size) hl[r] = 'n-cmp';
            snap(`Heapify node ${i} (${A[i].v}): its children ${[l, r].filter((c) => c < size).map((c) => A[c].v).join(' and ') || '(none)'}.`, mark({ line, hl, sorted: done, dim: (q) => q >= size && !done.has(q) }), { hold: 0.6 });
            if (big === i) return;
            swap(i, big); snap(`${A[i].v} is larger than ${A[big].v}: swap down.`, mark({ line, hl: { [big]: 'n-hl', [i]: 'n-cmp' }, sorted: done }), { hold: 0.6 }); i = big;
          }
        };
        snap('Build a max-heap: heapify every parent from the last one (index ⌊n/2⌋ − 1) up to the root. Children of i are 2i + 1 and 2i + 2.', mark({ line: 0 }));
        for (let i = (n >> 1) - 1; i >= 0; i--) sift(i, n, 0);
        snap(`Max-heap built: the largest value, ${A[0].v}, is at the root.`, mark({ line: 0, hl: { 0: 'n-hl' } }));
        for (let last = n - 1; last > 0; last--) {
          swap(0, last); done.add(last);
          snap(`Swap the root ${A[last].v} with the last element: it is now in its final place.`, mark({ line: 2, sorted: done }));
          sift(0, last, 3);
        }
        done.add(0);
      } else {
        const maxv = Math.max(...A.map((x) => x.v)); let p = 1, d = 1;
        while (Math.floor(maxv / p) > 0 || p === 1) {
          const dg = { d, p };
          snap(`Pass ${d}: look at the ${['ones', 'tens', 'hundreds'][d - 1]} digit of every number.`, mark({ line: 0, digit: dg }));
          const buckets = Array.from({ length: 10 }, () => []);
          A.forEach((it) => buckets[Math.floor(it.v / p) % 10].push(it));
          const used = buckets.map((b, i) => (b.length ? `${i}: ${b.map((x) => x.v).join(', ')}` : null)).filter(Boolean).join('   |   ');
          snap(`Distribute into buckets by that digit (stable, left to right). ${used}`, mark({ line: 1, digit: dg }), { hold: 1.4 });
          let k = 0; buckets.forEach((b) => b.forEach((it) => { A[k++] = it; })); st.swp += n;
          snap(`Collect the buckets in order 0 → 9: ${A.map((x) => x.v).join(', ')}.`, mark({ line: 2, digit: dg }));
          if (Math.floor(maxv / p) < 10) break;
          p *= 10; d++;
        }
        for (let i = 0; i < n; i++) done.add(i);
      }
      for (let i = 0; i < n; i++) done.add(i);
      snap(`Sorted: ${A.map((x) => x.v).join(', ')}. (${st.cmp} comparisons, ${st.swp} swaps/moves.)`, mark({ sorted: done, tone: 'good' }));
    },
    code: {},
    demo: [['sort', { list: [38, 27, 43, 3, 9, 82, 10] }]],
    view: { minW: 560, minH: 290 },
  });

  /* ---------------- hashing ---------------- */
  const HS = 7;
  const PROBE = { linear: 'i + 1, i + 2, i + 3, …', quadratic: 'i + 1², i + 2², i + 3², …', double: 'i + 1·h₂, i + 2·h₂, … with h₂(k) = 5 − k mod 5' };
  DSA.viz.define('hash', {
    title: 'Hashing',
    blurb: 'A hash function turns a key into a table index, so search is O(1) on average. Collisions (two keys, one slot) are resolved by chaining or by probing.',
    variants: [{ id: 'chain', label: 'Chaining' }, { id: 'linear', label: 'Linear probing' }, { id: 'quadratic', label: 'Quadratic probing' }, { id: 'double', label: 'Double hashing' }],
    args: { key: { label: 'Key', type: 'int', def: () => rand(10, 99), fresh: true, min: 0, max: 999 } },
    ops: [{ id: 'insert', label: 'Insert', uses: ['key'], primary: true }, { id: 'search', label: 'Search', uses: ['key'] }, { id: 'delete', label: 'Delete', uses: ['key'] }],
    create: (variant) => { const st = { variant, t: Array.from({ length: HS }, () => []), uid: 0 }; if (variant !== 'chain') st.t = new Array(HS).fill(null); return st; },
    draw(st, m) {
      const nodes = [], edges = [];
      for (let i = 0; i < HS; i++) {
        nodes.push({ id: 's' + i, shape: 'rect', x: 0, y: i * 52, w: 64, h: 44, text: st.variant !== 'chain' ? (st.t[i] ? (st.t[i].dead ? 'deleted' : st.t[i].v) : '') : '', sub: undefined, cls: (st.variant !== 'chain' && st.t[i] && !st.t[i].dead ? '' : 'n-empty ') + ((m.hl && m.hl[i]) || '') });
        nodes.push(D.text('ix' + i, i, -50, i * 52, 't-idx'));
        if (st.variant === 'chain') {
          let prev = 's' + i;
          st.t[i].forEach((it, j) => { const id = 'k' + it.k; nodes.push({ id, shape: 'rect', x: 110 + j * 80, y: i * 52, w: 56, h: 38, text: it.v, cls: m.node === it.k ? (m.ncls || 'n-hl') : '', enter: [0, -30] }); edges.push({ id: id + '<', from: prev, to: id }); prev = id; });
        }
      }
      nodes.push(D.text('fn', `h(k) = k mod ${HS}`, 220, -40, 't-accent'));
      return { nodes, edges };
    },
    run(st, op, a, snap) {
      const chain = st.variant === 'chain', def = DSA.viz.get('hash');
      def.code = { insert: chain ? ['i = h(key) = key mod M', 'append key to the list at table[i]'] : ['i = h(key) = key mod M', 'while table[i] is occupied: i = next probe position (' + PROBE[st.variant] + ')', 'table[i] = key'], search: chain ? ['i = h(key)', 'walk the list at table[i] looking for key'] : ['i = h(key)', 'probe ' + PROBE[st.variant] + ' until key found or an empty slot is reached'], delete: chain ? ['i = h(key)', 'find key in the list at table[i] and unlink it'] : ['find the slot as in search', 'mark it DELETED (a tombstone), not empty, so later probes continue past it'] };
      const i0 = a.key % HS;
      snap(`h(${a.key}) = ${a.key} mod ${HS} = **${i0}**.`, { line: 0, hl: { [i0]: 'n-hl' } });
      if (chain) {
        const L = st.t[i0];
        if (op === 'insert') {
          if (L.some((x) => x.v === a.key)) return snap(`${a.key} is already in chain ${i0}.`, { tone: 'bad' });
          if (L.length) snap(`Slot ${i0} already holds ${L.length} key(s): a **collision**. Chaining simply adds to the list.`, { hl: { [i0]: 'n-cmp' } });
          const it = { v: a.key, k: st.uid++ }; L.push(it);
          return snap(`${a.key} is appended to the chain at ${i0}. Load factor α = n/M = ${st.t.reduce((s, l) => s + l.length, 0)}/${HS}.`, { line: 1, hl: { [i0]: 'n-ok' }, node: it.k, ncls: 'n-ok', tone: 'good' });
        }
        for (const it of L) { const hit = it.v === a.key; snap(hit ? `Found ${a.key} in the chain.` : `${it.v} ≠ ${a.key}, next.`, { line: 1, hl: { [i0]: 'n-hl' }, node: it.k, ncls: hit ? 'n-ok' : 'n-cmp' }, { hold: 0.7 }); if (hit) { if (op === 'delete') { st.t[i0] = L.filter((x) => x !== it); snap(`Unlink ${a.key} from the chain.`, { line: 1, tone: 'good' }); } return; } }
        return snap(`${a.key} is not in the table (the chain was exhausted).`, { tone: 'bad' });
      }
      let i = i0, probes = 0;
      const step = a.key % 5, h2 = 5 - step;                              // second hash for double hashing (5 is coprime to 7, so every slot is reachable)
      const seq = (k) => (st.variant === 'quadratic' ? (i0 + k * k) % HS : st.variant === 'double' ? (i0 + k * h2) % HS : (i0 + k) % HS);
      const how = (k) => (st.variant === 'quadratic' ? `(${i0} + ${k}²) mod ${HS}` : st.variant === 'double' ? `(${i0} + ${k}·${h2}) mod ${HS}` : `(${i0} + ${k}) mod ${HS}`);
      if (st.variant === 'double') snap(`Double hashing: when there is a collision, step by h₂(${a.key}) = 5 − (${a.key} mod 5) = **${h2}** instead of 1.`, { line: 0, hl: { [i0]: 'n-hl' } });
      if (op === 'insert') {
        if (st.t.some((x) => x && !x.dead && x.v === a.key)) return snap(`${a.key} is already in the table.`, { tone: 'bad' });
        for (; probes < HS; probes++) {
          i = seq(probes);
          if (!st.t[i] || st.t[i].dead) { st.t[i] = { v: a.key }; return snap(`Slot ${i} is free: store ${a.key} there${probes ? ` (after ${probes} collision${probes > 1 ? 's' : ''})` : ''}.`, { line: 2, hl: { [i]: 'n-ok' }, tone: 'good' }); }
          snap(`Slot ${i} holds ${st.t[i].v}: **collision**. Next probe: ${how(probes + 1)} = ${seq(probes + 1)}.`, { line: 1, hl: { [i]: 'n-cmp' } }, { hold: 0.8 });
        }
        return snap(st.variant === 'quadratic' ? '**No free slot found.** Quadratic probing only reaches some of the slots, so it can fail while the table still has room (rehash with a bigger prime M).' : '**Table full.** Every slot is occupied; a real table would be resized (rehashed).', { tone: 'bad' });
      }
      for (; probes < HS; probes++) {
        i = seq(probes);
        if (!st.t[i]) return snap(`Slot ${i} is empty: the key cannot be further along. ${a.key} is **not in the table**.`, { line: 1, hl: { [i]: 'n-bad' }, tone: 'bad' });
        const hit = !st.t[i].dead && st.t[i].v === a.key;
        snap(hit ? `Slot ${i} holds ${a.key}: **found**.` : `Slot ${i} ${st.t[i].dead ? 'is a tombstone' : 'holds ' + st.t[i].v}: keep probing.`, { line: 1, hl: { [i]: hit ? 'n-ok' : 'n-cmp' }, tone: hit ? 'good' : '' }, { hold: 0.7 });
        if (hit) { if (op === 'delete') { st.t[i].dead = true; snap('Mark the slot DELETED instead of emptying it: an empty slot would stop later searches too early.', { line: 1, hl: { [i]: 'n-bad' } }); } return; }
      }
      snap(`${a.key} is not in the table.`, { tone: 'bad' });
    },
    code: {},
    demo: [['insert', { key: 15 }], ['insert', { key: 22 }], ['insert', { key: 8 }], ['insert', { key: 36 }], ['search', { key: 36 }]],
    view: { minW: 560, minH: 380 },
  });

  /* ---------------- external sorting: k-way merge ---------------- */
  DSA.viz.define('kway', {
    title: 'External sorting: k-way merge',
    blurb: 'When data is bigger than memory, sort chunks (runs) separately, then merge all k runs at once: always output the smallest of the k run heads.',
    args: { runs: { label: 'Three sorted runs (separate with /)', type: 'text', def: '3 8 15 / 1 9 12 20 / 4 5 17', examples: ['3 8 15 / 1 9 12 20 / 4 5 17', '2 6 / 1 7 9 / 3 4 5 8'] } },
    ops: [{ id: 'merge', label: 'Merge', uses: ['runs'], primary: true }],
    create: () => ({ runs: [], out: [], pos: [] }),
    draw(st, m) {
      const nodes = [], K = st.runs.length;
      st.runs.forEach((r, i) => {
        nodes.push(D.text('rn' + i, `run ${i + 1}`, -62, i * 62, 't-accent', 'end'));
        r.forEach((v, j) => nodes.push({ id: `r${i}_${j}`, shape: 'rect', x: j * 52, y: i * 62, w: 44, h: 40, text: v, cls: j < st.pos[i] ? 'n-dim' : j === st.pos[i] ? (m.pick === i ? 'n-ok' : 'n-cmp') : '' }));
      });
      nodes.push(D.text('on', 'output', -62, K * 62 + 30, 't-accent', 'end'));
      st.out.forEach((o, j) => nodes.push({ id: 'o' + o.k, shape: 'rect', x: j * 52, y: K * 62 + 30, w: 44, h: 40, text: o.v, cls: 'n-ok', enter: [0, -30] }));
      return { nodes };
    },
    run(st, op, a, snap) {
      const runs = a.runs.split('/').map((r) => r.trim().split(/\s+/).filter(Boolean).map(Number));
      if (runs.length < 2 || runs.length > 4 || runs.some((r) => !r.length || r.some((x) => !Number.isInteger(x) || x < 0 || x > 999))) throw new VizError('Enter 2 to 4 runs of non-negative numbers separated by "/".');
      if (runs.some((r) => r.some((x, i) => i && x < r[i - 1]))) throw new VizError('Each run must already be sorted, as it would be after the first (in-memory) phase.');
      if (runs.reduce((s, r) => s + r.length, 0) > 14) throw new VizError('At most 14 numbers in total.');
      st.runs = runs; st.out = []; st.pos = runs.map(() => 0); let k = 0;
      snap(`${runs.length} runs, each sorted by phase 1. Keep one "head" per run in memory (only ${runs.length} values at a time) and repeatedly output the smallest.`, { line: 0 });
      for (;;) {
        const heads = st.pos.map((p, i) => (p < runs[i].length ? runs[i][p] : Infinity));
        const best = heads.indexOf(Math.min(...heads));
        if (heads[best] === Infinity) break;
        snap(`Heads: ${heads.map((x) => (x === Infinity ? '–' : x)).join(', ')}. The smallest is ${heads[best]}, from run ${best + 1}.`, { line: 1, pick: best }, { hold: 0.8 });
        st.out.push({ v: heads[best], k: k++ }); st.pos[best]++;
        snap(`Write ${heads[best]} to the output and advance run ${best + 1}.`, { line: 2 }, { hold: 0.7 });
      }
      snap(`All runs are used up. With k runs the smallest head is found with a min-heap in O(log k), so the merge costs O(N log k) for N records and reads each record once.`, { tone: 'good' });
    },
    code: { merge: ['keep the first unread value (head) of each of the k runs', 'repeat: pick the smallest head, write it to the output', 'advance that run; stop when every run is exhausted'] },
    demo: [['merge', { runs: '3 8 15 / 1 9 12 / 4 5 17' }]],
    view: { minW: 560, minH: 300 },
  });
})();
