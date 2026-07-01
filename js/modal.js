/* ============================================
   MODAL — Project case study overlays
   ============================================ */

export function initModals() {
  const overlay = document.getElementById('project-modal');
  if (!overlay) return;

  // Open modal triggers
  document.querySelectorAll('[data-project]').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const projectId = trigger.getAttribute('data-project');
      openModal(projectId);
    });
  });

  // Close on X button
  overlay.querySelectorAll('.modal__close').forEach(btn => {
    btn.addEventListener('click', closeModal);
  });

  // Close on backdrop click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // Deep linking: open modal if URL hash matches a project ID
  const hash = window.location.hash.substring(1);
  if (hash) {
    const targetModal = document.getElementById(`modal-${hash}`);
    if (targetModal) {
      // Small delay ensures styles and layout are ready
      setTimeout(() => openModal(hash), 100);
    }
  }
}

function openModal(projectId) {
  const overlay = document.getElementById('project-modal');
  const content = document.getElementById(`modal-${projectId}`);
  if (!overlay || !content) return;

  // Hide all modal contents, show the selected one
  overlay.querySelectorAll('.modal-content').forEach(c => c.style.display = 'none');
  content.style.display = 'block';

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Update URL for sharing
  window.history.replaceState(null, null, '#' + projectId);

  // Scroll modal to top
  overlay.scrollTop = 0;
}

function closeModal() {
  const overlay = document.getElementById('project-modal');
  if (!overlay) return;

  overlay.classList.remove('open');
  document.body.style.overflow = '';
  
  // Remove hash from URL when closing
  window.history.replaceState(null, null, window.location.pathname + window.location.search);
}
