// Service Worker - Cache Management Module

const CACHE_NAME = 'candlelife-v3';
const STATIC_CACHE = 'candlelife-static-v3';

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/favicon.ico'
];

// Cache management utilities
const CacheManager = {
  // Install event handler
  handleInstall(event) {
    console.log('Service Worker installing - Cache module');
    event.waitUntil(
      Promise.all([
        caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS)),
        self.skipWaiting()
      ])
    );
  },

  // Activate event handler
  handleActivate(event) {
    console.log('Service Worker activating - Cache module');
    event.waitUntil(
      Promise.all([
        // Clean old caches
        caches.keys().then(cacheNames => {
          return Promise.all(
            cacheNames.map(cacheName => {
              if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE) {
                return caches.delete(cacheName);
              }
            })
          );
        }),
        self.clients.claim()
      ])
    );
  },

  // Fetch event handler
  handleFetch(event) {
    const { request } = event;
    const url = new URL(request.url);

    // Handle API requests - Network First
    if (url.pathname.includes('/api/') || url.hostname.includes('supabase')) {
      event.respondWith(
        fetch(request)
          .then(response => {
            // Cache successful responses
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(request, responseClone);
              });
            }
            return response;
          })
          .catch(() => {
            // Fallback to cache if network fails
            return caches.match(request);
          })
      );
      return;
    }

    // Handle static assets - Cache First
    if (STATIC_ASSETS.includes(url.pathname) || request.destination === 'image') {
      event.respondWith(
        caches.match(request)
          .then(response => {
            return response || fetch(request).then(fetchResponse => {
              return caches.open(STATIC_CACHE).then(cache => {
                cache.put(request, fetchResponse.clone());
                return fetchResponse;
              });
            });
          })
      );
      return;
    }

    // Handle navigation - Network First with fallback
    if (request.mode === 'navigate') {
      event.respondWith(
        fetch(request)
          .catch(() => {
            return caches.match('/');
          })
      );
      return;
    }
  }
};

// Export for use in main service worker
self.CacheManager = CacheManager;