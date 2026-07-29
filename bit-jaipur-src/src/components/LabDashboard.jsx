import { useState, useCallback, useRef, useEffect } from 'react';
import { API_BASE } from '../config';
import CreatorsSection from './CreatorsSection';
import CS24102Dashboard from './CS24102Dashboard';
import Toast from './Toast';
import './LabDashboard.css';

const SEM1_LABS = {
  "ME24102": { name: "Engineering Drawing", icon: "pencil" },
  "EC24102": { name: "Electrical Engineering", icon: "chip" },
  "CH24102": { name: "Chemistry Lab", icon: "flask" },
  "PE24102": { name: "Engineering Workshop", icon: "wrench" }
};

const SEM2_LABS = {
  "PH24102": { name: "Physics Lab", icon: "flask" },
  "EE24102": { name: "Electrical Lab", icon: "chip" },
  "CS24102": { name: "Programming for Problem Solving Lab", icon: "code" }
};

const meTopics = [
  "Solids",
  "Isometric Sheet",
  "Lines",
  "Section of Solids"
];

const shopFiles = {
  "Machine": [
    "Machine shop Experiment 1 .pdf",
    "Machine shop experiment 2 .pdf",
    "Machine shop Experiment 3 .pdf"
  ],
  "Fitting": [
    "2025-11-08 13-11-53.pdf",
    "WhatsApp Unknown 2025-12-04 at 8.04.59 PM.zip"
  ],
  "Carpentry": [
    "carpentry .pdf",
    "WhatsApp Unknown 2025-12-04 at 8.01.40 PM.zip"
  ],
  "Welding": [
    "2025-11-08 13-13-46.pdf",
    "WhatsApp Unknown 2025-12-04 at 8.02.12 PM.zip",
    "WhatsApp Unknown 2025-12-04 at 8.02.59 PM.zip"
  ]
};

// --- SVG Icons ---
const getSubjectIcon = (code) => {
  switch (code) {
    case 'ME24102':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="math-logo-svg">
          <path d="M12 2L2 22h20L12 2z" />
          <line x1="12" y1="2" x2="12" y2="22" />
          <line x1="7" y1="12" x2="17" y2="12" />
        </svg>
      );
    case 'EC24102':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="math-logo-svg">
          <rect x="2" y="2" width="20" height="20" rx="4" />
          <path d="M7 12h10M12 7v10" />
          <circle cx="7" cy="12" r="1.5" fill="currentColor" />
          <circle cx="17" cy="12" r="1.5" fill="currentColor" />
        </svg>
      );
    case 'CH24102':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="math-logo-svg">
          <path d="M9 3H15M10 3V12L4 20H20L14 12V3" />
          <path d="M7 15H17" opacity="0.5" />
        </svg>
      );
    case 'PE24102':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="math-logo-svg">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      );
    case 'CS24102':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="math-logo-svg">
          <polyline points="16 18 22 12 16 6"></polyline>
          <polyline points="8 6 2 12 8 18"></polyline>
        </svg>
      );
    case 'PH24102':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="math-logo-svg">
          <path d="M9 3H15M10 3V12L4 20H20L14 12V3" />
          <path d="M7 15H17" opacity="0.5" />
        </svg>
      );
    case 'EE24102':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="math-logo-svg">
          <rect x="2" y="2" width="20" height="20" rx="4" />
          <path d="M7 12h10M12 7v10" />
          <circle cx="7" cy="12" r="1.5" fill="currentColor" />
          <circle cx="17" cy="12" r="1.5" fill="currentColor" />
        </svg>
      );
    default:
      return null;
  }
};

const renderShopIcon = (shop) => {
  switch (shop) {
    case 'Machine':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="math-logo-svg" style={{width: 24, height: 24}}>
          <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z"/>
        </svg>
      );
    case 'Fitting':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="math-logo-svg" style={{width: 24, height: 24}}>
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      );
    case 'Carpentry':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="math-logo-svg" style={{width: 24, height: 24}}>
          <path d="M15 3h6v6l-9 9-6-6 9-9Z" />
          <path d="M18 6l-3 3" />
        </svg>
      );
    case 'Welding':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="math-logo-svg" style={{width: 24, height: 24}}>
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
        </svg>
      );
    default:
      return null;
  }
};

