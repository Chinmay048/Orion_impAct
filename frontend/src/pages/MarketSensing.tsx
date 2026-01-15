import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Line } from "react-chartjs-2";
import { 
  Radio, Activity, Globe, AlertTriangle, TrendingUp, TrendingDown, 
  PauseCircle, PlayCircle, Anchor, Loader2, Zap
} from "lucide-react";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, ScriptableContext
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// --- GENUINE LOGIC DATA SETS ---
const COMMODITIES_BASE = [
    { name: "Industrial Steel", price: 450.50, volatility: 0.02 },
    { name: "Lithium Ion", price: 1200.00, volatility: 0.05 },
    { name: "Microchips", price: 8500.00, volatility: 0.08 },
    { name: "Copper Wire", price: 720.00, volatility: 0.03 },
    { name: "Polymer Resin", price: 179.00, volatility: 0.01 },
    { name: "Titanium Alloy", price: 3100.00, volatility: 0.04 }
];

const EVENT_TEMPLATES = [
    { type: "Disruption", severity: "High", templates: ["Port Strike in {loc}", "Customs delay for {com}", "Storm hits {loc} Hub", "Trade Tariffs on {com}"] },
    { type: "Opportunity", severity: "Low", templates: ["New Trade Route for {com}", "Surplus production in {loc}", "Tariffs reduced on {com}", "Transport efficiency up"] },
    { type: "Market", severity: "Medium", templates: ["Demand spike for {com}", "New supplier for {com}", "{com} stockpiling trend"] }
];

const LOCATIONS = ["Shanghai", "Mumbai", "Rotterdam", "Los Angeles", "Gujarat", "Hamburg"];

