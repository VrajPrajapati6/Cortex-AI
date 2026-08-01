import React from 'react';

export const SummaryCards = ({ summary }) => {
  const totalLogs = summary?.totalLogs || 0;
  const errorRate = summary?.errorRate || 0;
  const cpuUsage = summary?.latestMetrics?.cpuUsage ?? 0;
  const memoryUsageMb = Number(summary?.latestMetrics?.memoryUsageMb || 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">

      <div className="p-5 rounded-lg bg-white border border-gray-200 shadow-sm">
        <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Logs</div>
        <div className="text-3xl font-bold text-gray-900">{totalLogs.toLocaleString()}</div>
      </div>

      <div className="p-5 rounded-lg bg-white border border-gray-200 shadow-sm">
        <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">CPU Load</div>
        <div className="text-3xl font-bold text-gray-900">{cpuUsage}%</div>
        <div className="w-full bg-gray-100 rounded-full h-2 mt-4 overflow-hidden">
          <div
            className={`h-2 rounded-full ${cpuUsage > 80 ? 'bg-red-500' : cpuUsage > 50 ? 'bg-yellow-400' : 'bg-green-500'}`}
            style={{ width: `${Math.min(cpuUsage, 100)}%` }}
          />
        </div>
      </div>

      <div className="p-5 rounded-lg bg-white border border-gray-200 shadow-sm">
        <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Memory Used</div>
        <div className="text-3xl font-bold text-gray-900">{memoryUsageMb.toFixed(0)} <span className="text-lg font-normal text-gray-500">MB</span></div>
      </div>

      <div className="p-5 rounded-lg bg-white border border-gray-200 shadow-sm">
        <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Error Rate</div>
        <div className={`text-3xl font-bold ${errorRate > 15 ? 'text-red-600' : 'text-gray-900'}`}>
          {errorRate}%
        </div>
      </div>

    </div>
  );
};
