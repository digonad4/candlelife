import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Users, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { UserSearch } from "./UserSearch";

interface User {
  id: string;
  username: string;
  avatar_url?: string;
}

interface GroupCreateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onGroupCreated?: (groupId: string) => void;
}

export const GroupCreateDialog = ({
  isOpen,
  onOpenChange,
  onGroupCreated
}: GroupCreateDialogProps) => {
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleUserSelect = (selectedUser: User) => {
    if (!selectedUsers.find(u => u.id === selectedUser.id)) {
      setSelectedUsers([...selectedUsers, selectedUser]);
    }
    setShowUserSearch(false);
  };

  const removeUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
  };

  const createGroup = async () => {
    if (!groupName.trim()) {
      toast({
        title: "Erro",
        description: "Nome do grupo é obrigatório",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Erro", 
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      // Create the group
      const { data: group, error: groupError } = await supabase
        .from('chat_groups')
        .insert({
          name: groupName,
          description: description || null,
          created_by: user.id,
          is_private: false
        })
        .select()
        .single();

      if (groupError) {
        console.error('Error creating group:', groupError);
        toast({
          title: "Erro",
          description: "Não foi possível criar o grupo",
          variant: "destructive"
        });
        return;
      }

      // Add creator as admin
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          user_id: user.id,
          role: 'admin'
        });

      if (memberError) {
        console.error('Error adding creator to group:', memberError);
      }

      // Add selected users as members
      if (selectedUsers.length > 0) {
        const memberInserts = selectedUsers.map(selectedUser => ({
          group_id: group.id,
          user_id: selectedUser.id,
          role: 'member',
          invited_by: user.id
        }));

        const { error: membersError } = await supabase
          .from('group_members')
          .insert(memberInserts);

        if (membersError) {
          console.error('Error adding members to group:', membersError);
          toast({
            title: "Aviso",
            description: "Grupo criado, mas alguns membros não foram adicionados",
            variant: "destructive"
          });
        }
      }

      toast({
        title: "Sucesso",
        description: "Grupo criado com sucesso!"
      });

      // Reset form
      setGroupName("");
      setDescription("");
      setSelectedUsers([]);
      onOpenChange(false);

      if (onGroupCreated) {
        onGroupCreated(group.id);
      }

    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao criar grupo",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Criar Grupo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="groupName">Nome do Grupo</Label>
            <Input
              id="groupName"
              placeholder="Digite o nome do grupo"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Descreva o propósito do grupo"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Membros</Label>
            
            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2 p-2 border rounded-lg">
                {selectedUsers.map((selectedUser) => (
                  <div
                    key={selectedUser.id}
                    className="flex items-center gap-2 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={selectedUser.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {selectedUser.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>{selectedUser.username}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => removeUser(selectedUser.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <Button
              variant="outline"
              onClick={() => setShowUserSearch(!showUserSearch)}
              className="w-full"
            >
              {showUserSearch ? "Fechar busca" : "Adicionar membros"}
            </Button>

            {showUserSearch && (
              <div className="border rounded-lg p-3">
                <UserSearch onUserSelect={handleUserSelect} onStartChat={handleUserSelect} />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button
              onClick={createGroup}
              disabled={isCreating || !groupName.trim()}
            >
              {isCreating ? "Criando..." : "Criar Grupo"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};