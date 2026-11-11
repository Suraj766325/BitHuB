/* ============================================================
 * data/questions2.js — more practice questions, written for this
 * site in the style of the exercise sets of the course textbooks
 * (Sahni, Thareja, Tanenbaum): traces, numerical problems, short
 * proofs and programs. The book texts themselves are copyrighted,
 * so none of their questions are copied. `code` programs carry an
 * `expect` that dsa-tools/test-pyq.js checks by compiling them.
 * Notation: ~~~ code fence, «x» inline code.
 * ============================================================ */
(function () {
  'use strict';
  const R = String.raw;
  const N = (s) => s.replace(/~~~/g, '```').replace(/«([^»]+)»/g, '`$1`');
  const Y = (id, marks, module, topic, q, answer, extra) => Object.assign({ id: 'y-' + id, exam: 'End', year: 2025, no: 'Practice', marks, module, topic, q: N(q), answer: N(answer), ref: 'Textbook style' }, extra || {});

  DSA.pyqs = DSA.pyqs.concat([
    /* ---------------- Module 1 ---------------- */
    Y('doubling-loop', 3, 1, 'Loop analysis', R`Find the time complexity of the following code.
~~~
for (i = 1; i <= n; i = i * 2)
    for (j = 1; j <= i; j++)
        count++;
~~~`, R`The outer loop runs with i = 1, 2, 4, …, 2ᵏ where k = ⌊log₂ n⌋. For each i the inner loop runs i times, so

count = 1 + 2 + 4 + … + 2ᵏ = 2ᵏ⁺¹ − 1 < 2n.

This is a geometric series dominated by its last term, so the complexity is **Θ(n)**, not n log n.`),
    Y('rank-functions', 2, 1, 'Growth rates', R`Arrange in increasing order of growth: n², 2ⁿ, n log n, log n, n!, √n, n³, n.`, R`**log n < √n < n < n log n < n² < n³ < 2ⁿ < n!**

Polynomials grow slower than 2ⁿ, and 2ⁿ grows slower than n!. A quick check with n = 20: log n ≈ 4.3, √n ≈ 4.5 (they cross early, but √n wins for large n), n = 20, n log n ≈ 86, n² = 400, n³ = 8000, 2ⁿ ≈ 10⁶, n! ≈ 2.4 × 10¹⁸.`),
    Y('prove-bigo', 3, 1, 'Asymptotic notation', R`(a) Prove that 5n + 3 = O(n). (b) Prove that n² is not O(n).`, R`**(a)** For n ≥ 1, 5n + 3 ≤ 5n + 3n = 8n. So c = 8 and n₀ = 1 satisfy the definition: 5n + 3 ≤ 8·n.

**(b)** Suppose n² ≤ c·n for all n ≥ n₀. Dividing by n gives n ≤ c for all large n, which is false for n = max(n₀, c + 1). Hence no constants exist and n² is **not** O(n).`),
    Y('master-theorem', 4, 1, 'Recurrences', R`Use the Master theorem (or another method) to solve: (a) T(n) = 2T(n/2) + n²  (b) T(n) = 4T(n/2) + n  (c) T(n) = T(n/2) + 1  (d) T(n) = 2T(n/2) + n.`, R`Compare f(n) with n^(log_b a).

- **(a)** a = 2, b = 2, n^(log₂ 2) = n. f(n) = n² grows faster, and 2(n/2)² = n²/2 ≤ ½·n² (regularity holds). Case 3: **Θ(n²)**.
- **(b)** a = 4, b = 2, n^(log₂ 4) = n². f(n) = n grows slower. Case 1: **Θ(n²)**.
- **(c)** a = 1, b = 2, n^0 = 1. f(n) = 1 = Θ(1). Case 2: **Θ(log n)** (binary search).
- **(d)** a = 2, b = 2, n^1 = n. f(n) = n. Case 2: **Θ(n log n)** (merge sort).`),
    Y('array-address', 3, 1, 'Arrays', R`An integer array A[−2..5][3..9] (4 bytes per element) is stored from address 500. Find the address of A[1][5] in (a) row-major and (b) column-major order.`, R`Rows = 5 − (−2) + 1 = 8, columns = 9 − 3 + 1 = 7.

**(a) Row-major:** offset = (1 − (−2)) × 7 + (5 − 3) = 3 × 7 + 2 = 23 elements. Address = 500 + 23 × 4 = **592**.

**(b) Column-major:** offset = (5 − 3) × 8 + (1 − (−2)) = 2 × 8 + 3 = 19 elements. Address = 500 + 19 × 4 = **576**.`, { viz: 'array' }),
    Y('sparse-triplet', 4, 1, 'Sparse matrix', R`A 5 × 6 matrix has non-zero entries 15 at (0,0), 22 at (0,3), 11 at (1,1), −6 at (2,5) and 91 at (4,0). Write its triplet representation and the triplet representation of its transpose (ordered by row).`, R`**Triplet form** (first row: rows, columns, non-zero count):

| row | col | value |
|---|---|---|
| 5 | 6 | 5 |
| 0 | 0 | 15 |
| 0 | 3 | 22 |
| 1 | 1 | 11 |
| 2 | 5 | −6 |
| 4 | 0 | 91 |

**Transpose** (6 × 5): swap row and column of every entry, then order by the new row (and column):

| row | col | value |
|---|---|---|
| 6 | 5 | 5 |
| 0 | 0 | 15 |
| 0 | 4 | 91 |
| 1 | 1 | 11 |
| 3 | 0 | 22 |
| 5 | 2 | −6 |

Storage: 18 numbers instead of 30.`, { viz: 'sparse' }),
    Y('poly-add', 3, 1, 'Polynomials', R`Add P(x) = 3x⁵ + 2x³ + 7x + 1 and Q(x) = 4x⁴ − 2x³ + 5x + 9, showing how the terms are matched.`, R`Walk both lists in decreasing exponent order:

- 5: only P → 3x⁵
- 4: only Q → 4x⁴
- 3: both → 2 + (−2) = 0, the term **disappears**
- 1: both → 7 + 5 = 12x
- 0: both → 1 + 9 = 10

**P + Q = 3x⁵ + 4x⁴ + 12x + 10.** Each term is visited once: O(m + n).`, { viz: 'poly' }),
    Y('recursion-calls', 3, 1, 'Recursion', R`What does the program print? How many calls to «f» does «f(4)» make?`, R`Let C(n) be the number of calls, with C(0) = C(1) = 1 and C(n) = C(n−1) + C(n−2) + 1.

f(0) = f(1) = 1, f(2) = 1 + 1 + 1 = 3, f(3) = 3 + 1 + 1 = 5, f(4) = 5 + 3 + 1 = **9**. The call count obeys the same recurrence, so «f(4)» makes **9 calls**. The number of calls grows like Fibonacci, exponentially: this is tree recursion.`, { code: { c: R`#include <stdio.h>

static int calls = 0;

int f(int n) {
    calls++;
    if (n <= 1) return 1;
    return f(n - 1) + f(n - 2) + 1;
}

int main(void) {
    printf("f(4) = %d\n", f(4));
    printf("calls = %d\n", calls);
    return 0;
}
` }, expect: 'f(4) = 9\ncalls = 9\n', viz: 'recursion' }),
    Y('digit-sum', 3, 1, 'Recursion', R`Write a recursive C function that returns the sum of the digits of a non-negative integer. Trace it for 4096.`, R`Base case: n < 10 is a single digit, return n. Recursive case: last digit plus the sum of the digits of n / 10.

Trace for 4096: sum(4096) = 6 + sum(409) = 6 + 9 + sum(40) = 6 + 9 + 0 + sum(4) = 6 + 9 + 0 + 4 = **19**. The recursion depth is the number of digits, so the time is O(d) and the stack use O(d).`, { code: { c: R`#include <stdio.h>

int digit_sum(int n) {
    if (n < 10) return n;                 /* base case */
    return n % 10 + digit_sum(n / 10);    /* last digit + the rest */
}

int main(void) {
    printf("%d\n", digit_sum(4096));
    return 0;
}
` }, expect: '19\n' }),

    /* ---------------- Module 2 ---------------- */
    Y('ll-delete', 5, 2, 'Singly linked list', R`Write a C function that deletes the first node containing a given value from a singly linked list, and handle the case in which the node is the head.`, R`Walk with two pointers, «prev» one node behind «cur». If «cur» is the head, move the head; otherwise make «prev->next» skip «cur». Free the node. The cost is O(n) for the search and O(1) for the unlinking. The program builds 10, 20, 30, 40, deletes 30 (middle) and then 10 (head).`, { code: { c: R`#include <stdio.h>
#include <stdlib.h>

struct node { int data; struct node *next; };

struct node *push_back(struct node *head, int v) {
    struct node *n = malloc(sizeof *n), *p;
    n->data = v; n->next = NULL;
    if (!head) return n;
    for (p = head; p->next; p = p->next) ;
    p->next = n;
    return head;
}

struct node *delete_value(struct node *head, int v) {
    struct node *prev = NULL, *cur = head;
    while (cur && cur->data != v) { prev = cur; cur = cur->next; }
    if (!cur) return head;                       /* not found */
    if (!prev) head = cur->next;                 /* deleting the head */
    else prev->next = cur->next;
    free(cur);
    return head;
}

int main(void) {
    struct node *head = NULL, *p;
    for (int v = 10; v <= 40; v += 10) head = push_back(head, v);
    head = delete_value(head, 30);
    head = delete_value(head, 10);
    for (p = head; p; p = p->next) printf("%d ", p->data);
    printf("\n");
    while (head) { p = head->next; free(head); head = p; }
    return 0;
}
` }, expect: '20 40 \n', viz: 'list' }),
    Y('ll-middle', 4, 2, 'Linked list techniques', R`In one pass and without knowing the length, find (a) the middle node and (b) the 2nd node from the end of a singly linked list 1 → 2 → 3 → 4 → 5 → 6 → 7.`, R`**(a) Middle:** «slow» moves one node and «fast» two nodes per step. When «fast» cannot move further, «slow» is at the middle: for 7 nodes it stops at **4**.

**(b) nth from the end:** advance «fast» n = 2 nodes ahead, then move both one node at a time. When «fast» reaches the last node, «slow» is the 2nd from the end: **6**.

Both are O(n) time and O(1) space.`, { code: { c: R`#include <stdio.h>
#include <stdlib.h>

struct node { int data; struct node *next; };

int main(void) {
    struct node *head = NULL, *tail = NULL, *slow, *fast;
    for (int v = 1; v <= 7; v++) {
        struct node *n = malloc(sizeof *n);
        n->data = v; n->next = NULL;
        if (tail) tail->next = n; else head = n;
        tail = n;
    }
    for (slow = fast = head; fast && fast->next; ) { slow = slow->next; fast = fast->next->next; }
    printf("middle = %d\n", slow->data);

    int k = 2;
    fast = head;
    for (int i = 0; i < k - 1; i++) fast = fast->next;      /* fast is k-1 ahead of slow */
    for (slow = head; fast->next; ) { slow = slow->next; fast = fast->next; }
    printf("2nd from end = %d\n", slow->data);

    while (head) { slow = head->next; free(head); head = slow; }
    return 0;
}
` }, expect: 'middle = 4\n2nd from end = 6\n', viz: 'cycle' }),
    Y('ll-doubly-vs-singly', 3, 2, 'Doubly linked list', R`Why can a node be deleted in O(1) from a doubly linked list given only a pointer to it, but not from a singly linked list? What is the price of the doubly linked list?`, R`To unlink a node you must change its **predecessor's** next pointer. A doubly linked node stores a «prev» pointer, so the predecessor is reached directly: «p->prev->next = p->next; p->next->prev = p->prev;» (with checks for the ends).

A singly linked node does not know its predecessor, so the list must be walked from the head to find it: **O(n)**.

**Price:** an extra pointer in every node (more memory) and about twice as many pointer updates on each insertion or deletion, so more chances for a bug.`, { viz: 'list' }),
    Y('ll-cycle-start', 4, 2, 'Cycle detection', R`Describe Floyd's algorithm to detect a cycle in a linked list. After «slow» and «fast» meet, how can the first node of the cycle be found?`, R`**Detection.** «slow» moves one node, «fast» two nodes. If there is no cycle, «fast» reaches NULL. If there is one, both enter it and «fast» gains one node per step, so they must meet. O(n) time, O(1) space.

**Cycle start.** Let the tail before the cycle have length a, and let the meeting point be b nodes into the cycle, with cycle length c. When they meet, «slow» has moved a + b and «fast» has moved 2(a + b) = a + b + k·c, so a + b = k·c, i.e. **a = k·c − b**: walking a more steps from the meeting point lands on the cycle start.

So: leave one pointer at the meeting point, put the other at the head, and move both **one step at a time**; they meet exactly at the first node of the cycle.`, { viz: 'cycle' }),
    Y('ll-costs', 4, 2, 'Operation costs', R`Give the worst-case time of each operation on a singly linked list that keeps (i) only a head pointer, and (ii) head and tail pointers: insert at front, insert at end, delete the first node, delete the last node, search.`, R`| Operation | Head only | Head and tail |
|---|---|---|
| Insert at front | O(1) | O(1) |
| Insert at end | O(n) (walk to the last node) | **O(1)** |
| Delete first | O(1) | O(1) |
| Delete last | O(n) | **O(n)** (the node before the tail must be found; a tail pointer does not help) |
| Search | O(n) | O(n) |

Deleting the last node becomes O(1) only in a **doubly** linked list with a tail pointer.`),
    Y('josephus', 4, 2, 'Circular linked list', R`Seven people stand in a circle, numbered 1 to 7. Starting from 1, every 3rd person is removed. Give the removal order and the survivor, and say which data structure models this.`, R`Model the circle as a **circular linked list** and delete every 3rd node.

Count from 1: remove **3**; count from 4: remove **6**; count from 7: remove **2**; count from 4: remove **7**; count from 1: remove **5**; remaining 1 and 4, count from 1 (1, 4, 1): remove **1**.

Removal order **3, 6, 2, 7, 5, 1**; the survivor is **4**. With a circular list each removal is O(k), so the whole process is O(n·k).`, { viz: 'list' }),
    Y('poly-multiply', 3, 2, 'Polynomials', R`Multiply (2x + 3) by (x² + x + 1) and state the cost of multiplying a polynomial with m terms by one with n terms.`, R`Multiply every term of the first by every term of the second and combine like terms:

(2x)(x² + x + 1) = 2x³ + 2x² + 2x
(3)(x² + x + 1) = 3x² + 3x + 3

Sum: **2x³ + 5x² + 5x + 3**.

Cost: m × n term products, plus combining equal exponents, so **O(m·n)** (a little more if the result must be kept sorted).`),
    Y('ll-sorted-insert', 4, 2, 'Singly linked list', R`Write a C function to insert a value into a sorted singly linked list so that the list stays sorted. Insert 5, 1, 3, 2, 4 into an empty list.`, R`Find the first node whose value is not smaller than the new value, keeping a pointer to the node before it. If the new node goes first, it becomes the head. O(n) per insertion.`, { code: { c: R`#include <stdio.h>
#include <stdlib.h>

struct node { int data; struct node *next; };

struct node *insert_sorted(struct node *head, int v) {
    struct node *n = malloc(sizeof *n), *p = head, *prev = NULL;
    n->data = v;
    while (p && p->data < v) { prev = p; p = p->next; }
    n->next = p;
    if (!prev) return n;           /* goes before the old head */
    prev->next = n;
    return head;
}

int main(void) {
    struct node *head = NULL, *p;
    int in[] = {5, 1, 3, 2, 4};
    for (int i = 0; i < 5; i++) head = insert_sorted(head, in[i]);
    for (p = head; p; p = p->next) printf("%d ", p->data);
    printf("\n");
    while (head) { p = head->next; free(head); head = p; }
    return 0;
}
` }, expect: '1 2 3 4 5 \n', viz: 'list' }),
    Y('ll-node-size', 2, 2, 'Linked lists', R`On a 64-bit machine an «int» is 4 bytes and a pointer is 8 bytes. How much memory do 1000 integers need as (a) an array, (b) a singly linked list, (c) a doubly linked list? (Assume nodes are aligned to 8 bytes and ignore the malloc header.)`, R`**(a) Array:** 1000 × 4 = **4000 bytes**.

**(b) Singly linked list:** each node holds an int (4 bytes), 4 bytes of padding for alignment, and a pointer (8 bytes) = 16 bytes, so **16000 bytes**.

**(c) Doubly linked list:** int + padding (8) + two pointers (16) = 24 bytes, so **24000 bytes**.

The links cost memory, which is the price paid for cheap insertion and deletion.`),

    /* ---------------- Module 3 ---------------- */
    Y('infix-postfix-2', 4, 3, 'Infix to postfix', R`Convert (A + B) * (C − D) / E to postfix, showing the stack after each symbol.`, R`| Symbol | Stack (bottom → top) | Output |
|---|---|---|
| ( | ( | |
| A | ( | A |
| + | ( + | A |
| B | ( + | A B |
| ) | (empty) | A B + |
| * | * | A B + |
| ( | * ( | A B + |
| C | * ( | A B + C |
| − | * ( − | A B + C |
| D | * ( − | A B + C D |
| ) | * | A B + C D − |
| / | / (pop * first: equal precedence, left to right) | A B + C D − * |
| E | / | A B + C D − * E |
| end | (empty) | **A B + C D − * E /** |`, { viz: 'infix' }),
    Y('postfix-eval-2', 3, 3, 'Postfix evaluation', R`Evaluate the postfix expression  6 2 3 + − 3 8 2 / + * 2 ^ 3 +  (^ is exponentiation).`, R`Push operands; on an operator pop two values (the first popped is the right operand).

6 → [6]; 2 → [6 2]; 3 → [6 2 3]; **+** → [6 5]; **−** → [1]; 3, 8, 2 → [1 3 8 2]; **/** → [1 3 4]; **+** → [1 7]; **\*** → [7]; 2 → [7 2]; **^** → [49]; 3 → [49 3]; **+** → [**52**].

Infix form: ((6 − (2 + 3)) * (3 + 8/2))² + 3 = (1 × 7)² + 3 = 52.`, { viz: 'postfix' }),
    Y('infix-prefix', 3, 3, 'Prefix expressions', R`Convert A + B * C − D to prefix (Polish) notation and to postfix.`, R`With * before + and −, and + − of equal precedence evaluated left to right, the expression is ((A + (B * C)) − D).

**Prefix:** − + A * B C D.   **Postfix:** A B C * + D −.

Method: build the parse tree; preorder gives prefix, postorder gives postfix.`),
    Y('circular-queue-trace', 4, 3, 'Circular queue', R`A circular queue is stored in an array of size 6 and keeps one cell empty to tell "full" from "empty" (front = rear = 0 initially). Show front, rear and the contents after: enqueue 10, 20, 30, 40, 50; dequeue; dequeue; enqueue 60; enqueue 70; enqueue 80.`, R`Capacity is 6 − 1 = 5 items. «rear» is the index of the last item, «front» is the index just before the first item.

| Operation | front | rear | Items |
|---|---|---|---|
| enqueue 10 … 50 | 0 | 5 | 10 20 30 40 50 (full: (5 + 1) % 6 = 0 = front) |
| dequeue → 10 | 1 | 5 | 20 30 40 50 |
| dequeue → 20 | 2 | 5 | 30 40 50 |
| enqueue 60 | 2 | 0 (wraps) | 30 40 50 60 |
| enqueue 70 | 2 | 1 | 30 40 50 60 70 (full again: (1 + 1) % 6 = 2) |
| enqueue 80 | 2 | 1 | **overflow**: rejected |

The wrap-around reuses the cells freed by the dequeues, which is the whole point of a circular queue.`, { viz: 'queue' }),
    Y('queue-two-stacks', 5, 3, 'Queue and stack', R`Implement a queue using two stacks. What are the costs of enqueue and dequeue?`, R`Use an **input stack** and an **output stack**.
- **enqueue(x):** push x on the input stack. O(1).
- **dequeue():** if the output stack is empty, pop everything from the input stack and push it onto the output stack (this reverses the order, so the oldest item is now on top); then pop the output stack.

Each element is moved at most once from input to output, so dequeue is **amortised O(1)** (O(n) for a single call that has to transfer).`, { code: { c: R`#include <stdio.h>

#define MAX 100
static int in[MAX], out[MAX], ti = -1, to = -1;

void enqueue(int x) { in[++ti] = x; }

int dequeue(void) {
    if (to == -1)
        while (ti != -1) out[++to] = in[ti--];     /* reverse: oldest item ends on top */
    return out[to--];
}

int main(void) {
    enqueue(1); enqueue(2); enqueue(3);
    printf("%d ", dequeue());
    enqueue(4);
    printf("%d ", dequeue());
    printf("%d ", dequeue());
    printf("%d\n", dequeue());
    return 0;
}
` }, expect: '1 2 3 4\n', viz: 'queue' }),
    Y('stack-two-queues', 3, 3, 'Queue and stack', R`Describe how to implement a stack with two queues, and give the cost of push and pop.`, R`**Costly push.** Keep the newest item at the front of queue Q1. To push x: enqueue x into the empty queue Q2, then dequeue every item of Q1 into Q2 behind it, and swap the names of Q1 and Q2. Pop is a plain dequeue from Q1.

Cost: **push O(n)**, **pop O(1)** (the other way round is also possible: cheap push and O(n) pop). Neither version is as good as an array-based stack, where both are O(1); the exercise shows that FIFO structures can imitate LIFO ones.`),
    Y('hanoi-3', 3, 3, 'Tower of Hanoi', R`List all the moves needed to shift 3 discs from A to C using B, and give the number of moves for n = 5 and n = 10.`, R`Moves (disc 1 is the smallest): A→C (1), A→B (2), C→B (1), A→C (3), B→A (1), B→C (2), A→C (1): **7 moves**.

The number of moves satisfies T(n) = 2T(n − 1) + 1, so T(n) = 2ⁿ − 1: **31** moves for n = 5 and **1023** for n = 10. This is also the minimum, so the exponential cost is inherent to the problem.`, { viz: 'hanoi' }),
    Y('brackets-trace', 2, 3, 'Balanced brackets', R`Using a stack, decide whether each string is balanced: (a) {[()]}   (b) ([)]   (c) {[()]}(`, R`Push opening brackets; on a closing bracket the top must be its partner.

- **(a)** push { [ (; ) matches (; ] matches [; } matches {; stack empty → **balanced**.
- **(b)** push ( [; then ) arrives but the top is [ → **not balanced** (wrong nesting).
- **(c)** the first six symbols match, but the final ( stays on the stack → **not balanced** (an unclosed bracket).`, { viz: 'parens' }),
    Y('pq-implementations', 3, 3, 'Priority queue', R`Compare the cost of insert and delete-max in a priority queue implemented as (a) an unsorted array, (b) a sorted array, (c) a sorted linked list, (d) a binary heap.`, R`| Structure | Insert | Delete-max |
|---|---|---|
| Unsorted array | O(1) (append) | O(n) (search for the maximum) |
| Sorted array | O(n) (shift to keep the order) | O(1) (last element) |
| Sorted linked list | O(n) (find the place) | O(1) (first node) |
| Binary heap | **O(log n)** | **O(log n)** |

The heap balances the two costs, which is why it is the standard choice.`, { viz: 'pqueue' }),
    Y('reverse-string', 3, 3, 'Stack', R`Write a C program that reverses a string using a stack.`, R`Push each character, then pop them all: the last character pushed comes out first. O(n) time and O(n) space.`, { code: { c: R`#include <stdio.h>
#include <string.h>

int main(void) {
    char s[] = "Hello", stack[100];
    int top = -1;
    for (size_t i = 0; i < strlen(s); i++) stack[++top] = s[i];     /* push */
    for (size_t i = 0; i < strlen(s); i++) s[i] = stack[top--];     /* pop */
    printf("%s\n", s);
    return 0;
}
` }, expect: 'olleH\n', viz: 'stack' }),
    Y('stack-permutations', 3, 3, 'Stack', R`The numbers 1, 2, 3 are pushed onto a stack in this order (pops may be interleaved with the pushes). Which of the 6 permutations can come out? How many are possible for n = 4?`, R`Possible output orders: 1 2 3, 1 3 2, 2 1 3, 2 3 1, 3 2 1. The only impossible one is **3 1 2**: to output 3 first, 1 and 2 must already be on the stack (2 above 1), so 2 has to come out before 1.

The number of obtainable permutations of n items is the Catalan number C(2n, n) / (n + 1): **5 for n = 3** and **14 for n = 4**.`, { viz: 'stack' }),

    /* ---------------- Module 4 ---------------- */
    Y('binary-trace', 3, 4, 'Binary search', R`Search for 52 and then for 10 in the sorted array [3, 8, 12, 17, 25, 31, 44, 52, 67, 80] using binary search. List the indices probed.`, R`With low = 0, high = 9:

**Key 52:** mid = 4 (25 < 52) → low = 5; mid = 7 (52) → **found at index 7** after 2 probes.

**Key 10:** mid = 4 (25 > 10) → high = 3; mid = 1 (8 < 10) → low = 2; mid = 2 (12 > 10) → high = 1; now low > high → **not found**, after 3 probes.

For n = 10 at most ⌊log₂ 10⌋ + 1 = 4 probes are ever needed.`, { viz: 'binary' }),
    Y('binary-max', 2, 4, 'Binary search', R`What is the maximum number of comparisons binary search needs on 1000 sorted elements? And on 1,000,000?`, R`The range shrinks n → n/2 → … → 1, so the maximum is ⌊log₂ n⌋ + 1.

- n = 1000: ⌊9.97⌋ + 1 = **10** (since 2¹⁰ = 1024 ≥ 1000).
- n = 1,000,000: ⌊19.93⌋ + 1 = **20**.

Linear search would need up to 1000 and 1,000,000.`, { viz: 'binary' }),
    Y('hash-linear-chain', 5, 4, 'Hashing', R`Insert the keys 31, 14, 23, 44, 64, 52, 71 (in this order) into a table of size 10 with h(k) = k mod 10, using (a) linear probing and (b) chaining. Give the load factor.`, R`h: 31→1, 14→4, 23→3, 44→4, 64→4, 52→2, 71→1.

**(a) Linear probing:** 31 → slot 1; 14 → 4; 23 → 3; 44 collides at 4, goes to 5; 64 collides at 4 and 5, goes to 6; 52 → 2; 71 collides at 1, 2, 3, 4, 5, 6 and goes to 7.

| slot | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|---|---|---|---|---|---|---|---|---|---|---|
| key | | 31 | 52 | 23 | 14 | 44 | 64 | 71 | | |

**(b) Chaining:** slot 1: 31 → 71; slot 2: 52; slot 3: 23; slot 4: 14 → 44 → 64.

**Load factor α = n / M = 7 / 10 = 0.7.** The probing table shows primary clustering: keys 14, 44, 64 and 71 form one long run.`, { viz: 'hash-linear' }),
    Y('hash-quadratic', 4, 4, 'Hashing', R`Repeat the previous insertions (31, 14, 23, 44, 64, 52, 71, table size 10, h(k) = k mod 10) with quadratic probing: the i-th probe is (h(k) + i²) mod 10.`, R`31 → 1; 14 → 4; 23 → 3; 44: slot 4 taken, probe (4 + 1) = 5 → free; 64: slot 4 taken, 5 taken, (4 + 4) = 8 → free; 52 → 2; 71: slot 1 taken, (1 + 1) = 2 taken, (1 + 4) = 5 taken, (1 + 9) = 10 mod 10 = 0 → free.

| slot | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|---|---|---|---|---|---|---|---|---|---|---|
| key | 71 | 31 | 52 | 23 | 14 | 44 | | | 64 | |

Quadratic probing avoids the long run of linear probing (no primary clustering), but keys with the same hash still follow the same probe path (secondary clustering).`, { viz: 'hash-quadratic' }),
    Y('hash-double', 4, 4, 'Hashing', R`A table has 11 slots. Use double hashing with h₁(k) = k mod 11 and h₂(k) = 7 − (k mod 7) to insert 25, 36, 47, 14. The i-th probe is (h₁ + i·h₂) mod 11.`, R`- 25: h₁ = 3 → slot **3**.
- 36: h₁ = 3 (taken); h₂ = 7 − (36 mod 7 = 1) = 6 → (3 + 6) = 9 → slot **9**.
- 47: h₁ = 3 (taken); h₂ = 7 − (47 mod 7 = 5) = 2 → (3 + 2) = 5 → slot **5**.
- 14: h₁ = 3 (taken); h₂ = 7 − (14 mod 7 = 0) = 7 → (3 + 7) = 10 → slot **10**.

All four keys collide at 3 but take different paths, because the step size depends on the key. h₂ must never be 0 and should be coprime with the table size (11 is prime).`, { viz: 'hash-double' }),
    Y('bubble-trace', 4, 4, 'Bubble sort', R`Sort [64, 34, 25, 12, 22, 11, 90] with bubble sort. Show the array after each pass and count the swaps.`, R`| Pass | Array after the pass |
|---|---|
| 1 | 34 25 12 22 11 64 90 |
| 2 | 25 12 22 11 34 64 90 |
| 3 | 12 22 11 25 34 64 90 |
| 4 | 12 11 22 25 34 64 90 |
| 5 | 11 12 22 25 34 64 90 |
| 6 | no swap: stop |

Each swap removes exactly one inversion, and the input has 5 + 4 + 3 + 1 + 1 = **14 inversions**, so there are **14 swaps**. The comparisons are 6 + 5 + 4 + 3 + 2 + 1 up to the early exit.`, { viz: 'bubble' }),
    Y('selection-trace', 3, 4, 'Selection sort', R`Sort [29, 10, 14, 37, 13] with selection sort, showing the array after each pass and the number of swaps.`, R`| Pass | Minimum found | Array after the pass |
|---|---|---|
| 1 | 10 | 10 29 14 37 13 |
| 2 | 13 | 10 13 14 37 29 |
| 3 | 14 (already in place) | 10 13 14 37 29 |
| 4 | 29 | 10 13 14 29 37 |

Comparisons: 4 + 3 + 2 + 1 = 10 (always n(n−1)/2). Swaps: 3 real swaps (at most n − 1 = 4).`, { viz: 'selection' }),
    Y('insertion-trace', 3, 4, 'Insertion sort', R`Sort [5, 2, 4, 6, 1, 3] with insertion sort. Show the array after each insertion and count the element shifts.`, R`| Key inserted | Array after | Shifts |
|---|---|---|
| 2 | 2 5 4 6 1 3 | 1 |
| 4 | 2 4 5 6 1 3 | 1 |
| 6 | 2 4 5 6 1 3 | 0 |
| 1 | 1 2 4 5 6 3 | 4 |
| 3 | 1 2 3 4 5 6 | 3 |

Total shifts = 9, which equals the number of inversions of the input. This is why insertion sort is O(n + inversions): fast on nearly sorted data.`, { viz: 'insertion' }),
    Y('merge-trace', 4, 4, 'Merge sort', R`Show the recursion of merge sort on [38, 27, 43, 3, 9, 82, 10], with the merges in order.`, R`**Divide:** [38 27 43 3 9 82 10] → [38 27 43 3] and [9 82 10] → [38 27] [43 3] [9 82] [10] → single elements.

**Merge (bottom up):**
- [38] + [27] → [27 38]; [43] + [3] → [3 43]
- [27 38] + [3 43] → [3 27 38 43]
- [9] + [82] → [9 82]; [9 82] + [10] → [9 10 82]
- [3 27 38 43] + [9 10 82] → **[3 9 10 27 38 43 82]**

The recursion tree has ⌈log₂ 7⌉ = 3 levels of merging and each level handles n elements, so the cost is O(n log n).`, { viz: 'merge' }),
    Y('quick-partition', 4, 4, 'Quick sort', R`Partition [10, 80, 30, 90, 40, 50, 70] around the pivot 70 (the last element) with the Lomuto scheme, and give the final position of the pivot.`, R`i = −1 (end of the "smaller" region), scan j = 0 … 5:

- j = 0 (10 < 70): i = 0, swap a[0] with a[0].
- j = 1 (80): no.
- j = 2 (30 < 70): i = 1, swap a[1] and a[2] → 10 30 80 90 40 50 70.
- j = 3 (90): no.
- j = 4 (40 < 70): i = 2, swap a[2] and a[4] → 10 30 40 90 80 50 70.
- j = 5 (50 < 70): i = 3, swap a[3] and a[5] → 10 30 40 50 80 90 70.

Finally swap the pivot with a[i + 1] = a[4]: **10 30 40 50 70 90 80**. The pivot 70 is at **index 4**, in its final place; sort [10 30 40 50] and [90 80] recursively.`, { viz: 'quick' }),
    Y('radix-trace', 4, 4, 'Radix sort', R`Sort 329, 457, 657, 839, 436, 720, 355 with LSD radix sort, showing the list after each digit pass.`, R`| Pass | List after the pass (stable) |
|---|---|
| units digit | 720 355 436 457 657 329 839 |
| tens digit | 720 329 436 839 355 457 657 |
| hundreds digit | 329 355 436 457 657 720 839 |

Each pass must be **stable** (457 stays before 657, 329 before 839 when their digit is equal), otherwise the earlier passes would be undone. Cost O(d·(n + 10)) with d = 3 digits.`, { viz: 'radix' }),
    Y('sort-choice', 4, 4, 'Sorting', R`Which sorting algorithm would you choose, and why: (a) 50 records that are almost sorted, (b) a million integers where a worst-case guarantee is needed and memory is tight, (c) records sorted by two keys in two passes, (d) a 100 GB file with 4 GB of memory?`, R`- **(a) Insertion sort.** O(n + inversions): almost linear when almost sorted, and no overhead.
- **(b) Heap sort.** O(n log n) in the worst case and in place (quick sort can degrade to O(n²); merge sort needs O(n) extra memory).
- **(c) A stable sort**, such as merge sort (or insertion sort for small inputs): sort by the secondary key, then stably by the primary key, so ties keep their secondary order.
- **(d) External merge sort.** Create about 25 sorted runs that fit in memory, then merge them with a k-way merge: sequential disk access and very few passes.`),
    Y('external-passes', 3, 4, 'External sorting', R`A 4 GB file is sorted with 256 MB of memory. How many initial runs are produced? How many merge passes are needed for a 2-way merge and for a 16-way merge?`, R`Runs = 4 GB / 256 MB = **16**.

Each pass of a k-way merge divides the number of runs by k, so passes = ⌈log_k 16⌉:
- 2-way: ⌈log₂ 16⌉ = **4 passes**.
- 16-way: ⌈log₁₆ 16⌉ = **1 pass**.

More ways means fewer passes over the disk, but k input buffers must fit in memory (each smaller), and choosing the smallest of k heads costs O(log k) with a heap.`, { viz: 'kway' }),
    Y('binary-recursive', 4, 4, 'Binary search', R`Write a recursive binary search in C. Search for 23 and 7 in {2, 5, 8, 12, 16, 23, 38, 56, 72, 91}.`, R`Base case: the range is empty (low > high), return −1. Otherwise compare with the middle element and recurse on one half. T(n) = T(n/2) + 1 = O(log n); the recursion uses O(log n) stack.`, { code: { c: R`#include <stdio.h>

int bsearch_rec(const int a[], int lo, int hi, int key) {
    if (lo > hi) return -1;
    int mid = lo + (hi - lo) / 2;
    if (a[mid] == key) return mid;
    if (a[mid] < key) return bsearch_rec(a, mid + 1, hi, key);
    return bsearch_rec(a, lo, mid - 1, key);
}

int main(void) {
    int a[] = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91};
    printf("%d\n", bsearch_rec(a, 0, 9, 23));
    printf("%d\n", bsearch_rec(a, 0, 9, 7));
    return 0;
}
` }, expect: '5\n-1\n', viz: 'binary' }),

    /* ---------------- Module 5 ---------------- */
    Y('bst-build', 5, 5, 'Binary search tree', R`Insert 45, 22, 77, 90, 10, 35, 60 into an empty BST. Draw it and give the inorder, preorder, postorder and level-order traversals.`, R`~~~
          45
        /    \
      22      77
     /  \    /  \
   10   35  60   90
~~~
- **Inorder:** 10 22 35 45 60 77 90 (sorted)
- **Preorder:** 45 22 10 35 77 60 90
- **Postorder:** 10 35 22 60 90 77 45
- **Level order:** 45 22 77 10 35 60 90

The tree has 3 levels (height 2 measured in edges).`, { viz: 'traversals' }),
    Y('bst-delete', 4, 5, 'Binary search tree', R`From the BST of the previous question delete 22 and then 45. Show the tree after each deletion.`, R`**Delete 22** (two children 10 and 35): replace it by its inorder successor, the smallest key of the right subtree, which is **35** (a leaf). Result: 45 → left 35 (with left child 10), right 77 (60, 90).

**Delete 45** (the root, two children): the inorder successor is the smallest key of the right subtree: **60**. Copy 60 to the root and delete the leaf 60. Result:

~~~
          60
        /    \
      35      77
     /          \
   10            90
~~~
Using the inorder predecessor (the largest of the left subtree) is equally correct.`, { viz: 'bst' }),
    Y('tree-from-traversals', 4, 5, 'Binary tree', R`The inorder traversal of a binary tree is D B E A F C G and its preorder is A B D E C F G. Construct the tree and give its postorder.`, R`The first preorder symbol is the root: **A**. In the inorder list, D B E lies left of A (the left subtree) and F C G lies right (the right subtree).

- Left subtree: preorder B D E, inorder D B E → root **B** with children D and E.
- Right subtree: preorder C F G, inorder F C G → root **C** with children F and G.

~~~
        A
      /   \
     B     C
    / \   / \
   D   E F   G
~~~
**Postorder:** D E B F G C A.`, { viz: 'traversals' }),
    Y('avl-trace', 5, 5, 'AVL tree', R`Insert 50, 20, 60, 10, 8, 15 into an empty AVL tree. Name each rotation and draw the final tree.`, R`- 50, 20, 60, 10: balanced.
- **Insert 8:** node 20 now has left height 2 and right height 0 (balance factor +2); the new key is in the left subtree of the left child: **LL → right rotation at 20**. Now 10 is the parent of 8 and 20.
- **Insert 15:** it goes to the left of 20. Node 50 has balance factor +2, but its left child 10 is right-heavy (−1): **LR case**. Rotate left at 10 (20 becomes the left child of 50), then rotate right at 50.

Final tree:
~~~
        20
      /    \
    10      50
   /  \       \
  8    15      60
~~~
Preorder 20 10 8 15 50 60; every balance factor is in {−1, 0, +1}.`, { viz: 'avl' }),
    Y('tree-counts', 3, 5, 'Binary tree', R`(a) What is the maximum number of nodes at level l of a binary tree, and in a tree of height h? (b) What is the minimum height of a binary tree with 100 nodes? (c) How many different BSTs can be built from the keys 1, 2, 3? From 1 … 4?`, R`**(a)** Level l has at most **2ˡ** nodes; a tree of height h has at most **2^(h+1) − 1** nodes (levels 0 … h).

**(b)** 2^(h+1) − 1 ≥ 100 gives h + 1 ≥ 7, so the minimum height is **6** (⌊log₂ 100⌋ = 6).

**(c)** The number of BST shapes with n keys is the Catalan number C(2n, n)/(n + 1): **5** for n = 3 and **14** for n = 4.`),
    Y('heap-build', 4, 5, 'Heap', R`Build a max-heap from the array [4, 10, 3, 5, 1] by sifting down (bottom up). Then perform one extract-max.`, R`n = 5, so sift down nodes at indices 1 and 0.

- Index 1 (value 10): children 5 and 1 are smaller, nothing to do.
- Index 0 (value 4): children 10 and 3; swap with the larger child 10 → [10, 4, 3, 5, 1]; 4 now has children 5 and 1 (indices 3 and 4), swap with 5 → **[10, 5, 3, 4, 1]**.

**Extract max (10):** swap the root with the last element → [1, 5, 3, 4 | 10]; sift 1 down: swap with 5 → [5, 1, 3, 4]; swap with 4 → [5, 4, 3, 1]. The heap is **[5, 4, 3, 1]** and 10 is returned.`, { viz: 'maxheap' }),
    Y('heap-insert', 4, 5, 'Heap', R`Insert 35, 33, 42, 10, 14, 19, 27, 44, 26, 31 one after another into an empty max-heap. Give the final array.`, R`Each key is placed at the end and sifted up while it is larger than its parent.

- 35 → [35]; 33 → [35, 33]
- 42 → goes under 35, larger → swap: [42, 33, 35]
- 10, 14, 19, 27 are smaller than their parents: [42, 33, 35, 10, 14, 19, 27]
- 44 (index 7): swaps with 10, then 33, then 42 → [44, 42, 35, 33, 14, 19, 27, 10]
- 26 (index 8): parent 33, stays → [44, 42, 35, 33, 14, 19, 27, 10, 26]
- 31 (index 9): parent 14, swap; parent 42, stays.

**Final array: [44, 42, 35, 33, 31, 19, 27, 10, 26, 14].** Each insertion costs at most log₂ n swaps.`, { viz: 'maxheap' }),
    Y('heap-linear-build', 3, 5, 'Heap', R`Why does building a heap from n keys with sift-down take O(n) and not O(n log n)?`, R`A sift-down from a node of height h costs at most h swaps. In a complete tree about n / 2^(h+1) nodes have height h, so the total work is

Σ (n / 2^(h+1)) · h  =  n · Σ h / 2^(h+1)  ≤  n · 1 = **O(n)**,

because the series Σ h / 2ʰ converges. Most nodes are near the bottom and move only a short way, whereas inserting n keys one by one sifts each of them up to log n levels.`),
    Y('dsu-trace', 4, 5, 'Disjoint sets', R`Elements 1 … 8 start as separate sets. Process union(1,2), union(3,4), union(1,3), union(5,6), union(7,8), union(5,7), union(1,5) using union by rank (on a tie the first root becomes the parent). Give the parent array and the number of steps of find(8) before and after path compression.`, R`Ranks start at 0.

- union(1,2): tie → parent[2] = 1, rank₁ = 1
- union(3,4): parent[4] = 3, rank₃ = 1
- union(1,3): tie (1, 1) → parent[3] = 1, rank₁ = 2
- union(5,6): parent[6] = 5, rank₅ = 1
- union(7,8): parent[8] = 7, rank₇ = 1
- union(5,7): tie → parent[7] = 5, rank₅ = 2
- union(1,5): tie (2, 2) → parent[5] = 1, rank₁ = 3

| x | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|
| parent | 1 | 1 | 1 | 3 | 1 | 5 | 5 | 7 |

find(8) follows 8 → 7 → 5 → 1: **3 steps**. With path compression, 8, 7 and 5 are all re-pointed to 1, so the next find(8) takes **1 step**.`, { viz: 'dsu' }),
    Y('bfs-dfs-trace', 4, 5, 'Graph traversal', R`For the undirected graph with adjacency lists A: B, C;  B: A, D, E;  C: A, F;  D: B;  E: B, F;  F: C, E, give the BFS and DFS orders starting from A (visit neighbours in the order listed).`, R`**BFS** (queue): A; neighbours B, C; then B's new neighbours D, E; then C's new neighbour F.
Order: **A B C D E F**. Queue contents: [A] → [B C] → [C D E] → [D E F] → …

**DFS** (go deep, then back up): A → B → D (dead end, back to B) → E → F → C (F's neighbours C and E; C is unvisited).
Order: **A B D E F C**.

Both take O(V + E). BFS gives the fewest-edges distance from A (C = 1, F = 2); DFS does not.`, { viz: 'bfs' }),
    Y('kruskal-trace', 4, 5, 'Minimum spanning tree', R`A graph has edges (A,B,4), (A,C,3), (B,C,1), (B,D,2), (C,D,4), (C,E,2), (D,E,3). Find a minimum spanning tree with Kruskal's algorithm and its weight.`, R`Sorted edges: BC 1, BD 2, CE 2, AC 3, DE 3, AB 4, CD 4.

- BC (1): accept {B, C}
- BD (2): accept {B, C, D}
- CE (2): accept {B, C, D, E}
- AC (3): A is new, accept → all 5 vertices connected after 4 edges (V − 1), so stop.

The MST is **BC, BD, CE, AC with total weight 1 + 2 + 2 + 3 = 8**. (DE 3 would be rejected: D and E are already connected, it would close a cycle.)`, { viz: 'kruskal' }),
    Y('adjacency-matrix', 3, 5, 'Graph representation', R`An undirected graph on vertices 1 … 5 has the edges 1–2, 1–3, 2–3, 3–4, 4–5. Write its adjacency matrix and adjacency lists, give each degree and verify the handshake rule.`, R`**Adjacency matrix** (symmetric):

| | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| 1 | 0 | 1 | 1 | 0 | 0 |
| 2 | 1 | 0 | 1 | 0 | 0 |
| 3 | 1 | 1 | 0 | 1 | 0 |
| 4 | 0 | 0 | 1 | 0 | 1 |
| 5 | 0 | 0 | 0 | 1 | 0 |

**Adjacency lists:** 1: 2, 3;  2: 1, 3;  3: 1, 2, 4;  4: 3, 5;  5: 4.

**Degrees (row sums):** 2, 2, 3, 2, 1, sum = 10 = 2 × 5 edges (the handshake rule). The matrix uses 25 cells; the lists use V + 2E = 15 entries.`, { viz: 'bfs' }),
    Y('dijkstra-trace', 4, 5, 'Shortest path', R`Using Dijkstra's algorithm, find the shortest distance from A to every vertex of the graph with edges A–B 4, A–C 2, B–C 1, B–D 7, C–E 3, D–E 8, D–F 5, E–F 6, F–G 9.`, R`| Settled | A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|---|
| start | 0 | ∞ | ∞ | ∞ | ∞ | ∞ | ∞ |
| A (0) | 0 | 4 | 2 | ∞ | ∞ | ∞ | ∞ |
| C (2) | 0 | **3** | 2 | ∞ | 5 | ∞ | ∞ |
| B (3) | 0 | 3 | 2 | 10 | 5 | ∞ | ∞ |
| E (5) | 0 | 3 | 2 | 10 | 5 | 11 | ∞ |
| D (10) | 0 | 3 | 2 | 10 | 5 | 11 | ∞ |
| F (11) | 0 | 3 | 2 | 10 | 5 | 11 | 20 |

Distances: **A 0, B 3, C 2, D 10, E 5, F 11, G 20.** Note that A → B directly costs 4, but A → C → B costs 3. With a binary heap the time is O((V + E) log V).`, { viz: 'dijkstra' }),
    Y('topo-trace', 3, 5, 'Topological sort', R`Find a topological order of the DAG with edges 5→2, 5→0, 4→0, 4→1, 2→3, 3→1 using Kahn's algorithm.`, R`In-degrees: 0 → 2, 1 → 2, 2 → 1, 3 → 1, 4 → 0, 5 → 0. Queue the vertices of in-degree 0: [4, 5].

- Output 4: in-degree of 0 becomes 1, of 1 becomes 1.
- Output 5: in-degree of 2 becomes 0 (queue it), of 0 becomes 0 (queue it). Queue [2, 0].
- Output 2: in-degree of 3 becomes 0. Queue [0, 3].
- Output 0. Output 3: in-degree of 1 becomes 0. Output 1.

**Order: 4 5 2 0 3 1.** All six vertices were output, so the graph has no cycle. (Other valid orders exist, e.g. 5 4 2 3 1 0.)`, { viz: 'topo-kahn' }),
    Y('tree-height-leaves', 5, 5, 'Binary tree', R`Write C functions that return the height (number of nodes on the longest root-to-leaf path) and the number of leaves of a binary tree. Test them on the BST built from 50, 30, 70, 20, 40, 60, 80, 10.`, R`Both are naturally recursive. **Height:** 0 for an empty tree, otherwise 1 + max(height(left), height(right)). **Leaves:** an empty tree has none, a node without children counts as 1, otherwise the leaves of both subtrees are added. Each is O(n).

The longest path is 50 → 30 → 20 → 10 (4 nodes); the leaves are 10, 40, 60 and 80.`, { code: { c: R`#include <stdio.h>
#include <stdlib.h>

struct tnode { int data; struct tnode *left, *right; };

struct tnode *insert(struct tnode *t, int k) {
    if (!t) { t = malloc(sizeof *t); t->data = k; t->left = t->right = NULL; }
    else if (k < t->data) t->left = insert(t->left, k);
    else if (k > t->data) t->right = insert(t->right, k);
    return t;
}
int height(const struct tnode *t) {
    if (!t) return 0;
    int l = height(t->left), r = height(t->right);
    return 1 + (l > r ? l : r);
}
int leaves(const struct tnode *t) {
    if (!t) return 0;
    if (!t->left && !t->right) return 1;
    return leaves(t->left) + leaves(t->right);
}
void destroy(struct tnode *t) { if (t) { destroy(t->left); destroy(t->right); free(t); } }

int main(void) {
    int keys[] = {50, 30, 70, 20, 40, 60, 80, 10};
    struct tnode *root = NULL;
    for (int i = 0; i < 8; i++) root = insert(root, keys[i]);
    printf("height = %d\n", height(root));
    printf("leaves = %d\n", leaves(root));
    destroy(root);
    return 0;
}
` }, expect: 'height = 4\nleaves = 4\n', viz: 'bst' }),
  ]);
})();
