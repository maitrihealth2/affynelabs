/**
 * AffyneLabs - Connected Seamless Page Transition Router
 * Ultra-smooth connected edge-to-edge swipe with NO middle screen.
 * Robust against Vercel cleanUrls, subfolder paths, and SPA script lifecycle.
 */

(function () {
  'use strict';

  const PAGE_ORDER = {
    'home': 0,
    'index': 0,
    'index.html': 0,
    'about': 1,
    'about.html': 1,
    'products': 2,
    'products.html': 2,
    'contact': 3,
    'contact.html': 3
  };

  function getPageKey(urlStr) {
    try {
      const url = new URL(urlStr, window.location.href);
      let p = url.pathname.toLowerCase();
      while (p.endsWith('/') && p.length > 1) {
        p = p.slice(0, -1);
      }
      const segment = p.split('/').pop() || '';
      const clean = segment.replace(/\.html$/, '');
      if (!clean || clean === 'index' || clean === 'landing page 3') return 'home';
      if (clean === 'about') return 'about';
      if (clean === 'products') return 'products';
      if (clean === 'contact') return 'contact';
      return clean;
    } catch (e) {
      return 'home';
    }
  }

  // Safely clean up animation loops and listeners before page swap
  function cleanupPreviousPage() {
    // About page cleanup
    if (window._aboutScrollHandler) {
      window.removeEventListener('scroll', window._aboutScrollHandler);
      window._aboutScrollHandler = null;
    }
    if (window._aboutResizeHandler) {
      window.removeEventListener('resize', window._aboutResizeHandler);
      window._aboutResizeHandler = null;
    }
    if (window._aboutRafId) {
      cancelAnimationFrame(window._aboutRafId);
      window._aboutRafId = null;
    }

    // Products page cleanup
    if (typeof window._prodCleanup === 'function') {
      window._prodCleanup();
      window._prodCleanup = null;
    }
    if (window._prodRafId) {
      cancelAnimationFrame(window._prodRafId);
      window._prodRafId = null;
    }
  }

  // Ensure script is loaded in window if arriving via dynamic SPA navigation
  async function ensurePageScript(key) {
    const scripts = {
      about: { fn: 'initAboutPage', src: 'about.js' },
      products: { fn: 'initProductsPage', src: 'products.js?v=9' },
      contact: { fn: 'initContactPage', src: 'contact.js?v=2' },
      home: { fn: 'initHomePage', src: 'main.js' }
    };
    const s = scripts[key];
    if (!s || typeof window[s.fn] === 'function') return;

    await new Promise((resolve) => {
      const el = document.createElement('script');
      el.src = s.src;
      el.onload = resolve;
      el.onerror = resolve;
      document.head.appendChild(el);
    });
  }

  function reinitCurrentPage() {
    window.scrollTo(0, 0);
    document.body.style.overflow = '';

    // Direct DOM landmark inspection - 100% immune to URL format differences
    if (document.getElementById('aboutScrollTrack')) {
      if (typeof window.initAboutPage === 'function') {
        window.initAboutPage();
      }
    } else if (document.getElementById('productsScrollViewport')) {
      if (typeof window.initProductsPage === 'function') {
        window.initProductsPage();
      }
    } else if (document.querySelector('.contact-main')) {
      if (typeof window.initContactPage === 'function') {
        window.initContactPage();
      }
    } else if (document.getElementById('hero')) {
      if (typeof window.initHomePage === 'function') {
        window.initHomePage();
      }
    }
  }

  // Pre-cache parsed documents for instant 60fps transitions
  const pageCache = new Map();

  async function fetchPage(urlStr) {
    const key = getPageKey(urlStr);
    if (pageCache.has(key)) return pageCache.get(key);
    const resp = await fetch(urlStr);
    const text = await resp.text();
    const doc = new DOMParser().parseFromString(text, 'text/html');
    pageCache.set(key, doc);
    return doc;
  }

  // Warm cache on startup
  ['index.html', 'about.html', 'products.html', 'contact.html'].forEach((p) => {
    fetchPage(p).catch(() => {});
  });

  let isNavigating = false;

  async function navigate(targetUrlStr, pushHistory = true) {
    const currentKey = getPageKey(window.location.href);
    const targetKey = getPageKey(targetUrlStr);

    if (currentKey === targetKey || isNavigating) return;

    const currentIdx = PAGE_ORDER[currentKey] !== undefined ? PAGE_ORDER[currentKey] : 0;
    const targetIdx = PAGE_ORDER[targetKey] !== undefined ? PAGE_ORDER[targetKey] : 0;
    const dir = targetIdx >= currentIdx ? 'forward' : 'back';

    document.documentElement.dataset.navDir = dir;

    let nextDoc;
    try {
      nextDoc = await fetchPage(targetUrlStr);
    } catch (e) {
      window.location.href = targetUrlStr;
      return;
    }

    isNavigating = true;

    const performSwap = async () => {
      cleanupPreviousPage();
      document.title = nextDoc.title;
      document.documentElement.className = nextDoc.body.className;
      document.body.className = nextDoc.body.className;
      document.body.innerHTML = nextDoc.body.innerHTML;
      if (pushHistory) {
        history.pushState({ url: targetUrlStr }, '', targetUrlStr);
      }
      await ensurePageScript(targetKey);
      reinitCurrentPage();
    };

    if (document.startViewTransition) {
      const transition = document.startViewTransition(async () => {
        await performSwap();
      });
      try {
        await transition.finished;
      } catch (err) {
      } finally {
        isNavigating = false;
      }
    } else {
      await performSwap();
      isNavigating = false;
    }
  }

  // Intercept all internal navigation clicks
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }

    const anchor = e.target.closest('a');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
      return;
    }

    let targetUrl;
    try {
      targetUrl = new URL(href, window.location.href);
    } catch (err) {
      return;
    }

    if (targetUrl.origin !== window.location.origin) return;

    const currentKey = getPageKey(window.location.href);
    const targetKey = getPageKey(targetUrl.href);
    if (!targetKey || targetKey === currentKey) return;
    if (PAGE_ORDER[targetKey] === undefined) return;

    e.preventDefault();
    navigate(targetUrl.href, true);
  });

  // Handle browser Back / Forward history buttons
  window.addEventListener('popstate', () => {
    navigate(window.location.href, false);
  });
})();
