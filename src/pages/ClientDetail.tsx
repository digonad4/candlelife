import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Phone, FileText, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Client { id: string; name: string; email: string | null; phone: string | null; document: string | null; }
interface Transaction { id: string; date: string; description: string; amount: number; type: "income" | "expense"; payment_status: "pending" | "confirmed" | "failed"; payment_method: string; }

export default function ClientDetail() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: client, isLoading: loadingClient } = useQuery<Client>({
    queryKey: ["client", clientId],
    queryFn: async () => {
      if (!clientId || !user) throw new Error("Not found");
      const { data, error } = await supabase.from("clients").select("*").eq("id", clientId).eq("user_id", user.id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!clientId && !!user,
  });

  const { data: transactions, isLoading: loadingTransactions } = useQuery<Transaction[]>({
    queryKey: ["client-transactions", clientId],
    queryFn: async () => {
      if (!clientId || !user) return [];
      const { data, error } = await supabase.from("transactions").select("*").eq("client_id", clientId).eq("user_id", user.id).order("date", { ascending: false });
      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!clientId && !!user,
  });

  const pending = transactions?.filter(t => t.payment_status === "pending") || [];
  const confirmed = transactions?.filter(t => t.payment_status === "confirmed") || [];
  const totalPending = pending.reduce((sum, t) => sum + t.amount, 0);
  const totalConfirmed = confirmed.reduce((sum, t) => sum + t.amount, 0);

  if (loadingClient) return <div className="p-3"><Skeleton className="h-8 w-48" /><Skeleton className="h-40 w-full mt-3" /></div>;
  if (!client) return <div className="p-3 text-center"><p className="text-xs text-muted-foreground">Cliente não encontrado</p><Button size="sm" onClick={() => navigate("/clients")} className="mt-2 text-xs">Voltar</Button></div>;

  return (
    <div className="w-full space-y-3 max-w-7xl mx-auto">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => navigate("/clients")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-bold">{client.name}</h1>
      </div>

      <Card className="rounded-lg border-border">
        <CardContent className="p-3">
          <div className="flex flex-wrap gap-3 text-xs">
            {client.email && <div className="flex items-center gap-1"><Mail className="h-3 w-3 text-muted-foreground" /><span>{client.email}</span></div>}
            {client.phone && <div className="flex items-center gap-1"><Phone className="h-3 w-3 text-muted-foreground" /><span>{client.phone}</span></div>}
            {client.document && <div className="flex items-center gap-1"><FileText className="h-3 w-3 text-muted-foreground" /><span>{client.document}</span></div>}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-2">
        <Card className="rounded-lg border-border">
          <CardContent className="p-2.5">
            <p className="text-[10px] text-muted-foreground">Pendente</p>
            <p className="text-xs font-bold text-yellow-600">R$ {totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
        <Card className="rounded-lg border-border">
          <CardContent className="p-2.5">
            <p className="text-[10px] text-muted-foreground">Confirmado</p>
            <p className="text-xs font-bold text-green-600">R$ {totalConfirmed.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
        <Card className="rounded-lg border-border">
          <CardContent className="p-2.5">
            <p className="text-[10px] text-muted-foreground">Transações</p>
            <p className="text-xs font-bold">{transactions?.length || 0}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-lg border-border">
        <CardContent className="p-3">
          <h3 className="text-xs font-semibold mb-2">Histórico</h3>
          {loadingTransactions ? (
            <Skeleton className="h-12 w-full" />
          ) : transactions && transactions.length > 0 ? (
            <div className="space-y-1.5">
              {transactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-medium truncate">{t.description}</p>
                      <Badge variant={t.payment_status === "confirmed" ? "default" : "secondary"} className="text-[10px] px-1 py-0">
                        {t.payment_status === "confirmed" ? "OK" : "Pend."}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{format(new Date(t.date), "dd/MM/yy", { locale: ptBR })}</p>
                  </div>
                  <p className={cn("text-xs font-bold ml-2", t.type === "income" ? "text-green-600" : "text-red-600")}>
                    {t.type === "income" ? "+" : "-"}R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4 text-xs">Nenhuma transação</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
