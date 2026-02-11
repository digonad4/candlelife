
import { useState } from "react";
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

  useRealtimeSubscription({
    tableName: 'transactions',
    onDataChange: () => {
      console.log("📌 Dashboard transaction change detected");
    }
  });

  return (
    <div className="w-full space-y-3 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-foreground">Dashboard</h1>
        <div className="px-2 py-0.5 bg-primary/10 border border-primary/20 rounded-full">
          <span className="text-[10px] font-medium text-primary">Visão Geral</span>
        </div>
      </div>

      <DateFilter 
        dateRange={dateRange} 
        startDate={startDate} 
        endDate={endDate} 
        onDateRangeChange={setDateRange} 
        onStartDateChange={setStartDate} 
        onEndDateChange={setEndDate} 
      />

      <ClientDebtsList />

      <RecentTransactions startDate={startDate} endDate={endDate} />

      <Button 
        size="lg" 
        onClick={() => setIsModalOpen(true)} 
        className={`fixed shadow-lg flex items-center justify-center z-30 rounded-full w-11 h-11 ${
          isMobile 
            ? 'bottom-24 right-3'
            : 'bottom-8 right-4'
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
    </div>
  );
};

export default Dashboard;
