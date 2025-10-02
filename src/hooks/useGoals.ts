import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export interface FinancialGoal {
  id: string;
  user_id: string;
  goal_type: "emergency_fund" | "purchase_goal" | "investment_goal" | "custom_goal" | "spending_limit" | "category_budget" | "savings_rate";
  category?: string;
  target_amount: number;
  start_date: string;
  target_date?: string;
  current_amount: number;
  monthly_contribution: number;
  description?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  period_type?: string;
  alert_threshold?: number;
  is_recurring?: boolean;
  priority_level?: number;
  // Novos campos para metas visuais no gráfico
  display_on_chart: boolean;
  chart_line_type?: "support" | "resistance" | "spending_limit";
  chart_line_color?: string;
  alert_enabled: boolean;
  alert_triggered: boolean;
}

export interface CreateGoalData {
  goal_type: FinancialGoal["goal_type"];
  category?: string;
  target_amount: number;
  target_date?: string;
  monthly_contribution?: number;
  description?: string;
  display_on_chart?: boolean;
  chart_line_type?: "support" | "resistance" | "spending_limit";
  chart_line_color?: string;
}

export function useGoals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ["financial-goals", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("financial_goals")
        .select("*")
        .eq("user_id", user.id)
        .eq("active", true)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as any[];
    },
    enabled: !!user,
  });

  // Filtrar apenas metas para exibição no gráfico
  const chartGoals = goals.filter(goal => goal.display_on_chart);

  const createGoal = useMutation({
    mutationFn: async (goalData: CreateGoalData) => {
      if (!user) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from("financial_goals")
        .insert([{
          ...goalData,
          user_id: user.id,
          current_amount: 0,
          start_date: new Date().toISOString().split('T')[0],
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-goals"] });
      toast({
        title: "Meta criada",
        description: "Sua meta financeira foi criada com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar a meta.",
        variant: "destructive",
      });
    },
  });

  const updateGoal = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FinancialGoal> & { id: string }) => {
      const { data, error } = await supabase
        .from("financial_goals")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-goals"] });
      toast({
        title: "Meta atualizada",
        description: "Sua meta foi atualizada com sucesso.",
      });
    },
  });

  const deleteGoal = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("financial_goals")
        .update({ active: false })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-goals"] });
      toast({
        title: "Meta removida",
        description: "A meta foi removida com sucesso.",
      });
    },
  });

  const addContribution = useMutation({
    mutationFn: async ({ goalId, amount, description }: { goalId: string; amount: number; description?: string }) => {
      if (!user) throw new Error("User not authenticated");
      
      // Adicionar contribuição
      const { error: contributionError } = await supabase
        .from("goal_contributions")
        .insert({
          goal_id: goalId,
          user_id: user.id,
          amount,
          description,
        });
      
      if (contributionError) throw contributionError;
      
      // Atualizar o valor atual da meta manualmente
      const { data: currentGoal } = await supabase
        .from("financial_goals")
        .select("current_amount")
        .eq("id", goalId)
        .single();
        
      if (currentGoal) {
        await supabase
          .from("financial_goals")
          .update({ current_amount: (currentGoal.current_amount || 0) + amount })
          .eq("id", goalId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-goals"] });
      toast({
        title: "Contribuição adicionada",
        description: "Sua contribuição foi registrada com sucesso.",
      });
    },
  });

  // Função para verificar alertas de metas visuais (support/resistance)
  const checkGoalAlerts = useMutation({
    mutationFn: async (currentValue: number) => {
      if (!user) return;
      
      const activeChartGoals = chartGoals.filter(goal => 
        goal.alert_enabled && !goal.alert_triggered && goal.chart_line_type
      );
      
      for (const goal of activeChartGoals) {
        let shouldAlert = false;
        let alertMessage = "";
        
        if (goal.chart_line_type === "support" && currentValue <= goal.target_amount) {
          shouldAlert = true;
          alertMessage = `⚠️ Suporte atingido! Valor caiu para R$ ${currentValue.toFixed(2)}`;
        } else if (goal.chart_line_type === "resistance" && currentValue >= goal.target_amount) {
          shouldAlert = true;
          alertMessage = `🎉 Resistência atingida! Valor chegou a R$ ${currentValue.toFixed(2)}`;
        } else if (goal.chart_line_type === "spending_limit" && currentValue <= goal.target_amount) {
          shouldAlert = true;
          alertMessage = `⚠️ Limite de gastos atingido! R$ ${currentValue.toFixed(2)}`;
        }
        
        if (shouldAlert) {
          await supabase
            .from("financial_goals")
            .update({ alert_triggered: true })
            .eq("id", goal.id);
          
          // Trigger notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`Meta ${goal.chart_line_type === 'resistance' ? 'Resistência' : goal.chart_line_type === 'support' ? 'Suporte' : 'Limite'} Atingida!`, {
              body: alertMessage,
              icon: '/candle-life-icon.png',
            });
          }
        }
      }
    },
  });

  return {
    goals,
    chartGoals, // Metas para exibir no gráfico
    isLoading,
    createGoal: createGoal.mutate,
    updateGoal: updateGoal.mutate,
    deleteGoal: deleteGoal.mutate,
    addContribution: addContribution.mutate,
    checkGoalAlerts: checkGoalAlerts.mutate,
    isCreating: createGoal.isPending,
    isUpdating: updateGoal.isPending,
    isDeleting: deleteGoal.isPending,
    isAddingContribution: addContribution.isPending,
  };
}
