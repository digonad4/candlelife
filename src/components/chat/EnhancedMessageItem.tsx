
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageActions } from './MessageActions';
import { MessageAttachment } from './MessageAttachment';
import { LinkPreview } from './LinkPreview';
import { Check, CheckCheck, Pin, Reply, Edit3, Save, X } from 'lucide-react';
import { Message } from '@/types/messages';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface EnhancedMessageItemProps {
  message: Message;
  currentUserId?: string;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  onReply: (message: Message) => void;
  onEdit: (messageId: string, newContent: string) => Promise<void>;
  onDelete: (messageId: string) => Promise<void>;
  onPin: (messageId: string) => Promise<void>;
  onProfileClick: (userId: string) => void;
}

export const EnhancedMessageItem = ({
  message,
  currentUserId,
  isFirstInGroup,
  isLastInGroup,
  onReply,
  onEdit,
  onDelete,
  onPin,
  onProfileClick
}: EnhancedMessageItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const isOwnMessage = message.sender_id === currentUserId;
  const showAvatar = isFirstInGroup || !isLastInGroup;
  
  // Detectar links no conteúdo
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const hasLinks = urlRegex.test(message.content);
  const links = message.content.match(urlRegex) || [];

  const handleEditSave = async () => {
    if (editContent.trim() === message.content) {
      setIsEditing(false);
      return;
    }

    setIsProcessing(true);
    try {
      await onEdit(message.id, editContent.trim());
      setIsEditing(false);
      toast({
        title: "Mensagem editada",
        description: "Sua mensagem foi editada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível editar a mensagem.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditCancel = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    setIsProcessing(true);
    try {
      await onDelete(message.id);
      toast({
        title: "Mensagem excluída",
        description: "Sua mensagem foi excluída.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a mensagem.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePin = async () => {
    setIsProcessing(true);
    try {
      await onPin(message.id);
      toast({
        title: message.is_pinned ? "Mensagem desafixada" : "Mensagem fixada",
        description: message.is_pinned ? 
          "A mensagem foi desafixada." : 
          "A mensagem foi fixada na conversa.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status da mensagem.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = (content: string) => {
    toast({
      title: "Copiado",
      description: "Texto copiado para a área de transferência.",
    });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Renderizar conteúdo da mensagem com links destacados
  const renderMessageContent = () => {
    if (!hasLinks) {
      return <span>{message.content}</span>;
    }

    const parts = message.content.split(urlRegex);
    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a 
            key={index}
            href={part} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className={cn(
      "group flex gap-3 p-2 hover:bg-muted/30 transition-colors",
      isOwnMessage ? "flex-row-reverse" : "flex-row",
      message.is_pinned && "bg-accent/20 border-l-4 border-primary"
    )}>
      {/* Avatar */}
      {showAvatar ? (
        <Avatar 
          className="h-8 w-8 cursor-pointer"
          onClick={() => onProfileClick(message.sender_id)}
        >
          <AvatarImage src={message.sender_avatar_url} />
          <AvatarFallback>
            {(message.sender_username || 'U').charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="w-8" />
      )}

      {/* Message content */}
      <div className={cn(
        "flex-1 min-w-0 space-y-1",
        isOwnMessage ? "text-right" : "text-left"
      )}>
        {/* Header */}
        {isFirstInGroup && (
          <div className={cn(
            "flex items-center gap-2 text-xs text-muted-foreground",
            isOwnMessage ? "justify-end" : "justify-start"
          )}>
            <span 
              className="font-medium cursor-pointer hover:underline"
              onClick={() => onProfileClick(message.sender_id)}
            >
              {message.sender_username || 'Usuário'}
            </span>
            <span>{formatTime(message.created_at)}</span>
            {message.is_pinned && (
              <Badge variant="secondary" className="h-4 px-1">
                <Pin className="h-2 w-2 mr-1" />
                Fixada
              </Badge>
            )}
          </div>
        )}

        {/* Reply to message */}
        {message.reply_to_id && (
          <div className={cn(
            "p-2 bg-muted/50 rounded border-l-2 border-primary text-sm",
            isOwnMessage ? "mr-8" : "ml-8"
          )}>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <Reply className="h-3 w-3" />
              <span>Respondendo a</span>
            </div>
            {/* Aqui poderia buscar e exibir a mensagem original */}
            <p className="truncate">Mensagem original...</p>
          </div>
        )}

        {/* Message bubble */}
        <div className={cn(
          "relative inline-block max-w-md p-3 rounded-lg break-words",
          isOwnMessage 
            ? "bg-primary text-primary-foreground ml-auto" 
            : "bg-muted",
          !isLastInGroup && isOwnMessage && "rounded-br-sm",
          !isLastInGroup && !isOwnMessage && "rounded-bl-sm"
        )}>
          {/* Edit mode */}
          {isEditing ? (
            <div className="space-y-2">
              <Input
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="bg-background text-foreground"
                disabled={isProcessing}
              />
              <div className="flex gap-1 justify-end">
                <Button 
                  size="sm" 
                  onClick={handleEditSave}
                  disabled={isProcessing}
                >
                  <Save className="h-3 w-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={handleEditCancel}
                  disabled={isProcessing}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Message content */}
              <div className="text-sm">
                {renderMessageContent()}
              </div>

              {/* Edited indicator */}
              {message.edited_at && (
                <div className="text-xs opacity-70 mt-1">
                  editado {formatTime(message.edited_at)}
                </div>
              )}

              {/* Message status */}
              {isOwnMessage && (
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-xs opacity-70">
                    {formatTime(message.created_at)}
                  </span>
                  {message.read ? (
                    <CheckCheck className="h-3 w-3 text-blue-400" />
                  ) : (
                    <Check className="h-3 w-3 opacity-70" />
                  )}
                </div>
              )}
            </>
          )}

          {/* Message actions */}
          {!isEditing && (
            <div className={cn(
              "absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity",
              isOwnMessage ? "-left-10" : "-right-10"
            )}>
              <MessageActions
                message={message}
                currentUserId={currentUserId}
                onReply={onReply}
                onEdit={(msg) => setIsEditing(true)}
                onDelete={handleDelete}
                onPin={handlePin}
                onCopy={handleCopy}
              />
            </div>
          )}
        </div>

        {/* Attachment */}
        {message.attachment_url && (
          <div className={cn(
            "mt-2",
            isOwnMessage ? "flex justify-end" : "flex justify-start"
          )}>
            <MessageAttachment
              attachmentUrl={message.attachment_url}
              fileName={message.file_name}
              fileSize={message.file_size}
              mimeType={message.mime_type}
              duration={message.duration}
            />
          </div>
        )}

        {/* Link previews */}
        {links.length > 0 && (
          <div className={cn(
            "mt-2 space-y-2",
            isOwnMessage ? "flex flex-col items-end" : "flex flex-col items-start"
          )}>
            {links.map((link, index) => (
              <LinkPreview key={index} url={link} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
