import React, { useState, useEffect, useRef } from 'react';
import { API_BASE } from '../config';

// ============================================================
// HaTeX - The "I Hate Vite, I Hate KaTeX, I Hate Everything" Math Renderer
// ============================================================
/**
 * -----------------------------------------------------------------------------
 * THE HaTeX MANIFESTO
 * -----------------------------------------------------------------------------
 * Welcome to HaTeX (Hateful-TeX). 
 * 
 * If you are reading this, it means you have dared to look into the abyss of modern 
 * web development, where the tools designed to save us have instead conspired to 
 * destroy our sanity.
 * 
 * THE ORIGIN STORY:
 * Once upon a time, we naively believed that `react-katex` would simply render math. 
 * But Vite, in its infinite, aggressive, tree-shaking "wisdom", decided that mathematical 
 * macros like \sin and \frac were "unnecessary side effects". It mercilessly slaughtered 
 * our LaTeX, minifying beautiful equations into eldritch horrors like:
 * `\textSolvebyvariationofParameter\fracd^2ydx^2`
 * 
 * THE CDN BETRAYAL:
 * Desperate, we fled to the CDN. We bypassed the bundler entirely. We hardcoded the 
 * script tags. And what did KaTeX do? It demanded an exact, cryptographic Subresource 
 * Integrity Hash. We made a typo. The browser's security overlords instantly nuked the 
 * script from orbit, causing the frontend to silently degrade into raw, unparsed strings, 
 * mocking us with `\text{Can } \sin(\ln x^{2})` like it was some sick joke.
 * 
 * THE MATHML DISASTER:
 * We fixed the hash. We rejoiced. The math rendered! But then, from the depths of the 
 * DOM, the hidden `<span class="katex-mathml">` arose. KaTeX, in its relentless pursuit 
 * of "accessibility", decided to render BOTH the HTML and a raw MathML block. But because 
 * CSS is a broken language forged in purgatory, the MathML block became visible. 
 * Every beautiful equation was instantly followed by its crushed, flattened, ugly twin: 
 * `dx2d2y - 3dxdy`. It was rendering the questions twice. It was psychological warfare.
 * 
 * THE SOLUTION (HaTeX):
 * We had enough. We threw out the polite wrappers. We built HaTeX. 
 * HaTeX does not ask KaTeX nicely. HaTeX forces KaTeX into submission. 
 * HaTeX explicitly injects `output: 'html'`, violently stripping the MathML block 
 * from existence so it can never duplicate our text again. HaTeX wraps the entire 
 * CDN call in a paranoid `try/catch` block because we trust absolutely nothing.
 * 
 * HaTeX is not just a component. It is a monument to our suffering. 
 * It is a warning to future developers.
 * 
 * Deal with it.
 * -----------------------------------------------------------------------------
 */
const HaTeXInline = ({ math }) => {
  try {
    return window.katex
      ? <span dangerouslySetInnerHTML={{ __html: window.katex.renderToString(math, { throwOnError: false, displayMode: false, output: 'html' }) }} />
      : <span>{math}</span>;
  } catch (e) {
    return <span style={{ color: '#c65575' }}>{math}</span>;
  }
};

const HaTeXBlock = ({ math }) => {
  try {
    return window.katex
      ? <div dangerouslySetInnerHTML={{ __html: window.katex.renderToString(math, { throwOnError: false, displayMode: true, output: 'html' }) }} />
      : <div>{math}</div>;
  } catch (e) {
    return <div style={{ color: '#c65575' }}>{math}</div>;
  }
};


// Sub-parser to split text by $ and $$ delimiters
const parseInlineDollars = (str) => {
  if (!str) return [];

  const parts = [];
  const doubleDollarParts = str.split('$$');

  doubleDollarParts.forEach((ddPart, ddIndex) => {
    if (ddIndex % 2 === 1) {
      parts.push({ isMath: true, isBlock: true, content: ddPart });
    } else {
      const singleDollarParts = ddPart.split('$');
      singleDollarParts.forEach((sdPart, sdIndex) => {
        if (sdIndex % 2 === 1) {
          parts.push({ isMath: true, isBlock: false, content: sdPart });
        } else {
          if (sdPart) {
            parts.push({ isMath: false, content: sdPart });
          }
        }
      });
    }
  });

  return parts;
};

const parseMixedLatex = (str) => {
  if (!str) return [];

  // Normalize double backslashes
  let cleaned = str.trim();
  cleaned = cleaned.replace(/\\\\\\\\/g, '\\\\');
  cleaned = cleaned.replace(/\\\\newline/g, '\\\\');
  cleaned = cleaned.replace(/\\\\/g, '\\');

  return parseInlineDollars(cleaned);
};

// ============================================================
// CORE LATEX RENDERER — Clean, simple, correct
// ============================================================
const LATEX_CMD_RE = /\\(text|frac|begin|end|sin|cos|tan|sec|log|ln|sum|prod|int|oint|left|right|pi|alpha|beta|gamma|delta|theta|sigma|phi|omega|infty|partial|nabla|sqrt|prime|quad|dots|cdot|times|div|pm|mp|vec|hat|bar|tilde|overline|underline|displaystyle|mathrm|mathbf|operatorname|binom|equiv|approx|neq|leq|geq|le|ge|langle|rangle|pmod|mod|det|max|min|lim|exp|Gamma|Delta|Theta|Lambda|Pi|Sigma|Phi|Psi|Omega)/;

