/* data/lib7.js — structures that modules 2 and 3 needed code for: polynomial addition on linked lists, the
 * multi-linked sparse matrix, and the double-ended queue on a circular array. Verified by dsa-tools/test-library.js. */
(function () {
  'use strict';
  const R = String.raw;
  const add = (n, list) => { DSA.library[n] = (DSA.library[n] || []).concat(list); };

  add(2, [
    {
      id: 'poly-add-linked', title: 'Polynomial addition with linked lists', summary: 'One node per non-zero term, merged like two sorted lists.', tags: ['Linked list', 'Polynomial'], time: 'O(m + n)', best: 'O(min(m, n))', space: 'O(m + n)', viz: 'singly',
      idea: 'Each term is a node (coefficient, exponent) and the list is kept in decreasing order of exponent. To add two polynomials walk both lists together: equal exponents add their coefficients (the term vanishes if the sum is 0); otherwise copy the term with the larger exponent. Copy what is left of the other list at the end.',
      steps: ['p and q point to the first terms.', 'exp(p) = exp(q): add coefficients, advance both. exp(p) > exp(q): copy p, advance p. Otherwise copy q, advance q.', 'Append the rest of the list that is not finished.'],
      note: 'Linked lists suit sparse polynomials (x¹⁰⁰⁰ + 1 needs two nodes, not a 1001-cell array) and each term is visited once.',
      pseudo: ['while p != NULL and q != NULL:', '  if p.exp == q.exp: s = p.coef + q.coef; if s != 0: append (s, p.exp); p = p.next; q = q.next', '  else if p.exp > q.exp: append (p.coef, p.exp); p = p.next', '  else: append (q.coef, q.exp); q = q.next', 'append the remaining terms of p or q'],
      expect: '5x^4 + 4x^3 + 9x^2 + 4\n',
      code: {
        c: R`#include <stdio.h>
#include <stdlib.h>

struct term { int coef, exp; struct term *next; };

struct term *append(struct term *tail, int c, int e) {
    struct term *t = malloc(sizeof *t);
    t->coef = c; t->exp = e; t->next = NULL;
    if (tail) tail->next = t;
    return t;
}

struct term *build(const int c[], const int e[], int n) {
    struct term *head = NULL, *tail = NULL;
    for (int i = 0; i < n; i++) { tail = append(tail, c[i], e[i]); if (!head) head = tail; }
    return head;
}

struct term *add(struct term *p, struct term *q) {
    struct term *head = NULL, *tail = NULL;
    while (p || q) {
        int c, e;
        if (p && q && p->exp == q->exp) { c = p->coef + q->coef; e = p->exp; p = p->next; q = q->next; if (c == 0) continue; }
        else if (!q || (p && p->exp > q->exp)) { c = p->coef; e = p->exp; p = p->next; }
        else { c = q->coef; e = q->exp; q = q->next; }
        tail = append(tail, c, e);
        if (!head) head = tail;
    }
    return head;
}

void release(struct term *t) { while (t) { struct term *n = t->next; free(t); t = n; } }

int main(void) {
    int c1[] = {5, 3, 7}, e1[] = {4, 2, 0}, c2[] = {4, 6, -3}, e2[] = {3, 2, 0};
    struct term *a = build(c1, e1, 3), *b = build(c2, e2, 3), *s = add(a, b);
    for (struct term *t = s; t; t = t->next) {
        if (t != s) printf(" + ");
        if (t->exp == 0) printf("%d", t->coef);
        else if (t->exp == 1) printf("%dx", t->coef);
        else printf("%dx^%d", t->coef, t->exp);
    }
    printf("\n");
    release(a); release(b); release(s);
    return 0;
}
`,
        cpp: R`#include <iostream>
#include <vector>
using namespace std;

struct Term { int coef, exp; Term *next = nullptr; };

Term *build(const vector<pair<int, int>> &v) {
    Term *head = nullptr, *tail = nullptr;
    for (auto [c, e] : v) { Term *t = new Term{c, e}; if (tail) tail->next = t; else head = t; tail = t; }
    return head;
}

Term *add(Term *p, Term *q) {
    Term *head = nullptr, *tail = nullptr;
    auto push = [&](int c, int e) { Term *t = new Term{c, e}; if (tail) tail->next = t; else head = t; tail = t; };
    while (p || q) {
        if (p && q && p->exp == q->exp) { int c = p->coef + q->coef; if (c) push(c, p->exp); p = p->next; q = q->next; }
        else if (!q || (p && p->exp > q->exp)) { push(p->coef, p->exp); p = p->next; }
        else { push(q->coef, q->exp); q = q->next; }
    }
    return head;
}

void release(Term *t) { while (t) { Term *n = t->next; delete t; t = n; } }

int main() {
    Term *a = build({{5, 4}, {3, 2}, {7, 0}}), *b = build({{4, 3}, {6, 2}, {-3, 0}}), *s = add(a, b);
    for (Term *t = s; t; t = t->next) {
        if (t != s) cout << " + ";
        if (t->exp == 0) cout << t->coef;
        else if (t->exp == 1) cout << t->coef << "x";
        else cout << t->coef << "x^" << t->exp;
    }
    cout << "\n";
    release(a); release(b); release(s);
    return 0;
}
`,
        java: R`public class Main {
    static class Term { int coef, exp; Term next; Term(int c, int e) { coef = c; exp = e; } }
    static Term head, tail;

    static void push(int c, int e) {
        Term t = new Term(c, e);
        if (tail != null) tail.next = t; else head = t;
        tail = t;
    }

    static Term build(int[][] v) {
        head = tail = null;
        for (int[] t : v) push(t[0], t[1]);
        return head;
    }

    static Term add(Term p, Term q) {
        head = tail = null;
        while (p != null || q != null) {
            if (p != null && q != null && p.exp == q.exp) { int c = p.coef + q.coef; if (c != 0) push(c, p.exp); p = p.next; q = q.next; }
            else if (q == null || (p != null && p.exp > q.exp)) { push(p.coef, p.exp); p = p.next; }
            else { push(q.coef, q.exp); q = q.next; }
        }
        return head;
    }

    public static void main(String[] args) {
        Term a = build(new int[][]{{5, 4}, {3, 2}, {7, 0}});
        Term b = build(new int[][]{{4, 3}, {6, 2}, {-3, 0}});
        Term s = add(a, b);
        StringBuilder sb = new StringBuilder();
        for (Term t = s; t != null; t = t.next) {
            if (t != s) sb.append(" + ");
            if (t.exp == 0) sb.append(t.coef);
            else if (t.exp == 1) sb.append(t.coef).append("x");
            else sb.append(t.coef).append("x^").append(t.exp);
        }
        System.out.println(sb);
    }
}
`,
        py: R`class Term:
    def __init__(self, coef, exp):
        self.coef, self.exp, self.next = coef, exp, None


def build(terms):
    dummy = tail = Term(0, 0)
    for c, e in terms:
        tail.next = Term(c, e)
        tail = tail.next
    return dummy.next


def add(p, q):
    dummy = tail = Term(0, 0)
    while p or q:
        if p and q and p.exp == q.exp:
            c, e = p.coef + q.coef, p.exp
            p, q = p.next, q.next
            if c == 0:
                continue
        elif not q or (p and p.exp > q.exp):
            c, e, p = p.coef, p.exp, p.next
        else:
            c, e, q = q.coef, q.exp, q.next
        tail.next = Term(c, e)
        tail = tail.next
    return dummy.next


s = add(build([(5, 4), (3, 2), (7, 0)]), build([(4, 3), (6, 2), (-3, 0)]))
parts = []
while s:
    parts.append(str(s.coef) if s.exp == 0 else f"{s.coef}x" if s.exp == 1 else f"{s.coef}x^{s.exp}")
    s = s.next
print(" + ".join(parts))
`,
      },
    },
    {
      id: 'multilist-sparse', title: 'Sparse matrix as a multi-linked list', summary: 'Each non-zero node sits in a row list and a column list.', tags: ['Linked list', 'Multilist', 'Sparse matrix'], time: 'O(t) to build, O(row length) per row', best: 'O(1)', space: 'O(rows + cols + t)', viz: 'multilist',
      idea: 'Every non-zero element is one node with two link fields: right (next non-zero element of the same row) and down (next non-zero element of the same column). Arrays of row heads and column heads are the entry points. Inserting the elements in row-major order keeps every row and every column list in order.',
      steps: ['For each non-zero (r, c, v) create a node.', 'Link it after the current tail of row r (right pointer) and after the current tail of column c (down pointer).', 'To read a row follow right from rowHead[r]; to read a column follow down from colHead[c].'],
      note: 'A 1000 × 1000 matrix with 3000 non-zero entries needs about 3000 nodes plus 2000 head pointers, instead of a million cells.',
      pseudo: ['for each non-zero (r, c, v) in row-major order:', '  n = new node(v)', '  if rowTail[r] == NULL: rowHead[r] = n else rowTail[r].right = n', '  rowTail[r] = n', '  if colTail[c] == NULL: colHead[c] = n else colTail[c].down = n', '  colTail[c] = n', 'row r: follow right from rowHead[r]; column c: follow down from colHead[c]'],
      expect: 'Row 2: 4 9\nColumn 0: 5 4\nColumn 3: 2\n',
      code: {
        c: R`#include <stdio.h>
#include <stdlib.h>

struct node { int v; struct node *right, *down; };

int main(void) {
    int entries[][3] = {{0, 0, 5}, {0, 3, 2}, {1, 1, 7}, {2, 0, 4}, {2, 2, 9}};     /* row, column, value */
    struct node *rowHead[3] = {0}, *rowTail[3] = {0}, *colHead[4] = {0}, *colTail[4] = {0};
    for (int i = 0; i < 5; i++) {
        int r = entries[i][0], c = entries[i][1];
        struct node *n = calloc(1, sizeof *n);
        n->v = entries[i][2];
        if (rowTail[r]) rowTail[r]->right = n; else rowHead[r] = n;
        rowTail[r] = n;
        if (colTail[c]) colTail[c]->down = n; else colHead[c] = n;
        colTail[c] = n;
    }
    printf("Row 2:");
    for (struct node *p = rowHead[2]; p; p = p->right) printf(" %d", p->v);
    printf("\nColumn 0:");
    for (struct node *p = colHead[0]; p; p = p->down) printf(" %d", p->v);
    printf("\nColumn 3:");
    for (struct node *p = colHead[3]; p; p = p->down) printf(" %d", p->v);
    printf("\n");
    for (int r = 0; r < 3; r++) for (struct node *p = rowHead[r], *t; p; p = t) { t = p->right; free(p); }
    return 0;
}
`,
        cpp: R`#include <iostream>
#include <vector>
using namespace std;

struct Node { int v; Node *right = nullptr, *down = nullptr; };

int main() {
    int entries[][3] = {{0, 0, 5}, {0, 3, 2}, {1, 1, 7}, {2, 0, 4}, {2, 2, 9}};     // row, column, value
    vector<Node *> rowHead(3), rowTail(3), colHead(4), colTail(4);
    for (auto &e : entries) {
        Node *n = new Node{e[2]};
        if (rowTail[e[0]]) rowTail[e[0]]->right = n; else rowHead[e[0]] = n;
        rowTail[e[0]] = n;
        if (colTail[e[1]]) colTail[e[1]]->down = n; else colHead[e[1]] = n;
        colTail[e[1]] = n;
    }
    cout << "Row 2:";
    for (Node *p = rowHead[2]; p; p = p->right) cout << " " << p->v;
    cout << "\nColumn 0:";
    for (Node *p = colHead[0]; p; p = p->down) cout << " " << p->v;
    cout << "\nColumn 3:";
    for (Node *p = colHead[3]; p; p = p->down) cout << " " << p->v;
    cout << "\n";
    for (int r = 0; r < 3; r++) for (Node *p = rowHead[r], *t; p; p = t) { t = p->right; delete p; }
    return 0;
}
`,
        java: R`public class Main {
    static class Node { int v; Node right, down; Node(int v) { this.v = v; } }

    public static void main(String[] args) {
        int[][] entries = {{0, 0, 5}, {0, 3, 2}, {1, 1, 7}, {2, 0, 4}, {2, 2, 9}};     // row, column, value
        Node[] rowHead = new Node[3], rowTail = new Node[3], colHead = new Node[4], colTail = new Node[4];
        for (int[] e : entries) {
            Node n = new Node(e[2]);
            if (rowTail[e[0]] != null) rowTail[e[0]].right = n; else rowHead[e[0]] = n;
            rowTail[e[0]] = n;
            if (colTail[e[1]] != null) colTail[e[1]].down = n; else colHead[e[1]] = n;
            colTail[e[1]] = n;
        }
        StringBuilder sb = new StringBuilder("Row 2:");
        for (Node p = rowHead[2]; p != null; p = p.right) sb.append(" ").append(p.v);
        sb.append("\nColumn 0:");
        for (Node p = colHead[0]; p != null; p = p.down) sb.append(" ").append(p.v);
        sb.append("\nColumn 3:");
        for (Node p = colHead[3]; p != null; p = p.down) sb.append(" ").append(p.v);
        System.out.println(sb);
    }
}
`,
        py: R`class Node:
    def __init__(self, v):
        self.v, self.right, self.down = v, None, None


entries = [(0, 0, 5), (0, 3, 2), (1, 1, 7), (2, 0, 4), (2, 2, 9)]      # row, column, value
row_head, row_tail = [None] * 3, [None] * 3
col_head, col_tail = [None] * 4, [None] * 4
for r, c, v in entries:
    n = Node(v)
    if row_tail[r]:
        row_tail[r].right = n
    else:
        row_head[r] = n
    row_tail[r] = n
    if col_tail[c]:
        col_tail[c].down = n
    else:
        col_head[c] = n
    col_tail[c] = n


def walk(p, attr):
    out = []
    while p:
        out.append(p.v)
        p = getattr(p, attr)
    return out


print("Row 2:", *walk(row_head[2], "right"))
print("Column 0:", *walk(col_head[0], "down"))
print("Column 3:", *walk(col_head[3], "down"))
`,
      },
    },
  ]);

  add(3, [
    {
      id: 'deque-array', title: 'Double-ended queue (circular array)', summary: 'Insert and delete at both ends in O(1).', tags: ['Deque', 'Queue', 'Array'], time: 'O(1)', best: 'O(1)', space: 'O(n)', viz: 'deque',
      idea: 'Store the deque in a circular array with the index of the first element (front) and the number of elements (count). Inserting at the front moves front one step back (modulo the size); inserting at the rear writes at (front + count) mod size; deletions mirror them. All four operations are O(1).',
      steps: ['insertFront: front = (front − 1 + N) mod N; a[front] = x; count++.', 'insertRear: a[(front + count) mod N] = x; count++.', 'deleteFront: x = a[front]; front = (front + 1) mod N; count−−.', 'deleteRear: x = a[(front + count − 1) mod N]; count−−. Check count = 0 (underflow) and count = N (overflow) first.'],
      note: 'An input-restricted deque drops insertFront; an output-restricted deque drops deleteRear. As a stack use only one end; as a queue use insertRear with deleteFront.',
      pseudo: ['insertFront(x): if count == N: overflow; front = (front - 1 + N) mod N; a[front] = x; count++', 'insertRear(x): if count == N: overflow; a[(front + count) mod N] = x; count++', 'deleteFront(): if count == 0: underflow; x = a[front]; front = (front + 1) mod N; count--', 'deleteRear(): if count == 0: underflow; x = a[(front + count - 1) mod N]; count--'],
      expect: 'Deleted rear 20\nDeleted front 1\nDeque: 5 10\n',
      code: {
        c: R`#include <stdio.h>

#define N 5
static int a[N], front = 0, count = 0;

int insertFront(int x) { if (count == N) return 0; front = (front - 1 + N) % N; a[front] = x; count++; return 1; }
int insertRear(int x)  { if (count == N) return 0; a[(front + count) % N] = x; count++; return 1; }
int deleteFront(void)  { int x = a[front]; front = (front + 1) % N; count--; return x; }
int deleteRear(void)   { int x = a[(front + count - 1) % N]; count--; return x; }

int main(void) {
    insertRear(10); insertRear(20); insertFront(5); insertFront(1);
    printf("Deleted rear %d\n", deleteRear());
    printf("Deleted front %d\n", deleteFront());
    printf("Deque:");
    for (int i = 0; i < count; i++) printf(" %d", a[(front + i) % N]);
    printf("\n");
    return 0;
}
`,
        cpp: R`#include <iostream>
using namespace std;

class Deque {
    static const int N = 5;
    int a[N] = {}, front = 0, count = 0;
public:
    bool insertFront(int x) { if (count == N) return false; front = (front - 1 + N) % N; a[front] = x; count++; return true; }
    bool insertRear(int x)  { if (count == N) return false; a[(front + count) % N] = x; count++; return true; }
    int deleteFront() { int x = a[front]; front = (front + 1) % N; count--; return x; }
    int deleteRear()  { int x = a[(front + count - 1) % N]; count--; return x; }
    void print() const { cout << "Deque:"; for (int i = 0; i < count; i++) cout << " " << a[(front + i) % N]; cout << "\n"; }
};

int main() {
    Deque d;
    d.insertRear(10); d.insertRear(20); d.insertFront(5); d.insertFront(1);
    cout << "Deleted rear " << d.deleteRear() << "\n";
    cout << "Deleted front " << d.deleteFront() << "\n";
    d.print();
    return 0;
}
`,
        java: R`public class Main {
    static final int N = 5;
    static int[] a = new int[N];
    static int front = 0, count = 0;

    static boolean insertFront(int x) { if (count == N) return false; front = (front - 1 + N) % N; a[front] = x; count++; return true; }
    static boolean insertRear(int x)  { if (count == N) return false; a[(front + count) % N] = x; count++; return true; }
    static int deleteFront() { int x = a[front]; front = (front + 1) % N; count--; return x; }
    static int deleteRear()  { int x = a[(front + count - 1) % N]; count--; return x; }

    public static void main(String[] args) {
        insertRear(10); insertRear(20); insertFront(5); insertFront(1);
        System.out.println("Deleted rear " + deleteRear());
        System.out.println("Deleted front " + deleteFront());
        StringBuilder sb = new StringBuilder("Deque:");
        for (int i = 0; i < count; i++) sb.append(" ").append(a[(front + i) % N]);
        System.out.println(sb);
    }
}
`,
        py: R`N = 5
a = [0] * N
front = count = 0


def insert_front(x):
    global front, count
    if count == N:
        return False
    front = (front - 1) % N
    a[front] = x
    count += 1
    return True


def insert_rear(x):
    global count
    if count == N:
        return False
    a[(front + count) % N] = x
    count += 1
    return True


def delete_front():
    global front, count
    x = a[front]
    front = (front + 1) % N
    count -= 1
    return x


def delete_rear():
    global count
    x = a[(front + count - 1) % N]
    count -= 1
    return x


insert_rear(10)
insert_rear(20)
insert_front(5)
insert_front(1)
print("Deleted rear", delete_rear())
print("Deleted front", delete_front())
print("Deque:", *[a[(front + i) % N] for i in range(count)])
`,
      },
    },
  ]);
})();
