import { Transaction } from "@/types/transaction";
import { TransactionItemRow } from "./TransactionItemRow";

interface DailyTransactionsListProps {
  days: [string, Transaction[]][];
  selectedTransactions: Set<string>;
  isLoading: boolean;
  onSelectTransaction: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onConfirmPayment: (transaction: Transaction) => void;
}

export function DailyTransactionsList({
  days,
  selectedTransactions,
  isLoading,
  onSelectTransaction,
  onEdit,
  onDelete,
  onConfirmPayment,
}: DailyTransactionsListProps) {

  if (isLoading) {
    return <p className="text-muted-foreground">Carregando...</p>;
  }

  if (days.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        Nenhuma transação encontrada
      </p>
    );
  }

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      {days.map(([date, transactions]) => (
        <div key={date} className="w-full space-y-3 sm:space-y-4">
          <h3 className="text-base sm:text-lg font-medium text-foreground border-b pb-2 truncate">{date}</h3>
          {transactions.length > 0 ? (
            <div className="w-full space-y-3 sm:space-y-4">
              {transactions.map((transaction) => (
                <TransactionItemRow
                  key={transaction.id}
                  transaction={transaction}
                  isSelected={selectedTransactions.has(transaction.id)}
                  onSelect={onSelectTransaction}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onConfirmPayment={onConfirmPayment}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm sm:text-base">Nenhuma transação neste dia</p>
          )}
        </div>
      ))}
    </div>
  );
}