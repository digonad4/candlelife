import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface SpendingAnalysis {
  total_income: number;
  total_expenses: number;
  net_balance: number;
  savings_rate: number;
  avg_daily_spending: number;
  categories: Array<{
    category: string;
    total: number;
    percentage: number;
  }>;
}

interface SmartInsight {
  title: string;
  message: string;
  severity: "info" | "warning" | "critical";
  actionable: boolean;
}

interface SmartAlert {
  id: string;
  title: string;
  message: string;
  severity: "info" | "warning" | "critical";
  is_read: boolean;
  created_at: string;
}

export function useSmartAlerts() {
  const { user } = useAuth();

  // Get spending analysis
  const { data: spendingAnalysis } = useQuery<SpendingAnalysis | null>({
    queryKey: ["spending-analysis", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase.rpc("analyze_spending_patterns", {
        p_user_id: user.id,
        p_days: 30,
      });

      if (error) throw error;
      
      // Type the returned data properly
      if (!data) return null;
      
      return {
        total_income: (data as any).total_income || 0,
        total_expenses: (data as any).total_expenses || 0,
        net_balance: (data as any).net_balance || 0,
        savings_rate: (data as any).savings_rate || 0,
        avg_daily_spending: (data as any).avg_daily_spending || 0,
        categories: (data as any).categories || [],
      };
    },
    enabled: !!user,
  });

  // Get smart alerts
  const { data: alerts = [] } = useQuery<SmartAlert[]>({
    queryKey: ["smart-alerts", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("smart_alerts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as SmartAlert[];
    },
    enabled: !!user,
  });

  // Generate insights based on spending analysis
  const insights: SmartInsight[] = [];
  
  if (spendingAnalysis) {
    if (spendingAnalysis.savings_rate < 10) {
      insights.push({
        title: "Taxa de Poupança Baixa",
        message: `Sua taxa de poupança está em ${spendingAnalysis.savings_rate.toFixed(1)}%. Considere revisar seus gastos.`,
        severity: "warning",
        actionable: true,
      });
    }

    const highSpendingCategory = spendingAnalysis.categories?.find(
      (cat) => cat.percentage > 40
    );
    
    if (highSpendingCategory) {
      insights.push({
        title: "Categoria de Alto Gasto",
        message: `${highSpendingCategory.category} representa ${highSpendingCategory.percentage.toFixed(1)}% dos seus gastos.`,
        severity: "info",
        actionable: true,
      });
    }
  }

  const unreadCount = alerts.filter((a) => !a.is_read).length;
  const criticalAlertsCount = alerts.filter(
    (a) => !a.is_read && a.severity === "critical"
  ).length;

  const markAsRead = async (alertId: string) => {
    await supabase
      .from("smart_alerts")
      .update({ is_read: true })
      .eq("id", alertId);
  };

  return {
    spendingAnalysis,
    insights,
    alerts,
    unreadCount,
    criticalAlertsCount,
    markAsRead,
  };
}
