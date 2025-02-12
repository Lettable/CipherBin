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

// public/sw.js

const CACHE_NAME = 'cipherbin-cache-v2';
const PRECACHE_URLS = [
  '/',
  '/Paste.js',
  '/favicon.ico',
  '/globals.css'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .catch(error => console.log('Precache failed:', error))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => 
      Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match('/'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) return cachedResponse;
        
        return fetch(event.request)
          .then(response => {
            if (event.request.url.startsWith(self.location.origin)) {
              const clone = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, clone));
            }
            return response;
          });
      })
      .catch(error => {
        console.error('Fetch failed:', error);
        if (event.request.destination === 'image') {
          return new Response('<svg>...</svg>', {headers: {'Content-Type': 'image/svg+xml'}});
        }
        return new Response('Offline');
      })
  );
});