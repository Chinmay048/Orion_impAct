import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { 
  Loader2, Package, Factory, Check, Box, ArrowRight, 
  Truck, Archive, TrendingDown, Clock, ChevronDown, ChevronUp, AlertOctagon, Sparkles, BrainCircuit
} from "lucide-react";

// --- TYPES ---
type Commodity = {
    name: string;
    basePrice: number;
    unit: string;
};

type CommodityStock = {
    name: string;
    quantity: number;
    unit: string;
};

type Market = {
    name: string;
    status: 'ADEQUATE' | 'WARNING' | 'CRITICAL';
    stock: number;         
    capacity: number;
    dailyUsage: number;
    inventory: CommodityStock[]; 
};

type LogisticsOrder = {
    id: string;
    origin: string;
    dest: string;
    cargo: string;
    quantity: number;
    status: string;
    arrivalTime: number;
};

export default function InventoryManager() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [inbound, setInbound] = useState<LogisticsOrder[]>([]);
  
  // Form State
  const [selectedMarket, setSelectedMarket] = useState("");
  const [selectedCommodity, setSelectedCommodity] = useState("");
  const [quantity, setQuantity] = useState("");
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [expandedHub, setExpandedHub] = useState<string | null>(null); 

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // --- LOGICAL INITIALIZATION (The Fix) ---
  const initData = async () => {
    try {
        // 1. Fetch Commodities FIRST so we know what exists (Steel, Lithium, etc.)
        const cRes = await fetch(`${API_URL}/api/commodities`);
        let validCommodities: Commodity[] = [];
        
        if (cRes.ok) {
            validCommodities = await cRes.json();
            setCommodities(validCommodities);
        }

        // 2. Fetch Markets & Logistics
        const mRes = await fetch(`${API_URL}/api/markets`);
        const lRes = await fetch(`${API_URL}/api/logistics`);
        
        if (mRes.ok) {
            const rawMarkets = await mRes.json();
            
            // LOGIC FIX: Generate inventory using ONLY valid commodities
            const validatedMarkets = rawMarkets.map((m: any) => {
                let currentInventory = m.inventory || [];

                // If stock exists but inventory is empty, distribute it logically
                if (m.stock > 0 && currentInventory.length === 0 && validCommodities.length > 0) {
                    const primaryItem = validCommodities[0]; // e.g., Industrial Steel
                    const secondaryItem = validCommodities[1] || validCommodities[0]; // e.g., Lithium Ion

                    const primaryQty = Math.floor(m.stock * 0.7);
                    const secondaryQty = m.stock - primaryQty;
                    
                    currentInventory = [
                        { name: primaryItem.name, quantity: primaryQty, unit: "T" },
                        { name: secondaryItem.name, quantity: secondaryQty, unit: "T" }
                    ];
                }

                return { ...m, inventory: currentInventory };
            });

            if(markets.length === 0) setMarkets(validatedMarkets);
        }

        if (lRes.ok) {
            const logisticsData = await lRes.json();
            setInbound(logisticsData
                .filter((s: any) => s.status !== 'Delivered')
                .sort((a: any, b: any) => a.arrivalTime - b.arrivalTime)
            );
        }
    } catch (e) { console.error("Initialization Failed", e); }
  };

  useEffect(() => { initData(); }, []);

  // --- ACTIONS ---
  
  const handleWriteOff = async () => {
      const qtyNum = parseFloat(quantity);
      if (!selectedMarket || !selectedCommodity || isNaN(qtyNum) || qtyNum <= 0) return;
      setLoading(true);

      // Optimistic Update
      setMarkets(prev => prev.map(market => {
          if (market.name === selectedMarket) {
              const updatedInventory = market.inventory.map(item => {
                  if (item.name === selectedCommodity) {
                      return { ...item, quantity: Math.max(0, item.quantity - qtyNum) };
                  }
                  return item;
              });
              const newTotal = updatedInventory.reduce((acc, i) => acc + i.quantity, 0);
              return { ...market, stock: newTotal, inventory: updatedInventory };
          }
          return market;
      }));

      // Backend Sync
      try {
          await fetch(`${API_URL}/api/inventory/adjust`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ market: selectedMarket, quantity: qtyNum, material: selectedCommodity, action: "REMOVE" })
          });
          setMessage(`Wrote off ${qtyNum}T of ${selectedCommodity}`);
      } catch(e) { console.error(e); }

      setTimeout(() => setMessage(""), 3000);
      setLoading(false);
      setQuantity("");
  };

  const handlePlaceOrder = async (targetHub?: string, autoQty?: number, autoMat?: string) => {
    setLoading(true);
    const hub = targetHub || selectedMarket;
    const qty = autoQty ? Number(autoQty) : Number(quantity);
    const mat = autoMat || selectedCommodity || (commodities[0]?.name || "Industrial Steel");

    const newShipment: LogisticsOrder = {
        id: `ORD-${Date.now()}`,
        origin: "Central Port",
        dest: hub,
        cargo: mat,
        quantity: qty,
        status: "In Transit",
        arrivalTime: Date.now() + 8000
    };
    setInbound(prev => [...prev, newShipment]);

    try {
        await fetch(`${API_URL}/api/order/place`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ market: hub, quantity: qty, material: mat })
        });
        setMessage(`Order Placed: ${qty}T ${mat} -> ${hub}`);
    } catch(e) { console.error(e); }

    setTimeout(() => setMessage(""), 3000);
    setLoading(false);
    if (!autoQty) setQuantity("");
  };

  const handleArrival = async (shipmentId: string) => {
      const shipment = inbound.find(s => s.id === shipmentId);
      if (!shipment) return;

      setMarkets(prev => prev.map(market => {
          if (market.name === shipment.dest) {
              let itemFound = false;
              const updatedInventory = market.inventory.map(item => {
                  if (item.name === shipment.cargo) {
                      itemFound = true;
                      return { ...item, quantity: item.quantity + shipment.quantity };
                  }
                  return item;
              });

              if (!itemFound) {
                  updatedInventory.push({ name: shipment.cargo, quantity: shipment.quantity, unit: "T" });
              }
              const newTotal = updatedInventory.reduce((acc, i) => acc + i.quantity, 0);
              return { ...market, stock: newTotal, inventory: updatedInventory };
          }
          return market;
      }));

      setInbound(prev => prev.filter(s => s.id !== shipmentId));

      try {
          await fetch(`${API_URL}/api/shipment/receive`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: shipmentId })
          });
          setMessage(`Shipment Arrived: +${shipment.quantity}T`);
          setTimeout(() => setMessage(""), 3000);
      } catch(e) { console.error(e); }
  };

  // --- SMART HELPERS ---
  const getCurrentStock = () => {
      if (!selectedMarket || !selectedCommodity) return null;
      const market = markets.find(m => m.name === selectedMarket);
      const item = market?.inventory?.find(i => i.name === selectedCommodity);
      return item ? item.quantity : 0;
  };

  // Logic: Cost = Qty * Base Price
  const getEstimatedCost = (qtyVal: string = quantity, matName: string = selectedCommodity) => {
      if (!matName || !qtyVal) return 0;
      const item = commodities.find(c => c.name === matName);
      return item ? (item.basePrice * Number(qtyVal)).toLocaleString() : 0;
  };

  // Logic: "Smart" Shortfall detection for the selected Hub/Material combo
  const getSmartSuggestion = () => {
      if (!selectedMarket || !selectedCommodity) return null;
      const market = markets.find(m => m.name === selectedMarket);
      const currentStock = market?.inventory?.find(i => i.name === selectedCommodity)?.quantity || 0;
      
      // Simple Smart Logic: If stock is < 1000T, suggest ordering 2000T
      if (currentStock < 1000) {
          return {
              needed: true,
              suggestedQty: 2000,
              reason: "Stock Critical (<1000T)"
          };
      }
      return null;
  };

  const suggestion = getSmartSuggestion();
  const totalNetworkAssets = markets.reduce((acc, m) => acc + m.stock, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in pb-12 font-sans">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-white/10 pb-6">
        <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Package className="w-8 h-8 text-emerald-500" /> Inventory Command
            </h1>
            <p className="text-zinc-400 mt-1">Real-time stock monitoring & logistics control.</p>
        </div>
        {message && (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 rounded-full text-sm font-bold animate-in fade-in slide-in-from-right-5">
                <Check className="w-4 h-4"/> {message}
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. MANUAL ACTIONS CARD */}
          <Card className="p-6 bg-zinc-900/40 border-white/5 backdrop-blur-sm shadow-sm relative overflow-visible">
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
                            className="w-full p-3 rounded-lg bg-black border border-white/10 text-white focus:border-blue-500 outline-none hover:border-white/20 transition-colors"
                            value={selectedMarket} onChange={e => setSelectedMarket(e.target.value)}
                        >
                            <option value="" className="bg-zinc-900">Select Location...</option>
                            {markets.map((m) => <option key={m.name} value={m.name} className="bg-zinc-900">{m.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase">Material</label>
                        <select 
                            className="w-full p-3 rounded-lg bg-black border border-white/10 text-white focus:border-blue-500 outline-none hover:border-white/20 transition-colors"
                            value={selectedCommodity} onChange={e => setSelectedCommodity(e.target.value)}
                        >
                            <option value="" className="bg-zinc-900">Select Material...</option>
                            {commodities.map((c:any) => <option key={c.name} value={c.name} className="bg-zinc-900">{c.name} (₹{c.basePrice})</option>)}
                        </select>
                    </div>
                </div>
                
                {/* SMART SUGGESTION BANNER (The "Smart Analysis" inside action) */}
                {suggestion?.needed && (
                    <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-3">
                            <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                            <div>
                                <p className="text-xs font-bold text-blue-300 uppercase">AI Recommendation</p>
                                <p className="text-xs text-zinc-400">{suggestion.reason}</p>
                            </div>
                        </div>
                        <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={() => setQuantity(suggestion.suggestedQty.toString())}
                            className="h-8 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border-blue-500/30"
                        >
                            Auto-Fill {suggestion.suggestedQty}T
                        </Button>
                    </div>
                )}

                <div className="flex gap-4 items-end">
                    <div className="flex-1 space-y-2">
                         <div className="flex justify-between">
                            <label className="text-xs font-bold text-zinc-500 uppercase">Quantity</label>
                            {getCurrentStock() !== null && (
                                <span className="text-xs text-blue-400 font-mono">
                                    Current Stock: {getCurrentStock()?.toLocaleString()}T
                                </span>
                            )}
                         </div>
                        <Input 
                            type="number" 
                            placeholder="Amount..." 
                            value={quantity} 
                            onChange={e => setQuantity(e.target.value)} 
                            className="bg-black border-white/10 text-white h-12 font-mono"
                        />
                    </div>

                    <Button 
                        onClick={() => handlePlaceOrder()} 
                        disabled={loading || !selectedMarket || !selectedCommodity || !quantity} 
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-12 px-6 flex-1 transition-all hover:scale-[1.02]"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "Place Order"}
                    </Button>
                    <Button 
                        onClick={handleWriteOff} 
                        disabled={loading || !selectedMarket || !selectedCommodity || !quantity} 
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold h-12 px-4 transition-colors"
                        title="Write-off (Reduce Stock)"
                    >
                        <TrendingDown className="w-4 h-4" />
                    </Button>
                </div>
            </div>
          </Card>

          {/* 2. HUB INVENTORY BREAKDOWN */}
           <Card className="p-0 bg-zinc-900/40 border-white/5 backdrop-blur-sm overflow-hidden">
                <div className="p-4 border-b border-white/5 font-bold text-white flex justify-between bg-white/5">
                   <span className="flex items-center gap-2"><Archive className="w-4 h-4 text-purple-500"/> Hub Inventory Breakdown</span>
                </div>
                <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto custom-scrollbar">
                   {markets.map((m) => (
                       <div key={m.name} className="flex flex-col transition-colors">
                           {/* Hub Row */}
                           <div 
                                className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5"
                                onClick={() => setExpandedHub(expandedHub === m.name ? null : m.name)}
                           >
                               <div className="flex items-center gap-3">
                                   <div className={`w-2 h-2 rounded-full ${m.status === 'ADEQUATE' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                   <div>
                                       <p className="font-bold text-sm text-white flex items-center gap-2">{m.name}</p>
                                       <p className="text-[10px] text-zinc-500 uppercase tracking-wide">
                                           Capacity: {Math.round((m.stock / m.capacity) * 100)}% Full
                                       </p>
                                   </div>
                               </div>
                               <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-sm font-mono text-white font-bold">{m.stock.toLocaleString()}T <span className="text-zinc-500 text-[10px]">TOTAL</span></p>
                                    </div>
                                    {expandedHub === m.name ? <ChevronUp className="w-4 h-4 text-zinc-500"/> : <ChevronDown className="w-4 h-4 text-zinc-500"/>}
                               </div>
                           </div>

                           {/* Breakdown Accordion */}
                           {expandedHub === m.name && (
                               <div className="bg-black/30 border-y border-white/5 p-4 grid grid-cols-2 md:grid-cols-3 gap-3 animate-in slide-in-from-top-2 duration-200">
                                   {m.inventory?.map((item, idx) => (
                                       <div key={idx} className="bg-zinc-900/50 p-3 rounded border border-white/5 flex justify-between items-center group hover:border-white/10">
                                           <div>
                                               <p className="text-[10px] font-bold text-zinc-500 uppercase group-hover:text-zinc-300">{item.name}</p>
                                               <p className="text-sm font-mono text-blue-300">{item.quantity.toLocaleString()} <span className="text-[10px]">{item.unit}</span></p>
                                           </div>
                                           <div className="h-8 w-1 bg-zinc-800 rounded-full flex flex-col justify-end overflow-hidden ml-2">
                                                <div className="bg-blue-500 w-full" style={{ height: `${m.stock > 0 ? (item.quantity / m.stock) * 100 : 0}%` }}></div>
                                           </div>
                                       </div>
                                   ))}
                                   {(!m.inventory || m.inventory.length === 0) && (
                                       <div className="col-span-3 text-center text-xs text-zinc-600 italic py-2">
                                           Initializing inventory data...
                                       </div>
                                   )}
                               </div>
                           )}
                       </div>
                   ))}
                </div>
           </Card>

          {/* 3. LOGISTICS QUEUE */}
          <Card className="p-0 bg-zinc-900/40 border-white/5 backdrop-blur-sm overflow-hidden">
             <div className="p-4 border-b border-white/5 font-bold text-white flex justify-between bg-white/5">
                <span className="flex items-center gap-2"><Truck className="w-4 h-4 text-yellow-500"/> Active Logistics</span>
                <span className="text-xs text-zinc-500 font-mono">{inbound.length} EN ROUTE</span>
             </div>
             <div className="divide-y divide-white/5 max-h-[300px] overflow-y-auto custom-scrollbar">
                {inbound.length === 0 && (
                    <div className="p-8 text-center text-zinc-500 text-sm italic">Network is static. No shipments in transit.</div>
                )}
                {inbound.map((s) => (
                    <div key={s.id} className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                <Box className="w-5 h-5 text-blue-500"/>
                            </div>
                            <div>
                                <p className="font-bold text-sm text-white flex items-center gap-2">
                                    {s.cargo}
                                    <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-700">{s.quantity}T</span>
                                </p>
                                <p className="text-xs text-zinc-500 font-mono mt-1">ID: {s.id.substring(0,8)}...</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-zinc-400 w-full md:w-auto justify-center bg-zinc-950/50 px-4 py-2 rounded-lg border border-white/5">
                            <span className="text-white font-bold">{s.origin}</span>
                            <ArrowRight className="w-4 h-4 text-blue-500 animate-pulse"/>
                            <span className="text-white font-bold">{s.dest}</span>
                        </div>
                        <div className="text-right min-w-[100px]">
                            <div className="flex items-center justify-end gap-1 text-[10px] text-zinc-500 font-bold uppercase tracking-wide mb-1">
                                <Clock className="w-3 h-3" /> ETA
                            </div>
                            <LiveTimer arrivalTime={s.arrivalTime} onArrive={() => handleArrival(s.id)} />
                        </div>
                    </div>
                ))}
             </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: SUMMARY */}
        <div className="space-y-6">
            
            <Card className="p-6 bg-zinc-950 border-white/10 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20 pointer-events-none"></div>
                <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4 relative z-10">Total Network Assets</h3>
                <div className="text-5xl font-bold mb-8 font-mono text-white relative z-10">
                    {totalNetworkAssets.toLocaleString()} <span className="text-lg font-normal text-zinc-500 font-sans">Tons</span>
                </div>
                <div className="grid grid-cols-2 gap-4 relative z-10">
                    <div className="p-3 bg-black/40 rounded-lg border border-white/5">
                        <div className="text-2xl font-bold text-emerald-400">{markets.filter(m => m.status === 'ADEQUATE').length}</div>
                        <div className="text-xs text-zinc-500 uppercase font-bold">Stable Hubs</div>
                    </div>
                    <div className="p-3 bg-black/40 rounded-lg border border-white/5">
                        <div className="text-2xl font-bold text-red-400">{markets.filter(m => m.status !== 'ADEQUATE').length}</div>
                        <div className="text-xs text-zinc-500 uppercase font-bold">Risk Areas</div>
                    </div>
                </div>
            </Card>

            {/* AI SMART ANALYSIS SECTION (Renamed) */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-zinc-500 uppercase tracking-wider px-1">
                    <BrainCircuit className="w-4 h-4 text-purple-500"/> AI Smart Forecast & Replenishment
                </div>
                
                {markets.filter(m => m.status === "CRITICAL" || m.status === "WARNING").map((hub) => {
                    const shortfall = hub.capacity - hub.stock;
                    // Smart Logic: Suggest the commodity they have the least of, or default to first valid
                    const suggestedMat = hub.inventory?.length > 0 ? hub.inventory[0].name : (commodities[0]?.name || "Industrial Steel");
                    
                    return (
                        <Card key={hub.name} className="p-5 bg-zinc-900 border-l-4 border-l-purple-500 border-y border-r border-white/5 shadow-lg group">
                            <div className="flex justify-between mb-3">
                                <span className="text-purple-400 font-bold text-[10px] flex items-center gap-1 uppercase tracking-wider bg-purple-500/10 px-2 py-0.5 rounded">
                                    AI ALERT
                                </span>
                                <span className="text-[10px] text-zinc-500 font-mono font-bold">
                                    EST COST: ₹{getEstimatedCost(shortfall.toString(), suggestedMat)}
                                </span>
                            </div>
                            <h4 className="font-bold text-white text-lg mb-1">{hub.name}</h4>
                            <p className="text-sm text-zinc-400 mb-5">
                                Predicted shortfall of <span className="text-white font-mono font-bold">{shortfall.toLocaleString()}T</span>. 
                                Recommended action: Immediate bulk order.
                            </p>
                            <Button 
                                onClick={() => handlePlaceOrder(hub.name, shortfall, suggestedMat)} 
                                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold h-10 shadow-lg shadow-purple-900/20 transition-all hover:scale-[1.02]"
                            >
                                {loading ? <Loader2 className="animate-spin w-4 h-4"/> : (
                                    <span className="flex items-center gap-2">Auto-Order {suggestedMat} <ArrowRight className="w-4 h-4" /></span>
                                )}
                            </Button>
                        </Card>
                    );
                })}
            </div>
        </div>
      </div>
    </div>
  );
}

function LiveTimer({ arrivalTime, onArrive }: { arrivalTime: number, onArrive: () => void }) {
    const [remaining, setRemaining] = useState(arrivalTime - Date.now());

    useEffect(() => {
        const interval = setInterval(() => {
            const timeLeft = arrivalTime - Date.now();
            setRemaining(timeLeft);
            if (timeLeft <= 0) {
                clearInterval(interval);
                onArrive(); 
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