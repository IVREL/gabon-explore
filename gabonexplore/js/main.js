// ============================
// GABONEXPLORE – MAIN JS
// ============================

// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Intersection Observer for animations
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
const observer = new IntersectionObserver((entries) => {
  entries.forEach(el => {
    if (el.isIntersecting) {
      el.target.style.opacity = '1';
      el.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

document.querySelectorAll('.dest-card, .exp-item, .testi-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

// Chat functions
function openChat() {
  document.getElementById('chatWidget').classList.remove('hidden');
  document.getElementById('chatToggle').style.display = 'none';
}

function closeChat() {
  document.getElementById('chatWidget').classList.add('hidden');
  document.getElementById('chatToggle').style.display = 'flex';
}

// Mobile menu toggle (basic)
const menuBtn = document.getElementById('menuBtn');
if (menuBtn) {
  menuBtn.addEventListener('click', () => {
    const navLinks = document.querySelector('.nav-links');
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    navLinks.style.flexDirection = 'column';
    navLinks.style.position = 'absolute';
    navLinks.style.top = '70px';
    navLinks.style.left = '0';
    navLinks.style.right = '0';
    navLinks.style.background = 'rgba(13,34,24,0.98)';
    navLinks.style.padding = '1.5rem 2rem';
    navLinks.style.borderBottom = '1px solid rgba(200,167,74,0.2)';
  });
}

// URL params for destination pre-selection
const urlParams = new URLSearchParams(window.location.search);
const destParam = urlParams.get('dest');
if (destParam && window.location.pathname.includes('reservations')) {
  const select = document.getElementById('destSelect');
  if (select) select.value = destParam;
}
