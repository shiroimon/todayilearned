// ビルド時のタイムスタンプでキャッシュバージョンを自動更新
const CACHE_VERSION = 'v-1770026924';
const CACHE_NAME = `til-blog-${CACHE_VERSION}`;

// キャッシュするリソース（HTMLファイルを除く静的アセットのみ）
const STATIC_CACHE_URLS = [
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

  // HTMLドキュメント（.html または拡張子なし）は Network First
  // デプロイ後に常に最新版を取得するため
  const isHTMLDocument =
    request.destination === 'document' ||
    url.pathname.endsWith('.html') ||
    url.pathname === '/' ||
    (!url.pathname.includes('.') && !url.pathname.startsWith('/css') && !url.pathname.startsWith('/js') && !url.pathname.startsWith('/images'));

  if (isHTMLDocument) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // 最新版を取得できたらキャッシュに保存（オフライン時用）
          if (response && response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => {
          // ネットワークエラー時のみキャッシュから返す
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // キャッシュもない場合はオフラインページ
            return caches.match('/offline.html');
          });
        })
    );
    return;
  }

  // CSS/JS/画像などの静的アセットは Cache First
  // パフォーマンスのため、キャッシュを優先
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
            // 静的アセット取得失敗時は何も返さない
            return new Response('', { status: 404 });
          });
      })
  );
});
