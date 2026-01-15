import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  LineChart, 
  Radio, 
  Truck, 
  PieChart, 
  Bell, 
  LogOut,
  Menu} from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrionLogo } from "@/components/OrionLogo";

const NAV_ITEMS = [
  { label: "Command", path: "/dashboard", icon: LayoutDashboard },
  { label: "Inventory", path: "/dashboard/inventory", icon: Package },
  { label: "Prediction", path: "/dashboard/prediction", icon: LineChart },
  { label: "Sensing", path: "/dashboard/sensing", icon: Radio },
  { label: "Logistics", path: "/dashboard/execution", icon: Truck },
  { label: "Analytics", path: "/dashboard/analytics", icon: PieChart },
  { label: "Alerts", path: "/dashboard/alerts", icon: Bell },
];

export const DashboardLayout = () => {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-blue-500/30">
      
      {/* MOBILE OVERLAY */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900/50 border-r border-slate-800/50 backdrop-blur-xl transition-transform duration-300 ease-in-out flex flex-col
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="h-16 flex items-center px-6 border-b border-slate-800/50">
          <OrionLogo iconSize={20} className="text-xl" />
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500 group-hover:text-blue-400"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/50">
          <Link to="/logout">
            <Button variant="ghost" className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10">
              <LogOut className="w-4 h-4" /> Disconnect
            </Button>
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950 relative">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-96 bg-blue-900/10 blur-[100px] pointer-events-none" />
        
        {/* Mobile Header */}
        <header className="h-16 lg:hidden flex items-center px-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-30">
          <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
          <div className="ml-4"><OrionLogo iconSize={18} className="text-lg" /></div>
        </header>

        {/* Content Injector */}
        <div className="flex-1 p-4 lg:p-8 overflow-auto z-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};