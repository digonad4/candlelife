import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface ChartGoal {
  id: string;
  user_id: string;
  goal_type: "support" | "resistance";
  value: number;
  label?: string;
  chart_position?: any;
  is_active: boolean;
  alert_triggered: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateChartGoalData {
  goal_type: "support" | "resistance";
  value: number;
  label?: string;
  chart_position?: any;
}

export function useChartGoals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: chartGoals = [], isLoading } = useQuery({
    queryKey: ["chart-goals", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("chart_goals")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as ChartGoal[];
    },
    enabled: !!user,
  });

  const createChartGoal = useMutation({
    mutationFn: async (goalData: CreateChartGoalData) => {
      if (!user) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from("chart_goals")
        .insert({
          ...goalData,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chart-goals"] });
      toast({
        title: "Meta visual criada",
        description: "Sua meta foi adicionada ao gráfico com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar a meta visual.",
        variant: "destructive",
      });
    },
  });

  const updateChartGoal = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ChartGoal> & { id: string }) => {
      const { data, error } = await supabase
        .from("chart_goals")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chart-goals"] });
    },
  });

  const deleteChartGoal = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("chart_goals")
        .update({ is_active: false })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chart-goals"] });
      toast({
        title: "Meta removida",
        description: "A meta visual foi removida do gráfico.",
      });
    },
  });

  const checkGoalAlerts = useMutation({
    mutationFn: async (currentValue: number) => {
      if (!user) return;
      
      const activeGoals = chartGoals.filter(goal => goal.is_active && !goal.alert_triggered);
      
      for (const goal of activeGoals) {
        let shouldAlert = false;
        
        if (goal.goal_type === "support" && currentValue <= goal.value) {
          shouldAlert = true;
        } else if (goal.goal_type === "resistance" && currentValue >= goal.value) {
          shouldAlert = true;
        }
        
        if (shouldAlert) {
          await supabase
            .from("chart_goals")
            .update({ alert_triggered: true })
            .eq("id", goal.id);
          
          // Trigger notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`Meta ${goal.goal_type === 'support' ? 'Suporte' : 'Resistência'} Atingida!`, {
              body: `Valor atual: R$ ${currentValue.toFixed(2)} | Meta: R$ ${goal.value.toFixed(2)}`,
              icon: '/candle-life-icon.png',
            });
          }
        }
      }
    },
  });

  return {
    chartGoals,
    isLoading,
    createChartGoal: createChartGoal.mutate,
    updateChartGoal: updateChartGoal.mutate,
    deleteChartGoal: deleteChartGoal.mutate,
    checkGoalAlerts: checkGoalAlerts.mutate,
    isCreating: createChartGoal.isPending,
    isUpdating: updateChartGoal.isPending,
    isDeleting: deleteChartGoal.isPending,
  };
}