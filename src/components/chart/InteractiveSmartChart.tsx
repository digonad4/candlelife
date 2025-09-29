import { useMemo, useCallback, useState } from "react";
import { Chart } from "react-google-charts";
import { GoogleChartWrapperChartType } from "react-google-charts";
import { parseISO, format, startOfDay, startOfWeek, startOfMonth, startOfYear } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FinancialGoal } from "@/hooks/useGoals";
import { ChartGoal } from "@/hooks/useChartGoals";
import { ChartGoalModal } from "./ChartGoalModal";

interface TransactionData {
  date: string;
  amount: number;
}

interface InteractiveSmartChartProps {
  transactions: TransactionData[];
  goals: FinancialGoal[];
  chartGoals: ChartGoal[];
  chartType: GoogleChartWrapperChartType;
  timeRange: string;
  isLoading: boolean;
  onCreateChartGoal: (data: { goal_type: "support" | "resistance"; value: number; label?: string }) => void;
}

export function InteractiveSmartChart({ 
  transactions, 
  goals, 
  chartGoals, 
  chartType, 
  timeRange, 
  isLoading, 
  onCreateChartGoal 
}: InteractiveSmartChartProps) {
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [clickedValue, setClickedValue] = useState<number>(0);

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

    // Add financial goal lines
    const investmentGoals = goals.filter(goal => 
      ['savings_rate', 'emergency_fund', 'investment_goal', 'purchase_goal'].includes(goal.goal_type)
    );
    
    const spendingGoals = goals.filter(goal => 
      ['spending_limit', 'category_budget'].includes(goal.goal_type)
    );

    investmentGoals.forEach((goal) => {
      chartData[0].push(`🔵 ${goal.description || 'Meta Investimento'}`);
    });
    
    spendingGoals.forEach((goal) => {
      chartData[0].push(`🟠 ${goal.description || 'Limite Gasto'}`);
    });

    // Add chart goal lines (visual goals)
    const supportGoals = chartGoals.filter(g => g.goal_type === "support" && g.is_active);
    const resistanceGoals = chartGoals.filter(g => g.goal_type === "resistance" && g.is_active);

    supportGoals.forEach((goal) => {
      chartData[0].push(`📉 ${goal.label || 'Suporte'}`);
    });

    resistanceGoals.forEach((goal) => {
      chartData[0].push(`📈 ${goal.label || 'Resistência'}`);
    });

    // Add goal values to each data point
    for (let i = 1; i < chartData.length; i++) {
      const currentAccumulated = chartData[i][4];
      
      // Financial goals
      investmentGoals.forEach((goal) => {
        const resistanceLevel = currentAccumulated + Math.abs(goal.amount);
        chartData[i].push(resistanceLevel);
      });
      
      spendingGoals.forEach((goal) => {
        const supportLevel = currentAccumulated - Math.abs(goal.amount);
        chartData[i].push(supportLevel);
      });

      // Chart goals (fixed values)
      supportGoals.forEach((goal) => {
        chartData[i].push(goal.value);
      });

      resistanceGoals.forEach((goal) => {
        chartData[i].push(goal.value);
      });
    }

    const seriesConfig: any = {};
    let seriesIndex = 0;

    // Financial goals styling
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

    // Chart goals styling
    supportGoals.forEach(() => {
      seriesConfig[seriesIndex] = {
        type: 'line',
        color: '#dc2626',
        lineWidth: 3,
        lineDashStyle: [5, 5],
        pointSize: 0,
        visibleInLegend: true,
      };
      seriesIndex++;
    });

    resistanceGoals.forEach(() => {
      seriesConfig[seriesIndex] = {
        type: 'line',
        color: '#059669',
        lineWidth: 3,
        lineDashStyle: [5, 5],
        pointSize: 0,
        visibleInLegend: true,
      };
      seriesIndex++;
    });

    // Calculate chart center based on last value
    const lastValue = candleData.length > 0 ? candleData[candleData.length - 1][4] : 0;
    const chartMargin = Math.abs(lastValue) * 0.5; // 50% margin above and below
    const minValue = lastValue - chartMargin;
    const maxValue = lastValue + chartMargin;

    const options = {
      legend: { position: 'top', alignment: 'start' },
      backgroundColor: "transparent",
      chartArea: { width: "95%", height: "85%", top: 60, left: 80, right: 20 },
      vAxis: {
        title: "Saldo Acumulado (R$)",
        format: "currency",
        gridlines: { 
          color: "#e5e7eb", 
          count: 8 
        },
        viewWindow: {
          min: minValue,
          max: maxValue
        }
      },
      hAxis: {
        title: timeRange === "individual" ? "Transações" : "Período",
        slantedText: timeRange === "individual",
        slantedTextAngle: 30,
        gridlines: { color: "#f3f4f6" }
      },
      candlestick: {
        fallingColor: { strokeWidth: 0, fill: "#dc2626", stroke: "transparent" },
        risingColor: { strokeWidth: 0, fill: "#16a34a", stroke: "transparent" },
        hollowIsRising: false
      },
      series: seriesConfig,
      crosshair: { trigger: 'both', orientation: 'both' },
      explorer: {
        actions: ['dragToZoom', 'rightClickToReset'],
        axis: 'horizontal',
        keepInBounds: true,
        maxZoomIn: 4.0
      }
    };

    return { chartData, chartOptions: options };
  }, [transactions, goals, chartGoals, chartType, timeRange]);

  const handleChartClick = useCallback((event: any) => {
    if (event?.chartWrapper) {
      const chart = event.chartWrapper.getChart();
      const selection = chart.getSelection();
      
      // If no data point is selected, we can create a goal at chart center
      if (!selection || selection.length === 0) {
        // Get the last accumulated value as reference
        const lastValue = chartData.length > 1 ? (chartData[chartData.length - 1][4] as number) : 0;
        const margin = Math.abs(lastValue) * 0.3; // 30% above current value for default goal
        const suggestedValue = Math.round((lastValue + margin) / 100) * 100; // Round to nearest 100
        
        setClickedValue(suggestedValue);
        setShowGoalModal(true);
      } else {
        // If a data point is selected, use its value
        const selectedItem = selection[0];
        if (selectedItem.row !== undefined && selectedItem.row !== null) {
          const rowData = chartData[selectedItem.row + 1]; // +1 because header is index 0
          if (rowData && rowData[4]) { // Get the "Alto" value (closing accumulated value)
            setClickedValue(rowData[4] as number);
            setShowGoalModal(true);
          }
        }
      }
    }
  }, [chartData]);

  const handleCreateGoal = useCallback((goalData: { goal_type: "support" | "resistance"; value: number; label?: string }) => {
    onCreateChartGoal(goalData);
    setShowGoalModal(false);
  }, [onCreateChartGoal]);

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
        chartEvents={[
          {
            eventName: 'select',
            callback: handleChartClick,
          },
        ]}
      />
      
      <div className="absolute top-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
        🎯 Clique em área vazia para definir meta | 🔍 Arraste para zoom
      </div>

      <ChartGoalModal
        isOpen={showGoalModal}
        onClose={() => setShowGoalModal(false)}
        onCreateGoal={handleCreateGoal}
        clickedValue={clickedValue}
      />
    </div>
  );
}