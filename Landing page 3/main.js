/**
 * AffyneLabs - Homepage Scripts
 */

document.addEventListener('DOMContentLoaded', () => {
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

    // Close mobile menu on overlay click outside links
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        toggleMenu(false);
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
        toggleMenu(false);
        toggleBtn.focus();
      }
    });
  }
});

/**
 * Handle Join Waiting List submission
 */
function handleWaitlistSubmit() {
  const emailInput = document.getElementById('waitlistEmail');
  const feedback = document.getElementById('waitlistFeedback');
  const btn = document.getElementById('waitlistBtn');

  if (!emailInput) return;
  const email = emailInput.value.trim();

  // Basic email pattern check
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailPattern.test(email)) {
    if (feedback) {
      feedback.textContent = 'Please enter a valid email address.';
      feedback.className = 'waitlist-feedback error';
      feedback.style.display = 'block';
    }
    return;
  }

  // Save to localStorage for demo persistence
  try {
    const list = JSON.parse(localStorage.getItem('affynelabs_waitlist') || '[]');
    list.push({ email, timestamp: new Date().toISOString() });
    localStorage.setItem('affynelabs_waitlist', JSON.stringify(list));
  } catch (err) {
    console.warn('LocalStorage error:', err);
  }

  // Show friendly success feedback
  if (feedback) {
    feedback.textContent = "✓ You're on the waiting list! We'll be in touch soon.";
    feedback.className = 'waitlist-feedback success';
    feedback.style.display = 'block';
  }

  if (btn) {
    btn.innerHTML = '<span>Added!</span> ✓';
    btn.style.backgroundColor = '#ecfdf5';
    btn.style.color = '#065f46';
  }

  emailInput.disabled = true;
}

