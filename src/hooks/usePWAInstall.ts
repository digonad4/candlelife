import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    const isInWebView = window.navigator.userAgent.includes('wv');
    const installed = isStandalone || isInWebAppiOS;
    setIsInstalled(installed);

    // Don't show prompt if already installed or in webview
    if (installed || isInWebView) {
      return;
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt fired');
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setCanInstall(true);
      
      // Show install prompt after receiving the event
      const dismissedTime = localStorage.getItem('installPromptDismissed');
      const shouldShow = !dismissedTime || (Date.now() - parseInt(dismissedTime)) > 24 * 60 * 60 * 1000;
      
      if (shouldShow) {
        setTimeout(() => {
          setShowInstallPrompt(true);
        }, 2000);
      }
    };

    // Listen for app installed
    const handleAppInstalled = (e: Event) => {
      console.log('appinstalled fired', e);
      setIsInstalled(true);
      setCanInstall(false);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      localStorage.removeItem('installPromptDismissed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) {
      console.log('No deferred prompt available');
      return false;
    }

    try {
      console.log('Triggering install prompt');
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      console.log('User choice:', choiceResult.outcome);
      
      if (choiceResult.outcome === 'accepted') {
        setDeferredPrompt(null);
        setCanInstall(false);
        setShowInstallPrompt(false);
        return true;
      } else {
        // User dismissed, don't show again for a while
        localStorage.setItem('installPromptDismissed', Date.now().toString());
        setShowInstallPrompt(false);
      }
      return false;
    } catch (error) {
      console.error('Error installing PWA:', error);
      return false;
    }
  };

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false);
    // Don't show again for 24 hours
    localStorage.setItem('installPromptDismissed', Date.now().toString());
  };

  return {
    canInstall: canInstall || showInstallPrompt,
    isInstalled,
    installApp,
    dismissInstallPrompt
  };
};