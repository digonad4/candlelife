
import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { EnhancedChatInput } from './EnhancedChatInput';
import { EnhancedMessageItem } from './EnhancedMessageItem';
import { UserProfileModal } from './UserProfileModal';
import { ChatHeader } from './ChatHeader';
import { useAdvancedChat } from '@/hooks/useAdvancedChat';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Message } from '@/types/messages';

interface ProfessionalChatModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
}

export const ProfessionalChatModal = ({
  isOpen,
  onOpenChange,
  recipientId,
  recipientName,
  recipientAvatar
}: ProfessionalChatModalProps) => {
  const { user } = useAuth();
  const [profileModalUserId, setProfileModalUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    useMessages,
    useSendMessage,
    useEditMessage,
    useDeleteMessage,
    usePinMessage,
    useMarkAsRead,
    replyingTo,
    setReplyingTo,
    uploadFile
  } = useAdvancedChat(recipientId);

  const messagesQuery = useMessages();
  const sendMessageMutation = useSendMessage();
  const editMessageMutation = useEditMessage();
  const deleteMessageMutation = useDeleteMessage();
  const pinMessageMutation = usePinMessage();
  const markAsReadMutation = useMarkAsRead();

  const messages = messagesQuery.data || [];
  const filteredMessages = searchQuery 
    ? messages.filter(msg => 
        msg.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  // Marcar como lida quando abrir
  useEffect(() => {
    if (isOpen && messages.length > 0) {
      markAsReadMutation.mutate();
    }
  }, [isOpen, messages.length, markAsReadMutation]);

  // Agrupar mensagens consecutivas do mesmo usuário
  const groupMessages = () => {
    return filteredMessages.map((message, index) => {
      const prevMessage = index > 0 ? filteredMessages[index - 1] : null;
      const nextMessage = index < filteredMessages.length - 1 ? filteredMessages[index + 1] : null;
      
      const isFirstInGroup = !prevMessage || prevMessage.sender_id !== message.sender_id;
      const isLastInGroup = !nextMessage || nextMessage.sender_id !== message.sender_id;
      
      return {
        message,
        isFirstInGroup,
        isLastInGroup
      };
    });
  };

  const handleSendMessage = async (content: string, attachment?: File, replyToId?: string) => {
    let attachmentUrl = '';
    let fileName = '';
    let fileSize = 0;
    let mimeType = '';

    // Upload de arquivo se existir
    if (attachment) {
      try {
        // Se o attachment já tem uma URL (foi processado), usar ela
        if (attachment.name.startsWith('http')) {
          attachmentUrl = attachment.name;
          fileName = 'uploaded_file';
          fileSize = attachment.size;
          mimeType = attachment.type;
        } else {
          attachmentUrl = await uploadFile(attachment);
          fileName = attachment.name;
          fileSize = attachment.size;
          mimeType = attachment.type;
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        // Continuar sem anexo se upload falhar
      }
    }

    await sendMessageMutation.mutateAsync({
      content,
      attachment,
      replyToId,
      attachmentUrl,
      fileName,
      fileSize,
      mimeType
    });
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    await editMessageMutation.mutateAsync({ messageId, newContent });
  };

  const handleDeleteMessage = async (messageId: string) => {
    await deleteMessageMutation.mutateAsync(messageId);
  };

  const handlePinMessage = async (messageId: string) => {
    await pinMessageMutation.mutateAsync(messageId);
  };

  const handleReply = (message: Message) => {
    setReplyingTo(message);
  };

  const handleProfileClick = (userId: string) => {
    setProfileModalUserId(userId);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const groupedMessages = groupMessages();

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl p-0 gap-0 h-[85vh] max-h-[700px] flex flex-col">
          <ChatHeader 
            recipientName={recipientName}
            recipientAvatar={recipientAvatar}
            onSearchClick={() => {}}
            onClearChat={() => {}}
            onSearch={handleSearch}
            isSearching={false}
          />

          <ScrollArea className="flex-1 px-2">
            {messagesQuery.isLoading ? (
              <div className="flex items-center justify-center h-32">
                <LoadingSpinner />
              </div>
            ) : messagesQuery.isError ? (
              <div className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">Erro ao carregar mensagens</p>
              </div>
            ) : groupedMessages.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">Nenhuma mensagem ainda</p>
              </div>
            ) : (
              <div className="space-y-1 py-4">
                {groupedMessages.map(({ message, isFirstInGroup, isLastInGroup }) => (
                  <EnhancedMessageItem
                    key={message.id}
                    message={message}
                    currentUserId={user?.id}
                    isFirstInGroup={isFirstInGroup}
                    isLastInGroup={isLastInGroup}
                    onReply={handleReply}
                    onEdit={handleEditMessage}
                    onDelete={handleDeleteMessage}
                    onPin={handlePinMessage}
                    onProfileClick={handleProfileClick}
                  />
                ))}
              </div>
            )}
          </ScrollArea>

          <EnhancedChatInput
            onSendMessage={handleSendMessage}
            onTypingStatusChange={() => {}}
            isSubmitting={sendMessageMutation.isPending}
            replyingTo={replyingTo}
            onCancelReply={() => setReplyingTo(null)}
            messages={messages}
            currentUserId={user?.id}
            onStartReply={handleReply}
          />
        </DialogContent>
      </Dialog>

      <UserProfileModal
        userId={profileModalUserId || ''}
        isOpen={!!profileModalUserId}
        onOpenChange={(open) => !open && setProfileModalUserId(null)}
        onStartChat={(userId) => {
          setProfileModalUserId(null);
          // Lógica para iniciar chat com outro usuário
        }}
      />
    </>
  );
};
