/* ============================================================
 * data/lib1.js — Module I algorithms. Every program is complete,
 * reads nothing, prints `expect` and has been compiled and run
 * (tools/test-library.js) in C, C++, Java and Python 3.
 * ============================================================ */
(function () {
  'use strict';
  const R = String.raw;
  DSA.library = DSA.library || {};
  DSA.library[1] = [
    {
      id: 'array-insert-delete', title: 'Insert and delete in an array', summary: 'Shift elements to open or close a gap.', tags: ['Array'], time: 'O(n)', best: 'O(1) at the end', space: 'O(1)', viz: 'array',
      idea: 'An array keeps its elements side by side, so putting a value in the middle means moving every later element one place right; removing one means moving them left.',
      steps: ['Insert: check there is room, shift a[pos..n-1] one place right (from the end), store the value, n = n + 1.', 'Delete: shift a[pos+1..n-1] one place left, n = n - 1.'],
      note: 'Inserting at index 0 is the worst case (n moves); appending at the end is the best case (no moves).',
      pseudo: ['insert(a, n, pos, value):', '  for i = n - 1 down to pos: a[i + 1] = a[i]', '  a[pos] = value; n = n + 1', 'delete(a, n, pos):', '  for i = pos + 1 to n - 1: a[i - 1] = a[i]', '  n = n - 1'],
      expect: 'After insert: 10 20 25 30 40 50\nAfter delete: 10 25 30 40 50\n',
      code: {
        c: R`#include <stdio.h>

void print(const char *label, int a[], int n) {
    printf("%s:", label);
    for (int i = 0; i < n; i++) printf(" %d", a[i]);
    printf("\n");
}

int main(void) {
    int a[10] = {10, 20, 30, 40, 50}, n = 5;

    /* insert 25 at index 2 */
    int pos = 2, value = 25;
    for (int i = n - 1; i >= pos; i--) a[i + 1] = a[i];
    a[pos] = value;
    n++;
    print("After insert", a, n);

    /* delete the element at index 1 */
    pos = 1;
    for (int i = pos + 1; i < n; i++) a[i - 1] = a[i];
    n--;
    print("After delete", a, n);
    return 0;
}
`,
        cpp: R`#include <iostream>
#include <vector>
using namespace std;

void print(const string &label, const vector<int> &a) {
    cout << label << ":";
    for (int x : a) cout << " " << x;
    cout << "\n";
}

int main() {
    vector<int> a = {10, 20, 30, 40, 50};

    // insert 25 at index 2 (vector::insert shifts the tail for us)
    int pos = 2, value = 25;
    a.insert(a.begin() + pos, value);
    print("After insert", a);

    // delete the element at index 1 (vector::erase shifts the tail left)
    pos = 1;
    a.erase(a.begin() + pos);
    print("After delete", a);
    return 0;
}
`,
        java: R`class Main {
    static void print(String label, int[] a, int n) {
        StringBuilder sb = new StringBuilder(label + ":");
        for (int i = 0; i < n; i++) sb.append(" ").append(a[i]);
        System.out.println(sb);
    }

    public static void main(String[] args) {
        int[] a = {10, 20, 30, 40, 50, 0, 0, 0, 0, 0};
        int n = 5;

        // insert 25 at index 2
        int pos = 2, value = 25;
        for (int i = n - 1; i >= pos; i--) a[i + 1] = a[i];
        a[pos] = value;
        n++;
        print("After insert", a, n);

        // delete the element at index 1
        pos = 1;
        for (int i = pos + 1; i < n; i++) a[i - 1] = a[i];
        n--;
        print("After delete", a, n);
    }
}
`,
        py: R`def show(label, a):
    print(label + ":", *a)


a = [10, 20, 30, 40, 50]

# insert 25 at index 2: shift the tail right, then store
pos, value = 2, 25
a.append(0)                       # make room
for i in range(len(a) - 2, pos - 1, -1):
    a[i + 1] = a[i]
a[pos] = value
show("After insert", a)

# delete the element at index 1: shift the tail left
pos = 1
for i in range(pos + 1, len(a)):
    a[i - 1] = a[i]
a.pop()
show("After delete", a)
`,
      },
    },
    {
      id: 'recursion-fact-fib', title: 'Factorial and Fibonacci (recursion)', summary: 'The two classic recursive functions, with the iterative and memoised versions.', tags: ['Recursion'], time: 'O(n) / O(2ⁿ)', best: '', space: 'O(n) stack', viz: 'recursion',
      idea: 'A recursive function solves a problem by calling itself on a smaller input until it reaches a base case. factorial calls itself once per level (n calls). Plain Fibonacci calls itself twice and recomputes the same values, so it takes exponential time; remembering results (memoisation) brings it back to O(n).',
      steps: ['Write the base case first (n ≤ 1).', 'Reduce the problem: n → n − 1 (and n − 2).', 'Combine the results: n × fact(n − 1); fib(n − 1) + fib(n − 2).', 'For Fibonacci, store each computed value in a table so it is computed once.'],
      note: 'T(n) = T(n−1) + 1 gives O(n) for factorial. T(n) = T(n−1) + T(n−2) + 1 gives O(2ⁿ) for naive Fibonacci.',
      pseudo: ['fact(n): if n <= 1 return 1', '        return n * fact(n - 1)', 'fib(n):  if n <= 1 return n', '        return fib(n - 1) + fib(n - 2)', 'fibMemo(n): if memo[n] known return it', '            memo[n] = fibMemo(n - 1) + fibMemo(n - 2); return memo[n]'],
      expect: 'fact(5) = 120\nfib(10) = 55\nfibMemo(40) = 102334155\n',
      code: {
        c: R`#include <stdio.h>

long long fact(int n) { return n <= 1 ? 1 : n * fact(n - 1); }
long long fib(int n) { return n <= 1 ? n : fib(n - 1) + fib(n - 2); }

long long memo[64];
long long fibMemo(int n) {
    if (n <= 1) return n;
    if (memo[n]) return memo[n];
    return memo[n] = fibMemo(n - 1) + fibMemo(n - 2);
}

int main(void) {
    printf("fact(5) = %lld\n", fact(5));
    printf("fib(10) = %lld\n", fib(10));
    printf("fibMemo(40) = %lld\n", fibMemo(40));
    return 0;
}
`,
        cpp: R`#include <iostream>
#include <vector>
using namespace std;

long long fact(int n) { return n <= 1 ? 1 : n * fact(n - 1); }
long long fib(int n) { return n <= 1 ? n : fib(n - 1) + fib(n - 2); }

long long fibMemo(int n, vector<long long> &memo) {
    if (n <= 1) return n;
    if (memo[n]) return memo[n];
    return memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
}

int main() {
    cout << "fact(5) = " << fact(5) << "\n";
    cout << "fib(10) = " << fib(10) << "\n";
    vector<long long> memo(64, 0);
    cout << "fibMemo(40) = " << fibMemo(40, memo) << "\n";
    return 0;
}
`,
        java: R`class Main {
    static long fact(int n) { return n <= 1 ? 1 : n * fact(n - 1); }
    static long fib(int n) { return n <= 1 ? n : fib(n - 1) + fib(n - 2); }

    static long[] memo = new long[64];
    static long fibMemo(int n) {
        if (n <= 1) return n;
        if (memo[n] != 0) return memo[n];
        return memo[n] = fibMemo(n - 1) + fibMemo(n - 2);
    }

    public static void main(String[] args) {
        System.out.println("fact(5) = " + fact(5));
        System.out.println("fib(10) = " + fib(10));
        System.out.println("fibMemo(40) = " + fibMemo(40));
    }
}
`,
        py: R`def fact(n):
    return 1 if n <= 1 else n * fact(n - 1)


def fib(n):
    return n if n <= 1 else fib(n - 1) + fib(n - 2)


memo = {}


def fib_memo(n):
    if n <= 1:
        return n
    if n not in memo:
        memo[n] = fib_memo(n - 1) + fib_memo(n - 2)
    return memo[n]


print("fact(5) =", fact(5))
print("fib(10) =", fib(10))
print("fibMemo(40) =", fib_memo(40))
`,
      },
    },
    {
      id: 'matrix-transpose', title: 'Transpose of a matrix', summary: 'Swap rows and columns. A past-paper favourite.', tags: ['2-D array', 'PYQ'], time: 'O(m·n)', best: '', space: 'O(m·n)',
      idea: 'The transpose of an m × n matrix A is the n × m matrix B with B[j][i] = A[i][j]: row i of A becomes column i of B.',
      steps: ['Create B with n rows and m columns.', 'For every i and j, copy A[i][j] into B[j][i].', 'Print B row by row.'],
      note: 'For a square matrix the transpose can be done in place by swapping A[i][j] with A[j][i] for j > i.',
      pseudo: ['for i = 0 to m - 1:', '  for j = 0 to n - 1:', '    B[j][i] = A[i][j]', 'print B'],
      expect: 'Matrix:\n1 2 3\n4 5 6\nTranspose:\n1 4\n2 5\n3 6\n',
      code: {
        c: R`#include <stdio.h>

int main(void) {
    int a[2][3] = {{1, 2, 3}, {4, 5, 6}}, b[3][2];
    int m = 2, n = 3;

    for (int i = 0; i < m; i++)
        for (int j = 0; j < n; j++)
            b[j][i] = a[i][j];

    printf("Matrix:\n");
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) printf(j ? " %d" : "%d", a[i][j]);
        printf("\n");
    }
    printf("Transpose:\n");
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < m; j++) printf(j ? " %d" : "%d", b[i][j]);
        printf("\n");
    }
    return 0;
}
`,
        cpp: R`#include <iostream>
#include <vector>
using namespace std;

void print(const vector<vector<int>> &x) {
    for (auto &row : x) {
        for (size_t j = 0; j < row.size(); j++) cout << (j ? " " : "") << row[j];
        cout << "\n";
    }
}

int main() {
    vector<vector<int>> a = {{1, 2, 3}, {4, 5, 6}};
    int m = a.size(), n = a[0].size();
    vector<vector<int>> b(n, vector<int>(m));

    for (int i = 0; i < m; i++)
        for (int j = 0; j < n; j++)
            b[j][i] = a[i][j];

    cout << "Matrix:\n";
    print(a);
    cout << "Transpose:\n";
    print(b);
    return 0;
}
`,
        java: R`class Main {
    static void print(int[][] x) {
        for (int[] row : x) {
            StringBuilder sb = new StringBuilder();
            for (int j = 0; j < row.length; j++) sb.append(j > 0 ? " " : "").append(row[j]);
            System.out.println(sb);
        }
    }

    public static void main(String[] args) {
        int[][] a = {{1, 2, 3}, {4, 5, 6}};
        int m = a.length, n = a[0].length;
        int[][] b = new int[n][m];

        for (int i = 0; i < m; i++)
            for (int j = 0; j < n; j++)
                b[j][i] = a[i][j];

        System.out.println("Matrix:");
        print(a);
        System.out.println("Transpose:");
        print(b);
    }
}
`,
        py: R`a = [[1, 2, 3], [4, 5, 6]]
m, n = len(a), len(a[0])
b = [[0] * m for _ in range(n)]

for i in range(m):
    for j in range(n):
        b[j][i] = a[i][j]

print("Matrix:")
for row in a:
    print(*row)
print("Transpose:")
for row in b:
    print(*row)
`,
      },
    },
    {
      id: 'sparse-triplet', title: 'Sparse matrix in triplet form', summary: 'Store only the non-zero entries as (row, column, value).', tags: ['Sparse matrix'], time: 'O(m·n)', best: '', space: 'O(k)', viz: 'sparse',
      idea: 'When most entries are zero a dense array wastes memory. Keep a header (rows, columns, count) followed by one (row, column, value) triplet for each of the k non-zero entries, in row-major order.',
      steps: ['Scan the matrix row by row.', 'For each non-zero element append (i, j, a[i][j]).', 'Put (rows, columns, k) in the first slot.'],
      note: 'Storage 3 × (k + 1) numbers instead of m × n. It pays off when k < m·n / 3 roughly.',
      pseudo: ['t[0] = (rows, cols, 0); k = 1', 'for i = 0 to rows - 1:', '  for j = 0 to cols - 1:', '    if a[i][j] != 0: t[k] = (i, j, a[i][j]); k = k + 1', 't[0].value = k - 1'],
      expect: '4 5 7\n0 3 5\n0 4 8\n1 1 3\n2 0 6\n2 2 7\n3 1 4\n3 3 9\n',
      code: {
        c: R`#include <stdio.h>

int main(void) {
    int a[4][5] = {{0, 0, 0, 5, 8}, {0, 3, 0, 0, 0}, {6, 0, 7, 0, 0}, {0, 4, 0, 9, 0}};
    int t[21][3], k = 1;

    for (int i = 0; i < 4; i++)
        for (int j = 0; j < 5; j++)
            if (a[i][j] != 0) { t[k][0] = i; t[k][1] = j; t[k][2] = a[i][j]; k++; }

    t[0][0] = 4; t[0][1] = 5; t[0][2] = k - 1;
    for (int i = 0; i < k; i++) printf("%d %d %d\n", t[i][0], t[i][1], t[i][2]);
    return 0;
}
`,
        cpp: R`#include <iostream>
#include <vector>
#include <array>
using namespace std;

int main() {
    int a[4][5] = {{0, 0, 0, 5, 8}, {0, 3, 0, 0, 0}, {6, 0, 7, 0, 0}, {0, 4, 0, 9, 0}};
    vector<array<int, 3>> t;

    for (int i = 0; i < 4; i++)
        for (int j = 0; j < 5; j++)
            if (a[i][j] != 0) t.push_back({i, j, a[i][j]});

    cout << 4 << " " << 5 << " " << t.size() << "\n";
    for (auto &e : t) cout << e[0] << " " << e[1] << " " << e[2] << "\n";
    return 0;
}
`,
        java: R`import java.util.*;

class Main {
    public static void main(String[] args) {
        int[][] a = {{0, 0, 0, 5, 8}, {0, 3, 0, 0, 0}, {6, 0, 7, 0, 0}, {0, 4, 0, 9, 0}};
        List<int[]> t = new ArrayList<>();

        for (int i = 0; i < 4; i++)
            for (int j = 0; j < 5; j++)
                if (a[i][j] != 0) t.add(new int[]{i, j, a[i][j]});

        System.out.println(4 + " " + 5 + " " + t.size());
        for (int[] e : t) System.out.println(e[0] + " " + e[1] + " " + e[2]);
    }
}
`,
        py: R`a = [[0, 0, 0, 5, 8],
     [0, 3, 0, 0, 0],
     [6, 0, 7, 0, 0],
     [0, 4, 0, 9, 0]]

triplets = [(i, j, v) for i, row in enumerate(a) for j, v in enumerate(row) if v != 0]

print(len(a), len(a[0]), len(triplets))
for i, j, v in triplets:
    print(i, j, v)
`,
      },
    },
    {
      id: 'poly-add', title: 'Polynomial addition', summary: 'Merge two term lists in decreasing order of exponent.', tags: ['Polynomial', 'Linked list'], time: 'O(m + n)', best: '', space: 'O(m + n)', viz: 'poly',
      idea: 'Store each polynomial as terms (coefficient, exponent) sorted by decreasing exponent. Walk both lists together like the merge step of merge sort: equal exponents add, otherwise copy the term with the larger exponent.',
      steps: ['Start pointers p and q at the first terms.', 'If exponents are equal, add the coefficients (skip the term if the sum is 0) and advance both.', 'Otherwise copy the term with the larger exponent and advance that pointer only.', 'Copy whatever is left of either polynomial.'],
      note: 'In a linked list each node holds (coef, exp, next), which is how the course notes represent a polynomial.',
      pseudo: ['p = P.head; q = Q.head', 'while p != NULL and q != NULL:', '  if p.exp == q.exp: add (p.coef + q.coef, p.exp); p = p.next; q = q.next', '  else if p.exp > q.exp: add p; p = p.next', '  else: add q; q = q.next', 'append the remaining terms of P or Q'],
      expect: '5x^4 + 4x^3 + 9x^2 + 4\n',
      code: {
        c: R`#include <stdio.h>

typedef struct { int coef, exp; } Term;

int main(void) {
    Term p[] = {{5, 4}, {3, 2}, {7, 0}}, q[] = {{4, 3}, {6, 2}, {-3, 0}};
    int n = 3, m = 3, i = 0, j = 0, k = 0;
    Term r[8];

    while (i < n && j < m) {
        if (p[i].exp == q[j].exp) {
            int c = p[i].coef + q[j].coef;
            if (c != 0) { r[k].coef = c; r[k].exp = p[i].exp; k++; }
            i++; j++;
        } else if (p[i].exp > q[j].exp) r[k++] = p[i++];
        else r[k++] = q[j++];
    }
    while (i < n) r[k++] = p[i++];
    while (j < m) r[k++] = q[j++];

    for (int t = 0; t < k; t++) {
        if (t) printf(" + ");
        if (r[t].exp == 0) printf("%d", r[t].coef);
        else if (r[t].exp == 1) printf("%dx", r[t].coef);
        else printf("%dx^%d", r[t].coef, r[t].exp);
    }
    printf("\n");
    return 0;
}
`,
        cpp: R`#include <iostream>
#include <vector>
using namespace std;

struct Term { int coef, exp; };

int main() {
    vector<Term> p = {{5, 4}, {3, 2}, {7, 0}}, q = {{4, 3}, {6, 2}, {-3, 0}}, r;
    size_t i = 0, j = 0;

    while (i < p.size() && j < q.size()) {
        if (p[i].exp == q[j].exp) {
            int c = p[i].coef + q[j].coef;
            if (c != 0) r.push_back({c, p[i].exp});
            i++; j++;
        } else if (p[i].exp > q[j].exp) r.push_back(p[i++]);
        else r.push_back(q[j++]);
    }
    while (i < p.size()) r.push_back(p[i++]);
    while (j < q.size()) r.push_back(q[j++]);

    for (size_t t = 0; t < r.size(); t++) {
        if (t) cout << " + ";
        if (r[t].exp == 0) cout << r[t].coef;
        else if (r[t].exp == 1) cout << r[t].coef << "x";
        else cout << r[t].coef << "x^" << r[t].exp;
    }
    cout << "\n";
    return 0;
}
`,
        java: R`import java.util.*;

class Main {
    public static void main(String[] args) {
        int[][] p = {{5, 4}, {3, 2}, {7, 0}}, q = {{4, 3}, {6, 2}, {-3, 0}};   // {coef, exp}
        List<int[]> r = new ArrayList<>();
        int i = 0, j = 0;

        while (i < p.length && j < q.length) {
            if (p[i][1] == q[j][1]) {
                int c = p[i][0] + q[j][0];
                if (c != 0) r.add(new int[]{c, p[i][1]});
                i++; j++;
            } else if (p[i][1] > q[j][1]) r.add(p[i++]);
            else r.add(q[j++]);
        }
        while (i < p.length) r.add(p[i++]);
        while (j < q.length) r.add(q[j++]);

        StringBuilder sb = new StringBuilder();
        for (int t = 0; t < r.size(); t++) {
            if (t > 0) sb.append(" + ");
            int c = r.get(t)[0], e = r.get(t)[1];
            sb.append(e == 0 ? "" + c : e == 1 ? c + "x" : c + "x^" + e);
        }
        System.out.println(sb);
    }
}
`,
        py: R`def add(p, q):
    """p and q are lists of (coef, exp) in decreasing exponent order."""
    r, i, j = [], 0, 0
    while i < len(p) and j < len(q):
        if p[i][1] == q[j][1]:
            c = p[i][0] + q[j][0]
            if c != 0:
                r.append((c, p[i][1]))
            i += 1
            j += 1
        elif p[i][1] > q[j][1]:
            r.append(p[i])
            i += 1
        else:
            r.append(q[j])
            j += 1
    return r + p[i:] + q[j:]


def term(c, e):
    return str(c) if e == 0 else f"{c}x" if e == 1 else f"{c}x^{e}"


p = [(5, 4), (3, 2), (7, 0)]
q = [(4, 3), (6, 2), (-3, 0)]
print(" + ".join(term(c, e) for c, e in add(p, q)))
`,
      },
    },
  ];
})();
