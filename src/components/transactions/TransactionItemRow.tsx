
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowUpIcon, ArrowDownIcon, CheckCircle2, Calendar, CreditCard, Clock, Edit2, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Transaction } from "@/types/transaction";

interface TransactionItemRowProps {
  transaction: Transaction;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onConfirmPayment: (transaction: Transaction) => void;
}

export function TransactionItemRow({
  transaction,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onConfirmPayment,
}: TransactionItemRowProps) {
  return (
    <div className="w-full p-3 sm:p-4 rounded-xl bg-card border border-border hover:bg-accent/50 transition-colors">
      <div className="flex items-start gap-2 sm:gap-3">
        {/* Checkbox */}
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect(transaction.id)}
          className="mt-1 flex-shrink-0 border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
        />
        
        {/* Ícone e Info */}
        <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
          <div className={`p-1.5 sm:p-2 rounded-full flex-shrink-0 ${
            transaction.type === "income" 
              ? "bg-green-500/20 text-green-500" 
              : "bg-red-500/20 text-red-500"
          }`}>
            {transaction.type === "income" ? (
              <ArrowUpIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            ) : (
              <ArrowDownIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            )}
          </div>
          
          <div className="space-y-1.5 sm:space-y-2 flex-1 min-w-0">
            <div>
              <p className="font-medium text-sm sm:text-base text-card-foreground truncate">{transaction.description}</p>
              <p className={`text-base sm:text-lg font-semibold tabular-nums ${
                transaction.type === "income" 
                  ? "text-green-500" 
                  : "text-red-500"
              }`}>
                R$ {Math.abs(transaction.amount).toFixed(2)}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-x-2 sm:gap-x-3 gap-y-1 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-1 whitespace-nowrap">
                <Calendar className="w-3 h-3 flex-shrink-0" />
                <span>{format(new Date(transaction.date), "dd/MM/yyyy", { locale: ptBR })}</span>
              </div>
              <div className="flex items-center gap-1 whitespace-nowrap">
                <CreditCard className="w-3 h-3 flex-shrink-0" />
                <span className="truncate max-w-[80px] sm:max-w-[100px]">{transaction.payment_method}</span>
              </div>
              <div className="flex items-center gap-1 whitespace-nowrap">
                {transaction.payment_status === "confirmed" ? (
                  <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
                ) : (
                  <Clock className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                )}
                <span className={transaction.payment_status === "confirmed" ? "text-green-500" : "text-yellow-500"}>
                  {transaction.payment_status === "confirmed" ? "Confirmado" : "Pendente"}
                </span>
              </div>
              {transaction.client?.name && (
                <div className="flex items-center gap-1 w-full sm:w-auto">
                  <span className="truncate">Cliente: {transaction.client.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Botões de Ação - Agora com melhor responsividade */}
        <div className="flex items-start gap-0.5 sm:gap-1 flex-shrink-0">
          {transaction.payment_status === "pending" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onConfirmPayment(transaction)}
              className="text-yellow-500 hover:text-yellow-600 hover:bg-yellow-500/10 h-7 w-7 sm:h-8 sm:w-8"
              title="Confirmar"
            >
              <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onEdit(transaction)}
            className="hover:bg-accent h-7 w-7 sm:h-8 sm:w-8"
            title="Editar"
          >
            <Edit2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onDelete(transaction.id)}
            className="hover:bg-destructive/10 h-7 w-7 sm:h-8 sm:w-8"
            title="Excluir"
          >
            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-destructive" />
          </Button>
        </div>
      </div>
    </div>
  );
}
