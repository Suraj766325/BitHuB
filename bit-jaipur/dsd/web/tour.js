/* ============================================================
 * tour.js — a short guided tour of the simulator, shown on the
 * first visit and from the "?" button in the header.
 * ============================================================ */
(function () {
  'use strict';
  const DSD = window.DSD, UI = DSD.UI, { h } = UI;
  const STEPS = [
    { title: 'Welcome to the DSD lab', text: 'Every experiment of the Digital System Design lab manual, on a virtual trainer kit. The ICs are simulated gate by gate, so a circuit only works when it is wired correctly — power included.' },
    { sel: '.dsd-nav', title: 'Pick an experiment', text: 'Open the list to jump to any of the twelve experiments, or step through them with the arrows.' },
    { sel: '.dsd-tabs', title: 'One circuit at a time', text: 'Experiments with several circuits are split into parts. Each part has its own board, diagram, completed build and observation table.' },
    { sel: '.dsd-left', title: 'IC drawer', text: 'Only the ICs and components this part needs. Drag an IC onto the breadboard — its remark shows while you drag. Chips must straddle the centre channel.' },
    { sel: '.dsd-stage', title: 'The trainer kit', text: '+5 V and GND terminals sit top-left, output LEDs L7–L0 along the top, switches S7–S0 below. Drag from one hole to another to lay a jumper wire, drag a wire end to re-plug it, right-click to remove. Hover any hole to trace its connection and logic level.' },
    { sel: '.dsd-btn.power', title: 'Power', text: 'Switch the kit on to run the circuit. A chip only works when its VCC pin reaches +5 V and its GND pin reaches ground through your wires.' },
    { sel: '.dsd-tool-main', title: 'Help while you build', text: 'Read the lab-manual pages, open the pin-numbered circuit diagram and IC pinouts, look at the completed experiment, and let the simulator verify every input combination.' },
    { sel: '.dsd-right', title: 'Checklist and observations', text: 'Tap a pill to open it. Observation tables fill in by themselves as you flip the switches, and mark each reading right or wrong.' },
    { sel: '#dsd-help', title: 'See this again', text: 'This button replays the tour whenever you need it.' },
  ];
  UI.startTour = (onDone) => {
    const steps = STEPS.filter((st) => !st.sel || document.querySelector(st.sel));
    let i = 0;
    const spot = h('div', { class: 'tour-spot' });
    const card = h('div', { class: 'tour-card', role: 'dialog', 'aria-modal': 'true' });
    const ov = h('div', { class: 'tour-ov' }, spot, card);
    document.body.appendChild(ov);
    const end = () => { ov.remove(); window.removeEventListener('resize', place); document.removeEventListener('keydown', key); if (onDone) onDone(); };
    const key = (e) => { if (e.key === 'Escape') end(); if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); };
    function go(d) { i += d; if (i >= steps.length) return end(); if (i < 0) i = 0; show(); }
    function place() {
      const st = steps[i], el = st.sel && document.querySelector(st.sel);
      if (!el) { spot.style.cssText = 'left:50%;top:45%;width:0;height:0;'; card.style.cssText = 'left:50%;top:50%;transform:translate(-50%,-50%);'; return; }
      const r = el.getBoundingClientRect(), pad = 8;
      spot.style.cssText = `left:${r.left - pad}px;top:${r.top - pad}px;width:${r.width + pad * 2}px;height:${r.height + pad * 2}px;`;
      const cw = Math.min(360, innerWidth - 24), ch = card.offsetHeight || 200;
      let x = r.right + 18, y = r.top;
      if (x + cw > innerWidth - 12) x = r.left - cw - 18;
      if (x < 12) { x = Math.max(12, Math.min(innerWidth - cw - 12, r.left + r.width / 2 - cw / 2)); y = r.bottom + 16 + ch > innerHeight ? r.top - ch - 16 : r.bottom + 16; }
      y = Math.max(12, Math.min(innerHeight - ch - 12, y));
      card.style.cssText = `left:${x}px;top:${y}px;width:${cw}px;`;
    }
    function show() {
      const st = steps[i], el = st.sel && document.querySelector(st.sel);
      if (el) el.scrollIntoView({ block: 'nearest', behavior: 'instant' });
      UI.fill(card,
        h('div', { class: 'tour-step' }, `${i + 1} / ${steps.length}`),
        h('h3', { class: 'tour-title' }, st.title), h('p', { class: 'tour-text' }, st.text),
        h('div', { class: 'tour-dots' }, steps.map((_, k) => h('i', { class: k === i ? 'on' : '' }))),
        h('div', { class: 'tour-btns' },
          h('button', { class: 'dsd-btn ghost small', onclick: end }, 'Skip'),
          h('span', { class: 'dsd-spacer' }),
          i ? h('button', { class: 'dsd-btn small', onclick: () => go(-1) }, 'Back') : null,
          h('button', { class: 'dsd-btn small primary', onclick: () => go(1) }, i === steps.length - 1 ? 'Start building' : 'Next')));
      requestAnimationFrame(place);
    }
    window.addEventListener('resize', place);
    document.addEventListener('keydown', key);
    show();
  };
})();
