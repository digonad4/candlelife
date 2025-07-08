
import { useCallback, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export const useTypingIndicator = () => {
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});

  const sendTypingStatus = useCallback(async (otherUserId: string, isTyping: boolean) => {
    if (!user) return;

    try {
      await supabase.rpc('update_typing_status', {
        p_user_id: user.id,
        p_conversation_with_user_id: otherUserId,
        p_is_typing: isTyping
      });
    } catch (error) {
      console.error('Error updating typing status:', error);
    }
  }, [user]);

  const isUserTyping = useCallback((userId: string) => {
    return typingUsers[userId] || false;
  }, [typingUsers]);

  // Subscribe to typing status changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('typing-status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'typing_status',
          filter: `conversation_with_user_id=eq.${user.id}`
        },
        (payload) => {
          const { user_id, is_typing } = payload.new;
          setTypingUsers(prev => ({
            ...prev,
            [user_id]: is_typing
          }));
          
          // Clear typing status after 5 seconds if still typing
          if (is_typing) {
            setTimeout(() => {
              setTypingUsers(prev => ({
                ...prev,
                [user_id]: false
              }));
            }, 5000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { sendTypingStatus, isUserTyping };
};
