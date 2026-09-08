import React from 'react';
import { Bell, ArrowRight } from 'lucide-react';

export default function NewJobNotificationBanner({ request, onViewDetails, onDismiss }) {
  if (!request) return null;

  return (
    <div className="fixed top-3 left-3 right-3 bg-indigo-900 text-white p-3.5 rounded-2xl shadow-2xl z-50 border border-indigo-700 animate-slide-up flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center animate-bounce shadow">
          <Bell className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
            New Job Notification Matched!
          </span>
          <h4 className="text-xs font-bold text-white leading-tight">Plumbing • 0.8 km away</h4>
          <p className="text-[10px] text-indigo-200">Navrangpura, Ahmedabad • ₹800</p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={onViewDetails}
          className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1 shadow"
        >
          <span>View</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <button onClick={onDismiss} className="text-indigo-300 font-bold px-1 text-xs">✕</button>
      </div>
    </div>
  );
}
