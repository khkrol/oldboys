const CACHE_NAME = 'potters-pfg-v2'; // Versie omhoog gezet
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
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Cache geopend en kernbestanden geladen');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', function(event) {
    // Oude caches opruimen bij nieuwe versie
    event.waitUntil(
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.map(function(cacheName) {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // 1. Als het in de cache zit, geef dat terug
        if (response) {
          return response;
        }

        // 2. Zo niet, haal het van internet
        return fetch(event.request).then(
          function(response) {
            // Controleer of het antwoord geldig is
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // 3. Klonen en opslaan in cache voor de volgende keer (Dynamische caching)
            var responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});