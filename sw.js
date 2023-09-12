importScripts('js/sw-toolbox.js');

const CACHE_NAME = 'pwa-cache-v1'; // Nombre de la caché
const CACHE_URLS = [
  '/',
  'css/normalize.css',
  'css/styles.css',
  'js/BluetoothConnection.js',
  'js/companion.js',
  'js/main.js',
  'index.html',
  'terminal.html',
  'checklist.html',
  // Agrega aquí más recursos que deseas almacenar en caché
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CACHE_URLS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Intenta obtener el recurso desde la caché
      return response || fetch(event.request).then((fetchResponse) => {
        // Almacena el recurso recién recuperado en la caché
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        });
      });
    })
  );
});

toolbox.router.default = toolbox.cacheFirst; // Cambia a cacheFirst para priorizar la caché
toolbox.options.networkTimeoutSeconds = 5;

toolbox.router.get('icons/*', toolbox.fastest);
