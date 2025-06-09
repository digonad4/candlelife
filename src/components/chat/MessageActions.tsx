
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  Reply, 
  Edit3, 
  Trash2, 
  Pin, 
  Copy,
  Forward
} from 'lucide-react';
import { Message } from '@/types/messages';

interface MessageActionsProps {
  message: Message;
  currentUserId?: string;
  onReply: (message: Message) => void;
  onEdit: (message: Message) => void;
  onDelete: (messageId: string) => void;
  onPin: (messageId: string) => void;
  onCopy: (content: string) => void;
}

export const MessageActions = ({
  message,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onPin,
  onCopy
}: MessageActionsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const isOwnMessage = message.sender_id === currentUserId;

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    onCopy(message.content);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreHorizontal className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => { onReply(message); setIsOpen(false); }}>
          <Reply className="h-4 w-4 mr-2" />
          Responder
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleCopy}>
          <Copy className="h-4 w-4 mr-2" />
          Copiar texto
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => { onPin(message.id); setIsOpen(false); }}>
          <Pin className="h-4 w-4 mr-2" />
          {message.is_pinned ? 'Desafixar' : 'Fixar'}
        </DropdownMenuItem>

        {isOwnMessage && (
          <>
            <DropdownMenuItem onClick={() => { onEdit(message); setIsOpen(false); }}>
              <Edit3 className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => { onDelete(message.id); setIsOpen(false); }}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
