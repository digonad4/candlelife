import { Button } from "@/components/ui/button";
import { Transaction } from "@/types/transaction";
interface TransactionActionBarProps {
  selectedTransactions: Set<string>;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onConfirmSelected: () => void;
  onDeleteSelected: () => void;
}
export function TransactionActionBar({
  selectedTransactions,
  onSelectAll,
  onDeselectAll,
  onConfirmSelected,
  onDeleteSelected
}: TransactionActionBarProps) {
  const hasSelected = selectedTransactions.size > 0;
  
  return (
    <div className="w-full mb-4 p-3 bg-muted/50 rounded-lg">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onSelectAll}
            className="flex-1 sm:flex-none"
          >
            Selecionar Todos
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onDeselectAll} 
            disabled={!hasSelected}
            className="flex-1 sm:flex-none"
          >
            Limpar
          </Button>

          {hasSelected && (
            <span className="text-sm text-muted-foreground w-full sm:w-auto text-center sm:text-left">
              {selectedTransactions.size} selecionada(s)
            </span>
          )}
        </div>

        {hasSelected && (
          <div className="flex flex-wrap items-center gap-2">
            <Button 
              size="sm" 
              onClick={onConfirmSelected}
              className="flex-1 sm:flex-none"
            >
              Confirmar
            </Button>
            
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={onDeleteSelected}
              className="flex-1 sm:flex-none"
            >
              Excluir
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}