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
     3. ACTIVE NAV LINK & VERTICAL RAIL TRACKING
     ========================================================================= */
  const sectionData = [
    { id: 'about',   index: '01', name: 'About' },
    { id: 'mission', index: '02', name: 'Mission' },
    { id: 'vision',  index: '03', name: 'Vision' },
    { id: 'beliefs', index: '04', name: 'Beliefs' },
    { id: 'product', index: '05', name: 'Product' },
    { id: 'contact', index: '06', name: 'Contact' },
  ];

  const sections = document.querySelectorAll('section[id], [id="mission"], [id="beliefs"]');
  const navLinks = document.querySelectorAll('.nav__link');
  const mobileNavLinks = document.querySelectorAll('.nav__mobile-link');
  const railLinks = document.querySelectorAll('.nav-rail__link');
  const railGaugeBar = document.getElementById('nav-rail-bar');
  const railGaugeVal = document.getElementById('nav-rail-val');

  const mobilePill = document.getElementById('mobile-section-pill');
  const mobilePillIdx = document.getElementById('mobile-pill-idx');
  const mobilePillName = document.getElementById('mobile-pill-name');
  const mobilePillBar = document.getElementById('mobile-pill-bar');

  function updateActiveLink() {
    let current = '';
    const scrollY = window.scrollY;

    sections.forEach(function (s) {
      if (scrollY >= s.offsetTop - 140) current = s.id;
    });

    if (scrollY < 160) current = '';

    // Update top header links
    navLinks.forEach(function (link) {
      const active = link.getAttribute('href') === '#' + current;
      link.style.color = active ? 'var(--color-text-primary)' : '';
      active
        ? link.setAttribute('aria-current', 'true')
        : link.removeAttribute('aria-current');
    });

    // Update mobile drawer links
    mobileNavLinks.forEach(function (link) {
      const active = link.getAttribute('href') === '#' + current;
      link.style.color = active ? 'var(--color-accent)' : '';
      active
        ? link.setAttribute('aria-current', 'true')
        : link.removeAttribute('aria-current');
    });

    // Update vertical rail links
    railLinks.forEach(function (link) {
      const active = link.getAttribute('data-section') === current;
      if (active) {
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'true');
      } else {
        link.classList.remove('is-active');
        link.removeAttribute('aria-current');
      }
    });

    // Total document scroll percentage
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? Math.min(Math.max(scrollY / maxScroll, 0), 1) : 0;
    const percentInt = Math.round(progress * 100);
    const percentStr = (percentInt < 10 ? '0' : '') + percentInt + '%';

    if (railGaugeBar) railGaugeBar.style.height = percentStr;
    if (railGaugeVal) railGaugeVal.textContent = percentStr;

    // Update mobile section pill
    if (mobilePill) {
      if (scrollY < 140 || (navMobile && navMobile.classList.contains('is-open'))) {
        mobilePill.classList.add('is-hidden');
      } else {
        mobilePill.classList.remove('is-hidden');
      }

      if (mobilePillBar) mobilePillBar.style.width = percentStr;

      const activeInfo = sectionData.find(function (item) { return item.id === current; }) || sectionData[0];
      if (mobilePillIdx) mobilePillIdx.textContent = activeInfo.index;
      if (mobilePillName) mobilePillName.textContent = activeInfo.name;
    }
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();

  // Mobile pill tap to scroll to next section
  if (mobilePill) {
    mobilePill.addEventListener('click', function () {
      let currentIdx = -1;
      const scrollY = window.scrollY;
      sections.forEach(function (s, i) {
        if (scrollY >= s.offsetTop - 140) currentIdx = i;
      });
      const nextIdx = (currentIdx + 1) % sections.length;
      sections[nextIdx].scrollIntoView({ behavior: 'smooth' });
    });
  }

  /* =========================================================================
     4. OPAL-STYLE SCROLL-DRIVEN WORD REVEAL (MISSION SECTION)
     ========================================================================= */
  const missionTrack = document.getElementById('mission');
  const missionStickyFrame = missionTrack ? missionTrack.querySelector('.mission__sticky-frame') : null;
  const missionStatementEl = document.getElementById('mission-statement') || (missionTrack ? missionTrack.querySelector('.mission__statement') : null);
  const missionBodyEl = document.getElementById('mission-body') || (missionTrack ? missionTrack.querySelector('.mission__body') : null);

  if (missionTrack && missionStickyFrame && missionStatementEl && missionBodyEl && !reducedMotion) {
    // Helper to tokenize into words while preserving spaces & punctuation
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
          // Use non-breaking space before em-dash so it never begins a line alone
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

    // Activate sticky scroll mode on container
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
      const siteHeader = document.getElementById('site-header');
      const headerH = siteHeader ? siteHeader.offsetHeight : 60;
      const rect = missionTrack.getBoundingClientRect();
      const totalPinDistance = missionTrack.offsetHeight - missionStickyFrame.offsetHeight;

      if (totalPinDistance <= 0) {
        applyWordReveal(statementSpans.length, bodySpans.length);
        return;
      }

      // Progress goes from 0.0 to 1.0 during pinned range
      const scrollPinned = headerH - rect.top;
      const progress = Math.min(Math.max(scrollPinned / totalPinDistance, 0), 1);

      // Phase 1 (0.00 -> 0.08): Pinned settling, 0 words revealed
      // Phase 2 (0.08 -> 0.48): Mission statement reveal word-by-word
      // Phase 3 (0.48 -> 0.52): Brief reading pause before supporting text
      //         (0.52 -> 0.88): Supporting paragraph reveal word-by-word
      // Phase 4 (0.88 -> 1.00): All text 100% revealed holding plateau
      // Phase 5 (> 1.00): Natural release

      let statementCount = 0;
      let bodyCount = 0;

      if (progress < 0.08) {
        statementCount = 0;
        bodyCount = 0;
      } else if (progress < 0.48) {
        const t = (progress - 0.08) / (0.48 - 0.08);
        statementCount = Math.min(Math.floor(t * statementSpans.length) + 1, statementSpans.length);
        bodyCount = 0;
      } else if (progress < 0.52) {
        statementCount = statementSpans.length;
        bodyCount = 0;
      } else if (progress < 0.88) {
        statementCount = statementSpans.length;
        const t = (progress - 0.52) / (0.88 - 0.52);
        bodyCount = Math.min(Math.floor(t * bodySpans.length) + 1, bodySpans.length);
      } else {
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

    // Initial evaluation on load
    updateMissionScroll();
  }

  /* =========================================================================
     5. SCROLL REVEAL — each element floats in individually
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

      // Vision
      '.vision__header .eyebrow',
      '.vision__header .heading-xl',
      '.vision__intro',
      '.vision__build-label',
      '.vision__build-heading',
      '.vision__build-content .body-base',
      '.vision__media',

      // Beliefs
      '.principles__header .eyebrow',
      '.principles__header .heading-xl',
      '.principle-item',

      // Product
      '.product__header .eyebrow',
      '.product__header .heading-xl',
      '.product__intro',
      '.solution-item',
      '.product__preview-card',

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
     6. JS loaded flag
     ========================================================================= */
  document.documentElement.classList.add('js-loaded');

})();
