import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ExpenseModal } from "@/components/ExpenseModal";
import RecentTransactions from "@/components/RecentTransactions";
import { useQueryClient } from "@tanstack/react-query";
import { subDays } from "date-fns";
import { DateFilter } from "@/components/dashboard/DateFilter";
import { ClientDebtsList } from "@/components/clients/ClientDebtsList";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { FAB } from "@/components/ui/fab";

const Dashboard = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState("today");
  const [startDate, setStartDate] = useState<Date | undefined>(subDays(new Date(), 7));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const queryClient = useQueryClient();

  useRealtimeSubscription({
    tableName: "transactions",
    onDataChange: () => {
      console.log("📌 Dashboard transaction change detected");
    },
  });

  return (
    <div className="w-full flex flex-col gap-3 max-w-7xl mx-auto h-full">
      {!isMobile && (
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-foreground">Dashboard</h1>
          <div className="px-2 py-0.5 bg-primary/10 border border-primary/20 rounded-full">
            <span className="text-[10px] font-medium text-primary">Visão Geral</span>
          </div>
        </div>
      )}

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

      <FAB onClick={() => setIsModalOpen(true)} label="Nova transação" />

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
