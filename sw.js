const CACHE = 'lobby-ar-v2';
const CORE = [
  './', 'index.html', 'manifest.webmanifest', 'model-viewer-umd.min.js',
  'Vazirmatn-Regular.woff2', 'Vazirmatn-SemiBold.woff2', 'Vazirmatn-ExtraBold.woff2',
  '01.png', '02.png', '03.png', '04.png',
  '03.glb', '03.usdz',
  'draco/draco_decoder.js', 'draco/draco_decoder.wasm', 'draco/draco_wasm_wrapper.js',
  'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'
];
self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.addAll(CORE);
    self.skipWaiting();
  })());
});
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
    (await self.clients.matchAll()).forEach(c => c.postMessage('cached'));
  })());
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    let res = await cache.match(req, { ignoreSearch: true });
    if (!res && req.mode === 'navigate') res = await cache.match('index.html');
    if (res) return res;
    try { return await fetch(req); } catch (_) { return new Response('Offline', { status: 503 }); }
  })());
});
