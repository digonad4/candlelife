
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Message } from '@/types/messages';

interface MessageReplyProps {
  replyingTo: Message;
  onCancelReply: () => void;
}

export const MessageReply = ({
  replyingTo,
  onCancelReply
}: MessageReplyProps) => {
  return (
    <div className="bg-muted/50 border-l-4 border-primary p-3 flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <span>Respondendo a {replyingTo.sender_username || 'Usuário'}</span>
        </div>
        <p className="text-sm truncate">
          {replyingTo.content}
        </p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onCancelReply}
        className="h-6 w-6 p-0 ml-2"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};
