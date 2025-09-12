import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export interface FinancialGoal {
  id: string;
  user_id: string;
  goal_type: "emergency_fund" | "purchase_goal" | "investment_goal" | "custom_goal" | "spending_limit" | "category_budget" | "savings_rate";
  category?: string;
  amount: number;
  period: "monthly" | "yearly";
  start_date: string;
  end_date?: string;
  target_date?: string;
  current_amount: number;
  monthly_contribution: number;
  description?: string;
  goal_icon: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  goal_category?: string;
  period_type?: string;
  alert_threshold?: number;
  is_recurring?: boolean;
  priority_level?: number;
}

export interface CreateGoalData {
  goal_type: FinancialGoal["goal_type"];
  category?: string;
  amount: number;
  target_date?: string;
  monthly_contribution?: number;
  description?: string;
  goal_icon?: string;
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
      return data as FinancialGoal[];
    },
    enabled: !!user,
  });

  const createGoal = useMutation({
    mutationFn: async (goalData: CreateGoalData) => {
      if (!user) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from("financial_goals")
        .insert({
          ...goalData,
          user_id: user.id,
          current_amount: 0,
          period: "monthly", // Mantendo para compatibilidade
          start_date: new Date().toISOString().split('T')[0],
        })
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

  return {
    goals,
    isLoading,
    createGoal: createGoal.mutate,
    updateGoal: updateGoal.mutate,
    deleteGoal: deleteGoal.mutate,
    addContribution: addContribution.mutate,
    isCreating: createGoal.isPending,
    isUpdating: updateGoal.isPending,
    isDeleting: deleteGoal.isPending,
    isAddingContribution: addContribution.isPending,
  };
}
