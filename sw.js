const CACHE_NAME = 'ticket-printer';
const urlsToCache = [
  '/',
  './index.html',
  'css/style.css',
  'js/main.js',
  'images/android-launchericon-512-512.png',
];

/*self.addEventListener("install", (event) => {
  const cacheStatic = caches
    .open(CACHE_NAME)
    .then((cache) => cache.addAll(urlsToCache));

  event.waitUntil(cacheStatic);
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Borrando caché antigua:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
  );
});

self.addEventListener('fetch', (event) => {
  console.log("fetch!", event.request);
  event.respondWith(
    caches.match(event.request)
    .then(response => response || fetch(event.request))
    .catch(console.log)
  );
});*/

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caché abierta');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Borrando caché antigua:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
  );
});

// Intercepta las solicitudes y responde desde la caché si está disponible
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});
