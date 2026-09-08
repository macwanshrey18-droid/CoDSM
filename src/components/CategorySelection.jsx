import React, { useState } from 'react';
import { ArrowLeft, Wrench, Zap, Sparkles, Calendar, Clock } from 'lucide-react';

export default function CategorySelection({ onRequestCreated }) {
  const [selectedCategory, setSelectedCategory] = useState('plumbing');
  const [preferredTime, setPreferredTime] = useState('Today, 4:00 PM');

  const categories = [
    { id: 'plumbing', label: 'Plumbing', icon: Wrench, activeBg: 'bg-emerald-100/70 border-emerald-500 text-emerald-700' },
    { id: 'electrical', label: 'Electrical', icon: Zap, activeBg: 'bg-indigo-100/70 border-indigo-500 text-indigo-700' },
    { id: 'cleaning', label: 'Cleaning', icon: Sparkles, activeBg: 'bg-sky-100/70 border-sky-500 text-sky-700' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onRequestCreated({
      category: selectedCategory,
      location: { type: 'Point', coordinates: [77.5946, 12.9716] },
      requestedTime: new Date().toISOString(),
    });
  };

  return (
    <div className="w-full h-full bg-slate-50 flex flex-col justify-between overflow-hidden p-4">
      <div>
        {/* Header (Matching Screenshot 1) */}
        <div className="flex items-center space-x-3 mb-6 pt-2">
          <button className="p-1.5 rounded-full hover:bg-slate-200 text-indigo-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Request a Service</h2>
        </div>

        {/* Select Category Grid */}
        <div className="mb-6">
          <label className="text-xs font-bold text-slate-700 block mb-3 uppercase tracking-wide">
            Select Category
          </label>
          <div className="grid grid-cols-3 gap-3">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`p-4 rounded-2xl border flex flex-col items-center justify-center space-y-2 transition-all duration-200 ${
                    isSelected
                      ? `${cat.activeBg} border-2 shadow-sm scale-[1.02]`
                      : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200/60'
                  }`}
                >
                  <Icon className={`w-6 h-6 ${isSelected ? 'stroke-[2.5]' : ''}`} />
                  <span className="text-xs font-bold">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Preferred Time Picker Card */}
        <div className="mb-6">
          <label className="text-xs font-bold text-slate-700 block mb-3 uppercase tracking-wide">
            Preferred Time
          </label>
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-3 text-slate-700">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <span className="text-xs font-semibold">{preferredTime}</span>
            </div>
            <span className="text-slate-400 text-xs font-bold hover:text-slate-600 cursor-pointer">✕</span>
          </div>
        </div>
      </div>

      {/* Find a Worker CTA Button */}
      <div className="pb-4">
        <button
          onClick={handleSubmit}
          className="w-full bg-indigo-950 hover:bg-slate-900 active:scale-[0.98] text-white font-bold py-4 px-4 rounded-2xl shadow-xl flex items-center justify-center space-x-2 text-sm transition-all"
        >
          <span>Find a Worker</span>
          <span>&rarr;</span>
        </button>
      </div>
    </div>
  );
}
