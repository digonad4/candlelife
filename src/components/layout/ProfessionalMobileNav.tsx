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
  const { hapticFeedback, isNative } = useNative();
  const { signOut } = useAuth();
  const { toast } = useToast();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const coreNavItems = [
    { icon: LayoutDashboard, label: "Home", href: "/dashboard" },
    { icon: CreditCard, label: "Trading", href: "/transactions" },
    { icon: Users, label: "Clientes", href: "/clients" },
  ];

  const secondaryNavItems = [
    { icon: BarChart3, label: "Análise", href: "/analytics" },
    { icon: TrendingDown, label: "Despesas", href: "/expenses" },
    { icon: Receipt, label: "Faturadas", href: "/invoiced" },
    { icon: Settings, label: "Config.", href: "/settings" },
  ];

  const handleNavClick = () => hapticFeedback('light');

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
    <div className={`fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border ${isNative ? 'pb-safe' : 'pb-2'}`}>
      <nav className="flex justify-around items-center py-1 px-2">
        {coreNavItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={handleNavClick}
              className={cn(
                "flex flex-col items-center justify-center p-1.5 rounded-xl min-w-[56px] transition-all",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
              <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
            </Link>
          );
        })}
        
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <button onClick={handleNavClick}
              className="flex flex-col items-center justify-center p-1.5 rounded-xl min-w-[56px] text-muted-foreground">
              <MoreHorizontal className="h-5 w-5" />
              <span className="text-[10px] mt-0.5 font-medium">Mais</span>
            </button>
          </DrawerTrigger>
          <DrawerContent className="bg-background border-t border-border">
            <DrawerHeader className="py-3">
              <DrawerTitle className="text-sm">Menu</DrawerTitle>
            </DrawerHeader>
            <div className="p-3 space-y-1 pb-6">
              {secondaryNavItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 p-2.5 rounded-lg transition-all text-sm",
                      isActive ? "bg-primary/10 text-primary" : "hover:bg-accent/10"
                    )}
                    onClick={() => { handleNavClick(); setIsDrawerOpen(false); }}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
              <div className="border-t pt-2 mt-2">
                <button onClick={handleLogout}
                  className="flex items-center gap-3 p-2.5 rounded-lg text-destructive hover:bg-destructive/10 w-full text-sm">
                  <LogOut className="h-4 w-4" />
                  <span className="font-medium">Sair</span>
                </button>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </nav>
    </div>
  );
};
