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
  client_id?: string;
  client?: {
    name: string;
  };
};

export function useInvoicedTransactions(
  userId: string | undefined,
  startDate: Date | undefined,
  endDate: Date | undefined,
  paymentStatusFilter: string = "all",
  descriptionFilter: string = "" // Adicionado parâmetro
) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["invoiced-transactions", userId, startDate, endDate, paymentStatusFilter, descriptionFilter], // Adicionado descriptionFilter na queryKey
    queryFn: async () => {
      if (!userId) return [];

      let query = supabase
        .from("transactions")
        .select(`
          *,
          client:clients(name)
        `)
        .eq("user_id", userId)
        .eq("payment_method", "invoice")
        .order("date", { ascending: false });

      if (startDate) {
        const formattedStartDate = format(startDate, "yyyy-MM-dd'T00:00:00.000Z'");
        query = query.gte("date", formattedStartDate);
      }
      if (endDate) {
        const formattedEndDate = format(endDate, "yyyy-MM-dd'T23:59:59.999Z'");
        query = query.lte("date", formattedEndDate);
      }
      if (paymentStatusFilter !== "all") {
        query = query.eq("payment_status", paymentStatusFilter);
      }
      if (descriptionFilter) {
        query = query.ilike("description", `%${descriptionFilter}%`); // Adicionado filtro de descrição
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

      queryClient.invalidateQueries({ queryKey: ["invoiced-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["expense-chart"] });

      return true;
    } catch (error) {
      console.error("Erro ao confirmar pagamentos:", error);
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