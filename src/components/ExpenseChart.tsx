import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GoogleChartWrapperChartType } from "react-google-charts";
import { InteractiveSmartChart } from "./chart/InteractiveSmartChart";
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
  const [chartType] = useState<GoogleChartWrapperChartType>("CandlestickChart");
  const [timeRange, setTimeRange] = useState("individual");

  const startDateISO = startDate ? startDate.toISOString() : undefined;
  const endDateISO = endDate ? endDate.toISOString() : undefined;

  const { data: transactions, isLoading } = useTransactionData(chartType, timeRange, startDateISO, endDateISO);
  const periodLabel = usePeriodLabel(startDate, endDate);
  
  const handleCreateChartGoal = (data: { goal_type: "support" | "resistance"; value: number; label?: string }) => {
    createGoal({
      goal_type: data.goal_type === "resistance" ? "investment_goal" : "spending_limit",
      target_amount: data.value,
      description: data.label || `Meta Visual ${data.goal_type}`,
      display_on_chart: true,
      chart_line_type: data.goal_type,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seu desempenho de {periodLabel}</CardTitle>
      </CardHeader>
      <CardContent className="h-[500px] flex flex-col">
        <div className="flex-1 h-full">
          <InteractiveSmartChart 
            transactions={transactions || []} 
            financialGoals={chartGoals}
            chartType={chartType} 
            timeRange={timeRange} 
            isLoading={isLoading} 
            onCreateChartGoal={handleCreateChartGoal}
          />
        </div>
        <div className="flex justify-center mt-2">
          <TimeRangeSelector 
            timeRange={timeRange} 
            onTimeRangeChange={setTimeRange} 
          />
        </div>
      </CardContent>
    </Card>
  );
}