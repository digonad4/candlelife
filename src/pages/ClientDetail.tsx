import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Phone, FileText, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  document: string | null;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  payment_status: "pending" | "confirmed" | "failed";
  payment_method: string;
}

export default function ClientDetail() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Buscar dados do cliente
  const { data: client, isLoading: loadingClient } = useQuery<Client>({
    queryKey: ["client", clientId],
    queryFn: async () => {
      if (!clientId || !user) throw new Error("Cliente não encontrado");
      
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!clientId && !!user,
  });

  // Buscar transações do cliente
  const { data: transactions, isLoading: loadingTransactions } = useQuery<Transaction[]>({
    queryKey: ["client-transactions", clientId],
    queryFn: async () => {
      if (!clientId || !user) return [];
      
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("client_id", clientId)
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!clientId && !!user,
  });

  // Calcular totais
  const pending = transactions?.filter(t => t.payment_status === "pending") || [];
  const confirmed = transactions?.filter(t => t.payment_status === "confirmed") || [];
  const totalPending = pending.reduce((sum, t) => sum + t.amount, 0);
  const totalConfirmed = confirmed.reduce((sum, t) => sum + t.amount, 0);

  if (loadingClient) {
    return (
      <div className="w-full space-y-6 safe-area-top safe-area-bottom max-w-7xl mx-auto p-4 md:p-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="w-full space-y-6 safe-area-top safe-area-bottom max-w-7xl mx-auto p-4 md:p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Cliente não encontrado</p>
          <Button onClick={() => navigate("/clients")} className="mt-4">
            Voltar para Clientes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 safe-area-top safe-area-bottom max-w-7xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/clients")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold">{client.name}</h1>
      </div>

      {/* Informações do Cliente */}
      <Card className="rounded-xl border-border">
        <CardHeader className="p-6">
          <CardTitle>Informações do Cliente</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {client.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{client.email}</span>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{client.phone}</span>
              </div>
            )}
            {client.document && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{client.document}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-xl border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pendente</p>
                <p className="text-2xl font-bold text-yellow-600">
                  R$ {totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Confirmado</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {totalConfirmed.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Transações</p>
                <p className="text-2xl font-bold">{transactions?.length || 0}</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Transações */}
      <Card className="rounded-xl border-border">
        <CardHeader className="p-6">
          <CardTitle>Histórico de Transações</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {loadingTransactions ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : transactions && transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div 
                  key={transaction.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{transaction.description}</p>
                      <Badge 
                        variant={
                          transaction.payment_status === "confirmed" 
                            ? "default" 
                            : transaction.payment_status === "pending" 
                            ? "secondary" 
                            : "destructive"
                        }
                      >
                        {transaction.payment_status === "confirmed" 
                          ? "Confirmado" 
                          : transaction.payment_status === "pending" 
                          ? "Pendente" 
                          : "Falhou"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(transaction.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                      {transaction.type === "income" ? "+" : "-"}R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {transaction.payment_method.replace("_", " ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhuma transação encontrada para este cliente</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
