
// Main Service Worker - Coordinator
// Import all modules
importScripts('/sw-cache.js');
importScripts('/sw-notifications.js');
importScripts('/sw-sync.js');

console.log('Service Worker main file loaded');

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing');
  CacheManager.handleInstall(event);
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating');
  CacheManager.handleActivate(event);
});

// Fetch event
self.addEventListener('fetch', (event) => {
  CacheManager.handleFetch(event);
});

// Push event - receber notificações push
self.addEventListener('push', (event) => {
  NotificationManager.handlePush(event);
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  NotificationManager.handleNotificationClick(event);
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  SyncManager.handleSync(event);
});

// Handle background fetch (for file uploads)
self.addEventListener('backgroundfetch', (event) => {
  BackgroundFetchManager.handleBackgroundFetch(event);
});

// Message event for communication with main thread
self.addEventListener('message', (event) => {
  console.log('SW received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('Service Worker setup complete');