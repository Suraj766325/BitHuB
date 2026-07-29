/**
 * App.jsx — BitHub Routing & State Controller
 *
 * Coordinates three views in the application:
 *   1. landing: Campus selection landing page (Jaipur / Mesra)
 *   2. subject-selector: Intermediate course selection arranged by Semester 1 & Semester 2
 *   3. subject-dashboard: Dynamic specific dashboard for active course codes or lab items
 */

import { useState, useCallback, useRef, useEffect, lazy, Suspense } from 'react';

const SubjectSelector = lazy(() => import('./components/SubjectSelector'));
const JaipurDashboard = lazy(() => import('./components/JaipurDashboard'));
const LabDashboard = lazy(() => import('./components/LabDashboard'));
import confetti from 'canvas-confetti';

function App() {
  const [view, setView] = useState('subject-selector'); // Land directly on subject-selector for Jaipur campus
  const [theme, setTheme] = useState('light'); // 'light', 'dark'
  const [selectedSubjectCode, setSelectedSubjectCode] = useState(null);
  
  const [isMobileMode, setIsMobileMode] = useState(false);
  const wobbleTimeoutRef = useRef(null);

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

  // PAGE VIEW ROUTER
  const renderContent = () => {
    if (view === 'subject-dashboard' && selectedSubjectCode) {
      if (selectedSubjectCode.startsWith('LAB-')) {
        return (
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
        return (
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
    }

    // Default to subject-selector
    return (
      <Suspense fallback={<div className="practice-loader-container"><div className="practice-spinner"></div></div>}>
        <SubjectSelector
          theme={theme}
          onToggleTheme={toggleTheme}
          onSelectSubject={(code) => {
            setSelectedSubjectCode(code);
            setView('subject-dashboard');
          }}
          onBackToLanding={() => { window.location.href = '../index.html'; }}
        />
      </Suspense>
    );
  };

  return renderContent();
}

export default App;
