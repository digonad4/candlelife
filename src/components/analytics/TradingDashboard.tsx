import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  DollarSign, 
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Brain,
  Sparkles
} from "lucide-react";
import { SmartChart } from "./SmartChart";
import { useSmartAlerts } from "@/hooks/useSmartAlerts";
import { cn } from "@/lib/utils";

export function TradingDashboard() {
  const { insights, spendingAnalysis, alerts, unreadCount } = useSmartAlerts();

  // Calculate key metrics
  const totalBalance = spendingAnalysis?.net_balance || 0;
  const savingsRate = spendingAnalysis?.savings_rate || 0;
  const monthlyIncome = spendingAnalysis?.total_income || 0;
  const monthlyExpenses = spendingAnalysis?.total_expenses || 0;

  const stats = [
    {
      title: "Saldo Total",
      value: `R$ ${totalBalance.toLocaleString('pt-BR')}`,
      change: totalBalance > 0 ? "+12.5%" : "-3.2%",
      trend: totalBalance > 0 ? "up" : "down",
      icon: DollarSign,
      gradient: "from-emerald-500 to-teal-600"
    },
    {
      title: "Taxa de Poupança",
      value: `${savingsRate.toFixed(1)}%`,
      change: savingsRate > 20 ? "+5.2%" : "-2.1%",
      trend: savingsRate > 20 ? "up" : "down",
      icon: Target,
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      title: "Receitas Mensais",
      value: `R$ ${monthlyIncome.toLocaleString('pt-BR')}`,
      change: "+8.7%",
      trend: "up",
      icon: TrendingUp,
      gradient: "from-green-500 to-emerald-600"
    },
    {
      title: "Gastos Mensais",
      value: `R$ ${monthlyExpenses.toLocaleString('pt-BR')}`,
      change: monthlyExpenses > monthlyIncome ? "+15.3%" : "-4.1%",
      trend: monthlyExpenses > monthlyIncome ? "down" : "up",
      icon: TrendingDown,
      gradient: "from-orange-500 to-red-600"
    }
  ];

  return (
    <div className="space-trading">
      {/* AI Insights Alert */}
      {insights.length > 0 && (
        <Card className="trading-card border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Brain className="h-5 w-5" />
              Análise Inteligente
              <Badge variant="secondary" className="ml-auto">
                <Sparkles className="h-3 w-3 mr-1" />
                AI
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.slice(0, 2).map((insight, index) => (
                <div key={index} className={cn(
                  "p-3 rounded-lg border-l-4",
                  insight.severity === "warning" ? "border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20" :
                  insight.severity === "critical" ? "border-l-red-500 bg-red-50/50 dark:bg-red-950/20" :
                  "border-l-green-500 bg-green-50/50 dark:bg-green-950/20"
                )}>
                  <p className="font-medium text-sm">{insight.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{insight.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="trading-card overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">
                    {stat.value}
                  </p>
                  <div className="flex items-center space-x-1">
                    {stat.trend === "up" ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                    <span className={cn(
                      "text-xs font-medium",
                      stat.trend === "up" ? "text-green-600" : "text-red-600"
                    )}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={cn(
                  "p-3 rounded-full bg-gradient-to-r",
                  stat.gradient
                )}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Professional Chart */}
      <Card className="trading-card">
        <CardHeader className="border-b border-border/20">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Análise Profissional de Trading
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <Activity className="h-3 w-3 mr-1" />
                Gráfico de Desempenho
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[500px] chart-container m-4 rounded-lg overflow-hidden">
            <SmartChart />
          </div>
        </CardContent>
      </Card>

      {/* Quick Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Spending Categories */}
        <Card className="trading-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Categorias de Gastos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {spendingAnalysis?.categories?.slice(0, 5).map((category, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <span className="text-sm font-medium">{category.category}</span>
                <div className="text-right">
                  <span className="text-sm font-bold">R$ {category.total.toLocaleString('pt-BR')}</span>
                  <div className="text-xs text-muted-foreground">{category.percentage}%</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Insights */}
        <Card className="trading-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Resumo Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-center py-8">
              <p className="text-sm text-muted-foreground">
                Acompanhe seus insights financeiros através dos alertas inteligentes acima
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}