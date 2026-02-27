import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { ConfirmPaymentsDialog } from "@/components/invoiced/ConfirmPaymentsDialog";
import { useInvoicedTransactions } from "@/hooks/useInvoicedTransactions";
import { DateFilter } from "@/components/dashboard/DateFilter";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, endOfDay, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowUpIcon, ArrowDownIcon, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";

const InvoicedTransactions = () => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<string>("today");
  const [startDate, setStartDate] = useState<Date>(() => startOfDay(new Date()));
  const [endDate, setEndDate] = useState<Date>(() => endOfDay(new Date()));
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all");
  const [descriptionFilter, setDescriptionFilter] = useState<string>("");
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { transactions, isLoading, confirmPayments } = useInvoicedTransactions(
    user?.id, startDate, endDate, paymentStatusFilter, descriptionFilter
  );

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`transactions-${user.id}`)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "transactions",
        filter: `user_id=eq.${user.id}`,
      }, () => { queryClient.invalidateQueries({ queryKey: ["invoiced-transactions"] }); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient, user]);

  const toggleTransactionSelection = (id: string) => {
    setSelectedTransactions((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleConfirmSelectedPayments = async () => {
    const success = await confirmPayments(selectedTransactions);
    if (success) { setSelectedTransactions([]); setIsConfirmDialogOpen(false); }
  };

  const handleResetFilters = () => {
    setDateRange("today"); setStartDate(startOfDay(new Date()));
    setEndDate(endOfDay(new Date())); setPaymentStatusFilter("all"); setDescriptionFilter("");
  };

  const totalAmount = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;
  const formattedTotal = totalAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="w-full flex flex-col gap-2 max-w-7xl mx-auto h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-foreground">Faturadas</h1>
        {selectedTransactions.length > 0 && (
          <Button size="sm" onClick={() => setIsConfirmDialogOpen(true)} className="bg-green-600 hover:bg-green-700 text-xs h-7">
            Confirmar ({selectedTransactions.length})
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <DateFilter
            dateRange={dateRange} startDate={startDate} endDate={endDate}
            onDateRangeChange={setDateRange}
            onStartDateChange={(date) => date && setStartDate(date)}
            onEndDateChange={(date) => date && setEndDate(date)}
          />
          {(dateRange !== "today" || paymentStatusFilter !== "all" || descriptionFilter !== "") && (
            <Button variant="outline" size="sm" onClick={handleResetFilters} className="text-xs h-7">Limpar</Button>
          )}
        </div>
        <Input
          placeholder="Pesquisar..."
          value={descriptionFilter}
          onChange={(e) => setDescriptionFilter(e.target.value)}
          className="h-8 text-xs"
        />
      </div>

      <Card className="rounded-lg border-border bg-card flex-1 min-h-0">
        <CardContent className="p-3 h-full">
          <PullToRefresh onRefresh={async () => { queryClient.invalidateQueries({ queryKey: ["invoiced-transactions"] }); await new Promise(r => setTimeout(r, 500)); }} className="h-full overflow-auto">
          <div className="space-y-1.5">
            {isLoading ? (
              <p className="text-muted-foreground text-xs py-4 text-center">Carregando...</p>
            ) : (
              transactions?.map((transaction) => (
                <div
                  key={transaction.id}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-lg border-l-2 bg-card hover:bg-accent/50 transition-colors",
                    transaction.type === "income" ? "border-l-green-500" : "border-l-red-500",
                    selectedTransactions.includes(transaction.id) && "bg-accent"
                  )}
                >
                  <Checkbox
                    checked={selectedTransactions.includes(transaction.id)}
                    onCheckedChange={() => toggleTransactionSelection(transaction.id)}
                    disabled={transaction.payment_status === "confirmed"}
                    className="h-3.5 w-3.5"
                  />
                  <div className={cn(
                    "p-1 rounded-full",
                    transaction.type === "income" ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                  )}>
                    {transaction.type === "income" ? <ArrowUpIcon className="w-2.5 h-2.5" /> : <ArrowDownIcon className="w-2.5 h-2.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{transaction.description}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      {transaction.payment_status === "confirmed" ? (
                        <CheckCircle2 className="w-2.5 h-2.5 text-green-500" />
                      ) : (
                        <Clock className="w-2.5 h-2.5 text-yellow-500" />
                      )}
                      <span>{transaction.payment_method}</span>
                      <span>•</span>
                      <span>{format(new Date(transaction.date), "dd/MM", { locale: ptBR })}</span>
                    </div>
                  </div>
                  <p className={cn("text-xs font-semibold", transaction.type === "income" ? "text-green-600" : "text-red-600")}>
                    R$ {Math.abs(transaction.amount).toFixed(2)}
                  </p>
                </div>
              ))
            )}
            {(!transactions || transactions.length === 0) && !isLoading && (
              <p className="text-center text-muted-foreground py-4 text-xs">Nenhuma transação faturada</p>
            )}
            {transactions && transactions.length > 0 && (
              <div className="text-right text-xs font-semibold text-foreground border-t pt-2 mt-2">
                Total: {formattedTotal}
              </div>
            )}
          </div>
          </PullToRefresh>
        </CardContent>
      </Card>

      <ConfirmPaymentsDialog
        isOpen={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}
        selectedCount={selectedTransactions.length} onConfirm={handleConfirmSelectedPayments}
      />
    </div>
  );
};

export default InvoicedTransactions;
