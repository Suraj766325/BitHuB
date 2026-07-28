import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config';
import Editor from '@monaco-editor/react';
import './LabDashboard.css';
import './OnlineJudge.css';

const OnlineJudge = ({ problem, theme, onBack }) => {
  const formatParams = (params) => {
    if (!params || !Array.isArray(params)) return "";
    return params.map(p => `${p.type} ${p.name}`).join(', ');
  };

  const paramString = formatParams(problem.parameters);
  const [code, setCode] = useState(`#include <stdio.h>\n\n${problem.returnType} ${problem.functionName}(${paramString}) {\n    // Write your code here\n}\n`);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("idle"); // idle, running, success, error

  // Mobile specific state
  const [isMobile, setIsMobile] = useState(false);
  const [mobileView, setMobileView] = useState('problem');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const widthMatch = window.innerWidth <= 900;
      const classMatch = document.body.classList.contains('force-mobile-mode');
      setIsMobile(widthMatch || classMatch);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    const observer = new MutationObserver(checkMobile);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => {
      window.removeEventListener('resize', checkMobile);
      observer.disconnect();
    };
  }, []);

  const handleEditorChange = (value) => {
    setCode(value);
  };

  const runCode = async () => {
    setLoading(true);
    setStatus("running");
    setOutput("Compiling and running...");
    
    // Ensure we are in editor view
    setMobileView('editor');
    setIsDrawerOpen(false);

    try {
      const res = await fetch(API_BASE + '/api/practice/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: code, 
          problem: problem
        })
      });

      const data = await res.json();
      if (!data.success) {
        setStatus("error");
        setOutput(`[COMPILE ERROR]\n${data.compileError || data.runError}`);
        return;
      }
      
      setStatus("success");
      let outStr = "";
      if (data.compileOutput) outStr += `[Compiler Warnings/Logs]\n${data.compileOutput}\n\n`;
      
      outStr += data.runOutput || "Execution finished with no output.";
      if (data.runError) {
        setStatus("error");
        outStr += `\n[RUNTIME ERROR]\n${data.runError}`;
      }
      
      setOutput(outStr);
    } catch (err) {
      setStatus("error");
      setOutput(`Error connecting to compiler service: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const viewSampleCode = () => {
    if (problem.solutionCode) {
      setCode(`/*\n * DISCLAIMER: This environment is purely for practicing syntax and logic.\n * Please write the traditional answers in your lab manual.\n */\n\n${problem.solutionCode}`);
    } else {
      setOutput("No sample code available for this problem.");
    }
    setMobileView('editor');
    setIsDrawerOpen(false);
  };

  const getStatusColor = () => {
    if (status === "success") return "#4ade80"; // green
    if (status === "error") return "#f87171"; // red
    if (status === "running") return "#60a5fa"; // blue
    return "var(--dash-text-color)";
  };

  const renderProblemContent = () => (
    <>
      <div style={{ background: 'rgba(255, 193, 7, 0.1)', borderLeft: '4px solid #ffc107', padding: '1rem', marginBottom: '1.5rem', borderRadius: '4px', color: 'var(--dash-text-color)', fontSize: '0.95rem' }}>
        <strong>Note:</strong> This environment is purely for practicing syntax and logic. The code written here should <em>not</em> be copied directly into your lab manual. Please write a traditional answer for your manual submissions.
      </div>
      <div style={{ color: 'var(--dash-text-color)', lineHeight: '1.6', fontSize: '1.1rem' }} dangerouslySetInnerHTML={{ __html: problem.question_text }} />
      
      {problem.testCases && problem.testCases.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <h4 style={{ color: 'var(--dash-text-color)', marginBottom: '0.5rem' }}>Sample Test Case</h4>
          <div style={{ background: 'var(--glass-bg)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)', color: 'var(--dash-text-color)', fontFamily: 'monospace', fontSize: '0.9rem' }}>
            <div><strong>Input:</strong> {JSON.stringify(problem.testCases[0].input)}</div>
            {problem.evaluationType === "stdout" ? (
              <div><strong>Expected Output:</strong> {problem.testCases[0].expected_stdout}</div>
            ) : (
              <div><strong>Expected Return:</strong> {JSON.stringify(problem.testCases[0].expected_return)}</div>
            )}
          </div>
        </div>
      )}
    </>
  );

  const renderStatementPanel = () => (
    <div className="dashboard-card" style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--dash-text-color)', margin: 0, fontSize: '1.5rem' }}>
          Q{problem.question_number}: {problem.title || "Programming Task"}
        </h2>
      </div>
      {renderProblemContent()}
    </div>
  );

  const renderConsole = () => (
    <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', height: isMobile ? '30vh' : '250px', flexShrink: 0, overflow: 'hidden', background: theme === 'dark' ? '#1e1e1e' : '#f5f5f5' }}>
      <div style={{ padding: '0.8rem 1.5rem', borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#ddd'}`, display: 'flex', alignItems: 'center', gap: '0.5rem', color: theme === 'dark' ? '#ccc' : '#333', background: theme === 'dark' ? '#252526' : '#eaeaea' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width: 16, height: 16}}>
          <polyline points="4 17 10 11 4 5"></polyline>
          <line x1="12" y1="19" x2="20" y2="19"></line>
        </svg>
        <strong style={{ fontSize: '1rem' }}>Console</strong>
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: getStatusColor(), marginLeft: 'auto', boxShadow: '0 0 5px ' + getStatusColor() }}></div>
      </div>
      <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto', fontFamily: "'Fira Code', monospace", color: theme === 'dark' ? '#e5e5e5' : '#333', whiteSpace: 'pre-wrap', fontSize: '0.95rem', lineHeight: '1.5' }}>
        {output || "Output will appear here..."}
      </div>
    </div>
  );

  const renderEditor = () => (
    <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', flex: isMobile ? 1 : 1.2, height: isMobile ? '50vh' : 'auto', minHeight: isMobile ? 'auto' : '400px', overflow: 'hidden' }}>
      <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid var(--glass-border)', background: 'var(--glass-bg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width: 18, height: 18, color: 'var(--dash-text-color)'}}>
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
          <span style={{ color: 'var(--dash-text-color)', fontWeight: 'bold', fontSize: '1rem' }}>C Compiler (gcc)</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className="btn-pink-outline"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
            onClick={viewSampleCode}
          >
            Sample
          </button>
          <button 
            className="btn-pink"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
            onClick={runCode}
            disabled={loading}
          >
            {loading ? "..." : "Run"}
          </button>
        </div>
      </div>
      
      <div style={{ flex: 1 }}>
        <Editor
          height="100%"
          defaultLanguage="c"
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          value={code}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'Fira Code', monospace",
            lineHeight: 24,
            padding: { top: 16 },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: true,
            formatOnPaste: true,
          }}
        />
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="cs24102-mobile-container" style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        
        {/* Mobile Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--dash-bg)', borderBottom: '1px solid var(--glass-border)', flexShrink: 0 }}>
          <button onClick={mobileView === 'editor' ? () => setMobileView('problem') : onBack} style={{ background: 'none', border: 'none', color: '#d97b93', fontWeight: 'bold', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.5" fill="none"><polyline points="15 18 9 12 15 6"></polyline></svg>
            Back
          </button>
          
          <h3 style={{ margin: 0, color: 'var(--dash-text-color)', fontSize: '1.2rem' }}>Q{problem.question_number}</h3>
        </div>

        {/* View Switching */}
        {mobileView === 'problem' ? (
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', paddingBottom: '80px', display: 'flex', flexDirection: 'column' }}>
            {renderProblemContent()}
            
            {/* Floating Play Button */}
            <button 
              onClick={() => setMobileView('editor')}
              style={{
                position: 'fixed',
                bottom: '3rem',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg, #d97b93, #c55a73)',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                padding: '1rem 2.5rem',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                boxShadow: '0 8px 25px rgba(217, 123, 147, 0.5)',
                cursor: 'pointer',
                zIndex: 100
              }}
            >
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2.5" fill="white"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              Solve Problem
            </button>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '0.5rem 1rem', background: 'var(--dash-bg)', display: 'flex', justifyContent: 'flex-end', borderBottom: '1px solid var(--glass-border)' }}>
              <button 
                onClick={() => setIsDrawerOpen(true)}
                style={{
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--dash-text-color)',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
                View Problem
              </button>
            </div>
            {renderEditor()}
            {renderConsole()}
          </div>
        )}

        {/* Problem Statement Drawer Overlay */}
        {isDrawerOpen && (
          <div className="problem-drawer-overlay" onClick={() => setIsDrawerOpen(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1000 }} />
        )}
        
        {/* Problem Statement Drawer */}
        <div className={`problem-drawer ${isDrawerOpen ? 'open' : ''}`} style={{
          position: 'fixed',
          top: 0,
          left: isDrawerOpen ? 0 : '-100%',
          width: '85%',
          height: '100%',
          background: 'var(--dash-bg)',
          zIndex: 1001,
          transition: 'left 0.3s ease',
          boxShadow: isDrawerOpen ? '5px 0 20px rgba(0,0,0,0.3)' : 'none',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div className="drawer-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
            <h3 style={{ margin: 0, color: 'var(--dash-text-color)' }}>Q{problem.question_number}</h3>
            <button onClick={() => setIsDrawerOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--dash-text-color)', cursor: 'pointer', padding: '0.5rem' }}>
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <div className="drawer-content" style={{ padding: '1rem', overflowY: 'auto', flex: 1 }}>
            {renderProblemContent()}
          </div>
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div style={{ display: 'flex', gap: '1.5rem', height: 'calc(100vh - 100px)', padding: '1rem', alignItems: 'stretch' }}>
      {/* LEFT COLUMN: Problem Statement & Console */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {renderStatementPanel()}
        {renderConsole()}
      </div>

      {/* RIGHT COLUMN: C Compiler Editor */}
      {renderEditor()}
    </div>
  );
};

export default OnlineJudge;
