import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { startOfDay, endOfDay, startOfWeek, startOfMonth, startOfYear, format } from "date-fns";

interface OHLCData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  accumulated_balance: number;
  transaction_count: number;
}

type TimeRange = "individual" | "daily" | "weekly" | "monthly" | "yearly";

export function useOHLCData(startDate?: Date, endDate?: Date, timeRange: TimeRange = "individual") {
  const { user } = useAuth();

  return useQuery({
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

      // Se for individual, retorna direto os dados diários
      if (timeRange === "individual" || timeRange === "daily") {
        return ohlcData;
      }

      // Agregação por período
      return aggregateByPeriod(ohlcData, timeRange);
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

function aggregateByPeriod(data: OHLCData[], timeRange: TimeRange): OHLCData[] {
  if (data.length === 0) return [];

  const grouped = new Map<string, OHLCData[]>();

  data.forEach(item => {
    const date = new Date(item.date);
    let key: string;

    switch (timeRange) {
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

