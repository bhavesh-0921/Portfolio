/* ============================================
   MAIN — Entry point, initialization
   ============================================ */

import { initAnimations, initImageReveals } from './animations.js';
import { initNavigation } from './navigation.js';
import { initCounters } from './counters.js';
import { initModals } from './modal.js';

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initAnimations();
  initImageReveals();
  initCounters();
  initModals();
  initContactForm();
});

function initContactForm() {
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('contact-submit-btn');
  const statusDiv = document.getElementById('contact-status');

  if (!form || !submitBtn || !statusDiv) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending Message...';

    statusDiv.style.display = 'none';
    statusDiv.className = 'contact__status';
    statusDiv.textContent = '';

    const formData = new FormData(form);

    try {
      const response = await fetch('https://formsubmit.co/ajax/agrawalbhavesh0903@gmail.com', {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.success === 'true') {
        statusDiv.style.display = 'block';
        statusDiv.classList.add('contact__status--success');
        statusDiv.textContent = 'Thank you! Your message has been sent successfully. I will get back to you shortly.';
        form.reset();
      } else {
        throw new Error(data.message || 'Form submission failed.');
      }
    } catch (err) {
      statusDiv.style.display = 'block';
      statusDiv.classList.add('contact__status--error');
      statusDiv.textContent = 'Oops! Something went wrong while sending your message. Please try again or email me directly.';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
    }
  });
}

