import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Truck, Navigation, Leaf, CheckCircle2, 
  AlertTriangle, Wind, Box, Clock,
  PackageCheck, Share2, Zap, Loader2
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function LogisticsHub() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<string>("--:--");
  const [progress, setProgress] = useState(0);
  const [nextDelivery, setNextDelivery] = useState<any>(null);
  
  // State to track optimizations per shipment ID
  const [optimizationState, setOptimizationState] = useState<Record<string, any>>({});
  const [isOptimizing, setIsOptimizing] = useState(false);

  // --- FETCH & SYNC DATA ---
  const fetchData = async () => {
    try {
        const res = await fetch(`${API_URL}/api/logistics`);
        if (res.ok) {
            const data = await res.json();
            // Filter: Only show Active or Recently Delivered
            const activeData = data.filter((s: any) => s.status !== 'Delivered')
                                    .sort((a:any, b:any) => a.arrivalTime - b.arrivalTime);
            
            setShipments(activeData);
            
            // Auto-select logic
            if (activeData.length > 0) {
                if (!selectedId || !activeData.find((s:any) => s.id === selectedId)) {
                    setSelectedId(activeData[0].id);
                }
                setNextDelivery(activeData.length > 1 ? activeData[1] : null);
            } else {
                setNextDelivery(null);
            }
        }
    } catch (e) { console.error("API Error", e); }
  };

  useEffect(() => { 
      fetchData();
      const interval = setInterval(fetchData, 3000); // Poll backend
      return () => clearInterval(interval);
  }, []);

  // --- REAL-TIME TIMER ENGINE ---
  useEffect(() => {
      const timer = setInterval(() => {
          const activeShipment = shipments.find(s => s.id === selectedId);
          
          if (activeShipment && activeShipment.arrivalTime) {
              const now = Date.now();
              const totalDuration = activeShipment.arrivalTime - activeShipment.startTime;
              const remaining = activeShipment.arrivalTime - now;
              
              if (remaining <= 0) {
                  setTimeLeft("ARRIVED");
                  setProgress(100);
                  if (activeShipment.status !== "Delivered") {
                      handleDelivery(activeShipment.id);
                  }
              } else {
                  const minutes = Math.floor((remaining / 1000 / 60) % 60);
                  const seconds = Math.floor((remaining / 1000) % 60);
                  setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
                  
                  const elapsed = now - activeShipment.startTime;
                  const pct = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
                  setProgress(pct);
              }
          }
      }, 100); 
      return () => clearInterval(timer);
  }, [selectedId, shipments]);

  const handleDelivery = async (id: string) => {
      await fetch(`${API_URL}/api/shipment/receive`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id })
      });
  };

  // --- ECO-OPTIMIZATION LOGIC ---
  const handleOptimizeRoute = () => {
    if (!selectedId) return;
    setIsOptimizing(true);

    const current = shipments.find(s => s.id === selectedId);
    if (!current) {
        setIsOptimizing(false);
        return;
    }

    // 1. Search for CONSOLIDATION opportunities
    // Logic: Look for another shipment with same Origin & Destination that isn't the current one
    const consolidationMatch = shipments.find(s => 
        s.id !== current.id && 
        s.origin === current.origin && 
        s.dest === current.dest
    );

    setTimeout(() => {
        let result;

        if (consolidationMatch) {
            // SCENARIO A: Consolidation Found
            result = {
                type: 'CONSOLIDATED',
                message: `Merged with Fleet #${consolidationMatch.id}`,
                vehicle: `${consolidationMatch.vehicle} (Shared)`,
                carbon: (current.carbon || 100) * 0.4, // 60% reduction due to shared vehicle
                offset: (4.2 + (current.carbon * 0.6)).toFixed(1),
                details: "Capacity found in existing transit."
            };
        } else {
            // SCENARIO B: No Match, apply Eco-Routing Algo
            result = {
                type: 'ECO_ROUTE',
                message: 'Green Corridor Route Applied',
                vehicle: current.vehicle,
                carbon: (current.carbon || 100) * 0.85, // 15% reduction
                offset: (4.2 + (current.carbon * 0.15)).toFixed(1),
                details: "Route optimized for fuel efficiency."
            };
        }

        setOptimizationState(prev => ({
            ...prev,
            [selectedId]: result
        }));
        setIsOptimizing(false);
    }, 1500); // Simulate calculation delay
  };

  const selected = shipments.find(s => s.id === selectedId) || shipments[0];
  const optData = optimizationState[selectedId]; // Get optimization data if it exists

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in pb-12">
        
        {/* HEADER */}
        <div className="flex justify-between items-end border-b border-white/10 pb-6">
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Truck className="w-8 h-8 text-blue-500" /> 
                    Logistics Control Tower
                </h1>
                <p className="text-zinc-400 mt-1">Live fleet tracking and eco-cognitive routing.</p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full flex items-center gap-2">
                <Leaf className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Carbon Neural Net Active</span>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT: FLEET LIST */}
            <div className="space-y-4 h-[600px] overflow-y-auto custom-scrollbar pr-2">
                {shipments.map((shp) => (
                    <div 
                        key={shp.id}
                        onClick={() => setSelectedId(shp.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 group ${
                            selectedId === shp.id 
                            ? 'bg-zinc-900 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] relative overflow-hidden' 
                            : 'bg-zinc-900/40 border-white/5 hover:bg-zinc-900/60 hover:border-white/10'
                        }`}
                    >
                        {selectedId === shp.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>}
                        
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-bold text-white flex items-center gap-2 font-mono">
                                    {shp.id}
                                    {/* Show Icon if Optimized */}
                                    {optimizationState[shp.id]?.type === 'CONSOLIDATED' && <Share2 className="w-3 h-3 text-purple-400" />}
                                    {optimizationState[shp.id]?.type === 'ECO_ROUTE' && <Leaf className="w-3 h-3 text-emerald-400" />}
                                </h3>
                                <p className="text-xs text-zinc-500 mt-1">
                                    {optimizationState[shp.id]?.vehicle || shp.vehicle}
                                </p>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase border ${
                                shp.status === 'In Transit' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                'bg-zinc-800 text-zinc-400 border-zinc-700'
                            }`}>
                                {shp.status}
                            </span>
                        </div>
                        
                        {/* Mini Progress */}
                        <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
                            <div 
                                className="h-full rounded-full bg-blue-500"
                                style={{ width: selectedId === shp.id ? `${progress}%` : '50%' }}
                            ></div>
                        </div>
                        
                        <div className="flex justify-between mt-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
                            <span>{shp.origin}</span>
                            <span>{shp.dest}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* RIGHT: LIVE DIGITAL TWIN */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* 1. MAP / ROUTE VISUALIZATION CARD */}
                <Card className="p-0 bg-zinc-950 border-white/10 shadow-2xl relative overflow-hidden min-h-[420px] flex flex-col">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

                    <div className="relative z-10 p-8 flex-1 flex flex-col justify-center">
                        {/* Status Header */}
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                                    Live Route Twin
                                    <span className="animate-pulse w-2 h-2 rounded-full bg-emerald-500"></span>
                                </h2>
                                <p className="text-sm text-zinc-400 flex items-center gap-2">
                                    <Navigation className="w-3 h-3 text-blue-500" /> {selected?.origin || "--"} <span className="opacity-50">➔</span> {selected?.dest || "--"}
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded border border-white/10">
                                        <Box className="w-3 h-3 text-zinc-400" />
                                        <span className="text-xs text-zinc-300 font-mono">{selected?.cargo || "No Shipment"} ({selected?.quantity || 0}T)</span>
                                    </div>
                                    {/* Dynamic Badge based on Optimization */}
                                    {optData && (
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded border animate-in fade-in slide-in-from-left-2 ${
                                            optData.type === 'CONSOLIDATED' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                        }`}>
                                            {optData.type === 'CONSOLIDATED' ? <Share2 className="w-3 h-3" /> : <Leaf className="w-3 h-3" />}
                                            <span className="text-xs font-bold uppercase">{optData.message}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Time to Arrival</p>
                                <p className="text-5xl font-mono text-white tracking-tight flex items-center gap-2 justify-end">
                                    <Clock className="w-6 h-6 text-blue-500" />
                                    {timeLeft}
                                </p>
                            </div>
                        </div>

                        {/* Progress Timeline */}
                        <div className="flex items-center justify-between gap-4 mt-16 mb-8 relative px-4">
                            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-zinc-800 -z-10"></div>
                            <div className="absolute top-1/2 left-0 h-0.5 bg-blue-500 -z-10 transition-all duration-1000 shadow-[0_0_10px_#3b82f6]" style={{ width: `${progress}%` }}></div>

                            <TimelineNode label="Dispatched" completed={true} />
                            <TimelineNode label="In Transit" completed={progress > 30} current={progress > 30 && progress < 60} />
                            <TimelineNode label="Customs" completed={progress > 60} current={progress > 60 && progress < 90} />
                            <TimelineNode label="Delivered" completed={progress >= 100} />
                        </div>

                        {/* Stats Footer & Optimization Controls */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pt-6 border-t border-white/5 items-center">
                            
                            {/* COL 1: Optimization Action (Replaces Velocity) */}
                            <div>
                                {optData ? (
                                    <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                                        <div className="text-xs text-emerald-400 font-bold uppercase flex items-center gap-2 mb-1">
                                            <CheckCircle2 className="w-3 h-3"/> Optimization Active
                                        </div>
                                        <div className="text-[10px] text-zinc-400 leading-tight">
                                            {optData.details}
                                        </div>
                                    </div>
                                ) : (
                                    <Button 
                                        onClick={handleOptimizeRoute}
                                        disabled={isOptimizing || !selected}
                                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-900/20 transition-all active:scale-95"
                                    >
                                        {isOptimizing ? <Loader2 className="w-4 h-4 animate-spin"/> : <Zap className="w-4 h-4 mr-2"/>}
                                        {isOptimizing ? "Analyzing Fleet..." : "Reduce Carbon Impact"}
                                    </Button>
                                )}
                            </div>

                            {/* COL 2: Carbon Emission (Dynamic) */}
                            <StatBox 
                                label="Carbon Emission" 
                                value={`${optData ? Math.round(optData.carbon) : selected?.carbon || 0} kg`} 
                                icon={<Leaf className={`w-4 h-4 ${optData ? 'text-emerald-400' : 'text-zinc-400'}`} />} 
                                highlight={!!optData}
                            />

                            {/* COL 3: Offset Saved (Dynamic) */}
                            <StatBox 
                                label="Offset Saved" 
                                value={`${optData ? optData.offset : "4.2"} kg`} 
                                icon={<CheckCircle2 className={`w-4 h-4 ${optData ? 'text-emerald-400' : 'text-zinc-400'}`} />} 
                                highlight={!!optData}
                            />
                        </div>
                    </div>
                </Card>

                {/* 2. NEXT ORDER ELEMENT */}
                {nextDelivery && (
                    <Card className="p-4 bg-zinc-900 border-white/10 flex items-center justify-between animate-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                <PackageCheck className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Up Next in Queue</p>
                                <p className="text-white font-medium text-sm flex items-center gap-2">
                                    {nextDelivery.id} <span className="text-zinc-600">|</span> {nextDelivery.cargo}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-zinc-500">Destination</p>
                            <p className="text-white font-mono text-sm">{nextDelivery.dest}</p>
                        </div>
                    </Card>
                )}

            </div>
        </div>
    </div>
  );
}

function TimelineNode({ label, completed, current }: any) {
    return (
        <div className="flex flex-col items-center gap-3 relative">
            <div className={`w-3 h-3 rounded-full border-2 transition-all duration-500 z-10 ${
                completed ? 'bg-blue-500 border-blue-500 shadow-[0_0_10px_#3b82f6]' : 
                current ? 'bg-zinc-950 border-blue-500 animate-pulse' : 
                'bg-zinc-950 border-zinc-700'
            }`}></div>
            <span className={`text-[10px] font-bold uppercase tracking-wider absolute -bottom-6 whitespace-nowrap ${completed || current ? 'text-white' : 'text-zinc-600'}`}>
                {label}
            </span>
        </div>
    );
}

function StatBox({ label, value, icon, highlight }: any) {
    return (
        <div className={`transition-colors duration-500 ${highlight ? 'bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10' : ''}`}>
            <div className={`flex items-center gap-2 text-[10px] font-bold uppercase mb-1 ${highlight ? 'text-emerald-400' : 'text-zinc-500'}`}>
                {icon} {label}
            </div>
            <div className={`text-xl font-mono tracking-tight ${highlight ? 'text-emerald-300' : 'text-white'}`}>{value}</div>
        </div>
    );
}