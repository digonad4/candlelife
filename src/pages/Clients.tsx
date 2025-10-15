
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    // Add other fields as necessary
  }

  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);

  const handleOpenClientForm = (client?: Client) => {
    if (client) {
      setClientToEdit(client);
    } else {
      setClientToEdit(null);
    }
    setIsClientFormOpen(true);
  };

  const handleCloseClientForm = () => {
    setIsClientFormOpen(false);
    setClientToEdit(null);
  };

  return (
    <div className="w-full space-y-6 safe-area-top safe-area-bottom max-w-7xl mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">
          Gerenciamento de Clientes
        </h1>
        <Button onClick={() => handleOpenClientForm()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <Card className="rounded-xl border-border bg-card">
        <CardHeader className="p-6">
          <CardTitle>Seus Clientes</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
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
