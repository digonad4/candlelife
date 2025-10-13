
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Client } from "@/types/client";

type PaymentMethod = 'pix' | 'cash' | 'invoice';

export function useExpenseForm(onTransactionAdded?: () => void) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [type, setType] = useState<"expense" | "income" | "investment">("expense");
  const [clientId, setClientId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

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
        amount: type === "expense" ? -Math.abs(Number(amount)) : Math.abs(Number(amount)),
        client_id: clientId,
        type,
        user_id: user.id,
        payment_method: paymentMethod,
        payment_status: type === "investment" ? "confirmed" : (type === "expense" ? "confirmed" : "pending"),
        date: new Date().toISOString()
      };

      const { error } = await supabase
        .from("transactions")
        .insert(transactionData);

      if (error) throw error;

      const transactionTypeLabel = {
        expense: "despesa",
        income: "receita", 
        investment: "investimento"
      }[type];

      toast({
        title: "Sucesso",
        description: `${transactionTypeLabel.charAt(0).toUpperCase() + transactionTypeLabel.slice(1)} adicionada com sucesso`,
      });

      onTransactionAdded?.();
      resetForm();
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast({
        title: "Erro",
        description: "Falha ao adicionar transação",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
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
