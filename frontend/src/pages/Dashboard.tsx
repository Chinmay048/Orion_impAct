import { useState, useEffect } from "react";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Factory, 
  TrendingUp, 
  Clock, 
  Loader2,
  ShieldCheck,
  RefreshCw
} from "lucide-react";
import { Card } from "@/components/ui/card";
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
  Filler
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);

  const fetchData = async () => {
    try {
      setError(false);
      const res = await fetch("/api/company-stats");
      if (!res.ok) throw new Error("Server Error");
      const json = await res.json();
      setData(json);
    } catch (e) { 
      console.error(e);
      setError(true);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Live price updates
    return () => clearInterval(interval);
  }, []);

  // ERROR STATE (Instead of Infinite Spinner)
  if (error) {
    return (
        <div className="flex h-screen flex-col items-center justify-center gap-4">
            <div className="p-4 bg-red-50 text-red-600 rounded-full"><ShieldCheck className="w-12 h-12" /></div>
            <h2 className="text-xl font-bold dark:text-white">Connection Lost</h2>
            <p className="text-slate-500">Ensure backend is running: <code className="bg-slate-100 px-2 py-1 rounded">node api/index.js</code></p>
            <Button onClick={fetchData} variant="outline" className="gap-2"><RefreshCw className="w-4 h-4" /> Retry Connection</Button>
        </div>
    );
  }

  // LOADING STATE
  if (!data) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin w-10 h-10 text-emerald-500" /></div>;

  // CHART CONFIG
  const chartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: 'Daily Production (Tons)',
        data: data.profile.productionHistory,
        borderColor: '#3b82f6', // Blue-500
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* 1. HEADER & COMPANY ID */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
        <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <Factory className="w-8 h-8 text-blue-500" />
                {data.profile.name}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                System Operational • {data.profile.sector}
            </p>
        </div>
        
        {/* Neural Risk Score */}
        <div className="flex items-center gap-4 bg-slate-900 text-white p-3 rounded-xl border border-slate-800 shadow-lg">
            <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-slate-400">Supply Chain Risk</p>
                <p className="text-2xl font-bold text-emerald-400">{data.riskScore}/100</p>
            </div>
            <ShieldCheck className="w-8 h-8 text-emerald-500" />
        </div>
      </div>

      {/* 2. LIVE RAW MATERIAL TICKER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.materials.map((m: any) => (
            <Card key={m.name} className="p-5 bg-white dark:bg-neutral-900 border-slate-200 dark:border-white/10 flex justify-between items-center group hover:border-blue-500 transition-colors">
                <div>
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">{m.name}</p>
                    <p className="text-2xl font-bold dark:text-white">₹{m.price}</p>
                </div>
                <div className={`text-right ${m.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                    <div className="flex items-center justify-end gap-1 font-bold text-lg">
                        {m.trend === 'up' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                        {m.change}%
                    </div>
                    <p className="text-[10px] text-slate-400">Live Market</p>
                </div>
            </Card>
        ))}
      </div>

      {/* 3. MAIN DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[450px]">
        
        {/* LEFT: PRODUCTION GRAPH */}
        <Card className="lg:col-span-2 p-6 bg-white dark:bg-neutral-900 border-slate-200 dark:border-white/10 flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold dark:text-white">Production Output</h3>
                    <p className="text-sm text-slate-500">Last 7 Days (Metric Tons)</p>
                </div>
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600">
                    <TrendingUp className="w-5 h-5" />
                </div>
            </div>
            <div className="flex-1 min-h-0">
                <Line data={chartData} options={chartOptions} />
            </div>
        </Card>

        {/* RIGHT: INVENTORY RUNWAY */}
        <Card className="lg:col-span-1 p-6 bg-white dark:bg-neutral-900 border-slate-200 dark:border-white/10 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5"><Clock className="w-32 h-32" /></div>

            <div>
                <h3 className="text-lg font-bold dark:text-white mb-1">Inventory Runway</h3>
                <p className="text-sm text-slate-500">Time until critical stock depletion</p>
            </div>

            <div className="text-center py-8">
                <span className="text-6xl font-mono font-bold dark:text-white block tracking-tighter">
                    {data.runway.days}
                </span>
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Days Remaining</span>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between text-xs font-bold text-slate-500">
                    <span>0 Days</span>
                    <span>Safe Level ({data.profile.minStockLevel}T)</span>
                </div>
                {/* Visual Bar */}
                <div className="w-full bg-slate-100 dark:bg-white/10 h-3 rounded-full overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-1000 ${
                            data.runway.status === 'CRITICAL' ? 'bg-red-500' : 'bg-emerald-500'
                        }`} 
                        style={{ width: `${Math.min(100, (data.profile.currentStock / (data.profile.minStockLevel * 2)) * 100)}%` }} 
                    />
                </div>
                <div className="flex items-center gap-2 mt-2">
                    <div className={`w-2 h-2 rounded-full ${data.runway.status === 'CRITICAL' ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                    <span className={`text-sm font-medium ${data.runway.status === 'CRITICAL' ? 'text-red-500' : 'text-emerald-500'}`}>
                        Status: {data.runway.status}
                    </span>
                </div>
            </div>
        </Card>
      </div>

    </div>
  );
}