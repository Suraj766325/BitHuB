/* ============================================================
 * data/questions.js — previous year questions (CS263 / CS24201)
 * from the four papers in Study Material/CS24201/QPA, with worked
 * answers, plus extra practice questions written for this site
 * (ref: 'Textbook'). `code` programs have an `expect` that
 * dsa-tools/test-pyq.js checks by compiling and running them.
 * ============================================================ */
(function () {
  'use strict';
  const R = String.raw;
  const fix = (t) => t.replace(/\\`/g, '`');               // String.raw keeps the backslash of \`, so remove it
  const P = (exam, year, no, marks, module, topic, q, answer, extra) => Object.assign({ id: `${exam[0].toLowerCase()}${year}-${no.toLowerCase().replace(/[^a-z0-9]/g, '')}`, exam, year, no, marks, module, topic, q, answer: fix(answer) }, extra || {});
  const X = (id, marks, module, topic, q, answer, extra) => Object.assign({ id: 'x-' + id, exam: 'End', year: 2025, no: 'Practice', marks, module, topic, q, answer: fix(answer), ref: 'Textbook' }, extra || {});

  DSA.pyqs = [
    /* ---------------- Mid semester, Monsoon 2025 ---------------- */
    P('Mid', 2025, 'Q.1(a)', 2, 1, 'Asymptotic notation', 'Explain asymptotic notations with example.',
      R`Asymptotic notations describe how the running time f(n) of an algorithm grows for large n, ignoring constants and lower-order terms.

- **Big O, f(n) = O(g(n))**: there are constants c > 0 and n₀ such that f(n) ≤ c·g(n) for all n ≥ n₀. It is an upper bound (worst-case growth).
- **Big Omega, f(n) = Ω(g(n))**: f(n) ≥ c·g(n) for all n ≥ n₀. It is a lower bound.
- **Big Theta, f(n) = Θ(g(n))**: c₁·g(n) ≤ f(n) ≤ c₂·g(n). It is a tight bound: both O and Ω.

**Example.** f(n) = 3n² + 5n + 2. For n ≥ 6, 3n² ≤ f(n) ≤ 4n², so f(n) = Θ(n²), and therefore also O(n²) and Ω(n²). It is O(n³) too, but that bound is not tight.`, { viz: null }),
    P('Mid', 2025, 'Q.1(b)', 3, 1, 'Loop analysis', 'Analyze the time complexity of the following C function and show your complete calculation:\n```\nvoid algorithm1(int n) {\n   int i, j;\n   for (i = 1; i < n; i++) {\n      for (j = i; j < n; j++) {\n         printf("%d %d\\n", i, j);\n      }\n   }\n}\n```',
      R`Count how many times the innermost statement (the printf) runs. For a fixed i the inner loop runs j = i, i+1, …, n−1, which is (n − i) times.

Total = Σ (n − i) for i = 1 to n−1 = (n−1) + (n−2) + … + 1 = **n(n−1)/2**.

n(n−1)/2 = n²/2 − n/2, and dropping the constant and the lower-order term gives **O(n²)** (in fact Θ(n²)).

Space: only i and j are used, so O(1).`),
    P('Mid', 2025, 'Q.2(a)', 2, 1, 'Sparse matrix', 'What do you understand by Sparse Matrix?',
      R`A **sparse matrix** is a matrix in which most of the elements are zero (usually the non-zero elements are fewer than about a third of all). Storing all m × n cells wastes memory and time, so only the non-zero elements are stored, for example as **(row, column, value) triplets** preceded by a header (rows, columns, number of non-zero elements).

Triplets save memory when the number of non-zero elements k satisfies 3(k + 1) < m × n. Example: a 100 × 100 matrix with 200 non-zero elements needs 3 × 201 = 603 numbers instead of 10000.`, { viz: 'sparse' }),
    P('Mid', 2025, 'Q.2(b)', 3, 1, 'Matrix', 'Write a C Program to calculate Transpose of a matrix.',
      R`The transpose B of an m × n matrix A is the n × m matrix with B[j][i] = A[i][j]. Read the matrix, copy each element into the swapped position and print B.`,
      { code: { c: R`#include <stdio.h>

int main(void) {
    int a[10][10], b[10][10], m, n;
    printf("Rows and columns: ");
    scanf("%d %d", &m, &n);
    printf("Enter the matrix:\n");
    for (int i = 0; i < m; i++)
        for (int j = 0; j < n; j++)
            scanf("%d", &a[i][j]);

    for (int i = 0; i < m; i++)
        for (int j = 0; j < n; j++)
            b[j][i] = a[i][j];

    printf("Transpose:\n");
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < m; j++) printf("%d ", b[i][j]);
        printf("\n");
    }
    return 0;
}
` }, stdin: '2 3\n1 2 3\n4 5 6\n', expect: 'Rows and columns: Enter the matrix:\nTranspose:\n1 4 \n2 5 \n3 6 \n' }),
    P('Mid', 2025, 'Q.3(a)', 2, 2, 'Memory allocation', 'How dynamic memory allocation is different from the static memory allocation?',
      R`| | Static allocation | Dynamic allocation |
|---|---|---|
| When | at compile time | at run time |
| Size | fixed in advance (e.g. int a[100]) | decided while the program runs |
| Where | stack (or data segment) | heap |
| Release | automatic when the scope ends | by the programmer (free) |
| Functions | none needed | malloc, calloc, realloc, free |
| Risk | wasted or insufficient space | memory leaks, dangling pointers |

Linked lists, trees and graphs need dynamic allocation because the number of nodes is not known beforehand and nodes are created and freed one at a time.`, { viz: 'list' }),
    P('Mid', 2025, 'Q.3(b)', 3, 2, 'Singly linked list', 'Write a C function to insert a new node at the beginning of a singly linked list and calculate the time complexity of this operation.',
      R`A new node is created, its \`next\` is pointed at the current first node, and \`head\` is moved to the new node. Because the head is changed, the function receives the address of the head pointer (a pointer to a pointer).

**Time complexity: O(1).** The work is a fixed number of steps (one allocation and two assignments), independent of the list length.`,
      { code: { c: R`#include <stdio.h>
#include <stdlib.h>

struct Node { int data; struct Node *next; };

void insertAtBeginning(struct Node **head, int value) {
    struct Node *n = (struct Node *)malloc(sizeof(struct Node));
    if (n == NULL) return;          /* allocation failed */
    n->data = value;
    n->next = *head;                /* link to the old first node */
    *head = n;                      /* new node becomes the head */
}

int main(void) {
    struct Node *head = NULL;
    insertAtBeginning(&head, 30);
    insertAtBeginning(&head, 20);
    insertAtBeginning(&head, 10);
    for (struct Node *p = head; p; p = p->next) printf("%d ", p->data);
    printf("\n");
    while (head) { struct Node *t = head; head = head->next; free(t); }
    return 0;
}
` }, expect: '10 20 30 \n', viz: 'list' }),
    P('Mid', 2025, 'Q.4(a)', 2, 2, 'Cycle detection', 'How to check if there is a cycle present in a singly linked list? Explain the logic with suitable diagram.',
      R`Use **Floyd's tortoise and hare** algorithm. Start two pointers at the head: \`slow\` moves one node per step and \`fast\` moves two.

- If the list has no cycle, \`fast\` reaches NULL and we report "no cycle".
- If there is a cycle, both pointers end up inside it. Each step \`fast\` gains one node on \`slow\`, so the gap closes and they meet: report "cycle".

Diagram (the last node points back to the node holding 3):
\`\`\`
1 -> 2 -> 3 -> 4 -> 5
          ^         |
          |_________|
\`\`\`
Time **O(n)**, space **O(1)**. (Storing visited nodes in a hash set also works but costs O(n) space.)`, { viz: 'cycle' }),
    P('Mid', 2025, 'Q.4(b)', 3, 2, 'Doubly linked list', 'Implement a C function to delete a node from the middle of a doubly linked list given a pointer to that node. Write the complete node structure and analyze the time complexity.',
      R`Each node stores the data and two pointers, so both neighbours are reachable from the node itself. To delete the node, connect its previous and next nodes to each other and free it. No searching is needed because the node is given.

**Time complexity: O(1)**: a fixed number of pointer changes.`,
      { code: { c: R`#include <stdio.h>
#include <stdlib.h>

struct DNode {
    int data;
    struct DNode *prev;
    struct DNode *next;
};

/* nodeToDelete is not NULL and is not the only node */
void deleteMiddleNode(struct DNode *nodeToDelete) {
    if (nodeToDelete->prev != NULL)
        nodeToDelete->prev->next = nodeToDelete->next;
    if (nodeToDelete->next != NULL)
        nodeToDelete->next->prev = nodeToDelete->prev;
    free(nodeToDelete);
}

int main(void) {
    struct DNode *n[3];
    for (int i = 0; i < 3; i++) {
        n[i] = malloc(sizeof(struct DNode));
        n[i]->data = (i + 1) * 10;
        n[i]->prev = i ? n[i - 1] : NULL;
        n[i]->next = NULL;
        if (i) n[i - 1]->next = n[i];
    }
    deleteMiddleNode(n[1]);                       /* delete 20 */
    for (struct DNode *p = n[0]; p; p = p->next) printf("%d ", p->data);
    printf("\n");
    free(n[0]); free(n[2]);
    return 0;
}
` }, expect: '10 30 \n', viz: 'list' }),
    P('Mid', 2025, 'Q.5(a)', 2, 1, 'ADT', 'What do you understand by Abstract Data Type (ADT)? Explain with example',
      R`An **abstract data type** defines a data structure only by *what it does*: the set of values and the operations on them, together with what each operation guarantees, and hides *how* it is stored. The user sees only the interface.

**Example: Stack ADT.** Operations: \`push(x)\`, \`pop()\`, \`peek()\`, \`isEmpty()\`, \`isFull()\`. Rule: last in, first out. This ADT can be implemented with an array or with a linked list; programs that use only push and pop work with either, and the implementation can be changed without changing them.

Other ADTs: queue, list, priority queue, dictionary.`),
    P('Mid', 2025, 'Q.5(b)', 3, 3, 'Stack using array', 'Implement a stack using array in C and write functions for push and pop operations. Analyze the time complexity of each operation\n```\n#define MAX_SIZE 100\ntypedef struct {\n   // Complete the structure\n} Stack;\n// Functions to implement\nvoid push(Stack* stack, int value);\nint pop(Stack* stack);\n```',
      R`The structure holds the array and the index of the top element (−1 when empty). push checks for overflow first, pop checks for underflow first.

**Time complexity:** push O(1), pop O(1). Neither depends on how many elements are stored.`,
      { code: { c: R`#include <stdio.h>
#define MAX_SIZE 100

typedef struct {
    int items[MAX_SIZE];
    int top;                      /* index of the top element, -1 when empty */
} Stack;

void push(Stack *stack, int value) {
    if (stack->top == MAX_SIZE - 1) {
        printf("Stack overflow\n");
        return;
    }
    stack->items[++stack->top] = value;
}

int pop(Stack *stack) {
    if (stack->top == -1) {
        printf("Stack underflow\n");
        return -1;                /* sentinel for an empty stack */
    }
    return stack->items[stack->top--];
}

int main(void) {
    Stack s = {.top = -1};
    push(&s, 5); push(&s, 9); push(&s, 14);
    int a = pop(&s), b = pop(&s), c = pop(&s);   /* separate statements: argument order is unspecified in C */
    printf("%d %d %d\n", a, b, c);
    pop(&s);
    return 0;
}
` }, expect: '14 9 5\nStack underflow\n', viz: 'stack' }),

    /* ---------------- End semester, Monsoon 2025 ---------------- */
    P('End', 2025, 'Q.1(a)', 5, 1, 'Loop analysis', 'Calculate the time complexity of the following pseudo-code and justify your answer:\n```\nfor i = 1 to n\n   for j = 1 to n\n      if A[i] == A[j]\n         print "Found"\n```',
      R`The comparison \`A[i] == A[j]\` is the basic operation. The outer loop runs n times, and for each i the inner loop runs n times, so the comparison executes n × n = n² times. The print runs only when two elements are equal and is at most n² more steps.

**Time complexity: O(n²)** in the best, average and worst case (the loops do not stop early). It is Θ(n²).

Space: O(1), since no extra storage grows with n.

(Note: A[i] == A[j] is also true when i = j, so "Found" is always printed at least n times; a duplicate check would start the inner loop at j = i + 1, which halves the work to n(n−1)/2 but is still O(n²).)`),
    P('End', 2025, 'Q.1(b)', 5, 1, 'Master theorem', 'Solve the following recurrence relations using the Master Theorem and determine their time complexities:\n(a) T(n) = 2T(n/2) + n\n(b) T(n) = 4T(n/2) + n\n(c) T(n) = T(n/2) + 1\nFor each case, identify: the values of a, b, and f(n); which case of the Master Theorem applies; the final time complexity T(n)',
      R`For T(n) = aT(n/b) + f(n), compare f(n) with n^(log_b a).

**(a) T(n) = 2T(n/2) + n**
- a = 2, b = 2, f(n) = n, and n^(log₂2) = n¹ = n.
- f(n) = Θ(n^(log_b a)): **case 2** → T(n) = Θ(n log n).

**(b) T(n) = 4T(n/2) + n**
- a = 4, b = 2, f(n) = n, and n^(log₂4) = n².
- f(n) = n = O(n^(2−ε)) is smaller: **case 1** → T(n) = Θ(n²).

**(c) T(n) = T(n/2) + 1**
- a = 1, b = 2, f(n) = 1, and n^(log₂1) = n⁰ = 1.
- f(n) = Θ(1) = Θ(n^(log_b a)): **case 2** → T(n) = Θ(log n).

(Recurrence (a) is the one for merge sort and (c) is the one for binary search.)`),
    P('End', 2025, 'Q.2(a)', 5, 3, 'Postfix evaluation', 'Evaluate the following postfix expression using a stack and show all intermediate steps:\n12 3 4 + * 2 / 5 6 - +',
      R`Scan left to right; push operands; for an operator pop the right operand first, then the left operand, and push the result.

| Token | Action | Stack (bottom → top) |
|---|---|---|
| 12 | push | 12 |
| 3 | push | 12 3 |
| 4 | push | 12 3 4 |
| + | 3 + 4 = 7 | 12 7 |
| * | 12 × 7 = 84 | 84 |
| 2 | push | 84 2 |
| / | 84 / 2 = 42 | 42 |
| 5 | push | 42 5 |
| 6 | push | 42 5 6 |
| − | 5 − 6 = −1 | 42 −1 |
| + | 42 + (−1) = 41 | 41 |

**Result = 41.** Equivalent infix: (12 × (3 + 4)) / 2 + (5 − 6).`, { viz: 'postfix' }),
    P('End', 2025, 'Q.2(b)', 5, 3, 'Queues', 'Compare circular queue and linear queue. Discuss situations where a circular queue is preferred.',
      R`| | Linear queue | Circular queue |
|---|---|---|
| Layout | array used from index 0 to MAX−1 once | array treated as a ring: after MAX−1 comes 0 |
| rear update | rear = rear + 1 | rear = (rear + 1) % MAX |
| front update | front = front + 1 | front = (front + 1) % MAX |
| Full when | rear == MAX − 1 | (rear + 1) % MAX == front |
| Freed slots | never reused: the queue can report "full" with empty cells in front of front | reused, so no space is wasted |
| Cost | O(1) | O(1) |

**Preferred when** the queue is used continuously with items arriving and leaving all the time: CPU scheduling (round robin), print and I/O buffers, keyboard and network buffers, streaming data, traffic-light systems. These use a fixed memory budget over a long time, which a linear queue would exhaust even though few items are waiting.`, { viz: 'queue' }),
    P('End', 2025, 'Q.3(a)', 5, 2, 'Linked list vs array', 'What are the main advantages and disadvantages of using linked lists over arrays?',
      R`**Advantages of a linked list**
- **Dynamic size:** it grows and shrinks one node at a time; no size has to be fixed in advance and no memory is wasted on unused capacity.
- **Cheap insertion and deletion:** at a known position only pointers change, O(1); an array shifts O(n) elements.
- **No contiguous block** is needed, so memory fragmentation matters less.
- Easy to build other structures (stacks, queues, graphs' adjacency lists, polynomials).

**Disadvantages**
- **No random access:** reaching the i-th element takes O(i); an array does it in O(1), so binary search is not practical.
- **Extra memory** for a pointer in every node (two in a doubly linked list).
- Poor cache behaviour because nodes are scattered in memory.
- More complicated code (pointer errors, leaks, dangling pointers); traversing backwards is impossible in a singly linked list.`, { viz: 'list' }),
    P('End', 2025, 'Q.3(b)', 5, 2, 'Singly linked list', 'Write a C program to create a singly linked list with nodes containing values 10->15->23->40->45. Now, insert 35 after the node containing 23 and delete the node containing 45. Show the final linked list structure.',
      R`Build the list by appending each value at the end. To insert 35 after 23, find the node holding 23, point the new node at 23's next node, and then point 23 at the new node. To delete 45 (the last node), find the node before it, set its next to NULL and free 45.

**Final list:** 10 -> 15 -> 23 -> 35 -> 40 -> NULL`,
      { code: { c: R`#include <stdio.h>
#include <stdlib.h>

struct Node { int data; struct Node *next; };

struct Node *newNode(int v) {
    struct Node *n = malloc(sizeof(struct Node));
    n->data = v; n->next = NULL;
    return n;
}

void append(struct Node **head, int v) {
    struct Node *n = newNode(v);
    if (!*head) { *head = n; return; }
    struct Node *p = *head;
    while (p->next) p = p->next;
    p->next = n;
}

void insertAfter(struct Node *head, int key, int v) {
    for (struct Node *p = head; p; p = p->next)
        if (p->data == key) {
            struct Node *n = newNode(v);
            n->next = p->next;          /* first link the new node to the rest */
            p->next = n;                /* then link the list to the new node */
            return;
        }
}

void deleteValue(struct Node **head, int v) {
    struct Node *prev = NULL, *cur = *head;
    while (cur && cur->data != v) { prev = cur; cur = cur->next; }
    if (!cur) return;
    if (prev) prev->next = cur->next; else *head = cur->next;
    free(cur);
}

void display(struct Node *head) {
    for (struct Node *p = head; p; p = p->next) printf("%d -> ", p->data);
    printf("NULL\n");
}

int main(void) {
    struct Node *head = NULL;
    int vals[] = {10, 15, 23, 40, 45};
    for (int i = 0; i < 5; i++) append(&head, vals[i]);
    display(head);
    insertAfter(head, 23, 35);
    deleteValue(&head, 45);
    display(head);
    while (head) { struct Node *t = head; head = head->next; free(t); }
    return 0;
}
` }, expect: '10 -> 15 -> 23 -> 40 -> 45 -> NULL\n10 -> 15 -> 23 -> 35 -> 40 -> NULL\n', viz: 'list' }),
    P('End', 2025, 'Q.4(a)', 5, 5, 'BST', 'Insert the following values into a BST in the given order: 50, 30, 70, 20, 40, 60, 80. Draw the resulting tree and perform inorder traversal.',
      R`Insert each value by comparing with the root and going left (smaller) or right (larger).

\`\`\`
            50
          /    \
        30      70
       /  \    /  \
     20   40  60   80
\`\`\`

- 50 is the root. 30 < 50 → left. 70 > 50 → right. 20 < 50, < 30 → left of 30. 40 < 50, > 30 → right of 30. 60 > 50, < 70 → left of 70. 80 > 50, > 70 → right of 70.

**Inorder (left, node, right): 20 30 40 50 60 70 80**, the keys in sorted order. (Preorder: 50 30 20 40 70 60 80; postorder: 20 40 30 60 80 70 50.)`, { viz: 'tree' }),
    P('End', 2025, 'Q.4(b)', 5, 5, 'BFS', 'For the given adjacency list, perform BFS starting from vertex A and list the order of exploration:\nA → [B, C]\nB → [A, D]\nC → [A, E]\nD → [B, F]\nE → [C]\nF → [D]',
      R`BFS uses a queue. Mark A and enqueue it; repeatedly dequeue a vertex, visit it and enqueue its unvisited neighbours.

| Dequeue / visit | Enqueue | Queue after |
|---|---|---|
| A | B, C | B C |
| B | D (A is visited) | C D |
| C | E | D E |
| D | F | E F |
| E | none (C visited) | F |
| F | none | empty |

**BFS order: A, B, C, D, E, F.** Time O(V + E).`, { viz: 'graph' }),
    P('End', 2025, 'Q.5(a)', 5, 4, 'Radix sort', 'What is radix sort? Describe the concept and list its advantages over comparison-based sorting algorithms.',
      R`**Radix sort** is a non-comparison sort for integers (or fixed-length strings). It sorts the numbers digit by digit, starting from the **least significant digit** and ending with the most significant one. Each pass uses a **stable** sort (normally counting sort or ten buckets for digits 0–9), so the order produced by the earlier digits is preserved when later digits are equal.

Example: 170, 45, 75, 90, 802, 24, 2, 66
- by ones digit: 170 90 802 2 24 45 75 66
- by tens digit: 802 2 24 45 66 170 75 90
- by hundreds digit: 2 24 45 66 75 90 170 802

**Complexity:** O(d × (n + b)) for d digits in base b. Space O(n + b).

**Advantages over comparison sorts**
- No comparisons between elements, so it is not limited by the Ω(n log n) lower bound; for a fixed number of digits it runs in linear time O(n).
- Very fast for large lists of integers or short strings with a small key length.
- Stable.

**Limitations:** needs extra memory, works only on keys with digits (integers, strings), and is slower than comparison sorts when d is large compared with log n.`, { viz: 'sort' }),
    P('End', 2025, 'Q.5(b)', 5, 4, 'Heap sort', 'Explain Heap Sort. Write the heapify process for the array.',
      R`**Heap sort** uses a binary heap stored in an array (children of i are at 2i+1 and 2i+2).
1. **Build a max-heap** from the array by calling heapify on every non-leaf node, from index ⌊n/2⌋ − 1 down to 0.
2. **Repeat n − 1 times:** swap the root (the largest) with the last element of the heap, reduce the heap size by one, and heapify the root.

The array ends up sorted in ascending order.

**Heapify(i, size):** compare a[i] with its children a[2i+1] and a[2i+2]; if a child is larger, swap a[i] with the larger child and repeat for that child.

Example array 4, 10, 3, 5, 1, 8, 7: heapify index 2 (3 with children 8, 7) → swap with 8: 4 10 8 5 1 3 7. Index 1 (10 with 5, 1) is fine. Index 0 (4 with 10, 8) → swap with 10: 10 4 8 5 1 3 7, then index 1 (4 with 5, 1) → swap with 5: **10 5 8 4 1 3 7**, a max-heap.

**Complexity:** build O(n); each of the n extractions O(log n); total **O(n log n)** in all cases, O(1) extra space, not stable.`,
      { code: { c: R`#include <stdio.h>

void heapify(int a[], int size, int i) {
    int largest = i, l = 2 * i + 1, r = 2 * i + 2;
    if (l < size && a[l] > a[largest]) largest = l;
    if (r < size && a[r] > a[largest]) largest = r;
    if (largest != i) {
        int t = a[i]; a[i] = a[largest]; a[largest] = t;
        heapify(a, size, largest);
    }
}

void heapSort(int a[], int n) {
    for (int i = n / 2 - 1; i >= 0; i--) heapify(a, n, i);      /* build the max-heap */
    for (int last = n - 1; last > 0; last--) {
        int t = a[0]; a[0] = a[last]; a[last] = t;              /* largest to the end */
        heapify(a, last, 0);
    }
}

int main(void) {
    int a[] = {4, 10, 3, 5, 1, 8, 7}, n = 7;
    heapSort(a, n);
    for (int i = 0; i < n; i++) printf("%d ", a[i]);
    printf("\n");
    return 0;
}
` }, expect: '1 3 4 5 7 8 10 \n', viz: 'sort' }),

    /* ---------------- Mid semester, Monsoon 2023 ---------------- */
    P('Mid', 2023, 'Q.1(a)', 2, 1, 'Data structures', 'Differentiate between linear and non-linear data structure',
      R`| | Linear | Non-linear |
|---|---|---|
| Arrangement | elements form a sequence; each has one predecessor and one successor | an element can be connected to many others (hierarchy or network) |
| Traversal | one pass, in one run | needs a strategy: BFS, DFS, inorder, … |
| Levels | single level | multiple levels |
| Memory use | usually simple and contiguous or chained | more complex |
| Examples | array, linked list, stack, queue | tree, graph |`),
    P('Mid', 2023, 'Q.1(b)', 3, 1, 'Algorithm', 'Define an algorithm. Explain its features with the help of suitable examples',
      R`An **algorithm** is a finite, ordered set of well-defined steps that takes some input and produces the required output to solve a problem.

**Features**
- **Input:** zero or more values supplied from outside (the array in a sort).
- **Output:** at least one result (the sorted array).
- **Definiteness:** every step is clear and unambiguous ("swap a[i] and a[j]", not "arrange suitably").
- **Finiteness:** it ends after a finite number of steps for every input (a loop must make progress towards its exit).
- **Effectiveness:** each step is basic enough to be carried out exactly in finite time.

Example (largest of three numbers): input a, b, c; if a ≥ b and a ≥ c output a; else if b ≥ c output b; else output c. It has input, output, clear steps and always terminates.`),
    P('Mid', 2023, 'Q.2(a)', 2, 1, 'Polynomials', 'Explain polynomial representation using link list',
      R`Each non-zero term of a polynomial is one node holding its **coefficient**, its **exponent** and a pointer to the next node. The terms are kept in decreasing order of exponent.

5x⁴ + 3x² + 7 is stored as
\`\`\`
head -> [5|4|•]-> [3|2|•]-> [7|0|NULL]
         coef|exp|next
\`\`\`
Only non-zero terms are stored (a polynomial such as x¹⁰⁰ + 1 needs two nodes, not 101 array cells), and adding two polynomials is a merge of two lists in O(m + n).`, { viz: 'poly' }),
    P('Mid', 2023, 'Q.2(b)', 3, 1, 'Asymptotic notation', 'Define Big "oh" (O), Big Omega (Ω) and Big Theta (Θ) notations of time complexity.',
      R`- **Big O:** f(n) = O(g(n)) if there exist positive constants c and n₀ such that f(n) ≤ c·g(n) for all n ≥ n₀. g is an **upper bound**.
- **Big Omega:** f(n) = Ω(g(n)) if f(n) ≥ c·g(n) for all n ≥ n₀. g is a **lower bound**.
- **Big Theta:** f(n) = Θ(g(n)) if there are constants c₁, c₂ > 0 and n₀ with c₁·g(n) ≤ f(n) ≤ c₂·g(n) for all n ≥ n₀. g is a **tight bound**; equivalently f is both O(g) and Ω(g).

Example: 2n + 3 = O(n) (c = 3, n₀ = 3), 2n + 3 = Ω(n) (c = 2) and so 2n + 3 = Θ(n).`),
    P('Mid', 2023, 'Q.3(a)', 2, 2, 'Linked list vs array', 'Explain the advantages of link list over array?',
      R`- **Dynamic size:** grows and shrinks at run time; an array has a fixed size.
- **Efficient insertion and deletion:** only pointers change (O(1) once the position is known); an array must shift elements (O(n)).
- **No wasted memory** from over-allocating, and no need for one large contiguous block.
- **Flexible building block** for stacks, queues, polynomials, sparse matrices, graphs.

(The cost: no random access and one extra pointer per node.)`, { viz: 'list' }),
    P('Mid', 2023, 'Q.3(b)', 3, 3, 'Deque', 'Write a program to create a queue using arrays which permits insertion at both the ends',
      R`This is a **double-ended queue (deque)**. Keep the elements in an array with indices \`front\` and \`rear\`: inserting at the front moves \`front\` back by one (wrapping around), inserting at the rear moves \`rear\` forward (wrapping around). Use a circular array so that both ends can move freely.`,
      { code: { c: R`#include <stdio.h>
#define MAX 5

int dq[MAX], front = -1, rear = -1;

int isFull(void)  { return (front == 0 && rear == MAX - 1) || front == rear + 1; }
int isEmpty(void) { return front == -1; }

void insertFront(int x) {
    if (isFull()) { printf("Overflow\n"); return; }
    if (isEmpty()) front = rear = 0;
    else front = (front == 0) ? MAX - 1 : front - 1;
    dq[front] = x;
}

void insertRear(int x) {
    if (isFull()) { printf("Overflow\n"); return; }
    if (isEmpty()) front = rear = 0;
    else rear = (rear == MAX - 1) ? 0 : rear + 1;
    dq[rear] = x;
}

void display(void) {
    if (isEmpty()) { printf("Empty\n"); return; }
    for (int i = front; ; i = (i + 1) % MAX) {
        printf("%d ", dq[i]);
        if (i == rear) break;
    }
    printf("\n");
}

int main(void) {
    insertRear(20); insertRear(30);
    insertFront(10); insertFront(5);
    display();
    return 0;
}
` }, expect: '5 10 20 30 \n', viz: 'deque' }),
    P('Mid', 2023, 'Q.4(a)', 2, 1, 'Sparse matrix', 'Describe sparse matrix with example?',
      R`A sparse matrix has mostly zero elements, so storing every cell wastes space. Example (4 × 5):
\`\`\`
0 0 0 5 8
0 3 0 0 0
6 0 7 0 0
0 4 0 9 0
\`\`\`
It has only 7 non-zero values, so it is stored as triplets (row, column, value) with a header (4, 5, 7):

| row | col | value |
|---|---|---|
| 4 | 5 | 7 |
| 0 | 3 | 5 |
| 0 | 4 | 8 |
| 1 | 1 | 3 |
| 2 | 0 | 6 |
| 2 | 2 | 7 |
| 3 | 1 | 4 |
| 3 | 3 | 9 |`, { viz: 'sparse' }),
    P('Mid', 2023, 'Q.4(b)', 3, 3, 'Stack', 'Write a program to implement a stack that stores Character data.',
      R`The stack is an array of \`char\` with an index \`top\` (−1 when empty). push checks for overflow, pop checks for underflow. The program below pushes the letters of a word and pops them, which prints the word reversed.`,
      { code: { c: R`#include <stdio.h>
#include <string.h>
#define MAX 20

char stack[MAX];
int top = -1;

void push(char c) {
    if (top == MAX - 1) { printf("Overflow\n"); return; }
    stack[++top] = c;
}

char pop(void) {
    if (top == -1) { printf("Underflow\n"); return '\0'; }
    return stack[top--];
}

int main(void) {
    char word[] = "DATASTRUCTURE";
    for (size_t i = 0; i < strlen(word); i++) push(word[i]);
    printf("Reversed: ");
    while (top != -1) printf("%c", pop());
    printf("\n");
    return 0;
}
` }, expect: 'Reversed: ERUTCURTSATAD\n', viz: 'stack' }),
    P('Mid', 2023, 'Q.5(a)', 2, 2, 'Circular list', 'Compare between a circular linked list and singly linked list',
      R`| | Singly linked list | Circular linked list |
|---|---|---|
| Last node's next | NULL | points to the first node (head) |
| Traversal ends when | pointer becomes NULL | pointer returns to the starting node |
| Reach all nodes from | only the head | any node |
| Insert at end | O(n) unless a tail pointer is kept | O(1) if a pointer to the last node is kept |
| Risk | none | infinite loop if the stop condition tests for NULL |
| Used for | general lists | round-robin scheduling, repeating playlists |`, { viz: 'list' }),
    P('Mid', 2023, 'Q.5(b)', 3, 3, 'Infix to postfix', 'Convert the following infix expressions to their postfix equivalents: (1) (A-B) + C*D/E-C (2) (A- 2*(B+C)/D*E)+F',
      R`Operators wait on a stack; an operator pops those of higher or equal precedence first; "(" waits for ")".

**(1) (A−B)+C*D/E−C**

| Symbol | Stack | Output |
|---|---|---|
| ( | ( | |
| A | ( | A |
| − | ( − | A |
| B | ( − | A B |
| ) | | A B − |
| + | + | A B − |
| C | + | A B − C |
| * | + * | A B − C |
| D | + * | A B − C D |
| / | + / (pops * first) | A B − C D * |
| E | + / | A B − C D * E |
| − | − (pops / then +) | A B − C D * E / + |
| C | − | A B − C D * E / + C |
| end | | **A B − C D * E / + C −** |

**(2) (A−2*(B+C)/D*E)+F**

Result: **A 2 B C + * D / E * − F +**

(Evaluating the order: B+C first, then 2×(B+C), divided by D, times E, subtracted from A, and F added.)`, { viz: 'infix' }),

    /* ---------------- End semester, Monsoon 2023 ---------------- */
    P('End', 2023, 'Q.1(a)', 5, 1, 'Data structures', 'Differentiate between linear and non-linear data structure. Also discuss their merits and demerits.',
      R`In a **linear** data structure the elements are arranged in a sequence, each element having one predecessor and one successor (array, linked list, stack, queue). In a **non-linear** data structure an element can be linked to several others, so the data forms a hierarchy or network (tree, graph).

| | Linear | Non-linear |
|---|---|---|
| Traversal | single run, simple | needs BFS, DFS or tree traversals |
| Levels | one | many |
| Memory | efficient, easy to manage | can be used more efficiently for hierarchical data but harder to manage |
| Implementation | easy | complex |

**Merits of linear:** simple to implement and traverse, predictable memory use, arrays give O(1) access. **Demerits:** fixed size for arrays, insertion and deletion can cost O(n), cannot model hierarchy or networks naturally, search is O(n) unless sorted.

**Merits of non-linear:** model real hierarchies (file systems, organisation charts) and networks (maps, social graphs) naturally; balanced trees give O(log n) search, insertion and deletion; graphs represent many-to-many relationships. **Demerits:** complex to implement and traverse, need more memory for links, recursion or an explicit stack/queue for traversal, balanced variants need extra work to maintain.`),
    P('End', 2023, 'Q.1(b)', 5, 1, 'Asymptotic notation', 'Define Big "oh" (O), Big Omega (Ω) and Big Theta (Θ) notations of time complexity.',
      R`- **Big O (upper bound):** f(n) = O(g(n)) if ∃ c > 0, n₀ such that 0 ≤ f(n) ≤ c·g(n) for all n ≥ n₀. It describes the worst-case growth.
- **Big Omega (lower bound):** f(n) = Ω(g(n)) if ∃ c > 0, n₀ such that f(n) ≥ c·g(n) ≥ 0 for all n ≥ n₀. It describes the best-case growth.
- **Big Theta (tight bound):** f(n) = Θ(g(n)) if ∃ c₁, c₂ > 0, n₀ such that c₁·g(n) ≤ f(n) ≤ c₂·g(n) for all n ≥ n₀.

**Example:** f(n) = 3n² + 5n + 2.
- O: 3n² + 5n + 2 ≤ 4n² for n ≥ 6, so f(n) = O(n²) with c = 4, n₀ = 6.
- Ω: f(n) ≥ 3n² for all n ≥ 1, so f(n) = Ω(n²) with c = 3.
- Θ: both hold, so f(n) = Θ(n²).

Linear search: Ω(1) (key is first), O(n) (key is last). Insertion sort: Ω(n), O(n²).`),
    P('End', 2023, 'Q.2(a)', 5, 3, 'Stack', 'Explain the terms overflow and underflow in a stack. Write a program to implement a stack that stores Character data.',
      R`- **Overflow** happens when push is attempted on a stack that is already full (top == MAX − 1 for an array stack): there is no room for another element.
- **Underflow** happens when pop (or peek) is attempted on an empty stack (top == −1): there is nothing to remove.

Both must be tested before the operation, so the stack is never corrupted. Program (a menu-free version that pushes characters and shows both conditions):`,
      { code: { c: R`#include <stdio.h>
#define MAX 3

char stack[MAX];
int top = -1;

void push(char c) {
    if (top == MAX - 1) { printf("Overflow: cannot push %c\n", c); return; }
    stack[++top] = c;
    printf("Pushed %c\n", c);
}

void pop(void) {
    if (top == -1) { printf("Underflow: stack is empty\n"); return; }
    printf("Popped %c\n", stack[top--]);
}

int main(void) {
    push('A'); push('B'); push('C'); push('D');
    pop(); pop(); pop(); pop();
    return 0;
}
` }, expect: 'Pushed A\nPushed B\nPushed C\nOverflow: cannot push D\nPopped C\nPopped B\nPopped A\nUnderflow: stack is empty\n', viz: 'stack' }),
    P('End', 2023, 'Q.2(b)', 5, 3, 'Infix to postfix', 'Convert the following infix expressions to their postfix equivalents (i) (A-B) + C*D/ E-C (ii) (A- 2*(B+C)/D*E)+F',
      R`Using the stack method (operands to the output; operators wait on a stack until an operator of lower precedence or ")" arrives):

**(i) (A−B)+C*D/E−C → A B − C D * E / + C −**

**(ii) (A−2*(B+C)/D*E)+F → A 2 B C + * D / E * − F +**

Quick check of (i): inside the brackets A B −; then C*D/E (left to right, * and / equal precedence) gives C D * E /; adding gives A B − C D * E / +; finally − C gives A B − C D * E / + C −.

For the step-by-step stack table see the mid-semester 2023 question 5(b); try the converter with "Animate it".`, { viz: 'infix' }),
    P('End', 2023, 'Q.3(a)', 5, 2, 'Circular list', 'Explain the difference between a circular linked list and singly linked list.',
      R`**Singly linked list:** each node has data and a next pointer; the last node's next is **NULL**. Traversal runs from head to NULL and can start only at the head. Inserting at the end needs a walk (O(n)) unless a tail pointer is kept.

**Circular linked list:** the last node's next points back to the **first node**, so the nodes form a ring and there is no NULL. Traversal stops when the pointer returns to where it started. It can be entered from any node, and with a pointer to the last node both insertion at the front and at the end are O(1) (last.next is the head).

\`\`\`
Singly:    head -> 10 -> 20 -> 30 -> NULL
Circular:  head -> 10 -> 20 -> 30 -+
             ^---------------------+
\`\`\`
Uses: round-robin CPU scheduling, repeating playlists, multiplayer turn order. Care: a loop that tests for NULL would never end.`, { viz: 'list' }),
    P('End', 2023, 'Q.3(b)', 5, 2, 'Linked list', 'Create a linked list which stores names of the employees. Then, sort these names and re-display the contents of the linked list.',
      R`Each node stores a name (a character array) and a next pointer. Create the list, then sort it. The simplest way is **selection-style sorting by swapping the names** inside the nodes: for each node compare its name with all later nodes using \`strcmp\` and swap if a later one is smaller. (Relinking nodes is also possible but longer.) Complexity O(n²) comparisons.`,
      { code: { c: R`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct Node { char name[30]; struct Node *next; };

struct Node *append(struct Node *head, const char *name) {
    struct Node *n = malloc(sizeof(struct Node));
    strncpy(n->name, name, sizeof n->name - 1);
    n->name[sizeof n->name - 1] = '\0';
    n->next = NULL;
    if (!head) return n;
    struct Node *p = head;
    while (p->next) p = p->next;
    p->next = n;
    return head;
}

void sortList(struct Node *head) {
    for (struct Node *i = head; i; i = i->next)
        for (struct Node *j = i->next; j; j = j->next)
            if (strcmp(i->name, j->name) > 0) {
                char tmp[30];
                strcpy(tmp, i->name); strcpy(i->name, j->name); strcpy(j->name, tmp);
            }
}

void display(struct Node *head) {
    for (struct Node *p = head; p; p = p->next) printf("%s%s", p->name, p->next ? ", " : "\n");
}

int main(void) {
    const char *names[] = {"Rohan", "Meera", "Karan", "Anita", "Vikram"};
    struct Node *head = NULL;
    for (int i = 0; i < 5; i++) head = append(head, names[i]);
    printf("Before: "); display(head);
    sortList(head);
    printf("After:  "); display(head);
    while (head) { struct Node *t = head; head = head->next; free(t); }
    return 0;
}
` }, expect: 'Before: Rohan, Meera, Karan, Anita, Vikram\nAfter:  Anita, Karan, Meera, Rohan, Vikram\n', viz: 'list' }),
    P('End', 2023, 'Q.4(a)', 5, 5, 'BST', 'Create a binary search tree with the input given below: 96, 2, 46, 12, 54, 4, 65, 23, 87, 23, 54, 45',
      R`Insert in the given order; going left for a smaller key and right for a larger one. The repeated keys 23 and 54 are **ignored** (a BST normally holds distinct keys; if duplicates must be kept, send them consistently to the right).

\`\`\`
96
└─ (left) 2
          └─ (right) 46
                     ├─ (left) 12
                     │         ├─ (left) 4
                     │         └─ (right) 23
                     │                    └─ (right) 45
                     └─ (right) 54
                                └─ (right) 65
                                           └─ (right) 87
\`\`\`
**Inorder:** 2 4 12 23 45 46 54 65 87 96 (sorted). **Preorder:** 96 2 46 12 4 23 45 54 65 87. The tree has height 6 (levels), a lop-sided shape because the input is nearly ordered; a balanced (AVL) tree would have 4 levels.`, { viz: 'tree' }),
    P('End', 2023, 'Q.4(b)', 5, 5, 'B-tree', 'Create a B Tree of order 5 for following data arriving in sequences: 92, 27, 7, 9, 16, 21, 3, 4, 16, 11, 21, 71',
      R`A B-tree of **order 5** has at most **4 keys** and 5 children per node and at least 2 keys per node except the root. When a node gets a fifth key it **splits**: the middle key moves up. Duplicate keys (16 and 21 appear again) are ignored.

1. Insert 92, 27, 7, 9: one node \`[7 9 27 92]\`.
2. Insert 16: \`[7 9 16 27 92]\` is too big. Split at the median 16: root \`[16]\` with children \`[7 9]\` and \`[27 92]\`.
3. Insert 21 → \`[21 27 92]\`. Insert 3 → \`[3 7 9]\`. Insert 4 → \`[3 4 7 9]\`.
4. 16 again: ignored.
5. Insert 11 into the left child: \`[3 4 7 9 11]\` overflows. Median 7 moves up: root \`[7 16]\`, children \`[3 4]\`, \`[9 11]\`, \`[21 27 92]\`.
6. 21 again: ignored. Insert 71 → rightmost leaf \`[21 27 71 92]\`.

**Final tree**
\`\`\`
                  [ 7 | 16 ]
                 /     |      \
          [3 4]    [9 11]    [21 27 71 92]
\`\`\``),
    P('End', 2023, 'Q.5(a)', 5, 5, 'Graph', 'What is a graph? Explain its key terms.',
      R`A **graph** G = (V, E) consists of a set V of **vertices** (nodes) and a set E of **edges** that connect pairs of vertices. It models networks: roads between cities, links between web pages, friendships.

**Key terms**
- **Directed / undirected graph:** edges have a direction (A→B) or not (A–B).
- **Weighted graph:** each edge has a cost or length.
- **Adjacent vertices:** joined by an edge. **Degree:** number of edges at a vertex (in-degree and out-degree in a directed graph).
- **Path:** a sequence of vertices with an edge between each consecutive pair. **Cycle:** a path that starts and ends at the same vertex. A graph with no cycle is **acyclic** (a DAG if directed).
- **Connected graph:** every vertex can be reached from every other. A **connected component** is a maximal connected part.
- **Complete graph:** an edge between every pair of vertices (n(n−1)/2 edges). **Subgraph, loop, parallel edges.**
- **Tree:** a connected acyclic graph. **Spanning tree:** a subgraph that is a tree containing all vertices (V − 1 edges).

**Representations:** adjacency matrix (V × V, O(V²) space) and adjacency list (O(V + E) space).`, { viz: 'graph' }),
    P('End', 2023, 'Q.5(b)', 5, 4, 'Quick sort', 'If the following sequence of numbers is to be sorted using quick sort, then show the iterations of the sorting process.\n42, 32, 73, 21, 19, 18, 88, 65, 74',
      R`The first element of each sub-list is the pivot. Scan from the right for an element smaller than the pivot and swap; scan from the left for one larger and swap; repeat until the scans meet. The pivot is then in its final position and both sides are sorted the same way.

**Pass 1:** pivot 42 on 42 32 73 21 19 18 88 65 74.
- Right scan stops at 18 (18 < 42): swap → 18 32 73 21 19 **42** 88 65 74.
- Left scan stops at 73 (73 > 42): swap → 18 32 42 21 19 73 88 65 74.
- Right scan stops at 19: swap → 18 32 19 21 42 73 88 65 74. The scans meet: 42 is in place (index 4).
- Left sub-list: 18 32 19 21. Right sub-list: 73 88 65 74.

**Left sub-list** 18 32 19 21: pivot 18 is already the smallest → stays; remaining 32 19 21: pivot 32: swap with 21 → 21 19 32, so 32 is final; then 21 19: pivot 21, swap with 19 → 19 21. Left side is now **18 19 21 32**.

**Right sub-list** 73 88 65 74 (pivot 73): the right scan skips 74 and stops at 65; swap → 65 88 73 74. The left scan skips 65 and stops at 88; swap → 65 73 88 74. 73 is final. The remaining sub-list 88 74 has pivot 88, which swaps with 74 → 74 88.

**Sorted: 18 19 21 32 42 65 73 74 88.**

Partition results in order: [0..8] pivot final at 4 → [0..3] → [1..3] → [1..2] → [5..8] pivot final at 6 → [7..8]. Average case O(n log n); worst case O(n²).`, { viz: 'sort' }),

    /* ---------------- extra practice, written for this site ---------------- */
    X('loop-doubling', 3, 1, 'Loop analysis', 'Find the time complexity:\n```\nfor (i = 1; i < n; i = i * 2)\n    for (j = 0; j < i; j++)\n        count++;\n```',
      R`The outer loop runs with i = 1, 2, 4, 8, …, up to about n, which is ⌊log₂ n⌋ + 1 values. For each i the inner loop runs i times, so the total is 1 + 2 + 4 + … + 2^k with 2^k ≈ n, a geometric series equal to 2^(k+1) − 1 < 2n.

**Time complexity: O(n)**, not O(n log n): most of the work is done by the last few values of i.`),
    X('row-major', 3, 1, 'Arrays', 'An array A[10][5] of 4-byte integers is stored in row-major order with base address 1000 and indices starting at 0. Find the address of A[3][2]. What would it be in column-major order?',
      R`Row-major: address = base + (i × columns + j) × size = 1000 + (3 × 5 + 2) × 4 = 1000 + 17 × 4 = **1068**.

Column-major: address = base + (j × rows + i) × size = 1000 + (2 × 10 + 3) × 4 = 1000 + 23 × 4 = **1092**.`),
    X('theta-proof', 3, 1, 'Asymptotic notation', 'Show that 3n² + 5n + 2 = Θ(n²).',
      R`We need constants c₁, c₂ and n₀ with c₁n² ≤ 3n² + 5n + 2 ≤ c₂n² for all n ≥ n₀.

- Lower bound: 3n² + 5n + 2 ≥ 3n² for all n ≥ 1, so c₁ = 3.
- Upper bound: for n ≥ 6, 5n + 2 ≤ n² (because 5n + 2 ≤ 5n + n = 6n ≤ n·n), hence 3n² + 5n + 2 ≤ 4n², so c₂ = 4.

Both hold with n₀ = 6, so 3n² + 5n + 2 = Θ(n²).`),
    X('reverse-list', 5, 2, 'Singly linked list', 'Write a function to reverse a singly linked list and state its time and space complexity.',
      R`Use three pointers: \`prev\` (initially NULL), \`cur\` (initially head) and \`next\`. For each node save \`cur->next\`, point \`cur->next\` at \`prev\`, and move \`prev\` and \`cur\` one node ahead. At the end \`prev\` is the new head.

\`\`\`
struct Node *reverse(struct Node *head) {
    struct Node *prev = NULL, *cur = head;
    while (cur != NULL) {
        struct Node *next = cur->next;   /* remember the rest */
        cur->next = prev;                /* turn the arrow around */
        prev = cur;
        cur = next;
    }
    return prev;                         /* new head */
}
\`\`\`
**Time O(n)** (one pass), **space O(1)**.`, { viz: 'list' }),
    X('circ-count', 2, 3, 'Circular queue', 'A circular queue of size 5 has front = 3 and rear = 1. How many elements does it hold? Can another element be inserted?',
      R`The queue wraps around: occupied slots are 3, 4, 0, 1, which is (rear − front + MAX) % MAX + 1 = (1 − 3 + 5) % 5 + 1 = **4 elements**.

The queue is full when (rear + 1) % MAX == front: (1 + 1) % 5 = 2, which is not 3, so one more element **can** be inserted, at index 2.`, { viz: 'queue' }),
    X('postfix-2', 3, 3, 'Expressions', 'Convert (a + b) * (c − d) / e to postfix and evaluate it for a = 6, b = 2, c = 9, d = 5, e = 4.',
      R`Postfix: **a b + c d − * e /**

Evaluate with a = 6, b = 2, c = 9, d = 5, e = 4: 6 2 + → 8; 9 5 − → 4; 8 4 * → 32; then 32 4 / → **8**.`, { viz: 'infix' }),
    X('bsearch-count', 2, 4, 'Searching', 'What is the maximum number of comparisons binary search needs on a sorted array of 1000 elements?',
      R`Each comparison halves the range. After k comparisons at most n / 2^k elements remain, so the search ends after at most ⌊log₂ n⌋ + 1 comparisons.

⌊log₂ 1000⌋ + 1 = 9 + 1 = **10 comparisons** (compare with linear search: up to 1000).`, { viz: 'search' }),
    X('hash-probe', 4, 4, 'Hashing', 'Insert the keys 12, 25, 36, 47, 58 into a hash table of size 11 using h(k) = k mod 11 and linear probing. Show the table.',
      R`- 12 mod 11 = 1 → slot 1.
- 25 mod 11 = 3 → slot 3.
- 36 mod 11 = 3: occupied (collision) → try 4 → slot 4.
- 47 mod 11 = 3: slots 3 and 4 occupied → slot 5.
- 58 mod 11 = 3: slots 3, 4, 5 occupied → slot 6.

| slot | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7–10 |
|---|---|---|---|---|---|---|---|---|
| key | | 12 | | 25 | 36 | 47 | 58 | |

Keys that hash to the same slot pile up into a run (**primary clustering**), which makes later probes longer.`, { viz: 'hash' }),
    X('stable', 2, 4, 'Sorting', 'What is a stable sorting algorithm? Name two stable and two unstable sorts.',
      R`A sorting algorithm is **stable** if records with equal keys appear in the sorted output in the same relative order as in the input. It matters when sorting by one field after another (for example by marks and then by name).

- **Stable:** bubble sort, insertion sort, merge sort, radix sort (and counting sort).
- **Unstable:** selection sort (the long swap can jump over an equal key), quick sort, heap sort.`),
    X('tree-height', 3, 5, 'Binary trees', 'What is the maximum number of nodes in a binary tree of height h (the root is at level 0)? What is the minimum height of a binary tree with 31 nodes?',
      R`Level i holds at most 2ⁱ nodes, so the maximum number of nodes is 2⁰ + 2¹ + … + 2ʰ = **2^(h+1) − 1**.

For 31 nodes: 2^(h+1) − 1 ≥ 31 gives 2^(h+1) ≥ 32, so h + 1 ≥ 5 and the minimum height is **h = 4**. (A complete tree of 31 nodes has exactly 5 full levels.)`),
    X('tree-build', 5, 5, 'Tree traversals', 'The preorder traversal of a binary tree is A B D E C F and its inorder traversal is D B E A F C. Construct the tree and give its postorder traversal.',
      R`The first preorder element **A** is the root. In the inorder list everything left of A (D B E) is the left subtree and everything right (F C) is the right subtree.

- Left subtree: preorder B D E, inorder D B E → root **B**, with D on its left and E on its right.
- Right subtree: preorder C F, inorder F C → root **C**, with F on its left.

\`\`\`
        A
      /   \
     B     C
    / \   /
   D   E F
\`\`\`
**Postorder (left, right, node): D E B F C A.**`, { viz: 'tree' }),
    X('mst-edges', 2, 5, 'Spanning tree', 'How many edges does a spanning tree of a connected graph with 10 vertices have? Why does Kruskal\'s algorithm never create a cycle?',
      R`A spanning tree of a connected graph with V vertices has exactly **V − 1 = 9 edges**: fewer would leave a vertex disconnected, more would create a cycle.

Kruskal adds an edge only when its two end vertices are in **different components** (checked with find in a disjoint set). An edge inside one component would close a cycle, so it is skipped.`, { viz: 'graph' }),
    X('avl-insert', 5, 5, 'AVL tree', 'Insert 14, 17, 11, 7, 53, 4 into an empty AVL tree and show every rotation.',
      R`- Insert 14, 17, 11: balanced (root 14, children 11 and 17).
- Insert 7: left of 11. Balanced (heights differ by 1 at the root).
- Insert 53: right of 17. Balanced.
- Insert 4: left of 7. Node 11 now has balance factor +2 (left height 2, right height 0) and the new key went to the left of the left child: **LL case → right rotation at 11**. Node 7 becomes the parent of 4 and 11.

\`\`\`
         14
       /    \
      7      17
     / \       \
    4   11      53
\`\`\`
Preorder: 14 7 4 11 17 53. Height 3, with every balance factor in {−1, 0, +1}.`, { viz: 'tree' }),
  ];
})();
