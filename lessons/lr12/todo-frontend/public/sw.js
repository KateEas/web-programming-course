"use strict";
(() => {
  // src/sw.ts
  var sw = self;
  var CACHE_NAME = "todo - pwa - v1";
  sw.addEventListener("install", (event) => {
    console.log("[SW] Install event");
    event.waitUntil(
      (async () => {
        const STATIC_ASSETS = [
          "/",
          "/index.html",
          "/manifest.webmanifest"
        ];
        const cache = await caches.open(CACHE_NAME);
        console.log("[SW] Caching static assets");
        await cache.addAll(STATIC_ASSETS);
        await sw.skipWaiting();
      })()
    );
  });
  sw.addEventListener("activate", (event) => {
    event.waitUntil(
      (async () => {
        const cacheKeys = await caches.keys();
        const deletePromises = cacheKeys.filter((key) => key !== CACHE_NAME).map((key) => {
          console.log("[SW] Deleting old cache:", key);
          return caches.delete(key);
        });
        await Promise.all(deletePromises);
        await sw.clients.claim();
      })()
    );
  });
  sw.addEventListener("fetch", (event) => {
    const url = new URL(event.request.url);
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          console.log("[SW] Cache hit:", url.pathname);
          return cachedResponse;
        }
        console.log("[SW] Cache miss, fetching:", url.pathname);
        return fetch(event.request).then((response) => {
          if (response.status === 200 && event.request.method === "GET") {
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
})();
