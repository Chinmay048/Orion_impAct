import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { 
  Truck, Navigation, Leaf, CheckCircle2, 
  AlertTriangle, Wind, Box, Clock,
  PackageCheck
} from "lucide-react";

export default function LogisticsHub() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<string>("--:--");
  const [progress, setProgress] = useState(0);
  const [nextDelivery, setNextDelivery] = useState<any>(null);

  // --- FETCH & SYNC DATA ---
  const fetchData = async () => {
    try {
        const res = await fetch("http://localhost:3000/api/logistics");
        if (res.ok) {
            const data = await res.json();
            // Filter: Only show Active or Recently Delivered
            const activeData = data.filter((s: any) => s.status !== 'Delivered')
                                   .sort((a:any, b:any) => a.arrivalTime - b.arrivalTime);
            
            setShipments(activeData);
            
            // Auto-select logic
            if (activeData.length > 0) {
                // If nothing selected, or selected item is gone/delivered, select first
                if (!selectedId || !activeData.find((s:any) => s.id === selectedId)) {
                    setSelectedId(activeData[0].id);
                }
                // Set Next Delivery (2nd item in list)
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
                  // Trigger backend to add stock if it just arrived
                  if (activeShipment.status !== "Delivered") {
                      handleDelivery(activeShipment.id);
                  }
              } else {
                  // Format Time MM:SS
                  const minutes = Math.floor((remaining / 1000 / 60) % 60);
                  const seconds = Math.floor((remaining / 1000) % 60);
                  setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
                  
                  // Calculate Progress %
                  const elapsed = now - activeShipment.startTime;
                  const pct = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
                  setProgress(pct);
              }
          }
      }, 100); // Fast updates for smooth bar
      return () => clearInterval(timer);
  }, [selectedId, shipments]);

  const handleDelivery = async (id: string) => {
      await fetch("http://localhost:3000/api/shipment/receive", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id })
      });
      // Force refresh will happen via the main interval or next tick
  };

  const selected = shipments.find(s => s.id === selectedId) || shipments[0];

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
                                    {shp.status === 'Delayed' && <AlertTriangle className="w-3 h-3 text-red-500 animate-pulse" />}
                                </h3>
                                <p className="text-xs text-zinc-500 mt-1">{shp.vehicle}</p>
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
                                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded border border-white/10">
                                    <Box className="w-3 h-3 text-zinc-400" />
                                    <span className="text-xs text-zinc-300 font-mono">{selected?.cargo || "No Active Shipment"} ({selected?.quantity || 0}T)</span>
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

                        {/* Stats Footer */}
                        <div className="grid grid-cols-3 gap-6 mt-12 pt-6 border-t border-white/5">
                            <StatBox label="Vehicle Velocity" value={selected?.velocity || "--"} icon={<Wind className="w-4 h-4 text-blue-400" />} />
                            <StatBox label="Carbon Emission" value={`${selected?.carbon || 0} kg`} icon={<Leaf className="w-4 h-4 text-red-400" />} />
                            <StatBox label="Offset Saved" value="4.2 kg" icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />} />
                        </div>
                    </div>
                </Card>

                {/* 2. NEXT ORDER ELEMENT (NEW) */}
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

function StatBox({ label, value, icon }: any) {
    return (
        <div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase mb-1">
                {icon} {label}
            </div>
            <div className="text-xl font-mono text-white tracking-tight">{value}</div>
        </div>
    );
}