/* ============================================================
 * data/studynotes3.js — written study notes, modules 4 and 5
 * (same notation as studynotes1.js).
 * ============================================================ */
(function () {
  'use strict';
  DSA.studyNotes = DSA.studyNotes || {};
  const N = (s) => s.replace(/~~~/g, '```').replace(/«([^»]+)»/g, '`$1`').replace(/^\n/, '');
  const note = (id, title, extra, body) => Object.assign({ id, title, body: N(body) }, extra);

  DSA.studyNotes[4] = [
    note('search', 'Linear and binary search', { viz: 'binary', algos: true }, String.raw`
### Linear (sequential) search
Compare the key with each element in turn until it is found or the list ends. It works on **unsorted** data and on linked lists.
- Best case: 1 comparison (key is first). Worst and average: n and about n/2 comparisons. **O(n)**.
- A **sentinel** (placing the key at the end of the array) removes the "end of array?" test from the loop.

### Binary search
Needs a **sorted array**. Compare the key with the middle element; if equal, done; if smaller, continue in the left half; otherwise in the right half.

~~~c
int bsearch(int a[], int n, int key) {
    int lo = 0, hi = n - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;          /* avoids overflow of lo + hi */
        if (a[mid] == key) return mid;
        if (a[mid] < key) lo = mid + 1; else hi = mid - 1;
    }
    return -1;
}
~~~
The range halves every step, so T(n) = T(n/2) + 1 and the cost is **O(log n)**: at most ⌊log₂ n⌋ + 1 comparisons. A million sorted items need at most 20.

### Comparison
| | Linear | Binary |
|---|---|---|
| Needs sorted data | no | **yes** |
| Works on linked lists | yes | no (no direct access to the middle) |
| Worst case | O(n) | O(log n) |
| Space | O(1) | O(1) iterative, O(log n) recursive |

Sorting first costs O(n log n), so binary search pays off only when many searches follow one sort.
`),
    note('hashing', 'Hashing', { viz: 'hash-chain', algos: true }, String.raw`
Hashing stores each key at a position computed from the key itself, so a search does not need to compare against many elements. Average cost of search, insert and delete: **O(1)**.

### Hash function
Maps a key to an index in a table of size M. A good one is fast and spreads keys **uniformly**.
- **Division method:** h(k) = k mod M (choose M prime, not a power of 2).
- **Multiplication method:** h(k) = ⌊M × (k·A mod 1)⌋ with 0 < A < 1.
- **Mid-square:** square the key and take the middle digits.
- **Folding:** split the key into parts and add them.

### Collisions
Two different keys with the same index are a **collision**. Two families of solutions:

### 1. Separate chaining
Every slot holds a linked list of the keys that hash there. Insert appends to the list; search walks the list. The table can hold more keys than slots. Expected list length is the **load factor α = n / M**, so the average search cost is O(1 + α).

### 2. Open addressing
All keys live in the table; on a collision we **probe** for another free slot.
| Method | Probe sequence | Remark |
|---|---|---|
| Linear probing | i, i+1, i+2, … | simple; suffers **primary clustering** (long runs of full slots) |
| Quadratic probing | i, i+1², i+2², … | avoids primary clustering; can miss slots if M is not chosen well |
| Double hashing | i, i + h₂, i + 2h₂, … | best spread; h₂ must never be 0 and must be coprime with M |

**Deletion** in open addressing: do not just empty the slot, because later searches would stop too early. Mark it **DELETED** (a tombstone).

### Worked example
M = 7, linear probing, insert 15, 22, 8, 36: h(15) = 1; h(22) = 1 collides, goes to 2; h(8) = 1 collides at 1 and 2, goes to 3; h(36) = 1 collides at 1, 2, 3, goes to 4.

### When the table fills
Keep α below about 0.7 for open addressing; when it is exceeded, allocate a larger table and **rehash** every key.
`),
    note('elementary-sorts', 'Bubble, selection and insertion sort', { viz: 'bubble', algos: true }, String.raw`
A sorting algorithm is **stable** if equal keys keep their original relative order, and **in place** if it uses O(1) extra memory.

### Bubble sort
Repeatedly compare neighbours and swap if out of order. After pass k the k largest elements are in their final places at the end.
~~~c
for (i = 0; i < n - 1; i++) {
    int swapped = 0;
    for (j = 0; j < n - 1 - i; j++)
        if (a[j] > a[j+1]) { t = a[j]; a[j] = a[j+1]; a[j+1] = t; swapped = 1; }
    if (!swapped) break;                      /* already sorted: stop early */
}
~~~
Comparisons: up to n(n−1)/2. **Best O(n)** (with the early exit), **worst and average O(n²)**. Stable, in place.

### Selection sort
Find the smallest element of the unsorted part and swap it to the front of that part.
- Always n(n−1)/2 comparisons: **O(n²)** in every case, but at most **n − 1 swaps**, which helps when writes are expensive.
- In place, **not stable** (the long swap can jump over equal keys).

### Insertion sort
Keep a sorted prefix; take the next element and slide it left past every larger element (like sorting playing cards in your hand).
- Best case O(n) (already sorted), worst and average O(n²).
- **Stable**, in place, and **adaptive**: the closer the data is to sorted, the faster it runs. It is the best of the three and is used for small arrays inside faster sorts.
`),
    note('merge-sort', 'Merge sort', { viz: 'merge', algos: true }, String.raw`
A **divide and conquer** algorithm.
1. **Divide** the array into two halves.
2. **Conquer:** sort each half recursively (an array of one element is sorted).
3. **Combine:** **merge** the two sorted halves into one sorted array.

### Merge
Keep one index in each half; repeatedly copy the smaller front element into a temporary array; when one half is exhausted copy the rest of the other. Merging two halves with n elements in total takes **O(n)**.

~~~c
void merge(int a[], int lo, int mid, int hi) {
    int tmp[hi - lo + 1], i = lo, j = mid + 1, k = 0;
    while (i <= mid && j <= hi) tmp[k++] = (a[i] <= a[j]) ? a[i++] : a[j++];  /* <= keeps it stable */
    while (i <= mid) tmp[k++] = a[i++];
    while (j <= hi)  tmp[k++] = a[j++];
    for (k = 0; k < hi - lo + 1; k++) a[lo + k] = tmp[k];
}
void msort(int a[], int lo, int hi) {
    if (lo >= hi) return;
    int mid = (lo + hi) / 2;
    msort(a, lo, mid); msort(a, mid + 1, hi); merge(a, lo, mid, hi);
}
~~~

### Analysis
T(n) = 2T(n/2) + n gives **O(n log n) in the best, average and worst case**. Space: **O(n)** for the temporary array. **Stable.** Because it reads data sequentially, merge sort is the basis of **external sorting** and is the usual choice for linked lists.
`),
    note('quick-sort', 'Quick sort', { viz: 'quick', algos: true }, String.raw`
Also divide and conquer, but the work is done **before** the recursion: choose a **pivot**, **partition** the array so that everything smaller is left of the pivot and everything larger is right, then sort the two sides.

~~~c
int partition(int a[], int lo, int hi) {            /* Lomuto scheme, pivot = last element */
    int p = a[hi], i = lo - 1, j, t;
    for (j = lo; j < hi; j++)
        if (a[j] < p) { i++; t = a[i]; a[i] = a[j]; a[j] = t; }
    t = a[i+1]; a[i+1] = a[hi]; a[hi] = t;
    return i + 1;                                   /* the pivot is now in its final place */
}
void qsort_(int a[], int lo, int hi) {
    if (lo < hi) { int p = partition(a, lo, hi); qsort_(a, lo, p - 1); qsort_(a, p + 1, hi); }
}
~~~

### Analysis
| Case | When | Time |
|---|---|---|
| Best | pivot always splits in the middle: T(n) = 2T(n/2) + n | O(n log n) |
| Average | random-looking data | O(n log n) |
| Worst | pivot is always the smallest or largest, e.g. sorted input with first or last pivot: T(n) = T(n−1) + n | **O(n²)** |

Space: O(log n) for the recursion (O(n) in the worst case). **In place, not stable.** Choosing a random pivot or the median of three makes the worst case very unlikely, and in practice quick sort is usually the fastest comparison sort.
`),
    note('heap-radix', 'Heap sort and radix sort', { viz: 'heapsort', algos: true }, String.raw`
### Heap sort
1. **Build a max-heap** from the array in O(n).
2. **Repeat n − 1 times:** swap the root (the maximum) with the last element of the heap, shrink the heap by one, and sift the new root down (O(log n)).
Total **O(n log n) in every case**, in place, **not stable**. It never degrades to O(n²) like quick sort, but has worse cache behaviour.

### Radix sort (non-comparison)
Sort integers digit by digit, from the **least significant** digit to the most significant, using a **stable** sort (counting sort or ten buckets) for each pass.

Example: 170, 45, 75, 90, 802, 24, 2, 66.
- By units digit: 170, 90, 802, 2, 24, 45, 75, 66
- By tens digit: 802, 2, 24, 45, 66, 170, 75, 90
- By hundreds digit: 2, 24, 45, 66, 75, 90, 170, 802

For n numbers of d digits in base b the cost is **O(d × (n + b))**, which is linear when d and b are constants. No comparisons are made, so the Ω(n log n) lower bound for comparison sorts does not apply. It needs O(n + b) extra space and is stable.

### Summary of all sorts
| Sort | Best | Average | Worst | Space | Stable |
|---|---|---|---|---|---|
| Bubble | n | n² | n² | 1 | yes |
| Selection | n² | n² | n² | 1 | no |
| Insertion | n | n² | n² | 1 | yes |
| Merge | n log n | n log n | n log n | n | yes |
| Quick | n log n | n log n | n² | log n | no |
| Heap | n log n | n log n | n log n | 1 | no |
| Radix | d(n+b) | d(n+b) | d(n+b) | n+b | yes |
`),
    note('external', 'External sorting: k-way merging', { viz: 'kway' }, String.raw`
When the data is too large for main memory it lives on disk, and the cost that matters is the **number of disk reads and writes**, not comparisons.

### Two phases
1. **Run formation:** read as much data as fits in memory (M records), sort it with any internal sort, and write it out as a **run**. N records give about N / M runs.
2. **Merging:** merge the runs. A **k-way merge** reads one block from each of k runs, repeatedly outputs the smallest of the k current front records (a **min-heap** or tournament tree finds it in O(log k)), and refills a block when it is exhausted.

### Passes
With k-way merging each pass reduces the number of runs by a factor of k, so the number of merge passes is ⌈log_k (N / M)⌉. Larger k means **fewer passes** (fewer disk trips), limited by how many input buffers fit in memory.

### Example
1000 records, memory holds 100: 10 runs of 100. A 2-way merge needs ⌈log₂ 10⌉ = 4 passes; a 10-way merge needs 1.

### Variants
Replacement selection (runs about twice as long as memory), polyphase merge (for tape drives), balanced multiway merge.
`),
    note('analysis-4', 'Analysis of searching and sorting', {}, String.raw`
### Lower bound for comparison sorting
Any algorithm that sorts only by comparing elements can be drawn as a **decision tree** whose leaves are the n! possible orderings. A binary tree with n! leaves has height at least log₂(n!) = **Ω(n log n)**. So merge sort and heap sort are asymptotically optimal among comparison sorts, and radix sort can beat it only by not comparing.

### Choosing a sort
| Situation | Good choice |
|---|---|
| Small or nearly sorted data | insertion sort |
| General purpose, average speed matters | quick sort |
| Guaranteed O(n log n), stability needed | merge sort |
| Guaranteed O(n log n), O(1) memory | heap sort |
| Integers with few digits | radix sort |
| Data on disk | external merge sort |
| Linked list | merge sort |

### Searching summary
Unsorted: linear, O(n). Sorted array: binary, O(log n). Key-based lookup: hashing, O(1) average. Ordered dynamic set: balanced tree, O(log n).

### Stable versus unstable
Stability matters when sorting records by several keys in turn (sort by name, then stably by class). Bubble, insertion, merge and radix are stable; selection, quick and heap are not (without extra work).
`),
  ];

  DSA.studyNotes[5] = [
    note('tree-terms', 'Trees and binary trees', { viz: 'traversals' }, String.raw`
A **tree** is a connected structure with no cycles: one special node, the **root**, and every other node reached by exactly one path from it.

### Terminology
| Term | Meaning |
|---|---|
| Parent, child, sibling | direct neighbours going down, or at the same parent |
| Leaf | node without children |
| Degree | number of children of a node |
| Level / depth | distance from the root (the root is at level 0) |
| Height | length of the longest path from a node down to a leaf; height of the tree = height of the root |
| Subtree | a node together with all of its descendants |

### Binary tree
Every node has **at most two** children, called left and right.
~~~c
struct tnode { int data; struct tnode *left, *right; };
~~~
Useful facts: level i holds at most 2ⁱ nodes; a tree of height h has at most 2^(h+1) − 1 nodes; a tree with n nodes has n − 1 edges and height at least ⌊log₂ n⌋.

### Special shapes
- **Full:** every node has 0 or 2 children. **Complete:** all levels full except possibly the last, filled from the left (the shape of a heap). **Perfect:** all leaves at the same level. **Skewed:** every node has one child, which degrades to a linked list.

### Traversals (each O(n))
~~~c
void inorder(struct tnode *t)   { if (t) { inorder(t->left); printf("%d ", t->data); inorder(t->right); } }
void preorder(struct tnode *t)  { if (t) { printf("%d ", t->data); preorder(t->left); preorder(t->right); } }
void postorder(struct tnode *t) { if (t) { postorder(t->left); postorder(t->right); printf("%d ", t->data); } }
~~~
**Level order** visits the tree row by row using a **queue**. Preorder copies a tree, postorder deletes it, inorder of a BST gives sorted order. A tree is determined uniquely by its inorder together with its preorder or postorder.
`),
    note('bst', 'Binary search tree', { viz: 'bst', algos: true }, String.raw`
A **binary search tree (BST)** keeps the keys ordered: for every node, all keys in the **left** subtree are smaller and all keys in the **right** subtree are larger.

### Search, insert: O(height)
Start at the root; go left if the key is smaller, right if larger. Search stops at the key or at NULL. Insert is the same walk, and the new key becomes a leaf where the walk ended.
~~~c
struct tnode *insert(struct tnode *t, int k) {
    if (t == NULL) { t = malloc(sizeof *t); t->data = k; t->left = t->right = NULL; }
    else if (k < t->data) t->left  = insert(t->left, k);
    else if (k > t->data) t->right = insert(t->right, k);
    return t;
}
~~~

### Delete
| Case | Action |
|---|---|
| Leaf | remove it |
| One child | the child takes its place |
| Two children | copy the **inorder successor** (smallest key of the right subtree) into the node, then delete that successor, which has at most one child |

### Minimum, maximum, successor
Minimum: follow left links to the end. Maximum: follow right links.

### Cost
All operations are **O(h)**. For random keys h is about log n, but inserting sorted keys makes a skewed tree with h = n − 1 and O(n) operations. That is the reason for balanced trees.
`),
    note('avl', 'AVL trees (height balanced)', { viz: 'avl', algos: true }, String.raw`
An **AVL tree** is a BST in which, for **every** node, the heights of the left and right subtrees differ by at most 1.

**Balance factor** BF = height(left) − height(right) ∈ {−1, 0, +1}.

An AVL tree with n nodes has height at most about 1.44·log₂(n + 2), so **height = O(log n)** and search, insert and delete take **O(log n) in the worst case**.

### Rebalancing by rotations
After an insert or delete, walk back up and fix the first node whose BF becomes ±2. Let z be that node.
| Case | Cause | Fix |
|---|---|---|
| **LL** | inserted in the left subtree of the left child | single **right** rotation at z |
| **RR** | inserted in the right subtree of the right child | single **left** rotation at z |
| **LR** | inserted in the right subtree of the left child | left rotation at the left child, then right rotation at z |
| **RL** | inserted in the left subtree of the right child | right rotation at the right child, then left rotation at z |

A rotation changes only a few pointers (O(1)) and keeps the BST order, because it only moves subtrees across the pivot.

### Example
Insert 10, 20, 30: after 30 the root 10 has BF −2 (right-right), so rotate left at 10: 20 becomes the root with children 10 and 30.

An insert needs at most one rotation (single or double); a delete may need a rotation at every level on the way up, which is still O(log n) in total.
`),
    note('heap', 'Heap and priority queue', { viz: 'maxheap', algos: true }, String.raw`
A **binary heap** is a **complete** binary tree with the **heap property**:
- **Max-heap:** every parent ≥ its children, so the maximum is at the root.
- **Min-heap:** every parent ≤ its children, so the minimum is at the root.
(Unlike a BST there is no left/right ordering.)

### Array storage
A complete tree fits in an array with no pointers. With 0-based indices, node i has **parent (i − 1) / 2**, **left child 2i + 1**, **right child 2i + 2**.

### Operations
- **Insert:** put the key at the end, then **sift up**: swap with the parent while it is larger (max-heap). O(log n).
- **Extract max:** save the root, move the last element to the root, then **sift down**: swap with the larger child until the property holds. O(log n).
- **Peek:** the root, O(1).
- **Build heap** from n unsorted keys: call sift-down on nodes n/2 − 1 down to 0. The total is **O(n)**, not O(n log n), because most nodes are near the bottom and sift only a short way.

~~~c
void sift_down(int a[], int n, int i) {
    for (;;) {
        int l = 2*i + 1, r = l + 1, m = i;
        if (l < n && a[l] > a[m]) m = l;
        if (r < n && a[r] > a[m]) m = r;
        if (m == i) return;
        int t = a[i]; a[i] = a[m]; a[m] = t; i = m;
    }
}
~~~

### Uses
Priority queue, heap sort (O(n log n)), finding the k largest items, the engine of Dijkstra's and Prim's algorithms, and median maintenance with two heaps.
`),
    note('dsu', 'Disjoint sets (union-find)', { viz: 'dsu', algos: true }, String.raw`
Keeps track of a collection of **non-overlapping sets** and supports two operations:
- **find(x):** which set contains x? (returns a representative)
- **union(x, y):** merge the sets containing x and y.

### Representation
Each set is a tree whose root is its representative; one array «parent[]» stores everything («parent[x] = x» for a root).

~~~c
int find(int x)          { return parent[x] == x ? x : find(parent[x]); }
void unite(int x, int y) { parent[find(x)] = find(y); }
~~~
The naive version can build a chain, making find O(n). Two improvements:

### Union by rank (or size)
Attach the root of the **shorter** tree under the root of the taller one, so a tree of n nodes has height O(log n).

### Path compression
During find, make every node on the path point **directly to the root**: «parent[x] = find(parent[x])». Later finds on those nodes take one step.

### Cost
With both techniques m operations on n elements cost **O(m · α(n))**, where α is the inverse Ackermann function (below 5 for any practical n): nearly constant per operation.

### Uses
Kruskal's minimum spanning tree (is this edge creating a cycle?), connected components, and network connectivity.
`),
    note('graph-basics', 'Graphs: concepts and representation', { viz: 'bfs' }, String.raw`
A **graph G = (V, E)** is a set of **vertices** and a set of **edges** joining pairs of vertices. Trees are connected graphs without cycles.

### Terminology
| Term | Meaning |
|---|---|
| Directed / undirected | edges have a direction or not |
| Weighted | each edge has a cost |
| Degree | number of edges at a vertex (in-degree and out-degree if directed) |
| Path, simple path | sequence of vertices joined by edges; no repeated vertex |
| Cycle | path that starts and ends at the same vertex |
| Connected | every vertex reachable from every other (undirected) |
| Complete graph | every pair joined; n(n−1)/2 edges |
| Sparse / dense | E much smaller than V², or close to V² |
| DAG | directed acyclic graph |

The sum of all degrees equals 2E in an undirected graph.

### Representations
| | Adjacency matrix | Adjacency list |
|---|---|---|
| Storage | V × V array (A[i][j] = 1 or the weight) | array of V lists of neighbours |
| Space | O(V²) | O(V + E) |
| Is there an edge (u, v)? | O(1) | O(degree) |
| List all neighbours of u | O(V) | O(degree) |
| Best for | dense graphs | sparse graphs (most real graphs) |
`),
    note('bfs-dfs', 'Breadth-first and depth-first search', { viz: 'bfs', algos: true }, String.raw`
Both visit every vertex reachable from a start vertex exactly once, in O(V + E) time with adjacency lists. They differ only in the data structure that holds the vertices still to visit.

### Breadth-first search (BFS): a queue
~~~c
enqueue(start); visited[start] = 1;
while (!empty(q)) {
    u = dequeue(q); visit(u);
    for each neighbour w of u: if (!visited[w]) { visited[w] = 1; enqueue(w); }
}
~~~
Vertices are visited in order of **distance** from the start, so in an **unweighted** graph BFS finds shortest paths (fewest edges). Uses: shortest path in mazes and networks, level-order, finding connected components, bipartite test.

### Depth-first search (DFS): a stack or recursion
~~~c
void dfs(int u) {
    visited[u] = 1; visit(u);
    for each neighbour w of u: if (!visited[w]) dfs(w);
}
~~~
It follows one path as deep as possible, then **backtracks**. Uses: cycle detection, topological sort, connected and strongly connected components, solving mazes and puzzles.

### Comparison
| | BFS | DFS |
|---|---|---|
| Data structure | queue | stack / recursion |
| Memory | O(width of the graph) | O(depth) |
| Finds shortest path (unweighted) | **yes** | no |
| Typical use | nearest, level by level | explore everything, order, cycles |

For a disconnected graph run the search from every unvisited vertex.
`),
    note('mst', 'Spanning trees and minimum spanning trees', { viz: 'kruskal', algos: true }, String.raw`
A **spanning tree** of a connected graph is a subgraph that contains **all V vertices**, is connected and has **no cycle**; it always has exactly **V − 1 edges**. In a weighted graph the **minimum spanning tree (MST)** is the spanning tree of least total weight. Use: laying cable, pipes or roads at the least cost.

### Kruskal's algorithm (edge based)
1. Sort all edges by weight.
2. Take the edges in that order; **accept** an edge if its end vertices are in different components, otherwise **reject** it (it would close a cycle). The check uses **disjoint sets**.
3. Stop after V − 1 edges.
Time **O(E log E)** (the sorting).

### Prim's algorithm (vertex based)
1. Start with any vertex in the tree.
2. Repeat V − 1 times: among the edges that leave the tree, add the **cheapest** one and its new vertex.
With a min-heap of candidate edges: **O(E log V)**; with an adjacency matrix and arrays: O(V²).

### Which one?
Kruskal suits sparse graphs; Prim suits dense graphs. Both are **greedy** algorithms and both always find an MST (if edge weights are distinct the MST is unique).

### Properties
- The MST of a graph with V vertices has V − 1 edges.
- The cut property: the lightest edge across any cut belongs to some MST.
- A graph with all different edge weights has exactly one MST.
`),
    note('graph-more', 'Shortest paths and topological order', { viz: 'dijkstra' }, String.raw`
These are slightly beyond the syllabus but they use exactly the same graph, queue and heap ideas, and they are asked very often.

### Dijkstra's shortest path
For a graph with **non-negative** weights, find the shortest distance from a source to every vertex.
1. dist[source] = 0, all other distances = ∞.
2. Repeatedly choose the unsettled vertex u with the smallest dist and **settle** it (its distance is final).
3. **Relax** every edge (u, w): if dist[u] + weight < dist[w], update dist[w].
With a min-heap: **O((V + E) log V)**. It fails with negative edge weights (use Bellman-Ford).

### Topological sort
A linear order of a **directed acyclic graph** so that for every edge u → v, u comes before v. Used for task scheduling and course prerequisites.
- **Kahn's algorithm:** repeatedly remove a vertex with in-degree 0 and lower the in-degree of its neighbours. If vertices remain at the end, there is a cycle.
- **DFS version:** output vertices in reverse order of finishing.
Both run in O(V + E).
`),
  ];
})();
