import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, CreditCard, Users, Settings, TrendingDown,
  Receipt, MoreHorizontal, LogOut, BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNative } from "@/hooks/useNative";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { useState } from "react";

export const ProfessionalMobileNav = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { hapticFeedback } = useNative();
  const { signOut } = useAuth();
  const { toast } = useToast();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const coreNavItems = [
    { icon: LayoutDashboard, label: "Home", href: "/dashboard" },
    { icon: CreditCard, label: "Trading", href: "/transactions" },
    { icon: BarChart3, label: "Análise", href: "/analytics" },
    { icon: Users, label: "Clientes", href: "/clients" },
  ];

  const secondaryNavItems = [
    { icon: TrendingDown, label: "Despesas", href: "/expenses" },
    { icon: Receipt, label: "Faturadas", href: "/invoiced" },
    { icon: Settings, label: "Configurações", href: "/settings" },
  ];

  const handleNavClick = () => hapticFeedback("light");

  const handleLogout = async () => {
    try {
      await signOut();
      toast({ title: "Logout realizado" });
      setIsDrawerOpen(false);
    } catch {
      toast({ title: "Erro ao fazer logout", variant: "destructive" });
    }
  };

  if (!isMobile) return null;

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-card/95 backdrop-blur-md border-t border-border",
        "pb-[env(safe-area-inset-bottom)]"
      )}
    >
      <div className="flex justify-around items-stretch h-16 px-1">
        {coreNavItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={handleNavClick}
              className={cn(
                "flex flex-col items-center justify-center flex-1 gap-0.5 transition-all relative",
                isActive ? "text-primary" : "text-muted-foreground active:text-foreground"
              )}
            >
              {isActive && (
                <span className="absolute top-0 h-0.5 w-8 bg-primary rounded-full" />
              )}
              <item.icon className={cn("h-[22px] w-[22px]", isActive && "scale-110 transition-transform")} />
              <span className="text-[10px] font-medium leading-tight">{item.label}</span>
            </Link>
          );
        })}

        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <button
              onClick={handleNavClick}
              className="flex flex-col items-center justify-center flex-1 gap-0.5 text-muted-foreground active:text-foreground"
            >
              <MoreHorizontal className="h-[22px] w-[22px]" />
              <span className="text-[10px] font-medium leading-tight">Mais</span>
            </button>
          </DrawerTrigger>
          <DrawerContent className="bg-background border-t border-border">
            <DrawerHeader className="py-3">
              <DrawerTitle className="text-sm">Menu</DrawerTitle>
            </DrawerHeader>
            <div className="p-3 space-y-1 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
              {secondaryNavItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl transition-all text-sm",
                      isActive ? "bg-primary/10 text-primary" : "active:bg-muted"
                    )}
                    onClick={() => { handleNavClick(); setIsDrawerOpen(false); }}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
              <div className="border-t border-border pt-2 mt-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 p-3 rounded-xl text-destructive active:bg-destructive/10 w-full text-sm"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Sair</span>
                </button>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </nav>
  );
};
