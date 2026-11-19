const VERSION = 'atmos-v1';
const STATIC = `${VERSION}-static`;
const OFFLINE_URL = '/offline.html';
const PRECACHE = [OFFLINE_URL, '/favicon.png'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC).then(cache => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => !key.startsWith(VERSION)).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

const isStatic = url =>
  url.pathname.startsWith('/_next/static/') || /\.(?:png|jpg|jpeg|webp|svg|ico|woff2?|json)$/.test(url.pathname);

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
    return;
  }

  if (isStatic(url)) {
    event.respondWith(
      caches.open(STATIC).then(async cache => {
        const cached = await cache.match(request);
        const network = fetch(request)
          .then(res => {
            if (res.ok) cache.put(request, res.clone());
            return res;
          })
          .catch(() => cached ?? Response.error());
        return cached ?? network;
      })
    );
  }
});
