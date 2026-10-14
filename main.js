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
    { id: 'about',    index: '01', name: 'About' },
    { id: 'mission',  index: '02', name: 'Mission' },
    { id: 'vision',   index: '03', name: 'Vision' },
    { id: 'showcase', index: '04', name: 'Exploration' },
    { id: 'beliefs',  index: '05', name: 'Beliefs' },
    { id: 'product',  index: '06', name: 'Product' },
    { id: 'contact',  index: '07', name: 'Contact' },
  ];

  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link');
  const mobileNavLinks = document.querySelectorAll('.nav__mobile-link');
  const railLinks = document.querySelectorAll('.nav-rail__link');
  const navSpineProgress = document.getElementById('nav-spine-progress');
  const navRailSectionCoord = document.getElementById('nav-rail-section-coord');
  const navRailPct = document.getElementById('nav-rail-pct');
  const navRailTopBtn = document.getElementById('nav-rail-top');

  // Legacy fallback handles
  const railGaugeBar = document.getElementById('nav-rail-bar');
  const railGaugeVal = document.getElementById('nav-rail-val');

  const mobilePill = document.getElementById('mobile-section-pill');
  const mobilePillIdx = document.getElementById('mobile-pill-idx');
  const mobilePillName = document.getElementById('mobile-pill-name');
  const mobilePillBar = document.getElementById('mobile-pill-bar');

  function updateActiveLink() {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight;
    const winHeight = window.innerHeight;
    let current = 'about';

    // Check if scrolled near the bottom of document
    if (scrollY + winHeight >= docHeight - 80) {
      current = 'contact';
    } else {
      sections.forEach(function (s) {
        if (scrollY >= s.offsetTop - 160) current = s.id;
      });
    }

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

    // Overall document scroll progress
    const maxScroll = docHeight - winHeight;
    const progress = maxScroll > 0 ? Math.min(Math.max(scrollY / maxScroll, 0), 1) : 0;
    const percentInt = Math.round(progress * 100);
    const percentStr = percentInt + '%';

    // Update continuous vertical spine progress line
    if (navSpineProgress) {
      navSpineProgress.style.height = (progress * 100) + '%';
    }

    // Update editorial status coordinates
    const activeIdx = sectionData.findIndex(function (item) { return item.id === current; });
    const activeInfo = activeIdx !== -1 ? sectionData[activeIdx] : sectionData[0];
    if (navRailSectionCoord) {
      navRailSectionCoord.textContent = activeInfo.index + ' / 07';
    }
    if (navRailPct) {
      navRailPct.textContent = percentStr;
    }

    // Fallbacks if elements exist
    if (railGaugeBar) railGaugeBar.style.height = (percentInt < 10 ? '0' : '') + percentStr;
    if (railGaugeVal) railGaugeVal.textContent = (percentInt < 10 ? '0' : '') + percentStr;

    // Update mobile section pill
    if (mobilePill) {
      if (scrollY < 120 || (navMobile && navMobile.classList.contains('is-open'))) {
        mobilePill.classList.add('is-hidden');
      } else {
        mobilePill.classList.remove('is-hidden');
      }

      if (mobilePillBar) mobilePillBar.style.width = percentStr;
      if (mobilePillIdx) mobilePillIdx.textContent = activeInfo.index;
      if (mobilePillName) mobilePillName.textContent = activeInfo.name;
    }
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  window.addEventListener('resize', updateActiveLink, { passive: true });
  updateActiveLink();

  // Scroll to top button in navigation rail
  if (navRailTopBtn) {
    navRailTopBtn.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Mobile pill tap to scroll to next section
  if (mobilePill) {
    mobilePill.addEventListener('click', function () {
      let currentIdx = -1;
      const scrollY = window.scrollY;
      sections.forEach(function (s, i) {
        if (scrollY >= s.offsetTop - 160) currentIdx = i;
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
     4b. SHOWCASE HORIZONTAL SCROLL (DESKTOP)
     ========================================================================= */
  const showcaseSection = document.getElementById('showcase');
  const showcaseSticky  = document.getElementById('showcase-sticky');
  const showcaseWindow  = document.getElementById('showcase-window');
  const showcaseTrack   = document.getElementById('showcase-track');

  if (showcaseSection && showcaseSticky && showcaseWindow && showcaseTrack && !reducedMotion) {
    function updateShowcaseDimensions() {
      if (window.innerWidth <= 1024) {
        showcaseSection.style.height = '';
        showcaseTrack.style.transform = '';
        return;
      }

      // Compute total horizontal overflow distance
      const trackWidth = showcaseTrack.scrollWidth;
      const windowWidth = showcaseWindow.clientWidth;
      const maxTranslate = Math.max(trackWidth - windowWidth, 0);

      // Section height determines how far user must scroll vertically to travel across the cards
      const pinDistance = Math.max(maxTranslate * 1.25, window.innerHeight * 1.2);
      showcaseSection.style.height = (pinDistance + window.innerHeight) + 'px';
    }

    function updateShowcaseScroll() {
      if (window.innerWidth <= 1024) return;

      const rect = showcaseSection.getBoundingClientRect();
      const totalPinDistance = showcaseSection.offsetHeight - showcaseSticky.offsetHeight;

      if (totalPinDistance <= 0) return;

      // Progress 0.0 -> 1.0 while pinned
      const scrollPinned = -rect.top;
      const progress = Math.min(Math.max(scrollPinned / totalPinDistance, 0), 1);

      const trackWidth = showcaseTrack.scrollWidth;
      const windowWidth = showcaseWindow.clientWidth;
      const maxTranslate = Math.max(trackWidth - windowWidth, 0);

      const translateX = -progress * maxTranslate;
      showcaseTrack.style.transform = 'translate3d(' + translateX + 'px, 0, 0)';
    }

    let isShowcaseTicking = false;
    function onShowcaseScrollOrResize() {
      if (!isShowcaseTicking) {
        window.requestAnimationFrame(function () {
          updateShowcaseScroll();
          isShowcaseTicking = false;
        });
        isShowcaseTicking = true;
      }
    }

    window.addEventListener('scroll', onShowcaseScrollOrResize, { passive: true });
    window.addEventListener('resize', function () {
      updateShowcaseDimensions();
      onShowcaseScrollOrResize();
    }, { passive: true });

    // Initial calculation
    updateShowcaseDimensions();
    updateShowcaseScroll();
  }

  /* =========================================================================
     5. COHESIVE EDITORIAL SCROLL REVEAL SYSTEM
     ========================================================================= */
  if (!reducedMotion && 'IntersectionObserver' in window) {

    // Orchestrated hierarchy of element entrances:
    // Eyebrow/Category -> Heading -> Intro/Body -> Media/Visual -> Actions
    const revealGroups = [
      // Hero
      { selector: '.hero__eyebrow', cls: 'reveal reveal--first' },
      { selector: '.hero__headline', cls: 'reveal reveal--second' },
      { selector: '.hero__body', cls: 'reveal reveal--third' },
      { selector: '.hero__actions', cls: 'reveal reveal--fourth' },
      { selector: '.hero__visual', cls: 'reveal--media reveal--fifth' },

      // About
      { selector: '.about__label', cls: 'reveal reveal--first' },
      { selector: '.about__content', cls: 'reveal reveal--second' },

      // Vision
      { selector: '.vision__header .eyebrow', cls: 'reveal reveal--first' },
      { selector: '.vision__header .heading-xl', cls: 'reveal reveal--second' },
      { selector: '.vision__intro', cls: 'reveal reveal--third' },
      { selector: '.vision__build-label', cls: 'reveal reveal--first' },
      { selector: '.vision__build-heading', cls: 'reveal reveal--second' },
      { selector: '.vision__build-content .body-base', cls: 'reveal reveal--third' },
      { selector: '.vision__media', cls: 'reveal--media reveal--fourth' },

      // Showcase intro
      { selector: '.showcase__header-left', cls: 'reveal reveal--first' },
      { selector: '.showcase__header-right', cls: 'reveal reveal--second' },
      { selector: '.showcase__track-window', cls: 'reveal--media reveal--third' },

      // Beliefs
      { selector: '.principles__header .eyebrow', cls: 'reveal reveal--first' },
      { selector: '.principles__header .heading-xl', cls: 'reveal reveal--second' },

      // Product
      { selector: '.product__header .eyebrow', cls: 'reveal reveal--first' },
      { selector: '.product__header .heading-xl', cls: 'reveal reveal--second' },
      { selector: '.product__intro', cls: 'reveal reveal--third' },
      { selector: '.product__preview-badge-row', cls: 'reveal reveal--first' },
      { selector: '.product__preview-title', cls: 'reveal reveal--second' },
      { selector: '.product__preview-subtitle', cls: 'reveal reveal--third' },
      { selector: '.product__architecture-media', cls: 'reveal--media reveal--fourth' },

      // Contact
      { selector: '.contact-cta__inner .eyebrow', cls: 'reveal reveal--first' },
      { selector: '.contact-cta__inner .heading-xl', cls: 'reveal reveal--second' },
      { selector: '.contact-cta__inner .body-lg', cls: 'reveal reveal--third' },
      { selector: '.contact-cta__inner .btn', cls: 'reveal reveal--fourth' },

      // Footer
      { selector: '.footer__brand-block', cls: 'reveal reveal--first' },
      { selector: '.footer__links', cls: 'reveal reveal--second' },
      { selector: '.footer__legal', cls: 'reveal reveal--third' },
    ];

    revealGroups.forEach(function (group) {
      document.querySelectorAll(group.selector).forEach(function (el) {
        group.cls.split(' ').forEach(function (c) {
          el.classList.add(c);
        });
      });
    });

    // Stagger sequential cards in grids/lists
    function staggerGroup(parentSelector, childSelector) {
      document.querySelectorAll(parentSelector).forEach(function (parent) {
        parent.querySelectorAll(childSelector).forEach(function (child, i) {
          child.classList.add('reveal');
          child.setAttribute('data-delay', String(Math.min(i + 1, 5)));
        });
      });
    }

    staggerGroup('.solutions__grid', '.solution-item');
    staggerGroup('.principles__list', '.principle-item');
    staggerGroup('.product__pipeline', '.pipeline-step');

    // IntersectionObserver for elements entering viewport
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
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    // Initial viewport check: reveal elements already in view without animation delay
    document.querySelectorAll('.reveal, .reveal--media').forEach(function (el) {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9) {
        el.classList.add('revealed');
      } else {
        observer.observe(el);
      }
    });
  }

  /* =========================================================================
     6. JS loaded flag
     ========================================================================= */
  document.documentElement.classList.add('js-loaded');

})();
