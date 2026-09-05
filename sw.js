// v10.1 라이브 계좌 PWA 서비스워커
const CACHE = "v101-live-v35";   // v35: 원화 시 사용중 증거금 행 줄바꿈 수정
// v34:   // v34: 폰트 Inter+Noto Sans KR (Plex Mono 타자기 인상 제거)
// v33:   // v33: 손익 탭 가로 넘침(히트맵 min-width) 수정
// v32:   // v32: 모바일 — 사이드바 폭 · 차트 viewBox 반응형
// v31:   // v31: LoT 레이아웃 (사이드바 · 탭 3개 · 스크럽 차트 · ⓘ)
// v30: 통화 버튼 알약형
// v29: 앱셸도 network-first — 갱신이 새로고침 한 번에 닿게
// v28: USDT↔원화 토글 (fx.usdtkrw)   // v27: TV 0.60→0.70 — 각오 기준선 1264%/-35.8%/최악월 -31.1 (2026-09-01). v26: 원장 월경계 마감자본 병기
// v25: ①슬리브EMA150+②바스켓VT상수+슬리브올림 배포 — 각오 기준선 1035%/-31.1% (2026-09-01)
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
  // 🚨 앱 셸(HTML)까지 network-first로 둔다. cache-first면 옛 워커가 옛 HTML을 먼저 내주고
  //    새 워커는 뒤에서 설치만 돼서, 화면이 바뀌려면 새로고침을 두 번 해야 했다(2026-09-05).
  //    아이콘·매니페스트 같은 정적 자산은 안 바뀌므로 그대로 cache-first가 맞다.
  const fresh = url.pathname.endsWith('equity.json')
             || e.request.mode === 'navigate'
             || url.pathname.endsWith('/')
             || url.pathname.endsWith('index.html');
  if (fresh) {
    // 최신 우선, 오프라인이면 캐시 (비행기에서도 직전 화면·잔고가 뜬다)
    e.respondWith(
      fetch(e.request).then(r => {
        const cp = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, cp));
        return r;
      }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
    );
  } else {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
  }
});
