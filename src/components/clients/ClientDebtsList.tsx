import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useClientDebts } from "@/hooks/useClientDebts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function ClientDebtsList() {
  const { data: clientDebts = [], isLoading: debtsLoading } = useClientDebts();

  const { data: clients = [] } = useQuery({
    queryKey: ["clients-for-debts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("id, name, email, phone");
      if (error) throw error;
      return data || [];
    },
  });

  const clientsWithDebts = clientDebts
    .map((debt) => {
      const client = clients.find((c) => c.id === debt.client_id);
      return { ...debt, name: client?.name || "Desconhecido", email: client?.email, phone: client?.phone };
    })
    .sort((a, b) => b.total_debt - a.total_debt);

  if (debtsLoading) {
    return (
      <Card className="rounded-lg border-border">
        <CardContent className="p-3">
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (clientsWithDebts.length === 0) {
    return (
      <Card className="rounded-lg border-border bg-card">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 text-center">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Nenhum cliente em débito 🎉</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalDebt = clientsWithDebts.reduce((sum, c) => sum + c.total_debt, 0);

  return (
    <Card className="rounded-lg border-border bg-card">
      <CardHeader className="p-3 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-1.5 text-sm">
            <AlertCircle className="h-3.5 w-3.5 text-destructive" />
            Débitos
          </CardTitle>
          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
            R$ {totalDebt.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-1.5">
        {clientsWithDebts.map((client) => (
          <div
            key={client.client_id}
            className="flex items-center justify-between p-2 rounded-lg bg-background border border-border"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium truncate">{client.name}</span>
                <Badge variant="outline" className="text-[10px] px-1 py-0">
                  {client.overdue_count}
                </Badge>
              </div>
            </div>
            <span className="text-xs font-bold text-destructive ml-2">
              R$ {client.total_debt.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
