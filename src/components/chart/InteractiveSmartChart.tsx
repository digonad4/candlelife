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

// Tipo para os dados de vela/ponto, incluindo o valor acumulado antes (Open) e depois (Close)
interface AccumulationCandle {
  key: string; // Data ou Período
  open: number; // Acumulado no início do período
  close: number; // Acumulado no fim do período
  low: number; // Mínimo no período
  high: number; // Máximo no período
  amount: number; // Total da transação no período (para o caso individual)
}

export function InteractiveSmartChart({
  transactions,
  financialGoals,
  chartType, // Não usado diretamente, mas mantido na interface
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

    // 1. Preparação e Ordenação
    const sortedTransactions = [...transactions].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // 2. Preencher datas faltantes e calcular acumulação ponto a ponto
    const getAccumulatedData = (transactions: TransactionData[]) => {
      if (transactions.length === 0) return [];
      
      const firstDate = new Date(transactions[0].date);
      const lastDate = new Date(transactions[transactions.length - 1].date);
      
      const detailedAccumulation: AccumulationCandle[] = [];
      const transactionMap = new Map<string, number>();
      
      // Mapear todas as transações por data
      transactions.forEach(t => {
        const dateKey = t.date.split('T')[0];
        transactionMap.set(dateKey, (transactionMap.get(dateKey) || 0) + t.amount);
      });
      
      let accumulated = 0;
      let currentDate = new Date(firstDate);
      
      while (currentDate <= lastDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const dailyAmount = transactionMap.get(dateStr) || 0;
        
        const open = accumulated;
        accumulated += dailyAmount;
        const close = accumulated;
        
        // DOJI: dias sem transação aparecem como linha horizontal (Open=Close=Low=High)
        // Vela: dias com transação mostram acumulação (Low=min, High=max)
        const low = Math.min(open, close);
        const high = Math.max(open, close);

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
    
    // 3. Processar dados baseado no timeRange
    let finalCandleData: AccumulationCandle[] = [];
    
    if (timeRange === "individual") {
      finalCandleData = detailedAccumulation;
    } else {
      // Agrupar por período (daily, weekly, monthly, yearly)
      const groupedData: { [key: string]: AccumulationCandle[] } = {};
      
      detailedAccumulation.forEach(d => {
        const date = new Date(d.key);
        let key: string;
        
        switch (timeRange) {
          case "daily":
            key = d.key; // Se for daily, o detailedAccumulation já serve
            break;
          case "weekly":
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay()); // Início da semana (Domingo)
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

      // Recalcular as velas para os períodos agrupados
      Object.entries(groupedData).forEach(([period, periodAccumulations]) => {
        if (periodAccumulations.length === 0) return;

        // O Open é o 'open' do primeiro ponto do período (que é o 'close' do período anterior)
        const open = periodAccumulations[0].open;
        // O Close é o 'close' do último ponto do período
        const close = periodAccumulations[periodAccumulations.length - 1].close;
        
        // O Low e High são o mínimo/máximo de TODOS os Lows/Highs no período
        const low = Math.min(...periodAccumulations.map(d => d.low));
        const high = Math.max(...periodAccumulations.map(d => d.high));
        
        // Nota: O google-charts espera a ordem: [período, low, open, close, high]
        finalCandleData.push({
          key: period,
          low,
          open,
          close,
          high,
          amount: periodAccumulations.reduce((sum, d) => sum + d.amount, 0)
        });
      });
      
      // Se for agrupado, é bom garantir a ordenação novamente pelas chaves (datas/períodos)
      finalCandleData.sort((a, b) => a.key.localeCompare(b.key));
    }

    // 4. Transformar para o formato do Google Charts
    // Ordem esperada: [Período, Baixo (Low), Abertura (Open), Fechamento (Close), Alto (High)]
    const candleDataForChart = finalCandleData.map(d => [d.key, d.low, d.open, d.close, d.high]);

    // 5. Adicionar Metas (Linhas Horizontais)
    const chartGoals = financialGoals.filter(goal => goal.display_on_chart && goal.chart_line_type);
    
    const seriesConfig: any = {};
    const header = ["Período", "Baixo", "Abertura", "Fechamento", "Alto"];
    
    // Adicionar cabeçalhos para as metas (serão a partir do índice 5 - series index 1)
    chartGoals.forEach((goal, index) => {
      header.push(goal.description || `${goal.chart_line_type} R$${goal.target_amount}`);
      seriesConfig[index] = { // series index é 0-based a partir da 1ª série de linha
        type: "line",
        color: goal.chart_line_type === "resistance" 
          ? "#0ecb81"  // Verde (Meta de Acúmulo)
          : goal.chart_line_type === "support"
          ? "#f6465d"  // Vermelho (Limite Mínimo)
          : "#ff9800", // Laranja (Outros)
        lineWidth: 2,
        lineDashStyle: goal.chart_line_type === "support" ? [4, 4] : [0], // Linha tracejada para 'support'
        pointSize: 0,
        visibleInLegend: false,
        // Usar targetAxisIndex: 0 (Eixo Y principal)
      };
    });

    const dataWithGoals = candleDataForChart.map(row => {
      const newRow = [...row];
      chartGoals.forEach(goal => {
        newRow.push(goal.target_amount); // Adiciona o valor da meta
      });
      return newRow;
    });

    // 6. Centralização Inteligente (Ajustado)
    const lastValue = finalCandleData.length > 0 ? finalCandleData[finalCandleData.length - 1].high : 0;
    const allValues = finalCandleData.flatMap(c => [c.low, c.high]);
    
    const minDataValue = Math.min(0, ...allValues);
    const maxDataValue = Math.max(lastValue, ...allValues);
    
    const range = maxDataValue - minDataValue;
    const marginRatio = 0.1; // 10% de margem no topo e na base
    
    const minValue = Math.max(0, minDataValue - range * marginRatio);
    const maxValue = maxDataValue + range * marginRatio;

    // 7. Configuração das Opções do Gráfico
    const options = {
      backgroundColor: '#0a0e27',
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
        slantedText: timeRange === "individual" || timeRange === "daily",
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
        color: '#ffd700',
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
        fallingColor: { // Candle de queda (Open > Close)
          strokeWidth: 1, 
          fill: '#f6465d', // Vermelho (perda de valor no período)
          stroke: '#f6465d'
        },
        risingColor: { // Candle de alta (Close > Open)
          strokeWidth: 1, 
          fill: '#0ecb81', // Verde (ganho de valor no período)
          stroke: '#0ecb81'
        },
        hollowIsRising: false
      },
      // Configuração de séries: a série 0 é o Candlestick, as subsequentes são as linhas de meta
      series: {
        0: { type: 'candlestick' },
        ...Object.fromEntries(
          chartGoals.map((_, index) => [index + 1, seriesConfig[index]]) // O índice de series começa em 1 para a primeira linha de meta
        )
      },
      tooltip: {
        isHtml: true,
        trigger: 'both'
      }
    };

    return { 
      chartData: [header, ...dataWithGoals], 
      chartOptions: options 
    };
  }, [transactions, financialGoals, timeRange]);

  const handleChartClick = useCallback((chartWrapper: any) => {
    if (!onCreateChartGoal) return;
    
    const chart = chartWrapper.getChart();
    const selection = chart.getSelection();
    const dataTable = chartWrapper.getDataTable();
    
    if (selection && selection.length > 0) {
      const selectedItem = selection[0];
      
      if (selectedItem.row !== null && selectedItem.row !== undefined) {
        // Clicou em um ponto específico. Se for na vela (colunas 1-4), pegamos o 'High' (coluna 4)
        const valueColumn = selectedItem.column >= 1 && selectedItem.column <= 4 ? 4 : selectedItem.column;
        
        // Se a coluna for uma das metas, pegamos o valor da meta
        const isGoalColumn = selectedItem.column > 4; 
        const valueToUse = isGoalColumn 
          ? dataTable.getValue(selectedItem.row, selectedItem.column)
          : dataTable.getValue(selectedItem.row, 4); // Pega o High (coluna 4) da vela
          
        if (valueToUse !== null) {
          setClickedValue(Number(valueToUse));
          setShowGoalModal(true);
        }
      }
    } else {
      // Clicou em área vazia - sugerir valor baseado no último ponto 'High'
      if (chartData && chartData.length > 1) {
        const lastDataPoint = chartData[chartData.length - 1];
        const lastValue = lastDataPoint[4]; // Valor "Alto" (High)
        if (lastValue !== null) {
          setClickedValue(Number(lastValue));
          setShowGoalModal(true);
        }
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
          <div className="text-[#8c9196] text-lg">📊 Sem dados para exibir</div>
          <p className="text-[#6b7280] text-sm">Adicione transações para visualizar o gráfico</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
        <div className="bg-[#0a0e27] rounded-xl border border-[#1a1f3a] p-1 sm:p-2">
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
      <div className="flex items-center gap-2 text-xs text-[#8c9196] justify-center px-2 text-center">
        <Info className="h-4 w-4 text-[#8c9196] flex-shrink-0" />
        <span className="hidden sm:inline">Clique no gráfico (ou vela) para criar metas visuais | Arraste para zoom | Clique direito para resetar</span>
        <span className="sm:hidden">Clique para criar metas | Arraste para zoom</span>
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
