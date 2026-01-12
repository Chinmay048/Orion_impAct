import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Power, ShieldCheck, Lock, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function Logout() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Terminating Session...");

  useEffect(() => {
    // 1. Clear any stored auth tokens (simulated)
    localStorage.removeItem("user_token");
    sessionStorage.clear();

    // 2. Animate the "Shutdown" sequence
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setStatus("Securely Disconnected");
          
          // 3. Redirect to Login after completion
          setTimeout(() => navigate("/login"), 800); 
          return 100;
        }
        // Change status text halfway through
        if (prev > 60) setStatus("Encrypting Logs...");
        return prev + 2; // Fills in approx 2.5 seconds
      });
    }, 40);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-900 border-slate-800 p-8 text-center shadow-2xl relative overflow-hidden">
        
        {/* Background Ambient Glow */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50"></div>

        <div className="flex justify-center mb-6">
          <div className={`p-4 rounded-full transition-all duration-500 ${progress === 100 ? "bg-emerald-500/20 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
            {progress === 100 ? (
                <ShieldCheck className="w-12 h-12 animate-in zoom-in" />
            ) : (
                <Power className="w-12 h-12 animate-pulse" />
            )}
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">
            {progress === 100 ? "System Locked" : "impAct Command"}
        </h1>
        
        <p className="text-slate-400 text-sm mb-8 h-5">
            {status}
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
            <div 
                className={`h-full transition-all ease-out duration-100 ${progress === 100 ? "bg-emerald-500" : "bg-red-500"}`} 
                style={{ width: `${progress}%` }}
            ></div>
        </div>
        
        <div className="flex justify-between text-[10px] uppercase font-bold text-slate-600">
            <span>Server Disconnect</span>
            <span>{progress}%</span>
        </div>

        {progress === 100 && (
            <div className="mt-6 animate-in fade-in slide-in-from-bottom-2">
                <p className="text-emerald-500 text-xs flex items-center justify-center gap-2">
                    <Lock className="w-3 h-3" /> Session Terminated
                </p>
            </div>
        )}
      </Card>
    </div>
  );
}