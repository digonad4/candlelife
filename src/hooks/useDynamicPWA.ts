import { useEffect } from 'react';
import { useUnifiedTheme } from '@/context/UnifiedThemeContext';
import { supabase } from '@/integrations/supabase/client';

export const useDynamicPWA = () => {
  const { appliedTheme } = useUnifiedTheme();

  // Atualizar manifest.json dinamicamente
  const updateManifest = (theme: string) => {
    // Não necessário atualizar manifest dinamicamente para PWA básico
    console.log('Tema atual:', theme);
  };

  // Atualizar meta tags do tema
  const updateThemeMetaTags = (theme: string) => {
    const themeColors: Record<string, { theme: string; background: string }> = {
      light: { theme: '#8B5CF6', background: '#ffffff' },
      dark: { theme: '#8B5CF6', background: '#0f0f23' },
      cyberpunk: { theme: '#00ff9f', background: '#0f0f0f' },
      dracula: { theme: '#ff79c6', background: '#282a36' },
      nord: { theme: '#5e81ac', background: '#2e3440' },
      purple: { theme: '#7209b7', background: '#1a0b2e' },
      green: { theme: '#22c55e', background: '#0d1b0d' },
      ocean: { theme: '#06b6d4', background: '#0f1419' },
      sunset: { theme: '#f97316', background: '#1a0e0a' },
      forest: { theme: '#16a34a', background: '#0a140a' },
      coffee: { theme: '#a16207', background: '#1c1611' },
      pastel: { theme: '#e879f9', background: '#fdf7f0' },
      neon: { theme: '#00ff00', background: '#050505' },
      vintage: { theme: '#d2691e', background: '#2d1b0e' },
      midnight: { theme: '#4f46e5', background: '#000000' },
      royal: { theme: '#8b5cf6', background: '#1e1b4b' },
      'super-hacker': { theme: '#00ff00', background: '#000000' },
      supabase: { theme: '#3ecf8e', background: '#0f1114' }
    };

    const colors = themeColors[theme] || themeColors.light;

    // Atualizar theme-color
    let themeColorMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.name = 'theme-color';
      document.head.appendChild(themeColorMeta);
    }
    themeColorMeta.content = colors.theme;

    // Atualizar background-color para iOS
    let bgColorMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]') as HTMLMetaElement;
    if (!bgColorMeta) {
      bgColorMeta = document.createElement('meta');
      bgColorMeta.name = 'apple-mobile-web-app-status-bar-style';
      document.head.appendChild(bgColorMeta);
    }
    bgColorMeta.content = theme === 'light' || theme === 'pastel' ? 'default' : 'black-translucent';

    // Atualizar msapplication-navbutton-color para Windows
    let navButtonMeta = document.querySelector('meta[name="msapplication-navbutton-color"]') as HTMLMetaElement;
    if (!navButtonMeta) {
      navButtonMeta = document.createElement('meta');
      navButtonMeta.name = 'msapplication-navbutton-color';
      document.head.appendChild(navButtonMeta);
    }
    navButtonMeta.content = colors.theme;
  };

  // Efeito para atualizar quando o tema muda
  useEffect(() => {
    updateManifest(appliedTheme);
    updateThemeMetaTags(appliedTheme);
  }, [appliedTheme]);

  // Detectar instalação do PWA
  const detectPWAInstall = () => {
    window.addEventListener('appinstalled', () => {
      console.log('PWA instalado com sucesso!');
      // Opcional: trackear evento de instalação
    });

    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('PWA pode ser instalado');
      // O prompt de instalação será mostrado pelo componente InstallPrompt
    });
  };

  // Registrar service worker se não estiver registrado
  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        
        console.log('Service Worker registrado:', registration);

        // Escutar atualizações do service worker
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // Nova versão disponível
                  console.log('Nova versão do app disponível!');
                  // Opcional: mostrar notificação para reload
                }
              }
            });
          }
        });

      } catch (error) {
        console.error('Erro registrando Service Worker:', error);
      }
    }
  };

  // Inicializar PWA
  useEffect(() => {
    detectPWAInstall();
    registerServiceWorker();
  }, []);

  return {
    updateManifest,
    updateThemeMetaTags
  };
};