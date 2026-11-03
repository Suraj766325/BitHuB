/* ============================================================
 * verilog.js — a Verilog-2001 subset: parser, elaborator,
 * event-driven 4-state simulator and a small synthesizer.
 * Powers the Xilinx ISE mock (experiment 12).
 *
 * Supported:
 *   modules (ANSI and non-ANSI ports), input/output/inout, wire,
 *   reg, integer, parameter/localparam, vectors [msb:lsb]
 *   gate primitives: and or nand nor xor xnor not buf
 *   assign (with full expression syntax), module instances
 *   (named or positional ports), always @(...) / @* / @(posedge ..),
 *   initial, begin/end, if/else, case/casez/casex, for, repeat,
 *   while, forever, #delays, blocking and non-blocking assignment,
 *   $display $write $monitor $strobe $finish $stop $time $random
 * Values are 4-state (0, 1, x, z) vectors up to 32 bits.
 * ============================================================ */
(function (G) {
  'use strict';
  const DSD = (G.DSD = G.DSD || {});

  class VError extends Error { constructor(msg, line, code, file) { super(msg); this.line = line; this.code = code || 806; this.file = file; } }

  /* ================= lexer ================= */
  const KW = new Set(('module endmodule input output inout wire reg integer parameter localparam assign always initial begin end if else case casez casex endcase default for repeat while forever posedge negedge or and nand nor xor xnor not buf supply0 supply1 tri genvar').split(' '));
  const OPS = ['===', '!==', '<<<', '>>>', '==', '!=', '<=', '>=', '&&', '||', '~&', '~|', '~^', '^~', '<<', '>>', '**', '+:', '-:'];
  function lex(src, file) {
    const toks = []; let i = 0, line = 1;
    const n = src.length;
    while (i < n) {
      const c = src[i];
      if (c === '\n') { line++; i++; continue; }
      if (c === ' ' || c === '\t' || c === '\r') { i++; continue; }
      if (c === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') i++; continue; }
      if (c === '/' && src[i + 1] === '*') {
        i += 2; while (i < n && !(src[i] === '*' && src[i + 1] === '/')) { if (src[i] === '\n') line++; i++; }
        if (i >= n) throw new VError('Unterminated comment', line, 806, file); i += 2; continue;
      }
      if (c === '`') { // compiler directive: skip the line
        let j = i; while (j < n && src[j] !== '\n') j++;
        const d = src.slice(i, j).trim();
        if (/^`timescale/.test(d)) { const m = /`timescale\s+(\d+)\s*(s|ms|us|ns|ps|fs)/.exec(d); if (m) toks.timescale = m[1] + m[2]; }
        i = j; continue;
      }
      if (c === '"') {
        let j = i + 1, s = '';
        while (j < n && src[j] !== '"') { if (src[j] === '\\' && j + 1 < n) { const e = src[j + 1]; s += e === 'n' ? '\n' : e === 't' ? '\t' : e; j += 2; } else s += src[j++]; }
        toks.push({ t: 'str', v: s, line }); i = j + 1; continue;
      }
      if (/[A-Za-z_$]/.test(c)) {
        let j = i + 1; while (j < n && /[A-Za-z0-9_$]/.test(src[j])) j++;
        const w = src.slice(i, j);
        toks.push({ t: w[0] === '$' ? 'sys' : KW.has(w) ? 'kw' : 'id', v: w, line }); i = j; continue;
      }
      if (/[0-9']/.test(c)) {
        const m = /^(\d[\d_]*)?\s*'\s*([sS]?)([bBoOdDhH])\s*([0-9a-fA-FxXzZ?_]+)/.exec(src.slice(i));
        if (m) { toks.push({ t: 'num', size: m[1] ? parseInt(m[1].replace(/_/g, ''), 10) : 32, base: m[3].toLowerCase(), digits: m[4].replace(/_/g, ''), line, raw: m[0] }); i += m[0].length; continue; }
        const d = /^\d[\d_]*(\.\d+)?/.exec(src.slice(i));
        if (d) { toks.push({ t: 'num', size: 32, base: 'd', digits: d[0].replace(/_/g, ''), line, raw: d[0], unsized: true }); i += d[0].length; continue; }
      }
      const op = OPS.find((o) => src.startsWith(o, i));
      if (op) { toks.push({ t: 'op', v: op, line }); i += op.length; continue; }
      if ('()[]{};,.#@:?=+-*/%!~&|^<>'.includes(c)) { toks.push({ t: 'op', v: c, line }); i++; continue; }
      throw new VError(`Syntax error near "${c}".`, line, 806, file);
    }
    toks.push({ t: 'eof', v: '<EOF>', line });
    return toks;
  }

  /* ================= values ================= */
  const M = (w) => (w >= 32 ? 0xFFFFFFFF : ((1 << w) >>> 0) - 1);
  const mk = (w, v, x, z) => { const m = M(w); x = (x || 0) & m; return { w, v: (v & ~x & m) >>> 0, x: x >>> 0, z: ((z || 0) & x & m) >>> 0 }; };
  const X = (w) => mk(w, 0, M(w), 0), Zv = (w) => mk(w, 0, M(w), M(w));
  const resize = (a, w) => mk(w, a.v, a.x, a.z);
  const known = (a) => a.x === 0;
  const isTrue = (a) => (a.v !== 0 ? 1 : a.x !== 0 ? 2 : 0); // 1 true, 0 false, 2 unknown
  function numVal(tok) {
    const w = tok.size || 32, b = tok.base, d = tok.digits.toLowerCase();
    if (b === 'd') { if (/[xz?]/.test(d)) return d.includes('z') ? Zv(w) : X(w); return mk(w, Number(d) >>> 0, 0); }
    const bits = b === 'b' ? 1 : b === 'o' ? 3 : 4;
    let v = 0, x = 0, z = 0, pos = 0;
    for (let k = d.length - 1; k >= 0; k--) {
      const ch = d[k];
      for (let q = 0; q < bits; q++) {
        if (pos >= 32) break;
        const bit = 1 << pos;
        if (ch === 'x') x |= bit; else if (ch === 'z' || ch === '?') { x |= bit; z |= bit; } else if ((parseInt(ch, 16) >> q) & 1) v |= bit;
        pos++;
      }
    }
    // extend a leading x/z digit to the full width (Verilog rule)
    const top = d[0];
    if ((top === 'x' || top === 'z' || top === '?') && pos < w) { const ext = (M(w) & ~M(pos)) >>> 0; x |= ext; if (top !== 'x') z |= ext; }
    return mk(w, v >>> 0, x >>> 0, z >>> 0);
  }
  const OP = {
    and(a, b) { const w = Math.max(a.w, b.w), m = M(w); a = resize(a, w); b = resize(b, w); const a0 = ~a.v & ~a.x & m, b0 = ~b.v & ~b.x & m, r1 = a.v & b.v, r0 = a0 | b0; return mk(w, r1, ~(r1 | r0) & m); },
    or(a, b) { const w = Math.max(a.w, b.w), m = M(w); a = resize(a, w); b = resize(b, w); const a0 = ~a.v & ~a.x & m, b0 = ~b.v & ~b.x & m, r1 = a.v | b.v, r0 = a0 & b0; return mk(w, r1, ~(r1 | r0) & m); },
    xor(a, b) { const w = Math.max(a.w, b.w); a = resize(a, w); b = resize(b, w); const x = a.x | b.x; return mk(w, (a.v ^ b.v) & ~x, x); },
    not(a) { return mk(a.w, ~a.v & ~a.x, a.x); },
    arith(a, b, f) { const w = Math.max(a.w, b.w); if (!known(a) || !known(b)) return X(w); const r = f(a.v, b.v); return r === null ? X(w) : mk(w, r >>> 0, 0); },
    cmp(a, b, f) { if (!known(a) || !known(b)) return X(1); return mk(1, f(a.v, b.v) ? 1 : 0, 0); },
    red(a, f) { const m = M(a.w); if (f === 'and') { if ((~a.v & ~a.x & m) !== 0) return mk(1, 0, 0); return a.x ? X(1) : mk(1, 1, 0); } if (f === 'or') { if (a.v) return mk(1, 1, 0); return a.x ? X(1) : mk(1, 0, 0); } if (a.x) return X(1); let p = 0, v = a.v; while (v) { p ^= v & 1; v >>>= 1; } return mk(1, p, 0); },
  };
  const binary = {
    '&': OP.and, '|': OP.or, '^': OP.xor, '~^': (a, b) => OP.not(OP.xor(a, b)), '^~': (a, b) => OP.not(OP.xor(a, b)),
    '+': (a, b) => OP.arith(a, b, (x, y) => x + y), '-': (a, b) => OP.arith(a, b, (x, y) => x - y), '*': (a, b) => OP.arith(a, b, (x, y) => Math.imul(x, y)),
    '/': (a, b) => OP.arith(a, b, (x, y) => (y ? Math.floor(x / y) : null)), '%': (a, b) => OP.arith(a, b, (x, y) => (y ? x % y : null)),
    '**': (a, b) => OP.arith(a, b, (x, y) => Math.pow(x, y)),
    '<<': (a, b) => (known(b) ? mk(a.w, a.v << b.v, a.x << b.v) : X(a.w)), '>>': (a, b) => (known(b) ? mk(a.w, a.v >>> b.v, a.x >>> b.v) : X(a.w)),
    '<<<': (a, b) => binary['<<'](a, b), '>>>': (a, b) => binary['>>'](a, b),
    '==': (a, b) => OP.cmp(a, b, (x, y) => x === y), '!=': (a, b) => OP.cmp(a, b, (x, y) => x !== y),
    '<': (a, b) => OP.cmp(a, b, (x, y) => x < y), '<=': (a, b) => OP.cmp(a, b, (x, y) => x <= y),
    '>': (a, b) => OP.cmp(a, b, (x, y) => x > y), '>=': (a, b) => OP.cmp(a, b, (x, y) => x >= y),
    '===': (a, b) => { const w = Math.max(a.w, b.w); a = resize(a, w); b = resize(b, w); return mk(1, a.v === b.v && a.x === b.x && a.z === b.z ? 1 : 0, 0); },
    '!==': (a, b) => mk(1, binary['==='](a, b).v ? 0 : 1, 0),
    '&&': (a, b) => { const p = isTrue(a), q = isTrue(b); return p === 0 || q === 0 ? mk(1, 0, 0) : p === 1 && q === 1 ? mk(1, 1, 0) : X(1); },
    '||': (a, b) => { const p = isTrue(a), q = isTrue(b); return p === 1 || q === 1 ? mk(1, 1, 0) : p === 0 && q === 0 ? mk(1, 0, 0) : X(1); },
  };
  const unary = {
    '~': OP.not, '!': (a) => { const t = isTrue(a); return t === 2 ? X(1) : mk(1, t ? 0 : 1, 0); }, '-': (a) => (known(a) ? mk(a.w, -a.v >>> 0, 0) : X(a.w)), '+': (a) => a,
    '&': (a) => OP.red(a, 'and'), '|': (a) => OP.red(a, 'or'), '^': (a) => OP.red(a, 'xor'),
    '~&': (a) => OP.not(OP.red(a, 'and')), '~|': (a) => OP.not(OP.red(a, 'or')), '~^': (a) => OP.not(OP.red(a, 'xor')),
  };
  function fmtBits(a) {
    let s = '';
    for (let i = a.w - 1; i >= 0; i--) { const b = 1 << i; s += a.x & b ? (a.z & b ? 'z' : 'x') : a.v & b ? '1' : '0'; }
    return s;
  }
  const fmtVal = (a, radix) => {
    if (radix === 'd') return a.x ? (a.z === a.x ? 'z' : 'x') : String(a.v);
    if (radix === 'h') { if (a.x) return fmtBits(a); return a.v.toString(16).padStart(Math.ceil(a.w / 4), '0'); }
    return fmtBits(a);
  };

  /* ================= parser ================= */
  const GATES = new Set(['and', 'or', 'nand', 'nor', 'xor', 'xnor', 'not', 'buf']);
  function parse(src, file) {
    const T = lex(src, file);
    let p = 0;
    const peek = (k) => T[p + (k || 0)], next = () => T[p++];
    const is = (v, k) => { const t = peek(k); return (t.t === 'op' || t.t === 'kw') && t.v === v; };
    const near = (t) => (t.t === 'eof' ? 'end of file' : `"${t.v !== undefined ? t.v : t.raw}"`);
    const fail = (t) => { throw new VError(`Syntax error near ${near(t || peek())}.`, (t || peek()).line, 806, file); };
    const expect = (v) => { if (!is(v)) fail(); return next(); };
    const ident = () => { const t = peek(); if (t.t !== 'id') fail(); next(); return t; };
    const accept = (v) => { if (is(v)) { next(); return true; } return false; };

    function range() {
      if (!is('[')) return null;
      next(); const msb = expr(); expect(':'); const lsb = expr(); expect(']');
      return { msb, lsb };
    }
    function primary() {
      const t = peek();
      if (t.t === 'num') { next(); return { k: 'num', val: numVal(t), line: t.line, raw: t.raw, unsized: t.unsized }; }
      if (t.t === 'str') { next(); return { k: 'str', v: t.v, line: t.line }; }
      if (t.t === 'sys') { next(); const args = []; if (accept('(')) { if (!is(')')) do args.push(expr()); while (accept(',')); expect(')'); } return { k: 'sys', name: t.v, args, line: t.line }; }
      if (is('(')) { next(); const e = expr(); expect(')'); return e; }
      if (is('{')) {
        next(); const first = expr();
        if (is('{')) { next(); const parts = [expr()]; while (accept(',')) parts.push(expr()); expect('}'); expect('}'); return { k: 'rep', n: first, parts, line: t.line }; }
        const parts = [first]; while (accept(',')) parts.push(expr()); expect('}');
        return { k: 'cat', parts, line: t.line };
      }
      if (t.t === 'id') {
        next(); let e = { k: 'id', name: t.v, line: t.line };
        while (is('[')) {
          next(); const a = expr();
          if (accept(':')) { const b = expr(); expect(']'); e = { k: 'part', of: e, msb: a, lsb: b, line: t.line }; }
          else if (is('+:') || is('-:')) { const dir = next().v; const b = expr(); expect(']'); e = { k: 'ipart', of: e, base: a, width: b, dir, line: t.line }; }
          else { expect(']'); e = { k: 'bit', of: e, idx: a, line: t.line }; }
        }
        return e;
      }
      fail(t);
    }
    function unaryE() {
      const t = peek();
      if (t.t === 'op' && ['~', '!', '-', '+', '&', '|', '^', '~&', '~|', '~^'].includes(t.v)) { next(); return { k: 'un', op: t.v, a: unaryE(), line: t.line }; }
      return primary();
    }
    const PREC = [['||'], ['&&'], ['|'], ['^', '~^', '^~'], ['&'], ['==', '!=', '===', '!=='], ['<', '<=', '>', '>='], ['<<', '>>', '<<<', '>>>'], ['+', '-'], ['*', '/', '%'], ['**']];
    function binE(level) {
      if (level >= PREC.length) return unaryE();
      let a = binE(level + 1);
      for (;;) {
        const t = peek();
        if (t.t === 'op' && PREC[level].includes(t.v)) { next(); const b = binE(level + 1); a = { k: 'bin', op: t.v, a, b, line: t.line }; } else break;
      }
      return a;
    }
    function expr() {
      const c = binE(0);
      if (is('?')) { const t = next(); const a = expr(); expect(':'); const b = expr(); return { k: 'cond', c, a, b, line: t.line }; }
      return c;
    }
    function delayVal() { // after '#'
      const t = peek();
      if (t.t === 'num') { next(); return { k: 'num', val: mk(32, Math.round(Number(t.digits)), 0), line: t.line, real: Number(t.digits) }; }
      if (t.t === 'id') { next(); return { k: 'id', name: t.v, line: t.line }; }
      if (is('(')) { next(); const e = expr(); expect(')'); return e; }
      fail();
    }
    function lvalue() {
      if (is('{')) { const t = next(); const parts = [lvalue()]; while (accept(',')) parts.push(lvalue()); expect('}'); return { k: 'cat', parts, line: t.line }; }
      const e = primary();
      if (!['id', 'bit', 'part', 'ipart'].includes(e.k)) fail();
      return e;
    }
    function stmt() {
      const t = peek();
      if (accept(';')) return { k: 'null', line: t.line };
      if (is('begin')) {
        next(); let label = null; if (accept(':')) label = ident().v;
        const body = []; while (!is('end')) { if (peek().t === 'eof') fail(); body.push(stmt()); } next();
        return { k: 'block', body, label, line: t.line };
      }
      if (is('#')) { next(); const d = delayVal(); return { k: 'delay', d, s: is(';') ? (next(), { k: 'null' }) : stmt(), line: t.line }; }
      if (is('@')) { next(); const ev = eventCtl(); return { k: 'event', ev, s: is(';') ? (next(), { k: 'null' }) : stmt(), line: t.line }; }
      if (is('if')) { next(); expect('('); const c = expr(); expect(')'); const a = stmt(); let b = null; if (accept('else')) b = stmt(); return { k: 'if', c, a, b, line: t.line }; }
      if (is('case') || is('casez') || is('casex')) {
        const kind = next().v; expect('('); const e = expr(); expect(')');
        const items = [];
        while (!is('endcase')) {
          if (peek().t === 'eof') fail();
          if (accept('default')) { accept(':'); items.push({ def: true, s: stmt() }); continue; }
          const labels = [expr()]; while (accept(',')) labels.push(expr()); expect(':');
          items.push({ labels, s: stmt() });
        }
        next(); return { k: 'case', kind, e, items, line: t.line };
      }
      if (is('for')) { next(); expect('('); const init = assignStmt(); expect(';'); const c = expr(); expect(';'); const inc = assignStmt(); expect(')'); return { k: 'for', init, c, inc, s: stmt(), line: t.line }; }
      if (is('repeat')) { next(); expect('('); const n = expr(); expect(')'); return { k: 'repeat', n, s: stmt(), line: t.line }; }
      if (is('while')) { next(); expect('('); const c = expr(); expect(')'); return { k: 'while', c, s: stmt(), line: t.line }; }
      if (is('forever')) { next(); return { k: 'forever', s: stmt(), line: t.line }; }
      if (t.t === 'sys') { const e = primary(); expect(';'); return { k: 'sys', name: e.name, args: e.args, line: t.line }; }
      if (t.t === 'id' || is('{')) { const a = assignStmt(); expect(';'); return a; }
      fail(t);
    }
    function assignStmt() {
      const t = peek(); const lhs = lvalue();
      let nb = false;
      if (is('<=')) { next(); nb = true; } else expect('=');
      let d = null; if (accept('#')) d = delayVal();
      return { k: 'assign', lhs, rhs: expr(), nb, d, line: t.line };
    }
    function eventCtl() {
      if (accept('*')) return { star: true };
      expect('(');
      if (accept('*')) { expect(')'); return { star: true }; }
      const list = [];
      do {
        let edge = null; if (is('posedge') || is('negedge')) edge = next().v;
        list.push({ edge, e: expr() });
      } while (accept('or') || accept(','));
      expect(')');
      return { list };
    }
    function module() {
      const mt = expect('module'); const name = ident();
      const m = { name: name.v, line: name.line, ports: [], decls: [], items: [], file };
      if (accept('#')) { expect('('); do { accept('parameter'); paramDecl(m); } while (accept(',')); expect(')'); }
      if (accept('(')) {
        if (!is(')')) {
          let dir = null, kind = null, r = null;
          do {
            if (is('input') || is('output') || is('inout')) { dir = next().v; kind = accept('reg') ? 'reg' : accept('wire') ? 'wire' : null; r = range(); }
            const id = ident();
            m.ports.push(id.v);
            if (dir) m.decls.push({ k: 'port', dir, kind, range: r, name: id.v, line: id.line });
          } while (accept(','));
        }
        expect(')');
      }
      expect(';');
      while (!is('endmodule')) {
        if (peek().t === 'eof') throw new VError(`Syntax error near end of file — missing "endmodule" for module <${m.name}>.`, peek().line, 806, file);
        item(m);
      }
      next();
      void mt;
      return m;
    }
    function paramDecl(m) {
      range();
      do { const id = ident(); expect('='); m.decls.push({ k: 'param', name: id.v, e: expr(), line: id.line }); } while (is(',') && peek(1).t === 'id' && peek(2).v === '=' && (next(), true));
    }
    function item(m) {
      const t = peek();
      if (is('input') || is('output') || is('inout')) {
        const dir = next().v; const kind = accept('reg') ? 'reg' : accept('wire') ? 'wire' : null; const r = range();
        do { const id = ident(); m.decls.push({ k: 'port', dir, kind, range: r, name: id.v, line: id.line }); } while (accept(','));
        expect(';'); return;
      }
      if (is('wire') || is('reg') || is('integer') || is('tri') || is('supply0') || is('supply1') || is('genvar')) {
        const kind = next().v; const r = kind === 'integer' ? { msb: { k: 'num', val: mk(32, 31, 0) }, lsb: { k: 'num', val: mk(32, 0, 0) } } : range();
        do {
          const id = ident();
          m.decls.push({ k: 'net', kind: kind === 'tri' ? 'wire' : kind, range: r, name: id.v, line: id.line });
          if (accept('=')) m.items.push({ k: 'cassign', lhs: { k: 'id', name: id.v, line: id.line }, rhs: expr(), line: id.line, init: kind === 'reg' });
        } while (accept(','));
        expect(';'); return;
      }
      if (is('parameter') || is('localparam')) { next(); paramDecl(m); expect(';'); return; }
      if (is('assign')) {
        next(); if (accept('#')) delayVal();
        do { const lhs = lvalue(); expect('='); m.items.push({ k: 'cassign', lhs, rhs: expr(), line: t.line }); } while (accept(','));
        expect(';'); return;
      }
      if (is('always') || is('initial')) { const kind = next().v; m.items.push({ k: kind, s: stmt(), line: t.line }); return; }
      if (t.t === 'kw' && GATES.has(t.v)) {
        next(); if (accept('#')) delayVal();
        do {
          let inst = null; if (peek().t === 'id') inst = next().v;
          range();
          expect('('); const args = [expr()]; while (accept(',')) args.push(expr()); expect(')');
          m.items.push({ k: 'gate', type: t.v, inst, args, line: t.line });
        } while (accept(','));
        expect(';'); return;
      }
      if (t.t === 'id') {
        const mod = next().v;
        const params = [];
        if (accept('#')) { expect('('); if (!is(')')) do params.push(is('.') ? (next(), ident(), expect('('), (() => { const e = expr(); expect(')'); return e; })()) : expr()); while (accept(',')); expect(')'); }
        do {
          const inst = ident(); expect('(');
          const conns = [];
          if (!is(')')) {
            do {
              if (accept('.')) { const port = ident(); expect('('); const e = is(')') ? null : expr(); expect(')'); conns.push({ port: port.v, e, line: port.line }); }
              else conns.push({ port: null, e: expr(), line: peek().line });
            } while (accept(','));
          }
          expect(')');
          m.items.push({ k: 'inst', mod, inst: inst.v, conns, params, line: t.line });
        } while (accept(','));
        expect(';'); return;
      }
      fail(t);
    }
    const mods = [];
    while (peek().t !== 'eof') { if (!is('module')) fail(); mods.push(module()); }
    return { modules: mods, timescale: T.timescale || null };
  }

  /* ================= elaboration + simulation ================= */
  function elaborate(modules, topName, opts) {
    opts = opts || {};
    const byName = {}; modules.forEach((m) => { byName[m.name] = m; });
    const top = byName[topName];
    if (!top) throw new VError(`Top module <${topName}> not found.`, 1, 2228);
    const signals = [], procs = [], conts = [], errors = [], warnings = [];
    const err = (msg, line, code, file) => { errors.push({ msg, line, code, file }); };

    function constEval(e, scope) {
      const v = evalStatic(e, scope);
      if (!v || !known(v)) throw new VError('Expression is not a constant.', e.line || 0, 1206);
      return v.v | 0;
    }
    function evalStatic(e, scope) {
      if (e.k === 'num') return e.val;
      if (e.k === 'id' && scope.params[e.name] !== undefined) return scope.params[e.name];
      if (e.k === 'bin') return binary[e.op](evalStatic(e.a, scope), evalStatic(e.b, scope));
      if (e.k === 'un') return unary[e.op](evalStatic(e.a, scope));
      if (e.k === 'cond') { const c = isTrue(evalStatic(e.c, scope)); return c === 1 ? evalStatic(e.a, scope) : evalStatic(e.b, scope); }
      return null;
    }

    function instantiate(m, prefix, paramOver, depth) {
      if (depth > 16) throw new VError('Recursive module instantiation.', m.line, 1063, m.file);
      const scope = { m, prefix, sigs: {}, params: {} };
      for (const d of m.decls) if (d.k === 'param') scope.params[d.name] = (paramOver && paramOver[d.name]) || evalStatic(d.e, scope) || mk(32, 0, 0);
      // declarations
      for (const d of m.decls) {
        if (d.k === 'param') continue;
        let w = 1, msb = 0, lsb = 0;
        if (d.range) { msb = constEval(d.range.msb, scope); lsb = constEval(d.range.lsb, scope); w = Math.abs(msb - lsb) + 1; }
        const ex = scope.sigs[d.name];
        if (ex) {
          if (d.k === 'net' && ex.port && !ex.kindSet) { ex.kind = d.kind; ex.kindSet = true; if (d.range) Object.assign(ex, { w, msb, lsb }); continue; }
          if (d.k === 'port' && !ex.port) { ex.port = d.dir; continue; }
          err(`<${d.name}> is already declared.`, d.line, 1059, m.file); continue;
        }
        const kind = d.kind || 'wire';
        const s = { name: prefix + d.name, local: d.name, w, msb, lsb, kind, port: d.k === 'port' ? d.dir : null, kindSet: !!d.kind, readers: [], waiters: [], hist: [], depth };
        scope.sigs[d.name] = s; signals.push(s);
      }
      if (m.ports.length && !opts.noPortCheck) for (const pn of m.ports) if (!scope.sigs[pn] || !scope.sigs[pn].port) err(`Port <${pn}> is not declared as input, output or inout.`, m.line, 1156, m.file);
      for (const s of Object.values(scope.sigs)) s.val = s.kind === 'reg' || s.kind === 'integer' ? X(s.w) : Zv(s.w);

      const lookup = (name, line) => {
        const s = scope.sigs[name];
        if (!s) { if (scope.params[name] === undefined) err(`<${name}> is not declared.`, line, 69, m.file); return null; }
        return s;
      };

      for (const it of m.items) {
        if (it.k === 'cassign') {
          const lhs = compileL(it.lhs, scope, lookup, 'net', it.init);
          const rhs = compileE(it.rhs, scope, lookup);
          if (lhs && rhs) conts.push({ lhs, rhs, line: it.line, file: m.file });
        } else if (it.k === 'gate') {
          const nOut = it.type === 'not' || it.type === 'buf' ? it.args.length - 1 : 1;
          if (it.args.length < 2 || (nOut === 1 && it.args.length < (it.type === 'not' || it.type === 'buf' ? 2 : 3))) { err(`Gate <${it.type}> needs an output and ${it.type === 'not' || it.type === 'buf' ? 'one input' : 'at least two inputs'}.`, it.line, 1191, m.file); continue; }
          const outs = it.args.slice(0, nOut), ins = it.args.slice(nOut);
          const inE = ins.map((e) => compileE(e, scope, lookup));
          if (inE.some((x) => !x)) continue;
          const f = {
            and: (v) => v.reduce(OP.and), or: (v) => v.reduce(OP.or), xor: (v) => v.reduce(OP.xor),
            nand: (v) => OP.not(v.reduce(OP.and)), nor: (v) => OP.not(v.reduce(OP.or)), xnor: (v) => OP.not(v.reduce(OP.xor)),
            not: (v) => OP.not(v[0]), buf: (v) => v[0],
          }[it.type];
          const reads = new Set(); inE.forEach((x) => x.reads.forEach((r) => reads.add(r)));
          const rhs = { fn: () => resize(f(inE.map((x) => resize(x.fn(), 1))), 1), reads, w: 1 };
          for (const o of outs) { const lhs = compileL(o, scope, lookup, 'net'); if (lhs) conts.push({ lhs, rhs, line: it.line, gate: it.type, inst: it.inst, file: m.file }); }
        } else if (it.k === 'initial' || it.k === 'always') {
          const body = compileS(it.s, scope, lookup);
          if (body) procs.push({ kind: it.k, body, line: it.line, scope, file: m.file, star: it.s.k === 'event' && it.s.ev.star ? collectReads(it.s.s, scope) : null });
        } else if (it.k === 'inst') {
          const cm = byName[it.mod];
          if (!cm) { err(`Module <${it.mod}> not found.`, it.line, 1654, m.file); continue; }
          const sub = instantiate(cm, prefix + it.inst + '.', null, depth + 1);
          const named = it.conns.some((c) => c.port);
          it.conns.forEach((c, i) => {
            const pn = named ? c.port : cm.ports[i];
            if (!pn) { err(`Too many ports in the instantiation of module <${cm.name}>.`, c.line, 1191, m.file); return; }
            const cs = sub.sigs[pn];
            if (!cs || !cs.port) { err(`Port <${pn}> is not found in module <${cm.name}>.`, c.line, 1191, m.file); return; }
            if (!c.e) return;
            if (cs.port === 'input') {
              const rhs = compileE(c.e, scope, lookup);
              if (rhs) conts.push({ lhs: { sets: [{ sig: cs, lo: 0, w: cs.w }], w: cs.w }, rhs, port: true, line: c.line, file: m.file });
            } else {
              const lhs = compileL(c.e, scope, lookup, 'net');
              if (lhs) conts.push({ lhs, rhs: { fn: () => cs.val, reads: new Set([cs]), w: cs.w }, port: true, line: c.line, file: m.file });
            }
          });
          if (named) for (const pn of cm.ports) if (!it.conns.some((c) => c.port === pn)) warnings.push({ msg: `Port <${pn}> of instance <${it.inst}> is not connected.`, line: it.line, code: 1016, file: m.file });
        }
      }
      return scope;
    }

    function collectReads(s, scope) {
      const out = new Set();
      const walkE = (e) => {
        if (!e) return;
        if (e.k === 'id') { const sg = scope.sigs[e.name]; if (sg) out.add(sg); }
        ['a', 'b', 'c', 'of', 'idx', 'msb', 'lsb', 'base', 'n'].forEach((k) => e[k] && typeof e[k] === 'object' && walkE(e[k]));
        (e.parts || []).forEach(walkE); (e.args || []).forEach(walkE);
      };
      const lhsIdx = (l) => { if (l.k === 'bit') walkE(l.idx); if (l.k === 'cat') l.parts.forEach(lhsIdx); };
      const walkS = (st) => {
        if (!st) return;
        switch (st.k) {
          case 'block': st.body.forEach(walkS); break;
          case 'assign': walkE(st.rhs); lhsIdx(st.lhs); break;
          case 'if': walkE(st.c); walkS(st.a); walkS(st.b); break;
          case 'case': walkE(st.e); st.items.forEach((i) => { (i.labels || []).forEach(walkE); walkS(i.s); }); break;
          case 'for': walkS(st.init); walkE(st.c); walkS(st.inc); walkS(st.s); break;
          case 'repeat': case 'while': walkE(st.n || st.c); walkS(st.s); break;
          case 'delay': case 'event': case 'forever': walkS(st.s); break;
          default:
        }
      };
      walkS(s);
      return out;
    }

    /* ---- expressions -> closures ---- */
    function compileE(e, scope, lookup) {
      const reads = new Set();
      let ok = true;
      const c = (e) => {
        switch (e.k) {
          case 'num': { const v = e.val; return () => v; }
          case 'str': { const v = e.v; let n = 0; for (const ch of v.slice(-4)) n = (n << 8) | ch.charCodeAt(0); const val = mk(Math.max(8, 8 * v.length), n >>> 0, 0); return () => val; }
          case 'id': {
            if (scope.params[e.name] !== undefined) { const v = scope.params[e.name]; return () => v; }
            const s = lookup(e.name, e.line); if (!s) { ok = false; return () => X(1); }
            reads.add(s); return () => s.val;
          }
          case 'bit': {
            const base = c(e.of), idx = c(e.idx), s = e.of.k === 'id' ? scope.sigs[e.of.name] : null;
            return () => {
              const a = base(), i = idx(); if (!known(i)) return X(1);
              const k = s ? (s.msb >= s.lsb ? i.v - s.lsb : s.lsb - i.v) : i.v;
              if (k < 0 || k >= a.w) return X(1);
              return mk(1, a.v >>> k, a.x >>> k, a.z >>> k);
            };
          }
          case 'part': case 'ipart': {
            const base = c(e.of), s = e.of.k === 'id' ? scope.sigs[e.of.name] : null;
            let hi, lo;
            try {
              if (e.k === 'part') { hi = constEval(e.msb, scope); lo = constEval(e.lsb, scope); }
              else { const b = constEval(e.base, scope), w = constEval(e.width, scope); if (e.dir === '+:') { lo = b; hi = b + w - 1; } else { hi = b; lo = b - w + 1; } }
            } catch (er) { err(er.message, e.line, er.code, scope.m.file); ok = false; return () => X(1); }
            const off = s ? (s.msb >= s.lsb ? Math.min(hi, lo) - s.lsb : s.lsb - Math.max(hi, lo)) : Math.min(hi, lo), w = Math.abs(hi - lo) + 1;
            return () => { const a = base(); return mk(w, a.v >>> off, a.x >>> off, a.z >>> off); };
          }
          case 'cat': {
            const ps = e.parts.map(c);
            return () => { let v = 0, x = 0, z = 0, w = 0; for (let i = ps.length - 1; i >= 0; i--) { const a = ps[i](); v |= a.v << w; x |= a.x << w; z |= a.z << w; w += a.w; } return mk(Math.min(w, 32), v, x, z); };
          }
          case 'rep': {
            let n = 1; try { n = constEval(e.n, scope); } catch (er) { err(er.message, e.line, er.code, scope.m.file); }
            const inner = c({ k: 'cat', parts: e.parts });
            return () => { const a = inner(); let v = 0, x = 0, z = 0, w = 0; for (let i = 0; i < n; i++) { v |= a.v << w; x |= a.x << w; z |= a.z << w; w += a.w; } return mk(Math.min(w, 32), v, x, z); };
          }
          case 'un': { const a = c(e.a), f = unary[e.op]; return () => f(a()); }
          case 'bin': { const a = c(e.a), b = c(e.b), f = binary[e.op]; return () => f(a(), b()); }
          case 'cond': {
            const cc = c(e.c), a = c(e.a), b = c(e.b);
            return () => {
              const t = isTrue(cc()); if (t === 1) return a(); if (t === 0) return b();
              const p = a(), q = b(), w = Math.max(p.w, q.w), P = resize(p, w), Q = resize(q, w), diff = (P.v ^ Q.v) | P.x | Q.x;
              return mk(w, P.v & ~diff, diff);
            };
          }
          case 'sys': {
            if (e.name === '$time' || e.name === '$stime' || e.name === '$realtime') return () => mk(32, Math.round(sim.time), 0);
            if (e.name === '$random') return () => mk(32, (Math.random() * 0xFFFFFFFF) >>> 0, 0);
            err(`System function ${e.name} is not supported here.`, e.line, 1100, scope.m.file); ok = false; return () => X(1);
          }
          default: ok = false; return () => X(1);
        }
      };
      const fn = c(e);
      return ok ? { fn, reads } : null;
    }
    // lvalue -> { sets:[{sig, lo, w, dyn}], w }
    function compileL(e, scope, lookup, ctx, isInit) {
      const sets = [];
      let ok = true;
      const add = (e) => {
        if (e.k === 'cat') { e.parts.slice().reverse().forEach(add); return; }
        const id = e.k === 'id' ? e : e.of;
        if (!id || id.k !== 'id') { err('Illegal left-hand side in assignment.', e.line, 1373, scope.m.file); ok = false; return; }
        const s = lookup(id.name, id.line); if (!s) { ok = false; return; }
        if (ctx === 'net' && (s.kind === 'reg' || s.kind === 'integer') && !isInit) { err(`Concurrent assignment to a non-net <${id.name}> is not permitted`, id.line, 1110, scope.m.file); ok = false; return; }
        if (ctx === 'proc' && s.kind !== 'reg' && s.kind !== 'integer') { err(`Procedural assignment to a non-register <${id.name}> is not permitted, left-hand side should be reg/integer/time/genvar`, id.line, 1373, scope.m.file); ok = false; return; }
        const toOff = (i) => (s.msb >= s.lsb ? i - s.lsb : s.lsb - i);
        if (e.k === 'id') sets.push({ sig: s, lo: 0, w: s.w });
        else if (e.k === 'bit') {
          const idx = compileE(e.idx, scope, lookup);
          if (!idx) { ok = false; return; }
          sets.push({ sig: s, w: 1, dyn: () => { const i = idx.fn(); return known(i) ? toOff(i.v) : -1; } });
        } else {
          let hi, lo;
          try {
            if (e.k === 'part') { hi = constEval(e.msb, scope); lo = constEval(e.lsb, scope); }
            else { const b = constEval(e.base, scope), w = constEval(e.width, scope); if (e.dir === '+:') { lo = b; hi = b + w - 1; } else { hi = b; lo = b - w + 1; } }
          } catch (er) { err(er.message, e.line, er.code, scope.m.file); ok = false; return; }
          sets.push({ sig: s, lo: Math.min(toOff(hi), toOff(lo)), w: Math.abs(hi - lo) + 1 });
        }
      };
      add(e);
      return ok ? { sets, w: sets.reduce((a, b) => a + b.w, 0) } : null;
    }

    /* ---- statements -> generator factories ---- */
    function compileS(st, scope, lookup) {
      let ok = true;
      const E = (e) => { const r = compileE(e, scope, lookup); if (!r) { ok = false; return () => X(1); } return r.fn; };
      const c = (st) => {
        if (!st) return function* () {};
        switch (st.k) {
          case 'null': return function* () {};
          case 'block': { const body = st.body.map(c); return function* () { for (const b of body) yield* b(); }; }
          case 'delay': {
            const d = st.d.k === 'num' && st.d.real !== undefined ? () => st.d.real : (() => { const f = E(st.d); return () => { const v = f(); return known(v) ? v.v : 0; }; })();
            const s = c(st.s); return function* () { yield { delay: d() }; yield* s(); };
          }
          case 'event': {
            let list;
            if (st.ev.star) list = [...collectReads(st.s, scope)].map((sig) => ({ sig, edge: null }));
            else list = st.ev.list.map((x) => { const r = compileE(x.e, scope, lookup); if (!r) { ok = false; return null; } return { sig: [...r.reads][0], edge: x.edge, sigs: [...r.reads] }; }).filter(Boolean).flatMap((x) => x.sigs.map((sig) => ({ sig, edge: x.edge })));
            const s = c(st.s); return function* () { yield { wait: list }; yield* s(); };
          }
          case 'if': { const cc = E(st.c), a = c(st.a), b = c(st.b); return function* () { if (isTrue(cc()) === 1) yield* a(); else yield* b(); }; }
          case 'case': {
            const e = E(st.e);
            const items = st.items.map((i) => ({ def: i.def, labels: (i.labels || []).map(E), s: c(i.s) }));
            const wild = st.kind !== 'case';
            const match = (v, l) => {
              const w = Math.max(v.w, l.w), a = resize(v, w), b = resize(l, w);
              if (!wild) return a.v === b.v && a.x === b.x && a.z === b.z;
              const care = ~((st.kind === 'casez' ? b.z | a.z : b.x | a.x)) & M(w);
              return ((a.v ^ b.v) & care) === 0 && ((a.x ^ b.x) & care) === 0;
            };
            return function* () {
              const v = e();
              for (const it of items) if (!it.def && it.labels.some((l) => match(v, l()))) { yield* it.s(); return; }
              const d = items.find((i) => i.def); if (d) yield* d.s();
            };
          }
          case 'for': { const init = c(st.init), cc = E(st.c), inc = c(st.inc), s = c(st.s); return function* () { let n = 0; for (yield* init(); isTrue(cc()) === 1; yield* inc()) { if (++n > 100000) throw new VError('Loop limit exceeded.', st.line, 1500); yield* s(); } }; }
          case 'repeat': { const n = E(st.n), s = c(st.s); return function* () { const k = n(); for (let i = 0; i < (known(k) ? k.v : 0); i++) yield* s(); }; }
          case 'while': { const cc = E(st.c), s = c(st.s); return function* () { let n = 0; while (isTrue(cc()) === 1) { if (++n > 100000) throw new VError('Loop limit exceeded.', st.line, 1500); yield* s(); } }; }
          case 'forever': { const s = c(st.s); return function* () { for (;;) { const t0 = sim.steps; yield* s(); if (sim.steps === t0) yield { delay: 0, spin: true }; } }; }
          case 'assign': {
            const lhs = compileL(st.lhs, scope, lookup, 'proc');
            const rhs = E(st.rhs);
            if (!lhs) { ok = false; return function* () {}; }
            const d = st.d ? E(st.d) : null;
            return function* () { const v = rhs(); const delay = d ? d().v : 0; if (st.nb) sim.nba(lhs, v, delay); else if (delay) { yield { delay }; sim.write(lhs, v); } else sim.write(lhs, v); };
          }
          case 'sys': {
            const args = st.args.map((a) => (a.k === 'str' ? { str: a.v } : { fn: E(a), w: a }));
            const name = st.name;
            return function* () {
              if (name === '$finish' || name === '$stop') { sim.finish(name); yield { delay: Infinity }; return; }
              if (name === '$display' || name === '$write' || name === '$strobe') sim.print(format(args), name !== '$write');
              else if (name === '$monitor') sim.monitor(args);
              else if (['$dumpfile', '$dumpvars', '$dumpon', '$dumpoff', '$timeformat'].includes(name)) { /* waveform is always recorded */ }
              else sim.print(`WARNING: system task ${name} ignored`, true);
            };
          }
          default: ok = false; return function* () {};
        }
      };
      const f = c(st);
      return ok ? f : null;
    }
    function format(args) {
      if (!args.length) return '';
      if (!args[0].str) return args.map((a) => (a.str !== undefined ? a.str : fmtVal(a.fn(), 'd'))).join(' ');
      let s = args[0].str, i = 1;
      s = s.replace(/%(0?)(\d*)([bdhtsoxcm%])/gi, (all, z, w, f) => {
        f = f.toLowerCase();
        if (f === '%') return '%';
        if (f === 'm') return topName;
        const a = args[i++]; if (!a) return '';
        if (a.str !== undefined) return a.str;
        const v = a.fn();
        if (f === 't') return String(v.v);
        if (f === 'd') return z || w === '0' ? fmtVal(v, 'd') : fmtVal(v, 'd').padStart(String(M(v.w)).length, ' ');
        if (f === 'h' || f === 'x') return fmtVal(v, 'h');
        if (f === 's' || f === 'c') return String.fromCharCode(v.v & 255);
        return fmtVal(v, 'b');
      });
      for (; i < args.length; i++) s += args[i].str !== undefined ? args[i].str : fmtVal(args[i].fn(), 'd');
      return s;
    }

    /* ---- the simulation kernel ---- */
    const sim = {
      time: 0, steps: 0, out: [], finished: null, monitors: [],
      queue: [], active: [], nbaQ: [], contQ: new Set(),
      write(lhs, v) {
        let off = 0;
        for (const s of lhs.sets) {
          const part = mk(s.w, v.v >>> off, v.x >>> off, v.z >>> off); off += s.w;
          const lo = s.dyn ? s.dyn() : s.lo; if (lo < 0 || lo >= s.sig.w) continue;
          const sig = s.sig, m = (M(s.w) << lo) & M(sig.w);
          const nvv = mk(sig.w, (sig.val.v & ~m) | (part.v << lo), (sig.val.x & ~m) | (part.x << lo), (sig.val.z & ~m) | (part.z << lo));
          set(sig, nvv);
        }
      },
      nba(lhs, v, delay) { if (delay) sim.queue.push({ t: sim.time + delay, upd: { lhs, v } }); else sim.nbaQ.push({ lhs, v }); },
      print(s, nl) { sim.out.push(s + (nl ? '' : '')); },
      monitor(args) { sim.monitors = [{ args, last: null }]; },
      finish(name) { sim.finished = { name, time: sim.time }; },
    };
    function set(sig, v) {
      const o = sig.val;
      if (o.v === v.v && o.x === v.x && o.z === v.z) return;
      sig.val = v;
      const h = sig.hist;
      if (h.length && h[h.length - 1].t === sim.time) h[h.length - 1].v = v; else h.push({ t: sim.time, v });
      for (const c of sig.readers) sim.contQ.add(c);
      if (sig.waiters.length) {
        const ws = sig.waiters; sig.waiters = [];
        for (const w of ws) {
          if (w.proc.done || w.proc.woken) continue;
          const ob = o.x & 1 ? 2 : o.v & 1, nb = v.x & 1 ? 2 : v.v & 1;
          const hit = !w.edge || (w.edge === 'posedge' ? (ob === 0 && nb !== 0) || (ob === 2 && nb === 1) : (ob === 1 && nb !== 1) || (ob === 2 && nb === 0));
          if (hit) { w.proc.woken = true; sim.active.push(w.proc); } else sig.waiters.push(w);
        }
      }
    }

    instantiate(top, '', null, 0);
    if (errors.length) return { errors, warnings, signals, ok: false };
    for (const c of conts) for (const r of c.rhs.reads) r.readers.push(c);
    // multiple continuous drivers on a net
    const drv = new Map();
    for (const c of conts) for (const s of c.lhs.sets) drv.set(s.sig, (drv.get(s.sig) || 0) + 1);
    for (const [s, n] of drv) if (n > 1 && s.w === 1) warnings.push({ msg: `Net <${s.name}> has ${n} drivers.`, line: 0, code: 1499 });

    const runners = procs.map((p) => ({ p, gen: null, done: false, woken: false }));
    function start(r) {
      r.gen = (function* () {
        if (r.p.kind === 'initial') { yield* r.p.body(); return; }
        for (;;) { const s0 = sim.steps; yield* r.p.body(); if (sim.steps === s0) throw new VError('An always block without a delay or event control loops forever.', r.p.line, 1500, r.p.file); }
      })();
    }
    function resume(r) {
      r.woken = false;
      for (;;) {
        const y = r.gen.next();
        sim.steps++;
        if (y.done) { r.done = true; return; }
        const v = y.value;
        if (v.delay !== undefined) {
          if (v.delay === Infinity) return;
          if (v.delay <= 0) { if (v.spin) { sim.queue.push({ t: sim.time + 1e-9, r }); return; } sim.queue.push({ t: sim.time, r, zero: true }); return; }
          sim.queue.push({ t: sim.time + v.delay, r }); return;
        }
        if (v.wait) { for (const w of v.wait) if (w.sig) w.sig.waiters.push({ proc: r, edge: w.edge }); return; }
      }
    }
    function evalCont(c) { const v = c.rhs.fn(); sim.write(c.lhs, resize(v, c.lhs.w)); }

    function run(tEnd) {
      runners.forEach((r) => { start(r); sim.active.push(r); });
      conts.forEach((c) => sim.contQ.add(c));
      let guard = 0;
      for (;;) {
        let deltas = 0;
        for (;;) {
          if (sim.finished) break;
          if (sim.active.length) { const r = sim.active.shift(); if (!r.done) resume(r); }
          else if (sim.contQ.size) { const list = [...sim.contQ]; sim.contQ.clear(); list.forEach(evalCont); }
          else if (sim.nbaQ.length) { const q = sim.nbaQ; sim.nbaQ = []; q.forEach((u) => sim.write(u.lhs, u.v)); }
          else {
            const z = sim.queue.filter((e) => e.t === sim.time && e.zero);
            if (!z.length) break;
            sim.queue = sim.queue.filter((e) => !(e.t === sim.time && e.zero));
            z.forEach((e) => sim.active.push(e.r));
          }
          if (++deltas > 200000) throw new VError(`Simulation iteration limit reached at time ${sim.time} ns — a combinational loop?`, 0, 1500);
        }
        for (const mo of sim.monitors) { const s = format(mo.args); if (s !== mo.last) { sim.out.push(s); mo.last = s; } }
        if (sim.finished) break;
        if (!sim.queue.length) break;
        const t = Math.min(...sim.queue.map((e) => e.t));
        if (t > tEnd) break;
        sim.time = t;
        const now = sim.queue.filter((e) => e.t === t); sim.queue = sim.queue.filter((e) => e.t !== t);
        for (const e of now) { if (e.upd) sim.write(e.upd.lhs, e.upd.v); else sim.active.push(e.r); }
        if (++guard > 1e6) break;
      }
      const endT = sim.finished ? sim.finished.time : tEnd;
      return { endTime: endT, out: sim.out, finished: sim.finished };
    }
    return { ok: true, errors, warnings, signals, conts, procs, run, sim, top };
  }

  /* ================= front door ================= */
  // files: [{name, text}] -> { modules, errors:[{file,line,msg,code}] }
  function compile(files) {
    const modules = [], errors = [];
    for (const f of files) {
      try { const r = parse(f.text, f.name); r.modules.forEach((m) => { m.file = f.name; m.timescale = r.timescale; }); modules.push(...r.modules); }
      catch (e) { if (e instanceof VError) errors.push({ file: f.name, line: e.line, msg: e.message, code: e.code }); else throw e; }
    }
    const seen = {};
    for (const m of modules) { if (seen[m.name]) errors.push({ file: m.file, line: m.line, msg: `Module <${m.name}> is already defined.`, code: 1086 }); seen[m.name] = m; }
    return { modules, errors };
  }
  function check(files, topName) {
    const c = compile(files);
    if (c.errors.length) return c;
    try {
      const e = elaborate(c.modules, topName);
      return { modules: c.modules, errors: e.errors.map((x) => Object.assign({ file: x.file }, x)), warnings: e.warnings };
    } catch (er) { if (er instanceof VError) return { modules: c.modules, errors: [{ file: er.file, line: er.line, msg: er.message, code: er.code }] }; throw er; }
  }
  function simulate(files, topName, tEnd) {
    const c = compile(files);
    if (c.errors.length) return { errors: c.errors };
    try {
      const e = elaborate(c.modules, topName);
      if (!e.ok) return { errors: e.errors };
      const r = e.run(tEnd || 1000);
      return { errors: [], warnings: e.warnings, signals: e.signals, endTime: r.endTime, out: r.out, finished: r.finished, top: e.top };
    } catch (er) { if (er instanceof VError) return { errors: [{ file: er.file, line: er.line, msg: er.message, code: er.code }] }; throw er; }
  }

  /* ================= synthesis (for the RTL / technology viewers) ================= */
  // Builds a gate netlist of one module. Gate primitives map 1:1; assign
  // expressions become gate trees; procedural blocks become a "logic" box.
  function synth(modules, name) {
    const m = modules.find((x) => x.name === name);
    if (!m) return null;
    const ports = m.decls.filter((d) => d.k === 'port').map((d) => ({ name: d.name, dir: d.dir, w: d.range ? Math.abs(d.range.msb.val.v - d.range.lsb.val.v) + 1 : 1 }));
    const cells = []; let tmp = 0;
    const netOf = (e) => (e.k === 'id' ? e.name : e.k === 'num' ? fmtBits(e.val) : e.k === 'bit' || e.k === 'part' ? (e.of.name + '[' + (e.k === 'bit' ? (e.idx.val ? e.idx.val.v : '?') : '') + ']') : null);
    const tree = (e) => {
      const direct = netOf(e); if (direct && (e.k === 'id' || e.k === 'num' || e.k === 'bit')) return direct;
      const out = '_n' + (++tmp);
      const map = { '&': 'AND', '|': 'OR', '^': 'XOR', '~^': 'XNOR', '^~': 'XNOR' };
      if (e.k === 'un' && e.op === '~' || e.k === 'un' && e.op === '!') cells.push({ type: 'NOT', ins: [tree(e.a)], out });
      else if (e.k === 'bin' && map[e.op]) cells.push({ type: map[e.op], ins: [tree(e.a), tree(e.b)], out });
      else if (e.k === 'cond') cells.push({ type: 'MUX', ins: [tree(e.b), tree(e.a), tree(e.c)], out });
      else cells.push({ type: 'LOGIC', label: e.k === 'bin' ? e.op : e.k, ins: [], out });
      return out;
    };
    for (const it of m.items) {
      if (it.k === 'gate') {
        const nOut = it.type === 'not' || it.type === 'buf' ? it.args.length - 1 : 1;
        const ins = it.args.slice(nOut).map(tree);
        it.args.slice(0, nOut).forEach((o, i) => cells.push({ type: it.type.toUpperCase(), ins, out: netOf(o), inst: it.inst || `${it.type}${i}` }));
      } else if (it.k === 'cassign') {
        const lhs = netOf(it.lhs), out = tree(it.rhs);
        if (out !== lhs) {
          const last = cells.find((c) => c.out === out);
          if (last) last.out = lhs; else cells.push({ type: 'BUF', ins: [out], out: lhs });
        }
      } else if (it.k === 'always') cells.push({ type: 'LOGIC', label: 'always', ins: [], out: '_blk' + (++tmp) });
      else if (it.k === 'inst') cells.push({ type: 'INST', label: it.mod, inst: it.inst, ins: it.conns.map((c) => (c.e ? netOf(c.e) : '')), out: null, conns: it.conns.map((c) => ({ port: c.port, net: c.e ? netOf(c.e) : null })) });
    }
    // LUT mapping: each output cone with up to 6 inputs is one LUT
    const driver = {}; cells.forEach((c) => { if (c.out) driver[c.out] = c; });
    const inputs = ports.filter((p) => p.dir === 'input').map((p) => p.name);
    const luts = [];
    for (const o of ports.filter((p) => p.dir === 'output')) {
      const support = new Set(); let comb = true;
      const walk = (n, d) => { if (d > 40) { comb = false; return; } const c = driver[n]; if (!c) { if (inputs.includes(n)) support.add(n); return; } if (c.type === 'LOGIC' || c.type === 'INST') { comb = false; return; } c.ins.forEach((x) => walk(x, d + 1)); };
      walk(o.name, 0);
      const sup = [...support];
      if (!comb || sup.length > 6 || !driver[o.name]) continue;
      const evalN = (n, env) => { if (n in env) return env[n]; if (/^[01]+$/.test(n)) return +n[n.length - 1]; const c = driver[n]; const v = c.ins.map((x) => evalN(x, env)); return { AND: v.every(Boolean), OR: v.some(Boolean), XOR: v.reduce((a, b) => a ^ b, 0), NAND: !v.every(Boolean), NOR: !v.some(Boolean), XNOR: !v.reduce((a, b) => a ^ b, 0), NOT: !v[0], BUF: v[0], MUX: v[2] ? v[1] : v[0] }[c.type] ? 1 : 0; };
      let init = 0;
      for (let k = 0; k < (1 << sup.length); k++) { const env = {}; sup.forEach((s, i) => (env[s] = (k >> i) & 1)); if (evalN(o.name, env)) init |= 1 << k; }
      luts.push({ out: o.name, ins: sup, n: sup.length, init: init.toString(16).toUpperCase().padStart(Math.max(1, (1 << sup.length) / 4), '0') });
    }
    return { name, ports, cells, luts };
  }

  DSD.Verilog = { lex, parse, compile, check, simulate, synth, fmtVal, fmtBits, VError };
})(typeof window !== 'undefined' ? window : globalThis);
