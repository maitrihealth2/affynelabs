/**
 * AffyneLabs - Connected Seamless Page Transition Router
 * Ultra-smooth connected edge-to-edge swipe with NO middle screen.
 */

(function () {
  'use strict';

  const PAGE_ORDER = {
    'index.html': 0,
    '': 0,
    'about.html': 1,
    'products.html': 2,
    'contact.html': 3
  };

  function getPageFile(urlStr) {
    try {
      const url = new URL(urlStr, window.location.href);
      const filename = url.pathname.split('/').pop() || 'index.html';
      return filename.toLowerCase();
    } catch (e) {
      return '';
    }
  }

  function reinitCurrentPage() {
    const file = getPageFile(window.location.href);
    window.scrollTo(0, 0);
    document.body.style.overflow = '';

    if (file === 'about.html') {
      if (typeof window.initAboutPage === 'function') window.initAboutPage();
    } else if (file === 'products.html') {
      if (typeof window.initProductsPage === 'function') window.initProductsPage();
    } else if (file === 'contact.html') {
      if (typeof window.initContactPage === 'function') window.initContactPage();
    } else {
      if (typeof window.initHomePage === 'function') window.initHomePage();
    }
  }

  // Pre-cache parsed documents for instant 60fps transitions
  const pageCache = new Map();

  async function fetchPage(urlStr) {
    const file = getPageFile(urlStr);
    if (pageCache.has(file)) return pageCache.get(file);
    const resp = await fetch(urlStr);
    const text = await resp.text();
    const doc = new DOMParser().parseFromString(text, 'text/html');
    pageCache.set(file, doc);
    return doc;
  }

  // Warm cache on startup
  ['index.html', 'about.html', 'products.html', 'contact.html'].forEach((p) => {
    fetchPage(p).catch(() => {});
  });

  let isNavigating = false;

  async function navigate(targetUrlStr, pushHistory = true) {
    const currentFile = getPageFile(window.location.href);
    const targetFile = getPageFile(targetUrlStr);

    if (currentFile === targetFile || isNavigating) return;

    const currentIdx = PAGE_ORDER[currentFile] !== undefined ? PAGE_ORDER[currentFile] : 0;
    const targetIdx = PAGE_ORDER[targetFile] !== undefined ? PAGE_ORDER[targetFile] : 0;
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

    const performSwap = () => {
      document.title = nextDoc.title;
      document.body.className = nextDoc.body.className;
      document.body.innerHTML = nextDoc.body.innerHTML;
      if (pushHistory) {
        history.pushState({ url: targetUrlStr }, '', targetUrlStr);
      }
      reinitCurrentPage();
    };

    if (document.startViewTransition) {
      const transition = document.startViewTransition(() => {
        performSwap();
      });
      try {
        await transition.finished;
      } catch (err) {
      } finally {
        isNavigating = false;
      }
    } else {
      performSwap();
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

    const targetFile = getPageFile(targetUrl.href);
    if (!targetFile || targetFile === getPageFile(window.location.href)) return;
    if (PAGE_ORDER[targetFile] === undefined) return;

    e.preventDefault();
    navigate(targetUrl.href, true);
  });

  // Handle browser Back / Forward history buttons
  window.addEventListener('popstate', () => {
    navigate(window.location.href, false);
  });
})();
