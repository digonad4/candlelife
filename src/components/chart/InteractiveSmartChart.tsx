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
  chartType: any; // Mantido como 'any' para o tipo de gráfico (CandlestickChart)
  timeRange: "individual" | "daily" | "weekly" | "monthly" | "yearly";
  isLoading?: boolean;
  onCreateChartGoal?: (data: { goal_type: "support" | "resistance"; value: number; label?: string }) => void;
}

interface AccumulationCandle {
  key: string;
  open: number;
  close: number;
  low: number;
  high: number;
  amount: number;
}

function useCandlestickChartData(transactions: TransactionData[], timeRange: string) {
  return useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    // Ordena as transações por data
    const sortedTransactions = [...transactions].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Preenche datas faltantes e calcula o saldo acumulado ponto a ponto
    const getAccumulatedData = (transactions: TransactionData[]): AccumulationCandle[] => {
      if (transactions.length === 0) return [];

      const firstDate = new Date(transactions[0].date);
      const lastDate = new Date(transactions[transactions.length - 1].date);

      const detailedAccumulation: AccumulationCandle[] = [];
      const transactionMap = new Map<string, number>();
      transactions.forEach(t => {
        transactionMap.set(t.date, (transactionMap.get(t.date) || 0) + t.amount);
      });

      let accumulated = 0;
      let currentDate = new Date(firstDate);

      while (currentDate <= lastDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const dailyAmount = transactionMap.get(dateStr) || 0;

        const open = accumulated;
        accumulated += dailyAmount;
        const close = accumulated;

        const low = dailyAmount === 0 ? open : Math.min(open, close);
        const high = dailyAmount === 0 ? open : Math.max(open, close);

        detailedAccumulation.push({
          key: dateStr,
          open,
          close,
          low,
          high,
          amount: dailyAmount
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      return detailedAccumulation;
    };

    const detailedAccumulation = getAccumulatedData(sortedTransactions);

    // Agrupamento de acordo com timeRange
    let finalCandleData: AccumulationCandle[] = [];
    if (timeRange === "individual" || timeRange === "daily") {
      finalCandleData = detailedAccumulation;
    } else {
      const groupedData: { [key: string]: AccumulationCandle[] } = {};
      detailedAccumulation.forEach(d => {
        const date = new Date(d.key);
        let key: string;
        switch (timeRange) {
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
            key = d.key;
        }
        if (!groupedData[key]) groupedData[key] = [];
        groupedData[key].push(d);
      });

      Object.entries(groupedData).forEach(([period, periodAccumulations]) => {
        if (periodAccumulations.length === 0) return;
        const open = periodAccumulations[0].open;
        const close = periodAccumulations[periodAccumulations.length - 1].close;
        const low = Math.min(...periodAccumulations.map(d => d.low));
        const high = Math.max(...periodAccumulations.map(d => d.high));
        finalCandleData.push({
          key: period,
          low,
          open,
          close,
          high,
          amount: periodAccumulations.reduce((sum, d) => sum + d.amount, 0)
        });
      });

      finalCandleData.sort((a, b) => a.key.localeCompare(b.key));
    }

    // Formato para Google Charts
    return finalCandleData.map(d => [d.key, d.low, d.open, d.close, d.high]);
  }, [transactions, timeRange]);
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

  const chartData = useCandlestickChartData(transactions, timeRange);

  // Adiciona metas como linhas horizontais
  const chartGoals = financialGoals.filter(goal => goal.display_on_chart && goal.chart_line_type);
  const header = ["Período", "Baixo", "Abertura", "Fechamento", "Alto"];
  const seriesConfig: any = {};
  chartGoals.forEach((goal, index) => {
    header.push(goal.description || `${goal.chart_line_type} R$${goal.target_amount}`);
    seriesConfig[index] = {
      type: "line",
      color: goal.chart_line_type === "resistance"
        ? "#0ecb81"
        : goal.chart_line_type === "support"
        ? "#f6465d"
        : "#ff9800",
      lineWidth: 2,
      lineDashStyle: goal.chart_line_type === "support" ? [4, 4] : [0],
      pointSize: 0,
      visibleInLegend: false,
    };
  });

  const dataWithGoals = chartData.map(row => {
    const newRow = [...row];
    chartGoals.forEach(goal => {
      newRow.push(goal.target_amount);
    });
    return newRow;
  });

  // Zoom automático e margem
  const allValues = chartData.flatMap(c => [c[1], c[4]]); // low, high
  const minDataValue = Math.min(0, ...allValues);
  const maxDataValue = Math.max(...allValues);
  const range = maxDataValue - minDataValue;
  const marginRatio = 0.1;
  const minValue = Math.max(0, minDataValue - range * marginRatio);
  const maxValue = maxDataValue + range * marginRatio;

  const options = {
    backgroundColor: '#0a0e27',
    chartArea: { width: "88%", height: "82%", top: "10%", left: "9%", right: "3%", bottom: "8%" },
    vAxis: {
      textStyle: { color: '#8c9196', fontSize: 11, fontName: 'Roboto Mono' },
      format: 'decimal',
      gridlines: { color: '#1a1f3a', count: 6 },
      minorGridlines: { color: 'transparent' },
      baselineColor: '#2b3139',
      viewWindow: { min: minValue, max: maxValue }
    },
    hAxis: {
      textStyle: { color: '#8c9196', fontSize: 11, fontName: 'Roboto Mono' },
      slantedText: true,
      slantedTextAngle: 30,
      gridlines: { color: '#1a1f3a', count: 8 },
      minorGridlines: { color: 'transparent' },
      baselineColor: '#2b3139'
    },
    legend: { position: 'none' },
    crosshair: { trigger: 'both', orientation: 'both', color: '#ffd700', opacity: 0.8 },
    explorer: {
      actions: ['dragToZoom', 'rightClickToReset'],
      axis: 'horizontal',
      keepInBounds: true,
      maxZoomIn: 10.0,
      maxZoomOut: 1.0,
      zoomDelta: 1.1
    },
    candlestick: {
      fallingColor: { strokeWidth: 1, fill: '#f6465d', stroke: '#f6465d' },
      risingColor: { strokeWidth: 1, fill: '#0ecb81', stroke: '#0ecb81' },
      hollowIsRising: false
    },
    series: {
      0: { type: 'candlestick' },
      ...Object.fromEntries(
        chartGoals.map((_, index) => [index + 1, seriesConfig[index]])
      )
    },
    tooltip: {
      isHtml: true,
      trigger: 'both'
    }
  };

  const handleChartClick = useCallback((chartWrapper: any) => {
    if (!onCreateChartGoal) return;

    const chart = chartWrapper.getChart();
    const selection = chart.getSelection();
    const dataTable = chartWrapper.getDataTable();

    if (selection && selection.length > 0) {
      const selectedItem = selection[0];
      if (selectedItem.row !== null && selectedItem.row !== undefined) {
        const isGoalColumn = selectedItem.column > 4;
        const valueToUse = isGoalColumn
          ? dataTable.getValue(selectedItem.row, selectedItem.column)
          : dataTable.getValue(selectedItem.row, 4); // High
        if (valueToUse !== null) {
          setClickedValue(Number(valueToUse));
          setShowGoalModal(true);
        }
      }
    } else {
      // Clique em área vazia: sugere valor do último "High"
      if (dataWithGoals && dataWithGoals.length > 1) {
        const lastDataPoint = dataWithGoals[dataWithGoals.length - 1];
        const lastValue = lastDataPoint[4];
        if (lastValue !== null) {
          setClickedValue(Number(lastValue));
          setShowGoalModal(true);
        }
      }
    }
  }, [dataWithGoals, onCreateChartGoal]);

  const handleCreateGoal = useCallback((data: { goal_type: "support" | "resistance"; value: number; label?: string }) => {
    if (onCreateChartGoal) {
      onCreateChartGoal(data);
    }
    setShowGoalModal(false);
  }, [onCreateChartGoal]);

  if (isLoading) {
    return (
      <div className="w-full h-[500px] space-y-4">
        <Skeleton className="w-full h-full bg-[#1a1f3a]" />
        <div className="text-center text-sm text-[#8c9196]">
          Carregando gráfico profissional...
        </div>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-[#0a0e27] rounded-xl border border-[#1a1f3a]">
        <div className="text-center space-y-2">
          <div className="text-[#8c9196] text-lg">
            📊 Sem dados para exibir
          </div>
          <p className="text-[#6b7280] text-sm">Adicione transações para visualizar o gráfico</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="bg-[#0a0e27] rounded-xl border border-[#1a1f3a] p-1">
        <Chart
          chartType="CandlestickChart"
          width="100%"
          height="500px"
          data={[header, ...dataWithGoals]}
          options={options}
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
        <Info className="h-4 w-4 text-[#8c9196]" />
        <span>
          Clique no gráfico (ou vela) para criar metas visuais | Arraste para zoom | Clique direito para resetar
        </span>
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
