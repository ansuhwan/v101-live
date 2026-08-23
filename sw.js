// v10.1 라이브 계좌 PWA 서비스워커
const CACHE = "v101-live-v18";   // v18: 기준선 B2·v13 MN 재계산(1006%/−30.0%/2.38) + 푸터 PLAN 연동 (2026-08-24)
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
