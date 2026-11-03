/* ============================================================
 * logic.js — strict 3-valued logic primitives
 *   0 = LOW, 1 = HIGH, X (2) = unknown / contention,
 *   Z (3) = undriven (floating) net. Gates read Z as X.
 * Works in browser (window.DSD) and Node (globalThis.DSD).
 * ============================================================ */
(function (G) {
  'use strict';
  const DSD = (G.DSD = G.DSD || {});
  const X = 2, Z = 3;
  const n = (v) => (v === 0 || v === 1 ? v : X); // normalise (Z -> X)

  function AND(...v) { let x = false; for (const a of v) { const b = n(a); if (b === 0) return 0; if (b === X) x = true; } return x ? X : 1; }
  function OR(...v) { let x = false; for (const a of v) { const b = n(a); if (b === 1) return 1; if (b === X) x = true; } return x ? X : 0; }
  function NOT(a) { const b = n(a); return b === X ? X : 1 - b; }
  function XOR(...v) { let r = 0; for (const a of v) { const b = n(a); if (b === X) return X; r ^= b; } return r; }

  const L = {
    X, Z,
    AND, OR, NOT, XOR,
    BUF: (a) => n(a),
    NAND: (...v) => NOT(AND(...v)),
    NOR: (...v) => NOT(OR(...v)),
    XNOR: (...v) => NOT(XOR(...v)),
    norm: n,
    str: (v) => (v === 0 ? '0' : v === 1 ? '1' : v === Z ? 'Z' : 'X'),
  };
  DSD.L = L;

  /**
   * Evaluate an IC's internal gate list (already topologically ordered).
   * Signals: numbers = package pins, strings = internal nodes.
   * @param gates  [{t:'AND', in:[1,2], out:3}, ...]
   * @param pinIn  function(pinNumber) -> value
   * @returns {pins:{pin:value}, nodes:{name:value}}
   */
  DSD.evalGates = function (gates, pinIn) {
    const nodes = {}, pins = {};
    const get = (s) => (typeof s === 'number' ? (s in pins ? pins[s] : pinIn(s)) : nodes[s]);
    for (const g of gates) {
      const v = L[g.t](...g.in.map(get));
      if (typeof g.out === 'number') pins[g.out] = v; else nodes[g.out] = v;
    }
    return { pins, nodes };
  };
})(typeof window !== 'undefined' ? window : globalThis);
