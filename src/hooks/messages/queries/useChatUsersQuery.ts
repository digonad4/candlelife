
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMessagesContext } from "../types";
import { ChatUser, Message } from "../types";

export const useChatUsersQuery = () => {
  const { user } = useMessagesContext();

  const getChatUsers = () => {
    return useQuery({
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
              // Create a proper Message object for last_message with null safety
              const lastMessage: Message = {
                id: message.id,
                content: message.content,
                created_at: message.created_at,
                sender_id: message.sender_id,
                recipient_id: message.recipient_id,
                read: message.read,
                read_at: message.read_at || undefined,
                attachment_url: message.attachment_url || undefined,
                sender_username: profileData.username,
                sender_avatar_url: profileData.avatar_url || undefined,
                deleted_by_recipient: message.deleted_by_recipient || undefined,
                message_status: (message.message_status as 'sending' | 'sent' | 'delivered' | 'read') || 'sent',
                edited_at: message.edited_at || undefined,
                delivered_at: message.delivered_at || undefined,
                edit_history: message.edit_history as any || undefined,
                reply_to_id: message.reply_to_id || undefined,
                deleted_at: message.deleted_at || undefined,
                is_soft_deleted: message.is_soft_deleted || undefined
              };

              userMap.set(otherUserId, {
                id: otherUserId,
                username: profileData.username,
                avatar_url: profileData.avatar_url || undefined,
                unread_count: 0,
                last_message: lastMessage
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
          
          const dateA = a.last_message ? new Date(a.last_message.created_at).getTime() : 0;
          const dateB = b.last_message ? new Date(b.last_message.created_at).getTime() : 0;
          return dateB - dateA;
        });
      },
      enabled: !!user,
    });
  };

  return {
    getChatUsers
  };
};
