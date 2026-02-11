
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ClientsList } from "@/components/clients/ClientsList";
import { ClientForm } from "@/components/clients/ClientForm";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function Clients() {
  const [isClientFormOpen, setIsClientFormOpen] = useState(false);
  
  interface Client {
    id: string;
    name: string;
    email: string | null;
    document: string | null;
    phone: string | null;
  }

  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);

  const handleOpenClientForm = (client?: Client) => {
    setClientToEdit(client || null);
    setIsClientFormOpen(true);
  };

  const handleCloseClientForm = () => {
    setIsClientFormOpen(false);
    setClientToEdit(null);
  };

  return (
    <div className="w-full space-y-3 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">Clientes</h1>
        <Button size="sm" className="h-8 text-xs" onClick={() => handleOpenClientForm()}>
          <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
          Novo
        </Button>
      </div>

      <Card className="rounded-lg border-border bg-card">
        <CardContent className="p-3">
          <ClientsList onEditClient={handleOpenClientForm} />
        </CardContent>
      </Card>

      <ClientForm 
        open={isClientFormOpen} 
        onOpenChange={handleCloseClientForm} 
        clientToEdit={clientToEdit} 
      />
    </div>
  );
}
