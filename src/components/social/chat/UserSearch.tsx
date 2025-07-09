import { useState, useCallback } from "react";
import { Search, Plus, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

interface User {
  id: string;
  username: string;
  avatar_url?: string;
  is_friend: boolean;
}

interface UserSearchProps {
  onUserSelect?: (user: User) => void;
  onStartChat?: (user: User) => void;
}

export const UserSearch = ({ onUserSelect, onStartChat }: UserSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const searchUsers = useCallback(async (term: string) => {
    if (!term.trim() || term.length < 2) {
      setUsers([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('search_users', {
        search_term: term
      });

      if (error) {
        console.error('Error searching users:', error);
        toast({
          title: "Erro",
          description: "Não foi possível buscar usuários",
          variant: "destructive"
        });
        return;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
      toast({
        title: "Erro", 
        description: "Erro ao buscar usuários",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    searchUsers(value);
  };

  const handleAddFriend = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('send_friend_request', {
        p_receiver_id: userId
      });

      if (error) {
        console.error('Error sending friend request:', error);
        toast({
          title: "Erro",
          description: "Não foi possível enviar solicitação de amizade",
          variant: "destructive"
        });
        return;
      }

      const result = data as { success: boolean; message: string };
      
      if (result.success) {
        toast({
          title: "Sucesso",
          description: result.message
        });
        
        // Refresh search results
        searchUsers(searchTerm);
      } else {
        toast({
          title: "Aviso",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error adding friend:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar solicitação",
        variant: "destructive"
      });
    }
  };

  const handleStartChat = (user: User) => {
    if (onStartChat) {
      onStartChat(user);
    }
  };

  const handleUserSelect = (user: User) => {
    if (onUserSelect) {
      onUserSelect(user);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar usuários..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading && (
        <div className="text-center py-4 text-muted-foreground">
          Buscando...
        </div>
      )}

      {users.length > 0 && (
        <div className="space-y-2">
          {users.map((user) => (
            <Card key={user.id} className="hover:bg-muted/50 transition-colors">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div 
                    className="flex items-center gap-3 flex-1 cursor-pointer"
                    onClick={() => handleUserSelect(user)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback>
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.username}</p>
                      {user.is_friend && (
                        <p className="text-xs text-green-500">✓ Amigo</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStartChat(user)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    
                    {!user.is_friend && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddFriend(user.id)}
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {searchTerm.length >= 2 && !isLoading && users.length === 0 && (
        <div className="text-center py-4 text-muted-foreground">
          Nenhum usuário encontrado
        </div>
      )}
    </div>
  );
};