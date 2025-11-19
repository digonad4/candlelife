
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
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Transaction } from "@/types/transaction";
import { invalidateAllTransactionQueries } from "@/lib/invalidate-transactions";

interface ConfirmPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
  userId: string | undefined;
  selectedTransactions: Set<string>;
  isBulkConfirm: boolean;
}

export function ConfirmPaymentDialog({
  open,
  onOpenChange,
  transaction,
  userId,
  selectedTransactions,
  isBulkConfirm,
}: ConfirmPaymentDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleConfirm = async () => {
    if (!userId) return;

    try {
      if (isBulkConfirm) {
        // Bulk confirm
        const { error } = await supabase
          .from("transactions")
          .update({ payment_status: "confirmed" })
          .in("id", Array.from(selectedTransactions))
          .eq("user_id", userId);
          
        if (error) throw error;
      } else {
        // Single confirm
        if (!transaction) return;
        
        const { error } = await supabase
          .from("transactions")
          .update({ payment_status: "confirmed" })
          .eq("id", transaction.id)
          .eq("user_id", userId);
          
        if (error) throw error;
      }

      toast({
        title: "Pagamento confirmado",
        description: isBulkConfirm 
          ? `${selectedTransactions.size} transações foram confirmadas.`
          : "O status do pagamento foi atualizado com sucesso.",
      });

      invalidateAllTransactionQueries(queryClient);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível confirmar o pagamento.",
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-card-foreground">
            Confirmar Pagamento{isBulkConfirm ? "s" : ""}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Deseja confirmar o recebimento de
            {isBulkConfirm 
              ? ` ${selectedTransactions.size} pagamento(s)?`
              : " pagamento desta transação?"
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} className="bg-green-600 text-white hover:bg-green-700">
            Confirmar Pagamento{isBulkConfirm ? "s" : ""}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
