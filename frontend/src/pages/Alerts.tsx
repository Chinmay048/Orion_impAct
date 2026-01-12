import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  ShieldAlert, 
  Bot, 
  Loader2, 
  ArrowRight,
  RefreshCw
} from "lucide-react";

export default function Alerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [fixing, setFixing] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("Just now");

  const fetchAlerts = async () => {
    try {
        const res = await fetch("http://localhost:3000/api/alerts");
        const data = await res.json();
        setAlerts(data);
        setLastUpdated(new Date().toLocaleTimeString());
    } catch (e) {
        console.error(e);
    }
  };

  useEffect(() => {
    fetchAlerts();
    // Auto-refresh every 8 seconds to simulate live threats
    const interval = setInterval(fetchAlerts, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleFix = (id: number) => {
    setFixing(id);
    // Simulate AI Resolution Process
    setTimeout(() => {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: "Resolved" } : a));
        setFixing(null);
    }, 2000);
  };

  const activeAlerts = alerts.filter(a => a.status === "Active");
  const resolvedAlerts = alerts.filter(a => a.status === "Resolved");

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in pb-12">
        
        {/* HEADER */}
        <div className="flex justify-between items-end border-b border-slate-200 dark:border-white/10 pb-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <ShieldAlert className="w-8 h-8 text-red-500 animate-pulse" /> 
                    System Alerts
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Autonomous threat detection active.
                </p>
            </div>
            <div className="flex flex-col items-end gap-2">
                <Button variant="outline" size="sm" onClick={fetchAlerts} className="gap-2">
                    <RefreshCw className="w-4 h-4" /> Refresh Feed
                </Button>
                <p className="text-[10px] text-slate-500">Last Scan: {lastUpdated}</p>
            </div>
        </div>

        {/* ACTIVE ALERTS LIST */}
        <div className="space-y-4 min-h-[300px]">
            {activeAlerts.length === 0 ? (
                <Card className="p-12 border-dashed border-2 border-emerald-500/20 bg-emerald-500/5 flex flex-col items-center justify-center text-center animate-in fade-in">
                    <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
                    <h3 className="text-xl font-bold text-white">All Systems Nominal</h3>
                    <p className="text-slate-400">No active threats detected by Neural Sentinel.</p>
                </Card>
            ) : (
                activeAlerts.map((alert) => (
                    <Card key={alert.id} className={`p-6 border-l-4 ${
                        alert.type === 'CRITICAL' ? 'border-l-red-500 bg-red-950/10' : 
                        alert.type === 'WARNING' ? 'border-l-amber-500 bg-amber-950/10' : 
                        'border-l-blue-500 bg-blue-950/10'
                    } border-y border-r border-slate-200 dark:border-white/10 shadow-lg relative overflow-hidden animate-in slide-in-from-right-4 duration-500`}>
                        
                        <div className="flex flex-col md:flex-row justify-between gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                        alert.type === 'CRITICAL' ? 'bg-red-500 text-white' : 
                                        alert.type === 'WARNING' ? 'bg-amber-500 text-black' : 
                                        'bg-blue-500 text-white'
                                    }`}>
                                        {alert.type}
                                    </span>
                                    <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                                        <Bot className="w-3 h-3" /> {alert.source}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-white">{alert.title}</h3>
                                <p className="text-slate-400 mt-1 text-sm">{alert.message}</p>
                            </div>

                            {/* AUTO-FIX ACTION AREA */}
                            <div className="flex items-center">
                                <Button 
                                    onClick={() => handleFix(alert.id)}
                                    disabled={fixing === alert.id}
                                    className={`h-12 px-6 rounded-xl font-bold min-w-[200px] transition-all ${
                                        alert.type === 'CRITICAL' ? 'bg-red-600 hover:bg-red-500 text-white' : 
                                        'bg-slate-100 dark:bg-white text-black hover:bg-emerald-400'
                                    }`}
                                >
                                    {fixing === alert.id ? (
                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Resolving...</>
                                    ) : (
                                        <div className="flex flex-col items-start text-left">
                                            <span className="text-[10px] uppercase opacity-70">Auto-Fix Recommendation</span>
                                            <span className="flex items-center gap-1">
                                                {alert.fix} <ArrowRight className="w-4 h-4" />
                                            </span>
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))
            )}
        </div>

        {/* RESOLVED HISTORY (Fade out effect) */}
        {resolvedAlerts.length > 0 && (
            <div className="pt-8 border-t border-slate-800">
                <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">Recently Resolved</h3>
                <div className="space-y-3 opacity-60">
                    {resolvedAlerts.map((alert) => (
                        <div key={alert.id} className="flex justify-between items-center p-4 bg-slate-900 rounded-lg border border-slate-800 animate-out fade-out slide-out-to-left-2">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                <span className="text-slate-300 font-medium line-through decoration-slate-600">{alert.title}</span>
                            </div>
                            <span className="text-xs font-mono text-emerald-500">RESOLVED BY AI</span>
                        </div>
                    ))}
                </div>
            </div>
        )}

    </div>
  );
}