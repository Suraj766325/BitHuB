/* ============================================================
 * compiler.js — runs C, C++, Java and Python 3 by calling public
 * compiler services directly from the browser (they allow
 * cross-origin requests), so the BitHub backend is not involved.
 * Every program reads stdin and writes stdout.
 * ============================================================ */
(function () {
  'use strict';
  const DSA = window.DSA;
  const LANGS = {
    c: { label: 'C', compiler: 'gcc-13.2.0-c', mode: 'text/x-csrc', file: 'main.c' },
    cpp: { label: 'C++', compiler: 'gcc-13.2.0', options: 'warning,c++17', mode: 'text/x-c++src', file: 'main.cpp' },
    java: { label: 'Java', compiler: 'openjdk-jdk-21+35', mode: 'text/x-java', file: 'Main.java' },
    py: { label: 'Python 3', compiler: 'cpython-3.13.8', mode: 'python', file: 'main.py' },
  };
  /* Two public services, tried in turn: Judge0 CE (fast) and Wandbox. Both send CORS headers, so the browser
   * calls them directly and the BitHub backend is not involved. If one is down or rate limited the other is used. */
  const JUDGE0 = { c: 103, cpp: 105, java: 91, py: 100 };               // GCC 14.1, GCC 14.1, JDK 17, Python 3.12
  async function viaJudge0(lang, code, stdin) {
    const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 20000);
    try {
      const res = await fetch('https://ce.judge0.com/submissions?base64_encoded=false&wait=true', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ language_id: JUDGE0[lang], source_code: code, stdin: stdin || '', cpu_time_limit: 5 }), signal: ctl.signal });
      if (!res.ok) return null;
      const d = await res.json(), id = d.status && d.status.id;
      if (!id || id <= 2 || id === 13 || id === 14) return null;               // queued, processing or an internal error: try the other service
      const compileFailed = id === 6;
      return { ok: id === 3, compileError: compileFailed ? d.compile_output || '' : '', warnings: compileFailed ? '' : d.compile_output || '',
        stdout: d.stdout || '', stderr: (d.stderr || '') + (id === 5 ? '\nTime limit exceeded.' : '') + (id >= 7 && id <= 12 && !d.stderr ? (d.message || d.status.description) : ''), status: id };
    } catch (e) { return null; } finally { clearTimeout(timer); }
  }
  async function viaWandbox(lang, code, stdin) {
    const L = LANGS[lang], ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 30000);
    try {
      const body = { compiler: L.compiler, code, stdin: stdin || '', save: false };
      if (L.options) body.options = L.options;
      const res = await fetch('https://wandbox.org/api/compile.json', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: ctl.signal });
      if (!res.ok) return null;
      const d = await res.json();
      if (d.status === '126' || /Resource temporarily unavailable|OCI runtime/.test(d.compiler_error || '')) return null;    // the service is overloaded
      // a compile failure: non-zero status, the compiler printed an error, and the program never produced anything
      const compileFailed = d.status !== '0' && !d.program_message && !d.program_output && !d.program_error && /\berror\b/i.test(d.compiler_error || '');
      return { ok: d.status === '0', compileError: compileFailed ? d.compiler_error : '', warnings: compileFailed ? '' : d.compiler_error || '', stdout: d.program_output || '', stderr: d.program_error || '', status: d.status };
    } catch (e) { return null; } finally { clearTimeout(timer); }
  }

  let preferred = 0;                                                     // remember which service worked last
  async function run(lang, code, stdin) {
    const chain = [viaJudge0, viaWandbox];
    for (let k = 0; k < chain.length; k++) {
      const r = await chain[(preferred + k) % chain.length](lang, code, stdin);
      if (r) { preferred = (preferred + k) % chain.length; return r; }
    }
    return { ok: false, service: true, stdout: '', stderr: 'The online compilers are busy or unreachable right now. Check your connection and try again in a moment.' };
  }

  const norm = (t) => String(t == null ? '' : t).replace(/\r/g, '').split('\n').map((l) => l.replace(/\s+$/, '')).join('\n').replace(/\n+$/, '');

  /** Run every test (a few at a time); calls onResult(index, result) as each finishes. */
  async function runTests(lang, code, tests, onResult) {
    const results = new Array(tests.length);
    let next = 0, stop = false;
    const worker = async () => {
      while (!stop && next < tests.length) {
        const i = next++;
        const r = await run(lang, code, tests[i].in);
        const pass = r.ok && !r.compileError && norm(r.stdout) === norm(tests[i].out);
        results[i] = { pass, got: r.stdout, err: r.compileError || r.stderr, service: r.service, expected: tests[i].out, status: r.status, signal: r.signal };
        if (r.compileError || r.service) stop = true; // no point repeating a compile error or an outage
        onResult && onResult(i, results[i]);
      }
    };
    await Promise.all([worker(), worker(), worker()]);
    return results;
  }

  DSA.compiler = { LANGS, run, runTests, norm };
})();
