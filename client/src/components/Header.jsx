import React from 'react';

export const Header = ({
  systemStatus = 'OPERATIONAL',
  lastUpdated,
  autoRefresh,
  setAutoRefresh,
  countdown,
  onManualRefresh,
  isRefreshing
}) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50">
      <div className="max-w-screen-2xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Cortex</h1>
              <span className={`px-2.5 py-0.5 text-xs font-bold uppercase rounded ${systemStatus === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                  systemStatus === 'DEGRADED' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-700'
                }`}>
                {systemStatus}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Observability & Telemetry</p>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-sm text-green-700">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="font-semibold text-xs tracking-wide uppercase">Live Connection</span>
          </div>

          <button
            onClick={onManualRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 transition-colors shadow-sm"
          >
            {isRefreshing ? 'Refreshing...' : 'Manual Refresh'}
          </button>
        </div>
      </div>
    </header>
  );
};
