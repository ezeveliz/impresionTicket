// Para actualizar el SW hay que incrementar la key del cache
const CACHE_NAME = 'ticket-printer-v1.41234';
// Array con assets a cachear para el uso offline
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  'lib/BrowserPrint-3.1.250.min.js',
  'lib/BrowserPrint-Zebra-1.1.250.min.js',
  'lib/pdf-lib.js',
  'lib/pdf.js',
  'lib/pdfWorker.js',
  'css/style.css',
  'js/main.js',
  'images/maskable_icon_x48.png',
  'images/maskable_icon_x72.png',
  'images/maskable_icon_x96.png',
  'images/maskable_icon_x128.png',
  'images/maskable_icon_x192.png',
  'images/maskable_icon_x384.png',
  'images/maskable_icon_x512.png',
];

/**
 * Al instalarse el SW cacheo todos los assets del proyecto definidos en el 
 * array urlsToCache
 */
self.addEventListener("install", (event) => {
  const cacheStatic = caches
    .open(CACHE_NAME)
    .then((cache) => cache.addAll(urlsToCache));

  event.waitUntil(cacheStatic);
});

/**
 * Cuando se activa el nuevo SW, elimino el cache del anterior
 */
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

/**
 * Intercepto todos los requests que se hagan 
 */
self.addEventListener('fetch', (event) => {

  // URL en la que vive el SW
  let scriptURL = self.serviceWorker.scriptURL;
  // URL de la página(sin el sw al final)
  let baseURL = scriptURL.slice(0, scriptURL.length - '/sw.js'.length);

  /**
   * Intercepto los gets y retorno una version cacheada del assets solicitado(si 
   * es que hay una)
   */
  if (event.request.method === 'GET') {

    console.log("fetch get!", event.request);  
    event.respondWith(
      caches.match(event.request)
      .then(cachedResponse => {
        console.log('found cached response: ', cachedResponse);
        return cachedResponse || fetch(event.request);
      })
      .catch(console.log)
    );

    /**
     * Intercepto los posts, se realiza un post sobre el SW para que este pueda 
     * recibir el PDF desde la shareSheet y luego mandarselo al cliente(la webapp 
     * ticketPrinter)
     * 
     * El SDK de Star hace un post contra el controlador, por eso solo intervengo 
     * los posts realizados contra mi mismo dominio
     */
  } else if (
    event.request.method === 'POST' && 
    event.request.url.includes(baseURL)) {

    console.log("fetch post!", event.request);
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
      client.postMessage({ type: 'RECEIVED_FILE', file: file });
    }());
  }
});

/**
 * Handler de mensajes enviados por la webapp
 */
self.addEventListener('message', (event) => {
  // Este evento salta cuando debo actualizar la app
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  // Este evento retorna la versión actual de la app
  if (event.data && event.data.type === 'GET_CACHE_VERSION') {
    event.source.postMessage({ type: 'CACHE_VERSION', version: CACHE_NAME });
  }
});