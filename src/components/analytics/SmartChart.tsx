import { useMemo, useState } from "react";
import { ProfessionalCandlestickChart } from "@/components/chart/ProfessionalCandlestickChart";
import { TimeRangeSelector } from "@/components/chart/TimeRangeSelector";
import { useOHLCData } from "@/hooks/useOHLCData";

interface SmartChartProps {
  startDate?: Date;
  endDate?: Date;
}

export function SmartChart({ startDate, endDate }: SmartChartProps) {
  const [timeRange, setTimeRange] = useState<"individual" | "daily" | "weekly" | "monthly" | "yearly">("individual");
  const { data: ohlcData, isLoading } = useOHLCData(startDate, endDate, timeRange);

  const chartData = useMemo(() => {
    if (!ohlcData || ohlcData.length === 0) {
      return [];
    }

    // Dados OHLC já vêm calculados do banco
    return ohlcData.map(d => ({
      date: d.date,
      open: Number(d.open),
      high: Number(d.high),
      low: Number(d.low),
      close: Number(d.close)
    }));
  }, [ohlcData]);

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
    <div className="relative h-full space-y-4">
      <div className="flex justify-end">
        <TimeRangeSelector 
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
        />
      </div>
      <ProfessionalCandlestickChart 
        data={chartData}
      />
    </div>
  );
}
