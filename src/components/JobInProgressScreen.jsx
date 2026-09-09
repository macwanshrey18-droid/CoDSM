import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle, ShieldCheck } from 'lucide-react';

export default function JobInProgressScreen({ booking, onMarkComplete }) {
  return (
    <div className="w-full h-full bg-slate-50 flex flex-col justify-between overflow-y-auto p-4 animate-fade-in">
      <div>
        <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 px-3 py-1.5 rounded-full text-xs font-bold text-center mb-4 flex items-center justify-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
          <span>Job Status: IN PROGRESS</span>
        </div>

        {/* Active Job Status Banner */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-md text-center mb-5 space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-1">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">Job In Progress</h3>
          <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">
            Currently executing service request for <strong className="text-slate-900">{booking?.customer || booking?.userName || booking?.customerName || 'Shrey Macwan'}</strong> ({booking?.serviceName || booking?.category || 'Plumbing Maintenance'}).
          </p>
        </div>

        {/* Job Details */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2 text-xs">
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500 font-bold">Category</span>
            <span className="font-extrabold text-indigo-900">{booking?.serviceName || booking?.category || 'Plumbing Repair'}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500 font-bold">Customer</span>
            <span className="font-bold text-slate-800">{booking?.customer || booking?.userName || booking?.customerName || 'Shrey Macwan'}</span>
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
