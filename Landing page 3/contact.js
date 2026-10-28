/**
 * AffyneLabs - Contact Us Page Controller
 * Form validation, submission handling, and responsive mobile navigation
 */

window.initContactPage = function () {
  // Guard: only run on contact page
  if (!document.getElementById('contactForm')) return;

  // ==========================================================================
  // Mobile Navigation Drawer Toggle
  // ==========================================================================
  const toggleBtn = document.getElementById('mobileMenuToggle');
  const overlay = document.getElementById('mobileOverlay');

  if (toggleBtn && overlay) {
    const toggleMenu = (open) => {
      const isOpen = open !== undefined ? open : !overlay.classList.contains('is-open');
      overlay.classList.toggle('is-open', isOpen);
      toggleBtn.setAttribute('aria-expanded', isOpen.toString());
      document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    toggleBtn.addEventListener('click', () => toggleMenu());
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) toggleMenu(false);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
        toggleMenu(false);
      }
    });
  }

  // ==========================================================================
  // Contact Form Validation & Submission
  // ==========================================================================
  const form = document.getElementById('contactForm');
  const nameInput = document.getElementById('contactName');
  const emailInput = document.getElementById('contactEmail');
  const messageInput = document.getElementById('contactMessage');
  const sendBtn = document.getElementById('sendBtn');
  const statusFeedback = document.getElementById('formStatusFeedback');

  const nameError = document.getElementById('nameError');
  const emailError = document.getElementById('emailError');
  const messageError = document.getElementById('messageError');

  if (!form || !nameInput || !emailInput || !messageInput || !sendBtn) {
    return;
  }

  // Email format validation regex (RFC 5322 compatible pattern)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Clear field errors on typing
  const clearFieldError = (input, errorEl) => {
    input.classList.remove('has-error');
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('visible');
    }
  };

  nameInput.addEventListener('input', () => clearFieldError(nameInput, nameError));
  emailInput.addEventListener('input', () => clearFieldError(emailInput, emailError));
  messageInput.addEventListener('input', () => clearFieldError(messageInput, messageError));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Reset general status feedback
    statusFeedback.className = 'form-status-feedback';
    statusFeedback.textContent = '';
    statusFeedback.style.display = 'none';

    // Validate fields
    let isValid = true;
    const nameVal = nameInput.value.trim();
    const emailVal = emailInput.value.trim();
    const messageVal = messageInput.value.trim();

    // Name validation
    if (!nameVal) {
      nameInput.classList.add('has-error');
      nameError.textContent = 'Please enter your name.';
      nameError.classList.add('visible');
      isValid = false;
    } else if (nameVal.length < 2) {
      nameInput.classList.add('has-error');
      nameError.textContent = 'Name must be at least 2 characters.';
      nameError.classList.add('visible');
      isValid = false;
    } else {
      clearFieldError(nameInput, nameError);
    }

    // Email validation
    if (!emailVal) {
      emailInput.classList.add('has-error');
      emailError.textContent = 'Please enter your email address.';
      emailError.classList.add('visible');
      isValid = false;
    } else if (!emailRegex.test(emailVal)) {
      emailInput.classList.add('has-error');
      emailError.textContent = 'Please enter a valid email address.';
      emailError.classList.add('visible');
      isValid = false;
    } else {
      clearFieldError(emailInput, emailError);
    }

    // Message validation
    if (!messageVal) {
      messageInput.classList.add('has-error');
      messageError.textContent = 'Please enter your message.';
      messageError.classList.add('visible');
      isValid = false;
    } else if (messageVal.length < 5) {
      messageInput.classList.add('has-error');
      messageError.textContent = 'Message should be at least 5 characters.';
      messageError.classList.add('visible');
      isValid = false;
    } else {
      clearFieldError(messageInput, messageError);
    }

    if (!isValid) {
      // Focus the first invalid field
      const firstInvalid = form.querySelector('.has-error');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Prevent duplicate submissions: enter processing state
    sendBtn.disabled = true;
    const originalBtnHtml = sendBtn.innerHTML;
    sendBtn.innerHTML = `
      <span>Sending...</span>
      <svg class="btn-spinner" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="animation: spin 1s linear infinite;">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
        <path d="M12 2a10 10 0 0 1 10 10"></path>
      </svg>
    `;

    try {
      /**
       * Backend Integration Point:
       * When ready to connect to an active API, mail service, or serverless handler,
       * replace the mock persistence below with:
       *
       * const response = await fetch('/api/contact', {
       *   method: 'POST',
       *   headers: { 'Content-Type': 'application/json' },
       *   body: JSON.stringify({ name: nameVal, email: emailVal, message: messageVal })
       * });
       * if (!response.ok) throw new Error('Failed to send message');
       */

      // Simulate realistic network roundtrip
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Client-side demo persistence
      try {
        const stored = JSON.parse(localStorage.getItem('affynelabs_contact_submissions') || '[]');
        stored.push({
          name: nameVal,
          email: emailVal,
          message: messageVal,
          submittedAt: new Date().toISOString()
        });
        localStorage.setItem('affynelabs_contact_submissions', JSON.stringify(stored));
      } catch (err) {
        console.warn('LocalStorage unavailable:', err);
      }

      // Display confirmed success feedback
      statusFeedback.className = 'form-status-feedback success';
      statusFeedback.textContent = "Thank you! Your message has been sent. We'll be in touch soon.";
      statusFeedback.style.display = 'block';

      // Reset form fields
      form.reset();

      // Clear success feedback after 8 seconds
      setTimeout(() => {
        if (statusFeedback.textContent.includes('Thank you')) {
          statusFeedback.style.display = 'none';
          statusFeedback.className = 'form-status-feedback';
        }
      }, 8000);

    } catch (error) {
      console.error('Contact submission error:', error);
      statusFeedback.className = 'form-status-feedback error';
      statusFeedback.textContent = 'An error occurred while sending your message. Please try again.';
      statusFeedback.style.display = 'block';
    } finally {
      // Restore button state
      sendBtn.disabled = false;
      sendBtn.innerHTML = originalBtnHtml;
    }
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', window.initContactPage);
} else {
  window.initContactPage();
}
