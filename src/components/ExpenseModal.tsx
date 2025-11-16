import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExpenseForm } from "@/components/transactions/forms/ExpenseForm";
import { useExpenseForm } from "@/hooks/useExpenseForm";

export function ExpenseModal({
  open,
  onOpenChange,
  onTransactionAdded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTransactionAdded?: () => void;
}) {
  const {
    amount,
    setAmount,
    description, 
    setDescription,
    paymentMethod,
    setPaymentMethod,
    type,
    setType,
    clientId,
    setClientId,
    isLoading,
    clients,
    handleSubmit
  } = useExpenseForm(() => {
    onTransactionAdded?.();
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-xl sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-3xl border-2 border-border/50 shadow-2xl">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50 bg-gradient-to-br from-background to-muted/20">
          <DialogTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Nova Transação
          </DialogTitle>
        </DialogHeader>
        
        <div className="px-6 py-6">
          <ExpenseForm
            amount={amount}
            setAmount={setAmount}
            description={description}
            setDescription={setDescription}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            type={type}
            setType={setType}
            clientId={clientId}
            setClientId={setClientId}
            isLoading={isLoading}
            clients={clients}
            onSubmit={handleSubmit}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
