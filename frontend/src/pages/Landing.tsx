import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  ArrowRight, 
  Activity, 
  Cpu, 
  Terminal,
  ChevronRight,
  Boxes
} from "lucide-react";

export default function Landing() {
  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 overflow-hidden flex flex-col font-sans selection:bg-emerald-500/30">
      
      {/* --- BACKGROUND FX --- */}
      {/* Dynamic Grid: Gray in Light Mode, Slate in Dark Mode */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 dark:opacity-20 pointer-events-none transition-all duration-300"></div>
      
      {/* Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      
      {/* --- HEADER --- */}
      <header className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto w-full">
        
        {/* === BRAND LOGO: impAct === */}
        <div className="flex items-center gap-3 group cursor-default">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)] group-hover:scale-105 transition-transform duration-300">
                <span className="font-mono font-bold text-lg text-white">iA</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              impAct
            </span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
             {/* System Status Badge (Hidden on Mobile) */}
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-xs font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    SYSTEM ONLINE
                </span>
            </div>
            
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Login Button */}
            <Link to="/login">
                <Button variant="outline" className="border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:border-emerald-500/50 transition-all">
                    Console Login
                </Button>
            </Link>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center mt-10 md:mt-20 max-w-5xl mx-auto">
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 text-xs font-mono mb-8 backdrop-blur-md animate-in slide-in-from-bottom-4 fade-in duration-700 shadow-sm">
            <Terminal className="w-3 h-3" />
            <span>v2.0 // WAR ROOM READY</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-in slide-in-from-bottom-8 fade-in duration-1000 bg-clip-text text-transparent bg-gradient-to-b from-slate-900 via-slate-800 to-slate-500 dark:from-white dark:via-white dark:to-slate-500">
          Supply Chain Intelligence <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">Reimagined.</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-10 animate-in slide-in-from-bottom-10 fade-in duration-1000 delay-200 leading-relaxed">
          Predict shortages, optimize logistics, and stabilize prices with a military-grade operating system for <strong>modern manufacturing</strong>.
        </p>

        <div className="animate-in slide-in-from-bottom-12 fade-in duration-1000 delay-300">
            <Link to="/login">
                <Button className="h-14 px-8 bg-emerald-600 hover:bg-emerald-500 text-white text-lg font-bold tracking-wide shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 transition-all duration-300 relative overflow-hidden group">
                    <span className="relative z-10 flex items-center gap-3">
                        ENTER WAR ROOM
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute top-0 -left-full w-full h-full bg-white/20 skew-x-[-20deg] group-hover:animate-[shimmer_1s_infinite]"></div>
                </Button>
            </Link>
        </div>

        {/* --- FEATURE GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full animate-in slide-in-from-bottom-16 fade-in duration-1000 delay-500">
            <FeatureCard 
                icon={<Cpu className="w-6 h-6 text-amber-500 dark:text-amber-400" />}
                title="Predictive AI"
                desc="Forecast demand spikes 7 days in advance using neural elasticity modeling."
                delay="delay-0"
            />
            <FeatureCard 
                icon={<Activity className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />}
                title="Real-Time Sensing"
                desc="Live data feeds from 50+ logistics hubs and market nodes across the network."
                delay="delay-100"
            />
            <FeatureCard 
                icon={<Boxes className="w-6 h-6 text-blue-500 dark:text-blue-400" />}
                title="Smart Execution"
                desc="Automated routing and procurement protocols to prevent critical wastage."
                delay="delay-200"
            />
        </div>
      </main>

      <footer className="relative z-10 py-8 text-center text-slate-500 dark:text-slate-600 text-xs font-mono border-t border-slate-200 dark:border-slate-800/50 mt-20 bg-white/50 dark:bg-slate-950/80 backdrop-blur-sm">
        <p>SECURE CONNECTION ESTABLISHED // ENCRYPTED: AES-256</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc, delay }: any) {
    return (
        <div className={`p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 backdrop-blur-md hover:shadow-lg dark:hover:bg-slate-800/60 hover:border-emerald-500/30 transition-all duration-300 text-left group ${delay}`}>
            <div className="w-12 h-12 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                {title}
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-slate-500 -translate-x-2 group-hover:translate-x-0 transition-all" />
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                {desc}
            </p>
        </div>
    )
}