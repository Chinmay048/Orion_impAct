import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Line } from "react-chartjs-2";
import { 
  Radio, Activity, Globe, AlertTriangle, TrendingUp, TrendingDown, 
  PauseCircle, PlayCircle, Anchor, Loader2
} from "lucide-react";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// --- GENUINE LOGIC DATA SETS ---
const COMMODITIES_BASE = [
    { name: "Industrial Steel", price: 450.50, volatility: 0.02 },
    { name: "Lithium Ion", price: 1200.00, volatility: 0.05 },
    { name: "Microchips", price: 8500.00, volatility: 0.08 },
    { name: "Copper Wire", price: 720.00, volatility: 0.03 },
    { name: "Polymer Resin", price: 180.00, volatility: 0.01 },
    { name: "Titanium Alloy", price: 3100.00, volatility: 0.04 }
];

const EVENT_TEMPLATES = [
    { type: "Disruption", severity: "High", templates: ["Port Strike in {loc}", "Customs delay for {com}", "Storm hits {loc} Hub", "Trade Tariffs on {com}"] },
    { type: "Opportunity", severity: "Low", templates: ["New Trade Route for {com}", "Surplus production in {loc}", "Tariffs reduced on {com}", "Transport efficiency up"] },
    { type: "Market", severity: "Medium", templates: ["Demand spike for {com}", "New supplier for {com}", "{com} stockpiling trend"] }
];

const LOCATIONS = ["Shanghai", "Mumbai", "Rotterdam", "Los Angeles", "Gujarat", "Hamburg"];

