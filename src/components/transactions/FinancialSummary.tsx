import { Transaction } from "@/types/transaction";
import { useMemo } from "react";

interface FinancialSummaryProps {
  transactions: Transaction[];
}

export function FinancialSummary({ transactions }: FinancialSummaryProps) {
  const totals = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return {
        totalDinheiroReceita: 0,
        totalPixReceita: 0,
        totalFaturado: 0,
        totalLucros: 0,
        totalGastos: 0,
        totalGastosDinheiro: 0, // Novo
        totalGastosPix: 0,     // Novo
        totalPendentes: 0,
        totalAcumulado: 0,
      };
    }

    const totalDinheiroReceita = transactions
      .filter((t) => t.payment_method === "cash" && t.payment_status === "confirmed" && t.type === "income")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const totalPixReceita = transactions
      .filter((t) => t.payment_method === "pix" && t.payment_status === "confirmed" && t.type === "income")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const totalFaturado = transactions
      .filter((t) => t.payment_method === "invoice" && t.payment_status === "confirmed" && t.type === "income")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const totalLucros = transactions
      .filter((t) => t.type === "income" && t.payment_status === "confirmed")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const totalGastos = transactions
      .filter((t) => t.type === "expense" && t.payment_status === "confirmed")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Novo: Gastos em Dinheiro
    const totalGastosDinheiro = transactions
      .filter((t) => t.payment_method === "cash" && t.payment_status === "confirmed" && t.type === "expense")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Novo: Gastos em Pix
    const totalGastosPix = transactions
      .filter((t) => t.payment_method === "pix" && t.payment_status === "confirmed" && t.type === "expense")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const totalPendentes = transactions
      .filter((t) => t.payment_status === "pending" && t.type === "income")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const totalAcumulado = totalLucros - totalGastos;

    return {
      totalDinheiroReceita,
      totalPixReceita,
      totalFaturado,
      totalLucros,
      totalGastos,
      totalGastosDinheiro,
      totalGastosPix,
      totalPendentes,
      totalAcumulado,
    };
  }, [transactions]);

  return (
    <div className="w-full max-w-full overflow-hidden flex flex-col bg-gradient-to-br from-card to-card/95 border border-border/50 text-card-foreground p-4 sm:p-6 rounded-2xl shadow-lg">
      <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
        Resumo Financeiro
      </h2>

      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Seção Receitas */}
        <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-4 sm:p-5 flex flex-col transition-all hover:shadow-md hover:shadow-green-500/10">
          <h3 className="text-sm sm:text-base font-semibold text-green-600 dark:text-green-400 mb-3 sm:mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Receitas
          </h3>
          <ul className="space-y-3 sm:space-y-4 flex-1">
            <li className="flex justify-between items-center group">
              <span className="text-xs sm:text-sm text-foreground/70">Dinheiro</span>
              <span className="font-bold text-sm sm:text-base text-green-600 dark:text-green-400 transition-all group-hover:scale-105 truncate ml-2">
                R$ {totals.totalDinheiroReceita.toFixed(2)}
              </span>
            </li>
            <li className="flex justify-between items-center group">
              <span className="text-xs sm:text-sm text-foreground/70">Pix</span>
              <span className="font-bold text-sm sm:text-base text-green-600 dark:text-green-400 transition-all group-hover:scale-105 truncate ml-2">
                R$ {totals.totalPixReceita.toFixed(2)}
              </span>
            </li>
            <li className="flex justify-between items-center group">
              <span className="text-xs sm:text-sm text-foreground/70">Faturado</span>
              <span className="font-bold text-sm sm:text-base text-green-600 dark:text-green-400 transition-all group-hover:scale-105 truncate ml-2">
                R$ {totals.totalFaturado.toFixed(2)}
              </span>
            </li>
            <li className="flex justify-between items-center group">
              <span className="text-xs sm:text-sm text-foreground/70">Pendentes</span>
              <span className="font-bold text-sm sm:text-base text-yellow-600 dark:text-yellow-400 transition-all group-hover:scale-105 truncate ml-2">
                R$ {totals.totalPendentes.toFixed(2)}
              </span>
            </li>
            <li className="flex justify-between items-center pt-3 sm:pt-4 mt-3 sm:mt-4 border-t-2 border-green-500/30 group">
              <span className="text-sm sm:text-base font-semibold">Total</span>
              <span className="font-extrabold text-base sm:text-lg text-green-600 dark:text-green-400 transition-all group-hover:scale-110 truncate ml-2">
                R$ {totals.totalLucros.toFixed(2)}
              </span>
            </li>
          </ul>
        </div>

        {/* Seção Gastos */}
        <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-xl p-4 sm:p-5 flex flex-col transition-all hover:shadow-md hover:shadow-red-500/10">
          <h3 className="text-sm sm:text-base font-semibold text-red-600 dark:text-red-400 mb-3 sm:mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            Gastos
          </h3>
          <ul className="space-y-3 sm:space-y-4 flex-1">
            <li className="flex justify-between items-center group">
              <span className="text-xs sm:text-sm text-foreground/70">Dinheiro</span>
              <span className="font-bold text-sm sm:text-base text-red-600 dark:text-red-400 transition-all group-hover:scale-105 truncate ml-2">
                R$ {totals.totalGastosDinheiro.toFixed(2)}
              </span>
            </li>
            <li className="flex justify-between items-center group">
              <span className="text-xs sm:text-sm text-foreground/70">Pix</span>
              <span className="font-bold text-sm sm:text-base text-red-600 dark:text-red-400 transition-all group-hover:scale-105 truncate ml-2">
                R$ {totals.totalGastosPix.toFixed(2)}
              </span>
            </li>
            <li className="flex justify-between items-center pt-3 sm:pt-4 mt-3 sm:mt-4 border-t-2 border-red-500/30 group">
              <span className="text-sm sm:text-base font-semibold">Total</span>
              <span className="font-extrabold text-base sm:text-lg text-red-600 dark:text-red-400 transition-all group-hover:scale-110 truncate ml-2">
                R$ {totals.totalGastos.toFixed(2)}
              </span>
            </li>
          </ul>
        </div>

        {/* Seção Saldo */}
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4 sm:p-5 flex flex-col transition-all hover:shadow-md hover:shadow-primary/10 sm:col-span-2 lg:col-span-1">
          <h3 className="text-sm sm:text-base font-semibold text-primary mb-3 sm:mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            Saldo
          </h3>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 w-full p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-lg border border-primary/20">
              <span className="font-semibold text-base sm:text-lg">Saldo Acumulado</span>
              <span className={`font-extrabold text-xl sm:text-2xl transition-all truncate ${
                totals.totalAcumulado >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                R$ {totals.totalAcumulado.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}