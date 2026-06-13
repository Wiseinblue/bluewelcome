const CACHE_VERSION = 'v3';
const CACHE_NAME = `bluewelcome-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/reset.css',
  './css/tokens.css',
  './css/components.css',
  './css/app.css',
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
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
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
  const url = new URL(event.request.url);

  if (url.pathname.endsWith('config.json')) {
    event.respondWith(networkFirstConfig(event.request));
    return;
  }

  event.respondWith(cacheFirst(event.request));
});

async function networkFirstConfig(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached || new Response('{}', { status: 503 });
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
