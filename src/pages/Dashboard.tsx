
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ExpenseModal } from "@/components/ExpenseModal";
import RecentTransactions from "@/components/RecentTransactions";
import { ExpenseChart } from "@/components/ExpenseChart";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { subDays } from "date-fns";
import { DateFilter } from "@/components/dashboard/DateFilter";
import { EnhancedFinancialInsights } from "@/components/insights/EnhancedFinancialInsights";
import { SmartInsights } from "@/components/analytics/SmartInsights";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";

const Dashboard = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState("today");
  const [startDate, setStartDate] = useState<Date | undefined>(subDays(new Date(), 7));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const queryClient = useQueryClient();

  // Use centralized realtime subscription
  useRealtimeSubscription({
    tableName: 'transactions',
    onDataChange: () => {
      console.log("📌 Dashboard transaction change detected");
    }
  });

  return (
    <div className="w-full space-y-6 safe-area-top safe-area-bottom">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-xl md:text-2xl font-bold">Resumo Financeiro</h1>
      </div>

      {/* Date selector */}
      <DateFilter 
        dateRange={dateRange} 
        startDate={startDate} 
        endDate={endDate} 
        onDateRangeChange={setDateRange} 
        onStartDateChange={setStartDate} 
        onEndDateChange={setEndDate} 
      />

      {/* Enhanced Financial Insights with Goals */}
      <EnhancedFinancialInsights />

      {/* Smart Insights Preview */}
      <div className="grid gap-6">
        <SmartInsights />
      </div>

      {/* Chart */}
      <div className="w-full">
        <ExpenseChart startDate={startDate} endDate={endDate} />
      </div>

      {/* Transactions and values */}
      <RecentTransactions startDate={startDate} endDate={endDate} />

      <ExpenseModal
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        onTransactionAdded={() => {
          console.log("📌 Nova transação adicionada. Invalidando cache...");
          queryClient.invalidateQueries({
            queryKey: ["recent-transactions"]
          });
          queryClient.invalidateQueries({
            queryKey: ["expense-chart"]
          });
          queryClient.invalidateQueries({
            queryKey: ["financial-insights"]
          });
          queryClient.invalidateQueries({
            queryKey: ["financial-goals"]
          });
        }} 
      />
    </div>
  );
};

export default Dashboard;
