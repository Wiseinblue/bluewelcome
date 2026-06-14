const CACHE_VERSION = 'v6';
const CACHE_NAME = `bluewelcome-${CACHE_VERSION}`;

// File da pre-cachare per il funzionamento offline (guida ospite).
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/reset.css',
  './css/tokens.css',
  './css/components.css',
  './css/app.css',
  './js/theme.js',
  './js/flags.js',
  './js/config-loader.js',
  './js/i18n.js',
  './js/renderer.js',
  './js/qr.js',
  './js/map.js',
  './js/app.js',
  './js/weather.js',
  './js/vendor/qrcode.min.js',
  './assets/property-photo.jpg',
  './assets/Logo-WiB.png',
  './assets/logo-icon.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

// La pagina può chiedere al SW in attesa di attivarsi subito (auto-aggiornamento).
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // config.json: sempre rete (con fallback cache)
  if (url.pathname.endsWith('config.json')) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // Codice e stili (HTML/CSS/JS): network-first così gli aggiornamenti si vedono subito,
  // cache solo come fallback offline. Risolve il problema "modifiche non visibili".
  if (/\.(html|css|js)$/.test(url.pathname) || url.pathname === '/' || url.pathname.endsWith('/')) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // Immagini e altri asset: cache-first (cambiano raramente, più veloce).
  event.respondWith(cacheFirst(event.request));
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached || new Response('', { status: 503 });
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
