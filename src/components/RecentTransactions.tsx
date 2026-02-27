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
import { ExpenseModal } from "./ExpenseModal";
import { PullToRefresh } from "./ui/pull-to-refresh";

interface RecentTransactionsProps {
  startDate?: Date;
  endDate?: Date;
}

const RecentTransactions = ({ startDate, endDate }: RecentTransactionsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const { viewMode, toggleViewMode } = useViewMode(user?.id);

  const formattedStartDate = startDate 
    ? format(new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0), "yyyy-MM-dd'T'HH:mm:ss")
    : format(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0), "yyyy-MM-dd'T'HH:mm:ss");
  
  const formattedEndDate = endDate 
    ? format(new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59), "yyyy-MM-dd'T'HH:mm:ss")
    : format(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 23, 59, 59), "yyyy-MM-dd'T'HH:mm:ss");

  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["recent-transactions", user?.id, formattedStartDate, formattedEndDate],
    queryFn: async () => {
      if (!user || !formattedStartDate || !formattedEndDate) return [];
      const { data, error } = await supabase
        .from("transactions")
        .select("*, client:clients(name)")
        .eq("user_id", user.id)
        .gte("date", formattedStartDate)
        .lte("date", formattedEndDate)
        .order("payment_status", { ascending: false })
        .order("date", { ascending: false });
      if (error) throw error;
      return data as Transaction[] || [];
    },
    enabled: !!user && !!formattedStartDate && !!formattedEndDate
  });

  const handleConfirmPayments = async () => {
    if (selectedTransactions.length === 0) return;
    try {
      await supabase.from("transactions").update({ payment_status: "confirmed" })
        .in("id", selectedTransactions).eq("user_id", user?.id || "");
      toast({ title: "Pagamentos Confirmados", description: "Os pagamentos foram atualizados." });
      queryClient.invalidateQueries({ queryKey: ["recent-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["client-debts"] });
      setSelectedTransactions([]);
      setIsConfirmDialogOpen(false);
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao confirmar pagamentos.", variant: "destructive" });
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
    if (selectedTransactions.length > 0 || (ids && ids.length > 0)) {
      setIsConfirmDialogOpen(true);
    }
  };

  const handleSelectAllPending = () => {
    const pendingIds = (transactions || [])
      .filter(t => t.payment_status === "pending" && t.payment_method !== "invoice")
      .map(t => t.id);
    setSelectedTransactions(pendingIds);
  };

  const handleClearSelection = () => setSelectedTransactions([]);

  const filteredTransactions = (transactions || []).filter(transaction => {
    const clientName = transaction.client?.name || "";
    return clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.amount.toString().includes(searchTerm);
  });

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => { setIsEditModalOpen(false); setEditingTransaction(null); };

  const handleTransactionUpdated = () => {
    queryClient.invalidateQueries({ queryKey: ["recent-transactions"] });
    queryClient.invalidateQueries({ queryKey: ["client-debts"] });
  };

  const hasSelectablePending = (transactions || []).some(t => t.payment_status === "pending" && t.payment_method !== "invoice");

  return (
    <Card className="rounded-lg border-border bg-card text-card-foreground">
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-sm font-semibold">Transações</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-3 pt-0">
        <TransactionSearchFilter
          searchTerm={searchTerm} onSearchTermChange={setSearchTerm}
          viewMode={viewMode} onToggleViewMode={toggleViewMode}
        />

        <TransactionSelectionControls
          selectedTransactions={selectedTransactions}
          hasSelectablePending={hasSelectablePending}
          isLoading={isLoading}
          onSelectAllPending={handleSelectAllPending}
          onClearSelection={handleClearSelection}
          onConfirmSelected={() => handleOpenConfirmDialog()}
        />

        <PullToRefresh onRefresh={async () => { queryClient.invalidateQueries({ queryKey: ["recent-transactions"] }); await new Promise(r => setTimeout(r, 500)); }}>
          {viewMode === "list" ? (
            <TransactionList
              transactions={filteredTransactions} isLoading={isLoading}
              selectedTransactions={selectedTransactions}
              onSelectTransaction={handleSelectTransaction}
              onOpenConfirmDialog={handleOpenConfirmDialog}
              onEdit={handleEditTransaction}
            />
          ) : (
            <TransactionTableView
              transactions={filteredTransactions} isLoading={isLoading}
              selectedTransactions={selectedTransactions}
              onSelectTransaction={handleSelectTransaction}
              onOpenConfirmDialog={handleOpenConfirmDialog}
              onEdit={handleEditTransaction}
            />
          )}
        </PullToRefresh>

        <FinancialSummary transactions={filteredTransactions} />
      </CardContent>

      <ConfirmPaymentsDialog
        open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}
        onConfirm={handleConfirmPayments} count={selectedTransactions.length}
      />
      
      <ExpenseModal 
        open={isEditModalOpen} onOpenChange={handleCloseEditModal}
        onTransactionAdded={handleTransactionUpdated} transaction={editingTransaction}
      />
    </Card>
  );
};

export default RecentTransactions;
