
import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react";
import { SmartChart } from "@/components/analytics/SmartChart";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TimeRange } from "@/hooks/useOHLCData";

const timeRangeOptions: { label: string; value: TimeRange }[] = [
  { label: "Transação", value: "individual" },
  { label: "Diário", value: "daily" },
  { label: "Semanal", value: "weekly" },
  { label: "Mensal", value: "monthly" },
];

export default function Analytics() {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [timeRange, setTimeRange] = useState<TimeRange>("individual");
  const startDate = startOfMonth(selectedMonth);
  const endDate = endOfMonth(selectedMonth);

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
    const income = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const expenses = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + Math.abs(t.amount), 0);
    return { totalIncome: income, totalExpenses: expenses, balance: income - expenses, transactionCount: transactions.length };
  }, [transactions]);

  const stats = [
    { title: "Receitas", value: `R$ ${totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: "text-green-500" },
    { title: "Despesas", value: `R$ ${totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: TrendingDown, color: "text-red-500" },
    { title: "Saldo", value: `R$ ${balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: balance >= 0 ? "text-green-500" : "text-red-500" },
    { title: "Total", value: transactionCount.toString(), icon: BarChart3, color: "text-primary" }
  ];

  return (
    <div className="w-full flex flex-col gap-1.5 max-w-7xl mx-auto h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-foreground">Análise</h1>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))} className="text-xs h-7 px-2">←</Button>
          <span className="text-xs font-medium">{format(selectedMonth, "MMM/yy", { locale: ptBR })}</span>
          <Button variant="ghost" size="sm" onClick={() => setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))} className="text-xs h-7 px-2">→</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-1">
        {stats.map((stat) => (
          <Card key={stat.title} className="rounded-lg border-border bg-card">
            <CardContent className="p-1.5">
              <div className="flex items-center gap-1">
                <stat.icon className={cn("h-3 w-3", stat.color)} />
                <span className="text-[10px] text-muted-foreground truncate">{stat.title}</span>
              </div>
              <p className={cn("text-[11px] font-bold truncate", stat.color)}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-1">
        {timeRangeOptions.map((opt) => (
          <Button
            key={opt.value}
            variant={timeRange === opt.value ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange(opt.value)}
            className="text-[10px] h-6 px-2 flex-1"
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {/* Chart - fills remaining space */}
      <Card className="rounded-lg border-border bg-card flex-1 min-h-0">
        <CardContent className="p-1.5 h-full">
          <SmartChart startDate={startDate} endDate={endDate} timeRange={timeRange} />
        </CardContent>
      </Card>
    </div>
  );
}
