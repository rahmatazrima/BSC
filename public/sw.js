// Service Worker for Bukhari Service Center
const CACHE_NAME = 'bsc-cache-v1';
const urlsToCache = [
  '/',
  '/login',
  '/register',
  '/booking',
  '/history',
  '/tracking',
  '/profile',
  '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip service worker for same-origin navigation requests
  // This allows Next.js to handle page navigation properly
  if (request.mode === 'navigate' && url.origin === self.location.origin) {
    return;
  }

  // NEVER cache API routes - always fetch fresh
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(JSON.stringify({ error: 'Network error' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Skip caching for Next.js internal files
  if (url.pathname.startsWith('/_next/')) {
    event.respondWith(fetch(request));
    return;
  }

  // For static assets, use network-first strategy
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Check if valid response
        if (response && response.status === 200) {
          // Clone the response
          const responseToCache = response.clone();

          // Only cache static assets
          if (request.destination === 'image' || 
              request.destination === 'script' || 
              request.destination === 'style' ||
              url.pathname.endsWith('.json')) {
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseToCache);
              });
          }
        }
        return response;
      })
      .catch(() => {
        // Try to serve from cache only if network fails
        return caches.match(request).then((response) => {
          if (response) {
            return response;
          }
          // Fallback for offline
          return new Response('Offline - Please check your internet connection', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
      })
  );
});
