import { TradingDashboard } from "@/components/analytics/TradingDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, TrendingUp, Zap, BarChart3, Target, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Analytics() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Analytics Inteligente
              </h1>
              <p className="text-muted-foreground">
                Análise profissional com inteligência artificial para otimizar suas finanças
              </p>
            </div>
          </div>
          <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
            <Sparkles className="h-4 w-4 mr-2" />
            Powered by AI
          </Badge>
        </div>
      </div>

      {/* Main Trading Dashboard */}
      <TradingDashboard />
      
      {/* Future Features Preview */}
      <Card className="trading-card border-l-4 border-l-amber-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
            <Zap className="h-5 w-5" />
            Próximas Funcionalidades IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                  <Brain className="h-5 w-5 text-purple-600" />
                </div>
                <h4 className="font-semibold">🤖 IA Preditiva</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Previsões avançadas baseadas em machine learning dos seus padrões financeiros e tendências de mercado.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                </div>
                <h4 className="font-semibold">📈 Indicadores Técnicos</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                RSI, MACD, Médias Móveis e outros indicadores profissionais aplicados às suas finanças pessoais.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <h4 className="font-semibold">🎯 Metas Automáticas</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Sugestões inteligentes de metas financeiras personalizadas com base no seu perfil de investidor.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                </div>
                <h4 className="font-semibold">📊 Análise de Cenários</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Simulações "e se" para planejamento financeiro avançado com diferentes cenários de mercado.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900">
                  <Zap className="h-5 w-5 text-red-600" />
                </div>
                <h4 className="font-semibold">⚡ Alertas Inteligentes</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Notificações proativas sobre oportunidades de investimento e riscos financeiros.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900">
                  <Brain className="h-5 w-5 text-indigo-600" />
                </div>
                <h4 className="font-semibold">🧠 Coach Financeiro IA</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Assistant pessoal com coaching financeiro personalizado baseado em seus objetivos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}