import React from "react";
import { Atom, Zap } from "lucide-react";

interface HeaderProps {
  isConnected: boolean;
}

export function Header({ isConnected }: HeaderProps) {
  return (
    <header className="flex items-center justify-between p-6 border-b border-white/5">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-500/10 rounded-lg">
          <Atom className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Pablo</h1>
          <p className="text-xs text-white/40 font-mono uppercase tracking-widest">Physics Specialist</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
        <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-white/20"}`} />
        <span className="text-xs font-medium text-white/60">{isConnected ? "Online" : "Offline"}</span>
      </div>
    </header>
  );
}
