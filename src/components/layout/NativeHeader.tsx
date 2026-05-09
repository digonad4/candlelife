import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNative } from "@/hooks/useNative";

interface NativeHeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

const ROOT_ROUTES = ["/", "/dashboard", "/transactions", "/clients", "/analytics", "/expenses", "/invoiced", "/settings"];

/**
 * Fixed native-style header. Respects iOS notch via safe-area-inset-top.
 * Auto-shows back button on non-root routes.
 */
export const NativeHeader = ({ title, showBack, rightAction }: NativeHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hapticFeedback } = useNative();

  const shouldShowBack = showBack ?? !ROOT_ROUTES.includes(location.pathname);

  const handleBack = () => {
    hapticFeedback("light");
    navigate(-1);
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40",
        "bg-background/95 backdrop-blur-md border-b border-border",
        "pt-[env(safe-area-inset-top)]"
      )}
    >
      <div className="h-13 flex items-center justify-between px-3 h-[3.25rem]">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {shouldShowBack && (
            <button
              onClick={handleBack}
              aria-label="Voltar"
              className="-ml-1 p-1.5 rounded-full active:bg-muted transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-foreground" />
            </button>
          )}
          <h1 className="text-base font-semibold text-foreground truncate">{title}</h1>
        </div>
        {rightAction && <div className="flex items-center gap-1">{rightAction}</div>}
      </div>
    </header>
  );
};
