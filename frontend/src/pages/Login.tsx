import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Mail, Lock, Loader2, ScanLine, Binary } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("admin@impact.com");
  const [password, setPassword] = useState("password");
  const [scanPosition, setScanPosition] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setScanPosition((prev) => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem("isAuthenticated", "true");
      navigate("/dashboard");
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center overflow-hidden transition-colors duration-300">
      
      {/* BACKGROUND EFFECTS */}
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 dark:opacity-20 pointer-events-none transition-all duration-300"></div>
      
      {/* Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

      {/* LOGIN CARD */}
      <Card className="relative w-full max-w-md bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-8 shadow-2xl z-10 overflow-hidden group transition-colors duration-300">
        
        {/* SCANNER LINE ANIMATION */}
        <div 
            className="absolute left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent pointer-events-none transition-all duration-75 z-20"
            style={{ top: `${scanPosition}%`, opacity: loading ? 1 : 0.3 }}
        ></div>

        {/* HEADER */}
        <div className="flex flex-col items-center mb-8 relative">
          <div className="relative p-4 mb-4">
             {/* Rotating Ring */}
             <div className="absolute inset-0 rounded-full border border-dashed border-emerald-500/30 animate-[spin_10s_linear_infinite]"></div>
             <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-full border border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-500 relative z-10 shadow-lg shadow-emerald-500/20">
                <ShieldCheck className="w-8 h-8" />
             </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">impAct Command</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-mono uppercase tracking-widest">Secure Access Terminal</p>
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Officer ID / Email</label>
            <div className="relative group/input">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within/input:text-emerald-500 transition-colors" />
              <Input
                type="email"
                placeholder="Email"
                className="pl-10 h-11 bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Security Token</label>
            <div className="relative group/input">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within/input:text-emerald-500 transition-colors" />
              <Input
                type="password"
                placeholder="Password"
                className="pl-10 h-11 bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 transition-all font-mono"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold tracking-wide mt-6 shadow-lg shadow-emerald-500/20 transition-all duration-300 relative overflow-hidden"
          >
            {loading ? (
                <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="animate-pulse">Authenticating...</span>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <ScanLine className="w-5 h-5" />
                    INITIATE SESSION
                </div>
            )}
            
            {/* Button Shine Effect */}
            {!loading && <div className="absolute top-0 -left-10 w-10 h-full bg-white/20 -skew-x-12 animate-[shimmer_2s_infinite]"></div>}
          </Button>
        </form>

        {/* FOOTER */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800/50 flex justify-between items-center text-xs text-slate-500 dark:text-slate-600 font-mono">
            <div className="flex items-center gap-1">
                <Binary className="w-3 h-3" />
                <span>v2.0.4 (STABLE)</span>
            </div>
            <span>ENCRYPTED</span>
        </div>
      </Card>
      
      {/* Floating Particles (Decor) */}
      <div className="absolute bottom-10 left-10 text-slate-900 dark:text-slate-800 opacity-10 animate-bounce delay-700">
          <Binary className="w-24 h-24" />
      </div>
    </div>
  );
}