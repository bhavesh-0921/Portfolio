/* ============================================
   ATELIER AUREA — JavaScript
   ============================================
   Rule 10: Motion should explain, not decorate.
   Rule 22: Animation language — slow, smooth, organic.
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initRevealAnimations();
  initSmoothScroll();
  initMobileMenu();
  initActiveSection();
});

// Scroll-triggered reveals — guides attention to entering content
function initRevealAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .stagger').forEach(el => observer.observe(el));
}

// Smooth scroll — confirms navigation action
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      window.scrollTo({ top: target.offsetTop - 72, behavior: 'smooth' });
      closeMobileMenu();
    });
  });
}

// Mobile menu
function initMobileMenu() {
  const toggle = document.querySelector('.nav__toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  if (!toggle || !mobileNav) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    mobileNav.classList.toggle('open');
    document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
  });

  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileMenu();
  });
}

function closeMobileMenu() {
  const toggle = document.querySelector('.nav__toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  if (toggle) toggle.classList.remove('active');
  if (mobileNav) mobileNav.classList.remove('open');
  document.body.style.overflow = '';
}

// Active section indicator
function initActiveSection() {
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav__link');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        links.forEach(link => {
          const match = link.getAttribute('href') === `#${id}`;
          link.style.color = match ? 'var(--au-text)' : '';
        });
      }
    });
  }, { threshold: 0.3, rootMargin: '-20% 0px -60% 0px' });

  sections.forEach(s => observer.observe(s));
}
