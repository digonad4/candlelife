
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, PiggyBank, ShoppingCart, TrendingUp, Target } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const goalSchema = z.object({
  goal_type: z.enum(["emergency_fund", "purchase_goal", "investment_goal", "custom_goal", "spending_limit", "category_budget", "savings_rate"]),
  target_amount: z.number().min(1, "O valor deve ser maior que R$ 0"),
  target_date: z.string().optional(),
  monthly_contribution: z.number().min(0).optional(),
  description: z.string().optional(),
  display_on_chart: z.boolean().optional(),
  chart_line_type: z.enum(["support", "resistance", "spending_limit"]).optional(),
  alert_threshold: z.number().min(0).max(1).optional(),
});

type GoalFormData = z.infer<typeof goalSchema>;

interface GoalFormProps {
  goal?: any;
  onSubmit: (data: GoalFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const goalTypes = [
  { value: "emergency_fund", label: "Reserva de Emergência", icon: "🛡️", description: "Para momentos difíceis" },
  { value: "purchase_goal", label: "Meta de Compra", icon: "🛒", description: "Para aquela compra especial" },
  { value: "investment_goal", label: "Meta de Investimento", icon: "📈", description: "Para crescer seu patrimônio" },
  { value: "custom_goal", label: "Meta Personalizada", icon: "🎯", description: "Para seus objetivos únicos" },
  { value: "spending_limit", label: "Limite de Gastos", icon: "🚫", description: "Controle seus gastos mensais" },
  { value: "category_budget", label: "Orçamento por Categoria", icon: "📊", description: "Meta específica por categoria" },
  { value: "savings_rate", label: "Taxa de Poupança", icon: "💰", description: "Meta de percentual poupado" },
];

const getIconForType = (type: string) => {
  switch (type) {
    case "emergency_fund": return <PiggyBank className="h-5 w-5" />;
    case "purchase_goal": return <ShoppingCart className="h-5 w-5" />;
    case "investment_goal": return <TrendingUp className="h-5 w-5" />;
    default: return <Target className="h-5 w-5" />;
  }
};

export function GoalForm({ goal, onSubmit, onCancel, isLoading }: GoalFormProps) {
  const [targetDate, setTargetDate] = useState<Date | undefined>(
    goal?.target_date ? new Date(goal.target_date) : undefined
  );
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      goal_type: goal?.goal_type || "custom_goal",
      target_amount: goal?.target_amount || 0,
      monthly_contribution: goal?.monthly_contribution || 0,
      description: goal?.description || "",
      display_on_chart: goal?.display_on_chart || false,
      chart_line_type: goal?.chart_line_type || undefined,
    },
  });

  const selectedType = watch("goal_type");
  const targetAmount = watch("target_amount");
  const monthlyContribution = watch("monthly_contribution");
  const displayOnChart = watch("display_on_chart");

  const handleFormSubmit = (data: GoalFormData) => {
    onSubmit({
      ...data,
      target_date: targetDate?.toISOString().split('T')[0],
    });
  };

  const calculateMonthsToComplete = () => {
    if (targetAmount && monthlyContribution && monthlyContribution > 0) {
      return Math.ceil(targetAmount / monthlyContribution);
    }
    return 0;
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label>Tipo de Meta</Label>
        <Select
          value={selectedType}
          onValueChange={(value) => setValue("goal_type", value as any)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo de meta" />
          </SelectTrigger>
          <SelectContent>
            {goalTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                <div className="flex items-center gap-2">
                  <span>{type.icon}</span>
                  <div>
                    <div className="font-medium">{type.label}</div>
                    <div className="text-xs text-muted-foreground">{type.description}</div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição da Meta</Label>
        <Textarea
          id="description"
          placeholder="Ex: Reserva para emergências de 6 meses..."
          {...register("description")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="target_amount">Valor da Meta (R$)</Label>
          <Input
            id="target_amount"
            type="number"
            step="0.01"
            placeholder="0,00"
            {...register("target_amount", { valueAsNumber: true })}
          />
          {errors.target_amount && (
            <p className="text-sm text-red-500">{errors.target_amount.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="monthly_contribution">Contribuição Mensal (R$)</Label>
          <Input
            id="monthly_contribution"
            type="number"
            step="0.01"
            placeholder="0,00"
            {...register("monthly_contribution", { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Data Alvo (Opcional)</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {targetDate ? (
                format(targetDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
              ) : (
                <span>Selecione uma data</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={targetDate}
              onSelect={setTargetDate}
              disabled={(date) => date < new Date()}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Opção para exibir no gráfico */}
      <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border">
        <div className="flex items-center justify-between">
          <Label htmlFor="display_on_chart" className="font-medium">📊 Exibir meta no gráfico</Label>
          <input
            id="display_on_chart"
            type="checkbox"
            {...register("display_on_chart")}
            className="h-5 w-5"
          />
        </div>
        
        {displayOnChart && (
          <div className="space-y-2">
            <Label>Tipo de Linha no Gráfico</Label>
            <Select
              value={watch("chart_line_type") || ""}
              onValueChange={(value) => setValue("chart_line_type", value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de linha" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="resistance">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-green-500" />
                    <span>Resistência (Meta de Acúmulo) 🎯</span>
                  </div>
                </SelectItem>
                <SelectItem value="support">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-red-500" />
                    <span>Suporte (Limite Mínimo) ⚠️</span>
                  </div>
                </SelectItem>
                <SelectItem value="spending_limit">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-orange-500" />
                    <span>Limite de Gasto 🚫</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {targetAmount && monthlyContribution && monthlyContribution > 0 && (
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-2">📊 Projeção</h4>
          <p className="text-sm text-muted-foreground">
            Com contribuições de R$ {monthlyContribution.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} por mês,
            você atingirá sua meta em aproximadamente <strong>{calculateMonthsToComplete()} meses</strong>.
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? "Salvando..." : goal ? "Atualizar Meta" : "Criar Meta"}
        </Button>
      </div>
    </form>
  );
}
