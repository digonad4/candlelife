import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Chart } from "react-google-charts";
import { parseISO, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useMemo } from "react";

export function ExpenseChart() {
  const { user } = useAuth();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["expense-chart", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("transactions")
        .select("date, amount")
        .eq("user_id", user.id)
        .eq("payment_status", "confirmed")
        .order("date");

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0)
      return [["Data", "Menor", "Abertura", "Fechamento", "Maior"]];

    let accumulatedValue = 0;

    return [
      ["Data", "Menor", "Abertura", "Fechamento", "Maior"],
      ...transactions.map((t) => {
        const dateFormatted = format(parseISO(t.date), "dd/MM", { locale: ptBR });

        const open = accumulatedValue;
        const close = accumulatedValue + t.amount;
        const low = Math.min(open, close);
        const high = Math.max(open, close);

        accumulatedValue = close;

        return [dateFormatted, low, open, close, high];
      }),
    ];
  }, [transactions]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seu desempenho (apenas transações confirmadas)</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px] flex items-center justify-center">
        {isLoading ? (
          <div className="w-full h-full bg-gray-100 animate-pulse rounded-lg" />
        ) : transactions.length === 0 ? (
          <p className="text-gray-500">Nenhuma transação confirmada registrada.</p>
        ) : (
          <Chart
            width="100%"
            height="400px"
            chartType="CandlestickChart"
            loader={<div>Carregando Gráfico...</div>}
            data={chartData}
            options={{
              legend: "none",
              candlestick: {
                fallingColor: { strokeWidth: 0, fill: "#ef4444" },
                risingColor: { strokeWidth: 0, fill: "#22c55e" },
              },
              vAxis: {
                title: "Valor Acumulado (R$)",
                format: "decimal",
              },
              hAxis: {
                title: "Data",
              },
              backgroundColor: "transparent",
              chartArea: {
                width: "80%",
                height: "80%",
              },
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}
