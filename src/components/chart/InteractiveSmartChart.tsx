
import { useMemo } from "react";
import { Chart } from "react-google-charts";
import { GoogleChartWrapperChartType } from "react-google-charts";
import { parseISO, format, startOfDay, startOfWeek, startOfMonth, startOfYear } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TransactionData {
  date: string;
  amount: number;
}

interface ChartDataProps {
  transactions: TransactionData[];
  chartType: GoogleChartWrapperChartType;
  timeRange: string;
  isLoading: boolean;
}

export function ChartData({ transactions, chartType, timeRange, isLoading }: ChartDataProps) {
  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return [["Data", "Menor", "Abertura", "Fechamento", "Maior"]];
    }

    let accumulatedValue = 0;
    const processedTransactions: Array<{ date: string; amount: number }> = [];

    if (timeRange === "individual") { // Velas individuais
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
    } else { // Agrupamento por período
      transactions.forEach((t) => {
        let dateFormatted;
        switch (timeRange) {
          case "daily":
            dateFormatted = format(startOfDay(parseISO(t.date)), "dd/MM", { locale: ptBR });
            break;
          case "weekly":
            dateFormatted = format(startOfWeek(parseISO(t.date), { locale: ptBR }), "dd/MM/yyyy", { locale: ptBR });
            break;
          case "monthly":
            dateFormatted = format(startOfMonth(parseISO(t.date)), "MM/yyyy", { locale: ptBR });
            break;
          case "yearly":
            dateFormatted = format(startOfYear(parseISO(t.date)), "yyyy", { locale: ptBR });
            break;
          default:
            dateFormatted = format(parseISO(t.date), "dd/MM", { locale: ptBR });
        }

        const existingTransaction = processedTransactions.find(item => item.date === dateFormatted);

        if (existingTransaction) {
          existingTransaction.amount += t.amount;
        } else {
          processedTransactions.push({ date: dateFormatted, amount: t.amount });
        }
      });

      if (chartType === "CandlestickChart") {
        return [
          ["Data", "Menor", "Abertura", "Fechamento", "Maior"],
          ...processedTransactions.map((t) => {
            const open = accumulatedValue;
            const close = accumulatedValue + t.amount;
            const low = Math.min(open, close);
            const high = Math.max(open, close);

            accumulatedValue = close;

            return [t.date, low, open, close, high];
          }),
        ];
      } else {
        return [["Data", "Valor"], ...processedTransactions.map((t) => [t.date, t.amount])];
      }
    }
  }, [transactions, chartType, timeRange]);

  if (isLoading) {
    return <div className="w-full h-full bg-gray-100 animate-pulse rounded-lg" />;
  }

  if (transactions.length === 0) {
    return <p className="text-center text-muted-foreground py-8 dark:text-gray-400">Nenhuma transação confirmada registrada neste período.</p>;
  }

  return (
    <Chart
      width="100%"
      height="100%"
      chartType={chartType}
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
  );
}
