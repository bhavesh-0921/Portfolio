/* ============================================
   SHOWCASE — Creative showcase filter tabs
   ============================================ */

export function initShowcase() {
  const filters = document.querySelectorAll('.showcase__filter');
  const items = document.querySelectorAll('.showcase__item');

  if (!filters.length || !items.length) return;

  filters.forEach(filter => {
    filter.addEventListener('click', () => {
      const category = filter.getAttribute('data-filter');

      // Update active filter
      filters.forEach(f => f.classList.remove('active'));
      filter.classList.add('active');

      // Filter items
      items.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        if (category === 'all' || itemCategory === category) {
          item.style.display = '';
          requestAnimationFrame(() => {
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
          });
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.95)';
          setTimeout(() => {
            item.style.display = 'none';
          }, 300);
        }
      });
    });
  });
}