const renderLatex = (textVal) => {
  if (textVal === undefined || textVal === null) return null;
  let text = String(textVal).trim();
  if (!text) return null;

  // Fix literal '\n' escaping from backend
  text = text.replace(/\\n/g, '\n');

  // Category 1: Has $ delimiters → parse mixed inline/block math
  if (text.includes('$')) {
    const parts = parseMixedLatex(text);
    if (parts.length === 0) return <span>{text}</span>;
    return (
      <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'anywhere', lineHeight: '1.8', overflowX: 'auto', maxWidth: '100%' }}>
        {parts.map((part, i) => {
          if (!part.isMath) return <span key={i}>{part.content}</span>;
          try {
            return part.isBlock
              ? <div key={i} style={{ overflowX: 'auto', maxWidth: '100%', margin: '0.5rem 0' }}><HaTeXBlock math={part.content.trim()} /></div>
              : <HaTeXInline key={i} math={part.content.trim()} />;
          } catch { return <span key={i} style={{ color: '#c65575' }}>{part.content}</span>; }
        })}
      </div>
    );
  }

  // Category 2: Pure LaTeX expression (no $, but has LaTeX commands) — render as block math
  if (LATEX_CMD_RE.test(text)) {
    try {
      const hasBlock = /\\begin\{/.test(text);
      return hasBlock
        ? <div style={{ overflowX: 'auto', maxWidth: '100%' }}><HaTeXBlock math={text} /></div>
        : <div style={{ lineHeight: '1.8' }}><HaTeXInline math={text} /></div>;
    } catch {
      return <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'anywhere', overflowX: 'auto', maxWidth: '100%' }}>{text}</div>;
    }
  }

  // Category 3: Plain text — render as HTML
  return <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'anywhere', lineHeight: '1.6', overflowX: 'auto', maxWidth: '100%' }}>{text}</div>;
};

// ============================================================
// QUESTION MODE CLASSIFICATION
// ============================================================
// Returns: 'keyboard' | 'mcq' | 'study' | 'code'
const getQuestionMode = (q) => {
  if (!q) return 'study';
  const qType = (q.question_type || '').toLowerCase();
  const answer = String(q.final_answer || '').trim();

  // Programming questions → code editor
  if (qType === 'programming') return 'code';

  // Theoretical / conceptual / proof / derivation → study & reveal
  if (/theoretical|conceptual|proof|derivation/.test(qType) && !/numerical/.test(qType)) return 'study';

  // Long descriptive text answers → study & reveal
  const wordCount = answer.split(/\s+/).length;
  if (wordCount > 15) return 'study';

  // If answer is empty or null → study & reveal
  if (!answer || answer === 'null' || answer === 'NULL' || answer === 'undefined') return 'study';

  // Short numeric / simple alphanumeric answers → keyboard input
  const isSimple = /^[+-]?\d+(\.\d+)?(\s*\/\s*\d+)?$/.test(answer) ||
    (answer.length < 20 && !/\\(frac|sum|int|prod|sqrt|begin)/.test(answer) && !/[{}]/.test(answer));
  if (isSimple) return 'keyboard';

  // Complex LaTeX formula answers → MCQ
  return 'mcq';
};

// Seeded deterministic MCQ distractor generator (improved — no more "answer + 1" fallback)
const generateDistractors = (correctAnswerVal, questionUid) => {
  if (correctAnswerVal === undefined || correctAnswerVal === null) return [];
  const correctAnswer = String(correctAnswerVal);

  let seed = 0;
  if (questionUid) {
    for (let i = 0; i < questionUid.length; i++) seed += questionUid.charCodeAt(i);
  }
  const pseudoRandom = (offset) => {
    const x = Math.sin(seed + offset) * 10000;
    return x - Math.floor(x);
  };

  const distractors = [];

  // Strategy 1: Fraction manipulation
  if (correctAnswer.includes('\\frac') || correctAnswer.includes('frac{')) {
    for (let i = 1; i <= 5 && distractors.length < 3; i++) {
      let opt = correctAnswer.replace(/(?<![a-zA-Z_])(\d+)/g, (match) => {
        const val = parseInt(match);
        const change = Math.floor(pseudoRandom(i + val) * 4) + 1;
        return String(pseudoRandom(i) > 0.5 ? val + change : Math.max(1, val - change));
      });
      if (pseudoRandom(i + 10) > 0.5) {
        opt = opt.replace(/\+/g, 'T_M').replace(/-/g, '+').replace(/T_M/g, '-');
      }
      if (opt !== correctAnswer && !distractors.includes(opt)) distractors.push(opt);
    }
  }

  // Strategy 2: Power/exponent tweaking
  if (correctAnswer.includes('^') || correctAnswer.includes('c_1') || correctAnswer.includes('c_2')) {
    for (let i = 1; i <= 5 && distractors.length < 3; i++) {
      let opt = correctAnswer.replace(/\^{?(-?\d+\/?\.?\d*)}?/g, (match, p1) => {
        const val = parseFloat(p1);
        if (isNaN(val)) return match;
        const newVal = pseudoRandom(i) > 0.5 ? val + 1 : val - 1;
        return p1.includes('/') ? `^{${newVal}}` : `^{${newVal}}`;
      });
      if (pseudoRandom(i + 20) > 0.5 && opt.includes('c_1')) {
        opt = opt.replace(/c_1/g, 'C_T').replace(/c_2/g, 'c_1').replace(/C_T/g, 'c_2');
      }
      if (opt !== correctAnswer && !distractors.includes(opt)) distractors.push(opt);
    }
  }

  // Strategy 3: Numeric coefficient tweaking
  let attempts = 0;
  while (distractors.length < 3 && attempts < 20) {
    attempts++;
    let opt = correctAnswer.replace(/(?<![a-zA-Z_])(\d+)/g, (match) => {
      const val = parseInt(match);
      const delta = Math.floor(pseudoRandom(attempts + val) * 3) + 1;
      return String(pseudoRandom(attempts) > 0.5 ? val + delta : Math.max(0, val - delta));
    });
    if (pseudoRandom(attempts + 30) > 0.6) {
      opt = opt.replace(/\+/g, 'T_M').replace(/-/g, '+').replace(/T_M/g, '-');
    }
    if (opt !== correctAnswer && !distractors.includes(opt)) distractors.push(opt);
  }

  // If we still can't generate 3 distractors, return empty (caller should fallback to study mode)
  if (distractors.length < 3) return [];

  const allChoices = [correctAnswer, ...distractors.slice(0, 3)];
  const shuffled = [];
  const indices = [0, 1, 2, 3];
  for (let i = 3; i >= 0; i--) {
    const r = Math.floor(pseudoRandom(i) * (i + 1));
    shuffled.push(allChoices[indices.splice(r, 1)[0]]);
  }
  return shuffled;
};

