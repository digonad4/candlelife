import { useEffect } from 'react';
import { useDynamicPWA } from '@/hooks/useDynamicPWA';
import { unifiedPushService } from '@/services/UnifiedPushService';
import { useAuth } from '@/context/AuthContext';

export const PWAInitializer = () => {
  const { user } = useAuth();
  useDynamicPWA(); // Inicializa PWA dinâmico

  useEffect(() => {
    // Inicializar serviços PWA
    const initializePWAServices = async () => {
      try {
        // Inicializar push service
        await unifiedPushService.initialize();
        
        console.log('PWA Services inicializados com sucesso');
      } catch (error) {
        console.error('Erro inicializando PWA Services:', error);
      }
    };

    initializePWAServices();
  }, []);

  // Não renderiza nada - apenas inicializa serviços
  return null;
};