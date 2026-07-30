import React from 'react';

export const LogsTable = ({ 
  logs = [], 
  pagination = {}, 
  selectedLevel, 
  setSelectedLevel, 
  searchTerm, 
  setSearchTerm,
  page,
  setPage,
  limit,
  setLimit,
  isIncidentView = false
}) => {
  const levels = ['ALL', 'INFO', 'WARN', 'ERROR', 'DEBUG'];

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden">
      
      <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50">
        <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">
          {isIncidentView ? 'Incident Log Trail (±1 Min Window)' : 'System Logs'}
        </h2>

        {!isIncidentView && (
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex bg-white rounded-md border border-gray-300 overflow-hidden">
              {levels.map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => { setSelectedLevel(lvl); setPage(1); }}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedLevel === lvl ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-50'
                  } ${lvl !== 'ALL' ? 'border-l border-gray-200' : ''}`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 w-48"
            />
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-white border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4 w-48 font-medium">Timestamp</th>
              <th className="py-3 px-4 w-28 font-medium">Level</th>
              <th className="py-3 px-4 font-medium">Message</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {logs.length > 0 ? (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="py-2.5 px-4 whitespace-nowrap text-gray-500 text-xs">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      log.level === 'ERROR' ? 'bg-red-100 text-red-700' :
                      log.level === 'WARN' ? 'bg-yellow-100 text-yellow-800' :
                      log.level === 'INFO' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {log.level}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-gray-900">
                    {log.message}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="py-8 text-center text-gray-500">
                  No logs available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!isIncidentView && pagination.pages > 1 && (
        <div className="p-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-sm text-gray-600">
          <div>Page <span className="font-semibold text-gray-900">{page}</span> of {pagination.pages}</div>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              className="px-3 py-1 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Prev
            </button>
            <button
              disabled={page >= pagination.pages}
              onClick={() => setPage(p => Math.min(p + 1, pagination.pages))}
              className="px-3 py-1 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
