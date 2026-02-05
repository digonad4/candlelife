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
      <div className="flex min-h-screen w-full">
        {/* Desktop Sidebar - always visible on md+ */}
        <AppSidebar />
        
        {/* Main Content */}
        <SidebarInset className="flex-1 flex flex-col">
          <main className={cn(
            "flex-1 overflow-auto bg-background",
            isMobile ? "pb-24 px-3 py-4" : "p-6"
          )}>
            <div className={cn(
              "h-full w-full",
              !isMobile && "max-w-7xl mx-auto"
            )}>
              {children || <Outlet />}
            </div>
          </main>

          {/* Mobile Navigation - only on mobile */}
          {isMobile && <ProfessionalMobileNav />}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}