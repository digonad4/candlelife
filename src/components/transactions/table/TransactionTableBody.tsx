
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Transaction } from "@/types/transaction";
import { TransactionTableRow } from "./TransactionTableRow";

interface TransactionTableBodyProps {
  transactions: Transaction[];
  isLoading: boolean;
  selectedTransactions: string[];
  onSelectTransaction: (id: string) => void;
  onOpenConfirmDialog: (ids: string[]) => void;
  onEdit?: (transaction: Transaction) => void;
}

export function TransactionTableBody({
  transactions,
  isLoading,
  selectedTransactions,
  onSelectTransaction,
  onOpenConfirmDialog,
  onEdit
}: TransactionTableBodyProps) {
  if (isLoading) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={8} className="text-center">
            Carregando...
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  if (transactions.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={8} className="text-center">
            Nenhuma transação encontrada
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody>
      {transactions.map((transaction) => (
        <TransactionTableRow
          key={transaction.id}
          transaction={transaction}
          isSelected={selectedTransactions.includes(transaction.id)}
          onSelectTransaction={onSelectTransaction}
          onOpenConfirmDialog={onOpenConfirmDialog}
          onEdit={onEdit}
        />
      ))}
    </TableBody>
  );
}
