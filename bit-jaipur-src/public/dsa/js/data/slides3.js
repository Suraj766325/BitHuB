/* ============================================================
 * data/slides3.js — theory slides taken from the class notes and
 * handouts: algorithm writing, operations, representations,
 * classification and the proofs behind the complexity results.
 * ============================================================ */
(function () {
  'use strict';
  const T = (kicker, title, bullets, key, lead) => ({ kind: 'text', kicker, title, bullets, key, lead });
  const V = (kicker, title, bullets, viz, key, lead) => ({ kind: 'viz', kicker, title, bullets, viz, key, lead });
  const TB = (kicker, title, head, rows, key, lead) => ({ kind: 'table', kicker, title, table: { head, rows }, key, lead });
  const after = (n, title, slides) => {
    const deck = DSA.slides[n], i = deck.findIndex((s) => s.title === title);
    if (i < 0) throw new Error('slides3: no slide "' + title + '" in module ' + n);
    deck.splice(i + 1, 0, ...slides);
  };

  /* ---------------- module 1 ---------------- */
  after(1, 'What is an algorithm?', [
    T('Foundations', 'Writing an algorithm', [
      'An algorithm is written as plain steps, as **pseudocode**, or as a **flowchart**.',
      'Only three control structures are needed: **sequence** (one after another), **selection** (`if … else`) and **iteration** (`while`, `for`).',
      'Flowchart symbols: **oval** start/stop, **parallelogram** input/output, **rectangle** processing, **diamond** decision.',
      'Example, largest of a, b, c: `if a > b then (if a > c then a else c) else (if b > c then b else c)`.',
    ], 'Correctness is argued with a loop invariant: something true before every iteration that, with the exit test, gives the answer.'),
  ]);
  after(1, 'What is a data structure?', [
    TB('Foundations', 'Operations on data structures', ['Operation', 'Meaning'], [
      ['Traversing', 'visit every element once'],
      ['Searching', 'find the location of a given value'],
      ['Inserting', 'add a new element'],
      ['Deleting', 'remove an element'],
      ['Sorting', 'arrange in increasing or decreasing order'],
      ['Merging', 'combine two sorted lists into one'],
    ], 'A structure is good if the operations you need most are cheap on it.', 'Static structures have a fixed size (array); dynamic ones grow at run time (linked list, tree).'),
  ]);
  after(1, 'Complexity cheat sheet', [
    T('Complexity', 'Space complexity and the recursion stack', [
      'Space = memory used beyond the input: variables, extra arrays, and the **stack frames of recursion**.',
      'Iterative factorial: O(1). Recursive factorial: depth n, so O(n).',
      'Merge sort needs an O(n) temporary array; quick sort uses an O(log n) stack on average; heap sort uses O(1).',
      'There is a **time–space trade-off**: a lookup table or a hash table spends memory to save time.',
    ], 'Always state both the time and the space of an algorithm.'),
  ]);

  /* ---------------- module 2 ---------------- */
  after(2, 'Arrays versus linked lists', [
    TB('Linear lists', 'Two representations of a list', ['', 'Array (formula based)', 'Linked (chain)'], [
      ['Location of element i', 'base + i × size, O(1)', 'follow i links, O(i)'],
      ['Insert / delete in the middle', 'shift elements, O(n)', 'change pointers, O(1) once located'],
      ['Size', 'fixed at creation', 'grows and shrinks'],
      ['Extra memory', 'unused cells', 'one pointer per node'],
    ], 'The list ADT is the same; only the cost of its operations differs.'),
    T('Linear lists', 'A linked list inside two arrays', [
      'Without pointers, keep `INFO[k]` (data) and `LINK[k]` (index of the next node), plus `START` and a **free list** headed by `AVAIL`.',
      '**Insert at front:** `NEW = AVAIL; AVAIL = LINK[AVAIL]; INFO[NEW] = x; LINK[NEW] = START; START = NEW`.',
      '**Delete the first node:** `T = START; START = LINK[START]; LINK[T] = AVAIL; AVAIL = T` (the node goes back to the free list).',
      '`AVAIL = NULL` on insert means **overflow**; `START = NULL` on delete means **underflow**.',
    ], 'This is exactly what malloc and free do for you, kept visible.'),
  ]);

  /* ---------------- module 3 ---------------- */
  after(3, 'Queue: first in, first out', [
    TB('Comparison', 'Stack and queue: the bookkeeping', ['', 'Stack', 'Queue'], [
      ['Pointers', 'top', 'front and rear'],
      ['Insert', 'top ← top + 1; store', 'rear ← rear + 1; store'],
      ['Delete', 'read; top ← top − 1', 'read; front ← front + 1'],
      ['Overflow when', 'top = MAX − 1', 'rear = MAX − 1 (circular: (rear + 1) mod MAX = front)'],
      ['Underflow when', 'top = −1', 'front > rear (circular: front = rear)'],
    ], 'Know these four tests by heart: they are asked in every paper.'),
  ]);
  after(3, 'Deque and priority queue', [
    TB('Priority queues', 'Implementing a priority queue', ['Structure', 'Insert', 'Delete best', 'Remark'], [
      ['unsorted array', 'O(1)', 'O(n)', 'scan for the best'],
      ['sorted array / list', 'O(n)', 'O(1)', 'insert in its place'],
      ['one queue per priority', 'O(1)', 'O(levels)', 'first non-empty queue'],
      ['binary heap', 'O(log n)', 'O(log n)', 'the standard choice'],
    ], 'Ascending: smallest key leaves first. Descending: largest key leaves first.'),
  ]);

  /* ---------------- module 4 ---------------- */
  after(4, 'Hashing', [
    T('Hashing', 'Chaining versus open addressing', [
      '**Chaining:** a list per slot. The table may hold more keys than slots, deletion is easy, and the average search cost is **1 + α**, where α = n/M.',
      '**Open addressing:** keys live in the table, so α ≤ 1 and the table must be rehashed when it fills (keep α below about 0.7).',
      'Expected probes for open addressing (uniform hashing): unsuccessful search **1 / (1 − α)**, successful search about **(1/α) ln (1 / (1 − α))**. At α = 0.5 that is 2 and 1.4; at α = 0.9 it is 10 and 2.6.',
      'Deleting from an open-addressed table needs a **tombstone** so later probes do not stop early.',
    ], 'Hashing is fast only while the load factor stays low.'),
  ]);
  after(4, 'Linear and binary search', [
    T('Searching', 'Why binary search is O(log n): the proof', [
      'After k comparisons the remaining range has at most n / 2ᵏ elements.',
      'The search ends when the range is empty, i.e. when n / 2ᵏ < 1, which first happens at k = ⌊log₂ n⌋ + 1.',
      'As a recurrence: T(n) = T(n/2) + 1, T(1) = 1, so T(n) = ⌊log₂ n⌋ + 1 = **Θ(log n)**.',
      'Best case: the key is the first middle element, **Θ(1)**. Average case is also Θ(log n).',
    ], 'It is only valid on sorted data with direct access, so it fails on linked lists.'),
  ]);
  after(4, 'Selection sort', [
    TB('Sorting', 'Classification of sorting methods', ['Basis', 'Types'], [
      ['where the data lives', 'internal (in memory) and external (on disk)'],
      ['method', 'exchange (bubble, quick), selection (selection, heap), insertion, merging, distribution (radix)'],
      ['comparisons', 'comparison sorts need Ω(n log n); radix and counting do not compare'],
      ['stability', 'stable: bubble, insertion, merge, radix; unstable: selection, quick, heap'],
      ['adaptive', 'faster on nearly sorted input: insertion, bubble with a flag'],
    ], 'Criteria for choosing: comparisons, moves, memory, programming effort, behaviour on the real data.'),
  ]);
  after(4, 'Quick sort', [
    V('Sorting', 'Quick sort with the first element as pivot', ['Pivot = `a[low]`. Move **i right** while `a[i] ≤ pivot`; move **j left** while `a[j] > pivot`.', 'If `i < j` swap `a[i]` and `a[j]` and continue; when `i > j` swap the pivot with `a[j]`.', 'The pivot is now in its **final** position; recurse on the two sides.', 'On a sorted array this choice gives the worst case, **O(n²)**.'], { id: 'sort', variant: 'quick', script: [['sort', { list: [40, 20, 70, 14, 60, 61, 97, 30] }]] }, 'Trace for 40 20 70 14 60 61 97 30: after the first partition 14 20 30 | 40 | 60 61 97 70.'),
  ]);
  after(4, 'Sorting algorithms compared', [
    T('Analysis', 'Where the costs come from', [
      '**Selection:** (n−1) + (n−2) + … + 1 = n(n−1)/2 comparisons, always. **Insertion:** 1 + 2 + … + (n−1) in the worst case, n − 1 in the best.',
      '**Bubble:** each swap removes one inversion; a reversed array has n(n−1)/2 inversions, a sorted one has none.',
      '**Merge sort:** T(n) = 2T(n/2) + cn; log₂ n + 1 levels, each costing cn, so Θ(n log n).',
      '**Lower bound:** a comparison sort must tell n! orderings apart, so it needs at least log₂(n!) = Ω(n log n) comparisons.',
    ], 'These derivations are the "analysis" part of every sorting question.'),
  ]);

  /* ---------------- module 5 ---------------- */
  after(5, 'Binary search tree', [
    TB('Trees', 'Types of binary trees', ['Type', 'Definition'], [
      ['strictly (full) binary', 'every node has 0 or 2 children'],
      ['complete', 'all levels full except possibly the last, filled from the left'],
      ['perfect', 'all leaves on one level; 2^(h+1) − 1 nodes'],
      ['extended (2-tree)', 'every missing child replaced by an external node'],
      ['skewed', 'every node has only a left child, or only a right child'],
      ['balanced (AVL)', 'subtree heights differ by at most 1 at every node'],
    ], 'A skewed tree is a linked list in disguise: height n − 1.'),
    T('Trees', 'Properties of binary trees, with proofs', [
      '**n nodes ⇒ n − 1 edges:** every node except the root owns exactly one edge to its parent.',
      '**Level i holds at most 2ⁱ nodes**, so height h holds at most 1 + 2 + … + 2ʰ = **2^(h+1) − 1**.',
      '**Leaves = (nodes with two children) + 1:** from n = n₀ + n₁ + n₂ and n − 1 = n₁ + 2n₂.',
      'A strictly binary tree with n₀ leaves has **2n₀ − 1** nodes. A complete tree of n nodes has height ⌊log₂ n⌋.',
    ], 'A binary tree of n nodes has n + 1 null pointers: 2n pointers, of which n − 1 point to a child.'),
    TB('Trees', 'Representing trees', ['Representation', 'How', 'Good for'], [
      ['array (1-based)', 'left child 2i, right child 2i + 1, parent ⌊i / 2⌋', 'complete trees, heaps; wastes space for skewed trees'],
      ['linked', 'node = data, left, right', 'any shape, easy insertion'],
      ['left child, right sibling', 'node = data, firstChild, nextSibling', 'turns any general tree into a binary tree'],
      ['list', '(A (B (E) (F)) (C) (D))', 'writing a tree down'],
    ], 'A right-skewed binary tree of n nodes needs 2ⁿ − 1 cells in the array form.'),
  ]);
  after(5, 'Heap and priority queue', [
    T('Heap', 'Why building a heap is O(n)', [
      'Sift-down from a node of height h costs at most h swaps.',
      'About n / 2^(h+1) nodes have height h, so the total is Σ h · n / 2^(h+1) = n · Σ h / 2^(h+1).',
      'The series Σ h / 2ʰ converges (to 2), so the total is **O(n)**.',
      'Inserting n keys one by one costs O(n log n), because every new key may rise log n levels.',
    ], 'Most nodes are near the bottom and sink only a short way.'),
  ]);
})();
