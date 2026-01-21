import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, BrainCircuit, Layers, ShieldCheck, Zap } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/20 font-sans">
      
      {/* --- BACKGROUND GRID & SPOTLIGHT EFFECTS --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        {/* Spotlight / Radial Glow */}
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-500 opacity-20 blur-[100px]"></div>
        <div className="absolute left-0 right-0 top-[-10%] -z-10 m-auto h-[400px] w-[800px] bg-indigo-500/10 opacity-40 blur-[80px]"></div>
      </div>

      {/* --- NAVBAR --- */}
      <nav className="fixed w-full z-50 top-0 border-b border-white/5 bg-black/50 backdrop-blur-xl transition-all">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* LOGO */}
          <div className="flex items-center gap-4">
            <img 
              src="/logo1.png" 
              alt="impAct Logo"
              // Sized for professional look (h-12 is ~48px)
              className="h-12 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" 
            />
          </div>

          {/* NAV ACTIONS */}
          <div className="flex items-center gap-6">
            <Link to="/login">
              <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-white/5 font-medium transition-colors">
                Sign In
              </Button>
            </Link>
            <Link to="/login">
              <Button className="bg-white text-black hover:bg-zinc-200 border border-transparent font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all hover:scale-105 rounded-full px-6">
                Get Started 
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative z-10 pt-40 pb-24 lg:pt-52 lg:pb-32 overflow-hidden text-center px-4">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-zinc-400 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          V 2.1.0 // SYSTEM ONLINE
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/50 animate-in fade-in zoom-in-95 duration-1000">
          Discover Supply <br />
          With <span className="text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">Intelligence.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed font-light animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
         impAct unifies logistics, market sensing, and predictive AI into a single, powerful command center.
        </p>

        {/* CTA Buttons */}
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          <Link to="/login">
            <Button size="lg" className="w-full sm:w-auto bg-white text-black hover:bg-zinc-200 font-bold px-8 h-12 rounded-full text-lg shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]">
              Launch Console <Zap className="w-4 h-4 ml-2 fill-black" />
            </Button>
          </Link>
          
          {/* TOP 1% FIX: 
              We use onClick with window.open for external links on Buttons 
              to keep the DOM valid (no <button> inside <a>).
          */}
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => window.open("https://youtu.be/E69dtDwLTmE", "_blank")}
            className="w-full sm:w-auto border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 h-12 rounded-full text-lg backdrop-blur-sm transition-all hover:scale-105"
          >
            Watch Demo
          </Button>
        </div>
      </section>

      {/* --- FEATURE GRID --- */}
      <section className="relative z-10 py-24 bg-gradient-to-b from-transparent to-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-bold mb-4 tracking-tight text-white">Core Capabilities</h2>
            <p className="text-zinc-500">Engineered for resilience, speed, and precision.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard 
              icon={<BrainCircuit className="w-6 h-6 text-white" />}
              title="AI Prediction"
              desc="Forecast demand and identify risks with state-of-the-art machine learning models."
            />
            <FeatureCard 
              icon={<Layers className="w-6 h-6 text-white" />}
              title="Logistics Hub"
              desc="Real-time visibility and inventory optimization across your entire network."
            />
             <FeatureCard 
              icon={<BarChart3 className="w-6 h-6 text-white" />}
              title="Market Sensing"
              desc="Analyze external market signals to stay ahead of trends and competitors."
            />
             <FeatureCard 
              icon={<ShieldCheck className="w-6 h-6 text-white" />}
              title="Execution & Alerts"
              desc="Automated workflows and proactive alerts to resolve issues instantly."
            />
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="relative z-10 py-8 border-t border-white/10 bg-black text-center text-zinc-600 text-sm">
        <p>© 2026 impAct Systems. All rights reserved. | Hackathon Build v2.1.0</p>
      </footer>
    </div>
  );
};

// Modern, Minimalist Card Component
const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
  <Card className="bg-zinc-900/40 border-white/5 shadow-none hover:bg-zinc-900/80 hover:border-white/10 transition-all duration-300 group cursor-default backdrop-blur-md">
    <CardHeader>
      <div className="mb-4 p-3 bg-white/5 rounded-xl w-fit group-hover:bg-white/10 transition-colors border border-white/5">
        {icon}
      </div>
      <CardTitle className="text-lg text-white font-medium group-hover:text-blue-200 transition-colors">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-zinc-400 text-sm leading-relaxed">
        {desc}
      </p>
    </CardContent>
  </Card>
);

export default Landing;