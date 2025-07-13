// Service Worker - Background Sync Module

const SyncManager = {
  // Handle background sync events
  handleSync(event) {
    console.log('Background sync event:', event.tag);
    
    if (event.tag === 'background-sync-messages') {
      event.waitUntil(this.syncMessages());
    } else if (event.tag === 'background-sync-transactions') {
      event.waitUntil(this.syncTransactions());
    } else if (event.tag === 'background-sync-push-subscription') {
      event.waitUntil(this.syncPushSubscription());
    }
  },

  // Sync offline messages
  async syncMessages() {
    console.log('Syncing offline messages...');
    
    try {
      // Get offline messages from IndexedDB or localStorage
      const offlineMessages = await this.getOfflineMessages();
      
      if (offlineMessages.length === 0) {
        console.log('No offline messages to sync');
        return;
      }

      // Send each message
      for (const message of offlineMessages) {
        try {
          await this.sendMessage(message);
          await this.removeOfflineMessage(message.id);
          console.log('Offline message synced:', message.id);
        } catch (error) {
          console.error('Failed to sync message:', message.id, error);
        }
      }
    } catch (error) {
      console.error('Error syncing messages:', error);
    }
  },

  // Sync offline transactions
  async syncTransactions() {
    console.log('Syncing offline transactions...');
    
    try {
      const offlineTransactions = await this.getOfflineTransactions();
      
      for (const transaction of offlineTransactions) {
        try {
          await this.sendTransaction(transaction);
          await this.removeOfflineTransaction(transaction.id);
          console.log('Offline transaction synced:', transaction.id);
        } catch (error) {
          console.error('Failed to sync transaction:', transaction.id, error);
        }
      }
    } catch (error) {
      console.error('Error syncing transactions:', error);
    }
  },

  // Sync push subscription
  async syncPushSubscription() {
    console.log('Syncing push subscription...');
    
    try {
      const subscription = await self.registration.pushManager.getSubscription();
      if (subscription) {
        await this.updatePushSubscription(subscription);
        console.log('Push subscription synced');
      }
    } catch (error) {
      console.error('Error syncing push subscription:', error);
    }
  },

  // Helper methods for data persistence (to be implemented with IndexedDB)
  async getOfflineMessages() {
    // Implementation would use IndexedDB to get stored offline messages
    return [];
  },

  async removeOfflineMessage(messageId) {
    // Implementation would remove message from IndexedDB
    console.log('Removing offline message:', messageId);
  },

  async sendMessage(message) {
    // Implementation would send message to Supabase
    console.log('Sending message:', message);
  },

  async getOfflineTransactions() {
    // Implementation would use IndexedDB to get stored offline transactions
    return [];
  },

  async removeOfflineTransaction(transactionId) {
    // Implementation would remove transaction from IndexedDB
    console.log('Removing offline transaction:', transactionId);
  },

  async sendTransaction(transaction) {
    // Implementation would send transaction to Supabase
    console.log('Sending transaction:', transaction);
  },

  async updatePushSubscription(subscription) {
    // Implementation would update push subscription on server
    console.log('Updating push subscription:', subscription.endpoint);
  }
};

// Handle background fetch (for file uploads)
const BackgroundFetchManager = {
  handleBackgroundFetch(event) {
    console.log('Background fetch:', event);
    
    if (event.tag === 'file-upload') {
      event.waitUntil(this.handleFileUpload(event));
    }
  },

  async handleFileUpload(event) {
    console.log('Handling background file upload');
    // Implementation for handling file uploads in background
  }
};

// Export for use in main service worker
self.SyncManager = SyncManager;
self.BackgroundFetchManager = BackgroundFetchManager;