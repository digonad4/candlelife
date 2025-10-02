
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowUpIcon, ArrowDownIcon, TrendingUp } from "lucide-react";
import { Client } from "@/types/client";
import { FinancialGoal } from "@/hooks/useGoals";

type PaymentMethod = 'pix' | 'cash' | 'invoice';

export interface ExpenseFormProps {
  amount: string;
  setAmount: (amount: string) => void;
  description: string;
  setDescription: (description: string) => void;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
  type: "expense" | "income" | "investment";
  setType: (type: "expense" | "income" | "investment") => void;
  clientId: string | null;
  setClientId: (id: string | null) => void;
  goalId?: string | null;
  setGoalId?: (id: string | null) => void;
  isLoading: boolean;
  clients?: Client[];
  goals?: FinancialGoal[];
  onSubmit: (e: React.FormEvent) => void;
}

export function ExpenseForm({
  amount,
  setAmount,
  description,
  setDescription,
  paymentMethod,
  setPaymentMethod,
  type,
  setType,
  clientId,
  setClientId,
  goalId,
  setGoalId,
  isLoading,
  clients,
  goals,
  onSubmit
}: ExpenseFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
      <div className="space-y-3">
        <Label className="text-base sm:text-lg font-medium">Tipo</Label>
        <RadioGroup
          value={type}
          onValueChange={(value) => setType(value as "expense" | "income" | "investment")}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          <div className={`flex items-center space-x-3 p-3 sm:p-4 border rounded-lg cursor-pointer transition-colors ${
            type === "expense" ? "border-red-500 bg-red-50" : "border-input hover:bg-accent"
          }`}>
            <RadioGroupItem value="expense" id="expense" />
            <Label htmlFor="expense" className="flex items-center gap-2 cursor-pointer">
              <ArrowDownIcon className="w-4 h-4 text-red-500" />
              <span className="text-red-500 font-medium">Despesa</span>
            </Label>
          </div>
          
          <div className={`flex items-center space-x-3 p-3 sm:p-4 border rounded-lg cursor-pointer transition-colors ${
            type === "income" ? "border-green-500 bg-green-50" : "border-input hover:bg-accent"
          }`}>
            <RadioGroupItem value="income" id="income" />
            <Label htmlFor="income" className="flex items-center gap-2 cursor-pointer">
              <ArrowUpIcon className="w-4 h-4 text-green-500" />
              <span className="text-green-500 font-medium">Receita</span>
            </Label>
          </div>
          
          <div className={`flex items-center space-x-3 p-3 sm:p-4 border rounded-lg cursor-pointer transition-colors ${
            type === "investment" ? "border-blue-500 bg-blue-50" : "border-input hover:bg-accent"
          }`}>
            <RadioGroupItem value="investment" id="investment" />
            <Label htmlFor="investment" className="flex items-center gap-2 cursor-pointer">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span className="text-blue-500 font-medium">Investimento</span>
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Valor</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            R$
          </span>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0,00"
            required
            className={`pl-8 text-base ${
              type === "expense" 
                ? "border-red-200 focus:border-red-500" 
                : type === "income"
                ? "border-green-200 focus:border-green-500"
                : "border-blue-200 focus:border-blue-500"
            }`}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={
            type === "investment" 
              ? "Ex: Ações, Fundos, Tesouro Direto..." 
              : "Ex: Corrida, Manutenção..."
          }
          required
          className="focus:border-primary text-base"
        />
      </div>

      {type === "investment" && goals && goals.length > 0 && setGoalId && (
        <div className="space-y-2">
          <Label htmlFor="goal">Meta Financeira (Opcional)</Label>
          <Select value={goalId || 'none'} onValueChange={(value) => setGoalId(value === 'none' ? null : value)}>
            <SelectTrigger className="border-blue-200 focus:border-blue-500">
              <SelectValue placeholder="Selecione uma meta para vincular este investimento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhuma meta</SelectItem>
              {goals.map((goal) => (
                <SelectItem key={goal.id} value={goal.id}>
                  <span className="truncate">{goal.description || `Meta de ${goal.goal_type}`}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
        <Select value={paymentMethod} onValueChange={(value) => {
          setPaymentMethod(value as PaymentMethod);
          if (value !== 'invoice') {
            setClientId(null);
          }
        }}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a forma de pagamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pix">PIX</SelectItem>
            <SelectItem value="cash">Dinheiro</SelectItem>
            <SelectItem value="invoice">Faturado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {paymentMethod === 'invoice' && (
        <div className="space-y-2">
          <Label htmlFor="client">Cliente</Label>
          <Select value={clientId || ''} onValueChange={setClientId} required>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o cliente" />
            </SelectTrigger>
            <SelectContent>
              {clients?.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Button 
        type="submit" 
        className={`w-full ${
          type === "investment" 
            ? "bg-blue-500 hover:bg-blue-600" 
            : type === "expense" 
            ? "" 
            : ""
        }`}
        disabled={isLoading}
        variant={type === "expense" ? "destructive" : type === "investment" ? "default" : "default"}
      >
        {isLoading ? "Adicionando..." : "Adicionar"}
      </Button>
    </form>
  );
}
