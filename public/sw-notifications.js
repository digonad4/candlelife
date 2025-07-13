// Service Worker - Push Notifications Module

const NotificationManager = {
  // Handle push events
  handlePush(event) {
    console.log('Push received:', event);
    
    let data = {};
    if (event.data) {
      try {
        data = event.data.json();
      } catch (e) {
        console.error('Error parsing push data:', e);
        data = { title: 'CandleLife', body: 'Nova notificação' };
      }
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
      requireInteraction: true,
      vibrate: [200, 100, 200]
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'CandleLife', options)
    );
  },

  // Handle notification clicks
  handleNotificationClick(event) {
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

    if (event.action === 'close') {
      // Just close the notification
      return;
    }

    if (event.action === 'open' || !event.action) {
      event.waitUntil(
        this.openApp(targetUrl, notificationData)
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
  },

  // Open or focus app window
  async openApp(targetUrl, notificationData) {
    try {
      const clients = await self.clients.matchAll({ 
        type: 'window', 
        includeUncontrolled: true 
      });
      
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
    } catch (error) {
      console.error('Error opening app:', error);
    }
  }
};

// Export for use in main service worker
self.NotificationManager = NotificationManager;