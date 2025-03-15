document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
});



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

// Function to show the previous slide
function showPreviousSlide() {
    images[currentSlide].classList.remove('active');
    currentSlide = (currentSlide - 1 + images.length) % images.length;
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
}, 3000);

// Show the first slide
images[0].classList.add('active');


//necessary for footer

const contributorProfiles = document.querySelectorAll('.contributor-profile');

contributorProfiles.forEach(profile => {
  profile.addEventListener('mouseenter', () => {
    profile.style.transform = 'translateY(-5px)';
    profile.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
  });

  profile.addEventListener('mouseleave', () => {
    profile.style.transform = 'translateY(0)';
    profile.style.boxShadow = 'none';
  });

  profile.addEventListener('click', () => {
    contributorProfiles.forEach(otherProfile => {
      if (otherProfile !== profile) {
        otherProfile.classList.remove('expanded');
      }
    });
    profile.classList.toggle('expanded');
  });
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('.contributor-profile')) {
    contributorProfiles.forEach(profile => {
      profile.classList.remove('expanded');
    });
  }
});
