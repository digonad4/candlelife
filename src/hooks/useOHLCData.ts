import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { startOfDay, endOfDay, startOfWeek, startOfMonth, startOfYear, format } from "date-fns";
import { useEffect } from "react";

interface OHLCData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  accumulated_balance: number;
  transaction_count: number;
}

export type TimeRange = "individual" | "daily" | "weekly" | "monthly" | "yearly";

export function useOHLCData(startDate?: Date, endDate?: Date, timeRange: TimeRange = "individual") {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Realtime subscription para atualizar automaticamente
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`ohlc_updates_${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'transactions',
        filter: `user_id=eq.${user.id}`
      }, () => {
        console.log('📊 Transaction change detected, invalidating OHLC data');
        queryClient.invalidateQueries({ queryKey: ["ohlc-data"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  const refreshOHLC = useMutation({
    mutationFn: async () => {
      if (!user) return;
      
      const { error } = await supabase.rpc('refresh_user_ohlc', {
        p_user_id: user.id
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ohlc-data"] });
    }
  });

  const query = useQuery({
    queryKey: ["ohlc-data", user?.id, startDate?.toISOString(), endDate?.toISOString(), timeRange],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from("ohlc_data")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: true });

      if (startDate) {
        query = query.gte("date", startOfDay(startDate).toISOString().split('T')[0]);
      }

      if (endDate) {
        query = query.lte("date", endOfDay(endDate).toISOString().split('T')[0]);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching OHLC data:", error);
        throw error;
      }

      const ohlcData = (data || []) as OHLCData[];

      // Se for individual, retorna direto sem agregação
      if (timeRange === "individual") {
        return ohlcData;
      }

      // Agregação por período
      return aggregateByPeriod(ohlcData, timeRange);
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Forçar recálculo na mudança de transações
  useEffect(() => {
    if (user && !startDate && !endDate) {
      const lastRefresh = sessionStorage.getItem('ohlc-last-refresh');
      const now = Date.now();
      const shouldRefresh = !lastRefresh || now - parseInt(lastRefresh) > 5000; // 5 segundos
      
      if (shouldRefresh) {
        console.log('🔄 Recalculando dados OHLC...');
        refreshOHLC.mutate();
        sessionStorage.setItem('ohlc-last-refresh', now.toString());
      }
    }
  }, [user?.id, refreshOHLC]);

  return { ...query, refreshOHLC: refreshOHLC.mutate };
}

function aggregateByPeriod(data: OHLCData[], timeRange: TimeRange): OHLCData[] {
  if (data.length === 0) return [];

  const grouped = new Map<string, OHLCData[]>();

  data.forEach(item => {
    const date = new Date(item.date);
    let key: string;

    switch (timeRange) {
      case "daily":
        key = format(startOfDay(date), "yyyy-MM-dd");
        break;
      case "weekly":
        key = format(startOfWeek(date), "yyyy-MM-dd");
        break;
      case "monthly":
        key = format(startOfMonth(date), "yyyy-MM-dd");
        break;
      case "yearly":
        key = format(startOfYear(date), "yyyy-MM-dd");
        break;
      default:
        key = item.date;
    }

    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(item);
  });

  return Array.from(grouped.entries()).map(([date, items]) => {
    items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return {
      date,
      open: items[0].open,
      high: Math.max(...items.map(i => i.high)),
      low: Math.min(...items.map(i => i.low)),
      close: items[items.length - 1].close,
      accumulated_balance: items[items.length - 1].accumulated_balance,
      transaction_count: items.reduce((sum, i) => sum + i.transaction_count, 0)
    };
  });
}

