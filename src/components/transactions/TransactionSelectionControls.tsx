
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface TransactionSelectionControlsProps {
  selectedTransactions: string[];
  hasSelectablePending: boolean;
  isLoading: boolean;
  onSelectAllPending: () => void;
  onClearSelection: () => void;
  onConfirmSelected: () => void;
}

export function TransactionSelectionControls({
  selectedTransactions, hasSelectablePending, isLoading,
  onSelectAllPending, onClearSelection, onConfirmSelected,
}: TransactionSelectionControlsProps) {
  return (
    <div className="flex flex-wrap gap-1.5 mb-2">
      <Button variant="outline" size="sm" onClick={onSelectAllPending}
        disabled={isLoading || !hasSelectablePending} className="h-7 text-[10px] px-2">
        Selecionar Pendentes
      </Button>
      {selectedTransactions.length > 0 && (
        <>
          <Button variant="outline" size="sm" onClick={onClearSelection} className="h-7 text-[10px] px-2">
            <X className="mr-0.5 h-3 w-3" />Limpar
          </Button>
          <Button variant="default" size="sm" onClick={onConfirmSelected} className="h-7 text-[10px] px-2">
            <Check className="mr-0.5 h-3 w-3" />Confirmar ({selectedTransactions.length})
          </Button>
        </>
      )}
    </div>
  );
}
