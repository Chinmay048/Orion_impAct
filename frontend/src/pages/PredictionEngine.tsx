import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BrainCircuit, Cpu, TrendingUp, Sliders, Loader2 } from "lucide-react";

export default function PredictionEngine() {
  const [commodities, setCommodities] = useState<any[]>([]);
  const [markets, setMarkets] = useState<any[]>([]);
  
  // Inputs
  const [selectedCommodity, setSelectedCommodity] = useState("Industrial Steel");
  const [source, setSource] = useState("Mumbai HQ");
  const [inventory, setInventory] = useState(500);
  const [capacity, setCapacity] = useState(5000);
  
  // Sliders - Default to visible values so calculation is never 0
  const [demandFactor, setDemandFactor] = useState(0.8);
  const [supplyFactor, setSupplyFactor] = useState(0.5);
  const [priceTrend, setPriceTrend] = useState(1.1);
  const [] = useState(0.5);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetch("/api/commodities").then(r => r.json()).then(setCommodities);
    fetch("/api/markets").then(r => r.json()).then(setMarkets);
  }, []);

  const handlePredict = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/predict-gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            commodity: selectedCommodity, 
            inventory: Number(inventory), 
            capacity: Number(capacity), 
            demandFactor: Number(demandFactor), 
            supplyFactor: Number(supplyFactor), 
            priceTrend: Number(priceTrend)
        })
      });
      const data = await res.json();
      if (data.success) {
        setResult(data);
      }
    } catch (e) { 
        console.error("Prediction Error", e); 
    } finally { 
        setLoading(false); 
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in pb-12">
      <div className="border-b border-slate-200 dark:border-white/10 pb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <BrainCircuit className="w-8 h-8 text-emerald-500" /> Prediction Engine
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
            Hybrid Engine: Deterministic Math + Generative AI Strategy.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: CONTROLS */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 bg-white dark:bg-neutral-900 border-slate-200 dark:border-white/10">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Sliders className="w-4 h-4" /> Parameters
            </h3>
            
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500">Source Hub</label>
                    <select 
                        className="w-full p-2.5 rounded bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/20 dark:text-white text-sm"
                        value={source} onChange={e => setSource(e.target.value)}
                    >
                        {markets.map((m:any) => <option key={m.name}>{m.name}</option>)}
                    </select>
                </div>
                
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500">Commodity</label>
                    <select 
                        className="w-full p-3 rounded bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/20 dark:text-white"
                        value={selectedCommodity} onChange={e => setSelectedCommodity(e.target.value)}
                    >
                        {commodities.map((c:any) => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500">Inventory</label>
                        <Input type="number" value={inventory} onChange={e => setInventory(Number(e.target.value))} className="dark:bg-black" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500">Capacity</label>
                        <Input type="number" value={capacity} onChange={e => setCapacity(Number(e.target.value))} className="dark:bg-black" />
                    </div>
                </div>
            </div>

            <div className="space-y-6 mt-8 pt-6 border-t border-slate-100 dark:border-white/5">
                <SliderControl label="Demand Strength" value={demandFactor} setValue={setDemandFactor} color="accent-blue-500" />
                <SliderControl label="Supply Stability" value={supplyFactor} setValue={setSupplyFactor} color="accent-emerald-500" />
                <SliderControl label="Price Trend" value={priceTrend} setValue={setPriceTrend} color="accent-amber-500" />
            </div>

            <Button 
                onClick={handlePredict} 
                disabled={loading} 
                className="w-full mt-6 h-12 bg-slate-900 dark:bg-white dark:text-black font-bold"
            >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Run AI Simulation"}
            </Button>
          </Card>
        </div>

        {/* RIGHT: AI RESULTS */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* ELASTICITY SCORE CARD */}
            <Card className="p-8 bg-slate-900 text-white relative overflow-hidden border-slate-800">
                <Cpu className="absolute top-8 right-8 w-40 h-40 opacity-10"/>
                <div className="relative z-10">
                    <p className="text-sm font-bold text-slate-400 uppercase mb-2">Calculated Elasticity Score</p>
                    <div className="text-6xl font-mono font-bold tracking-tighter">
                        {result ? result.metrics.elasticity : "0.000"}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                        {result ? "Optimization Complete" : "Waiting for input..."}
                    </p>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full mt-6 overflow-hidden">
                    <div className={`h-full transition-all duration-1000 ${result && Number(result.metrics.elasticity) > 1 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: result ? `${Math.min(100, Number(result.metrics.elasticity) * 50)}%` : '0%' }}></div>
                </div>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard label="Scarcity Risk" value={result ? `${result.metrics.scarcityRisk}%` : "--"} />
                <MetricCard label="Rec. Quantity" value={result ? `${result.metrics.recommendedQty.toLocaleString()} kg` : "--"} />
                <MetricCard label="AI Confidence" value={result ? `${result.metrics.confidence}%` : "--"} />
                <MetricCard label="Est. Impact" value={result ? (Number(result.metrics.elasticity) > 1 ? "HIGH" : "LOW") : "--"} />
            </div>

            <Card className="p-6 bg-white dark:bg-neutral-900 border-slate-200 dark:border-white/10 min-h-[200px]">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" /> Strategic Action Plan (Generated by Gemini)
                </h3>
                
                {!result ? (
                    <div className="h-40 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 dark:border-white/5 rounded-lg">
                        <BrainCircuit className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-sm">Run simulation to fetch AI insights</p>
                    </div>
                ) : (
                    <div className="space-y-3 animate-in slide-in-from-bottom-4">
                        {result.actionPlan.map((step: string, i: number) => (
                            <div key={i} className="flex gap-3 items-start p-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/5">
                                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400 flex items-center justify-center text-xs font-bold mt-0.5">
                                    {i + 1}
                                </span>
                                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                                    {step.replace(/^\d+\.\s*/, '').replace(/^- /, '')}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
      </div>
    </div>
  );
}

// Helpers
function SliderControl({ label, value, setValue, color }: any) {
    return <div className="space-y-3"><div className="flex justify-between"><span className="text-xs font-bold text-slate-500 uppercase">{label}</span><span className="text-xs font-bold dark:text-white">{value.toFixed(2)}</span></div><input type="range" min="0.1" max="2.0" step="0.05" value={value} onChange={e => setValue(Number(e.target.value))} className={`w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer ${color}`}/></div>;
}
function MetricCard({ label, value }: any) {
    return <Card className="p-4 bg-white dark:bg-neutral-900 border-slate-200 dark:border-white/10"><p className="text-[10px] font-bold text-slate-500 uppercase mb-1">{label}</p><p className="text-xl font-bold text-slate-900 dark:text-white truncate">{value}</p></Card>;
}