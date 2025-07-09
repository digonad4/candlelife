import { supabase } from '@/integrations/supabase/client';

export interface PushNotificationPayload {
  title: string
  body: string
  type?: 'message' | 'transaction' | 'goal' | 'social'
  icon?: string
  badge?: string
  image?: string
  tag?: string
  data?: any
  conversationId?: string
  messageId?: string
}

class UnifiedPushService {
  private static instance: UnifiedPushService
  private registration: ServiceWorkerRegistration | null = null

  static getInstance() {
    if (!this.instance) {
      this.instance = new UnifiedPushService()
    }
    return this.instance
  }

  async initialize() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications não suportadas neste browser')
      return false
    }

    try {
      this.registration = await navigator.serviceWorker.ready
      console.log('Service Worker pronto para push notifications')
      
      // Escutar mensagens do service worker para navegação
      navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage)
      
      return true
    } catch (error) {
      console.error('Erro inicializando UnifiedPushService:', error)
      return false
    }
  }

  private handleServiceWorkerMessage = (event: MessageEvent) => {
    const { data } = event
    
    if (data.type === 'NAVIGATE') {
      // Navegar programaticamente
      const targetUrl = data.url
      if (targetUrl && window.location.pathname !== targetUrl) {
        window.location.pathname = targetUrl
      }
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Notificações não suportadas')
      return false
    }

    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  async sendNotificationToUser(userId: string, notification: PushNotificationPayload) {
    try {
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          userId,
          notification,
          conversationId: notification.conversationId
        }
      })

      if (error) throw error

      console.log('Push notification enviada:', data)
      return data
    } catch (error) {
      console.error('Erro enviando push notification:', error)
      throw error
    }
  }

  async sendLocalNotification(notification: PushNotificationPayload) {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      console.warn('Permissão de notificação não concedida')
      return
    }

    const localNotification = new Notification(notification.title, {
      body: notification.body,
      icon: notification.icon || '/icon-192x192.png',
      badge: notification.badge || '/notification-badge.png',
      tag: notification.tag || 'local',
      data: notification.data,
      requireInteraction: true
    })

    localNotification.onclick = () => {
      window.focus()
      
      // Navegar baseado no tipo
      let targetUrl = '/'
      switch (notification.type) {
        case 'message':
          targetUrl = notification.conversationId ? `/chat/${notification.conversationId}` : '/social'
          break
        case 'transaction':
          targetUrl = '/transactions'
          break
        case 'goal':
          targetUrl = '/goals'
          break
        case 'social':
          targetUrl = '/social'
          break
      }
      
      if (window.location.pathname !== targetUrl) {
        window.location.pathname = targetUrl
      }
      
      localNotification.close()
    }

    setTimeout(() => localNotification.close(), 5000)
  }

  async checkNotificationSupport() {
    return {
      supported: 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window,
      permission: 'Notification' in window ? Notification.permission : 'not-supported',
      serviceWorkerReady: !!this.registration
    }
  }

  async getNotificationLogs(limit = 50) {
    try {
      const { data, error } = await supabase
        .from('notification_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro buscando logs de notificação:', error)
      return []
    }
  }

  async markNotificationAsClicked(logId: string) {
    try {
      const { error } = await supabase
        .from('notification_logs')
        .update({ delivery_status: 'clicked' })
        .eq('id', logId)

      if (error) throw error
    } catch (error) {
      console.error('Erro marcando notificação como clicada:', error)
    }
  }

  // Helper para enviar notificação de nova mensagem
  async sendMessageNotification(recipientId: string, senderName: string, messageContent: string, conversationId: string) {
    const notification: PushNotificationPayload = {
      title: `Nova mensagem de ${senderName}`,
      body: messageContent.length > 100 ? `${messageContent.substring(0, 100)}...` : messageContent,
      type: 'message',
      tag: `message-${conversationId}`,
      data: {
        senderId: recipientId,
        senderName,
        conversationId,
        type: 'message'
      },
      conversationId
    }

    return this.sendNotificationToUser(recipientId, notification)
  }

  // Helper para notificação de transação
  async sendTransactionNotification(userId: string, transactionType: string, amount: number) {
    const notification: PushNotificationPayload = {
      title: 'Nova Transação',
      body: `${transactionType}: R$ ${amount.toFixed(2)}`,
      type: 'transaction',
      tag: 'transaction',
      data: {
        type: 'transaction',
        amount,
        transactionType
      }
    }

    return this.sendNotificationToUser(userId, notification)
  }

  // Helper para notificação de meta
  async sendGoalNotification(userId: string, goalName: string, achievement: string) {
    const notification: PushNotificationPayload = {
      title: 'Meta Atualizada',
      body: `${goalName}: ${achievement}`,
      type: 'goal',
      tag: 'goal',
      data: {
        type: 'goal',
        goalName,
        achievement
      }
    }

    return this.sendNotificationToUser(userId, notification)
  }
}

export const unifiedPushService = UnifiedPushService.getInstance()