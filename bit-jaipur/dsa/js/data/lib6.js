/* data/lib6.js — more exam algorithms (merging, matrices, linked stacks and queues, priority queue, first-element
 * quick sort, recursive binary search, linear probing, tree traversals and metrics, Prim, Dijkstra, topological sort).
 * Appended to the module lists of lib1–lib5. Every program is compiled and run by dsa-tools/test-library.js. */
(function () {
  'use strict';
  const R = String.raw;
  const add = (n, list) => { DSA.library[n] = (DSA.library[n] || []).concat(list); };

  add(1, [
    {
      id: 'matrix-multiply', title: 'Matrix multiplication', summary: 'C = A × B with three nested loops.', tags: ['Arrays', 'Matrix'], time: 'O(n³)', best: 'O(n³)', space: 'O(n²)',
      idea: 'Entry C[i][j] is the dot product of row i of A and column j of B. A (m × n) times B (n × p) gives C (m × p).',
      steps: ['For each i and j, set C[i][j] = 0.', 'For each k, add A[i][k] × B[k][j] to C[i][j].'],
      note: 'The inner product costs n multiplications, and there are m × p entries, so the total is O(m·n·p), which is O(n³) for square matrices. Strassen\'s method lowers this to about O(n^2.81).',
      pseudo: ['for i = 0 to m - 1:', '  for j = 0 to p - 1:', '    C[i][j] = 0', '    for k = 0 to n - 1:', '      C[i][j] = C[i][j] + A[i][k] * B[k][j]'],
      expect: '19 22\n43 50\n',
      code: {
        c: R`#include <stdio.h>

int main(void) {
    int a[2][2] = {{1, 2}, {3, 4}}, b[2][2] = {{5, 6}, {7, 8}}, c[2][2];
    for (int i = 0; i < 2; i++)
        for (int j = 0; j < 2; j++) {
            c[i][j] = 0;
            for (int k = 0; k < 2; k++) c[i][j] += a[i][k] * b[k][j];
        }
    for (int i = 0; i < 2; i++) printf("%d %d\n", c[i][0], c[i][1]);
    return 0;
}
`,
        cpp: R`#include <iostream>
using namespace std;

int main() {
    int a[2][2] = {{1, 2}, {3, 4}}, b[2][2] = {{5, 6}, {7, 8}}, c[2][2];
    for (int i = 0; i < 2; i++)
        for (int j = 0; j < 2; j++) {
            c[i][j] = 0;
            for (int k = 0; k < 2; k++) c[i][j] += a[i][k] * b[k][j];
        }
    for (int i = 0; i < 2; i++) cout << c[i][0] << " " << c[i][1] << "\n";
    return 0;
}
`,
        java: R`public class Main {
    public static void main(String[] args) {
        int[][] a = {{1, 2}, {3, 4}}, b = {{5, 6}, {7, 8}}, c = new int[2][2];
        for (int i = 0; i < 2; i++)
            for (int j = 0; j < 2; j++)
                for (int k = 0; k < 2; k++) c[i][j] += a[i][k] * b[k][j];
        for (int i = 0; i < 2; i++) System.out.println(c[i][0] + " " + c[i][1]);
    }
}
`,
        py: R`a = [[1, 2], [3, 4]]
b = [[5, 6], [7, 8]]
c = [[0] * 2 for _ in range(2)]
for i in range(2):
    for j in range(2):
        for k in range(2):
            c[i][j] += a[i][k] * b[k][j]
for row in c:
    print(*row)
`,
      },
    },
  ]);

  add(2, [
    {
      id: 'll-merge-sorted', title: 'Merge two sorted linked lists', summary: 'Splice two sorted lists into one sorted list.', tags: ['Linked list', 'Merging'], time: 'O(m + n)', best: 'O(min(m, n))', space: 'O(1)',
      idea: 'Compare the front nodes of the two lists, append the smaller to the result and advance that list. When one list ends, attach the rest of the other. No new nodes are created: only pointers change.',
      steps: ['Use a dummy head so the first node is not a special case.', 'While both lists are non-empty, link the smaller front node to the tail.', 'Attach the remaining list.'],
      note: 'This is the merge step of merge sort, done on lists, and the reason merge sort is the natural sort for linked lists.',
      pseudo: ['dummy = new node; tail = dummy', 'while p != NULL and q != NULL:', '  if p.val <= q.val: tail.next = p; p = p.next', '  else: tail.next = q; q = q.next', '  tail = tail.next', 'tail.next = (p != NULL) ? p : q', 'return dummy.next'],
      expect: '1 2 3 4 5 6 8\n',
      code: {
        c: R`#include <stdio.h>
#include <stdlib.h>

struct node { int val; struct node *next; };

struct node *build(const int *v, int n) {
    struct node dummy = {0, NULL}, *t = &dummy;
    for (int i = 0; i < n; i++) { t->next = malloc(sizeof(struct node)); t = t->next; t->val = v[i]; t->next = NULL; }
    return dummy.next;
}

struct node *merge(struct node *p, struct node *q) {
    struct node dummy = {0, NULL}, *tail = &dummy;
    while (p && q) {
        if (p->val <= q->val) { tail->next = p; p = p->next; }
        else { tail->next = q; q = q->next; }
        tail = tail->next;
    }
    tail->next = p ? p : q;
    return dummy.next;
}

int main(void) {
    int x[] = {1, 3, 5}, y[] = {2, 4, 6, 8};
    struct node *m = merge(build(x, 3), build(y, 4));
    for (struct node *p = m; p; p = p->next) printf(p == m ? "%d" : " %d", p->val);
    printf("\n");
    while (m) { struct node *t = m->next; free(m); m = t; }
    return 0;
}
`,
        cpp: R`#include <iostream>
using namespace std;

struct Node { int val; Node *next; Node(int v) : val(v), next(nullptr) {} };

Node *build(initializer_list<int> v) {
    Node dummy(0), *t = &dummy;
    for (int x : v) { t->next = new Node(x); t = t->next; }
    return dummy.next;
}

Node *mergeLists(Node *p, Node *q) {
    Node dummy(0), *tail = &dummy;
    while (p && q) {
        if (p->val <= q->val) { tail->next = p; p = p->next; }
        else { tail->next = q; q = q->next; }
        tail = tail->next;
    }
    tail->next = p ? p : q;
    return dummy.next;
}

int main() {
    Node *m = mergeLists(build({1, 3, 5}), build({2, 4, 6, 8}));
    for (Node *p = m; p; ) { cout << p->val << (p->next ? " " : "\n"); Node *t = p->next; delete p; p = t; }
    return 0;
}
`,
        java: R`public class Main {
    static class Node { int val; Node next; Node(int v) { val = v; } }

    static Node build(int... v) {
        Node dummy = new Node(0), t = dummy;
        for (int x : v) { t.next = new Node(x); t = t.next; }
        return dummy.next;
    }

    static Node merge(Node p, Node q) {
        Node dummy = new Node(0), tail = dummy;
        while (p != null && q != null) {
            if (p.val <= q.val) { tail.next = p; p = p.next; }
            else { tail.next = q; q = q.next; }
            tail = tail.next;
        }
        tail.next = p != null ? p : q;
        return dummy.next;
    }

    public static void main(String[] args) {
        Node m = merge(build(1, 3, 5), build(2, 4, 6, 8));
        StringBuilder sb = new StringBuilder();
        for (Node p = m; p != null; p = p.next) sb.append(p == m ? "" : " ").append(p.val);
        System.out.println(sb);
    }
}
`,
        py: R`class Node:
    def __init__(self, val):
        self.val, self.next = val, None


def build(values):
    dummy = tail = Node(0)
    for v in values:
        tail.next = Node(v)
        tail = tail.next
    return dummy.next


def merge(p, q):
    dummy = tail = Node(0)
    while p and q:
        if p.val <= q.val:
            tail.next, p = p, p.next
        else:
            tail.next, q = q, q.next
        tail = tail.next
    tail.next = p or q
    return dummy.next


m = merge(build([1, 3, 5]), build([2, 4, 6, 8]))
out = []
while m:
    out.append(m.val)
    m = m.next
print(*out)
`,
      },
    },
  ]);

  add(3, [
    {
      id: 'stack-linked-list', title: 'Stack using a linked list', summary: 'Push and pop at the head of a singly linked list.', tags: ['Stack', 'Linked list'], time: 'O(1)', best: 'O(1)', space: 'O(n)',
      idea: 'The top of the stack is the head of the list. Push creates a node that points to the old head; pop removes the head. There is no fixed capacity, only an underflow test.',
      steps: ['push: new->next = top; top = new.', 'pop: if top == NULL, underflow; else save top->data, move top forward, free the node.', 'peek: top->data.'],
      note: 'Compared with the array stack, memory grows on demand but each element carries a pointer.',
      pseudo: ['push(x): n = new node(x); n.next = top; top = n', 'pop(): if top == NULL: underflow', '  x = top.data; top = top.next; return x', 'peek(): return top.data'],
      expect: 'Popped 30\nTop is 20\nSize 2\n',
      code: {
        c: R`#include <stdio.h>
#include <stdlib.h>

struct node { int data; struct node *next; };
struct node *top = NULL;
int size = 0;

void push(int x) {
    struct node *n = malloc(sizeof *n);
    n->data = x; n->next = top; top = n; size++;
}

int pop(void) {
    if (!top) { printf("Underflow\n"); return -1; }
    struct node *t = top; int x = t->data;
    top = t->next; free(t); size--;
    return x;
}

int main(void) {
    push(10); push(20); push(30);
    printf("Popped %d\n", pop());
    printf("Top is %d\n", top->data);
    printf("Size %d\n", size);
    while (top) pop();
    return 0;
}
`,
        cpp: R`#include <iostream>
using namespace std;

struct Node { int data; Node *next; };

class Stack {
    Node *top = nullptr;
    int count = 0;
public:
    void push(int x) { top = new Node{x, top}; count++; }
    int pop() {
        if (!top) { cout << "Underflow\n"; return -1; }
        Node *t = top; int x = t->data;
        top = t->next; delete t; count--;
        return x;
    }
    int peek() const { return top->data; }
    int size() const { return count; }
    ~Stack() { while (top) pop(); }
};

int main() {
    Stack s;
    s.push(10); s.push(20); s.push(30);
    cout << "Popped " << s.pop() << "\n";
    cout << "Top is " << s.peek() << "\n";
    cout << "Size " << s.size() << "\n";
    return 0;
}
`,
        java: R`public class Main {
    static class Node { int data; Node next; Node(int d, Node n) { data = d; next = n; } }
    static Node top = null;
    static int size = 0;

    static void push(int x) { top = new Node(x, top); size++; }

    static int pop() {
        if (top == null) { System.out.println("Underflow"); return -1; }
        int x = top.data;
        top = top.next; size--;
        return x;
    }

    public static void main(String[] args) {
        push(10); push(20); push(30);
        System.out.println("Popped " + pop());
        System.out.println("Top is " + top.data);
        System.out.println("Size " + size);
    }
}
`,
        py: R`class Node:
    def __init__(self, data, nxt):
        self.data, self.next = data, nxt


top, size = None, 0


def push(x):
    global top, size
    top = Node(x, top)
    size += 1


def pop():
    global top, size
    if top is None:
        print("Underflow")
        return -1
    x = top.data
    top = top.next
    size -= 1
    return x


push(10)
push(20)
push(30)
print("Popped", pop())
print("Top is", top.data)
print("Size", size)
`,
      },
    },
    {
      id: 'queue-linked-list', title: 'Queue using a linked list', summary: 'Enqueue at the rear, dequeue from the front, both O(1).', tags: ['Queue', 'Linked list'], time: 'O(1)', best: 'O(1)', space: 'O(n)',
      idea: 'Keep two pointers: front (the first node) and rear (the last node). Enqueue links a new node after rear; dequeue removes the node at front. When the last element leaves, both pointers become NULL.',
      steps: ['enqueue: new node; if the queue is empty front = rear = new, else rear->next = new and rear = new.', 'dequeue: if front == NULL, underflow; else remove the front node; if the queue became empty set rear = NULL.'],
      note: 'Forgetting to reset rear when the queue empties is the classic bug.',
      pseudo: ['enqueue(x): n = new node(x)', '  if rear == NULL: front = rear = n', '  else: rear.next = n; rear = n', 'dequeue(): if front == NULL: underflow', '  x = front.data; front = front.next', '  if front == NULL: rear = NULL', '  return x'],
      expect: 'Dequeued 5\nFront is 6\n',
      code: {
        c: R`#include <stdio.h>
#include <stdlib.h>

struct node { int data; struct node *next; };
struct node *front = NULL, *rear = NULL;

void enqueue(int x) {
    struct node *n = malloc(sizeof *n);
    n->data = x; n->next = NULL;
    if (!rear) front = rear = n;
    else { rear->next = n; rear = n; }
}

int dequeue(void) {
    if (!front) { printf("Underflow\n"); return -1; }
    struct node *t = front; int x = t->data;
    front = t->next;
    if (!front) rear = NULL;
    free(t);
    return x;
}

int main(void) {
    enqueue(5); enqueue(6); enqueue(7);
    printf("Dequeued %d\n", dequeue());
    printf("Front is %d\n", front->data);
    while (front) dequeue();
    return 0;
}
`,
        cpp: R`#include <iostream>
using namespace std;

struct Node { int data; Node *next; };

class Queue {
    Node *front = nullptr, *rear = nullptr;
public:
    void enqueue(int x) {
        Node *n = new Node{x, nullptr};
        if (!rear) front = rear = n; else { rear->next = n; rear = n; }
    }
    int dequeue() {
        if (!front) { cout << "Underflow\n"; return -1; }
        Node *t = front; int x = t->data;
        front = t->next;
        if (!front) rear = nullptr;
        delete t;
        return x;
    }
    int peek() const { return front->data; }
    ~Queue() { while (front) dequeue(); }
};

int main() {
    Queue q;
    q.enqueue(5); q.enqueue(6); q.enqueue(7);
    cout << "Dequeued " << q.dequeue() << "\n";
    cout << "Front is " << q.peek() << "\n";
    return 0;
}
`,
        java: R`public class Main {
    static class Node { int data; Node next; Node(int d) { data = d; } }
    static Node front = null, rear = null;

    static void enqueue(int x) {
        Node n = new Node(x);
        if (rear == null) front = rear = n; else { rear.next = n; rear = n; }
    }

    static int dequeue() {
        if (front == null) { System.out.println("Underflow"); return -1; }
        int x = front.data;
        front = front.next;
        if (front == null) rear = null;
        return x;
    }

    public static void main(String[] args) {
        enqueue(5); enqueue(6); enqueue(7);
        System.out.println("Dequeued " + dequeue());
        System.out.println("Front is " + front.data);
    }
}
`,
        py: R`class Node:
    def __init__(self, data):
        self.data, self.next = data, None


front = rear = None


def enqueue(x):
    global front, rear
    n = Node(x)
    if rear is None:
        front = rear = n
    else:
        rear.next = n
        rear = n


def dequeue():
    global front, rear
    if front is None:
        print("Underflow")
        return -1
    x = front.data
    front = front.next
    if front is None:
        rear = None
    return x


enqueue(5)
enqueue(6)
enqueue(7)
print("Dequeued", dequeue())
print("Front is", front.data)
`,
      },
    },
    {
      id: 'priority-queue-list', title: 'Priority queue using a sorted list', summary: 'Keep the list ordered by priority so deletion takes O(1).', tags: ['Priority queue', 'Linked list'], time: 'insert O(n), delete O(1)', best: 'O(1)', space: 'O(n)',
      idea: 'In an ascending priority queue the smallest key has the highest priority. Insert each new element into a sorted singly linked list at the position that keeps it ordered; the head is then always the next element to delete.',
      steps: ['insert: walk past all nodes with a smaller key, then link the new node in.', 'delete: remove the head.'],
      note: 'A binary heap makes both operations O(log n); this version is the one asked in exams because it needs only linked-list code.',
      pseudo: ['insert(x): if head == NULL or x < head.key: new.next = head; head = new', '  else: p = head; while p.next != NULL and p.next.key <= x: p = p.next', '        new.next = p.next; p.next = new', 'deleteMin(): x = head.key; head = head.next; return x'],
      expect: '5 10 20 30\n',
      code: {
        c: R`#include <stdio.h>
#include <stdlib.h>

struct node { int key; struct node *next; };
struct node *head = NULL;

void insert(int x) {
    struct node *n = malloc(sizeof *n);
    n->key = x;
    if (!head || x < head->key) { n->next = head; head = n; return; }
    struct node *p = head;
    while (p->next && p->next->key <= x) p = p->next;
    n->next = p->next; p->next = n;
}

int deleteMin(void) {
    struct node *t = head; int x = t->key;
    head = t->next; free(t);
    return x;
}

int main(void) {
    int in[] = {30, 10, 20, 5};
    for (int i = 0; i < 4; i++) insert(in[i]);
    for (int i = 0; i < 4; i++) printf(i ? " %d" : "%d", deleteMin());
    printf("\n");
    return 0;
}
`,
        cpp: R`#include <iostream>
using namespace std;

struct Node { int key; Node *next; };
Node *head = nullptr;

void insertKey(int x) {
    Node *n = new Node{x, nullptr};
    if (!head || x < head->key) { n->next = head; head = n; return; }
    Node *p = head;
    while (p->next && p->next->key <= x) p = p->next;
    n->next = p->next; p->next = n;
}

int deleteMin() {
    Node *t = head; int x = t->key;
    head = t->next; delete t;
    return x;
}

int main() {
    for (int x : {30, 10, 20, 5}) insertKey(x);
    for (int i = 0; i < 4; i++) cout << (i ? " " : "") << deleteMin();
    cout << "\n";
    return 0;
}
`,
        java: R`public class Main {
    static class Node { int key; Node next; Node(int k) { key = k; } }
    static Node head = null;

    static void insert(int x) {
        Node n = new Node(x);
        if (head == null || x < head.key) { n.next = head; head = n; return; }
        Node p = head;
        while (p.next != null && p.next.key <= x) p = p.next;
        n.next = p.next; p.next = n;
    }

    static int deleteMin() { int x = head.key; head = head.next; return x; }

    public static void main(String[] args) {
        for (int x : new int[]{30, 10, 20, 5}) insert(x);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 4; i++) sb.append(i > 0 ? " " : "").append(deleteMin());
        System.out.println(sb);
    }
}
`,
        py: R`class Node:
    def __init__(self, key):
        self.key, self.next = key, None


head = None


def insert(x):
    global head
    n = Node(x)
    if head is None or x < head.key:
        n.next, head = head, n
        return
    p = head
    while p.next and p.next.key <= x:
        p = p.next
    n.next, p.next = p.next, n


def delete_min():
    global head
    x = head.key
    head = head.next
    return x


for x in (30, 10, 20, 5):
    insert(x)
print(*[delete_min() for _ in range(4)])
`,
      },
    },
  ]);

  add(4, [
    {
      id: 'merge-two-arrays', title: 'Merging two sorted arrays', summary: 'The merge step of merge sort on its own.', tags: ['Merging', 'Sorting'], time: 'O(m + n)', best: 'O(min(m, n))', space: 'O(m + n)',
      idea: 'Keep one index in each array. Repeatedly copy the smaller front element into the result and advance that index. When one array is exhausted copy the rest of the other.',
      steps: ['i = 0, j = 0, k = 0.', 'While both arrays have elements, copy the smaller (take the left one on a tie, which keeps the merge stable).', 'Copy the leftovers.'],
      note: 'Each element is copied once, so the cost is linear. This is also the heart of external sorting and of merging runs.',
      pseudo: ['i = 0; j = 0; k = 0', 'while i < m and j < n:', '  if a[i] <= b[j]: c[k++] = a[i++] else c[k++] = b[j++]', 'while i < m: c[k++] = a[i++]', 'while j < n: c[k++] = b[j++]'],
      expect: '1 2 5 5 8 9 10 12 15\n',
      code: {
        c: R`#include <stdio.h>

int main(void) {
    int a[] = {2, 5, 8, 12}, b[] = {1, 5, 9, 10, 15}, c[9];
    int m = 4, n = 5, i = 0, j = 0, k = 0;
    while (i < m && j < n) c[k++] = (a[i] <= b[j]) ? a[i++] : b[j++];
    while (i < m) c[k++] = a[i++];
    while (j < n) c[k++] = b[j++];
    for (k = 0; k < m + n; k++) printf(k ? " %d" : "%d", c[k]);
    printf("\n");
    return 0;
}
`,
        cpp: R`#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {2, 5, 8, 12}, b = {1, 5, 9, 10, 15}, c;
    size_t i = 0, j = 0;
    while (i < a.size() && j < b.size()) c.push_back(a[i] <= b[j] ? a[i++] : b[j++]);
    while (i < a.size()) c.push_back(a[i++]);
    while (j < b.size()) c.push_back(b[j++]);
    for (size_t k = 0; k < c.size(); k++) cout << (k ? " " : "") << c[k];
    cout << "\n";
    return 0;
}
`,
        java: R`public class Main {
    public static void main(String[] args) {
        int[] a = {2, 5, 8, 12}, b = {1, 5, 9, 10, 15}, c = new int[9];
        int i = 0, j = 0, k = 0;
        while (i < a.length && j < b.length) c[k++] = a[i] <= b[j] ? a[i++] : b[j++];
        while (i < a.length) c[k++] = a[i++];
        while (j < b.length) c[k++] = b[j++];
        StringBuilder sb = new StringBuilder();
        for (k = 0; k < c.length; k++) sb.append(k > 0 ? " " : "").append(c[k]);
        System.out.println(sb);
    }
}
`,
        py: R`a = [2, 5, 8, 12]
b = [1, 5, 9, 10, 15]
c, i, j = [], 0, 0
while i < len(a) and j < len(b):
    if a[i] <= b[j]:
        c.append(a[i]); i += 1
    else:
        c.append(b[j]); j += 1
c += a[i:] + b[j:]
print(*c)
`,
      },
    },
    {
      id: 'quick-sort-hoare', title: 'Quick sort (first element as pivot)', summary: 'The two-pointer partition used in the class notes.', tags: ['Sorting', 'Divide and conquer'], time: 'O(n log n) avg', best: 'O(n log n)', space: 'O(log n)',
      idea: 'Take a[low] as the pivot. Move i right past elements ≤ pivot and j left past elements > pivot; swap the elements where they stop. When the pointers cross, swap the pivot with a[j]: it is now in its final place. Sort the two sides recursively.',
      steps: ['pivot = a[low]; i = low + 1; j = high.', 'Advance i while a[i] ≤ pivot; retreat j while a[j] > pivot; swap if i < j.', 'Swap a[low] and a[j]; recurse on low..j−1 and j+1..high.'],
      note: 'Best and average O(n log n). Worst case O(n²), which happens for an already sorted array with this pivot choice.',
      pseudo: ['QUICKSORT(a, low, high):', '  if low < high:', '    j = PARTITION(a, low, high)', '    QUICKSORT(a, low, j - 1); QUICKSORT(a, j + 1, high)', 'PARTITION: pivot = a[low]; i = low + 1; j = high', '  loop: while i <= high and a[i] <= pivot: i++', '        while a[j] > pivot: j--', '        if i >= j: break; swap a[i], a[j]', '  swap a[low], a[j]; return j'],
      expect: 'Pivot 40 is placed at index 3\n14 20 30 40 60 61 70 97\n',
      code: {
        c: R`#include <stdio.h>

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

void quickSort(int a[], int low, int high) {
    if (low < high) {
        int j = partition(a, low, high);
        quickSort(a, low, j - 1);
        quickSort(a, j + 1, high);
    }
}

int main(void) {
    int a[] = {40, 20, 70, 14, 60, 61, 97, 30}, n = 8, b[8];
    for (int i = 0; i < n; i++) b[i] = a[i];
    printf("Pivot %d is placed at index %d\n", a[0], partition(b, 0, n - 1));
    quickSort(a, 0, n - 1);
    for (int i = 0; i < n; i++) printf(i ? " %d" : "%d", a[i]);
    printf("\n");
    return 0;
}
`,
        cpp: R`#include <iostream>
#include <utility>
#include <vector>
using namespace std;

int partition(vector<int> &a, int low, int high) {
    int pivot = a[low], i = low + 1, j = high;
    for (;;) {
        while (i <= high && a[i] <= pivot) i++;
        while (a[j] > pivot) j--;
        if (i >= j) break;
        swap(a[i], a[j]);
    }
    swap(a[low], a[j]);
    return j;
}

void quickSort(vector<int> &a, int low, int high) {
    if (low < high) {
        int j = partition(a, low, high);
        quickSort(a, low, j - 1);
        quickSort(a, j + 1, high);
    }
}

int main() {
    vector<int> a = {40, 20, 70, 14, 60, 61, 97, 30}, b = a;
    cout << "Pivot " << a[0] << " is placed at index " << partition(b, 0, 7) << "\n";
    quickSort(a, 0, 7);
    for (size_t i = 0; i < a.size(); i++) cout << (i ? " " : "") << a[i];
    cout << "\n";
    return 0;
}
`,
        java: R`public class Main {
    static int partition(int[] a, int low, int high) {
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

    static void quickSort(int[] a, int low, int high) {
        if (low < high) {
            int j = partition(a, low, high);
            quickSort(a, low, j - 1);
            quickSort(a, j + 1, high);
        }
    }

    public static void main(String[] args) {
        int[] a = {40, 20, 70, 14, 60, 61, 97, 30};
        System.out.println("Pivot " + a[0] + " is placed at index " + partition(a.clone(), 0, 7));
        quickSort(a, 0, 7);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < a.length; i++) sb.append(i > 0 ? " " : "").append(a[i]);
        System.out.println(sb);
    }
}
`,
        py: R`def partition(a, low, high):
    pivot, i, j = a[low], low + 1, high
    while True:
        while i <= high and a[i] <= pivot:
            i += 1
        while a[j] > pivot:
            j -= 1
        if i >= j:
            break
        a[i], a[j] = a[j], a[i]
    a[low], a[j] = a[j], a[low]
    return j


def quick_sort(a, low, high):
    if low < high:
        j = partition(a, low, high)
        quick_sort(a, low, j - 1)
        quick_sort(a, j + 1, high)


a = [40, 20, 70, 14, 60, 61, 97, 30]
print("Pivot", a[0], "is placed at index", partition(a[:], 0, 7))
quick_sort(a, 0, 7)
print(*a)
`,
      },
    },
    {
      id: 'binary-search-recursive', title: 'Binary search (recursive)', summary: 'The same halving idea written as a recursion.', tags: ['Searching', 'Recursion'], time: 'O(log n)', best: 'O(1)', space: 'O(log n)',
      idea: 'To search a[lo..hi]: if the range is empty, the key is absent. Otherwise compare with the middle element and recurse on the half that can contain the key.',
      steps: ['If lo > hi return −1.', 'mid = lo + (hi − lo) / 2.', 'Equal: return mid. Key smaller: search lo..mid−1. Key larger: search mid+1..hi.'],
      note: 'T(n) = T(n/2) + 1. The recursion uses O(log n) stack, which is why the iterative form is preferred in practice.',
      pseudo: ['BSEARCH(a, lo, hi, key):', '  if lo > hi: return -1', '  mid = lo + (hi - lo) / 2', '  if a[mid] == key: return mid', '  if key < a[mid]: return BSEARCH(a, lo, mid - 1, key)', '  return BSEARCH(a, mid + 1, hi, key)'],
      expect: '52 found at index 7\n10 not found\n',
      code: {
        c: R`#include <stdio.h>

int bsearch_rec(const int a[], int lo, int hi, int key) {
    if (lo > hi) return -1;
    int mid = lo + (hi - lo) / 2;
    if (a[mid] == key) return mid;
    if (key < a[mid]) return bsearch_rec(a, lo, mid - 1, key);
    return bsearch_rec(a, mid + 1, hi, key);
}

int main(void) {
    int a[] = {3, 8, 12, 17, 25, 31, 44, 52, 67, 80}, keys[] = {52, 10};
    for (int k = 0; k < 2; k++) {
        int r = bsearch_rec(a, 0, 9, keys[k]);
        if (r >= 0) printf("%d found at index %d\n", keys[k], r);
        else printf("%d not found\n", keys[k]);
    }
    return 0;
}
`,
        cpp: R`#include <iostream>
#include <vector>
using namespace std;

int bsearchRec(const vector<int> &a, int lo, int hi, int key) {
    if (lo > hi) return -1;
    int mid = lo + (hi - lo) / 2;
    if (a[mid] == key) return mid;
    if (key < a[mid]) return bsearchRec(a, lo, mid - 1, key);
    return bsearchRec(a, mid + 1, hi, key);
}

int main() {
    vector<int> a = {3, 8, 12, 17, 25, 31, 44, 52, 67, 80};
    for (int key : {52, 10}) {
        int r = bsearchRec(a, 0, 9, key);
        if (r >= 0) cout << key << " found at index " << r << "\n";
        else cout << key << " not found\n";
    }
    return 0;
}
`,
        java: R`public class Main {
    static int search(int[] a, int lo, int hi, int key) {
        if (lo > hi) return -1;
        int mid = lo + (hi - lo) / 2;
        if (a[mid] == key) return mid;
        if (key < a[mid]) return search(a, lo, mid - 1, key);
        return search(a, mid + 1, hi, key);
    }

    public static void main(String[] args) {
        int[] a = {3, 8, 12, 17, 25, 31, 44, 52, 67, 80};
        for (int key : new int[]{52, 10}) {
            int r = search(a, 0, 9, key);
            System.out.println(r >= 0 ? key + " found at index " + r : key + " not found");
        }
    }
}
`,
        py: R`def search(a, lo, hi, key):
    if lo > hi:
        return -1
    mid = lo + (hi - lo) // 2
    if a[mid] == key:
        return mid
    if key < a[mid]:
        return search(a, lo, mid - 1, key)
    return search(a, mid + 1, hi, key)


a = [3, 8, 12, 17, 25, 31, 44, 52, 67, 80]
for key in (52, 10):
    r = search(a, 0, 9, key)
    print(f"{key} found at index {r}" if r >= 0 else f"{key} not found")
`,
      },
    },
    {
      id: 'hash-linear-probing', title: 'Hashing with linear probing', summary: 'Open addressing: on a collision try the next slot.', tags: ['Hashing'], time: 'O(1) avg', best: 'O(1)', space: 'O(M)', viz: 'hash-linear',
      idea: 'Store each key at h(k) = k mod M. If the slot is taken, try (h + 1) mod M, (h + 2) mod M, … until a free slot is found. Searching follows the same probe sequence and stops at an empty slot.',
      steps: ['i = k mod M.', 'While table[i] is occupied: i = (i + 1) mod M.', 'Store k in table[i].'],
      note: 'Long runs of full slots form (primary clustering), and the table must be rehashed when the load factor becomes large. Deleting needs a tombstone.',
      pseudo: ['insert(k): i = k mod M', '  while table[i] != EMPTY: i = (i + 1) mod M', '  table[i] = k', 'search(k): i = k mod M', '  while table[i] != EMPTY: if table[i] == k return i; i = (i + 1) mod M', '  return NOT FOUND'],
      expect: '0:- 1:31 2:52 3:23 4:14 5:44 6:64 7:71 8:- 9:-\n',
      code: {
        c: R`#include <stdio.h>

#define M 10
#define EMPTY -1

int main(void) {
    int table[M], keys[] = {31, 14, 23, 44, 64, 52, 71};
    for (int i = 0; i < M; i++) table[i] = EMPTY;
    for (int k = 0; k < 7; k++) {
        int i = keys[k] % M;
        while (table[i] != EMPTY) i = (i + 1) % M;     /* collision: next slot */
        table[i] = keys[k];
    }
    for (int i = 0; i < M; i++) {
        if (table[i] == EMPTY) printf("%d:-", i); else printf("%d:%d", i, table[i]);
        printf(i < M - 1 ? " " : "\n");
    }
    return 0;
}
`,
        cpp: R`#include <iostream>
#include <vector>
using namespace std;

int main() {
    const int M = 10, EMPTY = -1;
    vector<int> table(M, EMPTY);
    for (int key : {31, 14, 23, 44, 64, 52, 71}) {
        int i = key % M;
        while (table[i] != EMPTY) i = (i + 1) % M;      // collision: next slot
        table[i] = key;
    }
    for (int i = 0; i < M; i++) {
        cout << i << ":";
        if (table[i] == EMPTY) cout << "-"; else cout << table[i];
        cout << (i < M - 1 ? " " : "\n");
    }
    return 0;
}
`,
        java: R`public class Main {
    public static void main(String[] args) {
        final int M = 10, EMPTY = -1;
        int[] table = new int[M];
        java.util.Arrays.fill(table, EMPTY);
        for (int key : new int[]{31, 14, 23, 44, 64, 52, 71}) {
            int i = key % M;
            while (table[i] != EMPTY) i = (i + 1) % M;   // collision: next slot
            table[i] = key;
        }
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < M; i++) sb.append(i).append(":").append(table[i] == EMPTY ? "-" : table[i]).append(i < M - 1 ? " " : "");
        System.out.println(sb);
    }
}
`,
        py: R`M = 10
table = [None] * M
for key in (31, 14, 23, 44, 64, 52, 71):
    i = key % M
    while table[i] is not None:      # collision: next slot
        i = (i + 1) % M
    table[i] = key
print(" ".join(f"{i}:{'-' if v is None else v}" for i, v in enumerate(table)))
`,
      },
    },
  ]);

  const BST_C = R`#include <stdio.h>
#include <stdlib.h>

struct tnode { int data; struct tnode *left, *right; };

struct tnode *insert(struct tnode *t, int k) {
    if (!t) { t = malloc(sizeof *t); t->data = k; t->left = t->right = NULL; }
    else if (k < t->data) t->left = insert(t->left, k);
    else t->right = insert(t->right, k);
    return t;
}
`;
  add(5, [
    {
      id: 'tree-traversals', title: 'Binary tree traversals', summary: 'Inorder, preorder, postorder and level order.', tags: ['Tree', 'Traversal'], time: 'O(n)', best: 'O(n)', space: 'O(h)', viz: 'traversals',
      idea: 'Depth-first traversals differ only in when the node is visited relative to its subtrees: before (preorder), between (inorder) or after (postorder). Level order uses a queue to go row by row.',
      steps: ['Inorder: left, node, right.', 'Preorder: node, left, right.', 'Postorder: left, right, node.', 'Level order: enqueue the root; repeatedly dequeue, visit, and enqueue the children.'],
      note: 'Each node is visited once, so every traversal is O(n). The recursion stack is as deep as the tree is high, O(h).',
      pseudo: ['INORDER(t): if t != NULL: INORDER(t.left); visit(t); INORDER(t.right)', 'PREORDER(t): if t != NULL: visit(t); PREORDER(t.left); PREORDER(t.right)', 'POSTORDER(t): if t != NULL: POSTORDER(t.left); POSTORDER(t.right); visit(t)', 'LEVELORDER(t): enqueue t; while queue not empty: u = dequeue; visit(u); enqueue u.left, u.right if present'],
      expect: 'Inorder: 20 30 40 50 60 70 80\nPreorder: 50 30 20 40 70 60 80\nPostorder: 20 40 30 60 80 70 50\nLevel: 50 30 70 20 40 60 80\n',
      code: {
        c: BST_C + R`
void inorder(struct tnode *t)   { if (t) { inorder(t->left); printf(" %d", t->data); inorder(t->right); } }
void preorder(struct tnode *t)  { if (t) { printf(" %d", t->data); preorder(t->left); preorder(t->right); } }
void postorder(struct tnode *t) { if (t) { postorder(t->left); postorder(t->right); printf(" %d", t->data); } }
void level(struct tnode *t) {
    struct tnode *q[100]; int head = 0, tail = 0;
    if (t) q[tail++] = t;
    while (head < tail) {
        struct tnode *u = q[head++];
        printf(" %d", u->data);
        if (u->left) q[tail++] = u->left;
        if (u->right) q[tail++] = u->right;
    }
}
void destroy(struct tnode *t) { if (t) { destroy(t->left); destroy(t->right); free(t); } }

int main(void) {
    int keys[] = {50, 30, 70, 20, 40, 60, 80};
    struct tnode *root = NULL;
    for (int i = 0; i < 7; i++) root = insert(root, keys[i]);
    printf("Inorder:");   inorder(root);   printf("\n");
    printf("Preorder:");  preorder(root);  printf("\n");
    printf("Postorder:"); postorder(root); printf("\n");
    printf("Level:");     level(root);     printf("\n");
    destroy(root);
    return 0;
}
`,
        cpp: R`#include <iostream>
#include <queue>
using namespace std;

struct Node { int data; Node *left = nullptr, *right = nullptr; Node(int d) : data(d) {} };

Node *insertKey(Node *t, int k) {
    if (!t) return new Node(k);
    if (k < t->data) t->left = insertKey(t->left, k); else t->right = insertKey(t->right, k);
    return t;
}
void inorder(Node *t)   { if (t) { inorder(t->left); cout << " " << t->data; inorder(t->right); } }
void preorder(Node *t)  { if (t) { cout << " " << t->data; preorder(t->left); preorder(t->right); } }
void postorder(Node *t) { if (t) { postorder(t->left); postorder(t->right); cout << " " << t->data; } }
void level(Node *t) {
    queue<Node *> q;
    if (t) q.push(t);
    while (!q.empty()) {
        Node *u = q.front(); q.pop();
        cout << " " << u->data;
        if (u->left) q.push(u->left);
        if (u->right) q.push(u->right);
    }
}
void destroy(Node *t) { if (t) { destroy(t->left); destroy(t->right); delete t; } }

int main() {
    Node *root = nullptr;
    for (int k : {50, 30, 70, 20, 40, 60, 80}) root = insertKey(root, k);
    cout << "Inorder:";   inorder(root);   cout << "\n";
    cout << "Preorder:";  preorder(root);  cout << "\n";
    cout << "Postorder:"; postorder(root); cout << "\n";
    cout << "Level:";     level(root);     cout << "\n";
    destroy(root);
    return 0;
}
`,
        java: R`import java.util.*;

public class Main {
    static class Node { int data; Node left, right; Node(int d) { data = d; } }

    static Node insert(Node t, int k) {
        if (t == null) return new Node(k);
        if (k < t.data) t.left = insert(t.left, k); else t.right = insert(t.right, k);
        return t;
    }
    static StringBuilder out = new StringBuilder();
    static void inorder(Node t)   { if (t != null) { inorder(t.left); out.append(" ").append(t.data); inorder(t.right); } }
    static void preorder(Node t)  { if (t != null) { out.append(" ").append(t.data); preorder(t.left); preorder(t.right); } }
    static void postorder(Node t) { if (t != null) { postorder(t.left); postorder(t.right); out.append(" ").append(t.data); } }
    static void level(Node t) {
        Deque<Node> q = new ArrayDeque<>();
        if (t != null) q.add(t);
        while (!q.isEmpty()) {
            Node u = q.poll();
            out.append(" ").append(u.data);
            if (u.left != null) q.add(u.left);
            if (u.right != null) q.add(u.right);
        }
    }

    public static void main(String[] args) {
        Node root = null;
        for (int k : new int[]{50, 30, 70, 20, 40, 60, 80}) root = insert(root, k);
        out.setLength(0); inorder(root);   System.out.println("Inorder:" + out);
        out.setLength(0); preorder(root);  System.out.println("Preorder:" + out);
        out.setLength(0); postorder(root); System.out.println("Postorder:" + out);
        out.setLength(0); level(root);     System.out.println("Level:" + out);
    }
}
`,
        py: R`from collections import deque


class Node:
    def __init__(self, data):
        self.data, self.left, self.right = data, None, None


def insert(t, k):
    if t is None:
        return Node(k)
    if k < t.data:
        t.left = insert(t.left, k)
    else:
        t.right = insert(t.right, k)
    return t


def inorder(t):
    return inorder(t.left) + [t.data] + inorder(t.right) if t else []


def preorder(t):
    return [t.data] + preorder(t.left) + preorder(t.right) if t else []


def postorder(t):
    return postorder(t.left) + postorder(t.right) + [t.data] if t else []


def level(t):
    out, q = [], deque([t] if t else [])
    while q:
        u = q.popleft()
        out.append(u.data)
        q.extend(c for c in (u.left, u.right) if c)
    return out


root = None
for k in (50, 30, 70, 20, 40, 60, 80):
    root = insert(root, k)
print("Inorder:", *inorder(root))
print("Preorder:", *preorder(root))
print("Postorder:", *postorder(root))
print("Level:", *level(root))
`,
      },
    },
    {
      id: 'tree-metrics', title: 'Tree height, node count, leaves and mirror', summary: 'Four classic recursive tree functions.', tags: ['Tree', 'Recursion'], time: 'O(n)', best: 'O(n)', space: 'O(h)', viz: 'bst',
      idea: 'Almost every property of a tree follows from its two subtrees: count = 1 + count(left) + count(right); height = 1 + max of the child heights; leaves = leaves(left) + leaves(right) (a node without children counts as 1); mirror = swap the children, then mirror both.',
      steps: ['Base case: an empty tree has count 0, height 0 and no leaves.', 'Combine the answers of the left and right subtrees.'],
      note: 'Height is measured here as the number of nodes on the longest root-to-leaf path. Subtract 1 to count edges.',
      pseudo: ['COUNT(t) = 0 if t is NULL else 1 + COUNT(t.left) + COUNT(t.right)', 'HEIGHT(t) = 0 if t is NULL else 1 + max(HEIGHT(t.left), HEIGHT(t.right))', 'LEAVES(t) = 0 if NULL; 1 if no children; else LEAVES(t.left) + LEAVES(t.right)', 'MIRROR(t): if t != NULL: swap(t.left, t.right); MIRROR(t.left); MIRROR(t.right)'],
      expect: 'Nodes 8\nHeight 4\nLeaves 4\nMirror inorder: 80 70 60 50 40 30 20 10\n',
      code: {
        c: BST_C + R`
int count(struct tnode *t)  { return t ? 1 + count(t->left) + count(t->right) : 0; }
int height(struct tnode *t) { if (!t) return 0; int l = height(t->left), r = height(t->right); return 1 + (l > r ? l : r); }
int leaves(struct tnode *t) { if (!t) return 0; if (!t->left && !t->right) return 1; return leaves(t->left) + leaves(t->right); }
void mirror(struct tnode *t) { if (t) { struct tnode *x = t->left; t->left = t->right; t->right = x; mirror(t->left); mirror(t->right); } }
void inorder(struct tnode *t) { if (t) { inorder(t->left); printf(" %d", t->data); inorder(t->right); } }
void destroy(struct tnode *t) { if (t) { destroy(t->left); destroy(t->right); free(t); } }

int main(void) {
    int keys[] = {50, 30, 70, 20, 40, 60, 80, 10};
    struct tnode *root = NULL;
    for (int i = 0; i < 8; i++) root = insert(root, keys[i]);
    printf("Nodes %d\nHeight %d\nLeaves %d\n", count(root), height(root), leaves(root));
    mirror(root);
    printf("Mirror inorder:"); inorder(root); printf("\n");
    destroy(root);
    return 0;
}
`,
        cpp: R`#include <algorithm>
#include <iostream>
using namespace std;

struct Node { int data; Node *left = nullptr, *right = nullptr; Node(int d) : data(d) {} };

Node *insertKey(Node *t, int k) {
    if (!t) return new Node(k);
    if (k < t->data) t->left = insertKey(t->left, k); else t->right = insertKey(t->right, k);
    return t;
}
int count(Node *t)  { return t ? 1 + count(t->left) + count(t->right) : 0; }
int height(Node *t) { return t ? 1 + max(height(t->left), height(t->right)) : 0; }
int leaves(Node *t) { if (!t) return 0; if (!t->left && !t->right) return 1; return leaves(t->left) + leaves(t->right); }
void mirror(Node *t) { if (t) { swap(t->left, t->right); mirror(t->left); mirror(t->right); } }
void inorder(Node *t) { if (t) { inorder(t->left); cout << " " << t->data; inorder(t->right); } }
void destroy(Node *t) { if (t) { destroy(t->left); destroy(t->right); delete t; } }

int main() {
    Node *root = nullptr;
    for (int k : {50, 30, 70, 20, 40, 60, 80, 10}) root = insertKey(root, k);
    cout << "Nodes " << count(root) << "\nHeight " << height(root) << "\nLeaves " << leaves(root) << "\n";
    mirror(root);
    cout << "Mirror inorder:"; inorder(root); cout << "\n";
    destroy(root);
    return 0;
}
`,
        java: R`public class Main {
    static class Node { int data; Node left, right; Node(int d) { data = d; } }

    static Node insert(Node t, int k) {
        if (t == null) return new Node(k);
        if (k < t.data) t.left = insert(t.left, k); else t.right = insert(t.right, k);
        return t;
    }
    static int count(Node t)  { return t == null ? 0 : 1 + count(t.left) + count(t.right); }
    static int height(Node t) { return t == null ? 0 : 1 + Math.max(height(t.left), height(t.right)); }
    static int leaves(Node t) { if (t == null) return 0; if (t.left == null && t.right == null) return 1; return leaves(t.left) + leaves(t.right); }
    static void mirror(Node t) { if (t != null) { Node x = t.left; t.left = t.right; t.right = x; mirror(t.left); mirror(t.right); } }
    static void inorder(Node t, StringBuilder sb) { if (t != null) { inorder(t.left, sb); sb.append(" ").append(t.data); inorder(t.right, sb); } }

    public static void main(String[] args) {
        Node root = null;
        for (int k : new int[]{50, 30, 70, 20, 40, 60, 80, 10}) root = insert(root, k);
        System.out.println("Nodes " + count(root) + "\nHeight " + height(root) + "\nLeaves " + leaves(root));
        mirror(root);
        StringBuilder sb = new StringBuilder();
        inorder(root, sb);
        System.out.println("Mirror inorder:" + sb);
    }
}
`,
        py: R`class Node:
    def __init__(self, data):
        self.data, self.left, self.right = data, None, None


def insert(t, k):
    if t is None:
        return Node(k)
    if k < t.data:
        t.left = insert(t.left, k)
    else:
        t.right = insert(t.right, k)
    return t


def count(t):
    return 1 + count(t.left) + count(t.right) if t else 0


def height(t):
    return 1 + max(height(t.left), height(t.right)) if t else 0


def leaves(t):
    if t is None:
        return 0
    if t.left is None and t.right is None:
        return 1
    return leaves(t.left) + leaves(t.right)


def mirror(t):
    if t:
        t.left, t.right = t.right, t.left
        mirror(t.left)
        mirror(t.right)


def inorder(t):
    return inorder(t.left) + [t.data] + inorder(t.right) if t else []


root = None
for k in (50, 30, 70, 20, 40, 60, 80, 10):
    root = insert(root, k)
print("Nodes", count(root))
print("Height", height(root))
print("Leaves", leaves(root))
mirror(root)
print("Mirror inorder:", *inorder(root))
`,
      },
    },
    {
      id: 'prim-mst', title: "Prim's minimum spanning tree", summary: 'Grow one tree by the cheapest edge that leaves it.', tags: ['Graph', 'MST', 'Greedy'], time: 'O(V²)', best: 'O(V²)', space: 'O(V)', viz: 'prim',
      idea: 'Start with one vertex in the tree. Keep, for every vertex outside the tree, the cheapest edge that connects it to the tree. Repeatedly add the outside vertex with the smallest such edge and update the others.',
      steps: ['key[start] = 0, all other keys = ∞.', 'Pick the outside vertex u with the smallest key and add it with its parent edge.', 'For each neighbour w outside the tree: if weight(u, w) < key[w], set key[w] and parent[w] = u.'],
      note: 'With an adjacency matrix this is O(V²); with an adjacency list and a min-heap it is O(E log V). The graph below is the one used on the Visualize tab.',
      pseudo: ['key[v] = infinity for all v; key[start] = 0; parent[start] = none', 'repeat V times:', '  u = vertex not in tree with the smallest key; add u to tree', '  for each edge (u, w) with weight c, w not in tree:', '    if c < key[w]: key[w] = c; parent[w] = u'],
      expect: 'A-C 2\nC-B 1\nC-E 3\nE-F 6\nF-D 5\nF-G 9\nTotal weight 26\n',
      code: {
        c: R`#include <stdio.h>

#define V 7
#define INF 1000000

int main(void) {
    const char *name = "ABCDEFG";
    int w[V][V] = {0}, e[][3] = {{0,1,4},{0,2,2},{1,3,7},{2,4,3},{1,2,1},{3,5,5},{4,5,6},{3,4,8},{5,6,9}};
    for (int i = 0; i < 9; i++) w[e[i][0]][e[i][1]] = w[e[i][1]][e[i][0]] = e[i][2];
    int key[V], parent[V], in[V] = {0}, total = 0;
    for (int i = 0; i < V; i++) { key[i] = INF; parent[i] = -1; }
    key[0] = 0;
    for (int step = 0; step < V; step++) {
        int u = -1;
        for (int i = 0; i < V; i++) if (!in[i] && (u < 0 || key[i] < key[u])) u = i;
        in[u] = 1;
        if (parent[u] >= 0) { printf("%c-%c %d\n", name[parent[u]], name[u], key[u]); total += key[u]; }
        for (int x = 0; x < V; x++) if (w[u][x] && !in[x] && w[u][x] < key[x]) { key[x] = w[u][x]; parent[x] = u; }
    }
    printf("Total weight %d\n", total);
    return 0;
}
`,
        cpp: R`#include <iostream>
using namespace std;

int main() {
    const int V = 7, INF = 1000000;
    const string name = "ABCDEFG";
    int w[V][V] = {}, e[][3] = {{0,1,4},{0,2,2},{1,3,7},{2,4,3},{1,2,1},{3,5,5},{4,5,6},{3,4,8},{5,6,9}};
    for (auto &x : e) w[x[0]][x[1]] = w[x[1]][x[0]] = x[2];
    int key[V], parent[V], total = 0;
    bool in[V] = {};
    for (int i = 0; i < V; i++) { key[i] = INF; parent[i] = -1; }
    key[0] = 0;
    for (int step = 0; step < V; step++) {
        int u = -1;
        for (int i = 0; i < V; i++) if (!in[i] && (u < 0 || key[i] < key[u])) u = i;
        in[u] = true;
        if (parent[u] >= 0) { cout << name[parent[u]] << "-" << name[u] << " " << key[u] << "\n"; total += key[u]; }
        for (int x = 0; x < V; x++) if (w[u][x] && !in[x] && w[u][x] < key[x]) { key[x] = w[u][x]; parent[x] = u; }
    }
    cout << "Total weight " << total << "\n";
    return 0;
}
`,
        java: R`public class Main {
    public static void main(String[] args) {
        final int V = 7, INF = 1000000;
        String name = "ABCDEFG";
        int[][] w = new int[V][V], e = {{0,1,4},{0,2,2},{1,3,7},{2,4,3},{1,2,1},{3,5,5},{4,5,6},{3,4,8},{5,6,9}};
        for (int[] x : e) w[x[0]][x[1]] = w[x[1]][x[0]] = x[2];
        int[] key = new int[V], parent = new int[V];
        boolean[] in = new boolean[V];
        java.util.Arrays.fill(key, INF);
        java.util.Arrays.fill(parent, -1);
        key[0] = 0;
        int total = 0;
        for (int step = 0; step < V; step++) {
            int u = -1;
            for (int i = 0; i < V; i++) if (!in[i] && (u < 0 || key[i] < key[u])) u = i;
            in[u] = true;
            if (parent[u] >= 0) { System.out.println(name.charAt(parent[u]) + "-" + name.charAt(u) + " " + key[u]); total += key[u]; }
            for (int x = 0; x < V; x++) if (w[u][x] != 0 && !in[x] && w[u][x] < key[x]) { key[x] = w[u][x]; parent[x] = u; }
        }
        System.out.println("Total weight " + total);
    }
}
`,
        py: R`V, INF = 7, 10 ** 6
name = "ABCDEFG"
w = [[0] * V for _ in range(V)]
for a, b, c in [(0,1,4),(0,2,2),(1,3,7),(2,4,3),(1,2,1),(3,5,5),(4,5,6),(3,4,8),(5,6,9)]:
    w[a][b] = w[b][a] = c
key, parent, inside, total = [INF] * V, [-1] * V, [False] * V, 0
key[0] = 0
for _ in range(V):
    u = min((i for i in range(V) if not inside[i]), key=lambda i: key[i])
    inside[u] = True
    if parent[u] >= 0:
        print(f"{name[parent[u]]}-{name[u]} {key[u]}")
        total += key[u]
    for x in range(V):
        if w[u][x] and not inside[x] and w[u][x] < key[x]:
            key[x], parent[x] = w[u][x], u
print("Total weight", total)
`,
      },
    },
    {
      id: 'dijkstra-sp', title: "Dijkstra's shortest paths", summary: 'Settle the nearest vertex and relax its edges.', tags: ['Graph', 'Shortest path', 'Greedy'], time: 'O(V²)', best: 'O(V²)', space: 'O(V)', viz: 'dijkstra',
      idea: 'Keep a tentative distance for every vertex (0 for the source, ∞ for the rest). Repeatedly pick the unsettled vertex with the smallest distance, settle it, and relax each of its edges: if going through it is shorter, update the neighbour.',
      steps: ['dist[src] = 0; all other distances = ∞.', 'Settle the unsettled vertex u with the smallest dist.', 'For every edge (u, w, c): if dist[u] + c < dist[w], set dist[w] = dist[u] + c.', 'Stop when every vertex is settled.'],
      note: 'Correct only for non-negative edge weights. O(V²) with arrays; O((V + E) log V) with a binary heap.',
      pseudo: ['dist[v] = infinity for all v; dist[src] = 0', 'repeat V times:', '  u = unsettled vertex with smallest dist; settle u', '  for each edge (u, w) with weight c:', '    if dist[u] + c < dist[w]: dist[w] = dist[u] + c'],
      expect: 'A 0\nB 3\nC 2\nD 10\nE 5\nF 11\nG 20\n',
      code: {
        c: R`#include <stdio.h>

#define V 7
#define INF 1000000

int main(void) {
    int w[V][V] = {0}, e[][3] = {{0,1,4},{0,2,2},{1,3,7},{2,4,3},{1,2,1},{3,5,5},{4,5,6},{3,4,8},{5,6,9}};
    for (int i = 0; i < 9; i++) w[e[i][0]][e[i][1]] = w[e[i][1]][e[i][0]] = e[i][2];
    int dist[V], done[V] = {0};
    for (int i = 0; i < V; i++) dist[i] = INF;
    dist[0] = 0;
    for (int step = 0; step < V; step++) {
        int u = -1;
        for (int i = 0; i < V; i++) if (!done[i] && (u < 0 || dist[i] < dist[u])) u = i;
        done[u] = 1;
        for (int x = 0; x < V; x++) if (w[u][x] && dist[u] + w[u][x] < dist[x]) dist[x] = dist[u] + w[u][x];
    }
    for (int i = 0; i < V; i++) printf("%c %d\n", 'A' + i, dist[i]);
    return 0;
}
`,
        cpp: R`#include <iostream>
using namespace std;

int main() {
    const int V = 7, INF = 1000000;
    int w[V][V] = {}, e[][3] = {{0,1,4},{0,2,2},{1,3,7},{2,4,3},{1,2,1},{3,5,5},{4,5,6},{3,4,8},{5,6,9}};
    for (auto &x : e) w[x[0]][x[1]] = w[x[1]][x[0]] = x[2];
    int dist[V];
    bool done[V] = {};
    for (int &d : dist) d = INF;
    dist[0] = 0;
    for (int step = 0; step < V; step++) {
        int u = -1;
        for (int i = 0; i < V; i++) if (!done[i] && (u < 0 || dist[i] < dist[u])) u = i;
        done[u] = true;
        for (int x = 0; x < V; x++) if (w[u][x] && dist[u] + w[u][x] < dist[x]) dist[x] = dist[u] + w[u][x];
    }
    for (int i = 0; i < V; i++) cout << char('A' + i) << " " << dist[i] << "\n";
    return 0;
}
`,
        java: R`public class Main {
    public static void main(String[] args) {
        final int V = 7, INF = 1000000;
        int[][] w = new int[V][V], e = {{0,1,4},{0,2,2},{1,3,7},{2,4,3},{1,2,1},{3,5,5},{4,5,6},{3,4,8},{5,6,9}};
        for (int[] x : e) w[x[0]][x[1]] = w[x[1]][x[0]] = x[2];
        int[] dist = new int[V];
        boolean[] done = new boolean[V];
        java.util.Arrays.fill(dist, INF);
        dist[0] = 0;
        for (int step = 0; step < V; step++) {
            int u = -1;
            for (int i = 0; i < V; i++) if (!done[i] && (u < 0 || dist[i] < dist[u])) u = i;
            done[u] = true;
            for (int x = 0; x < V; x++) if (w[u][x] != 0 && dist[u] + w[u][x] < dist[x]) dist[x] = dist[u] + w[u][x];
        }
        for (int i = 0; i < V; i++) System.out.println((char) ('A' + i) + " " + dist[i]);
    }
}
`,
        py: R`import heapq

adj = {i: [] for i in range(7)}
for a, b, c in [(0,1,4),(0,2,2),(1,3,7),(2,4,3),(1,2,1),(3,5,5),(4,5,6),(3,4,8),(5,6,9)]:
    adj[a].append((b, c))
    adj[b].append((a, c))
dist = [float("inf")] * 7
dist[0] = 0
heap = [(0, 0)]
while heap:
    d, u = heapq.heappop(heap)
    if d > dist[u]:
        continue
    for x, c in adj[u]:
        if d + c < dist[x]:
            dist[x] = d + c
            heapq.heappush(heap, (dist[x], x))
for i, d in enumerate(dist):
    print(chr(65 + i), d)
`,
      },
    },
    {
      id: 'topological-sort', title: "Topological sort (Kahn's algorithm)", summary: 'Repeatedly remove vertices that have no incoming edges.', tags: ['Graph', 'DAG', 'Queue'], time: 'O(V + E)', best: 'O(V + E)', space: 'O(V)', viz: 'topo-kahn',
      idea: 'Compute the in-degree of every vertex. Put the vertices of in-degree 0 in a queue. Repeatedly dequeue a vertex, output it, and decrease the in-degree of its neighbours; neighbours that reach 0 join the queue. If fewer than V vertices were output, the graph has a cycle.',
      steps: ['Compute in-degrees and enqueue the zeros.', 'Dequeue u, output u, lower the in-degree of every out-neighbour; enqueue those that reach 0.', 'Compare the output length with V to detect a cycle.'],
      note: 'The order is not unique when several vertices are available at once; the queue fixes one valid order.',
      pseudo: ['compute indeg[v] for every vertex', 'queue = all v with indeg[v] == 0', 'while queue not empty:', '  u = dequeue(); output u', '  for each edge u -> w: indeg[w]--; if indeg[w] == 0: enqueue w', 'if outputs < V: the graph has a cycle'],
      expect: '4 5 2 0 3 1\n',
      code: {
        c: R`#include <stdio.h>

int main(void) {
    int V = 6, E = 6, from[] = {5, 5, 4, 4, 2, 3}, to[] = {2, 0, 0, 1, 3, 1};
    int indeg[6] = {0}, queue[6], head = 0, tail = 0, out = 0;
    for (int i = 0; i < E; i++) indeg[to[i]]++;
    for (int v = 0; v < V; v++) if (indeg[v] == 0) queue[tail++] = v;
    while (head < tail) {
        int u = queue[head++];
        printf(out++ ? " %d" : "%d", u);
        for (int i = 0; i < E; i++)
            if (from[i] == u && --indeg[to[i]] == 0) queue[tail++] = to[i];
    }
    printf("\n");
    return out == V ? 0 : 1;
}
`,
        cpp: R`#include <iostream>
#include <queue>
using namespace std;

int main() {
    int V = 6, E = 6, from[] = {5, 5, 4, 4, 2, 3}, to[] = {2, 0, 0, 1, 3, 1};
    int indeg[6] = {};
    queue<int> q;
    for (int i = 0; i < E; i++) indeg[to[i]]++;
    for (int v = 0; v < V; v++) if (indeg[v] == 0) q.push(v);
    int out = 0;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        cout << (out++ ? " " : "") << u;
        for (int i = 0; i < E; i++)
            if (from[i] == u && --indeg[to[i]] == 0) q.push(to[i]);
    }
    cout << "\n";
    return out == V ? 0 : 1;
}
`,
        java: R`import java.util.*;

public class Main {
    public static void main(String[] args) {
        int V = 6, E = 6;
        int[] from = {5, 5, 4, 4, 2, 3}, to = {2, 0, 0, 1, 3, 1}, indeg = new int[V];
        Deque<Integer> q = new ArrayDeque<>();
        for (int i = 0; i < E; i++) indeg[to[i]]++;
        for (int v = 0; v < V; v++) if (indeg[v] == 0) q.add(v);
        StringBuilder sb = new StringBuilder();
        int out = 0;
        while (!q.isEmpty()) {
            int u = q.poll();
            sb.append(out++ > 0 ? " " : "").append(u);
            for (int i = 0; i < E; i++)
                if (from[i] == u && --indeg[to[i]] == 0) q.add(to[i]);
        }
        System.out.println(sb);
    }
}
`,
        py: R`from collections import deque

V = 6
edges = [(5, 2), (5, 0), (4, 0), (4, 1), (2, 3), (3, 1)]
indeg = [0] * V
for _, b in edges:
    indeg[b] += 1
q = deque(v for v in range(V) if indeg[v] == 0)
order = []
while q:
    u = q.popleft()
    order.append(u)
    for a, b in edges:
        if a == u:
            indeg[b] -= 1
            if indeg[b] == 0:
                q.append(b)
print(*order)
`,
      },
    },
  ]);
})();
