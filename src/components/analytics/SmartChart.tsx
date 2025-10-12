import { useMemo, useState } from "react";
import { ProfessionalCandlestickChart } from "@/components/chart/ProfessionalCandlestickChart";
import { ChartGoalModal } from "@/components/chart/ChartGoalModal";
import { FinancialGoal } from "@/hooks/useGoals";
import { useOHLCData } from "@/hooks/useOHLCData";
import { useGoals } from "@/hooks/useGoals";
import { useToast } from "@/hooks/use-toast";

interface SmartChartProps {
  goals: FinancialGoal[];
  startDate?: Date;
  endDate?: Date;
}

export function SmartChart({ goals, startDate, endDate }: SmartChartProps) {
  const { data: ohlcData, isLoading } = useOHLCData(startDate, endDate);
  const { createGoal } = useGoals();
  const { toast } = useToast();
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [clickedValue, setClickedValue] = useState(0);

  const { chartData, chartGoals } = useMemo(() => {
    if (!ohlcData || ohlcData.length === 0) {
      return {
        chartData: [],
        chartGoals: []
      };
    }

    // Dados OHLC já vêm calculados do banco
    const candleData = ohlcData.map(d => ({
      date: d.date,
      open: Number(d.open),
      high: Number(d.high),
      low: Number(d.low),
      close: Number(d.close)
    }));

    const chartGoals = goals
      .filter(goal => goal.display_on_chart)
      .map(goal => ({
        value: goal.target_amount,
        type: (goal.chart_line_type === 'resistance' ? 'resistance' : 'support') as 'support' | 'resistance',
        label: goal.description || `Meta: R$ ${goal.target_amount.toFixed(2)}`,
      }));

    return { chartData: candleData, chartGoals };
  }, [ohlcData, goals]);

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

  const handleClickValue = (value: number) => {
    setClickedValue(value);
    setIsGoalModalOpen(true);
  };

  const handleCreateGoal = (data: { goal_type: "support" | "resistance"; value: number; label?: string }) => {
    createGoal({
      goal_type: "custom_goal",
      target_amount: data.value,
      description: data.label || `Meta de ${data.goal_type === 'support' ? 'Suporte' : 'Resistência'}`,
      display_on_chart: true,
      chart_line_type: data.goal_type,
    });
    
    toast({
      title: "Meta criada com sucesso!",
      description: `Meta de ${data.goal_type === 'support' ? 'suporte' : 'resistência'} adicionada ao gráfico.`,
    });
    
    setIsGoalModalOpen(false);
  };

  return (
    <>
      <div className="relative h-full">
        <ProfessionalCandlestickChart 
          data={chartData}
          goals={chartGoals}
          onClickValue={handleClickValue}
        />
      </div>
      
      <ChartGoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onCreateGoal={handleCreateGoal}
        clickedValue={clickedValue}
      />
    </>
  );
}
