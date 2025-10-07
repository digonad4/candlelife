import { useMemo } from "react";
import { ProfessionalCandlestickChart } from "@/components/chart/ProfessionalCandlestickChart";
import { parseISO, format, startOfDay, startOfWeek, startOfMonth, startOfYear } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FinancialGoal } from "@/hooks/useGoals";

interface TransactionData {
  date: string;
  amount: number;
}

interface SmartChartProps {
  transactions: TransactionData[];
  goals: FinancialGoal[];
  timeRange: string;
  isLoading: boolean;
}

export function SmartChart({ transactions, goals, timeRange, isLoading }: SmartChartProps) {
  const { chartData, chartGoals } = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return {
        chartData: [],
        chartGoals: []
      };
    }

    const limitedTransactions = [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 100)
      .reverse();

    let candleData;
    let accumulatedValue = 0;

    if (timeRange === "individual") {
      candleData = limitedTransactions.map((t) => {
        const previousValue = accumulatedValue;
        accumulatedValue += t.amount;
        
        const open = previousValue;
        const close = accumulatedValue;
        const low = Math.min(open, close);
        const high = Math.max(open, close);
        
        return {
          date: t.date,
          open,
          high,
          low,
          close
        };
      });
    } else {
      const processedTransactions: Array<{ date: string; amount: number }> = [];
      accumulatedValue = 0;

      limitedTransactions.forEach((t) => {
        let dateFormatted;
        switch (timeRange) {
          case "daily":
            dateFormatted = format(startOfDay(parseISO(t.date)), "yyyy-MM-dd", { locale: ptBR });
            break;
          case "weekly":
            dateFormatted = format(startOfWeek(parseISO(t.date), { locale: ptBR }), "yyyy-MM-dd", { locale: ptBR });
            break;
          case "monthly":
            dateFormatted = format(startOfMonth(parseISO(t.date)), "yyyy-MM-dd", { locale: ptBR });
            break;
          case "yearly":
            dateFormatted = format(startOfYear(parseISO(t.date)), "yyyy-MM-dd", { locale: ptBR });
            break;
          default:
            dateFormatted = format(parseISO(t.date), "yyyy-MM-dd", { locale: ptBR });
        }

        const existingTransaction = processedTransactions.find(item => item.date === dateFormatted);
        
        if (existingTransaction) {
          existingTransaction.amount += t.amount;
        } else {
          processedTransactions.push({ 
            date: dateFormatted, 
            amount: t.amount,
          });
        }
      });

      candleData = processedTransactions.map((t) => {
        const previousValue = accumulatedValue;
        accumulatedValue += t.amount;
        
        const open = previousValue;
        const close = accumulatedValue;
        const low = Math.min(open, close);
        const high = Math.max(open, close);
        
        return {
          date: t.date,
          open,
          high,
          low,
          close
        };
      });
    }

    const chartGoals = goals
      .filter(goal => goal.display_on_chart)
      .map(goal => ({
        value: goal.target_amount,
        type: (goal.chart_line_type === 'resistance' ? 'resistance' : 'support') as 'support' | 'resistance',
        label: goal.description || `Meta: R$ ${goal.target_amount.toFixed(2)}`,
      }));

    return { chartData: candleData, chartGoals };
  }, [transactions, goals, timeRange]);

  if (isLoading) {
    return (
      <div className="w-full h-full bg-muted/20 animate-pulse rounded-lg flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Carregando análise inteligente...</div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground">
          <p>📊 Nenhuma transação encontrada</p>
          <p className="text-sm mt-2">Adicione transações para visualizar análises</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <ProfessionalCandlestickChart 
        data={chartData}
        goals={chartGoals}
      />
    </div>
  );
}
