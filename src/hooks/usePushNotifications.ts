import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    setIsSupported('Notification' in window && 'serviceWorker' in navigator);
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [isSupported]);

  const subscribeToPush = useCallback(async () => {
    if (!user || permission !== 'granted') return null;

    try {
      const registration = await navigator.serviceWorker.ready;
      
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        setSubscription(existingSubscription);
        await savePushSubscription(existingSubscription);
        return existingSubscription;
      }

      // Create new subscription
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.VAPID_PUBLIC_KEY || '')
      });

      setSubscription(newSubscription);
      await savePushSubscription(newSubscription);
      return newSubscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return null;
    }
  }, [user, permission]);

  const savePushSubscription = async (subscription: PushSubscription) => {
    if (!user) return;

    try {
      const subscriptionData = {
        user_id: user.id,
        endpoint: subscription.endpoint,
        p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
        auth: arrayBufferToBase64(subscription.getKey('auth')),
        platform: 'web'
      };

      await supabase
        .from('push_tokens')
        .upsert({
          user_id: user.id,
          token: JSON.stringify(subscriptionData),
          platform: 'web',
          device_info: 'PWA Push Subscription'
        }, { onConflict: 'user_id' });
    } catch (error) {
      console.error('Error saving push subscription:', error);
    }
  };

  const unsubscribeFromPush = useCallback(async () => {
    if (!subscription || !user) return false;

    try {
      await subscription.unsubscribe();
      
      await supabase
        .from('push_tokens')
        .delete()
        .eq('user_id', user.id);

      setSubscription(null);
      return true;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    }
  }, [subscription, user]);

  const sendTestNotification = useCallback(async () => {
    if (permission !== 'granted') return;

    try {
      const notification = new Notification('Candle Life', {
        body: 'Notificações ativadas com sucesso! 🎉',
        icon: '/icon-192x192.png',
        badge: '/notification-badge.png',
        tag: 'test-notification',
        requireInteraction: false
      });

      setTimeout(() => notification.close(), 5000);
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  }, [permission]);

  return {
    isSupported,
    permission,
    subscription,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    sendTestNotification
  };
};

// Helper functions
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return '';
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}