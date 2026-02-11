import { useEffect } from "react";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addDays, startOfDay, endOfDay, subDays, subMonths, subYears, isBefore } from "date-fns";

export interface DateFilterProps {
  dateRange: string;
  startDate?: Date;
  endDate?: Date;
  onDateRangeChange: (range: string) => void;
  onStartDateChange: (date?: Date) => void;
  onEndDateChange: (date?: Date) => void;
}

export function DateFilter({
  dateRange, startDate, endDate,
  onDateRangeChange, onStartDateChange, onEndDateChange,
}: DateFilterProps) {
  useEffect(() => {
    if (dateRange !== "custom") {
      const today = new Date();
      switch (dateRange) {
        case "today": onStartDateChange(startOfDay(today)); onEndDateChange(endOfDay(today)); break;
        case "last7days": onStartDateChange(startOfDay(subDays(today, 7))); onEndDateChange(endOfDay(today)); break;
        case "last30days": onStartDateChange(startOfDay(subDays(today, 30))); onEndDateChange(endOfDay(today)); break;
        case "last6months": onStartDateChange(startOfDay(subMonths(today, 6))); onEndDateChange(endOfDay(today)); break;
        case "lastyear": onStartDateChange(startOfDay(subYears(today, 1))); onEndDateChange(endOfDay(today)); break;
      }
    }
  }, [dateRange, onStartDateChange, onEndDateChange]);

  return (
    <div className="flex flex-col sm:flex-row gap-2 mb-2">
      <Select value={dateRange} onValueChange={onDateRangeChange}>
        <SelectTrigger className="w-full sm:w-[160px] h-8 text-xs">
          <SelectValue placeholder="Período" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Hoje</SelectItem>
          <SelectItem value="last7days">7 dias</SelectItem>
          <SelectItem value="last30days">30 dias</SelectItem>
          <SelectItem value="last6months">6 meses</SelectItem>
          <SelectItem value="lastyear">1 ano</SelectItem>
          <SelectItem value="custom">Personalizado</SelectItem>
        </SelectContent>
      </Select>
      {dateRange === "custom" && (
        <div className="flex gap-2">
          <DatePicker
            placeholder="Início"
            selected={startDate}
            onSelect={(date) => {
              if (date && endDate && isBefore(endDate, date)) onEndDateChange(addDays(date, 1));
              onStartDateChange(date);
            }}
            className="w-full sm:w-auto"
          />
          <DatePicker placeholder="Fim" selected={endDate} onSelect={onEndDateChange} className="w-full sm:w-auto" />
        </div>
      )}
    </div>
  );
}
