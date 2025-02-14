const CACHE_NAME = 'cipherbin-cache-v2';
const PRECACHE_URLS = [
  '/',
  '/sc/5ac7e8c8-0112-4580-90fb-091eca2424c0',
  '/sg/eyJjb250ZW50IjoiYldseWVtRT0iLCJjcmVhdGVkQXQiOiIyMDI1LTAyLTE0VDA2OjUyOjA5Ljc2OFoiLCJleHBpcmVzQXQiOiI5OTk5LTEyLTMxVDIzOjU5OjU5WiIsImlzUHVibGljIjp0cnVlLCJzeW50YXgiOiJwbGFpbnRleHQiLCJzaWduYXR1cmUiOiJ0Rm9OTjBxVlcwQ1BsbmtWVUpJRGJvYXR0L1lPME1sQUtMZTRIVkd0dU1nPSJ9',
  '/favicon.ico',
  '/globals.css',
  '/cipher.js',
  '/compressor.js'
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