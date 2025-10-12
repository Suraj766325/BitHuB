document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Add scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for scroll animations (excluding course cards)
    document.querySelectorAll('.contributor-profile').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Removed animations for immediate display
    // Course grids show immediately without animation

    // Crazy divider animations
    const dividerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'dividerExplode 2s ease-out forwards';
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.crazy-divider').forEach(divider => {
        dividerObserver.observe(divider);
    });

    // Parallax effect disabled to prevent space issues
    // window.addEventListener('scroll', () => {
    //     const scrolled = window.pageYOffset;
    //     const slider = document.querySelector('.slider-container');
    //     if (slider) {
    //         slider.style.transform = `translateY(${scrolled * 0.5}px)`;
    //     }
    // });

    // Particle effect (simple)
    createParticles();
});

function createParticles() {
    const particleContainer = document.createElement('div');
    particleContainer.style.position = 'fixed';
    particleContainer.style.top = '0';
    particleContainer.style.left = '0';
    particleContainer.style.width = '100%';
    particleContainer.style.height = '100%';
    particleContainer.style.pointerEvents = 'none';
    particleContainer.style.zIndex = '1';
    document.body.appendChild(particleContainer);

    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = '2px';
        particle.style.height = '2px';
        particle.style.background = '#00d4ff';
        particle.style.borderRadius = '50%';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animation = 'float 10s linear infinite';
        particleContainer.appendChild(particle);
    }
}



const slider = document.querySelector('.slider');
const radioButtons = document.querySelectorAll('.radio-buttons input[type="radio"]');
const images = document.querySelectorAll('.slider img');

let currentSlide = 0;

// Function to show the next slide
function showNextSlide() {
    images[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % images.length;
    images[currentSlide].classList.add('active');
    radioButtons[currentSlide].checked = true;
}

// Function to show the selected slide
function showSelectedSlide(index) {
    images[currentSlide].classList.remove('active');
    currentSlide = index;
    images[currentSlide].classList.add('active');
}

// Add event listeners to radio buttons
radioButtons.forEach((button, index) => {
    button.addEventListener('change', () => {
        showSelectedSlide(index);
    });
});

// Add event listener to slider
slider.addEventListener('click', () => {
    showNextSlide();
});

// Start the slideshow
setInterval(() => {
    showNextSlide();
}, 4000);

// Show the first slide
if (images.length > 0) {
    images[0].classList.add('active');
}


// Contributor profiles hover effect
const contributorProfiles = document.querySelectorAll('.contributor-profile');

contributorProfiles.forEach(profile => {
    profile.addEventListener('mouseenter', () => {
        profile.style.transform = 'translateY(-15px) rotate(2deg) scale(1.05)';
        profile.style.boxShadow = '0 20px 40px rgba(0, 212, 255, 0.3)';
    });

    profile.addEventListener('mouseleave', () => {
        profile.style.transform = 'translateY(0) rotate(0deg) scale(1)';
        profile.style.boxShadow = 'none';
    });
});

// Profile picture enlarge on click
const profilePictures = document.querySelectorAll('.profile-picture');

profilePictures.forEach(picture => {
    picture.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent event from bubbling to parent
        
        // Toggle enlarged class
        picture.classList.toggle('enlarged');
    });
});

// Close enlarged picture when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.classList.contains('profile-picture')) {
        profilePictures.forEach(picture => {
            picture.classList.remove('enlarged');
        });
    }
});
