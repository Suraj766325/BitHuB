/* data/lib3.js — Module III algorithms (stacks and queues). */
(function () {
  'use strict';
  const R = String.raw;
  DSA.library = DSA.library || {};
  DSA.library[3] = [
    {
      id: 'stack-array', title: 'Stack using an array', summary: 'push, pop and peek with overflow and underflow checks.', tags: ['Stack', 'PYQ'], time: 'O(1) each', best: '', space: 'O(n)', viz: 'stack',
      idea: 'Keep the elements in an array and an index `top` that points at the most recent one (−1 when empty). push moves top up and stores; pop reads and moves top down. Check for overflow before pushing and underflow before popping.',
      steps: ['top = -1 means empty; top == MAX - 1 means full.', 'push(x): if full report overflow, else top++ and stack[top] = x.', 'pop(): if empty report underflow, else return stack[top] and top--.', 'peek(): return stack[top] without changing it.'],
      note: 'The exam question "stack that stores character data" is this program with `char` instead of `int`.',
      pseudo: ['push(x): if top == MAX - 1: OVERFLOW', '         else top = top + 1; stack[top] = x', 'pop():   if top == -1: UNDERFLOW', '         else x = stack[top]; top = top - 1; return x', 'peek():  if top == -1: EMPTY else return stack[top]'],
      expect: 'Push 10\nPush 20\nPush 30\nTop = 30\nPop -> 30\nPush 40\nPush 50\nPush 60: overflow\nPop -> 50\nPop -> 40\nPop -> 20\nPop -> 10\nPop: underflow\n',
      code: {
        c: R`#include <stdio.h>
#define MAX 4

int stack[MAX], top = -1;

void push(int x) {
    if (top == MAX - 1) { printf("Push %d: overflow\n", x); return; }
    stack[++top] = x;
    printf("Push %d\n", x);
}

void pop(void) {
    if (top == -1) { printf("Pop: underflow\n"); return; }
    printf("Pop -> %d\n", stack[top--]);
}

int main(void) {
    push(10); push(20); push(30);
    printf("Top = %d\n", stack[top]);
    pop();
    push(40); push(50); push(60);
    pop(); pop(); pop(); pop(); pop();
    return 0;
}
`,
        cpp: R`#include <iostream>
using namespace std;

class Stack {
    static const int MAX = 4;
    int data[MAX], top = -1;
public:
    void push(int x) {
        if (top == MAX - 1) { cout << "Push " << x << ": overflow\n"; return; }
        data[++top] = x;
        cout << "Push " << x << "\n";
    }
    void pop() {
        if (top == -1) { cout << "Pop: underflow\n"; return; }
        cout << "Pop -> " << data[top--] << "\n";
    }
    int peek() const { return data[top]; }
};

int main() {
    Stack s;
    s.push(10); s.push(20); s.push(30);
    cout << "Top = " << s.peek() << "\n";
    s.pop();
    s.push(40); s.push(50); s.push(60);
    for (int i = 0; i < 5; i++) s.pop();
    return 0;
}
`,
        java: R`class Main {
    static final int MAX = 4;
    static int[] stack = new int[MAX];
    static int top = -1;

    static void push(int x) {
        if (top == MAX - 1) { System.out.println("Push " + x + ": overflow"); return; }
        stack[++top] = x;
        System.out.println("Push " + x);
    }

    static void pop() {
        if (top == -1) { System.out.println("Pop: underflow"); return; }
        System.out.println("Pop -> " + stack[top--]);
    }

    public static void main(String[] args) {
        push(10); push(20); push(30);
        System.out.println("Top = " + stack[top]);
        pop();
        push(40); push(50); push(60);
        for (int i = 0; i < 5; i++) pop();
    }
}
`,
        py: R`MAX = 4
stack = []


def push(x):
    if len(stack) == MAX:
        print(f"Push {x}: overflow")
        return
    stack.append(x)
    print(f"Push {x}")


def pop():
    if not stack:
        print("Pop: underflow")
        return
    print("Pop ->", stack.pop())


push(10); push(20); push(30)
print("Top =", stack[-1])
pop()
push(40); push(50); push(60)
for _ in range(5):
    pop()
`,
      },
    },
    {
      id: 'queue-circular', title: 'Circular queue using an array', summary: 'Wrap front and rear around with the modulo operator.', tags: ['Queue', 'PYQ'], time: 'O(1) each', best: '', space: 'O(n)', viz: 'queue',
      idea: 'In a linear array queue the slots freed by dequeue are never reused. Treat the array as a ring instead: after index MAX−1 comes index 0, using `% MAX`. The queue is full when (rear + 1) % MAX == front and empty when front == −1.',
      steps: ['enqueue: if full report overflow; if empty set front = rear = 0, else rear = (rear + 1) % MAX; store at queue[rear].', 'dequeue: if empty report underflow; read queue[front]; if front == rear the queue becomes empty (front = rear = −1), else front = (front + 1) % MAX.'],
      note: 'One slot is not sacrificed here: the empty case is marked by front = −1, so all MAX slots can be used.',
      pseudo: ['enqueue(x): if (rear + 1) % MAX == front: OVERFLOW', '  if front == -1: front = rear = 0', '  else rear = (rear + 1) % MAX', '  queue[rear] = x', 'dequeue(): if front == -1: UNDERFLOW', '  x = queue[front]', '  if front == rear: front = rear = -1', '  else front = (front + 1) % MAX', '  return x'],
      expect: 'Enqueue 1\nEnqueue 2\nEnqueue 3\nDequeue -> 1\nEnqueue 4\nEnqueue 5\nEnqueue 6: overflow\nDequeue -> 2\nDequeue -> 3\nDequeue -> 4\nDequeue -> 5\nDequeue: underflow\n',
      code: {
        c: R`#include <stdio.h>
#define MAX 4

int queue[MAX], front = -1, rear = -1;

void enqueue(int x) {
    if ((rear + 1) % MAX == front) { printf("Enqueue %d: overflow\n", x); return; }
    if (front == -1) front = rear = 0;
    else rear = (rear + 1) % MAX;
    queue[rear] = x;
    printf("Enqueue %d\n", x);
}

void dequeue(void) {
    if (front == -1) { printf("Dequeue: underflow\n"); return; }
    printf("Dequeue -> %d\n", queue[front]);
    if (front == rear) front = rear = -1;
    else front = (front + 1) % MAX;
}

int main(void) {
    enqueue(1); enqueue(2); enqueue(3);
    dequeue();
    enqueue(4); enqueue(5); enqueue(6);
    for (int i = 0; i < 5; i++) dequeue();
    return 0;
}
`,
        cpp: R`#include <iostream>
using namespace std;

class CircularQueue {
    static const int MAX = 4;
    int q[MAX], front = -1, rear = -1;
public:
    void enqueue(int x) {
        if ((rear + 1) % MAX == front) { cout << "Enqueue " << x << ": overflow\n"; return; }
        if (front == -1) front = rear = 0;
        else rear = (rear + 1) % MAX;
        q[rear] = x;
        cout << "Enqueue " << x << "\n";
    }
    void dequeue() {
        if (front == -1) { cout << "Dequeue: underflow\n"; return; }
        cout << "Dequeue -> " << q[front] << "\n";
        if (front == rear) front = rear = -1;
        else front = (front + 1) % MAX;
    }
};

int main() {
    CircularQueue q;
    q.enqueue(1); q.enqueue(2); q.enqueue(3);
    q.dequeue();
    q.enqueue(4); q.enqueue(5); q.enqueue(6);
    for (int i = 0; i < 5; i++) q.dequeue();
    return 0;
}
`,
        java: R`class Main {
    static final int MAX = 4;
    static int[] queue = new int[MAX];
    static int front = -1, rear = -1;

    static void enqueue(int x) {
        if ((rear + 1) % MAX == front) { System.out.println("Enqueue " + x + ": overflow"); return; }
        if (front == -1) front = rear = 0;
        else rear = (rear + 1) % MAX;
        queue[rear] = x;
        System.out.println("Enqueue " + x);
    }

    static void dequeue() {
        if (front == -1) { System.out.println("Dequeue: underflow"); return; }
        System.out.println("Dequeue -> " + queue[front]);
        if (front == rear) front = rear = -1;
        else front = (front + 1) % MAX;
    }

    public static void main(String[] args) {
        enqueue(1); enqueue(2); enqueue(3);
        dequeue();
        enqueue(4); enqueue(5); enqueue(6);
        for (int i = 0; i < 5; i++) dequeue();
    }
}
`,
        py: R`MAX = 4
queue = [None] * MAX
front = rear = -1


def enqueue(x):
    global front, rear
    if (rear + 1) % MAX == front:
        print(f"Enqueue {x}: overflow")
        return
    if front == -1:
        front = rear = 0
    else:
        rear = (rear + 1) % MAX
    queue[rear] = x
    print(f"Enqueue {x}")


def dequeue():
    global front, rear
    if front == -1:
        print("Dequeue: underflow")
        return
    print("Dequeue ->", queue[front])
    if front == rear:
        front = rear = -1
    else:
        front = (front + 1) % MAX


enqueue(1); enqueue(2); enqueue(3)
dequeue()
enqueue(4); enqueue(5); enqueue(6)
for _ in range(5):
    dequeue()
`,
      },
    },
    {
      id: 'infix-postfix', title: 'Infix to postfix conversion', summary: 'Operators wait on a stack until something of lower precedence arrives.', tags: ['Stack', 'Expressions', 'PYQ'], time: 'O(n)', best: '', space: 'O(n)', viz: 'infix',
      idea: 'Operands are copied to the output as soon as they are read. An operator is pushed on a stack, but first every operator already on the stack with higher or equal precedence is popped to the output. "(" is pushed; ")" pops to the matching "(".',
      steps: ['Operand: output it.', '"(": push.', '")": pop to the output until "(", then discard it.', 'Operator: while the top has higher or equal precedence (and is not "("), pop it to the output; then push the operator.', 'At the end pop everything left.'],
      note: 'Precedence: ^ (3), * / (2), + − (1). Equal precedence groups left to right, so a−b−c becomes ab−c−.',
      pseudo: ['for each token t:', '  if t is an operand: output t', '  else if t == "(": push t', '  else if t == ")": pop to output until "(", then pop "("', '  else: while stack not empty and top != "(" and prec(top) >= prec(t): output pop()', '        push t', 'pop all remaining operators to the output'],
      expect: '(A-B)+C*D/E-C -> AB-CD*E/+C-\n(A-2*(B+C)/D*E)+F -> A2BC+*D/E*-F+\nA+B*C^D-E -> ABCD^*+E-\n',
      code: {
        c: R`#include <stdio.h>
#include <ctype.h>
#include <string.h>

int prec(char c) { return c == '^' ? 3 : (c == '*' || c == '/') ? 2 : (c == '+' || c == '-') ? 1 : 0; }

void toPostfix(const char *in, char *out) {
    char st[64]; int top = -1, k = 0;
    for (int i = 0; in[i]; i++) {
        char c = in[i];
        if (isalnum((unsigned char)c)) out[k++] = c;
        else if (c == '(') st[++top] = c;
        else if (c == ')') {
            while (top >= 0 && st[top] != '(') out[k++] = st[top--];
            top--;                                  /* discard the '(' */
        } else {
            while (top >= 0 && st[top] != '(' && (prec(st[top]) > prec(c) || (prec(st[top]) == prec(c) && c != '^')))
                out[k++] = st[top--];
            st[++top] = c;
        }
    }
    while (top >= 0) out[k++] = st[top--];
    out[k] = '\0';
}

int main(void) {
    const char *tests[] = {"(A-B)+C*D/E-C", "(A-2*(B+C)/D*E)+F", "A+B*C^D-E"};
    for (int i = 0; i < 3; i++) {
        char out[64];
        toPostfix(tests[i], out);
        printf("%s -> %s\n", tests[i], out);
    }
    return 0;
}
`,
        cpp: R`#include <iostream>
#include <stack>
#include <string>
using namespace std;

int prec(char c) { return c == '^' ? 3 : (c == '*' || c == '/') ? 2 : (c == '+' || c == '-') ? 1 : 0; }

string toPostfix(const string &in) {
    string out;
    stack<char> st;
    for (char c : in) {
        if (isalnum((unsigned char)c)) out += c;
        else if (c == '(') st.push(c);
        else if (c == ')') {
            while (!st.empty() && st.top() != '(') { out += st.top(); st.pop(); }
            st.pop();                               // discard the '('
        } else {
            while (!st.empty() && st.top() != '(' && (prec(st.top()) > prec(c) || (prec(st.top()) == prec(c) && c != '^'))) {
                out += st.top(); st.pop();
            }
            st.push(c);
        }
    }
    while (!st.empty()) { out += st.top(); st.pop(); }
    return out;
}

int main() {
    for (string e : {"(A-B)+C*D/E-C", "(A-2*(B+C)/D*E)+F", "A+B*C^D-E"})
        cout << e << " -> " << toPostfix(e) << "\n";
    return 0;
}
`,
        java: R`import java.util.*;

class Main {
    static int prec(char c) { return c == '^' ? 3 : (c == '*' || c == '/') ? 2 : (c == '+' || c == '-') ? 1 : 0; }

    static String toPostfix(String in) {
        StringBuilder out = new StringBuilder();
        Deque<Character> st = new ArrayDeque<>();
        for (char c : in.toCharArray()) {
            if (Character.isLetterOrDigit(c)) out.append(c);
            else if (c == '(') st.push(c);
            else if (c == ')') {
                while (!st.isEmpty() && st.peek() != '(') out.append(st.pop());
                st.pop();                           // discard the '('
            } else {
                while (!st.isEmpty() && st.peek() != '(' && (prec(st.peek()) > prec(c) || (prec(st.peek()) == prec(c) && c != '^')))
                    out.append(st.pop());
                st.push(c);
            }
        }
        while (!st.isEmpty()) out.append(st.pop());
        return out.toString();
    }

    public static void main(String[] args) {
        for (String e : new String[]{"(A-B)+C*D/E-C", "(A-2*(B+C)/D*E)+F", "A+B*C^D-E"})
            System.out.println(e + " -> " + toPostfix(e));
    }
}
`,
        py: R`PREC = {"^": 3, "*": 2, "/": 2, "+": 1, "-": 1}


def to_postfix(expr):
    out, st = [], []
    for c in expr:
        if c.isalnum():
            out.append(c)
        elif c == "(":
            st.append(c)
        elif c == ")":
            while st and st[-1] != "(":
                out.append(st.pop())
            st.pop()                               # discard the "("
        else:
            while st and st[-1] != "(" and (PREC[st[-1]] > PREC[c] or (PREC[st[-1]] == PREC[c] and c != "^")):
                out.append(st.pop())
            st.append(c)
    while st:
        out.append(st.pop())
    return "".join(out)


for e in ("(A-B)+C*D/E-C", "(A-2*(B+C)/D*E)+F", "A+B*C^D-E"):
    print(e, "->", to_postfix(e))
`,
      },
    },
    {
      id: 'postfix-eval', title: 'Postfix evaluation', summary: 'Push numbers; an operator pops two values and pushes the result.', tags: ['Stack', 'Expressions', 'PYQ'], time: 'O(n)', best: '', space: 'O(n)', viz: 'postfix',
      idea: 'Postfix needs no brackets: scan left to right, push each number; when an operator appears pop two values, apply it and push the answer. The value popped first is the right operand.',
      steps: ['Read a token.', 'Number: push it.', 'Operator: b = pop(), a = pop(), push(a op b).', 'When the input ends, the single value on the stack is the result.'],
      note: 'Worked answer for the End Semester 2025 question 12 3 4 + * 2 / 5 6 - + : 3+4=7, 12×7=84, 84/2=42, 5−6=−1, 42+(−1)=41.',
      pseudo: ['for each token t from left to right:', '  if t is a number: push(t)', '  else: b = pop(); a = pop(); push(a t b)', 'return pop()'],
      expect: '12 3 4 + * 2 / 5 6 - + = 41\n5 6 2 + * 12 4 / - = 37\n',
      code: {
        c: R`#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

int evaluate(const char *expr) {
    char buf[128];
    strcpy(buf, expr);
    int st[64], top = -1;
    for (char *t = strtok(buf, " "); t; t = strtok(NULL, " ")) {
        if (isdigit((unsigned char)t[0])) st[++top] = atoi(t);
        else {
            int b = st[top--], a = st[top--];
            switch (t[0]) {
                case '+': st[++top] = a + b; break;
                case '-': st[++top] = a - b; break;
                case '*': st[++top] = a * b; break;
                case '/': st[++top] = a / b; break;
            }
        }
    }
    return st[top];
}

int main(void) {
    const char *tests[] = {"12 3 4 + * 2 / 5 6 - +", "5 6 2 + * 12 4 / -"};
    for (int i = 0; i < 2; i++) printf("%s = %d\n", tests[i], evaluate(tests[i]));
    return 0;
}
`,
        cpp: R`#include <iostream>
#include <sstream>
#include <stack>
#include <string>
using namespace std;

int evaluate(const string &expr) {
    stack<int> st;
    istringstream in(expr);
    string t;
    while (in >> t) {
        if (isdigit((unsigned char)t[0])) st.push(stoi(t));
        else {
            int b = st.top(); st.pop();
            int a = st.top(); st.pop();
            switch (t[0]) {
                case '+': st.push(a + b); break;
                case '-': st.push(a - b); break;
                case '*': st.push(a * b); break;
                case '/': st.push(a / b); break;
            }
        }
    }
    return st.top();
}

int main() {
    for (string e : {"12 3 4 + * 2 / 5 6 - +", "5 6 2 + * 12 4 / -"})
        cout << e << " = " << evaluate(e) << "\n";
    return 0;
}
`,
        java: R`import java.util.*;

class Main {
    static int evaluate(String expr) {
        Deque<Integer> st = new ArrayDeque<>();
        for (String t : expr.split(" ")) {
            if (Character.isDigit(t.charAt(0))) st.push(Integer.parseInt(t));
            else {
                int b = st.pop(), a = st.pop();
                switch (t.charAt(0)) {
                    case '+': st.push(a + b); break;
                    case '-': st.push(a - b); break;
                    case '*': st.push(a * b); break;
                    case '/': st.push(a / b); break;
                }
            }
        }
        return st.pop();
    }

    public static void main(String[] args) {
        for (String e : new String[]{"12 3 4 + * 2 / 5 6 - +", "5 6 2 + * 12 4 / -"})
            System.out.println(e + " = " + evaluate(e));
    }
}
`,
        py: R`def evaluate(expr):
    st = []
    for t in expr.split():
        if t.isdigit():
            st.append(int(t))
        else:
            b, a = st.pop(), st.pop()
            st.append({"+": a + b, "-": a - b, "*": a * b, "/": a // b}[t])
    return st.pop()


for e in ("12 3 4 + * 2 / 5 6 - +", "5 6 2 + * 12 4 / -"):
    print(e, "=", evaluate(e))
`,
      },
    },
    {
      id: 'balanced-brackets', title: 'Balanced brackets', summary: 'A stack matches every closing bracket with the latest opening one.', tags: ['Stack'], time: 'O(n)', best: '', space: 'O(n)', viz: 'parens',
      idea: 'Push each opening bracket. A closing bracket must match the top of the stack. The string is balanced only if no mismatch occurs and the stack is empty at the end.',
      steps: ['Push ( [ { as they appear.', 'On ) ] }: if the stack is empty or the top is the wrong partner, the string is not balanced; otherwise pop.', 'At the end: balanced if and only if the stack is empty.'],
      note: 'The same idea checks tags in HTML or XML.',
      pseudo: ['for each character c:', '  if c is an opening bracket: push c', '  else if c is a closing bracket:', '    if stack is empty or top does not match c: return false', '    pop', 'return stack is empty'],
      expect: '{[()]()} balanced\n([)] not balanced\n((()) not balanced\n(a+b)*[c-d] balanced\n',
      code: {
        c: R`#include <stdio.h>
#include <string.h>

int balanced(const char *s) {
    char st[128]; int top = -1;
    for (int i = 0; s[i]; i++) {
        char c = s[i];
        if (c == '(' || c == '[' || c == '{') st[++top] = c;
        else if (c == ')' || c == ']' || c == '}') {
            if (top < 0) return 0;
            char o = st[top--];
            if ((c == ')' && o != '(') || (c == ']' && o != '[') || (c == '}' && o != '{')) return 0;
        }
    }
    return top == -1;
}

int main(void) {
    const char *tests[] = {"{[()]()}", "([)]", "((())", "(a+b)*[c-d]"};
    for (int i = 0; i < 4; i++) printf("%s %s\n", tests[i], balanced(tests[i]) ? "balanced" : "not balanced");
    return 0;
}
`,
        cpp: R`#include <iostream>
#include <stack>
#include <string>
using namespace std;

bool balanced(const string &s) {
    stack<char> st;
    for (char c : s) {
        if (c == '(' || c == '[' || c == '{') st.push(c);
        else if (c == ')' || c == ']' || c == '}') {
            if (st.empty()) return false;
            char o = st.top(); st.pop();
            if ((c == ')' && o != '(') || (c == ']' && o != '[') || (c == '}' && o != '{')) return false;
        }
    }
    return st.empty();
}

int main() {
    for (string s : {"{[()]()}", "([)]", "((())", "(a+b)*[c-d]"})
        cout << s << (balanced(s) ? " balanced" : " not balanced") << "\n";
    return 0;
}
`,
        java: R`import java.util.*;

class Main {
    static boolean balanced(String s) {
        Deque<Character> st = new ArrayDeque<>();
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '[' || c == '{') st.push(c);
            else if (c == ')' || c == ']' || c == '}') {
                if (st.isEmpty()) return false;
                char o = st.pop();
                if ((c == ')' && o != '(') || (c == ']' && o != '[') || (c == '}' && o != '{')) return false;
            }
        }
        return st.isEmpty();
    }

    public static void main(String[] args) {
        for (String s : new String[]{"{[()]()}", "([)]", "((())", "(a+b)*[c-d]"})
            System.out.println(s + (balanced(s) ? " balanced" : " not balanced"));
    }
}
`,
        py: R`PAIRS = {")": "(", "]": "[", "}": "{"}


def balanced(s):
    st = []
    for c in s:
        if c in "([{":
            st.append(c)
        elif c in PAIRS:
            if not st or st.pop() != PAIRS[c]:
                return False
    return not st


for s in ("{[()]()}", "([)]", "((())", "(a+b)*[c-d]"):
    print(s, "balanced" if balanced(s) else "not balanced")
`,
      },
    },
    {
      id: 'hanoi', title: 'Tower of Hanoi', summary: 'Move n disks with the recursion T(n) = 2T(n−1) + 1.', tags: ['Recursion', 'Stack'], time: 'O(2ⁿ)', best: '', space: 'O(n) stack', viz: 'hanoi',
      idea: 'To move n disks from A to C using B: move the top n−1 disks to B, move the largest disk to C, then move the n−1 disks from B to C. The recursion depth is n and the number of moves is 2ⁿ − 1.',
      steps: ['Base case: n == 0, nothing to do.', 'hanoi(n−1, from, via, to).', 'Move disk n from `from` to `to`.', 'hanoi(n−1, via, to, from).'],
      note: 'Each recursive call waits on the call stack, so the program uses a stack of pending sub-problems.',
      pseudo: ['hanoi(n, from, to, via):', '  if n == 0: return', '  hanoi(n - 1, from, via, to)', '  print "Move disk n from from to to"', '  hanoi(n - 1, via, to, from)'],
      expect: 'Move disk 1 from A to C\nMove disk 2 from A to B\nMove disk 1 from C to B\nMove disk 3 from A to C\nMove disk 1 from B to A\nMove disk 2 from B to C\nMove disk 1 from A to C\nTotal moves: 7\n',
      code: {
        c: R`#include <stdio.h>

int moves = 0;

void hanoi(int n, char from, char to, char via) {
    if (n == 0) return;
    hanoi(n - 1, from, via, to);
    printf("Move disk %d from %c to %c\n", n, from, to);
    moves++;
    hanoi(n - 1, via, to, from);
}

int main(void) {
    hanoi(3, 'A', 'C', 'B');
    printf("Total moves: %d\n", moves);
    return 0;
}
`,
        cpp: R`#include <iostream>
using namespace std;

int moves = 0;

void hanoi(int n, char from, char to, char via) {
    if (n == 0) return;
    hanoi(n - 1, from, via, to);
    cout << "Move disk " << n << " from " << from << " to " << to << "\n";
    moves++;
    hanoi(n - 1, via, to, from);
}

int main() {
    hanoi(3, 'A', 'C', 'B');
    cout << "Total moves: " << moves << "\n";
    return 0;
}
`,
        java: R`class Main {
    static int moves = 0;

    static void hanoi(int n, char from, char to, char via) {
        if (n == 0) return;
        hanoi(n - 1, from, via, to);
        System.out.println("Move disk " + n + " from " + from + " to " + to);
        moves++;
        hanoi(n - 1, via, to, from);
    }

    public static void main(String[] args) {
        hanoi(3, 'A', 'C', 'B');
        System.out.println("Total moves: " + moves);
    }
}
`,
        py: R`moves = 0


def hanoi(n, src, dst, via):
    global moves
    if n == 0:
        return
    hanoi(n - 1, src, via, dst)
    print(f"Move disk {n} from {src} to {dst}")
    moves += 1
    hanoi(n - 1, via, dst, src)


hanoi(3, "A", "C", "B")
print("Total moves:", moves)
`,
      },
    },
  ];
})();
