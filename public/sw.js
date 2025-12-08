// Service Worker untuk Bukhari Service Center PWA
'use strict';

const CACHE_NAME = 'bsc-v1';
const RUNTIME_CACHE = 'bsc-runtime-v1';

// Assets yang akan di-cache saat install
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
];

// Install event - cache assets penting
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        console.log('[Service Worker] Precaching assets');
        
        // Cache assets dengan error handling
        const cachePromises = PRECACHE_ASSETS.map(async (url) => {
          try {
            const response = await fetch(url);
            if (response && response.ok) {
              await cache.put(url, response);
              console.log(`[Service Worker] Cached: ${url}`);
            } else {
              console.warn(`[Service Worker] Failed to cache ${url}: ${response?.status || 'no response'}`);
            }
          } catch (error) {
            console.warn(`[Service Worker] Failed to cache ${url}:`, error);
          }
        });
        
        await Promise.allSettled(cachePromises);
        console.log('[Service Worker] Installation complete');
        await self.skipWaiting();
      } catch (error) {
        console.error('[Service Worker] Installation failed:', error);
        // Still skip waiting even if caching fails
        await self.skipWaiting();
      }
    })()
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

  // Skip service worker and manifest requests
  if (event.request.url.includes('/sw.js') || event.request.url.includes('/manifest.json')) {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        // Try cache first
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // Fetch from network
        try {
          const response = await fetch(event.request);
          
          // Don't cache non-successful responses or non-basic responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response for caching
          const responseToCache = response.clone();

          // Cache the response (don't wait for it)
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(event.request, responseToCache).catch((err) => {
              console.warn('[Service Worker] Failed to cache response:', err);
            });
          });

          return response;
        } catch (fetchError) {
          console.warn('[Service Worker] Network fetch failed:', fetchError);
          
          // If network fails and it's a document request, try to serve offline page
          if (event.request.destination === 'document') {
            const offlinePage = await caches.match('/');
            if (offlinePage) {
              return offlinePage;
            }
          }
          
          // Return error response
          return new Response('Network error', { 
            status: 408,
            statusText: 'Request Timeout'
          });
        }
      } catch (error) {
        console.error('[Service Worker] Fetch handler error:', error);
        // Return error response
        return new Response('Service Worker error', { 
          status: 500,
          statusText: 'Internal Server Error'
        });
      }
    })()
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

