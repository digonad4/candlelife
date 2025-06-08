
import { useState, useEffect } from "react";
import { Bell, X, MessageSquare, DollarSign, Settings, Target, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { unifiedNotificationService, UnifiedNotificationData } from "@/services/unifiedNotificationService";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

export const UnifiedNotificationCenter = () => {
  const [notifications, setNotifications] = useState<UnifiedNotificationData[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = unifiedNotificationService.subscribe(setNotifications);
    return unsubscribe;
  }, []);

  const unreadCount = unifiedNotificationService.getUnreadCount();

  const handleNotificationClick = (notification: UnifiedNotificationData) => {
    unifiedNotificationService.markAsRead(notification.id);
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'message':
        if (notification.conversationId) {
          navigate(`/chat/${notification.conversationId}`);
        } else {
          navigate('/chat');
        }
        break;
      case 'transaction':
        navigate('/transactions');
        break;
      case 'goal':
        navigate('/goals');
        break;
      case 'social':
        navigate('/social');
        break;
      default:
        break;
    }
    
    setIsOpen(false);
  };

  const handleMarkAllAsRead = () => {
    unifiedNotificationService.markAllAsRead();
  };

  const handleClearAll = () => {
    unifiedNotificationService.clearAll();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-4 w-4" />;
      case 'transaction':
        return <DollarSign className="h-4 w-4" />;
      case 'goal':
        return <Target className="h-4 w-4" />;
      case 'social':
        return <Users className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const getNotificationIconColor = (type: string) => {
    switch (type) {
      case 'message':
        return 'text-blue-500';
      case 'transaction':
        return 'text-green-500';
      case 'goal':
        return 'text-purple-500';
      case 'social':
        return 'text-orange-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Notificações</h3>
            {notifications.length > 0 && (
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                    Marcar como lidas
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={handleClearAll}>
                  Limpar
                </Button>
              </div>
            )}
          </div>
        </div>
        
        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nenhuma notificação</p>
            </div>
          ) : (
            <div className="p-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent/50 mb-2 ${
                    !notification.read ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    {notification.avatar ? (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={notification.avatar} />
                        <AvatarFallback>
                          {getNotificationIcon(notification.type)}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className={`h-8 w-8 rounded-full bg-accent flex items-center justify-center ${getNotificationIconColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm truncate">
                          {notification.title}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            unifiedNotificationService.removeNotification(notification.id);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {notification.body}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.timestamp), {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
