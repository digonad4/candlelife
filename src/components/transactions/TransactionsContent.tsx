
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
    <Card className="rounded-xl border-border bg-card w-full">
      <CardHeader>
        <CardTitle className="text-card-foreground">
          {searchTerm ? "Resultados da Pesquisa" : "Histórico de Transações"}
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-auto max-h-[calc(100vh-400px)]">
        <TransactionActionBar
          selectedTransactions={selectedTransactions}
          onSelectAll={onSelectAll}
          onDeselectAll={onDeselectAll}
          onConfirmSelected={onConfirmSelected}
          onDeleteSelected={onDeleteSelected}
        />
        
        {isLoading ? (
          <p className="text-center text-muted-foreground">Carregando...</p>
        ) : days.length === 0 ? (
          <p className="text-muted-foreground">Nenhuma transação encontrada para o período selecionado.</p>
        ) : (
          <DailyTransactionsList
            days={days}
            selectedTransactions={selectedTransactions}
            isLoading={isLoading}
            onSelectTransaction={onToggleSelection}
            onSelectAll={onSelectAll}
            onDeselectAll={onDeselectAll}
            onEdit={onEdit}
            onDelete={onDelete}
            onConfirmPayment={onConfirmPayment}
            onConfirmSelected={onConfirmSelected}
            onDeleteSelected={onDeleteSelected}
          />
        )}
      </CardContent>
    </Card>
  );
}
