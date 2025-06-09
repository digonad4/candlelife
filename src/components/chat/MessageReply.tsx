
import { X, Reply } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Message } from '@/types/messages';

interface MessageReplyProps {
  replyingTo: Message | null;
  onCancelReply: () => void;
}

export const MessageReply = ({ replyingTo, onCancelReply }: MessageReplyProps) => {
  if (!replyingTo) return null;

  return (
    <div className="flex items-center gap-2 p-3 bg-muted/50 border-l-4 border-primary">
      <Reply className="h-4 w-4 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-muted-foreground">
          Respondendo a {replyingTo.sender_username || 'Usuário'}
        </p>
        <p className="text-sm truncate">
          {replyingTo.content}
        </p>
      </div>
      <Button size="sm" variant="ghost" onClick={onCancelReply}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
