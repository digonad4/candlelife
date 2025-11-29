
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";

interface ConfirmPaymentsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onConfirm: () => void;
}

export function ConfirmPaymentsDialog({
  isOpen,
  onOpenChange,
  selectedCount,
  onConfirm,
}: ConfirmPaymentsDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-full max-w-full sm:max-w-lg bg-card">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base sm:text-lg text-card-foreground">Confirmar Pagamentos</AlertDialogTitle>
          <AlertDialogDescription className="text-sm">
            Deseja confirmar o recebimento dos {selectedCount} pagamento{selectedCount > 1 ? 's' : ''} selecionado{selectedCount > 1 ? 's' : ''}?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="w-full sm:w-auto bg-green-600 text-white hover:bg-green-700">
            Confirmar Pagamentos
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
