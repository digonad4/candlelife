
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ExpenseModal } from "@/components/ExpenseModal";
import RecentTransactions from "@/components/RecentTransactions";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { subDays } from "date-fns";
import { DateFilter } from "@/components/dashboard/DateFilter";
import { ClientDebtsList } from "@/components/clients/ClientDebtsList";
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
    <div className="w-full space-y-4 max-w-7xl mx-auto px-3 py-3 sm:px-4 sm:py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Dashboard</h1>
        <div className="px-2 py-1 bg-primary/10 border border-primary/20 rounded-full">
          <span className="text-xs font-medium text-primary">Visão Geral</span>
        </div>
      </div>

      <div className="w-full max-w-full overflow-hidden">
        <DateFilter 
          dateRange={dateRange} 
          startDate={startDate} 
          endDate={endDate} 
          onDateRangeChange={setDateRange} 
          onStartDateChange={setStartDate} 
          onEndDateChange={setEndDate} 
        />
      </div>

      <ClientDebtsList />

      <RecentTransactions startDate={startDate} endDate={endDate} />

      <Button 
        size="lg" 
        onClick={() => setIsModalOpen(true)} 
        className={`fixed shadow-lg flex items-center justify-center z-30 rounded-full w-11 h-11 md:w-12 md:h-12 ${
          isMobile 
            ? 'bottom-24 right-3'
            : 'bottom-16 right-4'
        }`}
      >
        <Plus className="w-4 h-4" />
      </Button>

      <ExpenseModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        onTransactionAdded={() => {
          queryClient.invalidateQueries({ queryKey: ["recent-transactions"] });
          queryClient.invalidateQueries({ queryKey: ["client-debts"] });
        }} 
      />
      
      <div className="h-16 md:hidden" />
    </div>
  );
};

export default Dashboard;
