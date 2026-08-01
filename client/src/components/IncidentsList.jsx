import React from 'react';

export const IncidentsList = ({ incidents = [], selectedIncidentId, onSelect }) => {
  return (
    <div className="bg-white border border-gray-200 shadow-sm flex flex-col h-full rounded-md">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-sm font-semibold text-gray-800">Active & Past Incidents</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {incidents.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">No incidents detected.</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {incidents.map(inc => (
              <li 
                key={inc.id}
                onClick={() => {
                  onSelect(inc.id === selectedIncidentId ? null : inc.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedIncidentId === inc.id ? 'bg-blue-50 border-l-4 border-blue-500' : 'border-l-4 border-transparent'}`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                      inc.type === 'LOG' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                      inc.type === 'CPU' ? 'bg-cyan-50 text-cyan-700 border-cyan-200' :
                      inc.type === 'MEMORY' ? 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200' :
                      'bg-gray-100 text-gray-700 border-gray-200'
                    }`}>
                      {inc.type || 'SYSTEM'}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      inc.status === 'ACTIVE' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {inc.status}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">
                    {new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-sm text-gray-800 font-medium line-clamp-2">
                  {inc.trigger_reason}
                </div>
                {inc.resolved_at && (
                  <div className="mt-2 text-xs text-gray-500">
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
