import { useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useChartGoals } from "@/hooks/useChartGoals";

interface SmartAlert {
  id: string;
  user_id: string;
  alert_type: string;
  title: string;
  message: string;
  severity: "info" | "warning" | "critical";
  goal_id?: string;
  is_read: boolean;
  metadata: any;
  created_at: string;
  expires_at?: string;
}

export function SmartAlertSystem() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { checkGoalAlerts } = useChartGoals();

  // Monitor smart alerts
  const { data: alerts = [] } = useQuery({
    queryKey: ["smart-alerts", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("smart_alerts")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_read", false)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as SmartAlert[];
    },
    enabled: !!user,
    refetchInterval: 30000, // Check every 30 seconds
  });

  // Mark alert as read
  const markAsRead = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from("smart_alerts")
        .update({ is_read: true })
        .eq("id", alertId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["smart-alerts"] });
    },
  });

  // Create smart alert
  const createAlert = useMutation({
    mutationFn: async (alertData: {
      alert_type: string;
      title: string;
      message: string;
      severity: "info" | "warning" | "critical";
      goal_id?: string;
      metadata?: any;
    }) => {
      if (!user) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from("smart_alerts")
        .insert({
          ...alertData,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["smart-alerts"] });
    },
  });

  // Monitor transaction changes for goal alerts
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('transaction_alerts')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'transactions',
        filter: `user_id=eq.${user.id}`
      }, async (payload) => {
        const newTransaction = payload.new as any;
        
        // Calculate accumulated value from all transactions
        const { data: allTransactions } = await supabase
          .from("transactions")
          .select("amount")
          .eq("user_id", user.id)
          .eq("payment_status", "confirmed")
          .order("date", { ascending: true });

        if (allTransactions) {
          const accumulatedValue = allTransactions.reduce((sum, t) => sum + t.amount, 0);
          checkGoalAlerts(accumulatedValue);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, checkGoalAlerts]);

  // Show alert notifications
  useEffect(() => {
    alerts.forEach((alert) => {
      if (alert.severity === "critical" || alert.severity === "warning") {
        toast({
          title: alert.title,
          description: alert.message,
          variant: alert.severity === "critical" ? "destructive" : "default",
        });

        // Show browser notification for critical alerts
        if (alert.severity === "critical" && 'Notification' in window && Notification.permission === 'granted') {
          new Notification(alert.title, {
            body: alert.message,
            icon: '/candle-life-icon.png',
            tag: alert.id,
          });
        }

        // Auto-mark as read after showing
        setTimeout(() => {
          markAsRead.mutate(alert.id);
        }, 5000);
      }
    });
  }, [alerts, toast, markAsRead]);

  // Spending pattern analysis
  const analyzeSpendingPatterns = useCallback(async () => {
    if (!user) return;

    try {
      const { data: analysis } = await supabase
        .rpc('analyze_spending_patterns', {
          p_user_id: user.id,
          p_days: 30
        });

      if (analysis) {
        const savingsRate = typeof analysis === 'object' && analysis && 'savings_rate' in analysis ? 
          (analysis.savings_rate as number) || 0 : 0;
        
        // Alert for low savings rate
        if (savingsRate < 10) {
          createAlert.mutate({
            alert_type: "spending_pattern",
            title: "Taxa de Poupança Baixa",
            message: `Sua taxa de poupança está em ${savingsRate.toFixed(1)}%. Considere revisar seus gastos.`,
            severity: "warning",
            metadata: analysis,
          });
        }
        
        // Alert for high spending categories
        const categories = typeof analysis === 'object' && analysis && 'categories' in analysis ? 
          (analysis.categories as any[]) || [] : [];
        const highSpendingCategory = categories.find((cat: any) => cat.percentage > 40);
        
        if (highSpendingCategory) {
          createAlert.mutate({
            alert_type: "category_alert",
            title: "Categoria de Alto Gasto Detectada",
            message: `${highSpendingCategory.category} representa ${highSpendingCategory.percentage}% dos seus gastos.`,
            severity: "info",
            metadata: { category: highSpendingCategory },
          });
        }
      }
    } catch (error) {
      console.error('Error analyzing spending patterns:', error);
    }
  }, [user, createAlert]);

  // Run analysis weekly
  useEffect(() => {
    if (!user) return;

    // Initial analysis
    analyzeSpendingPatterns();

    // Set up weekly analysis
    const interval = setInterval(analyzeSpendingPatterns, 7 * 24 * 60 * 60 * 1000); // 7 days

    return () => clearInterval(interval);
  }, [user, analyzeSpendingPatterns]);

  return null; // This is a background service component
}