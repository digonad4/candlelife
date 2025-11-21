
import { TransactionFilters } from "@/components/transactions/TransactionFilters";

interface TransactionsHeaderProps {
  dateRange: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  searchTerm: string;
  onDateRangeChange: (range: string) => void;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  onSearchChange: (term: string) => void;
  onPrintExtract: () => void;
}

export function TransactionsHeader({
  dateRange,
  startDate,
  endDate,
  searchTerm,
  onDateRangeChange,
  onStartDateChange,
  onEndDateChange,
  onSearchChange,
  onPrintExtract
}: TransactionsHeaderProps) {
  return (
    <div className="w-full max-w-full space-y-4">
      <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Transações</h1>
      
      <TransactionFilters
        dateRange={dateRange}
        startDate={startDate}
        endDate={endDate}
        searchTerm={searchTerm}
        onDateRangeChange={onDateRangeChange}
        onStartDateChange={onStartDateChange}
        onEndDateChange={onEndDateChange}
        onSearchChange={onSearchChange}
        onPrintExtract={onPrintExtract}
      />
    </div>
  );
}
