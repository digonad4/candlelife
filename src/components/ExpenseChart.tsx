import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfessionalCandlestickChart } from "./chart/ProfessionalCandlestickChart";
import { useOHLCData } from "@/hooks/useOHLCData";

export function ExpenseChart() {
  // Sempre mostra TODAS as transações confirmadas (sem filtros de data)
  const { data: ohlcData, isLoading } = useOHLCData(undefined, undefined, "individual");

  // Transformar dados OHLC em formato do gráfico
  const candleData = ohlcData?.map(d => ({
    date: d.date,
    open: Number(d.open),
    high: Number(d.high),
    low: Number(d.low),
    close: Number(d.close),
  })) || [];

  if (isLoading) {
    return (
      <Card className="rounded-xl border-border">
        <CardHeader className="p-6">
          <CardTitle>Seu Desempenho Geral</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[500px] w-full animate-pulse bg-muted rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl border-border">
      <CardHeader className="p-6">
        <CardTitle>Seu Desempenho Geral</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <ProfessionalCandlestickChart 
          data={candleData}
        />
      </CardContent>
    </Card>
  );
}
