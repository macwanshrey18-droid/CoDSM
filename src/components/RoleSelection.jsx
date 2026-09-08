import React from 'react';
import { UserCheck, Wrench, ShieldCheck, ArrowRight } from 'lucide-react';

export default function RoleSelection({ onSelectRole }) {
  return (
    <div className="w-full h-full bg-slate-50 flex flex-col justify-between p-6 animate-fade-in">
      <div className="pt-4">
        {/* Top Header */}
        <div className="flex items-center space-x-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-base font-extrabold text-slate-900 tracking-tight">CoDSM</span>
        </div>

        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">Welcome!</h2>
        <p className="text-xs text-slate-500 font-medium mb-8">
          Choose your role to get started with trusted local services.
        </p>

        {/* Dual Role Choice Cards */}
        <div className="space-y-4">
          <button
            onClick={() => onSelectRole('household')}
            className="w-full bg-white p-5 rounded-3xl border-2 border-indigo-100 hover:border-indigo-600 shadow-md hover:shadow-xl transition-all duration-200 text-left flex items-center justify-between group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <UserCheck className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-900">I need a service</h3>
                <p className="text-xs text-slate-500 font-medium">Household / Customer</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
          </button>

          <button
            onClick={() => onSelectRole('worker')}
            className="w-full bg-white p-5 rounded-3xl border-2 border-emerald-100 hover:border-emerald-600 shadow-md hover:shadow-xl transition-all duration-200 text-left flex items-center justify-between group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Wrench className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-900">I provide a service</h3>
                <p className="text-xs text-slate-500 font-medium">Cooperative Verified Worker</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
          </button>
        </div>
      </div>

      <div className="text-center pb-2">
        <p className="text-[11px] text-slate-400 font-medium">
          Cooperative Owned Digital Marketplace System
        </p>
      </div>
    </div>
  );
}
