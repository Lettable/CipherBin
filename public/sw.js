// src/scripts/sw.js

const VERSION = '20221018';
const PRECACHE = 'precache-' + VERSION;
const MODES = 'modes-' + VERSION;

const PRECACHE_URLS = [
  '/',
  '/favicon.ico',
  '/script/Paste.js',
  '/global.css',
  '/[paste]'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  const currentCaches = [PRECACHE, MODES];
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => cacheNames.filter((cacheName) => !currentCaches.includes(cacheName)))
      .then((cachesToDelete) => Promise.all(cachesToDelete.map((cacheToDelete) => caches.delete(cacheToDelete))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});
