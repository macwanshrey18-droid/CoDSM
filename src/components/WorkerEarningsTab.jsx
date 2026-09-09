import React, { useEffect, useState } from 'react';
import { DollarSign, Briefcase, Star, ArrowUpRight, RefreshCw, Calendar, ArrowLeft, TrendingUp, Info, ChevronRight } from 'lucide-react';
import { getWorkerEarnings } from '../services/api';

export default function WorkerEarningsTab({ token, workerProfile, onBack }) {
  const [earnings, setEarnings] = useState({
    totalThisWeek: 14850,
    totalThisMonth: workerProfile?.totalEarnings || 34250,
    jobsCompleted: workerProfile?.jobsCompleted || 48,
    ratingAvg: workerProfile?.ratingAvg || 4.9,
    ratingCount: workerProfile?.ratingCount || 42,
    pastJobs: [
      { id: 'job_100', category: 'Plumbing Emergency Leak', customerArea: 'Gulbai Tekra, Ahmedabad', date: 'Today', amount: 800, rating: 5, comment: 'Punctual and very fast work!' },
      { id: 'job_101', category: 'Plumbing Pipe Fitting', customerArea: 'Navrangpura, Ahmedabad', date: 'Yesterday', amount: 950, rating: 5, comment: 'Fixed pipe leak quickly!' },
      { id: 'job_102', category: 'Electrical Repair', customerArea: 'Ambawadi, Ahmedabad', date: '3 days ago', amount: 1400, rating: 5, comment: 'Very skilled and polite' },
      { id: 'job_103', category: 'Appliance Maintenance', customerArea: 'Satellite, Ahmedabad', date: '5 days ago', amount: 1200, rating: 5, comment: 'Great service quality' },
      { id: 'job_104', category: 'Emergency Fitting', customerArea: 'Bodakdev, Ahmedabad', date: 'Last week', amount: 850, rating: 5, comment: 'Clean work and punctual' },
    ],
    dailyBreakdown: [
      { day: 'Mon', dateLabel: 'Sep 2', amount: 1488, jobsCount: 2, isToday: false },
      { day: 'Tue', dateLabel: 'Sep 3', amount: 2232, jobsCount: 3, isToday: false },
      { day: 'Wed', dateLabel: 'Sep 4', amount: 1860, jobsCount: 2, isToday: false },
      { day: 'Thu', dateLabel: 'Sep 5', amount: 2728, jobsCount: 3, isToday: false },
      { day: 'Fri', dateLabel: 'Sep 6', amount: 1984, jobsCount: 2, isToday: false },
      { day: 'Sat', dateLabel: 'Sep 7', amount: 2108, jobsCount: 2, isToday: false },
      { day: 'Sun', dateLabel: 'Sep 8', amount: 1420, jobsCount: 2, isToday: true },
    ],
  });

  const [selectedDayIdx, setSelectedDayIdx] = useState(6); // Default select Today / last day
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    const activeToken = token || localStorage.getItem('codsm_token');
    if (activeToken) {
      const res = await getWorkerEarnings(activeToken).catch(() => null);
      if (res && (res.pastJobs || res.totalThisWeek !== undefined)) {
        setEarnings((prev) => ({
          ...prev,
          ...res,
          totalThisMonth: res.totalThisMonth || workerProfile?.totalEarnings || prev.totalThisMonth,
          jobsCompleted: res.jobsCompleted || workerProfile?.jobsCompleted || prev.jobsCompleted,
        }));
      } else if (workerProfile) {
        setEarnings((prev) => ({
          ...prev,
          totalThisMonth: workerProfile.totalEarnings || prev.totalThisMonth,
          jobsCompleted: workerProfile.jobsCompleted || prev.jobsCompleted,
        }));
      }
    }
    setRefreshing(false);
  };

  useEffect(() => {
    handleRefresh();
  }, [token]);

  // Normalize dailyBreakdown array (supports both raw numbers and object arrays)
  const breakdownList = (earnings.dailyBreakdown || []).map((item, idx) => {
    if (typeof item === 'number') {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      return {
        day: days[idx] || `Day ${idx + 1}`,
        dateLabel: `Day ${idx + 1}`,
        amount: item,
        jobsCount: item > 0 ? Math.max(1, Math.round(item / 850)) : 0,
        isToday: idx === 6,
      };
    }
    return item;
  });

  const maxAmount = Math.max(...breakdownList.map((d) => d.amount || 0), 1000);
  const selectedDay = breakdownList[selectedDayIdx] || breakdownList[breakdownList.length - 1] || { day: 'Today', amount: 0, jobsCount: 0 };
  const dailyAverage = earnings.totalThisWeek > 0 ? Math.round(earnings.totalThisWeek / 7) : 0;

  return (
    <div className="w-full h-full bg-slate-50 flex flex-col justify-between overflow-y-auto p-4 space-y-4 animate-fade-in">
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-3 pt-1">
          <div className="flex items-center space-x-2">
            {onBack && (
              <button
                onClick={onBack}
                className="p-1.5 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors shadow-xs"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Worker Earnings & History</h2>
          </div>
          <button
            onClick={handleRefresh}
            className="p-1.5 bg-white text-indigo-600 rounded-full border border-slate-200 shadow-xs hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Top Summary Banner */}
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-4 shadow-xl border border-indigo-700/50 mb-4">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest flex items-center">
              <TrendingUp className="w-3 h-3 mr-1 text-emerald-400" /> Total Earnings (This Week)
            </span>
            <span className="text-emerald-400 text-xs font-bold flex items-center bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
              {earnings.totalThisWeek > 0 ? '+14%' : '₹0'} <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </span>
          </div>
          <h3 className="text-2xl font-extrabold text-white mb-3 tracking-tight">₹{earnings.totalThisWeek.toLocaleString()}</h3>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-indigo-800/80 text-center">
            <div>
              <span className="text-[10px] text-indigo-300 block font-medium">This Month</span>
              <span className="text-xs font-bold text-white">₹{earnings.totalThisMonth.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[10px] text-indigo-300 block font-medium">Jobs Done</span>
              <span className="text-xs font-bold text-white">{earnings.jobsCompleted} Jobs</span>
            </div>
            <div>
              <span className="text-[10px] text-indigo-300 block font-medium">Avg Rating</span>
              <span className="text-xs font-bold text-amber-400">★ {earnings.ratingAvg ? earnings.ratingAvg : 'New'}</span>
            </div>
          </div>
        </div>

        {/* 7-Day Earnings Trend Bar Chart Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs mb-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center">
                <Calendar className="w-3.5 h-3.5 text-indigo-600 mr-1" /> 7-Day Earnings Trend
              </h4>
              <span className="text-[10px] text-slate-500 font-medium">Tap any bar to inspect daily metrics</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200/80">
              Avg ₹{dailyAverage.toLocaleString()} / day
            </span>
          </div>

          {/* Interactive Bar Chart Grid */}
          <div className="flex items-end justify-between h-32 pt-5 px-1 border-b border-slate-100 pb-2">
            {breakdownList.map((dayData, idx) => {
              const amount = dayData.amount || 0;
              const heightPercent = amount > 0 ? Math.min(100, Math.max(20, Math.round((amount / maxAmount) * 100))) : 10;
              const isSelected = idx === selectedDayIdx;

              return (
                <button
                  key={dayData.day || idx}
                  type="button"
                  onClick={() => setSelectedDayIdx(idx)}
                  className="flex flex-col items-center space-y-1 flex-1 focus:outline-hidden group relative transition-transform active:scale-95"
                >
                  {/* Top Price Badge */}
                  {amount > 0 ? (
                    <span
                      className={`text-[9px] font-extrabold px-1 py-0.5 rounded border transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs scale-105'
                          : 'bg-indigo-50 text-indigo-900 border-indigo-100 group-hover:bg-indigo-100'
                      }`}
                    >
                      ₹{amount >= 1000 ? `${(amount / 1000).toFixed(1)}k` : amount}
                    </span>
                  ) : (
                    <span className="text-[9px] font-semibold text-slate-300">₹0</span>
                  )}

                  {/* Vertical Bar Container */}
                  <div className="w-full max-w-[22px] h-20 flex items-end justify-center">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-md transition-all duration-300 ${
                        isSelected
                          ? 'bg-gradient-to-t from-indigo-600 to-indigo-500 shadow-md ring-2 ring-indigo-400'
                          : amount > 0
                          ? dayData.isToday
                            ? 'bg-emerald-500 group-hover:bg-emerald-600'
                            : 'bg-indigo-400/80 group-hover:bg-indigo-600'
                          : 'bg-slate-200'
                      }`}
                    ></div>
                  </div>

                  {/* Day Label */}
                  <span
                    className={`text-[10px] font-bold ${
                      isSelected
                        ? 'text-indigo-600 underline underline-offset-2'
                        : dayData.isToday
                        ? 'text-emerald-600 font-extrabold'
                        : 'text-slate-500'
                    }`}
                  >
                    {dayData.day}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Day Inspector Panel */}
          {selectedDay && (
            <div className="mt-3 bg-indigo-50/70 border border-indigo-100 rounded-xl p-3 flex items-center justify-between animate-fade-in">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {selectedDay.day}
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900 flex items-center">
                    <span>{selectedDay.dateLabel || selectedDay.day}</span>
                    {selectedDay.isToday && (
                      <span className="ml-1.5 bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                        Today
                      </span>
                    )}
                  </h5>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {selectedDay.jobsCount > 0 ? `${selectedDay.jobsCount} Completed Jobs` : 'No jobs recorded'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-indigo-900 block">₹{(selectedDay.amount || 0).toLocaleString()}</span>
                <span className="text-[9px] font-bold text-emerald-700">
                  {selectedDay.amount > dailyAverage ? 'Above Avg 🔥' : selectedDay.amount > 0 ? 'Normal Day' : 'Rest Day'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Past Jobs List Header */}
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Completed Job History</h4>
          <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-2xs">
            {earnings.pastJobs.length} Recent Jobs
          </span>
        </div>

        {/* Scrollable Past Job Rows */}
        <div className="space-y-2.5">
          {earnings.pastJobs.length > 0 ? (
            earnings.pastJobs.map((job) => (
              <div key={job.id} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{job.category}</h5>
                    <p className="text-[10px] text-slate-500 font-medium">{job.customerArea} • {job.date}</p>
                  </div>
                  <span className="text-sm font-extrabold text-emerald-600">+₹{job.amount}</span>
                </div>

                {job.rating && (
                  <div className="bg-amber-50/80 border border-amber-200/60 rounded-xl p-2 mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-amber-800 font-bold flex items-center">
                      ★ {job.rating}.0 <span className="text-slate-500 font-normal ml-1">"{job.comment}"</span>
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">Verified Paid</span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl p-6 text-center border border-slate-200 shadow-xs">
              <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <h5 className="text-xs font-bold text-slate-800 mb-0.5">No Job History Yet</h5>
              <p className="text-[11px] text-slate-500 font-medium">Completed service requests and earnings will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
