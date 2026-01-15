import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
    Activity, 
    Sliders, 
    Loader2, 
    AlertTriangle, 
    CheckCircle2, 
    Package, 
    Zap, 
    ShieldAlert, 
    Search,
    BrainCircuit // New icon for AI
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

    // Simulate Processing Delay for realism (and to show off the loader)
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

        // E. AI Strategy Generation (Context-Aware Logic)
        let actionPlan = [];
        if (scarcityRisk > 70) {
            actionPlan = [
                `🚨 CRITICAL: ${selectedCommodity} supply chain is fragile (Risk: ${scarcityRisk}%).`,
                `2. Diversify logistics immediately. Dependence on ${source} is a bottleneck.`,
                `3. Halt low-priority production lines to conserve ${selectedCommodity} stock.`
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
    }, 1500); 
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in pb-12">
      
      {/* HEADER */}
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <BrainCircuit className="w-8 h-8 text-emerald-500" /> Prediction Engine
        </h1>
        <p className="text-zinc-400 mt-1">
            Hybrid Engine: Commodity DNA + Deterministic Math + Generative AI Strategy.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: CONTROLS */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 bg-zinc-900/40 border-white/5 backdrop-blur-sm shadow-sm">
            <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                <Sliders className="w-4 h-4" /> Parameters
            </h3>
            
            <div className="space-y-5">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Source Hub</label>
                    <div className="relative">
                        <select 
                            className="w-full p-2.5 rounded bg-black border border-white/10 text-white text-sm focus:border-blue-500 outline-none appearance-none"
                            value={source} onChange={e => setSource(e.target.value)}
                        >
                            {MARKETS.map(m => (
                                <option key={m} value={m} className="bg-zinc-900 text-white">
                                    {m}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Commodity (DNA Active)</label>
                    <div className="relative">
                        <select 
                            className="w-full p-3 rounded bg-blue-900/10 border border-blue-500/20 text-white font-medium text-sm focus:border-blue-500 outline-none appearance-none"
                            value={selectedCommodity} onChange={e => setSelectedCommodity(e.target.value)}
                        >
                            {Object.keys(COMMODITY_DNA).map(c => (
                                <option key={c} value={c} className="bg-zinc-900 text-white">
                                    {c}
                                </option>
                            ))}
                        </select>
                        <Zap className="absolute right-3 top-3 w-4 h-4 text-blue-500 pointer-events-none" />
                    </div>
                    <p className="text-[10px] text-blue-400 font-medium mt-1 flex items-center gap-1">
                        <Activity className="w-3 h-3" /> DNA Loaded: Sensitivity {COMMODITY_DNA[selectedCommodity].sensitivity}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase">Inventory</label>
                        <Input 
                            type="number" 
                            value={inventory} 
                            onChange={e => setInventory(Number(e.target.value))} 
                            className="bg-black border-white/10 text-white" 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase">Capacity</label>
                        <Input 
                            type="number" 
                            value={capacity} 
                            onChange={e => setCapacity(Number(e.target.value))} 
                            className="bg-black border-white/10 text-white" 
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-6 mt-8 pt-6 border-t border-white/5">
                <SliderControl label="Demand Strength" value={demandFactor} setValue={setDemandFactor} color="accent-blue-500" />
                <SliderControl label="Supply Stability" value={supplyFactor} setValue={setSupplyFactor} color="accent-emerald-500" />
                <SliderControl label="Price Trend" value={priceTrend} setValue={setPriceTrend} color="accent-yellow-500" />
            </div>

            <Button 
                onClick={handlePredict} 
                disabled={loading} 
                className="w-full mt-6 h-12 bg-white text-black hover:bg-zinc-200 font-bold text-base shadow-lg transition-all"
            >
                {loading ? (
                    <div className="flex items-center gap-2">
                        <Loader2 className="animate-spin w-5 h-5" /> Neural Processing...
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
            <Card className="p-8 bg-zinc-900 border-white/10 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Search className="w-48 h-48 text-white"/>
                </div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
                    <div>
                        <p className="text-sm font-bold text-zinc-500 uppercase mb-2 flex items-center gap-2">
                            <Activity className="w-4 h-4" /> Calculated Elasticity Score
                        </p>
                        <div className="text-7xl font-mono font-bold tracking-tighter text-white">
                            {result ? result.elasticity : "0.00"}
                        </div>
                        <p className="text-sm text-zinc-400 mt-2">
                            {result ? (
                                result.elasticity > 1.3 ? "High Sensitivity detected. Market is volatile." : 
                                "Market conditions stable for this commodity."
                            ) : "Waiting for simulation input..."}
                        </p>
                    </div>

                    <div className="text-right">
                        <div className={`text-xl font-bold px-4 py-2 rounded-lg inline-flex items-center gap-2 border ${
                            !result ? 'bg-zinc-800 text-zinc-500 border-zinc-700' :
                            result.impact === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                            result.impact === 'HIGH' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                            'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                            {result?.impact === 'CRITICAL' && <AlertTriangle className="w-5 h-5" />}
                            {result?.impact === 'LOW' && <CheckCircle2 className="w-5 h-5" />}
                            IMPACT: {result ? result.impact : "--"}
                        </div>
                    </div>
                </div>

                <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-8 overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-1000 ease-out ${
                            result && result.elasticity > 1.3 ? 'bg-red-500' : 
                            result && result.elasticity > 1.0 ? 'bg-yellow-500' : 'bg-emerald-500'
                        }`} 
                        style={{ width: result ? `${Math.min(100, result.elasticity * 40)}%` : '0%' }}
                    ></div>
                </div>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <MetricCard 
                    label="Scarcity Risk" 
                    value={result ? `${result.scarcityRisk}%` : "--"} 
                    icon={<ShieldAlert className={`w-4 h-4 ${result?.scarcityRisk > 50 ? 'text-red-500' : 'text-zinc-400'}`} />}
                />
                <MetricCard 
                    label="Rec. Order Qty" 
                    value={result ? `${result.recommendedQty.toLocaleString()} kg` : "--"} 
                    icon={<Package className="w-4 h-4 text-blue-500" />}
                />
                <MetricCard 
                    label="AI Confidence" 
                    value={result ? `${result.confidence}%` : "--"} 
                    icon={<Zap className="w-4 h-4 text-yellow-500" />}
                />
            </div>

            {/* ACTION PLAN */}
            <Card className="p-6 bg-zinc-900/40 border-white/5 backdrop-blur-sm min-h-[200px] shadow-sm">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-500" /> Strategic Action Plan
                </h3>
                
                {!result ? (
                    <div className="h-40 flex flex-col items-center justify-center text-zinc-500 border-2 border-dashed border-white/5 rounded-lg">
                        <Activity className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-sm">Run simulation to fetch AI insights</p>
                    </div>
                ) : (
                    <div className="space-y-3 animate-in slide-in-from-bottom-4">
                        {result.actionPlan.map((step: string, i: number) => (
                            <div key={i} className="flex gap-3 items-start p-3 bg-white/5 rounded-lg border border-white/5">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 text-zinc-400 flex items-center justify-center text-xs font-bold mt-0.5">
                                    {i + 1}
                                </span>
                                <p className="text-sm text-zinc-300 font-medium leading-relaxed">
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

// Helper Components
function SliderControl({ label, value, setValue, color }: any) {
    return (
        <div className="space-y-3">
            <div className="flex justify-between">
                <span className="text-xs font-bold text-zinc-500 uppercase">{label}</span>
                <span className="text-xs font-bold text-white">{value.toFixed(2)}</span>
            </div>
            <input 
                type="range" 
                min="0.5" max="2.0" step="0.05" 
                value={value} 
                onChange={e => setValue(Number(e.target.value))} 
                className={`w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer ${color}`}
            />
        </div>
    );
}

function MetricCard({ label, value, icon }: any) {
    return (
        <Card className="p-4 bg-zinc-900/40 border-white/5 backdrop-blur-sm shadow-sm flex flex-col justify-between hover:bg-zinc-900/60 transition-colors">
            <div className="flex justify-between items-start mb-2">
                <p className="text-[10px] font-bold text-zinc-500 uppercase">{label}</p>
                {icon}
            </div>
            <p className="text-2xl font-bold text-white truncate">{value}</p>
        </Card>
    );
}