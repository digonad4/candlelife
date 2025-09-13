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

    let candleData;
    let accumulatedValue = 0;

    if (timeRange === "individual") {
      // Individual transactions as candlesticks - like a trading platform
      const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      candleData = sortedTransactions.map((t, index) => {
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
      // Grouped transactions by time range
      const processedTransactions: Array<{ date: string; amount: number; accumulated: number }> = [];
      accumulatedValue = 0;

      transactions.forEach((t) => {
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
            accumulated: 0
          });
        }
      });

      // Calculate accumulated values and create candles
      candleData = processedTransactions.map((t, index) => {
        const previousValue = accumulatedValue;
        accumulatedValue += t.amount;
        
        const open = previousValue;
        const close = accumulatedValue;
        const low = Math.min(open, close);
        const high = Math.max(open, close);
        
        return [t.date, low, open, close, high];
      });
    }

    // Base chart data structure
    let chartData = [
      ["Data", "Baixo", "Abertura", "Fechamento", "Alto"],
      ...candleData
    ];

    // Add goal lines as additional series
    const resistanceGoals = goals.filter(goal => 
      ['savings_rate', 'emergency_fund', 'investment_goal', 'purchase_goal'].includes(goal.goal_type)
    );
    
    const supportGoals = goals.filter(goal => 
      ['spending_limit', 'category_budget'].includes(goal.goal_type)
    );

    // Add columns for each goal line
    resistanceGoals.forEach((goal) => {
      chartData[0].push(`🔴 ${goal.description || 'Resistência'}`);
    });
    
    supportGoals.forEach((goal) => {
      chartData[0].push(`🟢 ${goal.description || 'Suporte'}`);
    });

    // Add goal values to each data row
    for (let i = 1; i < chartData.length; i++) {
      // Add resistance values (positive targets above current value)
      resistanceGoals.forEach((goal) => {
        chartData[i].push(Math.abs(goal.amount));
      });
      
      // Add support values (negative limits as floor protection)  
      supportGoals.forEach((goal) => {
        chartData[i].push(-Math.abs(goal.amount));
      });
    }

    const seriesConfig: any = {};
    let seriesIndex = 0;

    // Configure resistance lines (red dashed lines above)
    resistanceGoals.forEach((goal, index) => {
      seriesConfig[seriesIndex] = {
        type: 'line',
        color: '#dc2626',
        lineWidth: 3,
        lineDashStyle: [8, 4],
        pointSize: 0,
        visibleInLegend: true,
        labelInLegend: `🔴 Resistência: ${goal.description || goal.goal_type}`
      };
      seriesIndex++;
    });

    // Configure support lines (green dashed lines below)
    supportGoals.forEach((goal, index) => {
      seriesConfig[seriesIndex] = {
        type: 'line',
        color: '#16a34a',
        lineWidth: 3,
        lineDashStyle: [8, 4],
        pointSize: 0,
        visibleInLegend: true,
        labelInLegend: `🟢 Suporte: ${goal.description || goal.goal_type}`
      };
      seriesIndex++;
    });

    const options = {
      legend: { 
        position: 'top', 
        alignment: 'start',
        textStyle: { fontSize: 12 }
      },
      backgroundColor: "transparent",
      chartArea: { width: "90%", height: "75%", top: 60 },
      vAxis: {
        title: "Saldo Acumulado (R$)",
        titleTextStyle: { fontSize: 12 },
        textStyle: { fontSize: 11 },
        format: "currency",
        gridlines: { 
          color: "#e5e7eb",
          count: 8
        },
        minorGridlines: {
          color: "#f3f4f6",
          count: 1
        }
      },
      hAxis: {
        title: timeRange === "individual" ? "Transações Sequenciais" : "Período",
        titleTextStyle: { fontSize: 12 },
        textStyle: { fontSize: 10 },
        slantedText: timeRange === "individual",
        slantedTextAngle: timeRange === "individual" ? 30 : 0,
        gridlines: { color: "#e5e7eb" }
      },
      candlestick: {
        fallingColor: { 
          strokeWidth: 2, 
          fill: "#dc2626", 
          stroke: "#b91c1c"
        },
        risingColor: { 
          strokeWidth: 2, 
          fill: "#16a34a", 
          stroke: "#15803d"
        },
        hollowIsRising: false
      },
      series: seriesConfig,
      crosshair: { 
        trigger: 'both',
        orientation: 'both'
      }
    };

    return {
      chartData,
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