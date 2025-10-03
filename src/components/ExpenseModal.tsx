import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExpenseForm } from "@/components/transactions/forms/ExpenseForm";
import { useExpenseForm } from "@/hooks/useExpenseForm";
import { TrendingUp, TrendingDown } from "lucide-react";

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
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl sm:text-2xl font-bold">Nova Transação</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue={type} onValueChange={(value) => setType(value as "income" | "expense")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="income" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Receita</span>
              <span className="sm:hidden">+</span>
            </TabsTrigger>
            <TabsTrigger value="expense" className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              <span className="hidden sm:inline">Despesa</span>
              <span className="sm:hidden">-</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="income" className="mt-0">
            <ExpenseForm
              amount={amount}
              setAmount={setAmount}
              description={description}
              setDescription={setDescription}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              type="income"
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
          </TabsContent>
          
          <TabsContent value="expense" className="mt-0">
            <ExpenseForm
              amount={amount}
              setAmount={setAmount}
              description={description}
              setDescription={setDescription}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              type="expense"
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
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
