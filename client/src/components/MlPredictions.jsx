import React from 'react';

export const MlPredictions = ({ mlData }) => {
  if (!mlData) {
    return (
      <div className="bg-[#111827] backdrop-blur-md bg-opacity-80 p-6 rounded-2xl mb-6 border border-gray-800 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
        <h2 className="text-xl font-bold text-gray-200 mb-4 flex items-center tracking-tight">
          <span className="w-2.5 h-2.5 bg-gray-600 rounded-full mr-3 animate-pulse"></span>
          Cortex AI: Machine Learning Early Warning System
        </h2>
        <div className="text-gray-400 font-medium">Waiting for live inference payload...</div>
      </div>
    );
  }

  const { is_anomaly, predicted_incident, primary_service, features } = mlData;

  const isAnomalous = is_anomaly === 1;
  const hasIncident = predicted_incident && predicted_incident !== 'NONE';

  return (
    <div className={`p-6 rounded-2xl mb-6 border shadow-2xl transition-all duration-500 ${isAnomalous ? 'bg-gradient-to-br from-[#2a1114] to-[#1a0a0c] border-red-900/50 shadow-red-900/20' : 'bg-gradient-to-br from-[#111827] to-[#0f1422] border-gray-800'}`}>
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
              <span className={`px-2 py-0.5 rounded ${features.cpu_usage > 80 ? 'bg-red-500/20 text-red-400' : 'bg-gray-800'}`}>{features.cpu_usage}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Memory Usage:</span>
              <span className={`px-2 py-0.5 rounded ${features.memory_usage > 8000 ? 'bg-red-500/20 text-red-400' : 'bg-gray-800'}`}>{features.memory_usage} MB</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">P95 Latency:</span>
              <span className={`px-2 py-0.5 rounded ${features.p95_latency > 500 ? 'bg-red-500/20 text-red-400' : 'bg-gray-800'}`}>{features.p95_latency} ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
