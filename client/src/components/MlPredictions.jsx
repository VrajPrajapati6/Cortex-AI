import React from 'react';

export const MlPredictions = ({ mlData, mlStatus }) => {
  const isWakingUp = mlStatus?.status === 'waking_up';

  // If initial telemetry is still spinning up on first 1s boot
  if (!mlData) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-md p-5 sm:p-6 rounded-xl mb-6 border border-amber-500/40 shadow-lg shadow-amber-950/20 relative overflow-hidden transition-all duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center tracking-tight">
            <span className="relative flex h-3 w-3 mr-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            Cortex AI: Machine Learning Early Warning System
          </h2>

          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold text-amber-400 w-fit shadow-sm">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            WAKING UP ML ENGINE
          </div>
        </div>

        <div className="bg-slate-950/80 border border-amber-500/25 rounded-lg p-4 mb-4 shadow-inner">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-500/10 rounded-md border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div className="space-y-1">
              <p className="text-amber-200/90 text-xs sm:text-sm font-medium leading-relaxed">
                Due to Render free tier, the ML model may take 40-50 seconds to wake up from sleep. Please wait while the model initializes automatically...
              </p>
              <p className="text-slate-400 font-mono text-xs flex items-center gap-1.5 mt-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                Auto-pinging Render Python service in background. No manual action or page visit required.
              </p>
            </div>
          </div>
        </div>

        <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800/80">
          <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 h-full w-full animate-pulse rounded-full" />
        </div>
      </div>
    );
  }

  const { is_anomaly, predicted_incident, primary_service, features, source } = mlData;

  const isAnomalous = is_anomaly === 1;
  const hasIncident = predicted_incident && predicted_incident !== 'NONE';

  return (
    <div className={`p-5 sm:p-6 rounded-xl mb-6 border shadow-md transition-all duration-500 relative overflow-hidden ${isAnomalous ? 'bg-gradient-to-br from-rose-950/60 via-slate-900 to-slate-900 border-rose-900/60 shadow-rose-950/40' : 'bg-slate-900 border-slate-800'}`}>
      
      {/* Cold Start Notice Banner when waking up */}
      {isWakingUp && (
        <div className="bg-amber-950/40 border border-amber-500/30 rounded-lg px-4 py-2.5 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-inner">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <span className="text-xs sm:text-sm font-medium text-amber-200">
              ⚡ Due to Render free tier, the Python ML model may take 40–50 seconds to wake up from sleep. The system is auto-waking it in the background...
            </span>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0 self-start sm:self-auto">
            AUTO WAKING UP
          </span>
        </div>
      )}

      {/* Online Status Pill when active */}
      {!isWakingUp && (
        <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-lg px-3.5 py-1.5 mb-4 flex items-center justify-between text-xs font-mono text-emerald-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]"></span>
            <span>ML ENGINE ONLINE: {source === 'fastapi_xgboost' ? 'FastAPI + XGBoost Classifier' : 'Cortex Telemetry AI Engine'}</span>
          </div>
          <span className="text-slate-400 font-sans text-[11px]">Real-Time Active Pipeline</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-100 flex items-center tracking-tight">
          <span className={`w-2.5 h-2.5 rounded-full mr-3 shadow-[0_0_8px] ${isAnomalous ? 'bg-red-500 shadow-red-500 animate-pulse' : 'bg-green-500 shadow-green-500'}`}></span>
          Cortex AI: Machine Learning Early Warning System
        </h2>
        <div className="mt-3 md:mt-0 flex items-center gap-3 bg-gray-900/60 px-4 py-1.5 rounded-full border border-gray-700/50">
          <span className="text-sm text-gray-400 font-medium">Real-Time P95 Latency:</span>
          <span className={`text-sm font-bold ${features?.p95_latency > 500 ? 'text-red-400' : 'text-blue-400'}`}>
            {features?.p95_latency || 0} ms
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 backdrop-blur-lg p-5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
          <div className="text-xs uppercase tracking-wider text-gray-400 mb-1 font-semibold">XGBoost Anomaly Detection</div>
          <div className={`text-2xl font-black tracking-tight ${isAnomalous ? 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]' : 'text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]'}`}>
            {isAnomalous ? 'ANOMALY DETECTED' : 'NORMAL'}
          </div>
          {isAnomalous && (
             <div className="text-sm text-red-300 mt-2 font-medium flex items-center">
               <span className="mr-1">⚠️</span> Source: {primary_service}
             </div>
          )}
        </div>

        <div className="bg-white/5 backdrop-blur-lg p-5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
          <div className="text-xs uppercase tracking-wider text-gray-400 mb-1 font-semibold">XGBoost Incident Prediction</div>
          <div className={`text-2xl font-black tracking-tight ${hasIncident ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]' : 'text-gray-300'}`}>
            {predicted_incident || 'NONE'}
          </div>
          {hasIncident && (
             <div className="text-sm text-yellow-300 mt-2 font-medium">
               High probability of imminent {predicted_incident.toLowerCase()} incident.
             </div>
          )}
        </div>

        <div className="bg-white/5 backdrop-blur-lg p-5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
          <div className="text-xs uppercase tracking-wider text-gray-400 mb-2 font-semibold">Live Feature Context</div>
          <div className="text-sm text-gray-300 space-y-1.5 mt-2 font-medium">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">CPU Usage:</span>
              <span className={`px-2 py-0.5 rounded ${features?.cpu_usage > 80 ? 'bg-red-500/20 text-red-400' : 'bg-gray-800'}`}>{features?.cpu_usage || 0}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Memory Usage:</span>
              <span className={`px-2 py-0.5 rounded ${features?.memory_usage > 8000 ? 'bg-red-500/20 text-red-400' : 'bg-gray-800'}`}>{features?.memory_usage || 0} MB</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">P95 Latency:</span>
              <span className={`px-2 py-0.5 rounded ${features?.p95_latency > 500 ? 'bg-red-500/20 text-red-400' : 'bg-gray-800'}`}>{features?.p95_latency || 0} ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
