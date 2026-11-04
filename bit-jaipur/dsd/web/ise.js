/* ============================================================
 * ise.js — a working mock of Xilinx ISE 14.7 Project Navigator
 * for experiment 12 (half adder in Verilog). Everything the
 * manual's procedure touches is functional and runs on
 * core/verilog.js: New Project / New Source wizards, the editor,
 * Check Syntax, Synthesize - XST, View RTL / Technology Schematic,
 * Behavioral Check Syntax and Simulate Behavioral Model (ISim).
 * ============================================================ */
(function () {
  'use strict';
  const DSD = window.DSD, UI = DSD.UI, V = DSD.Verilog;
  const { h, s } = UI;
  const VER = 'P.20131013';
  const FAMILIES = {
    Spartan3E: { devices: ['XC3S100E', 'XC3S250E', 'XC3S500E', 'XC3S1200E', 'XC3S1600E'], packages: ['FG320', 'FG484', 'PQ208', 'TQ144', 'CP132', 'VQ100'], speeds: ['-4', '-5'], luts: { XC3S100E: 1920, XC3S250E: 4896, XC3S500E: 9312, XC3S1200E: 17344, XC3S1600E: 29504 }, iobs: 232 },
    Spartan6: { devices: ['XC6SLX9', 'XC6SLX16', 'XC6SLX25', 'XC6SLX45'], packages: ['CSG324', 'FTG256', 'TQG144'], speeds: ['-2', '-3'], luts: { XC6SLX9: 5720, XC6SLX16: 9112, XC6SLX25: 15032, XC6SLX45: 27288 }, iobs: 232 },
    Artix7: { devices: ['XC7A100T'], packages: ['CSG324', 'FGG484'], speeds: ['-1', '-2', '-3'], luts: { XC7A100T: 63400 }, iobs: 210 },
  };
  const STEPS = [
    [1, 'New Project Wizard: project name and location'], [2, 'Project settings (family, device, language)'], [3, 'Project summary / project opened in Project Navigator'],
    [4, 'New Source Wizard: Verilog Module selected'], [5, 'Define Module: input and output ports'], [6, 'Verilog code of half adder in the editor'],
    [7, 'Check Syntax completed successfully'], [8, 'New Source Wizard: Verilog Test Fixture, source association'], [9, 'Test fixture code with stimulus'],
    [10, 'Simulation view with Simulate Behavioral Model'], [11, 'ISim output waveform (x, y, s, c)'], [12, 'Synthesize \u2013 XST completed successfully'],
    [13, 'RTL Schematic: top-level block'], [14, 'RTL Schematic: internal XOR and AND gates'],
  ];
  const MANUAL_HA = `module half_adder(x, y, s, c);
    input x;
    input y;
    output s;
    output c;

    xor (s, x, y);   // Sum = x XOR y
    and (c, x, y);   // Carry = x AND y
endmodule
`;
  const MANUAL_TB_STIM = `		x = 0; y = 0;
		#100;  x = 0; y = 1;
		#100;  x = 1; y = 0;
		#100;  x = 1; y = 1;
		#100;`;

  const now = () => { const d = new Date(), p = (n) => String(n).padStart(2, '0'); return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())} ${p(d.getMonth() + 1)}/${p(d.getDate())}/${d.getFullYear()}`; };
  function moduleTemplate(name, ports) {
    const pl = ports.filter((p) => p.name).map((p) => `    ${p.dir}${p.bus ? ` [${p.msb}:${p.lsb}]` : ''} ${p.name}`).join(',\n');
    return `\`timescale 1ns / 1ps
//////////////////////////////////////////////////////////////////////////////////
// Company:
// Engineer:
//
// Create Date:    ${now()}
// Design Name:
// Module Name:    ${name}
// Project Name:
// Target Devices:
// Tool versions:
// Description:
//
// Dependencies:
//
// Revision:
// Revision 0.01 - File Created
// Additional Comments:
//
//////////////////////////////////////////////////////////////////////////////////
module ${name}(
${pl}
    );


endmodule
`;
  }
  function tbTemplate(name, mod, ports, proj) {
    const ins = ports.filter((p) => p.dir === 'input'), outs = ports.filter((p) => p.dir !== 'input');
    const w = (p) => (p.w > 1 ? ` [${p.w - 1}:0]` : '');
    return `\`timescale 1ns / 1ps

////////////////////////////////////////////////////////////////////////////////
// Company:
// Engineer:
//
// Create Date:   ${now()}
// Design Name:   ${mod}
// Module Name:   ${proj.location}\\${name}.v
// Project Name:  ${proj.name}
// Target Device:
// Tool versions:
// Description:
//
// Verilog Test Fixture created by ISE for module: ${mod}
//
// Dependencies:
//
// Revision:
// Revision 0.01 - File Created
// Additional Comments:
//
////////////////////////////////////////////////////////////////////////////////

module ${name};

	// Inputs
${ins.map((p) => `	reg${w(p)} ${p.name};`).join('\n')}

	// Outputs
${outs.map((p) => `	wire${w(p)} ${p.name};`).join('\n')}

	// Instantiate the Unit Under Test (UUT)
	${mod} uut (
${ports.map((p) => `		.${p.name}(${p.name})`).join(', \n')}
	);

	initial begin
		// Initialize Inputs
${ins.map((p) => `		${p.name} = 0;`).join('\n')}

		// Wait 100 ns for global reset to finish
		#100;

		// Add stimulus here

	end

endmodule

`;
  }

  /* ---------- syntax highlighting ---------- */
  const KW = /\b(module|endmodule|input|output|inout|wire|reg|integer|parameter|localparam|assign|always|initial|begin|end|if|else|case|casez|casex|endcase|default|for|repeat|while|forever|posedge|negedge|or|and|nand|nor|xor|xnor|not|buf)\b/;
  function highlight(src) {
    const re = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:[^"\\]|\\.)*")|(`\w+)|(\$\w+)|(\b\d+'[sS]?[bBoOdDhH][0-9a-fA-FxXzZ_?]+|\b\d+\b)|([A-Za-z_]\w*)/g;
    let out = '', last = 0, m;
    while ((m = re.exec(src))) {
      out += UI.esc(src.slice(last, m.index));
      const t = UI.esc(m[0]);
      if (m[1]) out += `<span class="c">${t}</span>`;
      else if (m[2]) out += `<span class="st">${t}</span>`;
      else if (m[3]) out += `<span class="dr">${t}</span>`;
      else if (m[4]) out += `<span class="sy">${t}</span>`;
      else if (m[5]) out += `<span class="n">${t}</span>`;
      else if (KW.test(m[0]) && m[0].match(KW)[0] === m[0]) out += `<span class="k">${t}</span>`;
      else out += t;
      last = re.lastIndex;
    }
    return out + UI.esc(src.slice(last)) + '\n';
  }

  /* ---------- small icons in Xilinx colours ---------- */
  const ico = {
    proj: () => s('svg', { viewBox: '0 0 16 16', class: 'xi' }, s('path', { d: 'M1 4h5l1 1.5h8V14H1z', fill: '#e8c25a', stroke: '#9b7a1d', 'stroke-width': 0.8 })),
    chip: () => s('svg', { viewBox: '0 0 16 16', class: 'xi' }, s('rect', { x: 3, y: 3, width: 10, height: 10, fill: '#5b6c86', stroke: '#2c3a52', 'stroke-width': 0.8 }), s('path', { d: 'M5 1v2M8 1v2M11 1v2M5 13v2M8 13v2M11 13v2M1 5h2M1 8h2M1 11h2M13 5h2M13 8h2M13 11h2', stroke: '#2c3a52', 'stroke-width': 1 })),
    v: () => s('svg', { viewBox: '0 0 16 16', class: 'xi' }, s('path', { d: 'M3 1h7l3 3v11H3z', fill: '#fff', stroke: '#6b7a90', 'stroke-width': 0.8 }), s('text', { x: 8, y: 12, 'text-anchor': 'middle', 'font-size': 7, 'font-weight': 700, fill: '#1d5fbf' }, 'V')),
    top: () => s('svg', { viewBox: '0 0 16 16', class: 'xi' }, s('rect', { x: 2, y: 3, width: 12, height: 10, fill: '#f3f6fb', stroke: '#3a6fc4', 'stroke-width': 1 }), s('path', { d: 'M5 8h6M8 5v6', stroke: '#3a6fc4', 'stroke-width': 1.4 })),
    proc: () => s('svg', { viewBox: '0 0 16 16', class: 'xi' }, s('circle', { cx: 8, cy: 8, r: 5.5, fill: '#e9eef6', stroke: '#6b7a90', 'stroke-width': 0.8 }), s('path', { d: 'M6 5.5l4.5 2.5L6 10.5z', fill: '#2f8a34' })),
    ok: () => s('svg', { viewBox: '0 0 16 16', class: 'xi st' }, s('circle', { cx: 8, cy: 8, r: 6.5, fill: '#2fa84f' }), s('path', { d: 'M4.8 8.2l2.1 2.1 4.3-4.6', stroke: '#fff', 'stroke-width': 1.8, fill: 'none' })),
    err: () => s('svg', { viewBox: '0 0 16 16', class: 'xi st' }, s('circle', { cx: 8, cy: 8, r: 6.5, fill: '#d33b2f' }), s('path', { d: 'M5.5 5.5l5 5M10.5 5.5l-5 5', stroke: '#fff', 'stroke-width': 1.8 })),
    warn: () => s('svg', { viewBox: '0 0 16 16', class: 'xi st' }, s('path', { d: 'M8 1.5L15 14H1z', fill: '#f0b323', stroke: '#9b6d06', 'stroke-width': 0.6 }), s('path', { d: 'M8 6v4M8 11.5v1', stroke: '#3a2a00', 'stroke-width': 1.5 })),
    run: () => s('svg', { viewBox: '0 0 16 16', class: 'xi st spin' }, s('circle', { cx: 8, cy: 8, r: 5.5, fill: 'none', stroke: '#3a6fc4', 'stroke-width': 2, 'stroke-dasharray': '20 12' })),
  };
  const tb = (title, path, onclick, disabled) => h('button', { class: 'ise-tb', title, 'aria-label': title, onclick, disabled }, s('svg', { viewBox: '0 0 16 16' }, s('path', { d: path, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })));

  /* ============================================================ */
  UI.ISE = function (container, ctx) {
    const P = ctx.progress;
    const st = (P.ise = P.ise || { project: null, files: [], steps: {}, view: 'impl', obs: {}, statuses: {}, tabs: ['summary'], active: 'summary', synth: null, sim: null, rtlMode: null });
    const save = () => { ctx.save(); };
    const step = (n) => {
      if (st.steps[n]) return;
      st.steps[n] = true; save();
      if (STEPS.every(([k]) => st.steps[k])) ctx.mark('verified', 'All 14 procedure steps completed');
      ctx.refresh();
    };
    let consoleLines = st.consoleLines || [{ t: 'Welcome to ISE Project Navigator. Start with File \u203a New Project\u2026', c: '' }];
    let errors = [], warnings = [], conTab = 'console', selected = null, dirty = {}, rtlExpanded = false, menuOpen = null;

    const root = h('div', { class: 'ise', tabindex: -1 });
    container.appendChild(root);
    const titleEl = h('div', { class: 'ise-title' });
    const menu = h('div', { class: 'ise-menu' });
    const tools = h('div', { class: 'ise-toolbar' });
    const design = h('div', { class: 'ise-design' });
    const procs = h('div', { class: 'ise-procs' });
    const work = h('div', { class: 'ise-work' });
    const con = h('div', { class: 'ise-console' });
    const statusbar = h('div', { class: 'ise-statusbar' });
    root.append(titleEl, menu, tools, h('div', { class: 'ise-body' }, h('div', { class: 'ise-left' }, design, procs), work), con, statusbar);

    const proj = () => st.project;
    const fileByName = (n) => st.files.find((f) => f.name === n);
    const modFiles = () => st.files.filter((f) => f.kind === 'module');
    const tbFiles = () => st.files.filter((f) => f.kind === 'tb');
    const parsedModules = (files) => { const c = V.compile(files.map((f) => ({ name: f.name, text: f.text }))); return c.modules; };
    const topImpl = () => { const m = parsedModules(modFiles()); return m.length ? m[0].name : (modFiles()[0] ? modFiles()[0].name.replace(/\.v$/, '') : null); };
    const topSim = () => { const f = tbFiles()[0]; if (!f) return null; const m = parsedModules([f]); return m.length ? m[0].name : f.name.replace(/\.v$/, ''); };
    const log = (t, c) => { consoleLines.push({ t, c: c || '' }); if (consoleLines.length > 400) consoleLines = consoleLines.slice(-400); st.consoleLines = consoleLines.slice(-80); renderConsole(); };
    const path = (f) => `${proj().location}\\${f}`;

    /* ---------- title, menu, toolbar ---------- */
    function renderTitle() {
      const act = st.active && st.active !== 'summary' ? st.active : 'Design Summary';
      UI.fill(titleEl, h('span', { class: 'ise-logo' }, s('svg', { viewBox: '0 0 16 16' }, s('path', { d: 'M2 2l5 6-5 6h3l3.5-4.2L12 14h2L9 8l5-6h-3L8 5.8 5 2z', fill: '#d4202c' }))),
        h('span', { class: 'ise-title-text' }, `ISE Project Navigator (${VER})${proj() ? ` - ${proj().location}\\${proj().name}.xise - [${act.replace(/^rtl:|^tech:/, '')}]` : ''}`),
        h('span', { class: 'ise-winbtns' }, h('i', {}, '\u2013'), h('i', {}, '\u25a1'), h('i', { class: 'x' }, '\u2715')));
    }
    function renderMenu() {
      const item = (label, fn, dis) => h('button', { class: 'ise-mi', disabled: dis, onclick: () => { closeMenu(); fn(); } }, label);
      const MENUS = {
        File: () => [item('New Project\u2026', newProjectWizard), item('Save', saveActive, !proj()), item('Save All', saveAll, !proj()), item('Close Project', closeProject, !proj())],
        Edit: () => [item('Insert lab-manual half adder code', insertManual, !modFiles().length)],
        View: () => [item('Implementation', () => setView('impl'), !proj()), item('Simulation', () => setView('sim'), !proj())],
        Project: () => [item('New Source\u2026', newSourceWizard, !proj()), item('Design Summary', () => openTab('summary'), !proj())],
        Source: () => [item('Open', () => selected && openTab(selected), !selected)],
        Process: () => [item('Run', runSelectedProcess, !proj())],
        Tools: () => [item('ISim Simulator', () => (st.sim ? openISim() : log('Run "Simulate Behavioral Model" first.', 'warn')), !proj())],
        Window: () => [item('Close All Tabs', () => { st.tabs = ['summary']; st.active = 'summary'; renderWork(); })],
        Layout: () => [item('Reset layout', () => {})],
        Help: () => [item('About ISE (simulated)', () => log(`ISE Project Navigator ${VER} \u2014 browser simulation for the BitHub DSD lab. Verilog runs on a built-in compiler and event-driven simulator.`))],
      };
      UI.fill(menu, Object.keys(MENUS).map((k) => h('div', { class: 'ise-menu-item' + (menuOpen === k ? ' open' : '') },
        h('button', { class: 'ise-mtop', onclick: (e) => { e.stopPropagation(); menuOpen = menuOpen === k ? null : k; renderMenu(); } }, k),
        menuOpen === k ? h('div', { class: 'ise-drop' }, MENUS[k]()) : null)));
    }
    const closeMenu = () => { if (menuOpen) { menuOpen = null; renderMenu(); } };
    const onDocClick = () => closeMenu();
    document.addEventListener('click', onDocClick);
    function renderTools() {
      UI.fill(tools,
        tb('New Project', 'M3 2h7l3 3v9H3zM10 2v3h3M8 7v5M5.5 9.5h5', newProjectWizard),
        tb('Save', 'M3 2h9l2 2v10H2V2zM5 2v4h6V2M5 14v-4h6v4', saveActive, !proj()),
        h('span', { class: 'ise-tsep' }),
        tb('Undo', 'M5 6L2.5 8.5 5 11M2.5 8.5h7a3.5 3.5 0 0 1 0 7', () => document.execCommand && document.execCommand('undo')),
        tb('Redo', 'M11 6l2.5 2.5L11 11M13.5 8.5h-7a3.5 3.5 0 0 0 0 7', () => document.execCommand && document.execCommand('redo')),
        h('span', { class: 'ise-tsep' }),
        tb('New Source', 'M3 2h7l3 3v9H3zM6 9h4M8 7v4', newSourceWizard, !proj()),
        tb('Design Summary', 'M2 3h12v10H2zM2 6h12M6 6v7', () => openTab('summary'), !proj()),
        h('span', { class: 'ise-tsep' }),
        h('button', { class: 'ise-tb run', title: 'Implement Top Module / Run the selected process', 'aria-label': 'Run', onclick: runSelectedProcess, disabled: !proj() }, s('svg', { viewBox: '0 0 16 16' }, s('path', { d: 'M4 2.5l9 5.5-9 5.5z', fill: '#2f9e44' }))),
        h('span', { class: 'ise-tsep' }),
        tb('ISim', 'M2 12h2l2-7 2 9 2-9 2 7h2', () => (st.sim ? openISim() : log('Run "Simulate Behavioral Model" first.', 'warn')), !proj()));
    }

    /* ---------- design panel (hierarchy) ---------- */
    function setView(v) { st.view = v; selected = null; save(); renderDesign(); renderProcs(); if (v === 'sim') ctx.refresh(); }
    function renderDesign() {
      const p = proj();
      const radio = (v, label) => h('label', { class: 'ise-radio' }, h('input', { type: 'radio', name: 'iseview', checked: st.view === v, disabled: !p, onchange: () => setView(v) }), label);
      const node = (depth, icon, label, key, extra) => h('div', { class: 'ise-node' + (key && selected === key ? ' sel' : ''), style: { paddingLeft: 6 + depth * 16 + 'px' },
        onclick: () => { selected = key; renderDesign(); renderProcs(); }, ondblclick: () => key && fileByName(key) && openTab(key) }, icon, h('span', {}, label), extra || null);
      let tree = [];
      if (p) {
        tree.push(node(0, ico.proj(), p.name, null), node(1, ico.chip(), `${p.device.toLowerCase()}${p.speed}${p.package.toLowerCase()}`, null));
        if (st.view === 'impl') modFiles().forEach((f) => { const m = parsedModules([f])[0]; tree.push(node(2, ico.top(), `${m ? m.name : f.name.replace(/\.v$/, '')} (${f.name})`, f.name)); });
        else tbFiles().forEach((f) => {
          const m = parsedModules([f])[0];
          tree.push(node(2, ico.top(), `${m ? m.name : f.name.replace(/\.v$/, '')} (${f.name})`, f.name));
          if (m) m.items.filter((i) => i.k === 'inst').forEach((i) => { const mf = modFiles().find((x) => parsedModules([x]).some((mm) => mm.name === i.mod)); tree.push(node(3, ico.v(), `${i.inst} - ${i.mod} (${mf ? mf.name : '?'})`, mf ? mf.name : null)); });
        });
        if (!st.files.length) tree.push(h('div', { class: 'ise-empty' }, 'Empty project \u2014 Project \u203a New Source\u2026'));
      }
      UI.fill(design, h('div', { class: 'ise-ph' }, 'Design'),
        h('div', { class: 'ise-viewsel' }, h('span', {}, 'View:'), radio('impl', 'Implementation'), radio('sim', 'Simulation')),
        h('div', { class: 'ise-ph sub' }, 'Hierarchy', h('span', { class: 'ise-ph-tools' }, h('button', { class: 'ise-mini', title: 'New Source', onclick: newSourceWizard, disabled: !p }, '+'))),
        h('div', { class: 'ise-tree' }, tree));
    }

    /* ---------- processes ---------- */
    const PROC_IMPL = [
      { id: 'summary', label: 'Design Summary/Reports' }, { id: 'util', label: 'Design Utilities', closed: true }, { id: 'ucf', label: 'User Constraints', closed: true },
      { id: 'synth', label: 'Synthesize - XST', kids: [{ id: 'rtl', label: 'View RTL Schematic' }, { id: 'tech', label: 'View Technology Schematic' }, { id: 'check', label: 'Check Syntax' }, { id: 'postsim', label: 'Generate Post-Synthesis Simulation Model' }] },
      { id: 'impl', label: 'Implement Design', closed: true }, { id: 'bit', label: 'Generate Programming File' }, { id: 'cfg', label: 'Configure Target Device', closed: true },
    ];
    const PROC_SIM = [{ id: 'isim', label: 'ISim Simulator', kids: [{ id: 'bcheck', label: 'Behavioral Check Syntax' }, { id: 'simulate', label: 'Simulate Behavioral Model' }] }];
    let selProc = null;
    function renderProcs() {
      const top = st.view === 'impl' ? topImpl() : topSim();
      const list = st.view === 'impl' ? PROC_IMPL : PROC_SIM;
      const stIcon = (id) => { const v = st.statuses[id]; return v === 'ok' ? ico.ok() : v === 'err' ? ico.err() : v === 'warn' ? ico.warn() : v === 'run' ? ico.run() : null; };
      const row = (p, depth) => h('div', { class: 'ise-node proc' + (selProc === p.id ? ' sel' : ''), style: { paddingLeft: 6 + depth * 16 + 'px' },
        onclick: () => { selProc = p.id; renderProcs(); }, ondblclick: () => runProcess(p.id), title: 'Double-click to run' },
        h('span', { class: 'ise-twisty' }, p.kids ? '\u25be' : p.closed ? '\u25b8' : ''), ico.proc(), h('span', {}, p.label), stIcon(p.id));
      UI.fill(procs, h('div', { class: 'ise-ph' }, `Processes: ${top || ''}`),
        h('div', { class: 'ise-tree' }, proj() && top ? list.flatMap((p) => [row(p, 0), ...(p.kids || []).map((k) => row(k, 1))]) : h('div', { class: 'ise-empty' }, proj() ? (st.view === 'impl' ? 'No design source yet' : 'No test fixture yet \u2014 add a Verilog Test Fixture') : 'No project open')));
    }
    function runSelectedProcess() { if (selProc) runProcess(selProc); else if (st.view === 'impl') runProcess('synth'); else runProcess('simulate'); }

    /* ---------- workspace tabs ---------- */
    function openTab(key) {
      if (!st.tabs.includes(key)) st.tabs.push(key);
      st.active = key; save(); renderWork(); renderTitle();
    }
    function closeTab(key) {
      st.tabs = st.tabs.filter((t) => t !== key);
      if (st.active === key) st.active = st.tabs[st.tabs.length - 1] || null;
      save(); renderWork(); renderTitle();
    }
    const tabLabel = (k) => (k === 'summary' ? 'Design Summary' : k.startsWith('rtl:') ? `${k.slice(4)} (RTL1)` : k.startsWith('tech:') ? `${k.slice(5)} (TECH1)` : k + (dirty[k] ? '*' : ''));
    function renderWork() {
      if (!proj()) {
        UI.fill(work, h('div', { class: 'ise-start' },
          h('div', { class: 'ise-start-card' }, h('h3', {}, 'Start'), h('p', {}, 'Create a project to begin the half adder experiment.'),
            h('button', { class: 'ise-btn primary', onclick: newProjectWizard }, 'New Project\u2026'),
            h('p', { class: 'ise-small' }, 'Follow the lab manual: File \u203a New Project \u2192 New Source (Verilog Module) \u2192 Check Syntax \u2192 Test Fixture \u2192 Simulate \u2192 Synthesize \u2192 RTL Schematic.'))));
        return;
      }
      const tabs = h('div', { class: 'ise-tabs' }, st.tabs.map((k) => h('div', { class: 'ise-tab' + (st.active === k ? ' active' : ''), onclick: () => { st.active = k; renderWork(); renderTitle(); } },
        h('span', {}, tabLabel(k)), h('button', { class: 'ise-tabx', title: 'Close', onclick: (e) => { e.stopPropagation(); closeTab(k); } }, '\u2715'))));
      let body;
      const k = st.active;
      if (!k) body = h('div', { class: 'ise-blank' });
      else if (k === 'summary') body = summaryView();
      else if (k.startsWith('rtl:')) body = rtlView(k.slice(4));
      else if (k.startsWith('tech:')) body = techView(k.slice(5));
      else body = editorView(fileByName(k));
      UI.fill(work, tabs, h('div', { class: 'ise-tabbody' }, body));
    }

    /* ---------- editor ---------- */
    function editorView(f) {
      if (!f) return h('div', { class: 'ise-blank' }, 'File not found');
      const pre = h('pre', { class: 'ise-hl', 'aria-hidden': 'true' });
      const gutter = h('div', { class: 'ise-gutter' });
      const ta = h('textarea', { class: 'ise-ta', spellcheck: 'false', autocapitalize: 'off', autocomplete: 'off', 'aria-label': f.name + ' editor', wrap: 'off' });
      ta.value = f.text;
      const sync = () => {
        pre.innerHTML = highlight(ta.value);
        const n = ta.value.split('\n').length;
        gutter.textContent = Array.from({ length: n }, (_, i) => i + 1).join('\n');
      };
      const pos = () => { const before = ta.value.slice(0, ta.selectionStart).split('\n'); UI.fill(statusbar, h('span', {}, `Ln ${before.length} Col ${before[before.length - 1].length + 1}`), h('span', {}, 'Verilog'), h('span', {}, proj() ? `${proj().device}${proj().speed} ${proj().package}` : '')); };
      ta.addEventListener('input', () => { f.text = ta.value; if (!dirty[f.name]) { dirty[f.name] = true; renderWorkTabsOnly(); } sync(); checkCodeStep(); });
      ta.addEventListener('scroll', () => { pre.scrollTop = ta.scrollTop; pre.scrollLeft = ta.scrollLeft; gutter.scrollTop = ta.scrollTop; });
      ta.addEventListener('keyup', pos); ta.addEventListener('click', pos);
      ta.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') { e.preventDefault(); const a = ta.selectionStart, b = ta.selectionEnd; ta.value = ta.value.slice(0, a) + '    ' + ta.value.slice(b); ta.selectionStart = ta.selectionEnd = a + 4; ta.dispatchEvent(new Event('input')); }
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); saveFile(f); }
      });
      sync();
      setTimeout(pos, 0);
      return h('div', { class: 'ise-editor' }, gutter, h('div', { class: 'ise-code' }, pre, ta));
    }
    function renderWorkTabsOnly() { const tabs = work.querySelector('.ise-tabs'); if (!tabs) return; [...tabs.children].forEach((el, i) => { el.firstChild.textContent = tabLabel(st.tabs[i]); }); }
    function saveFile(f) { dirty[f.name] = false; save(); renderWorkTabsOnly(); renderDesign(); renderProcs(); log(`Saved "${path(f.name)}".`); checkCodeStep(); }
    function saveActive() { const f = fileByName(st.active); if (f) saveFile(f); }
    function saveAll() { st.files.forEach((f) => { dirty[f.name] = false; }); save(); renderWorkTabsOnly(); log('All files saved.'); }
    function autoSave() { if (Object.values(dirty).some(Boolean)) { saveAll(); } }
    function checkCodeStep() {
      const f = modFiles()[0]; if (!f) return;
      const r = V.check([{ name: f.name, text: f.text }], topImpl());
      if (r.errors.length) return;
      const prims = r.modules[0] ? r.modules[0].items.filter((i) => i.k === 'gate').map((i) => i.type) : [];
      if (prims.includes('xor') && prims.includes('and')) step(6);
    }
    function insertManual() {
      const f = modFiles()[0]; if (!f) return;
      f.text = MANUAL_HA; save(); openTab(f.name); renderWork(); checkCodeStep();
      log(`Inserted the lab-manual half adder into ${f.name}.`);
    }

    /* ---------- design summary ---------- */
    function summaryView() {
      const p = proj(), sy = st.synth;
      const fam = FAMILIES[p.family] || FAMILIES.Spartan3E;
      const luts = fam.luts[p.device] || 9312;
      const row = (a, b) => h('tr', {}, h('td', { class: 'k' }, a), h('td', {}, b));
      return h('div', { class: 'ise-summary' },
        h('table', { class: 'ise-rep' }, h('caption', {}, `${topImpl() || p.name} Project Status`),
          row('Project File:', `${p.name}.xise`), row('Module Name:', topImpl() || '\u2014'), row('Target Device:', `${p.device.toLowerCase()}${p.speed}${p.package.toLowerCase()}`),
          row('Product Version:', 'ISE 14.7'), row('Design Goal:', 'Balanced'), row('Design Strategy:', 'Xilinx Default (unlocked)'),
          row('Environment:', 'System Settings'), row('Errors:', String(errors.length ? errors.length : sy ? 'No Errors' : '')), row('Warnings:', String(warnings.length ? warnings.length : sy ? 'No Warnings' : ''))),
        sy ? h('table', { class: 'ise-rep util' }, h('caption', {}, 'Device Utilization Summary (estimated values)'),
          h('tr', {}, h('th', {}, 'Logic Utilization'), h('th', {}, 'Used'), h('th', {}, 'Available'), h('th', {}, 'Utilization')),
          h('tr', {}, h('td', {}, 'Number of Slices'), h('td', {}, Math.ceil(sy.luts / 2)), h('td', {}, luts / 2), h('td', {}, Math.max(1, Math.round(100 * Math.ceil(sy.luts / 2) / (luts / 2))) + '%')),
          h('tr', {}, h('td', {}, 'Number of 4 input LUTs'), h('td', {}, sy.luts), h('td', {}, luts), h('td', {}, Math.max(1, Math.round(100 * sy.luts / luts)) + '%')),
          h('tr', {}, h('td', {}, 'Number of bonded IOBs'), h('td', {}, sy.iobs), h('td', {}, fam.iobs), h('td', {}, Math.max(1, Math.round(100 * sy.iobs / fam.iobs)) + '%'))) : h('p', { class: 'ise-small' }, 'Run Synthesize - XST to see the device utilization.'),
        h('table', { class: 'ise-rep' }, h('caption', {}, 'Detailed Reports'), h('tr', {}, h('th', {}, 'Report Name'), h('th', {}, 'Status'), h('th', {}, 'Generated')),
          h('tr', {}, h('td', {}, 'Synthesis Report'), h('td', {}, sy ? 'Current' : ''), h('td', {}, sy ? sy.time : ''))));
    }

    /* ---------- processes ---------- */
    function setStatus(id, v) { st.statuses[id] = v; save(); renderProcs(); }
    function fileErrors(r, banner) {
      errors = r.errors.map((e) => `ERROR:HDLCompiler:${e.code} - "${path(e.file || '?')}" Line ${e.line}: ${e.msg}`);
      warnings = (r.warnings || []).map((w) => `WARNING:HDLCompiler:${w.code} - "${path(w.file || '?')}" Line ${w.line}: ${w.msg}`);
      errors.forEach((e) => log(e, 'err')); warnings.forEach((w) => log(w, 'warn'));
      if (errors.length) log(`Process "${banner}" failed`, 'err');
      renderConsole();
    }
    function runProcess(id) {
      if (!proj()) return;
      autoSave();
      const top = st.view === 'impl' ? topImpl() : topSim();
      if (!top) { log(st.view === 'impl' ? 'No design source to process.' : 'Add a Verilog Test Fixture first (Project \u203a New Source).', 'warn'); return; }
      selProc = id;
      const files = (st.view === 'impl' ? modFiles() : st.files).map((f) => ({ name: f.name, text: f.text }));
      const delay = (fn, ms) => { setStatus(id, 'run'); setTimeout(fn, ms || 450); };
      switch (id) {
        case 'check': {
          log(''); log(`Started : "Check Syntax for ${top}".`, 'bold');
          delay(() => {
            log('', ''); log('=========================================================================');
            log('*                          HDL Compilation                              *');
            log('=========================================================================');
            files.forEach((f) => log(`Analyzing Verilog file "${path(f.name)}" into library work`));
            const r = V.check(files, top);
            if (r.errors.length) { fileErrors(r, 'Check Syntax'); setStatus('check', 'err'); return; }
            errors = []; warnings = (r.warnings || []).map((w) => `WARNING:HDLCompiler:${w.code} - Line ${w.line}: ${w.msg}`);
            r.modules.forEach((m) => log(`Parsing module <${m.name}>.`));
            log('', ''); log('Process "Check Syntax" completed successfully', 'ok');
            setStatus('check', warnings.length ? 'warn' : 'ok');
            const sy = V.synth(r.modules, top);
            if (sy && sy.cells.some((c) => c.type === 'XOR') && sy.cells.some((c) => c.type === 'AND')) step(7);
          });
          break;
        }
        case 'synth': case 'rtl': case 'tech': case 'postsim': case 'impl': case 'bit': case 'summary': {
          if (id === 'summary') { openTab('summary'); return; }
          if ((id === 'rtl' || id === 'tech') && st.synth && st.synth.top === top && st.synth.src === files.map((f) => f.text).join('\u0000')) { openViewer(id, top); return; }
          log(''); log(`Started : "Synthesize - XST".`, 'bold');
          delay(() => {
            const r = V.check(files, top);
            log('Reading design: ' + top + '.prj');
            log(''); log('=========================================================================');
            log('*                          HDL Parsing                                  *');
            log('=========================================================================');
            files.forEach((f) => log(`Analyzing Verilog file "${path(f.name)}" into library work`));
            if (r.errors.length) { fileErrors(r, 'Synthesize - XST'); setStatus('synth', 'err'); setStatus(id, 'err'); return; }
            r.modules.forEach((m) => log(`Parsing module <${m.name}>.`));
            const sy = V.synth(r.modules, top);
            log(''); log('=========================================================================');
            log('*                            HDL Synthesis                              *');
            log('=========================================================================');
            log(`Synthesizing Unit <${top}>.`);
            log(`    Related source file is "${path(modFiles()[0].name)}".`);
            log(`    Summary:\n\tno macro.`);
            log(`Unit <${top}> synthesized.`);
            log(''); log('=========================================================================');
            log('Final Results'); log(`Top Level Output File Name         : ${top}.ngc`);
            log(`Number of LUTs                     : ${sy.luts.length || sy.cells.length}`);
            log(`Number of IOs                      : ${sy.ports.length}`);
            log(''); log('Process "Synthesize - XST" completed successfully', 'ok');
            st.synth = { top, src: files.map((f) => f.text).join('\u0000'), luts: Math.max(sy.luts.length, 1), iobs: sy.ports.reduce((a, p) => a + p.w, 0), time: now(), sy };
            errors = []; warnings = [];
            setStatus('synth', 'ok'); if (id !== 'synth') setStatus(id, 'ok');
            if (sy.cells.some((c) => c.type === 'XOR') && sy.cells.some((c) => c.type === 'AND')) step(12);
            if (id === 'rtl' || id === 'tech') openViewer(id, top);
            else if (id === 'impl' || id === 'bit') {
              log(''); log('Started : "Translate".'); log('Process "Translate" completed successfully', 'ok');
              log('Started : "Map".'); log('Process "Map" completed successfully', 'ok');
              log('Started : "Place & Route".'); log('All signals are completely routed.'); log('Process "Place & Route" completed successfully', 'ok');
              if (id === 'bit') { log('Started : "Generate Programming File".'); log(`Process "Generate Programming File" completed successfully`, 'ok'); }
              setStatus('impl', 'ok');
            } else renderWork();
          }, 700);
          break;
        }
        case 'bcheck': case 'simulate': case 'isim': {
          const sf = st.files.map((f) => ({ name: f.name, text: f.text }));
          log(''); log(`Started : "${id === 'bcheck' ? 'Behavioral Check Syntax' : 'Simulate Behavioral Model'}".`, 'bold');
          delay(() => {
            sf.forEach((f) => log(`Analyzing Verilog file "${path(f.name)}" into library work`));
            if (id === 'bcheck') {
              const r = V.check(sf, top);
              if (r.errors.length) { fileErrors(r, 'Behavioral Check Syntax'); setStatus('bcheck', 'err'); return; }
              log('Process "Behavioral Check Syntax" completed successfully', 'ok'); setStatus('bcheck', 'ok'); return;
            }
            log(`Running fuse.exe -incremental -lib secureip -o ${top}_isim_beh.exe -prj ${top}_beh.prj work.${top} work.glbl`);
            const r = V.simulate(sf, top, 1000);
            if (r.errors.length) { fileErrors(r, 'Simulate Behavioral Model'); setStatus('simulate', 'err'); return; }
            log('Compiling module glbl'); log(`Compiling module ${top}`); log(`Built simulation executable ${top}_isim_beh.exe`);
            log('Fuse Memory Usage: 29540 KB'); log('Process "Simulate Behavioral Model" completed successfully', 'ok');
            st.sim = { top, endTime: r.endTime, out: r.out, finished: r.finished, signals: r.signals.map((g) => ({ name: g.name, w: g.w, kind: g.kind, hist: g.hist.map((x) => ({ t: x.t, v: x.v })) })) };
            errors = []; setStatus('simulate', 'ok'); save();
            step(10);
            // the stimulus must apply all four input combinations
            const xs = st.sim.signals.filter((g) => !g.name.includes('.') && g.kind === 'reg' && g.w === 1);
            if (xs.length >= 2) {
              const seen = new Set();
              const times = [...new Set(xs.flatMap((g) => g.hist.map((x) => x.t)))];
              times.forEach((t) => seen.add(xs.slice(0, 2).map((g) => valAt(g, t)).join('')));
              if (['00', '01', '10', '11'].every((k) => seen.has(k))) step(9);
            }
            openISim();
          }, 650);
          break;
        }
        default: log(`"${id}" is not needed for this experiment.`, 'warn');
      }
    }
    const valAt = (g, t) => { let v = null; for (const x of g.hist) if (x.t <= t) v = x.v; return v ? V.fmtVal(v) : (g.kind === 'reg' ? 'x' : 'z'); };

    /* ---------- RTL / technology viewers ---------- */
    function openViewer(kind, top) {
      if (kind === 'rtl' && !st.rtlMode) {
        dialog('Set RTL/Tech Viewer Startup Mode', (close) => {
          let mode = 'top';
          return [h('div', { class: 'ise-dlg-body' }, h('p', {}, 'Choose how the viewer starts:'),
            h('label', { class: 'ise-radio block' }, h('input', { type: 'radio', name: 'rtlm', checked: true, onchange: () => (mode = 'top') }), 'Start with a schematic of the top-level block'),
            h('label', { class: 'ise-radio block' }, h('input', { type: 'radio', name: 'rtlm', onchange: () => (mode = 'explorer') }), 'Start with the Explorer Wizard')),
          h('div', { class: 'ise-dlg-btns' }, h('button', { class: 'ise-btn primary', onclick: () => { st.rtlMode = mode; save(); close(); rtlExpanded = false; openTab('rtl:' + top); step(13); } }, 'OK'), h('button', { class: 'ise-btn', onclick: close }, 'Cancel'))];
        });
        return;
      }
      if (kind === 'rtl') { rtlExpanded = false; openTab('rtl:' + top); step(13); } else openTab('tech:' + top);
    }
    function portArrow(x, y, name, dir) {
      const g = s('g', { class: 'rtl-port' });
      g.append(s('path', { d: dir === 'in' ? `M${x - 34} ${y - 7}h24l8 7-8 7h-24z` : `M${x + 2} ${y - 7}h24l8 7-8 7h-24z`, class: 'rtl-port-shape' }),
        s('text', { x: dir === 'in' ? x - 40 : x + 40, y: y + 4, 'text-anchor': dir === 'in' ? 'end' : 'start', class: 'rtl-txt' }, name));
      return g;
    }
    function rtlView(top) {
      const sy = st.synth && st.synth.sy;
      if (!sy) return h('div', { class: 'ise-blank' }, 'Run Synthesize - XST first.');
      const ins = sy.ports.filter((p) => p.dir === 'input'), outs = sy.ports.filter((p) => p.dir !== 'input');
      const svg = s('svg', { class: 'rtl-svg', viewBox: '0 0 760 420' });
      svg.appendChild(s('rect', { x: 0, y: 0, width: 760, height: 420, class: 'rtl-bg' }));
      if (!rtlExpanded) {
        const H = Math.max(ins.length, outs.length) * 40 + 40, x = 300, y = 210 - H / 2;
        const blk = s('g', { class: 'rtl-block', ondblclick: () => { rtlExpanded = true; renderWork(); step(14); } },
          s('rect', { x, y, width: 160, height: H, class: 'rtl-box' }),
          s('text', { x: x + 80, y: y + H + 18, 'text-anchor': 'middle', class: 'rtl-txt b' }, top),
          ins.map((p, i) => [s('line', { x1: x - 30, y1: y + 40 + i * 40, x2: x, y2: y + 40 + i * 40, class: 'rtl-wire' }), s('text', { x: x + 8, y: y + 44 + i * 40, class: 'rtl-txt' }, p.name), portArrow(x - 30, y + 40 + i * 40, p.name, 'in')]),
          outs.map((p, i) => [s('line', { x1: x + 160, y1: y + 40 + i * 40, x2: x + 190, y2: y + 40 + i * 40, class: 'rtl-wire' }), s('text', { x: x + 152, y: y + 44 + i * 40, 'text-anchor': 'end', class: 'rtl-txt' }, p.name), portArrow(x + 190, y + 40 + i * 40, p.name, 'out')]));
        svg.appendChild(blk);
        svg.appendChild(s('text', { x: 380, y: 400, 'text-anchor': 'middle', class: 'rtl-hint' }, 'Double-click the block to see inside it'));
      } else drawInternals(svg, sy, ins, outs);
      const pz = { v: null };
      setTimeout(() => { pz.v = new UI.PanZoom(svg, { x: 0, y: 0, w: 760, h: 420 }, { minW: 150, maxW: 1600 }); }, 0);
      return h('div', { class: 'rtl-wrap' }, h('div', { class: 'rtl-bar' }, rtlExpanded ? h('button', { class: 'ise-btn', onclick: () => { rtlExpanded = false; renderWork(); } }, '\u2191 Up one level') : null,
        h('span', { class: 'ise-small' }, rtlExpanded ? `Inside ${top}` : 'Top-level block')), svg);
    }
    function drawInternals(svg, sy, ins, outs) {
      const driver = {}; sy.cells.forEach((c) => { if (c.out) driver[c.out] = c; });
      const lvl = {};
      const levelOf = (n, d) => { if (d > 30) return 0; if (lvl[n] != null) return lvl[n]; const c = driver[n]; if (!c) return 0; return (lvl[n] = 1 + Math.max(0, ...c.ins.map((x) => levelOf(x, d + 1)))); };
      const cells = sy.cells.filter((c) => c.out);
      cells.forEach((c) => levelOf(c.out, 0));
      const maxL = Math.max(1, ...cells.map((c) => lvl[c.out] || 1));
      const colX = (l) => 120 + (l - 0.5) * (480 / maxL);
      const pos = {};
      ins.forEach((p, i) => (pos[p.name] = { x: 60, y: 70 + i * (300 / Math.max(1, ins.length - 1 || 1)) }));
      const byL = {}; cells.forEach((c) => (byL[lvl[c.out]] = byL[lvl[c.out]] || []).push(c));
      const drawn = [];
      for (const [l, list] of Object.entries(byL)) list.forEach((c, i) => {
        const cx = colX(+l), cy = 90 + i * (260 / Math.max(1, list.length - 1 || 1)) + (list.length === 1 ? 110 : 0);
        drawn.push({ c, cx, cy }); pos[c.out] = { x: cx + 40, y: cy };
      });
      const wires = s('g');
      svg.appendChild(wires);
      // every source net gets its own vertical track in front of the gates
      const srcs = [...new Set(drawn.flatMap((d) => d.c.ins))];
      const fanout = (n) => drawn.filter((d) => d.c.ins.includes(n)).length;
      const outX = 700;
      // gates
      drawn.forEach(({ c, cx, cy }) => {
        const t = c.type, bw = 56, H = 40, x0 = cx - bw / 2 - 12, x1 = x0 + bw;
        let d;
        if (t === 'AND' || t === 'NAND') d = `M${x0} ${cy - H / 2}H${x1 - H / 2}A${H / 2} ${H / 2} 0 0 1 ${x1 - H / 2} ${cy + H / 2}H${x0}Z`;
        else if (t === 'NOT' || t === 'BUF') d = `M${x0} ${cy - 16}L${x1 - 8} ${cy}L${x0} ${cy + 16}Z`;
        else if (['OR', 'NOR', 'XOR', 'XNOR'].includes(t)) d = `M${x0} ${cy - H / 2}Q${x0 + bw * 0.6} ${cy - H / 2} ${x1} ${cy}Q${x0 + bw * 0.6} ${cy + H / 2} ${x0} ${cy + H / 2}Q${x0 + bw * 0.24} ${cy} ${x0} ${cy - H / 2}Z`;
        else d = `M${x0} ${cy - H / 2}h${bw}v${H}h${-bw}z`;
        svg.appendChild(s('path', { d, class: 'rtl-gate' }));
        if (t === 'XOR' || t === 'XNOR') svg.appendChild(s('path', { d: `M${x0 - 6} ${cy - H / 2}Q${x0 + bw * 0.24 - 6} ${cy} ${x0 - 6} ${cy + H / 2}`, class: 'rtl-gate open' }));
        if (['NAND', 'NOR', 'XNOR', 'NOT'].includes(t)) svg.appendChild(s('circle', { cx: x1 + (t === 'NOT' ? -4 : 4), cy, r: 4, class: 'rtl-gate' }));
        svg.appendChild(s('text', { x: cx - 12, y: cy - H / 2 - 6, 'text-anchor': 'middle', class: 'rtl-inst' }, c.inst || `${c.out}_imp`));
        svg.appendChild(s('text', { x: cx - 12, y: cy + H / 2 + 14, 'text-anchor': 'middle', class: 'rtl-txt small' }, t === 'LOGIC' ? c.label : t));
        const n = c.ins.length || 1;
        c.ins.forEach((src, k) => {
          const py = cy + (n === 1 ? 0 : -12 + (24 * k) / (n - 1)), from = pos[src] || { x: 60, y: py };
          const mx = x0 - 24 - srcs.indexOf(src) * 12;
          wires.appendChild(s('path', { d: `M${from.x} ${from.y}H${mx}V${py}H${x0 + (['OR', 'XOR', 'NOR', 'XNOR'].includes(t) ? 6 : 0)}`, class: 'rtl-wire' }));
          if (fanout(src) > 1) wires.appendChild(s('circle', { cx: mx, cy: from.y, r: 3, class: 'rtl-dot' }));
        });
        pos[c.out] = { x: x1 + (['NAND', 'NOR', 'XNOR'].includes(t) ? 8 : 0), y: cy };
      });
      ins.forEach((p) => { svg.appendChild(portArrow(pos[p.name].x, pos[p.name].y, p.name, 'in')); });
      outs.forEach((p, i) => {
        const y = 90 + i * (260 / Math.max(1, outs.length - 1 || 1)) + (outs.length === 1 ? 110 : 0), src = pos[p.name] || { x: outX - 40, y };
        wires.appendChild(s('path', { d: `M${src.x} ${src.y}H${outX - 50}V${y}H${outX}`, class: 'rtl-wire' }));
        svg.appendChild(portArrow(outX, y, p.name, 'out'));
      });
    }
    function techView(top) {
      const sy = st.synth && st.synth.sy;
      if (!sy) return h('div', { class: 'ise-blank' }, 'Run Synthesize - XST first.');
      const svg = s('svg', { class: 'rtl-svg', viewBox: '0 0 760 420' });
      svg.appendChild(s('rect', { x: 0, y: 0, width: 760, height: 420, class: 'rtl-bg' }));
      const ins = sy.ports.filter((p) => p.dir === 'input');
      const iy = (i) => 80 + i * (260 / Math.max(1, ins.length - 1 || 1));
      ins.forEach((p, i) => {
        svg.append(portArrow(60, iy(i), p.name, 'in'), s('path', { d: `M60 ${iy(i)}H110`, class: 'rtl-wire' }),
          s('path', { d: `M110 ${iy(i) - 10}L134 ${iy(i)}L110 ${iy(i) + 10}Z`, class: 'rtl-gate' }), s('text', { x: 122, y: iy(i) - 14, 'text-anchor': 'middle', class: 'rtl-inst' }, `${p.name}_IBUF`));
      });
      sy.luts.forEach((L, k) => {
        const y = 110 + k * (220 / Math.max(1, sy.luts.length - 1 || 1)) + (sy.luts.length === 1 ? 90 : 0);
        svg.append(s('rect', { x: 330, y: y - 30, width: 110, height: 60, class: 'rtl-box lut' }),
          s('text', { x: 385, y: y - 6, 'text-anchor': 'middle', class: 'rtl-txt b' }, `LUT${L.n}`), s('text', { x: 385, y: y + 12, 'text-anchor': 'middle', class: 'rtl-txt small' }, `INIT = ${L.init}`),
          s('text', { x: 385, y: y - 36, 'text-anchor': 'middle', class: 'rtl-inst' }, `${L.out}1`));
        L.ins.forEach((n, j) => { const i = ins.findIndex((p) => p.name === n), py = y - 15 + j * 15; svg.appendChild(s('path', { d: `M134 ${iy(i)}H${270 + j * 10 + k * 4}V${py}H330`, class: 'rtl-wire' })); });
        svg.append(s('path', { d: `M440 ${y}H560`, class: 'rtl-wire' }), s('path', { d: `M560 ${y - 10}L584 ${y}L560 ${y + 10}Z`, class: 'rtl-gate' }),
          s('text', { x: 572, y: y - 14, 'text-anchor': 'middle', class: 'rtl-inst' }, `${L.out}_OBUF`), s('path', { d: `M584 ${y}H640`, class: 'rtl-wire' }), portArrow(640, y, L.out, 'out'));
      });
      setTimeout(() => new UI.PanZoom(svg, { x: 0, y: 0, w: 760, h: 420 }, { minW: 150, maxW: 1600 }), 0);
      return h('div', { class: 'rtl-wrap' }, h('div', { class: 'rtl-bar' }, h('span', { class: 'ise-small' }, `Technology schematic of ${top}: each output maps to one look-up table`)), svg);
    }

    /* ---------- console ---------- */
    function renderConsole() {
      const lines = conTab === 'console' ? consoleLines : (conTab === 'errors' ? errors : warnings).map((t) => ({ t, c: conTab === 'errors' ? 'err' : 'warn' }));
      const box = h('div', { class: 'ise-con-text' }, lines.map((l) => h('div', { class: 'ise-line ' + l.c }, l.t || '\u00a0')));
      UI.fill(con, h('div', { class: 'ise-con-tabs' },
        [['console', 'Console'], ['errors', `Errors${errors.length ? ` (${errors.length})` : ''}`], ['warnings', `Warnings${warnings.length ? ` (${warnings.length})` : ''}`]].map(([k, l]) =>
          h('button', { class: 'ise-con-tab' + (conTab === k ? ' active' : ''), onclick: () => { conTab = k; renderConsole(); } }, k === 'errors' && errors.length ? ico.err() : k === 'warnings' && warnings.length ? ico.warn() : null, l))), box);
      box.scrollTop = box.scrollHeight;
    }

    /* ---------- dialogs ---------- */
    function dialog(title, content, wide) {
      const ov = h('div', { class: 'ise-dlg-ov' });
      const close = () => ov.remove();
      const box = h('div', { class: 'ise-dlg' + (wide ? ' wide' : '') }, h('div', { class: 'ise-dlg-title' }, h('span', {}, title), h('button', { class: 'ise-dlg-x', onclick: close, 'aria-label': 'Close' }, '\u2715')));
      const inner = h('div', { class: 'ise-dlg-inner' });
      box.appendChild(inner);
      ov.appendChild(box); root.appendChild(ov);
      const set = (kids) => UI.fill(inner, kids);
      set(content(close, set));
      return { close, set };
    }
    const field = (label, input) => h('label', { class: 'ise-field' }, h('span', {}, label), input);
    const sel = (opts, val, onchange) => h('select', { class: 'ise-select', onchange: (e) => onchange(e.target.value) }, opts.map((o) => h('option', { value: o, selected: o === val }, o)));

    function newProjectWizard() {
      if (proj()) { log('A project is already open. Use File \u203a Close Project first.', 'warn'); return; }
      const d = { name: 'half_adder', location: 'D:\\Xilinx\\half_adder', desc: '', top: 'HDL', family: 'Spartan3E', device: 'XC3S500E', package: 'FG320', speed: '-4', synth: 'XST (VHDL/Verilog)', sim: 'ISim (VHDL/Verilog)', lang: 'Verilog' };
      dialog('New Project Wizard', (close, set) => {
        const page1 = () => {
          const name = h('input', { class: 'ise-input', value: d.name, oninput: (e) => { d.name = e.target.value.replace(/\W/g, '_'); loc.value = d.location = 'D:\\Xilinx\\' + d.name; } });
          const loc = h('input', { class: 'ise-input', value: d.location, oninput: (e) => (d.location = e.target.value) });
          return [h('div', { class: 'ise-wiz' }, h('div', { class: 'ise-wiz-head' }, h('b', {}, 'Create New Project'), h('span', {}, 'Specify project location and type.')),
            h('div', { class: 'ise-dlg-body' }, h('div', { class: 'ise-group' }, h('div', { class: 'ise-group-t' }, 'Enter a name, locations, and comment for the project'),
              field('Name:', name), field('Location:', loc), field('Working Directory:', h('input', { class: 'ise-input', value: d.location, disabled: true })), field('Description:', h('textarea', { class: 'ise-input', rows: 2, oninput: (e) => (d.desc = e.target.value) }))),
            h('div', { class: 'ise-group' }, h('div', { class: 'ise-group-t' }, 'Select the type of top-level source for the project'), field('Top-level source type:', sel(['HDL', 'Schematic', 'EDIF', 'NGC/NGO'], d.top, (v) => (d.top = v)))))),
          h('div', { class: 'ise-dlg-btns' }, h('button', { class: 'ise-btn' }, 'More Info'), h('span', { class: 'ise-grow' }), h('button', { class: 'ise-btn primary', onclick: () => { if (!d.name) return; if (d.top !== 'HDL') { d.top = 'HDL'; } step(1); set(page2()); } }, 'Next >'), h('button', { class: 'ise-btn', onclick: close }, 'Cancel'))];
        };
        const page2 = () => {
          const fam = () => FAMILIES[d.family];
          const rows = [
            ['Evaluation Development Board', sel(['None Specified'], 'None Specified', () => {})], ['Product Category', sel(['All', 'General Purpose', 'Automotive'], 'All', () => {})],
            ['Family', sel(Object.keys(FAMILIES), d.family, (v) => { d.family = v; d.device = fam().devices[0]; d.package = fam().packages[0]; d.speed = fam().speeds[0]; set(page2()); })],
            ['Device', sel(fam().devices, d.device, (v) => (d.device = v))], ['Package', sel(fam().packages, d.package, (v) => (d.package = v))], ['Speed', sel(fam().speeds, d.speed, (v) => (d.speed = v))],
            ['Top-Level Source Type', sel(['HDL'], 'HDL', () => {})], ['Synthesis Tool', sel(['XST (VHDL/Verilog)'], d.synth, () => {})], ['Simulator', sel(['ISim (VHDL/Verilog)', 'Modelsim-SE Mixed'], d.sim, (v) => (d.sim = v))],
            ['Preferred Language', sel(['Verilog', 'VHDL'], d.lang, (v) => (d.lang = v))], ['Property Specification in Project File', sel(['Store all values', 'Store non-default values only'], 'Store all values', () => {})],
            ['Manual Compile Order', h('input', { type: 'checkbox' })], ['VHDL Source Analysis Standard', sel(['VHDL-93', 'VHDL-200X'], 'VHDL-93', () => {})], ['Enable Message Filtering', h('input', { type: 'checkbox' })],
          ];
          return [h('div', { class: 'ise-wiz' }, h('div', { class: 'ise-wiz-head' }, h('b', {}, 'Project Settings'), h('span', {}, 'Specify device and project properties.')),
            h('div', { class: 'ise-dlg-body' }, h('div', { class: 'ise-group-t' }, 'Select the device and design flow for the project'),
              h('table', { class: 'ise-props' }, h('tr', {}, h('th', {}, 'Property Name'), h('th', {}, 'Value')), rows.map(([k, v]) => h('tr', {}, h('td', {}, k), h('td', {}, v)))))),
          h('div', { class: 'ise-dlg-btns' }, h('button', { class: 'ise-btn' }, 'More Info'), h('span', { class: 'ise-grow' }), h('button', { class: 'ise-btn', onclick: () => set(page1()) }, '< Back'),
            h('button', { class: 'ise-btn primary', onclick: () => { if (d.lang !== 'Verilog') { log('Preferred Language should be Verilog for this experiment.', 'warn'); } step(2); set(page3()); } }, 'Next >'), h('button', { class: 'ise-btn', onclick: close }, 'Cancel'))];
        };
        const page3 = () => [h('div', { class: 'ise-wiz' }, h('div', { class: 'ise-wiz-head' }, h('b', {}, 'Project Summary'), h('span', {}, 'Project Navigator will create a new project with the following specifications.')),
          h('pre', { class: 'ise-sum' }, `Project:\n   Project Name: ${d.name}\n   Project Path: ${d.location}\n   Working Directory: ${d.location}\n   Description: ${d.desc}\n   Top Level Source Type: HDL\n\nDevice:\n   Device Family: ${d.family}\n   Device: ${d.device.toLowerCase()}\n   Package: ${d.package.toLowerCase()}\n   Speed: ${d.speed}\n   Top-Level Source Type: HDL\n   Synthesis Tool: XST (VHDL/Verilog)\n   Simulator: ${d.sim}\n   Preferred Language: ${d.lang}\n   Property Specification in Project File: Store all values\n   Manual Compile Order: false\n   VHDL Source Analysis Standard: VHDL-93\n   Message Filtering: disabled`)),
        h('div', { class: 'ise-dlg-btns' }, h('button', { class: 'ise-btn' }, 'More Info'), h('span', { class: 'ise-grow' }), h('button', { class: 'ise-btn', onclick: () => set(page2()) }, '< Back'),
          h('button', { class: 'ise-btn primary', onclick: () => { st.project = { name: d.name, location: d.location, family: d.family, device: d.device, package: d.package, speed: d.speed, lang: d.lang }; st.view = 'impl'; st.tabs = ['summary']; st.active = 'summary'; save(); close(); log(`Project "${d.name}" created in ${d.location}.`); step(3); renderAllISE(); } }, 'Finish'), h('button', { class: 'ise-btn', onclick: close }, 'Cancel'))];
        return page1();
      }, true);
    }

    function newSourceWizard() {
      if (!proj()) return;
      const TYPES = ['IP (CORE Generator & Architecture Wizard)', 'Schematic', 'User Document', 'Verilog Module', 'Verilog Test Fixture', 'VHDL Module', 'VHDL Library', 'VHDL Package', 'VHDL Test Bench', 'Embedded Processor'];
      const d = { type: 'Verilog Module', file: modFiles().length ? 'half_adder_tb' : 'half_adder', add: true, ports: [{ name: 'x', dir: 'input' }, { name: 'y', dir: 'input' }, { name: 's', dir: 'output' }, { name: 'c', dir: 'output' }, {}, {}, {}, {}].map((p) => Object.assign({ name: '', dir: 'input', bus: false, msb: '', lsb: '' }, p)), assoc: null };
      if (modFiles().length && !tbFiles().length) d.type = 'Verilog Test Fixture';
      dialog('New Source Wizard', (close, set) => {
        const page1 = () => {
          const fileIn = h('input', { class: 'ise-input', value: d.file, oninput: (e) => (d.file = e.target.value.replace(/\.v$/, '').replace(/\W/g, '_')) });
          return [h('div', { class: 'ise-wiz' }, h('div', { class: 'ise-wiz-head' }, h('b', {}, 'Select Source Type'), h('span', {}, 'Select source type, file name and its location.')),
            h('div', { class: 'ise-dlg-body two' },
              h('div', { class: 'ise-typelist' }, TYPES.map((t) => h('div', { class: 'ise-type' + (d.type === t ? ' sel' : '') + (/Verilog/.test(t) ? '' : ' dim'), onclick: () => { d.type = t; if (t === 'Verilog Test Fixture' && d.file === 'half_adder') d.file = 'half_adder_tb'; if (t === 'Verilog Module' && d.file === 'half_adder_tb') d.file = 'half_adder'; set(page1()); } }, ico.v(), t))),
              h('div', {}, field('File name:', fileIn), field('Location:', h('input', { class: 'ise-input', value: proj().location, disabled: true })),
                h('label', { class: 'ise-radio block' }, h('input', { type: 'checkbox', checked: d.add, onchange: (e) => (d.add = e.target.checked) }), 'Add to project')))),
          h('div', { class: 'ise-dlg-btns' }, h('button', { class: 'ise-btn' }, 'More Info'), h('span', { class: 'ise-grow' }),
            h('button', { class: 'ise-btn primary', onclick: () => {
              if (!/Verilog (Module|Test Fixture)/.test(d.type)) { log(`"${d.type}" sources are not available in this simulated ISE \u2014 use a Verilog Module or Verilog Test Fixture.`, 'warn'); return; }
              if (!d.file) return;
              if (fileByName(d.file + '.v')) { log(`A source named ${d.file}.v already exists in the project.`, 'err'); return; }
              if (d.type === 'Verilog Module') { step(4); set(pageDefine()); } else { if (!modFiles().length) { log('Add the Verilog Module first \u2014 a test fixture must be associated with a design source.', 'warn'); return; } set(pageAssoc()); }
            } }, 'Next >'), h('button', { class: 'ise-btn', onclick: close }, 'Cancel'))];
        };
        const pageDefine = () => [h('div', { class: 'ise-wiz' }, h('div', { class: 'ise-wiz-head' }, h('b', {}, 'Define Module'), h('span', {}, 'Specify ports for module.')),
          h('div', { class: 'ise-dlg-body' }, field('Module name', h('input', { class: 'ise-input', value: d.file, disabled: true })),
            h('table', { class: 'ise-ports' }, h('tr', {}, h('th', {}, 'Port Name'), h('th', {}, 'Direction'), h('th', {}, 'Bus'), h('th', {}, 'MSB'), h('th', {}, 'LSB')),
              d.ports.map((p) => h('tr', {}, h('td', {}, h('input', { class: 'ise-input cell', value: p.name, oninput: (e) => (p.name = e.target.value.replace(/\W/g, '')) })),
                h('td', {}, sel(['input', 'output', 'inout'], p.dir, (v) => (p.dir = v))), h('td', {}, h('input', { type: 'checkbox', checked: p.bus, onchange: (e) => (p.bus = e.target.checked) })),
                h('td', {}, h('input', { class: 'ise-input cell n', value: p.msb, oninput: (e) => (p.msb = e.target.value) })), h('td', {}, h('input', { class: 'ise-input cell n', value: p.lsb, oninput: (e) => (p.lsb = e.target.value) }))))))),
        h('div', { class: 'ise-dlg-btns' }, h('button', { class: 'ise-btn' }, 'More Info'), h('span', { class: 'ise-grow' }), h('button', { class: 'ise-btn', onclick: () => set(page1()) }, '< Back'),
          h('button', { class: 'ise-btn primary', onclick: () => { const named = d.ports.filter((p) => p.name); if (named.some((p) => p.dir === 'input') && named.some((p) => p.dir === 'output')) step(5); set(pageSummary()); } }, 'Next >'), h('button', { class: 'ise-btn', onclick: close }, 'Cancel'))];
        const pageAssoc = () => {
          const mods = parsedModules(modFiles()).map((m) => m.name);
          d.assoc = d.assoc || mods[0];
          return [h('div', { class: 'ise-wiz' }, h('div', { class: 'ise-wiz-head' }, h('b', {}, 'Associate Source'), h('span', {}, 'Select a source with which to associate the new source.')),
            h('div', { class: 'ise-dlg-body' }, h('div', { class: 'ise-typelist' }, mods.map((m) => h('div', { class: 'ise-type' + (d.assoc === m ? ' sel' : ''), onclick: () => { d.assoc = m; set(pageAssoc()); } }, ico.top(), m))))),
          h('div', { class: 'ise-dlg-btns' }, h('button', { class: 'ise-btn' }, 'More Info'), h('span', { class: 'ise-grow' }), h('button', { class: 'ise-btn', onclick: () => set(page1()) }, '< Back'),
            h('button', { class: 'ise-btn primary', onclick: () => { if (d.assoc) { step(8); set(pageSummary()); } } }, 'Next >'), h('button', { class: 'ise-btn', onclick: close }, 'Cancel'))];
        };
        const pageSummary = () => [h('div', { class: 'ise-wiz' }, h('div', { class: 'ise-wiz-head' }, h('b', {}, 'Summary'), h('span', {}, 'Project Navigator will create a new skeleton source with the following specifications.')),
          h('pre', { class: 'ise-sum' }, `Add to Project: ${d.add ? 'Yes' : 'No'}\nSource Directory: ${proj().location}\nSource Type: ${d.type}\nSource Name: ${d.file}.v\n\n${d.type === 'Verilog Module' ? `Module name: ${d.file}\nPort Definitions:\n${d.ports.filter((p) => p.name).map((p) => `    ${p.name.padEnd(12)}Pin   ${p.dir}`).join('\n')}` : `Association: ${d.assoc}`}`)),
        h('div', { class: 'ise-dlg-btns' }, h('button', { class: 'ise-btn' }, 'More Info'), h('span', { class: 'ise-grow' }), h('button', { class: 'ise-btn', onclick: () => set(d.type === 'Verilog Module' ? pageDefine() : pageAssoc()) }, '< Back'),
          h('button', { class: 'ise-btn primary', onclick: () => {
            let text, kind;
            if (d.type === 'Verilog Module') { text = moduleTemplate(d.file, d.ports.map((p) => Object.assign({}, p))); kind = 'module'; }
            else {
              const m = parsedModules(modFiles()).find((x) => x.name === d.assoc);
              const ports = m ? m.ports.map((pn) => { const dd = m.decls.find((x) => x.k === 'port' && x.name === pn); return { name: pn, dir: dd ? dd.dir : 'input', w: dd && dd.range ? Math.abs(dd.range.msb.val.v - dd.range.lsb.val.v) + 1 : 1 }; }) : [];
              text = tbTemplate(d.file, d.assoc, ports, proj()); kind = 'tb';
            }
            st.files.push({ name: d.file + '.v', text, kind });
            save(); close(); log(`Created "${path(d.file + '.v')}".`);
            if (kind === 'tb') { st.view = 'sim'; }
            renderAllISE(); openTab(d.file + '.v');
          } }, 'Finish'), h('button', { class: 'ise-btn', onclick: close }, 'Cancel'))];
        return page1();
      }, true);
    }
    function closeProject() {
      UI.confirm('Close project?', 'This closes and deletes the simulated project so you can start again from the New Project Wizard.', 'Close project', () => { api.reset(true); });
    }

    /* ---------- ISim ---------- */
    function openISim() {
      const sim = st.sim; if (!sim) return;
      const top = sim.signals.filter((g) => !g.name.includes('.'));
      let t0 = Math.max(0, sim.endTime - 10), t1 = sim.endTime, cursor = null, inst = sim.top;
      const ov = h('div', { class: 'isim' });
      const wave = h('div', { class: 'isim-wave' });
      const objs = h('div', { class: 'isim-objs' });
      const close = () => ov.remove();
      const sigsOf = () => (inst === sim.top ? top : sim.signals.filter((g) => g.name.startsWith(inst + '.') && g.name.split('.').length === inst.split('.').length + 1));
      const valStr = (g, t) => { let v = null; for (const x of g.hist) if (x.t <= t) v = x.v; if (!v) return g.kind === 'reg' ? (g.w > 1 ? 'X'.repeat(1) : 'X') : 'Z'; return g.w > 1 ? V.fmtVal(v, 'b') : V.fmtVal(v).toUpperCase(); };
      function drawWave() {
        const sigs = sigsOf();
        const W = 640, rowH = 28, H = sigs.length * rowH + 34, span = t1 - t0 || 1;
        const X = (t) => ((t - t0) / span) * W;
        const svg = s('svg', { class: 'isim-svg', viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'none', style: `height:${H}px`, onclick: (e) => { const r = svg.getBoundingClientRect(); cursor = t0 + ((e.clientX - r.left) / r.width) * span; drawWave(); } });
        svg.appendChild(s('rect', { x: 0, y: 0, width: W, height: H, class: 'isim-bg' }));
        // time ruler
        const steps = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000];
        const tick = steps.find((x) => span / x <= 8) || 10000;
        for (let t = Math.ceil(t0 / tick) * tick; t <= t1; t += tick) { svg.append(s('line', { x1: X(t), y1: 0, x2: X(t), y2: H, class: 'isim-grid' }), s('text', { x: X(t) + 2, y: 12, class: 'isim-time' }, `${t} ns`)); }
        sigs.forEach((g, i) => {
          const y = 22 + i * rowH, hi = y + 4, lo = y + rowH - 6;
          let d = '', last = null;
          const pts = [{ t: t0, v: null }];
          for (const x of g.hist) { if (x.t <= t0) pts[0].v = x.v; else if (x.t < t1) pts.push(x); }
          pts.push({ t: t1, v: null, end: true });
          if (g.w === 1) {
            for (let k = 0; k < pts.length - 1; k++) {
              const v = pts[k].v || last, xa = X(pts[k].t), xb = X(pts[k + 1].t);
              last = v;
              const known = v && !v.x, yy = !v ? (y + rowH / 2) : v.x ? (y + rowH / 2) : v.v ? hi : lo;
              const cls = !v || (v.x && v.z) ? 'z' : v.x ? 'x' : '';
              if (cls === 'x') svg.appendChild(s('rect', { x: xa, y: hi, width: xb - xa, height: lo - hi, class: 'isim-x' }));
              svg.appendChild(s('path', { d: `M${xa} ${yy}H${xb}`, class: 'isim-sig ' + cls }));
              if (k + 1 < pts.length - 1) { const nv = pts[k + 1].v; const ny = !nv || nv.x ? y + rowH / 2 : nv.v ? hi : lo; svg.appendChild(s('path', { d: `M${xb} ${yy}V${ny}`, class: 'isim-sig' })); }
              void known; void d;
            }
          } else {
            for (let k = 0; k < pts.length - 1; k++) {
              const v = pts[k].v || last, xa = X(pts[k].t), xb = X(pts[k + 1].t); last = v;
              svg.append(s('path', { d: `M${xa + 3} ${hi}H${xb - 3}L${xb} ${(hi + lo) / 2}L${xb - 3} ${lo}H${xa + 3}L${xa} ${(hi + lo) / 2}Z`, class: 'isim-bus' + (!v || v.x ? ' x' : '') }));
              if (xb - xa > 30) svg.appendChild(s('text', { x: xa + 6, y: (hi + lo) / 2 + 4, class: 'isim-busv' }, v ? V.fmtVal(v, 'h') : 'X'));
            }
          }
        });
        if (cursor != null) svg.append(s('line', { x1: X(cursor), y1: 0, x2: X(cursor), y2: H, class: 'isim-cursor' }), s('text', { x: X(cursor) + 3, y: H - 4, class: 'isim-ctime' }, `${cursor.toFixed(3)} ns`));
        const names = h('div', { class: 'isim-names' }, h('div', { class: 'isim-nh' }, h('span', {}, 'Name'), h('span', {}, 'Value')),
          sigs.map((g) => h('div', { class: 'isim-nrow' }, h('span', {}, h('i', { class: 'isim-sigicon' + (g.w > 1 ? ' bus' : '') }), g.name.split('.').pop() + (g.w > 1 ? `[${g.w - 1}:0]` : '')), h('span', { class: 'isim-val' }, valStr(g, cursor != null ? cursor : t1)))));
        UI.fill(wave, names, h('div', { class: 'isim-canvas' }, svg));
        UI.fill(objs, h('div', { class: 'isim-ph' }, 'Objects'), h('div', { class: 'isim-oh' }, h('span', {}, 'Object Name'), h('span', {}, 'Value')),
          sigs.map((g) => h('div', { class: 'isim-orow' }, h('span', {}, g.name.split('.').pop()), h('span', {}, valStr(g, cursor != null ? cursor : t1)))));
      }
      const zoom = (f) => { const c = cursor != null ? cursor : (t0 + t1) / 2, span = Math.max(1, Math.min(sim.endTime, (t1 - t0) * f)); t0 = Math.max(0, c - span / 2); t1 = Math.min(sim.endTime, t0 + span); t0 = Math.max(0, t1 - span); drawWave(); };
      const full = () => { t0 = 0; t1 = sim.endTime; drawWave(); step(11); };
      const instTree = h('div', { class: 'isim-tree' },
        h('div', { class: 'isim-node' + (inst === sim.top ? ' sel' : ''), onclick: () => { inst = sim.top; drawWave(); } }, ico.top(), sim.top),
        [...new Set(sim.signals.filter((g) => g.name.includes('.')).map((g) => g.name.split('.')[0]))].map((i) => h('div', { class: 'isim-node sub', onclick: () => { inst = i; drawWave(); } }, ico.v(), i)),
        h('div', { class: 'isim-node sub dim' }, ico.v(), 'glbl'));
      const conLines = [`ISim ${VER} (signature 0x7708f090)`, 'This is a Full version of ISim.', 'Time resolution is 1 ps', 'Simulator is doing circuit initialization process.', 'Finished circuit initialization process.', ...sim.out, sim.finished ? `Stopped at time : ${sim.finished.time} ns : File "${path(tbFiles()[0] ? tbFiles()[0].name : '')}"` : '', 'ISim>'];
      ov.append(
        h('div', { class: 'ise-title isim-title' }, h('span', { class: 'ise-logo' }, s('svg', { viewBox: '0 0 16 16' }, s('path', { d: 'M2 12h2l2-7 2 9 2-9 2 7h2', fill: 'none', stroke: '#1d5fbf', 'stroke-width': 1.6 }))),
          h('span', { class: 'ise-title-text' }, `ISim (${VER}) - [Default.wcfg]`), h('span', { class: 'ise-winbtns' }, h('i', {}, '\u2013'), h('i', {}, '\u25a1'), h('i', { class: 'x', onclick: close, title: 'Close ISim' }, '\u2715'))),
        h('div', { class: 'ise-menu static' }, ['File', 'Edit', 'View', 'Simulation', 'Window', 'Layout', 'Help'].map((m) => h('span', { class: 'ise-mtop' }, m))),
        h('div', { class: 'ise-toolbar' },
          tb('Restart', 'M3 3v10M13 3L6 8l7 5z', () => { cursor = 0; full(); }), tb('Run All', 'M3 3l6 5-6 5zM9 3l6 5-6 5z', full), h('span', { class: 'isim-runfor' }, '1.00us'), tb('Run for the time specified', 'M4 3l8 5-8 5z', full),
          h('span', { class: 'ise-tsep' }),
          tb('Zoom In', 'M7 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM10 10l4 4M5 7h4M7 5v4', () => zoom(0.5)), tb('Zoom Out', 'M7 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM10 10l4 4M5 7h4', () => zoom(2)),
          h('button', { class: 'ise-tb wide', title: 'Zoom to Full View', onclick: full }, s('svg', { viewBox: '0 0 16 16' }, s('path', { d: 'M2 5V2h3M14 5V2h-3M2 11v3h3M14 11v3h-3', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.3 })), h('span', {}, 'Zoom to Full View')),
          tb('Go to Time 0', 'M3 3v10M13 3L6 8l7 5z', () => { cursor = 0; drawWave(); }), tb('Go to Latest Time', 'M13 3v10M3 3l7 5-7 5z', () => { cursor = sim.endTime; drawWave(); })),
        h('div', { class: 'isim-body' },
          h('div', { class: 'isim-left' }, h('div', { class: 'isim-ph' }, 'Instances and Processes'), instTree, objs),
          wave),
        h('div', { class: 'ise-console isim-con' }, h('div', { class: 'ise-con-tabs' }, h('button', { class: 'ise-con-tab active' }, 'Console')), h('div', { class: 'ise-con-text' }, conLines.map((l) => h('div', { class: 'ise-line' }, l || '\u00a0')))));
      root.appendChild(ov);
      drawWave();
    }

    /* ---------- side cards for the app shell ---------- */
    const api = {};
    api.stepsCard = () => h('div', { class: 'dsd-card' },
      h('div', { class: 'dsd-card-head' }, h('h3', {}, 'Procedure'), h('span', { class: 'dsd-pill ' + (STEPS.every(([k]) => st.steps[k]) ? 'good' : '') }, `${STEPS.filter(([k]) => st.steps[k]).length}/14`)),
      h('p', { class: 'dsd-tip' }, 'Steps tick off as you do them in ISE. Each matches a figure in the manual\u2019s screenshot index.'),
      h('ol', { class: 'ise-steps' }, STEPS.map(([n, t]) => h('li', { class: st.steps[n] ? 'done' : '' }, h('span', { class: 'ms-dot' }, st.steps[n] ? UI.icon('check') : n), h('div', {}, h('b', {}, `Fig. ${n}`), h('small', {}, t))))),
      h('div', { class: 'ise-code-ref' }, h('div', { class: 'dsd-card-head' }, h('h3', {}, 'Manual code')),
        h('pre', { class: 'code-sample' }, MANUAL_HA.trim()), h('p', { class: 'dsd-tip' }, 'Stimulus for the test fixture\u2019s initial block:'), h('pre', { class: 'code-sample' }, MANUAL_TB_STIM.replace(/\t/g, '  '))));
    api.obsCard = () => {
      const rows = [[0, 0, '0 \u2013 100'], [0, 1, '100 \u2013 200'], [1, 0, '200 \u2013 300'], [1, 1, '300 \u2013 400']];
      const tbl = P.tables.hdl = P.tables.hdl || { done: 0, complete: false };
      const sig = (n) => st.sim && st.sim.signals.find((g) => g.name === n);
      const simVal = (n, t) => { const g = sig(n); if (!g) return null; let v = null; for (const x of g.hist) if (x.t <= t) v = x.v; return v && !v.x ? v.v : null; };
      const cellBtn = (i, k) => {
        const v = (st.obs[i] || {})[k];
        const checked = tbl.checked && tbl.checked[i] && tbl.checked[i][k];
        return h('td', {}, h('button', { class: 'obs-cyc ' + (checked === true ? 'ok' : checked === false ? 'bad' : ''), title: 'Click to enter 0 / 1 read from the waveform', onclick: () => {
          st.obs[i] = st.obs[i] || {}; st.obs[i][k] = v === undefined ? 0 : v === 0 ? 1 : undefined; tbl.checked = null; save(); ctx.refresh();
        } }, v === undefined ? '\u2014' : v));
      };
      const check = () => {
        if (!st.sim) { UI.toast('Run Simulate Behavioral Model first — read the values off the ISim waveform.', 'warn'); return; }
        let ok = 0; tbl.checked = {};
        rows.forEach((r, i) => {
          tbl.checked[i] = {};
          ['s', 'c'].forEach((k) => { const want = simVal(k, i * 100 + 50); const got = (st.obs[i] || {})[k]; const good = got !== undefined && got === want; tbl.checked[i][k] = good; if (good) ok++; });
        });
        tbl.done = rows.filter((_, i) => tbl.checked[i].s && tbl.checked[i].c).length;
        tbl.complete = tbl.done === 4;
        save();
        if (tbl.complete) ctx.mark('tables', 'Observation table matches the simulation waveform');
        else UI.toast(`${ok} of 8 values match the waveform.`, 'warn');
        ctx.refresh();
      };
      // [{ id, title, badge, cls, body }] — rendered as pills by the app shell
      return [{ id: 'ise-obs', title: 'Observation \u00b7 waveform', badge: `${tbl.done || 0}/4`, cls: tbl.complete ? 'good' : '', body: [
        h('p', { class: 'dsd-tip' }, 'Read Sum and Carry from the ISim waveform for each 100 ns interval, then check.'),
        h('div', { class: 'obs-scroll' }, h('table', { class: 'obs-table' },
          h('thead', {}, h('tr', {}, h('th', {}, 'S.No.'), h('th', {}, 'Time (ns)'), h('th', {}, 'x'), h('th', {}, 'y'), h('th', { class: 'out' }, 'Sum (s)'), h('th', { class: 'out' }, 'Carry (c)'))),
          h('tbody', {}, rows.map((r, i) => h('tr', {}, h('td', {}, i + 1), h('td', {}, r[2]), h('td', {}, r[0]), h('td', {}, r[1]), cellBtn(i, 's'), cellBtn(i, 'c')))))),
        h('div', { class: 'obs-foot' }, h('button', { class: 'dsd-btn primary small', onclick: check }, UI.icon('check'), 'Check against waveform'))] },
      { id: 'ise-figs', title: 'Screenshot index', badge: `${STEPS.filter(([k]) => st.steps[k]).length}/14`, cls: STEPS.every(([k]) => st.steps[k]) ? 'good' : '',
        body: h('table', { class: 'io-table' }, h('tbody', {}, STEPS.map(([n, t]) => h('tr', {}, h('td', { class: 'io-fig' }, n), h('td', { class: 'io-note' }, t), h('td', {}, st.steps[n] ? h('span', { class: 'fig-done' }, UI.icon('check')) : null))))) }];
    };
    api.reset = (silent) => {
      const go = () => { Object.assign(st, { project: null, files: [], steps: {}, view: 'impl', obs: {}, statuses: {}, tabs: ['summary'], active: 'summary', synth: null, sim: null, rtlMode: null }); P.tables.hdl = { done: 0, complete: false }; consoleLines = [{ t: 'Project closed. Start with File \u203a New Project\u2026', c: '' }]; errors = []; warnings = []; save(); renderAllISE(); ctx.refresh(); };
      if (silent) go(); else UI.confirm('Reset the ISE project?', 'Your project, Verilog files and ticked steps for this experiment will be cleared.', 'Reset', go);
    };
    api.destroy = () => { document.removeEventListener('click', onDocClick); root.remove(); };
    function renderAllISE() { renderTitle(); renderMenu(); renderTools(); renderDesign(); renderProcs(); renderWork(); renderConsole(); UI.fill(statusbar, h('span', {}, proj() ? `${proj().device}${proj().speed} ${proj().package}` : 'Ready')); }
    renderAllISE();
    return api;
  };
})();
