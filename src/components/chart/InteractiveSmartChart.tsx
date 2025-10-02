import React, { useMemo, useState, useCallback } from "react";
import { Chart } from "react-google-charts";
import { ChartGoalModal } from "./ChartGoalModal";
import { FinancialGoal } from "@/hooks/useGoals";
import { Skeleton } from "@/components/ui/skeleton";
import { Info } from "lucide-react";

interface TransactionData {
  date: string;
  amount: number;
}

interface InteractiveSmartChartProps {
  transactions: TransactionData[];
  financialGoals: FinancialGoal[];
  chartType: any;
  timeRange: string;
  isLoading?: boolean;
  onCreateChartGoal?: (data: { goal_type: "support" | "resistance"; value: number; label?: string }) => void;
}

export function InteractiveSmartChart({
  transactions,
  financialGoals,
  chartType,
  timeRange,
  isLoading,
  onCreateChartGoal,
}: InteractiveSmartChartProps) {
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [clickedValue, setClickedValue] = useState(0);

  const { chartData, chartOptions } = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return { chartData: [], chartOptions: {} };
    }

    // Remover limite artificial de 100 transações
    const sortedTransactions = [...transactions].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Função para preencher datas faltantes com DOJIS
    const fillMissingDatesWithDojis = (transactions: TransactionData[]) => {
      if (transactions.length === 0) return [];
      
      const firstDate = new Date(transactions[0].date);
      const lastDate = new Date(transactions[transactions.length - 1].date);
      const filledData: TransactionData[] = [];
      
      let accumulated = 0;
      let currentDate = new Date(firstDate);
      let transactionIndex = 0;
      
      while (currentDate <= lastDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const transaction = transactions[transactionIndex];
        
        if (transaction && transaction.date === dateStr) {
          accumulated += transaction.amount;
          filledData.push({ date: dateStr, amount: transaction.amount });
          transactionIndex++;
        } else {
          // DOJI - dia sem transação (open === close)
          filledData.push({ date: dateStr, amount: 0 });
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return filledData;
    };

    const filledTransactions = fillMissingDatesWithDojis(sortedTransactions);
    
    // Processar dados baseado no timeRange
    let candleData: any[] = [];
    let accumulated = 0;
    
    if (timeRange === "individual") {
      filledTransactions.forEach(t => {
        const prevAccumulated = accumulated;
        accumulated += t.amount;
        
        if (t.amount === 0) {
          // DOJI: open === close, low === high (linha horizontal fina)
          candleData.push([
            t.date,
            accumulated, // Low
            accumulated, // Open
            accumulated, // Close
            accumulated  // High
          ]);
        } else {
          // Candle normal
          const low = Math.min(prevAccumulated, accumulated);
          const high = Math.max(prevAccumulated, accumulated);
          candleData.push([
            t.date,
            low,
            prevAccumulated, // Open
            accumulated,      // Close
            high
          ]);
        }
      });
    } else {
      // Agrupar por período (daily, weekly, monthly, yearly)
      const groupedData: { [key: string]: TransactionData[] } = {};
      
      filledTransactions.forEach(t => {
        const date = new Date(t.date);
        let key: string;
        
        switch (timeRange) {
          case "daily":
            key = t.date;
            break;
          case "weekly":
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            key = weekStart.toISOString().split('T')[0];
            break;
          case "monthly":
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            break;
          case "yearly":
            key = date.getFullYear().toString();
            break;
          default:
            key = t.date;
        }
        
        if (!groupedData[key]) groupedData[key] = [];
        groupedData[key].push(t);
      });

      Object.entries(groupedData).forEach(([period, periodTransactions]) => {
        const periodStart = accumulated;
        let low = periodStart;
        let high = periodStart;
        let open = periodStart;
        let close = periodStart;
        
        periodTransactions.forEach(t => {
          accumulated += t.amount;
          low = Math.min(low, accumulated);
          high = Math.max(high, accumulated);
          close = accumulated;
        });
        
        if (open === close && low === high) {
          // DOJI para período
          candleData.push([period, open, open, open, open]);
        } else {
          candleData.push([period, low, open, close, high]);
        }
      });
    }

    // Metas visuais no gráfico (apenas as marcadas como display_on_chart)
    const chartGoals = financialGoals.filter(goal => goal.display_on_chart && goal.chart_line_type);
    
    const seriesConfig: any = {};
    chartGoals.forEach((goal, index) => {
      seriesConfig[index + 1] = {
        type: "line",
        color: goal.chart_line_type === "resistance" 
          ? "#00ff88"  // Verde brilhante (meta de acúmulo)
          : goal.chart_line_type === "support"
          ? "#ff4444"  // Vermelho brilhante (limite mínimo)
          : "#ff9800", // Laranja (limite de gasto)
        lineWidth: 2,
        lineDashStyle: goal.chart_line_type === "spending_limit" ? [4, 4] : [0],
        pointSize: 0,
        visibleInLegend: false
      };
    });

    // Adicionar linhas de metas ao chartData
    const header = ["Período", "Baixo", "Abertura", "Fechamento", "Alto"];
    chartGoals.forEach(goal => {
      header.push(goal.description || `Meta ${goal.chart_line_type}`);
    });
    
    const dataWithGoals = candleData.map(row => {
      const newRow = [...row];
      chartGoals.forEach(goal => {
        newRow.push(goal.target_amount);
      });
      return newRow;
    });

    // Centralização inteligente baseada em estatística
    const lastValue = candleData.length > 0 ? candleData[candleData.length - 1][4] : 0;
    const allHighValues = candleData.map(c => c[4]);
    
    // Calcular média e desvio padrão
    const mean = allHighValues.reduce((sum, val) => sum + val, 0) / allHighValues.length;
    const variance = allHighValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / allHighValues.length;
    const stdDev = Math.sqrt(variance);
    
    // Margem baseada em 2 desvios padrão (95% dos dados)
    const margin = stdDev * 2;
    const minValue = Math.max(0, lastValue - margin);
    const maxValue = lastValue + margin * 1.5; // Mais espaço acima para metas

    const options = {
      backgroundColor: '#0a0e27', // Dark navy (estilo TradingView)
      chartArea: { 
        width: "88%", 
        height: "82%", 
        top: "10%", 
        left: "9%", 
        right: "3%", 
        bottom: "8%" 
      },
      vAxis: {
        textStyle: { 
          color: '#8c9196',
          fontSize: 11,
          fontName: 'Roboto Mono'
        },
        format: 'currency',
        gridlines: { 
          color: '#1a1f3a',
          count: 6
        },
        minorGridlines: {
          color: 'transparent'
        },
        baselineColor: '#2b3139',
        viewWindow: {
          min: minValue,
          max: maxValue
        }
      },
      hAxis: {
        textStyle: { 
          color: '#8c9196',
          fontSize: 11,
          fontName: 'Roboto Mono'
        },
        slantedText: timeRange === "individual",
        slantedTextAngle: 30,
        gridlines: { 
          color: '#1a1f3a',
          count: 8
        },
        minorGridlines: {
          color: 'transparent'
        },
        baselineColor: '#2b3139'
      },
      legend: {
        position: 'none'
      },
      crosshair: {
        trigger: 'both',
        orientation: 'both',
        color: '#ffd700', // Dourado
        opacity: 0.8
      },
      explorer: {
        actions: ['dragToZoom', 'rightClickToReset'],
        axis: 'horizontal',
        keepInBounds: true,
        maxZoomIn: 10.0,
        maxZoomOut: 1.0,
        zoomDelta: 1.1
      },
      candlestick: {
        fallingColor: { 
          strokeWidth: 1, 
          fill: '#f6465d',
          stroke: '#f6465d'
        },
        risingColor: { 
          strokeWidth: 1, 
          fill: '#0ecb81',
          stroke: '#0ecb81'
        },
        // Estilo especial para dojis
        hollowIsRising: false
      },
      series: seriesConfig,
      tooltip: {
        isHtml: true,
        trigger: 'both'
      }
    };

    return { 
      chartData: [header, ...dataWithGoals], 
      chartOptions: options 
    };
  }, [transactions, financialGoals, chartType, timeRange]);

  const handleChartClick = useCallback((chartWrapper: any) => {
    if (!onCreateChartGoal) return;
    
    const chart = chartWrapper.getChart();
    const selection = chart.getSelection();
    
    if (selection && selection.length > 0) {
      const selectedItem = selection[0];
      
      if (selectedItem.row !== null && selectedItem.row !== undefined) {
        // Clicou em um ponto específico
        const dataTable = chartWrapper.getDataTable();
        const highValue = dataTable.getValue(selectedItem.row, 4); // Valor "Alto"
        setClickedValue(highValue);
        setShowGoalModal(true);
      }
    } else {
      // Clicou em área vazia - sugerir valor baseado no último ponto
      if (chartData && chartData.length > 1) {
        const lastDataPoint = chartData[chartData.length - 1];
        const lastValue = lastDataPoint[4]; // Valor "Alto"
        setClickedValue(lastValue);
        setShowGoalModal(true);
      }
    }
  }, [chartData, onCreateChartGoal]);

  const handleCreateGoal = useCallback((data: { goal_type: "support" | "resistance"; value: number; label?: string }) => {
    if (onCreateChartGoal) {
      onCreateChartGoal(data);
    }
    setShowGoalModal(false);
  }, [onCreateChartGoal]);

  if (isLoading) {
    return (
      <div className="w-full h-[500px] space-y-4">
        <Skeleton className="w-full h-full" />
        <div className="text-center text-sm text-muted-foreground">
          Carregando gráfico profissional...
        </div>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-[#0a0e27] rounded-xl border border-[#1a1f3a]">
        <div className="text-center space-y-2">
          <div className="text-[#8c9196] text-lg">📊 Sem dados para exibir</div>
          <p className="text-[#6b7280] text-sm">Adicione transações para visualizar o gráfico</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="bg-[#0a0e27] rounded-xl border border-[#1a1f3a] p-4">
        <Chart
          chartType="CandlestickChart"
          width="100%"
          height="500px"
          data={chartData}
          options={chartOptions}
          chartEvents={[
            {
              eventName: "select",
              callback: ({ chartWrapper }) => handleChartClick(chartWrapper),
            },
          ]}
        />
      </div>
      
      {/* Tooltip de instruções */}
      <div className="flex items-center gap-2 text-xs text-[#8c9196] justify-center">
        <Info className="h-4 w-4" />
        <span>Clique no gráfico para criar metas visuais | Arraste para zoom | Clique direito para resetar</span>
      </div>

      {showGoalModal && (
        <ChartGoalModal
          isOpen={showGoalModal}
          onClose={() => setShowGoalModal(false)}
          onCreateGoal={handleCreateGoal}
          clickedValue={clickedValue}
        />
      )}
    </div>
  );
}
