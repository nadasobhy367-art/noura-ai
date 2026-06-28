const CACHE_NAME = 'noura-ai-v1';

// Development safeguard: do not serve stale app shells from an old cache.
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.delete(CACHE_NAME));
});

self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => Promise.all(cacheNames.map(cacheName => caches.delete(cacheName))))
  );
  self.clients.claim();
});
