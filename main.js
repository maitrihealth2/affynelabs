/**
 * AffyneLabs — Main JS
 * - Mobile nav (toggle, focus trap, keyboard, resize)
 * - Scroll-aware header
 * - Active nav link tracking
 * - Per-element scroll reveal with stagger (Opal-style)
 */

(function () {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =========================================================================
     1. MOBILE NAV
     ========================================================================= */
  const navToggle   = document.getElementById('nav-toggle');
  const navMobile   = document.getElementById('nav-mobile');
  const mobileLinks = navMobile ? navMobile.querySelectorAll('a') : [];

  function openNav() {
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close navigation menu');
    navMobile.classList.add('is-open');
    navMobile.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeNav() {
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open navigation menu');
    navMobile.classList.remove('is-open');
    navMobile.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (navToggle && navMobile) {
    navToggle.addEventListener('click', function () {
      navToggle.getAttribute('aria-expanded') === 'true' ? closeNav() : openNav();
    });

    mobileLinks.forEach(function (link) {
      link.addEventListener('click', closeNav);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
        closeNav();
        navToggle.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 768) closeNav();
    });

    // Focus trap
    navMobile.addEventListener('keydown', function (e) {
      if (navToggle.getAttribute('aria-expanded') !== 'true') return;
      const focusable = Array.from(navMobile.querySelectorAll('a, button'));
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    });
  }

  /* =========================================================================
     2. SCROLL-AWARE HEADER
     ========================================================================= */
  const siteHeader = document.getElementById('site-header');

  function onHeaderScroll() {
    if (!siteHeader) return;
    siteHeader.classList.toggle('scrolled', window.scrollY > 8);
  }

  window.addEventListener('scroll', onHeaderScroll, { passive: true });
  onHeaderScroll();

  /* =========================================================================
     3. ACTIVE NAV LINK
     ========================================================================= */
  const sections = document.querySelectorAll('section[id], [id="mission"], [id="beliefs"]');
  const navLinks  = document.querySelectorAll('.nav__link');

  function updateActiveLink() {
    let current = '';
    sections.forEach(function (s) {
      if (window.scrollY >= s.offsetTop - 90) current = s.id;
    });
    navLinks.forEach(function (link) {
      const active = link.getAttribute('href') === '#' + current;
      link.style.color = active ? 'var(--color-text-primary)' : '';
      active
        ? link.setAttribute('aria-current', 'true')
        : link.removeAttribute('aria-current');
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });

  /* =========================================================================
     4. SCROLL REVEAL — each element floats in individually
     ========================================================================= */
  if (!reducedMotion && 'IntersectionObserver' in window) {

    /**
     * Mark every element inside a group with a stagger delay index.
     * Pass a CSS selector and the elements will animate in sequence.
     */
    function markGroup(parentSelector, childSelector) {
      document.querySelectorAll(parentSelector).forEach(function (parent) {
        parent.querySelectorAll(childSelector).forEach(function (child, i) {
          child.setAttribute('data-delay', String(i + 1));
        });
      });
    }

    // Set stagger on solutions and principles children
    markGroup('.solutions__grid', '.solution-item');
    markGroup('.principles__list', '.principle-item');

    // ---- Collect all reveal targets ----
    // These map to the .reveal class in CSS.
    // Each element animates independently when it enters the viewport.
    const REVEAL_SELECTORS = [
      // Hero
      '.hero__eyebrow',
      '.hero__headline',
      '.hero__body',
      '.hero__actions',
      '.hero__visual',

      // About
      '.about__label',
      '.about__content',

      // Mission
      '.mission__inner .eyebrow',
      '.mission__statement',
      '.mission__body',

      // Vision
      '.vision__header .eyebrow',
      '.vision__header .heading-xl',
      '.vision__intro',
      '.vision__build-label',
      '.vision__build-heading',
      '.vision__build-content .body-base',

      // Beliefs
      '.principles__header .eyebrow',
      '.principles__header .heading-xl',
      '.principle-item',

      // Team
      '.team__header .eyebrow',
      '.team__header .heading-xl',
      '.team__intro',
      '.team__group',

      // Contact
      '.contact-cta__inner .eyebrow',
      '.contact-cta__inner .heading-xl',
      '.contact-cta__inner .body-lg',
      '.contact-cta__inner .btn',

      // Footer
      '.footer__brand-block',
      '.footer__links',
      '.footer__legal',
    ];

    // Add .reveal to every matched element
    REVEAL_SELECTORS.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (el) {
        el.classList.add('reveal');
      });
    });

    // ---- Observer ----
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -48px 0px',
      }
    );

    document.querySelectorAll('.reveal').forEach(function (el) {
      observer.observe(el);
    });
  }

  /* =========================================================================
     5. JS loaded flag
     ========================================================================= */
  document.documentElement.classList.add('js-loaded');

})();
