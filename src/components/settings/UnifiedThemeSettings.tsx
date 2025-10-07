import { useState } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Moon, Sun, Monitor, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUnifiedTheme } from "@/context/UnifiedThemeContext";

const themes = [
  { 
    id: "supabase", 
    name: "Supabase", 
    icon: Database,
    description: "Preto puro com verde neon - Tema padrão"
  },
  { 
    id: "dark", 
    name: "Escuro", 
    icon: Moon,
    description: "Tema escuro profissional"
  },
  { 
    id: "light", 
    name: "Claro", 
    icon: Sun,
    description: "Tema claro profissional"
  },
  { 
    id: "system", 
    name: "Sistema", 
    icon: Monitor,
    description: "Segue o tema do sistema operacional"
  },
];

export const UnifiedThemeSettings = () => {
  const { theme, setTheme, isUpdating } = useUnifiedTheme();
  const { toast } = useToast();
  const [selectedTheme, setSelectedTheme] = useState(theme);

  const updateTheme = async (newTheme: string) => {
    const themeData = themes.find(t => t.id === newTheme);
    
    try {
      setSelectedTheme(newTheme as any);
      await setTheme(newTheme as any);
      
      toast({
        title: "Tema alterado",
        description: `Tema alterado para ${themeData?.name}.`,
      });
    } catch (error) {
      console.error("Erro ao atualizar tema:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o tema.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">Tema do Aplicativo</h2>
        <p className="text-sm text-muted-foreground">
          Escolha o tema visual do aplicativo. O tema Supabase oferece uma experiência única com preto puro e verde neon.
        </p>
      </div>

      <RadioGroup
        value={selectedTheme}
        onValueChange={updateTheme}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        disabled={isUpdating}
      >
        {themes.map(({ id, name, icon: Icon, description }) => (
          <Label
            key={id}
            htmlFor={id}
            className={`flex flex-col space-y-3 border rounded-lg p-4 cursor-pointer hover:bg-accent transition-all ${
              selectedTheme === id ? "border-primary bg-accent/50 shadow-lg" : "border-input"
            } ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem value={id} id={id} disabled={isUpdating} />
              <Icon className="w-5 h-5" />
              <span className="text-sm font-semibold">{name}</span>
              {id === "supabase" && (
                <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full ml-auto">
                  Padrão
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground pl-9">
              {description}
            </p>
          </Label>
        ))}
      </RadioGroup>

      {isUpdating && (
        <p className="text-sm text-muted-foreground text-center">
          Aplicando tema...
        </p>
      )}
    </div>
  );
};
