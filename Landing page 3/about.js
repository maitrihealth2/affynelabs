/**
 * AffyneLabs — About Page Cinematic Controller
 *
 * Architecture:
 *  Phase A (0 → PUSH_END)  : Camera push-in (backdrop scale + wall-plane perspective straighten)
 *  Phase B (PUSH_END → 1)  : Content sections navigate on the wall surface
 *
 * Scroll progress is 0 at top, 1 at the bottom of .about-scroll-track.
 * All animation values are driven from this single progress number via
 * a smoothed lerp on every requestAnimationFrame tick.
 */

window.initAboutPage = function () {
  'use strict';

  /* ── Guard: only run on the about page ── */
  const track = document.getElementById('aboutScrollTrack');
  const stickyScene = document.getElementById('aboutStickyScene');
  if (!track || !stickyScene) return;

  /* ── DOM refs ── */
  const backdrop   = document.getElementById('cinemaBackdrop');
  const wallPlane  = document.getElementById('wallPlane');
  const video      = document.getElementById('aboutVideo');
  const storyBtn   = document.getElementById('storyBtn');
  
  const sections = [
    document.getElementById('secWhoWeAre'),
    document.getElementById('secAbout'),
    document.getElementById('secMission'),
    document.getElementById('secVision'),
  ];

  const missionCallout = document.getElementById('missionCallout');
  const visionCallout  = document.getElementById('visionCallout');
  const dotBtns        = document.querySelectorAll('.sp-dot');

  if (!backdrop || !wallPlane) return;

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     MOBILE NAV DRAWER  (single, clean implementation)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  const menuToggle = document.getElementById('mobileMenuToggle');
  const menuOverlay = document.getElementById('mobileOverlay');

  if (menuToggle && menuOverlay) {
    const setMenuOpen = (open) => {
      menuOverlay.classList.toggle('is-open', open);
      menuToggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    };

    menuToggle.addEventListener('click', () => {
      const isNowOpen = !menuOverlay.classList.contains('is-open');
      setMenuOpen(isNowOpen);
    });

    menuOverlay.addEventListener('click', (e) => {
      if (e.target === menuOverlay) setMenuOpen(false);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menuOverlay.classList.contains('is-open')) {
        setMenuOpen(false);
        menuToggle.focus();
      }
    });
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     VIDEO AUTOPLAY
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  if (video) {
    const tryPlay = () => {
      video.muted = true;
      video.play().catch((e) => console.warn('Video autoplay blocked:', e));
    };
    tryPlay();
    video.addEventListener('loadedmetadata', tryPlay, { once: true });
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     REDUCED MOTION CHECK
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    /* CSS handles the reduced-motion layout; just make all sections visible */
    sections.forEach((sec) => {
      if (sec) {
        sec.classList.add('is-active');
        sec.style.opacity = '1';
        sec.style.visibility = 'visible';
        sec.style.pointerEvents = 'auto';
      }
    });
    return; /* Skip the animation loop entirely */
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     WORD SPLIT for Mission & Vision
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function splitSectionWords(sectionEl) {
    if (!sectionEl) return [];
    const flow = sectionEl.querySelector('.wall-reveal-flow');
    if (!flow) return [];

    const targets = flow.querySelectorAll('.wall-headline, .wall-subtext, .wall-subtext-secondary, .wall-subtext-highlight');
    const words = [];

    targets.forEach((target) => {
      /* Recursively split text nodes into <span class="reveal-word"> */
      function walk(node) {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent;
          if (!text.trim()) return;
          const tokens = text.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          tokens.forEach((tok) => {
            if (!tok) return;
            if (/^\s+$/.test(tok)) {
              frag.appendChild(document.createTextNode(tok));
            } else {
              const span = document.createElement('span');
              span.className = 'reveal-word';
              span.textContent = tok;
              frag.appendChild(span);
              words.push(span);
            }
          });
          node.parentNode.replaceChild(frag, node);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          Array.from(node.childNodes).forEach(walk);
        }
      }
      walk(target);
    });

    return words;
  }

  const missionWords = splitSectionWords(document.getElementById('secMission'));
  const visionWords  = splitSectionWords(document.getElementById('secVision'));

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     SCROLL PROGRESS & RESPONSIVE STATE
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  let targetP  = 0;  /* raw scroll progress  0→1 */
  let currentP = 0;  /* lerped progress */
  let lastP    = -1; /* previous rendered progress for dirty-checking */

  let rp = {};
  function updateResponsiveParams() {
    const w = window.innerWidth;
    const isMobile = w <= 768;
    const isTablet = w <= 1024 && !isMobile;

    rp = {
      isMobile,
      isTablet,
      /* Full immersive camera push-in all the way to the wall */
      bgScaleDelta: isMobile ? 0.60 : isTablet ? 0.88 : 1.15,
      /* Gentle natural camera yaw (degrees) - clean perspective with zero whip */
      initRotY: isMobile ? 3.5 : isTablet ? 5.5 : 7.5,
      /* Subtle chin-up camera pitch */
      initRotX: isMobile ? -0.4 : isTablet ? -0.6 : -0.8,
      /* Text plane optical scale: zooms naturally towards camera as we approach the wall */
      planeScaleStart: isMobile ? 0.88 : 0.82,
      planeScaleEnd: 1.04,
      /* Lateral drift set to 0 so text stays locked onto the wall anchor */
      shiftXEnd: 0,
    };
  }

  function calcTargetProgress() {
    const maxScroll = track.scrollHeight - window.innerHeight;
    if (maxScroll <= 0) { targetP = 0; return; }
    targetP = Math.min(1, Math.max(0, window.scrollY / maxScroll));
  }

  /* Clean up any previous listeners if page was revisited via SPA */
  if (window._aboutScrollHandler) {
    window.removeEventListener('scroll', window._aboutScrollHandler);
    window.removeEventListener('resize', window._aboutResizeHandler);
  }
  if (window._aboutRafId) {
    cancelAnimationFrame(window._aboutRafId);
    window._aboutRafId = null;
  }

  const handleResize = () => {
    updateResponsiveParams();
    calcTargetProgress();
  };

  window._aboutScrollHandler = calcTargetProgress;
  window._aboutResizeHandler = handleResize;

  window.addEventListener('scroll', window._aboutScrollHandler, { passive: true });
  window.addEventListener('resize', window._aboutResizeHandler, { passive: true });
  handleResize();

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     EASING HELPERS
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function easeGlide(t) {
    /* Smooth sinusoidal glide with zero velocity spikes or jerk */
    return 0.5 - 0.5 * Math.cos(Math.PI * t);
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     RENDER ACTIVE SECTION
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function renderSection(activeIdx, opacity, shiftY) {
    sections.forEach((sec, i) => {
      if (!sec) return;
      if (i === activeIdx) {
        sec.classList.add('is-active');
        sec.style.opacity   = opacity.toFixed(4);
        sec.style.transform = `translate3d(0, calc(-50% + ${shiftY}px), 0)`;
        sec.style.visibility = 'visible';
        sec.style.pointerEvents = 'auto';
      } else {
        sec.classList.remove('is-active');
        sec.style.opacity   = '0';
        sec.style.transform = 'translate3d(0, -50%, 0)';
        sec.style.visibility = 'hidden';
        sec.style.pointerEvents = 'none';
      }
    });

    /* Update progress dots */
    dotBtns.forEach((dot) => {
      const si = parseInt(dot.dataset.section, 10);
      dot.classList.toggle('sp-dot--active', si === activeIdx);
    });
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     WORD REVEAL CONTROLLER
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function updateWordReveals(activeIdx, localP) {
    /* ── Mission (section 2) ── */
    if (activeIdx < 2) {
      missionWords.forEach((w) => w.classList.remove('is-revealed'));
      if (missionCallout) missionCallout.classList.remove('is-active');
    } else if (activeIdx === 2) {
      /* Words reveal from 0.02 → 0.55 of localP, then hold until end */
      const ratio = Math.min(1, Math.max(0, (localP - 0.02) / 0.53));
      const count = Math.round(ratio * missionWords.length);
      missionWords.forEach((w, idx) => w.classList.toggle('is-revealed', idx < count));
      if (missionCallout) missionCallout.classList.toggle('is-active', ratio > 0.65);
    } else {
      missionWords.forEach((w) => w.classList.add('is-revealed'));
      if (missionCallout) missionCallout.classList.add('is-active');
    }

    /* ── Vision (section 3) ── */
    if (activeIdx < 3) {
      visionWords.forEach((w) => w.classList.remove('is-revealed'));
      if (visionCallout) visionCallout.classList.remove('is-active');
    } else {
      const ratio = Math.min(1, Math.max(0, (localP - 0.02) / 0.53));
      const count = Math.round(ratio * visionWords.length);
      visionWords.forEach((w, idx) => w.classList.toggle('is-revealed', idx < count));
      if (visionCallout) visionCallout.classList.toggle('is-active', ratio > 0.45);
    }
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     MAIN ANIMATION LOOP
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  const PUSH_END = 0.20;

  const SEC_RANGES = [
    { start: 0.00, end: 0.15 },
    { start: 0.15, end: 0.32 },
    { start: 0.32, end: 0.66 },
    { start: 0.66, end: 1.00 },
  ];

  /* Dissolve starts at this fraction of a section's local progress */
  const DISSOLVE_AT = 0.82;

  function tick() {
    /* Smooth lerp with epsilon snapping to eliminate subpixel float micro-vibration */
    const diff = targetP - currentP;
    if (Math.abs(diff) < 0.00004) {
      currentP = targetP;
    } else {
      currentP += diff * 0.075;
    }

    /* Only update DOM when value actually moves */
    if (Math.abs(currentP - lastP) > 0.00001) {
      lastP = currentP;

      if (currentP <= PUSH_END) {
        /* ────────────────────────────────────────────
           PHASE A: CAMERA PUSH-IN (Smooth Glide)
           ──────────────────────────────────────────── */
        const pA = Math.min(1, Math.max(0, currentP / PUSH_END));
        const eA = easeGlide(pA);

        /* Backdrop: GPU-composited 3D scale with gentle Steadicam push */
        const scale = 1.0 + eA * rp.bgScaleDelta;
        backdrop.style.transform = `translate3d(0, 0, 0) scale3d(${scale.toFixed(5)}, ${scale.toFixed(5)}, 1)`;

        /* Wall plane: clean 3D camera orientation gliding straight towards the wall */
        const rotY  = (rp.initRotY * (1 - eA)).toFixed(4);
        const rotX  = (rp.initRotX * (1 - eA)).toFixed(4);
        const planeScale = (rp.planeScaleStart + eA * (rp.planeScaleEnd - rp.planeScaleStart)).toFixed(5);

        wallPlane.style.transform =
          `translate3d(0, 0, 0) scale3d(${planeScale}, ${planeScale}, 1) rotateY(${rotY}deg) rotateX(${rotX}deg)`;

        /* Section 0 stays fully visible during push-in */
        renderSection(0, 1.0, 0);

      } else {
        /* ────────────────────────────────────────────
           PHASE B: CONTENT NAVIGATION
           ──────────────────────────────────────────── */
        /* Camera locked at wall */
        const finalScale = (1.0 + rp.bgScaleDelta).toFixed(5);
        backdrop.style.transform = `translate3d(0, 0, 0) scale3d(${finalScale}, ${finalScale}, 1)`;
        wallPlane.style.transform =
          `translate3d(0, 0, 0) scale3d(${rp.planeScaleEnd}, ${rp.planeScaleEnd}, 1) rotateY(0deg) rotateX(0deg)`;

        /* Normalise progress within Phase B */
        const pB = (currentP - PUSH_END) / (1.0 - PUSH_END);  /* 0→1 */

        /* Which section are we in? */
        let activeIdx = 0;
        let localP    = 0;

        for (let i = 0; i < SEC_RANGES.length; i++) {
          const r = SEC_RANGES[i];
          if (pB >= r.start && (pB < r.end || i === SEC_RANGES.length - 1)) {
            activeIdx = i;
            localP = (r.end > r.start)
              ? Math.min(1, Math.max(0, (pB - r.start) / (r.end - r.start)))
              : 1;
            break;
          }
        }

        /* Word reveals for Mission / Vision */
        updateWordReveals(activeIdx, localP);

        /* Dissolve outgoing section into wall surface */
        let opacity = 1.0;
        let shiftY  = 0;

        const isLastSection = (activeIdx === SEC_RANGES.length - 1);
        if (!isLastSection && localP > DISSOLVE_AT) {
          const fadeP  = (localP - DISSOLVE_AT) / (1.0 - DISSOLVE_AT);
          opacity = 1.0 - fadeP;
          shiftY  = -14 * easeOutCubic(fadeP);
        }

        renderSection(activeIdx, opacity, shiftY);
      }
    }

    window._aboutRafId = requestAnimationFrame(tick);
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     "Our Story" BUTTON  → smooth scroll into Phase B
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  if (storyBtn) {
    storyBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const maxScroll = track.scrollHeight - window.innerHeight;
      const targetScroll = maxScroll * (PUSH_END + 0.06);
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    });
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     PROGRESS DOT NAV  → jump to section
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  dotBtns.forEach((dot) => {
    dot.addEventListener('click', () => {
      const si = parseInt(dot.dataset.section, 10);
      const maxScroll = track.scrollHeight - window.innerHeight;
      let frac;
      if (si === 0) {
        frac = PUSH_END + 0.02;
      } else {
        const r = SEC_RANGES[si];
        const mid = r.start + (r.end - r.start) * 0.25;
        frac = PUSH_END + mid * (1 - PUSH_END);
      }
      window.scrollTo({ top: maxScroll * frac, behavior: 'smooth' });
    });
  });

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     KICKOFF
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  window._aboutRafId = requestAnimationFrame(tick);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', window.initAboutPage);
} else {
  window.initAboutPage();
}
