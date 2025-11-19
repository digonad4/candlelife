
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";

interface TransactionSummaryProps {
  totalTransactions?: number;
  totalIncome?: number;
  totalExpenses?: number;
  balance?: number;
  startDate?: Date;
  endDate?: Date;
}

export function TransactionSummary({
  totalTransactions: propsTotalTransactions,
  totalIncome: propsTotalIncome,
  totalExpenses: propsTotalExpenses,
  balance: propsBalance,
  startDate,
  endDate,
}: TransactionSummaryProps) {
  const { user } = useAuth();
  
  // Se os valores não forem passados como props, buscar do backend
  const { data: summaryData } = useQuery({
    queryKey: ["transaction-summary", user?.id, startDate, endDate],
    queryFn: async () => {
      if (!user) return {
        totalTransactions: 0,
        totalIncome: 0,
        totalExpenses: 0,
        totalInvestments: 0,
        balance: 0
      };

      let query = supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id);
      
      if (startDate) {
        query = query.gte("date", format(startDate, "yyyy-MM-dd'T00:00:00.000Z'"));
      }
      if (endDate) {
        query = query.lte("date", format(endDate, "yyyy-MM-dd'T23:59:59.999Z'"));
      }

      const { data, error } = await query;
      if (error) {
        console.error("Erro ao buscar resumo de transações:", error);
        throw error;
      }

      const transactions = data || [];
      const totalTx = transactions.length;
      const income = transactions
        .filter(t => t.type === "income" && t.payment_status === "confirmed")
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const expenses = transactions
        .filter(t => t.type === "expense" && t.payment_status === "confirmed")
        .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

      return {
        totalTransactions: totalTx,
        totalIncome: income,
        totalExpenses: expenses,
        balance: income - expenses
      };
    },
    enabled: !propsTotalTransactions && !propsTotalIncome && !propsTotalExpenses && !propsBalance && !!user,
  });

  // Usar os valores das props se fornecidos, caso contrário usar os valores buscados
  const totalTransactions = propsTotalTransactions ?? summaryData?.totalTransactions ?? 0;
  const totalIncome = propsTotalIncome ?? summaryData?.totalIncome ?? 0;
  const totalExpenses = propsTotalExpenses ?? summaryData?.totalExpenses ?? 0;
  const balance = propsBalance ?? summaryData?.balance ?? 0;

  return (
    <Card className="mb-6 bg-card">
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total de Transações</p>
            <p className="text-2xl font-bold text-foreground">{totalTransactions}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Receitas</p>
            <p className="text-2xl font-bold text-green-600">
              {totalIncome.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Despesas</p>
            <p className="text-2xl font-bold text-red-600">
              {totalExpenses.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Saldo</p>
            <p className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
              {balance.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
