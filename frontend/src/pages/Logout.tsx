import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Power, ShieldCheck, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { OrionLogo } from "@/components/OrionLogo";

export default function Logout() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Terminating Neural Link...");

  useEffect(() => {
    localStorage.removeItem("isAuthenticated");
    sessionStorage.clear();

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setStatus("Securely Disconnected");
          setTimeout(() => navigate("/login"), 800); 
          return 100;
        }
        if (prev > 60) setStatus("Encrypting Session Logs...");
        return prev + 2; 
      });
    }, 40);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
       {/* Background Effects */}
       <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
       <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent"></div>

      <Card className="w-full max-w-md bg-slate-900/60 border-slate-800 p-10 text-center shadow-2xl relative backdrop-blur-md z-10">
        <div className="flex justify-center mb-8">
          <div className={`p-4 rounded-full transition-all duration-500 ${progress === 100 ? "bg-emerald-500/20 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]" : "bg-blue-500/10 text-blue-500"}`}>
            {progress === 100 ? (
                <ShieldCheck className="w-12 h-12 animate-in zoom-in" />
            ) : (
                <Power className="w-12 h-12 animate-pulse" />
            )}
          </div>
        </div>

        <div className="mb-6 flex justify-center">
            <OrionLogo iconSize={20} className="text-xl" />
        </div>
        
        <p className="text-slate-400 text-sm mb-8 font-mono tracking-wide">
            {status}
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800/50 h-1.5 rounded-full overflow-hidden mb-2">
            <div 
                className={`h-full transition-all ease-out duration-100 ${progress === 100 ? "bg-emerald-500" : "bg-blue-500"}`} 
                style={{ width: `${progress}%` }}
            ></div>
        </div>
        
        <div className="flex justify-between text-[10px] uppercase font-bold text-slate-600 mt-2">
            <span>System Disconnect</span>
            <span>{progress}%</span>
        </div>

        {progress === 100 && (
            <div className="mt-6 animate-in fade-in slide-in-from-bottom-2">
                <p className="text-emerald-500 text-xs flex items-center justify-center gap-2 font-bold tracking-widest">
                    <Lock className="w-3 h-3" /> SESSION TERMINATED
                </p>
            </div>
        )}
      </Card>
    </div>
  );
}