import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
    {
      title: "Receitas",
      value: `R$ ${totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: "text-green-500"
    },
    {
      title: "Despesas",
      value: `R$ ${totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: TrendingDown,
      color: "text-red-500"
    },
    {
      title: "Saldo",
      value: `R$ ${balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: balance >= 0 ? "text-green-500" : "text-red-500"
    },
    {
      title: "Transações",
      value: transactionCount.toString(),
      icon: BarChart3,
      color: "text-primary"
    }
  ];

  return (
    <div className="w-full space-y-4 max-w-7xl mx-auto px-3 py-3 sm:px-4 sm:py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Análise Mensal</h1>
        </div>
        <Badge variant="outline" className="text-xs">
          <Calendar className="h-3 w-3 mr-1" />
          {format(selectedMonth, "MMM yyyy", { locale: ptBR })}
        </Badge>
      </div>

      <div className="flex items-center justify-center gap-2">
        <Button variant="outline" size="sm" onClick={handlePreviousMonth} className="text-xs h-7">
          ← Anterior
        </Button>
        <span className="text-sm font-medium px-3">
          {format(selectedMonth, "MMMM 'de' yyyy", { locale: ptBR })}
        </span>
        <Button variant="outline" size="sm" onClick={handleNextMonth} className="text-xs h-7">
          Próximo →
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {stats.map((stat) => (
          <Card key={stat.title} className="rounded-lg border-border bg-card">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <stat.icon className={cn("h-4 w-4", stat.color)} />
                <span className="text-xs text-muted-foreground">{stat.title}</span>
              </div>
              <p className={cn("text-sm font-bold mt-1", stat.color)}>
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-lg border-border bg-card">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Gráfico de Desempenho
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[350px] sm:h-[400px] m-2 sm:m-3 rounded-lg overflow-hidden">
            {ohlcLoading ? (
              <div className="w-full h-full bg-muted/20 animate-pulse flex items-center justify-center">
                <span className="text-sm text-muted-foreground">Carregando...</span>
              </div>
            ) : (
              <SmartChart startDate={startDate} endDate={endDate} />
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-lg border-border bg-card">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-medium">Resumo do Período</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <div className="grid gap-3 text-sm">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Período</span>
              <span className="font-medium">
                {format(startDate, "dd/MM")} - {format(endDate, "dd/MM/yyyy")}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Total de Transações</span>
              <span className="font-medium">{transactionCount}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Média Diária de Receita</span>
              <span className="font-medium text-green-500">
                R$ {(totalIncome / 30).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Média Diária de Despesa</span>
              <span className="font-medium text-red-500">
                R$ {(totalExpenses / 30).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="h-16 md:hidden" />
    </div>
  );
}