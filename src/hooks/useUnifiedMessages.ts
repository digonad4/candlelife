import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from './use-toast';
import { messageKeys } from '@/lib/query-keys';
import { unifiedNotificationService } from '@/services/unifiedNotificationService';
import { 
  Message, 
  ChatUser, 
  ConversationSettings, 
  MessageStatus,
  MessageType,
  PaginatedMessages
} from '@/types/messages';

interface UseUnifiedMessagesConfig {
  enableRealtime?: boolean;
  pageSize?: number;
}

export const useUnifiedMessages = (config: UseUnifiedMessagesConfig = {}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { enableRealtime = true, pageSize = 50 } = config;
  
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<any>(null);

  // Unified realtime listener
  useEffect(() => {
    if (!user || !enableRealtime) return;

    console.log('🔄 Setting up unified realtime listener');

    const channel = supabase
      .channel('unified_messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `recipient_id=eq.${user.id}`
      }, async (payload) => {
        console.log('📨 New message received:', payload.new);
        const newMessage = payload.new as Message;
        
        // Get sender info
        const { data: senderData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', newMessage.sender_id)
          .single();

        if (senderData) {
          const senderInfo: ChatUser = {
            id: senderData.id,
            username: senderData.username || 'Usuário',
            full_name: senderData.username || undefined,
            avatar_url: senderData.avatar_url || undefined,
            email: senderData.username || undefined,
            created_at: senderData.created_at,
            updated_at: senderData.updated_at,
            unread_count: 0
          };

          // Unified notification
          unifiedNotificationService.addMessageNotification(newMessage, senderInfo);
        }

        // Invalidate all related queries
        queryClient.invalidateQueries({ queryKey: messageKeys.chatUsers() });
        if (activeConversation) {
          queryClient.invalidateQueries({ queryKey: messageKeys.conversation(activeConversation) });
        }
      })
      .subscribe();

    setIsConnected(true);
    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        console.log('🔌 Disconnecting unified realtime');
        supabase.removeChannel(channelRef.current);
        setIsConnected(false);
      }
    };
  }, [user, enableRealtime, activeConversation, queryClient]);

  // Unified chat users query
  const useChatUsers = () => {
    return useQuery({
      queryKey: messageKeys.chatUsers(),
      queryFn: async (): Promise<ChatUser[]> => {
        if (!user?.id) return [];

        console.log('🔍 Fetching unified chat users for:', user.id);

        try {
          // Optimized query with better joins
          const { data, error } = await supabase
            .rpc('get_chat_users', { p_user_id: user.id });

          if (error) {
            console.error('❌ Error fetching chat users:', error);
            throw error;
          }

          const chatUsers: ChatUser[] = (data || []).map((item: any) => ({
            id: item.id,
            username: item.username || 'Usuário',
            full_name: item.username || undefined,
            avatar_url: item.avatar_url || undefined,
            email: item.username || undefined,
            created_at: item.created_at || new Date().toISOString(),
            updated_at: item.updated_at || new Date().toISOString(),
            unread_count: item.unread_count || 0
          }));
          return chatUsers;
        } catch (error) {
          console.error('❌ Error in unified chat users query:', error);
          throw error;
        }
      },
      enabled: !!user,
      staleTime: 30000,
      refetchOnWindowFocus: false,
    });
  };

  // Unified conversation query
  const useConversation = (otherUserId: string, searchTerm?: string) => {
    return useQuery({
      queryKey: messageKeys.conversationWithSearch(otherUserId, searchTerm),
      queryFn: async (): Promise<Message[]> => {
        if (!user || !otherUserId) return [];

        console.log('🔍 Fetching unified conversation:', { otherUserId, searchTerm });

        try {
          let query = supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`)
            .eq('deleted_by_recipient', false)
            .order('created_at', { ascending: false })
            .limit(pageSize);

          if (searchTerm) {
            query = query.ilike('content', `%${searchTerm}%`);
          }

          const { data, error } = await query;

          if (error) {
            console.error('❌ Error fetching conversation:', error);
            throw error;
          }

          const messages: Message[] = (data || []).map((msg: any) => ({
            id: msg.id,
            content: msg.content,
            sender_id: msg.sender_id,
            recipient_id: msg.recipient_id,
            created_at: msg.created_at,
            read: msg.read || false,
            message_status: msg.message_status || MessageStatus.SENT,
            message_type: MessageType.TEXT,
            attachment_url: msg.attachment_url,
            deleted_by_recipient: false,
            reactions: []
          })).reverse();

          console.log('✅ Fetched unified messages:', messages.length);
          return messages;
        } catch (error) {
          console.error('❌ Error in unified conversation query:', error);
          throw error;
        }
      },
      enabled: !!user && !!otherUserId,
      staleTime: 0,
      refetchOnWindowFocus: false,
    });
  };

  // Unified send message
  const useSendMessage = () => useMutation({
    mutationFn: async ({ 
      recipientId, 
      content, 
      attachmentUrl,
      fileName,
      fileSize
    }: { 
      recipientId: string; 
      content: string; 
      attachmentUrl?: string;
      fileName?: string;
      fileSize?: number;
    }) => {
      if (!user) throw new Error('User not authenticated');

      console.log('📤 Sending unified message:', { recipientId, content: content.substring(0, 50) + '...' });

      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          content,
          attachment_url: attachmentUrl,
          message_status: 'sent'
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error sending unified message:', error);
        throw error;
      }

      console.log('✅ Unified message sent successfully:', data.id);
      return data;
    },
    onSuccess: () => {
      console.log('📤 Unified message sent, invalidating queries');
      queryClient.invalidateQueries({ queryKey: messageKeys.chatUsers() });
      if (activeConversation) {
        queryClient.invalidateQueries({ queryKey: messageKeys.conversation(activeConversation) });
      }
    },
    onError: (error) => {
      console.error('❌ Unified send message error:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  // Unified mark as read
  const useMarkConversationAsRead = () => useMutation({
    mutationFn: async (otherUserId: string) => {
      if (!user) throw new Error('User not authenticated');

      console.log('📖 Marking unified conversation as read with:', otherUserId);

      const { error } = await supabase
        .rpc('mark_conversation_as_read_v2', {
          p_recipient_id: user.id,
          p_sender_id: otherUserId
        });

      if (error) {
        console.error('❌ Error marking unified conversation as read:', error);
        throw error;
      }

      console.log('✅ Unified conversation marked as read');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.chatUsers() });
    }
  });

  // Unified clear conversation
  const useClearConversation = () => useMutation({
    mutationFn: async (otherUserId: string) => {
      if (!user) throw new Error('User not authenticated');

      console.log('🗑️ Clearing unified conversation with:', otherUserId);

      const { error } = await supabase
        .rpc('clear_conversation', {
          p_user_id: user.id,
          p_other_user_id: otherUserId
        });

      if (error) {
        console.error('❌ Error clearing unified conversation:', error);
        throw error;
      }

      console.log('✅ Unified conversation cleared');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.chatUsers() });
      if (activeConversation) {
        queryClient.invalidateQueries({ queryKey: messageKeys.conversation(activeConversation) });
      }
    }
  });

  // Get total unread count
  const getTotalUnreadCount = () => {
    const chatUsersQuery = useChatUsers();
    const chatUsers = chatUsersQuery.data || [];
    return chatUsers.reduce((total, user) => total + user.unread_count, 0);
  };

  // Direct access to data for components
  const chatUsersQuery = useChatUsers();
  const chatUsers = chatUsersQuery.data || [];
  const isLoadingChatUsers = chatUsersQuery.isLoading;

  return {
    // State
    activeConversation,
    setActiveConversation,
    isConnected,

    // Hooks
    useChatUsers,
    useConversation,
    useSendMessage,
    useMarkConversationAsRead,
    useClearConversation,

    // Direct data access
    chatUsers,
    isLoadingChatUsers,
    getTotalUnreadCount,

    // Direct functions for compatibility
    sendMessage: useSendMessage(),
    clearConversation: useClearConversation(),

    // Functions
    showNotification: async (message: Message) => {
      if (!('Notification' in window)) return;

      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }

      if (Notification.permission === 'granted') {
        const notification = new Notification('Nova mensagem', {
          body: message.content,
          icon: '/candle-life-icon.png',
          badge: '/candle-life-icon.png',
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        setTimeout(() => notification.close(), 5000);
      }
    }
  };
};