import { ProfessionalCandlestickChart } from "@/components/chart/ProfessionalCandlestickChart";
import { useOHLCData } from "@/hooks/useOHLCData";

interface SmartChartProps {
  startDate?: Date;
  endDate?: Date;
}

export function SmartChart({ startDate, endDate }: SmartChartProps) {
  const { data: candleData, isLoading } = useOHLCData(startDate, endDate, "daily");

  if (isLoading) {
    return (
      <div className="w-full h-full bg-muted/20 animate-pulse rounded-lg flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Carregando gráfico...</div>
      </div>
    );
  }

  if (!candleData || candleData.length === 0) {
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
        data={candleData}
      />
    </div>
  );
}
