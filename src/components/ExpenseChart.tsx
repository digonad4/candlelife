import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfessionalCandlestickChart } from "./chart/ProfessionalCandlestickChart";
import { useTransactionCandles } from "@/hooks/useTransactionCandles";

export function ExpenseChart() {
  // Mostra cada transação como uma vela individual
  const { data: candleData, isLoading } = useTransactionCandles();

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-xl sm:text-2xl">$ LIFE - Gráfico da Sua Vida</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Visualize sua vida financeira como uma ação da bolsa
            </p>
          </div>
          <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="w-3 h-3 bg-green-500 rounded" />
              <span className="font-medium text-green-700 dark:text-green-400">Income (Sobe)</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="w-3 h-3 bg-red-500 rounded" />
              <span className="font-medium text-red-700 dark:text-red-400">Expense (Desce)</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <ProfessionalCandlestickChart 
          data={candleData || []}
        />
      </CardContent>
    </Card>
  );
}
