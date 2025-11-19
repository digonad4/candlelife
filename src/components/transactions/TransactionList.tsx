
import { Transaction } from "@/types/transaction";
import { TransactionItem } from "./TransactionItem";

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
  selectedTransactions: string[];
  onSelectTransaction: (id: string, isPending: boolean) => void;
  onOpenConfirmDialog: (ids: string[]) => void;
}

export function TransactionList({
  transactions,
  isLoading,
  selectedTransactions,
  onSelectTransaction,
  onOpenConfirmDialog,
}: TransactionListProps) {
  if (isLoading) {
    return <p className="text-muted-foreground dark:text-gray-400">Carregando...</p>;
  }

  if (transactions.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8 dark:text-gray-400">
        Nenhuma transação para o período selecionado.
      </p>
    );
  }

  const handleToggleSelection = (id: string) => {
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
      const isPending = transaction.payment_status === "pending" && 
                       transaction.payment_method !== "invoice";
      onSelectTransaction(id, isPending);
    }
  };

  return (
    <div className="space-y-2">
      {transactions.map((transaction) => (
        <TransactionItem
          key={transaction.id}
          transaction={transaction}
          isSelected={selectedTransactions.includes(transaction.id)}
          onToggleSelection={handleToggleSelection}
          onOpenConfirmDialog={onOpenConfirmDialog}
          showSelection={true}
        />
      ))}
    </div>
  );
}
