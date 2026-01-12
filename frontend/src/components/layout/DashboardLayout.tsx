import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  TrendingUp, 
  Radio, 
  Truck, 
  LineChart, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight,
  Menu,
  Package,
  LogOut // <--- Imported LogOut icon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

// Sidebar configuration
const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Package, label: "Inventory", path: "/dashboard/inventory" }, 
  { icon: TrendingUp, label: "Prediction Engine", path: "/dashboard/prediction" },
  { icon: Radio, label: "Market Sensing", path: "/dashboard/sensing" },
  { icon: Truck, label: "Logistics Hub", path: "/dashboard/execution" },
  { icon: LineChart, label: "Analytics", path: "/dashboard/analytics" },
  { icon: AlertTriangle, label: "Alerts", path: "/dashboard/alerts" },
];

export function DashboardLayout() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-50 transition-colors duration-300 font-sans">
      
      {/* MOBILE MENU OVERLAY */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside 
        className={cn(
          "fixed md:relative z-50 h-screen border-r border-slate-200 dark:border-white/10 bg-white dark:bg-neutral-900 transition-all duration-300 flex flex-col",
          isCollapsed ? "w-20" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* LOGO AREA */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-white/5">
          <div className={cn("flex items-center gap-2 overflow-hidden", isCollapsed && "justify-center w-full")}>
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex-shrink-0 flex items-center justify-center text-white font-mono font-bold">iA</div>
            {!isCollapsed && <span className="text-xl font-bold tracking-tight">impAct</span>}
          </div>
          {/* Collapse Button (Desktop Only) */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                  isActive 
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/20" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5",
                  isCollapsed && "justify-center"
                )}
              >
                <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-white" : "text-slate-500 dark:text-slate-400 group-hover:text-emerald-500")} />
                {!isCollapsed && <span>{item.label}</span>}
                
                {/* Tooltip for Collapsed Mode */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* LOGOUT BUTTON AREA (Added Here) */}
        <div className="p-3 border-t border-slate-100 dark:border-white/5">
            <Link 
                to="/logout"
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10",
                  isCollapsed && "justify-center"
                )}
            >
                <LogOut className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                {!isCollapsed && <span>Logout</span>}
            </Link>
        </div>

        {/* USER PROFILE */}
        <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-black/20">
           <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
             <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white dark:ring-black shadow-sm">
               JS
             </div>
             {!isCollapsed && (
               <div className="overflow-hidden">
                 <p className="text-sm font-medium truncate">Jane Smith</p>
                 <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Logistics Manager</p>
               </div>
             )}
           </div>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* TOP HEADER */}
        <header className="h-16 border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-black/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button className="md:hidden" onClick={() => setIsMobileOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-sm font-bold text-slate-900 dark:text-white hidden sm:block">
                Operations Dashboard
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                System Status: <span className="text-emerald-500 font-medium">Optimal</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                LIVE FEED
             </div>
             <ThemeToggle />
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}