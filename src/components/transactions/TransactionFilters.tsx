
import { useState } from "react";
import { DateFilter } from "@/components/dashboard/DateFilter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TransactionFiltersProps {
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

export function TransactionFilters({
  dateRange,
  startDate,
  endDate,
  searchTerm,
  onDateRangeChange,
  onStartDateChange,
  onEndDateChange,
  onSearchChange,
  onPrintExtract,
}: TransactionFiltersProps) {
  return (
    <div className="w-full space-y-4">
      <DateFilter
        dateRange={dateRange}
        startDate={startDate}
        endDate={endDate}
        onDateRangeChange={onDateRangeChange}
        onStartDateChange={onStartDateChange}
        onEndDateChange={onEndDateChange}
      />
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <Input
          type="text"
          placeholder="Pesquisar transações..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full sm:flex-1"
        />
        <Button onClick={onPrintExtract} className="w-full sm:w-auto whitespace-nowrap">
          Imprimir Extrato
        </Button>
      </div>
    </div>
  );
}
