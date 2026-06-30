/* ============================================
   ANIMATIONS — Scroll-triggered reveals
   ============================================
   Rule 10: Motion should explain, not decorate.
   Every animation answers "Why is this moving?"
   ============================================ */

export function initAnimations() {
  const revealSelectors = [
    '.reveal',
    '.reveal-left',
    '.reveal-right',
    '.reveal-scale',
    '.stagger-children'
  ];

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  });

  revealSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      observer.observe(el);
    });
  });

  // Subtle depth parallax on hero browsers only — reveals layering (information)
  initHeroParallax();
}

function initHeroParallax() {
  const composition = document.querySelector('.hero__composition');
  if (!composition) return;

  const browsers = composition.querySelectorAll('.hero__browser');
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrolled = window.scrollY;
        if (scrolled > 800) { ticking = false; return; }

        browsers.forEach((browser, i) => {
          const speed = (i + 1) * 0.025;
          browser.style.transform = `translateY(${scrolled * speed}px)`;
        });

        ticking = false;
      });
      ticking = true;
    }
  });
}

// Image reveal — guides attention to content entering viewport
export function initImageReveals() {
  const images = document.querySelectorAll('.img-reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.2
  });

  images.forEach(img => observer.observe(img));
}
