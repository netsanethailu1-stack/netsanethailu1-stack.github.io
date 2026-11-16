// Offline cache for Mahiber.
// The app page itself is fetched fresh whenever the phone is online, so an update shows on the
// very next open. If the network is off or slow (3 seconds), the saved copy is used instead.
// Icons and the manifest come from the cache straight away and are refreshed in the background.
// Bump CACHE only when you remove or rename a file.
const CACHE = 'mahiber-v2';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon.svg', './icon-maskable.svg', './icon-192.png', './icon-apple-180.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  const page = e.request.mode === 'navigate' || /\/(index\.html)?$/.test(url.pathname);
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(e.request, { ignoreSearch: true });
    // 'no-cache' makes the browser ask the server whether its copy is still current
    const net = fetch(e.request, page ? { cache: 'no-cache' } : {}).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; });
    if (!hit) return net.catch(() => Response.error());
    if (!page) { e.waitUntil(net.catch(() => {})); return hit; }
    e.waitUntil(net.catch(() => {})); // if the saved copy is shown, the fresh one is still stored for next time
    const slow = new Promise(done => setTimeout(() => done(hit), 3000));
    return Promise.race([net.catch(() => hit), slow]);
  }));
});
