import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Truck, 
  Navigation, 
  Leaf, 
  CheckCircle2, 
  AlertTriangle,
  RotateCw,
  Wind
} from "lucide-react";

export default function LogisticsHub() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [optimizing, setOptimizing] = useState(false);

  useEffect(() => {
    fetch("http://localhost:3000/api/logistics").then(r => r.json()).then(data => {
        setShipments(data);
        if (data.length > 0) setSelected(data[0]);
    });
  }, []);

  const handleOptimize = () => {
    setOptimizing(true);
    setTimeout(() => setOptimizing(false), 2000); // Simulate AI calculation
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in pb-12">
        
        {/* HEADER - Softer Tone */}
        <div className="flex justify-between items-end border-b border-slate-200 dark:border-white/10 pb-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <Truck className="w-8 h-8 text-blue-500" /> 
                    Logistics Control Tower
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Live fleet tracking and eco-cognitive routing.</p>
            </div>
            {/* Eco Badge */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full flex items-center gap-2">
                <Leaf className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Carbon Neural Net Active</span>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT: FLEET LIST */}
            <div className="space-y-4">
                {shipments.map((shp) => (
                    <div 
                        key={shp.id}
                        onClick={() => setSelected(shp)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                            selected?.id === shp.id 
                            ? 'bg-gradient-to-r from-blue-900/50 to-slate-900/50 border-blue-500/50 backdrop-blur-xl' 
                            : 'bg-white dark:bg-slate-900/40 border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    {shp.id}
                                    {shp.status === 'Delayed' && <AlertTriangle className="w-3 h-3 text-red-500" />}
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">{shp.vehicle}</p>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                                shp.status === 'In Transit' ? 'bg-blue-500/10 text-blue-400' :
                                shp.status === 'Delayed' ? 'bg-red-500/10 text-red-400' :
                                'bg-slate-500/10 text-slate-400'
                            }`}>
                                {shp.status}
                            </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
                            <div className={`h-full rounded-full ${shp.status === 'Delayed' ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${shp.progress}%` }}></div>
                        </div>
                        <div className="flex justify-between mt-2 text-xs font-mono text-slate-400">
                            <span>{shp.origin}</span>
                            <span>{shp.dest}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* RIGHT: LIVE DIGITAL TWIN (2 cols) */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* 1. MAP / ROUTE VISUALIZATION CARD */}
                <Card className="p-0 bg-slate-950/50 border-slate-800/50 shadow-2xl backdrop-blur-sm relative overflow-hidden min-h-[400px] flex flex-col">
                    {/* Fake Map Background Effect */}
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-10 left-10 w-32 h-32 border border-blue-500/20 rounded-full animate-ping"></div>
                        <div className="absolute bottom-20 right-20 w-48 h-48 border border-emerald-500/20 rounded-full animate-pulse"></div>
                    </div>

                    <div className="relative z-10 p-8 flex-1 flex flex-col justify-between">
                        {/* Status Header */}
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-1">Live Route Twin</h2>
                                <p className="text-sm text-slate-400 flex items-center gap-2">
                                    <Navigation className="w-3 h-3" /> {selected?.origin} <span className="opacity-50">to</span> {selected?.dest}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-slate-500 uppercase">Est. Arrival</p>
                                <p className="text-2xl font-mono text-white">{selected?.eta}</p>
                            </div>
                        </div>

                        {/* Progress Timeline */}
                        <div className="flex items-center justify-between gap-4 mt-12 relative">
                            {/* Connector Line */}
                            <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-800 -z-10"></div>
                            <div className="absolute top-1/2 left-0 h-1 bg-blue-500 -z-10 transition-all duration-1000" style={{ width: `${selected?.progress}%` }}></div>

                            {/* Nodes */}
                            <TimelineNode label="Dispatched" completed={true} />
                            <TimelineNode label="In Transit" completed={selected?.progress > 30} current={selected?.progress > 30 && selected?.progress < 60} />
                            <TimelineNode label="Customs" completed={selected?.progress > 60} current={selected?.progress > 60 && selected?.progress < 90} />
                            <TimelineNode label="Delivered" completed={selected?.progress === 100} />
                        </div>

                        {/* Stats Footer */}
                        <div className="grid grid-cols-3 gap-4 mt-12 pt-6 border-t border-white/5">
                            <StatBox label="Vehicle Velocity" value="84 km/h" icon={<Wind className="w-4 h-4 text-blue-400" />} />
                            <StatBox label="Carbon Emission" value={`${selected?.carbon} kg`} icon={<Leaf className="w-4 h-4 text-red-400" />} />
                            <StatBox label="Offset Saved" value={`${selected?.carbonSaved} kg`} icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />} />
                        </div>
                    </div>
                </Card>

                {/* 2. AI OPTIMIZATION PANEL */}
                <Card className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 border-slate-700/50 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <Leaf className="w-5 h-5 text-emerald-500" /> Eco-Cognitive Optimization
                        </h3>
                        <p className="text-sm text-slate-400 mt-1 max-w-md">
                            AI detected a more efficient route. Rerouting saves <span className="text-emerald-400 font-bold">12% Fuel</span> and reduces carbon footprint.
                        </p>
                    </div>
                    <Button 
                        onClick={handleOptimize}
                        disabled={optimizing}
                        className={`h-12 px-6 font-bold rounded-xl transition-all ${
                            optimizing ? 'bg-emerald-600' : 'bg-white text-black hover:bg-emerald-400 hover:text-black'
                        }`}
                    >
                        {optimizing ? (
                            <><RotateCw className="w-4 h-4 mr-2 animate-spin" /> Optimizing...</>
                        ) : (
                            "Reroute Fleet"
                        )}
                    </Button>
                </Card>

            </div>
        </div>
    </div>
  );
}

// Sub-components for Cleaner Code
function TimelineNode({ label, completed, current }: any) {
    return (
        <div className="flex flex-col items-center gap-2">
            <div className={`w-4 h-4 rounded-full border-2 transition-all ${
                completed ? 'bg-blue-500 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 
                current ? 'bg-slate-900 border-blue-500 animate-pulse' : 
                'bg-slate-900 border-slate-700'
            }`}></div>
            <span className={`text-xs font-bold uppercase ${completed || current ? 'text-white' : 'text-slate-600'}`}>{label}</span>
        </div>
    );
}

function StatBox({ label, value, icon }: any) {
    return (
        <div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase mb-1">
                {icon} {label}
            </div>
            <div className="text-2xl font-mono text-white">{value}</div>
        </div>
    );
}