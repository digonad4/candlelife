
import { Button } from "@/components/ui/button";
import { CheckCircle2, Trash2, Square, CheckSquare } from "lucide-react";

interface TransactionActionsProps {
  selectedCount: number;
  hasPendingSelected: boolean;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onConfirmSelected: () => void;
  onDeleteSelected: () => void;
}

export function TransactionActions({
  selectedCount,
  hasPendingSelected,
  onSelectAll,
  onDeselectAll,
  onConfirmSelected,
  onDeleteSelected
}: TransactionActionsProps) {
  return (
    <div className="w-full p-3 sm:p-4 bg-muted/50 rounded-lg border space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <span className="text-sm font-medium whitespace-nowrap">
          {selectedCount} selecionada{selectedCount > 1 ? 's' : ''}
        </span>
        
        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={onSelectAll}
            className="flex-1 sm:flex-none"
          >
            <CheckSquare className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Selecionar todas</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onDeselectAll}
            className="flex-1 sm:flex-none"
          >
            <Square className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Desmarcar</span>
          </Button>
          
          {hasPendingSelected && (
            <Button
              variant="default"
              size="sm"
              onClick={onConfirmSelected}
              className="flex-1 sm:flex-none"
            >
              <CheckCircle2 className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Confirmar</span>
            </Button>
          )}
          
          <Button
            variant="destructive"
            size="sm"
            onClick={onDeleteSelected}
            className="flex-1 sm:flex-none"
          >
            <Trash2 className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Excluir</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
