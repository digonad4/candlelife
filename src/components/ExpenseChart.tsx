import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfessionalCandlestickChart } from "./chart/ProfessionalCandlestickChart";
import { useGoals } from "@/hooks/useGoals";
import { usePeriodLabel } from "./chart/usePeriodLabel";
import { useOHLCData } from "@/hooks/useOHLCData";

interface ExpenseChartProps {
  startDate?: Date;
  endDate?: Date;
}

export function ExpenseChart({ startDate, endDate }: ExpenseChartProps) {
  const { chartGoals } = useGoals();
  const { data: ohlcData, isLoading } = useOHLCData(startDate, endDate, "individual");
  const periodLabel = usePeriodLabel(startDate, endDate);

  // Transformar dados OHLC em formato do gráfico
  const candleData = ohlcData?.map(d => ({
    date: d.date,
    open: Number(d.open),
    high: Number(d.high),
    low: Number(d.low),
    close: Number(d.close),
  })) || [];

  // Transformar metas em linhas de support/resistance
  const goalLines = chartGoals.map(goal => ({
    value: goal.target_amount,
    type: (goal.chart_line_type === 'resistance' ? 'resistance' : 'support') as 'support' | 'resistance',
    label: goal.description || `Meta: ${goal.target_amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
  }));

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Seu desempenho de {periodLabel}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] w-full animate-pulse bg-muted rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seu desempenho de {periodLabel}</CardTitle>
      </CardHeader>
      <CardContent>
        <ProfessionalCandlestickChart 
          data={candleData}
          goals={goalLines}
        />
      </CardContent>
    </Card>
  );
}
