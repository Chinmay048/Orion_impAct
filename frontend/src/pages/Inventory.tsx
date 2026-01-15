import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { 
  Loader2, Package, ShoppingCart, Factory, MapPin, 
  AlertOctagon, Check, Box, ArrowRight, 
  Truck, Archive, TrendingDown
} from "lucide-react";

export default function InventoryManager() {
  const [markets, setMarkets] = useState<any[]>([]);
  const [commodities, setCommodities] = useState<any[]>([]);
  const [inbound, setInbound] = useState<any[]>([]);
  
  const [selectedMarket, setSelectedMarket] = useState("");
  const [selectedCommodity, setSelectedCommodity] = useState("");
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  const fetchData = async () => {
    try {
        const mRes = await fetch("http://localhost:3000/api/markets");
        const cRes = await fetch("http://localhost:3000/api/commodities");
        const lRes = await fetch("http://localhost:3000/api/logistics");
        
        if (mRes.ok) setMarkets(await mRes.json());
        if (cRes.ok) setCommodities(await cRes.json());
        if (lRes.ok) {
            const logisticsData = await lRes.json();
            // Show only active shipments
            setInbound(logisticsData.filter((s: any) => s.status !== 'Delivered'));
        }
    } catch (e) { console.error("API Error", e); }
  };

  useEffect(() => { 
      fetchData(); 
      const interval = setInterval(fetchData, 3000); 
      return () => clearInterval(interval);
  }, []);

  const getEstimatedCost = () => {
      if (!selectedCommodity || !quantity) return 0;
      const item = commodities.find(c => c.name === selectedCommodity);
      return item ? (item.basePrice * Number(quantity)).toLocaleString() : 0;
  };

  // --- HANDLER: PLACE ORDER (Adds to Logistics) ---
  const handlePlaceOrder = async (targetHub?: string, autoQty?: number) => {
    setLoading(true);
    const hub = targetHub || selectedMarket;
    const qty = autoQty || quantity;
    const mat = selectedCommodity || "Industrial Steel"; 

    await fetch("http://localhost:3000/api/order/place", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ market: hub, quantity: qty, material: mat })
    });

    await fetchData(); 
    setMessage(`Order Placed: ${qty}T to ${hub}`);
    setTimeout(() => setMessage(""), 3000);
    setLoading(false);
    setQuantity("");
  };

  // --- HANDLER: WRITE OFF (Instantly Removes Stock) ---
  const handleWriteOff = async () => {
      if (!selectedMarket || !quantity) return;
      setLoading(true);
      
      await fetch("http://localhost:3000/api/inventory/adjust", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ market: selectedMarket, quantity: quantity, action: "REMOVE" })
      });

      await fetchData();
      setMessage(`Stock Written Off: -${quantity}T from ${selectedMarket}`);
      setTimeout(() => setMessage(""), 3000);
      setLoading(false);
      setQuantity("");
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
        
        {/* LEFT COLUMN: PROCUREMENT & INBOUND */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* MANUAL ORDERING */}
          <Card className="p-6 bg-zinc-900/40 border-white/5 backdrop-blur-sm shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 font-bold text-lg text-white">
                    <Factory className="w-5 h-5 text-blue-500"/> Procurement Gateway
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
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 px-8 flex-1"
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

          {/* NEW BLOCK: HUB INVENTORY STATUS */}
          <Card className="p-0 bg-zinc-900/40 border-white/5 backdrop-blur-sm overflow-hidden">
             <div className="p-4 border-b border-white/5 font-bold text-white flex justify-between bg-white/5">
                <span className="flex items-center gap-2"><Archive className="w-4 h-4 text-purple-500"/> Hub Inventory Status</span>
                <span className="text-xs text-zinc-500 font-normal font-mono">{markets.length} NODES LIVE</span>
             </div>
             <div className="divide-y divide-white/5">
                {markets.map((m: any) => (
                    <div key={m.name} className="p-4 flex justify-between items-center hover:bg-white/5 transition-colors group">
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                                <p className="font-bold text-sm text-white flex items-center gap-2">
                                    <MapPin className="w-3 h-3 text-zinc-500"/> {m.name}
                                </p>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                    m.status === 'ADEQUATE' ? 'bg-emerald-500/10 text-emerald-400' : 
                                    m.status === 'WARNING' ? 'bg-yellow-500/10 text-yellow-400' :
                                    'bg-red-500/10 text-red-400'
                                }`}>
                                    {m.status}
                                </span>
                            </div>
                            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full ${m.status === 'CRITICAL' ? 'bg-red-500' : 'bg-emerald-500'}`} 
                                    style={{ width: `${Math.min(100, (m.stock / m.capacity) * 100)}%` }} 
                                />
                            </div>
                            <div className="flex justify-between mt-1 text-[10px] text-zinc-500">
                                <span>{m.stock} / {m.capacity} Tons</span>
                                <span>{(m.stock / m.dailyUsage).toFixed(1)} Days Runway</span>
                            </div>
                        </div>
                    </div>
                ))}
             </div>
          </Card>

          {/* INBOUND LOGISTICS */}
          <Card className="p-0 bg-zinc-900/40 border-white/5 backdrop-blur-sm overflow-hidden">
             <div className="p-4 border-b border-white/5 font-bold text-white flex justify-between bg-white/5">
                <span className="flex items-center gap-2"><Truck className="w-4 h-4 text-yellow-500"/> Inbound Logistics</span>
                <span className="text-xs text-zinc-500 font-normal font-mono">{inbound.length} SHIPMENTS EN ROUTE</span>
             </div>
             <div className="divide-y divide-white/5 max-h-[300px] overflow-y-auto custom-scrollbar">
                {inbound.length === 0 ? (
                    <div className="p-8 text-center text-zinc-500 text-sm">No active shipments. Place an order to see logistics flow.</div>
                ) : inbound.map((s: any) => (
                    <div key={s.id} className="p-4 flex justify-between items-center hover:bg-white/5 transition-colors">
                        <div className="flex gap-4 items-center">
                            <div className="p-2.5 rounded-lg bg-blue-500/10">
                                <Box className="w-5 h-5 text-blue-500"/>
                            </div>
                            <div>
                                <p className="font-bold text-sm text-white flex items-center gap-2">
                                    {s.cargo}
                                    <span className="text-xs text-zinc-500 font-normal border border-zinc-700 px-1.5 rounded bg-zinc-900">
                                        {s.quantity}T
                                    </span>
                                </p>
                                {/* GENUINE ROUTE & TIME DISPLAY */}
                                <p className="text-xs text-zinc-400 flex items-center gap-1 mt-1 font-mono">
                                    <span className="text-zinc-500">FROM</span> {s.origin} 
                                    <ArrowRight className="w-3 h-3 text-zinc-600"/> 
                                    <span className="text-zinc-500">TO</span> <span className="text-white">{s.dest}</span>
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wide">Time to Delivery</p>
                            <CalculateTime remaining={s.arrivalTime - Date.now()} />
                        </div>
                    </div>
                ))}
             </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: AI & SUMMARY */}
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
                        <div className="text-xs text-zinc-500 uppercase font-bold">Healthy</div>
                    </div>
                    <div className="p-3 bg-black/40 rounded-lg border border-white/5">
                        <div className="text-2xl font-bold text-red-400">{markets.filter(m => m.status !== 'ADEQUATE').length}</div>
                        <div className="text-xs text-zinc-500 uppercase font-bold">Critical</div>
                    </div>
                </div>
            </Card>

            {/* SMART ALERTS */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-zinc-500 uppercase tracking-wider px-1">
                    <ShoppingCart className="w-4 h-4 text-emerald-500"/> Smart Procurement
                </div>
                
                {criticalHubs.map((hub: any) => (
                    <Card key={hub.name} className="p-5 bg-zinc-900 border-l-4 border-l-red-500 border-y border-r border-white/5 shadow-lg group">
                        <div className="flex justify-between mb-3">
                            <span className="text-red-400 font-bold text-[10px] flex items-center gap-1 uppercase tracking-wider bg-red-500/10 px-2 py-0.5 rounded">
                                <AlertOctagon className="w-3 h-3"/> Critical Low
                            </span>
                            <span className="text-[10px] text-zinc-600 font-mono">ID: {hub.name.substring(0,3).toUpperCase()}</span>
                        </div>
                        <h4 className="font-bold text-white text-lg mb-1">Restock {hub.name}</h4>
                        <p className="text-sm text-zinc-400 mb-5">
                            Shortfall: <span className="text-white font-mono font-bold">{(hub.capacity - hub.stock).toLocaleString()}T</span>
                        </p>
                        <Button 
                            onClick={() => handlePlaceOrder(hub.name, hub.capacity - hub.stock)} 
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-10 shadow-lg shadow-blue-900/20"
                        >
                            {loading ? <Loader2 className="animate-spin w-4 h-4"/> : (
                                <span className="flex items-center gap-2">Execute Auto-Order <ArrowRight className="w-4 h-4" /></span>
                            )}
                        </Button>
                    </Card>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}

// Mini Component to handle live countdown in the list
function CalculateTime({ remaining }: { remaining: number }) {
    if (remaining <= 0) return <span className="text-emerald-400 font-bold font-mono">Arriving...</span>;
    const minutes = Math.floor((remaining / 1000 / 60) % 60);
    const seconds = Math.floor((remaining / 1000) % 60);
    return (
        <span className="text-blue-400 font-mono font-bold">
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </span>
    );
}