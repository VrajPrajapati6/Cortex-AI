import React from 'react';

export const IncidentsList = ({ incidents = [], selectedIncidentId, onSelect }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 shadow-md flex flex-col h-full rounded-lg overflow-hidden">
      <div className="p-3.5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">Active & Past Incidents</h2>
        <span className="text-[10px] font-mono font-bold text-slate-500 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
          {incidents.length} Detected
        </span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {incidents.length === 0 ? (
          <div className="p-4 text-xs font-mono text-slate-500">No incidents detected.</div>
        ) : (
          <ul className="divide-y divide-slate-800/80">
            {incidents.map(inc => (
              <li 
                key={inc.id}
                onClick={() => {
                  onSelect(inc.id === selectedIncidentId ? null : inc.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`p-3.5 cursor-pointer hover:bg-slate-800/60 transition-colors ${
                  selectedIncidentId === inc.id 
                    ? 'bg-indigo-950/40 border-l-4 border-indigo-500' 
                    : 'border-l-4 border-transparent'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                      inc.type === 'LOG' ? 'bg-indigo-950/80 text-indigo-300 border-indigo-800/60' :
                      inc.type === 'CPU' ? 'bg-cyan-950/80 text-cyan-300 border-cyan-800/60' :
                      inc.type === 'MEMORY' ? 'bg-fuchsia-950/80 text-fuchsia-300 border-fuchsia-800/60' :
                      'bg-slate-800 text-slate-300 border-slate-700'
                    }`}>
                      {inc.type || 'SYSTEM'}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase border ${
                      inc.status === 'ACTIVE' 
                        ? 'bg-rose-950/80 text-rose-300 border-rose-800/60' 
                        : 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                    }`}>
                      {inc.status}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-xs text-slate-200 font-medium leading-snug line-clamp-2">
                  {inc.trigger_reason}
                </div>
                {inc.resolved_at && (
                  <div className="mt-1.5 text-[11px] text-slate-500 font-mono">
                    Resolved: {new Date(inc.resolved_at).toLocaleTimeString()}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
