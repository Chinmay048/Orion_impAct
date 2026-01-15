import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// 1. CHANGE IMPORT: Switch BrowserRouter to HashRouter
import { HashRouter, Routes, Route, Navigate } from "react-router-dom"; 
import React from "react"; 
import { DashboardLayout } from "@/components/layout/DashboardLayout";

// Pages
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Logout from "@/pages/Logout";
import Dashboard from "@/pages/Dashboard";
import InventoryManager from "@/pages/Inventory";
import PredictionEngine from "@/pages/PredictionEngine";
import MarketSensing from "@/pages/MarketSensing";
import ExecutionHub from "@/pages/logistic";
import Analytics from "@/pages/Analytics";
import Alerts from "@/pages/Alerts";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuth = localStorage.getItem("isAuthenticated");
  return isAuth ? <>{children}</> : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* 2. CHANGE COMPONENT: Use HashRouter here */}
      <HashRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />

          {/* Protected Dashboard Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="inventory" element={<InventoryManager />} />
            <Route path="prediction" element={<PredictionEngine />} />
            <Route path="sensing" element={<MarketSensing />} />
            <Route path="execution" element={<ExecutionHub />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="alerts" element={<Alerts />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </QueryClientProvider>
  );
}