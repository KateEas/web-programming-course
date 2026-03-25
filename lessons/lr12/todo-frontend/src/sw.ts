/// <reference lib="WebWorker" />

const sw = self as unknown as ServiceWorkerGlobalScope;

//const CACHE_NAME = 'todo-pwa-starter-v1';
const CACHE_NAME = 'todo - pwa - v1';
sw.addEventListener('install', (event: ExtendableEvent) => {
  console.log('[SW] Install event');
  event.waitUntil(
    (async () => {
      // TODO(PWA-SW-1): предкэшируйте shell-ресурсы приложения.
      // Пример: '/', '/index.html'.
      const STATIC_ASSETS = [
        '/',
        '/index.html',
        '/manifest.webmanifest'
      ];

      const cache = await caches.open(CACHE_NAME);
      console.log('[SW] Caching static assets');
      await cache.addAll(STATIC_ASSETS);

      await sw.skipWaiting();
    })()
  );
});

sw.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      // TODO(PWA-SW-2): очистите старые кэши и оставьте только актуальную версию.
      // Пример шагов:
      // 1) получить список ключей через caches.keys()
      // 2) удалить все, кроме CACHE_NAME
      const cacheKeys = await caches.keys();

      const deletePromises = cacheKeys
        .filter(key => key !== CACHE_NAME)
        .map(key => {
          console.log('[SW] Deleting old cache:', key);
          return caches.delete(key);
        });

      await Promise.all(deletePromises);

      await sw.clients.claim();
    })()
  );
});

sw.addEventListener('fetch', (event: FetchEvent) => {
  const url = new URL(event.request.url);

  // TODO(PWA-SW-3): реализуйте стратегию для GET-запросов.
  // Рекомендуемый минимум для лабы:
  // 1) network-first для HTML
  // 2) fallback на offline.html
  // 3) cache-first или stale-while-revalidate для статических ресурсов

  // Для статических файлов: сначала кэш, потом сеть
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        console.log('[SW] Cache hit:', url.pathname);
        return cachedResponse;
      }

      console.log('[SW] Cache miss, fetching:', url.pathname);
      return fetch(event.request).then((response) => {
        // Кэшируем успешные GET)
        if (response.status === 200 && event.request.method === 'GET') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      });
    })
  );
});
