/* data/lib2.js — Module II algorithms (linked lists). */
(function () {
  'use strict';
  const R = String.raw;
  DSA.library = DSA.library || {};
  DSA.library[2] = [
    {
      id: 'sll-operations', title: 'Singly linked list: insert, delete, reverse', summary: 'The complete set of basic operations on one list.', tags: ['Singly linked list', 'PYQ'], time: 'O(1) front, O(n) elsewhere', best: '', space: 'O(1)', viz: 'list',
      idea: 'Each node holds a value and a pointer to the next node; `head` points at the first one. All operations are pointer rewiring, never shifting. Reversal turns every pointer around in one pass using three pointers.',
      steps: ['Insert at front: new.next = head; head = new.', 'Insert at end: walk to the last node and link the new node after it.', 'Delete a value: remember the previous node, then prev.next = cur.next (or move head) and free cur.', 'Reverse: prev = NULL; for each node save next, set cur.next = prev, move prev and cur ahead; finally head = prev.'],
      note: 'The pointer assignments must happen in the right order. Link the new node to the old list before you change the old list, or you lose the rest of it.',
      pseudo: ['insertFront(v): node = new Node(v); node.next = head; head = node', 'insertEnd(v): node = new Node(v); if head == NULL: head = node; else walk to last, last.next = node', 'delete(v): prev = NULL; cur = head', '  while cur != NULL and cur.data != v: prev = cur; cur = cur.next', '  if cur == NULL: return;  if prev == NULL: head = cur.next else prev.next = cur.next; free(cur)', 'reverse(): prev = NULL; cur = head', '  while cur != NULL: next = cur.next; cur.next = prev; prev = cur; cur = next', '  head = prev'],
      expect: 'Start: 10 -> 15 -> 23 -> 40 -> 45\nInsert 5 at front: 5 -> 10 -> 15 -> 23 -> 40 -> 45\nInsert 35 after 23: 5 -> 10 -> 15 -> 23 -> 35 -> 40 -> 45\nDelete 45: 5 -> 10 -> 15 -> 23 -> 35 -> 40\nReversed: 40 -> 35 -> 23 -> 15 -> 10 -> 5\n',
      code: {
        c: R`#include <stdio.h>
#include <stdlib.h>

typedef struct Node { int data; struct Node *next; } Node;

Node *newNode(int v) { Node *n = malloc(sizeof(Node)); n->data = v; n->next = NULL; return n; }

void insertFront(Node **head, int v) { Node *n = newNode(v); n->next = *head; *head = n; }

void insertEnd(Node **head, int v) {
    Node *n = newNode(v);
    if (!*head) { *head = n; return; }
    Node *p = *head;
    while (p->next) p = p->next;
    p->next = n;
}

void insertAfter(Node *head, int key, int v) {
    for (Node *p = head; p; p = p->next)
        if (p->data == key) { Node *n = newNode(v); n->next = p->next; p->next = n; return; }
}

void deleteValue(Node **head, int v) {
    Node *prev = NULL, *cur = *head;
    while (cur && cur->data != v) { prev = cur; cur = cur->next; }
    if (!cur) return;
    if (prev) prev->next = cur->next; else *head = cur->next;
    free(cur);
}

void reverse(Node **head) {
    Node *prev = NULL, *cur = *head;
    while (cur) { Node *next = cur->next; cur->next = prev; prev = cur; cur = next; }
    *head = prev;
}

void print(const char *label, Node *head) {
    printf("%s:", label);
    for (Node *p = head; p; p = p->next) printf(p == head ? " %d" : " -> %d", p->data);
    printf("\n");
}

int main(void) {
    Node *head = NULL;
    int init[] = {10, 15, 23, 40, 45};
    for (int i = 0; i < 5; i++) insertEnd(&head, init[i]);
    print("Start", head);
    insertFront(&head, 5);   print("Insert 5 at front", head);
    insertAfter(head, 23, 35); print("Insert 35 after 23", head);
    deleteValue(&head, 45);  print("Delete 45", head);
    reverse(&head);          print("Reversed", head);
    while (head) { Node *t = head; head = head->next; free(t); }
    return 0;
}
`,
        cpp: R`#include <iostream>
#include <string>
using namespace std;

struct Node { int data; Node *next; Node(int v) : data(v), next(nullptr) {} };

struct List {
    Node *head = nullptr;
    ~List() { while (head) { Node *t = head; head = head->next; delete t; } }

    void insertFront(int v) { Node *n = new Node(v); n->next = head; head = n; }
    void insertEnd(int v) {
        Node *n = new Node(v);
        if (!head) { head = n; return; }
        Node *p = head;
        while (p->next) p = p->next;
        p->next = n;
    }
    void insertAfter(int key, int v) {
        for (Node *p = head; p; p = p->next)
            if (p->data == key) { Node *n = new Node(v); n->next = p->next; p->next = n; return; }
    }
    void remove(int v) {
        Node *prev = nullptr, *cur = head;
        while (cur && cur->data != v) { prev = cur; cur = cur->next; }
        if (!cur) return;
        if (prev) prev->next = cur->next; else head = cur->next;
        delete cur;
    }
    void reverse() {
        Node *prev = nullptr, *cur = head;
        while (cur) { Node *next = cur->next; cur->next = prev; prev = cur; cur = next; }
        head = prev;
    }
    void print(const string &label) const {
        cout << label << ":";
        for (Node *p = head; p; p = p->next) cout << (p == head ? " " : " -> ") << p->data;
        cout << "\n";
    }
};

int main() {
    List l;
    for (int v : {10, 15, 23, 40, 45}) l.insertEnd(v);
    l.print("Start");
    l.insertFront(5);     l.print("Insert 5 at front");
    l.insertAfter(23, 35); l.print("Insert 35 after 23");
    l.remove(45);         l.print("Delete 45");
    l.reverse();          l.print("Reversed");
    return 0;
}
`,
        java: R`class Main {
    static class Node {
        int data; Node next;
        Node(int v) { data = v; }
    }

    static Node head;

    static void insertFront(int v) { Node n = new Node(v); n.next = head; head = n; }

    static void insertEnd(int v) {
        Node n = new Node(v);
        if (head == null) { head = n; return; }
        Node p = head;
        while (p.next != null) p = p.next;
        p.next = n;
    }

    static void insertAfter(int key, int v) {
        for (Node p = head; p != null; p = p.next)
            if (p.data == key) { Node n = new Node(v); n.next = p.next; p.next = n; return; }
    }

    static void delete(int v) {
        Node prev = null, cur = head;
        while (cur != null && cur.data != v) { prev = cur; cur = cur.next; }
        if (cur == null) return;
        if (prev != null) prev.next = cur.next; else head = cur.next;
    }

    static void reverse() {
        Node prev = null, cur = head;
        while (cur != null) { Node next = cur.next; cur.next = prev; prev = cur; cur = next; }
        head = prev;
    }

    static void print(String label) {
        StringBuilder sb = new StringBuilder(label + ":");
        for (Node p = head; p != null; p = p.next) sb.append(p == head ? " " : " -> ").append(p.data);
        System.out.println(sb);
    }

    public static void main(String[] args) {
        for (int v : new int[]{10, 15, 23, 40, 45}) insertEnd(v);
        print("Start");
        insertFront(5);      print("Insert 5 at front");
        insertAfter(23, 35); print("Insert 35 after 23");
        delete(45);          print("Delete 45");
        reverse();           print("Reversed");
    }
}
`,
        py: R`class Node:
    def __init__(self, data):
        self.data = data
        self.next = None


class LinkedList:
    def __init__(self):
        self.head = None

    def insert_front(self, v):
        n = Node(v)
        n.next = self.head
        self.head = n

    def insert_end(self, v):
        n = Node(v)
        if self.head is None:
            self.head = n
            return
        p = self.head
        while p.next:
            p = p.next
        p.next = n

    def insert_after(self, key, v):
        p = self.head
        while p:
            if p.data == key:
                n = Node(v)
                n.next = p.next
                p.next = n
                return
            p = p.next

    def delete(self, v):
        prev, cur = None, self.head
        while cur and cur.data != v:
            prev, cur = cur, cur.next
        if cur is None:
            return
        if prev:
            prev.next = cur.next
        else:
            self.head = cur.next

    def reverse(self):
        prev, cur = None, self.head
        while cur:
            cur.next, prev, cur = prev, cur, cur.next
        self.head = prev

    def show(self, label):
        items, p = [], self.head
        while p:
            items.append(str(p.data))
            p = p.next
        print(label + ": " + " -> ".join(items))


lst = LinkedList()
for v in (10, 15, 23, 40, 45):
    lst.insert_end(v)
lst.show("Start")
lst.insert_front(5)
lst.show("Insert 5 at front")
lst.insert_after(23, 35)
lst.show("Insert 35 after 23")
lst.delete(45)
lst.show("Delete 45")
lst.reverse()
lst.show("Reversed")
`,
      },
    },
    {
      id: 'cycle-floyd', title: 'Detect a cycle (Floyd\'s algorithm)', summary: 'Slow and fast pointers: O(n) time, O(1) space.', tags: ['Singly linked list', 'PYQ'], time: 'O(n)', best: '', space: 'O(1)', viz: 'cycle',
      idea: 'Move `slow` one node and `fast` two nodes at a time. If there is no cycle `fast` reaches NULL. If there is a cycle both pointers end up inside it, and since fast gains one node on slow every step, they must meet.',
      steps: ['slow = fast = head.', 'While fast and fast.next exist: slow = slow.next, fast = fast.next.next.', 'If slow == fast: a cycle exists.', 'If the loop ends because fast reached NULL: no cycle.'],
      note: 'A hash set of visited nodes also works but needs O(n) extra space. Floyd needs none.',
      pseudo: ['slow = head; fast = head', 'while fast != NULL and fast.next != NULL:', '  slow = slow.next', '  fast = fast.next.next', '  if slow == fast: return true', 'return false'],
      expect: 'List 1->2->3->4->5->NULL: no cycle\nList 1->2->3->4->5->3 (tail linked to 3): cycle\n',
      code: {
        c: R`#include <stdio.h>
#include <stdlib.h>

typedef struct Node { int data; struct Node *next; } Node;

int hasCycle(Node *head) {
    Node *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return 1;
    }
    return 0;
}

int main(void) {
    Node *n[5];
    for (int i = 0; i < 5; i++) { n[i] = malloc(sizeof(Node)); n[i]->data = i + 1; n[i]->next = NULL; }
    for (int i = 0; i < 4; i++) n[i]->next = n[i + 1];

    printf("List 1->2->3->4->5->NULL: %s\n", hasCycle(n[0]) ? "cycle" : "no cycle");
    n[4]->next = n[2];                       /* tail points back to node 3 */
    printf("List 1->2->3->4->5->3 (tail linked to 3): %s\n", hasCycle(n[0]) ? "cycle" : "no cycle");

    n[4]->next = NULL;                       /* break the loop before freeing */
    for (int i = 0; i < 5; i++) free(n[i]);
    return 0;
}
`,
        cpp: R`#include <iostream>
#include <vector>
using namespace std;

struct Node { int data; Node *next = nullptr; };

bool hasCycle(Node *head) {
    Node *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return true;
    }
    return false;
}

int main() {
    vector<Node> n(5);
    for (int i = 0; i < 5; i++) n[i].data = i + 1;
    for (int i = 0; i < 4; i++) n[i].next = &n[i + 1];

    cout << "List 1->2->3->4->5->NULL: " << (hasCycle(&n[0]) ? "cycle" : "no cycle") << "\n";
    n[4].next = &n[2];                       // tail points back to node 3
    cout << "List 1->2->3->4->5->3 (tail linked to 3): " << (hasCycle(&n[0]) ? "cycle" : "no cycle") << "\n";
    return 0;
}
`,
        java: R`class Main {
    static class Node {
        int data; Node next;
        Node(int d) { data = d; }
    }

    static boolean hasCycle(Node head) {
        Node slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) return true;
        }
        return false;
    }

    public static void main(String[] args) {
        Node[] n = new Node[5];
        for (int i = 0; i < 5; i++) n[i] = new Node(i + 1);
        for (int i = 0; i < 4; i++) n[i].next = n[i + 1];

        System.out.println("List 1->2->3->4->5->NULL: " + (hasCycle(n[0]) ? "cycle" : "no cycle"));
        n[4].next = n[2];                    // tail points back to node 3
        System.out.println("List 1->2->3->4->5->3 (tail linked to 3): " + (hasCycle(n[0]) ? "cycle" : "no cycle"));
    }
}
`,
        py: R`class Node:
    def __init__(self, data):
        self.data = data
        self.next = None


def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True
    return False


n = [Node(i + 1) for i in range(5)]
for i in range(4):
    n[i].next = n[i + 1]

print("List 1->2->3->4->5->NULL:", "cycle" if has_cycle(n[0]) else "no cycle")
n[4].next = n[2]                      # tail points back to node 3
print("List 1->2->3->4->5->3 (tail linked to 3):", "cycle" if has_cycle(n[0]) else "no cycle")
`,
      },
    },
    {
      id: 'dll-operations', title: 'Doubly linked list: insert and delete a node', summary: 'Two pointers per node: walk both ways, delete a node you already hold in O(1).', tags: ['Doubly linked list', 'PYQ'], time: 'O(1) given the node', best: '', space: 'O(1)', viz: 'list',
      idea: 'Each node has `prev` and `next`. To delete a node you only need a pointer to it: join its neighbours to each other. The special cases are the first node (head changes) and the last node (no next).',
      steps: ['Node: data, prev, next.', 'Insert at end: link the new node after the tail and set its prev.', 'Delete node x: if x.prev exists, x.prev.next = x.next, else head = x.next. If x.next exists, x.next.prev = x.prev.', 'Print forward through next and backward through prev to check both chains.'],
      note: 'This is the exact function asked in the Mid Semester 2025 paper (deleteMiddleNode): the node is given by pointer, so no search is needed.',
      pseudo: ['struct DNode { int data; DNode *prev, *next }', 'deleteNode(x):', '  if x.prev != NULL: x.prev.next = x.next  else head = x.next', '  if x.next != NULL: x.next.prev = x.prev', '  free(x)'],
      expect: 'Forward: 10 20 30 40 50\nAfter deleting 30\nForward: 10 20 40 50\nBackward: 50 40 20 10\n',
      code: {
        c: R`#include <stdio.h>
#include <stdlib.h>

struct DNode { int data; struct DNode *prev, *next; };

struct DNode *head = NULL, *tail = NULL;

void insertEnd(int v) {
    struct DNode *n = malloc(sizeof *n);
    n->data = v; n->next = NULL; n->prev = tail;
    if (tail) tail->next = n; else head = n;
    tail = n;
}

/* delete the node we already hold a pointer to: O(1), no search */
void deleteNode(struct DNode *x) {
    if (x->prev) x->prev->next = x->next; else head = x->next;
    if (x->next) x->next->prev = x->prev; else tail = x->prev;
    free(x);
}

void printForward(void) {
    printf("Forward:");
    for (struct DNode *p = head; p; p = p->next) printf(" %d", p->data);
    printf("\n");
}

void printBackward(void) {
    printf("Backward:");
    for (struct DNode *p = tail; p; p = p->prev) printf(" %d", p->data);
    printf("\n");
}

int main(void) {
    for (int v = 10; v <= 50; v += 10) insertEnd(v);
    printForward();
    struct DNode *x = head->next->next;         /* the node holding 30 */
    printf("After deleting %d\n", x->data);
    deleteNode(x);
    printForward();
    printBackward();
    while (head) deleteNode(head);
    return 0;
}
`,
        cpp: R`#include <iostream>
using namespace std;

struct DNode { int data; DNode *prev, *next; };

DNode *head = nullptr, *tail = nullptr;

void insertEnd(int v) {
    DNode *n = new DNode{v, tail, nullptr};
    if (tail) tail->next = n; else head = n;
    tail = n;
}

// delete the node we already hold a pointer to: O(1), no search
void deleteNode(DNode *x) {
    if (x->prev) x->prev->next = x->next; else head = x->next;
    if (x->next) x->next->prev = x->prev; else tail = x->prev;
    delete x;
}

int main() {
    for (int v = 10; v <= 50; v += 10) insertEnd(v);
    cout << "Forward:";
    for (DNode *p = head; p; p = p->next) cout << " " << p->data;
    cout << "\n";

    DNode *x = head->next->next;                // the node holding 30
    cout << "After deleting " << x->data << "\n";
    deleteNode(x);

    cout << "Forward:";
    for (DNode *p = head; p; p = p->next) cout << " " << p->data;
    cout << "\nBackward:";
    for (DNode *p = tail; p; p = p->prev) cout << " " << p->data;
    cout << "\n";
    while (head) deleteNode(head);
    return 0;
}
`,
        java: R`class Main {
    static class DNode {
        int data; DNode prev, next;
        DNode(int d) { data = d; }
    }

    static DNode head, tail;

    static void insertEnd(int v) {
        DNode n = new DNode(v);
        n.prev = tail;
        if (tail != null) tail.next = n; else head = n;
        tail = n;
    }

    // delete the node we already hold a reference to: O(1), no search
    static void deleteNode(DNode x) {
        if (x.prev != null) x.prev.next = x.next; else head = x.next;
        if (x.next != null) x.next.prev = x.prev; else tail = x.prev;
    }

    public static void main(String[] args) {
        for (int v = 10; v <= 50; v += 10) insertEnd(v);
        StringBuilder sb = new StringBuilder("Forward:");
        for (DNode p = head; p != null; p = p.next) sb.append(" ").append(p.data);
        System.out.println(sb);

        DNode x = head.next.next;                  // the node holding 30
        System.out.println("After deleting " + x.data);
        deleteNode(x);

        sb = new StringBuilder("Forward:");
        for (DNode p = head; p != null; p = p.next) sb.append(" ").append(p.data);
        System.out.println(sb);
        sb = new StringBuilder("Backward:");
        for (DNode p = tail; p != null; p = p.prev) sb.append(" ").append(p.data);
        System.out.println(sb);
    }
}
`,
        py: R`class DNode:
    def __init__(self, data):
        self.data = data
        self.prev = None
        self.next = None


head = tail = None


def insert_end(v):
    global head, tail
    n = DNode(v)
    n.prev = tail
    if tail:
        tail.next = n
    else:
        head = n
    tail = n


def delete_node(x):
    """Delete the node we already hold a reference to: O(1), no search."""
    global head, tail
    if x.prev:
        x.prev.next = x.next
    else:
        head = x.next
    if x.next:
        x.next.prev = x.prev
    else:
        tail = x.prev


def forward():
    out, p = [], head
    while p:
        out.append(p.data)
        p = p.next
    return out


def backward():
    out, p = [], tail
    while p:
        out.append(p.data)
        p = p.prev
    return out


for v in range(10, 60, 10):
    insert_end(v)
print("Forward:", *forward())
x = head.next.next                      # the node holding 30
print("After deleting", x.data)
delete_node(x)
print("Forward:", *forward())
print("Backward:", *backward())
`,
      },
    },
    {
      id: 'circular-ll', title: 'Circular linked list: insert at end, delete first', summary: 'Keep a pointer to the last node and both ends are O(1).', tags: ['Circular linked list'], time: 'O(1) with a last pointer', best: '', space: 'O(1)', viz: 'list',
      idea: 'In a circular list the last node points back to the first, so there is no NULL. If we keep a pointer `last` to the last node, then `last.next` is the head, and inserting at either end or deleting the first node needs no walking.',
      steps: ['Empty list: the new node points to itself and last = node.', 'Insert at end: node.next = last.next; last.next = node; last = node.', 'Delete first: if it is the only node, last = NULL; otherwise last.next = last.next.next.', 'Traverse from last.next until you come back to last.next.'],
      note: 'A loop that tests for NULL never ends on a circular list. Stop when the pointer returns to where it started.',
      pseudo: ['insertEnd(v): node = new Node(v)', '  if last == NULL: node.next = node else node.next = last.next; last.next = node', '  last = node', 'deleteFirst():', '  first = last.next', '  if first == last: last = NULL else last.next = first.next', '  free(first)'],
      expect: 'List: 10 20 30 40\nDeleted first (10)\nList: 20 30 40\n',
      code: {
        c: R`#include <stdio.h>
#include <stdlib.h>

typedef struct Node { int data; struct Node *next; } Node;

Node *last = NULL;                      /* last->next is the head */

void insertEnd(int v) {
    Node *n = malloc(sizeof(Node));
    n->data = v;
    if (!last) n->next = n;
    else { n->next = last->next; last->next = n; }
    last = n;
}

int deleteFirst(void) {
    Node *first = last->next;
    int v = first->data;
    if (first == last) last = NULL; else last->next = first->next;
    free(first);
    return v;
}

void print(void) {
    printf("List:");
    if (last) {
        Node *p = last->next;
        do { printf(" %d", p->data); p = p->next; } while (p != last->next);
    }
    printf("\n");
}

int main(void) {
    for (int v = 10; v <= 40; v += 10) insertEnd(v);
    print();
    printf("Deleted first (%d)\n", deleteFirst());
    print();
    while (last) deleteFirst();
    return 0;
}
`,
        cpp: R`#include <iostream>
using namespace std;

struct Node { int data; Node *next; };

Node *last = nullptr;                   // last->next is the head

void insertEnd(int v) {
    Node *n = new Node{v, nullptr};
    if (!last) n->next = n;
    else { n->next = last->next; last->next = n; }
    last = n;
}

int deleteFirst() {
    Node *first = last->next;
    int v = first->data;
    if (first == last) last = nullptr; else last->next = first->next;
    delete first;
    return v;
}

void print() {
    cout << "List:";
    if (last) {
        Node *p = last->next;
        do { cout << " " << p->data; p = p->next; } while (p != last->next);
    }
    cout << "\n";
}

int main() {
    for (int v = 10; v <= 40; v += 10) insertEnd(v);
    print();
    cout << "Deleted first (" << deleteFirst() << ")\n";
    print();
    while (last) deleteFirst();
    return 0;
}
`,
        java: R`class Main {
    static class Node {
        int data; Node next;
        Node(int d) { data = d; }
    }

    static Node last;                   // last.next is the head

    static void insertEnd(int v) {
        Node n = new Node(v);
        if (last == null) n.next = n;
        else { n.next = last.next; last.next = n; }
        last = n;
    }

    static int deleteFirst() {
        Node first = last.next;
        if (first == last) last = null; else last.next = first.next;
        return first.data;
    }

    static void print() {
        StringBuilder sb = new StringBuilder("List:");
        if (last != null) {
            Node p = last.next;
            do { sb.append(" ").append(p.data); p = p.next; } while (p != last.next);
        }
        System.out.println(sb);
    }

    public static void main(String[] args) {
        for (int v = 10; v <= 40; v += 10) insertEnd(v);
        print();
        System.out.println("Deleted first (" + deleteFirst() + ")");
        print();
    }
}
`,
        py: R`class Node:
    def __init__(self, data):
        self.data = data
        self.next = None


last = None                              # last.next is the head


def insert_end(v):
    global last
    n = Node(v)
    if last is None:
        n.next = n
    else:
        n.next = last.next
        last.next = n
    last = n


def delete_first():
    global last
    first = last.next
    if first is last:
        last = None
    else:
        last.next = first.next
    return first.data


def show():
    out = []
    if last:
        p = last.next
        while True:
            out.append(p.data)
            p = p.next
            if p is last.next:
                break
    print("List:", *out)


for v in range(10, 50, 10):
    insert_end(v)
show()
print("Deleted first (%d)" % delete_first())
show()
`,
      },
    },
  ];
})();
