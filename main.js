/**
 * Affyne Labs — Main JS
 * - Accessible mobile navigation drawer
 * - Scroll-aware frosted header
 * - Active section navigation link tracking
 * - Opal-style scroll-driven word reveal for Mission section
 * - Lightweight editorial entrance observer
 *
 * Strictly preserves 100% native browser vertical scrolling.
 */

(function () {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =========================================================================
     1. MOBILE NAVIGATION DRAWER
     ========================================================================= */
  const navToggle   = document.getElementById('nav-toggle');
  const navMobile   = document.getElementById('nav-mobile');
  const mobileLinks = navMobile ? navMobile.querySelectorAll('a') : [];

  function openNav() {
    if (!navToggle || !navMobile) return;
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close navigation menu');
    navMobile.classList.add('is-open');
    navMobile.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeNav() {
    if (!navToggle || !navMobile) return;
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

    // Keyboard focus trap inside mobile drawer
    navMobile.addEventListener('keydown', function (e) {
      if (navToggle.getAttribute('aria-expanded') !== 'true') return;
      const focusable = Array.from(navMobile.querySelectorAll('a, button'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];

      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  /* =========================================================================
     2. SMART AUTOHIDING FROSTED HEADER
     Smoothly slides up and hides when scrolling down,
     slides back down and reveals when scrolling up (or at page top).
     ========================================================================= */
  const siteHeader = document.getElementById('site-header');
  let lastScrollY = window.scrollY;
  const SCROLL_DELTA_THRESHOLD = 8;

  function onHeaderScroll() {
    if (!siteHeader) return;
    const currentScrollY = window.scrollY;

    // Apply frosted surface background when past hero lead
    siteHeader.classList.toggle('scrolled', currentScrollY > 12);

    // If mobile drawer is open, keep header visible
    if (navToggle && navToggle.getAttribute('aria-expanded') === 'true') {
      siteHeader.classList.remove('is-hidden');
      lastScrollY = currentScrollY;
      return;
    }

    // Always show header near top of page
    if (currentScrollY <= 80) {
      siteHeader.classList.remove('is-hidden');
      lastScrollY = currentScrollY;
      return;
    }

    const diff = currentScrollY - lastScrollY;

    if (diff > SCROLL_DELTA_THRESHOLD) {
      // Scrolling down -> Hide header
      siteHeader.classList.add('is-hidden');
    } else if (diff < -SCROLL_DELTA_THRESHOLD) {
      // Scrolling back up -> Reveal header
      siteHeader.classList.remove('is-hidden');
    }

    lastScrollY = currentScrollY;
  }

  window.addEventListener('scroll', onHeaderScroll, { passive: true });
  onHeaderScroll();

  /* =========================================================================
     3. ACTIVE NAVIGATION LINK TRACKING
     ========================================================================= */
  const navLinks = document.querySelectorAll('.nav__link');
  const mobileNavLinks = document.querySelectorAll('.nav__mobile-link');
  const observedSectionIds = ['about', 'mission', 'vision', 'exploration', 'product', 'beliefs', 'contact'];
  const sections = observedSectionIds.map(function (id) {
    return document.getElementById(id);
  }).filter(Boolean);

  function updateActiveNav() {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight;
    const winHeight = window.innerHeight;
    let currentId = 'about';

    if (scrollY + winHeight >= docHeight - 90) {
      currentId = 'contact';
    } else {
      sections.forEach(function (section) {
        if (scrollY >= section.offsetTop - 140) {
          currentId = section.id;
        }
      });
    }

    navLinks.forEach(function (link) {
      const isCurrent = link.getAttribute('href') === '#' + currentId;
      if (isCurrent) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });

    mobileNavLinks.forEach(function (link) {
      const isCurrent = link.getAttribute('href') === '#' + currentId;
      if (isCurrent) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  window.addEventListener('resize', updateActiveNav, { passive: true });
  updateActiveNav();

  /* =========================================================================
     4. OPAL-STYLE WORD-BY-WORD SCROLL REVEAL (MISSION SECTION)
     ========================================================================= */
  const missionTrack = document.getElementById('mission');
  const missionStickyFrame = missionTrack ? missionTrack.querySelector('.mission__sticky-frame') : null;
  const missionStatementEl = document.getElementById('mission-statement');
  const missionBodyEl = document.getElementById('mission-body');

  if (missionTrack && missionStickyFrame && missionStatementEl && missionBodyEl && !reducedMotion) {
    function tokenizeToWords(container) {
      const text = container.textContent.trim();
      const words = text.split(/\s+/);
      container.innerHTML = '';

      const spans = [];
      words.forEach(function (word, index) {
        const span = document.createElement('span');
        span.className = 'mission-word';
        span.textContent = word;
        container.appendChild(span);
        spans.push(span);

        if (index < words.length - 1) {
          const nextWord = words[index + 1];
          if (nextWord === '—') {
            container.appendChild(document.createTextNode('\u00A0'));
          } else {
            container.appendChild(document.createTextNode(' '));
          }
        }
      });
      return spans;
    }

    const statementSpans = tokenizeToWords(missionStatementEl);
    const bodySpans = tokenizeToWords(missionBodyEl);

    missionTrack.classList.add('mission-section--active');

    let lastStatementCount = -1;
    let lastBodyCount = -1;

    function applyWordReveal(statementCount, bodyCount) {
      if (statementCount !== lastStatementCount) {
        for (let i = 0; i < statementSpans.length; i++) {
          if (i < statementCount) {
            statementSpans[i].classList.add('is-revealed');
          } else {
            statementSpans[i].classList.remove('is-revealed');
          }
        }
        lastStatementCount = statementCount;
      }

      if (bodyCount !== lastBodyCount) {
        for (let j = 0; j < bodySpans.length; j++) {
          if (j < bodyCount) {
            bodySpans[j].classList.add('is-revealed');
          } else {
            bodySpans[j].classList.remove('is-revealed');
          }
        }
        lastBodyCount = bodyCount;
      }
    }

    function updateMissionScroll() {
      const headerH = siteHeader ? siteHeader.offsetHeight : (window.innerWidth <= 768 ? 64 : 72);
      const rect = missionTrack.getBoundingClientRect();
      const totalPinDistance = missionTrack.offsetHeight - missionStickyFrame.offsetHeight;

      if (totalPinDistance <= 0) {
        applyWordReveal(statementSpans.length, bodySpans.length);
        return;
      }

      const scrollPinned = headerH - rect.top;
      const progress = Math.min(Math.max(scrollPinned / totalPinDistance, 0), 1);

      let statementCount = 0;
      let bodyCount = 0;

      if (progress < 0.04) {
        statementCount = 0;
        bodyCount = 0;
      } else if (progress < 0.44) {
        const t = (progress - 0.04) / (0.44 - 0.04);
        statementCount = Math.min(Math.max(Math.floor(t * (statementSpans.length + 1)), 0), statementSpans.length);
        bodyCount = 0;
      } else if (progress < 0.52) {
        statementCount = statementSpans.length;
        bodyCount = 0;
      } else if (progress < 0.90) {
        statementCount = statementSpans.length;
        const t = (progress - 0.52) / (0.90 - 0.52);
        bodyCount = Math.min(Math.max(Math.floor(t * (bodySpans.length + 1)), 0), bodySpans.length);
      } else {
        // From 90% to 100%, text is completely revealed for comfortable reading before release
        statementCount = statementSpans.length;
        bodyCount = bodySpans.length;
      }

      applyWordReveal(statementCount, bodyCount);
    }

    let isTicking = false;
    function onScrollOrResize() {
      if (!isTicking) {
        window.requestAnimationFrame(function () {
          updateMissionScroll();
          isTicking = false;
        });
        isTicking = true;
      }
    }

    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize, { passive: true });
    updateMissionScroll();
  }

  /* =========================================================================
     5. AUTOMATIC INFINITE HORIZONTAL SHOWCASE
     Hardware-accelerated CSS infinite loop with pause-on-hover/touch
     ========================================================================= */
  // The Understanding Pipeline runs automatically on an infinite, seamless loop via CSS keyframes

  /* =========================================================================
     6. LIGHTWEIGHT EDITORIAL ENTRANCE OBSERVER
     ========================================================================= */
  if (!reducedMotion && 'IntersectionObserver' in window) {
    const revealSelectors = [
      '.hero__content > *',
      '.hero__media-card',
      '.about__thesis-box',
      '.about__narrative',
      '.vision__header > *',
      '.vision__start-block',
      '.pillar-card',
      '.product__arch-box',
      '.belief-row',
      '.contact__inner > *'
    ];

    const elementsToReveal = document.querySelectorAll(revealSelectors.join(', '));
    elementsToReveal.forEach(function (el, index) {
      el.classList.add('reveal');
      el.setAttribute('data-delay', String((index % 4) + 1));
    });

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
        rootMargin: '0px 0px -40px 0px',
      }
    );

    elementsToReveal.forEach(function (el) {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.95) {
        el.classList.add('revealed');
      } else {
        observer.observe(el);
      }
    });
  }

  document.documentElement.classList.add('js-loaded');
})();
