// v10.1 라이브 계좌 PWA 서비스워커
const CACHE = "v101-live-v20";   // v20: 기준선을 LIVE-MIRROR+**매봉 MTM**으로 교체 (945%/−38.1%/2.31) — 예전 B2·청산봉(1006%/−30.0%)은 MDD를 8%p 얕게 보여줬다 (2026-08-25)
const ASSETS = [
  './', './index.html', './manifest.webmanifest',
  './icon-192.png', './icon-512.png', './apple-touch-icon.png'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.pathname.endsWith('equity.json')) {
    // 최신 잔고 = network-first, 오프라인이면 캐시
    e.respondWith(
      fetch(e.request).then(r => {
        const cp = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, cp));
        return r;
      }).catch(() => caches.match(e.request))
    );
  } else {
    // 앱 셸 = cache-first
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
  }
});
