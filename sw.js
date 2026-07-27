const CACHE_NAME = 'tarumt-toolkit-v20';

// Big and effectively immutable: always served straight from cache, never
// re-fetched on a normal visit. Re-downloading a 6 MB map on every page view
// would be wasteful, so these only refresh when CACHE_NAME changes.
//
// Matched by filename, not full path: on GitHub Pages the app is served from
// /student-toolkit/, so comparing against a leading-slash path never matched
// and these were quietly falling through to stale-while-revalidate.
const CACHE_FIRST = [
  'campus-map.js',
  'TARUMT_KL_CAMPUS_MAP.pdf',
  'panzoom.min.js',
  'icon-192.png',
  'icon-512.png'
];

const isCacheFirst = url => CACHE_FIRST.includes(url.pathname.split('/').pop());

// The app shell. These are small and the app is broken without them, so a
// failure here should fail the install and leave the previous version serving.
const CORE_ASSETS = [
  './',
  './index.html',
  './attendance.html',
  './calculator.html',
  './marks.html',
  './map.html',
  './timetable.html',
  './style.css',
  './script.js',
  './data.js',
  './panzoom.min.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Large and non-essential. Cached best-effort: if one fails (slow campus wifi,
// storage quota) the install still succeeds and it gets picked up at runtime.
const OPTIONAL_ASSETS = [
  './campus-map.js',
  './TARUMT_KL_CAMPUS_MAP.pdf'
];

// 1. Install: cache the shell, then try the big stuff without risking the install.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async cache => {
        // addAll is atomic, which is what we want for the shell.
        await cache.addAll(CORE_ASSETS);

        // Individually, so one failure doesn't discard the rest.
        await Promise.all(
          OPTIONAL_ASSETS.map(url =>
            cache.add(url).catch(err => console.warn('Skipped caching', url, err))
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// 2. Activate: drop caches from previous versions and take control immediately.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

// 3. Fetch.
//    Big static assets: cache-first.
//    Everything else: stale-while-revalidate — the cached copy is served
//    immediately (so the app is instant and works offline) while a fresh copy
//    downloads in the background for next time. This is what stops an edit to
//    script.js or data.js from being invisible until CACHE_NAME is bumped.
self.addEventListener('fetch', event => {
  const { request } = event;

  // Only GET is cacheable, and only our own origin is ours to cache.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (isCacheFirst(url)) {
    event.respondWith(cacheFirst(request));
  } else {
    event.respondWith(staleWhileRevalidate(request));
  }
});

function cacheFirst(request) {
  return caches.match(request).then(cached => cached || fetchAndCache(request));
}

function staleWhileRevalidate(request) {
  return caches.match(request).then(cached => {
    const fresh = fetchAndCache(request).catch(() => null);

    if (cached) {
      // Don't await the refresh; it lands in the cache for the next load.
      return cached;
    }

    return fresh.then(response => {
      if (response) return response;
      // Offline with nothing cached: fall back to the shell for page loads.
      if (request.mode === 'navigate') return caches.match('./index.html');
      return Response.error();
    });
  });
}

function fetchAndCache(request) {
  return fetch(request).then(response => {
    // Don't cache errors or opaque responses.
    if (!response || !response.ok) return response;

    const copy = response.clone();
    caches.open(CACHE_NAME)
      .then(cache => cache.put(request, copy))
      .catch(err => console.warn('Runtime cache write failed', err));

    return response;
  });
}
