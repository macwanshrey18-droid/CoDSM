import React from 'react';
import { AlertCircle, RefreshCw, XCircle } from 'lucide-react';

export default function NoMatchScreen({ onRetry, onCancel }) {
  return (
    <div className="w-full h-full bg-slate-50 flex flex-col justify-between p-6 text-center animate-fade-in">
      <div className="pt-12">
        <div className="mx-auto w-20 h-20 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-6 shadow-md border border-rose-100">
          <AlertCircle className="w-10 h-10" />
        </div>

        <h2 className="text-xl font-bold text-slate-900 mb-2">No Worker Available</h2>
        <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto mb-8">
          We scanned up to 25km radius but all verified plumbers are currently occupied.
        </p>

        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 text-amber-950 text-left text-xs mb-6">
          <span className="font-bold block mb-1">💡 Pro-Tip</span>
          You can retry matching in a few moments, or cancel and schedule for a later preferred time.
        </div>
      </div>

      <div className="space-y-2 pb-2">
        <button
          onClick={onRetry}
          className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center space-x-2 text-xs transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Matching (Expanded Radius)</span>
        </button>

        <button
          onClick={onCancel}
          className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center space-x-2"
        >
          <XCircle className="w-4 h-4" />
          <span>Cancel Service Request</span>
        </button>
      </div>
    </div>
  );
}
