
import { useMemo } from "react";
import { FinancialGoal } from "./useGoals";
import { useFinancialData } from "./useFinancialData";
import { differenceInDays, parseISO } from "date-fns";

export interface GoalProgress {
  goal: FinancialGoal;
  current: number;
  target: number;
  percentage: number;
  status: "on_track" | "warning" | "achieved" | "behind";
  daysRemaining: number;
  monthlyTarget: number;
  projectedCompletion?: string;
}

export function useGoalProgress(goals: FinancialGoal[]) {
  const { data: transactions = [] } = useFinancialData();
  
  return useMemo(() => {
    const today = new Date();

    return goals.map((goal): GoalProgress => {
      const current = goal.current_amount || 0;
      const target = goal.target_amount;
      const percentage = target > 0 ? (current / target) * 100 : 0;
      
      // Calcular dias restantes até a data alvo
      const targetDate = goal.target_date ? parseISO(goal.target_date) : null;
      const daysRemaining = targetDate ? Math.max(0, differenceInDays(targetDate, today)) : 0;
      
      // Calcular meta mensal necessária
      const monthsRemaining = daysRemaining > 0 ? Math.max(1, Math.ceil(daysRemaining / 30)) : 1;
      const remainingAmount = Math.max(0, target - current);
      const monthlyTarget = remainingAmount / monthsRemaining;
      
      // Determinar status baseado no progresso e tempo restante
      let status: GoalProgress["status"];
      if (percentage >= 100) {
        status = "achieved";
      } else if (goal.monthly_contribution && goal.monthly_contribution >= monthlyTarget) {
        status = "on_track";
      } else if (percentage >= 70) {
        status = "on_track";
      } else if (daysRemaining > 0 && daysRemaining < 90) {
        status = "warning";
      } else {
        status = "behind";
      }
      
      // Projeção de conclusão baseada na contribuição mensal
      let projectedCompletion: string | undefined;
      if (goal.monthly_contribution && goal.monthly_contribution > 0 && remainingAmount > 0) {
        const monthsToComplete = Math.ceil(remainingAmount / goal.monthly_contribution);
        const completionDate = new Date();
        completionDate.setMonth(completionDate.getMonth() + monthsToComplete);
        projectedCompletion = completionDate.toISOString().split('T')[0];
      }

      return {
        goal,
        current,
        target,
        percentage: Math.min(percentage, 100),
        status,
        daysRemaining,
        monthlyTarget,
        projectedCompletion,
      };
    });
  }, [goals, transactions]);
}
