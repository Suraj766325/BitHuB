/**
 * App.jsx — BitHub Routing & State Controller
 *
 * Coordinates three views in the application:
 *   1. landing: Campus selection landing page (Jaipur / Mesra)
 *   2. subject-selector: Intermediate course selection arranged by Semester 1 & Semester 2
 *   3. subject-dashboard: Dynamic specific dashboard for active course codes or lab items
 */

import { useState, useCallback, useRef, useEffect, lazy, Suspense } from 'react';
import CampusCard from './components/CampusCard';
import Toast from './components/Toast';

const SubjectSelector = lazy(() => import('./components/SubjectSelector'));
const JaipurDashboard = lazy(() => import('./components/JaipurDashboard'));
const LabDashboard = lazy(() => import('./components/LabDashboard'));
import confetti from 'canvas-confetti';

/* Import campus images from the images directory */
import jaipurImg from '../images/jaipur.png';
import mesraImg from '../images/mesra.png';
// import mananImg from '../ProfilePics/mananonhisweddingnight.jpg'; // BACKUP 69 EASTER EGG

function App() {
  const [view, setView] = useState('landing'); // 'landing', 'subject-selector', 'subject-dashboard'
  const [theme, setTheme] = useState('light'); // 'light', 'dark'
  const [selectedSubjectCode, setSelectedSubjectCode] = useState(null);
  
  const [isMobileMode, setIsMobileMode] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const timerRef = useRef(null);
  const wobbleTimeoutRef = useRef(null);

  /* Synchronize html theme attribute with React state */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  /* Synchronize force-mobile-mode class with React state */
  useEffect(() => {
    if (isMobileMode) {
      document.body.classList.add('force-mobile-mode');
    } else {
      document.body.classList.remove('force-mobile-mode');
    }
  }, [isMobileMode]);

  const toggleMobileMode = useCallback(() => {
    setIsMobileMode(prev => !prev);
  }, []);

  /* Toggle Light / Dark Mode globally */
  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  /* Show a toast notification when a disabled campus is clicked */
  const handleDisabledClick = useCallback((campusName) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    setToastMessage(`${campusName} campus is coming soon!`);
    setToastVisible(true);

    timerRef.current = setTimeout(() => {
      setToastVisible(false);
    }, 2500);
  }, []);

  /* Cleanup timer on unmount */
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  /* Easter egg: listen for '67' to trigger confetti and wobbly page tilt */
  useEffect(() => {
    let keyBuffer = '';
    
    const handleKeyDown = (e) => {
      // Ignore keys when modifier keys (like Ctrl, Alt, Meta) are held down
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      
      const key = e.key;
      if (key && key.length === 1) {
        keyBuffer += key;
        keyBuffer = keyBuffer.slice(-10); // Keep only the last 10 characters
        
        if (keyBuffer.endsWith('67')) {
          // Trigger confetti burst
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 }
          });
          
          confetti({
            particleCount: 60,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
          });

          confetti({
            particleCount: 60,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
          });
          
          // Clean up any existing wobble class and timer
          if (wobbleTimeoutRef.current) {
            clearTimeout(wobbleTimeoutRef.current);
          }
          document.body.classList.remove('easter-egg-wobble');
          
          // Trigger wobbly web page tilt (force reflow to restart animation if triggered rapidly)
          void document.body.offsetWidth;
          
          document.body.classList.add('easter-egg-wobble');
          
          wobbleTimeoutRef.current = setTimeout(() => {
            document.body.classList.remove('easter-egg-wobble');
            wobbleTimeoutRef.current = null;
          }, 1300); // matches the CSS animation duration

          keyBuffer = ''; // Reset the buffer
        }
        /* --- 69 EASTER EGG BACKUP ---
        else if (keyBuffer.endsWith('69')) {
          const duration = 3000;
          const end = Date.now() + duration;

          (function frame() {
            confetti({
              particleCount: 15,
              angle: 60,
              spread: 55,
              origin: { x: 0 },
              colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff']
            });
            confetti({
              particleCount: 15,
              angle: 120,
              spread: 55,
              origin: { x: 1 },
              colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff']
            });

            if (Date.now() < end) {
              requestAnimationFrame(frame);
            }
          }());

          // Brutalist animation
          const rootElement = document.getElementById('root');
          if (rootElement) {
            rootElement.classList.add('easter-egg-brutalist');
          }
          
          let img = document.getElementById('easter-egg-69-img');
          if (!img) {
            img = document.createElement('img');
            img.id = 'easter-egg-69-img';
            img.src = mananImg;
            img.className = 'easter-egg-image-overlay';
            document.body.appendChild(img);
          }
          img.style.display = 'block';

          setTimeout(() => {
            if (rootElement) {
              rootElement.classList.remove('easter-egg-brutalist');
            }
            if (img) {
              img.style.display = 'none';
            }
          }, 3000);

          keyBuffer = ''; // Reset the buffer
        }
        */
      }
    };
    
    window.addEventListener('keydown', handleKeyDown, true); // use capture to ensure it handles keyboard event anywhere
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      if (wobbleTimeoutRef.current) clearTimeout(wobbleTimeoutRef.current);
    };
  }, []);

  // PAGE VIEW ROUTER
  const renderContent = () => {
    let content;
    if (view === 'subject-dashboard' && selectedSubjectCode) {
      if (selectedSubjectCode.startsWith('LAB-')) {
        content = (
          <Suspense fallback={<div className="practice-loader-container"><div className="practice-spinner"></div></div>}>
            <LabDashboard 
              subjectCode={selectedSubjectCode}
              theme={theme} 
              onToggleTheme={toggleTheme} 
              onBack={() => setView('subject-selector')} 
            />
          </Suspense>
        );
      } else {
        content = (
          <Suspense fallback={<div className="practice-loader-container"><div className="practice-spinner"></div></div>}>
            <JaipurDashboard 
              subjectCode={selectedSubjectCode}
              theme={theme} 
              onToggleTheme={toggleTheme} 
              onBack={() => setView('subject-selector')} 
            />
          </Suspense>
        );
      }
    } else if (view === 'subject-selector') {
      content = (
        <Suspense fallback={<div className="practice-loader-container"><div className="practice-spinner"></div></div>}>
          <SubjectSelector
            theme={theme}
            onToggleTheme={toggleTheme}
            onSelectSubject={(code) => {
              setSelectedSubjectCode(code);
              setView('subject-dashboard');
            }}
            onBackToLanding={() => setView('landing')}
          />
        </Suspense>
      );
    } else {
      content = (
        <main className="landing-page" id="landing-page">
          {/* Light/Dark Toggle Switch on landing page top right */}
          <div className="landing-theme-toggle-wrapper">
            <button 
              className="theme-toggle-btn" 
              onClick={toggleTheme}
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              aria-label="Toggle theme mode"
              id="landing-theme-toggle"
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
          </div>

          <h1 className="landing-title" id="bithub-title">BitHub</h1>
          <p className="landing-subtitle" id="campus-subtitle">Select your campus</p>

          <div className="campus-grid" id="campus-grid">
            <CampusCard
              name="JAIPUR"
              image={jaipurImg}
              href="#"
              disabled={false}
              onClick={() => setView('subject-selector')}
            />
            <CampusCard
              name="MESRA"
              image={mesraImg}
              href="/dev-root/index.html"
              disabled={false}
            />
          </div>

          <Toast message={toastMessage} visible={toastVisible} />

          <footer className="landing-footer" id="landing-footer">
            © 2025–2026 Birla Institute of Technology | Team BitHub
          </footer>
        </main>
      );
    }

    return (
      <>
        {content}
      </>
    );
  };

  return renderContent();
}

export default App;
