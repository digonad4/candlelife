import { useMemo } from "react";
import { ProfessionalCandlestickChart } from "@/components/chart/ProfessionalCandlestickChart";
import { FinancialGoal } from "@/hooks/useGoals";
import { useOHLCData } from "@/hooks/useOHLCData";

interface SmartChartProps {
  goals: FinancialGoal[];
  startDate?: Date;
  endDate?: Date;
}

export function SmartChart({ goals, startDate, endDate }: SmartChartProps) {
  const { data: ohlcData, isLoading } = useOHLCData(startDate, endDate);

  const { chartData, chartGoals } = useMemo(() => {
    if (!ohlcData || ohlcData.length === 0) {
      return {
        chartData: [],
        chartGoals: []
      };
    }

    // Dados OHLC já vêm calculados do banco
    const candleData = ohlcData.map(d => ({
      date: d.date,
      open: Number(d.open),
      high: Number(d.high),
      low: Number(d.low),
      close: Number(d.close)
    }));

    const chartGoals = goals
      .filter(goal => goal.display_on_chart)
      .map(goal => ({
        value: goal.target_amount,
        type: (goal.chart_line_type === 'resistance' ? 'resistance' : 'support') as 'support' | 'resistance',
        label: goal.description || `Meta: R$ ${goal.target_amount.toFixed(2)}`,
      }));

    return { chartData: candleData, chartGoals };
  }, [ohlcData, goals]);

  if (isLoading) {
    return (
      <div className="w-full h-full bg-muted/20 animate-pulse rounded-lg flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Carregando gráfico...</div>
      </div>
    );
  }

  if (!ohlcData || ohlcData.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground">
          <p>📊 Nenhum dado disponível</p>
          <p className="text-sm mt-2">Adicione transações confirmadas para visualizar o gráfico</p>
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