const renderFileIcon = (isZip) => {
  return (
    <div className="card-header-icon-wrapper circle-pink" style={{flexShrink: 0}}>
      {isZip ? (
        <svg className="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      ) : (
        <svg className="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      )}
    </div>
  );
};

const renderImageIcon = () => {
  return (
    <div className="card-header-icon-wrapper circle-pink" style={{flexShrink: 0}}>
      <svg className="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    </div>
  );
};

const eeExperiments = [
  "EXP 1", "EXP 2", "EXP 3", "EXP 4", "EXP 5",
  "EXP 6", "EXP 7", "EXP 8", "EXP 9", "EXP 10"
];

const eeTitles = [
  "Measurement of Low and High resistance",
  "Verification of KCL and KVL",
  "Verification of Superposition Theorem",
  "Verification of Thevenin's and Reciprocity",
  "Verification of Norton's Theorem",
  "3 Phase Star Connection",
  "3 Phase Delta Connection",
  "3 Phase Power Measurement",
  "AC Series Circuit",
  "AC Parallel Circuit"
];

const LabDashboard = ({ subjectCode, theme, onToggleTheme, onBack }) => {
  const [selectedLab, setSelectedLab] = useState(null);
  const [activeMEModal, setActiveMEModal] = useState(null);
  const [activePEShop, setActivePEShop] = useState(null);
  const [activeEEModal, setActiveEEModal] = useState(null);

  // Initialize selectedSemester from subjectCode
  const initialSemester = subjectCode === 'LAB-SEM1' ? 1 : (subjectCode === 'LAB-SEM2' ? 2 : null);
  const [selectedSemester, setSelectedSemester] = useState(initialSemester);

  const renderSubjectHeader = (code, name) => (
    <section className="subject-header-box" style={{ marginBottom: '2.5rem' }}>
      <div className="subject-meta-left">
        <div className="math-logo-box">
          {getSubjectIcon(code)}
        </div>
        <div className="subject-titles">
          <h2 className="subject-title-name">{name}</h2>
          <div className="subject-title-sub">
            <span className="code-badge">{code}</span>
            <span className="bullet-separator">•</span>
            <span className="sem-info">{selectedSemester === 1 ? '1st Semester' : '2nd Semester'}</span>
          </div>
        </div>
      </div>
      <div className="subject-header-hills" aria-hidden="true">
        <svg viewBox="0 0 200 100" preserveAspectRatio="none" className="hills-svg">
          <path d="M10 100 C 40 70, 60 50, 90 75 C 110 90, 130 65, 170 100 Z" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
          <path d="M40 100 C 70 60, 90 40, 120 70 C 145 90, 160 55, 195 100 Z" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
          <path d="M70 100 C 100 50, 125 30, 155 65 C 175 80, 185 70, 200 90" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.8" />
          <circle cx="125" cy="20" r="1.5" fill="currentColor" opacity="0.6" />
          <circle cx="140" cy="28" r="1" fill="currentColor" opacity="0.4" />
          <circle cx="85" cy="40" r="1.2" fill="currentColor" opacity="0.5" />
        </svg>
      </div>
    </section>
  );

  const renderTopBar = () => (
    <header className="dash-header" id="selector-header" style={{ marginBottom: '2rem' }}>
      <div className="dash-header__left">
        <div className="logo-container" onClick={onBack} title="Go back">
          <div className="logo-icon-wrapper">
            <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M4 19.5V15a2 2 0 0 1 2-2h14M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V17" />
              <path d="M6 2v11" />
            </svg>
          </div>
          <span className="logo-text">BitHub LABS</span>
        </div>
      </div>
      <div className="dash-header__right">
        <button 
          className="theme-toggle-btn" 
          onClick={(e) => { e.stopPropagation(); onToggleTheme(); }}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
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
          <span className="theme-toggle-slider"><span className="theme-toggle-knob" /></span>
        </button>
      </div>
    </header>
  );

  const renderSemesterSelection = () => {
    return (
      <div className="dashboard-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {renderTopBar()}
        
        <div style={{ padding: '0 2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', paddingLeft: '1rem' }}>
            <button className="back-subjects-btn" onClick={onBack} style={{marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'var(--dash-text-color)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '1rem', fontWeight: '500'}}>
              <svg className="btn-arrow-left" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{width: 20, height: 20}}>
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>Back to Subjects</span>
            </button>
            <h1 style={{fontFamily: 'var(--font-display, "Advercase", sans-serif)', fontSize: '3rem', margin: '0 0 2rem 0', color: 'var(--dash-text-color)'}}>Select Semester</h1>
          </div>
          
          <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
            <div className="labs-main-grid" style={{ marginBottom: '3rem' }}>
              {[1, 2].map(sem => (
                <button 
                  key={sem}
                  className="subject-selection-btn lab-big-btn"
                  onClick={() => setSelectedSemester(sem)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', width: '100%' }}>
                    <div className="math-logo-box" style={{width: 64, height: 64, flexShrink: 0, fontSize: '1.5rem', fontWeight: 'bold'}}>
                      S{sem}
                    </div>
                    <div className="btn-content-left">
                      <span className="btn-primary-title" style={{fontSize: '1.4rem'}}>Semester {sem}</span>
                      <span className="btn-secondary-code" style={{fontSize: '1.0rem'}}>View Labs</span>
                    </div>
                  </div>
                  <svg className="btn-arrow-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{width: 32, height: 32}}>
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>

        <CreatorsSection theme={theme} />
      </div>
    );
  };

  const renderMainMenu = () => {
    if (!selectedSemester) return renderSemesterSelection();

    const labs = selectedSemester === 1 ? SEM1_LABS : SEM2_LABS;

    return (
      <div className="dashboard-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {renderTopBar()}
        
        <div style={{ padding: '0 2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', paddingLeft: '1rem' }}>
            <button className="back-subjects-btn" onClick={onBack} style={{marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'var(--dash-text-color)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '1rem', fontWeight: '500'}}>
              <svg className="btn-arrow-left" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{width: 20, height: 20}}>
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>Back to Subjects</span>
            </button>
            <h1 style={{fontFamily: 'var(--font-display, "Advercase", sans-serif)', fontSize: '3rem', margin: '0 0 2rem 0', color: 'var(--dash-text-color)'}}>
              Semester {selectedSemester} Labs
            </h1>
          </div>
          
          <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
            <div className="labs-main-grid" style={{ marginBottom: '3rem' }}>
              {Object.entries(labs).map(([code, data]) => (
                <button 
                  key={code}
                  className="subject-selection-btn lab-big-btn"
                  onClick={() => setSelectedLab(code)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', width: '100%' }}>
                    <div className="math-logo-box" style={{width: 64, height: 64, flexShrink: 0}}>
                      {getSubjectIcon(code)}
                    </div>
                    <div className="btn-content-left">
                      <span className="btn-primary-title" style={{fontSize: '1.4rem'}}>{data.name}</span>
                      <span className="btn-secondary-code" style={{fontSize: '1.0rem'}}>{code}</span>
                    </div>
                  </div>
                  <svg className="btn-arrow-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{width: 32, height: 32}}>
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>

        <CreatorsSection theme={theme} />
      </div>
    );
  };

  const renderLabContent = () => {
    switch (selectedLab) {
      case 'ME24102':
        return (
          <div className="dashboard-right-stack" style={{width: '100%', margin: '0 auto'}}>
            <section className="dashboard-card">
              <div className="card-header">
                <div className="card-header-titles">
                  <h3 className="card-title-main">Notes & Manuals</h3>
                  <p className="card-title-sub">PDF materials for Engineering Drawing</p>
                </div>
              </div>
              <div className="subjects-button-list" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '1.5rem'}}>
                {["1. Engg. Drawing Notes .pdf", "2. Drawing Notes.pdf", "3. Proj of Solid.pdf"].map((pdf, idx) => (
                  <button 
                    key={idx}
                    className="subject-selection-btn"
                    onClick={() => window.open(`${API_BASE}/study-material/ME24102/${pdf}`, '_blank')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                      {renderFileIcon(false)}
                      <div className="btn-content-left">
                        <span className="btn-primary-title" style={{ fontSize: '1.1rem', textAlign: 'left', whiteSpace: 'normal' }}>{pdf.replace('.pdf', '')}</span>
                      </div>
                    </div>
                    <svg className="btn-arrow-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                ))}
              </div>
            </section>
            
            <section className="dashboard-card">
              <div className="card-header">
                <div className="card-header-titles">
                  <h3 className="card-title-main">Sample Drawings</h3>
                  <p className="card-title-sub">Visual examples by topic</p>
                </div>
              </div>
              <div className="subjects-button-list" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '1.5rem'}}>
                {meTopics.map((topic, idx) => (
                  <button 
                    key={idx}
                    className="subject-selection-btn"
                    onClick={() => setActiveMEModal(topic)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                      {renderImageIcon()}
                      <div className="btn-content-left">
                        <span className="btn-primary-title" style={{ fontSize: '1.2rem' }}>{topic}</span>
                      </div>
                    </div>
                    <svg className="btn-arrow-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                ))}
              </div>
            </section>
          </div>
        );
      
      case 'PE24102':
        return (
          <div className="dashboard-right-stack" style={{width: '100%', margin: '0 auto'}}>
            <section className="dashboard-card">
              <div className="card-header">
                <div className="card-header-titles">
                  <h3 className="card-title-main">Workshops & Shops</h3>
                  <p className="card-title-sub">Select a shop to view its manuals and files</p>
                </div>
              </div>
              <div className="subjects-button-list" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 350px), 1fr))', gap: '1.5rem'}}>
                {Object.keys(shopFiles).map(shop => (
                  <button 
                    key={shop}
                    className="subject-selection-btn"
                    onClick={() => setActivePEShop(shop)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <div className="math-logo-box" style={{width: 54, height: 54}}>
                        {renderShopIcon(shop)}
                      </div>
                      <div className="btn-content-left">
                        <span className="btn-primary-title" style={{ fontSize: '1.4rem' }}>{shop} Shop</span>
                      </div>
                    </div>
                    <svg className="btn-arrow-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                ))}
              </div>
            </section>
          </div>
        );

      case 'CS24102':
        return <CS24102Dashboard theme={theme} onBack={() => setSelectedLab(null)} />;

      case 'PH24102':
        return (
          <div className="dashboard-right-stack" style={{width: '100%', margin: '0 auto'}}>
            <section className="dashboard-card">
              <div className="card-header">
                <div className="card-header-titles">
                  <h3 className="card-title-main">Physics Lab Manual</h3>
                  <p className="card-title-sub">Official guide for the laboratory</p>
                </div>
              </div>
              <div className="subjects-button-list" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 350px), 1fr))', gap: '1.5rem'}}>
                <button 
                  className="subject-selection-btn"
                  onClick={() => window.open(`${API_BASE}/study-material/PH24102/physics_lab.pdf`, '_blank')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div className="math-logo-box" style={{width: 54, height: 54}}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width: 24, height: 24}}>
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <div className="btn-content-left">
                      <span className="btn-primary-title" style={{ fontSize: '1.4rem' }}>
                        Physics Lab Manual
                      </span>
                    </div>
                  </div>
                  <svg className="btn-arrow-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            </section>
          </div>
        );

      case 'EE24102':
        return (
          <div className="dashboard-right-stack" style={{width: '100%', margin: '0 auto'}}>
            <section className="dashboard-card">
              <div className="card-header">
                <div className="card-header-titles">
                  <h3 className="card-title-main">Experiments</h3>
                  <p className="card-title-sub">Select an experiment to view the manual pages</p>
                </div>
              </div>
              <div className="subjects-button-list" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 350px), 1fr))', gap: '1.5rem'}}>
                {eeExperiments.map((exp, idx) => (
                  <button 
                    key={idx}
                    className="subject-selection-btn"
                    onClick={() => setActiveEEModal(exp)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                      <div className="math-logo-box" style={{width: 54, height: 54, fontSize: '1.2rem', fontWeight: 'bold'}}>
                        {idx + 1}
                      </div>
                      <div className="btn-content-left">
                        <span className="btn-primary-title" style={{ fontSize: '1.1rem', whiteSpace: 'normal', textAlign: 'left', lineHeight: '1.3' }}>
                          {eeTitles[idx]}
                        </span>
                      </div>
                    </div>
                    <svg className="btn-arrow-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                ))}
              </div>
            </section>
          </div>
        );

      case 'EC24102':
      case 'CH24102':
        const isEC = selectedLab === 'EC24102';
        return (
          <div className="dashboard-right-stack" style={{width: '100%', margin: '0 auto'}}>
            <section className="dashboard-card">
              <div className="card-header">
                <div className="card-header-titles">
                  <h3 className="card-title-main">Lab Manual</h3>
                  <p className="card-title-sub">Official guide for the laboratory</p>
                </div>
              </div>
              <div className="subjects-button-list" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 350px), 1fr))', gap: '1.5rem'}}>
                <button 
                  className="subject-selection-btn"
                  onClick={() => window.open(`${API_BASE}/study-material/${selectedLab}/${isEC ? 'ece_lab.pdf' : 'chemistry_lab.pdf'}`, '_blank')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div className="math-logo-box" style={{width: 54, height: 54}}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width: 24, height: 24}}>
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <div className="btn-content-left">
                      <span className="btn-primary-title" style={{ fontSize: '1.4rem' }}>
                        {isEC ? 'ECE Lab Manual' : 'Chemistry Lab Manual'}
                      </span>
                    </div>
                  </div>
                  <svg className="btn-arrow-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
              
              {isEC && (
                <div style={{textAlign: 'center', padding: '2rem 0', opacity: 0.6}}>
                  <span className="btn-secondary-code">More stuff coming soon...</span>
                </div>
              )}
            </section>
          </div>
        );

      default:
        return null;
    }
  };

  if (!selectedLab) {
    return renderMainMenu();
  }

  return (
    <div className="dashboard-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {renderTopBar()}
      
      <div style={{ padding: '0 2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ maxWidth: selectedLab === 'CS24102' ? '100%' : '1000px', width: '100%', margin: '0 auto', paddingLeft: '1rem' }}>
          <button className="back-subjects-btn" onClick={() => setSelectedLab(null)} style={{marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'var(--dash-text-color)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '1rem', fontWeight: '500'}}>
            <svg className="btn-arrow-left" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{width: 20, height: 20}}>
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>Back to Labs Main Menu</span>
          </button>
        </div>

        <div style={{ maxWidth: selectedLab === 'CS24102' ? '100%' : '1000px', width: '100%', margin: '0 auto' }}>
          {renderSubjectHeader(selectedLab, (SEM1_LABS[selectedLab] || SEM2_LABS[selectedLab]).name)}
          {renderLabContent()}
        </div>
      </div>

      <CreatorsSection theme={theme} />

      {/* --- ME24102 Images Modal --- */}
      {activeMEModal && (
        <ME24102Modal 
          activeMEModal={activeMEModal} 
          setActiveMEModal={setActiveMEModal} 
          renderImageIcon={renderImageIcon} 
        />
      )}

      {/* --- PE24102 Shop Modal --- */}
      {activePEShop && (
        <div className="lab-modal-overlay" onClick={() => setActivePEShop(null)}>
          <div className="lab-modal-content" onClick={e => e.stopPropagation()}>
            <div className="lab-modal-header">
              <h3 style={{fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--dash-text-color)'}}>{activePEShop} Shop Files</h3>
              <button className="lab-modal-close" onClick={() => setActivePEShop(null)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width: 24, height: 24}}>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="lab-modal-body">
              <div className="subjects-button-list" style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                {shopFiles[activePEShop].map((file, idx) => {
                  const isZip = file.endsWith('.zip');
                  return (
                    <button 
                      key={idx}
                      className="subject-selection-btn"
                      onClick={() => window.open(`${API_BASE}/study-material/PE24102/${activePEShop}/${file}`, '_blank')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                        {renderFileIcon(isZip)}
                        <div className="btn-content-left">
                          <span className="btn-primary-title" style={{ fontSize: '1.1rem', whiteSpace: 'normal', textAlign: 'left', lineHeight: '1.3' }}>
                            {file.replace(/\.[^/.]+$/, "")}
                          </span>
                        </div>
                      </div>
                      <svg className="btn-arrow-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- EE24102 Image Viewer Modal --- */}
      {activeEEModal && (
        <div className="lab-modal-overlay" onClick={() => setActiveEEModal(null)}>
          <div className="lab-modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '90vw', width: '1200px', height: '90vh', display: 'flex', flexDirection: 'column'}}>
            <div className="lab-modal-header" style={{flexShrink: 0}}>
              <h3 style={{fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--dash-text-color)'}}>
                {activeEEModal}: {eeTitles[eeExperiments.indexOf(activeEEModal)]}
              </h3>
              <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                <button 
                  className="subject-selection-btn" 
                  style={{padding: '0.5rem 1rem', minHeight: 'auto', borderRadius: '6px', fontSize: '0.9rem'}}
                  onClick={() => {
                    // Try to download all images up to 10
                    for(let i = 1; i <= 10; i++) {
                      const link = document.createElement('a');
                      link.href = `/study-material/EE24102/${activeEEModal}/${i}.jpg`;
                      link.download = `${activeEEModal}_Page_${i}.jpg`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width: 16, height: 16, marginRight: 6, display: 'inline-block', verticalAlign: 'middle'}}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Download All
                </button>
                <button className="lab-modal-close" onClick={() => setActiveEEModal(null)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width: 24, height: 24}}>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="lab-modal-body" style={{flex: 1, padding: 0, overflowY: 'auto', background: '#0a0a0a', textAlign: 'center'}}>
              {/* Load up to 15 images dynamically and hide if error */}
              {[...Array(15)].map((_, i) => (
                <div key={i} style={{marginBottom: '1rem'}}>
                  <img 
                    src={`/study-material/EE24102/${activeEEModal}/${i + 1}.jpg`} 
                    alt={`Page ${i + 1}`}
                    style={{maxWidth: '100%', objectFit: 'contain', border: '1px solid #333', boxShadow: '0 4px 20px rgba(0,0,0,0.5)'}}
                    onError={(e) => {
                      e.target.style.display = 'none'; // Hide if missing
                      e.target.parentElement.style.display = 'none';
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ME24102Modal = ({ activeMEModal, setActiveMEModal, renderImageIcon }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/study-material/files?folder=ME24102/${encodeURIComponent(activeMEModal)}`)
      .then(res => res.json())
      .then(data => {
        setFiles(data.files || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [activeMEModal]);

  return (
    <div className="lab-modal-overlay" onClick={() => setActiveMEModal(null)}>
      <div className="lab-modal-content" onClick={e => e.stopPropagation()}>
        <div className="lab-modal-header">
          <h3 style={{fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--dash-text-color)'}}>{activeMEModal} Samples</h3>
          <button className="lab-modal-close" onClick={() => setActiveMEModal(null)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width: 24, height: 24}}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="lab-modal-body">
          <div className="subjects-button-list" style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            {loading ? (
              <p style={{ color: 'var(--dash-text-color)', textAlign: 'center' }}>Loading files...</p>
            ) : files.length === 0 ? (
              <p style={{ color: 'var(--dash-text-color)', textAlign: 'center' }}>No files found in {activeMEModal}</p>
            ) : (
              files.map((file, idx) => (
                <button 
                  key={idx}
                  className="subject-selection-btn"
                  onClick={() => window.open(`${API_BASE}/study-material/ME24102/${encodeURIComponent(activeMEModal)}/${encodeURIComponent(file)}`, '_blank')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                    {renderImageIcon()}
                    <div className="btn-content-left">
                      <span className="btn-primary-title" style={{ fontSize: '1.1rem' }}>{file.split('.')[0]}</span>
                    </div>
                  </div>
                  <svg className="btn-arrow-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabDashboard;
