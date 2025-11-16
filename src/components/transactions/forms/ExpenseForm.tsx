
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowUpIcon, ArrowDownIcon, TrendingUp } from "lucide-react";
import { Client } from "@/types/client";

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
  isLoading: boolean;
  clients?: Client[];
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
  isLoading,
  clients,
  onSubmit
}: ExpenseFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-4">
        <Label className="text-lg font-semibold">Tipo de Transação</Label>
        <RadioGroup
          value={type}
          onValueChange={(value) => setType(value as "expense" | "income" | "investment")}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          <div className={`group relative flex items-center space-x-3 p-4 sm:p-5 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${
            type === "expense" 
              ? "border-red-500 bg-red-500/5 shadow-md shadow-red-500/20 scale-[1.02]" 
              : "border-border hover:border-red-300 hover:bg-red-500/5"
          }`}>
            <RadioGroupItem value="expense" id="expense" className="border-red-500" />
            <Label htmlFor="expense" className="flex items-center gap-2 cursor-pointer flex-1">
              <div className={`p-2 rounded-xl transition-colors ${
                type === "expense" ? "bg-red-500" : "bg-red-500/10"
              }`}>
                <ArrowDownIcon className={`w-5 h-5 ${
                  type === "expense" ? "text-white" : "text-red-500"
                }`} />
              </div>
              <span className={`font-semibold ${
                type === "expense" ? "text-red-600" : "text-foreground/70"
              }`}>Despesa</span>
            </Label>
          </div>
          
          <div className={`group relative flex items-center space-x-3 p-4 sm:p-5 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${
            type === "income" 
              ? "border-green-500 bg-green-500/5 shadow-md shadow-green-500/20 scale-[1.02]" 
              : "border-border hover:border-green-300 hover:bg-green-500/5"
          }`}>
            <RadioGroupItem value="income" id="income" className="border-green-500" />
            <Label htmlFor="income" className="flex items-center gap-2 cursor-pointer flex-1">
              <div className={`p-2 rounded-xl transition-colors ${
                type === "income" ? "bg-green-500" : "bg-green-500/10"
              }`}>
                <ArrowUpIcon className={`w-5 h-5 ${
                  type === "income" ? "text-white" : "text-green-500"
                }`} />
              </div>
              <span className={`font-semibold ${
                type === "income" ? "text-green-600" : "text-foreground/70"
              }`}>Receita</span>
            </Label>
          </div>
          
          <div className={`group relative flex items-center space-x-3 p-4 sm:p-5 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${
            type === "investment" 
              ? "border-blue-500 bg-blue-500/5 shadow-md shadow-blue-500/20 scale-[1.02]" 
              : "border-border hover:border-blue-300 hover:bg-blue-500/5"
          }`}>
            <RadioGroupItem value="investment" id="investment" className="border-blue-500" />
            <Label htmlFor="investment" className="flex items-center gap-2 cursor-pointer flex-1">
              <div className={`p-2 rounded-xl transition-colors ${
                type === "investment" ? "bg-blue-500" : "bg-blue-500/10"
              }`}>
                <TrendingUp className={`w-5 h-5 ${
                  type === "investment" ? "text-white" : "text-blue-500"
                }`} />
              </div>
              <span className={`font-semibold ${
                type === "investment" ? "text-blue-600" : "text-foreground/70"
              }`}>Investimento</span>
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <Label htmlFor="amount" className="text-base font-semibold">Valor</Label>
        <div className="relative group">
          <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-semibold transition-colors ${
            type === "expense" ? "text-red-500" : type === "income" ? "text-green-500" : "text-blue-500"
          }`}>
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
            className={`pl-11 pr-4 h-14 text-lg font-semibold rounded-2xl border-2 transition-all ${
              type === "expense" 
                ? "border-red-200 focus:border-red-500 focus:ring-red-500/20" 
                : type === "income"
                ? "border-green-200 focus:border-green-500 focus:ring-green-500/20"
                : "border-blue-200 focus:border-blue-500 focus:ring-blue-500/20"
            }`}
          />
        </div>
      </div>
      
      <div className="space-y-3">
        <Label htmlFor="description" className="text-base font-semibold">Descrição</Label>
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
          className="h-12 rounded-2xl border-2 focus:border-primary text-base"
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="paymentMethod" className="text-base font-semibold">Forma de Pagamento</Label>
        <Select value={paymentMethod} onValueChange={(value) => {
          setPaymentMethod(value as PaymentMethod);
          if (value !== 'invoice') {
            setClientId(null);
          }
        }}>
          <SelectTrigger className="h-12 rounded-2xl border-2">
            <SelectValue placeholder="Selecione a forma de pagamento" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="pix">PIX</SelectItem>
            <SelectItem value="cash">Dinheiro</SelectItem>
            <SelectItem value="invoice">Faturado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {paymentMethod === 'invoice' && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <Label htmlFor="client" className="text-base font-semibold">Cliente</Label>
          <Select value={clientId || ''} onValueChange={setClientId} required>
            <SelectTrigger className="h-12 rounded-2xl border-2">
              <SelectValue placeholder="Selecione o cliente" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
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
        size="lg"
        className={`w-full h-14 text-base font-semibold rounded-2xl shadow-lg transition-all duration-200 hover:scale-[1.02] ${
          type === "investment" 
            ? "bg-blue-500 hover:bg-blue-600 shadow-blue-500/30" 
            : type === "income" 
            ? "bg-green-500 hover:bg-green-600 shadow-green-500/30" 
            : "shadow-red-500/30"
        }`}
        disabled={isLoading}
        variant={type === "expense" ? "destructive" : "default"}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Adicionando...
          </span>
        ) : (
          "Adicionar Transação"
        )}
      </Button>
    </form>
  );
}
