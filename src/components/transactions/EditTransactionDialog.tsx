import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Transaction } from "@/types/transaction";
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { invalidateAllTransactionQueries } from "@/lib/invalidate-transactions";

interface EditTransactionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
  userId?: string;
}

export function EditTransactionDialog({
  isOpen,
  onOpenChange,
  transaction,
  userId,
}: EditTransactionDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    description: transaction?.description || "",
    amount: Math.abs(transaction?.amount || 0),
    type: transaction?.type || "expense",
    payment_status: transaction?.payment_status || "pending",
    payment_method: transaction?.payment_method || "cash",
    client_id: transaction?.client_id || null,
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        description: transaction.description || "",
        amount: Math.abs(transaction.amount || 0),
        type: transaction.type || "expense",
        payment_status: transaction.payment_status || "pending",
        payment_method: transaction.payment_method || "cash",
        client_id: transaction.client_id || null,
      });
    }
  }, [transaction]);

  const updateTransaction = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!transaction || !userId) return;

      const { error } = await supabase
        .from("transactions")
        .update({
          description: data.description,
          amount: Math.abs(data.amount),
          type: data.type,
          payment_status: data.payment_status,
          payment_method: data.payment_method,
          client_id: data.client_id || null,
        })
        .eq("id", transaction.id)
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      invalidateAllTransactionQueries(queryClient);
      toast({
        title: "Transação atualizada",
        description: "A transação foi atualizada com sucesso.",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a transação.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateTransaction.mutate(formData);
  };

  if (!transaction) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-xl sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-3xl border-2 border-border/50 shadow-2xl">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50 bg-gradient-to-br from-background to-muted/20">
          <DialogTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Editar Transação
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select
              value={formData.type}
              onValueChange={(value: "expense" | "income") =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Receita</SelectItem>
                <SelectItem value="expense">Despesa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_status">Status de Pagamento</Label>
            <Select value={formData.payment_status} onValueChange={(value) => setFormData({ ...formData, payment_status: value as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="confirmed">Confirmado</SelectItem>
                <SelectItem value="failed">Falhou</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_method">Método de Pagamento</Label>
            <Select value={formData.payment_method} onValueChange={(value) => setFormData({ ...formData, payment_method: value as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Dinheiro</SelectItem>
                <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="transfer">Transferência</SelectItem>
                <SelectItem value="invoice">Boleto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateTransaction.isPending}>
              {updateTransaction.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
