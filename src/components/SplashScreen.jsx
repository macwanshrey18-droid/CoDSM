import React, { useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';

export default function SplashScreen({ onFinish }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 1500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-center p-6 text-white text-center">
      <div className="w-20 h-20 rounded-3xl bg-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-500/50 mb-6 animate-pulse-glow border border-indigo-400/30">
        <ShieldCheck className="w-12 h-12 text-emerald-400" />
      </div>

      <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-white">CoDSM</h1>
      <p className="text-xs text-indigo-300 font-semibold uppercase tracking-widest mb-8">
        Cooperative Services Marketplace
      </p>

      <div className="flex items-center space-x-2 bg-indigo-900/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-indigo-500/30">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        <span className="text-[11px] font-bold text-emerald-300">SIH 2026 • Team VORTEX</span>
      </div>
    </div>
  );
}
