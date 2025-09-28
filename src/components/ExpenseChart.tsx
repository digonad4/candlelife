import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GoogleChartWrapperChartType } from "react-google-charts";
import { InteractiveSmartChart } from "./chart/InteractiveSmartChart";
import { useGoals } from "@/hooks/useGoals";
import { useChartGoals } from "@/hooks/useChartGoals";
import { usePeriodLabel } from "./chart/usePeriodLabel";
import { useTransactionData } from "./chart/useTransactionData";
import { TimeRangeSelector } from "./chart/TimeRangeSelector";

interface ExpenseChartProps {
  startDate?: Date;
  endDate?: Date;
}

export function ExpenseChart({ startDate, endDate }: ExpenseChartProps) {
  const { goals } = useGoals();
  const { chartGoals, createChartGoal } = useChartGoals();
  const [chartType] = useState<GoogleChartWrapperChartType>("CandlestickChart");
  const [timeRange, setTimeRange] = useState("individual");

  const startDateISO = startDate ? startDate.toISOString() : undefined;
  const endDateISO = endDate ? endDate.toISOString() : undefined;

  const { data: transactions, isLoading } = useTransactionData(chartType, timeRange, startDateISO, endDateISO);
  const periodLabel = usePeriodLabel(startDate, endDate);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seu desempenho de {periodLabel}</CardTitle>
      </CardHeader>
      <CardContent className="h-[500px] flex flex-col">
        <div className="flex-1 h-full">
          <InteractiveSmartChart 
            transactions={transactions || []} 
            goals={goals}
            chartGoals={chartGoals}
            chartType={chartType} 
            timeRange={timeRange} 
            isLoading={isLoading} 
            onCreateChartGoal={createChartGoal}
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