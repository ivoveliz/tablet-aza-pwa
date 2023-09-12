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

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Si existe una respuesta en la caché, la devuelve
      if (response) {
        return response;
      }

      // Si no hay una respuesta en la caché, intenta recuperarla en línea
      return fetch(event.request)
        .then((response) => {
          // Almacena la respuesta en la caché
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clonedResponse);
          });
          return response;
        })
        .catch(() => {
          // Si la solicitud en línea falla, devuelve una respuesta personalizada
          return new Response('Esta página no está disponible en línea. Por favor, consulta la versión offline.');
        });
    })
  );
});
