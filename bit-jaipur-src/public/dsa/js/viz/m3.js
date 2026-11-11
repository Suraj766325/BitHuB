/* ============================================================
 * viz/m3.js — Module III: stack, queue (linear / circular /
 * linked), deque, priority queue, infix→postfix, postfix
 * evaluation, balanced brackets, Tower of Hanoi.
 * ============================================================ */
(function () {
  'use strict';
  const DSA = window.DSA;
  const D = DSA.draw;
  const { rand } = DSA.UI;
  const VizError = DSA.VizError;

  const tokenRow = (tokens, cur, o) => tokens.map((t, i) => ({ id: 'tok' + i, shape: 'rect', x: o.x + i * 36, y: o.y, w: 32, h: 34, text: t, cls: 'n-token ' + (i === cur ? 'n-hl' : i < cur ? 'n-dim' : '') }));

  /* ---------------- stack ---------------- */
  DSA.viz.define('stack', {
    title: 'Stack',
    blurb: 'Last in, first out. Every operation happens at one end, the top, so push and pop are O(1).',
    variants: [{ id: 'array', label: 'Array' }, { id: 'linked', label: 'Linked list' }],
    args: { value: { label: 'Value', type: 'int', def: () => rand(1, 99), fresh: true } },
    ops: [{ id: 'push', label: 'Push', uses: ['value'], primary: true }, { id: 'pop', label: 'Pop' }, { id: 'peek', label: 'Peek' }],
    create: (variant) => ({ variant, a: [], cap: 6, uid: 0 }),
    draw(st, m) {
      const nodes = [], edges = [];
      if (st.variant === 'array') {
        for (let i = 0; i < st.cap; i++) {
          nodes.push({ id: 'slot' + i, shape: 'rect', x: 0, y: -i * 46, w: 70, h: 40, text: '', cls: 'n-empty' });
          nodes.push(D.text('ix' + i, i, -52, -i * 46, 't-idx'));
        }
        st.a.forEach((it, i) => nodes.push({ id: 'v' + it.k, shape: 'rect', x: 0, y: -i * 46, w: 70, h: 40, text: it.v, cls: m.hl === i ? (m.cls || 'n-hl') : '', enter: [0, -50] }));
        if (m.ghost) nodes.push({ id: 'v' + m.ghost.k, shape: 'rect', x: 0, y: -st.cap * 46 - 14, w: 70, h: 40, text: m.ghost.v, cls: m.cls || 'n-hl' });
        const top = m.top == null ? st.a.length - 1 : m.top;
        nodes.push(D.tag('top', 'top = ' + top, 96, -Math.max(top, -1) * 46, 'left', 'n-ptr'));
        nodes.push(D.text('lbl', 'stack[0..' + (st.cap - 1) + ']', 0, 40, 't-muted'));
      } else {
        const n = st.a.length;
        st.a.slice().reverse().forEach((it, j) => {
          const i = n - 1 - j;
          nodes.push(Object.assign(D.lnode('v' + it.k, it.v, j * 112, 0, m.hl === i ? (m.cls || 'n-hl') : ''), { enter: [0, -50] }));
          edges.push(D.next('v' + it.k, j === n - 1 ? 'null' : 'v' + st.a[i - 1].k));
        });
        nodes.push(D.text('null', 'NULL', n * 112 - 10, 0, 't-null'));
        if (m.ghost) { nodes.push(D.lnode('v' + m.ghost.k, m.ghost.v, 0, -70, m.cls || 'n-hl')); if (m.link && n) edges.push(D.next('v' + m.ghost.k, 'v' + st.a[n - 1].k, 'e-hl')); }
        nodes.push(D.tag('top', 'top', m.topOnGhost ? 0 : n ? 0 : n * 112 - 10, m.topOnGhost ? -106 : -40, 'down', 'n-ptr'));
      }
      return { nodes, edges };
    },
    run(st, op, a, snap) {
      const arr = st.variant === 'array';
      if (op === 'push') {
        if (arr && st.a.length === st.cap) return snap(`**Overflow.** \`top == MAX-1\`, the array is full, so ${a.value} cannot be pushed.`, { line: 0, tone: 'bad' });
        const it = { v: a.value, k: st.uid++ };
        if (arr) {
          snap(`Push ${a.value}: the stack is not full, so there is room.`, { line: 0, ghost: it });
          snap(`Move \`top\` up by one, to index ${st.a.length}.`, { line: 1, ghost: it, top: st.a.length });
          st.a.push(it);
          snap(`Store ${a.value} at \`stack[top]\`. Done in O(1).`, { line: 2, hl: st.a.length - 1, cls: 'n-ok' });
        } else {
          snap(`Push ${a.value}: allocate a new node.`, { line: 0, ghost: it });
          snap('Point the new node at the old top.', { line: 1, ghost: it, link: true });
          snap('Move `top` to the new node.', { line: 2, ghost: it, link: true, topOnGhost: true });
          st.a.push(it);
          snap(`${a.value} is the new top. No capacity limit and no shifting: O(1).`, { hl: st.a.length - 1, cls: 'n-ok' });
        }
      } else if (op === 'pop') {
        if (!st.a.length) return snap(`**Underflow.** The stack is empty${arr ? ' (`top == -1`)' : ' (`top == NULL`)'}, there is nothing to pop.`, { line: 0, tone: 'bad' });
        const i = st.a.length - 1, v = st.a[i].v;
        snap(`Pop: the stack is not empty. The top element is ${v}.`, { line: 1, hl: i });
        st.a.pop();
        snap(arr ? `Return ${v} and move \`top\` down to ${st.a.length - 1}. The slot is simply treated as free.` : `Move \`top\` to the next node, free the old one and return ${v}.`, { line: arr ? 2 : 3 });
      } else {
        if (!st.a.length) return snap('The stack is empty, there is no top element.', { tone: 'bad' });
        snap(`Peek returns ${st.a[st.a.length - 1].v} without removing it.`, { hl: st.a.length - 1, cls: 'n-ok' });
      }
    },
    code: {
      push: ['if top == MAX - 1: report OVERFLOW', 'top = top + 1', 'stack[top] = value'],
      pop: ['if top == -1: report UNDERFLOW', 'value = stack[top]', 'top = top - 1', 'return value'],
    },
    demo: [['push', { value: 12 }], ['push', { value: 7 }], ['push', { value: 31 }], ['pop'], ['push', { value: 5 }], ['pop'], ['pop']],
  });
  // the linked variant reads better with its own pseudocode
  const stackDef = DSA.viz.get('stack');
  const arrCode = stackDef.code;
  const linkCode = {
    push: ['node = new Node(value)', 'node.next = top', 'top = node'],
    pop: ['if top == NULL: report UNDERFLOW', 'temp = top', 'top = top.next', 'free(temp) and return its value'],
  };
  const stackRun = stackDef.run;
  stackDef.run = function (st, op, a, snap) { stackDef.code = st.variant === 'array' ? arrCode : linkCode; stackRun(st, op, a, snap); };

  /* ---------------- queue ---------------- */
  const RING = 8, LIN = 6;
  DSA.viz.define('queue', {
    title: 'Queue',
    blurb: 'First in, first out. Insert at the rear, delete from the front. A circular queue reuses the slots a linear queue wastes.',
    variants: [{ id: 'linear', label: 'Linear (array)' }, { id: 'circular', label: 'Circular (array)' }, { id: 'linked', label: 'Linked list' }],
    args: { value: { label: 'Value', type: 'int', def: () => rand(1, 99), fresh: true } },
    ops: [{ id: 'enqueue', label: 'Enqueue', uses: ['value'], primary: true }, { id: 'dequeue', label: 'Dequeue' }],
    create: (variant) => ({ variant, q: new Array(variant === 'circular' ? RING : LIN).fill(null), front: -1, rear: -1, list: [], uid: 0 }),
    draw(st, m) {
      const nodes = [], edges = [];
      if (st.variant === 'linear') {
        st.q.forEach((v, i) => nodes.push({ id: 'c' + i, shape: 'rect', x: i * 62, y: 0, w: 54, h: 46, text: v == null ? '' : v, sub: i, cls: v == null ? (st.front > i && st.front !== -1 ? 'n-empty n-waste' : 'n-empty') : m.hl === i ? (m.cls || 'n-hl') : '' }));
        nodes.push(D.tag('front', 'front = ' + st.front, Math.max(st.front, 0) * 62 - (st.front < 0 ? 62 : 0), -52, 'down', 'n-ptr'));
        nodes.push(D.tag('rear', 'rear = ' + st.rear, Math.max(st.rear, 0) * 62 - (st.rear < 0 ? 62 : 0), 66, 'up', 'n-ptr2'));
      } else if (st.variant === 'circular') {
        const R = 108;
        const pos = (i, r) => { const ang = -Math.PI / 2 + (i * 2 * Math.PI) / RING; return [Math.cos(ang) * r, Math.sin(ang) * r]; };
        st.q.forEach((v, i) => { const [x, y] = pos(i, R); nodes.push({ id: 'c' + i, shape: 'rect', x, y, w: 50, h: 42, text: v == null ? '' : v, cls: v == null ? 'n-empty' : m.hl === i ? (m.cls || 'n-hl') : '' }); const [ix, iy] = pos(i, R - 44); nodes.push(D.text('ix' + i, i, ix, iy, 't-idx')); });
        const same = st.front === st.rear && st.front !== -1;
        if (st.front >= 0) { const [x, y] = pos(st.front, R + 52); nodes.push(D.tag('front', same ? 'front = rear' : 'front', x, y, 'none', 'n-ptr')); } else nodes.push(D.tag('front', 'front = -1', -40, 0, 'none', 'n-ptr'));
        if (st.rear >= 0 && !same) { const [x, y] = pos(st.rear, R + 52); nodes.push(D.tag('rear', 'rear', x, y, 'none', 'n-ptr2')); } else if (st.rear < 0) nodes.push(D.tag('rear', 'rear = -1', 40, 0, 'none', 'n-ptr2'));
      } else {
        const n = st.list.length;
        st.list.forEach((it, i) => { nodes.push(Object.assign(D.lnode('v' + it.k, it.v, i * 112, 0, m.hl === i ? (m.cls || 'n-hl') : ''), { enter: [40, 0] })); edges.push(D.next('v' + it.k, i === n - 1 ? 'null' : 'v' + st.list[i + 1].k)); });
        nodes.push(D.text('null', 'NULL', n * 112 - 10, 0, 't-null'));
        nodes.push(D.tag('front', 'front', n ? 0 : -10, -40, 'down', 'n-ptr'));
        nodes.push(D.tag('rear', 'rear', n ? (n - 1) * 112 : -10, 44, 'up', 'n-ptr2'));
      }
      return { nodes, edges };
    },
    run(st, op, a, snap) {
      const def = DSA.viz.get('queue');
      def.code = QCODE[st.variant];
      if (st.variant === 'linked') {
        if (op === 'enqueue') {
          st.list.push({ v: a.value, k: st.uid++ });
          snap(`Enqueue ${a.value}: create a node and link it after the old rear.`, { line: 1, hl: st.list.length - 1 });
          snap('`rear` now points at the new node. O(1), because we keep the rear pointer.', { line: 2, hl: st.list.length - 1, cls: 'n-ok' });
        } else {
          if (!st.list.length) return snap('**Underflow.** `front == NULL`, the queue is empty.', { line: 0, tone: 'bad' });
          const v = st.list[0].v;
          snap(`Dequeue: the front node holds ${v}.`, { line: 1, hl: 0 });
          st.list.shift();
          snap(`Move \`front\` to the next node, free the old one and return ${v}.`, { line: 2 });
        }
        return;
      }
      const MAX = st.q.length, circ = st.variant === 'circular';
      if (op === 'enqueue') {
        const full = circ ? (st.rear + 1) % MAX === st.front : st.rear === MAX - 1;
        if (full) {
          const wasted = !circ && st.front > 0;
          return snap(circ ? '**Overflow.** `(rear + 1) % MAX == front`: every slot is in use.' : `**Overflow.** \`rear == MAX-1\`${wasted ? `, even though ${st.front} slot(s) before \`front\` are free. A linear queue cannot reuse them; a circular queue can.` : ': the array is full.'}`, { line: 0, tone: 'bad' });
        }
        if (st.front === -1) { st.front = 0; st.rear = 0; snap('The queue was empty, so `front` and `rear` both become 0.', { line: 1 }); }
        else { st.rear = circ ? (st.rear + 1) % MAX : st.rear + 1; snap(circ ? `Advance \`rear\` with wrap-around: \`(rear + 1) % ${MAX}\` = ${st.rear}.` : `Advance \`rear\` to ${st.rear}.`, { line: 2 }); }
        st.q[st.rear] = a.value;
        snap(`Store ${a.value} at \`queue[rear]\`. O(1).`, { line: 3, hl: st.rear, cls: 'n-ok' });
      } else {
        if (st.front === -1) return snap('**Underflow.** `front == -1`, the queue is empty.', { line: 0, tone: 'bad' });
        const v = st.q[st.front];
        snap(`Dequeue: the element at \`front\` is ${v}.`, { line: 1, hl: st.front });
        st.q[st.front] = null;
        if (st.front === st.rear) { st.front = -1; st.rear = -1; snap(`That was the only element, so reset \`front = rear = -1\`. Returned ${v}.`, { line: 2 }); }
        else { st.front = circ ? (st.front + 1) % MAX : st.front + 1; snap(circ ? `Advance \`front\` with wrap-around to ${st.front}. Returned ${v}.` : `Advance \`front\` to ${st.front}. The slot behind it is now wasted. Returned ${v}.`, { line: 3 }); }
      }
    },
    code: {},
    demo: [['enqueue', { value: 4 }], ['enqueue', { value: 9 }], ['enqueue', { value: 15 }], ['dequeue'], ['enqueue', { value: 23 }], ['dequeue']],
  });
  const QCODE = {
    linear: {
      enqueue: ['if rear == MAX - 1: report OVERFLOW', 'if front == -1: front = rear = 0', 'else: rear = rear + 1', 'queue[rear] = value'],
      dequeue: ['if front == -1: report UNDERFLOW', 'value = queue[front]', 'if front == rear: front = rear = -1', 'else: front = front + 1'],
    },
    circular: {
      enqueue: ['if (rear + 1) % MAX == front: report OVERFLOW', 'if front == -1: front = rear = 0', 'else: rear = (rear + 1) % MAX', 'queue[rear] = value'],
      dequeue: ['if front == -1: report UNDERFLOW', 'value = queue[front]', 'if front == rear: front = rear = -1', 'else: front = (front + 1) % MAX'],
    },
    linked: {
      enqueue: ['node = new Node(value)', 'if rear == NULL: front = node  else: rear.next = node', 'rear = node'],
      dequeue: ['if front == NULL: report UNDERFLOW', 'temp = front', 'front = front.next; free(temp)'],
    },
  };

  /* ---------------- deque ---------------- */
  const DQ = 7;
  DSA.viz.define('deque', {
    title: 'Deque (double-ended queue)',
    blurb: 'Insertion and deletion are allowed at both ends. Stored in a circular array, so both pointers wrap around.',
    args: { value: { label: 'Value', type: 'int', def: () => rand(1, 99), fresh: true } },
    ops: [{ id: 'insF', label: 'Insert front', uses: ['value'] }, { id: 'insR', label: 'Insert rear', uses: ['value'], primary: true }, { id: 'delF', label: 'Delete front' }, { id: 'delR', label: 'Delete rear' }],
    create: () => ({ q: new Array(DQ).fill(null), front: -1, rear: -1 }),
    draw(st, m) {
      const nodes = st.q.map((v, i) => ({ id: 'c' + i, shape: 'rect', x: i * 62, y: 0, w: 54, h: 46, text: v == null ? '' : v, sub: i, cls: v == null ? 'n-empty' : m.hl === i ? (m.cls || 'n-hl') : '' }));
      nodes.push(D.tag('front', 'front = ' + st.front, st.front < 0 ? -62 : st.front * 62, -52, 'down', 'n-ptr'));
      nodes.push(D.tag('rear', 'rear = ' + st.rear, st.rear < 0 ? -62 : st.rear * 62, 66, 'up', 'n-ptr2'));
      return { nodes };
    },
    run(st, op, a, snap) {
      const full = (st.front === 0 && st.rear === DQ - 1) || st.front === st.rear + 1;
      if (op === 'insF' || op === 'insR') {
        if (full) return snap('**Overflow.** The deque is full.', { line: 0, tone: 'bad' });
        if (st.front === -1) { st.front = st.rear = 0; snap('The deque was empty: `front = rear = 0`.', { line: 1 }); }
        else if (op === 'insF') { st.front = st.front === 0 ? DQ - 1 : st.front - 1; snap(`Move \`front\` one step back${st.front === DQ - 1 ? ', wrapping to the last index' : ''}: ${st.front}.`, { line: 2 }); }
        else { st.rear = st.rear === DQ - 1 ? 0 : st.rear + 1; snap(`Move \`rear\` one step forward${st.rear === 0 ? ', wrapping to index 0' : ''}: ${st.rear}.`, { line: 2 }); }
        const at = op === 'insF' ? st.front : st.rear;
        st.q[at] = a.value;
        snap(`Store ${a.value} at index ${at}.`, { line: 3, hl: at, cls: 'n-ok' });
      } else {
        if (st.front === -1) return snap('**Underflow.** The deque is empty.', { line: 0, tone: 'bad' });
        const at = op === 'delF' ? st.front : st.rear, v = st.q[at];
        snap(`Remove ${v} from the ${op === 'delF' ? 'front' : 'rear'}.`, { line: 1, hl: at });
        st.q[at] = null;
        if (st.front === st.rear) { st.front = st.rear = -1; snap('It was the last element: `front = rear = -1`.', { line: 2 }); }
        else if (op === 'delF') { st.front = st.front === DQ - 1 ? 0 : st.front + 1; snap(`Move \`front\` forward to ${st.front}.`, { line: 3 }); }
        else { st.rear = st.rear === 0 ? DQ - 1 : st.rear - 1; snap(`Move \`rear\` back to ${st.rear}.`, { line: 3 }); }
      }
    },
    code: {
      insF: ['if deque is full: report OVERFLOW', 'if front == -1: front = rear = 0', 'else if front == 0: front = MAX - 1  else: front = front - 1', 'deque[front] = value'],
      insR: ['if deque is full: report OVERFLOW', 'if front == -1: front = rear = 0', 'else if rear == MAX - 1: rear = 0  else: rear = rear + 1', 'deque[rear] = value'],
      delF: ['if front == -1: report UNDERFLOW', 'value = deque[front]', 'if front == rear: front = rear = -1', 'else if front == MAX - 1: front = 0  else: front = front + 1'],
      delR: ['if front == -1: report UNDERFLOW', 'value = deque[rear]', 'if front == rear: front = rear = -1', 'else if rear == 0: rear = MAX - 1  else: rear = rear - 1'],
    },
    demo: [['insR', { value: 10 }], ['insR', { value: 20 }], ['insF', { value: 5 }], ['insF', { value: 1 }], ['delR'], ['delF']],
  });

  /* ---------------- priority queue ---------------- */
  DSA.viz.define('pqueue', {
    title: 'Priority queue',
    blurb: 'Each element carries a priority. The element with the highest priority (here: the smallest number) leaves first; equal priorities leave in arrival order.',
    args: { value: { label: 'Value', type: 'int', def: () => rand(10, 99), fresh: true }, pr: { label: 'Priority', type: 'int', def: () => rand(1, 5), fresh: true, min: 1, max: 9 } },
    ops: [{ id: 'insert', label: 'Insert', uses: ['value', 'pr'], primary: true }, { id: 'remove', label: 'Delete highest priority' }],
    create: () => ({ a: [], uid: 0 }),
    draw(st, m) {
      const nodes = st.a.map((it, i) => ({ id: 'v' + it.k, shape: 'rect', x: i * 70, y: 0, w: 60, h: 46, text: it.v, sub: 'p = ' + it.p, cls: m.hl === i ? (m.cls || 'n-hl') : m.cmp === i ? 'n-cmp' : '', enter: [0, -60] }));
      if (m.ghost) nodes.push({ id: 'v' + m.ghost.k, shape: 'rect', x: m.gx * 70, y: -80, w: 60, h: 46, text: m.ghost.v, sub: 'p = ' + m.ghost.p, cls: 'n-hl' });
      if (st.a.length) nodes.push(D.tag('front', 'front', 0, -44, 'down', 'n-ptr'));
      else if (!m.ghost) nodes.push(D.text('empty', 'empty', 0, 0, 't-muted'));
      return { nodes };
    },
    run(st, op, a, snap) {
      if (op === 'insert') {
        if (st.a.length >= 8) return snap('**Overflow.** This demo queue holds 8 elements.', { tone: 'bad' });
        const it = { v: a.value, p: a.pr, k: st.uid++ };
        let i = 0;
        snap(`Insert ${it.v} with priority ${it.p}: scan from the front for the first element with a larger priority number.`, { line: 0, ghost: it, gx: 0 });
        while (i < st.a.length && st.a[i].p <= it.p) { snap(`Priority ${st.a[i].p} ≤ ${it.p}, so ${st.a[i].v} stays ahead. Move on.`, { line: 1, ghost: it, gx: i, cmp: i }); i++; }
        st.a.splice(i, 0, it);
        snap(`Insert at position ${i}; lower-priority elements shift right. Insertion is O(n), deletion stays O(1).`, { line: 2, hl: i, cls: 'n-ok' });
      } else {
        if (!st.a.length) return snap('**Underflow.** The priority queue is empty.', { tone: 'bad' });
        snap(`The front element ${st.a[0].v} has the highest priority (${st.a[0].p}).`, { line: 0, hl: 0 });
        const it = st.a.shift();
        snap(`Removed ${it.v}. Because the array is kept ordered, deletion is O(1).`, { line: 1 });
      }
    },
    code: {
      insert: ['i = 0', 'while i < n and queue[i].priority <= p: i = i + 1', 'shift queue[i..n-1] right and place the element at i'],
      remove: ['if queue is empty: report UNDERFLOW', 'remove and return the front element'],
    },
    demo: [['insert', { value: 40, pr: 3 }], ['insert', { value: 15, pr: 1 }], ['insert', { value: 62, pr: 2 }], ['insert', { value: 77, pr: 2 }], ['remove']],
  });

  /* ---------------- infix → postfix ---------------- */
  const PREC = { '^': 3, '*': 2, '/': 2, '%': 2, '+': 1, '-': 1 };
  function tokenize(expr, spaced) {
    const src = expr.trim();
    const toks = spaced ? src.split(/\s+/) : src.match(/[A-Za-z_]\w*|\d+(?:\.\d+)?|[-+*/%^()]/g) || [];
    if (!toks.length || (!spaced && toks.join('') !== src.replace(/\s+/g, ''))) throw new VizError('Use letters, numbers, + - * / ^ and brackets only.');
    if (toks.length > 28) throw new VizError('Keep the expression under 28 tokens so it fits on screen.');
    return toks;
  }
  const exprDraw = (st, m) => {
    const nodes = tokenRow(st.toks, m.cur == null ? st.toks.length : m.cur, { x: 0, y: 0 });
    nodes.unshift(D.text('lin', st.inLabel, -34, 0, 't-muted', 'end'));
    nodes.push(...D.vstack(st.stack, { x: 20, y: 250, marks: m.smark || {}, cap: 5, label: st.stackLabel }));
    if (st.out) {
      nodes.push(D.text('lout', 'postfix', 118, 250, 't-muted', 'end'));
      st.out.forEach((o, i) => nodes.push({ id: 'out' + o.k, shape: 'rect', x: 150 + i * 36, y: 250, w: 32, h: 34, text: o.v, cls: 'n-token ' + (m.ohl === i ? 'n-ok' : ''), enter: [0, -60] }));
    }
    return { nodes };
  };
  DSA.viz.define('infix', {
    title: 'Infix → postfix',
    blurb: 'Operands go straight to the output. Operators wait on a stack until an operator of lower precedence, or a closing bracket, releases them.',
    args: { expr: { label: 'Infix expression', type: 'text', def: '(A-B)+C*D/E-C', examples: ['(A-B)+C*D/E-C', '(A-2*(B+C)/D*E)+F', 'A+B*C^D-E'] } },
    ops: [{ id: 'convert', label: 'Convert', uses: ['expr'], primary: true }],
    create: () => ({ toks: [], stack: [], out: [], inLabel: 'infix', stackLabel: 'operator stack', uid: 0 }),
    draw: exprDraw,
    run(st, op, a, snap) {
      st.toks = tokenize(a.expr); st.stack = []; st.out = [];
      const emit = (v) => st.out.push({ v, k: st.uid++ });
      const top = () => st.stack[st.stack.length - 1];
      snap('Scan the expression from left to right, one token at a time.', { cur: -1, line: 0 });
      st.toks.forEach((t, i) => {
        if (/^[\w.]+$/.test(t)) { emit(t); snap(`\`${t}\` is an operand: append it to the output.`, { cur: i, line: 1, ohl: st.out.length - 1 }); }
        else if (t === '(') { st.stack.push({ v: t, k: st.uid++ }); snap('`(` is pushed; it marks where this bracket began.', { cur: i, line: 2, smark: { [st.stack.length - 1]: 'n-hl' } }); }
        else if (t === ')') {
          snap('`)` found: pop operators to the output until the matching `(`.', { cur: i, line: 3 });
          while (st.stack.length && top().v !== '(') { emit(st.stack.pop().v); snap(`Pop \`${st.out[st.out.length - 1].v}\` to the output.`, { cur: i, line: 3, ohl: st.out.length - 1 }); }
          if (!st.stack.length) throw new VizError('Unbalanced brackets: a ")" has no matching "(".');
          st.stack.pop(); snap('Discard the `(`. Brackets never appear in postfix.', { cur: i, line: 3 });
        } else {
          while (st.stack.length && top().v !== '(' && (PREC[top().v] > PREC[t] || (PREC[top().v] === PREC[t] && t !== '^'))) {
            const o = st.stack.pop().v; emit(o);
            snap(`\`${o}\` on the stack has ${PREC[o] > PREC[t] ? 'higher' : 'equal'} precedence than \`${t}\`${PREC[o] === PREC[t] ? ' (left-associative)' : ''}, so it must be applied first: pop it.`, { cur: i, line: 4, ohl: st.out.length - 1 });
          }
          st.stack.push({ v: t, k: st.uid++ });
          snap(`Push \`${t}\`.`, { cur: i, line: 5, smark: { [st.stack.length - 1]: 'n-hl' } });
        }
      });
      while (st.stack.length) {
        const o = st.stack.pop().v;
        if (o === '(') throw new VizError('Unbalanced brackets: a "(" is never closed.');
        emit(o); snap(`End of input: pop the remaining \`${o}\`.`, { line: 6, ohl: st.out.length - 1 });
      }
      snap(`Postfix: **${st.out.map((o) => o.v).join(' ')}**`, { tone: 'good' });
    },
    code: { convert: ['for each token t, left to right:', '  operand → append t to output', '  "(" → push t', '  ")" → pop to output until "(", discard "("', '  operator → while top has precedence ≥ t: pop to output', '             push t', 'pop every remaining operator to output'] },
    demo: [['convert', { expr: 'A+B*(C-D)' }]],
  });

  /* ---------------- postfix evaluation ---------------- */
  DSA.viz.define('postfix', {
    title: 'Postfix evaluation',
    blurb: 'Push operands. On an operator, pop two values, apply it (second popped is the left operand) and push the result.',
    args: { expr: { label: 'Postfix expression (space separated)', type: 'text', def: '12 3 4 + * 2 / 5 6 - +', examples: ['12 3 4 + * 2 / 5 6 - +', '5 6 2 + * 12 4 / -', '2 3 ^ 4 +'] } },
    ops: [{ id: 'eval', label: 'Evaluate', uses: ['expr'], primary: true }],
    create: () => ({ toks: [], stack: [], out: null, inLabel: 'postfix', stackLabel: 'operand stack', uid: 0 }),
    draw: exprDraw,
    run(st, op, a, snap) {
      st.toks = tokenize(a.expr, true); st.stack = [];
      const fmt = (x) => (Number.isInteger(x) ? x : +x.toFixed(2));
      snap('Scan left to right. Operands are pushed; operators work on the top two values.', { cur: -1, line: 0 });
      st.toks.forEach((t, i) => {
        if (/^-?\d+(\.\d+)?$/.test(t)) { st.stack.push({ v: fmt(parseFloat(t)), k: st.uid++ }); snap(`${t} is an operand: push it.`, { cur: i, line: 1, smark: { [st.stack.length - 1]: 'n-hl' } }); }
        else if (PREC[t]) {
          if (st.stack.length < 2) throw new VizError(`Operator ${t} needs two operands but the stack has ${st.stack.length}. Is this valid postfix?`);
          const n = st.stack.length;
          snap(`Operator \`${t}\`: pop the top two values.`, { cur: i, line: 2, smark: { [n - 1]: 'n-cmp', [n - 2]: 'n-cmp' } });
          const b = st.stack.pop().v, x = st.stack.pop().v;
          if ((t === '/' || t === '%') && b === 0) throw new VizError('Division by zero.');
          const r = fmt(t === '+' ? x + b : t === '-' ? x - b : t === '*' ? x * b : t === '/' ? x / b : t === '%' ? x % b : Math.pow(x, b));
          st.stack.push({ v: r, k: st.uid++ });
          snap(`${x} ${t} ${b} = **${r}**. Push the result. (The value popped second is the left operand.)`, { cur: i, line: 3, smark: { [st.stack.length - 1]: 'n-ok' } });
        } else throw new VizError(`"${t}" is not a number or an operator. Separate tokens with spaces.`);
      });
      if (st.stack.length !== 1) throw new VizError('Too many operands: the expression is not valid postfix.');
      snap(`One value is left on the stack: the answer is **${st.stack[0].v}**.`, { line: 4, smark: { 0: 'n-ok' }, tone: 'good' });
    },
    code: { eval: ['for each token t, left to right:', '  operand → push t', '  operator → b = pop(), a = pop()', '             push (a operator b)', 'the single value left is the result'] },
    demo: [['eval', { expr: '6 2 3 + * 4 -' }]],
  });

  /* ---------------- balanced brackets ---------------- */
  const PAIR = { ')': '(', ']': '[', '}': '{' };
  DSA.viz.define('parens', {
    title: 'Balanced brackets',
    blurb: 'Push every opening bracket. Each closing bracket must match the most recent unmatched opening one, which is exactly the top of a stack.',
    args: { expr: { label: 'Brackets', type: 'text', def: '{[()]()}', examples: ['{[()]()}', '([)]', '((())'] } },
    ops: [{ id: 'check', label: 'Check', uses: ['expr'], primary: true }],
    create: () => ({ toks: [], stack: [], out: null, inLabel: 'input', stackLabel: 'stack', uid: 0 }),
    draw: exprDraw,
    run(st, op, a, snap) {
      const src = a.expr.replace(/\s+/g, '');
      if (!/^[()[\]{}]+$/.test(src) || src.length > 24) throw new VizError('Enter up to 24 brackets: ( ) [ ] { }');
      st.toks = src.split(''); st.stack = [];
      for (let i = 0; i < st.toks.length; i++) {
        const t = st.toks[i];
        if (!PAIR[t]) { st.stack.push({ v: t, k: st.uid++ }); snap(`\`${t}\` opens: push it.`, { cur: i, line: 1, smark: { [st.stack.length - 1]: 'n-hl' } }); continue; }
        const n = st.stack.length;
        if (!n) return snap(`\`${t}\` closes, but the stack is empty. **Not balanced.**`, { cur: i, line: 2, tone: 'bad' });
        if (st.stack[n - 1].v !== PAIR[t]) return snap(`\`${t}\` does not match the top \`${st.stack[n - 1].v}\`. **Not balanced.**`, { cur: i, line: 3, smark: { [n - 1]: 'n-bad' }, tone: 'bad' });
        snap(`\`${t}\` matches the top \`${st.stack[n - 1].v}\`.`, { cur: i, line: 3, smark: { [n - 1]: 'n-ok' } });
        st.stack.pop(); snap('Pop the matched pair.', { cur: i, line: 3 });
      }
      if (st.stack.length) snap(`Input finished but ${st.stack.length} opening bracket(s) remain. **Not balanced.**`, { line: 4, tone: 'bad', smark: Object.fromEntries(st.stack.map((_, i) => [i, 'n-bad'])) });
      else snap('Input finished and the stack is empty. **Balanced.**', { line: 4, tone: 'good' });
    },
    code: { check: ['for each character c:', '  opening bracket → push c', '  closing bracket and stack empty → NOT balanced', '  closing bracket → pop; if it does not match c → NOT balanced', 'balanced only if the stack is empty at the end'] },
    demo: [['check', { expr: '{[()]}' }]],
  });

  /* ---------------- Tower of Hanoi ---------------- */
  DSA.viz.define('hanoi', {
    title: 'Tower of Hanoi',
    blurb: 'Move n disks from A to C: move n−1 disks out of the way, move the largest, move the n−1 back on top. That takes 2ⁿ − 1 moves.',
    args: { n: { label: 'Disks', type: 'int', def: 3, min: 1, max: 5 } },
    ops: [{ id: 'solve', label: 'Solve', uses: ['n'], primary: true }],
    create: () => ({ pegs: [[3, 2, 1], [], []], n: 3 }),
    draw(st, m) {
      const nodes = [], PX = [0, 220, 440], names = ['A', 'B', 'C'];
      PX.forEach((x, p) => {
        nodes.push({ id: 'peg' + p, shape: 'rect', x, y: -72, w: 8, h: 150, rx: 4, cls: 'n-peg' });
        nodes.push({ id: 'base' + p, shape: 'rect', x, y: 8, w: 190, h: 10, rx: 5, cls: 'n-peg', sub: names[p] + (p === 0 ? ' (source)' : p === 1 ? ' (auxiliary)' : ' (destination)') });
      });
      st.pegs.forEach((peg, p) => peg.forEach((d, i) => nodes.push({ id: 'disk' + d, shape: 'rect', x: PX[p], y: -10 - i * 26, w: 40 + d * 28, h: 22, rx: 11, text: d, cls: 'n-disk ' + (m.moved === d ? 'n-hl' : '') })));
      return { nodes };
    },
    run(st, op, a, snap) {
      st.n = a.n; st.pegs = [[], [], []];
      for (let d = a.n; d >= 1; d--) st.pegs[0].push(d);
      const names = ['A', 'B', 'C'], total = Math.pow(2, a.n) - 1;
      let moves = 0;
      snap(`${a.n} disk(s) on peg A. Only one disk moves at a time and a larger disk never sits on a smaller one. Minimum moves: 2^${a.n} − 1 = ${total}.`, { line: 0 });
      const hanoi = (n, from, to, via) => {
        if (n === 0) return;
        hanoi(n - 1, from, via, to);
        st.pegs[to].push(st.pegs[from].pop()); moves++;
        snap(`Move ${moves} of ${total}: disk ${n} from ${names[from]} to ${names[to]}.`, { line: 3, moved: n }, { hold: 0.75 });
        hanoi(n - 1, via, to, from);
      };
      hanoi(a.n, 0, 2, 1);
      snap(`Solved in ${moves} moves. T(n) = 2T(n−1) + 1 gives 2ⁿ − 1, so the running time is O(2ⁿ).`, { tone: 'good' });
    },
    code: { solve: ['hanoi(n, from, to, via):', '  if n == 0: return', '  hanoi(n - 1, from, via, to)', '  move disk n from → to', '  hanoi(n - 1, via, to, from)'] },
    demo: [['solve', { n: 3 }]],
    view: { minW: 660, minH: 260 },
  });
})();
