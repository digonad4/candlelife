
import { Table } from "@/components/ui/table";
import { Transaction } from "@/types/transaction";
import { TransactionTableHeader } from "./table/TransactionTableHeader";
import { TransactionTableBody } from "./table/TransactionTableBody";
import { useIsMobile } from "@/hooks/use-mobile";

interface TransactionTableViewProps {
  transactions: Transaction[];
  isLoading: boolean;
  selectedTransactions: string[];
  onSelectTransaction: (id: string) => void;
  onOpenConfirmDialog: (ids: string[]) => void;
}

export function TransactionTableView({
  transactions,
  isLoading,
  selectedTransactions,
  onSelectTransaction,
  onOpenConfirmDialog,
}: TransactionTableViewProps) {
  const isMobile = useIsMobile();

  return (
    <div className="w-full max-w-full overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
      <Table className="min-w-full">
        <TransactionTableHeader />
        <TransactionTableBody
          transactions={transactions}
          isLoading={isLoading}
          selectedTransactions={selectedTransactions}
          onSelectTransaction={onSelectTransaction}
          onOpenConfirmDialog={onOpenConfirmDialog}
        />
      </Table>
    </div>
  );
}
