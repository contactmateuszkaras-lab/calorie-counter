// ---------------------------------------------------------------
// sw.js — the "service worker". It runs in the background and keeps
// a copy of the app's files on the phone so the app opens offline.
//
// Strategy: "network first". When online, always fetch the newest
// files (so updates show up right away) and refresh the saved copy.
// When offline, use the saved copy.
// ---------------------------------------------------------------

const CACHE = 'calorie-counter';

const FILES = [
  './',
  'index.html',
  'styles.css',
  'icons.js',
  'data.js',
  'app.js',
  'manifest.webmanifest',
  'fonts/work-sans-latin-wght-normal.woff2',
  'fonts/work-sans-latin-ext-wght-normal.woff2',
  'icons/icon-192.png',
  'icons/apple-touch-icon.png',
];

// First visit: save all the files.
self.addEventListener('install', function (event) {
  event.waitUntil(caches.open(CACHE).then(function (cache) { return cache.addAll(FILES); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then(function (response) {
        // Got a fresh copy: save it for next time we're offline.
        const copy = response.clone();
        caches.open(CACHE).then(function (cache) { cache.put(event.request, copy); });
        return response;
      })
      .catch(function () {
        // Offline: use the saved copy.
        return caches.match(event.request, { ignoreSearch: true });
      })
  );
});
