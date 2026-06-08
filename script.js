document.addEventListener('DOMContentLoaded', () => {

    // ── Mobile menu toggle ────────────────────────────────
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', navLinks.classList.contains('active'));
        });

        // Close nav when a link is clicked (mobile)
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // ── Contributor profile scroll reveal ─────────────────
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, idx) => {
            if (entry.isIntersecting) {
                // Stagger the reveal
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, idx * 80);
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    // Only observe on desktop. Mobile marquee forces immediate visibility.
    if (!window.matchMedia('(max-width: 640px)').matches) {
        document.querySelectorAll('.contributor-profile').forEach(el => {
            revealObserver.observe(el);
        });
    }

    // ── Particle effect (kept but subtle) ─────────────────
    createParticles();
});

function createParticles() {
    const particleContainer = document.createElement('div');
    particleContainer.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;overflow:hidden;';
    document.body.appendChild(particleContainer);

    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        const size = Math.random() * 2 + 1;
        particle.style.cssText = `
            position:absolute;
            width:${size}px;height:${size}px;
            background:rgba(0,212,255,${Math.random() * 0.25 + 0.05});
            border-radius:50%;
            left:${Math.random() * 100}%;
            top:${Math.random() * 100}%;
            animation:float ${12 + Math.random() * 10}s linear infinite;
            animation-delay:${Math.random() * -15}s;
        `;
        particleContainer.appendChild(particle);
    }
}

