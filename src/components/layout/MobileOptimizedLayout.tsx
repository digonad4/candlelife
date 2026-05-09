import { Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { ProfessionalMobileNav } from "./ProfessionalMobileNav";
import { NativeHeader } from "./NativeHeader";
import { useAuth } from "@/context/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface MobileOptimizedLayoutProps {
  children?: React.ReactNode;
}

const ROUTE_TITLES: Record<string, string> = {
  "/": "Início",
  "/dashboard": "Dashboard",
  "/transactions": "Trading",
  "/clients": "Clientes",
  "/analytics": "Análise",
  "/expenses": "Despesas",
  "/invoiced": "Faturadas",
  "/settings": "Configurações",
};

export function MobileOptimizedLayout({ children }: MobileOptimizedLayoutProps) {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const location = useLocation();
  const title = ROUTE_TITLES[location.pathname] ?? "candle-life";

  if (!user) {
    return (
      <div className="min-h-[100dvh] bg-background">
        {children || <Outlet />}
      </div>
    );
  }

  // Mobile-first native shell — no sidebar, native header + bottom tab bar
  if (isMobile) {
    return (
      <div className="flex min-h-[100dvh] flex-col bg-background">
        <NativeHeader title={title} />
        <main
          className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden",
            "pt-[calc(3.25rem+env(safe-area-inset-top))]",
            "pb-[calc(4.5rem+env(safe-area-inset-bottom))]",
            "px-3"
          )}
        >
          <div className="w-full flex flex-col min-h-full py-2">
            {children || <Outlet />}
          </div>
        </main>
        <ProfessionalMobileNav />
      </div>
    );
  }

  // Desktop / tablet — keep sidebar layout
  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-[100dvh] w-full">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col min-h-[100dvh]">
          <main className="flex-1 overflow-auto bg-background p-4">
            <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col min-h-0">
              {children || <Outlet />}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
