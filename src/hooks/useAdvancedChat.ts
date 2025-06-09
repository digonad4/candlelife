
import { useState, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from './use-toast';
import { EncryptionService } from '@/services/encryptionService';
import { Message } from '@/types/messages';

export const useAdvancedChat = (otherUserId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const fileUploadRef = useRef<HTMLInputElement>(null);

  // Upload de arquivo para Supabase Storage
  const uploadFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('chat-attachments')
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('chat-attachments')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  // Buscar mensagens da conversa
  const useMessages = () => {
    return useQuery({
      queryKey: ['chat-messages', otherUserId],
      queryFn: async (): Promise<Message[]> => {
        if (!user) return [];

        const { data, error } = await supabase
          .from('messages')
          .select(`
            *,
            message_link_previews(*),
            message_reactions(*)
          `)
          .or(`and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`)
          .order('created_at', { ascending: true });

        if (error) throw error;

        // Descriptografar mensagens
        const decryptedMessages = await Promise.all(
          (data || []).map(async (msg: any) => {
            let content = msg.content;
            
            if (msg.encrypted_content) {
              try {
                const otherUser = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
                content = await EncryptionService.decryptMessage(
                  msg.encrypted_content,
                  msg.iv || '',
                  otherUser
                );
              } catch (error) {
                console.error('Decryption failed:', error);
              }
            }

            return {
              ...msg,
              content,
              reactions: msg.message_reactions || [],
              link_previews: msg.message_link_previews || []
            };
          })
        );

        return decryptedMessages;
      },
      enabled: !!user && !!otherUserId,
      refetchInterval: 3000,
    });
  };

  // Enviar mensagem
  const useSendMessage = () => {
    return useMutation({
      mutationFn: async ({ 
        content, 
        attachment, 
        replyToId 
      }: { 
        content: string; 
        attachment?: File; 
        replyToId?: string;
      }) => {
        if (!user) throw new Error('User not authenticated');

        let attachmentUrl = '';
        let fileName = '';
        let fileSize = 0;
        let mimeType = '';
        let duration = 0;

        // Upload de arquivo se existir
        if (attachment) {
          attachmentUrl = await uploadFile(attachment);
          fileName = attachment.name;
          fileSize = attachment.size;
          mimeType = attachment.type;
          
          // Para arquivos de áudio, extrair duração (simplificado)
          if (attachment.type.startsWith('audio/')) {
            // Em produção, usar biblioteca para extrair duração real
            duration = 30; // placeholder
          }
        }

        // Criptografar mensagem
        const { encryptedContent, iv } = await EncryptionService.encryptMessage(
          content, 
          otherUserId
        );

        const messageData = {
          sender_id: user.id,
          recipient_id: otherUserId,
          content: iv ? '' : content, // Conteúdo vazio se criptografado
          encrypted_content: iv ? encryptedContent : null,
          attachment_url: attachmentUrl || null,
          file_name: fileName || null,
          file_size: fileSize || null,
          mime_type: mimeType || null,
          duration: duration || null,
          reply_to_id: replyToId || null,
        };

        const { data, error } = await supabase
          .from('messages')
          .insert(messageData)
          .select()
          .single();

        if (error) throw error;

        // Extrair e salvar links se existirem
        await supabase.rpc('extract_message_links', {
          p_message_id: data.id,
          p_content: content
        });

        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['chat-messages', otherUserId] });
        setReplyingTo(null);
      },
      onError: (error) => {
        console.error('Error sending message:', error);
        toast({
          title: "Erro ao enviar",
          description: "Não foi possível enviar a mensagem.",
          variant: "destructive",
        });
      }
    });
  };

  // Editar mensagem
  const useEditMessage = () => {
    return useMutation({
      mutationFn: async ({ messageId, newContent }: { messageId: string; newContent: string }) => {
        if (!user) throw new Error('User not authenticated');

        const { error } = await supabase.rpc('edit_message', {
          p_message_id: messageId,
          p_user_id: user.id,
          p_new_content: newContent
        });

        if (error) throw error;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['chat-messages', otherUserId] });
      }
    });
  };

  // Excluir mensagem
  const useDeleteMessage = () => {
    return useMutation({
      mutationFn: async (messageId: string) => {
        if (!user) throw new Error('User not authenticated');

        const { error } = await supabase.rpc('soft_delete_message', {
          p_message_id: messageId,
          p_user_id: user.id
        });

        if (error) throw error;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['chat-messages', otherUserId] });
      }
    });
  };

  // Fixar/desfixar mensagem
  const usePinMessage = () => {
    return useMutation({
      mutationFn: async (messageId: string) => {
        if (!user) throw new Error('User not authenticated');

        const conversationId = [user.id, otherUserId].sort().join('-');

        // Verificar se já está fixada
        const { data: existing } = await supabase
          .from('pinned_messages')
          .select('id')
          .eq('message_id', messageId)
          .eq('conversation_id', conversationId)
          .single();

        if (existing) {
          // Desfixar
          const { error } = await supabase
            .from('pinned_messages')
            .delete()
            .eq('id', existing.id);
          
          if (error) throw error;
        } else {
          // Fixar
          const { error } = await supabase
            .from('pinned_messages')
            .insert({
              message_id: messageId,
              conversation_id: conversationId,
              pinned_by: user.id
            });

          if (error) throw error;
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['chat-messages', otherUserId] });
      }
    });
  };

  // Marcar como lida
  const useMarkAsRead = () => {
    return useMutation({
      mutationFn: async () => {
        if (!user) return;

        const { error } = await supabase.rpc('mark_conversation_as_read_v2', {
          p_recipient_id: user.id,
          p_sender_id: otherUserId
        });

        if (error) throw error;
      }
    });
  };

  return {
    useMessages,
    useSendMessage,
    useEditMessage,
    useDeleteMessage,
    usePinMessage,
    useMarkAsRead,
    replyingTo,
    setReplyingTo,
    uploadFile
  };
};
