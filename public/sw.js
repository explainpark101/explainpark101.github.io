const CACHE_NAME = 'explainpark101-v3';
const urlsToCache = [
  '/manifest.json',
  '/browserconfig.xml',
  '/icons/icon-16x16.png',
  '/icons/icon-32x32.png',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/imgs/unnamed/board.png',
  '/imgs/unnamed/man.png'
];

// Service Worker 설치
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Service Worker 활성화
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      ).then(() => {
        // 모든 클라이언트에 메시지 전송하여 새로고침 요청
        return self.clients.claim();
      });
    })
  );
});

// 네트워크 요청 가로채기
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // index.html과 루트 경로는 항상 네트워크 우선 (캐시 무시)
  if (url.pathname === '/' || url.pathname === '/index.html') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // 네트워크 요청 실패 시에만 캐시 사용
          if (!response || response.status !== 200) {
            return caches.match(event.request);
          }
          return response;
        })
        .catch(() => {
          // 네트워크 오류 시 캐시 사용
          return caches.match(event.request);
        })
    );
    return;
  }

  // 다른 리소스는 캐시 우선 전략
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 캐시에서 찾으면 반환
        if (response) {
          return response;
        }

        // 캐시에 없으면 네트워크에서 가져오기
        return fetch(event.request).then(
          (response) => {
            // 유효한 응답이 아니면 그대로 반환
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // 응답을 복제하여 캐시에 저장
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});