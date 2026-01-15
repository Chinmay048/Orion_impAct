import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Package, ShoppingCart, Factory, MapPin, CheckCircle2, AlertOctagon, Check } from "lucide-react";

export default function InventoryManager() {
  const [markets, setMarkets] = useState<any[]>([]);
  const [commodities, setCommodities] = useState<any[]>([]);
  
  const [selectedMarket, setSelectedMarket] = useState("");
  const [selectedCommodity, setSelectedCommodity] = useState("");
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [processingOrder, setProcessingOrder] = useState<string | null>(null);

  // Fetch Data Function
  const fetchData = async () => {
    const mRes = await fetch("https://orion-backend-op6i.onrender.com/api/markets");
    const cRes = await fetch("https://orion-backend-op6i.onrender.com/api/commodities");
    setMarkets(await mRes.json());
    setCommodities(await cRes.json());
  };

  useEffect(() => { fetchData(); }, []);

  // 1. MANUAL UPDATE HANDLER
  const handleUpdate = async (action: any) => {
    setLoading(true);
    await fetch("https://orion-backend-op6i.onrender.com/api/inventory/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ market: selectedMarket, quantity, action })
    });
    await fetchData(); // Force refresh to see change
    setMessage(action === "ADD" ? "Stock Added Successfully" : "Stock Written Off");
    setTimeout(() => setMessage(""), 3000);
    setLoading(false);
    setQuantity("");
  };

  // 2. SMART ORDER HANDLER (Genuine Logic)
  const handleSmartOrder = async (hub: any) => {
    setProcessingOrder(hub.name);
    // Calculate gap to fill
    const orderQty = hub.capacity - hub.stock;

    await fetch("https://orion-backend-op6i.onrender.com/api/inventory/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ market: hub.name, quantity: orderQty, action: "ADD" })
    });

    await fetchData(); // Refresh -> Card will disappear because status becomes ADEQUATE
    setMessage(`Ordered ${orderQty}T for ${hub.name}`);
    setTimeout(() => setMessage(""), 3000);
    setProcessingOrder(null);
  };

  const criticalHubs = markets.filter(m => m.status === "CRITICAL" || m.status === "WARNING");
  const totalInventory = markets.reduce((acc, m) => acc + m.stock, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex justify-between items-end border-b border-slate-200 dark:border-white/10 pb-6">
        <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <Package className="w-8 h-8 text-emerald-500" /> Inventory Command
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time stock management network.</p>
        </div>
        {message && <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-full text-sm font-bold"><Check className="w-4 h-4"/> {message}</div>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* MANUAL CONTROLS */}
          <Card className="p-6 bg-white dark:bg-neutral-900 border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-2 mb-6 font-bold text-lg dark:text-white"><Factory className="w-5 h-5 text-blue-500"/> Hub Configuration</div>
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500">Target Hub</label>
                        <select className="w-full p-3 rounded bg-slate-50 dark:bg-black border dark:border-white/20 dark:text-white" value={selectedMarket} onChange={e => setSelectedMarket(e.target.value)}>
                            <option value="">Select Location...</option>
                            {markets.map((m:any) => <option key={m.name} value={m.name}>{m.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500">Material</label>
                        <select className="w-full p-3 rounded bg-slate-50 dark:bg-black border dark:border-white/20 dark:text-white" value={selectedCommodity} onChange={e => setSelectedCommodity(e.target.value)}>
                            <option value="">Select Material...</option>
                            {commodities.map((c:any) => <option key={c.name} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex gap-4">
                    <Input type="number" placeholder="Quantity (Tons)" value={quantity} onChange={e => setQuantity(e.target.value)} className="dark:bg-black"/>
                    <Button onClick={() => handleUpdate("ADD")} disabled={loading || !selectedMarket} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold">Add Stock</Button>
                    <Button onClick={() => handleUpdate("REMOVE")} disabled={loading || !selectedMarket} className="bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white hover:bg-red-500">Write-Off</Button>
                </div>
            </div>
          </Card>

          {/* ACTIVE NETWORK LIST */}
          <Card className="p-0 bg-white dark:bg-neutral-900 border-slate-200 dark:border-white/10">
             <div className="p-4 border-b border-slate-100 dark:border-white/5 font-bold dark:text-white flex justify-between">
                <span>Active Supply Network</span>
                <span className="text-xs text-slate-500 font-normal">{markets.length} Nodes Online</span>
             </div>
             <div className="divide-y divide-slate-100 dark:divide-white/5">
                {markets.map((m: any) => (
                    <div key={m.name} className="p-4 flex justify-between hover:bg-slate-50 dark:hover:bg-white/5">
                        <div className="flex gap-3 items-center">
                            <MapPin className={`w-4 h-4 ${m.status === 'ADEQUATE' ? 'text-emerald-500' : 'text-red-500'}`}/>
                            <div><p className="font-bold text-sm dark:text-white">{m.name}</p><p className="text-xs text-slate-500">Cap: {m.capacity}T</p></div>
                        </div>
                        <div className="text-right">
                            <p className="font-mono font-bold text-sm dark:text-white">{m.stock.toLocaleString()} Tons</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${m.status === 'ADEQUATE' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{m.status}</span>
                        </div>
                    </div>
                ))}
             </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: AI & SUMMARY */}
        <div className="space-y-6">
            <Card className="p-6 bg-slate-900 text-white relative overflow-hidden">
                <Package className="absolute top-4 right-4 w-24 h-24 opacity-10"/>
                <h3 className="text-sm font-bold text-slate-400 mb-4">TOTAL NETWORK INVENTORY</h3>
                <div className="text-5xl font-bold mb-6">{totalInventory.toLocaleString()} <span className="text-lg font-normal text-slate-500">Tons</span></div>
                <div className="flex gap-4">
                    <div><div className="text-2xl font-bold text-emerald-400">{markets.filter(m => m.status === 'ADEQUATE').length}</div><div className="text-xs text-slate-400">Healthy</div></div>
                    <div><div className="text-2xl font-bold text-red-400">{markets.filter(m => m.status !== 'ADEQUATE').length}</div><div className="text-xs text-slate-400">Critical</div></div>
                </div>
            </Card>

            <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase"><ShoppingCart className="w-4 h-4"/> Smart Procurement</div>
                {criticalHubs.length === 0 ? (
                    <Card className="p-8 border-dashed border-2 border-emerald-500/30 bg-emerald-500/5 flex flex-col items-center text-center">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-3"/>
                        <h4 className="font-bold text-emerald-500">All Systems Nominal</h4>
                    </Card>
                ) : (
                    criticalHubs.map((hub: any) => (
                        <Card key={hub.name} className="p-5 bg-white dark:bg-neutral-900 border-l-4 border-l-red-500 border-y border-r border-slate-200 dark:border-white/10">
                            <div className="flex justify-between mb-2"><span className="text-red-500 font-bold text-xs flex gap-1"><AlertOctagon className="w-4 h-4"/> ALERT</span><span className="text-xs text-slate-500">ID: {hub.name.substring(0,3).toUpperCase()}</span></div>
                            <h4 className="font-bold dark:text-white mb-1">Restock {hub.name}</h4>
                            <p className="text-sm text-slate-500 mb-4">Stock ({hub.stock}T) critical. Order: <span className="font-bold dark:text-white">{(hub.capacity - hub.stock).toLocaleString()}T</span></p>
                            <Button onClick={() => handleSmartOrder(hub)} disabled={processingOrder === hub.name} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-10">
                                {processingOrder === hub.name ? <Loader2 className="animate-spin"/> : "Place Order"}
                            </Button>
                        </Card>
                    ))
                )}
            </div>
        </div>
      </div>
    </div>
  );
}