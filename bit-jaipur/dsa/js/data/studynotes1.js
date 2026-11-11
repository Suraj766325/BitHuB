/* ============================================================
 * data/studynotes1.js — written study notes, modules 1 and 2.
 * Notation inside the text: ~~~ opens and closes a code block,
 * «x» is inline code, **x** is bold, ### starts a small heading.
 * ============================================================ */
(function () {
  'use strict';
  DSA.studyNotes = DSA.studyNotes || {};
  const N = (s) => s.replace(/~~~/g, '```').replace(/«([^»]+)»/g, '`$1`').replace(/^\n/, '');
  const note = (id, title, extra, body) => Object.assign({ id, title, body: N(body) }, extra);

  DSA.studyNotes[1] = [
    note('ds-basics', 'Data structures and algorithms', { viz: 'array' }, String.raw`
A **data structure** is a way of storing and organising data in memory so that the operations we need can be done efficiently. An **algorithm** is a finite list of precise steps that solves a problem. A program is, roughly, algorithms working on data structures.

### Abstract data type (ADT)
An ADT describes **what** a structure does (its operations and their meaning) and hides **how** it is stored. «Stack» is an ADT: push, pop, peek, isEmpty. The same stack can be built on an array or on a linked list; the user of the stack does not care which.

### Classification
| Kind | Examples | Idea |
|---|---|---|
| Primitive | int, char, float, pointer | built into the language |
| Linear | array, linked list, stack, queue | elements form a sequence; each has one successor |
| Non-linear | tree, graph | elements are connected in a hierarchy or network |
| Static / dynamic | array / linked list | size fixed at creation / grows and shrinks at run time |

### Properties of an algorithm
- **Input:** zero or more values supplied from outside.
- **Output:** at least one result.
- **Definiteness:** every step is unambiguous.
- **Finiteness:** it stops after a finite number of steps.
- **Effectiveness:** every step is basic enough to be carried out exactly.

### Choosing a structure
Ask which operations are most frequent. Lookup by position suggests an array; many inserts and deletes in the middle suggest a linked list; "last in, first out" is a stack; "first come, first served" is a queue; ordered data with fast search is a balanced tree; key-to-value lookup is a hash table.
`),
    note('complexity', 'Time and space complexity', { viz: 'growth' }, String.raw`
We compare algorithms by how their cost **grows with the input size n**, not by seconds on one computer. Seconds depend on the machine, the compiler and the data; the growth rate does not.

### Time complexity
Count the number of **basic operations** (comparisons, assignments, arithmetic) as a function of n. Three cases are studied:
- **Best case:** the input that makes the algorithm do the least work (linear search: the key is the first element).
- **Worst case:** the input that makes it do the most work (the key is last or absent). This is the guarantee we usually quote.
- **Average case:** the expected work over all inputs.

### Space complexity
The memory an algorithm needs beyond its input: variables, extra arrays, and the **recursion stack**. Sorting in place uses O(1) extra space; merge sort uses O(n).

### Counting the steps of a loop
~~~c
for (i = 0; i < n; i++)          /* body runs n times            -> O(n)     */
    for (j = 0; j < n; j++)      /* n x n                        -> O(n^2)   */
        x++;

for (i = 1; i < n; i = i * 2)    /* i = 1, 2, 4, 8, ...          -> O(log n) */
    x++;

for (i = 0; i < n; i++)          /* inner loop runs 0,1,...,n-1  */
    for (j = 0; j < i; j++)      /* total n(n-1)/2               -> O(n^2)   */
        x++;
~~~

### Common growth rates, slowest growing first
O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(n³) < O(2ⁿ) < O(n!)

For n = 1,000,000 an O(n log n) algorithm needs about 20 million steps; an O(n²) one needs a million million. That gap is why complexity matters.
`),
    note('asymptotic', 'Asymptotic notations', {}, String.raw`
Asymptotic notation describes the growth of f(n) for large n, ignoring constant factors and lower-order terms.

| Notation | Definition | Meaning |
|---|---|---|
| f(n) = O(g(n)) | there are c > 0, n₀ with f(n) ≤ c·g(n) for all n ≥ n₀ | g is an **upper bound** |
| f(n) = Ω(g(n)) | there are c > 0, n₀ with f(n) ≥ c·g(n) for all n ≥ n₀ | g is a **lower bound** |
| f(n) = Θ(g(n)) | c₁·g(n) ≤ f(n) ≤ c₂·g(n) for all n ≥ n₀ | g is a **tight bound** (both) |
| f(n) = o(g(n)) | f(n) / g(n) → 0 | f grows strictly slower than g |

### Worked example
Show 3n² + 5n + 2 = Θ(n²). For n ≥ 6: 3n² ≤ 3n² + 5n + 2 ≤ 4n² (because 5n + 2 ≤ n² once n ≥ 6). So c₁ = 3, c₂ = 4, n₀ = 6 work.

### Rules that save time
- Drop constants: 100n is O(n).
- Keep the dominant term: n² + n log n + 7 is O(n²).
- Sequential blocks add, so keep the larger: O(n) followed by O(n²) is O(n²).
- Nested blocks multiply: a loop of n iterations whose body costs O(log n) is O(n log n).
- log base does not matter inside O(): log₂ n and log₁₀ n differ by a constant factor.

### Common mistake
"O" is not "worst case". The worst case is a **case**; O is a **bound**. You can give an O bound for the best, average or worst case separately.
`),
    note('recurrence', 'Analysing recursive algorithms', { viz: 'recursion' }, String.raw`
A recursive algorithm's running time satisfies a **recurrence relation**: T(n) in terms of T of smaller inputs.

### Setting one up
~~~c
int fact(int n) { return n <= 1 ? 1 : n * fact(n - 1); }
~~~
One call does constant work and makes one call on n − 1, so **T(n) = T(n − 1) + c**, T(1) = c.

### Method 1: substitution (unrolling)
T(n) = T(n−1) + c = T(n−2) + 2c = … = T(1) + (n−1)c = **O(n)**.

### Method 2: recursion tree
For merge sort, T(n) = 2T(n/2) + n. Level 0 costs n; level 1 has two nodes of n/2, total n; every level costs n, and there are log₂ n levels, so **T(n) = Θ(n log n)**.

### Method 3: Master theorem
For T(n) = a·T(n/b) + f(n) with a ≥ 1, b > 1 compare f(n) with n^(log_b a):
| Case | Condition | Result |
|---|---|---|
| 1 | f(n) grows slower than n^(log_b a) | T(n) = Θ(n^(log_b a)) |
| 2 | f(n) = Θ(n^(log_b a)) | T(n) = Θ(n^(log_b a) · log n) |
| 3 | f(n) grows faster (and the regularity condition holds) | T(n) = Θ(f(n)) |

### Standard recurrences
| Recurrence | Solution | Example |
|---|---|---|
| T(n) = T(n−1) + c | O(n) | factorial, linear recursion |
| T(n) = T(n−1) + n | O(n²) | selection sort, worst-case quick sort |
| T(n) = T(n/2) + c | O(log n) | binary search |
| T(n) = 2T(n/2) + n | O(n log n) | merge sort |
| T(n) = 2T(n−1) + c | O(2ⁿ) | Tower of Hanoi, naive Fibonacci |

### Space
Each pending call occupies a stack frame, so recursion of depth d uses O(d) space even if it allocates nothing else.
`),
    note('recursion', 'Recursion', { viz: 'recursion', algos: true }, String.raw`
A function is **recursive** if it calls itself on a smaller instance of the same problem. Every recursive function needs:
1. a **base case** that is solved directly (this stops the recursion), and
2. a **recursive case** that moves towards the base case.

### The call stack
Each call gets a stack frame holding its parameters, locals and return address. Calls are pushed as the recursion goes down and popped as the results come back up. Too deep a recursion without a base case ends in a **stack overflow**.

### Examples
~~~c
int fact(int n)  { return n == 0 ? 1 : n * fact(n - 1); }          /* n!         */
int fib(int n)   { return n < 2 ? n : fib(n-1) + fib(n-2); }       /* O(2^n)     */
int gcd(int a, int b) { return b == 0 ? a : gcd(b, a % b); }       /* Euclid     */
int sum(int a[], int n) { return n == 0 ? 0 : a[n-1] + sum(a, n-1); }
~~~

### Recursion versus iteration
| | Recursion | Iteration |
|---|---|---|
| Code | short, mirrors the definition | longer, explicit loop |
| Memory | O(depth) stack | usually O(1) |
| Speed | call overhead | faster |
| Best for | trees, divide and conquer, backtracking | simple counting loops |

### Types
- **Direct:** f calls f. **Indirect:** f calls g, g calls f.
- **Tail recursive:** the recursive call is the last action, so it can be turned into a loop.
- **Tree recursive:** more than one recursive call (Fibonacci), often wasteful; memoisation fixes the repeated work.

### Tower of Hanoi
Move n discs from A to C using B: move n−1 discs to B, move the largest to C, move the n−1 discs onto C. **T(n) = 2T(n−1) + 1**, which gives **2ⁿ − 1** moves.
`),
    note('arrays', 'Arrays and multi-dimensional arrays', { viz: 'array', algos: true }, String.raw`
An **array** is a collection of elements of the same type stored in **contiguous** memory. Because every element has the same size, the address of element i is computed in O(1):

**address(A[i]) = base + i × size**

### Operations and their cost
| Operation | Cost | Why |
|---|---|---|
| Access A[i] | O(1) | address arithmetic |
| Search (unsorted) | O(n) | check each element |
| Insert at position p | O(n) | shift the elements after p right |
| Delete at position p | O(n) | shift the elements after p left |
| Insert / delete at the end | O(1) | nothing to shift |

### Two-dimensional arrays
A 2-D array «A[m][n]» is stored in one block, in one of two orders:
- **Row-major** (C, C++, Java): row after row. address(A[i][j]) = base + (i × n + j) × size
- **Column-major** (Fortran, MATLAB): column after column. address(A[i][j]) = base + (j × m + i) × size

With lower bounds that are not zero, subtract them first: A[l₁..u₁][l₂..u₂] in row-major has address base + ((i − l₁) × (u₂ − l₂ + 1) + (j − l₂)) × size.

### Worked example
A[10][20] of 4-byte integers, base 1000, row-major: address of A[3][5] = 1000 + (3 × 20 + 5) × 4 = 1000 + 260 = **1260**.

### Strengths and limits
Fast indexed access and good cache behaviour, but the size is fixed at creation and insertion or deletion in the middle is costly. That is the motivation for linked lists.
`),
    note('sparse', 'Sparse matrices', { viz: 'sparse', algos: true }, String.raw`
A matrix in which most entries are zero is **sparse**. Storing every zero wastes memory, so only the non-zero entries are kept.

### Triplet (coordinate) representation
Store a table with one row per non-zero element: **(row, column, value)**. The first row holds the total number of rows, columns and non-zero entries.

| row | col | value |
|---|---|---|
| 4 | 5 | 4 |
| 0 | 2 | 5 |
| 1 | 0 | 8 |
| 2 | 3 | 7 |
| 3 | 4 | 2 |

A 4 × 5 matrix (20 cells) is stored in 5 rows of 3 numbers. The saving grows with the size of the matrix: a 1000 × 1000 matrix with 3000 non-zero entries needs 9000 numbers instead of a million.

### Transpose
The transpose swaps the row and column of every triplet. If the triplets must stay ordered by row, a simple swap is not enough. **Fast transpose** counts how many entries fall in each column, computes the starting position of each column, and then places every triplet directly: **O(n + t)** time, where t is the number of non-zero entries. The naive method (scan all triplets once per column) takes **O(n × t)**.

### Other representations
Compressed row storage (CSR), linked-list-of-rows, and special forms for triangular, diagonal and tridiagonal matrices.
`),
    note('polynomial', 'Polynomial representation and operations', { viz: 'poly', algos: true }, String.raw`
A polynomial such as 5x⁴ + 3x² + 7 can be stored in two ways.

### Dense array
Store the coefficient of xᵏ at index k: «[7, 0, 3, 0, 5]». Simple, but a polynomial like x¹⁰⁰⁰ + 1 wastes 999 cells.

### Sparse list of terms
Store only the non-zero terms as pairs **(coefficient, exponent)**, in decreasing order of exponent: «(5,4) (3,2) (7,0)». This can be an array of structs or a linked list.

### Addition
Walk the two polynomials with two pointers, like the merge step of merge sort:
- exponents equal: add the coefficients (drop the term if the sum is 0);
- otherwise copy the term with the larger exponent and advance that pointer;
- when one polynomial ends, copy the rest of the other.

Time **O(m + n)** for polynomials with m and n terms.

### Multiplication
Multiply every term of P by every term of Q, adding the exponents and multiplying the coefficients, and combine like terms: **O(m × n)** products (plus the cost of combining).

### Evaluation
Horner's rule evaluates a degree-n polynomial with n multiplications and n additions: P(x) = (…((aₙx + aₙ₋₁)x + aₙ₋₂)x + …)x + a₀.
`),
  ];

  DSA.studyNotes[2] = [
    note('ll-intro', 'Linked lists: the idea', { viz: 'list' }, String.raw`
A **linked list** is a sequence of **nodes**; each node holds data and a **pointer** to the next node. The nodes can be anywhere in memory, and the pointers tie them together. The list is reached through a pointer to its first node, called **head** (or start).

~~~c
struct node {
    int data;
    struct node *next;
};
struct node *head = NULL;      /* empty list */
~~~

### Array versus linked list
| | Array | Linked list |
|---|---|---|
| Memory | one contiguous block, fixed size | scattered nodes, grows on demand |
| Access element i | O(1) | O(i), must walk from the head |
| Insert / delete at the front | O(n) shift | **O(1)** |
| Insert / delete after a known node | O(n) shift | **O(1)** |
| Extra memory | none | one pointer per node |
| Cache behaviour | excellent | poor |

### Memory management
Nodes are allocated with «malloc» and released with «free». Forgetting to free a deleted node is a **memory leak**; using a node after freeing it is a **dangling pointer** error.
`),
    note('ll-singly', 'Singly linked list operations', { viz: 'list', algos: true }, String.raw`
In a singly linked list every node points only forward. The last node's «next» is «NULL».

### Traversal: O(n)
~~~c
for (p = head; p != NULL; p = p->next) printf("%d ", p->data);
~~~

### Insertion
| Where | Steps | Cost |
|---|---|---|
| At the front | new->next = head; head = new | O(1) |
| At the end | walk to the last node; last->next = new | O(n) (O(1) with a tail pointer) |
| After node p | new->next = p->next; p->next = new | O(1) once p is known |
| At position k | walk to the (k−1)th node, then insert after it | O(k) |

**The order of the two pointer assignments matters.** If you set «p->next = new» first, you lose the rest of the list.

### Deletion
| Where | Steps | Cost |
|---|---|---|
| The first node | t = head; head = head->next; free(t) | O(1) |
| The node after p | t = p->next; p->next = t->next; free(t) | O(1) |
| A given value | keep a pointer **prev** one node behind while searching | O(n) |
| The last node | walk to the second-last node; set its next to NULL | O(n) |

### Other operations
- **Search:** linear walk, O(n); binary search is not possible because we cannot jump to the middle.
- **Reverse:** three pointers (prev, curr, next), one pass, O(n) time, O(1) space.
- **Length, find middle (slow and fast pointers), merge two sorted lists.**

### Edge cases to check every time
Empty list, one node, operating on the head, operating on the tail.
`),
    note('ll-circular', 'Circular linked lists', { viz: 'list' }, String.raw`
In a **circular linked list** the last node points back to the first instead of NULL. There is no NULL anywhere, so a traversal stops when it returns to where it started:

~~~c
p = head;
do { printf("%d ", p->data); p = p->next; } while (p != head);
~~~

### Why keep a pointer to the last node?
If we keep **tail** instead of head, then tail->next is the head. This gives O(1) insertion at **both** ends:
- insert at the front: new->next = tail->next; tail->next = new;
- insert at the end: do the same, then move tail = new.

### Uses
Round-robin scheduling (the CPU cycles through processes), multiplayer turn order, music playlists on repeat, and the circular queue.

### Pitfalls
- Using «while (p != NULL)» on a circular list never stops.
- When deleting the only node, set the pointer to NULL.
- When deleting the head, update the last node's pointer as well.
`),
    note('ll-doubly', 'Doubly linked lists', { viz: 'list', algos: true }, String.raw`
Each node has **two** pointers, to the previous and to the next node.

~~~c
struct dnode {
    int data;
    struct dnode *prev, *next;
};
~~~

### Advantages
- Traverse in both directions.
- Delete a node in **O(1)** when you have a pointer to it, because the node knows its predecessor.
- Insert before a given node in O(1).

### Disadvantage
An extra pointer per node, and every insertion or deletion updates **four** pointers instead of two.

### Insert node q after node p
~~~c
q->next = p->next;
q->prev = p;
if (p->next != NULL) p->next->prev = q;
p->next = q;
~~~

### Delete node p
~~~c
if (p->prev != NULL) p->prev->next = p->next; else head = p->next;
if (p->next != NULL) p->next->prev = p->prev;
free(p);
~~~

### Uses
Browser back and forward, undo and redo, the LRU cache (with a hash table), and the deque.
`),
    note('ll-multi', 'Multi-linked lists and applications', { viz: 'multilist' }, String.raw`
A **multi-linked list** (multilist) has nodes with **more than one pointer field**, so the same nodes take part in several lists at once.

### Example: a university
Every student node has two links: «next_in_class» links students of the same class, «next_in_hostel» links students of the same hostel. One set of nodes can then be traversed by class or by hostel without duplicating any data.

### Example: sparse matrix
Each non-zero element is a node with a **right** pointer (next non-zero element in the row) and a **down** pointer (next in the column). Row headers and column headers are the entry points. This is the classical linked representation of a sparse matrix, with space O(rows + columns + non-zero elements).

### Example: lists of lists
A node can hold a pointer to a sub-list, which models nested structures such as a polynomial in two variables or a generalised list.

### Applications of linked lists in general
- Polynomial arithmetic with sparse terms.
- Stacks and queues without a fixed size.
- Adjacency lists of graphs; chains in hash tables.
- Memory management (free-lists), file allocation, undo history.
`),
    note('ll-algos', 'Classic linked list techniques', { algos: true }, String.raw`
Most linked list problems use a handful of ideas.

### Slow and fast pointers
Move «slow» one step and «fast» two steps at a time.
- **Middle of the list:** when fast reaches the end, slow is at the middle.
- **Cycle detection (Floyd):** if there is a cycle, fast eventually catches slow inside it; otherwise fast reaches NULL. O(n) time, O(1) space.
- **Nth node from the end:** advance fast n steps first, then move both until fast ends.

### Reversal with three pointers
~~~c
struct node *prev = NULL, *curr = head, *next;
while (curr) { next = curr->next; curr->next = prev; prev = curr; curr = next; }
head = prev;
~~~

### Dummy (sentinel) head
Create a fake node in front of the list so that inserting or deleting at the head is no longer a special case. Very handy when merging lists or removing nodes.

### Merge two sorted lists
Compare the two fronts, attach the smaller to the result, advance. O(m + n), no extra nodes.

### Checklist
1. Draw the nodes and arrows. 2. Name the pointers. 3. Decide the order of assignments so that nothing is lost. 4. Test: empty, one node, two nodes.
`),
  ];
})();
