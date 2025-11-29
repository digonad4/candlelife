
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Client } from "@/types/client";
import { Transaction } from "@/types/transaction";

type PaymentMethod = 'pix' | 'cash' | 'invoice';

export function useExpenseForm(onTransactionAdded?: () => void, initialTransaction?: Transaction | null) {
  const [transactionId, setTransactionId] = useState<string | null>(initialTransaction?.id || null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [clientId, setClientId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Preencher o formulário quando há transação para editar
  useEffect(() => {
    if (initialTransaction) {
      setTransactionId(initialTransaction.id);
      setAmount(Math.abs(initialTransaction.amount).toString());
      setDescription(initialTransaction.description);
      setPaymentMethod(initialTransaction.payment_method as PaymentMethod);
      setType(initialTransaction.type as "expense" | "income");
      setClientId(initialTransaction.client_id || null);
    }
  }, [initialTransaction]);

  const { data: clients } = useQuery({
    queryKey: ["clients", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("clients")
        .select()
        .eq("user_id", user.id)
        .order("name");
      
      if (error) throw error;
      return data as Client[];
    },
    enabled: !!user
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);

    // Validar se tem cliente selecionado quando o método é faturado
    if (paymentMethod === 'invoice' && !clientId) {
      toast({
        title: "Erro",
        description: "Selecione um cliente para transações faturadas",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const transactionData = {
        description,
        amount: Math.abs(Number(amount)),
        client_id: clientId,
        type,
        payment_method: paymentMethod,
        payment_status: type === "expense" ? "confirmed" : "pending",
      };

      if (transactionId) {
        // Editando transação existente - mantém data e hora originais
        const { error } = await supabase
          .from("transactions")
          .update(transactionData)
          .eq("id", transactionId)
          .eq("user_id", user.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Transação atualizada com sucesso",
        });
      } else {
        // Criando nova transação
        const { error } = await supabase
          .from("transactions")
          .insert({
            ...transactionData,
            user_id: user.id,
            date: new Date().toISOString()
          });

        if (error) throw error;

        const transactionTypeLabel = {
          expense: "despesa",
          income: "receita"
        }[type];

        toast({
          title: "Sucesso",
          description: `${transactionTypeLabel.charAt(0).toUpperCase() + transactionTypeLabel.slice(1)} adicionada com sucesso`,
        });
      }

      onTransactionAdded?.();
      resetForm();
    } catch (error) {
      console.error("Error saving transaction:", error);
      toast({
        title: "Erro",
        description: transactionId ? "Falha ao atualizar transação" : "Falha ao adicionar transação",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTransactionId(null);
    setAmount("");
    setDescription("");
    setPaymentMethod("pix");
    setClientId(null);
    setType("expense");
  };

  return {
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
    handleSubmit,
    resetForm
  };
}
