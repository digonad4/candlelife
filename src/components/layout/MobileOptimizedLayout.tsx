import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
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
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auto-close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Disable scroll when sidebar is open on mobile
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobile, sidebarOpen]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20">
        {children || <Outlet />}
      </div>
    );
  }

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <div className="flex h-screen w-full">
        {/* Overlay for mobile */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out",
          isMobile ? (sidebarOpen ? "translate-x-0" : "-translate-x-full") : "relative translate-x-0"
        )}>
          <AppSidebar />
        </div>

        {/* Main Content */}
        <div className={cn(
          "flex-1 flex flex-col min-h-screen transition-all duration-300 overflow-hidden",
          !isMobile && "ml-64"
        )}>
          {/* Content Area */}
          <main className={cn(
            "flex-1 overflow-auto",
            isMobile ? "pb-32 safe-area-bottom" : "p-6",
            "bg-gradient-to-br from-background via-background/95 to-muted/20"
          )}>
            <div className={cn(
              "h-full w-full overflow-x-hidden",
              isMobile ? "px-4 py-6" : "max-w-7xl mx-auto"
            )}>
              {children || <Outlet />}
            </div>
          </main>

          {/* Mobile Navigation */}
          {isMobile && (
            <ProfessionalMobileNav />
          )}
        </div>
      </div>
    </SidebarProvider>
  );
}