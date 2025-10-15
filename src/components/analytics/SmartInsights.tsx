import { AlertTriangle, TrendingUp, TrendingDown, Target, Lightbulb, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSmartAlerts } from "@/hooks/useSmartAlerts";
import { Progress } from "@/components/ui/progress";

export function SmartInsights() {
  const { spendingAnalysis, insights, alerts, unreadCount, criticalAlertsCount, markAsRead } = useSmartAlerts();

  if (!spendingAnalysis) {
    return (
      <Card className="rounded-xl border-border">
        <CardHeader className="p-6">
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Insights Inteligentes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-4 text-muted-foreground">
            <p>Carregando análises inteligentes...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      default:
        return <Lightbulb className="h-4 w-4 text-primary" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "warning":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      {/* Financial Health Overview */}
      <Card className="rounded-xl border-border">
        <CardHeader className="p-6">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Saúde Financeira
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                R$ {spendingAnalysis.total_income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-muted-foreground">Receita (30d)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                R$ {spendingAnalysis.total_expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-muted-foreground">Gastos (30d)</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${spendingAnalysis.net_balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {spendingAnalysis.net_balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-muted-foreground">Saldo Líquido</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${spendingAnalysis.savings_rate >= 20 ? 'text-green-600' : spendingAnalysis.savings_rate >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                {spendingAnalysis.savings_rate.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Taxa de Poupança</div>
            </div>
          </div>

          {/* Savings Rate Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Taxa de Poupança Ideal (20%)</span>
              <span>{spendingAnalysis.savings_rate.toFixed(1)}%</span>
            </div>
            <Progress 
              value={Math.min(spendingAnalysis.savings_rate, 100)} 
              className="h-2"
            />
            <div className="text-xs text-muted-foreground">
              {spendingAnalysis.savings_rate >= 20 
                ? "🎉 Excelente! Você está poupando acima do recomendado."
                : `💡 Aumente sua poupança em ${(20 - spendingAnalysis.savings_rate).toFixed(1)}% para atingir o ideal.`
              }
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Spending Categories */}
      {spendingAnalysis.categories && spendingAnalysis.categories.length > 0 && (
        <Card className="rounded-xl border-border">
          <CardHeader className="p-6">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Principais Categorias de Gasto
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {spendingAnalysis.categories.slice(0, 5).map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{category.category}</span>
                      <span className="text-sm text-muted-foreground">
                        {category.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={category.percentage} className="h-2" />
                  </div>
                  <div className="ml-4 text-sm font-medium">
                    R$ {category.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Smart Insights */}
      <Card className="rounded-xl border-border">
        <CardHeader className="p-6">
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Insights Inteligentes
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {unreadCount} novos
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {insights.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
              <p>Tudo parece estar em ordem!</p>
              <p className="text-sm">Continue mantendo seus hábitos financeiros.</p>
            </div>
          ) : (
            insights.map((insight, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getSeverityIcon(insight.severity)}
                    <h4 className="font-medium">{insight.title}</h4>
                    <Badge variant={getSeverityColor(insight.severity) as any}>
                      {insight.severity}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{insight.message}</p>
                {insight.actionable && (
                  <Button variant="outline" size="sm" className="mt-2">
                    Ver Detalhes
                  </Button>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Recent Alerts */}
      {alerts.length > 0 && (
        <Card className="rounded-xl border-border">
          <CardHeader className="p-6">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertas Recentes
              {criticalAlertsCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {criticalAlertsCount} críticos
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            {alerts.slice(0, 5).map((alert) => (
              <div 
                key={alert.id} 
                className={`border rounded-lg p-3 ${!alert.is_read ? 'bg-muted/50' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    {getSeverityIcon(alert.severity)}
                    <div>
                      <h5 className="font-medium text-sm">{alert.title}</h5>
                      <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
                    </div>
                  </div>
                  {!alert.is_read && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => markAsRead(alert.id)}
                    >
                      Marcar lido
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}