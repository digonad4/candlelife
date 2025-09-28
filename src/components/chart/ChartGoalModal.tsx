import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TrendingUp, TrendingDown } from "lucide-react";

interface ChartGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGoal: (data: { goal_type: "support" | "resistance"; value: number; label?: string }) => void;
  clickedValue: number;
}

export function ChartGoalModal({ isOpen, onClose, onCreateGoal, clickedValue }: ChartGoalModalProps) {
  const [goalType, setGoalType] = useState<"support" | "resistance">("support");
  const [goalValue, setGoalValue] = useState(clickedValue.toString());
  const [goalLabel, setGoalLabel] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const value = parseFloat(goalValue);
    if (isNaN(value)) return;

    onCreateGoal({
      goal_type: goalType,
      value,
      label: goalLabel || undefined,
    });

    // Reset form
    setGoalLabel("");
    setGoalValue(clickedValue.toString());
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            📊 Definir Meta Visual
          </DialogTitle>
          <DialogDescription>
            Valor selecionado: <strong>{formatCurrency(clickedValue)}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Tipo de Meta</Label>
              <RadioGroup value={goalType} onValueChange={(value: "support" | "resistance") => setGoalType(value)} className="mt-2">
                <div className="flex items-center space-x-3 border rounded-lg p-3 cursor-pointer hover:bg-accent transition-colors">
                  <RadioGroupItem value="support" id="support" />
                  <Label htmlFor="support" className="flex items-center gap-2 cursor-pointer">
                    <TrendingDown className="w-4 h-4 text-red-600" />
                    <div>
                      <div className="font-medium">Suporte (Teto de Gasto)</div>
                      <div className="text-xs text-muted-foreground">Alerta se o valor cruzar para baixo</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 border rounded-lg p-3 cursor-pointer hover:bg-accent transition-colors">
                  <RadioGroupItem value="resistance" id="resistance" />
                  <Label htmlFor="resistance" className="flex items-center gap-2 cursor-pointer">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <div>
                      <div className="font-medium">Resistência (Piso de Acúmulo)</div>
                      <div className="text-xs text-muted-foreground">Alerta se o valor cruzar para cima</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goalValue">Valor da Meta (R$)</Label>
              <Input
                id="goalValue"
                type="number"
                step="0.01"
                value={goalValue}
                onChange={(e) => setGoalValue(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goalLabel">Rótulo da Meta (opcional)</Label>
              <Input
                id="goalLabel"
                value={goalLabel}
                onChange={(e) => setGoalLabel(e.target.value)}
                placeholder={goalType === "support" ? "Ex: Limite Cartão" : "Ex: Meta Reserva"}
                maxLength={50}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="min-w-[100px]">
              Criar Meta
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}