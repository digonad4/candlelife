
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

interface DeleteTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: string | null;
  userId: string | undefined;
  selectedTransactions: Set<string>;
  isBulkDelete: boolean;
}

export function DeleteTransactionDialog({
  open,
  onOpenChange,
  transactionId,
  userId,
  selectedTransactions,
  isBulkDelete,
}: DeleteTransactionDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    if (!userId) return;

    try {
      if (isBulkDelete) {
        // Bulk delete
        const { error } = await supabase
          .from("transactions")
          .delete()
          .in("id", Array.from(selectedTransactions))
          .eq("user_id", userId);
          
        if (error) throw error;
      } else {
        // Single delete
        if (!transactionId) return;
        
        const { error } = await supabase
          .from("transactions")
          .delete()
          .eq("id", transactionId)
          .eq("user_id", userId);
          
        if (error) throw error;
      }

      toast({
        title: "Transação excluída",
        description: isBulkDelete 
          ? `${selectedTransactions.size} transações foram removidas.` 
          : "A transação foi removida com sucesso.",
      });

      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a transação.",
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-card-foreground">Tem certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Isso excluirá permanentemente 
            {isBulkDelete 
              ? ` ${selectedTransactions.size} transação(ões).`
              : " a transação."
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
