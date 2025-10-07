import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfessionalCandlestickChart } from "./chart/ProfessionalCandlestickChart";
import { useGoals } from "@/hooks/useGoals";
import { usePeriodLabel } from "./chart/usePeriodLabel";
import { useTransactionData } from "./chart/useTransactionData";
import { TimeRangeSelector } from "./chart/TimeRangeSelector";

interface ExpenseChartProps {
  startDate?: Date;
  endDate?: Date;
}

export function ExpenseChart({ startDate, endDate }: ExpenseChartProps) {
  const { goals, chartGoals, createGoal } = useGoals();
  const [timeRange, setTimeRange] = useState<"individual" | "daily" | "weekly" | "monthly" | "yearly">("daily");

  const startDateISO = startDate ? startDate.toISOString() : undefined;
  const endDateISO = endDate ? endDate.toISOString() : undefined;

  const { data: transactions, isLoading } = useTransactionData("CandlestickChart", timeRange, startDateISO, endDateISO);
  const periodLabel = usePeriodLabel(startDate, endDate);

  // Transformar transações em dados de candlestick
  const candleData = transactions?.map(t => ({
    date: t.date,
    open: t.amount,
    high: t.amount,
    low: t.amount,
    close: t.amount,
  })) || [];

  // Transformar metas em linhas de support/resistance
  const goalLines = chartGoals.map(goal => ({
    value: goal.target_amount,
    type: (goal.chart_line_type === 'resistance' ? 'resistance' : 'support') as 'support' | 'resistance',
    label: goal.description || `Meta: ${goal.target_amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
  }));

  const handleCreateChartGoal = (data: { goal_type: "support" | "resistance"; value: number; label?: string }) => {
    createGoal({
      goal_type: data.goal_type === "resistance" ? "investment_goal" : "spending_limit",
      target_amount: data.value,
      description: data.label || `Meta Visual ${data.goal_type}`,
      display_on_chart: true,
      chart_line_type: data.goal_type,
    });
  };

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
      <CardContent className="space-y-4">
        <ProfessionalCandlestickChart 
          data={candleData}
          goals={goalLines}
          onClickValue={(value) => {
            // Implementar lógica de criar meta ao clicar
            console.log("Clicked value:", value);
          }}
        />
        <div className="flex justify-center">
          <TimeRangeSelector 
            timeRange={timeRange} 
            onTimeRangeChange={setTimeRange} 
          />
        </div>
      </CardContent>
    </Card>
  );
}
