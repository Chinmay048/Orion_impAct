import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
      <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-full mb-6 animate-pulse">
        <AlertTriangle className="w-12 h-12 text-red-500" />
      </div>
      
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
        404: Signal Lost
      </h1>
      
      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
        The requested neural pathway could not be found. This node may have been disconnected or does not exist in the current sector.
      </p>

      <Link to="/">
        <Button variant="default" className="bg-slate-900 dark:bg-white dark:text-black gap-2">
          <ArrowLeft className="w-4 h-4" /> Return to Command
        </Button>
      </Link>
    </div>
  );
}