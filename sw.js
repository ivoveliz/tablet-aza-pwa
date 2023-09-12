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
      if (response) {
        return response; // Devuelve la respuesta en caché si está disponible
      }
      // Si no hay una respuesta en caché, no intentes recuperarla en línea
      // Devuelve una respuesta vacía o una página de error personalizada
      return new Response('Esta página no está disponible en línea. Por favor, consulta la versión offline.');
    })
  );
});
