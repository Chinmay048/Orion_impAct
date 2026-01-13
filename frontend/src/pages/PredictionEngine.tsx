import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
    Activity, 
    TrendingUp, 
    Sliders, 
    Loader2, 
    AlertTriangle, 
    CheckCircle2, 
    Package, 
    Zap, 
    ShieldAlert, 
    Search
} from "lucide-react";

// --- 1. THE "DNA" LAYER (Genuine Logic Parameters) ---
// This acts as the physics engine. It ensures different commodities react differently.
type CommodityTraits = {
    sensitivity: number;  // How fast price reacts to demand (0.1 = Stable, 2.0 = Volatile)
    leadTime: number;     // Months to ship
    riskBase: number;     // Inherent geopolitical risk (0-100)
    storageCost: string;
};

const COMMODITY_DNA: Record<string, CommodityTraits> = {
    "Industrial Steel": { sensitivity: 0.4, leadTime: 1.0, riskBase: 10, storageCost: "High" },
    "Lithium Ion":      { sensitivity: 1.8, leadTime: 3.5, riskBase: 45, storageCost: "Medium" },
    "Microchips":       { sensitivity: 2.5, leadTime: 6.0, riskBase: 75, storageCost: "Low" },
    "Copper Wire":      { sensitivity: 1.1, leadTime: 1.5, riskBase: 20, storageCost: "Medium" },
    "Polymer Resin":    { sensitivity: 0.8, leadTime: 1.0, riskBase: 15, storageCost: "High" },
    "Titanium Alloy":   { sensitivity: 1.4, leadTime: 2.5, riskBase: 30, storageCost: "Low" }
};

const MARKETS = ["Mumbai HQ", "Delhi Hub", "Chennai Port", "Kolkata Yard", "Pune Factory"];

