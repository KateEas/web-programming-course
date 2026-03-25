"use strict";
(() => {
  // src/sw.ts
  var sw = self;
  sw.addEventListener("install", (event) => {
    event.waitUntil(
      (async () => {
        await sw.skipWaiting();
      })()
    );
  });
  sw.addEventListener("activate", (event) => {
    event.waitUntil(
      (async () => {
        await sw.clients.claim();
      })()
    );
  });
  sw.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;
    event.respondWith(fetch(event.request));
  });
})();
