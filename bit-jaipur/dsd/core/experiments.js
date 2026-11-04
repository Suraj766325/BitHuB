/* ============================================================
 * experiments.js — the twelve experiments of the DSD lab manual.
 *
 * experiment = { id, no, title, short, pages (manual pages), aim, parts[] }
 * part = {
 *   id, title, apparatus: [{ type|kind, qty, ohms|farads }],
 *   io:    trainer connections every task relies on
 *   tasks: observation tables (see checks.js for the kinds)
 *   steps: procedure, condensed from the manual
 *   ref:   reference circuit for refbuild.js ("show completed")
 * }
 * ============================================================ */
(function (G) {
  'use strict';
  const DSD = (G.DSD = G.DSD || {});
  const IN = (i) => 'IN' + i, OUT = (i) => 'OUT' + i;
  const io = (pairs) => pairs.map(([id, name, note]) => ({ id, name, note }));
  const SEG_ON = () => DSD.LIB['7447'].segOn;
  // a tie that good practice wants but the logic does not need (floating TTL reads HIGH)
  const opt = (...pins) => ({ pins, optional: true });

  const E = [];

  /* ---------------- 1. NOT, OR, EXOR (one board per gate) ---------------- */
  const gatePart = (id, title, type, gate, fn, expr, ins, pins) => ({
    id, title, apparatus: [{ type, qty: 1 }],
    io: io([...ins.map(([n, nm]) => [IN(n), nm]), [OUT(0), expr, `IC ${type} pin ${pins[pins.length - 1]}`]]),
    tasks: [{ id, title: `${gate} gate`, kind: 'comb', ins: ins.map(([n]) => IN(n)), inNames: ins.map(([, nm]) => nm), outs: [OUT(0)], outNames: [expr], f: fn }],
    steps: [
      `Insert IC ${type} across the centre channel and wire Vcc (pin 14) to +5 V and GND (pin 7) to ground.`,
      ins.length === 1 ? `Connect input A to pin ${pins[0]} and the output pin ${pins[1]} to an LED.` : `Connect A and B to pins ${pins[0]} and ${pins[1]}, and the output pin ${pins[2]} to an LED.`,
      `Apply every input combination with the logic switches and note the output.`,
    ],
    ref: { chips: [{ ref: 'IC1', type, col: 26 }], nets: ins.length === 1 ? [[IN(0), 'IC1.1'], ['IC1.2', OUT(0)]] : [[IN(1), 'IC1.1'], [IN(0), 'IC1.2'], ['IC1.3', OUT(0)]] },
  });
  E.push({
    id: 'gates', no: 1, title: 'Study and Verification of NOT, OR and EXOR Gates', short: 'NOT, OR & EXOR gates', pages: [1, 2],
    aim: 'To study the NOT, OR and EXOR logic gates using ICs 7404, 7432 and 7486, and verify their truth tables.',
    parts: [
      gatePart('not', 'NOT gate (7404)', '7404', 'NOT', ([a]) => [1 - a], 'Y = A′', [[0, 'A']], [1, 2]),
      gatePart('or', 'OR gate (7432)', '7432', 'OR', ([a, b]) => [a | b], 'Y = A+B', [[1, 'A'], [0, 'B']], [1, 2, 3]),
      gatePart('xor', 'EXOR gate (7486)', '7486', 'EXOR', ([a, b]) => [a ^ b], 'Y = A⊕B', [[1, 'A'], [0, 'B']], [1, 2, 3]),
    ],
  });

  /* ---------------- 2. Half adder / half subtractor (separate boards) ---------------- */
  E.push({
    id: 'half', no: 2, title: 'Construction of Half Adder and Half Subtractor using Logic Gates', short: 'Half adder & half subtractor', pages: [3, 4],
    aim: 'To design, construct and verify the truth tables of a Half Adder and a Half Subtractor using ICs 7404 (NOT), 7408 (AND) and 7486 (XOR).',
    parts: [
      {
        id: 'ha', title: 'Half adder',
        apparatus: [{ type: '7486', qty: 1 }, { type: '7408', qty: 1 }],
        io: io([[IN(1), 'A'], [IN(0), 'B'], [OUT(0), 'Sum S = A⊕B', 'IC 7486 pin 3'], [OUT(1), 'Carry C = A·B', 'IC 7408 pin 3']]),
        tasks: [{ id: 'ha', title: 'Half adder', kind: 'comb', ins: [IN(1), IN(0)], inNames: ['A', 'B'], outs: [OUT(0), OUT(1)], outNames: ['Sum (S)', 'Carry (C)'], f: ([a, b]) => [a ^ b, a & b] }],
        steps: [
          'Insert IC 7486 and IC 7408; wire Vcc (pin 14) and GND (pin 7) of both.',
          'Feed A and B into one XOR gate (pins 1, 2): its output (pin 3) is the Sum.',
          'Feed A and B into one AND gate (pins 1, 2): its output (pin 3) is the Carry.',
          'Connect S and C to LEDs and apply 00, 01, 10, 11.',
        ],
        ref: {
          chips: [{ ref: 'IC1', type: '7486', col: 14 }, { ref: 'IC2', type: '7408', col: 30 }],
          nets: [[IN(1), 'IC1.1', 'IC2.1'], [IN(0), 'IC1.2', 'IC2.2'], ['IC1.3', OUT(0)], ['IC2.3', OUT(1)]],
        },
      },
      {
        id: 'hs', title: 'Half subtractor',
        apparatus: [{ type: '7486', qty: 1 }, { type: '7404', qty: 1 }, { type: '7408', qty: 1 }],
        io: io([[IN(1), 'A'], [IN(0), 'B'], [OUT(0), 'Difference D = A⊕B', 'IC 7486 pin 3'], [OUT(1), 'Borrow Bo = A′·B', 'IC 7408 pin 3']]),
        tasks: [{ id: 'hs', title: 'Half subtractor', kind: 'comb', ins: [IN(1), IN(0)], inNames: ['A', 'B'], outs: [OUT(0), OUT(1)], outNames: ['Difference (D)', 'Borrow (Bo)'], f: ([a, b]) => [a ^ b, (1 - a) & b] }],
        steps: [
          'Insert IC 7486, IC 7404 and IC 7408; wire Vcc and GND of every IC.',
          'A and B into an XOR gate give the Difference D (pin 3).',
          'Pass A through a NOT gate (7404 pin 1 → pin 2).',
          'Feed A′ and B into an AND gate: its output is the Borrow Bo.',
          'Connect D and Bo to LEDs and apply 00, 01, 10, 11.',
        ],
        ref: {
          chips: [{ ref: 'IC1', type: '7404', col: 8 }, { ref: 'IC2', type: '7408', col: 20 }, { ref: 'IC3', type: '7486', col: 32 }],
          nets: [[IN(1), 'IC1.1', 'IC3.1'], [IN(0), 'IC2.2', 'IC3.2'], ['IC1.2', 'IC2.1'], ['IC3.3', OUT(0)], ['IC2.3', OUT(1)]],
        },
      },
    ],
  });

  /* ---------------- 3. Full adder / full subtractor (separate boards) ---------------- */
  E.push({
    id: 'full', no: 3, title: 'Construction of Full Adder and Full Subtractor using Logic Gates', short: 'Full adder & full subtractor', pages: [5, 6],
    aim: 'To design, construct and verify the truth tables of a Full Adder and a Full Subtractor using ICs 7404, 7408, 7486 and 7432.',
    parts: [
      {
        id: 'fa', title: 'Full adder',
        apparatus: [{ type: '7486', qty: 1 }, { type: '7408', qty: 1 }, { type: '7432', qty: 1 }],
        io: io([[IN(2), 'A'], [IN(1), 'B'], [IN(0), 'Cin'], [OUT(0), 'Sum S', 'IC 7486 pin 6'], [OUT(1), 'Carry Cout', 'IC 7432 pin 3']]),
        tasks: [{ id: 'fa', title: 'Full adder', kind: 'comb', ins: [IN(2), IN(1), IN(0)], inNames: ['A', 'B', 'Cin'], outs: [OUT(0), OUT(1)], outNames: ['Sum (S)', 'Carry (Cout)'],
          f: ([a, b, c]) => [a ^ b ^ c, (a & b) | (c & (a ^ b))] }],
        steps: [
          'Insert IC 7486, IC 7408 and IC 7432; wire Vcc and GND of each.',
          'XOR A and B (pins 1, 2 → 3), then XOR that with Cin (pins 4, 5 → 6) for the Sum.',
          'AND gates give A·B (pins 1, 2 → 3) and Cin·(A⊕B) (pins 4, 5 → 6).',
          'OR the two AND outputs (7432 pins 1, 2 → 3) for Cout.',
          'Connect S and Cout to LEDs and apply all eight input combinations.',
        ],
        ref: {
          chips: [{ ref: 'IC1', type: '7486', col: 6 }, { ref: 'IC2', type: '7408', col: 19 }, { ref: 'IC3', type: '7432', col: 32 }],
          nets: [[IN(2), 'IC1.1', 'IC2.1'], [IN(1), 'IC1.2', 'IC2.2'], [IN(0), 'IC1.5', 'IC2.5'], ['IC1.3', 'IC1.4', 'IC2.4'], ['IC1.6', OUT(0)], ['IC2.3', 'IC3.1'], ['IC2.6', 'IC3.2'], ['IC3.3', OUT(1)]],
        },
      },
      {
        id: 'fs', title: 'Full subtractor',
        apparatus: [{ type: '7486', qty: 1 }, { type: '7404', qty: 1 }, { type: '7408', qty: 1 }, { type: '7432', qty: 1 }],
        io: io([[IN(2), 'A'], [IN(1), 'B'], [IN(0), 'Bin'], [OUT(0), 'Difference D', 'IC 7486 pin 6'], [OUT(1), 'Borrow Bout', 'IC 7432 pin 3']]),
        tasks: [{ id: 'fs', title: 'Full subtractor', kind: 'comb', ins: [IN(2), IN(1), IN(0)], inNames: ['A', 'B', 'Bin'], outs: [OUT(0), OUT(1)], outNames: ['Difference (D)', 'Borrow (Bout)'],
          f: ([a, b, c]) => [a ^ b ^ c, ((1 - a) & b) | (b & c) | (c & (1 - a))] }],
        steps: [
          'Insert IC 7486, IC 7404, IC 7408 and IC 7432; wire Vcc and GND of each.',
          'A⊕B in one XOR, then XOR with Bin for the Difference D.',
          'Bout = A′B + (A⊕B)′·Bin (two half subtractors) — the same function as A′B + B·Bin + Bin·A′.',
          'Invert A and (A⊕B) with the 7404, form the two AND terms with the 7408, OR them with the 7432.',
          'Connect D and Bout to LEDs and apply all eight input combinations.',
        ],
        ref: {
          chips: [{ ref: 'IC1', type: '7404', col: 4 }, { ref: 'IC2', type: '7408', col: 15 }, { ref: 'IC3', type: '7486', col: 26 }, { ref: 'IC4', type: '7432', col: 37 }],
          nets: [[IN(2), 'IC1.1', 'IC3.1'], [IN(1), 'IC2.2', 'IC3.2'], [IN(0), 'IC2.5', 'IC3.5'], ['IC3.3', 'IC3.4', 'IC1.3'], ['IC3.6', OUT(0)], ['IC1.2', 'IC2.1'], ['IC1.4', 'IC2.4'], ['IC2.3', 'IC4.1'], ['IC2.6', 'IC4.2'], ['IC4.3', OUT(1)]],
        },
      },
    ],
  });

  /* ---------------- 4. 7-segment display with 7447 ---------------- */
  {
    const resCols = [34, 36, 38, 40, 42, 44, 46];
    const segs = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    const out7447 = { a: 13, b: 12, c: 11, d: 10, e: 9, f: 15, g: 14 };
    const inv = { a: ['IC2', 1, 2], b: ['IC2', 3, 4], c: ['IC2', 5, 6], d: ['IC2', 9, 8], e: ['IC2', 11, 10], f: ['IC2', 13, 12], g: ['IC3', 1, 2] };
    const segPin = { a: 7, b: 6, c: 4, d: 2, e: 1, f: 9, g: 10 };
    const nets = [[IN(3), 'IC1.6'], [IN(2), 'IC1.2'], [IN(1), 'IC1.1'], [IN(0), 'IC1.7'], opt('VCC', 'IC1.3'), opt('VCC', 'IC1.4'), opt('VCC', 'IC1.5'), ['GND', 'DISP1.3']];
    segs.forEach((s, i) => {
      const [ic, a, y] = inv[s];
      nets.push(['IC1.' + out7447[s], `${ic}.${a}`], [`${ic}.${y}`, `R${i + 1}.1`], [`R${i + 1}.2`, 'DISP1.' + segPin[s]]);
    });
    E.push({
      id: 'seg7', no: 4, title: 'Construction and Control of a Common Cathode 7-Segment Display using IC 7447', short: '7-segment display (7447)', pages: [7, 8],
      aim: 'To construct and control a common cathode 7-segment display using IC 7447 (BCD to 7-segment decoder/driver) with IC 7404, and display the digits 0–9.',
      parts: [{
        id: 'seg7', title: 'BCD to common-cathode display',
        apparatus: [{ type: '7447', qty: 1 }, { type: '7404', qty: 2 }, { kind: 'seg7', qty: 1 }, { kind: 'resistor', ohms: 330, qty: 7 }],
        io: io([[IN(3), 'D (MSB)', '7447 pin 6'], [IN(2), 'C', '7447 pin 2'], [IN(1), 'B', '7447 pin 1'], [IN(0), 'A (LSB)', '7447 pin 7']]),
        tasks: [{ id: 'bcd', title: 'BCD to 7-segment', kind: 'seg', ins: [IN(3), IN(2), IN(1), IN(0)], inNames: ['D', 'C', 'B', 'A'], display: 'DISP1', digits: 10, segOn: SEG_ON }],
        steps: [
          'Insert IC 7447, two IC 7404 and the CC display; wire Vcc and GND of every IC.',
          'Tie LT′ (pin 3), BI′/RBO′ (pin 4) and RBI′ (pin 5) of the 7447 HIGH.',
          'Feed each 7447 segment output (a–g) into its own NOT gate of the 7404s.',
          'Each NOT output drives its segment through a 330 Ω resistor; the common cathode goes to ground.',
          'Apply BCD 0000 to 1001 on D C B A and note the digit and the glowing segments.',
        ],
        ref: {
          chips: [{ ref: 'IC1', type: '7447', col: 3 }, { ref: 'IC2', type: '7404', col: 14 }, { ref: 'IC3', type: '7404', col: 24 }],
          segs: [{ ref: 'DISP1', col: 53 }],
          res: resCols.map((c, i) => ({ ref: 'R' + (i + 1), ohms: 330, h1: 'c' + c, h2: 'h' + c })),
          nets,
        },
      }],
    });
  }

  /* ---------------- 5. Binary <-> Gray (one board per converter) ---------------- */
  E.push({
    id: 'gray', no: 5, title: 'Binary to Gray Code and Gray to Binary Code Conversion', short: 'Binary ↔ Gray code', pages: [9, 10, 11],
    aim: 'To design, construct and verify a 4-bit Binary to Gray code converter and a 4-bit Gray to Binary code converter using IC 7486.',
    parts: [
      {
        id: 'b2g', title: 'Binary → Gray',
        apparatus: [{ type: '7486', qty: 1 }],
        io: io([[IN(3), 'B3'], [IN(2), 'B2'], [IN(1), 'B1'], [IN(0), 'B0'], [OUT(3), 'G3 = B3'], [OUT(2), 'G2 = B3⊕B2'], [OUT(1), 'G1 = B2⊕B1'], [OUT(0), 'G0 = B1⊕B0']]),
        tasks: [{ id: 'b2g', title: 'Binary to Gray', kind: 'comb', ins: [IN(3), IN(2), IN(1), IN(0)], inNames: ['B3', 'B2', 'B1', 'B0'], outs: [OUT(3), OUT(2), OUT(1), OUT(0)], outNames: ['G3', 'G2', 'G1', 'G0'],
          f: ([b3, b2, b1, b0]) => [b3, b3 ^ b2, b2 ^ b1, b1 ^ b0] }],
        steps: [
          'Insert IC 7486 and wire Vcc (pin 14) and GND (pin 7).',
          'G3 = B3: a plain wire from the B3 switch to its LED.',
          'G2 = B3⊕B2, G1 = B2⊕B1, G0 = B1⊕B0 with three XOR gates.',
          'Apply all 16 binary codes and note the Gray code.',
        ],
        ref: { chips: [{ ref: 'IC1', type: '7486', col: 22 }], nets: [[IN(3), 'IC1.1', OUT(3)], [IN(2), 'IC1.2', 'IC1.4'], [IN(1), 'IC1.5', 'IC1.9'], [IN(0), 'IC1.10'], ['IC1.3', OUT(2)], ['IC1.6', OUT(1)], ['IC1.8', OUT(0)]] },
      },
      {
        id: 'g2b', title: 'Gray → Binary',
        apparatus: [{ type: '7486', qty: 1 }],
        io: io([[IN(3), 'G3'], [IN(2), 'G2'], [IN(1), 'G1'], [IN(0), 'G0'], [OUT(3), 'B3 = G3'], [OUT(2), 'B2 = B3⊕G2'], [OUT(1), 'B1 = B2⊕G1'], [OUT(0), 'B0 = B1⊕G0']]),
        tasks: [{ id: 'g2b', title: 'Gray to Binary', kind: 'comb', ins: [IN(3), IN(2), IN(1), IN(0)], inNames: ['G3', 'G2', 'G1', 'G0'], outs: [OUT(3), OUT(2), OUT(1), OUT(0)], outNames: ['B3', 'B2', 'B1', 'B0'],
          f: ([g3, g2, g1, g0]) => { const b2 = g3 ^ g2, b1 = b2 ^ g1; return [g3, b2, b1, b1 ^ g0]; } }],
        steps: [
          'Insert IC 7486 and wire Vcc (pin 14) and GND (pin 7).',
          'B3 = G3: a plain wire.',
          'B2 = B3⊕G2, then B1 = B2⊕G1, then B0 = B1⊕G0 — each XOR takes the previous output (cascade).',
          'Apply all 16 Gray codes and note the binary output.',
        ],
        ref: { chips: [{ ref: 'IC1', type: '7486', col: 22 }], nets: [[IN(3), 'IC1.1', OUT(3)], [IN(2), 'IC1.2'], ['IC1.3', 'IC1.4', OUT(2)], [IN(1), 'IC1.5'], ['IC1.6', 'IC1.9', OUT(1)], [IN(0), 'IC1.10'], ['IC1.8', OUT(0)]] },
      },
    ],
  });

  /* ---------------- 6. SR latch, SR FF, JK FF ---------------- */
  const latchNets = (sp, rp) => [[sp, 'IC1.1'], [rp, 'IC1.4'], ['IC1.3', 'IC1.5', OUT(1)], ['IC1.6', 'IC1.2', OUT(0)]];
  E.push({
    id: 'ff', no: 6, title: 'Construction of SR Latch, SR Flip-Flop and JK Flip-Flop using NAND and AND Gates', short: 'SR latch, SR & JK flip-flops', pages: [12, 13, 14, 15],
    aim: 'To design, construct and verify the truth tables of an SR latch, a clocked SR flip-flop and a JK flip-flop using IC 7400 (NAND) and IC 7408 (AND).',
    parts: [
      {
        id: 'srlatch', title: 'SR latch (NAND)',
        apparatus: [{ type: '7400', qty: 1 }],
        io: io([[IN(1), 'S′', 'active-LOW set'], [IN(0), 'R′', 'active-LOW reset'], [OUT(1), 'Q'], [OUT(0), 'Q′']]),
        tasks: [{ id: 'latch', title: 'SR latch', kind: 'latch', ins: [IN(1), IN(0)], inNames: ['S′', 'R′'], outs: [OUT(1), OUT(0)], outNames: ['Q', 'Q′'] }],
        steps: [
          'Insert IC 7400 and wire Vcc (pin 14) and GND (pin 7).',
          'Cross-couple two NAND gates: output of each into one input of the other.',
          'Apply S′ and R′ to the two remaining inputs, and watch Q and Q′ on LEDs.',
          'Try all four combinations — notice 11 holds the previous state and 00 forces Q = Q′ = 1.',
        ],
        ref: { chips: [{ ref: 'IC1', type: '7400', col: 24 }], nets: latchNets(IN(1), IN(0)) },
      },
      {
        id: 'srff', title: 'Clocked SR flip-flop',
        apparatus: [{ type: '7400', qty: 1 }],
        io: io([[IN(1), 'S'], [IN(0), 'R'], ['PLS', 'Clock', 'pulser output P'], [OUT(1), 'Q'], [OUT(0), 'Q′']]),
        tasks: [{ id: 'srff', title: 'SR flip-flop', kind: 'ff', ins: [IN(1), IN(0)], inNames: ['S', 'R'], outs: [OUT(1), OUT(0)], outNames: ['Q', 'Q′'],
          next: (s, r, q) => (s && r ? null : s ? 1 : r ? 0 : q), names: ['Hold', 'Reset', 'Set', 'Not allowed'] }],
        steps: [
          'Build the NAND latch with two gates of IC 7400.',
          'Use the other two NAND gates as clocked input gates: (S, CLK) and (R, CLK).',
          'Their outputs drive the latch inputs S′ and R′.',
          'Clock from the pulser output P. Set S and R, press PULSE, and record Q before and after.',
        ],
        ref: {
          chips: [{ ref: 'IC1', type: '7400', col: 24 }],
          nets: [[IN(1), 'IC1.9'], [IN(0), 'IC1.12'], ['PLS', 'IC1.10', 'IC1.13'], ['IC1.8', 'IC1.1'], ['IC1.11', 'IC1.4'], ['IC1.3', 'IC1.5', OUT(1)], ['IC1.6', 'IC1.2', OUT(0)]],
        },
      },
      {
        id: 'jkff', title: 'JK flip-flop',
        apparatus: [{ type: '7400', qty: 1 }, { type: '7408', qty: 1 }],
        io: io([[IN(1), 'J'], [IN(0), 'K'], ['PLS', 'Clock', 'pulser output P'], [OUT(1), 'Q'], [OUT(0), 'Q′']]),
        tasks: [{ id: 'jkff', title: 'JK flip-flop', kind: 'ff', ins: [IN(1), IN(0)], inNames: ['J', 'K'], outs: [OUT(1), OUT(0)], outNames: ['Q', 'Q′'],
          next: (j, k, q) => (j && k ? 1 - q : j ? 1 : k ? 0 : q), names: ['Hold', 'Reset', 'Set', 'Toggle'] }],
        steps: [
          'Start from the clocked SR flip-flop (IC 7400).',
          'AND J with Q′ (IC 7408) and feed it to the S-side clocked NAND gate.',
          'AND K with Q and feed it to the R-side clocked NAND gate.',
          'Clock from the pulser. With J = K = 1 each pulse toggles Q. Holding the clock HIGH with a switch instead shows race-around.',
        ],
        ref: {
          chips: [{ ref: 'IC1', type: '7400', col: 14 }, { ref: 'IC2', type: '7408', col: 30 }],
          nets: [[IN(1), 'IC2.1'], [IN(0), 'IC2.4'], ['PLS', 'IC1.10', 'IC1.13'], ['IC2.3', 'IC1.9'], ['IC2.6', 'IC1.12'], ['IC1.8', 'IC1.1'], ['IC1.11', 'IC1.4'],
            ['IC1.3', 'IC1.5', 'IC2.5', OUT(1)], ['IC1.6', 'IC1.2', 'IC2.2', OUT(0)]],
        },
      },
    ],
  });

  /* ---------------- 7. 555 timer ---------------- */
  E.push({
    id: 'timer', no: 7, title: 'Monostable and Astable Multivibrators using IC 555 Timer', short: '555 monostable & astable', pages: [16, 17],
    aim: 'To construct the monostable and astable multivibrator circuits using IC 555 and study their output waveforms.',
    parts: [
      {
        id: 'mono', title: 'Monostable (one-shot)',
        apparatus: [{ type: '555', qty: 1 }, { kind: 'resistor', ohms: 1000, qty: 1 }, { kind: 'cap', farads: 0.1e-6, qty: 1 }, { kind: 'cap', farads: 0.01e-6, qty: 1 }],
        io: io([['PLN', 'Trigger', 'pulser P′ (negative pulse) to pin 2'], [OUT(0), 'Output', 'pin 3'], ['CH1', 'CRO CH1', 'output, pin 3'], ['CH2', 'CRO CH2', 'capacitor, pin 6']]),
        tasks: [{ id: 'mono', title: 'Monostable', kind: 'mono', chip: 'IC1', probe: 'CH1', defaults: { R: 1000, C: 0.1e-6 } }],
        steps: [
          'Pin 1 to GND, pins 8 and 4 to +5 V. R (1 kΩ) from +5 V to pin 7. Join pins 6 and 7.',
          'C (0.1 µF) from pin 6 to GND, 0.01 µF from pin 5 to GND.',
          'Trigger pin 2 from the pulser output P′. Output pin 3 to an LED and CRO CH1; pin 6 to CH2.',
          'Press PULSE three times and note the output pulse width on the CRO. Theory: T = 1.1 RC.',
        ],
        ref: {
          chips: [{ ref: 'IC1', type: '555', col: 20 }],
          res: [{ ref: 'R1', ohms: 1000, h1: 'T+@21', h2: 'a21' }],
          caps: [{ ref: 'C1', farads: 0.1e-6, h1: 'a22', h2: 'T-@22' }, { ref: 'C2', farads: 0.01e-6, h1: 'a23', h2: 'T-@23' }],
          nets: [['IC1.7', 'IC1.6', 'CH2'], ['PLN', 'IC1.2'], ['VCC', 'IC1.4'], ['IC1.3', OUT(0), 'CH1']],
        },
      },
      {
        id: 'astable', title: 'Astable (free-running)',
        apparatus: [{ type: '555', qty: 1 }, { kind: 'resistor', ohms: 4700, qty: 1 }, { kind: 'resistor', ohms: 10000, qty: 1 }, { kind: 'cap', farads: 0.1e-6, qty: 1 }, { kind: 'cap', farads: 0.01e-6, qty: 1 }],
        io: io([[OUT(0), 'Output', 'pin 3'], ['CH1', 'CRO CH1', 'output, pin 3'], ['CH2', 'CRO CH2', 'capacitor, pins 6 & 2']]),
        tasks: [{ id: 'astable', title: 'Astable', kind: 'astable', chip: 'IC1', probe: 'CH1', defaults: { RA: 4700, RB: 10000, C: 0.1e-6 } }],
        steps: [
          'Pin 1 to GND, pins 8 and 4 to +5 V.',
          'RA (4.7 kΩ; the manual lists 4.6 kΩ) from +5 V to pin 7, RB (10 kΩ) from pin 7 to pin 6. Short pins 6 and 2.',
          'C (0.1 µF) from pin 6 to GND, 0.01 µF from pin 5 to GND.',
          'Output pin 3 to CRO CH1 (and an LED), pin 6 to CH2. Read T_ON, T_OFF, T, f and duty cycle.',
        ],
        ref: {
          chips: [{ ref: 'IC1', type: '555', col: 20 }],
          res: [{ ref: 'R1', ohms: 4700, h1: 'T+@21', h2: 'a21' }, { ref: 'R2', ohms: 10000, h1: 'b21', h2: 'b22' }],
          caps: [{ ref: 'C1', farads: 0.1e-6, h1: 'a22', h2: 'T-@22' }, { ref: 'C2', farads: 0.01e-6, h1: 'a23', h2: 'T-@23' }],
          nets: [['IC1.6', 'IC1.2', 'CH2'], ['VCC', 'IC1.4'], ['IC1.3', OUT(0), 'CH1']],
        },
      },
    ],
  });

  /* ---------------- 8. 74138 decoder, 74151 mux ---------------- */
  {
    const F = [0, 1, 1, 0, 0, 0, 1, 1]; // F(A,B,C) = Σm(1,2,6,7), A = MSB
    E.push({
      id: 'decmux', no: 8, title: '3-to-8 Line Decoder (IC 74138) and 8:1 Multiplexer (IC 74151)', short: 'Decoder 74138 & MUX 74151', pages: [18, 19, 20],
      aim: 'To study and verify the truth tables of a 3-to-8 line decoder using IC 74138 and an 8:1 multiplexer using IC 74151.',
      parts: [
        {
          id: 'dec', title: '3-to-8 decoder (74138)',
          apparatus: [{ type: '74138', qty: 1 }],
          io: io([[IN(5), 'EN1', 'pin 6 (G1)'], [IN(4), 'EN2′', 'pin 4 (G2A)'], [IN(3), 'EN3′', 'pin 5 (G2B)'], [IN(2), 'S2', 'pin 3 (C)'], [IN(1), 'S1', 'pin 2 (B)'], [IN(0), 'S0', 'pin 1 (A)'],
            ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => [OUT(i), 'Y' + i, 'pin ' + [15, 14, 13, 12, 11, 10, 9, 7][i]])]),
          tasks: [{
            id: 'dec', title: '3-to-8 decoder', kind: 'comb', ins: [IN(3), IN(4), IN(5), IN(2), IN(1), IN(0)], inNames: ['EN3′', 'EN2′', 'EN1', 'S2', 'S1', 'S0'],
            outs: [7, 6, 5, 4, 3, 2, 1, 0].map(OUT), outNames: ['Y7', 'Y6', 'Y5', 'Y4', 'Y3', 'Y2', 'Y1', 'Y0'], bits: 'Active-LOW output Y7…Y0',
            rows: [0, 1, 2, 3, 4, 5, 6, 7].map((s) => [0, 0, 1, (s >> 2) & 1, (s >> 1) & 1, s & 1]),
            f: ([e3, e2, e1, s2, s1, s0]) => { const s = s2 * 4 + s1 * 2 + s0, en = e1 && !e2 && !e3; return [7, 6, 5, 4, 3, 2, 1, 0].map((i) => (en && s === i ? 0 : 1)); },
          }],
          steps: [
            'Insert IC 74138, Vcc pin 16, GND pin 8.',
            'Wire S0–S2 (pins 1, 2, 3) and EN1 (6), EN2′ (4), EN3′ (5) to logic switches.',
            'Connect Y0–Y7 to LEDs. Set EN1 = 1, EN2′ = EN3′ = 0 and step S2S1S0 from 000 to 111.',
            'Exactly one LED goes dark each time — the outputs are active-LOW.',
          ],
          ref: {
            chips: [{ ref: 'IC1', type: '74138', col: 24 }],
            nets: [[IN(0), 'IC1.1'], [IN(1), 'IC1.2'], [IN(2), 'IC1.3'], [IN(4), 'IC1.4'], [IN(3), 'IC1.5'], [IN(5), 'IC1.6'],
              ...[15, 14, 13, 12, 11, 10, 9, 7].map((p, i) => ['IC1.' + p, OUT(i)])],
          },
        },
        {
          id: 'mux', title: '8:1 multiplexer (74151)',
          apparatus: [{ type: '74151', qty: 1 }],
          io: io([[IN(2), 'A (MSB)', 'select C, pin 9'], [IN(1), 'B', 'select B, pin 10'], [IN(0), 'C (LSB)', 'select A, pin 11'], [IN(3), 'EN′', 'pin 7'], [OUT(0), 'Y = F(A,B,C)', 'pin 5']]),
          tasks: [{
            id: 'mux', title: 'F(A,B,C) = Σm(1,2,6,7)', kind: 'comb', ins: [IN(2), IN(1), IN(0), IN(3)], inNames: ['A', 'B', 'C', 'EN′'], outs: [OUT(0)], outNames: ['Output Y'],
            rows: [0, 1, 2, 3, 4, 5, 6, 7].map((m) => [(m >> 2) & 1, (m >> 1) & 1, m & 1, 0]),
            f: ([a, b, c, en]) => [en ? 0 : F[a * 4 + b * 2 + c]],
          }],
          steps: [
            'Insert IC 74151, Vcc pin 16, GND pin 8.',
            'Data lines from the K-map of F = Σm(1,2,6,7): D1, D2, D6, D7 to +5 V; D0, D3, D4, D5 to GND.',
            'Select lines: on the chip C (pin 9) is the MSB — wire A → pin 9, B → pin 10, C → pin 11. EN′ (pin 7) to a switch.',
            'With EN′ = 0 step A B C from 000 to 111 and check Y (pin 5) against F.',
          ],
          ref: {
            chips: [{ ref: 'IC1', type: '74151', col: 24 }],
            nets: [[IN(2), 'IC1.9'], [IN(1), 'IC1.10'], [IN(0), 'IC1.11'], [IN(3), 'IC1.7'], opt('VCC', 'IC1.3'), opt('VCC', 'IC1.2'), opt('VCC', 'IC1.13'), opt('VCC', 'IC1.12'),
              ['GND', 'IC1.4'], ['GND', 'IC1.1'], ['GND', 'IC1.15'], ['GND', 'IC1.14'], ['IC1.5', OUT(0)]],
          },
        },
      ],
    });
  }

  /* ---------------- 9. 7485 comparator ---------------- */
  E.push({
    id: 'cmp', no: 9, title: '4-bit Magnitude Comparator using IC 74LS85', short: 'Magnitude comparator 7485', pages: [21, 22],
    aim: 'To study the working of a 4-bit magnitude comparator using IC 74LS85 and verify its outputs for different pairs of 4-bit numbers.',
    parts: [{
      id: 'cmp', title: '4-bit comparator',
      apparatus: [{ type: '7485', qty: 1 }],
      io: io([[IN(7), 'A3', 'pin 15'], [IN(6), 'A2', 'pin 13'], [IN(5), 'A1', 'pin 12'], [IN(4), 'A0', 'pin 10'], [IN(3), 'B3', 'pin 1'], [IN(2), 'B2', 'pin 14'], [IN(1), 'B1', 'pin 11'], [IN(0), 'B0', 'pin 9'],
        [OUT(2), 'A>B', 'pin 5'], [OUT(1), 'A=B', 'pin 6'], [OUT(0), 'A<B', 'pin 7']]),
      tasks: [{
        id: 'cmp', title: 'Magnitude comparator', kind: 'comb', free: 8,
        ins: [IN(7), IN(6), IN(5), IN(4), IN(3), IN(2), IN(1), IN(0)], groups: [{ name: 'A3A2A1A0', n: 4 }, { name: 'B3B2B1B0', n: 4 }],
        outs: [OUT(2), OUT(1), OUT(0)], outNames: ['A>B', 'A=B', 'A<B'],
        f: (v) => { const a = v[0] * 8 + v[1] * 4 + v[2] * 2 + v[3], b = v[4] * 8 + v[5] * 4 + v[6] * 2 + v[7]; return [+(a > b), +(a === b), +(a < b)]; },
        need: (rows) => { const k = new Set(rows.map((r) => r.want.join(''))); return k.has('100') && k.has('010') && k.has('001'); },
      }],
      steps: [
        'Insert IC 74LS85, Vcc pin 16, GND pin 8.',
        'Wire A3–A0 and B3–B0 to logic switches.',
        'Single chip: IA>B (pin 4) = 0, IA=B (pin 3) = 1, IA<B (pin 2) = 0.',
        'Connect A>B, A=B, A<B to LEDs. Try 8 pairs, including equal, A greater and A smaller.',
      ],
      ref: {
        chips: [{ ref: 'IC1', type: '7485', col: 24 }],
        nets: [[IN(7), 'IC1.15'], [IN(6), 'IC1.13'], [IN(5), 'IC1.12'], [IN(4), 'IC1.10'], [IN(3), 'IC1.1'], [IN(2), 'IC1.14'], [IN(1), 'IC1.11'], [IN(0), 'IC1.9'],
          opt('GND', 'IC1.2'), opt('VCC', 'IC1.3'), opt('GND', 'IC1.4'), ['IC1.5', OUT(2)], ['IC1.6', OUT(1)], ['IC1.7', OUT(0)]],
      },
    }],
  });

  /* ---------------- 10. CD4007 NOT ---------------- */
  E.push({
    id: 'cmosnot', no: 10, title: 'NOT Gate using IC CD4007', short: 'CMOS NOT (CD4007)', pages: [23, 24],
    aim: 'To construct a NOT gate (inverter) using IC CD4007 and verify its truth table.',
    parts: [{
      id: 'cmosnot', title: 'CMOS inverter',
      apparatus: [{ type: 'CD4007', qty: 1 }],
      io: io([[IN(0), 'A', 'gate pair 1, pin 6'], [OUT(0), 'Y = A′', 'drains, pins 13 & 8']]),
      tasks: [{ id: 'not', title: 'CMOS NOT gate', kind: 'comb', ins: [IN(0)], inNames: ['Input A'], outs: [OUT(0)], outNames: ['Output Y = A′'], f: ([a]) => [1 - a] }],
      steps: [
        'VDD (pin 14) to +5 V, VSS (pin 7) to GND. P1’s source is pin 14, N1’s source is pin 7.',
        'Gates of pair 1 (pin 6) are the input A.',
        'Tie the drains together — P1 drain pin 13 and N1 drain pin 8 — as the output Y.',
        'Tie the unused gates (pins 3 and 10) to GND. Apply A = 0 and A = 1.',
      ],
      ref: { chips: [{ ref: 'IC1', type: 'CD4007', col: 24 }], nets: [[IN(0), 'IC1.6'], ['IC1.13', 'IC1.8', OUT(0)], opt('GND', 'IC1.3'), opt('GND', 'IC1.10')] },
    }],
  });

  /* ---------------- 11. CD4007 NAND / NOR ---------------- */
  E.push({
    id: 'cmosnn', no: 11, title: 'NAND and NOR Gates using IC CD4007', short: 'CMOS NAND & NOR (CD4007)', pages: [25, 26, 27],
    aim: 'To construct a 2-input NAND gate and a 2-input NOR gate using the MOS transistors of IC CD4007 and verify their truth tables.',
    parts: [
      {
        id: 'nand', title: 'CMOS NAND',
        apparatus: [{ type: 'CD4007', qty: 1 }],
        io: io([[IN(1), 'A', 'pin 6 (P1, N1)'], [IN(0), 'B', 'pin 3 (P2, N2)'], [OUT(0), 'Y = (AB)′']]),
        tasks: [{ id: 'nand', title: 'CMOS NAND gate', kind: 'comb', ins: [IN(1), IN(0)], inNames: ['A', 'B'], outs: [OUT(0)], outNames: ['Output Y (NAND)'], f: ([a, b]) => [1 - (a & b)] }],
        steps: [
          'VDD (pin 14) to +5 V and VSS (pin 7) to GND.',
          'PMOS in parallel: P1 (source 14, drain 13) and P2 (source 2 → VDD, drain 1); both drains to Y.',
          'NMOS in series: N2 drain (5) to Y, N2 source (4) to N1 drain (8); N1 source is pin 7 (GND).',
          'A drives pin 6 (P1 + N1), B drives pin 3 (P2 + N2). Tie pin 10 to GND.',
        ],
        ref: { chips: [{ ref: 'IC1', type: 'CD4007', col: 24 }], nets: [['VCC', 'IC1.2'], ['IC1.1', 'IC1.13', 'IC1.5', OUT(0)], ['IC1.4', 'IC1.8'], [IN(1), 'IC1.6'], [IN(0), 'IC1.3'], opt('GND', 'IC1.10')] },
      },
      {
        id: 'nor', title: 'CMOS NOR',
        apparatus: [{ type: 'CD4007', qty: 1 }],
        io: io([[IN(1), 'A', 'pin 6 (P1, N1)'], [IN(0), 'B', 'pin 3 (P2, N2)'], [OUT(0), 'Y = (A+B)′']]),
        tasks: [{ id: 'nor', title: 'CMOS NOR gate', kind: 'comb', ins: [IN(1), IN(0)], inNames: ['A', 'B'], outs: [OUT(0)], outNames: ['Output Y (NOR)'], f: ([a, b]) => [1 - (a | b)] }],
        steps: [
          'VDD (pin 14) to +5 V and VSS (pin 7) to GND.',
          'PMOS in series: P1 drain (13) to P2 source (2); P2 drain (1) is Y.',
          'NMOS in parallel: N1 drain (8) and N2 drain (5) to Y; N2 source (4) to GND (N1 source is pin 7).',
          'A drives pin 6, B drives pin 3. Tie pin 10 to GND.',
        ],
        ref: { chips: [{ ref: 'IC1', type: 'CD4007', col: 24 }], nets: [['IC1.13', 'IC1.2'], ['IC1.1', 'IC1.8', 'IC1.5', OUT(0)], ['GND', 'IC1.4'], [IN(1), 'IC1.6'], [IN(0), 'IC1.3'], opt('GND', 'IC1.10')] },
      },
    ],
  });

  /* ---------------- 12. Verilog half adder in Xilinx ISE ---------------- */
  E.push({
    id: 'verilog', no: 12, title: 'Implementation of a Half Adder in Verilog HDL using Xilinx ISE', short: 'Verilog half adder (Xilinx ISE)', pages: [28, 29, 30, 31],
    aim: 'To write the Verilog HDL code for a Half Adder using gate-level modeling, and verify it through syntax check, behavioral simulation with a test fixture, and synthesis (RTL schematic) in Xilinx ISE.',
    software: true,
    parts: [{ id: 'verilog', title: 'Half adder in Verilog', apparatus: [], io: [], tasks: [{ id: 'hdl', title: 'Simulation waveform', kind: 'hdl' }], steps: [] }],
  });

  // index helpers
  for (const e of E) for (const p of e.parts) { p.exp = e; p.key = e.id + '/' + p.id; }
  DSD.EXPERIMENTS = E;
  DSD.partByKey = (k) => { for (const e of E) for (const p of e.parts) if (p.key === k) return p; return null; };
  DSD.allParts = () => E.flatMap((e) => e.parts);
})(typeof window !== 'undefined' ? window : globalThis);
