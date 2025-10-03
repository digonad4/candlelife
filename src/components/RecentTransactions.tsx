import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { Transaction } from "@/types/transaction";
import { FinancialSummary } from "./transactions/FinancialSummary";
import { TransactionList } from "./transactions/TransactionList";
import { ConfirmPaymentsDialog } from "./transactions/ConfirmPaymentsDialog";
import { TransactionSearchFilter } from "./transactions/TransactionSearchFilter";
import { TransactionSelectionControls } from "./transactions/TransactionSelectionControls";
import { TransactionTableView } from "./transactions/TransactionTableView";
import { useViewMode } from "@/hooks/useViewMode";
interface RecentTransactionsProps {
  startDate?: Date;
  endDate?: Date;
}
const RecentTransactions = ({
  startDate,
  endDate
}: RecentTransactionsProps) => {
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const queryClient = useQueryClient();
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const {
    viewMode,
    toggleViewMode
  } = useViewMode(user?.id);
  const formattedStartDate = startDate ? format(startDate, "yyyy-MM-dd'T00:00:00.000Z'") : format(new Date(), "yyyy-MM-dd'T00:00:00.000Z'");
  const formattedEndDate = endDate ? format(endDate, "yyyy-MM-dd'T23:59:59.999Z'") : format(new Date(), "yyyy-MM-dd'T23:59:59.999Z'");
  const {
    data: transactions,
    isLoading
  } = useQuery<Transaction[]>({
    queryKey: ["recent-transactions", user?.id, formattedStartDate, formattedEndDate],
    queryFn: async () => {
      if (!user || !formattedStartDate || !formattedEndDate) return [];
      const {
        data,
        error
      } = await supabase.from("transactions").select("*, client:clients(name)").eq("user_id", user.id).gte("date", formattedStartDate).lte("date", formattedEndDate).order("payment_status", {
        ascending: false
      }).order("date", {
        ascending: false
      });
      if (error) throw error;
      return data as Transaction[] || [];
    },
    enabled: !!user && !!formattedStartDate && !!formattedEndDate
  });
  const handleConfirmPayments = async () => {
    if (selectedTransactions.length === 0) return;
    try {
      await supabase.from("transactions").update({
        payment_status: "confirmed"
      }).in("id", selectedTransactions).eq("user_id", user?.id || "");
      toast({
        title: "Pagamentos Confirmados",
        description: "Os pagamentos foram atualizados."
      });
      queryClient.invalidateQueries({
        queryKey: ["recent-transactions"]
      });
      setSelectedTransactions([]);
      setIsConfirmDialogOpen(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao confirmar pagamentos.",
        variant: "destructive"
      });
    }
  };
  const handleSelectTransaction = (id: string) => {
    const transaction = filteredTransactions.find(t => t.id === id);
    if (!transaction || transaction.payment_status !== "pending" || transaction.payment_method === "invoice") return;
    setSelectedTransactions(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };
  const handleOpenConfirmDialog = (ids?: string[]) => {
    if (ids) {
      setSelectedTransactions(ids.filter(id => {
        const transaction = transactions?.find(t => t.id === id);
        return transaction?.payment_status === "pending" && transaction?.payment_method !== "invoice";
      }));
    }
    if (selectedTransactions.length > 0 || ids && ids.length > 0) {
      setIsConfirmDialogOpen(true);
    }
  };
  const handleSelectAllPending = () => {
    const pendingNonInvoiced = (transactions || []).filter(t => t.payment_status === "pending" && t.payment_method !== "invoice");
    const pendingIds = pendingNonInvoiced.map(t => t.id);
    setSelectedTransactions(pendingIds);
  };
  const handleClearSelection = () => {
    setSelectedTransactions([]);
  };
  const filteredTransactions = (transactions || []).filter(transaction => {
    const clientName = transaction.client?.name || "";
    return clientName.toLowerCase().includes(searchTerm.toLowerCase()) || transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) || transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) || transaction.amount.toString().includes(searchTerm);
  });

  // Check if there are any pending non-invoiced transactions
  const hasSelectablePending = (transactions || []).some(t => t.payment_status === "pending" && t.payment_method !== "invoice");
  return <Card className="rounded-xl border-border bg-card text-card-foreground">
      <CardHeader>
        <CardTitle>Transações</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 mx-0 px-0 py-[75px]">
        <TransactionSearchFilter searchTerm={searchTerm} onSearchTermChange={setSearchTerm} viewMode={viewMode} onToggleViewMode={toggleViewMode} />

        <div>
          <TransactionSelectionControls selectedTransactions={selectedTransactions} hasSelectablePending={hasSelectablePending} isLoading={isLoading} onSelectAllPending={handleSelectAllPending} onClearSelection={handleClearSelection} onConfirmSelected={() => handleOpenConfirmDialog()} />

          {viewMode === "list" ? <TransactionList transactions={filteredTransactions} isLoading={isLoading} selectedTransactions={selectedTransactions} onSelectTransaction={handleSelectTransaction} onOpenConfirmDialog={handleOpenConfirmDialog} /> : <TransactionTableView transactions={filteredTransactions} isLoading={isLoading} selectedTransactions={selectedTransactions} onSelectTransaction={handleSelectTransaction} onOpenConfirmDialog={handleOpenConfirmDialog} />}
        </div>

        <FinancialSummary transactions={filteredTransactions} />
      </CardContent>

      <ConfirmPaymentsDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen} onConfirm={handleConfirmPayments} count={selectedTransactions.length} />
    </Card>;
};
export default RecentTransactions;