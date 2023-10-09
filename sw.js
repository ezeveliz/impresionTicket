const CACHE_NAME = 'ticket-printer';
const urlsToCache = [
  './index.html',
  'css/style.css',
  'js/main.js',
  'images/android-launchericon-512-512.png',
];

self.addEventListener("install", (event) => {
  const cacheStatic = caches
    .open(CACHE_NAME)
    .then((cache) => cache.addAll(urlsToCache));

  event.waitUntil(cacheStatic);
});

self.addEventListener('activate', (event) => {
  clients.claim();
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

  if (event.request.method !== 'POST') return;

  event.respondWith(Response.redirect('./'));

  event.waitUntil(async function () {
    const data = await event.request.formData();
    const clientId =
        event.resultingClientId !== ""
          ? event.resultingClientId
          : event.clientId;
    console.log(clientId)
    if (!clientId) return;
    const client = await self.clients.get(clientId);
    if(!client) return
    const file = data.get('file');
    client.postMessage({ file });
  }());
});

/*self.addEventListener('install', () => {
  skipWaiting();
});

self.addEventListener('activate', () => {
  clients.claim();
});


// Intercepta las solicitudes y responde desde la caché si está disponible
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'POST') return;
  
  event.respondWith(Response.redirect('./'));
  
  event.waitUntil(async function () {
    const data = await event.request.formData();
    const clientId =
        event.resultingClientId !== ""
          ? event.resultingClientId
          : event.clientId;
    console.log(clientId)
    if (!clientId) return;
    const client = await self.clients.get(clientId);
    if(!client) return
    const file = data.get('file');
    client.postMessage({ file });
  }());
});*/



/*addEventListener('fetch', (event) => {
  if (event.request.method !== 'POST') return;
  
  event.respondWith(Response.redirect('./'));
  
  event.waitUntil(async function () {
    const data = await event.request.formData();
    const client = await self.clients.get(event.resultingClientId);
    const file = data.get('file');
    client.postMessage({ file });
  }());
});*/