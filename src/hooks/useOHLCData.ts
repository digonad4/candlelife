import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { startOfDay, endOfDay } from "date-fns";

interface OHLCData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  accumulated_balance: number;
  transaction_count: number;
}

export function useOHLCData(startDate?: Date, endDate?: Date) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["ohlc-data", user?.id, startDate?.toISOString(), endDate?.toISOString()],
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

      return (data || []) as OHLCData[];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
