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

// Estrategia de actualización para forzar la recarga de la PWA
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

toolbox.router.default = toolbox.networkFirst;
toolbox.options.networkTimeoutSeconds = 5;

toolbox.router.get('icons/*', toolbox.fastest);
