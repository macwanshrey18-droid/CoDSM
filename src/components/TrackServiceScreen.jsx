import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Clock, Wrench, ShieldCheck, Star } from 'lucide-react';
import { cancelServiceRequest } from '../services/api';

export default function TrackServiceScreen({ bookingStatus = 'ACCEPTED', worker, onRateTap, onBack }) {
  const w = worker || {
    name: 'Darmendra Jodhua',
    title: 'Master Plumber',
    rating: 4.9,
  };

  const steps = [
    { id: 'MATCHED', title: 'Worker Matched', desc: `${w.name} assigned to job` },
    { id: 'ACCEPTED', title: 'Request Accepted', desc: 'Worker confirmed arrival' },
    { id: 'IN_PROGRESS', title: 'Job In Progress', desc: 'Service currently underway' },
    { id: 'COMPLETED', title: 'Service Completed', desc: 'Job finished & verified' },
  ];

  const getStepState = (stepId) => {
    const order = ['MATCHED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED'];
    const currentIdx = order.indexOf(bookingStatus);
    const stepIdx = order.indexOf(stepId);

    if (stepIdx < currentIdx) return 'completed';
    if (stepIdx === currentIdx) return 'current';
    return 'pending';
  };

  return (
    <div className="w-full h-full bg-slate-50 flex flex-col justify-between overflow-y-auto p-4 animate-fade-in">
      <div>
        {/* Header */}
        <div className="flex items-center space-x-3 mb-5 pt-1">
          <button onClick={onBack} className="p-1.5 rounded-full hover:bg-slate-200 text-indigo-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Track Service Status</h2>
        </div>

        {/* Assigned Worker Info Header */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs mb-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
              {w.name.slice(0, 2).toUpperCase() || 'WP'}
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 flex items-center">
                {w.name} <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 ml-1" />
              </h4>
              <p className="text-[11px] text-slate-500 font-medium">{w.title} • ★ {w.rating}</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
            {bookingStatus}
          </span>
        </div>

        {/* Live Stepper */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs mb-5 space-y-6">
          {steps.map((s, idx) => {
            const state = getStepState(s.id);
            return (
              <div key={s.id} className="relative flex items-start space-x-4">
                {/* Line connector */}
                {idx < steps.length - 1 && (
                  <div
                    className={`absolute left-4 top-8 w-0.5 h-10 -ml-px transition-colors duration-500 ${
                      state === 'completed' ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  ></div>
                )}

                {/* Circle Icon */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all duration-300 z-10 ${
                    state === 'completed'
                      ? 'bg-emerald-600 text-white shadow'
                      : state === 'current'
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 animate-pulse-glow'
                      : 'bg-slate-100 border border-slate-300 text-slate-400'
                  }`}
                >
                  {state === 'completed' ? <CheckCircle2 className="w-5 h-5 stroke-[2.5]" /> : idx + 1}
                </div>

                <div>
                  <h4 className={`text-xs font-bold ${state === 'pending' ? 'text-slate-400' : 'text-slate-900'}`}>
                    {s.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Screen 13: Service Completed Summary Card */}
        {bookingStatus === 'COMPLETED' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center animate-slide-up mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-2 shadow">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-emerald-900 mb-1">Service Successfully Completed!</h4>
            <p className="text-xs text-emerald-700 font-medium mb-3">Plumbing repair completed by Arjun K. (Duration: 35 mins)</p>
            <button
              onClick={onRateTap}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow"
            >
              Rate Your Experience ★
            </button>
          </div>
        )}
      </div>

      {bookingStatus === 'MATCHED' && (
        <div className="pb-2">
          <button
            onClick={() => alert('Request cancelled')}
            className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 px-4 rounded-xl text-xs"
          >
            Cancel Request
          </button>
        </div>
      )}
    </div>
  );
}
