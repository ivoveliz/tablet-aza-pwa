importScripts('js/sw-toolbox.js');

toolbox.precache([
  'css/normalize.css',
  'css/styles.css',
  'js/BluetoothConnection.js',
  'js/companion.js',
  'js/main.js',
  'index.html',
  'terminal.html',
  'checklist.html',
]);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

toolbox.router.default = toolbox.cacheFirst; // Cambia a cacheFirst para priorizar la caché
toolbox.options.networkTimeoutSeconds = 5;

toolbox.router.get('icons/*', toolbox.fastest);
