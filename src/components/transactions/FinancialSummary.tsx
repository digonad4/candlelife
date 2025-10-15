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
      .reduce((sum, t) => sum + t.amount, 0);

    const totalPixReceita = transactions
      .filter((t) => t.payment_method === "pix" && t.payment_status === "confirmed" && t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalFaturado = transactions
      .filter((t) => t.payment_method === "invoice" && t.payment_status === "confirmed" && t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalLucros = transactions
      .filter((t) => t.type === "income" && t.payment_status === "confirmed")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalGastos = transactions
      .filter((t) => t.type === "expense" && t.payment_status === "confirmed")
      .reduce((sum, t) => sum + t.amount, 0);

    // Novo: Gastos em Dinheiro
    const totalGastosDinheiro = transactions
      .filter((t) => t.payment_method === "cash" && t.payment_status === "confirmed" && t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    // Novo: Gastos em Pix
    const totalGastosPix = transactions
      .filter((t) => t.payment_method === "pix" && t.payment_status === "confirmed" && t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalPendentes = transactions
      .filter((t) => t.payment_status === "pending" && t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalAcumulado = totalLucros + totalGastos;

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
    <div className="w-full h-full flex flex-col bg-card border border-border text-card-foreground p-6 rounded-xl shadow-sm">
      <h2 className="text-xl font-semibold mb-6">Resumo Financeiro</h2>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Seção Receitas */}
        <div className="bg-muted rounded-lg p-4 flex flex-col">
          <h3 className="text-base font-medium text-muted-foreground mb-4">Receitas</h3>
          <ul className="space-y-4 flex-1">
            <li className="flex justify-between items-center">
              <span>Dinheiro</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                R$ {totals.totalDinheiroReceita.toFixed(2)}
              </span>
            </li>
            <li className="flex justify-between items-center">
              <span>Pix</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                R$ {totals.totalPixReceita.toFixed(2)}
              </span>
            </li>
            <li className="flex justify-between items-center">
              <span>Faturado</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                R$ {totals.totalFaturado.toFixed(2)}
              </span>
            </li>
            <li className="flex justify-between items-center">
              <span>Pendentes</span>
              <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                R$ {totals.totalPendentes.toFixed(2)}
              </span>
            </li>
            <li className="flex justify-between items-center pt-4 border-t border-border">
              <span className="font-medium">Total de Lucros</span>
              <span className="font-semibold text-green-700 dark:text-green-300">
                R$ {totals.totalLucros.toFixed(2)}
              </span>
            </li>
          </ul>
        </div>

        {/* Seção Gastos */}
        <div className="bg-muted rounded-lg p-4 flex flex-col">
          <h3 className="text-base font-medium text-muted-foreground mb-4">Gastos</h3>
          <ul className="space-y-4 flex-1">
            <li className="flex justify-between items-center">
              <span>Dinheiro</span>
              <span className="font-semibold text-red-600 dark:text-red-400">
                R$ {totals.totalGastosDinheiro.toFixed(2)}
              </span>
            </li>
            <li className="flex justify-between items-center">
              <span>Pix</span>
              <span className="font-semibold text-red-600 dark:text-red-400">
                R$ {totals.totalGastosPix.toFixed(2)}
              </span>
            </li>
            <li className="flex justify-between items-center pt-4 border-t border-border">
              <span className="font-medium">Total de Gastos</span>
              <span className="font-semibold text-red-700 dark:text-red-300">
                R$ {totals.totalGastos.toFixed(2)}
              </span>
            </li>
          </ul>
        </div>

        {/* Seção Total Acumulado */}
        <div className="bg-muted rounded-lg p-4 flex flex-col justify-center items-center">
          <h3 className="text-base font-medium text-muted-foreground mb-4">Total</h3>
          <span
            className={`text-3xl font-bold ${
              totals.totalAcumulado >= 0 ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"
            }`}
          >
            R$ {totals.totalAcumulado.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}