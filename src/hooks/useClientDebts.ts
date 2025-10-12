import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { subDays } from "date-fns";

interface ClientDebt {
  client_id: string;
  total_debt: number;
  overdue_count: number;
}

export function useClientDebts() {
  const { user } = useAuth();
  const thirtyDaysAgo = subDays(new Date(), 30);

  return useQuery({
    queryKey: ["client-debts", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("transactions")
        .select("client_id, amount")
        .eq("user_id", user.id)
        .eq("type", "income")
        .eq("payment_status", "pending")
        .gte("date", thirtyDaysAgo.toISOString())
        .not("client_id", "is", null);

      if (error) {
        console.error("Error fetching client debts:", error);
        throw error;
      }

      // Aggregate debts by client
      const debtMap = new Map<string, ClientDebt>();
      
      data?.forEach((transaction) => {
        if (transaction.client_id) {
          const existing = debtMap.get(transaction.client_id);
          if (existing) {
            existing.total_debt += Number(transaction.amount);
            existing.overdue_count += 1;
          } else {
            debtMap.set(transaction.client_id, {
              client_id: transaction.client_id,
              total_debt: Number(transaction.amount),
              overdue_count: 1,
            });
          }
        }
      });

      return Array.from(debtMap.values());
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
