import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { ConfirmPaymentsDialog } from "@/components/invoiced/ConfirmPaymentsDialog";
import { useExpenses } from "@/hooks/useExpenses";
import { DateFilter } from "@/components/dashboard/DateFilter";
import { startOfDay, endOfDay, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowDownIcon, Calendar, CreditCard, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const ExpensesManagement = () => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<string>("today");
  const [startDate, setStartDate] = useState<Date>(() => startOfDay(new Date()));
  const [endDate, setEndDate] = useState<Date>(() => endOfDay(new Date()));
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all");
  const [descriptionFilter, setDescriptionFilter] = useState<string>("");
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  useRealtimeSubscription({
    tableName: 'transactions',
    onDataChange: () => {
      console.log("📢 Expenses transaction change detected");
    }
  });

  const { transactions, isLoading, confirmPayments } = useExpenses(
    user?.id,
    startDate,
    endDate,
    paymentStatusFilter,
    "all",
    "all",
    0,
    10,
    descriptionFilter
  );

  const toggleTransactionSelection = (transactionId: string) => {
    setSelectedTransactions((prev) =>
      prev.includes(transactionId)
        ? prev.filter((id) => id !== transactionId)
        : [...prev, transactionId]
    );
  };

  const handleConfirmSelectedPayments = async () => {
    const success = await confirmPayments(selectedTransactions);
    if (success) {
      setSelectedTransactions([]);
      setIsConfirmDialogOpen(false);
    }
  };

  const handleResetFilters = () => {
    setDateRange("today");
    setStartDate(startOfDay(new Date()));
    setEndDate(endOfDay(new Date()));
    setPaymentStatusFilter("all");
    setDescriptionFilter("");
  };

  const totalAmount = transactions?.reduce((sum, transaction) => sum + transaction.amount, 0) || 0;
  const formattedTotal = totalAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const formattedDateRange =
    startDate && endDate
      ? `${format(startDate, "dd/MM/yyyy")} - ${format(endDate, "dd/MM/yyyy")}`
      : "Selecione um período";

  return (
    <div className="w-full space-y-4 max-w-7xl mx-auto px-3 py-3 sm:px-4 sm:py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Despesas</h1>
        {selectedTransactions.length > 0 && (
          <Button
            size="sm"
            onClick={() => setIsConfirmDialogOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-xs"
          >
            Confirmar ({selectedTransactions.length})
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <DateFilter
            dateRange={dateRange}
            startDate={startDate}
            endDate={endDate}
            onDateRangeChange={setDateRange}
            onStartDateChange={(date) => date && setStartDate(date)}
            onEndDateChange={(date) => date && setEndDate(date)}
          />
          <span className="text-xs text-muted-foreground">{formattedDateRange}</span>
          {(dateRange !== "today" || paymentStatusFilter !== "all" || descriptionFilter !== "") && (
            <Button variant="outline" size="sm" onClick={handleResetFilters} className="text-xs h-8">
              Limpar
            </Button>
          )}
        </div>
        <Input
          placeholder="Pesquisar..."
          value={descriptionFilter}
          onChange={(e) => setDescriptionFilter(e.target.value)}
          className="h-8 text-sm w-full sm:max-w-xs"
        />
      </div>

      <Card className="rounded-lg border-border bg-card">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-medium text-card-foreground">Histórico</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <div className="space-y-2">
            {isLoading ? (
              <p className="text-muted-foreground text-sm">Carregando...</p>
            ) : (
              transactions?.map((transaction) => (
                <div
                  key={transaction.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border-l-2 border-l-red-500 bg-card hover:bg-accent/50 transition-colors",
                    selectedTransactions.includes(transaction.id) && "bg-accent"
                  )}
                >
                  <Checkbox
                    checked={selectedTransactions.includes(transaction.id)}
                    onCheckedChange={() => toggleTransactionSelection(transaction.id)}
                    disabled={transaction.payment_status === "confirmed"}
                  />
                  <div className="p-1.5 rounded-full bg-red-500/20 text-red-500">
                    <ArrowDownIcon className="w-3 h-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{transaction.description}</p>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">Despesa</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                      {transaction.payment_status === "confirmed" ? (
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                      ) : (
                        <Clock className="w-3 h-3 text-yellow-500" />
                      )}
                      <span>{transaction.payment_method}</span>
                      <span>•</span>
                      <span>{format(new Date(transaction.date), "dd/MM", { locale: ptBR })}</span>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-red-600">
                    R$ {Math.abs(transaction.amount).toFixed(2)}
                  </p>
                </div>
              ))
            )}
            {(!transactions || transactions.length === 0) && (
              <p className="text-center text-muted-foreground py-6 text-sm">
                Nenhuma despesa encontrada
              </p>
            )}
            {transactions && transactions.length > 0 && (
              <div className="mt-3 text-right text-sm font-semibold text-foreground border-t pt-3">
                Total: {formattedTotal}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <ConfirmPaymentsDialog
        isOpen={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        selectedCount={selectedTransactions.length}
        onConfirm={handleConfirmSelectedPayments}
      />
      
      <div className="h-16 md:hidden" />
    </div>
  );
};

export default ExpensesManagement;
