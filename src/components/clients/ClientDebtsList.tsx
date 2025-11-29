import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useClientDebts } from "@/hooks/useClientDebts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function ClientDebtsList() {
  const { data: clientDebts = [], isLoading: debtsLoading } = useClientDebts();

  const { data: clients = [] } = useQuery({
    queryKey: ["clients-for-debts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("id, name, email, phone");
      
      if (error) throw error;
      return data || [];
    },
  });

  const clientsWithDebts = clientDebts
    .map((debt) => {
      const client = clients.find((c) => c.id === debt.client_id);
      return {
        ...debt,
        name: client?.name || "Cliente Desconhecido",
        email: client?.email,
        phone: client?.phone,
      };
    })
    .sort((a, b) => b.total_debt - a.total_debt);

  if (debtsLoading) {
    return (
      <Card className="rounded-xl border-border">
        <CardHeader className="p-6">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Clientes em Débito
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (clientsWithDebts.length === 0) {
    return (
      <Card className="rounded-xl border-border bg-card">
        <CardHeader className="p-6">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Clientes em Débito
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <p className="text-lg font-medium text-foreground">
              🎉 Nenhum cliente em débito!
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Todos os seus clientes estão com os pagamentos em dia.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalDebt = clientsWithDebts.reduce((sum, c) => sum + c.total_debt, 0);
  const totalTransactions = clientsWithDebts.reduce((sum, c) => sum + c.overdue_count, 0);

  return (
    <Card className="rounded-xl border-border bg-card">
      <CardHeader className="p-6">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Clientes em Débito
          </CardTitle>
          <Badge variant="destructive" className="text-sm">
            {clientsWithDebts.length} {clientsWithDebts.length === 1 ? "cliente" : "clientes"}
          </Badge>
        </div>
        <div className="flex items-center gap-4 mt-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span className="font-semibold text-destructive">
              R$ {totalDebt.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
            <span>em débito</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span className="font-semibold">{totalTransactions}</span>
            <span>{totalTransactions === 1 ? "transação" : "transações"}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-3">
        {clientsWithDebts.map((client) => (
          <div
            key={client.client_id}
            className="flex items-center justify-between p-4 rounded-lg bg-background border border-border hover:border-destructive/30 transition-all"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-foreground">{client.name}</h4>
                <Badge variant="outline" className="text-xs">
                  {client.overdue_count} {client.overdue_count === 1 ? "pendência" : "pendências"}
                </Badge>
              </div>
              {(client.email || client.phone) && (
                <p className="text-sm text-muted-foreground mt-1">
                  {client.email || client.phone}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-destructive">
                R$ {client.total_debt.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-muted-foreground">em débito</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
