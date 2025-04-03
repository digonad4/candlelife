import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

export type Message = {
  id: string;
  content: string;
  sender_id: string;
  recipient_id: string;
  read: boolean;
  created_at: string;
  deleted_by_recipient: boolean;
  sender_profile?: {
    username: string;
    avatar_url: string | null;
  };
  recipient_profile?: {
    username: string;
    avatar_url: string | null;
  };
};

export type ChatUser = {
  id: string;
  username: string;
  avatar_url: string | null;
  unread_count: number;
  last_message?: string;
  last_message_time?: string;
};

export const useMessages = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`
        },
        (payload) => {
          console.log("Nova mensagem recebida:", payload);
          
          queryClient.invalidateQueries({ queryKey: ['messages'] });
          queryClient.invalidateQueries({ queryKey: ['chatUsers'] });
          
          const newMessage = payload.new as Message;
          if (newMessage.sender_id !== user.id) {
            queryClient.invalidateQueries({ queryKey: ['chat', newMessage.sender_id] });
            
            const fetchSenderInfo = async () => {
              const { data: senderProfile } = await supabase
                .from("profiles")
                .select("username")
                .eq("id", newMessage.sender_id)
                .single();
                
              if (senderProfile) {
                toast({
                  title: `Nova mensagem de ${senderProfile.username}`,
                  description: newMessage.content.length > 60 
                    ? newMessage.content.substring(0, 60) + '...' 
                    : newMessage.content,
                  duration: 5000,
                });
                
                if (Notification.permission === "granted") {
                  const notification = new Notification(`Nova mensagem de ${senderProfile.username}`, {
                    body: newMessage.content.length > 60 
                      ? newMessage.content.substring(0, 60) + '...' 
                      : newMessage.content,
                    icon: '/favicon.ico'
                  });
                  
                  notification.onclick = () => {
                    window.focus();
                    window.dispatchEvent(new CustomEvent('open-chat', { 
                      detail: { 
                        userId: newMessage.sender_id, 
                        userName: senderProfile.username
                      } 
                    }));
                  };
                }
              }
            };
            
            fetchSenderInfo();
          }
        }
      )
      .subscribe();

    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient, toast]);

  const { data: chatUsers = [], isLoading: isLoadingChatUsers } = useQuery({
    queryKey: ["chatUsers"],
    queryFn: async () => {
      if (!user) return [];

      const countUnreadMessages = async (userId: string) => {
        const { count, error } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("recipient_id", user.id)
          .eq("sender_id", userId)
          .eq("read", false)
          .eq("deleted_by_recipient", false);

        if (error) {
          console.error("Erro ao contar mensagens não lidas:", error);
          return 0;
        }

        return count || 0;
      };

      const { data: messages, error } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .eq("deleted_by_recipient", false)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar mensagens:", error);
        throw error;
      }

      const userIds = new Set<string>();
      const userMap = new Map<string, ChatUser>();

      for (const message of messages || []) {
        const otherUserId = message.sender_id === user.id ? message.recipient_id : message.sender_id;
        
        if (!userIds.has(otherUserId)) {
          userIds.add(otherUserId);
          
          const { data: profileData } = await supabase
            .from("profiles")
            .select("username, avatar_url")
            .eq("id", otherUserId)
            .single();
            
          if (profileData) {
            userMap.set(otherUserId, {
              id: otherUserId,
              username: profileData.username,
              avatar_url: profileData.avatar_url,
              unread_count: 0,
              last_message: message.content,
              last_message_time: message.created_at
            });
          }
        }
      }

      const chatUsersWithUnread = await Promise.all(
        Array.from(userMap.values()).map(async (chatUser) => {
          const unreadCount = await countUnreadMessages(chatUser.id);
          return {
            ...chatUser,
            unread_count: unreadCount
          };
        })
      );

      return chatUsersWithUnread.sort((a, b) => {
        if (a.unread_count !== b.unread_count) {
          return b.unread_count - a.unread_count;
        }
        
        const dateA = a.last_message_time ? new Date(a.last_message_time).getTime() : 0;
        const dateB = b.last_message_time ? new Date(b.last_message_time).getTime() : 0;
        return dateB - dateA;
      });
    },
    enabled: !!user,
  });

  const getTotalUnreadCount = (): number => {
    if (!chatUsers) return 0;
    return chatUsers.reduce((total, chatUser) => total + chatUser.unread_count, 0);
  };

  const getConversation = (userId: string) => {
    return useQuery({
      queryKey: ["chat", userId],
      queryFn: async () => {
        if (!user) return [];

        await supabase
          .from("messages")
          .update({ read: true })
          .eq("recipient_id", user.id)
          .eq("sender_id", userId);

        queryClient.invalidateQueries({ queryKey: ["chatUsers"] });

        const { data: messagesData, error } = await supabase
          .from("messages")
          .select("*")
          .or(`and(sender_id.eq.${user.id},recipient_id.eq.${userId}),and(sender_id.eq.${userId},recipient_id.eq.${userId})`)
          .or(`and(sender_id.eq.${user.id},deleted_by_recipient.eq.false),and(recipient_id.eq.${user.id},deleted_by_recipient.eq.false)`)
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Erro ao buscar mensagens da conversa:", error);
          throw error;
        }

        const messagesWithProfiles = await Promise.all(
          (messagesData || []).map(async (message) => {
            const { data: senderProfile } = await supabase
              .from("profiles")
              .select("username, avatar_url")
              .eq("id", message.sender_id)
              .single();

            const { data: recipientProfile } = await supabase
              .from("profiles")
              .select("username, avatar_url")
              .eq("id", message.recipient_id)
              .single();

            return {
              ...message,
              deleted_by_recipient: message.deleted_by_recipient || false,
              sender_profile: senderProfile || { 
                username: "Usuário desconhecido", 
                avatar_url: null 
              },
              recipient_profile: recipientProfile || { 
                username: "Usuário desconhecido", 
                avatar_url: null 
              }
            };
          })
        );

        return messagesWithProfiles || [];
      },
      enabled: !!user && !!userId,
    });
  };

  const sendMessage = useMutation({
    mutationFn: async ({ recipientId, content }: { recipientId: string; content: string }) => {
      if (!user) throw new Error("Usuário não autenticado");
      if (recipientId === user.id) throw new Error("Você não pode enviar mensagens para si mesmo");

      const { data, error } = await supabase
        .from("messages")
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          content,
          read: false,
          deleted_by_recipient: false
        })
        .select()
        .single();

      if (error) {
        console.error("Erro ao enviar mensagem:", error);
        throw error;
      }

      return data;
    },
    onSuccess: (newMessage) => {
      queryClient.invalidateQueries({ queryKey: ["chatUsers"] });
      queryClient.invalidateQueries({ queryKey: ["chat", newMessage.recipient_id] });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Não foi possível enviar a mensagem: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const clearConversation = useMutation({
    mutationFn: async (otherUserId: string) => {
      if (!user) throw new Error("Usuário não autenticado");

      const clearCall = supabase.rpc as any;
      const { error } = await clearCall("clear_conversation", {
        p_user_id: user.id,
        p_other_user_id: otherUserId
      });

      if (error) {
        console.error("Erro ao limpar conversa:", error);
        throw error;
      }

      return otherUserId;
    },
    onSuccess: (userId) => {
      queryClient.invalidateQueries({ queryKey: ["chatUsers"] });
      queryClient.invalidateQueries({ queryKey: ["chat", userId] });

      toast({
        title: "Conversa limpa",
        description: "A conversa foi limpa com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Não foi possível limpar a conversa: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteMessage = useMutation({
    mutationFn: async (messageId: string) => {
      if (!user) throw new Error("Usuário não autenticado");

      const { data: message, error: fetchError } = await supabase
        .from("messages")
        .select("*")
        .eq("id", messageId)
        .single();

      if (fetchError) {
        console.error("Erro ao buscar mensagem:", fetchError);
        throw fetchError;
      }

      if (message.sender_id === user.id) {
        const { error } = await supabase
          .from("messages")
          .delete()
          .eq("id", messageId);

        if (error) {
          console.error("Erro ao excluir mensagem:", error);
          throw error;
        }
      } else if (message.recipient_id === user.id) {
        const { error } = await supabase
          .from("messages")
          .update({ deleted_by_recipient: true })
          .eq("id", messageId);

        if (error) {
          console.error("Erro ao marcar mensagem como excluída:", error);
          throw error;
        }
      } else {
        throw new Error("Você não tem permissão para excluir esta mensagem");
      }

      return {
        messageId,
        otherUserId: message.sender_id === user.id ? message.recipient_id : message.sender_id
      };
    },
    onSuccess: ({ otherUserId }) => {
      queryClient.invalidateQueries({ queryKey: ["chatUsers"] });
      queryClient.invalidateQueries({ queryKey: ["chat", otherUserId] });

      toast({
        title: "Mensagem excluída",
        description: "A mensagem foi excluída com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Não foi possível excluir a mensagem: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    chatUsers,
    isLoadingChatUsers,
    getTotalUnreadCount,
    getConversation,
    sendMessage,
    clearConversation,
    deleteMessage
  };
};
