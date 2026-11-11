/* ============================================================
 * data/studynotes2.js — written study notes, module 3
 * (same notation as studynotes1.js).
 * ============================================================ */
(function () {
  'use strict';
  DSA.studyNotes = DSA.studyNotes || {};
  const N = (s) => s.replace(/~~~/g, '```').replace(/«([^»]+)»/g, '`$1`').replace(/^\n/, '');
  const note = (id, title, extra, body) => Object.assign({ id, title, body: N(body) }, extra);

  DSA.studyNotes[3] = [
    note('stack', 'Stack (array and linked list)', { viz: 'stack', algos: true }, String.raw`
A **stack** is a linear structure in which insertion and deletion happen at one end only, the **top**. The last element pushed is the first one popped: **LIFO** (last in, first out). Think of a pile of plates.

### Operations (all O(1))
| Operation | Meaning |
|---|---|
| push(x) | place x on top; **overflow** if the stack is full |
| pop() | remove and return the top; **underflow** if the stack is empty |
| peek() / top() | read the top without removing it |
| isEmpty(), isFull() | state tests |

### Array implementation
~~~c
#define MAX 100
int s[MAX], top = -1;                     /* top = -1 means empty */
void push(int x) { if (top == MAX - 1) puts("overflow"); else s[++top] = x; }
int  pop(void)   { if (top == -1) { puts("underflow"); return -1; } return s[top--]; }
~~~
Simple and fast, but the capacity is fixed.

### Linked-list implementation
Push and pop at the **head** of a singly linked list: both O(1), and the stack grows as long as memory lasts. There is no overflow test, only an underflow test (head == NULL).

### Choosing
Array: fixed known size, least memory per element. Linked list: unknown size, one extra pointer per element.

### Applications
Function call stack, undo, expression evaluation, bracket matching, converting infix to postfix, backtracking, depth-first search, reversing a string.
`),
    note('queue', 'Queue (array and linked list)', { viz: 'queue', algos: true }, String.raw`
A **queue** inserts at one end (the **rear**) and deletes from the other end (the **front**): **FIFO** (first in, first out), like a ticket counter.

### Operations (all O(1))
- **enqueue(x):** add at the rear. **dequeue():** remove from the front. **front()**, **isEmpty()**, **isFull()**.

### Simple array queue
~~~c
int q[MAX], front = 0, rear = -1;
void enqueue(int x) { if (rear == MAX - 1) puts("full"); else q[++rear] = x; }
int  dequeue(void)  { if (front > rear) { puts("empty"); return -1; } return q[front++]; }
~~~
**Problem:** after some dequeues the front part of the array is wasted, and the queue reports "full" even though there is room at the start. This is the reason for the circular queue.

### Linked-list implementation
Keep **front** and **rear** pointers. Enqueue at the rear (rear->next = new; rear = new), dequeue from the front. Both O(1), no fixed capacity. When the last element is removed, set both pointers to NULL.

### Applications
CPU and printer scheduling, buffers (keyboard, network packets), breadth-first search, level-order tree traversal, simulation of waiting lines.
`),
    note('circular-queue', 'Circular queue and variants', { viz: 'queue' }, String.raw`
### Circular queue
Treat the array as a circle: after index MAX − 1 the next position is 0. The positions are computed with modulo arithmetic, so freed space at the front is **reused**.

~~~c
void enqueue(int x) {
    if ((rear + 1) % MAX == front) { puts("full"); return; }
    rear = (rear + 1) % MAX;  q[rear] = x;
}
int dequeue(void) {
    if (front == rear) { puts("empty"); return -1; }      /* one slot is kept empty */
    front = (front + 1) % MAX;  return q[front];
}
~~~
With front == rear meaning "empty", one slot is left unused so that "full" and "empty" can be told apart (the alternative is to keep a count of the elements). Capacity is **MAX − 1**.

### Double-ended queue (deque)
Insertion and deletion are allowed at **both** ends. Two restricted forms:
- **Input-restricted:** insert at one end only, delete at both.
- **Output-restricted:** delete at one end only, insert at both.
A deque can act as a stack (use one end) or as a queue (use both ends one way).

### Priority queue
Each element has a **priority**; the element with the highest priority is removed first, whatever order they arrived in (equal priorities usually leave in arrival order). An unsorted array gives O(1) insert and O(n) delete; a sorted array gives O(n) insert and O(1) delete; a **heap** gives O(log n) for both (Module 5). Used in CPU scheduling, Dijkstra's and Prim's algorithms, Huffman coding.
`),
    note('polish', 'Infix, prefix and postfix expressions', { viz: 'infix', algos: true }, String.raw`
The usual way of writing expressions, **infix** (A + B), needs precedence rules and brackets. Compilers convert it to **postfix** (A B +) or **prefix** (+ A B), which need neither.

| Infix | Prefix (Polish) | Postfix (reverse Polish) |
|---|---|---|
| A + B | + A B | A B + |
| A + B * C | + A * B C | A B C * + |
| (A + B) * C | * + A B C | A B + C * |
| A * (B + C) / D | / * A + B C D | A B C + * D / |

### Operator precedence (high to low)
1. ^ (exponent, right to left)  2. * / %  3. + −  Equal precedence is evaluated left to right, except ^.

### Infix to postfix with a stack
Scan the expression left to right:
1. **Operand:** append it to the output.
2. **( :** push it.
3. **) :** pop to the output until the matching ( is found; discard both brackets.
4. **Operator:** while the stack top is an operator of higher or equal precedence (for ^, strictly higher), pop it to the output; then push the new operator.
5. At the end pop everything left.

Example: A + B * C. Output A; push +; output B; * has higher precedence than +, so push; output C; end: pop * then +. Result **A B C * +**.

### Evaluating postfix
Scan left to right: push every **operand**; for an **operator**, pop two values (the first popped is the **right** operand), apply, push the result. The one value left is the answer.

Example: 5 3 2 * + 4 − → push 5, 3, 2; * gives 6; + gives 11; push 4; − gives 7.

### Why it works
Postfix has no ambiguity: the order of the symbols already encodes the order of evaluation. Both conversion and evaluation run in **O(n)**.
`),
    note('stack-apps', 'More applications of stacks', { viz: 'parens' }, String.raw`
### Balanced brackets
Push every opening bracket. On a closing bracket the stack top must be its partner (pop it); otherwise the string is unbalanced. At the end the stack must be empty. O(n).

### Reversing
Push every character, then pop them: they come out reversed. The same idea reverses a linked list's order or checks a palindrome.

### Recursion and the call stack
Every function call pushes a frame (parameters, locals, return address); a return pops it. Any recursion can be rewritten with an explicit stack.

### Next greater element and monotonic stacks
To find, for every element, the next larger one to its right, keep a stack of indices whose answer is pending. Each element is pushed and popped once, so the whole scan is O(n). This pattern solves many "daily temperatures" style problems.

### Depth-first search and backtracking
DFS uses a stack of vertices still to be explored; backtracking (mazes, N-queens) uses the call stack to undo choices.
`),
    note('hanoi', 'Tower of Hanoi', { viz: 'hanoi', algos: true }, String.raw`
Three pegs (source A, auxiliary B, destination C) and n discs of different sizes stacked on A, smallest on top. Move all discs to C, one at a time, never placing a larger disc on a smaller one.

### The recursive idea
To move n discs from A to C:
1. move the top n − 1 discs from A to B (using C as the spare);
2. move the largest disc from A to C;
3. move the n − 1 discs from B to C (using A as the spare).

~~~c
void hanoi(int n, char from, char to, char via) {
    if (n == 0) return;
    hanoi(n - 1, from, via, to);
    printf("move disc %d from %c to %c\n", n, from, to);
    hanoi(n - 1, via, to, from);
}
~~~

### Analysis
T(n) = 2T(n − 1) + 1 with T(0) = 0, so **T(n) = 2ⁿ − 1** moves: 3 discs need 7 moves, 10 discs need 1023, 64 discs need about 1.8 × 10¹⁹. The minimum is 2ⁿ − 1, so the algorithm is optimal. The recursion depth is n, so space is O(n).
`),
  ];
})();
