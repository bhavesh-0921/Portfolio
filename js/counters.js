/* ============================================
   COUNTERS — Animated number counting
   ============================================ */

export function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.5
  });

  counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element) {
  const target = parseFloat(element.getAttribute('data-count'));
  const suffix = element.getAttribute('data-suffix') || '';
  const prefix = element.getAttribute('data-prefix') || '';
  const duration = 2000; // ms
  const isDecimal = target % 1 !== 0;

  let start = 0;
  let startTime = null;

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const easedProgress = easeOutQuart(progress);
    const current = easedProgress * target;

    if (isDecimal) {
      element.textContent = prefix + current.toFixed(1) + suffix;
    } else {
      element.textContent = prefix + Math.floor(current).toLocaleString() + suffix;
    }

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      if (isDecimal) {
        element.textContent = prefix + target.toFixed(1) + suffix;
      } else {
        element.textContent = prefix + target.toLocaleString() + suffix;
      }
    }
  }

  requestAnimationFrame(step);
}