// ── Float animation (added to stylesheet via JS) ──────────
(function() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0%   { transform: translateY(0px) translateX(0px); opacity: 0; }
            10%  { opacity: 1; }
            90%  { opacity: 0.5; }
            100% { transform: translateY(-100vh) translateX(${Math.random() > 0.5 ? '' : '-'}${Math.random() * 60}px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
})();

// ── Slideshow (for pages that use image sliders) ───────────
(() => {
    const slider = document.querySelector('.slider');
    const radioButtons = document.querySelectorAll('.radio-buttons input[type="radio"]');
    const images = document.querySelectorAll('.slider img');

    if (!slider || images.length === 0) return;

    let currentSlide = 0;

    function showNextSlide() {
        if (images[currentSlide]) images[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % images.length;
        if (images[currentSlide]) images[currentSlide].classList.add('active');
        if (radioButtons && radioButtons[currentSlide]) radioButtons[currentSlide].checked = true;
    }

    function showSelectedSlide(index) {
        if (images[currentSlide]) images[currentSlide].classList.remove('active');
        currentSlide = index;
        if (images[currentSlide]) images[currentSlide].classList.add('active');
    }

    radioButtons.forEach((button, index) => {
        button.addEventListener('change', () => showSelectedSlide(index));
    });

    slider.addEventListener('click', () => showNextSlide());
    setInterval(showNextSlide, 4000);
    images[0].classList.add('active');
})();

// ── Contributor profile hover (flat-card pages fallback) ───
const contributorProfiles = document.querySelectorAll('.contributor-profile');

contributorProfiles.forEach(profile => {
    // For flat (non-cube) cards — add subtle shadow
    if (!profile.querySelector('.cube-container') && !profile.querySelector('.contributor-inner')) {
        profile.addEventListener('mouseenter', () => {
            profile.style.boxShadow = '0 20px 40px rgba(0, 212, 255, 0.18)';
        });
        profile.addEventListener('mouseleave', () => {
            profile.style.boxShadow = '';
        });
    }
});

// ── Profile picture: marquee pause ─────
(function () {
  let pauseTimeout = null;

  function getMarqueeContainer() {
    return document.querySelector('.contributor-list-container');
  }

  function pauseMarquee() {
    const c = getMarqueeContainer();
    if (c) c.classList.add('marquee-paused');
  }

  function resumeMarquee() {
    const c = getMarqueeContainer();
    if (c && c.classList.contains('marquee-active')) {
      c.classList.remove('marquee-paused');
    }
  }

  // Listen on each profile picture
  document.querySelectorAll('.profile-picture').forEach(picture => {
    picture.addEventListener('click', (e) => {
      e.stopPropagation();
      pauseMarquee();
      clearTimeout(pauseTimeout);
      pauseTimeout = setTimeout(() => {
        resumeMarquee();
      }, 4000);
    });
  });
})();

// ── Mobile contributor marquee (right → left, ≤640px only) ──
(function () {
  const MQ = window.matchMedia('(max-width: 640px)');

  let applied = false;
  let styleEl = null;

  function initMarquee() {
    const container = document.querySelector('.contributor-list-container');
    if (!container || applied) return;
    applied = true;

    // Make all real cards visible immediately
    container.querySelectorAll('.contributor-profile').forEach(el => {
      el.classList.add('visible');
    });

    // Clone the full card set once → seamless infinite loop
    const originals = Array.from(container.querySelectorAll('.contributor-profile'));
    originals.forEach(el => {
      const clone = el.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.classList.add('visible', 'marquee-clone');
      container.appendChild(clone);
    });

    const cardW = 400;
    const gap   = 12;
    const setW  = originals.length * (cardW + gap);
    const speed = originals.length * 4; // 12 seconds for one cycle

    // Wrap everything in a single track to prevent animation-delay drift on mobile
    const allCards = container.querySelectorAll('.contributor-profile');
    const track = document.createElement('div');
    track.className = 'marquee-track';
    allCards.forEach(card => track.appendChild(card));
    container.appendChild(track);

    // Inject the keyframe + overrides
    styleEl = document.createElement('style');
    styleEl.id = 'contributor-marquee-style';
    styleEl.textContent = `
      @media (max-width: 640px) {
        .contributor-list-container {
          overflow: visible !important; /* Prevent iOS VRAM culling of off-screen elements */
          position: relative !important;
          display: block !important;
          padding: 4px 0 20px 0 !important; 
        }
        
        .marquee-track {
          display: flex;
          flex-wrap: nowrap;
          gap: ${gap}px;
          padding-left: 20px; /* Visual padding for the first card */
          width: max-content;
          animation: marqueeRTL ${speed}s linear infinite;
          will-change: transform;
        }

        @keyframes marqueeRTL {
          0%   { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-${setW}px, 0, 0); }
        }

        .contributor-list-container.marquee-paused .marquee-track {
          animation-play-state: paused !important;
        }

        .contributor-list-container.marquee-active .contributor-profile {
          transition: none !important;
          transition-delay: 0s !important;
          opacity: 1 !important;
          transform: translateZ(0) !important;
        }

        /* Replace expensive alpha mask with performant solid gradients to eliminate friction */
        .contributor-list-container::before {
          content: '';
          position: absolute;
          top: 0; left: 0; bottom: 0;
          width: 30px;
          background: linear-gradient(90deg, #0c0c0c 0%, transparent 100%);
          z-index: 10;
          pointer-events: none;
        }
        .contributor-list-container::after {
          content: '';
          position: absolute;
          top: 0; right: 0; bottom: 0;
          width: 30px;
          background: linear-gradient(270deg, #0c0c0c 0%, transparent 100%);
          z-index: 10;
          pointer-events: none;
        }
      }
    `;
    document.head.appendChild(styleEl);

    // Start scrolling
    requestAnimationFrame(() => container.classList.add('marquee-active'));

    // Pause on touch, resume on lift
    container.addEventListener('touchstart', () =>
      container.classList.add('marquee-paused'), { passive: true });
    container.addEventListener('touchend', () =>
      container.classList.remove('marquee-paused'), { passive: true });
  }

  function destroyMarquee() {
    if (!applied) return;
    applied = false;
    const container = document.querySelector('.contributor-list-container');
    if (container) {
      container.classList.remove('marquee-active', 'marquee-paused');
      const track = container.querySelector('.marquee-track');
      if (track) {
        track.querySelectorAll('.contributor-profile').forEach(el => {
          if (el.classList.contains('marquee-clone')) {
            el.remove();
          } else {
            container.appendChild(el);
          }
        });
        track.remove();
      }
    }
    if (styleEl) { styleEl.remove(); styleEl = null; }
  }

  function handleMQ(e) {
    e.matches ? initMarquee() : destroyMarquee();
  }

  handleMQ(MQ);
  MQ.addEventListener('change', handleMQ);
})();
