import { Orbit } from "lucide-react";

interface LogoProps {
  className?: string;
  iconSize?: number;
}

export const OrionLogo = ({ className = "", iconSize = 24 }: LogoProps) => {
  return (
    <div className={`flex items-center gap-2 font-bold text-2xl tracking-tight ${className}`}>
      <div className="p-1.5 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg shadow-lg shadow-blue-500/20">
        <Orbit size={iconSize} className="text-white" />
      </div>
      <span className="text-white">
        Orion
        <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent ml-1">
          impAct
        </span>
      </span>
    </div>
  );
};