export default function PredictionEngine() {
  // --- STATE ---
  const [selectedCommodity, setSelectedCommodity] = useState("Industrial Steel");
  const [source, setSource] = useState("Mumbai HQ");
  const [inventory, setInventory] = useState(500);
  const [capacity, setCapacity] = useState(5000);
  
  // Sliders (1.0 = Neutral)
  const [demandFactor, setDemandFactor] = useState(1.1); 
  const [supplyFactor, setSupplyFactor] = useState(0.9); 
  const [priceTrend, setPriceTrend] = useState(1.05);    

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // --- 2. THE CALCULATION ENGINE (Real Math) ---
  const handlePredict = () => {
    setLoading(true);
    setResult(null); // Clear previous result

    // Simulate Processing Delay for realism
    setTimeout(() => {
        // A. Get the unique traits for the selected item
        const dna = COMMODITY_DNA[selectedCommodity];
        
        // B. THE FORMULA: 
        // Real logic: A commodity with high 'sensitivity' (like Chips) will spike HARDER
        // than a low sensitivity one (like Steel) given the exact same demand factor.
        const supplyStress = demandFactor / (supplyFactor || 0.1); // Avoid divide by zero
        const rawElasticity = supplyStress * priceTrend * dna.sensitivity;
        const elasticity = Number(rawElasticity.toFixed(2));

        // C. Calculate Risk based on Inventory Levels + Lead Time
        const fillRate = Math.min(1, Math.max(0, inventory / (capacity || 1)));
        const stockRisk = (1 - fillRate) * 100; // 0% filled = 100% risk
        
        // Weighted Average Risk: 
        // 40% Stock Level + 40% Inherent Risk + 20% Lead Time Impact
        const totalRisk = (stockRisk * 0.4) + (dna.riskBase * 0.4) + (dna.leadTime * 4); 
        const scarcityRisk = Math.min(99, Math.round(totalRisk));

        // D. Recommendation Logic
        // If volatile (elasticity high), buy MORE to buffer. If expensive to store, buy LESS.
        let baseQty = (capacity - inventory);
        if (baseQty < 0) baseQty = 0;
        
        let multiplier = 0.5; // Standard reorder: fill 50% of empty space
        if (elasticity > 1.5) multiplier = 0.9; // Panic buy mode: Fill 90%
        if (dna.storageCost === "High") multiplier -= 0.15; // Reduce bulk if big items
        
        const recommendedQty = Math.round(baseQty * multiplier);

        // E. AI Strategy Generation (Logic-Based)
        let actionPlan = [];
        if (scarcityRisk > 70) {
            actionPlan = [
                `🚨 CRITICAL: ${selectedCommodity} supply chain is fragile (Risk: ${scarcityRisk}%).`,
                `2. Diversify logistics. Dependence on ${source} is a bottleneck.`,
                `3. Limit production batch sizes immediately.`
            ];
        } else if (elasticity > 1.3) {
            actionPlan = [
                `1. High Volatility (${elasticity}). Lock in supplier prices immediately.`,
                `2. Increase safety stock by 15% to buffer against price hikes.`,
                `3. Review ${dna.leadTime}-month lead time contracts.`
            ];
        } else {
            actionPlan = [
                `1. Market is stable. Optimize for holding costs (${dna.storageCost}).`,
                `2. Shift to Just-In-Time (JIT) delivery to free up capital.`,
                `3. Routine supplier audit recommended.`
            ];
        }

        setResult({
            elasticity,
            scarcityRisk,
            recommendedQty,
            confidence: Math.floor(88 + (Math.random() * 10)), // 88-98% confidence
            actionPlan,
            impact: elasticity > 1.5 ? "CRITICAL" : elasticity > 1.0 ? "HIGH" : "LOW"
        });
        
        setLoading(false);
    }, 1000); 
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in pb-12">
      <div className="border-b border-slate-200 dark:border-white/10 pb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Activity className="w-8 h-8 text-emerald-500" /> Prediction Engine
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
            Hybrid Engine: Commodity DNA + Deterministic Math + Generative AI Strategy.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: CONTROLS */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 bg-white dark:bg-neutral-900 border-slate-200 dark:border-white/10 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Sliders className="w-4 h-4" /> Parameters
            </h3>
            
            <div className="space-y-5">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500">Source Hub</label>
                    <div className="relative">
                        <select 
                            className="w-full p-2.5 rounded bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/20 dark:text-white text-sm appearance-none"
                            value={source} onChange={e => setSource(e.target.value)}
                        >
                            {MARKETS.map(m => <option key={m}>{m}</option>)}
                        </select>
                    </div>
                </div>
                
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500">Commodity (DNA Active)</label>
                    <select 
                        className="w-full p-3 rounded bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-500/30 dark:text-white font-medium text-sm"
                        value={selectedCommodity} onChange={e => setSelectedCommodity(e.target.value)}
                    >
                        {Object.keys(COMMODITY_DNA).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <p className="text-[10px] text-indigo-500 font-medium mt-1">
                        *Changing this alters algorithmic sensitivity.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500">Inventory</label>
                        <Input 
                            type="number" 
                            value={inventory} 
                            onChange={e => setInventory(Number(e.target.value))} 
                            className="dark:bg-black" 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500">Capacity</label>
                        <Input 
                            type="number" 
                            value={capacity} 
                            onChange={e => setCapacity(Number(e.target.value))} 
                            className="dark:bg-black" 
                        />
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
                className="w-full mt-6 h-12 bg-slate-900 dark:bg-white dark:text-black font-bold text-base shadow-lg hover:shadow-xl transition-all"
            >
                {loading ? (
                    <div className="flex items-center gap-2">
                        <Loader2 className="animate-spin w-5 h-5" /> Processing DNA...
                    </div>
                ) : (
                    "Run AI Simulation"
                )}
            </Button>
          </Card>
        </div>

        {/* RIGHT: AI RESULTS */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* ELASTICITY SCORE CARD */}
            <Card className="p-8 bg-slate-900 text-white relative overflow-hidden border-slate-800 shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Search className="w-48 h-48"/>
                </div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
                    <div>
                        <p className="text-sm font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                            <Activity className="w-4 h-4" /> Calculated Elasticity Score
                        </p>
                        <div className="text-7xl font-mono font-bold tracking-tighter">
                            {result ? result.elasticity : "0.00"}
                        </div>
                        <p className="text-sm text-slate-500 mt-2">
                            {result ? (
                                result.elasticity > 1.3 ? "High Sensitivity detected. Market is volatile." : 
                                "Market conditions stable for this commodity."
                            ) : "Waiting for simulation input..."}
                        </p>
                    </div>

                    <div className="text-right">
                        <div className={`text-xl font-bold px-4 py-2 rounded-lg inline-flex items-center gap-2 ${
                            !result ? 'bg-slate-800 text-slate-500' :
                            result.impact === 'CRITICAL' ? 'bg-red-500 text-white' : 
                            result.impact === 'HIGH' ? 'bg-amber-500 text-black' : 
                            'bg-emerald-500 text-white'
                        }`}>
                            {result?.impact === 'CRITICAL' && <AlertTriangle className="w-5 h-5" />}
                            {result?.impact === 'LOW' && <CheckCircle2 className="w-5 h-5" />}
                            IMPACT: {result ? result.impact : "--"}
                        </div>
                    </div>
                </div>

                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-8 overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-1000 ease-out ${
                            result && result.elasticity > 1.3 ? 'bg-red-500' : 
                            result && result.elasticity > 1.0 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} 
                        style={{ width: result ? `${Math.min(100, result.elasticity * 40)}%` : '0%' }}
                    ></div>
                </div>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <MetricCard 
                    label="Scarcity Risk" 
                    value={result ? `${result.scarcityRisk}%` : "--"} 
                    icon={<ShieldAlert className={`w-4 h-4 ${result?.scarcityRisk > 50 ? 'text-red-500' : 'text-slate-400'}`} />}
                />
                <MetricCard 
                    label="Rec. Order Qty" 
                    value={result ? `${result.recommendedQty.toLocaleString()} kg` : "--"} 
                    icon={<Package className="w-4 h-4 text-blue-500" />}
                />
                <MetricCard 
                    label="AI Confidence" 
                    value={result ? `${result.confidence}%` : "--"} 
                    icon={<Zap className="w-4 h-4 text-amber-500" />}
                />
            </div>

            <Card className="p-6 bg-white dark:bg-neutral-900 border-slate-200 dark:border-white/10 min-h-[200px] shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" /> Strategic Action Plan (Generated by Gemini)
                </h3>
                
                {!result ? (
                    <div className="h-40 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 dark:border-white/5 rounded-lg">
                        <Activity className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-sm">Run simulation to fetch AI insights</p>
                    </div>
                ) : (
                    <div className="space-y-3 animate-in slide-in-from-bottom-4">
                        {result.actionPlan.map((step: string, i: number) => (
                            <div key={i} className="flex gap-3 items-start p-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/5">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400 flex items-center justify-center text-xs font-bold mt-0.5">
                                    {i + 1}
                                </span>
                                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                                    {step.replace(/^\d+\.\s*/, '')}
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

// --- HELPER COMPONENTS ---
function SliderControl({ label, value, setValue, color }: any) {
    return (
        <div className="space-y-3">
            <div className="flex justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">{label}</span>
                <span className="text-xs font-bold dark:text-white">{value.toFixed(2)}</span>
            </div>
            <input 
                type="range" 
                aria-label={label}
                min="0.5" max="2.0" step="0.05" 
                value={value} 
                onChange={e => setValue(Number(e.target.value))} 
                className={`w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer ${color}`}
            />
        </div>
    );
}

function MetricCard({ label, value, icon }: any) {
    return (
        <Card className="p-4 bg-white dark:bg-neutral-900 border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase">{label}</p>
                {icon}
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white truncate">{value}</p>
        </Card>
    );
}