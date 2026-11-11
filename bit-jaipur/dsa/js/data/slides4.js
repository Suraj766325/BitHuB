/* ============================================================
 * data/slides4.js — a slide for every structure and variant of
 * modules 1 to 3: circular and doubly linked lists, multilists,
 * linked stacks and queues, circular queue, deque, recursion,
 * sparse matrix transpose.
 * ============================================================ */
(function () {
  'use strict';
  const T = (kicker, title, bullets, key, lead) => ({ kind: 'text', kicker, title, bullets, key, lead });
  const V = (kicker, title, bullets, viz, key, lead) => ({ kind: 'viz', kicker, title, bullets, viz, key, lead });
  const TB = (kicker, title, head, rows, key, lead) => ({ kind: 'table', kicker, title, table: { head, rows }, key, lead });
  const after = (n, title, slides) => {
    const deck = DSA.slides[n], i = deck.findIndex((s) => s.title === title);
    if (i < 0) throw new Error('slides4: no slide "' + title + '" in module ' + n);
    deck.splice(i + 1, 0, ...slides);
  };

  /* ---------------- module 1 ---------------- */
  after(1, 'Recursion and the call tree', [
    V('Recursion', 'Factorial: the call stack', ['`fact(n) = n × fact(n − 1)`, with the **base case** `fact(0) = 1`.', 'Each call waits for a smaller one, so the frames pile up on the stack: depth n, **O(n) space**.', 'When the base case returns, the answers multiply back up as the frames are popped.', 'No base case, or one that is never reached, ends in a **stack overflow**.'], { id: 'recursion', variant: 'fact', script: [['run', { n: 4 }]] }, 'Recurrence: T(n) = T(n − 1) + c, so O(n) time.'),
  ]);
  after(1, 'Sparse matrix', [
    V('Arrays', 'Transpose of a sparse matrix', ['Swap the row and column of every triplet.', 'The result must be ordered by the new row, so a plain swap is not enough.', '**Simple transpose:** for each column, scan all triplets: O(n × t).', '**Fast transpose:** count the entries per column, find each column\'s starting position, then place every triplet directly: **O(n + t)**.'], { id: 'sparse', variant: 'transpose', script: [['go', {}]] }, 'n = number of columns, t = number of non-zero entries.'),
  ]);

  /* ---------------- module 2 ---------------- */
  after(2, 'Circular list', [
    T('Circular list', 'Circular list: operations and pitfalls', [
      '**Traverse:** `p = head; do { visit(p); p = p->next; } while (p != head);` A `while (p != NULL)` loop never ends.',
      '**Insert at the front or end in O(1):** keep a pointer to the **last** node; its `next` is the head. Insert after it, and for an end-insert move the last pointer to the new node.',
      '**Delete the head:** the last node\'s `next` must be updated. **Delete the only node:** set the pointer to NULL.',
      '**Uses:** round-robin scheduling, turn order in games, the circular queue, the Josephus problem.',
    ], 'There is no NULL anywhere: the stop condition is "back at the start".'),
    V('Circular list', 'Circular list in action', ['Insert at the front: the new node points to the old head, and the last node is re-pointed to the new node.', 'Delete at the front: the last node is re-pointed to the second node.', 'Search stops when it comes back to the head.', 'All insertions and deletions at the ends are O(1) with a pointer to the last node.'], { id: 'list', variant: 'circular', script: [['insF', { value: 5 }], ['insE', { value: 50 }], ['delF', {}], ['search', { value: 23 }]] }, 'Watch the curved arrow from the last node back to the head.'),
  ]);
  after(2, 'Insert and delete in a doubly linked list', [
    V('Doubly linked', 'Doubly linked list in action', ['Insert at the front: the new node\'s `next` is the old head, and the old head\'s `prev` is the new node.', 'Insert at a position: **four** pointers change (two in the new node, one each in its neighbours).', 'Delete the last node: its predecessor\'s `next` becomes NULL; no walk to find the predecessor is needed.', 'Deleting a node you already hold a pointer to is **O(1)**.'], { id: 'list', variant: 'doubly', script: [['insF', { value: 5 }], ['insAt', { value: 35, pos: 3 }], ['delE', {}], ['delV', { value: 15 }]] }, 'Two arrows per link: one forward, one backward.'),
    TB('Linked lists', 'Singly, circular and doubly linked: which one?', ['', 'Singly', 'Circular', 'Doubly'], [
      ['Pointers per node', '1 (next)', '1 (next)', '2 (prev, next)'],
      ['Last node points to', 'NULL', 'the first node', 'NULL (or the first, if circular)'],
      ['Traverse', 'forward only', 'forward, wraps around', 'both directions'],
      ['Insert / delete at the front', 'O(1)', 'O(1) with a last pointer', 'O(1)'],
      ['Delete a given node', 'O(n) (find the predecessor)', 'O(n)', '**O(1)**'],
      ['Extra memory', 'least', 'same as singly', 'one more pointer per node'],
      ['Typical use', 'stacks, queues, chains', 'round robin, circular queue', 'undo, browser history, deque'],
    ], 'Pick the cheapest list that supports the movements you need.'),
  ]);
  after(2, 'Multi-linked lists', [
    T('Multi-linked list', 'Multi-linked list: how it is built', [
      'A node has **several link fields**, one per list it belongs to.',
      '**Students:** `struct node { char name[20]; node *next_in_class, *next_in_hostel; }` lets you walk one class or one hostel without copying any data.',
      '**Sparse matrix:** every non-zero element is `(row, col, value, right, down)`; `right` links the row, `down` links the column; row and column header nodes are the entry points.',
      'Space: O(rows + columns + non-zero elements). Traversing a row costs only the number of elements in that row.',
    ], 'Several lists share the same nodes, so each node is stored once.'),
  ]);

  /* ---------------- module 3 ---------------- */
  after(3, 'Stack on a linked list', [
    TB('Stack', 'Stack: array or linked list?', ['', 'Array', 'Linked list'], [
      ['push', 'top++; a[top] = x', 'new node; node->next = top; top = node'],
      ['pop', 'x = a[top]; top--', 'x = top->data; top = top->next; free'],
      ['Overflow', 'top == MAX − 1', 'only if malloc fails'],
      ['Underflow', 'top == −1', 'top == NULL'],
      ['Memory', 'fixed block', 'grows on demand; one pointer per element'],
      ['Cost', 'O(1)', 'O(1)'],
    ], 'The interface is the same; only the representation changes.'),
  ]);
  after(3, 'Why the plain array queue wastes space', [
    V('Queue', 'Queue on a linked list', ['Keep two pointers: `front` (first node) and `rear` (last node).', '**Enqueue:** link a new node after `rear`, then move `rear`. **Dequeue:** take the node at `front`, move `front`.', 'Both O(1), and there is no "full" condition.', 'When the last element leaves, set **both** pointers to NULL.'], { id: 'queue', variant: 'linked', script: [['enqueue', { value: 4 }], ['enqueue', { value: 9 }], ['dequeue'], ['enqueue', { value: 15 }]] }, 'Forgetting to reset `rear` after the last dequeue is the classic bug.'),
  ]);
  after(3, 'Circular queue', [
    T('Queue', 'Circular queue: the formulas', [
      '**Enqueue:** if `(rear + 1) % MAX == front` the queue is **full**; else `rear = (rear + 1) % MAX; q[rear] = x`.',
      '**Dequeue:** if `front == rear` the queue is **empty**; else `front = (front + 1) % MAX; x = q[front]`.',
      'One cell is left unused so that "full" and "empty" can be told apart; the capacity is **MAX − 1**. (The alternative is to keep a count of the elements.)',
      'Example, MAX = 6: after 5 enqueues `rear = 5`; two dequeues give `front = 2`; the next enqueue wraps to index 0.',
    ], 'Modulo arithmetic turns the array into a ring.'),
  ]);
  after(3, 'Deque: both ends', [
    T('Queue', 'Input-restricted and output-restricted deques', [
      '**Input-restricted deque (IRD):** insertion at one end only, deletion at **both** ends.',
      '**Output-restricted deque (ORD):** deletion at one end only, insertion at **both** ends.',
      'Used as a **stack** (work at one end only) or as a **queue** (insert at one end, delete at the other).',
      'Implemented on a circular array or on a **doubly** linked list; every operation is O(1).',
      'Applications: undo and redo, palindrome check, sliding window maximum, work stealing in schedulers.',
    ], 'The deque contains the stack and the queue as special cases.'),
  ]);
})();
