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
  Activity,
  Terminal
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

  // --- CHAOS ENGINE ---
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
        <div className="flex justify-between items-end border-b border-white/10 pb-6">
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <ShieldAlert className="w-8 h-8 text-red-500 animate-pulse" /> 
                    System Alerts
                </h1>
                <p className="text-zinc-400 mt-1 flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Autonomous threat detection active.
                </p>
            </div>
            <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-white/10 rounded-full">
                    <Activity className="w-3 h-3 text-blue-500 animate-pulse" />
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Live Monitoring</span>
                </div>
                <p className="text-[10px] text-zinc-500 font-mono">Last Scan: {lastUpdated}</p>
            </div>
        </div>

        {/* ACTIVE ALERTS LIST */}
        <div className="space-y-4 min-h-[300px]">
            {activeAlerts.length === 0 ? (
                <Card className="p-12 border-dashed border border-emerald-500/20 bg-emerald-500/5 flex flex-col items-center justify-center text-center">
                    <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
                    <h3 className="text-xl font-bold text-white">All Systems Nominal</h3>
                    <p className="text-zinc-500">No active threats detected by Neural Sentinel.</p>
                </Card>
            ) : (
                activeAlerts.map((alert) => (
                    <Card key={alert.id} className={`p-6 border-l-4 ${
                        alert.type === 'CRITICAL' 
                            ? 'border-l-red-500 bg-red-500/10 border-y border-r border-red-500/20' 
                        : alert.type === 'WARNING' 
                            ? 'border-l-yellow-500 bg-yellow-500/10 border-y border-r border-yellow-500/20' 
                        : 'border-l-blue-500 bg-blue-500/10 border-y border-r border-blue-500/20'
                    } shadow-lg relative overflow-hidden backdrop-blur-md`}>
                        
                        <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                        alert.type === 'CRITICAL' ? 'bg-red-500 text-white' : 
                                        alert.type === 'WARNING' ? 'bg-yellow-500 text-black' : 
                                        'bg-blue-500 text-white'
                                    }`}>
                                        {alert.type}
                                    </span>
                                    <span className="text-xs font-mono text-zinc-400 flex items-center gap-1">
                                        <Bot className="w-3 h-3" /> {alert.source} • {alert.timestamp}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    {alert.type === 'CRITICAL' && <ServerCrash className="w-5 h-5 text-red-500"/>}
                                    {alert.type === 'WARNING' && <AlertTriangle className="w-5 h-5 text-yellow-500"/>}
                                    {alert.title}
                                </h3>
                                <p className="text-zinc-300 mt-2 text-sm leading-relaxed">{alert.message}</p>
                            </div>

                            {/* AUTO-FIX ACTION AREA */}
                            <div className="flex items-center">
                                <Button 
                                    onClick={() => handleFix(alert.id)}
                                    disabled={fixing === alert.id}
                                    className={`h-12 px-6 rounded-xl font-bold min-w-[220px] transition-all border ${
                                        alert.type === 'CRITICAL' 
                                            ? 'bg-red-600/20 hover:bg-red-600/40 text-red-200 border-red-500/50' 
                                        : alert.type === 'WARNING' 
                                            ? 'bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-200 border-yellow-500/50'
                                            : 'bg-blue-500/20 hover:bg-blue-500/40 text-blue-200 border-blue-500/50'
                                    }`}
                                >
                                    {fixing === alert.id ? (
                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Resolving...</>
                                    ) : (
                                        <div className="flex flex-col items-start text-left w-full">
                                            <span className="text-[10px] uppercase opacity-70 flex items-center gap-1">
                                                <Terminal className="w-3 h-3" /> Auto-Fix
                                            </span>
                                            <span className="flex items-center gap-2 text-sm">
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

        {/* RESOLVED HISTORY */}
        {resolvedAlerts.length > 0 && (
            <div className="pt-8 border-t border-white/10">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Resolved Incidents</h3>
                <div className="space-y-3">
                    {resolvedAlerts.map((alert) => (
                        <div key={alert.id} className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/5">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                <span className="text-zinc-500 font-medium line-through decoration-zinc-700">{alert.title}</span>
                            </div>
                            <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">RESOLVED</span>
                        </div>
                    ))}
                </div>
            </div>
        )}

    </div>
  );
}