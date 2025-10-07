import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";

import { AuthProvider } from "@/context/AuthContext";
import { UnifiedThemeProvider } from "@/context/UnifiedThemeContext";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { PWAInitializer } from "@/components/pwa/PWAInitializer";

import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import ChangePassword from "@/pages/ChangePassword";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import Transactions from "@/pages/Transactions";
import Expenses from "@/pages/Expenses";
import InvoicedTransactions from "@/pages/InvoicedTransactions";
import Goals from "@/pages/Goals";
import Clients from "@/pages/Clients";
import Settings from "@/pages/Settings";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Support from "@/pages/Support";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import Analytics from "@/pages/Analytics";
import NotFound from "@/pages/NotFound";

import AppLayout from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <UnifiedThemeProvider>
            <PWAInitializer />
            <Toaster />
            <Sonner />
            <InstallPrompt />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/change-password" element={<ChangePassword />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Index />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="transactions" element={<Transactions />} />
                <Route path="expenses" element={<Expenses />} />
                <Route path="invoiced" element={<InvoicedTransactions />} />
                <Route path="goals" element={<Goals />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="clients" element={<Clients />} />
                <Route path="settings" element={<Settings />} />
                <Route path="about" element={<About />} />
                <Route path="contact" element={<Contact />} />
                <Route path="support" element={<Support />} />
                <Route path="privacy" element={<Privacy />} />
                <Route path="terms" element={<Terms />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </UnifiedThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
