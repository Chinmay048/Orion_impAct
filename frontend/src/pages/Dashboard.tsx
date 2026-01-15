import { useState, useEffect } from "react";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Factory, 
  TrendingUp, 
  Clock, 
  Loader2,
  ShieldCheck,
  RefreshCw,
  Zap,
  Box,
  MapPin,
  Layers,
  Database
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ScriptableContext
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);

  const fetchData = async () => {
    try {
      setError(false);
      const res = await fetch("https://orion-backend-op6i.onrender.com/api/company-stats");
      if (!res.ok) throw new Error("Server Error");
      const json = await res.json();
      console.log("DASHBOARD DATA:", json); 
      setData(json);
    } catch (e) { 
      console.error(e);
      setError(true);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); 
    return () => clearInterval(interval);
  }, []);

  // --- CHART CONFIGURATION ---
  // Fixes TS Error: We only create the object if data exists
  const chartData = data ? {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [{
        label: 'Output',
        data: data.profile.productionHistory,
        borderColor: '#3b82f6', 
        borderWidth: 3,
        backgroundColor: (context: ScriptableContext<"line">) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, "rgba(59, 130, 246, 0.5)");
            gradient.addColorStop(1, "rgba(59, 130, 246, 0)");
            return gradient;
        },
        tension: 0.4, 
        fill: true, 
        pointBackgroundColor: '#000', 
        pointBorderColor: '#3b82f6',
    }],
  } : { labels: [], datasets: [] }; // Empty fallback to satisfy TS

  const chartOptions = {
    responsive: true, 
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#18181b', bodyColor: '#cbd5e1' } },
    scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(255,255,255,0.05)' }, border: { display: false } } }
  };

  // --- BULLETPROOF DATA PARSING ---
  // This logic handles BOTH the old object format AND the new array format
  const getRunwayItems = () => {
    if (!data || !data.runway) return [];
    if (Array.isArray(data.runway)) return data.runway;
    // Fallback for old backend data:
    return [{ location: "Global Aggregate", daysRemaining: data.runway.days, status: data.runway.status }];
  };

  const runwayItems = getRunwayItems();

  const getEfficiencyItems = () => {
    if (!data || !data.productionOutput || !Array.isArray(data.productionOutput)) return [];
    return data.productionOutput;
  };

  const efficiencyItems = getEfficiencyItems();


  if (error) return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-6">
        <div className="p-6 bg-red-500/10 text-red-500 rounded-full border border-red-500/20">
            <ShieldCheck className="w-16 h-16" />
        </div>
        <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Signal Lost</h2>
            <p className="text-zinc-500 mb-6">Backend offline. Please restart server.</p>
            <Button onClick={fetchData} variant="outline" className="border-white/10 hover:bg-white/10 text-white gap-2">
                <RefreshCw className="w-4 h-4" /> Retry Connection
            </Button>
        </div>
    </div>
  );

  if (!data) return (
    <div className="flex h-[80vh] items-center justify-center flex-col gap-4">
        <Loader2 className="animate-spin w-12 h-12 text-blue-500" />
        <p className="text-zinc-500 font-mono text-sm tracking-widest animate-pulse">ESTABLISHING UPLINK...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
        <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Factory className="w-8 h-8 text-blue-500" />
                {data.profile.name}
            </h1>
            <p className="text-zinc-400 mt-1 flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></span>
                System Operational • <span className="text-zinc-500">{data.profile.sector}</span>
            </p>
        </div>
      </div>

      {/* SUB-HEADER */}
      <div className="flex items-center gap-2 text-zinc-400 text-sm font-mono uppercase tracking-wider">
         <Layers className="w-4 h-4 text-blue-500" /> Live Material Procurement
      </div>

      {/* TICKER CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.materials?.map((m: any) => (
            <Card key={m.name} className="bg-zinc-900/40 border-white/5 backdrop-blur-sm">
                <CardContent className="p-6 flex justify-between items-center">
                    <div>
                        <p className="text-xs font-bold text-zinc-500 uppercase mb-1">{m.name}</p>
                        <p className="text-2xl font-bold text-white font-mono">₹{m.price}</p>
                    </div>
                    <div className={`text-right ${m.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                        <div className="flex items-center justify-end gap-1 font-bold text-lg">
                            {m.trend === 'up' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                            {m.change}%
                        </div>
                    </div>
                </CardContent>
            </Card>
        ))}
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GRAPH */}
        <Card className="lg:col-span-2 bg-zinc-900/40 border-white/5 backdrop-blur-sm flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-lg font-medium text-zinc-200">Global Output Trend</CardTitle>
                </div>
                <TrendingUp className="w-5 h-5 text-blue-400" />
            </CardHeader>
            <CardContent className="flex-1 min-h-[350px] pt-4">
                 {/* Safe rendering for Chart */}
                {data && <Line data={chartData} options={chartOptions as any} />}
            </CardContent>
        </Card>

        {/* INVENTORY RUNWAY */}
        <Card className="lg:col-span-1 bg-zinc-900/40 border-white/5 backdrop-blur-sm flex flex-col h-[450px]">
            <CardHeader>
                <CardTitle className="text-lg font-medium text-zinc-200 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-zinc-500" /> Inventory Runway
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                {runwayItems.length > 0 ? runwayItems.map((site: any) => (
                    <div key={site.location} className="group p-2 rounded hover:bg-white/5 transition-colors">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                                <MapPin className="w-3 h-3 text-zinc-600" /> {site.location}
                            </span>
                            <span className={`text-sm font-mono font-bold ${site.status === "CRITICAL" ? "text-red-400" : site.status === "WARNING" ? "text-yellow-400" : "text-emerald-400"}`}>
                                {site.daysRemaining} Days
                            </span>
                        </div>
                        <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                            <div className={`h-full ${site.status === "CRITICAL" ? "bg-red-500" : site.status === "WARNING" ? "bg-yellow-500" : "bg-emerald-500"}`} style={{ width: `${Math.min(100, (Number(site.daysRemaining) / 30) * 100)}%` }} />
                        </div>
                    </div>
                )) : (
                    <div className="text-zinc-500 text-sm italic p-4">Initializing Logistics Data...</div>
                )}
            </CardContent>
        </Card>
      </div>

      {/* NEW HEADER: RAW MATERIAL USED */}
      <div className="flex items-center gap-2 text-zinc-400 text-sm font-mono uppercase tracking-wider mt-4">
         <Database className="w-4 h-4 text-emerald-500" /> Raw Material Usage & Efficiency
      </div>

      {/* MATERIAL EFFICIENCY MATRIX */}
      <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
                <div>
                <CardTitle className="text-lg font-medium text-zinc-200">Material Efficiency Matrix</CardTitle>
                <p className="text-sm text-zinc-500">Real-time Consumption Analysis</p>
                </div>
                <Zap className="w-5 h-5 text-yellow-500" />
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {efficiencyItems.length > 0 ? efficiencyItems.map((item: any) => (
                    <div key={item.material} className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-zinc-900"><Box className="w-4 h-4 text-blue-400" /></div>
                            <div>
                                <p className="text-sm font-bold text-white">{item.material}</p>
                                <p className="text-xs text-zinc-500">Yield: {item.efficiency}</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs"><span className="text-zinc-500">Used</span><span className="text-zinc-300">{item.usage} kg</span></div>
                            <div className="flex justify-between text-xs"><span className="text-zinc-500">Output</span><span className="text-emerald-400 font-bold">{item.outputGenerated} kg</span></div>
                            <div className="h-1 w-full bg-zinc-800 rounded-full mt-2"><div className="h-full bg-emerald-500" style={{ width: item.efficiency }}></div></div>
                        </div>
                    </div>
                )) : (
                    <div className="text-zinc-500 text-sm italic p-4">Awaiting Production Data... (Restart Backend for Live Matrix)</div>
                )}
            </div>
        </CardContent>
      </Card>

    </div>
  );
}