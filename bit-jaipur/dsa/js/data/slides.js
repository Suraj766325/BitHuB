/* ============================================================
 * data/slides.js — the animated deck for each module.
 * slide = { kind: 'cover' | 'text' | 'viz' | 'table' | 'widget',
 *           kicker, title, lead, bullets, key, viz: {id, variant, script},
 *           table: {head, rows} }
 * `viz.script` is a list of [operation, arguments] steps that is
 * played from a fresh state when the slide appears.
 * ============================================================ */
(function () {
  'use strict';
  const T = (kicker, title, bullets, key, lead) => ({ kind: 'text', kicker, title, bullets, key, lead });
  const V = (kicker, title, bullets, viz, key, lead) => ({ kind: 'viz', kicker, title, bullets, viz, key, lead });
  const TB = (kicker, title, head, rows, key, lead) => ({ kind: 'table', kicker, title, table: { head, rows }, key, lead });

  DSA.slides = {
    1: [
      { kind: 'cover' },
      T('Foundations', 'What is a data structure?', [
        'A **data structure** is a way of organising data in memory so that the operations we need are efficient.',
        'An **abstract data type (ADT)** says *what* operations exist (push, pop, insert, search); a data structure says *how* they are stored.',
        '**Linear:** array, linked list, stack, queue. **Non-linear:** tree, graph.',
        'The right choice depends on which operations are frequent: lookups, inserts, deletes, ordered traversal.',
      ], 'Same ADT, different structures: a stack can sit on an array or on a linked list, with different trade-offs.'),
      T('Foundations', 'What is an algorithm?', [
        'A finite sequence of well-defined steps that solves a problem.',
        'Five properties: **input, output, definiteness, finiteness, effectiveness**.',
        'The same problem can have many algorithms; we compare them by how their cost grows with the input size n.',
        'We measure **time** (number of basic steps) and **space** (extra memory), never seconds on one machine.',
      ], 'Count steps as a function of n. Ignore constants and lower-order terms.'),
      { kind: 'widget', widget: 'growth', kicker: 'Complexity', title: 'Order of growth', bullets: ['Switch each curve on and off, and drag **n** to see how quickly the curves separate.', 'For small n, anything works. For large n, only the shape of the curve matters.', 'Typical ranking: log n < n < n log n < n² < n³ < 2ⁿ < n!'], key: 'An n² algorithm on one million items is about a trillion steps; an n log n one is about twenty million.' },
      TB('Complexity', 'Asymptotic notations', ['Notation', 'Meaning', 'Reads as'], [
        ['O(g(n))', 'f(n) ≤ c·g(n) for all n ≥ n₀', 'upper bound ("at most")'],
        ['Ω(g(n))', 'f(n) ≥ c·g(n) for all n ≥ n₀', 'lower bound ("at least")'],
        ['Θ(g(n))', 'c₁·g(n) ≤ f(n) ≤ c₂·g(n)', 'tight bound (both)'],
      ], 'Example: 3n² + 5n + 2 = Θ(n²), because 3n² ≤ 3n² + 5n + 2 ≤ 4n² for n ≥ 6.', 'Each describes how f(n) is bounded by a simple function g(n) once n is large enough.'),
      T('Complexity', 'Analysing loops', [
        'A single loop running n times: **O(n)**.',
        'Nested loops, both to n: **O(n²)**. For `i = 1..n, j = i..n` the count is n(n+1)/2, still **O(n²)**.',
        'A loop that doubles or halves its counter (`i = i * 2`): **O(log n)**.',
        'Consecutive blocks add (keep the larger); nested blocks multiply.',
        'Best, average and worst case can differ: linear search is O(1), O(n) and O(n).',
      ], 'Count how many times the innermost statement runs, then simplify.'),
      TB('Complexity', 'Recurrences and the Master Theorem', ['T(n)', 'a, b, f(n)', 'Case', 'Result'], [
        ['2T(n/2) + n', 'a=2, b=2, f=n', 'f(n) = n^(log_b a): case 2', 'Θ(n log n)'],
        ['4T(n/2) + n', 'a=4, b=2, f=n', 'n² dominates f: case 1', 'Θ(n²)'],
        ['T(n/2) + 1', 'a=1, b=2, f=1', 'f(n) = n⁰: case 2', 'Θ(log n)'],
        ['T(n−1) + 1', 'not of the form aT(n/b)', 'unroll', 'Θ(n)'],
      ], 'For T(n) = aT(n/b) + f(n), compare f(n) with n^(log_b a). Smaller: that power wins. Equal: multiply by log n. Larger: f(n) wins.'),
      V('Recursion', 'Recursion and the call tree', ['A function that calls itself, with a **base case** that stops it.', 'Each call waits on the stack until its sub-calls return.', 'Factorial makes n calls: O(n). Fibonacci recomputes the same values: **O(2ⁿ)**.'], { id: 'recursion', variant: 'fib', script: [['run', { n: 4 }]] }, 'Always check: is there a base case, and does every call move toward it?'),
      V('Arrays', 'Arrays', ['Consecutive memory: `address(a[i]) = base + i × size`, so access is **O(1)**.', 'Insert or delete in the middle shifts the elements after it: **O(n)**.', 'Fixed size: overflow when full.', 'A 2-D array is stored row-major (rows one after another) or column-major.'], { id: 'array', script: [['insert', { value: 18, pos: 1 }], ['delete', { pos: 3 }]] }, 'Row-major: address(a[i][j]) = base + (i × columns + j) × size.'),
      V('Arrays', 'Sparse matrix', ['When most entries are zero, store only the non-zero ones as **(row, column, value)** triplets.', 'A header row holds the dimensions and the count of non-zero values.', 'Transposing swaps row and column, then re-orders the triplets.'], { id: 'sparse', variant: 'triplet', script: [['go']] }, 'Memory drops from rows × columns to 3 × (non-zero + 1).'),
      V('Arrays and lists', 'Polynomial operations', ['A polynomial is a list of terms (coefficient, exponent), kept in decreasing exponent order.', 'Addition is a **merge**: equal exponents add, otherwise the larger exponent is copied.', 'For m and n terms it takes **O(m + n)**.'], { id: 'poly', script: [['add', { p: '5x^4 + 3x^2 + 7', q: '4x^3 + 6x^2 - 3' }]] }, 'A linked list is the natural home for a polynomial: terms appear and vanish as results are computed.'),
    ],

    2: [
      { kind: 'cover' },
      T('Why linked lists', 'Arrays versus linked lists', [
        'An array needs one block of memory and a size fixed in advance; inserting in the middle shifts everything.',
        'A linked list is a chain of **nodes**, each holding data and a pointer to the next node.',
        'Nodes can be anywhere in memory, and the list grows and shrinks one node at a time.',
        'The price: **no random access** (reaching the i-th node takes O(i)) and one extra pointer per node.',
      ], 'Insert/delete after a known node: O(1) for a list, O(n) for an array. Access by index: O(1) for an array, O(n) for a list.'),
      V('Singly linked list', 'Inserting a node', ['**At the front:** new.next = head; head = new. O(1).', '**At the end:** walk to the last node, then link. O(n) (O(1) with a tail pointer).', '**After a node:** find the position, then two pointer changes.', 'The order of the pointer assignments matters: link the new node first, or the rest of the list is lost.'], { id: 'list', variant: 'singly', script: [['insF', { value: 5 }], ['insAt', { value: 35, pos: 4 }]] }, 'Insertion itself is O(1); finding the place is what costs O(n).'),
      V('Singly linked list', 'Deleting a node', ['**First node:** head = head.next. O(1).', '**Last node:** stop at the second-last node; its next becomes NULL.', '**A given value:** keep a `prev` pointer so the previous node can skip the deleted one.', 'Always `free()` the removed node.'], { id: 'list', variant: 'singly', script: [['delV', { value: 23 }], ['delF'], ['delE']] }, 'Deleting from an empty list is **underflow**: check `head == NULL` first.'),
      V('Singly linked list', 'Reversing a list', ['Three pointers: `prev`, `cur` and `next`.', 'For every node: save next, turn `cur.next` back to `prev`, then slide all three ahead.', 'One pass, **O(n) time, O(1) extra space**.', 'A very common interview and exam question.'], { id: 'list', variant: 'singly', script: [['reverse']] }, 'Never break a link before saving where it pointed.'),
      V('Circular linked list', 'Circular list', ['The last node points back to the **head**, not to NULL.', 'Traversal stops when the pointer returns to the head.', 'Any node can be a starting point, which suits round-robin scheduling and playlists that repeat.', 'Inserting at the front needs the last node updated too, so keep a pointer to the **last** node to make both ends O(1).'], { id: 'list', variant: 'circular', script: [['insE', { value: 50 }], ['delF'], ['search', { value: 40 }]] }, 'In a circular list there is no NULL to stop on: a loop that checks for NULL will never end.'),
      V('Doubly linked list', 'Doubly linked list', ['Every node has **prev** and **next**, so the list can be walked in both directions.', 'A node can delete itself given only a pointer to it: `n.prev.next = n.next; n.next.prev = n.prev`.', 'Cost: one more pointer per node and more pointer updates on every insert or delete.', 'Used in browsers (back/forward), undo/redo and LRU caches.'], { id: 'list', variant: 'doubly', script: [['insAt', { value: 77, pos: 2 }], ['delV', { value: 40 }]] }, 'Deleting a node you already hold is O(1) in a doubly linked list but O(n) in a singly linked one.'),
      V('Detecting a cycle', 'Floyd\'s tortoise and hare', ['Move `slow` by one node and `fast` by two.', 'If the list has a cycle, `fast` eventually catches `slow` inside it.', 'If `fast` reaches NULL there is no cycle.', '**O(n) time, O(1) space**: no visited set needed.'], { id: 'cycle', script: [['detect', { link: 2 }]] }, 'Inside a loop the gap between the pointers shrinks by one every step, so they must meet.'),
      V('Multi-linked list', 'Multi-linked lists', ['A node holds **more than one** link, so it can belong to several lists at once.', 'A sparse matrix: each non-zero element is on its row list (right) and its column list (down).', 'Other uses: a student record on a "by class" list and a "by name" list.', 'Traversing a row or column visits only the non-zero entries.'], { id: 'multilist', script: [['row', { r: 2 }], ['col', { c: 1 }]] }, 'One set of nodes, several ways of walking through them.'),
      TB('Summary', 'Operation costs', ['Operation', 'Array', 'Singly', 'Doubly'], [
        ['Access i-th', 'O(1)', 'O(n)', 'O(n)'],
        ['Insert / delete at front', 'O(n)', 'O(1)', 'O(1)'],
        ['Insert at end (with tail)', 'O(1)', 'O(1)', 'O(1)'],
        ['Delete at end', 'O(1)', 'O(n)', 'O(1) with tail'],
        ['Delete a given node', 'O(n)', 'O(n)', 'O(1)'],
        ['Extra memory per element', '0', '1 pointer', '2 pointers'],
      ], 'Choose a linked list when you insert and delete a lot and rarely index; choose an array when you index a lot.'),
    ],

    3: [
      { kind: 'cover' },
      V('Stack', 'Stack: last in, first out', ['All work happens at the **top**: **push** adds, **pop** removes, **peek** reads.', '**Overflow** when pushing to a full array stack; **underflow** when popping an empty one.', 'With an array keep an index `top` (−1 means empty). With a linked list `top` is the head pointer.', 'Every operation is **O(1)**.'], { id: 'stack', variant: 'array', script: [['push', { value: 12 }], ['push', { value: 7 }], ['push', { value: 31 }], ['pop'], ['pop']] }, 'The most recent item is always the next one out, like a pile of plates.'),
      V('Stack', 'Stack on a linked list', ['No fixed capacity, so no overflow (until memory runs out).', 'Push is "insert at head" and pop is "delete at head": both O(1).', 'Costs one pointer of extra memory per element.'], { id: 'stack', variant: 'linked', script: [['push', { value: 12 }], ['push', { value: 7 }], ['pop']] }, 'Array stack: simple and cache-friendly but bounded. Linked stack: unbounded but pointer-heavy.'),
      V('Queue', 'Queue: first in, first out', ['**Enqueue** at the **rear**, **dequeue** from the **front**.', 'In a plain array queue, `front` only moves forward, so slots behind it are **wasted** even when the queue looks full.', 'Both operations are O(1).'], { id: 'queue', variant: 'linear', script: [['enqueue', { value: 4 }], ['enqueue', { value: 9 }], ['enqueue', { value: 15 }], ['dequeue'], ['dequeue']] }, 'Customers at a counter: first to arrive is first to be served.'),
      V('Circular queue', 'Circular queue', ['Treat the array as a ring: after the last index comes index 0.', '`rear = (rear + 1) % MAX` and `front = (front + 1) % MAX`.', 'Full when `(rear + 1) % MAX == front`; empty when `front == -1`.', 'Reuses every freed slot, so nothing is wasted.'], { id: 'queue', variant: 'circular', script: [['enqueue', { value: 1 }], ['enqueue', { value: 2 }], ['enqueue', { value: 3 }], ['dequeue'], ['dequeue'], ['enqueue', { value: 4 }]] }, 'Use a circular queue when the queue is used continuously: buffers, scheduling, streaming.'),
      V('Variants of queue', 'Deque and priority queue', ['**Deque:** insert and delete at both ends. Restricted forms: input-restricted and output-restricted.', '**Priority queue:** the element with the highest priority leaves first, whatever its arrival order. Ties leave in arrival order.', 'Implemented with a sorted list or, more efficiently, with a **heap** (Module V).'], { id: 'pqueue', script: [['insert', { value: 40, pr: 3 }], ['insert', { value: 15, pr: 1 }], ['insert', { value: 62, pr: 2 }], ['remove']] }, 'CPU scheduling, hospital triage and Dijkstra\'s algorithm all use a priority queue.'),
      V('Application', 'Infix to postfix', ['**Infix:** A + B * C. **Postfix:** A B C * +. Postfix needs no brackets and no precedence rules at evaluation time.', 'Operands go straight to the output; operators wait on a stack.', 'Pop operators of **higher or equal** precedence first, push the current one, and pop to the matching "(" on ")".'], { id: 'infix', script: [['convert', { expr: '(A-B)+C*D/E-C' }]] }, 'Precedence: ^ then * / % then + −. Operators of equal precedence group left to right (except ^).'),
      V('Application', 'Evaluating postfix', ['Scan left to right. A number is pushed.', 'An operator pops two values, applies itself, and pushes the result.', 'The **second** value popped is the **left** operand, which matters for − and /.', 'At the end exactly one value remains: the answer.'], { id: 'postfix', script: [['eval', { expr: '12 3 4 + * 2 / 5 6 - +' }]] }, 'This is exactly how a calculator or a compiler\'s expression evaluator works.'),
      V('Application', 'Balanced brackets', ['Push each opening bracket. On a closing bracket, the top of the stack must be its partner.', 'Not balanced if: the stack is empty on a closing bracket, the top does not match, or brackets remain at the end.', '**O(n)** time.'], { id: 'parens', script: [['check', { expr: '{[()]()}' }], ['check', { expr: '([)]' }]] }, 'The same idea checks HTML tags and parentheses in code.'),
      V('Application', 'Tower of Hanoi', ['Move n disks from A to C using B; a larger disk may never sit on a smaller one.', 'Recursive idea: move n−1 disks to B, move the largest to C, move the n−1 disks onto C.', 'T(n) = 2T(n−1) + 1, so **2ⁿ − 1 moves**: O(2ⁿ).'], { id: 'hanoi', script: [['solve', { n: 3 }]] }, 'The recursion stack is itself a stack of pending sub-problems.'),
    ],

    4: [
      { kind: 'cover' },
      V('Searching', 'Linear and binary search', ['**Linear search:** check each element in turn. Works on any list: O(n).', '**Binary search:** needs a **sorted** array. Compare with the middle and discard half: **O(log n)**.', 'Binary search on a million items needs at most 20 comparisons.', 'On a linked list binary search does not pay off, because reaching the middle itself takes O(n).'], { id: 'search', variant: 'binary', script: [['go', { list: [4, 9, 15, 23, 31, 42, 58, 67, 80], key: 42 }]] }, 'Best case O(1) for both; worst case O(n) versus O(log n).'),
      V('Hashing', 'Hashing', ['A **hash function** maps a key to a table index, e.g. h(k) = k mod M.', 'Search, insert and delete are **O(1) on average**.', 'A **collision** happens when two keys map to the same index.', '**Chaining:** each slot holds a list. **Open addressing:** probe other slots (linear probing tries i, i+1, i+2, …).', 'Load factor α = n / M controls how often collisions occur.'], { id: 'hash', variant: 'chain', script: [['insert', { key: 15 }], ['insert', { key: 22 }], ['insert', { key: 8 }], ['insert', { key: 36 }]] }, 'A good hash spreads keys evenly. A poor one turns the table into a list: O(n).'),
      V('Elementary sorts', 'Bubble and selection sort', ['**Bubble:** neighbours are compared and swapped; the largest value reaches the end of each pass. O(n²), but O(n) if already sorted (with an early stop).', '**Selection:** pick the minimum of the unsorted part and swap it into place. Always n(n−1)/2 comparisons, but at most n−1 swaps.', 'Both sort in place.'], { id: 'sort', variant: 'selection', script: [['sort', { list: [38, 27, 43, 3, 9, 82, 10] }]] }, 'Use selection sort when writes are expensive; its swap count is the lowest of any simple sort.'),
      V('Elementary sorts', 'Insertion sort', ['Grow a sorted prefix: take the next element and slide it left past larger ones.', 'Best case O(n) (already sorted), worst and average O(n²).', '**Stable**, in place, and the best simple sort for small or nearly sorted data.'], { id: 'sort', variant: 'insertion', script: [['sort', { list: [38, 27, 43, 3, 9, 82, 10] }]] }, 'Insertion sort is what most people do when sorting playing cards in their hand.'),
      V('Divide and conquer', 'Merge sort', ['Split in half, sort each half recursively, **merge** the two sorted halves.', 'T(n) = 2T(n/2) + n, so **O(n log n)** in every case.', 'Needs O(n) extra space; stable.', 'The merge step is also the basis of **external sorting**.'], { id: 'sort', variant: 'merge', script: [['sort', { list: [38, 27, 43, 3, 9, 82, 10] }]] }, 'The recursion tree has log n levels and every level does n work.'),
      V('Divide and conquer', 'Quick sort', ['Choose a **pivot**, put it in its final position with smaller values on its left and larger on its right, then sort both sides.', 'Average **O(n log n)**; worst case **O(n²)** (for example an already sorted list with the first element as pivot).', 'In place, not stable. Usually the fastest in practice.'], { id: 'sort', variant: 'quick', script: [['sort', { list: [44, 33, 11, 55, 77, 90, 40] }]] }, 'The partition step needs only one pass and no extra array.'),
      V('Non-comparison sort', 'Radix sort', ['Sort by the **least significant digit** first, then the next, up to the most significant.', 'Each pass distributes into 10 buckets (digits 0–9) and collects them in order, **stably**.', 'O(d × (n + b)) for d-digit numbers in base b. No comparisons are made, so the n log n lower bound does not apply.'], { id: 'sort', variant: 'radix', script: [['sort', { list: [170, 45, 75, 90, 802, 24, 2, 66] }]] }, 'Stability of each pass is what makes the result correct.'),
      V('Heap sort', 'Heap sort', ['Build a **max-heap**, then repeatedly swap the root (the maximum) to the end and restore the heap on the rest.', 'Building takes O(n); each of the n extractions takes O(log n): **O(n log n)** always.', 'In place, not stable.'], { id: 'sort', variant: 'heap', script: [['sort', { list: [4, 10, 3, 5, 1, 8, 7] }]] }, 'Heap sort never degrades to O(n²), unlike quick sort.'),
      V('External sorting', 'External sorting: k-way merge', ['Data too large for memory is sorted in **chunks** (runs) that fit, and each run is written to disk.', 'A **k-way merge** then reads one block from each of k runs and repeatedly outputs the smallest head.', 'Choosing the smallest of k heads with a min-heap costs O(log k), so the whole merge is **O(N log k)** with each record read once.'], { id: 'kway', script: [['merge', { runs: '3 8 15 / 1 9 12 20 / 4 5 17' }]] }, 'Disk access is the bottleneck, so the goal is to minimise the number of passes over the data.'),
      TB('Summary', 'Sorting algorithms compared', ['Algorithm', 'Best', 'Average', 'Worst', 'Space', 'Stable'], [
        ['Bubble', 'O(n)', 'O(n²)', 'O(n²)', 'O(1)', 'yes'],
        ['Selection', 'O(n²)', 'O(n²)', 'O(n²)', 'O(1)', 'no'],
        ['Insertion', 'O(n)', 'O(n²)', 'O(n²)', 'O(1)', 'yes'],
        ['Merge', 'O(n log n)', 'O(n log n)', 'O(n log n)', 'O(n)', 'yes'],
        ['Quick', 'O(n log n)', 'O(n log n)', 'O(n²)', 'O(log n)', 'no'],
        ['Heap', 'O(n log n)', 'O(n log n)', 'O(n log n)', 'O(1)', 'no'],
        ['Radix', 'O(d(n+b))', 'O(d(n+b))', 'O(d(n+b))', 'O(n+b)', 'yes'],
      ], 'A **stable** sort keeps equal keys in their original order.'),
    ],

    5: [
      { kind: 'cover' },
      V('Binary search tree', 'Binary search tree', ['Each node has at most two children. In a **BST**: left subtree < node < right subtree.', '**Search, insert, delete** follow one path from the root: **O(height)**.', 'Inorder traversal visits the keys in **sorted order**.', 'Terms: root, parent, child, leaf, height, depth, level, subtree.'], { id: 'tree', variant: 'bst', script: [['build', { list: [50, 30, 70, 20, 40, 60, 80] }], ['search', { value: 60 }]] }, 'Balanced: height ≈ log n. Built from sorted input: a chain of height n, so O(n).'),
      V('Binary search tree', 'Deleting from a BST', ['**Leaf:** just remove it.', '**One child:** the child takes its place.', '**Two children:** replace the value by its **inorder successor** (smallest in the right subtree) or predecessor, then delete that node, which has at most one child.'], { id: 'tree', variant: 'bst', script: [['build', { list: [50, 30, 70, 20, 40, 60, 80] }], ['delete', { value: 30 }], ['delete', { value: 50 }]] }, 'The tree property is kept without moving any other node.'),
      V('Traversals', 'Tree traversals', ['**Inorder:** left, node, right. **Preorder:** node, left, right. **Postorder:** left, right, node.', '**Level order** uses a queue and visits row by row.', 'Preorder copies a tree, postorder deletes it, inorder gives a BST in sorted order.', 'Each traversal is O(n).'], { id: 'tree', variant: 'bst', script: [['build', { list: [50, 30, 70, 20, 40, 60, 80] }], ['preorder'], ['postorder']] }, 'Memorise by where the node comes: PRE = before, IN = between, POST = after.'),
      V('Height balanced trees', 'AVL tree', ['An **AVL tree** is a BST where, for every node, the heights of the two subtrees differ by **at most 1**.', 'Balance factor = height(left) − height(right) ∈ {−1, 0, +1}.', 'After an insert or delete, a node with factor ±2 is fixed by a **rotation**: LL, RR, LR or RL.', 'Height stays O(log n), so every operation is **O(log n)** in the worst case.'], { id: 'tree', variant: 'avl', script: [['build', { list: [10, 20, 30, 40, 50, 25] }]] }, 'Inserting 10, 20, 30 in order would make a chain in a plain BST; AVL rotates it into a balanced tree.'),
      V('Heap', 'Heap and priority queue', ['A **complete** binary tree stored in an array: children of i are 2i+1 and 2i+2, the parent is (i−1)/2.', '**Max-heap:** every parent ≥ its children, so the maximum is at the root.', 'Insert: add at the end and sift up. Extract: move the last to the root and sift down. Both **O(log n)**.', '**Build heap** from n values in **O(n)**.'], { id: 'heap', variant: 'max', script: [['build', { list: [4, 10, 3, 5, 1, 8, 7] }], ['extract']] }, 'A heap gives a priority queue and heap sort.'),
      V('Disjoint set', 'Disjoint set (union-find)', ['Keeps a partition of elements into groups. **find(x)** returns the group\'s representative; **union(x, y)** merges two groups.', 'Each set is a tree; `parent[]` is the whole data structure.', '**Union by rank** keeps trees shallow; **path compression** flattens the path during find.', 'Together: nearly constant amortised time per operation.'], { id: 'dsu', variant: 'compress', script: [['union', { x: 1, y: 2 }], ['union', { x: 3, y: 4 }], ['union', { x: 2, y: 4 }], ['find', { x: 3 }]] }, 'Used in Kruskal\'s algorithm and for detecting cycles in undirected graphs.'),
      TB('Graphs', 'Graph terminology', ['Term', 'Meaning'], [
        ['Graph G = (V, E)', 'a set of vertices and a set of edges'],
        ['Directed / undirected', 'edges have a direction, or not'],
        ['Weighted', 'each edge carries a cost'],
        ['Degree', 'number of edges at a vertex (in-degree / out-degree if directed)'],
        ['Path, cycle', 'a sequence of vertices joined by edges; a path that returns to its start'],
        ['Connected', 'every vertex can reach every other'],
        ['Adjacency matrix', 'V × V table: O(V²) space, O(1) edge test'],
        ['Adjacency list', 'a list of neighbours per vertex: O(V + E) space'],
      ], 'Use an adjacency list for sparse graphs (E much smaller than V²) and a matrix for dense ones.'),
      V('Graph traversal', 'Breadth-first search', ['Visits vertices **level by level** using a **queue**.', 'Mark a vertex when it is enqueued so it is never enqueued twice.', 'Time **O(V + E)** with an adjacency list.', 'In an unweighted graph BFS finds the **shortest path** (fewest edges).'], { id: 'graph', variant: 'bfs', script: [['go', { start: 'A' }]] }, 'Think of ripples spreading out from the start vertex.'),
      V('Graph traversal', 'Depth-first search', ['Goes as **deep as possible** along one path, then backs up. Uses a **stack** or recursion.', 'Time **O(V + E)**.', 'The basis of cycle detection, topological sort, connected components and maze solving.'], { id: 'graph', variant: 'dfs', script: [['go', { start: 'A' }]] }, 'BFS and DFS differ only in the data structure holding the frontier: queue versus stack.'),
      V('Spanning tree', 'Minimum spanning tree', ['A **spanning tree** connects all V vertices with exactly **V − 1** edges and no cycle.', 'A **minimum** spanning tree has the least total weight.', '**Kruskal:** sort edges, add the lightest that does not form a cycle (uses union-find). O(E log E).', '**Prim:** grow one tree, always adding the lightest edge that leaves it. O(E log V) with a heap.'], { id: 'graph', variant: 'kruskal', script: [['go', { start: 'A' }]] }, 'Both greedy algorithms find a tree of the same minimum total weight.'),
    ],
  };
})();
