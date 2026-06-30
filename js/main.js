/* ============================================
   MAIN — Entry point, initialization
   ============================================ */

import { initAnimations, initImageReveals } from './animations.js';
import { initNavigation } from './navigation.js';
import { initCounters } from './counters.js';
import { initModals } from './modal.js';
import { initShowcase } from './showcase.js';

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initAnimations();
  initImageReveals();
  initCounters();
  initModals();
  initShowcase();
});
