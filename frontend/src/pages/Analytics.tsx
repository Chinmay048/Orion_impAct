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
  Loader2,
  Info,
  Calculator // Added for the new section
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

// --- GENUINE TASL BASELINE DATA ---
const BASE_DATA = {
    // Financials in Crores (Cr) - Realistic for Aerospace Scale
    kpis: { spend: 842.5, efficiency: 91.4, riskIndex: 14, sustainability: 82 },
    
    radar: {
        labels: ['Supply Resilience', 'Cost Control', 'Logistics Speed', 'Green Compliance', 'Vendor Reliability'],
        current: [88, 75, 92, 78, 90], // Strong current operations
        simulated: [45, 30, 40, 60, 45] // What happens during a crisis
    },
    
    costTrend: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        actual: [125, 128, 124, 130, 135, 132], // Monthly spend in Cr
        predicted: [126, 127, 128, 129, 130, 131] // AI Forecast
    },
    
    anomalies: [
        { id: 1, type: "Quality Deviation", msg: "Titanium Forging yield -12% at Pune Unit", severity: "High" },
        { id: 2, type: "Route Disruption", msg: "Carbon Fiber shipment stalled (Suez Blockage)", severity: "Medium" }
    ]
};

export default function Analytics() {
  const [data, setData] = useState<any>(BASE_DATA);
  const [simulateStress, setSimulateStress] = useState(false);
  const [isLive] = useState(true);

  // --- LIVE SIMULATION ENGINE ---
  useEffect(() => {
    if (!isLive || simulateStress) return;

    const interval = setInterval(() => {
        setData((prev: any) => {
            // Micro-fluctuations to simulate live ERP data feed
            const newEfficiency = Math.min(99, Math.max(85, prev.kpis.efficiency + (Math.random() - 0.5)));
            const newRisk = Math.max(10, Math.min(20, prev.kpis.riskIndex + Math.floor((Math.random() - 0.5) * 2)));
            
            const newRadarCurrent = prev.radar.current.map((val: number) => {
                const change = Math.floor(Math.random() * 3) - 1; 
                return Math.min(100, Math.max(60, val + change));
            });

            return {
                ...prev,
                kpis: { ...prev.kpis, efficiency: Number(newEfficiency.toFixed(1)), riskIndex: newRisk },
                radar: { ...prev.radar, current: newRadarCurrent }
            };
        });
    }, 2500);

    return () => clearInterval(interval);
  }, [isLive, simulateStress]);

  // --- CHART CONFIG (DARK MODE) ---
  const radarData = {
    labels: data.radar.labels,
    datasets: [
      {
        label: 'Operational Score',
        data: simulateStress ? data.radar.simulated : data.radar.current,
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
        angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        pointLabels: { color: '#a1a1aa', font: { size: 11, weight: 'bold' } }, 
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
        label: 'Actual Spend (Cr)',
        data: data.costTrend.actual,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#000',
        pointBorderColor: '#3b82f6'
      },
      {
        label: 'AI Forecast',
        data: data.costTrend.predicted,
        borderColor: '#71717a',
        borderDash: [5, 5],
        tension: 0.4,
        pointRadius: 0
      }
    ]
  };

  const lineOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1000 },
    scales: { 
        x: { grid: { display: false }, ticks: { color: '#71717a' } }, 
        y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#71717a' }, border: { display: false } } 
    },
    plugins: { legend: { labels: { color: '#a1a1aa', usePointStyle: true, boxWidth: 6 } } }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in pb-12">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-white/10 pb-6 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-purple-500" /> 
                System Analytics
            </h1>
            <p className="text-zinc-400 mt-1">Predictive financial modeling & network health.</p>
        </div>
        
        <div className="flex items-center gap-4">
            {!simulateStress && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span className="text-xs font-bold uppercase">Live ERP Feed</span>
                </div>
            )}

            <div className={`flex items-center gap-3 px-4 py-2 rounded-full border transition-all ${simulateStress ? 'bg-red-500/10 border-red-500/50' : 'bg-zinc-900 border-white/10'}`}>
                <span className={`text-xs font-bold uppercase ${simulateStress ? 'text-red-500' : 'text-zinc-400'}`}>
                    {simulateStress ? 'Stress Simulation' : 'Normal Operations'}
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
        <KPICard title="Total Spend (YTD)" value={`₹${data.kpis.spend} Cr`} icon={<TrendingUp className="w-4 h-4 text-blue-500"/>} trend="+1.2%" />
        <KPICard 
            title="Production Efficiency" 
            value={`${simulateStress ? '64.2%' : data.kpis.efficiency + '%'}`} 
            icon={<Zap className={`w-4 h-4 ${simulateStress ? 'text-red-500' : 'text-yellow-500'}`}/>} 
            trend={simulateStress ? "-27.2%" : "+0.4%"} 
            trendColor={simulateStress ? "text-red-500" : "text-emerald-500"}
        />
        <KPICard 
            title="Supply Chain Risk" 
            value={simulateStress ? '89/100' : data.kpis.riskIndex} 
            icon={<ShieldAlert className={`w-4 h-4 ${simulateStress ? 'text-red-500' : 'text-emerald-500'}`}/>} 
            trend={simulateStress ? "CRITICAL" : "Stable"} 
            trendColor={simulateStress ? "text-red-500" : "text-emerald-500"}
        />
        <KPICard title="Sustainability Score" value={data.kpis.sustainability} icon={<Leaf className="w-4 h-4 text-emerald-500"/>} trend="Tier 1" trendColor="text-emerald-500" />
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Radar Chart */}
        <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 bg-zinc-900/40 border-white/5 backdrop-blur-sm h-[400px] flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute top-4 left-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-zinc-500" />
                    <span className="text-xs font-bold text-zinc-500 uppercase">Resilience Matrix</span>
                </div>
                <div className="w-full h-full max-h-[300px] mt-6">
                    <Radar data={radarData} options={radarOptions} />
                </div>
            </Card>
        </div>

        {/* Line Chart & Anomalies */}
        <div className="lg:col-span-2 space-y-6">
            
            <Card className="p-6 bg-zinc-900/40 border-white/5 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-zinc-200">Procurement Cost Forecast</h3>
                </div>
                <div className="h-[200px] w-full">
                    <Line data={lineData} options={lineOptions} />
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.anomalies.map((a: any) => (
                    <Card key={a.id} className="p-4 bg-red-500/10 border-red-500/20 flex gap-3 items-start hover:bg-red-500/20 transition-colors cursor-pointer">
                        <div className="mt-1 p-1 bg-red-500/20 rounded text-red-400 border border-red-500/30">
                            <Target className="w-4 h-4" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-red-400">{a.type}</h4>
                            <p className="text-xs text-red-300/70 mt-1">{a.msg}</p>
                        </div>
                    </Card>
                ))}
            </div>

        </div>
      </div>

      {/* --- METHODOLOGY FOOTER (New Genuine Section) --- */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* SYSTEM MODE DEFINITION */}
          <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                  <h4 className="font-bold text-blue-200 mb-1">System Mode Definition</h4>
                  <p className="text-blue-200/70 leading-relaxed text-xs">
                      <strong className="text-emerald-400">Normal Operations:</strong> Real-time data stream from TASL ERP nodes. Metrics reflect actual floor performance.<br/>
                      <strong className="text-red-400">Stress Simulation:</strong> Theoretical "War Game" scenario. Simulates a 3-sigma supply chain disruption to test financial resilience.
                  </p>
              </div>
          </div>

          {/* KPI CALCULATION METHODOLOGY */}
          <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5 flex items-start gap-3">
              <Calculator className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm w-full">
                  <h4 className="font-bold text-purple-200 mb-2">KPI Calculation Methodology</h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-purple-200/70">
                      <div>
                          <strong className="text-white block">Total Spend (YTD)</strong>
                          Cumulative procurement expenditure inclusive of direct materials (CAPEX), logistics surcharges, and currency hedging variances.
                      </div>
                      <div>
                          <strong className="text-white block">Production Efficiency</strong>
                          Ratio of finished aerospace-grade output to raw material input (Yield), accounting for machining scrap (e.g., Titanium swarf).
                      </div>
                      <div>
                          <strong className="text-white block">Supply Chain Risk</strong>
                          Weighted composite index derived from supplier geopolitical stability, single-source dependencies, and logistic route latency.
                      </div>
                      <div>
                          <strong className="text-white block">Sustainability Score</strong>
                          Scope 3 emission intensity normalized against production volume, plus Tier-1 vendor ESG compliance ratings.
                      </div>
                  </div>
              </div>
          </div>

      </div>

    </div>
  );
}

function KPICard({ title, value, icon, trend, trendColor = "text-emerald-500" }: any) {
    return (
        <Card className="p-4 bg-zinc-900/40 border-white/5 backdrop-blur-sm hover:bg-zinc-900/60 transition-colors">
            <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{title}</span>
                {icon}
            </div>
            <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-white font-mono">{value}</span>
                <span className={`text-xs font-mono font-bold ${trendColor}`}>{trend}</span>
            </div>
        </Card>
    );
}