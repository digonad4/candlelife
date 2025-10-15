
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useFinancialData } from "@/hooks/useFinancialData";
import { 
  TrendingDown, 
  TrendingUp, 
  CheckCircle, 
  Lightbulb,
  PiggyBank
} from "lucide-react";
import { subMonths, format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

const formatCurrency = (value: number) =>
  `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function EnhancedFinancialInsights() {
  const { data: transactions = [], isLoading } = useFinancialData();
  
  const currentDate = useMemo(() => new Date(), []);

  const insights = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    const currentMonth = startOfMonth(currentDate);
    const currentMonthEnd = endOfMonth(currentDate);
    const lastMonth = startOfMonth(subMonths(currentDate, 1));
    const lastMonthEnd = endOfMonth(subMonths(currentDate, 1));

    const currentMonthTxs = transactions.filter(t => 
      isWithinInterval(parseISO(t.date), { start: currentMonth, end: currentMonthEnd })
    );
    
    const lastMonthTxs = transactions.filter(t => 
      isWithinInterval(parseISO(t.date), { start: lastMonth, end: lastMonthEnd })
    );

    const currentExpenses = currentMonthTxs
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
    const lastExpenses = lastMonthTxs
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
    const currentIncome = currentMonthTxs
      .filter(t => t.type === "income" && t.payment_status === "confirmed")
      .reduce((sum, t) => sum + t.amount, 0);

    const currentInvestments = currentMonthTxs
      .filter(t => t.type === "investment")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalInvestments = transactions
      .filter(t => t.type === "investment")
      .reduce((sum, t) => sum + t.amount, 0);

    const insights: any[] = [];

    // Investment-specific insights
    if (currentInvestments > 0) {
      const investmentRate = currentIncome > 0 ? (currentInvestments / currentIncome) : 0;
      if (investmentRate >= 0.2) {
        insights.push({
          type: "investment_excellent",
          title: "Excelente Taxa de Investimento! 📈",
          description: `Você investiu ${Math.round(investmentRate * 100)}% da sua renda este mês (${formatCurrency(currentInvestments)})`,
          action: "Continue investindo consistentemente para atingir suas metas",
          impact: "low",
          icon: <TrendingUp className="h-5 w-5 text-blue-500" />,
        });
      } else if (investmentRate >= 0.1) {
        insights.push({
          type: "investment_good",
          title: "Boa Taxa de Investimento 💰",
          description: `Você investiu ${Math.round(investmentRate * 100)}% da sua renda este mês`,
          action: "Tente aumentar para 20% se possível",
          impact: "medium",
          icon: <TrendingUp className="h-5 w-5 text-blue-500" />,
        });
      }
    }

    if (totalInvestments > 0) {
      insights.push({
        type: "total_investments",
        title: `Patrimônio Acumulado: ${formatCurrency(totalInvestments)}`,
        description: `Você já acumulou um total de ${formatCurrency(totalInvestments)} em investimentos`,
        action: "Continue investindo regularmente para fazer seu dinheiro trabalhar para você",
        impact: "low",
        icon: <PiggyBank className="h-5 w-5 text-blue-500" />,
      });
    }

    // Traditional insights
    if (currentExpenses > lastExpenses * 1.2) {
      const increase = Math.round((currentExpenses / lastExpenses - 1) * 100);
      insights.push({
        type: "expense_increase",
        title: "Aumento de Gastos",
        description: `Seus gastos subiram ${increase}% em relação ao mês passado`,
        action: "Analise onde foi o aumento e considere reduzir para aumentar seus investimentos",
        impact: "high",
        icon: <TrendingUp className="h-5 w-5 text-red-500" />,
      });
    }

    if (currentIncome > 0) {
      const savingsRate = (currentIncome - currentExpenses) / currentIncome;
      const totalAllocationRate = (currentIncome - currentExpenses + currentInvestments) / currentIncome;
      
      if (savingsRate < 0.1 && currentInvestments === 0) {
        insights.push({
          type: "savings_low",
          title: "Taxa de Poupança e Investimento Baixa",
          description: `Você está poupando apenas ${Math.round(savingsRate * 100)}% da sua renda e não fez investimentos`,
          action: "Tente economizar pelo menos 20% da sua renda mensal e destine parte para investimentos",
          impact: "high",
          icon: <PiggyBank className="h-5 w-5 text-red-500" />,
        });
      } else if (totalAllocationRate >= 0.3) {
        insights.push({
          type: "allocation_excellent",
          title: "Excelente Gestão Financeira! 👏",
          description: `Você está poupando/investindo ${Math.round(totalAllocationRate * 100)}% da sua renda`,
          action: "Continue assim! Considere diversificar seus investimentos",
          impact: "low",
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        });
      }
    }

    // Sort by impact
    return insights.sort((a, b) => {
      const impactOrder = { high: 0, medium: 1, low: 2 };
      return impactOrder[a.impact] - impactOrder[b.impact];
    });
  }, [transactions, currentDate]);

  if (isLoading) {
    return (
      <Card className="rounded-xl border-border">
        <CardHeader className="p-6">
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Insights Financeiros
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">Analisando seus dados...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl border-border">
      <CardHeader className="p-6">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Insights Financeiros Inteligentes
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {insights.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <h3 className="font-medium">Tudo sob controle!</h3>
            <p className="text-sm text-muted-foreground">
              Suas finanças estão equilibradas. Continue assim!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, idx) => (
              <Alert
                key={idx}
                className={
                  insight.impact === "high"
                    ? "border-l-4 border-l-red-500"
                    : insight.impact === "medium"
                    ? "border-l-4 border-l-yellow-500"
                    : "border-l-4 border-l-green-500"
                }
              >
                <div className="flex items-start gap-3">
                  {insight.icon}
                  <div className="flex-1">
                    <AlertTitle className="font-semibold">{insight.title}</AlertTitle>
                    <AlertDescription className="mt-1">
                      {insight.description}
                      {insight.action && (
                        <p className="mt-2 font-medium text-primary">{insight.action}</p>
                      )}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
