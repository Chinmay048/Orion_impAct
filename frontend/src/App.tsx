import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React from "react"; // Ensure React is imported
import { DashboardLayout } from "@/components/layout/DashboardLayout";

// Pages
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Logout from "@/pages/Logout";
import Dashboard from "@/pages/Dashboard";
import InventoryManager from "@/pages/LogisticsHub";
import PredictionEngine from "@/pages/PredictionEngine";
import MarketSensing from "@/pages/MarketSensing";
import ExecutionHub from "@/pages/ExecutionHub";
import Analytics from "@/pages/Analytics";
import Alerts from "@/pages/Alerts";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

// FIX: Changed 'JSX.Element' to 'React.ReactNode' to fix the namespace error
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuth = localStorage.getItem("isAuthenticated");
  return isAuth ? <>{children}</> : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
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
      </BrowserRouter>
    </QueryClientProvider>
  );
}