function PracticeMode({ subjectCode, selectedModules, difficulties = ['Easy', 'Medium', 'Hard'], marks = [2, 3, 5], years = ['2022', '2023', '2024'], onBack, theme, onToggleTheme }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  // Active question index
  const [currentIndex, setCurrentIndex] = useState(0);

  // Per-question interactive states
  const [userAnswers, setUserAnswers] = useState({});
  const [feedbacks, setFeedbacks] = useState({});
  const [statuses, setStatuses] = useState({}); // 'correct', 'incorrect', 'unattempted'
  const [solutions, setSolutions] = useState({});
  const [loadingCheck, setLoadingCheck] = useState(false);
  const [showSolutionPanel, setShowSolutionPanel] = useState({});

  // Code editor state
  const [codeText, setCodeText] = useState({});
  const [codeOutput, setCodeOutput] = useState({});
  const [codeRunning, setCodeRunning] = useState(false);

  // Mobile state & expand toggle
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [navigatorExpanded, setNavigatorExpanded] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentQ = questions[currentIndex];

  // 4-mode question routing
  const questionMode = React.useMemo(() => {
    if (!currentQ) return 'study';
    let mode = getQuestionMode(currentQ);
    // If MCQ but distractors fail, fallback to study
    if (mode === 'mcq') {
      const choices = generateDistractors(currentQ.final_answer, currentQ.uid);
      if (choices.length === 0) mode = 'study';
    }
    return mode;
  }, [currentQ]);

  const mcqChoices = React.useMemo(() => {
    if (!currentQ || questionMode !== 'mcq') return [];
    return generateDistractors(currentQ.final_answer, currentQ.uid);
  }, [currentQ, questionMode]);

  useEffect(() => {
    // Fetch questions for all selected modules
    const fetchQuestions = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        let allQs = [];
        const diffsStr = difficulties.join(',').toLowerCase();
        const yearsStr = years.join(',');
        const marksStr = marks.join(',');

        for (const mod of selectedModules) {
          const modNumber = mod.replace('mod', '');
          const res = await fetch(`${API_BASE}/api/practice/questions?subject=${subjectCode}&module=${modNumber}&difficulty=${diffsStr}&year=${yearsStr}&marks=${marksStr}&latex_support=true`);
          const data = await res.json();
          if (data.questions) {
            allQs = [...allQs, ...data.questions];
          }
        }
        setQuestions(allQs);

        // Initialize status grid
        const initStatuses = {};
        allQs.forEach((_, idx) => {
          initStatuses[idx] = 'unattempted';
        });
        setStatuses(initStatuses);
        setCurrentIndex(0);
      } catch (err) {
        console.error("Error fetching questions:", err);
        setFetchError({
          message: err.message || "Failed to establish a connection to the server.",
          details: String(err)
        });
      }
      setLoading(false);
    };
    fetchQuestions();
  }, [subjectCode, selectedModules, difficulties, years, marks, retryTrigger]);

  // Statistics calculation
  const totalQuestions = questions.length;
  const attemptedCount = Object.values(statuses).filter(s => s !== 'unattempted').length;
  const correctCount = Object.values(statuses).filter(s => s === 'correct').length;
  const incorrectCount = Object.values(statuses).filter(s => s === 'incorrect').length;
  const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;

  if (loading) {
    return (
      <div className="practice-loader-container">
        <div className="practice-spinner"></div>
        <span className="spin-loader-text">Assembling practice session...</span>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="dashboard-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header className="dash-header">
          <div className="dash-header__left">
            <button className="back-subjects-btn" onClick={onBack}>
              <svg className="btn-arrow-left" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>Exit Practice</span>
            </button>
            <span className="logo-text" style={{ marginLeft: '1rem' }}>Practice Connection Error</span>
          </div>
          <div className="dash-header__right">
            <button className="change-campus-btn" onClick={onToggleTheme} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </header>
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--dash-text-color)', fontFamily: 'var(--font-body)', gap: '1.2rem', padding: '2rem', maxWidth: '650px', margin: '0 auto' }}>
          <div style={{ background: 'rgba(231, 76, 60, 0.1)', border: '2px solid #e74c3c', borderRadius: '50%', width: '72px', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e74c3c' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '36px', height: '36px' }}>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', textAlign: 'center', margin: 0 }}>
            Backend Server Offline or Unreachable
          </h2>

          <p style={{ color: 'var(--dash-text-muted)', textAlign: 'center', margin: 0, fontSize: '0.98rem', lineHeight: '1.6' }}>
            We failed to establish a connection to the backend database service via the <code style={{ background: 'rgba(0,0,0,0.05)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>/api</code> proxy.
          </p>

          <div style={{ width: '100%', background: 'var(--dash-panel-bg)', border: '1px solid var(--dash-panel-border)', borderRadius: '12px', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.9rem', color: 'var(--dash-text-color)' }}>
            <span style={{ fontWeight: '700', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', color: 'var(--dash-text-muted)' }}>Troubleshooting Checklist</span>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ color: '#2ecc71', fontWeight: 'bold' }}>✓</span>
              <span><strong>Front-End New Server:</strong> Running (active on port 3000)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>✗</span>
              <span><strong>Back-End Node Server:</strong> Offline. Make sure you run <code style={{ background: 'rgba(0,0,0,0.05)', padding: '1px 4px', borderRadius: '3px', fontFamily: 'monospace' }}>node index.js</code> inside your <code style={{ fontFamily: 'monospace' }}>BitHuB/Backend</code> directory.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>✗</span>
              <span><strong>Database Tunnel:</strong> Check if SSH credentials or local database is running active.</span>
            </div>
          </div>

          <details style={{ width: '100%', cursor: 'pointer' }}>
            <summary style={{ fontSize: '0.85rem', color: 'var(--dash-text-muted)', userSelect: 'none', fontWeight: '600' }}>View Technical Error Logs</summary>
            <pre style={{ marginTop: '0.5rem', background: '#1e1e2e', color: '#f38ba8', padding: '1rem', borderRadius: '8px', overflowX: 'auto', fontFamily: 'monospace', fontSize: '0.8rem', whiteSpace: 'pre-wrap', textAlign: 'left' }}>
              {fetchError.message}
              {"\n\nDetails:\n" + fetchError.details}
            </pre>
          </details>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <button className="back-subjects-btn" onClick={() => setRetryTrigger(prev => prev + 1)} style={{ background: 'var(--dash-active-module-bg)', color: '#fff', border: 'none', padding: '10px 20px', fontWeight: '600' }}>
              🔄 Retry Connection
            </button>
            <button className="back-subjects-btn" onClick={onBack}>
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (totalQuestions === 0) {
    return (
      <div className="dashboard-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header className="dash-header">
          <div className="dash-header__left">
            <button className="back-subjects-btn" onClick={onBack}>
              <svg className="btn-arrow-left" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>Exit Practice</span>
            </button>
            <span className="logo-text" style={{ marginLeft: '1rem' }}>Practice: {subjectCode}</span>
          </div>
          <div className="dash-header__right">
            <button className="change-campus-btn" onClick={onToggleTheme}>
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </header>
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--dash-text-color)', fontFamily: 'var(--font-body)', gap: '1rem', padding: '2rem' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '64px', height: '64px', opacity: 0.5 }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem' }}>No Practice Questions Found</h2>
          <p style={{ color: 'var(--dash-text-muted)', textAlign: 'center', maxWidth: '400px' }}>
            We couldn't find any questions matching your selected filters ({selectedModules.join(', ')} - {difficulties.join(', ')} difficulties). Try broadening your module selection.
          </p>
          <button className="back-subjects-btn" onClick={onBack} style={{ marginTop: '1rem', background: 'var(--dash-active-module-bg)', color: '#fff', border: 'none' }}>
            Go Back
          </button>
        </div>
      </div>
    );
  }


  const handleCheckAnswer = async () => {
    const answer = userAnswers[currentIndex] || '';
    if (!answer.trim()) return;

    setLoadingCheck(true);
    try {
      const res = await fetch(API_BASE + '/api/practice/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: currentQ.uid, answer })
      });
      const data = await res.json();

      const isCorrect = data.isCorrect;
      setFeedbacks(prev => ({ ...prev, [currentIndex]: isCorrect ? 'correct' : 'incorrect' }));
      setStatuses(prev => ({ ...prev, [currentIndex]: isCorrect ? 'correct' : 'incorrect' }));
      setSolutions(prev => ({ ...prev, [currentIndex]: data }));
    } catch (err) {
      console.error("Error checking answer:", err);
    }
    setLoadingCheck(false);
  };

  const handleRevealSolution = async () => {
    if (solutions[currentIndex]) {
      setShowSolutionPanel(prev => ({ ...prev, [currentIndex]: !prev[currentIndex] }));
      return;
    }

    setLoadingCheck(true);
    try {
      const res = await fetch(API_BASE + '/api/practice/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: currentQ.uid })
      });
      const data = await res.json();
      setSolutions(prev => ({ ...prev, [currentIndex]: data }));
      setShowSolutionPanel(prev => ({ ...prev, [currentIndex]: true }));
    } catch (err) {
      console.error("Error fetching solution:", err);
    }
    setLoadingCheck(false);
  };

  // C code compilation handler
  const handleCompileCode = async () => {
    const code = codeText[currentIndex] || '';
    if (!code.trim()) return;
    setCodeRunning(true);
    try {
      const res = await fetch(API_BASE + '/api/practice/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language: 'c' })
      });
      const data = await res.json();
      setCodeOutput(prev => ({ ...prev, [currentIndex]: data }));
    } catch (err) {
      setCodeOutput(prev => ({ ...prev, [currentIndex]: { runError: 'Compilation service unavailable.', success: false } }));
    }
    setCodeRunning(false);
  };

  if (isMobile) {
    return (
      <div className="mobile-practice-root">
        {/* Compact Header */}
        <header className="mobile-practice-header">
          <button className="mobile-practice-back-btn" onClick={onBack}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ width: '16px', height: '16px' }}>
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>Exit Practice</span>
          </button>

          <span className="mobile-practice-subject-title">
            Practice: {subjectCode}
          </span>

          <button className="mobile-practice-theme-btn" onClick={onToggleTheme}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </header>

        {/* Active Question Box Card */}
        <div className="mobile-practice-card">

          {/* Metadata badges row */}
          <div className="mobile-practice-meta-row">
            <span className="badge-practice" style={{ fontSize: '0.65rem', padding: '3px 8px' }}>
              Q {currentIndex + 1} of {totalQuestions}
            </span>
            <span className="badge-practice" style={{ fontSize: '0.65rem', padding: '3px 8px' }}>
              Mod {currentQ.module}
            </span>
            <span className={`badge-practice badge-difficulty-${currentQ.difficulty.toLowerCase()}`} style={{ fontSize: '0.65rem', padding: '3px 8px' }}>
              {currentQ.difficulty}
            </span>
            <span className="badge-practice" style={{ fontSize: '0.65rem', padding: '3px 8px' }}>
              {currentQ.marks}M
            </span>
            {currentQ.exam && (
              <span className="badge-practice" style={{ fontSize: '0.65rem', padding: '3px 8px', borderColor: 'var(--dash-active-module-bg)', color: 'var(--dash-active-module-bg)', background: 'rgba(198, 85, 117, 0.05)' }}>
                {currentQ.exam}
              </span>
            )}
          </div>

          {/* Question Text / LaTeX Area - Fully visible at the top */}
          <div className="mobile-practice-question-text">
            {renderLatex(currentQ.question_latex || currentQ.question_text)}
          </div>

          {/* Divider */}
          <hr style={{ border: 'none', borderTop: '1px solid var(--dash-panel-border)', margin: '4px 0' }} />

          {/* Interactive Input/Options Area */}
          <div className="mobile-practice-interactive-area">

            {/* Keyboard input mode */}
            {questionMode === 'keyboard' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input
                  type="text"
                  className="pq-input-premium"
                  placeholder="Type your final answer..."
                  value={userAnswers[currentIndex] || ''}
                  onChange={(e) => setUserAnswers(prev => ({ ...prev, [currentIndex]: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCheckAnswer(); }}
                  style={{ width: '100%', boxSizing: 'border-box', height: '44px', borderRadius: '12px', fontSize: '0.9rem', padding: '0 12px' }}
                />
                {!feedbacks[currentIndex] && (
                  <button className="pq-btn-submit" onClick={handleCheckAnswer}
                    disabled={loadingCheck || !(userAnswers[currentIndex] || '').trim()}
                    style={{ width: '100%', height: '42px', borderRadius: '12px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '750', background: 'var(--dash-active-module-bg)' }}>
                    {loadingCheck ? 'Checking...' : 'Check Answer'}
                  </button>
                )}
              </div>
            )}

            {/* MCQ Options Grid (2x2) */}
            {questionMode === 'mcq' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="mobile-mcq-options-grid">
                  {mcqChoices.map((choice, idx) => {
                    const letter = String.fromCharCode(65 + idx);
                    const isSelected = userAnswers[currentIndex] === choice;
                    const isChecked = feedbacks[currentIndex];
                    const isCorrectChoice = choice === currentQ.final_answer;

                    let choiceClass = "mobile-mcq-option-btn";
                    if (isSelected) choiceClass += " selected";
                    if (isChecked) {
                      if (isCorrectChoice) choiceClass += " correct-choice";
                      else if (isSelected) choiceClass += " incorrect-choice";
                    }

                    return (
                      <button key={idx} className={choiceClass}
                        onClick={() => { if (!feedbacks[currentIndex]) setUserAnswers(prev => ({ ...prev, [currentIndex]: choice })); }}
                      >
                        {/* Option letter badge */}
                        <div className="mobile-mcq-option-letter">
                          {letter}
                        </div>
                        {/* LaTeX content */}
                        <div className="mobile-mcq-option-text">
                          {renderLatex(choice)}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {!feedbacks[currentIndex] && (
                  <button className="pq-btn-submit" onClick={handleCheckAnswer}
                    disabled={loadingCheck || !userAnswers[currentIndex]}
                    style={{ width: '100%', height: '42px', borderRadius: '12px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '750', background: 'var(--dash-active-module-bg)', marginTop: '4px' }}>
                    {loadingCheck ? 'Checking...' : 'Check Answer'}
                  </button>
                )}
              </div>
            )}

            {/* Study Question mode */}
            {questionMode === 'study' && !feedbacks[currentIndex] && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px 12px', background: 'rgba(198,85,117,0.04)', borderRadius: '14px', border: '1px dashed rgba(198,85,117,0.2)' }}>
                <span style={{ fontWeight: '800', fontSize: '0.85rem', color: 'var(--dash-text-color)' }}>
                  📖 Study &amp; Reveal Mode
                </span>
                <p style={{ fontSize: '0.78rem', color: 'var(--dash-text-muted)', margin: 0, lineHeight: '1.4' }}>
                  Solve this on paper, then click the button below to check your work against the model solution.
                </p>
                <button className="pq-btn-submit" onClick={() => {
                  setFeedbacks(prev => ({ ...prev, [currentIndex]: 'revealed' }));
                  setStatuses(prev => ({ ...prev, [currentIndex]: 'correct' }));
                  handleRevealSolution();
                }} style={{ width: '100%', height: '40px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '750', background: 'var(--dash-active-module-bg)' }}>
                  📖 Reveal Model Answer
                </button>
              </div>
            )}

            {/* Programming Code mode */}
            {questionMode === 'code' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontWeight: '800', fontSize: '0.85rem', color: 'var(--dash-text-color)' }}>
                  💻 C Programming Environment
                </span>
                <textarea
                  value={codeText[currentIndex] || '#include <stdio.h>\n\nint main() {\n    // Code here\n    return 0;\n}'}
                  onChange={(e) => setCodeText(prev => ({ ...prev, [currentIndex]: e.target.value }))}
                  spellCheck={false}
                  style={{ width: '100%', minHeight: '160px', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', lineHeight: '1.4', padding: '10px', borderRadius: '10px', background: '#1e1e2e', color: '#cdd6f4', border: '1px solid rgba(198,85,117,0.2)', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="pq-btn-submit" onClick={handleCompileCode} disabled={codeRunning} style={{ flex: 1, height: '38px', borderRadius: '10px', fontSize: '0.8rem', background: '#2ecc71', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {codeRunning ? 'Running...' : '▶ Run Code'}
                  </button>
                  <button className="pq-btn-submit" onClick={() => {
                    setFeedbacks(prev => ({ ...prev, [currentIndex]: 'revealed' }));
                    setStatuses(prev => ({ ...prev, [currentIndex]: 'correct' }));
                    handleRevealSolution();
                  }} style={{ flex: 1, height: '38px', borderRadius: '10px', fontSize: '0.8rem', background: 'var(--dash-active-module-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    📖 Reveal Solution
                  </button>
                </div>
                {codeOutput[currentIndex] && (
                  <div style={{ background: '#1e1e2e', borderRadius: '10px', padding: '8px', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: '#cdd6f4', border: codeOutput[currentIndex].success ? '1px solid rgba(46,204,113,0.3)' : '1px solid rgba(231,76,60,0.3)' }}>
                    {codeOutput[currentIndex].runOutput && <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{codeOutput[currentIndex].runOutput}</pre>}
                    {codeOutput[currentIndex].compileError && <pre style={{ color: '#e74c3c', whiteSpace: 'pre-wrap', margin: 0 }}>{codeOutput[currentIndex].compileError}</pre>}
                    {codeOutput[currentIndex].runError && <pre style={{ color: '#e74c3c', whiteSpace: 'pre-wrap', margin: 0 }}>{codeOutput[currentIndex].runError}</pre>}
                  </div>
                )}
              </div>
            )}

            {/* Answer Feedback Banner */}
            {feedbacks[currentIndex] && feedbacks[currentIndex] !== 'revealed' && (
              <div className={`banner-feedback-premium ${feedbacks[currentIndex]}`} style={{ padding: '8px 12px', fontSize: '0.78rem', borderRadius: '12px', margin: 0, gap: '6px' }}>
                {feedbacks[currentIndex] === 'correct' ? (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ width: '16px', height: '16px', flexShrink: 0 }}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Spot on! Correct answer.</span>
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ width: '16px', height: '16px', flexShrink: 0 }}>
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    <span>Incorrect. Check derivation steps below.</span>
                  </>
                )}
              </div>
            )}

            {/* Show Solution Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                className="btn-nav-premium"
                onClick={handleRevealSolution}
                disabled={loadingCheck}
                style={{ width: '100%', height: '36px', background: 'rgba(0,0,0,0.03)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', padding: 0 }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '14px', height: '14px' }}>
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span>{showSolutionPanel[currentIndex] ? 'Hide Explanation' : 'View Step-by-Step Solution'}</span>
              </button>

              {showSolutionPanel[currentIndex] && solutions[currentIndex] && (
                <div className="solution-container-premium" style={{ padding: '12px', borderRadius: '14px', fontSize: '0.8rem' }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '0.85rem' }}>Detailed LaTeX Solution</h4>
                  <div className="solution-content-math" style={{ fontSize: '0.8rem', overflowX: 'auto' }}>
                    {renderLatex(solutions[currentIndex].solutionLatex || solutions[currentIndex].solutionText)}
                  </div>
                  {solutions[currentIndex].correctAnswer && (
                    <div className="solution-final-ans-pill" style={{ marginTop: '8px', padding: '6px 10px', borderRadius: '8px', fontSize: '0.78rem' }}>
                      <strong>Expected: </strong>
                      <span style={{ marginLeft: '4px' }}>
                        {renderLatex(solutions[currentIndex].correctAnswer)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Compact Counter Block & Connected Collapsible Navigator */}
          <div className="mobile-practice-dashboard-connected-block">

            {/* 3-Part Stats Counter Row */}
            <div className="mobile-practice-compact-counter">
              <div className="mobile-practice-counter-col">
                <div className="num-val">{attemptedCount}</div>
                <div className="lbl-desc">Attempted</div>
              </div>
              <div className="mobile-practice-counter-col">
                <div className="num-val" style={{ color: '#2ecc71' }}>{correctCount}</div>
                <div className="lbl-desc" style={{ color: '#2ecc71' }}>Correct</div>
              </div>
              <div className="mobile-practice-counter-col">
                <div className="num-val" style={{ color: '#e74c3c' }}>{incorrectCount}</div>
                <div className="lbl-desc" style={{ color: '#e74c3c' }}>Incorrect</div>
              </div>
            </div>

            {/* Expand / Collapse Button connected to Counter */}
            <button className="mobile-practice-expand-btn" onClick={() => setNavigatorExpanded(prev => !prev)}>
              <span>{navigatorExpanded ? 'Collapse Navigator Panel' : 'Expand Navigator Grid'}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ width: '12px', height: '12px', transform: navigatorExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {/* Collapsible Question Navigation Grid inside connected block */}
            {navigatorExpanded && (
              <div className="mobile-practice-collapsible-nav">
                <div className="questions-circles-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                  {questions.map((_, idx) => {
                    const qStatus = statuses[idx] || 'unattempted';
                    const isActive = currentIndex === idx;

                    let btnClass = 'circle-nav-node';
                    if (isActive) btnClass += ' active';
                    if (qStatus === 'correct') btnClass += ' correct';
                    else if (qStatus === 'incorrect') btnClass += ' incorrect';
                    else if (qStatus === 'unattempted') btnClass += ' not-visited';

                    return (
                      <button
                        key={idx}
                        className={btnClass}
                        onClick={() => setCurrentIndex(idx)}
                        style={{
                          width: '32px',
                          height: '32px',
                          fontSize: '0.75rem',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '800',
                          border: isActive ? '2px solid var(--dash-active-module-bg)' : '1px solid var(--dash-panel-border)',
                          background: qStatus === 'correct' ? '#2ecc71' : qStatus === 'incorrect' ? '#e74c3c' : 'var(--dash-panel-bg)',
                          color: qStatus === 'correct' || qStatus === 'incorrect' ? '#fff' : isActive ? 'var(--dash-active-module-bg)' : 'var(--dash-text-color)',
                          cursor: 'pointer'
                        }}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Floating / Bottom-aligned Action Row for Next / Prev */}
        <div className="mobile-practice-footer-controls">
          <button
            className="btn-nav-premium"
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            style={{ flex: 1, height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: '750', padding: 0 }}
          >
            ← Previous
          </button>
          <button
            className="btn-nav-premium"
            onClick={() => setCurrentIndex(prev => Math.min(totalQuestions - 1, prev + 1))}
            disabled={currentIndex === totalQuestions - 1}
            style={{ flex: 1, height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: '750', padding: 0 }}
          >
            Next →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Practice Header */}
      <header className="dash-header">
        <div className="dash-header__left">
          <button className="back-subjects-btn" onClick={onBack}>
            <svg className="btn-arrow-left" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>Exit Practice</span>
          </button>
          <span className="logo-text" style={{ marginLeft: '1.5rem' }}>Practice Environment</span>
        </div>
        <div className="dash-header__right">
          <button className="change-campus-btn" onClick={onToggleTheme}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>

      {/* Main 2-Column Practice Layout */}
      <div className="practice-mode-layout">

        {/* Left Column: Active Question Workspace */}
        <main className="practice-left-column">

          {/* Question Box Card */}
          <div className="question-container-box">

            {/* Badges and tags header */}
            <div className="question-header-meta">
              <span className="badge-practice">
                Question {currentIndex + 1} of {totalQuestions}
              </span>
              <span className="badge-practice">
                Module {currentQ.module}
              </span>
              <span className={`badge-practice badge-difficulty-${currentQ.difficulty.toLowerCase()}`}>
                {currentQ.difficulty}
              </span>
              <span className="badge-practice">
                {currentQ.marks} Marks
              </span>
              {currentQ.exam && (
                <span className="badge-practice" style={{ borderColor: 'var(--dash-active-module-bg)', color: 'var(--dash-active-module-bg)', background: 'rgba(198, 85, 117, 0.05)' }}>
                  {currentQ.exam} ({currentQ.year || '2024'})
                </span>
              )}
            </div>

            {/* LaTeX Render Area */}
            <div className="question-render-area">
              {renderLatex(currentQ.question_latex || currentQ.question_text)}
            </div>

            {/* User Interaction Zone — 4 Modes */}
            <div className="interactive-action-zone">

              {/* MODE: Keyboard Input (numerical/short answers) */}
              {questionMode === 'keyboard' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="numerical-input-group">
                    <input
                      type="text"
                      className="pq-input-premium"
                      placeholder="Type your final answer here..."
                      value={userAnswers[currentIndex] || ''}
                      onChange={(e) => setUserAnswers(prev => ({ ...prev, [currentIndex]: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleCheckAnswer(); }}
                    />
                    <button className="pq-btn-submit" onClick={handleCheckAnswer}
                      disabled={loadingCheck || !(userAnswers[currentIndex] || '').trim()}>
                      {loadingCheck ? 'Checking...' : 'Check Answer'}
                    </button>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--dash-text-muted)', margin: '0' }}>
                    Answers are case-insensitive and allow ±1% tolerance for numeric values.
                  </p>
                </div>
              )}

              {/* MODE: MCQ (complex formula answers) */}
              {questionMode === 'mcq' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <p style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--dash-text-color)', margin: '0' }}>
                    Select the correct option:
                  </p>
                  <div className="mcq-options-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '1rem' }}>
                    {mcqChoices.map((choice, idx) => {
                      const letter = String.fromCharCode(65 + idx);
                      const isSelected = userAnswers[currentIndex] === choice;
                      const isChecked = feedbacks[currentIndex];
                      const isCorrectChoice = choice === currentQ.final_answer;
                      let choiceClass = "mcq-option-btn";
                      if (isSelected) choiceClass += " selected";
                      if (isChecked) {
                        if (isCorrectChoice) choiceClass += " correct-choice";
                        else if (isSelected) choiceClass += " incorrect-choice";
                      }
                      return (
                        <button key={idx} className={choiceClass}
                          onClick={() => { if (!feedbacks[currentIndex]) setUserAnswers(prev => ({ ...prev, [currentIndex]: choice })); }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem',
                            background: isSelected ? 'var(--dash-active-module-bg)' : 'var(--dash-card-bg)',
                            border: isSelected ? '1.5px solid var(--dash-active-module-bg)' : '1px solid rgba(0,0,0,0.08)',
                            color: isSelected ? '#fff' : 'var(--dash-text-color)', borderRadius: '12px', textAlign: 'left',
                            cursor: feedbacks[currentIndex] ? 'not-allowed' : 'pointer', transition: 'all 0.25s ease',
                            fontFamily: 'var(--font-body)'
                          }}>
                          <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px',
                            borderRadius: '50%', background: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)',
                            color: isSelected ? '#fff' : 'var(--dash-text-color)', fontWeight: '700', fontSize: '0.9rem', flexShrink: 0
                          }}>
                            {letter}
                          </div>
                          <div style={{ flexGrow: 1, fontSize: '0.95rem' }}>{renderLatex(choice)}</div>
                        </button>
                      );
                    })}
                  </div>
                  {!feedbacks[currentIndex] && (
                    <button className="pq-btn-submit" onClick={handleCheckAnswer}
                      disabled={loadingCheck || !userAnswers[currentIndex]} style={{ width: 'fit-content', marginTop: '0.5rem' }}>
                      {loadingCheck ? 'Checking...' : 'Check Answer'}
                    </button>
                  )}
                </div>
              )}

              {/* MODE: Study & Reveal (theoretical/conceptual/proof/derivation) */}
              {questionMode === 'study' && !feedbacks[currentIndex] && (
                <div style={{
                  display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem', background: 'rgba(198,85,117,0.04)',
                  borderRadius: '16px', border: '1px dashed rgba(198,85,117,0.2)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '24px', height: '24px', color: 'var(--dash-active-module-bg)' }}>
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                    </svg>
                    <span style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--dash-text-color)', fontFamily: 'var(--font-display)' }}>
                      Study Question
                    </span>
                    <span className={`badge-practice badge-difficulty-${(currentQ.question_type || '').toLowerCase().split('/')[0]}`}
                      style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>
                      {currentQ.question_type}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--dash-text-muted)', margin: '0', lineHeight: '1.6' }}>
                    This is a {currentQ.question_type} question. Take a moment to work through your answer mentally or on paper, then reveal the model solution below.
                  </p>
                  <button className="pq-btn-submit" onClick={() => {
                    setFeedbacks(prev => ({ ...prev, [currentIndex]: 'revealed' }));
                    setStatuses(prev => ({ ...prev, [currentIndex]: 'correct' }));
                    handleRevealSolution();
                  }} style={{ width: 'fit-content', background: 'var(--dash-active-module-bg)' }}>
                    📖 Reveal Model Answer
                  </button>
                </div>
              )}

              {/* MODE: Code Editor (programming questions) */}
              {questionMode === 'code' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--dash-text-color)', fontFamily: 'var(--font-display)' }}>
                      💻 C Programming Editor
                    </span>
                    <span style={{
                      fontSize: '0.75rem', color: 'var(--dash-text-muted)', background: 'rgba(0,0,0,0.05)',
                      padding: '0.25rem 0.8rem', borderRadius: '20px'
                    }}>Powered by Piston API</span>
                  </div>
                  <textarea
                    className="pq-code-editor"
                    value={codeText[currentIndex] || '#include <stdio.h>\n\nint main() {\n    // Write your code here\n    \n    return 0;\n}'}
                    onChange={(e) => setCodeText(prev => ({ ...prev, [currentIndex]: e.target.value }))}
                    spellCheck={false}
                    style={{
                      width: '100%', minHeight: '260px', fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                      fontSize: '0.88rem', lineHeight: '1.6', padding: '1.2rem', borderRadius: '12px',
                      background: '#1e1e2e', color: '#cdd6f4', border: '1px solid rgba(198,85,117,0.2)',
                      resize: 'vertical', outline: 'none', tabSize: 4
                    }}
                  />
                  <div style={{ display: 'flex', gap: '0.8rem' }}>
                    <button className="pq-btn-submit" onClick={handleCompileCode} disabled={codeRunning}
                      style={{ background: '#2ecc71' }}>
                      {codeRunning ? '⏳ Compiling...' : '▶ Compile & Run'}
                    </button>
                    <button className="pq-btn-submit" onClick={() => {
                      setFeedbacks(prev => ({ ...prev, [currentIndex]: 'revealed' }));
                      setStatuses(prev => ({ ...prev, [currentIndex]: 'correct' }));
                      handleRevealSolution();
                    }} style={{ background: 'var(--dash-active-module-bg)' }}>
                      📖 View Model Solution
                    </button>
                  </div>
                  {codeOutput[currentIndex] && (
                    <div style={{
                      background: '#1e1e2e', borderRadius: '12px', padding: '1rem', fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '0.85rem', color: '#cdd6f4', border: codeOutput[currentIndex].success ? '1px solid rgba(46,204,113,0.3)' : '1px solid rgba(231,76,60,0.3)'
                    }}>
                      <div style={{ color: codeOutput[currentIndex].success ? '#2ecc71' : '#e74c3c', fontWeight: '600', marginBottom: '0.5rem' }}>
                        {codeOutput[currentIndex].success ? '✓ Compilation Successful' : '✗ Error'}
                      </div>
                      {codeOutput[currentIndex].compileError && <pre style={{ color: '#e74c3c', whiteSpace: 'pre-wrap', margin: 0 }}>{codeOutput[currentIndex].compileError}</pre>}
                      {codeOutput[currentIndex].runOutput && <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{codeOutput[currentIndex].runOutput}</pre>}
                      {codeOutput[currentIndex].runError && <pre style={{ color: '#e74c3c', whiteSpace: 'pre-wrap', margin: 0 }}>{codeOutput[currentIndex].runError}</pre>}
                    </div>
                  )}
                </div>
              )}

              {/* Feedback Banner */}
              {feedbacks[currentIndex] && feedbacks[currentIndex] !== 'revealed' && (
                <div className={`banner-feedback-premium ${feedbacks[currentIndex]}`}>
                  {feedbacks[currentIndex] === 'correct' ? (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ width: '20px', height: '20px' }}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>🎉 Spot on! Correct Answer. Expand the solution below for detailed steps.</span>
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ width: '20px', height: '20px' }}>
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                      <span>❌ Incorrect. Double-check your calculation, or expand the step-by-step solution.</span>
                    </>
                  )}
                </div>
              )}

              {/* Show Solution Button / Expansion Card */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button
                  className="btn-nav-premium"
                  onClick={handleRevealSolution}
                  disabled={loadingCheck}
                  style={{ width: 'fit-content', background: 'rgba(0,0,0,0.03)' }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '16px', height: '16px' }}>
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <span>{showSolutionPanel[currentIndex] ? 'Hide Explanation' : 'View Step-by-Step Solution'}</span>
                </button>

                {showSolutionPanel[currentIndex] && solutions[currentIndex] && (
                  <div className="solution-container-premium">
                    <h4>Detailed LaTeX Derivation &amp; Solution</h4>
                    <div className="solution-content-math">
                      {renderLatex(solutions[currentIndex].solutionLatex || solutions[currentIndex].solutionText)}
                    </div>
                    {solutions[currentIndex].correctAnswer && (
                      <div className="solution-final-ans-pill">
                        <strong>Expected Value: </strong>
                        <span style={{ marginLeft: '4px' }}>
                          {renderLatex(solutions[currentIndex].correctAnswer)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* Sequential Next / Prev Controls */}
          <div className="question-nav-controls-row">
            <button
              className="btn-nav-premium"
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
            >
              ← Previous Question
            </button>
            <button
              className="btn-nav-premium"
              onClick={() => setCurrentIndex(prev => Math.min(totalQuestions - 1, prev + 1))}
              disabled={currentIndex === totalQuestions - 1}
            >
              Next Question →
            </button>
          </div>

        </main>

        {/* Right Column: Statistics and Session Navigation Grid */}
        <aside className="practice-right-sidebar">

          {/* Attempt Statistics Panel */}
          <div className="panel-sidebar-premium">
            <span className="panel-sidebar-title">Attempt Statistics</span>
            <div className="stats-grid-dashboard">
              <div className="stat-item-premium">
                <span className="stat-num-val" style={{ color: 'var(--dash-active-module-bg)' }}>{attemptedCount}</span>
                <span className="stat-label-desc">Attempted</span>
              </div>
              <div className="stat-item-premium">
                <span className="stat-num-val correct">{correctCount}</span>
                <span className="stat-label-desc">Correct</span>
              </div>
              <div className="stat-item-premium">
                <span className="stat-num-val wrong">{incorrectCount}</span>
                <span className="stat-label-desc">Wrong</span>
              </div>
              <div className="stat-item-premium">
                <span className="stat-num-val" style={{ color: '#f1c40f' }}>{accuracy}%</span>
                <span className="stat-label-desc">Accuracy</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--dash-text-muted)' }}>Progress Meter</span>
              <div className="accuracy-bar-track">
                <div className="accuracy-bar-fill" style={{ width: `${Math.round((attemptedCount / totalQuestions) * 100)}%` }}></div>
              </div>
            </div>
          </div>

          {/* Interactive Question Grid Selector Panel */}
          <div className="panel-sidebar-premium">
            <span className="panel-sidebar-title">Question Navigator Grid</span>
            <div className="questions-circles-grid">
              {questions.map((_, idx) => {
                const qStatus = statuses[idx] || 'unattempted';
                const isActive = currentIndex === idx;

                let btnClass = 'circle-nav-node';
                if (isActive) btnClass += ' active';
                if (qStatus === 'correct') btnClass += ' correct';
                else if (qStatus === 'incorrect') btnClass += ' incorrect';
                else if (qStatus === 'unattempted') btnClass += ' not-visited';

                return (
                  <button
                    key={idx}
                    className={btnClass}
                    onClick={() => setCurrentIndex(idx)}
                    title={`Go to Question ${idx + 1}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px', fontSize: '0.75rem', color: 'var(--dash-text-muted)', borderTop: '1px solid var(--dash-panel-border)', paddingTop: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2ecc71', display: 'inline-block' }}></span>
                <span>Correct Answer</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#e74c3c', display: 'inline-block' }}></span>
                <span>Incorrect Answer</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'rgba(0,0,0,0.05)', border: '1px solid var(--dash-panel-border)', display: 'inline-block' }}></span>
                <span>Unattempted / Not Visited</span>
              </div>
            </div>
          </div>

        </aside>

      </div>
    </div>
  );
}

export default PracticeMode;
