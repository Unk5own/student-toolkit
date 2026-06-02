// Change this to v2, v3, etc., whenever you update your files!
const CACHE_NAME = 'tarumt-toolkit-v1';

// List EVERY file your app needs to work offline
const urlsToCache = [
  './',
  './index.html',
  './map.html',
  './attendance.html',
  './calculator.html',
  './marks.html',
  './style.css',
  './script.js',
  './manifest.json'
  // Remember to add your map SVG or image files here too!
];

// 1. Install Event: Download and cache all files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// 2. Activate Event: Clean up old caches when you update the CACHE_NAME
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Clearing old cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// 3. Fetch Event: Serve from cache first, then network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached file if it exists, otherwise go to the internet
        return response || fetch(event.request);
      })
  );
});