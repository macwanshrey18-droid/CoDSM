import React from 'react';
import { ShieldCheck, UserCheck, Wrench } from 'lucide-react';

export default function Navbar({ activeRole, onLogout }) {
  return (
    <header className="bg-slate-900 text-white px-4 py-3 shadow-md flex items-center justify-between z-20 border-b border-slate-800">
      {/* Brand Title */}
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight text-white leading-none">CoDSM</h1>
          <span className="text-[10px] text-emerald-400 font-medium tracking-wide uppercase">Coop Verified</span>
        </div>
      </div>

      {/* Role Badge Indicator (No Switch Buttons) */}
      <div className="flex items-center space-x-2">
        <div className="bg-slate-800 border border-slate-700/80 px-3 py-1 rounded-full flex items-center space-x-1.5 shadow-xs">
          {activeRole === 'household' ? (
            <>
              <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs font-bold text-indigo-200">Household Portal</span>
            </>
          ) : (
            <>
              <Wrench className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-200">Worker Portal</span>
            </>
          )}
        </div>

        {/* Logout / Switch Role Option */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="text-[11px] font-bold text-slate-400 hover:text-white px-2 py-1 rounded-lg transition-colors"
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
}
