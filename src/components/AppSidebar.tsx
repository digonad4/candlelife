
import { NavLink, useOutletContext } from "react-router-dom";
import { LayoutDashboard, Receipt, Users, FileText, Settings, LogOut, Wallet, MessageSquare, Menu } from "lucide-react";
import { useSidebar } from "../hooks/useSidebar";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { UserProfile } from "./UserProfile";
import { useMessages } from "@/hooks/useMessages";
import { NotificationBadge } from "./ui/notification-badge";
import { Button } from "./ui/button";

interface AppSidebarProps {
  openChat: (userId: string, userName: string, userAvatar?: string) => void;
}

export const AppSidebar = ({ openChat }: AppSidebarProps) => {
  const { isSidebarOpen, toggleSidebar, isMobile } = useSidebar();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { getTotalUnreadCount } = useMessages();
  const totalUnreadMessages = getTotalUnreadCount();
  
  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const renderNavItem = (icon: React.ElementType, label: string, to: string, notificationCount?: number) => {
    const Icon = icon;

    return (
      <li>
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex items-center p-3 rounded-md transition-colors relative
                ${isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/50"}
                ${!isSidebarOpen && "justify-center"}`
              }
            >
              <TooltipTrigger asChild>
                <span className={`flex items-center ${isSidebarOpen ? "w-full" : ""}`}>
                  <Icon size={20} className={isSidebarOpen ? "mr-3" : ""} />
                  {isSidebarOpen && <span>{label}</span>}
                  {notificationCount !== undefined && notificationCount > 0 && (
                    <span className={`flex items-center justify-center bg-destructive text-destructive-foreground rounded-full text-xs font-bold h-5 w-5 p-0 ${isSidebarOpen ? "ml-2" : "absolute -top-1 -right-1"}`}>
                      {notificationCount > 9 ? "9+" : notificationCount}
                    </span>
                  )}
                </span>
              </TooltipTrigger>
              {!isSidebarOpen && (
                <TooltipContent side="right">
                  <p>{label}</p>
                  {notificationCount !== undefined && notificationCount > 0 && (
                    <p className="text-xs text-destructive">{notificationCount} mensagens não lidas</p>
                  )}
                </TooltipContent>
              )}
            </NavLink>
          </Tooltip>
        </TooltipProvider>
      </li>
    );
  };

  const sidebarItems = [
    renderNavItem(LayoutDashboard, "Dashboard", "/dashboard"),
    renderNavItem(Receipt, "Transações", "/transactions"),
    renderNavItem(Users, "Clientes", "/clients"),
    renderNavItem(FileText, "Faturados", "/invoiced"),
    renderNavItem(Wallet, "Gestão de Despesas", "/expenses"),
    renderNavItem(MessageSquare, "Comunidade", "/social", totalUnreadMessages),
    renderNavItem(Settings, "Configurações", "/settings")
  ];

  if (isMobile && !isSidebarOpen) {
    return null;
  }

  return (
    <>
      <aside
        className={`sidebar bg-sidebar fixed inset-y-0 left-0 z-30 transition-all duration-300 ease-in-out overflow-hidden shadow-md border-r border-sidebar-border flex flex-col ${
          isSidebarOpen ? "w-64" : "w-16"
        } ${isMobile && !isSidebarOpen ? "-translate-x-full" : "translate-x-0"}`}
      >
        <div className="sidebar-header py-4 px-4 flex items-center justify-between">
          <h1
            className={`text-lg font-bold ${
              isSidebarOpen ? "opacity-100" : "opacity-0"
            } transition-opacity duration-300`}
          >
            Candle Life
          </h1>
          <div className="flex items-center gap-2">
            {/* Show notification badge in the sidebar */}
            <div className={`${isSidebarOpen ? 'block' : 'hidden'}`}>
              <NotificationBadge openChat={openChat} />
            </div>
          </div>
        </div>

        {isSidebarOpen && (
          <div className="px-4 py-2 mb-3">
            <UserProfile />
          </div>
        )}

        <nav className="sidebar-nav mt-4 flex-1">
          <ul className="space-y-2 px-2">
            {sidebarItems}
          </ul>
        </nav>

        <div className="mt-auto mb-4 px-2">
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <button
                className={`flex items-center p-3 rounded-md transition-colors w-full text-left text-sidebar-foreground hover:bg-sidebar-accent/50 ${
                  !isSidebarOpen && "justify-center"
                }`}
                onClick={handleLogout}
              >
                <TooltipTrigger asChild>
                  <span className={`flex items-center ${isSidebarOpen ? "w-full" : ""}`}>
                    <LogOut size={20} className={isSidebarOpen ? "mr-3" : ""} />
                    {isSidebarOpen && <span>Sair</span>}
                  </span>
                </TooltipTrigger>
                {!isSidebarOpen && (
                  <TooltipContent side="right">
                    <p>Sair</p>
                  </TooltipContent>
                )}
              </button>
            </Tooltip>
          </TooltipProvider>
        </div>
      </aside>
      
      {/* Sempre visível no mobile para poder abrir o menu */}
      {isMobile && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="fixed top-4 left-4 z-40"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}
    </>
  );
};
