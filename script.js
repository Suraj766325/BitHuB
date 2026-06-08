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

// ── Profile picture: enlarge-to-card + marquee pause ─────
(function () {
  let activeCard = null; // the .contributor-profile with expanded image

  function getMarqueeContainer() {
    return document.querySelector('.contributor-list-container');
  }

  function pauseMarquee() {
    const c = getMarqueeContainer();
    if (c) c.classList.add('marquee-paused');
  }

  function resumeMarquee() {
    const c = getMarqueeContainer();
    // Only resume if it's actually animating (marquee-active present)
    if (c && c.classList.contains('marquee-active')) {
      c.classList.remove('marquee-paused');
    }
  }

  function collapseCard(card) {
    if (!card) return;
    const img = card.querySelector('.profile-picture');
    if (img) img.classList.remove('enlarged');
    card.classList.remove('img-expanded');
    activeCard = null;
    resumeMarquee();
  }

  function expandCard(card) {
    // Collapse any previously open card first
    if (activeCard && activeCard !== card) {
      collapseCard(activeCard);
    }
    const img = card.querySelector('.profile-picture');
    if (!img) return;

    const isAlreadyExpanded = img.classList.contains('enlarged');
    if (isAlreadyExpanded) {
      // Toggle off
      collapseCard(card);
      return;
    }

    img.classList.add('enlarged');
    card.classList.add('img-expanded');
    activeCard = card;
    pauseMarquee();
  }

  // Listen on each profile picture
  document.querySelectorAll('.profile-picture').forEach(picture => {
    picture.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = picture.closest('.contributor-profile');
      if (card) expandCard(card);
    });
  });

  // Clicking directly on the card (but NOT on the image) collapses if expanded
  document.querySelectorAll('.contributor-profile').forEach(card => {
    card.addEventListener('click', (e) => {
      // If the click came from the image, handled above
      if (e.target.classList.contains('profile-picture')) return;
      // Clicking elsewhere inside an expanded card collapses it
      if (activeCard === card) {
        e.stopPropagation();
        collapseCard(card);
      }
    });
  });

  // Clicking outside any contributor card collapses the active one
  document.addEventListener('click', () => {
    if (activeCard) collapseCard(activeCard);
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

    // Calculate the pixel width of one full set (card + gap)
    const cardW = 400;
    const gap   = 12;
    const setW  = originals.length * (cardW + gap);
    const speed = originals.length * 4; // seconds — more cards = slower

    // Inject the keyframe + overrides
    styleEl = document.createElement('style');
    styleEl.id = 'contributor-marquee-style';
    styleEl.textContent = `
      @media (max-width: 640px) {
        .contributor-list-container {
          overflow: hidden !important;
          -webkit-mask-image: none !important;
          mask-image: none !important;
          flex-wrap: nowrap !important;
          gap: ${gap}px !important;
          padding-left: 20px !important;
          padding-right: 20px !important;
        }
        @keyframes marqueeRTL {
          0%   { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-${setW}px, 0, 0); }
        }
        .contributor-list-container.marquee-active {
          animation: marqueeRTL ${speed}s linear infinite;
          width: max-content;
          cursor: default;
          will-change: transform;
        }
        .contributor-list-container.marquee-paused {
          animation-play-state: paused !important;
        }
        
        /* Remove overflow hidden from profile so the anti-cull hack can expand out */
        .contributor-list-container.marquee-active .contributor-profile {
          overflow: visible !important;
          transition: none !important;
          transition-delay: 0s !important;
          opacity: 1 !important;
          transform: translateZ(0) !important;
          will-change: transform;
          backface-visibility: hidden;
        }

        /* ANTI-CULL HACK: Force mobile browsers to never drop the rasterization 
           of off-screen cards by artificially expanding their bounding box. */
        .contributor-list-container.marquee-active .contributor-profile::after {
          content: '';
          position: absolute;
          top: 0;
          left: -4000px;
          right: -4000px;
          height: 1px;
          pointer-events: none;
          background: transparent;
        }

        .contributor-list-container.marquee-active .contributor-front,
        .contributor-list-container.marquee-active .person-name,
        .contributor-list-container.marquee-active .person-role,
        .contributor-list-container.marquee-active .person-bio,
        .contributor-list-container.marquee-active .social-links,
        .contributor-list-container.marquee-active .founder-badge,
        .contributor-list-container.marquee-active .active-developer-badge {
          transform: translateZ(0);
          will-change: transform;
          backface-visibility: hidden;
        }
        .contributor-list-container.marquee-active .founder-badge::before,
        .contributor-list-container.marquee-active .active-developer-badge::before {
          animation: none !important;
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
      container.querySelectorAll('.marquee-clone').forEach(el => el.remove());
    }
    if (styleEl) { styleEl.remove(); styleEl = null; }
  }

  function handleMQ(e) {
    e.matches ? initMarquee() : destroyMarquee();
  }

  handleMQ(MQ);
  MQ.addEventListener('change', handleMQ);
})();
