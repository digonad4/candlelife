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
      if (!data || data.length === 0) return [];

      // Calcular saldo acumulado e transformar em velas
      let accumulatedBalance = 0;
      const candles: CandleData[] = [];

      for (const transaction of data) {
        const previousBalance = accumulatedBalance;
        
        // Atualizar saldo usando valor absoluto para garantir operação correta
        const absoluteAmount = Math.abs(transaction.amount);
        if (transaction.type === 'income') {
          accumulatedBalance += absoluteAmount;
        } else {
          accumulatedBalance -= absoluteAmount;
        }

        // Criar vela para esta transação
        const open = previousBalance;
        const close = accumulatedBalance;
        const high = Math.max(open, close);
        const low = Math.min(open, close);
        const date = transaction.created_at; // ISO string

        candles.push({
          date,
          open,
          high,
          low,
          close
        });
      }

      return candles;
    },
    enabled: !!user,
    staleTime: 0, // Sempre buscar dados frescos
    refetchOnWindowFocus: true,
  });
}
