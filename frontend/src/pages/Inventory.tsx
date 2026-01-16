import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { 
  Loader2, Package, ShoppingCart, Factory, MapPin, 
  AlertOctagon, Check, Box, ArrowRight, 
  Truck, Archive, TrendingDown, Clock
} from "lucide-react";

export default function InventoryManager() {
  const [markets, setMarkets] = useState<any[]>([]);
  const [commodities, setCommodities] = useState<any[]>([]);
  const [inbound, setInbound] = useState<any[]>([]);
  
  // Form State
  const [selectedMarket, setSelectedMarket] = useState("");
  const [selectedCommodity, setSelectedCommodity] = useState("");
  const [quantity, setQuantity] = useState("");
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
 

  // --- DATA FETCHING ---
  const fetchData = async () => {
    try {
        const mRes = await fetch(`${API_URL}/api/markets`);
        const cRes = await fetch(`${API_URL}/api/commodities`);
        const lRes = await fetch(`${API_URL}/api/logistics`);
        
        if (mRes.ok) setMarkets(await mRes.json());
        if (cRes.ok) setCommodities(await cRes.json());
        if (lRes.ok) {
            const logisticsData = await lRes.json();
            // Only show active shipments in transit
            setInbound(logisticsData
                .filter((s: any) => s.status !== 'Delivered')
                .sort((a:any, b:any) => a.arrivalTime - b.arrivalTime)
            );
        }
    } catch (e) { console.error("API Error", e); }
  };

  useEffect(() => { 
      fetchData(); 
      // Poll every 2 seconds to keep timers and stock synced
      const interval = setInterval(fetchData, 2000); 
      return () => clearInterval(interval);
  }, []);

  // --- COST CALCULATOR ---
  const getEstimatedCost = () => {
      if (!selectedCommodity || !quantity) return 0;
      const item = commodities.find(c => c.name === selectedCommodity);
      return item ? (item.basePrice * Number(quantity)).toLocaleString() : 0;
  };

  const getSmartOrderCost = (qty: number) => {
      const steel = commodities.find(c => c.name === "Industrial Steel");
      const price = steel ? steel.basePrice : 450;
      return (qty * price).toLocaleString();
  };

  // --- ACTIONS ---

  // 1. PLACE ORDER (Logistics Trigger)
  const handlePlaceOrder = async (targetHub?: string, autoQty?: number) => {
    setLoading(true);
    const hub = targetHub || selectedMarket;
    const qty = autoQty || quantity;
    const mat = selectedCommodity || "Industrial Steel"; 

    // This simply adds to the Logistics Queue. Stock is NOT updated yet.
    await fetch(`${API_URL}/api/order/place`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ market: hub, quantity: qty, material: mat })
    });

    await fetchData(); 
    setMessage(`Logistics Dispatched: ${qty}T to ${hub}`);
    setTimeout(() => setMessage(""), 3000);
    setLoading(false);
    setQuantity("");
  };

  // 2. WRITE OFF (Instant Update)
  const handleWriteOff = async () => {
      if (!selectedMarket || !quantity) return;
      setLoading(true);
      await fetch(`${API_URL}/api/inventory/adjust`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ market: selectedMarket, quantity: quantity, action: "REMOVE" })
      });
      setMessage(`Stock Written Off`);
      setTimeout(() => setMessage(""), 3000);
      setLoading(false);
      setQuantity("");
      fetchData();
  };

  // 3. AUTO-RECEIVE (The "Arrival" Logic)
  const handleArrival = async (id: string) => {
      await fetch(`${API_URL}/api/shipment/receive`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id })
      });
      fetchData(); // Refresh UI to show new stock level
  };

  const criticalHubs = markets.filter(m => m.status === "CRITICAL" || m.status === "WARNING");
  const totalInventory = markets.reduce((acc, m) => acc + m.stock, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in pb-12">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-white/10 pb-6">
        <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Package className="w-8 h-8 text-emerald-500" /> Inventory Command
            </h1>
            <p className="text-zinc-400 mt-1">Real-time stock management & allocation network.</p>
        </div>
        {message && (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 rounded-full text-sm font-bold animate-in fade-in slide-in-from-right-5">
                <Check className="w-4 h-4"/> {message}
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: CONTROLS & INBOUND */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* MANUAL ACTIONS CARD */}
          <Card className="p-6 bg-zinc-900/40 border-white/5 backdrop-blur-sm shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 font-bold text-lg text-white">
                    <Factory className="w-5 h-5 text-blue-500"/> Hub Actions
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold">Estimated Cost</p>
                    <p className="text-xl font-mono text-emerald-400">₹{getEstimatedCost()}</p>
                </div>
            </div>
            
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase">Target Hub</label>
                        <select 
                            className="w-full p-3 rounded-lg bg-black border border-white/10 text-white focus:border-blue-500 outline-none"
                            value={selectedMarket} onChange={e => setSelectedMarket(e.target.value)}
                        >
                            <option value="" className="bg-zinc-900">Select Location...</option>
                            {markets.map((m:any) => <option key={m.name} value={m.name} className="bg-zinc-900">{m.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase">Material</label>
                        <select 
                            className="w-full p-3 rounded-lg bg-black border border-white/10 text-white focus:border-blue-500 outline-none"
                            value={selectedCommodity} onChange={e => setSelectedCommodity(e.target.value)}
                        >
                            <option value="" className="bg-zinc-900">Select Material...</option>
                            {commodities.map((c:any) => <option key={c.name} value={c.name} className="bg-zinc-900">{c.name} (₹{c.basePrice})</option>)}
                        </select>
                    </div>
                </div>
                
                <div className="flex gap-4">
                    <Input 
                        type="number" 
                        placeholder="Quantity (Tons)" 
                        value={quantity} 
                        onChange={e => setQuantity(e.target.value)} 
                        className="bg-black border-white/10 text-white h-12"
                    />
                    <Button 
                        onClick={() => handlePlaceOrder()} 
                        disabled={loading || !selectedMarket || !selectedCommodity} 
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-12 px-6 flex-1"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "Place Order (Logistics)"}
                    </Button>
                    <Button 
                        onClick={handleWriteOff} 
                        disabled={loading || !selectedMarket} 
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold h-12 px-6"
                    >
                        <TrendingDown className="w-4 h-4 mr-2" /> Write-Off
                    </Button>
                </div>
            </div>
          </Card>

          {/* --- NEW SECTION: ORDER IN PROGRESS --- */}
          <Card className="p-0 bg-zinc-900/40 border-white/5 backdrop-blur-sm overflow-hidden">
             <div className="p-4 border-b border-white/5 font-bold text-white flex justify-between bg-white/5">
                <span className="flex items-center gap-2"><Truck className="w-4 h-4 text-yellow-500"/> Order in Progress</span>
                <span className="text-xs text-zinc-500 font-normal font-mono">{inbound.length} ACTIVE</span>
             </div>
             <div className="divide-y divide-white/5 max-h-[300px] overflow-y-auto custom-scrollbar">
                {inbound.length === 0 && (
                    <div className="p-8 text-center text-zinc-500 text-sm italic">
                        No active orders. Stock is stable.
                    </div>
                )}
                {inbound.map((s: any) => (
                    <div key={s.id} className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 hover:bg-white/5 transition-colors">
                        
                        {/* Cargo Info */}
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                <Box className="w-5 h-5 text-blue-500"/>
                            </div>
                            <div>
                                <p className="font-bold text-sm text-white flex items-center gap-2">
                                    {s.cargo}
                                    <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-700">
                                        {s.quantity}T
                                    </span>
                                </p>
                                <p className="text-xs text-zinc-500 font-mono mt-1">ID: {s.id}</p>
                            </div>
                        </div>

                        {/* Route Info */}
                        <div className="flex items-center gap-3 text-xs text-zinc-400 w-full md:w-auto justify-center bg-zinc-950/50 px-4 py-2 rounded-lg border border-white/5">
                            <span className="text-white font-bold">{s.origin}</span>
                            <div className="flex flex-col items-center">
                                <span className="text-[9px] uppercase tracking-wider text-zinc-600">Transit</span>
                                <ArrowRight className="w-4 h-4 text-blue-500 animate-pulse"/>
                            </div>
                            <span className="text-white font-bold">{s.dest}</span>
                        </div>

                        {/* Timer */}
                        <div className="text-right min-w-[100px]">
                            <div className="flex items-center justify-end gap-1 text-[10px] text-zinc-500 font-bold uppercase tracking-wide mb-1">
                                <Clock className="w-3 h-3" /> Time Left
                            </div>
                            <LiveTimer 
                                arrivalTime={s.arrivalTime} 
                                onArrive={() => handleArrival(s.id)} 
                            />
                        </div>
                    </div>
                ))}
             </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: SUMMARY & ALERTS */}
        <div className="space-y-6">
            
            {/* TOTAL INVENTORY */}
            <Card className="p-6 bg-zinc-950 border-white/10 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20 pointer-events-none"></div>
                <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4 relative z-10">Total Network Inventory</h3>
                <div className="text-5xl font-bold mb-8 font-mono text-white relative z-10">
                    {totalInventory.toLocaleString()} <span className="text-lg font-normal text-zinc-500 font-sans">Tons</span>
                </div>
                <div className="grid grid-cols-2 gap-4 relative z-10">
                    <div className="p-3 bg-black/40 rounded-lg border border-white/5">
                        <div className="text-2xl font-bold text-emerald-400">{markets.filter(m => m.status === 'ADEQUATE').length}</div>
                        <div className="text-xs text-zinc-500 uppercase font-bold">Healthy Nodes</div>
                    </div>
                    <div className="p-3 bg-black/40 rounded-lg border border-white/5">
                        <div className="text-2xl font-bold text-red-400">{markets.filter(m => m.status !== 'ADEQUATE').length}</div>
                        <div className="text-xs text-zinc-500 uppercase font-bold">Critical Nodes</div>
                    </div>
                </div>
            </Card>

            {/* SMART ALERTS (With Calculated Price) */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-zinc-500 uppercase tracking-wider px-1">
                    <ShoppingCart className="w-4 h-4 text-emerald-500"/> Smart Procurement
                </div>
                
                {criticalHubs.map((hub: any) => {
                    const shortfall = hub.capacity - hub.stock;
                    return (
                        <Card key={hub.name} className="p-5 bg-zinc-900 border-l-4 border-l-red-500 border-y border-r border-white/5 shadow-lg group">
                            <div className="flex justify-between mb-3">
                                <span className="text-red-400 font-bold text-[10px] flex items-center gap-1 uppercase tracking-wider bg-red-500/10 px-2 py-0.5 rounded">
                                    <AlertOctagon className="w-3 h-3"/> Critical Low
                                </span>
                                <span className="text-[10px] text-zinc-500 font-mono font-bold">
                                    EST. COST: ₹{getSmartOrderCost(shortfall)}
                                </span>
                            </div>
                            <h4 className="font-bold text-white text-lg mb-1">Restock {hub.name}</h4>
                            <p className="text-sm text-zinc-400 mb-5">
                                Shortfall: <span className="text-white font-mono font-bold">{shortfall.toLocaleString()}T</span>
                            </p>
                            <Button 
                                onClick={() => handlePlaceOrder(hub.name, shortfall)} 
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-10 shadow-lg shadow-blue-900/20 transition-all hover:scale-[1.02]"
                            >
                                {loading ? <Loader2 className="animate-spin w-4 h-4"/> : (
                                    <span className="flex items-center gap-2">Execute Auto-Order <ArrowRight className="w-4 h-4" /></span>
                                )}
                            </Button>
                        </Card>
                    );
                })}
            </div>

            {/* HUB STATUS LIST */}
            <Card className="p-0 bg-zinc-900/40 border-white/5 backdrop-blur-sm overflow-hidden">
                 <div className="p-4 border-b border-white/5 font-bold text-white flex justify-between bg-white/5">
                    <span className="flex items-center gap-2"><Archive className="w-4 h-4 text-purple-500"/> Hub Inventory</span>
                 </div>
                 <div className="divide-y divide-white/5 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {markets.map((m: any) => (
                        <div key={m.name} className="p-4 flex flex-col gap-2 hover:bg-white/5 transition-colors">
                            <div className="flex justify-between items-center">
                                <p className="font-bold text-sm text-white flex items-center gap-2"><MapPin className="w-3 h-3 text-zinc-500"/> {m.name}</p>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${m.status === 'ADEQUATE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{m.status}</span>
                            </div>
                            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                <div className={`h-full ${m.status === 'CRITICAL' ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, (m.stock / m.capacity) * 100)}%` }} />
                            </div>
                            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                                <span>{m.stock.toLocaleString()} / {m.capacity.toLocaleString()}T</span>
                                <span>{(m.stock / m.dailyUsage).toFixed(1)} Days Left</span>
                            </div>
                        </div>
                    ))}
                 </div>
            </Card>
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENT: Live Timer that Triggers Updates ---
function LiveTimer({ arrivalTime, onArrive }: { arrivalTime: number, onArrive: () => void }) {
    const [remaining, setRemaining] = useState(arrivalTime - Date.now());

    useEffect(() => {
        const interval = setInterval(() => {
            const timeLeft = arrivalTime - Date.now();
            setRemaining(timeLeft);
            
            // If time is up (and we haven't already shown "Arrived"), trigger update
            if (timeLeft <= 0) {
                clearInterval(interval);
                onArrive(); // CALLS THE API TO UPDATE STOCK
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [arrivalTime]);

    if (remaining <= 0) return <span className="text-emerald-400 font-bold font-mono animate-pulse">ARRIVING...</span>;
    
    const minutes = Math.floor((remaining / 1000 / 60) % 60);
    const seconds = Math.floor((remaining / 1000) % 60);
    
    return (
        <span className="text-blue-400 font-mono font-bold text-lg">
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </span>
    );
}