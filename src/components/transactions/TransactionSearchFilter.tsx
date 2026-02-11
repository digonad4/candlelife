
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, LayoutList, Table } from "lucide-react";

interface TransactionSearchFilterProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  viewMode: "list" | "table";
  onToggleViewMode: () => void;
}

export function TransactionSearchFilter({
  searchTerm, onSearchTermChange, viewMode, onToggleViewMode,
}: TransactionSearchFilterProps) {
  return (
    <div className="flex gap-2 items-center">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Pesquisar..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          className="pl-8 h-8 text-xs"
        />
      </div>
      <Button variant="outline" size="sm" onClick={onToggleViewMode} className="h-8 px-2">
        {viewMode === "list" ? <Table className="h-3.5 w-3.5" /> : <LayoutList className="h-3.5 w-3.5" />}
      </Button>
    </div>
  );
}
