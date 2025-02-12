// // public/sw.js

// const CACHE_NAME = 'cipherbin-cache-v1';
// const PRECACHE_URLS = [
//   '/',
//   '/mirza',
//   '/Paste.js',
//   '/favicon.ico',
//   '/globals.css',
// ];

// self.addEventListener('install', (event) => {
//   event.waitUntil(
//     caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
//   );
//   self.skipWaiting();
// });

// self.addEventListener('activate', (event) => {
//   event.waitUntil(
//     caches.keys().then((cacheNames) =>
//       Promise.all(
//         cacheNames
//           .filter((name) => name !== CACHE_NAME)
//           .map((name) => caches.delete(name))
//       )
//     )
//   );
//   self.clients.claim();
// });

// self.addEventListener('fetch', (event) => {
//   event.respondWith(
//     caches.match(event.request).then((cachedResponse) => {
//       return cachedResponse || fetch(event.request);
//     })
//   );
// });

// public/sw.js

const CACHE_NAME = 'cipherbin-cache-v1';
const PRECACHE_URLS = [
  '/',
  '/mirza',
  '/Paste.js',
  '/favicon.ico',
  '/globals.css',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      const existingRequests = await cache.keys();
      const missingURLs = PRECACHE_URLS.filter((url) => {
        return !existingRequests.some((request) => {
          const requestUrl = new URL(request.url);
          return requestUrl.pathname === url;
        });
      });
      if (missingURLs.length > 0) {
        console.log('Caching missing URLs:', missingURLs);
        await cache.addAll(missingURLs);
      } else {
        console.log('All PRECACHE_URLS are already cached.');
      }
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
