const CACHE_NAME = 'giacsite-cache-v1';
const urlsToCache = [
  '/models/model-compressed.glb',
  'https://www.gstatic.com/draco/versioned/decoders/1.5.6/draco_decoder.js',
  'https://www.gstatic.com/draco/versioned/decoders/1.5.6/draco_decoder.wasm'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/models/') || event.request.url.includes('draco')) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => response || fetch(event.request))
    );
  }
});
