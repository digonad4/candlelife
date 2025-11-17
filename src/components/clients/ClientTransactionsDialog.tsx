import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Transaction } from "@/types/transaction";
import { ConfirmPaymentsDialog } from "@/components/transactions/ConfirmPaymentsDialog";

interface ClientTransactionsDialogProps {
  clientId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClientTransactionsDialog({
  clientId,
  open,
  onOpenChange
}: ClientTransactionsDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [clientName, setClientName] = useState("");

  useEffect(() => {
    if (clientId && user) {
      supabase
        .from("clients")
        .select("name")
        .eq("id", clientId)
        .eq("user_id", user.id)
        .single()
        .then(({ data, error }) => {
          if (!error && data) {
            setClientName(data.name);
          }
        });
    }
  }, [clientId, user]);

  useEffect(() => {
    if (!open) {
      setSelectedTransactions([]);
    }
  }, [open]);

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["client-transactions", user?.id, clientId],
    queryFn: async () => {
      if (!user || !clientId) return [];
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("client_id", clientId || '')
        .eq("user_id", user.id);
      
      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!user && !!clientId && open
  });

  const pendingTransactions = transactions?.filter(t => t.payment_status === "pending") || [];
  const confirmedTransactions = transactions?.filter(t => t.payment_status === "confirmed") || [];

  const pendingTotal = pendingTransactions.reduce((sum, t) => sum + t.amount, 0);
  const confirmedTotal = confirmedTransactions.reduce((sum, t) => sum + t.amount, 0);

  const handleSelectTransaction = (id: string) => {
    setSelectedTransactions(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const pendingIds = pendingTransactions.map(t => t.id);
    setSelectedTransactions(pendingIds);
  };

  const handleDeselectAll = () => {
    setSelectedTransactions([]);
  };

  const handleConfirmPayments = async () => {
    if (selectedTransactions.length === 0 || !user) return;

    try {
      const { error } = await supabase
        .from("transactions")
        .update({ payment_status: "confirmed" })
        .in("id", selectedTransactions)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Pagamentos confirmados",
        description: `${selectedTransactions.length} pagamento(s) confirmado(s) com sucesso`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["client-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["recent-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["expense-chart"] });
      queryClient.invalidateQueries({ queryKey: ["transaction-candles"] });
      queryClient.invalidateQueries({ queryKey: ["ohlc-data"] });
      
      setSelectedTransactions([]);
      setIsConfirmDialogOpen(false);
    } catch (error: unknown) {
      console.error("Error confirming payments:", error);
      toast({
        title: "Erro",
        description: `Falha ao confirmar pagamentos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold mb-2">
              Transações de {clientName}
            </DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="py-10 text-center text-muted-foreground">Carregando transações...</div>
          ) : (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Pagamentos Pendentes ({pendingTransactions.length})</h3>
                  {pendingTransactions.length > 0 && (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleSelectAll}
                      >
                        Selecionar Todos
                      </Button>
                      {selectedTransactions.length > 0 && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleDeselectAll}
                          >
                            Limpar Seleção
                          </Button>
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => setIsConfirmDialogOpen(true)}
                          >
                            <CheckCircle className="mr-1 h-4 w-4" />
                            Confirmar ({selectedTransactions.length})
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {pendingTransactions.length === 0 ? (
                  <div className="py-4 text-center text-muted-foreground border rounded-lg">
                    Nenhuma transação pendente para este cliente.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {pendingTransactions.map(transaction => (
                      <div 
                        key={transaction.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedTransactions.includes(transaction.id)}
                            onCheckedChange={() => handleSelectTransaction(transaction.id)}
                          />
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {transaction.date ? format(new Date(transaction.date), "dd/MM/yyyy", { locale: ptBR }) : ""}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${transaction.amount < 0 ? "text-red-500" : "text-green-500"}`}>
                            R$ {Math.abs(transaction.amount).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div className="mt-4 p-3 bg-muted rounded-lg flex justify-between items-center">
                      <span className="font-semibold text-foreground">Total Pendente:</span>
                      <span className={`font-semibold ${pendingTotal < 0 ? "text-red-500" : "text-green-500"}`}>
                        R$ {Math.abs(pendingTotal).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Pagamentos Confirmados ({confirmedTransactions.length})</h3>
                
                {confirmedTransactions.length === 0 ? (
                  <div className="py-4 text-center text-muted-foreground border rounded-lg">
                    Nenhuma transação confirmada para este cliente.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {confirmedTransactions.map(transaction => (
                      <div 
                        key={transaction.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {transaction.date ? format(new Date(transaction.date), "dd/MM/yyyy", { locale: ptBR }) : ""}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${transaction.amount < 0 ? "text-red-500" : "text-green-500"}`}>
                            R$ {Math.abs(transaction.amount).toFixed(2)}
                          </p>
                          <p className="text-xs text-green-500">Confirmado</p>
                        </div>
                      </div>
                    ))}
                    <div className="mt-4 p-3 bg-muted rounded-lg flex justify-between items-center">
                      <span className="font-semibold text-foreground">Total Confirmado:</span>
                      <span className={`font-semibold ${confirmedTotal < 0 ? "text-red-500" : "text-green-500"}`}>
                        R$ {Math.abs(confirmedTotal).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmPaymentsDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        onConfirm={handleConfirmPayments}
        count={selectedTransactions.length}
      />
    </>
  );
}
