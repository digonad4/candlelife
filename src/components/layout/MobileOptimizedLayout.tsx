import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { ProfessionalMobileNav } from "./ProfessionalMobileNav";
import { useAuth } from "@/context/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface MobileOptimizedLayoutProps {
  children?: React.ReactNode;
}

export function MobileOptimizedLayout({ children }: MobileOptimizedLayoutProps) {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        {children || <Outlet />}
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="flex min-h-[100dvh] w-full">
        <AppSidebar />
        
        <SidebarInset className="flex-1 flex flex-col min-h-[100dvh]">
          <main className={cn(
            "flex-1 overflow-auto bg-background flex flex-col",
            isMobile ? "pb-16 px-2 pt-2" : "p-4"
          )}>
            <div className={cn(
              "flex-1 w-full flex flex-col min-h-0",
              !isMobile && "max-w-7xl mx-auto"
            )}>
              {children || <Outlet />}
            </div>
          </main>

          {isMobile && <ProfessionalMobileNav />}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
