// Service Worker untuk Bukhari Service Center PWA
const CACHE_NAME = 'bsc-v1';
const RUNTIME_CACHE = 'bsc-runtime-v1';

// Assets yang akan di-cache saat install
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/logoo.png',
  '/logo.png',
];

// Install event - cache assets penting
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Precaching assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
          })
          .map((cacheName) => {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
    .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache the response
            caches.open(RUNTIME_CACHE)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // If network fails, try to serve offline page
            if (event.request.destination === 'document') {
              return caches.match('/');
            }
          });
      })
  );
});

// Background sync untuk offline actions (opsional)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      Promise.resolve().then(() => {
        // Implement background sync logic here
        console.log('[Service Worker] Background sync triggered');
      })
    );
  }
});

// Push notification (opsional untuk future implementation)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Notifikasi baru dari BSC',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
  };

  event.waitUntil(
    self.registration.showNotification('Bukhari Service Center', options)
      .catch((error) => {
        console.error('[Service Worker] Failed to show notification:', error);
      })
  );
});

