const CACHE_NAME = 'miky4k-v3';
const ASSETS = [
  '/miky4k-tools/',
  '/miky4k-tools/index.html',
  '/miky4k-tools/miky4k-caption-tool.html',
  '/miky4k-tools/miky4k-analytics.html',
  '/miky4k-tools/miky4k-assistant.html',
  '/miky4k-tools/miky4k-competitor.html',
  '/miky4k-tools/manifest.json',
  '/miky4k-tools/icons/icon-192x192.png',
  '/miky4k-tools/icons/icon-512x512.png',
];

// Install — cache all assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — network first, fallback to cache
self.addEventListener('fetch', event => {
  // Skip non-GET and API calls (always need network)
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('vercel.app')) return;
  if (event.request.url.includes('api.anthropic.com')) return;
  if (event.request.url.includes('fonts.googleapis.com')) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
