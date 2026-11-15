// Offline cache for Mahiber.
// Pages come from the cache straight away (so the app works offline) and are refreshed
// from the network in the background, so an update shows on the next launch.
// Bump CACHE only when you remove or rename a file.
const CACHE = 'mahiber-v2';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon.svg', './icon-maskable.svg', './icon-192.png', './icon-apple-180.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; }).catch(() => hit || Response.error());
    if (hit) { e.waitUntil(net); return hit; }
    return net;
  }));
});
