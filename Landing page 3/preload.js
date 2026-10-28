/**
 * AffyneLabs - Smart Cross-Page Media & Asset Preloader
 * 
 * 1. Waits until current page is fully loaded and idle before prefetching background assets
 * 2. Instant prefetch on nav link hover / touchstart for 0ms page transitions
 * 3. Preloads both heavy images and background videos into browser disk/memory cache
 */

(function () {
  'use strict';

  // Map of routes to their heavy assets
  const PAGE_ASSETS = {
    'index.html': [
      'assets/Hero%20image.png'
    ],
    'about.html': [
      'assets/about-loop.webm',
      'assets/about%20image.png'
    ],
    'products.html': [
      'assets/Prodcuts%20page.png'
    ],
    'contact.html': [
      'assets/contact.png'
    ]
  };

  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const preloaded = new Set();

  // Helper to preload an image
  function preloadImage(url) {
    if (preloaded.has(url)) return;
    preloaded.add(url);
    const img = new Image();
    img.src = url;
  }

  // Helper to preload video / media via fetch or video element
  function preloadVideo(url) {
    if (preloaded.has(url)) return;
    preloaded.add(url);

    if ('fetch' in window) {
      fetch(url, { mode: 'no-cors' }).catch(() => {});
    } else {
      const vid = document.createElement('video');
      vid.preload = 'auto';
      vid.src = url;
    }
  }

  function preloadAsset(url) {
    if (url.endsWith('.webm') || url.endsWith('.mp4')) {
      preloadVideo(url);
    } else {
      preloadImage(url);
    }
  }

  function preloadPage(page) {
    const assets = PAGE_ASSETS[page];
    if (assets) {
      assets.forEach(preloadAsset);
    }
    // Also prefetch the HTML itself
    if (!preloaded.has(page)) {
      preloaded.add(page);
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = page;
      document.head.appendChild(link);
    }
  }

  // Preload everything during idle time
  function idlePreloadAll() {
    Object.keys(PAGE_ASSETS).forEach((page) => {
      if (page !== currentPath) {
        preloadPage(page);
      }
    });
  }

  // Hook hover / touch on navigation links for instant zero-latency loading
  function hookNavigationLinks() {
    const navLinks = document.querySelectorAll('a[href$=".html"]');
    navLinks.forEach((link) => {
      const targetPage = link.getAttribute('href');
      if (targetPage && PAGE_ASSETS[targetPage]) {
        const trigger = () => preloadPage(targetPage);
        link.addEventListener('mouseenter', trigger, { passive: true, once: true });
        link.addEventListener('touchstart', trigger, { passive: true, once: true });
        link.addEventListener('focus', trigger, { passive: true, once: true });
      }
    });
  }

  // Start after window load so the current page has 100% bandwidth priority
  window.addEventListener('load', () => {
    hookNavigationLinks();

    // Use requestIdleCallback if available, otherwise setTimeout
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        idlePreloadAll();
      }, { timeout: 2000 });
    } else {
      setTimeout(idlePreloadAll, 1200);
    }
  });
})();
