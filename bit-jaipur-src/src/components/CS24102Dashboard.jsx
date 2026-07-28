import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config';
import OnlineJudge from './OnlineJudge';
import './LabDashboard.css';

const CS24102Dashboard = ({ theme, onBack }) => {
  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API_BASE + '/api/cs-problems')
      .then(res => res.json())
      .then(data => {
        setProblems(data.problems || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load problems:", err);
        setLoading(false);
      });
  }, []);

  if (selectedProblem) {
    return (
      <OnlineJudge 
        problem={selectedProblem} 
        theme={theme} 
        onBack={() => setSelectedProblem(null)} 
      />
    );
  }

  const totalQuestions = problems.length;
  const attempted = 0; // Mock for now

  return (
    <div className="cs24102-layout">
      {/* LEFT COLUMN */}
      <div className="cs24102-left">
        {!selectedProblem ? (
          <section className="dashboard-card cs24102-list-card">
            <div className="card-header">
              <div className="card-header-titles">
                <h3 className="card-title-main">C Lab Assignments</h3>
                <p className="card-title-sub">Select a problem to open the Online Judge</p>
              </div>
            </div>
            
            {loading ? (
              <div style={{padding: '2rem', textAlign: 'center', color: 'var(--dash-text-color)'}}>Loading problems...</div>
            ) : problems.length === 0 ? (
              <div style={{padding: '2rem', textAlign: 'center', color: 'var(--dash-text-color)'}}>No problems found.</div>
            ) : (
              <div className="subjects-button-list" style={{display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0 0.5rem 1rem', overflowY: 'auto', flex: 1}}>
                {problems.map(prob => (
                  <button 
                    key={prob.problem_id}
                    className="subject-selection-btn"
                    onClick={() => setSelectedProblem(prob)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                      <div className="card-header-icon-wrapper circle-pink" style={{flexShrink: 0}}>
                        <svg className="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="16 18 22 12 16 6"></polyline>
                          <polyline points="8 6 2 12 8 18"></polyline>
                        </svg>
                      </div>
                      <div className="btn-content-left">
                        <span className="btn-primary-title" style={{ fontSize: '1.05rem', textAlign: 'left', whiteSpace: 'normal', lineHeight: '1.3' }}>
                          Q{prob.question_number}: {prob.title || "Programming Task"}
                        </span>
                      </div>
                    </div>
                    <svg className="btn-arrow-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                ))}
              </div>
            )}
          </section>
        ) : (
          <OnlineJudge 
            problem={selectedProblem} 
            theme={theme} 
            onBack={() => setSelectedProblem(null)} 
          />
        )}
      </div>

      {/* RIGHT COLUMN (STATISTICS & NAVIGATION) */}
      <div className={`cs24102-right ${selectedProblem ? 'hide-on-mobile' : ''}`}>
        {/* Mobile Linear Tracker (Only visible on mobile) */}
        <div className="cs24102-mobile-tracker">
          <div className="tracker-header">
            <span>Progress</span>
            <span>{attempted} / {totalQuestions}</span>
          </div>
          <div className="tracker-bar">
            <div className="tracker-fill" style={{ width: `${totalQuestions > 0 ? (attempted / totalQuestions) * 100 : 0}%` }}></div>
          </div>
        </div>

        {/* Desktop Stats Card */}
        <div className="dashboard-card cs24102-desktop-stats">
          <h3 style={{ margin: '0 0 1rem 0', color: 'var(--dash-text-color)', fontFamily: 'var(--font-display)' }}>Progress</h3>
          
          <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 1rem' }}>
            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="var(--glass-border)"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#4ade80"
                strokeWidth="3"
                strokeDasharray={`${totalQuestions > 0 ? (attempted / totalQuestions) * 100 : 0}, 100`}
              />
            </svg>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--dash-text-color)' }}>{attempted}</span>
              <span style={{ fontSize: '0.8rem', color: '#888' }}>/ {totalQuestions}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-around', color: 'var(--dash-text-color)', fontSize: '0.9rem' }}>
            <div>
              <div style={{ fontWeight: 'bold', color: '#4ade80' }}>{attempted}</div>
              <div style={{ color: '#888' }}>Attempted</div>
            </div>
            <div>
              <div style={{ fontWeight: 'bold' }}>{totalQuestions - attempted}</div>
              <div style={{ color: '#888' }}>Remaining</div>
            </div>
          </div>
        </div>

        {/* Navigation Grid (Hidden on Mobile) */}
        <div className="dashboard-card cs24102-grid-nav">
          <h3 style={{ margin: '0 0 1rem 0', color: 'var(--dash-text-color)', fontFamily: 'var(--font-display)' }}>Questions Grid</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', overflowY: 'auto', paddingRight: '0.5rem', flex: 1, alignContent: 'start' }}>
            {problems.map(prob => {
              const isSelected = selectedProblem?.problem_id === prob.problem_id;
              return (
                <button
                  key={prob.problem_id}
                  onClick={() => setSelectedProblem(prob)}
                  style={{
                    background: isSelected ? 'var(--dash-text-color)' : 'var(--glass-bg)',
                    color: isSelected ? 'var(--glass-bg)' : 'var(--dash-text-color)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '6px',
                    padding: '0.5rem 0',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {prob.question_number}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CS24102Dashboard;
