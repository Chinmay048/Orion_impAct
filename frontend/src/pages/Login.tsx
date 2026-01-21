import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ArrowRight, Loader2, LockKeyhole } from "lucide-react";
// 1. Import the new "QuantumLattice" component
import QuantumLattice from "@/components/QuantumLattice";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (email === "demo@orion.com" && password === "password") {
        localStorage.setItem("isAuthenticated", "true");
        navigate("/dashboard");
      } else {
         alert("Access Denied: Invalid credentials."); 
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-black text-white font-sans selection:bg-sky-500/30">
      
      {/* --- LEFT SIDE: THE GROUNDBREAKING 3D VISUAL --- */}
      <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden bg-zinc-900">
         
         {/* THE NEW 3D COMPONENT */}
         <QuantumLattice />

         {/* Optional subtle overlay to ensure text is readable if the glow is too bright */}
         <div className="absolute inset-0 bg-black/20 pointer-events-none z-0"></div>
        
        {/* LOGO (Floats above the 3D scene) */}
        <div className="relative z-10 pointer-events-none">
            <img 
              /* FIXED PATH: Points to public root */
              src="/logo1.png" 
              alt="impAct Logo" 
              // Increased drop shadow to pop against the bright 3D element
              className="h-12 w-auto object-contain drop-shadow-[0_0_30px_rgba(0,0,0,1)]" 
            />
        </div>
        
        {/* QUOTE (Floats above the 3D scene) */}
        <div className="relative z-10 max-w-lg mb-10 pointer-events-none">
          
        </div>
      </div>

      {/* --- RIGHT SIDE: LOGIN FORM (Unchanged) --- */}
      <div className="flex items-center justify-center p-8 relative bg-black">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

        <Link to="/" className="absolute top-8 right-8 flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-medium z-10">
          Back to Home <ArrowRight className="w-4 h-4" />
        </Link>
        
        <Card className="w-full max-w-md bg-zinc-900/30 border-white/10 shadow-2xl backdrop-blur-xl relative z-10">
          <CardHeader className="space-y-1 pb-2">
            <div className="flex justify-center lg:hidden mb-8">
                 <img 
                    src="/Orion_impAct/logo1.png" 
                    alt="impAct Logo" 
                    className="h-10 w-auto object-contain" 
                  />
            </div>
            <CardTitle className="text-2xl font-bold text-center text-white tracking-tight">Command Access</CardTitle>
            <CardDescription className="text-center text-zinc-400">
              Enter your credentials to initialize session.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-4">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="text-zinc-300 text-sm font-medium">Email</label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-black/50 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-white/20 focus-visible:border-white/20 h-11"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label htmlFor="password" classNametext-zinc-300 text-sm font-medium>Password</label>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-black/50 border-white/10 text-white focus-visible:ring-white/20 focus-visible:border-white/20 h-11"
                />
                 <div className="p-3 mt-3 bg-white/5 border border-white/5 rounded text-xs text-zinc-400 flex items-center gap-2">
                    <LockKeyhole className="w-3 h-3 text-zinc-500" /> 
                    <span>Demo: <b>demo@orion.com</b> / <b>password</b></span>
                  </div>
              </div>
              <Button className="w-full h-11 bg-white text-black hover:bg-zinc-200 font-bold text-base shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all" type="submit" disabled={isLoading}>
                {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Authenticating...</> : "Initialize Session"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center border-t border-white/5 pt-6 mt-2">
            <p className="text-sm text-zinc-500">Don't have access? <span className="text-white hover:underline cursor-pointer">Request clearance</span></p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;