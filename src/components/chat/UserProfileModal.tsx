
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  UserPlus, 
  UserMinus, 
  Shield, 
  Flag,
  Calendar,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface UserProfileModalProps {
  userId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onStartChat?: (userId: string) => void;
}

interface UserProfile {
  id: string;
  username: string;
  avatar_url?: string;
  created_at: string;
  last_seen?: string;
  status?: string;
}

export const UserProfileModal = ({ 
  userId, 
  isOpen, 
  onOpenChange, 
  onStartChat 
}: UserProfileModalProps) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFriend, setIsFriend] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserProfile();
      checkFriendshipStatus();
    }
  }, [isOpen, userId]);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      
      // Buscar perfil do usuário
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Buscar status de presença
      const { data: presenceData } = await supabase
        .from('user_presence')
        .select('status, last_seen')
        .eq('user_id', userId)
        .single();

      setProfile({
        id: profileData.id,
        username: profileData.username || 'Usuário',
        avatar_url: profileData.avatar_url || undefined,
        created_at: profileData.created_at,
        status: presenceData?.status,
        last_seen: presenceData?.last_seen
      });

    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o perfil do usuário.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkFriendshipStatus = async () => {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) return;

      const { data, error } = await supabase.rpc('are_friends', {
        p_user1_id: userId,
        p_user2_id: currentUser.user.id
      });

      if (!error) {
        setIsFriend(data);
      }
    } catch (error) {
      console.error('Error checking friendship:', error);
    }
  };

  const handleSendFriendRequest = async () => {
    try {
      const { data, error } = await supabase.rpc('send_friend_request', {
        p_receiver_id: userId
      });

      if (error) throw error;

      toast({
        title: "Solicitação enviada",
        description: "Sua solicitação de amizade foi enviada.",
      });
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a solicitação de amizade.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveFriend = async () => {
    try {
      const { data, error } = await supabase.rpc('remove_friendship', {
        p_friend_id: userId
      });

      if (error) throw error;

      setIsFriend(false);
      toast({
        title: "Amizade removida",
        description: "A amizade foi removida com sucesso.",
      });
    } catch (error) {
      console.error('Error removing friend:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a amizade.",
        variant: "destructive",
      });
    }
  };

  const formatLastSeen = (lastSeen?: string) => {
    if (!lastSeen) return 'Nunca visto';
    
    const date = new Date(lastSeen);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} h atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!profile) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center p-8">
            <p>Usuário não encontrado</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Perfil do Usuário</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Avatar e informações básicas */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.avatar_url} alt={profile.username} />
                <AvatarFallback className="text-lg">
                  {profile.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className={cn(
                "absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-background",
                getStatusColor(profile.status)
              )} />
            </div>
            
            <div>
              <h3 className="text-xl font-semibold">{profile.username}</h3>
              <div className="flex items-center gap-2 justify-center mt-1">
                <Badge variant={profile.status === 'online' ? 'default' : 'secondary'}>
                  {profile.status || 'offline'}
                </Badge>
                {isFriend && (
                  <Badge variant="outline">
                    <UserPlus className="h-3 w-3 mr-1" />
                    Amigo
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Informações de atividade */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Membro desde {new Date(profile.created_at).toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Último acesso: {formatLastSeen(profile.last_seen)}</span>
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-2">
            <Button 
              onClick={() => onStartChat?.(userId)} 
              className="flex-1"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Conversar
            </Button>
            
            {isFriend ? (
              <Button 
                variant="outline" 
                onClick={handleRemoveFriend}
                className="flex-1"
              >
                <UserMinus className="h-4 w-4 mr-2" />
                Remover
              </Button>
            ) : (
              <Button 
                variant="outline" 
                onClick={handleSendFriendRequest}
                className="flex-1"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            )}
          </div>

          {/* Ações de moderação */}
          <div className="flex gap-2 pt-2 border-t">
            <Button variant="ghost" size="sm" className="flex-1">
              <Shield className="h-4 w-4 mr-2" />
              Bloquear
            </Button>
            <Button variant="ghost" size="sm" className="flex-1">
              <Flag className="h-4 w-4 mr-2" />
              Reportar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
