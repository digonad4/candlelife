
import { useState } from "react";
import { useOptimizedMessages } from "@/hooks/useOptimizedMessages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, MessageCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNative } from "@/hooks/useNative";
import { Spinner } from "@/components/ui/spinner";

const ChatPage = () => {
  const navigate = useNavigate();
  const { hapticFeedback } = useNative();
  const [searchQuery, setSearchQuery] = useState("");
  
  const { 
    chatUsers, 
    isLoadingChatUsers, 
    getTotalUnreadCount 
  } = useOptimizedMessages();

  const filteredUsers = chatUsers?.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const totalUnread = getTotalUnreadCount();

  const handleUserSelect = (userId: string) => {
    hapticFeedback('light');
    navigate(`/chat/${userId}`);
  };

  const formatLastMessage = (message: any) => {
    if (!message) return "Nenhuma mensagem ainda";
    
    const content = message.content || "";
    if (content.length > 50) {
      return content.substring(0, 50) + "...";
    }
    return content;
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours < 24) {
      return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  };

  if (isLoadingChatUsers) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6 safe-area-top">
        <Spinner className="w-8 h-8 mb-4" />
        <p className="text-muted-foreground">Carregando conversas...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-md mx-auto">
      {/* Header with safe area */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/50 p-4 safe-area-top">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="native-transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Conversas</h1>
            {totalUnread > 0 && (
              <p className="text-sm text-muted-foreground">
                {totalUnread} mensagens não lidas
              </p>
            )}
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conversas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
      </div>

      {/* Chat List with safe area bottom */}
      <div className="flex-1 overflow-auto safe-area-bottom">
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">
              {searchQuery ? "Nenhuma conversa encontrada" : "Nenhuma conversa ainda"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              {searchQuery 
                ? "Tente buscar por outro nome de usuário" 
                : "Suas conversas aparecerão aqui quando você começar a trocar mensagens"
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {filteredUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => handleUserSelect(user.id)}
                className="w-full p-4 flex items-center gap-3 hover:bg-accent/50 transition-colors text-left native-transition active:scale-95"
              >
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    {user.avatar_url ? (
                      <AvatarImage src={user.avatar_url} alt={user.username} />
                    ) : (
                      <AvatarFallback className="text-lg font-medium">
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  {user.unread_count > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs min-w-[20px]"
                    >
                      {user.unread_count > 99 ? '99+' : user.unread_count}
                    </Badge>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-sm truncate">
                      {user.username}
                    </h3>
                    {user.last_message && (
                      <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                        {formatMessageTime(user.last_message.created_at)}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm truncate ${
                    user.unread_count > 0 
                      ? "font-medium text-foreground" 
                      : "text-muted-foreground"
                  }`}>
                    {formatLastMessage(user.last_message)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
