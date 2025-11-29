
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DailyTransactionsList } from "@/components/transactions/DailyTransactionsList";
import { TransactionActionBar } from "@/components/transactions/TransactionActionBar";
import { Transaction } from "@/types/transaction";

interface TransactionsContentProps {
  days: [string, Transaction[]][];
  isLoading: boolean;
  selectedTransactions: Set<string>;
  searchTerm: string;
  onToggleSelection: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onConfirmPayment: (transaction: Transaction) => void;
  onConfirmSelected: () => void;
  onDeleteSelected: () => void;
}

export function TransactionsContent({
  days,
  isLoading,
  selectedTransactions,
  searchTerm,
  onToggleSelection,
  onSelectAll,
  onDeselectAll,
  onEdit,
  onDelete,
  onConfirmPayment,
  onConfirmSelected,
  onDeleteSelected
}: TransactionsContentProps) {
  return (
    <Card className="w-full max-w-full rounded-xl border-border bg-card overflow-hidden">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="text-card-foreground text-lg sm:text-xl">
          {searchTerm ? "Resultados da Pesquisa" : "Histórico de Transações"}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <TransactionActionBar
          selectedTransactions={selectedTransactions}
          onSelectAll={onSelectAll}
          onDeselectAll={onDeselectAll}
          onConfirmSelected={onConfirmSelected}
          onDeleteSelected={onDeleteSelected}
        />
        
        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">Carregando...</p>
        ) : days.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Nenhuma transação encontrada para o período selecionado.</p>
        ) : (
          <DailyTransactionsList
            days={days}
            selectedTransactions={selectedTransactions}
            isLoading={isLoading}
            onSelectTransaction={onToggleSelection}
            onEdit={onEdit}
            onDelete={onDelete}
            onConfirmPayment={onConfirmPayment}
          />
        )}
      </CardContent>
    </Card>
  );
}
