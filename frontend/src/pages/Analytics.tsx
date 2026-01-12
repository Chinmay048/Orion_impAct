import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
// FIX 1: Use relative import instead of '@' to ensure it finds the file
import { Switch } from "../components/ui/switch"; 
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Activity, 
  ShieldAlert, 
  Zap,
  Target,
  Leaf
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

ChartJS.register(
  RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale
);

export default function Analytics() {
  const [data, setData] = useState<any>(null);
  const [simulateStress, setSimulateStress] = useState(false);

  useEffect(() => {
    fetch("http://localhost:3000/api/analytics").then(r => r.json()).then(setData);
  }, []);

  if (!data) return <div className="p-8 text-slate-500">Loading Intelligence...</div>;

  const radarData = {
    labels: data.radar.labels,
    datasets: [
      {
        label: 'Current Operations',
        data: simulateStress ? data.radar.simulated : data.radar.current,
        backgroundColor: simulateStress ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
        borderColor: simulateStress ? '#ef4444' : '#10b981',
        borderWidth: 2,
      },
    ],
  };

  const radarOptions = {
    scales: {
      r: {
        angleLines: { color: '#334155' },
        grid: { color: '#334155' },
        pointLabels: { color: '#94a3b8', font: { size: 10, weight: 'bold' } },
        ticks: { display: false, backdropColor: 'transparent' } 
      }
    },
    plugins: { legend: { display: false } }
  };

  const lineData = {
    labels: data.costTrend.labels,
    datasets: [
      {
        label: 'Actual Spend',
        data: data.costTrend.actual,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4
      },
      {
        label: 'AI Predicted',
        data: data.costTrend.predicted,
        borderColor: '#94a3b8',
        borderDash: [5, 5],
        tension: 0.4
      }
    ]
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in pb-12">
      
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-slate-200 dark:border-white/10 pb-6 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-purple-500" /> 
                System Analytics
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Predictive financial modeling & network health.</p>
        </div>
        
        <div className={`flex items-center gap-3 px-4 py-2 rounded-full border transition-all ${simulateStress ? 'bg-red-900/20 border-red-500/50' : 'bg-slate-900 border-slate-700'}`}>
            <span className={`text-xs font-bold uppercase ${simulateStress ? 'text-red-400' : 'text-slate-400'}`}>
                {simulateStress ? 'Stress Test Active' : 'Normal Operations'}
            </span>
            <Switch 
                checked={simulateStress} 
                onCheckedChange={setSimulateStress} 
                className="data-[state=checked]:bg-red-500"
            />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Total Spend (YTD)" value={data.kpis.spend} icon={<TrendingUp className="w-4 h-4 text-blue-500"/>} trend="+2.4%" />
        <KPICard title="Network Efficiency" value={`${simulateStress ? '64.2%' : data.kpis.efficiency + '%'}`} icon={<Zap className="w-4 h-4 text-amber-500"/>} trend={simulateStress ? "-30%" : "+1.1%"} />
        <KPICard title="Risk Index" value={simulateStress ? '89/100' : data.kpis.riskIndex} icon={<ShieldAlert className="w-4 h-4 text-red-500"/>} trend="Low" />
        <KPICard title="Sustainability" value={data.kpis.sustainability} icon={<Leaf className="w-4 h-4 text-emerald-500"/>} trend="A+" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 bg-slate-950 border-slate-800 shadow-xl h-[400px] flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute top-4 left-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-400 uppercase">Network Shape</span>
                </div>
                <div className="w-full h-full max-h-[300px]">
                    {/* FIX 2: Added 'as any' to bypass strict Type Check */}
                    <Radar data={radarData} options={radarOptions as any} />
                </div>
            </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
            
            <Card className="p-6 bg-white dark:bg-neutral-900 border-slate-200 dark:border-white/10">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-900 dark:text-white">Cost Anomaly Detection</h3>
                    <div className="flex gap-4 text-xs font-bold">
                        <span className="flex items-center gap-1 text-blue-500"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Actual</span>
                        <span className="flex items-center gap-1 text-slate-400"><div className="w-2 h-2 rounded-full bg-slate-400"></div> AI Predicted</span>
                    </div>
                </div>
                <div className="h-[200px] w-full">
                    <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false, scales: { x: { grid: { display: false } }, y: { grid: { color: '#333' } } } }} />
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.anomalies.map((a: any) => (
                    <Card key={a.id} className="p-4 bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/20 flex gap-3 items-start">
                        <div className="mt-1 p-1 bg-red-100 dark:bg-red-500/20 rounded text-red-600 dark:text-red-400">
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

function KPICard({ title, value, icon, trend }: any) {
    return (
        <Card className="p-4 bg-white dark:bg-neutral-900 border-slate-200 dark:border-white/10">
            <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase">{title}</span>
                {icon}
            </div>
            <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{value}</span>
                <span className="text-xs font-mono text-emerald-500">{trend}</span>
            </div>
        </Card>
    );
}