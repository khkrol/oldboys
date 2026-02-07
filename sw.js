// AANGEPAST: Versie omhoog naar v3 (zodat gebruikers deze nieuwe logica ontvangen)
const CACHE_NAME = 'potters-pfg-v3-daily'; 
const urlsToCache = [
  './',
  './index.html',
  './css/global.css',
  './css/layout.css',
  './js/app.js',
  './js/menu-data.js',
  './manifest.json',
  './assets/images/potters.jpg',
  './assets/images/logo.png',
  './welkom.html'
];

self.addEventListener('install', function(event) {
  // Forceer de nieuwe service worker om direct actief te worden
  self.skipWaiting(); 
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Cache geopend en kernbestanden geladen');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', function(event) {
    // Zorg dat de nieuwe SW direct de controle overneemt
    event.waitUntil(
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.map(function(cacheName) {
            if (cacheName !== CACHE_NAME) {
              console.log('Oude cache verwijderd:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }).then(() => self.clients.claim())
    );
});

// AANGEPAST: NETWORK FIRST STRATEGIE
self.addEventListener('fetch', function(event) {
  event.respondWith(
    // 1. Probeer ALTIJD eerst van internet te halen (Network First)
    fetch(event.request)
      .then(function(response) {
        // Controleer of het antwoord geldig is
        if(!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // 2. Als het gelukt is: Update de cache direct met deze nieuwe versie
        var responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then(function(cache) {
            cache.put(event.request, responseToCache);
          });

        return response;
      })
      .catch(function() {
        // 3. Geen internet? Of server plat? Haal dan pas uit de cache (Fallback)
        console.log('Geen internet, laden uit cache:', event.request.url);
        return caches.match(event.request);
      })
  );
});