
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { Share } from '@capacitor/share';
import { Toast } from '@capacitor/toast';
import { Device } from '@capacitor/device';
import { Network } from '@capacitor/network';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

class NativeService {
  private static instance: NativeService;
  
  static getInstance(): NativeService {
    if (!NativeService.instance) {
      NativeService.instance = new NativeService();
    }
    return NativeService.instance;
  }

  // Inicializar serviços nativos
  async initialize() {
    if (!Capacitor.isNativePlatform()) return;

    try {
      // Configurar status bar
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setOverlaysWebView({ overlay: true });
      await StatusBar.setBackgroundColor({ color: '#000000' });

      // Configurar teclado
      Keyboard.addListener('keyboardWillShow', (info) => {
        document.body.style.setProperty('--keyboard-height', `${info.keyboardHeight}px`);
      });

      Keyboard.addListener('keyboardWillHide', () => {
        document.body.style.removeProperty('--keyboard-height');
      });

      console.log('🚀 Serviços nativos inicializados');
    } catch (error) {
      console.error('❌ Erro ao inicializar serviços nativos:', error);
    }
  }

  // Compartilhar conteúdo
  async shareContent(title: string, text: string, url?: string) {
    if (!Capacitor.isNativePlatform()) {
      // Fallback para web
      if (navigator.share) {
        return navigator.share({ title, text, url });
      }
      return;
    }

    try {
      await Share.share({ title, text, url });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  }

  // Mostrar toast nativo
  async showToast(message: string, duration: 'short' | 'long' = 'short') {
    if (!Capacitor.isNativePlatform()) {
      // Fallback para web toast existente
      return;
    }

    try {
      await Toast.show({
        text: message,
        duration: duration
      });
    } catch (error) {
      console.error('Erro ao mostrar toast:', error);
    }
  }

  // Vibração háptica
  async hapticFeedback(style: 'light' | 'medium' | 'heavy' = 'medium') {
    if (!Capacitor.isNativePlatform()) return;

    try {
      const impactStyle = {
        light: ImpactStyle.Light,
        medium: ImpactStyle.Medium,
        heavy: ImpactStyle.Heavy
      }[style];

      await Haptics.impact({ style: impactStyle });
    } catch (error) {
      console.error('Erro no feedback háptico:', error);
    }
  }

  // Verificar conectividade
  async getNetworkStatus() {
    try {
      return await Network.getStatus();
    } catch (error) {
      console.error('Erro ao verificar rede:', error);
      return { connected: true, connectionType: 'unknown' };
    }
  }

  // Informações do dispositivo
  async getDeviceInfo() {
    try {
      return await Device.getInfo();
    } catch (error) {
      console.error('Erro ao obter info do dispositivo:', error);
      return null;
    }
  }

  // Esconder/mostrar teclado
  async hideKeyboard() {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await Keyboard.hide();
    } catch (error) {
      console.error('Erro ao esconder teclado:', error);
    }
  }

  async showKeyboard() {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await Keyboard.show();
    } catch (error) {
      console.error('Erro ao mostrar teclado:', error);
    }
  }
}

export const nativeService = NativeService.getInstance();
