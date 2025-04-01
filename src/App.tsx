import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useTheme } from "./context/ThemeContext";
import { useSidebar } from "./hooks/useSidebar";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import ChangePassword from "./pages/ChangePassword";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import NotFound from "./pages/NotFound";
import Clients from "./pages/Clients";
import InvoicedTransactions from "./pages/InvoicedTransactions";
import Expenses from "./pages/Expenses";
import Social from "./pages/Social";
import { useEffect } from "react";

function App() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { isSidebarOpen } = useSidebar();
  
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Component to handle redirects based on authentication
  const AuthenticatedRoute = ({ children }: { children: React.ReactNode }) => {
    return user ? <>{children}</> : <Navigate to="/login" replace />;
  };

  const RedirectToCorrectLanding = () => {
    return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className={`flex-1 overflow-hidden transition-all duration-300`}>
        <main className="h-full hide-scrollbar overflow-y-auto">
          <Routes>
            <Route path="/" element={<RedirectToCorrectLanding />} />
            <Route 
              path="/dashboard" 
              element={
                <AuthenticatedRoute>
                  <Dashboard />
                </AuthenticatedRoute>
              } 
            />
            <Route 
              path="/transactions" 
              element={
                <AuthenticatedRoute>
                  <Transactions />
                </AuthenticatedRoute>
              } 
            />
            <Route 
              path="/clients" 
              element={
                <AuthenticatedRoute>
                  <Clients />
                </AuthenticatedRoute>
              } 
            />
            <Route 
              path="/invoiced" 
              element={
                <AuthenticatedRoute>
                  <InvoicedTransactions />
                </AuthenticatedRoute>
              } 
            />
            <Route 
              path="/expenses" 
              element={
                <AuthenticatedRoute>
                  <Expenses />
                </AuthenticatedRoute>
              } 
            />
            <Route 
              path="/social" 
              element={
                <AuthenticatedRoute>
                  <Social />
                </AuthenticatedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <AuthenticatedRoute>
                  <Settings />
                </AuthenticatedRoute>
              } 
            />
            <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
