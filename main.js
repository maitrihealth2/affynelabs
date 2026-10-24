/**
 * Affyne Labs — Main JS
 * - Accessible mobile navigation drawer
 * - Scroll-aware frosted header
 * - Active section navigation link tracking
 * - Progressive scroll-driven word reveal for Section 02 ("The Human Problem")
 * - Calibrated word-by-word scroll reveal for Section 03 ("Mission") in central position
 * - Purposeful horizontal storytelling pinned scroll controller
 * - Lightweight editorial entrance observer
 *
 * Strictly preserves 100% native browser vertical scrolling. Zero wheel hijacking.
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
     2. FLOATING HEADER & SCROLL INDICATOR
     ========================================================================= */
  const siteHeader = document.getElementById('site-header');
  const heroScrollIndicator = document.querySelector('.hero__scroll-indicator');

  function onHeaderScroll() {
    const currentScrollY = window.scrollY;
    if (siteHeader) {
      siteHeader.classList.toggle('scrolled', currentScrollY > 16);
    }
    if (heroScrollIndicator) {
      heroScrollIndicator.classList.toggle('is-hidden', currentScrollY > 50);
    }
  }

  window.addEventListener('scroll', onHeaderScroll, { passive: true });
  onHeaderScroll();

  /* =========================================================================
     2b. SMOOTH ANCHOR SCROLLING WITH FIXED HEADER OFFSET
     ========================================================================= */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          const headerH = siteHeader ? siteHeader.offsetHeight : 72;
          const targetY = targetEl.getBoundingClientRect().top + window.scrollY - headerH;
          window.scrollTo({
            top: Math.max(0, targetY),
            behavior: 'smooth'
          });
          if (history.pushState) {
            history.pushState(null, null, targetId);
          }
        }
      }
    });
  });

  /* =========================================================================
     3. ACTIVE NAVIGATION LINK TRACKING
     ========================================================================= */
  const navLinks = document.querySelectorAll('.nav__link');
  const mobileNavLinks = document.querySelectorAll('.nav__mobile-link');
  const observedSectionIds = ['problem', 'perspective', 'intelligence', 'storytelling', 'principles', 'mission', 'contact'];
  const sections = observedSectionIds.map(function (id) {
    return document.getElementById(id);
  }).filter(Boolean);

  function updateActiveNav() {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight;
    const winHeight = window.innerHeight;
    const headerH = siteHeader ? siteHeader.offsetHeight : 72;
    let currentId = 'problem';

    if (scrollY + winHeight >= docHeight - 80) {
      currentId = 'contact';
    } else {
      sections.forEach(function (section) {
        if (scrollY >= section.offsetTop - headerH - 50) {
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
     4. ACCESSIBLE TEXT TOKENIZER HELPER
     Splits elements into word spans without disrupting reading layout,
     punctuation, or screen reader accessibility.
     ========================================================================= */
  function tokenizeToWords(element, wordClass) {
    if (!element) return [];
    const text = element.textContent.trim();
    element.setAttribute('aria-label', text);
    const words = text.split(/\s+/);
    element.innerHTML = '';
    const spans = [];

    words.forEach(function (word, index) {
      const span = document.createElement('span');
      span.className = wordClass;
      span.textContent = word;
      span.setAttribute('aria-hidden', 'true');
      element.appendChild(span);
      spans.push(span);

      if (index < words.length - 1) {
        const nextWord = words[index + 1];
        if (nextWord === '—') {
          element.appendChild(document.createTextNode('\u00A0'));
        } else {
          element.appendChild(document.createTextNode(' '));
        }
      }
    });

    return spans;
  }

  function applyRevealsToSpans(spans, revealedCount) {
    for (let i = 0; i < spans.length; i++) {
      if (i < revealedCount) {
        spans[i].classList.add('is-revealed');
      } else {
        spans[i].classList.remove('is-revealed');
      }
    }
  }

  /* =========================================================================
     5. SECTION 03: PERSPECTIVE ("WE ARE NOT DEFINED BY A SINGLE PRODUCT")
     Left column: Progressive word-by-word scroll reveal for pullquote.
     Right column: Sentence-by-sentence scroll reveal, link appears last.
     Reversible on reverse scroll, releases smoothly into next section.
     ========================================================================= */
  const perspSection = document.getElementById('perspective');
  const perspStickyFrame = perspSection ? perspSection.querySelector('.perspective__sticky-frame') : null;
  const perspQuoteEl = document.getElementById('perspective-quote');
  const perspSentenceEls = perspSection ? Array.from(perspSection.querySelectorAll('.perspective-sentence')) : [];
  const perspActionEl = document.getElementById('perspective-action');
  const perspPillEl = document.getElementById('perspective-pill');

  let perspQuoteSpans = [];

  if (perspSection && perspQuoteEl) {
    perspQuoteSpans = tokenizeToWords(perspQuoteEl, 'persp-word');

    if (reducedMotion) {
      perspQuoteSpans.forEach(function (s) { s.classList.add('is-revealed'); });
      perspSentenceEls.forEach(function (s) { s.classList.add('is-revealed'); });
      if (perspActionEl) perspActionEl.classList.add('is-revealed');
      if (perspPillEl) perspPillEl.classList.add('is-revealed');
    } else {
      perspSection.classList.add('perspective-section--active');
    }
  }

  function updatePerspectiveScroll() {
    if (!perspSection || reducedMotion) return;

    const isDesktop = window.innerWidth > 1024;
    const headerH = siteHeader ? siteHeader.offsetHeight : 72;
    let progress = 0;

    if (isDesktop && perspStickyFrame) {
      const rect = perspSection.getBoundingClientRect();
      const totalPinDistance = perspSection.offsetHeight - perspStickyFrame.offsetHeight;
      if (totalPinDistance > 0) {
        const scrollPinned = headerH - rect.top;
        progress = Math.min(Math.max(scrollPinned / totalPinDistance, 0), 1);
      }
    } else {
      // Mobile / Tablet: Natural viewport scroll progress without pin trapping
      const rect = perspSection.getBoundingClientRect();
      const vh = window.innerHeight;
      progress = Math.min(Math.max((vh * 0.85 - rect.top) / (rect.height * 0.75), 0), 1);
    }

    // Left column: Word-by-word reveal (progress 0.0 to 0.70)
    let quoteWordCount = 0;
    if (progress <= 0) {
      quoteWordCount = 0;
    } else if (progress < 0.70) {
      const t = progress / 0.70;
      quoteWordCount = Math.min(Math.floor(t * (perspQuoteSpans.length + 1)), perspQuoteSpans.length);
    } else {
      quoteWordCount = perspQuoteSpans.length;
    }
    applyRevealsToSpans(perspQuoteSpans, quoteWordCount);

    // Right column: Sentence-by-sentence reveal
    // Sentence 1: reveals from progress 0.10
    // Sentence 2: reveals from progress 0.35
    // Sentence 3: reveals from progress 0.60
    if (perspSentenceEls.length >= 3) {
      if (progress >= 0.10) {
        perspSentenceEls[0].classList.add('is-revealed');
      } else {
        perspSentenceEls[0].classList.remove('is-revealed');
      }

      if (progress >= 0.35) {
        perspSentenceEls[1].classList.add('is-revealed');
      } else {
        perspSentenceEls[1].classList.remove('is-revealed');
      }

      if (progress >= 0.60) {
        perspSentenceEls[2].classList.add('is-revealed');
      } else {
        perspSentenceEls[2].classList.remove('is-revealed');
      }
    }

    // Link and pill reveal comfortably at 0.72, remaining visible while section settles
    if (progress >= 0.72) {
      if (perspActionEl) perspActionEl.classList.add('is-revealed');
      if (perspPillEl) perspPillEl.classList.add('is-revealed');
    } else {
      if (perspActionEl) perspActionEl.classList.remove('is-revealed');
      if (perspPillEl) perspPillEl.classList.remove('is-revealed');
    }
  }

  /* =========================================================================
     6. SECTION 03: MISSION (PRESERVED & CENTRALLY POSITIONED)
     Calibrated Opal-style word reveal with balanced vertical height and smooth release.
     ========================================================================= */
  const missionTrack = document.getElementById('mission');
  const missionStickyFrame = missionTrack ? missionTrack.querySelector('.mission__sticky-frame') : null;
  const missionStatementEl = document.getElementById('mission-statement');
  const missionBodyEl = document.getElementById('mission-body');

  let statementSpans = [];
  let missionBodySpans = [];

  if (missionTrack && missionStatementEl && missionBodyEl) {
    statementSpans   = tokenizeToWords(missionStatementEl, 'mission-word');
    missionBodySpans = tokenizeToWords(missionBodyEl, 'mission-word');

    if (reducedMotion) {
      [...statementSpans, ...missionBodySpans].forEach(function (s) {
        s.classList.add('is-revealed');
      });
    } else {
      missionTrack.classList.add('mission-section--active');
    }
  }

  function updateMissionScroll() {
    if (!missionTrack || reducedMotion) return;

    const isDesktop = window.innerWidth > 1024;
    const headerH = siteHeader ? siteHeader.offsetHeight : 72;
    let progress = 0;

    if (isDesktop && missionStickyFrame) {
      const rect = missionTrack.getBoundingClientRect();
      const totalPinDistance = missionTrack.offsetHeight - missionStickyFrame.offsetHeight;
      if (totalPinDistance > 0) {
        const scrollPinned = headerH - rect.top;
        progress = Math.min(Math.max(scrollPinned / totalPinDistance, 0), 1);
      }
    } else {
      // Mobile / Tablet: Natural viewport scroll progress without pin trapping
      const rect = missionTrack.getBoundingClientRect();
      const vh = window.innerHeight;
      progress = Math.min(Math.max((vh * 0.85 - rect.top) / (rect.height * 0.75), 0), 1);
    }

    let statementCount = 0;
    let bodyCount = 0;

    if (progress <= 0) {
      statementCount = 0;
      bodyCount = 0;
    } else if (progress < 0.40) {
      const t = progress / 0.40;
      statementCount = Math.min(Math.floor(t * (statementSpans.length + 1)), statementSpans.length);
      bodyCount = 0;
    } else if (progress < 0.72) {
      statementCount = statementSpans.length;
      const t = (progress - 0.40) / (0.72 - 0.40);
      bodyCount = Math.min(Math.floor(t * (missionBodySpans.length + 1)), missionBodySpans.length);
    } else {
      // 72% to 100%: Completely revealed for comfortable reading, smoothly releases into Contact
      statementCount = statementSpans.length;
      bodyCount = missionBodySpans.length;
    }

    applyRevealsToSpans(statementSpans, statementCount);
    applyRevealsToSpans(missionBodySpans, bodyCount);
  }

  /* =========================================================================
     7. SECTION 06: HORIZONTAL STORYTELLING SCROLL CONTROLLER
     Desktop: Controlled horizontal track driven by natural vertical scrolling.
     Mobile/Touch: Native horizontal touch scrolling with active indicator sync.
     ========================================================================= */
  const storyWrapper = document.getElementById('story-scroll-wrapper');
  const storySticky = document.getElementById('story-sticky');
  const storyContainer = document.getElementById('story-track-container');
  const storyTrack = document.getElementById('story-track');
  const storyIndicators = document.querySelectorAll('.story-indicator');
  const storyCards = document.querySelectorAll('.story-card');

  function updateIndicators(activeIndex) {
    storyIndicators.forEach(function (indicator, idx) {
      if (idx === activeIndex) {
        indicator.classList.add('is-active');
      } else {
        indicator.classList.remove('is-active');
      }
    });
  }

  function updateStoryScroll() {
    if (!storyWrapper || !storySticky || !storyTrack || !storyContainer) return;

    const isDesktop = window.innerWidth > 1024 && !reducedMotion;

    if (!isDesktop) {
      storyTrack.style.transform = '';
      return;
    }

    const headerH = siteHeader ? siteHeader.offsetHeight : 72;
    const rect = storyWrapper.getBoundingClientRect();
    const totalPinDistance = storyWrapper.offsetHeight - storySticky.offsetHeight;

    if (totalPinDistance <= 0) return;

    const scrollPinned = headerH - rect.top;
    const progress = Math.min(Math.max(scrollPinned / totalPinDistance, 0), 1);

    const trackWidth = storyTrack.scrollWidth;
    const containerWidth = storyContainer.clientWidth;
    const maxTranslate = Math.max(trackWidth - containerWidth + 60, 0);

    const currentTranslate = progress * maxTranslate;
    storyTrack.style.transform = 'translate3d(' + (-currentTranslate) + 'px, 0, 0)';

    const activeStep = Math.min(Math.floor(progress * storyCards.length), storyCards.length - 1);
    updateIndicators(activeStep);
  }

  if (storyContainer) {
    storyContainer.addEventListener('scroll', function () {
      if (window.innerWidth <= 1024) {
        const scrollLeft = storyContainer.scrollLeft;
        const cardWidth = storyCards[0] ? storyCards[0].offsetWidth : 300;
        const activeIdx = Math.min(Math.round(scrollLeft / cardWidth), storyCards.length - 1);
        updateIndicators(activeIdx);
      }
    }, { passive: true });

    storyContainer.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const direction = e.key === 'ArrowRight' ? 1 : -1;
        const cardWidth = storyCards[0] ? storyCards[0].offsetWidth + 24 : 400;

        if (window.innerWidth <= 1024) {
          storyContainer.scrollBy({ left: direction * cardWidth, behavior: 'smooth' });
        } else if (storyWrapper && storySticky) {
          const totalPinDistance = storyWrapper.offsetHeight - storySticky.offsetHeight;
          const stepDistance = totalPinDistance / Math.max(storyCards.length - 1, 1);
          window.scrollBy({ top: direction * stepDistance, behavior: 'smooth' });
        }
      }
    });
  }

  /* =========================================================================
     8. GLOBAL SCROLL & RESIZE RAF LOOP
     ========================================================================= */
  let isTicking = false;
  function onScrollOrResize() {
    if (!isTicking) {
      window.requestAnimationFrame(function () {
        updatePerspectiveScroll();
        updateMissionScroll();
        updateStoryScroll();
        isTicking = false;
      });
      isTicking = true;
    }
  }

  window.addEventListener('scroll', onScrollOrResize, { passive: true });
  window.addEventListener('resize', onScrollOrResize, { passive: true });

  // Initial trigger
  updatePerspectiveScroll();
  updateMissionScroll();
  updateStoryScroll();

  /* =========================================================================
     9. LIGHTWEIGHT EDITORIAL ENTRANCE OBSERVER
     ========================================================================= */
  if (!reducedMotion && 'IntersectionObserver' in window) {
    const revealSelectors = [
      '.hero__content > *',
      '.hero__visual',
      '.problem__intro-heading > *',
      '.problem__intro-narrative > *',
      '.problem-dim-card',
      '.perspective__header > *',
      '.intelligence__header > *',
      '.intelligence__feature-split > *',
      '.story-section__header-row > *',
      '.story-card',
      '.principles__header > *',
      '.principle-row',
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