export default function MarketSensing() {
  // Initialize State with calculated baselines
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
  const [isThinking, setIsThinking] = useState(false); // Visual "Thinking" state
  
  // Refs to handle interval logic without closure staleness
  const marketRef = useRef(marketData);
  marketRef.current = marketData;

  // --- 1. THE LOGIC ENGINE (Prices & Sentiment) ---
  useEffect(() => {
    if (!isLive) return;

    // UPDATE INTERVAL: 4 Seconds (Slower for "Thinking" feel)
    const priceInterval = setInterval(() => {
        // Trigger "Thinking" visual slightly before update
        setIsThinking(true);
        setTimeout(() => setIsThinking(false), 1000); 

        setMarketData(current => {
            const updated = current.map(item => {
                // Logic: High volatility items move more aggressively
                const volatility = item.volatility;
                const movement = (Math.random() * volatility * 2) - (volatility * 0.8); // Slight upward bias
                
                let newPrice = item.basePrice * (1 + movement);
                const newHistory = [...item.history.slice(1), newPrice];
                
                // Logic: If price spikes > 5% in history, sentiment worsens
                const startPrice = newHistory[0];
                const changePct = ((newPrice - startPrice) / startPrice) * 100;
                let sentiment = "Stable";
                if (changePct > 5) sentiment = "Critical"; // High prices = Bad for buyer
                else if (changePct < -2) sentiment = "Opportunity"; // Low prices = Good for buyer

                return {
                    ...item,
                    basePrice: newPrice,
                    history: newHistory,
                    trend: movement > 0 ? 'up' : 'down',
                    sentiment
                };
            });

            // Logic: Calculate Global Sentiment Score based on Average Volatility
            const totalVariance = updated.reduce((acc, item) => {
                const variance = Math.abs((item.basePrice - item.history[0]) / item.history[0]);
                return acc + variance;
            }, 0);
            
            // Score starts at 100, subtracts based on market chaos
            const newScore = Math.max(10, Math.min(100, Math.round(100 - (totalVariance * 400))));
            setSentimentScore(prev => prev + (newScore - prev) * 0.1); // Smooth transition

            return updated;
        });
    }, 4000); // <-- DELAY INCREASED TO 4000ms

    return () => clearInterval(priceInterval);
  }, [isLive]);

  // --- 2. THE EVENT GENERATOR (News Feed) ---
  useEffect(() => {
    if (!isLive) return;

    const newsInterval = setInterval(() => {
        // Reduced chance to generate news so it doesn't flood
        if (Math.random() > 0.6) {
            const targetCom = COMMODITIES_BASE[Math.floor(Math.random() * COMMODITIES_BASE.length)];
            const targetLoc = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
            const eventType = EVENT_TEMPLATES[Math.floor(Math.random() * EVENT_TEMPLATES.length)];
            const template = eventType.templates[Math.floor(Math.random() * eventType.templates.length)];
            
            const title = template.replace("{com}", targetCom.name).replace("{loc}", targetLoc);
            
            const newEvent = {
                id: Date.now(),
                title: title,
                type: eventType.type,
                severity: eventType.severity,
                affected: targetCom.name,
                time: "Just now"
            };

            // IMPACT LOGIC: News affects volatility
            setMarketData(current => current.map(c => {
                if (c.name === targetCom.name) {
                    const volatilityMod = eventType.type === "Disruption" ? 0.15 : 0.02;
                    return { ...c, volatility: volatilityMod };
                }
                return c;
            }));

            setGlobalFeed(prev => [newEvent, ...prev].slice(0, 5));
        }
    }, 10000); // <-- DELAY INCREASED TO 10 SECONDS

    return () => clearInterval(newsInterval);
  }, [isLive]);

  const selected = marketData.find(m => m.name === selectedId) || marketData[0];

  // Chart Config
  const chartData = {
    labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Yesterday", "Today"],
    datasets: [{
        label: 'Price Trend',
        data: selected?.history || [],
        borderColor: selected?.trend === 'down' ? '#10b981' : '#ef4444', 
        backgroundColor: selected?.trend === 'down' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1200 }, // Slower animation
    plugins: { legend: { display: false } },
    scales: { x: { display: false }, y: { display: false } }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in pb-12">
        
        {/* HEADER */}
        <div className="flex justify-between items-end border-b border-slate-200 dark:border-white/10 pb-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <Radio className={`w-8 h-8 text-blue-500 ${isLive ? 'animate-pulse' : ''}`} /> 
                    Global Threat Radar
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time volatility tracking & event correlation.</p>
            </div>
            
            <div className="flex items-center gap-3">
                {/* Visual "Thinking" Indicator */}
                <div className={`text-xs font-bold font-mono transition-opacity duration-300 ${isThinking ? 'opacity-100 text-blue-500' : 'opacity-0'}`}>
                    ANALYZING MARKET DATA...
                </div>

                <button 
                    onClick={() => setIsLive(!isLive)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${isLive ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-300'}`}
                >
                    <span className={`text-xs font-bold uppercase tracking-wider ${isLive ? 'text-white' : 'text-slate-500'}`}>
                        {isLive ? 'Live Feed Active' : 'Feed Paused'}
                    </span>
                    {isLive ? <PauseCircle className="w-4 h-4 text-slate-400 ml-2"/> : <PlayCircle className="w-4 h-4 text-slate-500 ml-2"/>}
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT PANEL: LIST */}
            <div className="lg:col-span-4 space-y-3 h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {marketData.map((item) => (
                    <div 
                        key={item.name}
                        onClick={() => setSelectedId(item.name)} 
                        className={`group p-4 rounded-xl border cursor-pointer transition-all duration-500 relative overflow-hidden ${
                            selected?.name === item.name 
                            ? 'bg-slate-900 border-blue-500 shadow-lg scale-[1.02]' 
                            : 'bg-white dark:bg-neutral-900 border-slate-200 dark:border-white/10 hover:border-blue-500/50'
                        }`}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <h3 className={`font-bold text-sm ${selected?.name === item.name ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{item.name}</h3>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                item.sentiment === 'Critical' ? 'bg-red-500/20 text-red-500' : 
                                item.sentiment === 'Opportunity' ? 'bg-emerald-500/20 text-emerald-500' : 
                                'bg-slate-500/20 text-slate-500'
                            }`}>
                                {item.sentiment}
                            </span>
                        </div>

                        <div className="flex justify-between items-end">
                            <div className={`text-xl font-mono font-bold ${selected?.name === item.name ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                                ₹{item.basePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            {/* Visual Logic: Arrow only appears if trend is significant */}
                            {item.trend === 'up' 
                                ? <TrendingUp className="w-4 h-4 text-red-500" /> 
                                : <TrendingDown className="w-4 h-4 text-emerald-500" /> 
                            }
                        </div>
                    </div>
                ))}
            </div>

            {/* CENTER PANEL */}
            <div className="lg:col-span-8 space-y-6">
                
                {/* CHART */}
                <Card className="p-6 bg-slate-950 border-slate-800 shadow-2xl relative overflow-hidden h-[350px] flex flex-col justify-between">
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                {selected?.name} <span className="text-slate-500 text-lg">Analysis</span>
                            </h2>
                            <p className="text-xs text-slate-400 mt-1">Live Volatility Stream</p>
                        </div>
                        <div className="text-right">
                             <div className="text-4xl font-bold text-white tracking-tight flex items-center justify-end gap-3">
                                {isThinking && <Loader2 className="w-6 h-6 animate-spin text-blue-500" />}
                                {selected?.basePrice.toFixed(2)}
                             </div>
                             <div className={`text-xs font-mono flex justify-end items-center gap-1 ${selected?.trend === 'up' ? 'text-red-400' : 'text-emerald-400'}`}>
                                {selected?.trend === 'up' ? '▲ Price Rising' : '▼ Price Falling'}
                             </div>
                        </div>
                    </div>

                    <div className="flex-1 w-full relative z-10 mt-4">
                        <Line data={chartData} options={chartOptions} />
                    </div>
                </Card>

                {/* EVENTS & SENTIMENT */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Live News Feed */}
                    <Card className="p-0 bg-white dark:bg-neutral-900 border-slate-200 dark:border-white/10 h-[280px] overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Globe className="w-4 h-4 text-blue-500" /> Global Supply Wire
                            </h3>
                            {isThinking ? (
                                <span className="text-[10px] font-bold text-blue-500 animate-pulse">ANALYZING...</span>
                            ) : (
                                <span className="text-[10px] font-bold text-slate-400">LIVE</span>
                            )}
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {globalFeed.map((n) => (
                                <div key={n.id} className="flex gap-3 items-start animate-in slide-in-from-left-2 duration-300">
                                    <div className="mt-1">
                                        {n.type === 'Disruption' ? <AlertTriangle className="w-4 h-4 text-red-500" /> : 
                                         n.type === 'Opportunity' ? <Anchor className="w-4 h-4 text-emerald-500" /> :
                                         <Activity className="w-4 h-4 text-blue-500" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-white/10 rounded text-slate-500 uppercase">{n.time}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">{n.affected}</span>
                                        </div>
                                        <h4 className="text-sm font-medium text-slate-900 dark:text-white leading-tight">{n.title}</h4>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Sentiment Score */}
                    <Card className="p-6 bg-white dark:bg-neutral-900 border-slate-200 dark:border-white/10 flex flex-col justify-center items-center text-center relative overflow-hidden h-[280px]">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
                        
                        <div className="relative z-10 w-full">
                            <h3 className="font-bold text-slate-500 uppercase tracking-widest text-xs mb-6">Market Sentiment Index</h3>
                            
                            <div className="relative w-32 h-32 mx-auto flex items-center justify-center mb-4">
                                {/* Animated Ring */}
                                <svg className="absolute inset-0 w-full h-full -rotate-90">
                                    <circle cx="64" cy="64" r="56" fill="transparent" strokeWidth="8" className="stroke-slate-100 dark:stroke-white/5" />
                                    <circle cx="64" cy="64" r="56" fill="transparent" strokeWidth="8" 
                                        className={`transition-all duration-1000 ${sentimentScore > 60 ? 'stroke-emerald-500' : sentimentScore > 40 ? 'stroke-amber-500' : 'stroke-red-500'}`}
                                        strokeDasharray={351}
                                        strokeDashoffset={351 - (351 * sentimentScore) / 100}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="text-4xl font-bold text-slate-900 dark:text-white tracking-tighter">
                                    {Math.round(sentimentScore)}
                                </div>
                            </div>

                            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                {sentimentScore > 80 ? "Conditions Optimal. Low Risk." : 
                                 sentimentScore > 50 ? "Moderate Volatility Detected." : 
                                 "CRITICAL MARKET INSTABILITY"}
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    </div>
  );
}