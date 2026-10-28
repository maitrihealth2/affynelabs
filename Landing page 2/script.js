/* ==========================================================================
   AFFYNE LABS — Master Interactive Engine & Seamless Transition Controller
   ========================================================================== */

(() => {
  'use strict';

  let isTransitioning = false;

  /* ==========================================================================
     A. AUDIO AMBIANCE GENERATOR (Persistent Web Audio API Synthesizer)
     ========================================================================== */
  let audioCtx = null;
  let isPlayingSound = false;
  let noiseNode = null;
  let gainNode = null;
  let filterNode = null;
  let lfoNode = null;

  function startOceanBreeze() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const bufferSize = audioCtx.sampleRate * 2;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.06;
      b6 = white * 0.115926;
    }

    noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    noiseNode.loop = true;

    filterNode = audioCtx.createBiquadFilter();
    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(320, audioCtx.currentTime);

    lfoNode = audioCtx.createOscillator();
    lfoNode.frequency.setValueAtTime(0.12, audioCtx.currentTime);
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.setValueAtTime(140, audioCtx.currentTime);
    lfoNode.connect(lfoGain);
    lfoGain.connect(filterNode.frequency);

    gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.18, audioCtx.currentTime + 2);

    noiseNode.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    noiseNode.start();
    lfoNode.start();
  }

  function stopOceanBreeze() {
    if (gainNode && audioCtx) {
      gainNode.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 1);
      setTimeout(() => {
        try {
          if (noiseNode) noiseNode.stop();
          if (lfoNode) lfoNode.stop();
        } catch (_) {}
      }, 1000);
    }
  }

  function setupZenAmbiance() {
    const zenToggleBtn = document.getElementById('zenToggleBtn');
    const soundIconOff = document.getElementById('soundIconOff');
    const soundIconOn = document.getElementById('soundIconOn');

    if (!zenToggleBtn) return;

    // Sync visual state if sound is already playing across transitions
    if (isPlayingSound) {
      zenToggleBtn.classList.add('playing');
      soundIconOff?.classList.add('hidden');
      soundIconOn?.classList.remove('hidden');
      zenToggleBtn.setAttribute('title', 'Mute nature ambiance');
    } else {
      zenToggleBtn.classList.remove('playing');
      soundIconOff?.classList.remove('hidden');
      soundIconOn?.classList.add('hidden');
      zenToggleBtn.setAttribute('title', 'Toggle nature ambiance');
    }

    // Clean single click handler
    if (!zenToggleBtn.dataset.boundZen) {
      zenToggleBtn.dataset.boundZen = 'true';
      zenToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!isPlayingSound) {
          startOceanBreeze();
          isPlayingSound = true;
          zenToggleBtn.classList.add('playing');
          soundIconOff?.classList.add('hidden');
          soundIconOn?.classList.remove('hidden');
          zenToggleBtn.setAttribute('title', 'Mute nature ambiance');
        } else {
          stopOceanBreeze();
          isPlayingSound = false;
          zenToggleBtn.classList.remove('playing');
          soundIconOff?.classList.remove('hidden');
          soundIconOn?.classList.add('hidden');
          zenToggleBtn.setAttribute('title', 'Toggle nature ambiance');
        }
      });
    }
  }

  /* ==========================================================================
     B. MASTER PAGE INTERACTIVE ENGINE
     ========================================================================== */
  function initPageInteractiveEngine() {
    setupZenAmbiance();

    // Ensure hero video autoplays smoothly
    const heroVideo = document.getElementById('heroVideo');
    if (heroVideo && heroVideo.paused) {
      heroVideo.play().catch(() => {});
    }

    const siteHeader = document.getElementById('siteHeader');
    const navItems = document.querySelectorAll('.floating-nav-links .nav-item');
    const sections = document.querySelectorAll('.hero-wrapper, .section-who-we-are, .section-what-we-do, .section-get-in-touch, .section-contact, .about-section, .perspective-track, .section-focus-path, .section-principles, .mission-track, .section-commitments, .about-ahead');

    // 1. Header scroll compression handler
    const handleHeaderScroll = () => {
      if (window.scrollY > 40) {
        siteHeader?.classList.add('is-scrolled');
      } else {
        siteHeader?.classList.remove('is-scrolled');
      }
    };
    window.addEventListener('scroll', handleHeaderScroll, { passive: true });
    handleHeaderScroll();

    // 2. Section Intersection Observer for contrast & active nav highlight
    if ('IntersectionObserver' in window && sections.length > 0) {
      const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id;

            // Light sections: who-we-are, what-we-do, perspective, principles, etc.
            if (sectionId === 'who-we-are' || sectionId === 'what-we-do' || sectionId === 'perspective' || sectionId === 'principles') {
              siteHeader?.classList.add('header-light-section');
            } else if (sectionId === 'heroWrapper') {
              siteHeader?.classList.remove('header-light-section');
            }

            // On home page, highlight active section
            if (!document.body.classList.contains('about-page')) {
              navItems.forEach(link => {
                const href = link.getAttribute('href');
                if (href === `#${sectionId}` || (sectionId === 'heroWrapper' && (href === 'index.html' || href === '#'))) {
                  link.classList.add('active');
                } else if (href && href.startsWith('#')) {
                  link.classList.remove('active');
                }
              });
            }
          }
        });
      }, {
        root: null,
        threshold: 0.35
      });

      sections.forEach(sec => sectionObserver.observe(sec));
    }

    // 3. Magnetic Button Interactions (Desktop / Fine pointer)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    if (hasFinePointer && !prefersReducedMotion) {
      const magneticElements = document.querySelectorAll('.btn-magnetic, .btn-waitlist-outline, .btn-waitlist-submit, .btn-contact-submit, .btn-approach, .btn-ahead-primary');

      magneticElements.forEach(btn => {
        if (btn.dataset.boundMagnetic) return;
        btn.dataset.boundMagnetic = 'true';

        let isHovered = false;
        let rafId = null;

        btn.addEventListener('mouseenter', () => { isHovered = true; });
        btn.addEventListener('mousemove', (e) => {
          if (!isHovered) return;
          const rect = btn.getBoundingClientRect();
          const relX = e.clientX - (rect.left + rect.width / 2);
          const relY = e.clientY - (rect.top + rect.height / 2);

          const maxDist = 3.5;
          const pullX = Math.max(-maxDist, Math.min(maxDist, relX * 0.22));
          const pullY = Math.max(-maxDist, Math.min(maxDist, relY * 0.22));

          if (rafId) cancelAnimationFrame(rafId);
          rafId = requestAnimationFrame(() => {
            btn.style.transform = `translate3d(${pullX}px, ${pullY}px, 0)`;
          });
        });

        btn.addEventListener('mouseleave', () => {
          isHovered = false;
          if (rafId) cancelAnimationFrame(rafId);
          btn.style.transform = 'translate3d(0, 0, 0)';
        });
      });

      // 4. Subtle Information Panel Tilt (Hero Cards & Ethos Monolith)
      const tiltPanels = document.querySelectorAll('.glass-card, .ethos-monolith');
      tiltPanels.forEach(panel => {
        if (panel.dataset.boundTilt) return;
        panel.dataset.boundTilt = 'true';

        let rafId = null;
        panel.addEventListener('mousemove', (e) => {
          const rect = panel.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;

          const tiltX = -y * 2.2;
          const tiltY = x * 2.2;

          if (rafId) cancelAnimationFrame(rafId);
          rafId = requestAnimationFrame(() => {
            panel.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translate3d(0, -2px, 0)`;
          });
        });

        panel.addEventListener('mouseleave', () => {
          if (rafId) cancelAnimationFrame(rafId);
          panel.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0)';
        });
      });
    }

    // 5. Bidirectional Scroll-Triggered Section Pop-up Reveals (Entry & Exit)
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    if ('IntersectionObserver' in window && revealElements.length > 0) {
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
          } else {
            // Gracefully reset only when element is clearly offscreen so scrolling near boundaries stays smooth
            const rect = entry.boundingClientRect;
            if (rect.top > window.innerHeight + 60 || rect.bottom < -60) {
              entry.target.classList.remove('is-revealed');
            }
          }
        });
      }, {
        root: null,
        threshold: 0.02,
        rootMargin: '120px 0px 80px 0px'
      });

      revealElements.forEach(el => revealObserver.observe(el));
    } else {
      revealElements.forEach(el => el.classList.add('is-revealed'));
    }

    // 6. Quote Rotator
    const nextQuoteBtn = document.getElementById('nextQuoteBtn');
    const quoteContent = document.getElementById('quoteContent');
    const authorName = document.getElementById('authorName');
    const authorTitle = document.getElementById('authorTitle');

    if (nextQuoteBtn && !nextQuoteBtn.dataset.boundQuote) {
      nextQuoteBtn.dataset.boundQuote = 'true';
      const quotes = [
        {
          quote: "You don’t have to control your thoughts. You just have to stop letting them control you.",
          author: "Dan Millman",
          title: "Author & Philosopher"
        },
        {
          quote: "The intuitive mind is a sacred gift and the rational mind is a faithful servant.",
          author: "Albert Einstein",
          title: "Theoretical Physicist"
        },
        {
          quote: "Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.",
          author: "Thich Nhat Hanh",
          title: "Zen Master & Peace Advocate"
        },
        {
          quote: "In the middle of difficulty lies opportunity for stillness and profound insight.",
          author: "Marcus Aurelius",
          title: "Stoic Philosopher"
        }
      ];

      let currentQuoteIndex = 0;
      nextQuoteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;

        if (quoteContent) quoteContent.style.opacity = '0';
        if (authorName) authorName.style.opacity = '0';
        if (authorTitle) authorTitle.style.opacity = '0';

        setTimeout(() => {
          const item = quotes[currentQuoteIndex];
          if (quoteContent) quoteContent.innerHTML = `&ldquo;${item.quote}&rdquo;`;
          if (authorName) authorName.textContent = item.author;
          if (authorTitle) authorTitle.textContent = item.title;

          if (quoteContent) quoteContent.style.opacity = '1';
          if (authorName) authorName.style.opacity = '1';
          if (authorTitle) authorTitle.style.opacity = '1';
        }, 200);
      });

      [quoteContent, authorName, authorTitle].forEach(el => {
        if (el) el.style.transition = 'opacity 0.25s ease';
      });
    }

    // 7. Waitlist Form Handling
    const waitlistForm = document.getElementById('waitlistForm');
    const emailInput = document.getElementById('emailInput');
    const formFeedback = document.getElementById('formFeedback');
    const submitWaitlistBtn = document.getElementById('submitWaitlistBtn');
    const waitlistModal = document.getElementById('waitlistModal');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const modalDismissBtn = document.getElementById('modalDismissBtn');
    const badgeTicketNumber = document.getElementById('badgeTicketNumber');

    if (waitlistForm && !waitlistForm.dataset.boundWaitlist) {
      waitlistForm.dataset.boundWaitlist = 'true';
      waitlistForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = emailInput?.value.trim() || '';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
          if (formFeedback) {
            formFeedback.textContent = 'Please provide a valid email address.';
            formFeedback.className = 'form-feedback error';
            formFeedback.classList.remove('hidden');
          }
          emailInput?.focus();
          return;
        }

        if (submitWaitlistBtn) {
          submitWaitlistBtn.disabled = true;
          const label = submitWaitlistBtn.querySelector('.btn-label');
          if (label) label.textContent = 'Securing spot...';
        }

        setTimeout(() => {
          const randomTicket = Math.floor(1000 + Math.random() * 9000);
          if (badgeTicketNumber) {
            badgeTicketNumber.textContent = `#${randomTicket.toLocaleString()}`;
          }

          try {
            const waitlist = JSON.parse(localStorage.getItem('affyne_waitlist') || '[]');
            waitlist.push({ email, ticket: randomTicket, date: new Date().toISOString() });
            localStorage.setItem('affyne_waitlist', JSON.stringify(waitlist));
          } catch (_) {}

          if (emailInput) emailInput.value = '';
          if (submitWaitlistBtn) {
            submitWaitlistBtn.disabled = false;
            const label = submitWaitlistBtn.querySelector('.btn-label');
            if (label) label.textContent = 'Join Waitlist';
          }
          if (formFeedback) formFeedback.classList.add('hidden');
          if (waitlistModal) waitlistModal.classList.remove('hidden');
        }, 600);
      });
    }

    const closeWaitlistModal = () => {
      if (waitlistModal) waitlistModal.classList.add('hidden');
    };
    modalCloseBtn?.addEventListener('click', closeWaitlistModal);
    modalDismissBtn?.addEventListener('click', closeWaitlistModal);
    waitlistModal?.addEventListener('click', (e) => {
      if (e.target === waitlistModal) closeWaitlistModal();
    });

    // 8. Instagram Card Follow State Toggle
    const followBtn = document.getElementById('followBtn');
    if (followBtn && !followBtn.dataset.boundFollow) {
      followBtn.dataset.boundFollow = 'true';
      followBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const isFollowing = followBtn.classList.toggle('following');
        followBtn.textContent = isFollowing ? 'Following' : 'Follow';
      });
    }

    // 9. Institutional Contact Form Handling
    const contactForm = document.getElementById('contactForm');
    const contactStatus = document.getElementById('contactStatus');
    const contactSubmitBtn = document.getElementById('contactSubmitBtn');

    if (contactForm && !contactForm.dataset.boundContact) {
      contactForm.dataset.boundContact = 'true';
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('contactName')?.value.trim();
        const email = document.getElementById('contactEmail')?.value.trim();
        const message = document.getElementById('contactMessage')?.value.trim();

        if (!name || !email || !message) {
          if (contactStatus) {
            contactStatus.textContent = 'Please fill out your name, professional email, and message.';
            contactStatus.className = 'contact-form-status error';
            contactStatus.classList.remove('hidden');
          }
          return;
        }

        if (contactSubmitBtn) {
          contactSubmitBtn.disabled = true;
          const span = contactSubmitBtn.querySelector('span');
          if (span) span.textContent = 'Sending inquiry...';
        }

        setTimeout(() => {
          contactForm.reset();
          if (contactSubmitBtn) {
            contactSubmitBtn.disabled = false;
            const span = contactSubmitBtn.querySelector('span');
            if (span) span.textContent = 'Message Sent';
          }

          if (contactStatus) {
            contactStatus.textContent = 'Thank you for reaching out. A senior member of our team will connect with you shortly.';
            contactStatus.className = 'contact-form-status success';
            contactStatus.classList.remove('hidden');
          }

          setTimeout(() => {
            if (contactSubmitBtn) {
              const span = contactSubmitBtn.querySelector('span');
              if (span) span.textContent = 'Get in Touch';
            }
          }, 3000);
        }, 700);
      });
    }

    // 10. Contact Dialog Modal ("Start a conversation")
    const startConversationBtn = document.getElementById('startConversationBtn');
    const contactModal = document.getElementById('contactModal');
    const contactModalCloseBtn = document.getElementById('contactModalCloseBtn');
    const contactModalBackdrop = document.getElementById('contactModalBackdrop');

    const openContactModal = () => {
      if (!contactModal) return;
      contactModal.classList.add('is-open');
      contactModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };

    const closeContactModal = () => {
      if (!contactModal) return;
      contactModal.classList.remove('is-open');
      contactModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    startConversationBtn?.addEventListener('click', openContactModal);
    contactModalCloseBtn?.addEventListener('click', closeContactModal);
    contactModalBackdrop?.addEventListener('click', closeContactModal);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (contactModal?.classList.contains('is-open')) closeContactModal();
        if (waitlistModal && !waitlistModal.classList.contains('hidden')) closeWaitlistModal();
      }
    });

    // 11. Scroll-Driven Word-by-Word Reveal Engine (Perspective & Mission)
    const revealSections = document.querySelectorAll('.scroll-reveal-section');

    revealSections.forEach((section) => {
      if (section.dataset.wordsWrapped === 'true') return;
      section.dataset.wordsWrapped = 'true';

      const targets = section.querySelectorAll('.scroll-word-target');
      if (!targets.length) return;

      const wrapWords = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent;
          const parts = text.split(/(\s+)/);
          const fragment = document.createDocumentFragment();

          parts.forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) {
              fragment.appendChild(document.createTextNode(part));
            } else {
              const span = document.createElement('span');
              span.className = 'word-reveal';
              span.textContent = part;
              fragment.appendChild(span);
            }
          });

          node.parentNode.replaceChild(fragment, node);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          Array.from(node.childNodes).forEach(wrapWords);
        }
      };

      targets.forEach(wrapWords);

      const allWordSpans = Array.from(section.querySelectorAll('.word-reveal'));
      const totalWords = allWordSpans.length;
      if (totalWords === 0) return;

      let isTicking = false;

      const updateWordsOnScroll = () => {
        const rect = section.getBoundingClientRect();
        const sectionHeight = section.offsetHeight;
        const windowHeight = window.innerHeight;
        const maxScroll = sectionHeight - windowHeight;

        if (maxScroll <= 0) {
          allWordSpans.forEach(w => w.classList.add('is-active'));
          return;
        }

        const currentScroll = -rect.top;
        const rawProgress = Math.max(0, Math.min(1, currentScroll / maxScroll));
        // Complete 100% of word & sentence reveals by 76% of the runway
        // The remaining 24% guarantees all text stays fully illuminated and stationary before the section unpins
        const revealProgress = Math.min(1, rawProgress / 0.76);
        const activeCount = Math.floor(revealProgress * (totalWords + 1));

        allWordSpans.forEach((span, index) => {
          if (index < activeCount) {
            span.classList.add('is-active');
            span.classList.remove('is-current');
          } else if (index === activeCount && activeCount > 0 && revealProgress < 1) {
            span.classList.add('is-active', 'is-current');
          } else {
            span.classList.remove('is-active', 'is-current');
          }
        });
      };

      const handleScroll = () => {
        if (!isTicking) {
          requestAnimationFrame(() => {
            updateWordsOnScroll();
            isTicking = false;
          });
          isTicking = true;
        }
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleScroll, { passive: true });
      updateWordsOnScroll();
    });

    // 12. Initialize 3D Cylindrical Carousel (What We Do Section)
    setup3DCylindricalCarousel();
  }

  /* ==========================================================================
     3D CYLINDRICAL CAROUSEL ENGINE (affynelabs WHAT WE DO — INFINITE LOOP)
     ========================================================================== */
  let carouselAutoplayTimer = null;
  let carouselIntersectionObserver = null;

  function setup3DCylindricalCarousel() {
    const wrapper = document.getElementById('carousel3DWrapper');
    const stage = document.getElementById('carousel3DStage');
    const cylinder = document.getElementById('carousel3DCylinder');
    const panels = document.querySelectorAll('.carousel-panel');
    const prevBtn = document.getElementById('carouselPrevBtn');
    const nextBtn = document.getElementById('carouselNextBtn');
    const paginationTabs = document.querySelectorAll('.pagination-step');
    const segmentFill0 = document.getElementById('segmentFill0');
    const segmentFill1 = document.getElementById('segmentFill1');
    const autoplayToggleBtn = document.getElementById('btnAutoplayToggle');
    const autoplayStateLabel = document.getElementById('autoplayStateLabel');
    const autoplayStateIcon = document.getElementById('autoplayStateIcon');
    const section = document.getElementById('what-we-do');

    if (!wrapper || !cylinder || !panels.length) return;

    // Clean up any previous timers / observers
    if (carouselAutoplayTimer) {
      clearInterval(carouselAutoplayTimer);
      carouselAutoplayTimer = null;
    }
    if (carouselIntersectionObserver) {
      carouselIntersectionObserver.disconnect();
      carouselIntersectionObserver = null;
    }

    // Measure active cylinder radius from CSS variable to avoid inline calc parse discrepancies
    function getCylinderRadius() {
      if (!stage) return 410;
      const raw = window.getComputedStyle(stage).getPropertyValue('--cylinder-radius').trim();
      const parsed = parseFloat(raw);
      return isNaN(parsed) || parsed <= 0 ? 410 : parsed;
    }

    // Infinite Cylindrical State
    // Initial active slot is 1 (Panel 02: Safety-Centred AI - matching reference center)
    let currentStep = 1;
    let currentAngle = -currentStep * 60;
    let isUserPaused = false; // Enabled by default for automatic scrolling
    let isHovered = false;
    let isSectionVisible = true;
    const AUTOPLAY_INTERVAL = 3200; // 3.2s cadence for automatic scrolling

    // Update visibility and depth classes for all 6 slots
    function updateSlotStates() {
      const radius = getCylinderRadius();
      // Apply clean translateZ and rotateY with exact pixel radius
      cylinder.style.transform = `translateZ(-${radius}px) rotateY(${currentAngle}deg)`;

      // Determine which 3-item panel is active (0 = 01, 1 = 02, 2 = 03)
      const activePanelIndex = ((currentStep % 3) + 3) % 3;

      panels.forEach((panel) => {
        const slot = parseInt(panel.dataset.slotIndex, 10);
        // Calculate apparent angle relative to viewer (0 to 359 deg)
        const rel = ((slot * 60 + currentAngle) % 360 + 360) % 360;

        panel.classList.remove('is-front', 'is-side', 'is-back');

        if (rel === 0) {
          panel.classList.add('is-front');
          panel.setAttribute('aria-hidden', 'false');
        } else if (rel === 60 || rel === 300) {
          panel.classList.add('is-side');
          panel.setAttribute('aria-hidden', 'false');
        } else {
          panel.classList.add('is-back');
          panel.setAttribute('aria-hidden', 'true');
        }
      });

      // Synchronize Pagination (01, 02, 03)
      paginationTabs.forEach((tab) => {
        const targetIdx = parseInt(tab.dataset.targetIndex, 10);
        const isActive = targetIdx === activePanelIndex;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      if (segmentFill0) {
        segmentFill0.classList.toggle('filled', activePanelIndex >= 1);
      }
      if (segmentFill1) {
        segmentFill1.classList.toggle('filled', activePanelIndex >= 2);
      }
    }

    // Step Forward Infinitely
    function advanceNext() {
      currentStep++;
      currentAngle = -currentStep * 60;
      updateSlotStates();
    }

    // Step Backward Infinitely
    function advancePrev() {
      currentStep--;
      currentAngle = -currentStep * 60;
      updateSlotStates();
    }

    // Navigate to specific 01, 02, 03 target in the shortest direction
    function navigateToPanel(targetIdx) {
      const currentPanelIndex = ((currentStep % 3) + 3) % 3;
      let diff = (targetIdx - currentPanelIndex) % 3;
      if (diff === 2) diff = -1;
      if (diff === -2) diff = 1;

      currentStep += diff;
      currentAngle = -currentStep * 60;
      updateSlotStates();
      resetTimer();
    }

    // Update Autoplay UI Button
    function updateAutoplayUI() {
      if (!autoplayToggleBtn || !autoplayStateLabel || !autoplayStateIcon) return;

      if (isUserPaused) {
        autoplayStateLabel.textContent = 'PLAY';
        autoplayStateIcon.innerHTML = `
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="6 3 20 12 6 21 6 3"></polygon>
          </svg>`;
        autoplayToggleBtn.setAttribute('aria-label', 'Resume automatic rotation');
        autoplayToggleBtn.setAttribute('title', 'Resume automatic rotation');
      } else {
        autoplayStateLabel.textContent = 'PAUSE';
        autoplayStateIcon.innerHTML = `
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
            <rect x="5" y="4" width="4" height="16" rx="1"></rect>
            <rect x="15" y="4" width="4" height="16" rx="1"></rect>
          </svg>`;
        autoplayToggleBtn.setAttribute('aria-label', 'Pause automatic rotation');
        autoplayToggleBtn.setAttribute('title', 'Pause automatic rotation');
      }
    }

    // Continuous Autoplay Timer Engine
    function startTimer() {
      stopTimer();
      if (isUserPaused) return;

      carouselAutoplayTimer = setInterval(() => {
        if (!isUserPaused && !isHovered && isSectionVisible) {
          advanceNext();
        }
      }, AUTOPLAY_INTERVAL);
    }

    function stopTimer() {
      if (carouselAutoplayTimer) {
        clearInterval(carouselAutoplayTimer);
        carouselAutoplayTimer = null;
      }
    }

    function resetTimer() {
      stopTimer();
      if (!isUserPaused && isSectionVisible) {
        startTimer();
      }
    }

    // Navigation Buttons
    prevBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      advancePrev();
      resetTimer();
    });

    nextBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      advanceNext();
      resetTimer();
    });

    // Panel direct click: clicking side panel rotates it to center
    panels.forEach((p) => {
      p.addEventListener('click', () => {
        const slot = parseInt(p.dataset.slotIndex, 10);
        const rel = ((slot * 60 + currentAngle) % 360 + 360) % 360;
        if (rel === 60) {
          advanceNext();
          resetTimer();
        } else if (rel === 300) {
          advancePrev();
          resetTimer();
        }
      });

      // Pause only when user hovers directly over panels to read
      p.addEventListener('mouseenter', () => {
        isHovered = true;
      });
      p.addEventListener('mouseleave', () => {
        isHovered = false;
      });
    });

    // Pagination Tabs Click
    paginationTabs.forEach((tab) => {
      tab.addEventListener('click', (e) => {
        e.stopPropagation();
        const target = parseInt(tab.dataset.targetIndex, 10);
        navigateToPanel(target);
      });
    });

    // Autoplay Toggle Button
    autoplayToggleBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      isUserPaused = !isUserPaused;
      updateAutoplayUI();
      if (isUserPaused) {
        stopTimer();
      } else {
        startTimer();
      }
    });

    // Keyboard accessibility
    wrapper.setAttribute('tabindex', '0');
    wrapper.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        advancePrev();
        resetTimer();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        advanceNext();
        resetTimer();
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        isUserPaused = !isUserPaused;
        updateAutoplayUI();
        if (isUserPaused) stopTimer();
        else startTimer();
      }
    });

    // Touch Swipe Gestures
    let touchStartX = 0;
    let touchStartY = 0;
    wrapper.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches[0]) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    wrapper.addEventListener('touchend', (e) => {
      if (e.changedTouches && e.changedTouches[0]) {
        const deltaX = e.changedTouches[0].clientX - touchStartX;
        const deltaY = e.changedTouches[0].clientY - touchStartY;

        if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
          if (deltaX < 0) {
            advanceNext();
          } else {
            advancePrev();
          }
          resetTimer();
        }
      }
    }, { passive: true });

    // Intersection Observer to run when section is in view
    if ('IntersectionObserver' in window && section) {
      carouselIntersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isSectionVisible = true;
            if (!isUserPaused && !isHovered) {
              startTimer();
            }
          } else {
            isSectionVisible = false;
            stopTimer();
          }
        });
      }, {
        threshold: 0,
        rootMargin: '240px 0px 240px 0px'
      });

      carouselIntersectionObserver.observe(section);
    }

    // Dynamic resize handler for responsive cylinder radius updates
    window.addEventListener('resize', () => {
      updateSlotStates();
    }, { passive: true });

    // Initialize state & start automatic rotation immediately
    updateSlotStates();
    updateAutoplayUI();
    if (!isUserPaused) {
      startTimer();
    }
  }

  /* ==========================================================================
     C. MOBILE DRAWER NAVIGATION SETUP
     ========================================================================== */
  function setupMobileDrawer() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileDrawer = document.getElementById('mobileDrawer');

    if (mobileMenuBtn && !mobileMenuBtn.dataset.boundDrawer) {
      mobileMenuBtn.dataset.boundDrawer = 'true';
      mobileMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = mobileDrawer?.classList.toggle('open');
        mobileMenuBtn.classList.toggle('open', !!isOpen);
      });
    }

    document.querySelectorAll('.mobile-link, .mobile-waitlist-btn').forEach(link => {
      if (!link.dataset.boundDrawerLink) {
        link.dataset.boundDrawerLink = 'true';
        link.addEventListener('click', () => {
          mobileDrawer?.classList.remove('open');
          mobileMenuBtn?.classList.remove('open');
        });
      }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (mobileDrawer?.classList.contains('open') && !mobileDrawer.contains(e.target) && !mobileMenuBtn?.contains(e.target)) {
        mobileDrawer.classList.remove('open');
        mobileMenuBtn?.classList.remove('open');
      }
    });
  }

  /* ==========================================================================
     D. SEAMLESS DIRECTIONAL PAGE TRANSITION SYSTEM
     ========================================================================== */
  function getPageType(pathname) {
    const clean = (pathname || '').toLowerCase();
    if (clean.endsWith('about.html') || clean.includes('/about.html')) {
      return 'about';
    }
    return 'home';
  }

  function updateNavActiveState(targetType) {
    const navLinks = document.querySelectorAll('.floating-nav-links .nav-item, .mobile-nav-drawer .mobile-link');
    navLinks.forEach(link => {
      const href = link.getAttribute('href') || '';
      if (targetType === 'about') {
        if (href === 'about.html') {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      } else {
        if (href === 'index.html' || href === '#' || href === '/') {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      }
    });
  }

  function executePageTransition(targetUrl, direction, shouldPushState = true) {
    if (isTransitioning) return;
    isTransitioning = true;

    const currentViewport = document.getElementById('pageViewport');
    const targetType = getPageType(targetUrl.pathname);

    // Close mobile drawer
    document.getElementById('mobileDrawer')?.classList.remove('open');
    document.getElementById('mobileMenuBtn')?.classList.remove('open');

    // Attempt client-side seamless slide
    fetch(targetUrl.href)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.text();
      })
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newViewport = doc.getElementById('pageViewport');

        if (!newViewport || !currentViewport) {
          throw new Error('Missing pageViewport container');
        }

        // 1. Create incoming sliding container
        const incomingLayer = document.createElement('div');
        incomingLayer.id = 'incomingViewportLayer';
        const enterClass = direction === 'forward' ? 'page-slide-enter-from-right' : 'page-slide-enter-from-left';
        incomingLayer.className = `page-viewport ${enterClass}`;
        incomingLayer.innerHTML = newViewport.innerHTML;
        document.body.appendChild(incomingLayer);

        // 2. Apply exit animation to current viewport
        const exitClass = direction === 'forward' ? 'page-slide-exit-to-left' : 'page-slide-exit-to-right';
        currentViewport.classList.add(exitClass);

        // 3. Immediately update nav active state for responsive feedback
        updateNavActiveState(targetType);

        // 4. Trigger incoming slide animation
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            incomingLayer.classList.add('page-slide-enter-active');
          });
        });

        // 5. When slide animation finishes (480ms):
        setTimeout(() => {
          // Replace main viewport content
          currentViewport.innerHTML = newViewport.innerHTML;
          currentViewport.classList.remove('page-slide-exit-to-left', 'page-slide-exit-to-right');

          // Remove temporary incoming layer
          incomingLayer.remove();

          // Update document body class & title
          document.body.className = doc.body.className;
          document.title = doc.title;

          // Update browser history
          if (shouldPushState) {
            history.pushState({ url: targetUrl.href }, doc.title, targetUrl.href);
          }

          // Reset page scroll position to top
          window.scrollTo({ top: 0, behavior: 'instant' });

          // Re-initialize page interactive engine for new content
          initPageInteractiveEngine();

          // 6. Seamless smooth scroll to destination section if hash present
          if (targetUrl.hash) {
            const targetId = targetUrl.hash.slice(1);
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
              setTimeout(() => {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 40);
            }
          }

          isTransitioning = false;
        }, 490);
      })
      .catch(err => {
        // Fallback for file:// protocol, network error or non-fetchable environment
        console.warn('Seamless fetch unavailable, executing fallback transition:', err);
        sessionStorage.setItem('affyne_slide_dir', direction);
        if (targetUrl.hash) {
          sessionStorage.setItem('affyne_target_hash', targetUrl.hash);
        }
        window.location.href = targetUrl.href;
        isTransitioning = false;
      });
  }

  function initPageTransitions() {
    // Check fallback animation on initial load
    const fallbackDir = sessionStorage.getItem('affyne_slide_dir');
    const fallbackHash = sessionStorage.getItem('affyne_target_hash');

    if (fallbackDir) {
      sessionStorage.removeItem('affyne_slide_dir');
      sessionStorage.removeItem('affyne_target_hash');

      const viewport = document.getElementById('pageViewport');
      if (viewport) {
        const animClass = fallbackDir === 'forward' ? 'page-enter-slide-right' : 'page-enter-slide-left';
        viewport.classList.add(animClass);
        setTimeout(() => {
          viewport.classList.remove(animClass);
        }, 550);
      }

      if (fallbackHash) {
        setTimeout(() => {
          const targetEl = document.getElementById(fallbackHash.slice(1));
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 120);
      }
    }

    // Intercept internal link clicks
    document.addEventListener('click', (e) => {
      // Find closest link
      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href) return;

      // Ignore external, protocol-specific, new-tab, or modified clicks
      if (
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('javascript:') ||
        link.target === '_blank' ||
        link.hasAttribute('download') ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      let targetUrl;
      try {
        targetUrl = new URL(link.href, window.location.href);
      } catch (_) {
        return;
      }

      // Must be same origin
      if (targetUrl.origin !== window.location.origin) return;

      const currentType = getPageType(window.location.pathname);
      const targetType = getPageType(targetUrl.pathname);

      // A. SAME PAGE NAVIGATION
      if (currentType === targetType) {
        if (targetUrl.hash) {
          e.preventDefault();
          const targetId = targetUrl.hash.slice(1);
          const targetEl = document.getElementById(targetId);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            history.pushState(null, '', targetUrl.hash);
          }
          document.getElementById('mobileDrawer')?.classList.remove('open');
          return;
        }

        // Clicked Home on Home, or About on About without hash: smooth scroll to top
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.getElementById('mobileDrawer')?.classList.remove('open');
        return;
      }

      // B. CROSS-PAGE NAVIGATION (Home <-> About)
      e.preventDefault();

      // Determine directional slide:
      // Home -> About: Forward (Right to Left)
      // About -> Home: Backward (Left to Right)
      const direction = (currentType === 'home' && targetType === 'about') ? 'forward' : 'backward';

      executePageTransition(targetUrl, direction, true);
    });

    // Handle browser Back & Forward navigation (PopState)
    window.addEventListener('popstate', () => {
      let targetUrl;
      try {
        targetUrl = new URL(window.location.href);
      } catch (_) {
        return;
      }

      const targetType = getPageType(targetUrl.pathname);
      const currentType = document.body.classList.contains('about-page') ? 'about' : 'home';

      if (targetType === currentType) {
        if (targetUrl.hash) {
          const targetEl = document.getElementById(targetUrl.hash.slice(1));
          if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        return;
      }

      // Cross-page popstate:
      const direction = (targetType === 'about') ? 'forward' : 'backward';
      executePageTransition(targetUrl, direction, false);
    });
  }

  /* ==========================================================================
     E. BOOTSTRAP
     ========================================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    initPageInteractiveEngine();
    setupMobileDrawer();
    initPageTransitions();
  });

})();
