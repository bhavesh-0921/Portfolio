/* ============================================
   NAVIGATION — Sticky nav, smooth scroll, mobile
   ============================================
   Rule 10: No magnetic buttons (decorative).
   Only purposeful interactions.
   ============================================ */

export function initNavigation() {
  initSmoothScroll();
  initMobileMenu();
  initActiveSection();
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;

      const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 64;

      window.scrollTo({
        top: target.offsetTop - offset,
        behavior: 'smooth'
      });

      closeMobileMenu();
    });
  });
}

function initMobileMenu() {
  const toggle = document.querySelector('.navbar__toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (!toggle || !mobileNav) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    mobileNav.classList.toggle('open');
    document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
  });

  mobileNav.querySelectorAll('.mobile-nav__link').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileMenu();
  });
}

function closeMobileMenu() {
  const toggle = document.querySelector('.navbar__toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  if (toggle) toggle.classList.remove('active');
  if (mobileNav) mobileNav.classList.remove('open');
  document.body.style.overflow = '';
}

function initActiveSection() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.navbar__link');

  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, {
    threshold: 0.3,
    rootMargin: '-20% 0px -70% 0px'
  });

  sections.forEach(section => observer.observe(section));
}
