import React, { useEffect, useState } from 'react';
import { ShieldCheck, User, Clock, MapPin } from 'lucide-react';

export default function MatchingLoader({ onMatchFound, onNoMatch }) {
  const [stepIndex, setStepIndex] = useState(0);
  const steps = [
    { title: 'Matching by skills', icon: User },
    { title: 'Checking availability', icon: Clock },
    { title: 'Finding nearest worker', icon: MapPin },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        clearInterval(interval);
        setTimeout(() => {
          onMatchFound();
        }, 1000);
        return prev;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [onMatchFound]);

  return (
    <div className="w-full h-full bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      {/* Radar Pulsing Circle */}
      <div className="relative mb-8 flex items-center justify-center">
        <div className="w-36 h-36 rounded-full bg-indigo-600/20 border border-indigo-500/40 animate-ping absolute"></div>
        <div className="w-28 h-28 rounded-full bg-indigo-600/30 border border-indigo-400/50 animate-pulse-glow absolute"></div>
        <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-500/50 z-10">
          <ShieldCheck className="w-10 h-10 text-emerald-400" />
        </div>
      </div>

      <h2 className="text-xl font-bold mb-2 tracking-tight">Finding Best Verified Worker...</h2>
      <p className="text-xs text-indigo-300 font-medium mb-8">
        Scanning cooperative database & 10km radius
      </p>

      {/* Pulsing Status Text Bar */}
      <div className="bg-slate-800/90 border border-slate-700/80 px-5 py-3 rounded-2xl flex items-center space-x-3 shadow-lg">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
        <span className="text-xs font-bold text-emerald-300 tracking-wide">
          {steps[stepIndex].title}
        </span>
      </div>
    </div>
  );
}
