
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
    goalId,
    setGoalId,
    isLoading,
    clients,
    goals,
    handleSubmit
  } = useExpenseForm(() => {
    onTransactionAdded?.();
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md sm:max-w-[425px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl sm:text-2xl font-bold">Nova Transação</DialogTitle>
        </DialogHeader>
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
          goalId={goalId}
          setGoalId={setGoalId}
          isLoading={isLoading}
          clients={clients}
          goals={goals}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
