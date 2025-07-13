
// Service Worker para PWA e Push Notifications
const CACHE_NAME = 'candlelife-v3';
const STATIC_CACHE = 'candlelife-static-v3';

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/favicon.ico'
];

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing');
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS)),
      self.skipWaiting()
    ])
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating');
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
});

// Fetch event - Network First strategy for API, Cache First for static assets
self.addEventListener('fetch', (event) => {
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
});

// Push event - receber notificações push
self.addEventListener('push', (event) => {
  console.log('Push received:', event);
  
  let data = {};
  if (event.data) {
    data = event.data.json();
  }

  const options = {
    body: data.body || 'Nova mensagem recebida',
    icon: data.icon || '/icon-192x192.png',
    badge: '/notification-badge.png',
    image: data.image,
    data: data.data || {},
    actions: [
      {
        action: 'open',
        title: 'Abrir conversa'
      },
      {
        action: 'close',
        title: 'Fechar'
      }
    ],
    tag: data.tag || 'default',
    requireInteraction: true
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'CandleLife', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  const notificationData = event.notification.data || {};
  let targetUrl = '/';

  // Determinar URL baseado no tipo de notificação
  switch (notificationData.type) {
    case 'message':
      const conversationId = notificationData.conversationId;
      targetUrl = conversationId ? `/chat/${conversationId}` : '/social';
      break;
    case 'transaction':
      targetUrl = '/transactions';
      break;
    case 'goal':
      targetUrl = '/goals';
      break;
    case 'social':
      targetUrl = '/social';
      break;
    default:
      targetUrl = notificationData.url || '/';
  }

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
        // Procurar janela existente
        for (let client of clients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            // Focar na janela existente e navegar
            client.postMessage({
              type: 'NAVIGATE',
              url: targetUrl,
              notificationData: notificationData
            });
            return client.focus();
          }
        }
        
        // Se não existe janela aberta, abrir nova
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
    );
  }
  
  // Log da interação para analytics
  if (notificationData.messageId) {
    console.log('Notification interaction logged:', {
      messageId: notificationData.messageId,
      action: event.action || 'click',
      timestamp: new Date().toISOString()
    });
  }
});

// Background sync for offline messages
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-messages') {
    event.waitUntil(syncMessages());
  }
});

async function syncMessages() {
  // Implementar sincronização de mensagens offline
  console.log('Syncing offline messages...');
}

// Handle background fetch (for file uploads)
self.addEventListener('backgroundfetch', (event) => {
  console.log('Background fetch:', event);
});
