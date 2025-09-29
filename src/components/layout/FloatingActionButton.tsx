import { useState } from "react";
import { Plus, TrendingUp, TrendingDown, Target, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNative } from "@/hooks/useNative";
import { useNavigate } from "react-router-dom";

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { hapticFeedback } = useNative();
  const navigate = useNavigate();

  const quickActions = [
    {
      icon: TrendingUp,
      label: "Nova Receita",
      color: "from-emerald-500 to-teal-600",
      action: () => navigate("/transactions?type=income")
    },
    {
      icon: TrendingDown,
      label: "Nova Despesa",
      color: "from-red-500 to-pink-600",
      action: () => navigate("/transactions?type=expense")
    },
    {
      icon: Target,
      label: "Nova Meta",
      color: "from-amber-500 to-orange-600",
      action: () => navigate("/goals")
    }
  ];

  const handleMainClick = () => {
    hapticFeedback('light');
    setIsOpen(!isOpen);
  };

  const handleActionClick = (action: () => void) => {
    hapticFeedback('medium');
    action();
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-24 right-4 z-50">
      {/* Quick Actions */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 flex flex-col gap-3 mb-2">
          {quickActions.map((item, index) => (
            <div
              key={item.label}
              className={cn(
                "flex items-center gap-3 opacity-0 animate-fade-in",
                `animation-delay-${index * 100}`
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <span className="text-xs font-medium text-foreground bg-background/90 backdrop-blur-sm px-2 py-1 rounded-lg border border-border/50 whitespace-nowrap">
                {item.label}
              </span>
              <Button
                size="sm"
                className={cn(
                  "w-12 h-12 rounded-full shadow-lg border-0",
                  `bg-gradient-to-r ${item.color} hover:scale-110 transition-all duration-200`
                )}
                onClick={() => handleActionClick(item.action)}
              >
                <item.icon className="h-5 w-5 text-white" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Main FAB */}
      <Button
        className={cn(
          "w-14 h-14 rounded-full shadow-xl border-0 transition-all duration-300",
          isOpen
            ? "bg-gradient-to-r from-red-500 to-pink-600 rotate-45"
            : "bg-gradient-to-r from-primary to-accent hover:scale-110"
        )}
        onClick={handleMainClick}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <Plus className="h-6 w-6 text-white" />
        )}
      </Button>
    </div>
  );
}