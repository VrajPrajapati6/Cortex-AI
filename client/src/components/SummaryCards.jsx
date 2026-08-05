import React from 'react';

export const SummaryCards = ({ summary }) => {
  const totalLogs = summary?.totalLogs || 0;
  const errorRate = summary?.errorRate || 0;
  const cpuUsage = summary?.latestMetrics?.cpuUsage ?? 0;
  const memoryUsageMb = Number(summary?.latestMetrics?.memoryUsageMb || 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">

      <div className="p-4 sm:p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Logs</div>
        <div className="text-2xl sm:text-3xl font-bold font-mono text-white">{totalLogs.toLocaleString()}</div>
      </div>

      <div className="p-4 sm:p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">CPU Load</div>
        <div className="text-2xl sm:text-3xl font-bold font-mono text-white">{cpuUsage}%</div>
        <div className="w-full bg-slate-800 rounded-full h-2 mt-4 overflow-hidden">
          <div
            className={`h-2 rounded-full ${cpuUsage > 80 ? 'bg-rose-500' : cpuUsage > 50 ? 'bg-amber-400' : 'bg-emerald-400'}`}
            style={{ width: `${Math.min(cpuUsage, 100)}%` }}
          />
        </div>
      </div>

      <div className="p-4 sm:p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Memory Used</div>
        <div className="text-2xl sm:text-3xl font-bold font-mono text-white">{memoryUsageMb.toFixed(0)} <span className="text-sm font-normal text-slate-400">MB</span></div>
      </div>

      <div className="p-4 sm:p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Error Rate</div>
        <div className={`text-2xl sm:text-3xl font-bold font-mono ${errorRate > 15 ? 'text-rose-400' : 'text-slate-100'}`}>
          {errorRate}%
        </div>
      </div>

    </div>
  );
};
