import React from 'react';
import { Wallet, ShieldCheck } from 'lucide-react';

export default function PaymentReceivedModal({ paymentDetails, onViewEarnings }) {
  const serviceAmount = paymentDetails?.serviceAmount || 800;
  const welfareContribution = paymentDetails?.welfareContribution || 20;
  const netEarnings = serviceAmount - welfareContribution;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl border border-slate-100 animate-slide-up">
        {/* Green Circle Wallet Icon */}
        <div className="mx-auto w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-emerald-600/30">
          <Wallet className="w-8 h-8 text-white" />
        </div>

        {/* Header */}
        <h3 className="text-xl font-extrabold text-emerald-800 tracking-tight mb-1">
          Payment Received!
        </h3>
        <p className="text-xs text-slate-500 font-medium mb-5 px-2">
          You have received a payment for your completed service.
        </p>

        {/* Financial Breakdown Table */}
        <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200/80 mb-4 text-left space-y-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-600 font-medium">Service Amount</span>
            <span className="font-bold text-slate-800">₹{serviceAmount.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-600 font-medium">Welfare Contribution</span>
            <span className="font-bold text-rose-600">-₹{welfareContribution.toFixed(2)}</span>
          </div>

          <div className="border-t border-dashed border-slate-300 pt-2.5 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-900">You Earn</span>
            <span className="text-base font-extrabold text-emerald-600">₹{netEarnings.toFixed(2)}</span>
          </div>
        </div>

        {/* Security Badge */}
        <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-2.5 mb-5 flex items-start space-x-2 text-left">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span className="text-[11px] font-semibold text-emerald-800 leading-snug">
            Payment is secure and successfully credited.
          </span>
        </div>

        {/* View Earnings Button */}
        <button
          onClick={onViewEarnings}
          className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-600/25 text-sm transition-all"
        >
          View Earnings
        </button>
      </div>
    </div>
  );
}
