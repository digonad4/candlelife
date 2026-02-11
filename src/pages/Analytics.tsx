import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { SmartChart } from "@/components/analytics/SmartChart";
import { useOHLCData } from "@/hooks/useOHLCData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Analytics() {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const startDate = startOfMonth(selectedMonth);
  const endDate = endOfMonth(selectedMonth);
  
  const { data: ohlcData, isLoading: ohlcLoading } = useOHLCData(startDate, endDate, "daily");
  
  const { data: transactions } = useQuery({
    queryKey: ["analytics-transactions", user?.id, startDate.toISOString(), endDate.toISOString()],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .eq("payment_status", "confirmed")
        .gte("date", startDate.toISOString())
        .lte("date", endDate.toISOString());
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const { totalIncome, totalExpenses, balance, transactionCount } = useMemo(() => {
    if (!transactions) return { totalIncome: 0, totalExpenses: 0, balance: 0, transactionCount: 0 };
    
    const income = transactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const expenses = transactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    return {
      totalIncome: income,
      totalExpenses: expenses,
      balance: income - expenses,
      transactionCount: transactions.length
    };
  }, [transactions]);

  const handlePreviousMonth = () => {
    setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const stats = [
    { title: "Receitas", value: `R$ ${totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: "text-green-500" },
    { title: "Despesas", value: `R$ ${totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: TrendingDown, color: "text-red-500" },
    { title: "Saldo", value: `R$ ${balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: balance >= 0 ? "text-green-500" : "text-red-500" },
    { title: "Transações", value: transactionCount.toString(), icon: BarChart3, color: "text-primary" }
  ];

  return (
    <div className="w-full space-y-2 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-foreground">Análise</h1>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={handlePreviousMonth} className="text-xs h-7 px-2">←</Button>
          <span className="text-xs font-medium">
            {format(selectedMonth, "MMM/yy", { locale: ptBR })}
          </span>
          <Button variant="ghost" size="sm" onClick={handleNextMonth} className="text-xs h-7 px-2">→</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {stats.map((stat) => (
          <Card key={stat.title} className="rounded-lg border-border bg-card">
            <CardContent className="p-2">
              <div className="flex items-center gap-1">
                <stat.icon className={cn("h-3 w-3", stat.color)} />
                <span className="text-[10px] text-muted-foreground truncate">{stat.title}</span>
              </div>
              <p className={cn("text-xs font-bold mt-0.5 truncate", stat.color)}>
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-lg border-border bg-card">
        <CardContent className="p-0">
          <div className="h-[280px] sm:h-[350px] m-1.5 rounded-lg overflow-hidden">
            {ohlcLoading ? (
              <div className="w-full h-full bg-muted/20 animate-pulse flex items-center justify-center">
                <span className="text-xs text-muted-foreground">Carregando...</span>
              </div>
            ) : (
              <SmartChart startDate={startDate} endDate={endDate} />
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-lg border-border bg-card">
        <CardContent className="p-3">
          <h3 className="text-xs font-semibold mb-2">Resumo</h3>
          <div className="grid gap-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Período</span>
              <span className="font-medium">{format(startDate, "dd/MM")} - {format(endDate, "dd/MM")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Transações</span>
              <span className="font-medium">{transactionCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Média/dia receita</span>
              <span className="font-medium text-green-500">R$ {(totalIncome / 30).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Média/dia despesa</span>
              <span className="font-medium text-red-500">R$ {(totalExpenses / 30).toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
