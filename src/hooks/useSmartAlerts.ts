import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useMemo } from "react";

export interface SmartAlert {
  id: string;
  user_id: string;
  goal_id?: string;
  alert_type: string;
  title: string;
  message: string;
  severity: "info" | "warning" | "critical";
  is_read: boolean;
  metadata: any;
  created_at: string;
  expires_at?: string;
}

export interface SpendingAnalysis {
  period_days: number;
  total_income: number;
  total_expenses: number;
  net_balance: number;
  avg_daily_spending: number;
  savings_rate: number;
  categories: Array<{
    category: string;
    total: number;
    percentage: number;
  }>;
}

export function useSmartAlerts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch smart alerts
  const { data: alerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ["smart-alerts", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("smart_alerts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as SmartAlert[];
    },
    enabled: !!user,
  });

  // Fetch spending analysis
  const { data: spendingAnalysis, isLoading: analysisLoading } = useQuery({
    queryKey: ["spending-analysis", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .rpc("analyze_spending_patterns", { p_user_id: user.id, p_days: 30 });
      
      if (error) throw error;
      return data as unknown as SpendingAnalysis;
    },
    enabled: !!user,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  // Generate intelligent insights
  const insights = useMemo(() => {
    if (!spendingAnalysis || !alerts) return [];

    const insights: Array<{
      type: string;
      severity: "info" | "warning" | "critical";
      title: string;
      message: string;
      actionable: boolean;
    }> = [];
    
    // Savings rate insights
    if (spendingAnalysis.savings_rate < 10) {
      insights.push({
        type: "savings_rate",
        severity: "warning" as const,
        title: "Taxa de Poupança Baixa",
        message: `Sua taxa de poupança é de ${spendingAnalysis.savings_rate.toFixed(1)}%. Considere reduzir gastos ou aumentar a renda.`,
        actionable: true,
      });
    } else if (spendingAnalysis.savings_rate > 30) {
      insights.push({
        type: "savings_rate",
        severity: "info" as const,
        title: "Excelente Taxa de Poupança!",
        message: `Parabéns! Sua taxa de poupança de ${spendingAnalysis.savings_rate.toFixed(1)}% está excelente.`,
        actionable: false,
      });
    }

    // Spending pattern insights
    if (spendingAnalysis.avg_daily_spending > 0) {
      const projectedMonthly = spendingAnalysis.avg_daily_spending * 30;
      insights.push({
        type: "spending_pattern",
        severity: "info" as const,
        title: "Projeção de Gastos",
        message: `Com base nos últimos 30 dias, você gastará aproximadamente R$ ${projectedMonthly.toFixed(2)} este mês.`,
        actionable: true,
      });
    }

    // Category analysis insights
    const topCategory = spendingAnalysis.categories?.[0];
    if (topCategory && topCategory.percentage > 40) {
      insights.push({
        type: "category_concentration",
        severity: "warning" as const,
        title: "Concentração de Gastos",
        message: `${topCategory.percentage.toFixed(1)}% dos seus gastos estão em "${topCategory.category}". Considere diversificar.`,
        actionable: true,
      });
    }

    return insights;
  }, [spendingAnalysis, alerts]);

  // Mark alert as read
  const markAsRead = useMutation({
    mutationFn: async (alertId: string) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from("smart_alerts")
        .update({ is_read: true })
        .eq("id", alertId)
        .eq("user_id", user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["smart-alerts"] });
    },
    onError: (error) => {
      console.error("Error marking alert as read:", error);
    }
  });

  // Create custom alert
  const createAlert = useMutation({
    mutationFn: async ({ 
      goalId, 
      alertType, 
      title, 
      message, 
      severity = "info",
      metadata = {} 
    }: {
      goalId?: string;
      alertType: string;
      title: string;
      message: string;
      severity?: "info" | "warning" | "critical";
      metadata?: any;
    }) => {
      if (!user) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from("smart_alerts")
        .insert({
          user_id: user.id,
          goal_id: goalId,
          alert_type: alertType,
          title,
          message,
          severity,
          metadata,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["smart-alerts"] });
      toast({
        title: "Alerta criado",
        description: "Seu alerta personalizado foi criado com sucesso.",
      });
    },
  });

  const unreadCount = alerts.filter(alert => !alert.is_read).length;
  const criticalAlertsCount = alerts.filter(alert => alert.severity === "critical" && !alert.is_read).length;

  return {
    alerts,
    spendingAnalysis,
    insights,
    unreadCount,
    criticalAlertsCount,
    isLoading: alertsLoading || analysisLoading,
    markAsRead: markAsRead.mutate,
    createAlert: createAlert.mutate,
    isCreatingAlert: createAlert.isPending,
  };
}