/* ============================================================
 * data/slides2.js — extra slides, inserted into the decks of
 * slides.js after a named slide. They add the intuition behind
 * each idea, one slide per algorithm for modules 4 and 5, and
 * the worked examples that the written notes use.
 * ============================================================ */
(function () {
  'use strict';
  const T = (kicker, title, bullets, key, lead) => ({ kind: 'text', kicker, title, bullets, key, lead });
  const V = (kicker, title, bullets, viz, key, lead) => ({ kind: 'viz', kicker, title, bullets, viz, key, lead });
  const TB = (kicker, title, head, rows, key, lead) => ({ kind: 'table', kicker, title, table: { head, rows }, key, lead });
  const L = [38, 27, 43, 3, 9, 82, 10];
  const sortScript = (list) => [['sort', { list: list || L }]];

  /** Insert `slides` after the slide titled `title` in the deck of module n. */
  const after = (n, title, slides) => {
    const deck = DSA.slides[n], i = deck.findIndex((s) => s.title === title);
    if (i < 0) throw new Error('slides2: no slide "' + title + '" in module ' + n);
    deck.splice(i + 1, 0, ...slides);
  };

  /* ---------------- module 1 ---------------- */
  after(1, 'What is an algorithm?', [
    T('Intuition', 'Why complexity matters', [
      'Finding a name in a **phone book** of a million entries: reading from page one is **linear**, about a million looks. Opening in the middle and halving each time is **logarithmic**, about 20 looks.',
      'A faster computer helps a slow algorithm by a constant factor. A better algorithm helps by a **growing factor**.',
      'Doubling the input: O(n) work doubles, O(n²) work **quadruples**, O(2ⁿ) work **squares**.',
    ], 'We study the shape of the cost curve, because the shape decides what is possible at large n.'),
  ]);
  after(1, 'Asymptotic notations', [
    T('Complexity', 'Best, worst and average case', [
      '**Linear search** for a key in n items. **Best case:** the key is first, 1 comparison. **Worst case:** the key is last or missing, n comparisons. **Average case:** about n/2.',
      'The **worst case** is the usual guarantee: it bounds the running time for every input.',
      'O, Ω and Θ are bounds on a function; best, worst and average are cases of an algorithm. You can quote any bound for any case.',
    ], 'When nothing is said, "the complexity" means the worst case.'),
  ]);
  after(1, 'Analysing loops', [
    TB('Complexity', 'Complexity cheat sheet', ['Code pattern', 'Cost'], [
      ['a fixed number of statements', 'O(1)'],
      ['`for (i = 0; i < n; i++)`', 'O(n)'],
      ['`for (i = 1; i < n; i *= 2)` (doubling or halving)', 'O(log n)'],
      ['loop of n whose body is O(log n)', 'O(n log n)'],
      ['two nested loops over n', 'O(n²)'],
      ['`for (j = 0; j < i; j++)` inside `for (i...n)`', 'n(n−1)/2 = O(n²)'],
      ['recursion that splits in two and merges in O(n)', 'O(n log n)'],
      ['recursion that makes two calls on n − 1', 'O(2ⁿ)'],
    ], 'Count how many times the innermost statement runs.'),
  ]);
  after(1, 'Recurrences and the Master Theorem', [
    T('Complexity', 'Solving a recurrence by unrolling', [
      'T(n) = T(n−1) + n, T(1) = 1.',
      'T(n) = T(n−2) + (n−1) + n = T(n−3) + (n−2) + (n−1) + n = … = 1 + 2 + … + n.',
      '= n(n+1)/2, so **T(n) = Θ(n²)**. This is exactly the cost of selection sort and of quick sort in its worst case.',
      'Another: T(n) = T(n/2) + 1 unrolls to log₂ n steps, so **T(n) = Θ(log n)**: binary search.',
    ], 'Unroll until the pattern is clear, then sum it.'),
  ]);
  after(1, 'Arrays', [
    T('Arrays', 'How a[i] is found in O(1)', [
      'Elements are the same size and sit next to each other, so **address = base + i × size**. No searching, one multiplication and one addition.',
      '**Row-major** 2-D arrays (C, Java): address(A[i][j]) = base + (i × columns + j) × size.',
      '**Column-major** (Fortran, MATLAB): address(A[i][j]) = base + (j × rows + i) × size.',
      'Example: int A[10][20], base 1000, A[3][5] is at 1000 + (3 × 20 + 5) × 4 = **1260**.',
    ], 'Constant-time access is the array\'s superpower; costly insertion in the middle is its weakness.'),
  ]);

  /* ---------------- module 2 ---------------- */
  after(2, 'Arrays versus linked lists', [
    T('The idea', 'A treasure hunt of nodes', [
      'Each node is a **clue card**: it holds some data and tells you where the next card is.',
      'You are only given the first card (**head**). To reach the 5th you must follow the clues: no shortcut, so access by position is **O(n)**.',
      'The benefit: inserting a new card means changing **one clue**, not moving every other card, so insertion after a known node is **O(1)**.',
      'The last card says "no more": its next pointer is **NULL**.',
    ], 'A linked list trades fast access for cheap rearrangement.'),
  ]);
  after(2, 'Inserting a node', [
    T('Pointer care', 'Order of the pointer assignments', [
      'To insert `q` after `p`:  `q->next = p->next;` first, then `p->next = q;`.',
      'Reverse the two lines and `p->next` already points to `q`, so the original rest of the list is **lost**.',
      'Rule: **make the new node point at what it will precede before anyone points at the new node.**',
      'Always test: empty list, a single node, inserting at the head, inserting at the tail.',
    ], 'Draw the arrows on paper and number the order in which you change them.'),
  ]);
  after(2, 'Doubly linked list', [
    T('Doubly linked', 'Insert and delete in a doubly linked list', [
      '**Insert q after p:** `q->next = p->next; q->prev = p; p->next->prev = q; p->next = q;` (check `p->next != NULL` first).',
      '**Delete p:** `p->prev->next = p->next; p->next->prev = p->prev; free(p);` with checks for the first and last node.',
      'Because every node knows its predecessor, deleting a node you hold a pointer to is **O(1)**; in a singly linked list you would first have to find its predecessor.',
      'Cost: one more pointer per node and twice as many pointer updates.',
    ], 'More pointers to keep consistent, in exchange for movement in both directions.'),
  ]);
  after(2, "Floyd's tortoise and hare", [
    T('Two-pointer tricks', 'Middle and nth from the end', [
      '**Middle:** move `slow` by 1 and `fast` by 2. When `fast` reaches the end, `slow` is at the middle. One pass, O(1) space.',
      '**nth from the end:** move `fast` n nodes ahead, then move both together; when `fast` reaches the end, `slow` is the nth from the end.',
      '**Cycle test:** if `fast` ever meets `slow`, there is a cycle; if `fast` reaches NULL, there is none.',
      'All three are **O(n) time and O(1) space** and avoid counting the length first.',
    ], 'Two pointers at different speeds turn a length question into a single pass.'),
  ]);
  after(2, 'Multi-linked lists', [
    T('Applications', 'Where linked lists are used', [
      '**Sparse matrix:** each non-zero element has a `right` link (next in its row) and a `down` link (next in its column).',
      '**Polynomials:** one node per non-zero term, kept in decreasing order of exponent.',
      '**Stacks and queues** without a fixed capacity; **adjacency lists** of graphs; **chaining** in hash tables.',
      '**Operating systems:** free-memory lists, process lists. **Applications:** undo history, music playlists, browser history.',
    ], 'Whenever the size is unknown or items are inserted and removed in the middle, think linked list.'),
  ]);

  /* ---------------- module 3 ---------------- */
  after(3, 'Stack: last in, first out', [
    T('Stack', 'Where stacks hide', [
      '**Undo** in an editor: the most recent action is undone first.',
      'The **call stack**: the function called last returns first, and each call has its own frame.',
      '**Browser back button**, the pile of plates, a stack of books.',
      'Overflow means pushing onto a full stack; underflow means popping from an empty one. Both operations are **O(1)**.',
    ], 'Any problem that says "the most recent unfinished thing" is a stack problem.'),
  ]);
  after(3, 'Queue: first in, first out', [
    T('Queue', 'Why the plain array queue wastes space', [
      'After a few dequeues the `front` index has moved right, and the cells before it are empty but **never reused**.',
      'When `rear` reaches the last cell, the queue reports "full" although it may be almost empty.',
      'Fix 1: shift everything left on each dequeue, which costs O(n). Fix 2: the **circular queue**, where an index that passes the end wraps to 0.',
    ], 'Next slide: the circular queue, where `(rear + 1) % MAX` brings the index back.'),
  ]);
  after(3, 'Circular queue', [
    V('Queue', 'Deque: both ends', ['A **double-ended queue** allows insertion and deletion at **both** the front and the rear, all in O(1).', 'Used as a stack (one end), as a queue (two ends), and for sliding-window problems.', '**Input-restricted:** insert at one end only. **Output-restricted:** delete at one end only.'], { id: 'deque', script: [['insR', { value: 10 }], ['insR', { value: 20 }], ['insF', { value: 5 }], ['delR', {}]] }, 'The two ends make the deque more general than both the stack and the queue.'),
  ]);
  after(3, 'Infix to postfix', [
    TB('Expressions', 'Infix, prefix and postfix side by side', ['Infix', 'Prefix', 'Postfix'], [
      ['A + B', '+ A B', 'A B +'],
      ['A + B * C', '+ A * B C', 'A B C * +'],
      ['(A + B) * C', '* + A B C', 'A B + C *'],
      ['A * (B + C) / D', '/ * A + B C D', 'A B C + * D /'],
      ['A ^ B ^ C', '^ A ^ B C', 'A B C ^ ^'],
    ], 'Postfix and prefix need no brackets and no precedence rules: the order of the symbols already says what to do first.', 'Precedence: ^ then * / then + −. ^ associates right to left; the others left to right.'),
  ]);
  after(3, 'Balanced brackets', [
    TB('Summary', 'Stack and queue compared', ['', 'Stack', 'Queue'], [
      ['Order', 'LIFO: last in, first out', 'FIFO: first in, first out'],
      ['Insert at', 'top', 'rear'],
      ['Delete from', 'top', 'front'],
      ['Pointers needed', 'top', 'front and rear'],
      ['Cost of each operation', 'O(1)', 'O(1)'],
      ['Typical uses', 'recursion, undo, expression evaluation, DFS', 'scheduling, buffers, BFS, level-order'],
    ], 'Pick by the order in which you need the items back.'),
  ]);

  /* ---------------- module 4 ---------------- */
  after(4, 'Linear and binary search', [
    V('Searching', 'Linear search', ['Compare the key with each element, left to right, until found or the end is reached.', 'Needs no ordering, so it works on unsorted arrays and on linked lists.', 'Best case 1 comparison, worst case n, average about n/2: **O(n)**.'], { id: 'search', variant: 'linear', script: [['go', { list: L, key: 9 }]] }, 'The simplest search, and the only choice for unsorted data.'),
    TB('Searching', 'How fast is binary search?', ['Items n', 'Linear search (worst)', 'Binary search (worst)'], [
      ['100', '100', '7'], ['1,000', '1,000', '10'], ['1,000,000', '1,000,000', '20'], ['1,000,000,000', '1,000,000,000', '30'],
    ], 'Each comparison halves the range, so n items need at most ⌊log₂ n⌋ + 1 comparisons.', 'Like guessing a number from 1 to 1000 with "higher or lower" hints: 10 guesses are enough.'),
  ]);
  after(4, 'Hashing', [
    T('Hashing', 'Hash functions', [
      '**Division:** `h(k) = k mod M`. Choose M prime and not close to a power of 2.',
      '**Folding:** split the key into parts and add them (phone number 98 76 54 → 98 + 76 + 54).',
      '**Mid-square:** square the key and keep the middle digits. **Multiplication:** `⌊M · frac(k·A)⌋`.',
      'A good hash function is **fast** and **spreads keys evenly**. For strings, combine every character: `h = h·31 + c`.',
    ], 'Collisions cannot be avoided entirely; they are handled, not prevented.'),
    V('Hashing', 'Linear probing', ['On a collision try the next slot, wrapping around the table: i, i+1, i+2, …', 'Search follows the same probe sequence and stops at an **empty** slot.', 'A deleted slot becomes a **tombstone**, not empty, or later searches would stop too early.', 'Weakness: **primary clustering**, long runs of occupied slots.'], { id: 'hash', variant: 'linear', script: [['insert', { key: 15 }], ['insert', { key: 22 }], ['insert', { key: 8 }], ['insert', { key: 36 }], ['search', { key: 36 }]] }, 'M = 7: 15, 22, 8 and 36 all hash to slot 1, so each probes further than the last.'),
    V('Hashing', 'Quadratic probing and double hashing', ['**Quadratic:** probe i + 1², i + 2², i + 3², … Breaks up primary clustering, but may not reach every slot.', '**Double hashing:** the step size is a second hash h₂(k). Keys that collide follow **different** paths.', 'All open-addressing methods get slow as the **load factor** n/M approaches 1; rehash into a bigger table before that (about 0.7).'], { id: 'hash', variant: 'double', script: [['insert', { key: 15 }], ['insert', { key: 22 }], ['insert', { key: 8 }], ['search', { key: 8 }]] }, 'Here h₂(k) = 5 − (k mod 5) is used with M = 7.'),
  ]);
  // the old combined "Bubble and selection sort" slide becomes two separate ones
  {
    const deck = DSA.slides[4], i = deck.findIndex((s) => s.title === 'Bubble and selection sort');
    deck.splice(i, 1,
      V('Elementary sorts', 'Bubble sort', ['Compare neighbours and **swap** if out of order. After each pass the largest remaining value has "bubbled" to the end.', 'Pass k makes n − k comparisons: up to n(n−1)/2 in total, **O(n²)**.', 'With a flag that stops when a pass makes no swap, an already sorted list costs one pass: **O(n)**.', 'Stable and in place.'], { id: 'sort', variant: 'bubble', script: sortScript() }, 'Simple but slow; mainly a teaching algorithm.'),
      V('Elementary sorts', 'Selection sort', ['Find the **minimum** of the unsorted part and swap it to the front of that part.', 'Always n(n−1)/2 comparisons: **O(n²) in every case**, even for sorted input.', 'But at most **n − 1 swaps**, which matters when writing is expensive.', 'In place, **not stable** (the long swap can jump over equal keys).'], { id: 'sort', variant: 'selection', script: sortScript() }, 'Choose the smallest, put it in place, repeat.'));
  }
  after(4, 'Insertion sort', [
    T('Sorting', 'Stable and in-place sorting', [
      'A sort is **stable** if equal keys keep their original order. Records sorted by marks, then stably by class, stay in marks order inside each class.',
      'A sort is **in place** if it needs only O(1) extra memory.',
      '**Stable:** bubble, insertion, merge, radix. **Not stable:** selection, quick, heap (without extra work).',
      '**In place:** bubble, selection, insertion, heap, quick (O(log n) stack). **Needs O(n):** merge and radix.',
    ], 'Stability matters whenever records have more than one sort key.'),
  ]);
  after(4, 'Quick sort', [
    T('Sorting', 'Why quick sort can be slow', [
      'The partition step is O(n). If the pivot splits the range evenly, the depth is log n and the total is **O(n log n)**.',
      'If the pivot is always the smallest or largest (for example the first element of an already sorted array), the split is 0 and n − 1: T(n) = T(n−1) + n = **O(n²)**.',
      'Cures: a **random pivot**, or the **median of three** (first, middle, last).',
      'Quick sort is usually fastest in practice because it is in place and works on neighbouring memory.',
    ], 'Pivot choice decides everything.'),
  ]);
  after(4, 'Sorting algorithms compared', [
    TB('Summary', 'Which sort should I use?', ['Situation', 'Choice', 'Why'], [
      ['small or nearly sorted data', 'insertion sort', 'O(n) when nearly sorted, no overhead'],
      ['general purpose, average speed', 'quick sort', 'fast in practice, in place'],
      ['need O(n log n) guaranteed and stable', 'merge sort', 'predictable, stable; needs O(n) space'],
      ['need O(n log n) guaranteed with O(1) space', 'heap sort', 'in place, never O(n²)'],
      ['integers with few digits', 'radix sort', 'linear time, no comparisons'],
      ['data larger than memory', 'external merge sort', 'sequential disk access, k-way merging'],
    ], 'No comparison sort can beat Ω(n log n) in the worst case.'),
  ]);

  /* ---------------- module 5 ---------------- */
  const T7 = [50, 30, 70, 20, 40, 60, 80];
  const tree = (variant, ...steps) => ({ id: 'tree', variant, script: [['build', { list: T7 }], ...steps] });

  after(5, 'Binary search tree', [
    TB('Trees', 'Tree terminology', ['Term', 'Meaning'], [
      ['root', 'the top node; it has no parent'],
      ['parent, child, sibling', 'direct neighbours going down; children of one parent'],
      ['leaf', 'a node with no children'],
      ['degree', 'number of children of a node'],
      ['level, depth', 'distance from the root (the root is at level 0)'],
      ['height', 'longest path from a node down to a leaf'],
      ['subtree', 'a node with all of its descendants'],
      ['complete binary tree', 'all levels full except possibly the last, filled from the left'],
    ], 'A tree of n nodes has n − 1 edges. A binary tree of height h has at most 2^(h+1) − 1 nodes.'),
    V('Binary search tree', 'Searching a BST', ['Start at the root. **Smaller** than the node: go left. **Larger:** go right. Equal: found.', 'Each step discards a whole subtree, like binary search on an array.', 'Cost = the number of nodes on the path: **O(height)**.', 'Inserting follows the same path and attaches the new key as a leaf.'], tree('bst', ['search', { value: 60 }]), 'Searching for 60: 50 → right, 70 → left, 60 found. Three steps, not seven.'),
    V('Binary search tree', 'The problem: unbalanced trees', ['Insert 10, 20, 30, 40, 50 in that order into a plain BST.', 'Every key goes to the right, so the tree becomes a **chain** of height n − 1.', 'Search, insert and delete degrade from O(log n) to **O(n)**.', 'The fix is to keep the tree **balanced**: the AVL tree on the next slides.'], { id: 'tree', variant: 'bst', script: [['build', { list: [10, 20, 30, 40, 50] }]] }, 'The shape of a BST depends on the order of insertion.'),
  ]);
  {
    // one slide per traversal replaces the single "Tree traversals" slide
    const deck = DSA.slides[5], i = deck.findIndex((s) => s.title === 'Tree traversals');
    deck.splice(i, 1,
      V('Traversals', 'Inorder traversal: left, node, right', ['Visit the left subtree, then the node, then the right subtree.', 'On a BST this visits the keys in **sorted order**.', 'Used to print a BST sorted and to validate that a tree is a BST.'], tree('bst', ['inorder', {}]), 'Result: 20 30 40 50 60 70 80.'),
      V('Traversals', 'Preorder traversal: node, left, right', ['Visit the node **before** its subtrees.', 'The first key is always the root, so preorder is used to **copy** a tree or write it out so it can be rebuilt.', 'Prefix expressions come from a preorder walk of an expression tree.'], tree('bst', ['preorder', {}]), 'Result: 50 30 20 40 70 60 80.'),
      V('Traversals', 'Postorder traversal: left, right, node', ['Visit both subtrees **before** the node.', 'The root is visited last, so postorder is used to **delete** a tree (children before the parent) and to evaluate an expression tree.', 'Postfix expressions come from a postorder walk.'], tree('bst', ['postorder', {}]), 'Result: 20 40 30 60 80 70 50.'),
      V('Traversals', 'Level-order traversal', ['Visit the tree **row by row**, left to right, using a **queue**.', 'Enqueue the root; repeatedly dequeue a node, visit it, and enqueue its children.', 'This is breadth-first search applied to a tree. O(n).'], tree('bst', ['level', {}]), 'Result: 50 30 70 20 40 60 80.'),
      T('Traversals', 'Rebuilding a tree from traversals', [
        'The **inorder** sequence plus the **preorder** (or postorder) sequence identify a binary tree **uniquely**.',
        'Preorder tells you the root (its first key); find that key in the inorder sequence: everything to its left is the left subtree, everything to its right is the right subtree. Recurse.',
        'Preorder alone, or inorder alone, is **not** enough. Preorder plus postorder is not enough either, unless every node has 0 or 2 children.',
      ], 'Typical exam question: given the inorder and preorder lists, draw the tree.'));
  }
  after(5, 'AVL tree', [
    V('Height balanced trees', 'AVL rotations: LL and RR', ['Insert 10, 20, 30. Node 10 now has balance factor **−2** (right-right case).', 'A single **left rotation** at 10 lifts 20 to the root, with 10 and 30 as its children.', 'The mirror case (insert 30, 20, 10) is LL and needs a single **right rotation**.', 'A rotation changes a constant number of pointers and keeps the BST order.'], { id: 'tree', variant: 'avl', script: [['build', { list: [10, 20, 30] }]] }, 'The tree is balanced again, and its height is 1 instead of 2.'),
    V('Height balanced trees', 'AVL rotations: LR and RL', ['Insert 30, 10, 20. Node 30 is left-heavy, but its left child 10 is **right-heavy**: the **LR** case.', 'A single rotation does not help. First rotate 10 to the **left**, then rotate 30 to the **right**: a **double rotation**.', 'The mirror case is **RL**: rotate the right child right, then the node left.', 'After the fix the subtree has the same height as before the insert, so nothing above it changes.'], { id: 'tree', variant: 'avl', script: [['build', { list: [30, 10, 20] }]] }, 'Four cases in all: LL and RR need one rotation, LR and RL need two.'),
  ]);
  after(5, 'Heap and priority queue', [
    V('Heap', 'Min-heap and heap order', ['In a **min-heap** every parent is **≤** its children, so the smallest key is at the root.', 'Stored in an array: the children of index i are at **2i + 1** and **2i + 2**, the parent is at **(i − 1) / 2**.', '**Extract-min:** replace the root with the last element and sift it down. O(log n).', 'The structure behind priority queues, Prim, Dijkstra and heap sort.'], { id: 'heap', variant: 'min', script: [['build', { list: [20, 35, 10, 50, 5, 40] }], ['extract', {}]] }, 'A heap only orders parent against child. It is not sorted, and it is not a BST.'),
  ]);
  after(5, 'Disjoint set (union-find)', [
    V('Disjoint sets', 'Union by rank', ['Without care, repeated unions can make a long chain and `find` becomes O(n).', '**Union by rank:** attach the root of the shorter tree under the root of the taller one. The height grows only when two equal trees merge.', 'A set of n elements then has a tree of height at most log n.'], { id: 'dsu', variant: 'plain', script: [['union', { x: 1, y: 2 }], ['union', { x: 3, y: 4 }], ['union', { x: 2, y: 4 }], ['find', { x: 3 }]] }, 'Keep the trees shallow.'),
  ]);
  after(5, 'Graph terminology', [
    TB('Graphs', 'Adjacency matrix versus adjacency list', ['', 'Adjacency matrix', 'Adjacency list'], [
      ['Storage', 'V × V table', 'array of V lists'],
      ['Space', 'O(V²)', 'O(V + E)'],
      ['Edge (u, v) present?', 'O(1)', 'O(degree of u)'],
      ['All neighbours of u', 'O(V)', 'O(degree of u)'],
      ['Best for', 'dense graphs', 'sparse graphs'],
    ], 'Most real graphs are sparse, so the adjacency list is the default.'),
  ]);
  after(5, 'Minimum spanning tree', [
    V('Spanning tree', "Prim's algorithm", ['Start from one vertex. Repeat: among all edges that leave the tree, add the **cheapest**, together with its new vertex.', 'After V − 1 additions the tree spans the graph.', 'O(E log V) with a heap; O(V²) with arrays.', "Prim grows **one tree**; Kruskal grows a **forest** that merges."], { id: 'graph', variant: 'prim', script: [['go', { start: 'A' }]] }, 'Both algorithms are greedy and both give an MST of the same total weight.'),
    V('Beyond the syllabus', "Dijkstra's shortest path", ['Like Prim, but a vertex is chosen by its **distance from the source**, not by the cost of one edge.', 'Settle the nearest unsettled vertex, then **relax** its edges: `dist[w] = min(dist[w], dist[u] + c)`.', 'Needs **non-negative** weights. O((V + E) log V) with a heap.'], { id: 'graph', variant: 'dijkstra', script: [['go', { start: 'A' }]] }, 'The distances shown under the vertices only ever decrease until the vertex is settled.'),
    V('Beyond the syllabus', 'Topological sort', ['An ordering of a **directed acyclic graph** in which every edge points forward, such as a valid order for courses with prerequisites.', '**Kahn:** repeatedly output a vertex with in-degree 0 and delete its edges. **DFS:** output vertices in reverse finishing order.', 'O(V + E). If no vertex has in-degree 0 and vertices remain, there is a cycle.'], { id: 'toposort', variant: 'kahn', script: [['go', {}]] }, 'Many scheduling problems are topological sorts in disguise.'),
  ]);
})();
