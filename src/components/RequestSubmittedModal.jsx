import React from 'react';
import { Check, User, Clock, MapPin } from 'lucide-react';

export default function RequestSubmittedModal({ onViewMatches }) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl border border-slate-100 animate-slide-up">
        {/* Animated Green Circle Checkmark */}
        <div className="mx-auto w-16 h-16 bg-emerald-700 rounded-full flex items-center justify-center mb-4 shadow-md shadow-emerald-700/30 animate-pulse-glow">
          <Check className="w-9 h-9 text-white stroke-[3]" />
        </div>

        {/* Header */}
        <h2 className="text-xl font-bold text-slate-900 mb-1 tracking-tight">Request Submitted!</h2>
        <p className="text-xs text-slate-500 font-medium mb-6">
          We are finding the best verified worker for you.
        </p>

        {/* Status Checklist */}
        <div className="space-y-3 text-left mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded-full border border-emerald-500 bg-emerald-50 flex items-center justify-center text-emerald-600">
              <User className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-slate-700">Matching by skills</span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded-full border border-emerald-500 bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-slate-700">Checking availability</span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded-full border border-emerald-500 bg-emerald-50 flex items-center justify-center text-emerald-600">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-slate-700">Finding nearest worker</span>
          </div>
        </div>

        {/* View Matches Button */}
        <button
          onClick={onViewMatches}
          className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-600/25 text-sm transition-all duration-150"
        >
          View Matches
        </button>
      </div>
    </div>
  );
}
