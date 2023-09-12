const CACHE_NAME = 'pwa-cache-v1'; // Nombre de la caché

// URLs a cachear
const CACHE_URLS = [
  'css/normalize.css',
  'css/styles.css',
  'js/BluetoothConnection.js',
  'js/companion.js',
  'js/main.js',
  'index.html',
  'terminal.html',
  'checklist.html',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CACHE_URLS);
    })
  );
});

self.addEventListener('activate', (event) => {
  // No borres la caché en este evento
});

// Estrategia de caché para almacenar y recuperar recursos indefinidamente
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response; // Devuelve la respuesta en caché si está disponible
      }
      return fetch(event.request).then((response) => {
        const clonedResponse = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clonedResponse);
        });
        return response;
      });
    })
  );
});
