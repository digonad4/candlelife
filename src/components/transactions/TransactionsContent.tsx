
import { Card, CardContent } from "@/components/ui/card";
import { DailyTransactionsList } from "@/components/transactions/DailyTransactionsList";
import { TransactionActionBar } from "@/components/transactions/TransactionActionBar";
import { Transaction } from "@/types/transaction";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";

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
  onRefresh?: () => Promise<void>;
}

export function TransactionsContent({
  days, isLoading, selectedTransactions, searchTerm,
  onToggleSelection, onSelectAll, onDeselectAll,
  onEdit, onDelete, onConfirmPayment, onConfirmSelected, onDeleteSelected,
  onRefresh
}: TransactionsContentProps) {
  const defaultRefresh = async () => { await new Promise(r => setTimeout(r, 500)); };

  return (
    <Card className="rounded-lg border-border bg-card overflow-hidden flex-1 min-h-0">
      <CardContent className="p-3 h-full flex flex-col">
        <h3 className="text-sm font-semibold mb-2">
          {searchTerm ? "Resultados" : "Histórico"}
        </h3>
        <TransactionActionBar
          selectedTransactions={selectedTransactions}
          onSelectAll={onSelectAll} onDeselectAll={onDeselectAll}
          onConfirmSelected={onConfirmSelected} onDeleteSelected={onDeleteSelected}
        />
        
        <PullToRefresh onRefresh={onRefresh || defaultRefresh} className="flex-1 min-h-0">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-4 text-xs">Carregando...</p>
          ) : days.length === 0 ? (
            <p className="text-center text-muted-foreground py-4 text-xs">Nenhuma transação encontrada.</p>
          ) : (
            <DailyTransactionsList
              days={days} selectedTransactions={selectedTransactions}
              isLoading={isLoading} onSelectTransaction={onToggleSelection}
              onEdit={onEdit} onDelete={onDelete} onConfirmPayment={onConfirmPayment}
            />
          )}
        </PullToRefresh>
      </CardContent>
    </Card>
  );
}
