import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

type Transaction = {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: "income" | "expense";
  payment_method: string;
  payment_status: "pending" | "confirmed";
};

export function useExpenses(
  userId: string | undefined,
  startDate: Date | undefined,
  endDate: Date | undefined,
  paymentStatusFilter: string = "all",
  paymentMethodFilter: string,
  categoryFilter: string,
  p0: number,
  p1: number,
  descriptionFilter: string
) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["expenses", userId, startDate, endDate, paymentStatusFilter, descriptionFilter], // Adicionei descriptionFilter na queryKey
    queryFn: async () => {
      if (!userId) return [];

      let query = supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .eq("type", "expense")
        .order("date", { ascending: false });

      if (startDate) {
        query = query.gte("date", format(startDate, "yyyy-MM-dd'T00:00:00.000Z'"));
      }
      if (endDate) {
        query = query.lte("date", format(endDate, "yyyy-MM-dd'T23:59:59.999Z'"));
      }
      if (paymentStatusFilter !== "all") {
        query = query.eq("payment_status", paymentStatusFilter);
      }
      if (descriptionFilter) {
        query = query.ilike("description", `%${descriptionFilter}%`); // Adicionei filtro de descrição
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as Transaction[]) || [];
    },
    enabled: !!userId,
  });

  const confirmPayments = async (transactionIds: string[]) => {
    if (!userId || transactionIds.length === 0) return false;

    try {
      const { error } = await supabase
        .from("transactions")
        .update({ payment_status: "confirmed" })
        .in("id", transactionIds)
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "Pagamentos confirmados",
        description: "Os pagamentos selecionados foram confirmados com sucesso.",
      });

      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      return true;
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível confirmar os pagamentos.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    transactions,
    isLoading,
    confirmPayments,
  };
}