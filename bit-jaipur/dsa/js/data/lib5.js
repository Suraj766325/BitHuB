/* data/lib5.js — Module V algorithms (trees, heap, disjoint set, graphs). */
(function () {
  'use strict';
  const R = String.raw;
  DSA.library = DSA.library || {};
  DSA.library[5] = [
    {
      id: 'bst-operations', title: 'Binary search tree: insert, search, delete, traversals', summary: 'Everything on a BST in one program.', tags: ['BST', 'Tree', 'PYQ'], time: 'O(h)', best: 'O(log n) balanced', space: 'O(h)', viz: 'tree',
      idea: 'In a BST the left subtree of a node holds smaller keys and the right subtree larger ones. Search, insert and delete each follow one path from the root, so they cost O(height). Deleting a node with two children replaces its key by the inorder successor (the smallest key in the right subtree) and deletes that node instead.',
      steps: ['Insert: go left if the key is smaller, right if larger, and attach it where the path ends.', 'Search: same path; found when the key matches, absent when the path reaches NULL.', 'Delete: leaf → remove; one child → the child takes its place; two children → copy the inorder successor, then delete it from the right subtree.', 'Inorder (left, node, right) prints a BST in sorted order; preorder is node, left, right; postorder is left, right, node.'],
      note: 'The sequence 50, 30, 70, 20, 40, 60, 80 from the End Semester 2025 paper builds a perfectly balanced tree; inserting it in sorted order would give a chain of height n.',
      pseudo: ['insert(node, k): if node == NULL: return new Node(k)', '  if k < node.key: node.left = insert(node.left, k) else node.right = insert(node.right, k)', '  return node', 'search(node, k): while node != NULL: if k == node.key: return node else go left or right', 'delete(node, k): find node', '  if no left child: return node.right;  if no right child: return node.left', '  s = leftmost node of node.right; node.key = s.key; node.right = delete(node.right, s.key)', 'inorder(node): inorder(left); visit(node); inorder(right)'],
      expect: 'Inorder: 20 30 40 50 60 70 80\nPreorder: 50 30 20 40 70 60 80\nPostorder: 20 40 30 60 80 70 50\nSearch 60: found\nSearch 65: not found\nAfter deleting 20, 30 and 50, inorder: 40 60 70 80\nPreorder: 60 40 70 80\n',
      code: {
        c: R`#include <stdio.h>
#include <stdlib.h>

typedef struct Node { int key; struct Node *left, *right; } Node;

Node *newNode(int k) { Node *n = calloc(1, sizeof(Node)); n->key = k; return n; }

Node *insert(Node *root, int k) {
    if (!root) return newNode(k);
    if (k < root->key) root->left = insert(root->left, k);
    else if (k > root->key) root->right = insert(root->right, k);
    return root;
}

int search(Node *root, int k) {
    while (root) {
        if (k == root->key) return 1;
        root = k < root->key ? root->left : root->right;
    }
    return 0;
}

Node *minNode(Node *n) { while (n->left) n = n->left; return n; }

Node *delete(Node *root, int k) {
    if (!root) return NULL;
    if (k < root->key) root->left = delete(root->left, k);
    else if (k > root->key) root->right = delete(root->right, k);
    else if (!root->left) { Node *r = root->right; free(root); return r; }
    else if (!root->right) { Node *l = root->left; free(root); return l; }
    else { Node *s = minNode(root->right); root->key = s->key; root->right = delete(root->right, s->key); }
    return root;
}

void inorder(Node *n)   { if (n) { inorder(n->left);  printf(" %d", n->key); inorder(n->right); } }
void preorder(Node *n)  { if (n) { printf(" %d", n->key); preorder(n->left);  preorder(n->right); } }
void postorder(Node *n) { if (n) { postorder(n->left); postorder(n->right); printf(" %d", n->key); } }
void destroy(Node *n)   { if (n) { destroy(n->left); destroy(n->right); free(n); } }

int main(void) {
    Node *root = NULL;
    int keys[] = {50, 30, 70, 20, 40, 60, 80};
    for (int i = 0; i < 7; i++) root = insert(root, keys[i]);

    printf("Inorder:");   inorder(root);   printf("\n");
    printf("Preorder:");  preorder(root);  printf("\n");
    printf("Postorder:"); postorder(root); printf("\n");
    printf("Search 60: %s\n", search(root, 60) ? "found" : "not found");
    printf("Search 65: %s\n", search(root, 65) ? "found" : "not found");

    root = delete(root, 20);     /* leaf */
    root = delete(root, 30);     /* one child */
    root = delete(root, 50);     /* two children (the root) */
    printf("After deleting 20, 30 and 50, inorder:"); inorder(root); printf("\n");
    printf("Preorder:"); preorder(root); printf("\n");
    destroy(root);
    return 0;
}
`,
        cpp: R`#include <iostream>
using namespace std;

struct Node {
    int key; Node *left = nullptr, *right = nullptr;
    Node(int k) : key(k) {}
};

Node *insert(Node *root, int k) {
    if (!root) return new Node(k);
    if (k < root->key) root->left = insert(root->left, k);
    else if (k > root->key) root->right = insert(root->right, k);
    return root;
}

bool search(Node *root, int k) {
    while (root) {
        if (k == root->key) return true;
        root = k < root->key ? root->left : root->right;
    }
    return false;
}

Node *minNode(Node *n) { while (n->left) n = n->left; return n; }

Node *remove(Node *root, int k) {
    if (!root) return nullptr;
    if (k < root->key) root->left = remove(root->left, k);
    else if (k > root->key) root->right = remove(root->right, k);
    else if (!root->left) { Node *r = root->right; delete root; return r; }
    else if (!root->right) { Node *l = root->left; delete root; return l; }
    else { Node *s = minNode(root->right); root->key = s->key; root->right = remove(root->right, s->key); }
    return root;
}

void inorder(Node *n)   { if (n) { inorder(n->left);  cout << " " << n->key; inorder(n->right); } }
void preorder(Node *n)  { if (n) { cout << " " << n->key; preorder(n->left);  preorder(n->right); } }
void postorder(Node *n) { if (n) { postorder(n->left); postorder(n->right); cout << " " << n->key; } }
void destroy(Node *n)   { if (n) { destroy(n->left); destroy(n->right); delete n; } }

int main() {
    Node *root = nullptr;
    for (int k : {50, 30, 70, 20, 40, 60, 80}) root = insert(root, k);

    cout << "Inorder:";   inorder(root);   cout << "\n";
    cout << "Preorder:";  preorder(root);  cout << "\n";
    cout << "Postorder:"; postorder(root); cout << "\n";
    cout << "Search 60: " << (search(root, 60) ? "found" : "not found") << "\n";
    cout << "Search 65: " << (search(root, 65) ? "found" : "not found") << "\n";

    root = remove(root, 20);     // leaf
    root = remove(root, 30);     // one child
    root = remove(root, 50);     // two children (the root)
    cout << "After deleting 20, 30 and 50, inorder:"; inorder(root); cout << "\n";
    cout << "Preorder:"; preorder(root); cout << "\n";
    destroy(root);
    return 0;
}
`,
        java: R`class Main {
    static class Node {
        int key; Node left, right;
        Node(int k) { key = k; }
    }

    static Node insert(Node root, int k) {
        if (root == null) return new Node(k);
        if (k < root.key) root.left = insert(root.left, k);
        else if (k > root.key) root.right = insert(root.right, k);
        return root;
    }

    static boolean search(Node root, int k) {
        while (root != null) {
            if (k == root.key) return true;
            root = k < root.key ? root.left : root.right;
        }
        return false;
    }

    static Node minNode(Node n) { while (n.left != null) n = n.left; return n; }

    static Node delete(Node root, int k) {
        if (root == null) return null;
        if (k < root.key) root.left = delete(root.left, k);
        else if (k > root.key) root.right = delete(root.right, k);
        else if (root.left == null) return root.right;
        else if (root.right == null) return root.left;
        else { Node s = minNode(root.right); root.key = s.key; root.right = delete(root.right, s.key); }
        return root;
    }

    static StringBuilder out = new StringBuilder();
    static void inorder(Node n)   { if (n != null) { inorder(n.left);  out.append(" ").append(n.key); inorder(n.right); } }
    static void preorder(Node n)  { if (n != null) { out.append(" ").append(n.key); preorder(n.left);  preorder(n.right); } }
    static void postorder(Node n) { if (n != null) { postorder(n.left); postorder(n.right); out.append(" ").append(n.key); } }

    static void show(String label, int which, Node root) {
        out = new StringBuilder(label);
        if (which == 0) inorder(root); else if (which == 1) preorder(root); else postorder(root);
        System.out.println(out);
    }

    public static void main(String[] args) {
        Node root = null;
        for (int k : new int[]{50, 30, 70, 20, 40, 60, 80}) root = insert(root, k);

        show("Inorder:", 0, root);
        show("Preorder:", 1, root);
        show("Postorder:", 2, root);
        System.out.println("Search 60: " + (search(root, 60) ? "found" : "not found"));
        System.out.println("Search 65: " + (search(root, 65) ? "found" : "not found"));

        root = delete(root, 20);     // leaf
        root = delete(root, 30);     // one child
        root = delete(root, 50);     // two children (the root)
        show("After deleting 20, 30 and 50, inorder:", 0, root);
        show("Preorder:", 1, root);
    }
}
`,
        py: R`class Node:
    def __init__(self, key):
        self.key, self.left, self.right = key, None, None


def insert(root, k):
    if root is None:
        return Node(k)
    if k < root.key:
        root.left = insert(root.left, k)
    elif k > root.key:
        root.right = insert(root.right, k)
    return root


def search(root, k):
    while root:
        if k == root.key:
            return True
        root = root.left if k < root.key else root.right
    return False


def min_node(n):
    while n.left:
        n = n.left
    return n


def delete(root, k):
    if root is None:
        return None
    if k < root.key:
        root.left = delete(root.left, k)
    elif k > root.key:
        root.right = delete(root.right, k)
    elif root.left is None:
        return root.right
    elif root.right is None:
        return root.left
    else:
        s = min_node(root.right)
        root.key = s.key
        root.right = delete(root.right, s.key)
    return root


def inorder(n):
    return inorder(n.left) + [n.key] + inorder(n.right) if n else []


def preorder(n):
    return [n.key] + preorder(n.left) + preorder(n.right) if n else []


def postorder(n):
    return postorder(n.left) + postorder(n.right) + [n.key] if n else []


root = None
for k in (50, 30, 70, 20, 40, 60, 80):
    root = insert(root, k)

print("Inorder:", *inorder(root))
print("Preorder:", *preorder(root))
print("Postorder:", *postorder(root))
print("Search 60:", "found" if search(root, 60) else "not found")
print("Search 65:", "found" if search(root, 65) else "not found")

root = delete(root, 20)     # leaf
root = delete(root, 30)     # one child
root = delete(root, 50)     # two children (the root)
print("After deleting 20, 30 and 50, inorder:", *inorder(root))
print("Preorder:", *preorder(root))
`,
      },
    },
    {
      id: 'avl-insert', title: 'AVL tree insertion with rotations', summary: 'Keep every balance factor within −1…+1 by rotating.', tags: ['AVL', 'Balanced tree'], time: 'O(log n)', best: '', space: 'O(log n)', viz: 'tree',
      idea: 'An AVL tree is a BST where the heights of the left and right subtrees of every node differ by at most 1. After a normal BST insert, walk back up updating heights. The first node whose balance factor (height of left − height of right) becomes +2 or −2 is fixed by one or two rotations, which restores the balance without breaking the BST order.',
      steps: ['Insert as in a BST, then update the height of each ancestor.', 'bf > 1 and the new key went to the left of the left child: right rotation (LL).', 'bf < −1 and the key went to the right of the right child: left rotation (RR).', 'bf > 1 and the key went to the right of the left child: left-rotate the left child, then right-rotate (LR).', 'bf < −1 and the key went to the left of the right child: right-rotate the right child, then left-rotate (RL).'],
      note: 'Inserting 10, 20, 30, 40, 50, 25 into a plain BST gives a chain of height 5; AVL keeps the height at 3.',
      pseudo: ['insert(node, k): BST insert, then', '  update height(node)', '  bf = height(node.left) - height(node.right)', '  if bf > 1 and k < node.left.key: return rotateRight(node)', '  if bf < -1 and k > node.right.key: return rotateLeft(node)', '  if bf > 1 and k > node.left.key: node.left = rotateLeft(node.left); return rotateRight(node)', '  if bf < -1 and k < node.right.key: node.right = rotateRight(node.right); return rotateLeft(node)', '  return node'],
      expect: 'Preorder: 30 20 10 25 40 50\nHeight: 3\n',
      code: {
        c: R`#include <stdio.h>
#include <stdlib.h>

typedef struct Node { int key, height; struct Node *left, *right; } Node;

int height(Node *n) { return n ? n->height : 0; }
int max(int a, int b) { return a > b ? a : b; }
void update(Node *n) { n->height = 1 + max(height(n->left), height(n->right)); }
int balance(Node *n) { return n ? height(n->left) - height(n->right) : 0; }

Node *rotateRight(Node *y) {
    Node *x = y->left;
    y->left = x->right;
    x->right = y;
    update(y); update(x);
    return x;
}

Node *rotateLeft(Node *x) {
    Node *y = x->right;
    x->right = y->left;
    y->left = x;
    update(x); update(y);
    return y;
}

Node *insert(Node *node, int k) {
    if (!node) { Node *n = calloc(1, sizeof(Node)); n->key = k; n->height = 1; return n; }
    if (k < node->key) node->left = insert(node->left, k);
    else if (k > node->key) node->right = insert(node->right, k);
    else return node;

    update(node);
    int bf = balance(node);
    if (bf > 1 && k < node->left->key) return rotateRight(node);                                  /* LL */
    if (bf < -1 && k > node->right->key) return rotateLeft(node);                                 /* RR */
    if (bf > 1 && k > node->left->key) { node->left = rotateLeft(node->left); return rotateRight(node); }    /* LR */
    if (bf < -1 && k < node->right->key) { node->right = rotateRight(node->right); return rotateLeft(node); } /* RL */
    return node;
}

void preorder(Node *n) { if (n) { printf(" %d", n->key); preorder(n->left); preorder(n->right); } }
void destroy(Node *n) { if (n) { destroy(n->left); destroy(n->right); free(n); } }

int main(void) {
    Node *root = NULL;
    int keys[] = {10, 20, 30, 40, 50, 25};
    for (int i = 0; i < 6; i++) root = insert(root, keys[i]);
    printf("Preorder:"); preorder(root); printf("\n");
    printf("Height: %d\n", height(root));
    destroy(root);
    return 0;
}
`,
        cpp: R`#include <algorithm>
#include <iostream>
using namespace std;

struct Node {
    int key, height = 1; Node *left = nullptr, *right = nullptr;
    Node(int k) : key(k) {}
};

int height(Node *n) { return n ? n->height : 0; }
void update(Node *n) { n->height = 1 + max(height(n->left), height(n->right)); }
int balance(Node *n) { return n ? height(n->left) - height(n->right) : 0; }

Node *rotateRight(Node *y) {
    Node *x = y->left;
    y->left = x->right;
    x->right = y;
    update(y); update(x);
    return x;
}

Node *rotateLeft(Node *x) {
    Node *y = x->right;
    x->right = y->left;
    y->left = x;
    update(x); update(y);
    return y;
}

Node *insert(Node *node, int k) {
    if (!node) return new Node(k);
    if (k < node->key) node->left = insert(node->left, k);
    else if (k > node->key) node->right = insert(node->right, k);
    else return node;

    update(node);
    int bf = balance(node);
    if (bf > 1 && k < node->left->key) return rotateRight(node);                                  // LL
    if (bf < -1 && k > node->right->key) return rotateLeft(node);                                 // RR
    if (bf > 1 && k > node->left->key) { node->left = rotateLeft(node->left); return rotateRight(node); }     // LR
    if (bf < -1 && k < node->right->key) { node->right = rotateRight(node->right); return rotateLeft(node); } // RL
    return node;
}

void preorder(Node *n) { if (n) { cout << " " << n->key; preorder(n->left); preorder(n->right); } }
void destroy(Node *n) { if (n) { destroy(n->left); destroy(n->right); delete n; } }

int main() {
    Node *root = nullptr;
    for (int k : {10, 20, 30, 40, 50, 25}) root = insert(root, k);
    cout << "Preorder:"; preorder(root); cout << "\n";
    cout << "Height: " << height(root) << "\n";
    destroy(root);
    return 0;
}
`,
        java: R`class Main {
    static class Node {
        int key, height = 1; Node left, right;
        Node(int k) { key = k; }
    }

    static int height(Node n) { return n == null ? 0 : n.height; }
    static void update(Node n) { n.height = 1 + Math.max(height(n.left), height(n.right)); }
    static int balance(Node n) { return n == null ? 0 : height(n.left) - height(n.right); }

    static Node rotateRight(Node y) {
        Node x = y.left;
        y.left = x.right;
        x.right = y;
        update(y); update(x);
        return x;
    }

    static Node rotateLeft(Node x) {
        Node y = x.right;
        x.right = y.left;
        y.left = x;
        update(x); update(y);
        return y;
    }

    static Node insert(Node node, int k) {
        if (node == null) return new Node(k);
        if (k < node.key) node.left = insert(node.left, k);
        else if (k > node.key) node.right = insert(node.right, k);
        else return node;

        update(node);
        int bf = balance(node);
        if (bf > 1 && k < node.left.key) return rotateRight(node);                                  // LL
        if (bf < -1 && k > node.right.key) return rotateLeft(node);                                 // RR
        if (bf > 1 && k > node.left.key) { node.left = rotateLeft(node.left); return rotateRight(node); }      // LR
        if (bf < -1 && k < node.right.key) { node.right = rotateRight(node.right); return rotateLeft(node); }  // RL
        return node;
    }

    static StringBuilder sb = new StringBuilder("Preorder:");
    static void preorder(Node n) { if (n != null) { sb.append(" ").append(n.key); preorder(n.left); preorder(n.right); } }

    public static void main(String[] args) {
        Node root = null;
        for (int k : new int[]{10, 20, 30, 40, 50, 25}) root = insert(root, k);
        preorder(root);
        System.out.println(sb);
        System.out.println("Height: " + height(root));
    }
}
`,
        py: R`class Node:
    def __init__(self, key):
        self.key, self.height, self.left, self.right = key, 1, None, None


def height(n):
    return n.height if n else 0


def update(n):
    n.height = 1 + max(height(n.left), height(n.right))


def balance(n):
    return height(n.left) - height(n.right) if n else 0


def rotate_right(y):
    x = y.left
    y.left, x.right = x.right, y
    update(y)
    update(x)
    return x


def rotate_left(x):
    y = x.right
    x.right, y.left = y.left, x
    update(x)
    update(y)
    return y


def insert(node, k):
    if node is None:
        return Node(k)
    if k < node.key:
        node.left = insert(node.left, k)
    elif k > node.key:
        node.right = insert(node.right, k)
    else:
        return node

    update(node)
    bf = balance(node)
    if bf > 1 and k < node.left.key:                      # LL
        return rotate_right(node)
    if bf < -1 and k > node.right.key:                    # RR
        return rotate_left(node)
    if bf > 1 and k > node.left.key:                      # LR
        node.left = rotate_left(node.left)
        return rotate_right(node)
    if bf < -1 and k < node.right.key:                    # RL
        node.right = rotate_right(node.right)
        return rotate_left(node)
    return node


def preorder(n):
    return [n.key] + preorder(n.left) + preorder(n.right) if n else []


root = None
for k in (10, 20, 30, 40, 50, 25):
    root = insert(root, k)
print("Preorder:", *preorder(root))
print("Height:", height(root))
`,
      },
    },
    {
      id: 'heap-operations', title: 'Max-heap: insert and extract', summary: 'Sift up after inserting, sift down after removing the root.', tags: ['Heap', 'Priority queue'], time: 'O(log n)', best: '', space: 'O(1)', viz: 'heap',
      idea: 'A heap stored in an array keeps its largest value at index 0. Insert places the new value at the end and swaps it upward while it is larger than its parent. Extract-max takes the root, moves the last value to the root and swaps it downward with the larger child until the order is restored.',
      steps: ['Parent of i is (i − 1) / 2; children are 2i + 1 and 2i + 2.', 'Insert: a[n] = x; sift up while a[i] > a[parent].', 'Extract: save a[0]; a[0] = a[n − 1]; n−−; sift down from 0.'],
      note: 'A priority queue is usually implemented with exactly this heap.',
      pseudo: ['insert(x): a[n] = x; i = n; n = n + 1', '  while i > 0 and a[i] > a[(i - 1) / 2]: swap a[i], a[(i - 1) / 2]; i = (i - 1) / 2', 'extract(): top = a[0]; n = n - 1; a[0] = a[n]; siftDown(0)', '  siftDown(i): while a child is larger than a[i]: swap with the larger child'],
      expect: 'Heap: 90 40 70 10 30 20 50\nExtract: 90\nExtract: 70\nExtract: 50\nHeap: 40 30 20 10\n',
      code: {
        c: R`#include <stdio.h>

int a[32], n = 0;

void insert(int x) {
    int i = n++;
    a[i] = x;
    while (i > 0 && a[i] > a[(i - 1) / 2]) {
        int p = (i - 1) / 2, t = a[i]; a[i] = a[p]; a[p] = t;
        i = p;
    }
}

int extract(void) {
    int top = a[0];
    a[0] = a[--n];
    int i = 0;
    for (;;) {
        int l = 2 * i + 1, r = l + 1, big = i;
        if (l < n && a[l] > a[big]) big = l;
        if (r < n && a[r] > a[big]) big = r;
        if (big == i) break;
        int t = a[i]; a[i] = a[big]; a[big] = t;
        i = big;
    }
    return top;
}

void print(void) {
    printf("Heap:");
    for (int i = 0; i < n; i++) printf(" %d", a[i]);
    printf("\n");
}

int main(void) {
    int xs[] = {50, 30, 20, 10, 40, 70, 90};
    for (int i = 0; i < 7; i++) insert(xs[i]);
    print();
    for (int i = 0; i < 3; i++) printf("Extract: %d\n", extract());
    print();
    return 0;
}
`,
        cpp: R`#include <iostream>
#include <vector>
using namespace std;

vector<int> a;

void insert(int x) {
    a.push_back(x);
    int i = a.size() - 1;
    while (i > 0 && a[i] > a[(i - 1) / 2]) { swap(a[i], a[(i - 1) / 2]); i = (i - 1) / 2; }
}

int extract() {
    int top = a[0];
    a[0] = a.back();
    a.pop_back();
    int n = a.size(), i = 0;
    for (;;) {
        int l = 2 * i + 1, r = l + 1, big = i;
        if (l < n && a[l] > a[big]) big = l;
        if (r < n && a[r] > a[big]) big = r;
        if (big == i) break;
        swap(a[i], a[big]);
        i = big;
    }
    return top;
}

void print() {
    cout << "Heap:";
    for (int x : a) cout << " " << x;
    cout << "\n";
}

int main() {
    for (int x : {50, 30, 20, 10, 40, 70, 90}) insert(x);
    print();
    for (int i = 0; i < 3; i++) cout << "Extract: " << extract() << "\n";
    print();
    return 0;
}
`,
        java: R`import java.util.*;

class Main {
    static ArrayList<Integer> a = new ArrayList<>();

    static void swap(int i, int j) { int t = a.get(i); a.set(i, a.get(j)); a.set(j, t); }

    static void insert(int x) {
        a.add(x);
        int i = a.size() - 1;
        while (i > 0 && a.get(i) > a.get((i - 1) / 2)) { swap(i, (i - 1) / 2); i = (i - 1) / 2; }
    }

    static int extract() {
        int top = a.get(0);
        a.set(0, a.get(a.size() - 1));
        a.remove(a.size() - 1);
        int n = a.size(), i = 0;
        for (;;) {
            int l = 2 * i + 1, r = l + 1, big = i;
            if (l < n && a.get(l) > a.get(big)) big = l;
            if (r < n && a.get(r) > a.get(big)) big = r;
            if (big == i) break;
            swap(i, big);
            i = big;
        }
        return top;
    }

    static void print() {
        StringBuilder sb = new StringBuilder("Heap:");
        for (int x : a) sb.append(" ").append(x);
        System.out.println(sb);
    }

    public static void main(String[] args) {
        for (int x : new int[]{50, 30, 20, 10, 40, 70, 90}) insert(x);
        print();
        for (int i = 0; i < 3; i++) System.out.println("Extract: " + extract());
        print();
    }
}
`,
        py: R`a = []


def insert(x):
    a.append(x)
    i = len(a) - 1
    while i > 0 and a[i] > a[(i - 1) // 2]:
        a[i], a[(i - 1) // 2] = a[(i - 1) // 2], a[i]
        i = (i - 1) // 2


def extract():
    top = a[0]
    a[0] = a[-1]
    a.pop()
    n, i = len(a), 0
    while True:
        l, r, big = 2 * i + 1, 2 * i + 2, i
        if l < n and a[l] > a[big]:
            big = l
        if r < n and a[r] > a[big]:
            big = r
        if big == i:
            break
        a[i], a[big] = a[big], a[i]
        i = big
    return top


for x in (50, 30, 20, 10, 40, 70, 90):
    insert(x)
print("Heap:", *a)
for _ in range(3):
    print("Extract:", extract())
print("Heap:", *a)
`,
      },
    },
    {
      id: 'bfs-dfs', title: 'Breadth-first and depth-first search', summary: 'Visit every reachable vertex: queue for BFS, stack (or recursion) for DFS.', tags: ['Graph', 'PYQ'], time: 'O(V + E)', best: '', space: 'O(V)', viz: 'graph',
      idea: 'BFS starts at a vertex, visits all its neighbours, then their neighbours, level by level, using a queue; it finds the fewest-edge path in an unweighted graph. DFS goes as deep as possible along one path before backing up, using recursion or a stack. Both mark vertices as visited so none is processed twice.',
      steps: ['BFS: enqueue the start and mark it. Repeatedly dequeue a vertex, visit it, and enqueue every unvisited neighbour (marking it at once).', 'DFS: visit a vertex, mark it, and recursively visit each unvisited neighbour in turn.', 'With an adjacency list both take O(V + E).'],
      note: 'For the End Semester 2025 adjacency list A→[B,C], B→[A,D], C→[A,E], D→[B,F], E→[C], F→[D], BFS from A visits A, B, C, D, E, F.',
      pseudo: ['BFS(start): mark start; enqueue start', '  while queue not empty: u = dequeue(); visit u', '    for each neighbour w of u: if w not marked: mark w; enqueue w', 'DFS(u): mark u; visit u', '  for each neighbour w of u: if w not marked: DFS(w)'],
      expect: 'BFS from A: A B C D E F\nDFS from A: A B D F C E\n',
      code: {
        c: R`#include <stdio.h>

#define V 6
/* vertices A..F are 0..5; adjacency matrix of the graph A-[B,C], B-[A,D], C-[A,E], D-[B,F], E-[C], F-[D] */
int adj[V][V] = {
    {0, 1, 1, 0, 0, 0},
    {1, 0, 0, 1, 0, 0},
    {1, 0, 0, 0, 1, 0},
    {0, 1, 0, 0, 0, 1},
    {0, 0, 1, 0, 0, 0},
    {0, 0, 0, 1, 0, 0},
};
int visited[V];

void bfs(int start) {
    int queue[V], front = 0, rear = 0;
    for (int i = 0; i < V; i++) visited[i] = 0;
    visited[start] = 1; queue[rear++] = start;
    printf("BFS from %c:", 'A' + start);
    while (front < rear) {
        int u = queue[front++];
        printf(" %c", 'A' + u);
        for (int w = 0; w < V; w++)
            if (adj[u][w] && !visited[w]) { visited[w] = 1; queue[rear++] = w; }
    }
    printf("\n");
}

void dfs(int u) {
    visited[u] = 1;
    printf(" %c", 'A' + u);
    for (int w = 0; w < V; w++)
        if (adj[u][w] && !visited[w]) dfs(w);
}

int main(void) {
    bfs(0);
    for (int i = 0; i < V; i++) visited[i] = 0;
    printf("DFS from A:");
    dfs(0);
    printf("\n");
    return 0;
}
`,
        cpp: R`#include <iostream>
#include <queue>
#include <vector>
using namespace std;

// vertices A..F are 0..5
vector<vector<int>> adj = {{1, 2}, {0, 3}, {0, 4}, {1, 5}, {2}, {3}};
vector<bool> visited(6);

void bfs(int start) {
    fill(visited.begin(), visited.end(), false);
    queue<int> q;
    visited[start] = true; q.push(start);
    cout << "BFS from " << char('A' + start) << ":";
    while (!q.empty()) {
        int u = q.front(); q.pop();
        cout << " " << char('A' + u);
        for (int w : adj[u]) if (!visited[w]) { visited[w] = true; q.push(w); }
    }
    cout << "\n";
}

void dfs(int u) {
    visited[u] = true;
    cout << " " << char('A' + u);
    for (int w : adj[u]) if (!visited[w]) dfs(w);
}

int main() {
    bfs(0);
    fill(visited.begin(), visited.end(), false);
    cout << "DFS from A:";
    dfs(0);
    cout << "\n";
    return 0;
}
`,
        java: R`import java.util.*;

class Main {
    // vertices A..F are 0..5
    static int[][] adj = {{1, 2}, {0, 3}, {0, 4}, {1, 5}, {2}, {3}};
    static boolean[] visited = new boolean[6];
    static StringBuilder out;

    static void bfs(int start) {
        Arrays.fill(visited, false);
        Deque<Integer> q = new ArrayDeque<>();
        visited[start] = true; q.add(start);
        StringBuilder sb = new StringBuilder("BFS from " + (char) ('A' + start) + ":");
        while (!q.isEmpty()) {
            int u = q.poll();
            sb.append(" ").append((char) ('A' + u));
            for (int w : adj[u]) if (!visited[w]) { visited[w] = true; q.add(w); }
        }
        System.out.println(sb);
    }

    static void dfs(int u) {
        visited[u] = true;
        out.append(" ").append((char) ('A' + u));
        for (int w : adj[u]) if (!visited[w]) dfs(w);
    }

    public static void main(String[] args) {
        bfs(0);
        Arrays.fill(visited, false);
        out = new StringBuilder("DFS from A:");
        dfs(0);
        System.out.println(out);
    }
}
`,
        py: R`from collections import deque

# vertices A..F
adj = {"A": ["B", "C"], "B": ["A", "D"], "C": ["A", "E"], "D": ["B", "F"], "E": ["C"], "F": ["D"]}


def bfs(start):
    seen, order, q = {start}, [], deque([start])
    while q:
        u = q.popleft()
        order.append(u)
        for w in adj[u]:
            if w not in seen:
                seen.add(w)
                q.append(w)
    return order


def dfs(u, seen, order):
    seen.add(u)
    order.append(u)
    for w in adj[u]:
        if w not in seen:
            dfs(w, seen, order)
    return order


print("BFS from A:", *bfs("A"))
print("DFS from A:", *dfs("A", set(), []))
`,
      },
    },
    {
      id: 'union-find', title: 'Disjoint set (union-find)', summary: 'Union by rank with path compression.', tags: ['Disjoint set'], time: 'α(n) ≈ O(1)', best: '', space: 'O(n)', viz: 'dsu',
      idea: 'Each set is a tree and parent[x] points towards its root, the representative. find(x) follows parents to the root; union(x, y) makes one root the parent of the other. Attaching the shorter tree under the taller one (union by rank) keeps trees shallow, and path compression makes every node on a find path point straight at the root.',
      steps: ['makeSet: parent[i] = i, rank[i] = 0.', 'find(x): if parent[x] != x then parent[x] = find(parent[x]); return parent[x].', 'union(x, y): rx = find(x), ry = find(y); if equal do nothing; attach the lower-rank root under the higher-rank one; if ranks are equal, pick one and increase its rank.'],
      note: 'It is the data structure behind Kruskal\'s algorithm: an edge that joins two nodes with the same root would create a cycle.',
      pseudo: ['find(x): if parent[x] != x: parent[x] = find(parent[x])', '         return parent[x]', 'union(x, y): rx = find(x); ry = find(y); if rx == ry: return false', '  if rank[rx] < rank[ry]: swap rx, ry', '  parent[ry] = rx; if rank[rx] == rank[ry]: rank[rx] = rank[rx] + 1; return true'],
      expect: 'union(1,2) = merged\nunion(3,4) = merged\nunion(2,4) = merged\nunion(1,3) = already together\nSame set(1,4): yes\nSame set(1,5): no\n',
      code: {
        c: R`#include <stdio.h>

int parent[10], rnk[10];

int find(int x) {
    if (parent[x] != x) parent[x] = find(parent[x]);   /* path compression */
    return parent[x];
}

int unite(int x, int y) {
    int rx = find(x), ry = find(y);
    if (rx == ry) return 0;
    if (rnk[rx] < rnk[ry]) { int t = rx; rx = ry; ry = t; }
    parent[ry] = rx;
    if (rnk[rx] == rnk[ry]) rnk[rx]++;
    return 1;
}

int main(void) {
    for (int i = 0; i < 10; i++) { parent[i] = i; rnk[i] = 0; }
    int pairs[][2] = {{1, 2}, {3, 4}, {2, 4}, {1, 3}};
    for (int i = 0; i < 4; i++)
        printf("union(%d,%d) = %s\n", pairs[i][0], pairs[i][1], unite(pairs[i][0], pairs[i][1]) ? "merged" : "already together");
    printf("Same set(1,4): %s\n", find(1) == find(4) ? "yes" : "no");
    printf("Same set(1,5): %s\n", find(1) == find(5) ? "yes" : "no");
    return 0;
}
`,
        cpp: R`#include <iostream>
#include <numeric>
#include <vector>
using namespace std;

vector<int> parent(10), rnk(10, 0);

int find(int x) {
    if (parent[x] != x) parent[x] = find(parent[x]);   // path compression
    return parent[x];
}

bool unite(int x, int y) {
    int rx = find(x), ry = find(y);
    if (rx == ry) return false;
    if (rnk[rx] < rnk[ry]) swap(rx, ry);
    parent[ry] = rx;
    if (rnk[rx] == rnk[ry]) rnk[rx]++;
    return true;
}

int main() {
    iota(parent.begin(), parent.end(), 0);
    for (auto [x, y] : vector<pair<int, int>>{{1, 2}, {3, 4}, {2, 4}, {1, 3}})
        cout << "union(" << x << "," << y << ") = " << (unite(x, y) ? "merged" : "already together") << "\n";
    cout << "Same set(1,4): " << (find(1) == find(4) ? "yes" : "no") << "\n";
    cout << "Same set(1,5): " << (find(1) == find(5) ? "yes" : "no") << "\n";
    return 0;
}
`,
        java: R`class Main {
    static int[] parent = new int[10], rank = new int[10];

    static int find(int x) {
        if (parent[x] != x) parent[x] = find(parent[x]);   // path compression
        return parent[x];
    }

    static boolean union(int x, int y) {
        int rx = find(x), ry = find(y);
        if (rx == ry) return false;
        if (rank[rx] < rank[ry]) { int t = rx; rx = ry; ry = t; }
        parent[ry] = rx;
        if (rank[rx] == rank[ry]) rank[rx]++;
        return true;
    }

    public static void main(String[] args) {
        for (int i = 0; i < 10; i++) parent[i] = i;
        int[][] pairs = {{1, 2}, {3, 4}, {2, 4}, {1, 3}};
        for (int[] p : pairs)
            System.out.println("union(" + p[0] + "," + p[1] + ") = " + (union(p[0], p[1]) ? "merged" : "already together"));
        System.out.println("Same set(1,4): " + (find(1) == find(4) ? "yes" : "no"));
        System.out.println("Same set(1,5): " + (find(1) == find(5) ? "yes" : "no"));
    }
}
`,
        py: R`parent = list(range(10))
rank = [0] * 10


def find(x):
    if parent[x] != x:
        parent[x] = find(parent[x])                    # path compression
    return parent[x]


def union(x, y):
    rx, ry = find(x), find(y)
    if rx == ry:
        return False
    if rank[rx] < rank[ry]:
        rx, ry = ry, rx
    parent[ry] = rx
    if rank[rx] == rank[ry]:
        rank[rx] += 1
    return True


for x, y in ((1, 2), (3, 4), (2, 4), (1, 3)):
    print(f"union({x},{y}) =", "merged" if union(x, y) else "already together")
print("Same set(1,4):", "yes" if find(1) == find(4) else "no")
print("Same set(1,5):", "yes" if find(1) == find(5) else "no")
`,
      },
    },
    {
      id: 'kruskal', title: 'Kruskal\'s minimum spanning tree', summary: 'Sort the edges, add each one that does not close a cycle.', tags: ['Graph', 'Spanning tree', 'Greedy'], time: 'O(E log E)', best: '', space: 'O(V)', viz: 'graph',
      idea: 'A spanning tree connects all V vertices with V − 1 edges and no cycle. Kruskal builds the cheapest one greedily: sort all edges by weight and take each edge unless its two ends are already connected, which a disjoint set answers in almost constant time.',
      steps: ['Sort the edges by weight.', 'makeSet for every vertex.', 'For each edge (u, v): if find(u) != find(v), add the edge to the tree and union(u, v).', 'Stop when V − 1 edges have been chosen.'],
      note: 'Prim\'s algorithm reaches the same total weight by growing a single tree from a start vertex instead of merging a forest.',
      pseudo: ['sort edges by weight', 'for each vertex v: makeSet(v)', 'for each edge (u, v, w) in order:', '  if find(u) != find(v): add the edge; total = total + w; union(u, v)', 'the chosen edges form a minimum spanning tree'],
      expect: 'B-C 1\nA-C 2\nC-E 3\nA-B skipped\nD-F 5\nE-F 6\nB-D skipped\nD-E skipped\nF-G 9\nTotal weight: 26\n',
      code: {
        c: R`#include <stdio.h>
#include <stdlib.h>

typedef struct { int u, v, w; } Edge;
int parent[7];

int find(int x) { return parent[x] == x ? x : (parent[x] = find(parent[x])); }
int cmp(const void *a, const void *b) {
    int d = ((const Edge *)a)->w - ((const Edge *)b)->w;
    return d ? d : ((const Edge *)a)->u - ((const Edge *)b)->u;
}

int main(void) {
    /* vertices A..G = 0..6 */
    Edge e[] = {{0, 1, 4}, {0, 2, 2}, {1, 3, 7}, {2, 4, 3}, {1, 2, 1}, {3, 5, 5}, {4, 5, 6}, {3, 4, 8}, {5, 6, 9}};
    int m = 9, total = 0, used = 0;
    qsort(e, m, sizeof(Edge), cmp);
    for (int i = 0; i < 7; i++) parent[i] = i;

    for (int i = 0; i < m && used < 6; i++) {
        int ru = find(e[i].u), rv = find(e[i].v);
        if (ru != rv) {
            parent[ru] = rv;
            total += e[i].w; used++;
            printf("%c-%c %d\n", 'A' + e[i].u, 'A' + e[i].v, e[i].w);
        } else printf("%c-%c skipped\n", 'A' + e[i].u, 'A' + e[i].v);
    }
    printf("Total weight: %d\n", total);
    return 0;
}
`,
        cpp: R`#include <algorithm>
#include <iostream>
#include <numeric>
#include <vector>
using namespace std;

struct Edge { int u, v, w; };
vector<int> parent(7);

int find(int x) { return parent[x] == x ? x : (parent[x] = find(parent[x])); }

int main() {
    // vertices A..G = 0..6
    vector<Edge> e = {{0, 1, 4}, {0, 2, 2}, {1, 3, 7}, {2, 4, 3}, {1, 2, 1}, {3, 5, 5}, {4, 5, 6}, {3, 4, 8}, {5, 6, 9}};
    sort(e.begin(), e.end(), [](const Edge &a, const Edge &b) { return a.w != b.w ? a.w < b.w : a.u < b.u; });
    iota(parent.begin(), parent.end(), 0);

    int total = 0, used = 0;
    for (const Edge &x : e) {
        if (used == 6) break;
        int ru = find(x.u), rv = find(x.v);
        if (ru != rv) {
            parent[ru] = rv;
            total += x.w; used++;
            cout << char('A' + x.u) << "-" << char('A' + x.v) << " " << x.w << "\n";
        } else cout << char('A' + x.u) << "-" << char('A' + x.v) << " skipped\n";
    }
    cout << "Total weight: " << total << "\n";
    return 0;
}
`,
        java: R`import java.util.*;

class Main {
    static int[] parent = new int[7];

    static int find(int x) { return parent[x] == x ? x : (parent[x] = find(parent[x])); }

    public static void main(String[] args) {
        // vertices A..G = 0..6; each edge is {u, v, w}
        int[][] e = {{0, 1, 4}, {0, 2, 2}, {1, 3, 7}, {2, 4, 3}, {1, 2, 1}, {3, 5, 5}, {4, 5, 6}, {3, 4, 8}, {5, 6, 9}};
        Arrays.sort(e, (a, b) -> a[2] != b[2] ? a[2] - b[2] : a[0] - b[0]);
        for (int i = 0; i < 7; i++) parent[i] = i;

        int total = 0, used = 0;
        for (int[] x : e) {
            if (used == 6) break;
            int ru = find(x[0]), rv = find(x[1]);
            if (ru != rv) {
                parent[ru] = rv;
                total += x[2]; used++;
                System.out.println((char) ('A' + x[0]) + "-" + (char) ('A' + x[1]) + " " + x[2]);
            } else System.out.println((char) ('A' + x[0]) + "-" + (char) ('A' + x[1]) + " skipped");
        }
        System.out.println("Total weight: " + total);
    }
}
`,
        py: R`parent = list(range(7))


def find(x):
    if parent[x] != x:
        parent[x] = find(parent[x])
    return parent[x]


# vertices A..G are 0..6; edges are (weight, u, v)
edges = [(4, 0, 1), (2, 0, 2), (7, 1, 3), (3, 2, 4), (1, 1, 2), (5, 3, 5), (6, 4, 5), (8, 3, 4), (9, 5, 6)]
edges.sort(key=lambda e: (e[0], e[1]))
name = "ABCDEFG"

total = used = 0
for w, u, v in edges:
    if used == 6:
        break
    ru, rv = find(u), find(v)
    if ru != rv:
        parent[ru] = rv
        total += w
        used += 1
        print(f"{name[u]}-{name[v]} {w}")
    else:
        print(f"{name[u]}-{name[v]} skipped")
print("Total weight:", total)
`,
      },
    },
  ];
})();
