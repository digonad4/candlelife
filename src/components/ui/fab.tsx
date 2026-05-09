import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNative } from "@/hooks/useNative";

interface FABProps {
  onClick: () => void;
  icon?: React.ReactNode;
  label?: string;
  className?: string;
}

/**
 * Floating Action Button - native-style primary action.
 * Sits above the mobile tab bar and respects safe-area.
 */
export const FAB = ({ onClick, icon, label = "Adicionar", className }: FABProps) => {
  const { hapticFeedback } = useNative();

  const handleClick = () => {
    hapticFeedback("medium");
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      aria-label={label}
      className={cn(
        "fixed right-4 z-40 flex items-center justify-center",
        "h-14 w-14 rounded-full bg-primary text-primary-foreground",
        "shadow-floating active:scale-95 transition-transform",
        "bottom-[calc(5rem+env(safe-area-inset-bottom))]",
        className
      )}
    >
      {icon ?? <Plus className="h-6 w-6" />}
    </button>
  );
};
