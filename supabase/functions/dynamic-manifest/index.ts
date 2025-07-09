import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('user_id');
    
    // Base manifest
    const baseManifest = {
      "name": "Candle Life - Chat & Finanças",
      "short_name": "CandleLife",
      "description": "App de chat e gestão financeira pessoal",
      "start_url": "/",
      "display": "standalone",
      "orientation": "portrait",
      "scope": "/",
      "lang": "pt-BR",
      "categories": ["productivity", "finance", "communication"],
      "icons": [
        {
          "src": "/favicon.ico",
          "sizes": "48x48",
          "type": "image/x-icon"
        },
        {
          "src": "/icon-192x192.png",
          "sizes": "192x192",
          "type": "image/png",
          "purpose": "any maskable"
        },
        {
          "src": "/icon-512x512.png",
          "sizes": "512x512",
          "type": "image/png",
          "purpose": "any maskable"
        }
      ],
      "screenshots": [
        {
          "src": "/screenshot-mobile.png",
          "sizes": "390x844",
          "type": "image/png",
          "form_factor": "narrow"
        }
      ],
      "related_applications": [],
      "prefer_related_applications": false,
      "shortcuts": [
        {
          "name": "Chat",
          "short_name": "Chat",
          "description": "Abrir mensagens",
          "url": "/chat",
          "icons": [
            {
              "src": "/icon-192x192.png",
              "sizes": "192x192"
            }
          ]
        },
        {
          "name": "Dashboard",
          "short_name": "Painel",
          "description": "Ver dashboard financeiro",
          "url": "/dashboard",
          "icons": [
            {
              "src": "/icon-192x192.png",
              "sizes": "192x192"
            }
          ]
        }
      ],
      "share_target": {
        "action": "/",
        "method": "GET",
        "params": {
          "title": "title",
          "text": "text",
          "url": "url"
        }
      }
    };

    // Default colors
    let themeColor = "#8B5CF6";
    let backgroundColor = "#8B5CF6";

    // If user ID is provided, fetch their theme
    if (userId) {
      try {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_ANON_KEY') ?? ''
        );

        const { data: userTheme } = await supabase
          .from('user_themes')
          .select('primary_color, background_color')
          .eq('user_id', userId)
          .single();

        if (userTheme) {
          themeColor = userTheme.primary_color || themeColor;
          backgroundColor = userTheme.background_color || backgroundColor;
        }
      } catch (error) {
        console.log('Error fetching user theme:', error);
        // Use default colors
      }
    }

    const manifest = {
      ...baseManifest,
      theme_color: themeColor,
      background_color: backgroundColor
    };

    return new Response(JSON.stringify(manifest), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300' // 5 minutes cache
      }
    });
  } catch (error) {
    console.error('Error generating manifest:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});