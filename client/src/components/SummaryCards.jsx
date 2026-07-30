import React from 'react';
import { Cpu, HardDrive, FileText, AlertOctagon, Info, AlertTriangle, Bug } from 'lucide-react';

export const SummaryCards = ({ summary }) => {
  const totalLogs = summary?.totalLogs || 0;
  const errorRate = summary?.errorRate || 0;
  const cpuUsage = summary?.latestMetrics?.cpuUsage ?? 0;
  const memoryUsageMb = summary?.latestMetrics?.memoryUsageMb ?? 0;
  const breakdown = summary?.logLevelBreakdown || { info: 0, warn: 0, error: 0, debug: 0 };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* Total Logs Card */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Total Logs</span>
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <FileText className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold font-mono text-white tracking-tight">
          {totalLogs.toLocaleString()}
        </div>
        
        {/* Log Breakdown Pills */}
        <div className="flex items-center gap-1.5 mt-3 text-[11px] font-mono flex-wrap">
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-950/60 border border-sky-800/60 text-sky-400">
            <Info className="w-2.5 h-2.5" /> {breakdown.info}
          </span>
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-800/60 text-amber-400">
            <AlertTriangle className="w-2.5 h-2.5" /> {breakdown.warn}
          </span>
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-950/60 border border-rose-800/60 text-rose-400">
            <AlertOctagon className="w-2.5 h-2.5" /> {breakdown.error}
          </span>
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800/60 border border-slate-700/60 text-slate-400">
            <Bug className="w-2.5 h-2.5" /> {breakdown.debug}
          </span>
        </div>
      </div>

      {/* CPU Usage Card */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">CPU Load</span>
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Cpu className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {cpuUsage}%
          </div>
          <span className="text-xs text-slate-400 font-mono">
            avg {summary?.averageMetrics?.cpuUsage || 0}%
          </span>
        </div>
        
        {/* Visual Progress Bar */}
        <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
          <div 
            className={`h-1.5 rounded-full transition-all duration-500 ${
              cpuUsage > 80 ? 'bg-rose-500' : cpuUsage > 50 ? 'bg-amber-400' : 'bg-cyan-400'
            }`}
            style={{ width: `${Math.min(cpuUsage, 100)}%` }}
          />
        </div>
      </div>

      {/* Memory Usage Card */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Memory Used</span>
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <HardDrive className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {memoryUsageMb.toFixed(1)} <span className="text-sm font-normal text-slate-400">MB</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            avg {summary?.averageMetrics?.memoryUsageMb || 0} MB
          </span>
        </div>
        
        <div className="text-[11px] text-slate-400 mt-3 font-mono">
          Snapshot frequency: 10 seconds
        </div>
      </div>

      {/* Error Rate Card */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Error Rate</span>
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertOctagon className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <div className={`text-2xl font-bold font-mono tracking-tight ${errorRate > 15 ? 'text-rose-400' : 'text-white'}`}>
            {errorRate}%
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {breakdown.error} errors
          </span>
        </div>
        
        <div className="text-[11px] text-slate-400 mt-3 font-mono">
          {errorRate === 0 ? 'No active telemetry errors' : `${errorRate}% of total logs require attention`}
        </div>
      </div>

    </div>
  );
};
