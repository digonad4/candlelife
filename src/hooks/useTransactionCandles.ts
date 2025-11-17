import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

interface CandleData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export function useTransactionCandles(startDate?: Date, endDate?: Date) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Realtime subscription para atualizar automaticamente
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`transaction_candles_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('📊 Transaction change detected, updating candles:', payload);
          queryClient.invalidateQueries({ 
            queryKey: ["transaction-candles", user.id] 
          });
          
          // Notificação visual da atualização
          const eventType = payload.eventType;
          if (eventType === 'INSERT') {
            const transaction = payload.new as any;
            const isIncome = transaction.type === 'income';
            console.log(`${isIncome ? '📈' : '📉'} Gráfico LIFE atualizado!`);
          } else if (eventType === 'DELETE') {
            console.log('🗑️ Transação removida do gráfico LIFE');
          } else {
            console.log('📊 Gráfico LIFE atualizado!');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  return useQuery({
    queryKey: ["transaction-candles", user?.id, startDate?.toISOString(), endDate?.toISOString()],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from("transactions")
        .select("id, date, created_at, amount, type, payment_status")
        .eq("user_id", user.id)
        .eq("payment_status", "confirmed")
        .order("created_at", { ascending: true });
      
      if (startDate) {
        query = query.gte("date", startDate.toISOString().split('T')[0]);
      }
      
      if (endDate) {
        query = query.lte("date", endDate.toISOString().split('T')[0]);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Começar com saldo inicial de 1000 LIFE (nascimento)
      let accumulatedBalance = 1000;
      const candles: CandleData[] = [];

      // Adicionar vela inicial representando o "nascimento" da vida financeira
      if (!data || data.length === 0) {
        const now = new Date().toISOString();
        candles.push({
          date: now,
          open: 0,
          high: 1000,
          low: 0,
          close: 1000
        });
        return candles;
      }

      // Vela de nascimento (antes da primeira transação)
      const firstTransactionDate = new Date(data[0].created_at);
      const birthDate = new Date(firstTransactionDate.getTime() - 1000); // 1 segundo antes
      candles.push({
        date: birthDate.toISOString(),
        open: 0,
        high: 1000,
        low: 0,
        close: 1000
      });

      // Processar cada transação
      for (const transaction of data) {
        const previousBalance = accumulatedBalance;
        
        // Atualizar saldo baseado no tipo de transação
        if (transaction.type === 'income') {
          accumulatedBalance += transaction.amount;
        } else {
          accumulatedBalance -= transaction.amount;
        }

        // Garantir que a vela tenha amplitude mínima visível (1% do movimento)
        const movement = Math.abs(accumulatedBalance - previousBalance);
        const minAmplitude = Math.max(movement * 0.01, 0.5);
        
        let high: number;
        let low: number;
        
        if (transaction.type === 'income') {
          // Income: vela verde (sobe)
          high = accumulatedBalance + minAmplitude;
          low = previousBalance - minAmplitude;
        } else {
          // Expense: vela vermelha (desce)
          high = previousBalance + minAmplitude;
          low = accumulatedBalance - minAmplitude;
        }

        candles.push({
          date: transaction.created_at,
          open: previousBalance,
          high,
          low,
          close: accumulatedBalance
        });
      }

      return candles;
    },
    enabled: !!user,
    staleTime: 0, // Sempre buscar dados frescos
    refetchOnWindowFocus: true,
  });
}
