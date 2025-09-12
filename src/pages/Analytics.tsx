import { SmartInsights } from "@/components/analytics/SmartInsights";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, TrendingUp } from "lucide-react";

export default function Analytics() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Brain className="h-8 w-8 text-primary" />
          Analytics Inteligente
        </h1>
        <p className="text-muted-foreground">
          Descubra insights inteligentes sobre sua vida financeira e receba recomendações personalizadas.
        </p>
      </div>

      <div className="grid gap-6">
        <SmartInsights />
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Próximas Funcionalidades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <h4 className="font-medium">🤖 IA Preditiva</h4>
                <p className="text-sm text-muted-foreground">
                  Previsões baseadas em machine learning dos seus padrões financeiros.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">📈 Análise de Cenários</h4>
                <p className="text-sm text-muted-foreground">
                  Simulações "e se" para planejamento financeiro avançado.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">🎯 Metas Automáticas</h4>
                <p className="text-sm text-muted-foreground">
                  Sugestões inteligentes de metas baseadas no seu perfil.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}