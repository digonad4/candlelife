
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, Edit, Trash2, Search, CreditCard } from "lucide-react";
import { ClientTransactionsDialog } from "./ClientTransactionsDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Client = {
  id: string;
  name: string;
  document: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
  user_id: string;
};

interface ClientsListProps {
  onEditClient: (client: Client) => void;
}

export function ClientsList({ onEditClient }: ClientsListProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isTransactionsDialogOpen, setIsTransactionsDialogOpen] = useState(false);

  const { data: clients, isLoading } = useQuery({
    queryKey: ["clients", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("clients")
        .select()
        .eq("user_id", user.id)
        .order("name");
      
      if (error) throw error;
      return data as Client[];
    },
    enabled: !!user
  });

  const filteredClients = clients?.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.document && client.document.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.phone && client.phone.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDeleteClient = async () => {
    if (!clientToDelete || !user) return;

    try {
      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", clientToDelete.id)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Cliente excluído",
        description: "Cliente excluído com sucesso",
      });
      
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    } catch (error: any) {
      console.error("Error deleting client:", error);
      toast({
        title: "Erro",
        description: `Falha ao excluir cliente: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setClientToDelete(null);
    }
  };

  const handleViewTransactions = (clientId: string) => {
    setSelectedClientId(clientId);
    setIsTransactionsDialogOpen(true);
  };

  if (isLoading) {
    return <div className="py-10 text-center text-muted-foreground">Carregando clientes...</div>;
  }

  if (filteredClients?.length === 0 && !searchTerm) {
    return <div className="py-10 text-center text-muted-foreground">Nenhum cliente cadastrado.</div>;
  }

  if (filteredClients?.length === 0 && searchTerm) {
    return (
      <>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar clientes..."
              className="pl-10"
            />
          </div>
        </div>
        <div className="py-10 text-center text-muted-foreground">
          Nenhum cliente encontrado para "{searchTerm}".
        </div>
      </>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar clientes..."
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredClients?.map((client) => (
          <div
            key={client.id}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl border border-border bg-card hover:bg-accent/20 transition-colors"
          >
            <div className="mb-3 sm:mb-0">
              <h3 className="font-semibold text-card-foreground">{client.name}</h3>
              <div className="text-sm text-muted-foreground">
                {client.document && <p>Documento: {client.document}</p>}
                {client.email && <p>Email: {client.email}</p>}
                {client.phone && <p>Telefone: {client.phone}</p>}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewTransactions(client.id)}
              >
                <CreditCard className="h-4 w-4 mr-1" />
                Faturas
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEditClient(client)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setClientToDelete(client)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <AlertDialog open={!!clientToDelete} onOpenChange={(open) => !open && setClientToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cliente "{clientToDelete?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteClient} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ClientTransactionsDialog
        clientId={selectedClientId}
        open={isTransactionsDialogOpen}
        onOpenChange={setIsTransactionsDialogOpen}
      />
    </div>
  );
}
