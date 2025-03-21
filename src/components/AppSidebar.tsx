import { NavLink } from "react-router-dom";
import { LayoutDashboard, Receipt, Users, FileText, Settings, LogOut, Wallet } from "lucide-react"; // Adicionei Wallet
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { UserProfile } from "./UserProfile";

export function AppSidebar() {
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const renderNavItem = (icon: React.ElementType, label: string, to: string) => {
    const Icon = icon;

    return (
      <li>
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex items-center p-3 rounded-md transition-colors
                ${isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/50"}
                ${!isSidebarOpen && "justify-center"}`
              }
            >
              <TooltipTrigger asChild>
                <span className={`flex items-center ${isSidebarOpen ? "w-full" : ""}`}>
                  <Icon size={20} className={isSidebarOpen ? "mr-3" : ""} />
                  {isSidebarOpen && <span>{label}</span>}
                </span>
              </TooltipTrigger>
              {!isSidebarOpen && (
                <TooltipContent side="right">
                  <p>{label}</p>
                </TooltipContent>
              )}
            </NavLink>
          </Tooltip>
        </TooltipProvider>
      </li>
    );
  };

  return (
    <aside
      className={`sidebar bg-sidebar ${
        isSidebarOpen ? "w-64" : "w-16"
      } fixed inset-y-0 left-0 z-10 transition-width duration-300 ease-in-out overflow-hidden shadow-md border-r border-sidebar-border flex flex-col`}
    >
      <div className="sidebar-header py-4 px-4 flex items-center relative">
        <h1
          className={`text-lg font-bold ${
            isSidebarOpen ? "opacity-100" : "opacity-0"
          } transition-opacity duration-300`}
        >
          Candle Life 
        </h1>
        <button
          className="sidebar-toggle items-center p-2 rounded-md hover:bg-sidebar-accent absolute right-2 top-2 z-20"
          onClick={toggleSidebar}
        >
          ☰
        </button>
      </div>

      {isSidebarOpen && (
        <div className="px-4 py-2 mb-3">
          <UserProfile />
        </div>
      )}

      <nav className="sidebar-nav mt-4 flex-1">
        <ul className="space-y-2 px-2">
          {renderNavItem(LayoutDashboard, "Dashboard", "/dashboard")}
          {renderNavItem(Receipt, "Transações", "/transactions")}
          {renderNavItem(Users, "Clientes", "/clients")}
          {renderNavItem(FileText, "Faturados", "/invoiced")}
          {renderNavItem(Wallet, "Gestão de Despesas", "/expenses")} {/* Novo item */}
          {renderNavItem(Settings, "Configurações", "/settings")}
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
  );
}