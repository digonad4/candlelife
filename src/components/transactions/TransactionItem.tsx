
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Transaction } from "@/types/transaction";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, CheckCircle, Clock, TrendingUp, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransactionItemProps {
  transaction: Transaction;
  isSelected?: boolean;
  onToggleSelection?: (id: string) => void;
  onOpenConfirmDialog?: (ids: string[]) => void;
  onEdit?: (transaction: Transaction) => void;
  showSelection?: boolean;
}

export function TransactionItem({
  transaction,
  isSelected = false,
  onToggleSelection,
  onOpenConfirmDialog,
  onEdit,
  showSelection = false,
}: TransactionItemProps) {
  const formatCurrency = (amount: number) =>
    amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "failed":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getAmountColor = (type: string) => {
    switch (type) {
      case "income":
        return "text-green-600";
      case "expense":
        return "text-red-600";
      default:
        return "text-foreground";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "income":
        return "Receita";
      case "expense":
        return "Despesa";
      default:
        return type;
    }
  };

  const canBeSelected = transaction.payment_status === "pending" && 
                       transaction.payment_method !== "invoice";

  return (
    <div 
      className={cn(
        "flex items-center justify-between p-4 border-l-4 rounded-lg bg-card hover:bg-accent/50 transition-colors",
        transaction.type === "income" ? "border-l-green-500" : "border-l-red-500",
        isSelected && "bg-accent"
      )}
    >
      <div className="flex items-center space-x-4 flex-1">
        {showSelection && canBeSelected && (
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelection?.(transaction.id)}
          />
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-medium truncate">
              {transaction.description}
            </p>
            <Badge variant="outline" className="text-xs">
              {getTypeLabel(transaction.type)}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {getPaymentStatusIcon(transaction.payment_status)}
            <span>{transaction.payment_method}</span>
            {transaction.client?.name && (
              <>
                <span>•</span>
                <span>{transaction.client.name}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="text-right">
        <p className={cn("font-semibold", getAmountColor(transaction.type))}>
          {formatCurrency(Math.abs(transaction.amount))}
        </p>
        <p className="text-xs text-muted-foreground">
          {format(new Date(transaction.date), "dd/MM", { locale: ptBR })}
        </p>
      </div>

      <div className="flex gap-2 ml-2">
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
            onClick={() => onOpenConfirmDialog?.([transaction.id])}
          >
            Confirmar
          </Button>
        )}
      </div>
    </div>
  );
}
