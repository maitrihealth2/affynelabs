/**
 * AffyneLabs - Contact Us Page Controller
 * Direct mailto link handling and responsive mobile navigation
 */

window.initContactPage = function () {
  // Guard: only run on contact page
  if (!document.querySelector('.contact-main')) return;

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

    toggleBtn.onclick = () => toggleMenu();
    overlay.onclick = (e) => {
      if (e.target === overlay) toggleMenu(false);
    };

    document.onkeydown = (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
        toggleMenu(false);
        toggleBtn.focus();
      }
    };
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', window.initContactPage);
} else {
  window.initContactPage();
}
