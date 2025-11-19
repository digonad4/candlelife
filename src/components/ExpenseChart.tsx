import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfessionalCandlestickChart } from "./chart/ProfessionalCandlestickChart";
import { useOHLCData } from "@/hooks/useOHLCData";

export function ExpenseChart() {
  // Mostra dados agregados diários do OHLC
  const { data: candleData, isLoading } = useOHLCData(undefined, undefined, "daily");

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
    <Card className="w-full max-w-full overflow-hidden rounded-xl border-border">
      <CardHeader className="p-6">
        <CardTitle>Seu Desempenho Geral</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <ProfessionalCandlestickChart 
          data={candleData || []}
        />
      </CardContent>
    </Card>
  );
}
