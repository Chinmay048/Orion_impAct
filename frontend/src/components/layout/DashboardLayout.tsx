import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  LineChart, 
  Radio, 
  Truck, 
  PieChart, 
  Bell, 
  LogOut,
  Menu,
  Search,
  UserCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Inventory", path: "/dashboard/inventory", icon: Package },
  { label: "Prediction", path: "/dashboard/prediction", icon: LineChart },
  { label: "Sensing", path: "/dashboard/sensing", icon: Radio },
  { label: "Logistics", path: "/dashboard/execution", icon: Truck },
  { label: "Analytics", path: "/dashboard/analytics", icon: PieChart },
  { label: "Alerts", path: "/dashboard/alerts", icon: Bell },
];

export const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-black text-white flex font-sans selection:bg-sky-500/30 overflow-hidden relative">
      
      {/* --- BACKGROUND GRID --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-0 left-0 w-full h-96 bg-blue-900/10 blur-[120px] pointer-events-none" />
      </div>

      {/* --- SIDEBAR (Fixed Left) --- */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-zinc-950/80 border-r border-white/10 backdrop-blur-xl transition-transform duration-300 ease-in-out flex flex-col
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        {/* LOGO */}
        <div className="h-16 flex items-center px-6 border-b border-white/5">
             <img 
                src="/Orion_impAct/logo1.png" 
                alt="impAct Logo" 
                className="h-8 w-auto object-contain drop-shadow-[0_0_15px_rgba(56,189,248,0.5)] cursor-pointer hover:scale-105 transition-transform"
                onClick={() => navigate("/dashboard")}
             />
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden ${
                  isActive 
                    ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]" 
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 z-10 ${isActive ? "text-white" : "text-zinc-500 group-hover:text-white"}`} />
                <span className="z-10">{item.label}</span>
                {!isActive && ( <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" /> )}
              </Link>
            );
          })}
        </nav>

        {/* DISCONNECT */}
        <div className="p-4 border-t border-white/5 bg-zinc-900/30">
            <Button 
                variant="ghost" 
                onClick={handleLogout}
                className="w-full justify-start gap-3 text-red-400 hover:text-white hover:bg-red-500/20 transition-all duration-300 group"
            >
              <LogOut className="w-4 h-4 group-hover:rotate-180 transition-transform" /> 
              Disconnect
            </Button>
        </div>
      </aside>

      {/* --- MAIN CONTENT WRAPPER --- */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10 h-screen">
        
        {/* === TOP BAR === */}
        <header className="h-16 border-b border-white/10 bg-zinc-950/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-40">
            
            {/* Left: Mobile Toggle & Search */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(true)} className="lg:hidden text-white hover:bg-white/10">
                    <Menu className="w-5 h-5" />
                </Button>
                
                {/* Search Bar */}
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-sm focus-within:bg-white/10 focus-within:text-white transition-colors w-64">
                    <Search className="w-4 h-4" />
                    <input 
                        type="text" 
                        placeholder="Search system nodes..." 
                        className="bg-transparent border-none outline-none w-full placeholder:text-zinc-600"
                    />
                </div>
            </div>

            {/* Right: Notifications & User Profile */}
            <div className="flex items-center gap-6">
                
                {/* --- CONNECTED ALERT BUTTON --- */}
                <Link to="/dashboard/alerts" className="relative p-2 text-zinc-400 hover:text-white transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                </Link>

                {/* User Profile */}
                <div className="flex items-center gap-3 pl-2 cursor-pointer group border-l border-white/10 ml-2">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-white leading-none group-hover:text-blue-400 transition-colors">User</p>
                    </div>
                    <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-[1px]">
                        <div className="h-full w-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                             <UserCircle className="w-full h-full text-zinc-400" />
                        </div>
                    </div>
                </div>

            </div>
        </header>

        {/* --- PAGE CONTENT --- */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
             <Outlet />
        </main>
      
      </div>
    </div>
  );
};