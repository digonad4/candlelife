import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Check if push notifications are supported
    setIsSupported('serviceWorker' in navigator && 'PushManager' in window);
    
    if (Notification.permission) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) {
      throw new Error('Push notifications not supported');
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  };

  const subscribe = async () => {
    if (!isSupported || !user) {
      throw new Error('Cannot subscribe: not supported or user not logged in');
    }

    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // Get VAPID public key from environment or use default
      const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa40HI-11-bQGxLlq4pGqw_X_wJzs-XEA1j75pEO8tpIi-5IwRdZEZllr2lVSI'; // Replace with your actual key

      // Subscribe to push notifications
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      setSubscription(pushSubscription);

      // Save subscription to database
      await saveSubscription(pushSubscription);

      return pushSubscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      throw error;
    }
  };

  const unsubscribe = async () => {
    if (subscription) {
      await subscription.unsubscribe();
      await removeSubscription();
      setSubscription(null);
    }
  };

  const saveSubscription = async (pushSubscription: PushSubscription) => {
    if (!user) return;

    const subscriptionData = {
      user_id: user.id,
      endpoint: pushSubscription.endpoint,
      p256dh: btoa(String.fromCharCode(...new Uint8Array(pushSubscription.getKey('p256dh')!))),
      auth: btoa(String.fromCharCode(...new Uint8Array(pushSubscription.getKey('auth')!))),
      platform: 'web'
    };

    const { error } = await supabase
      .from('push_subscriptions')
      .upsert(subscriptionData, {
        onConflict: 'user_id,endpoint'
      });

    if (error) {
      console.error('Error saving subscription:', error);
      throw error;
    }
  };

  const removeSubscription = async () => {
    if (!user || !subscription) return;

    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', user.id)
      .eq('endpoint', subscription.endpoint);

    if (error) {
      console.error('Error removing subscription:', error);
    }
  };

  const sendNotification = async (userId: string, title: string, body: string, data?: any) => {
    try {
      const { error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          user_id: userId,
          title,
          body,
          data,
          type: 'message'
        }
      });

      if (error) {
        console.error('Error sending push notification:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  };

  return {
    permission,
    subscription,
    isSupported,
    requestPermission,
    subscribe,
    unsubscribe,
    sendNotification
  };
};

// Utility function to convert base64 to Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}