
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export const useTypingIndicator = () => {
  const { user } = useAuth();

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

  return { sendTypingStatus };
};
