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
    'home': [
      'assets/Hero%20image.png'
    ],
    'index.html': [
      'assets/Hero%20image.png'
    ],
    'about': [
      'assets/about-loop.webm',
      'assets/about%20image.png'
    ],
    'about.html': [
      'assets/about-loop.webm',
      'assets/about%20image.png'
    ],
    'products': [
      'assets/Prodcuts%20page.png'
    ],
    'products.html': [
      'assets/Prodcuts%20page.png'
    ],
    'contact': [
      'assets/contact.png'
    ],
    'contact.html': [
      'assets/contact.png'
    ]
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

  const currentKey = getPageKey(window.location.href);
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

  function preloadPage(pageKey) {
    const assets = PAGE_ASSETS[pageKey];
    if (assets) {
      assets.forEach(preloadAsset);
    }
    // Also prefetch the HTML itself
    const htmlFile = pageKey.endsWith('.html') ? pageKey : `${pageKey}.html`;
    if (!preloaded.has(htmlFile)) {
      preloaded.add(htmlFile);
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = htmlFile;
      document.head.appendChild(link);
    }
  }

  // Preload everything during idle time
  function idlePreloadAll() {
    ['home', 'about', 'products', 'contact'].forEach((key) => {
      if (key !== currentKey) {
        preloadPage(key);
      }
    });
  }

  // Hook hover / touch on navigation links for instant zero-latency loading
  function hookNavigationLinks() {
    const navLinks = document.querySelectorAll('a[href]');
    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
        return;
      }
      const targetKey = getPageKey(href);
      if (PAGE_ASSETS[targetKey]) {
        const trigger = () => preloadPage(targetKey);
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
