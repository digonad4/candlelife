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
        chartData: [["Data", "Baixo", "Abertura", "Fechamento", "Alto"]],
        chartOptions: {}
      };
    }

    // Limit to last 100 transactions for performance
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
        
        const dateFormatted = format(parseISO(t.date), "dd/MM HH:mm", { locale: ptBR });
        return [dateFormatted, low, open, close, high];
      });
    } else {
      const processedTransactions: Array<{ date: string; amount: number }> = [];
      accumulatedValue = 0;

      limitedTransactions.forEach((t) => {
        let dateFormatted;
        switch (timeRange) {
          case "daily":
            dateFormatted = format(startOfDay(parseISO(t.date)), "dd/MM", { locale: ptBR });
            break;
          case "weekly":
            dateFormatted = format(startOfWeek(parseISO(t.date), { locale: ptBR }), "dd/MM", { locale: ptBR });
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
        
        return [t.date, low, open, close, high];
      });
    }

    let chartData = [
      ["Data", "Baixo", "Abertura", "Fechamento", "Alto"],
      ...candleData
    ];

    const investmentGoals = goals.filter(goal => 
      ['savings_rate', 'emergency_fund', 'investment_goal', 'purchase_goal'].includes(goal.goal_type)
    );
    
    const spendingGoals = goals.filter(goal => 
      ['spending_limit', 'category_budget'].includes(goal.goal_type)
    );

    // Add goal columns
    investmentGoals.forEach((goal) => {
      chartData[0].push(`🔵 ${goal.description || 'Meta Investimento'}`);
    });
    
    spendingGoals.forEach((goal) => {
      chartData[0].push(`🟠 ${goal.description || 'Limite Gasto'}`);
    });

    // Add goal values
    for (let i = 1; i < chartData.length; i++) {
      const currentAccumulated = chartData[i][4];
      
      investmentGoals.forEach((goal) => {
        const resistanceLevel = currentAccumulated + Math.abs(goal.target_amount);
        chartData[i].push(resistanceLevel);
      });
      
      spendingGoals.forEach((goal) => {
        const supportLevel = currentAccumulated - Math.abs(goal.target_amount);
        chartData[i].push(supportLevel);
      });
    }

    const seriesConfig: any = {};
    let seriesIndex = 0;

    investmentGoals.forEach(() => {
      seriesConfig[seriesIndex] = {
        type: 'line',
        color: '#2563eb',
        lineWidth: 2,
        lineDashStyle: [10, 5],
        pointSize: 0,
        visibleInLegend: true,
      };
      seriesIndex++;
    });

    spendingGoals.forEach(() => {
      seriesConfig[seriesIndex] = {
        type: 'line',
        color: '#ea580c',
        lineWidth: 2,
        lineDashStyle: [10, 5],
        pointSize: 0,
        visibleInLegend: true,
      };
      seriesIndex++;
    });

    const options = {
      legend: { position: 'top', alignment: 'start' },
      backgroundColor: "transparent",
      chartArea: { width: "90%", height: "75%", top: 60 },
      vAxis: {
        title: "Saldo Acumulado (R$)",
        format: "currency",
        gridlines: { color: "#e5e7eb" }
      },
      hAxis: {
        title: timeRange === "individual" ? "Transações" : "Período",
        slantedText: timeRange === "individual",
        slantedTextAngle: 30
      },
      candlestick: {
        fallingColor: { strokeWidth: 0, fill: "#dc2626", stroke: "transparent" },
        risingColor: { strokeWidth: 0, fill: "#16a34a", stroke: "transparent" },
        hollowIsRising: false
      },
      series: seriesConfig,
      crosshair: { trigger: 'both', orientation: 'both' }
    };

    return { chartData, chartOptions: options };
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
          <p className="text-sm mt-2">Adicione transações para visualizar análises</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <Chart
        width="100%"
        height="100%"
        chartType={chartType}
        loader={<div className="text-center py-4">Carregando...</div>}
        data={chartData}
        options={chartOptions}
      />
    </div>
  );
}