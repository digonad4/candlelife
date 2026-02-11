import { Transaction } from "@/types/transaction";
import { useMemo } from "react";

interface FinancialSummaryProps {
  transactions: Transaction[];
}

export function FinancialSummary({ transactions }: FinancialSummaryProps) {
  const totals = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return { totalDinheiroReceita: 0, totalPixReceita: 0, totalFaturado: 0, totalLucros: 0, totalGastos: 0, totalGastosDinheiro: 0, totalGastosPix: 0, totalPendentes: 0, totalAcumulado: 0 };
    }

    const totalDinheiroReceita = transactions.filter(t => t.payment_method === "cash" && t.payment_status === "confirmed" && t.type === "income").reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const totalPixReceita = transactions.filter(t => t.payment_method === "pix" && t.payment_status === "confirmed" && t.type === "income").reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const totalFaturado = transactions.filter(t => t.payment_method === "invoice" && t.payment_status === "confirmed" && t.type === "income").reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const totalLucros = transactions.filter(t => t.type === "income" && t.payment_status === "confirmed").reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const totalGastos = transactions.filter(t => t.type === "expense" && t.payment_status === "confirmed").reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const totalGastosDinheiro = transactions.filter(t => t.payment_method === "cash" && t.payment_status === "confirmed" && t.type === "expense").reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const totalGastosPix = transactions.filter(t => t.payment_method === "pix" && t.payment_status === "confirmed" && t.type === "expense").reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const totalPendentes = transactions.filter(t => t.payment_status === "pending" && t.type === "income").reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return { totalDinheiroReceita, totalPixReceita, totalFaturado, totalLucros, totalGastos, totalGastosDinheiro, totalGastosPix, totalPendentes, totalAcumulado: totalLucros - totalGastos };
  }, [transactions]);

  return (
    <div className="w-full border border-border rounded-lg p-3 space-y-2">
      <h3 className="text-xs font-semibold">Resumo Financeiro</h3>

      <div className="grid grid-cols-3 gap-2">
        {/* Receitas */}
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2">
          <h4 className="text-[10px] font-semibold text-green-500 mb-1.5">Receitas</h4>
          <div className="space-y-1 text-[10px]">
            <div className="flex justify-between"><span className="text-muted-foreground">Dinheiro</span><span className="font-semibold text-green-500">R$ {totals.totalDinheiroReceita.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Pix</span><span className="font-semibold text-green-500">R$ {totals.totalPixReceita.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Faturado</span><span className="font-semibold text-green-500">R$ {totals.totalFaturado.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Pendentes</span><span className="font-semibold text-yellow-500">R$ {totals.totalPendentes.toFixed(2)}</span></div>
            <div className="flex justify-between border-t border-green-500/30 pt-1 mt-1">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-green-500">R$ {totals.totalLucros.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Gastos */}
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2">
          <h4 className="text-[10px] font-semibold text-red-500 mb-1.5">Gastos</h4>
          <div className="space-y-1 text-[10px]">
            <div className="flex justify-between"><span className="text-muted-foreground">Dinheiro</span><span className="font-semibold text-red-500">R$ {totals.totalGastosDinheiro.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Pix</span><span className="font-semibold text-red-500">R$ {totals.totalGastosPix.toFixed(2)}</span></div>
            <div className="flex justify-between border-t border-red-500/30 pt-1 mt-1">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-red-500">R$ {totals.totalGastos.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Saldo */}
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-2 flex flex-col">
          <h4 className="text-[10px] font-semibold text-primary mb-1.5">Saldo</h4>
          <div className="flex-1 flex items-center justify-center">
            <span className={`text-sm font-bold ${totals.totalAcumulado >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              R$ {totals.totalAcumulado.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
