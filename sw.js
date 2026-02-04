const CACHE_NAME = 'potters-pfg-v1';
const urlsToCache = [
  './',
  './index.html',
  './css/global.css',
  './manifest.json',
  './assets/images/potters.jpg',
  './assets/images/logo.png'
];

// Installatie van de Service Worker
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Ophalen van bestanden (caching strategie)
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});