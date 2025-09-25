import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageCircle, 
  Brain, 
  Send, 
  Mic, 
  MicOff, 
  Bot,
  User,
  TrendingUp,
  Target,
  DollarSign,
  Lightbulb,
  Sparkles
} from "lucide-react";
import { useSmartAlerts } from "@/hooks/useSmartAlerts";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  suggestions?: string[];
  insights?: {
    type: "tip" | "warning" | "opportunity";
    title: string;
    message: string;
  }[];
}

export function IntelligentFinancialChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      type: "ai",
      content: "Olá! Sou seu assistente financeiro inteligente. Posso ajudar você com análises, dicas de economia, planejamento de metas e muito mais. Como posso ajudar hoje?",
      timestamp: new Date(),
      suggestions: [
        "Analisar meus gastos do mês",
        "Criar uma meta de economia",
        "Dicas para investir melhor",
        "Como reduzir minhas despesas?"
      ]
    }
  ]);
  
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { insights, spendingAnalysis } = useSmartAlerts();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateAIResponse = (userMessage: string): ChatMessage => {
    // Simple AI simulation based on keywords
    let content = "";
    let aiInsights: ChatMessage["insights"] = [];
    let suggestions: string[] = [];

    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes("gastar") || lowerMessage.includes("despesa")) {
      content = `Analisando seus gastos... Com base nos dados, vejo que você gastou R$ ${spendingAnalysis?.total_expenses?.toLocaleString('pt-BR') || '0'} este mês. Suas principais categorias de gastos são interessantes para otimizar!`;
      aiInsights.push({
        type: "tip",
        title: "Dica de Economia",
        message: "Tente o método 50/30/20: 50% necessidades, 30% desejos, 20% poupança."
      });
      suggestions = ["Como categorizar melhor meus gastos?", "Estratégias para reduzir 15% dos gastos", "Apps que ajudam a controlar gastos"];
    } else if (lowerMessage.includes("investir") || lowerMessage.includes("investimento")) {
      content = "Ótima pergunta sobre investimentos! Com sua taxa de poupança atual, podemos explorar algumas opções interessantes. O importante é começar, mesmo com valores pequenos.";
      aiInsights.push({
        type: "opportunity",
        title: "Oportunidade",
        message: "Com R$ 100/mês você pode começar um portfólio diversificado."
      });
      suggestions = ["Qual o melhor investimento para iniciantes?", "Como diversificar com pouco dinheiro?", "Renda fixa vs renda variável"];
    } else if (lowerMessage.includes("meta") || lowerMessage.includes("objetivo")) {
      content = "Vamos definir metas inteligentes! Com base no seu perfil, posso sugerir metas realistas e alcançáveis. O segredo é começar pequeno e ser consistente.";
      aiInsights.push({
        type: "tip",
        title: "Meta SMART",
        message: "Use o método SMART: Específica, Mensurável, Alcançável, Relevante e Temporal."
      });
      suggestions = ["Criar meta de emergência", "Meta para comprar um carro", "Como manter disciplina nas metas?"];
    } else {
      content = "Interessante! Com base na sua situação financeira atual, posso oferecer algumas sugestões personalizadas. Que tal focarmos em uma área específica?";
      suggestions = ["Analisar padrão de gastos", "Otimizar investimentos atuais", "Criar plano de emergência", "Dicas de economia diária"];
    }

    return {
      id: Date.now().toString(),
      type: "ai",
      content,
      timestamp: new Date(),
      insights: aiInsights,
      suggestions
    };
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse = simulateAIResponse(inputValue);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const toggleVoiceInput = () => {
    setIsListening(!isListening);
    // Voice recognition would be implemented here
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="trading-card h-[600px] flex flex-col">
      <CardHeader className="border-b border-border/20 shrink-0">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600">
            <Brain className="h-5 w-5 text-white" />
          </div>
          Chat Financeiro Inteligente
          <Badge variant="secondary" className="ml-auto">
            <Sparkles className="h-3 w-3 mr-1" />
            AI
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4 scrollbar-trading">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.type === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.type === "ai" && (
                  <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                
                <div className={cn(
                  "max-w-[80%] space-y-2",
                  message.type === "user" ? "order-first" : ""
                )}>
                  <div className={cn(
                    "rounded-2xl p-4 shadow-sm",
                    message.type === "user" 
                      ? "bg-primary text-primary-foreground ml-auto" 
                      : "bg-muted"
                  )}>
                    <p className="text-sm">{message.content}</p>
                  </div>
                  
                  {/* AI Insights */}
                  {message.insights && message.insights.length > 0 && (
                    <div className="space-y-2">
                      {message.insights.map((insight, index) => (
                        <div
                          key={index}
                          className={cn(
                            "p-3 rounded-lg border-l-4 text-xs",
                            insight.type === "tip" ? "border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20" :
                            insight.type === "warning" ? "border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20" :
                            "border-l-green-500 bg-green-50/50 dark:bg-green-950/20"
                          )}
                        >
                          <div className="font-semibold flex items-center gap-1">
                            {insight.type === "tip" && <Lightbulb className="h-3 w-3" />}
                            {insight.type === "warning" && <TrendingUp className="h-3 w-3" />}
                            {insight.type === "opportunity" && <Target className="h-3 w-3" />}
                            {insight.title}
                          </div>
                          <p className="mt-1">{insight.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Suggestions */}
                  {message.suggestions && (
                    <div className="flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="text-xs h-7"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
                
                {message.type === "user" && (
                  <div className="p-2 rounded-full bg-primary shrink-0">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-600">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-muted rounded-2xl p-4">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>
        
        {/* Input Area */}
        <div className="p-4 border-t border-border/20 shrink-0">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleVoiceInput}
              className={cn(
                "shrink-0",
                isListening && "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400"
              )}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Pergunte sobre suas finanças..."
              className="flex-1"
            />
            
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              className="shrink-0 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}