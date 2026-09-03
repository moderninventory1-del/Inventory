// public/sw.js
// High-performance Service Worker for instant loading, offline caching, and native app feel

const CACHE_VERSION = "modern-electronics-v1";
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const IMAGE_CACHE = `images-${CACHE_VERSION}`;
const DATA_CACHE = `data-${CACHE_VERSION}`;

// Core assets to pre-cache on install for 0ms initial launch
const PRECACHE_ASSETS = [
  "/",
  "/manifest.webmanifest",
  "/manifest-admin.webmanifest",
  "/icon.svg",
  "/icon-192x192.png",
  "/icon-512x512.png",
  "/apple-touch-icon.png",
  "/favicon.ico",
];

// Max items to keep in image cache to prevent storage bloat
const MAX_CACHED_IMAGES = 120;

async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    trimCache(cacheName, maxItems);
  }
}

// 1. Install: Precache shell assets immediately and take control
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn("[SW] Precache failed for some assets:", err);
      });
    })
  );
});

// 2. Activate: Clean up any old caches from previous versions
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            if (
              name !== STATIC_CACHE &&
              name !== IMAGE_CACHE &&
              name !== DATA_CACHE
            ) {
              return caches.delete(name);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// 3. Fetch: Route-specific caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests, chrome extensions, or auth endpoints
  if (
    request.method !== "GET" ||
    !url.protocol.startsWith("http") ||
    url.pathname.startsWith("/api/auth")
  ) {
    return;
  }

  // Strategy A: Next.js static chunks, CSS, fonts, SVG icons (Cache-First, permanent immutable)
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".ico") ||
    url.pathname.endsWith(".woff2")
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Strategy B: Cloudinary Product Photos (Cache-First with fallback to network + auto-trim)
  if (url.hostname === "res.cloudinary.com") {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(IMAGE_CACHE).then((cache) => {
                cache.put(request, responseClone);
                trimCache(IMAGE_CACHE, MAX_CACHED_IMAGES);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // If offline and image not cached, return empty or cached placeholder
            return cachedResponse || Response.error();
          });
      })
    );
    return;
  }

  // Strategy C: Public Inventory API (Stale-While-Revalidate for instant 0ms responses)
  if (url.pathname === "/api/inventory") {
    event.respondWith(
      caches.open(DATA_CACHE).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Strategy D: Page Navigations (HTML) - Stale-While-Revalidate with Network Fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          return caches.match("/");
        })
    );
    return;
  }
});
