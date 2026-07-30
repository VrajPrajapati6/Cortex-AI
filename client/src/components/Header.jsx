import React from 'react';
import { Activity, RefreshCw, Clock, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

export const Header = ({ 
  systemStatus = 'OPERATIONAL', 
  lastUpdated, 
  autoRefresh, 
  setAutoRefresh, 
  countdown, 
  onManualRefresh, 
  isRefreshing 
}) => {
  const getStatusBadge = () => {
    switch (systemStatus) {
      case 'CRITICAL':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-950/80 border border-rose-800 text-rose-400 text-xs font-medium">
            <AlertCircle className="w-3.5 h-3.5 animate-pulse text-rose-400" />
            <span>CRITICAL</span>
          </div>
        );
      case 'DEGRADED':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-800 text-amber-400 text-xs font-medium">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>DEGRADED</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>OPERATIONAL</span>
          </div>
        );
    }
  };

  return (
    <header className="border-b border-slate-800/80 bg-[#0b0f19]/90 backdrop-blur sticky top-0 z-50 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-sm shadow-indigo-950">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-bold text-white tracking-tight">Cortex</h1>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                Observability
              </span>
              {getStatusBadge()}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Real-time Telemetry & Backend Health Dashboard</p>
          </div>
        </div>

        {/* Refresh & Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Live Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
            <span className={`h-2 w-2 rounded-full ${autoRefresh ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
            <span className="font-mono text-slate-400">
              {autoRefresh ? `Refreshing in ${countdown}s` : 'Auto-refresh Off'}
            </span>
          </div>

          {/* Toggle Auto Refresh */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              autoRefresh 
                ? 'bg-indigo-950/60 border-indigo-700/60 text-indigo-300 hover:bg-indigo-900/60' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {autoRefresh ? 'Pause 10s' : 'Resume 10s'}
          </button>

          {/* Manual Refresh Button */}
          <button
            onClick={onManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-medium transition-all disabled:opacity-50 border border-indigo-400/30 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {/* Last updated timestamp */}
          {lastUpdated && (
            <div className="hidden md:flex items-center gap-1 text-[11px] text-slate-500 font-mono pl-2 border-l border-slate-800">
              <Clock className="w-3 h-3 text-slate-600" />
              <span>{new Date(lastUpdated).toLocaleTimeString()}</span>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
