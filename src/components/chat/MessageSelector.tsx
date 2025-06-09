
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Reply, X } from 'lucide-react';
import { Message } from '@/types/messages';
import { cn } from '@/lib/utils';

interface MessageSelectorProps {
  messages: Message[];
  currentUserId?: string;
  onSelectMessage: (message: Message) => void;
  onCancel: () => void;
  selectedMessageId?: string;
}

export const MessageSelector = ({
  messages,
  currentUserId,
  onSelectMessage,
  onCancel,
  selectedMessageId
}: MessageSelectorProps) => {
  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Reply className="h-5 w-5" />
          <span className="font-medium">Selecionar mensagem para responder</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Lista de mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((message) => {
          const isMyMessage = message.sender_id === currentUserId;
          const isSelected = message.id === selectedMessageId;

          return (
            <div
              key={message.id}
              onClick={() => onSelectMessage(message)}
              className={cn(
                "cursor-pointer p-3 rounded-lg border-2 transition-colors",
                isSelected 
                  ? "border-primary bg-primary/10" 
                  : "border-transparent hover:bg-muted",
                "flex gap-3"
              )}
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                {isMyMessage ? 'Você' : (message.sender_username?.charAt(0) || 'U')}
              </div>

              {/* Conteúdo */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">
                    {isMyMessage ? 'Você' : (message.sender_username || 'Usuário')}
                  </span>
                  <span className="text-muted-foreground">
                    {new Date(message.created_at).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground truncate mt-1">
                  {message.content}
                </p>

                {message.attachment_url && (
                  <div className="text-xs text-muted-foreground mt-1">
                    📎 Anexo
                  </div>
                )}
              </div>

              {/* Indicador de seleção */}
              {isSelected && (
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Reply className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