export default function MarketSensing() {
  const [marketData, setMarketData] = useState<any[]>(() => 
    COMMODITIES_BASE.map(c => ({
        ...c,
        basePrice: c.price,
        history: Array(7).fill(c.price).map((p) => p * (1 + (Math.random() * 0.04 - 0.02))),
        trend: 'neutral',
        sentiment: 'Stable'
    }))
  );

  const [globalFeed, setGlobalFeed] = useState<any[]>([
    { id: 1, title: "Market Open: Trading Begins", type: "Market", severity: "Low", affected: "Global", time: "Just now" }
  ]);
  
  const [selectedId, setSelectedId] = useState<string>("Industrial Steel");
  const [isLive, setIsLive] = useState(true);
  const [sentimentScore, setSentimentScore] = useState(88);
  const [isThinking, setIsThinking] = useState(false);
  
  // --- LOGIC ENGINE ---
  useEffect(() => {
    if (!isLive) return;

    const priceInterval = setInterval(() => {
        setIsThinking(true);
        setTimeout(() => setIsThinking(false), 800); 

        setMarketData(current => {
            const updated = current.map(item => {
                const volatility = item.volatility;
                const movement = (Math.random() * volatility * 2) - (volatility * 0.8);
                let newPrice = item.basePrice * (1 + movement);
                const newHistory = [...item.history.slice(1), newPrice];
                
                const startPrice = newHistory[0];
                const changePct = ((newPrice - startPrice) / startPrice) * 100;
                let sentiment = "Stable";
                if (changePct > 5) sentiment = "Critical"; 
                else if (changePct < -2) sentiment = "Opportunity"; 

                return {
                    ...item,
                    basePrice: newPrice,
                    history: newHistory,
                    trend: movement > 0 ? 'up' : 'down',
                    sentiment
                };
            });

            const totalVariance = updated.reduce((acc, item) => {
                const variance = Math.abs((item.basePrice - item.history[0]) / item.history[0]);
                return acc + variance;
            }, 0);
            
            const newScore = Math.max(10, Math.min(100, Math.round(100 - (totalVariance * 400))));
            setSentimentScore(prev => prev + (newScore - prev) * 0.1);

            return updated;
        });
    }, 3000);

    return () => clearInterval(priceInterval);
  }, [isLive]);

  // --- EVENT GENERATOR ---
  useEffect(() => {
    if (!isLive) return;
    const newsInterval = setInterval(() => {
        if (Math.random() > 0.65) {
            const targetCom = COMMODITIES_BASE[Math.floor(Math.random() * COMMODITIES_BASE.length)];
            const targetLoc = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
            const eventType = EVENT_TEMPLATES[Math.floor(Math.random() * EVENT_TEMPLATES.length)];
            const template = eventType.templates[Math.floor(Math.random() * eventType.templates.length)];
            
            const newEvent = {
                id: Date.now(),
                title: template.replace("{com}", targetCom.name).replace("{loc}", targetLoc),
                type: eventType.type,
                severity: eventType.severity,
                affected: targetCom.name,
                time: "Just now"
            };

            setMarketData(current => current.map(c => {
                if (c.name === targetCom.name) {
                    return { ...c, volatility: eventType.type === "Disruption" ? 0.15 : 0.02 };
                }
                return c;
            }));
            setGlobalFeed(prev => [newEvent, ...prev].slice(0, 6));
        }
    }, 8000); 
    return () => clearInterval(newsInterval);
  }, [isLive]);

  const selected = marketData.find(m => m.name === selectedId) || marketData[0];

  // --- CHART OPTIONS ---
  const chartData = {
    labels: ["T-6", "T-5", "T-4", "T-3", "T-2", "Yesterday", "Today"],
    datasets: [{
        label: 'Price',
        data: selected?.history || [],
        borderColor: selected?.trend === 'down' ? '#10b981' : '#ef4444', 
        borderWidth: 3,
        backgroundColor: (context: ScriptableContext<"line">) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            const color = selected?.trend === 'down' ? "16, 185, 129" : "239, 68, 68";
            gradient.addColorStop(0, `rgba(${color}, 0.2)`);
            gradient.addColorStop(1, `rgba(${color}, 0)`);
            return gradient;
        },
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#000',
        pointBorderColor: selected?.trend === 'down' ? '#10b981' : '#ef4444',
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1000 },
    plugins: { legend: { display: false } },
    scales: { 
        x: { display: false }, 
        y: { 
            display: false,
            min: Math.min(...(selected?.history || [])) * 0.95,
            max: Math.max(...(selected?.history || [])) * 1.05
        } 
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in pb-12">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end border-b border-white/10 pb-6 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Radio className={`w-8 h-8 text-blue-500 ${isLive ? 'animate-pulse' : ''}`} /> 
                    Global Threat Radar
                </h1>
                <p className="text-zinc-400 mt-1">Real-time volatility tracking & event correlation.</p>
            </div>
            
            <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 text-xs font-bold font-mono transition-opacity duration-300 ${isThinking ? 'opacity-100 text-blue-400' : 'opacity-0'}`}>
                    <Zap className="w-3 h-3" /> UPDATING...
                </div>
                <button 
                    onClick={() => setIsLive(!isLive)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${isLive ? 'bg-zinc-900 border-white/10 text-white' : 'bg-white text-black border-transparent'}`}
                >
                    <span className="text-xs font-bold uppercase tracking-wider">{isLive ? 'PAUSE FEED' : 'RESUME FEED'}</span>
                    {isLive ? <PauseCircle className="w-4 h-4"/> : <PlayCircle className="w-4 h-4"/>}
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT SIDEBAR: TICKER LIST */}
            <div className="lg:col-span-4 space-y-2 h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {marketData.map((item) => (
                    <div 
                        key={item.name}
                        onClick={() => setSelectedId(item.name)} 
                        className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 relative overflow-hidden ${
                            selected?.name === item.name 
                            ? 'bg-zinc-900/80 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]' 
                            : 'bg-zinc-900/20 border-white/5 hover:bg-zinc-900/40 hover:border-white/10'
                        }`}
                    >
                        {selected?.name === item.name && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>}
                        <div className="flex justify-between items-center mb-1">
                            <h3 className={`font-bold text-sm ${selected?.name === item.name ? 'text-white' : 'text-zinc-400'}`}>{item.name}</h3>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                item.sentiment === 'Critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                                item.sentiment === 'Opportunity' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                'bg-zinc-800 text-zinc-500 border-zinc-700'
                            }`}>
                                {item.sentiment}
                            </span>
                        </div>
                        <div className="flex justify-between items-end">
                            <div className="text-lg font-mono font-bold text-white">
                                ₹{item.basePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            {item.trend === 'up' 
                                ? <TrendingUp className="w-4 h-4 text-red-500" /> 
                                : <TrendingDown className="w-4 h-4 text-emerald-500" /> 
                            }
                        </div>
                    </div>
                ))}
            </div>

            {/* CENTER STAGE: VISUALIZATION */}
            <div className="lg:col-span-8 space-y-6">
                
                {/* MAIN CHART CARD */}
                <Card className="p-6 bg-zinc-900/40 border-white/10 backdrop-blur-md shadow-xl relative overflow-hidden h-[380px] flex flex-col justify-between">
                    {/* Background Grid */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
                    
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                {selected?.name} 
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-400 border border-zinc-700">LIVE</span>
                            </h2>
                            <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest">Volatility Analysis Stream</p>
                        </div>
                        <div className="text-right">
                             <div className="text-4xl font-bold text-white tracking-tight flex items-center justify-end gap-3 font-mono">
                                {isThinking && <Loader2 className="w-5 h-5 animate-spin text-blue-500" />}
                                {selected?.basePrice.toFixed(2)}
                             </div>
                             <div className={`text-xs font-mono flex justify-end items-center gap-1 ${selected?.trend === 'up' ? 'text-red-400' : 'text-emerald-400'}`}>
                                {selected?.trend === 'up' ? '▲ PRICE SURGE DETECTED' : '▼ PRICE STABILIZING'}
                             </div>
                        </div>
                    </div>

                    <div className="flex-1 w-full relative z-10 mt-6">
                        {/* TypeScript fix: type casting to any to avoid ChartJS strict typing issues */}
                        <Line data={chartData} options={chartOptions as any} />
                    </div>
                </Card>

                {/* BOTTOM GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* NEWS FEED */}
                    <Card className="p-0 bg-zinc-900/40 border-white/5 h-[300px] overflow-hidden flex flex-col backdrop-blur-sm">
                        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                            <h3 className="font-bold text-white flex items-center gap-2 text-sm">
                                <Globe className="w-4 h-4 text-blue-500" /> Global Supply Wire
                            </h3>
                            <div className="flex gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse delay-75"></span>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse delay-150"></span>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {globalFeed.map((n) => (
                                <div key={n.id} className="flex gap-3 items-start group">
                                    <div className="mt-1 p-1 rounded bg-zinc-800 border border-zinc-700">
                                        {n.type === 'Disruption' ? <AlertTriangle className="w-3 h-3 text-red-500" /> : 
                                         n.type === 'Opportunity' ? <Anchor className="w-3 h-3 text-emerald-500" /> :
                                         <Activity className="w-3 h-3 text-blue-500" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <span className="text-[10px] font-bold text-zinc-500 uppercase">{n.affected}</span>
                                            <span className="text-[10px] font-mono text-zinc-600">{n.time}</span>
                                        </div>
                                        <h4 className="text-sm font-medium text-zinc-300 leading-snug group-hover:text-white transition-colors">{n.title}</h4>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* SENTIMENT GAUGE */}
                    <Card className="p-6 bg-zinc-900/40 border-white/5 backdrop-blur-sm flex flex-col justify-center items-center text-center relative overflow-hidden h-[300px]">
                        <div className="relative z-10 w-full">
                            <h3 className="font-bold text-zinc-500 uppercase tracking-widest text-xs mb-8">Market Sentiment Index</h3>
                            
                            <div className="relative w-40 h-40 mx-auto flex items-center justify-center mb-6">
                                <svg className="absolute inset-0 w-full h-full -rotate-90">
                                    <circle cx="80" cy="80" r="70" fill="transparent" strokeWidth="10" className="stroke-white/5" />
                                    <circle cx="80" cy="80" r="70" fill="transparent" strokeWidth="10" 
                                        className={`transition-all duration-1000 ${sentimentScore > 60 ? 'stroke-emerald-500' : sentimentScore > 40 ? 'stroke-yellow-500' : 'stroke-red-500'}`}
                                        strokeDasharray={440}
                                        strokeDashoffset={440 - (440 * sentimentScore) / 100}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="flex flex-col items-center">
                                    <span className="text-5xl font-bold text-white tracking-tighter">{Math.round(sentimentScore)}</span>
                                    <span className="text-xs text-zinc-500 font-mono mt-1">/ 100</span>
                                </div>
                            </div>

                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${
                                sentimentScore > 60 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 
                                sentimentScore > 40 ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' : 
                                'bg-red-500/10 border-red-500/20 text-red-400'
                            }`}>
                                <Activity className="w-3 h-3" />
                                <span className="text-xs font-bold uppercase">
                                    {sentimentScore > 80 ? "Optimal" : sentimentScore > 50 ? "Volatile" : "Critical"}
                                </span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    </div>
  );
}