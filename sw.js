const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `til-blog-${CACHE_VERSION}`;

// キャッシュするリソース
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/css/frameworks.min.css',
  '/css/github.min.css',
  '/css/github-style.css',
  '/css/light.css',
  '/css/dark.css',
  '/css/syntax.css',
  '/js/theme-mode.js',
  '/images/icons/pwa-icon-192.png',
  '/images/icons/pwa-icon-512.png',
  '/offline.html'
];

// インストール時にリソースをキャッシュ
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return Promise.all(
          STATIC_CACHE_URLS.map((url) =>
            cache.add(url).catch((error) => {
              console.error('[SW] Failed to cache resource:', url, error);
            })
          )
        );
      })
      .then(() => self.skipWaiting()) // 即座にアクティブ化
  );
});

// 古いキャッシュの削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // 即座に制御を開始
  );
});

// Fetch戦略
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // GET リクエストのみキャッシュ対象
  if (request.method !== 'GET') {
    return;
  }

  // 同一オリジンのリクエストのみ処理
  if (url.origin !== self.location.origin) {
    return;
  }
  // 記事ページ（/post/配下）は Network First
  if (url.pathname.startsWith('/post/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            if (request.destination === 'document') {
              return caches.match('/offline.html');
            }
          });
        })
    );
    return;
  }

  // 静的リソースは Cache First with Network Fallback
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        // キャッシュになければネットワークから取得
        return fetch(request)
          .then((networkResponse) => {
            // 2xx番台のレスポンスのみキャッシュ
            if (networkResponse && networkResponse.ok) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // ネットワークエラー時はオフラインページを返す
            if (request.destination === 'document') {
              return caches.match('/offline.html');
            }
          });
      })
  );
});
