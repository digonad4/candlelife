import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  CreditCard, 
  Target, 
  Users, 
  Settings, 
  TrendingDown,
  Receipt,
  TrendingUp,
  MoreHorizontal,
  LogOut,
  Bell,
  Search,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNative } from "@/hooks/useNative";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FloatingActionButton } from "./FloatingActionButton";

export const ProfessionalMobileNav = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { hapticFeedback, isNative } = useNative();
  const { signOut } = useAuth();
  const { toast } = useToast();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Core navigation - most used features
  const coreNavItems = [
    { 
      icon: LayoutDashboard, 
      label: "Dashboard", 
      href: "/dashboard",
      gradient: "from-blue-500 to-indigo-600"
    },
    { 
      icon: CreditCard, 
      label: "Trading", 
      href: "/transactions",
      gradient: "from-emerald-500 to-teal-600"
    },
    { 
      icon: Target, 
      label: "Metas", 
      href: "/goals",
      gradient: "from-amber-500 to-orange-600"
    },
  ];

  // Secondary features
  const secondaryNavItems = [
    { icon: Users, label: "Clientes", href: "/clients" },
    { icon: TrendingDown, label: "Despesas", href: "/expenses" },
    { icon: Receipt, label: "Faturadas", href: "/invoiced" },
    { icon: Settings, label: "Configurações", href: "/settings" },
  ];

  const handleNavClick = () => {
    hapticFeedback('light');
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
      hapticFeedback('medium');
      setIsDrawerOpen(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao fazer logout.",
        variant: "destructive",
      });
    }
  };

  if (!isMobile) return null;

  return (
    <>
      {/* Floating Action Button */}
      <FloatingActionButton />

      {/* Professional Bottom Navigation */}
      <div className={`fixed bottom-0 left-0 right-0 z-40 mobile-nav-modern ${
        isNative ? 'safe-area-bottom pb-2' : 'pb-2'
      }`}>
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-trading-gradient" />
        
        <nav className="flex justify-between items-center py-2 px-4">
          {coreNavItems.map((item, index) => {
            const isActive = location.pathname === item.href || 
                            (item.href === "/chat" && location.pathname.startsWith("/chat"));
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={handleNavClick}
                className={cn(
                  "flex flex-col items-center justify-center p-3 transition-all duration-300 rounded-2xl min-w-[70px] relative native-transition group",
                  isActive 
                    ? "bg-primary/10 text-primary scale-105 shadow-lg" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/10 active:scale-95"
                )}
              >
                <div className={cn(
                  "relative p-2 rounded-full transition-all duration-300",
                  isActive ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg` : "group-hover:bg-accent/20"
                )}>
                  <item.icon className={cn(
                    "h-5 w-5 transition-all duration-300", 
                    isActive && "scale-110"
                  )} />
                </div>
                
                <span className={cn(
                  "text-xs font-medium transition-all duration-300 mt-1",
                  isActive ? "font-semibold text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}>
                  {item.label}
                </span>
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-primary rounded-full animate-pulse" />
                )}
              </Link>
            );
          })}
          
          {/* More Menu */}
          <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <DrawerTrigger asChild>
              <button 
                onClick={handleNavClick}
                className="flex flex-col items-center justify-center p-3 transition-all duration-300 rounded-2xl min-w-[70px] text-muted-foreground hover:text-foreground hover:bg-accent/10 active:scale-95 native-transition relative group"
              >
                <div className="p-2 rounded-full transition-all duration-300 group-hover:bg-accent/20">
                  <MoreHorizontal className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium mt-1 group-hover:text-foreground">Mais</span>
              </button>
            </DrawerTrigger>
            <DrawerContent className="bg-background/98 backdrop-blur-xl border-t border-border/50">
              <DrawerHeader className="border-b border-border/20">
                <DrawerTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-trading-gradient flex items-center justify-center">
                    <MoreHorizontal className="h-4 w-4 text-white" />
                  </div>
                  Menu Completo
                </DrawerTitle>
              </DrawerHeader>
              
              <div className="p-6 space-y-3 pb-8 max-h-80 overflow-y-auto scrollbar-trading">
                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <Button 
                    variant="outline" 
                    className="h-12 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-200 hover:from-emerald-500/20 hover:to-teal-500/20"
                    onClick={() => setIsDrawerOpen(false)}
                  >
                    <TrendingUp className="h-4 w-4 mr-2 text-emerald-600" />
                    Nova Receita
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-12 bg-gradient-to-r from-red-500/10 to-pink-500/10 border-red-200 hover:from-red-500/20 hover:to-pink-500/20"
                    onClick={() => setIsDrawerOpen(false)}
                  >
                    <TrendingDown className="h-4 w-4 mr-2 text-red-600" />
                    Nova Despesa
                  </Button>
                </div>

                {/* Secondary Navigation */}
                {secondaryNavItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-xl transition-all duration-200 active:scale-95 native-transition group",
                        isActive 
                          ? "bg-primary/10 text-primary border border-primary/20" 
                          : "hover:bg-accent/10 border border-transparent"
                      )}
                      onClick={() => {
                        handleNavClick();
                        setIsDrawerOpen(false);
                      }}
                    >
                      <div className={cn(
                        "p-2 rounded-lg transition-all duration-300",
                        isActive ? "bg-primary/20" : "bg-muted/50 group-hover:bg-accent/20"
                      )}>
                        <item.icon className={cn(
                          "h-5 w-5",
                          isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                        )} />
                      </div>
                      <span className={cn(
                        "font-medium",
                        isActive ? "text-primary" : "group-hover:text-foreground"
                      )}>
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
                
                {/* Logout */}
                <div className="border-t pt-4 mt-6">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-4 p-4 rounded-xl transition-all duration-200 active:scale-95 native-transition text-destructive hover:bg-destructive/10 w-full border border-transparent hover:border-destructive/20"
                  >
                    <div className="p-2 rounded-lg bg-destructive/10">
                      <LogOut className="h-5 w-5" />
                    </div>
                    <span className="font-medium">Sair da Conta</span>
                  </button>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </nav>
      </div>
    </>
  );
};