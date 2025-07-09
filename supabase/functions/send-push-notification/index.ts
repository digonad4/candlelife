import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushNotificationPayload {
  user_id: string;
  title: string;
  body: string;
  data?: any;
  type?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, title, body, data, type = 'message' }: PushNotificationPayload = await req.json();

    if (!user_id || !title || !body) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user's push subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', user_id);

    if (subError) {
      console.error('Error fetching subscriptions:', subError);
      return new Response(JSON.stringify({ error: 'Failed to fetch subscriptions' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ message: 'No subscriptions found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error('VAPID keys not configured');
      return new Response(JSON.stringify({ error: 'VAPID keys not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const notificationPayload = {
      title,
      body,
      icon: '/icon-192x192.png',
      badge: '/notification-badge.png',
      data: {
        type,
        ...data
      },
      actions: [
        {
          action: 'open',
          title: 'Abrir'
        },
        {
          action: 'close',
          title: 'Fechar'
        }
      ],
      tag: type,
      requireInteraction: true
    };

    let successCount = 0;
    let errorCount = 0;

    // Send to each subscription
    for (const subscription of subscriptions) {
      try {
        // Create VAPID headers using Web Crypto API
        const vapidHeaders = await generateVAPIDHeaders(
          subscription.endpoint,
          vapidPublicKey,
          vapidPrivateKey
        );

        const response = await fetch(subscription.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'TTL': '86400', // 24 hours
            ...vapidHeaders
          },
          body: JSON.stringify(notificationPayload)
        });

        if (response.ok) {
          successCount++;
          
          // Log successful notification
          await supabase.rpc('log_push_notification', {
            p_user_id: user_id,
            p_subscription_id: subscription.id,
            p_title: title,
            p_body: body,
            p_type: type,
            p_data: data || {}
          });
        } else {
          errorCount++;
          console.error(`Failed to send notification: ${response.status} ${response.statusText}`);
          
          // If subscription is no longer valid, remove it
          if (response.status === 410) {
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('id', subscription.id);
          }
        }
      } catch (error) {
        errorCount++;
        console.error('Error sending notification:', error);
      }
    }

    return new Response(JSON.stringify({
      message: `Notifications sent: ${successCount} successful, ${errorCount} failed`,
      successCount,
      errorCount
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in send-push-notification:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function generateVAPIDHeaders(endpoint: string, publicKey: string, privateKey: string) {
  // For production, you'd want to implement proper VAPID JWT generation
  // This is a simplified version - consider using a proper VAPID library
  const urlParts = new URL(endpoint);
  const audience = `${urlParts.protocol}//${urlParts.host}`;
  
  // Create JWT header
  const header = {
    typ: 'JWT',
    alg: 'ES256'
  };

  // Create JWT payload
  const payload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60, // 12 hours
    sub: 'mailto:your-email@example.com' // Replace with your email
  };

  // For now, return basic headers (in production, implement proper JWT signing)
  return {
    'Authorization': `vapid t=${btoa(JSON.stringify({ header, payload }))}, k=${publicKey}`
  };
}