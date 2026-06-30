/* ============================================
   PROJECT SPASHT_BANDA — Case Study Interactivity
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initRevealAnimations();
  initCounters();
});

/* Scroll reveals */
function initRevealAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* Dynamic counter animations */
function initCounters() {
  const counters = document.querySelectorAll('[data-count-target]');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseFloat(entry.target.getAttribute('data-count-target'));
        const suffix = entry.target.getAttribute('data-count-suffix') || '';
        const duration = 1500; // ms
        const startTime = performance.now();
        
        function updateCounter(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Cubic ease-out
          const easeProgress = 1 - Math.pow(1 - progress, 3);
          const currentValue = progress === 1 ? target : (target * easeProgress);
          
          if (target % 1 === 0) {
            entry.target.textContent = Math.floor(currentValue).toLocaleString() + suffix;
          } else {
            entry.target.textContent = currentValue.toFixed(1) + suffix;
          }
          
          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          }
        }
        
        requestAnimationFrame(updateCounter);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  counters.forEach(c => observer.observe(c));
}
