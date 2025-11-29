
import { TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUp, ArrowDown, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Transaction } from "@/types/transaction";

interface TransactionTableRowProps {
  transaction: Transaction;
  isSelected: boolean;
  onSelectTransaction: (id: string) => void;
  onOpenConfirmDialog: (ids: string[]) => void;
  onEdit?: (transaction: Transaction) => void;
}

export function TransactionTableRow({
  transaction,
  isSelected,
  onSelectTransaction,
  onOpenConfirmDialog,
  onEdit,
}: TransactionTableRowProps) {
  return (
    <TableRow key={transaction.id}>
      <TableCell>
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelectTransaction(transaction.id)}
          disabled={
            transaction.payment_status !== "pending" || 
            transaction.payment_method === "invoice"
          }
        />
      </TableCell>
      <TableCell>
        {transaction.amount >= 0 ? (
          <ArrowUp className="h-4 w-4 text-green-500" />
        ) : (
          <ArrowDown className="h-4 w-4 text-red-500" />
        )}
      </TableCell>
      <TableCell>{transaction.client?.name || "-"}</TableCell>
      <TableCell>{transaction.description || "-"}</TableCell>
      <TableCell>
        {format(new Date(transaction.date), "dd/MM/yyyy", { 
          locale: ptBR 
        })}
      </TableCell>
      <TableCell>
        {transaction.payment_status === "pending" && 
         transaction.payment_method !== "invoice" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenConfirmDialog([transaction.id])}
          >
            Confirmar
          </Button>
        )}
      </TableCell>
      <TableCell>
        <span
          className={
            transaction.payment_status === "pending"
              ? "text-yellow-500"
              : "text-green-500"
          }
        >
          {transaction.payment_status === "pending" ? "Pendente" : "Confirmado"}
        </span>
      </TableCell>
      <TableCell>
        {transaction.amount.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit?.(transaction)}
            title="Editar transação"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          
          {transaction.payment_status === "pending" && 
           transaction.payment_method !== "invoice" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onOpenConfirmDialog([transaction.id])}
            >
              Confirmar
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
