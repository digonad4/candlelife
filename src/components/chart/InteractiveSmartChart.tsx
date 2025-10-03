import React, { useMemo, useState, useCallback } from "react";
import { Chart } from "react-google-charts";
import { ChartGoalModal } from "./ChartGoalModal";
import { FinancialGoal } from "@/hooks/useGoals";
import { Skeleton } from "@/components/ui/skeleton";
import { Info, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

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
  chartType,
  timeRange,
  isLoading,
  onCreateChartGoal,
}: InteractiveSmartChartProps) {
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [clickedValue, setClickedValue] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
      backgroundColor: 'transparent',
      chartArea: { 
        width: "90%", 
        height: "85%", 
        top: "5%", 
        left: "8%", 
        right: "2%", 
        bottom: "10%" 
      },
      vAxis: {
        textStyle: { 
          color: 'hsl(var(--muted-foreground))',
          fontSize: 12,
          fontName: 'Inter, system-ui'
        },
        format: 'currency',
        gridlines: { 
          color: 'hsl(var(--border))',
          count: 8
        },
        minorGridlines: {
          color: 'transparent'
        },
        baselineColor: 'hsl(var(--border))',
        viewWindow: {
          min: minValue,
          max: maxValue
        }
      },
      hAxis: {
        textStyle: { 
          color: 'hsl(var(--muted-foreground))',
          fontSize: 11,
          fontName: 'Inter, system-ui'
        },
        slantedText: timeRange === "individual" || timeRange === "daily",
        slantedTextAngle: 45,
        gridlines: { 
          color: 'hsl(var(--border))',
          count: -1
        },
        minorGridlines: {
          color: 'transparent'
        },
        baselineColor: 'hsl(var(--border))'
      },
      legend: {
        position: 'none'
      },
      crosshair: {
        trigger: 'both',
        orientation: 'both',
        color: 'hsl(var(--primary))',
        opacity: 0.6
      },
      explorer: {
        actions: ['dragToZoom', 'rightClickToReset'],
        axis: 'horizontal',
        keepInBounds: true,
        maxZoomIn: 10.0,
        maxZoomOut: 1.0,
        zoomDelta: 1.15
      },
      candlestick: {
        fallingColor: {
          strokeWidth: 2, 
          fill: 'hsl(var(--destructive))',
          stroke: 'hsl(var(--destructive))'
        },
        risingColor: {
          strokeWidth: 2, 
          fill: 'hsl(var(--success))',
          stroke: 'hsl(var(--success))'
        },
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
      },
      animation: {
        startup: true,
        duration: 500,
        easing: 'inAndOut'
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

  const ChartComponent = (
    <div className="relative w-full h-full">
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm hover:bg-background"
        onClick={() => setIsFullscreen(!isFullscreen)}
      >
        {isFullscreen ? (
          <Minimize2 className="h-4 w-4" />
        ) : (
          <Maximize2 className="h-4 w-4" />
        )}
      </Button>
      <Chart
        chartType="CandlestickChart"
        width="100%"
        height={isFullscreen ? "calc(100vh - 100px)" : "500px"}
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
  );

  return (
    <>
      <div className="w-full space-y-4">
        <div className="bg-card rounded-xl border border-border p-2 sm:p-4 overflow-hidden">
          {ChartComponent}
        </div>
        
        {/* Tooltip de instruções */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center px-2 text-center">
          <Info className="h-4 w-4 flex-shrink-0" />
          <span className="hidden sm:inline">Clique no gráfico para criar metas | Arraste para zoom | Clique direito para resetar | Tela cheia disponível</span>
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

      {/* Fullscreen Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-4">
          <div className="w-full h-full">
            {ChartComponent}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
