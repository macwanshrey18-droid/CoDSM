import React from 'react';
import { ShieldCheck, Star, Trophy, Check } from 'lucide-react';

export default function AssignWorkerPopup({ worker, onConfirm, onFindAnother }) {
  const w = worker || {
    name: 'Darmendra Jodhua',
    title: 'Master Plumber',
    rating: 4.9,
    reviewsCount: 18,
    distance: '0.8 km away',
    matchScore: '98% Match',
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl p-5 w-full max-w-sm text-center shadow-2xl border border-slate-100 animate-slide-up">
        {/* Trophy Header Icon */}
        <div className="mx-auto w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center mb-3 shadow-md shadow-indigo-600/30">
          <Trophy className="w-7 h-7 text-white" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-1">Top Match Found!</h3>
        <p className="text-xs text-slate-500 font-medium mb-4">We found the best verified worker for you.</p>

        {/* Worker Card */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left mb-4 shadow-xs">
          <div className="flex items-center space-x-3 mb-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow">
                {w.name.slice(0, 2).toUpperCase() || 'WP'}
              </div>
              <div className="absolute bottom-0 right-0 bg-emerald-600 text-white rounded-full p-0.5 border border-white">
                <ShieldCheck className="w-3 h-3" />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center">
                {w.name} <span className="text-emerald-600 font-bold ml-1 text-xs">✓</span>
              </h4>
              <p className="text-xs text-slate-500 font-medium">{w.title}</p>
              <div className="flex items-center space-x-1 text-[11px] text-slate-600 mt-0.5">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-bold text-slate-800">{w.rating}</span>
                <span>({w.reviewsCount})</span>
                <span>•</span>
                <span>{w.distance}</span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-2 text-center">
            <span className="text-xs font-bold text-emerald-800 block mb-0.5">{w.matchScore}</span>
            <div className="flex justify-center space-x-2 text-[10px] text-emerald-700 font-semibold">
              <span>Skill ✓</span>
              <span>Distance ✓</span>
              <span>Availability ✓</span>
            </div>
          </div>
        </div>

        {/* Confirm and Find Another Buttons */}
        <div className="space-y-2">
          <button
            onClick={onConfirm}
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center space-x-2 text-xs transition-all"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Confirm & Assign Worker</span>
          </button>

          <button
            onClick={onFindAnother}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-2.5 px-4 rounded-xl text-xs"
          >
            Find Another Candidate
          </button>
        </div>
      </div>
    </div>
  );
}
