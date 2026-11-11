/* ============================================================
 * data/modules.js — the five modules of CS24201, in syllabus
 * order. `syllabus` is the text of the course information
 * sheet. `viz` lists the visualizers shown on the Visualize tab.
 * ============================================================ */
(function () {
  'use strict';
  window.DSA = window.DSA || {};
  DSA.COURSE = {
    code: 'CS24201', title: 'Data Structure and Algorithms', credits: 'L3 T0 P0', sem: 'Semester III · CSE',
    books: [
      { tag: 'T1', text: 'Sahni, Horowitz, Freed, Anderson: Fundamentals of Data Structures in C, 2nd ed., University Press' },
      { tag: 'R1', text: 'Reema Thareja: Data Structures Using C, 2nd ed., Oxford University Press' },
      { tag: 'R2', text: 'Tanenbaum, Langsam, Augenstein: Data Structures Using C, Pearson' },
    ],
  };
  DSA.modules = [
    {
      n: 1, title: 'Basics and analysis', long: 'Basics of data structures and algorithm analysis',
      syllabus: 'Basics of Data Structures and Algorithm, Time and Space Complexity, Asymptotic Notations, Time complexity analysis of non-recursive and recursive algorithms, Examples of multi-dimensional array, polynomial operations and sparse matrix.',
      blurb: 'What a data structure is, how to measure an algorithm, and the first structures built on arrays.',
      topics: ['ADT', 'Time & space complexity', 'Big O, Ω, Θ', 'Recurrences', 'Recursion', 'Arrays', 'Sparse matrix', 'Polynomials'],
      viz: [
        { key: 'growth', id: 'growth', group: 'Analysis', label: 'Growth of functions', widget: true, blurb: 'Plot log n, n, n log n, n² and 2ⁿ together and see why the order of growth decides everything once n is large.' },
        { key: 'recursion', id: 'recursion', variant: 'fact', group: 'Recursion', label: 'Factorial: the call stack', blurb: 'Every call waits for a smaller one; the answers come back as the stack unwinds.', script: [['run', { n: 4 }]] },
        { key: 'fibonacci', id: 'recursion', variant: 'fib', group: 'Recursion', label: 'Fibonacci: the call tree', blurb: 'Tree recursion recomputes the same values again and again: exponential time.', script: [['run', { n: 4 }]] },
        { key: 'array', id: 'array', group: 'Arrays', label: 'Array: insert, delete, search', blurb: 'Consecutive memory gives O(1) access; inserting or deleting in the middle shifts elements: O(n).', script: [['insert', { value: 18, pos: 1 }], ['delete', { pos: 3 }], ['search', { value: 31 }]] },
        { key: 'sparse', id: 'sparse', variant: 'triplet', group: 'Matrices and polynomials', label: 'Sparse matrix: triplet form', blurb: 'Store only the non-zero entries as (row, column, value) triplets.', script: [['go', {}]] },
        { key: 'transpose', id: 'sparse', variant: 'transpose', group: 'Matrices and polynomials', label: 'Sparse matrix: transpose', blurb: 'Swap row and column of every triplet and keep the triplets ordered.', script: [['go', {}]] },
        { key: 'poly', id: 'poly', group: 'Matrices and polynomials', label: 'Polynomial addition', blurb: 'Merge two lists of (coefficient, exponent) terms, adding the terms with equal exponents.', script: [['add', { p: '5x^4 + 3x^2 + 7', q: '4x^3 + 6x^2 - 3' }]] },
      ],
    },
    {
      n: 2, title: 'Linked lists', long: 'Singly, circular, doubly and multi-linked lists',
      syllabus: 'Singly Linked List: concept, representation and operations, Circular Linked List, Doubly Linked List, Multi-ply linked list and their Applications.',
      blurb: 'Dynamic structures built from nodes and pointers: every variant, every operation.',
      topics: ['Singly linked list', 'Circular list', 'Doubly linked list', 'Multi-linked list', 'Reversal', 'Cycle detection', 'Applications'],
      viz: [
        { key: 'singly', id: 'list', variant: 'singly', group: 'Singly linked list', label: 'Insert, delete, search', blurb: 'Each node points to the next one; the last points to NULL. Insert at the front is O(1), at the end O(n).', script: [['insF', { value: 5 }], ['insAt', { value: 35, pos: 4 }], ['delV', { value: 15 }], ['search', { value: 40 }]] },
        { key: 'reverse', id: 'list', variant: 'singly', group: 'Singly linked list', label: 'Reversing a list', blurb: 'Three pointers (prev, curr, next) turn every link around in one pass: O(n) time, O(1) space.', script: [['reverse', {}]] },
        { key: 'circular', id: 'list', variant: 'circular', group: 'Circular linked list', label: 'Circular list', blurb: 'The last node points back to the first. There is no NULL, so traversals stop when they return to the start.', script: [['insF', { value: 5 }], ['insE', { value: 50 }], ['delF', {}], ['search', { value: 23 }]] },
        { key: 'doubly', id: 'list', variant: 'doubly', group: 'Doubly linked list', label: 'Doubly linked list', blurb: 'Every node has prev and next pointers: traverse both ways and delete a known node in O(1).', script: [['insF', { value: 5 }], ['insAt', { value: 35, pos: 3 }], ['delE', {}], ['delV', { value: 15 }]] },
        { key: 'multilist', id: 'multilist', group: 'Multi-linked list', label: 'Multi-linked list (sparse matrix)', blurb: 'Nodes carry several pointers, so the same node sits in a row list and a column list at once.', script: [['row', { r: 2 }], ['col', { c: 1 }]] },
        { key: 'cycle', id: 'cycle', group: 'Techniques', label: 'Cycle detection (Floyd)', blurb: 'A slow and a fast pointer meet inside a cycle; if the fast one reaches NULL there is none.', script: [['detect', { link: 2 }]] },
      ],
    },
    {
      n: 3, title: 'Stacks and queues', long: 'Stack, queue, circular queue, variants and applications',
      syllabus: 'Stack: basic operations using Array and LL, Queue: basic operations using Array and LL, Circular Queue and Variants of Queue, Stack and Queue Applications.',
      blurb: 'LIFO and FIFO, with arrays and with lists, and what they are used for: expressions, brackets, Tower of Hanoi.',
      topics: ['Stack (array, LL)', 'Queue (array, LL)', 'Circular queue', 'Deque', 'Priority queue', 'Infix → postfix', 'Postfix evaluation', 'Tower of Hanoi'],
      viz: [
        { key: 'stack', id: 'stack', variant: 'array', group: 'Stack', label: 'Stack using an array', blurb: 'Last in, first out. push increments top, pop decrements it; overflow when top = MAX − 1.', script: [['push', { value: 12 }], ['push', { value: 7 }], ['push', { value: 31 }], ['pop'], ['push', { value: 5 }], ['pop']] },
        { key: 'stack-linked', id: 'stack', variant: 'linked', group: 'Stack', label: 'Stack using a linked list', blurb: 'Push and pop at the head of a singly linked list: O(1), no fixed capacity.', script: [['push', { value: 12 }], ['push', { value: 7 }], ['push', { value: 31 }], ['pop'], ['push', { value: 5 }]] },
        { key: 'queue', id: 'queue', variant: 'linear', group: 'Queue', label: 'Simple queue (array)', blurb: 'First in, first out. After dequeues the cells before front are wasted: the simple queue can report full while mostly empty.', script: [['enqueue', { value: 4 }], ['enqueue', { value: 9 }], ['enqueue', { value: 15 }], ['dequeue'], ['enqueue', { value: 23 }], ['dequeue']] },
        { key: 'queue-circular', id: 'queue', variant: 'circular', group: 'Queue', label: 'Circular queue', blurb: 'Indexes wrap around with (rear + 1) mod MAX, so freed cells are reused.', script: [['enqueue', { value: 4 }], ['enqueue', { value: 9 }], ['enqueue', { value: 15 }], ['dequeue'], ['enqueue', { value: 23 }], ['dequeue']] },
        { key: 'queue-linked', id: 'queue', variant: 'linked', group: 'Queue', label: 'Queue using a linked list', blurb: 'Enqueue at the rear pointer, dequeue at the front pointer, both O(1).', script: [['enqueue', { value: 4 }], ['enqueue', { value: 9 }], ['dequeue'], ['enqueue', { value: 15 }]] },
        { key: 'deque', id: 'deque', group: 'Deque and priority queue', label: 'Double-ended queue', blurb: 'Insert and delete at both ends. An input-restricted deque inserts at one end only; an output-restricted one deletes at one end only.', script: [['insR', { value: 10 }], ['insR', { value: 20 }], ['insF', { value: 5 }], ['insF', { value: 1 }], ['delR'], ['delF']] },
        { key: 'pqueue', id: 'pqueue', group: 'Deque and priority queue', label: 'Priority queue', blurb: 'The element with the highest priority leaves first, whatever its arrival order.', script: [['insert', { value: 40, pr: 3 }], ['insert', { value: 15, pr: 1 }], ['insert', { value: 62, pr: 2 }], ['insert', { value: 77, pr: 2 }], ['remove']] },
        { key: 'infix', id: 'infix', group: 'Applications', label: 'Infix to postfix', blurb: 'Operands go straight to the output; operators wait on a stack according to precedence.', script: [['convert', { expr: 'A+B*(C-D)' }]] },
        { key: 'postfix', id: 'postfix', group: 'Applications', label: 'Postfix evaluation', blurb: 'Push operands; an operator pops two values and pushes the result.', script: [['eval', { expr: '6 2 3 + * 4 -' }]] },
        { key: 'parens', id: 'parens', group: 'Applications', label: 'Balanced brackets', blurb: 'Push every opening bracket; each closing bracket must match the top.', script: [['check', { expr: '{[()]}' }]] },
        { key: 'hanoi', id: 'hanoi', group: 'Applications', label: 'Tower of Hanoi', blurb: 'Move n − 1 discs aside, move the largest, move the n − 1 back: 2ⁿ − 1 moves.', script: [['solve', { n: 3 }]] },
      ],
    },
    {
      n: 4, title: 'Searching and sorting', long: 'Searching, hashing and sorting algorithms',
      syllabus: 'Binary Search, Hash Search, Selection Sort, Insertion Sort, Quick Sort, Merge Sort, Radix Sort, External Sorting: k-way merging approach, Analysis of Search and Sorting Algorithms.',
      blurb: 'Finding things fast and putting them in order, with the cost of every algorithm worked out.',
      topics: ['Linear & binary search', 'Hashing', 'Bubble', 'Selection', 'Insertion', 'Merge', 'Quick', 'Radix', 'Heap sort', 'External sorting'],
      viz: [
        { key: 'binary', id: 'search', variant: 'binary', group: 'Searching', label: 'Binary search', blurb: 'Needs a sorted array. Compare with the middle element and throw away half of the range every step: O(log n).', script: [['go', { list: [4, 9, 15, 23, 38, 42, 57, 61, 80], key: 57 }]] },
        { key: 'linear', id: 'search', variant: 'linear', group: 'Searching', label: 'Linear search', blurb: 'Check the elements one by one. Works on any list, sorted or not: O(n).', script: [['go', { list: [38, 27, 43, 3, 9, 82, 10], key: 9 }]] },
        { key: 'hash-chain', id: 'hash', variant: 'chain', group: 'Hashing', label: 'Chaining', blurb: 'Every table slot holds a linked list; colliding keys are appended to the list at their slot.' },
        { key: 'hash-linear', id: 'hash', variant: 'linear', group: 'Hashing', label: 'Linear probing', blurb: 'On a collision try the next slot, then the next, wrapping around. Deleting leaves a tombstone.' },
        { key: 'hash-quadratic', id: 'hash', variant: 'quadratic', group: 'Hashing', label: 'Quadratic probing', blurb: 'On a collision try slots i + 1², i + 2², i + 3², … This avoids the long runs ("primary clustering") of linear probing.' },
        { key: 'hash-double', id: 'hash', variant: 'double', group: 'Hashing', label: 'Double hashing', blurb: 'A second hash function decides the step size, so different keys that collide follow different probe paths.' },
        { key: 'bubble', id: 'sort', variant: 'bubble', group: 'Sorting', label: 'Bubble sort', blurb: 'Swap neighbours that are out of order; the largest value bubbles to the end on each pass.', script: [['sort', { list: [38, 27, 43, 3, 9, 82, 10] }]] },
        { key: 'selection', id: 'sort', variant: 'selection', group: 'Sorting', label: 'Selection sort', blurb: 'Find the minimum of the unsorted part and swap it into the next position: at most n − 1 swaps.', script: [['sort', { list: [38, 27, 43, 3, 9, 82, 10] }]] },
        { key: 'insertion', id: 'sort', variant: 'insertion', group: 'Sorting', label: 'Insertion sort', blurb: 'Grow a sorted prefix by sliding each new element left into its place. Fast on nearly sorted data.', script: [['sort', { list: [38, 27, 43, 3, 9, 82, 10] }]] },
        { key: 'merge', id: 'sort', variant: 'merge', group: 'Sorting', label: 'Merge sort', blurb: 'Split in half, sort each half, merge the two sorted halves. O(n log n) in every case, but needs extra space.', script: [['sort', { list: [38, 27, 43, 3, 9, 82, 10] }]] },
        { key: 'quick', id: 'sort', variant: 'quick', group: 'Sorting', label: 'Quick sort', blurb: 'Partition around a pivot so smaller values are on its left and larger on its right, then sort both sides.', script: [['sort', { list: [38, 27, 43, 3, 9, 82, 10] }]] },
        { key: 'heapsort', id: 'sort', variant: 'heap', group: 'Sorting', label: 'Heap sort', blurb: 'Build a max-heap, then repeatedly move the maximum to the end and repair the heap.', script: [['sort', { list: [4, 10, 3, 5, 1, 8, 7] }]] },
        { key: 'radix', id: 'sort', variant: 'radix', group: 'Sorting', label: 'Radix sort', blurb: 'Sort by one digit at a time, least significant first, using stable bucket passes. No comparisons.', script: [['sort', { list: [170, 45, 75, 90, 802, 24, 2, 66] }]] },
        { key: 'kway', id: 'kway', group: 'External sorting', label: 'k-way merge' },
      ],
    },
    {
      n: 5, title: 'Trees and graphs', long: 'Binary search trees, balanced trees, heap, disjoint sets and graphs',
      syllabus: 'Basic concepts and terminologies of Binary Search Tree, Height Balanced Trees and Heap, Disjoint Set, Graph: concept and terminologies, Concept of Breadth First Search, Depth First Search, Spanning Tree.',
      blurb: 'Hierarchies and networks: BST and AVL, heaps, union-find, BFS, DFS and minimum spanning trees.',
      topics: ['BST', 'Tree traversals', 'AVL tree', 'Heap', 'Disjoint set', 'Graph terms', 'BFS', 'DFS', 'Spanning tree'],
      viz: [
        { key: 'bst', id: 'tree', variant: 'bst', group: 'Trees', label: 'Binary search tree', blurb: 'Left subtree < node < right subtree. Insert, search and delete walk one path: O(height).', script: [['build', { list: [50, 30, 70, 20, 40, 60, 80] }], ['search', { value: 60 }]] },
        { key: 'traversals', id: 'tree', variant: 'bst', group: 'Trees', label: 'Tree traversals', blurb: 'Inorder, preorder, postorder (depth first) and level order (breadth first), step by step.', script: [['build', { list: [50, 30, 70, 20, 40, 60, 80] }], ['inorder', {}]] },
        { key: 'avl', id: 'tree', variant: 'avl', group: 'Trees', label: 'AVL tree and rotations', blurb: 'Insert 10, 20, 30 and watch the tree rotate itself. Try inserting in other orders to see the LL, RR, LR and RL cases.', script: [['build', { list: [10, 20, 30, 40, 50, 25] }]] },
        { key: 'maxheap', id: 'heap', variant: 'max', group: 'Heaps', label: 'Max-heap and priority queue', blurb: 'A complete binary tree stored in an array; every parent is at least as large as its children. Insert sifts up, extract sifts down.', script: [['build', { list: [20, 35, 10, 50, 5, 40] }], ['extract', {}]] },
        { key: 'minheap', id: 'heap', variant: 'min', group: 'Heaps', label: 'Min-heap', blurb: 'The smallest value is always at the root: the structure behind priority queues, Prim and Dijkstra.', script: [['build', { list: [20, 35, 10, 50, 5, 40] }], ['extract', {}]] },
        { key: 'dsu', id: 'dsu', variant: 'plain', group: 'Disjoint sets', label: 'Union by rank', blurb: 'Each set is a tree; the shorter tree is attached under the taller one so that find stays fast.' },
        { key: 'dsu-pc', id: 'dsu', variant: 'compress', group: 'Disjoint sets', label: 'Path compression', blurb: 'During find, every visited vertex is pointed straight at the root, flattening the tree for later calls.', script: [['union', { x: 1, y: 2 }], ['union', { x: 3, y: 4 }], ['union', { x: 2, y: 4 }], ['find', { x: 3 }]] },
        { key: 'bfs', id: 'graph', variant: 'bfs', group: 'Graphs', label: 'Breadth-first search', blurb: 'Visit vertices level by level with a queue. Finds shortest paths in an unweighted graph: O(V + E).', script: [['go', { start: 'A' }]] },
        { key: 'dfs', id: 'graph', variant: 'dfs', group: 'Graphs', label: 'Depth-first search', blurb: 'Go as deep as possible, then back up, with a stack. The basis of cycle detection and topological sort.', script: [['go', { start: 'A' }]] },
        { key: 'kruskal', id: 'graph', variant: 'kruskal', group: 'Spanning trees', label: 'Kruskal', blurb: 'Sort the edges and take each one that does not close a cycle (checked with a disjoint set).', script: [['go', { start: 'A' }]] },
        { key: 'prim', id: 'graph', variant: 'prim', group: 'Spanning trees', label: 'Prim', blurb: 'Grow one tree from a start vertex by always adding the cheapest edge that leaves it.', script: [['go', { start: 'A' }]] },
        { key: 'dijkstra', id: 'graph', variant: 'dijkstra', group: 'More on graphs', label: 'Dijkstra shortest path', blurb: 'Settle the closest unsettled vertex and relax its edges. Not on the syllabus, but it uses the same graph and heap ideas and is asked everywhere.', script: [['go', { start: 'A' }]] },
        { key: 'topo-kahn', id: 'toposort', variant: 'kahn', group: 'More on graphs', label: 'Topological sort (Kahn)', blurb: 'Order a directed acyclic graph so every edge points forward, by repeatedly removing vertices with no incoming edges.', script: [['go', {}]] },
        { key: 'topo-dfs', id: 'toposort', variant: 'dfs', group: 'More on graphs', label: 'Topological sort (DFS)', blurb: 'The same order from a depth-first search: push each vertex when it finishes, then read the stack from the top.', script: [['go', {}]] },
      ],
    },
  ];
})();
