/* ============================================================
 * data/studynotes4.js — more theory: the topics of the class
 * notes (DATA STRUCTURE Notes.doc) and the handouts that the
 * first set of notes does not cover. Inserted into the module
 * lists after a named note. Same notation as studynotes1.js.
 * ============================================================ */
(function () {
  'use strict';
  const N = (s) => s.replace(/~~~/g, '```').replace(/«([^»]+)»/g, '`$1`').replace(/^\n/, '');
  const note = (id, title, extra, body) => Object.assign({ id, title, body: N(body) }, extra);
  const ins = (n, afterId, ...notes) => { const l = DSA.studyNotes[n], i = l.findIndex((s) => s.id === afterId); if (i < 0) throw new Error('studynotes4: no note ' + afterId); l.splice(i + 1, 0, ...notes); };

  /* ---------------- module 1 ---------------- */
  ins(1, 'ds-basics',
    note('algorithm-writing', 'Writing algorithms: pseudocode and flowcharts', {}, String.raw`
An algorithm can be written in plain English steps, in **pseudocode** (structured, language-neutral statements) or drawn as a **flowchart**. Every algorithm is built from three control structures only:
- **Sequence:** statements executed one after another.
- **Selection:** a choice, «if … else».
- **Iteration:** repetition, «while», «for», «repeat … until».

### Pseudocode conventions
Use «←» or «=» for assignment, indent for blocks, name inputs and outputs, and end with a clear result. Avoid language-specific details.

### Flowchart symbols
| Symbol | Meaning |
|---|---|
| oval | start / stop |
| parallelogram | input / output |
| rectangle | processing (assignment, calculation) |
| diamond | decision with a yes / no branch |
| arrow | flow of control |

### Example 1: largest of three numbers
~~~
read a, b, c
if a > b:
    if a > c: print a is the largest
    else:     print c is the largest
else:
    if b > c: print b is the largest
    else:     print c is the largest
~~~

### Example 2: roots of ax² + bx + c = 0
~~~
read a, b, c
d ← b*b − 4*a*c
if d > 0:  two real roots (−b ± √d) / 2a
if d = 0:  real and equal roots, −b / 2a
if d < 0:  complex roots
~~~

### Example 3: factorial
~~~
read n; fact ← 1; i ← 1
while i ≤ n: fact ← fact × i; i ← i + 1
print fact
~~~

### How to judge an algorithm
It must be **correct** (right output for every valid input), **terminate**, and be **efficient** in time and space. Correctness of a loop is argued with a **loop invariant**: a statement that holds before every iteration and, together with the exit condition, gives the result.
`),
    note('ds-operations', 'Operations on data structures', {}, String.raw`
Every data structure is judged by how well it supports a small set of operations.

| Operation | Meaning |
|---|---|
| **Traversing** | visit every element exactly once (print, sum, count) |
| **Searching** | find the location of an element with a given value or key |
| **Inserting** | add a new element |
| **Deleting** | remove an element |
| **Sorting** | arrange the elements in increasing or decreasing order |
| **Merging** | combine two sorted lists into one sorted list |

### Cost of the operations on the basic structures
| Operation | Array | Sorted array | Linked list | Stack / queue | BST (balanced) | Hash table |
|---|---|---|---|---|---|---|
| Access by position | O(1) | O(1) | O(n) | - | - | - |
| Search | O(n) | O(log n) | O(n) | O(n) | O(log n) | O(1) average |
| Insert | O(n) | O(n) | O(1) at a known place | O(1) | O(log n) | O(1) average |
| Delete | O(n) | O(n) | O(1) at a known place | O(1) | O(log n) | O(1) average |

### Static and dynamic
A **static** structure has a size fixed at creation (array). A **dynamic** one grows and shrinks while the program runs (linked list, tree), using pointers and run-time allocation.

### Time-space trade-off
Spending more memory can buy speed (a hash table, a precomputed table) and saving memory can cost time (recomputing instead of storing). Many choices in this course are exactly this trade.
`),
  );

  /* ---------------- module 2 ---------------- */
  ins(2, 'll-intro',
    note('linear-list', 'Linear lists and their representations', {}, String.raw`
A **linear list** is an ordered sequence of elements: a list of exam scores, an alphabetised list of students, a list of medal winners. Its ADT has the operations: create, destroy, test for empty, find the size, **get the element at an index**, **find the index of a value**, **delete the element at an index**, **insert an element at an index**.

### Two ways to represent it
| | Formula-based (array) | Linked (chain) |
|---|---|---|
| Location of element i | computed: base + i × size | found by following i links |
| Memory | one block, size fixed | one node per element, any place |
| Insert / delete in the middle | shift elements: O(n) | change pointers: O(1) once located |
| Wasted space | unused cells of the array | one pointer per node |

### Linked list with arrays (static linked list)
Where pointers are not available, a linked list can be kept in two arrays: «INFO[k]» holds the data of node k and «LINK[k]» holds the **index** of the next node; «START» holds the index of the first node, and a link of 0 (or −1) means NULL. The unused cells form a second list, the **free list** headed by «AVAIL».

- **Insert at the front:** «NEW = AVAIL; AVAIL = LINK[AVAIL]; INFO[NEW] = item; LINK[NEW] = START; START = NEW»
- **Delete the first node:** «TEMP = START; START = LINK[START]; LINK[TEMP] = AVAIL; AVAIL = TEMP» (the node returns to the free list)
- If «AVAIL» is NULL when an insertion is attempted, this is **overflow**; if «START» is NULL when deleting, this is **underflow**.

A doubly linked list in this form uses three arrays: «INFO», «NEXT» and «PREV».

### Types of linked lists
Singly linked, circular singly linked, doubly linked, circular doubly linked, and multi-linked (several pointers per node).
`),
  );

  /* ---------------- module 3 ---------------- */
  ins(3, 'circular-queue',
    note('stack-queue-compared', 'Stack versus queue, and priority queues in detail', { viz: 'pqueue' }, String.raw`
| | Stack | Queue |
|---|---|---|
| Policy | LIFO | FIFO |
| Pointers | one: **top** | two: **front** and **rear** |
| Insert | increment top, store | increment rear, store |
| Delete | read top, decrement top | read front, increment front |
| Overflow test | top == MAX − 1 | rear == MAX − 1 (circular: (rear + 1) % MAX == front) |
| Underflow test | top == −1 | front > rear (circular: front == rear) |
| Used for | recursion, expression evaluation, undo, DFS | scheduling, buffering, BFS |

### Priority queue
Each element carries a priority. Deletion removes the element of highest priority (an **ascending** priority queue removes the smallest key first, a **descending** one the largest).

Implementations:
- **Using a queue (array):** one queue per priority level; delete from the first non-empty level.
- **Using a sorted list (linked list):** insert each element at the position that keeps the list ordered by priority: insertion O(n), deletion from the head O(1).
- **Using an unsorted array:** insertion O(1), deletion O(n) (scan for the best).
- **Using a binary heap:** both O(log n).

### Deque types
**Input-restricted deque (IRD):** insertion only at one end, deletion at both. **Output-restricted deque (ORD):** deletion only at one end, insertion at both.

### Applications at a glance
| Stack | Queue |
|---|---|
| expression evaluation and conversion | CPU and disk scheduling |
| balanced symbols | printer spooling, keyboard buffers |
| function-call stack and recursion | breadth-first search |
| undo, browser back | simulation of real queues |
| Tower of Hanoi, backtracking | level-order traversal of trees |
`),
  );

  /* ---------------- module 4 ---------------- */
  ins(4, 'hashing',
    note('sorting-intro', 'Sorting: concepts and classification', {}, String.raw`
**Sorting** arranges the elements of a list in increasing (or decreasing) order of a key. Example: 70 30 40 10 80 20 60 50 becomes 10 20 30 40 50 60 70 80.

### Why it matters
Sorted data can be searched in O(log n), merged in O(n), and reports (ranks, duplicates, medians) become easy.

### Criteria for choosing a sorting method
Programming time, execution time, **number of comparisons**, **number of swaps or moves**, memory used, and the computational complexity.

### Classification
| Basis | Types |
|---|---|
| Where the data lives | **Internal** (all data in main memory) and **external** (data on disk, too big for memory) |
| Method | exchange (bubble, quick), selection (selection, heap), insertion (insertion), merging (merge), distribution (radix) |
| Comparisons | comparison sorts (lower bound Ω(n log n)) and non-comparison sorts (radix, counting, bucket) |
| Stability | stable or unstable |
| Memory | in place (O(1) extra) or not |
| Adaptiveness | adaptive if it runs faster on nearly sorted input (insertion, bubble with a flag) |

### Complexity at a glance
Simple sorts (bubble, selection, insertion): **O(n²)**. Efficient sorts (merge, quick, heap): **O(n log n)**. Radix: **O(d(n + b))**.

### Number of operations
Selection sort: n(n−1)/2 comparisons, ≤ n − 1 swaps. Bubble sort: up to n(n−1)/2 comparisons and one swap per inversion. Insertion sort: comparisons and shifts proportional to the number of inversions. Merge sort: about n log n comparisons. Quick sort: about 1.39 n log₂ n comparisons on average.
`),
  );
  ins(4, 'quick-sort',
    note('quick-hoare', 'Quick sort with the first element as pivot (two-pointer method)', { viz: 'quick' }, String.raw`
Many textbooks and the class notes choose the **first element** as the pivot and use two scanning pointers instead of the single scan of the Lomuto scheme.

### The partition
1. Pivot = a[low]. Set i = low + 1 and j = high.
2. Move **i right** while a[i] ≤ pivot. Move **j left** while a[j] > pivot.
3. If i < j, swap a[i] and a[j], and continue scanning.
4. When i > j, swap the pivot a[low] with a[j]: the pivot is now at its final position j.
5. Sort the left part (low … j − 1) and the right part (j + 1 … high) recursively.

~~~c
int partition(int a[], int low, int high) {
    int pivot = a[low], i = low + 1, j = high, t;
    for (;;) {
        while (i <= high && a[i] <= pivot) i++;
        while (a[j] > pivot) j--;
        if (i >= j) break;
        t = a[i]; a[i] = a[j]; a[j] = t;
    }
    t = a[low]; a[low] = a[j]; a[j] = t;
    return j;
}
~~~

### Trace on 40 20 70 14 60 61 97 30
- pivot = 40. i stops at 70 (index 2), j stops at 30 (index 7): swap → 40 20 **30** 14 60 61 97 **70**.
- i stops at 60 (index 4), j moves left past 97, 61, 60 and stops at 14 (index 3). Now i > j.
- Swap the pivot with a[j]: **14 20 30 40 60 61 97 70**. The pivot 40 is at index 3.
- Left part: 14 20 30. Right part: 60 61 97 70. Recursion continues.

### Analysis
**Best case** (pivot splits in the middle): T(n) = 2T(n/2) + n = O(n log n).
**Worst case** (pivot is the smallest or largest, e.g. an already sorted array): T(n) = T(n − 1) + n = n(n+1)/2 = O(n²).
**Average:** O(n log n). With a first-element pivot, a sorted input is the worst case: choose a random or median-of-three pivot to avoid it.
`),
    note('sort-analysis', 'Deriving the costs of the sorts', { viz: 'merge' }, String.raw`
### Selection sort
Pass i scans the n − i remaining elements, so comparisons = (n−1) + (n−2) + … + 1 = **n(n−1)/2** in every case: Θ(n²).

### Bubble sort
Pass i compares n − i pairs. Without the early-exit flag: n(n−1)/2 comparisons always. With the flag: a sorted array needs one pass, so the **best case is Θ(n)**. Every swap removes exactly one inversion, and a reversed array has n(n−1)/2 inversions, so the **worst case is Θ(n²)**.

### Insertion sort
Inserting element i takes between 1 comparison (already in place) and i comparisons (smaller than everything before it).
- Best: 1 + 1 + … + 1 = n − 1: **Θ(n)**.
- Worst: 1 + 2 + … + (n − 1) = n(n−1)/2: **Θ(n²)**.
- Average: half of the worst: n(n−1)/4, still Θ(n²).

### Merge sort
T(n) = 2T(n/2) + cn. The recursion tree has log₂ n + 1 levels; each level does cn work in total (the merges at that level touch every element once). So **T(n) = cn log₂ n + cn = Θ(n log n)** in all cases. Extra space O(n) for merging.

### Quick sort
Best case as merge sort, **Θ(n log n)**. Worst case T(n) = T(n−1) + cn = **Θ(n²)**. The average over random inputs is about 1.39 n log₂ n comparisons.

### Binary search
T(n) = T(n/2) + 1. After k steps the range has n / 2ᵏ elements; it ends when this reaches 1, so k = log₂ n: **Θ(log n)** worst case, **Θ(1)** best case.

### Lower bound
Any comparison sort needs ⌈log₂(n!)⌉ comparisons in the worst case, and log₂(n!) ≥ (n/2) log₂(n/2) = Ω(n log n). Hence merge sort and heap sort are optimal up to constant factors.

### Which cases to quote
| Algorithm | Best | Average | Worst |
|---|---|---|---|
| Selection | n² | n² | n² |
| Bubble | n | n² | n² |
| Insertion | n | n² | n² |
| Merge | n log n | n log n | n log n |
| Quick | n log n | n log n | n² |
`),
  );

  /* ---------------- module 5 ---------------- */
  ins(5, 'tree-terms',
    note('tree-representations', 'Representing trees', {}, String.raw`
### General tree: list representation
Each node is written with its children in a list: the tree A with children B, C, D, where B has children E, F, becomes «(A (B (E) (F)) (C) (D))». A node needs room for as many pointers as the tree's degree, which wastes memory when most nodes have few children.

### Left child, right sibling (LCRS)
Every node has just **two** pointers: «firstChild» and «nextSibling». Any general tree becomes a **binary tree** this way, so all binary tree algorithms apply to it.

~~~c
struct node { int data; struct node *child, *sibling; };
~~~
Example: A has children B, C, D. A.child = B, B.sibling = C, C.sibling = D. B has children E, F: B.child = E, E.sibling = F.

### Binary tree: array representation
Number the nodes level by level from 1 (root = 1). Node i is stored in «T[i]»:
- left child at **2i**, right child at **2i + 1**, parent at **⌊i/2⌋**.
- Missing nodes leave empty cells.

| Tree | Array |
|---|---|
| A with children B, C; B has D, E; C has F, G | A B C D E F G |

A **complete** binary tree wastes no cells (this is how heaps are stored). A **skewed** tree wastes a lot: a right-skewed tree of n nodes needs 2ⁿ − 1 cells.

### Binary tree: linked representation
Each node holds «data», «left» and «right». It adapts to any shape and makes insertion easy, at the cost of two pointers per node. A binary tree of n nodes has **n + 1 null pointers**, because 2n pointers exist and only n − 1 of them point to a child.
`),
    note('tree-types', 'Types and properties of binary trees', { viz: 'traversals' }, String.raw`
### Types
| Type | Definition |
|---|---|
| **Strictly (full) binary tree** | every node has 0 or 2 children |
| **Complete binary tree** | all levels full except possibly the last, which is filled from the left |
| **Perfect binary tree** | all internal nodes have 2 children and all leaves are at the same level (2^(h+1) − 1 nodes) |
| **Extended binary tree (2-tree)** | a binary tree in which every missing child is replaced by a special **external node**; internal nodes have exactly 2 children |
| **Skewed tree** | every node has only a left child (left-skewed) or only a right child (right-skewed) |
| **Balanced tree** | the heights of the two subtrees of every node differ by at most a fixed amount (AVL: 1) |

### Properties, with proofs
1. **A tree with n nodes has n − 1 edges.** Every node except the root has exactly one parent edge.
2. **Level i of a binary tree has at most 2ⁱ nodes.** True for level 0; each node of level i gives at most two nodes to level i + 1.
3. **A binary tree of height h has at most 2^(h+1) − 1 nodes** (levels 0 … h): 1 + 2 + 4 + … + 2ʰ = 2^(h+1) − 1.
4. **A binary tree with n nodes has height at least ⌈log₂(n + 1)⌉ − 1**, from property 3.
5. **If n₀ is the number of leaves and n₂ the number of nodes with two children, then n₀ = n₂ + 1.** Let n₁ be the nodes with one child. Counting nodes: n = n₀ + n₁ + n₂. Counting edges: n − 1 = n₁ + 2n₂. Subtracting gives n₀ = n₂ + 1.
6. **A strictly binary tree with n₀ leaves has 2n₀ − 1 nodes** (n₂ = n₀ − 1, n₁ = 0).
7. **A complete binary tree with n nodes has height ⌊log₂ n⌋.**
8. **An extended binary tree with n internal nodes has n + 1 external nodes** (the n + 1 null pointers of property above).

### Worked example
A strictly binary tree has 7 leaves. Nodes = 2 × 7 − 1 = 13, of which 6 have two children. A perfect tree of height 3 has 15 nodes, 8 leaves and 7 internal nodes.
`),
  );
})();
