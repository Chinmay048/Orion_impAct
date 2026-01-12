import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Line } from "react-chartjs-2";
import { 
  Radio, 
  Activity, 
  Globe, 
  Zap, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  ArrowRight
} from "lucide-react";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function MarketSensing() {
  const [marketData, setMarketData] = useState<any[]>([]);
  const [globalFeed, setGlobalFeed] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
        const res = await fetch("http://localhost:3000/api/market-sensing");
        const data = await res.json();
        setMarketData(data.marketData);
        setGlobalFeed(data.globalFeed);
        if (data.marketData.length > 0) setSelected(data.marketData[0]);
    };
    fetchData();
  }, []);

  // Chart Configuration
  const chartData = {
    labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Yesterday", "Today"],
    datasets: [{
        label: 'Price Trend',
        data: selected?.history || [],
        borderColor: selected?.volatility === 'High' || selected?.volatility === 'Extreme' ? '#ef4444' : '#10b981',
        backgroundColor: selected?.volatility === 'High' || selected?.volatility === 'Extreme' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
        x: { grid: { display: false }, ticks: { color: '#64748b' } },
        y: { grid: { color: '#334155' }, ticks: { color: '#64748b' } }
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in pb-12">
        
        {/* HEADER */}
        <div className="flex justify-between items-end border-b border-slate-200 dark:border-white/10 pb-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <Radio className="w-8 h-8 text-blue-500 animate-pulse" /> 
                    Global Threat Radar
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time volatility tracking & event correlation.</p>
            </div>
            <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-lg border border-slate-800">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="text-xs font-bold text-white uppercase tracking-wider">Live Feed Active</span>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT PANEL: COMMODITY LIST (4 cols) */}
            <div className="lg:col-span-4 space-y-4 h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {marketData.map((item) => (
                    <div 
                        key={item.name}
                        onClick={() => setSelected(item)} 
                        className={`group p-5 rounded-xl border cursor-pointer transition-all duration-300 relative overflow-hidden ${
                            selected?.name === item.name 
                            ? 'bg-slate-900 border-blue-500 ring-1 ring-blue-500' 
                            : 'bg-white dark:bg-neutral-900 border-slate-200 dark:border-white/10 hover:border-blue-500/50'
                        }`}
                    >
                        {/* Selected Indicator */}
                        {selected?.name === item.name && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>}

                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className={`font-bold text-sm ${selected?.name === item.name ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{item.name}</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Global Spot Price</p>
                            </div>
                            <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${
                                item.volatility === 'Extreme' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                                item.volatility === 'High' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 
                                'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            }`}>
                                {item.volatility} Risk
                            </div>
                        </div>

                        <div className="flex justify-between items-end mt-4">
                            <div className={`text-2xl font-mono font-bold ${selected?.name === item.name ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                                ₹{item.basePrice.toLocaleString()}
                            </div>
                            {item.sentiment === 'Bullish' ? <TrendingUp className="w-5 h-5 text-emerald-500" /> : <TrendingDown className="w-5 h-5 text-red-500" />}
                        </div>
                    </div>
                ))}
            </div>

            {/* CENTER PANEL: THE WAR ROOM (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
                
                {/* 1. INTERACTIVE CHART */}
                <Card className="p-6 bg-slate-950 border-slate-800 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                        <Activity className="w-32 h-32 text-blue-500" />
                    </div>
                    
                    <div className="flex justify-between items-center mb-6 relative z-10">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                {selected?.name} <span className="text-slate-500">Analysis</span>
                            </h2>
                            <p className="text-xs text-slate-400 mt-1">7-Day Volatility Index & Event Correlation</p>
                        </div>
                        <div className="text-right">
                             <div className="text-2xl font-bold text-white">{(selected?.history[6] || 0).toFixed(2)}</div>
                             <div className="text-xs text-emerald-400 font-mono">+2.4% (24h)</div>
                        </div>
                    </div>

                    <div className="h-[300px] w-full relative z-10">
                        <Line data={chartData} options={chartOptions} />
                    </div>
                </Card>

                {/* 2. CORRELATED EVENTS (The "Ground Breaking" Part) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Live Wire Feed */}
                    <Card className="p-6 bg-white dark:bg-neutral-900 border-slate-200 dark:border-white/10 h-[300px] overflow-hidden flex flex-col">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
                            <Globe className="w-4 h-4 text-blue-500" /> Global Supply Wire
                        </h3>
                        <div className="space-y-4 overflow-y-auto flex-1 custom-scrollbar">
                            {globalFeed.map((n) => (
                                <div key={n.id} className="flex gap-3 items-start pb-3 border-b border-slate-50 dark:border-white/5 last:border-0">
                                    <div className="mt-1">
                                        {n.type === 'Disruption' ? <AlertTriangle className="w-4 h-4 text-red-500" /> : <Zap className="w-4 h-4 text-amber-500" />}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase mb-0.5">{n.time} • {n.affected}</p>
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{n.title}</h4>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Impact Analysis */}
                    <Card className="p-6 bg-white dark:bg-neutral-900 border-slate-200 dark:border-white/10 flex flex-col justify-center items-center text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 dark:text-blue-400">
                                <Activity className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-lg dark:text-white">Sentiment Score</h3>
                            <div className="text-5xl font-bold my-2 text-slate-900 dark:text-white tracking-tighter">
                                {selected?.sentiment === 'Critical' ? '12' : selected?.sentiment === 'Bearish' ? '34' : '88'}
                                <span className="text-lg text-slate-400 font-normal">/100</span>
                            </div>
                            <p className="text-sm text-slate-500 max-w-[200px] mx-auto">
                                {selected?.sentiment === 'Critical' 
                                    ? "Critical Supply Threat. Immediate stockpiling recommended." 
                                    : "Market conditions are stable. Standard procurement advised."}
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    </div>
  );
}