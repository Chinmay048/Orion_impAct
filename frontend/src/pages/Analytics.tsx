import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch"; 
import { 
  BarChart3,
  TrendingUp, 
  Activity, 
  ShieldAlert, 
  Zap,
  Target,
  Leaf,
  Loader2
} from "lucide-react";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale
} from "chart.js";
import { Radar, Line } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale
);

// --- INITIAL BASELINE DATA ---
const BASE_DATA = {
    kpis: { spend: 1.2, efficiency: 94.2, riskIndex: 12, sustainability: 88 },
    radar: {
        labels: ['Resilience', 'Cost Efficiency', 'Speed', 'Sustainability', 'Reliability'],
        current: [85, 70, 90, 65, 88], 
        simulated: [60, 40, 50, 40, 50] 
    },
    costTrend: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        actual: [45, 47, 46, 48, 52, 51],
        predicted: [45.5, 46.5, 47, 47.5, 48, 48.5]
    },
    anomalies: [
        { id: 1, type: "Cost Spike", msg: "Logistics fuel surcharge +15% vs Forecast", severity: "High" },
        { id: 2, type: "Inventory Leak", msg: "Stock discrepancy in Pune Factory", severity: "Medium" }
    ]
};

export default function Analytics() {
  const [data, setData] = useState<any>(BASE_DATA);
  const [simulateStress, setSimulateStress] = useState(false);
  const [isLive] = useState(true);

  // --- LIVE SIMULATION ENGINE ---
  useEffect(() => {
    if (!isLive || simulateStress) return; // Don't randomize if Stress Test is active (keep that static/red)

    const interval = setInterval(() => {
        setData((prev: any) => {
            // 1. Randomize KPIs slightly
            const newEfficiency = Math.min(99, Math.max(85, prev.kpis.efficiency + (Math.random() - 0.5)));
            const newRisk = Math.max(5, Math.min(25, prev.kpis.riskIndex + Math.floor((Math.random() - 0.5) * 3)));
            
            // 2. Jitter the Radar Chart values (make the shape "breathe")
            const newRadarCurrent = prev.radar.current.map((val: number) => {
                const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
                return Math.min(100, Math.max(40, val + change));
            });

            // 3. Jitter the Line Chart (Cost Trend)
            const newActual = prev.costTrend.actual.map((val: number, i: number) => {
                // Only jitter the last 2 months to simulate recent volatility
                if (i < 4) return val; 
                return val + (Math.random() * 0.5 - 0.25);
            });

            return {
                ...prev,
                kpis: {
                    ...prev.kpis,
                    efficiency: Number(newEfficiency.toFixed(1)),
                    riskIndex: newRisk
                },
                radar: {
                    ...prev.radar,
                    current: newRadarCurrent
                },
                costTrend: {
                    ...prev.costTrend,
                    actual: newActual
                }
            };
        });
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [isLive, simulateStress]);

  // --- Chart Config (Updated for Light Theme Visibility) ---
  const radarData = {
    labels: data.radar.labels,
    datasets: [
      {
        label: 'Current Operations',
        data: simulateStress ? data.radar.simulated : data.radar.current,
        // Dynamic colors based on mode
        backgroundColor: simulateStress ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
        borderColor: simulateStress ? '#ef4444' : '#10b981',
        borderWidth: 2,
        pointBackgroundColor: simulateStress ? '#ef4444' : '#10b981',
      },
    ],
  };

  const radarOptions: any = {
    scales: {
      r: {
        angleLines: { color: 'rgba(148, 163, 184, 0.2)' }, // Lighter grid lines
        grid: { color: 'rgba(148, 163, 184, 0.2)' },
        pointLabels: { color: '#64748b', font: { size: 10, weight: 'bold' } }, // Slate-500 for visibility
        ticks: { display: false, backdropColor: 'transparent' } 
      }
    },
    plugins: { legend: { display: false } },
    maintainAspectRatio: false
  };

  const lineData = {
    labels: data.costTrend.labels,
    datasets: [
      {
        label: 'Actual Spend',
        data: data.costTrend.actual,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: 'AI Predicted',
        data: data.costTrend.predicted,
        borderColor: '#94a3b8',
        borderDash: [5, 5],
        tension: 0.4,
        pointRadius: 0
      }
    ]
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1000 },
    scales: { 
        x: { 
            grid: { display: false },
            ticks: { color: '#64748b' } 
        }, 
        y: { 
            grid: { color: 'rgba(148, 163, 184, 0.1)' }, // Very subtle horizontal lines
            ticks: { color: '#64748b' }
        } 
    },
    plugins: {
        legend: {
            labels: { color: '#64748b', usePointStyle: true, boxWidth: 6 }
        }
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in pb-12">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-slate-200 dark:border-white/10 pb-6 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-purple-500" /> 
                System Analytics
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Predictive financial modeling & network health.</p>
        </div>
        
        <div className="flex items-center gap-4">
            {/* Live Indicator */}
            {!simulateStress && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-900/50">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span className="text-xs font-bold uppercase">Live Model</span>
                </div>
            )}

            <div className={`flex items-center gap-3 px-4 py-2 rounded-full border transition-all ${simulateStress ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-500/50' : 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-700 shadow-sm'}`}>
                <span className={`text-xs font-bold uppercase ${simulateStress ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`}>
                    {simulateStress ? 'Stress Test Active' : 'Normal Operations'}
                </span>
                <Switch 
                    checked={simulateStress} 
                    onCheckedChange={setSimulateStress} 
                    className="data-[state=checked]:bg-red-500"
                />
            </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard 
            title="Total Spend (YTD)" 
            value={`₹${data.kpis.spend}Cr`} 
            icon={<TrendingUp className="w-4 h-4 text-blue-500"/>} 
            trend="+2.4%" 
        />
        <KPICard 
            title="Network Efficiency" 
            value={`${simulateStress ? '64.2%' : data.kpis.efficiency + '%'}`} 
            icon={<Zap className={`w-4 h-4 ${simulateStress ? 'text-red-500' : 'text-amber-500'}`}/>} 
            trend={simulateStress ? "-30%" : "+1.1%"} 
            trendColor={simulateStress ? "text-red-500" : "text-emerald-500"}
        />
        <KPICard 
            title="Risk Index" 
            value={simulateStress ? '89/100' : data.kpis.riskIndex} 
            icon={<ShieldAlert className={`w-4 h-4 ${simulateStress ? 'text-red-500' : 'text-emerald-500'}`}/>} 
            trend={simulateStress ? "CRITICAL" : "Low"} 
            trendColor={simulateStress ? "text-red-500" : "text-emerald-500"}
        />
        <KPICard 
            title="Sustainability" 
            value={data.kpis.sustainability} 
            icon={<Leaf className="w-4 h-4 text-emerald-500"/>} 
            trend="A+" 
            trendColor="text-emerald-500"
        />
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Radar Chart */}
        <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-sm h-[400px] flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute top-4 left-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Network Shape</span>
                </div>
                <div className="w-full h-full max-h-[300px] mt-6">
                    <Radar data={radarData} options={radarOptions} />
                </div>
            </Card>
        </div>

        {/* Line Chart & Anomalies */}
        <div className="lg:col-span-2 space-y-6">
            
            <Card className="p-6 bg-white dark:bg-neutral-900 border-slate-200 dark:border-white/10 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-900 dark:text-white">Cost Anomaly Detection</h3>
                </div>
                <div className="h-[200px] w-full">
                    <Line data={lineData} options={lineOptions} />
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.anomalies.map((a: any) => (
                    <Card key={a.id} className="p-4 bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/20 shadow-sm flex gap-3 items-start transition-transform hover:scale-[1.02]">
                        <div className="mt-1 p-1 bg-white dark:bg-red-500/20 rounded text-red-600 dark:text-red-400 shadow-sm border border-red-100 dark:border-transparent">
                            <Target className="w-4 h-4" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-red-700 dark:text-red-400">{a.type} Detected</h4>
                            <p className="text-xs text-red-600/80 dark:text-red-400/70 mt-1">{a.msg}</p>
                        </div>
                    </Card>
                ))}
            </div>

        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, icon, trend, trendColor = "text-emerald-500" }: any) {
    return (
        <Card className="p-4 bg-white dark:bg-neutral-900 border-slate-200 dark:border-white/10 shadow-sm transition-all hover:shadow-md">
            <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{title}</span>
                {icon}
            </div>
            <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{value}</span>
                <span className={`text-xs font-mono font-bold ${trendColor}`}>{trend}</span>
            </div>
        </Card>
    );
}