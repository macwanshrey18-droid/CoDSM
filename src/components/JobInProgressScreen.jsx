import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle, ShieldCheck } from 'lucide-react';

export default function JobInProgressScreen({ booking, onMarkComplete }) {
  const [seconds, setSeconds] = useState(120); // 02:00 elapsed counter

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full h-full bg-slate-50 flex flex-col justify-between overflow-y-auto p-4 animate-fade-in">
      <div>
        <div className="bg-amber-100 border border-amber-300 text-amber-900 px-3 py-1.5 rounded-full text-xs font-bold text-center mb-4 flex items-center justify-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping"></span>
          <span>Job Status: IN PROGRESS</span>
        </div>

        {/* Elapsed Timer Counter */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md text-center mb-5">
          <div className="w-14 h-14 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2">
            <Clock className="w-7 h-7" />
          </div>
          <span className="text-3xl font-extrabold text-slate-900 tracking-wider block font-mono">
            {formatTime(seconds)}
          </span>
          <span className="text-xs text-slate-500 font-medium">Elapsed Service Time</span>
        </div>

        {/* Job Details */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2 text-xs">
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500 font-bold">Category</span>
            <span className="font-extrabold text-indigo-900">Plumbing Repair</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500 font-bold">Customer</span>
            <span className="font-bold text-slate-800">Priya S.</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500 font-bold">Cooperative Welfare Fee</span>
            <span className="font-bold text-rose-600">-₹20.00</span>
          </div>
          <div className="flex justify-between pt-1">
            <span className="text-slate-900 font-bold">Total Payout</span>
            <span className="font-extrabold text-emerald-600">₹780.00</span>
          </div>
        </div>
      </div>

      <div className="pb-2">
        <button
          onClick={onMarkComplete}
          className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold py-4 px-4 rounded-xl text-xs shadow-lg shadow-emerald-600/25 flex items-center justify-center space-x-2 transition-all"
        >
          <CheckCircle className="w-5 h-5 stroke-[2.5]" />
          <span>Mark Job Complete</span>
        </button>
      </div>
    </div>
  );
}
