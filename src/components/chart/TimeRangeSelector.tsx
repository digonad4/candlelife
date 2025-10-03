import React from "react";

interface TimeRangeSelectorProps {
  timeRange: "individual" | "daily" | "weekly" | "monthly" | "yearly";
  onTimeRangeChange: (timeRange: "individual" | "daily" | "weekly" | "monthly" | "yearly") => void;
}

export function TimeRangeSelector({ timeRange, onTimeRangeChange }: TimeRangeSelectorProps) {
  const ranges: Array<{ value: "individual" | "daily" | "weekly" | "monthly" | "yearly"; label: string }> = [
    { value: "individual", label: "P" },
    { value: "daily", label: "D" },
    { value: "weekly", label: "S" },
    { value: "monthly", label: "M" },
    { value: "yearly", label: "A" },
  ];

  return (
    <div className="flex space-x-2">
      {ranges.map((range) => (
        <button
          key={range.value}
          onClick={() => onTimeRangeChange(range.value)}
          className={`w-6 h-6 flex items-center justify-center text-xs font-medium rounded border border-gray-300 dark:border-gray-600 transition-colors ${
            timeRange === range.value
              ? "bg-blue-500 text-white dark:bg-blue-700 dark:text-white border-blue-500 dark:border-blue-700"
              : "bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
}