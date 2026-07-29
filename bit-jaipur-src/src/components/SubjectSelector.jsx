import { useState, useEffect } from 'react';
import CreatorsSection from './CreatorsSection';

function SubjectSelector({ onSelectSubject, onBackToLanding, theme, onToggleTheme }) {
  const [campusDropdownOpen, setCampusDropdownOpen] = useState(false);
  const [activeSemester, setActiveSemester] = useState(1);

  // Detect real mobile screen
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const semester1Subjects = [
    { name: "Mathematics 1", code: "MA24101" },
    { name: "Basics of Electronic Engineering", code: "EC24101", shortName: "Electronic" },
    { name: "Chemistry", code: "CH24101" },
    { name: "Environmental Sciences", code: "CE24101" },
    { name: "Basics of Mechanical Engineering", code: "ME24101", shortName: "Mechanical" }
  ];

  const semester2Subjects = [
    { name: "Programming for Problem Solving", code: "CS24101", shortName: "Programming" },
    { name: "Mathematics 2", code: "MA24103" },
    { name: "Physics", code: "PH24101" },
    { name: "Basics of Electrical Engineering", code: "EE24101", shortName: "Electrical" },
    { name: "Biological Science for Engineers", code: "BE24101", shortName: "Biology" }
  ];

  const closeDropdowns = () => {
    setCampusDropdownOpen(false);
  };

  return (
    <div className="selector-page-container" onClick={closeDropdowns} id="selector-page-container">
      
      {/* ============================================================
          TOP HEADER
          ============================================================ */}
      <header className="dash-header" id="selector-header">
        <div className="dash-header__left">
          {/* Logo */}
          <div className="logo-container" onClick={onBackToLanding} title="Go back to campus landing page">
            <div className="logo-icon-wrapper">
              <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M4 19.5V15a2 2 0 0 1 2-2h14M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V17" />
                <path d="M6 2v11" />
              </svg>
            </div>
            <span className="logo-text">BitHub</span>
          </div>
        </div>

        <div className="dash-header__right">
          {/* Light/Dark Toggle Switch */}
          <button 
            className="theme-toggle-btn" 
            onClick={(e) => { e.stopPropagation(); onToggleTheme(); }}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            aria-label="Toggle theme mode"
            id="theme-toggle-button"
          >
            {theme === 'light' ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="toggle-icon">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="toggle-icon">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            )}
            <span className="theme-toggle-slider">
              <span className="theme-toggle-knob" />
            </span>
          </button>


          {/* Campus Selector Dropdown (matches visual drawing) */}
          <div className="campus-dropdown-container" onClick={(e) => e.stopPropagation()}>
            <button 
              className={`campus-select-btn ${campusDropdownOpen ? 'active' : ''}`}
              onClick={() => { setCampusDropdownOpen(!campusDropdownOpen); }}
              id="campus-dropdown-trigger"
            >
              <svg className="campus-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>Jaipur Campus</span>
              <svg className="arrow-down-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {campusDropdownOpen && (
              <div className="campus-dropdown-menu" id="campus-dropdown-menu">
                <div className="campus-dropdown-item active">Jaipur Campus (Active)</div>
                <div className="campus-dropdown-item" onClick={() => { onBackToLanding(); }}>
                  Change Campus
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ============================================================
          MAIN BODY LAYOUT (TWO COLUMNS AS PER THE SKETCH)
          ============================================================ */}
      <main className="selector-main-content" id="selector-main-content">
        <h1 className="selector-main-title">Select Course Material</h1>
        
        {isMobile ? (
          <div className="mobile-semester-selector">
            <p className="mobile-semester-prompt">Select your semester</p>
            
            {/* Segmented Control */}
            <div className="semester-segmented-control">
              <button 
                className={`segmented-btn ${activeSemester === 1 ? 'active' : ''}`}
                onClick={() => setActiveSemester(1)}
              >
                Semester 1
              </button>
              <button 
                className={`segmented-btn ${activeSemester === 2 ? 'active' : ''}`}
                onClick={() => setActiveSemester(2)}
              >
                Semester 2
              </button>
            </div>

            {/* Redesigned Slimmer Subjects List */}
            <div className="mobile-subjects-list">
              {(activeSemester === 1 ? semester1Subjects : semester2Subjects).map(sub => {
                // Generate a beautiful 2-letter badge for the subject
                const badgeText = sub.code.substring(0, 2);
                return (
                  <button 
                    key={sub.code} 
                    className="mobile-subject-btn"
                    onClick={() => onSelectSubject(sub.code)}
                    id={`btn-mobile-${sub.code.toLowerCase()}`}
                  >
                    <div className="mobile-btn-left">
                      <div className={`mobile-subject-badge badge-${badgeText.toLowerCase()}`}>
                        {badgeText}
                      </div>
                      <div className="mobile-btn-info">
                        <span className="mobile-subject-name">{sub.name}</span>
                        <span className="mobile-subject-code">{sub.code}</span>
                      </div>
                    </div>
                    <svg className="mobile-btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                );
              })}

              {/* Labs Button (Redesigned for Mobile) */}
              <button 
                className="mobile-subject-btn mobile-labs-btn"
                onClick={() => onSelectSubject(activeSemester === 1 ? "LAB-SEM1" : "LAB-SEM2")}
                id={`btn-mobile-labs-sem${activeSemester}`}
              >
                <div className="mobile-btn-left">
                  <div className="mobile-subject-badge badge-labs">
                    LB
                  </div>
                  <div className="mobile-btn-info">
                    <span className="mobile-subject-name">LABS (Semester {activeSemester})</span>
                    <span className="mobile-subject-code">Practical Guides & Viva Voice</span>
                  </div>
                </div>
                <div className="labs-indicator-dot" />
                <svg className="mobile-btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="semester-columns-grid">
            
            {/* COLUMN 1: SEMESTER 1 */}
            <section className="semester-column-card" id="semester-1-column">
              <div className="semester-pill-header">
                <span>Semester 1</span>
              </div>
              
              <div className="subjects-button-list">
                {semester1Subjects.map(sub => (
                  <button 
                    key={sub.code} 
                    className="subject-selection-btn"
                    onClick={() => onSelectSubject(sub.code)}
                    id={`btn-${sub.code.toLowerCase()}`}
                  >
                    <div className="btn-content-left">
                      <span className="btn-primary-title">{sub.shortName || sub.name}</span>
                      <span className="btn-secondary-code">{sub.code}</span>
                    </div>
                    <svg className="btn-arrow-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                ))}

                {/* Bottom Extra Labs Button */}
                <button 
                  className="subject-selection-btn labs-btn-accent"
                  onClick={() => onSelectSubject("LAB-SEM1")}
                  id="btn-labs-sem1"
                >
                  <div className="btn-content-left">
                    <span className="btn-primary-title">LABS (Semester 1)</span>
                    <span className="btn-secondary-code">Practical Guides & Viva voice</span>
                  </div>
                  <div className="labs-indicator-dot" />
                  <svg className="btn-arrow-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            </section>

            {/* COLUMN 2: SEMESTER 2 */}
            <section className="semester-column-card" id="semester-2-column">
              <div className="semester-pill-header">
                <span>Semester 2</span>
              </div>

              <div className="subjects-button-list">
                {semester2Subjects.map(sub => (
                  <button 
                    key={sub.code} 
                    className="subject-selection-btn"
                    onClick={() => onSelectSubject(sub.code)}
                    id={`btn-${sub.code.toLowerCase()}`}
                  >
                    <div className="btn-content-left">
                      <span className="btn-primary-title">{sub.shortName || sub.name}</span>
                      <span className="btn-secondary-code">{sub.code}</span>
                    </div>
                    <svg className="btn-arrow-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                ))}

                {/* Bottom Extra Labs Button */}
                <button 
                  className="subject-selection-btn labs-btn-accent"
                  onClick={() => onSelectSubject("LAB-SEM2")}
                  id="btn-labs-sem2"
                >
                  <div className="btn-content-left">
                    <span className="btn-primary-title">LABS (Semester 2)</span>
                    <span className="btn-secondary-code">Practical Guides & Viva voice</span>
                  </div>
                  <div className="labs-indicator-dot" />
                  <svg className="btn-arrow-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            </section>

          </div>
        )}
      </main>

      <CreatorsSection />
    </div>
  );
}

export default SubjectSelector;
