import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  ShieldAlert, 
  Bot, 
  Loader2, 
  ArrowRight,
  ServerCrash,
  AlertTriangle,
  Activity
} from "lucide-react";

// --- CHAOS ENGINE DATA POOL ---
const ALERT_TEMPLATES = [
    { type: "CRITICAL", source: "Inventory AI", title: "Stock Depletion Imminent", message: "Pune Factory Titanium reserves < 48 hours.", fix: "Initiate Emergency Transfer" },
    { type: "WARNING", source: "Market Sentinel", title: "Price Surge Detected", message: "Lithium ion global index up 12% in 4h.", fix: "Lock Supplier Contract" },
    { type: "INFO", source: "Cyber Security", title: "API Latency Spike", message: "Gateway response time > 400ms.", fix: "Reroute Traffic" },
    { type: "WARNING", source: "Logistics Hub", title: "Shipment Delayed", message: "Container #442 stuck at customs.", fix: "File Expedited Clearance" },
    { type: "INFO", source: "Sustainability", title: "Carbon Limit Reached", message: "Monthly CO2 quota 95% utilized.", fix: "Switch to Rail Freight" },
    { type: "CRITICAL", source: "Quality Control", title: "Defect Rate Spike", message: "Batch #992 showing 15% failure.", fix: "Halt Production Line A" },
    { type: "WARNING", source: "Demand Forecaster", title: "Unusual Demand", message: "Sudden order spike from Northern Region.", fix: "Increase Safety Stock" }
];

export default function Alerts() {
  const [alerts, setAlerts] = useState<any[]>([
     { ...ALERT_TEMPLATES[0], id: 1, status: "Active", timestamp: "Just now" },
     { ...ALERT_TEMPLATES[3], id: 2, status: "Active", timestamp: "2m ago" }
  ]);
  const [fixing, setFixing] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("Just now");

  // --- CHAOS ENGINE: GENERATE RANDOM ALERTS ---
  useEffect(() => {
    const interval = setInterval(() => {
        if (Math.random() > 0.6) {
            const template = ALERT_TEMPLATES[Math.floor(Math.random() * ALERT_TEMPLATES.length)];
            const newAlert = {
                ...template,
                id: Date.now(),
                status: "Active",
                timestamp: "Just now"
            };
            setAlerts(prev => [newAlert, ...prev].slice(0, 5)); 
            setLastUpdated(new Date().toLocaleTimeString());
        }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleFix = (id: number) => {
    setFixing(id);
    setTimeout(() => {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: "Resolved" } : a));
        setFixing(null);
    }, 1500);
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
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Autonomous threat detection active.
                </p>
            </div>
            <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/10">
                    <Activity className="w-3 h-3 text-blue-500 animate-pulse" />
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest">Live Monitoring</span>
                </div>
                <p className="text-[10px] text-slate-400">Last Scan: {lastUpdated}</p>
            </div>
        </div>

        {/* ACTIVE ALERTS LIST */}
        <div className="space-y-4 min-h-[300px]">
            {activeAlerts.length === 0 ? (
                <Card className="p-12 border-dashed border-2 border-emerald-500/20 bg-emerald-500/5 flex flex-col items-center justify-center text-center animate-in fade-in">
                    <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">All Systems Nominal</h3>
                    <p className="text-slate-400">No active threats detected by Neural Sentinel.</p>
                </Card>
            ) : (
                activeAlerts.map((alert) => (
                    <Card key={alert.id} className={`p-6 border-l-4 ${
                        alert.type === 'CRITICAL' 
                            ? 'border-l-red-500 bg-red-50 dark:bg-red-950/40 border-y border-r border-red-100 dark:border-red-900/50' 
                        : alert.type === 'WARNING' 
                            ? 'border-l-amber-500 bg-amber-50 dark:bg-amber-950/40 border-y border-r border-amber-100 dark:border-amber-900/50' 
                        : 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/40 border-y border-r border-blue-100 dark:border-blue-900/50'
                    } shadow-lg relative overflow-hidden animate-in slide-in-from-bottom-2 duration-500`}>
                        
                        <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                        alert.type === 'CRITICAL' ? 'bg-red-500 text-white' : 
                                        alert.type === 'WARNING' ? 'bg-amber-500 text-black' : 
                                        'bg-blue-500 text-white'
                                    }`}>
                                        {alert.type}
                                    </span>
                                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                        <Bot className="w-3 h-3" /> {alert.source} • {alert.timestamp}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    {alert.type === 'CRITICAL' && <ServerCrash className="w-5 h-5 text-red-500"/>}
                                    {alert.type === 'WARNING' && <AlertTriangle className="w-5 h-5 text-amber-500"/>}
                                    {alert.title}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-300 mt-2 text-sm leading-relaxed">{alert.message}</p>
                            </div>

                            {/* AUTO-FIX ACTION AREA */}
                            <div className="flex items-center">
                                <Button 
                                    onClick={() => handleFix(alert.id)}
                                    disabled={fixing === alert.id}
                                    className={`h-12 px-6 rounded-xl font-bold min-w-[200px] transition-all border ${
                                        alert.type === 'CRITICAL' 
                                            ? 'bg-red-600 hover:bg-red-500 text-white border-red-500 shadow-lg shadow-red-900/20' 
                                        : alert.type === 'WARNING' 
                                            ? 'bg-amber-500 hover:bg-amber-400 text-black border-amber-400 shadow-lg shadow-amber-900/20'
                                        : 'bg-slate-800 dark:bg-slate-700 hover:bg-slate-600 text-white border-slate-600'
                                    }`}
                                >
                                    {fixing === alert.id ? (
                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Resolving...</>
                                    ) : (
                                        <div className="flex flex-col items-start text-left">
                                            <span className="text-[10px] uppercase opacity-80">Auto-Fix Recommendation</span>
                                            <span className="flex items-center gap-1 text-sm">
                                                {alert.fix} <ArrowRight className="w-4 h-4" />
                                            </span>
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Subtle background glow for dark mode */}
                        <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br opacity-10 blur-3xl rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2 ${
                             alert.type === 'CRITICAL' ? 'from-red-500 to-transparent' :
                             alert.type === 'WARNING' ? 'from-amber-500 to-transparent' :
                             'from-blue-500 to-transparent'
                        }`}></div>
                    </Card>
                ))
            )}
        </div>

        {/* RESOLVED HISTORY */}
        {resolvedAlerts.length > 0 && (
            <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Resolved Incidents</h3>
                <div className="space-y-3">
                    {resolvedAlerts.map((alert) => (
                        <div key={alert.id} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/5 animate-in fade-in slide-in-from-left-2">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                <span className="text-slate-500 dark:text-slate-400 font-medium line-through decoration-slate-400/50">{alert.title}</span>
                            </div>
                            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-500/20 px-2 py-1 rounded">RESOLVED</span>
                        </div>
                    ))}
                </div>
            </div>
        )}

    </div>
  );
}