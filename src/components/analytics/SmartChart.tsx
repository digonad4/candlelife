import { useMemo } from "react";
import { Chart } from "react-google-charts";
import { GoogleChartWrapperChartType } from "react-google-charts";
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
  chartType: GoogleChartWrapperChartType;
  timeRange: string;
  isLoading: boolean;
}

export function SmartChart({ transactions, goals, chartType, timeRange, isLoading }: SmartChartProps) {
  const { chartData, chartOptions } = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return {
        chartData: [["Data", "Valor"]],
        chartOptions: {}
      };
    }

    let accumulatedValue = 0;
    const processedTransactions: Array<{ date: string; amount: number; accumulated: number }> = [];

    // Process transactions based on time range
    transactions.forEach((t) => {
      let dateFormatted;
      switch (timeRange) {
        case "daily":
          dateFormatted = format(startOfDay(parseISO(t.date)), "dd/MM", { locale: ptBR });
          break;
        case "weekly":
          dateFormatted = format(startOfWeek(parseISO(t.date), { locale: ptBR }), "dd/MM/yyyy", { locale: ptBR });
          break;
        case "monthly":
          dateFormatted = format(startOfMonth(parseISO(t.date)), "MM/yyyy", { locale: ptBR });
          break;
        case "yearly":
          dateFormatted = format(startOfYear(parseISO(t.date)), "yyyy", { locale: ptBR });
          break;
        default:
          dateFormatted = format(parseISO(t.date), "dd/MM", { locale: ptBR });
      }

      const existingTransaction = processedTransactions.find(item => item.date === dateFormatted);
      
      if (existingTransaction) {
        existingTransaction.amount += t.amount;
        existingTransaction.accumulated += t.amount;
      } else {
        accumulatedValue += t.amount;
        processedTransactions.push({ 
          date: dateFormatted, 
          amount: t.amount,
          accumulated: accumulatedValue 
        });
      }
    });

    // Create chart data based on type
    let finalChartData;
    if (chartType === "CandlestickChart") {
      finalChartData = [
        ["Data", "Menor", "Abertura", "Fechamento", "Maior"],
        ...processedTransactions.map((t, index) => {
          const previousValue = index > 0 ? processedTransactions[index - 1].accumulated : 0;
          const open = previousValue;
          const close = t.accumulated;
          const low = Math.min(open, close);
          const high = Math.max(open, close);
          return [t.date, low, open, close, high];
        }),
      ];
    } else {
      finalChartData = [
        ["Data", "Valor Acumulado"],
        ...processedTransactions.map((t) => [t.date, t.accumulated])
      ];
    }

    // Calculate goal lines
    const goalLines = goals
      .filter(goal => goal.goal_type === 'spending_limit' || goal.goal_type === 'savings_rate')
      .map(goal => {
        const isSpendingLimit = goal.goal_type === 'spending_limit';
        return {
          targetValue: isSpendingLimit ? -Math.abs(goal.amount) : goal.amount,
          color: isSpendingLimit ? "#ef4444" : "#22c55e",
          dashStyle: [5, 5],
          label: `Meta: ${goal.description || goal.goal_type}`,
        };
      });

    const options = {
      legend: "none",
      backgroundColor: "transparent",
      chartArea: { width: "85%", height: "75%" },
      vAxis: {
        title: "Valor (R$)",
        format: "decimal",
        gridlines: { color: "#f0f0f0" },
      },
      hAxis: {
        title: "Período",
        gridlines: { color: "#f0f0f0" },
      },
      candlestick: {
        fallingColor: { strokeWidth: 2, fill: "#ef4444" },
        risingColor: { strokeWidth: 2, fill: "#22c55e" },
      },
      series: {},
      // Add goal reference lines
      annotations: {
        style: 'line',
        stemColor: 'transparent'
      }
    };

    // Add goal lines to options if any exist
    if (goalLines.length > 0 && chartType !== "CandlestickChart") {
      goalLines.forEach((line, index) => {
        options.series[index + 1] = {
          type: 'line',
          color: line.color,
          lineWidth: 2,
          lineDashStyle: line.dashStyle,
          pointSize: 0,
          visibleInLegend: false,
        };
      });

      // Add goal lines to data
      finalChartData[0].push(...goalLines.map(line => line.label));
      for (let i = 1; i < finalChartData.length; i++) {
        finalChartData[i].push(...goalLines.map(line => line.targetValue));
      }
    }

    return {
      chartData: finalChartData,
      chartOptions: options
    };
  }, [transactions, goals, chartType, timeRange]);

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
          <p className="text-sm mt-2">Adicione transações para visualizar análises inteligentes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <Chart
        width="100%"
        height="100%"
        chartType={chartType}
        loader={<div className="text-center py-4">Carregando Gráfico Inteligente...</div>}
        data={chartData}
        options={chartOptions}
      />
      
      {/* Goal indicators */}
      {goals.length > 0 && (
        <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm rounded-lg p-2 text-xs">
          <div className="font-medium text-muted-foreground mb-1">Metas Ativas:</div>
          {goals.slice(0, 3).map((goal, index) => (
            <div key={goal.id} className="flex items-center gap-1 mb-1">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: goal.goal_type === 'spending_limit' ? '#ef4444' : '#22c55e' }}
              />
              <span className="truncate max-w-[120px]">
                {goal.description || goal.goal_type}
              </span>
            </div>
          ))}
          {goals.length > 3 && (
            <div className="text-muted-foreground">+{goals.length - 3} mais</div>
          )}
        </div>
      )}
    </div>
  );
}