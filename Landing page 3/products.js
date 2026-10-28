/**
 * AffyneLabs - Products Page Controller
 * Page is 100% fixed/locked. Only the content on the wall scrolls.
 */

window.initProductsPage = function () {
  // Guard: only run on products page
  if (!document.getElementById('productsScrollTrack')) return;

  // ==========================================================================
  // Mobile Menu Toggle
  // ==========================================================================
  const toggleBtn = document.getElementById('mobileMenuToggle');
  const overlay = document.getElementById('mobileOverlay');

  if (toggleBtn && overlay) {
    const toggleMenu = (open) => {
      const isOpen = open !== undefined ? open : !overlay.classList.contains('is-open');
      overlay.classList.toggle('is-open', isOpen);
      toggleBtn.setAttribute('aria-expanded', isOpen.toString());
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
  // Early Access Waitlist Form Handler
  // ==========================================================================
  const waitlistForm = document.getElementById('productsWaitlistForm');
  const emailInput = document.getElementById('waitlistEmail');
  const feedbackEl = document.getElementById('waitlistFeedback');

  if (waitlistForm && emailInput && feedbackEl) {
    waitlistForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();

      // RFC 5322 check
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        feedbackEl.className = 'waitlist-feedback error';
        feedbackEl.textContent = 'Please enter a valid email address.';
        emailInput.focus();
        return;
      }

      // Store in localStorage for demonstration
      try {
        const storedList = JSON.parse(localStorage.getItem('affynelabs_waitlist') || '[]');
        if (!storedList.includes(email)) {
          storedList.push(email);
          localStorage.setItem('affynelabs_waitlist', JSON.stringify(storedList));
        }
      } catch (err) {
        console.warn('LocalStorage unavailable:', err);
      }

      feedbackEl.className = 'waitlist-feedback success';
      feedbackEl.textContent = "Thank you! You've been added to our early access list.";
      emailInput.value = '';

      setTimeout(() => {
        if (feedbackEl.textContent.includes('Thank you')) {
          feedbackEl.textContent = '';
          feedbackEl.className = 'waitlist-feedback';
        }
      }, 6000);
    });
  }

  // ==========================================================================
  // Wall Content Scroll Controller
  // ==========================================================================
  const viewport = document.getElementById('productsScrollViewport');
  const sections = Array.from(document.querySelectorAll('.wall-section-block'));

  if (!viewport || sections.length === 0) return;

  let targetP = 0;   // raw scroll progress (0 → 1)
  let currentP = 0;  // lerped progress for smooth animation
  let currentStep = 0;
  let isNavigating = false;
  let wheelDebounce = 0;

  function calcProgress() {
    const maxScroll = viewport.scrollHeight - viewport.clientHeight;
    if (maxScroll <= 0) {
      targetP = 0;
      return;
    }
    targetP = Math.min(1, Math.max(0, viewport.scrollTop / maxScroll));
    
    // Determine active step
    if (targetP < 0.30) currentStep = 0;
    else if (targetP < 0.70) currentStep = 1;
    else currentStep = 2;
  }

  // Calculate opacities and offsets for the 3 sections based on progress p
  function updateSections(p) {
    // 3 sections:
    // Plateaus:
    // Section 0 locked: [0.00, 0.20]
    // Transition 0 -> 1: [0.20, 0.40]
    // Section 1 locked: [0.40, 0.60]
    // Transition 1 -> 2: [0.60, 0.80]
    // Section 2 locked: [0.80, 1.00]

    const opacities = [0, 0, 0];
    const offsets = [0, 0, 0];
    const moveRange = 26; // pixels to rise / fall during transition

    if (p <= 0.20) {
      // Section 0 fully locked in center
      opacities[0] = 1;
      offsets[0] = 0;
      opacities[1] = 0;
      offsets[1] = moveRange;
      opacities[2] = 0;
      offsets[2] = moveRange;
    } else if (p < 0.40) {
      // Transition from Section 0 to Section 1
      const t = (p - 0.20) / (0.40 - 0.20);
      const ease = t * t * (3 - 2 * t); // Smoothstep curve
      opacities[0] = 1 - ease;
      offsets[0] = -moveRange * ease;
      opacities[1] = ease;
      offsets[1] = moveRange * (1 - ease);
      opacities[2] = 0;
      offsets[2] = moveRange;
    } else if (p <= 0.60) {
      // Section 1 fully locked in center
      opacities[0] = 0;
      offsets[0] = -moveRange;
      opacities[1] = 1;
      offsets[1] = 0;
      opacities[2] = 0;
      offsets[2] = moveRange;
    } else if (p < 0.80) {
      // Transition from Section 1 to Section 2
      const t = (p - 0.60) / (0.80 - 0.60);
      const ease = t * t * (3 - 2 * t);
      opacities[0] = 0;
      offsets[0] = -moveRange;
      opacities[1] = 1 - ease;
      offsets[1] = -moveRange * ease;
      opacities[2] = ease;
      offsets[2] = moveRange * (1 - ease);
    } else {
      // Section 2 fully locked in center
      opacities[0] = 0;
      offsets[0] = -moveRange;
      opacities[1] = 0;
      offsets[1] = -moveRange;
      opacities[2] = 1;
      offsets[2] = 0;
    }

    sections.forEach((sec, idx) => {
      const op = Math.max(0, Math.min(1, opacities[idx]));
      const off = offsets[idx];

      sec.style.opacity = op.toFixed(3);
      sec.style.transform = `translateY(calc(-50% + ${off.toFixed(1)}px))`;

      if (op > 0.01) {
        sec.style.visibility = 'visible';
        if (op > 0.5) {
          sec.classList.add('is-active');
        } else {
          sec.classList.remove('is-active');
        }
      } else {
        sec.style.visibility = 'hidden';
        sec.classList.remove('is-active');
      }
    });
  }

  // RAF animation tick
  function tick() {
    const diff = targetP - currentP;
    if (Math.abs(diff) > 0.0004) {
      currentP += diff * 0.16;
      updateSections(currentP);
    } else if (currentP !== targetP) {
      currentP = targetP;
      updateSections(currentP);
    }
    requestAnimationFrame(tick);
  }

  // Smooth scroll helper to step index (0, 1, or 2)
  function scrollToStep(stepIndex) {
    const clampedStep = Math.max(0, Math.min(2, stepIndex));
    const targetY = clampedStep * viewport.clientHeight;
    isNavigating = true;
    viewport.scrollTo({
      top: targetY,
      behavior: 'smooth'
    });
    setTimeout(() => {
      isNavigating = false;
    }, 450);
  }

  // Wheel listener: ensure smooth steps on desktop mouse wheel
  window.addEventListener('wheel', (e) => {
    // If mobile menu is open or user is focusing an input, let default handle
    if (overlay && overlay.classList.contains('is-open')) return;
    if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
      return;
    }

    const now = Date.now();
    if (now - wheelDebounce < 400 || isNavigating) return;

    if (Math.abs(e.deltaY) > 20) {
      if (e.deltaY > 0 && currentStep < 2) {
        wheelDebounce = now;
        scrollToStep(currentStep + 1);
      } else if (e.deltaY < 0 && currentStep > 0) {
        wheelDebounce = now;
        scrollToStep(currentStep - 1);
      }
    }
  }, { passive: true });

  // Native scroll listener on viewport (handles mobile touch swipe & snap)
  viewport.addEventListener('scroll', () => {
    calcProgress();
  }, { passive: true });

  window.addEventListener('resize', () => {
    calcProgress();
    updateSections(currentP);
  }, { passive: true });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
      return;
    }

    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      if (currentStep < 2) {
        e.preventDefault();
        scrollToStep(currentStep + 1);
      }
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      if (currentStep > 0) {
        e.preventDefault();
        scrollToStep(currentStep - 1);
      }
    }
  });

  // Initial calculation and kick-off
  calcProgress();
  currentP = targetP;
  updateSections(currentP);
  requestAnimationFrame(tick);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', window.initProductsPage);
} else {
  window.initProductsPage();
}
