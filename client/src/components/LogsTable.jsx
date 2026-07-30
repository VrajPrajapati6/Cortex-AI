import React from 'react';
import { Search, Filter, AlertOctagon, Info, AlertTriangle, Bug, ChevronLeft, ChevronRight } from 'lucide-react';

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
  setLimit
}) => {
  const getLevelBadge = (level) => {
    switch (level) {
      case 'ERROR':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium font-mono bg-rose-950/80 border border-rose-800 text-rose-300">
            <AlertOctagon className="w-3 h-3 text-rose-400" />
            ERROR
          </span>
        );
      case 'WARN':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium font-mono bg-amber-950/80 border border-amber-800 text-amber-300">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            WARN
          </span>
        );
      case 'INFO':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium font-mono bg-sky-950/80 border border-sky-800 text-sky-300">
            <Info className="w-3 h-3 text-sky-400" />
            INFO
          </span>
        );
      case 'DEBUG':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium font-mono bg-slate-900 border border-slate-700 text-slate-400">
            <Bug className="w-3 h-3 text-slate-400" />
            DEBUG
          </span>
        );
    }
  };

  const levels = ['ALL', 'INFO', 'WARN', 'ERROR', 'DEBUG'];

  return (
    <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 overflow-hidden flex flex-col">
      
      {/* Table Header Controls */}
      <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Title */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Live System Logs</h2>
          <span className="text-xs text-slate-400 font-mono ml-2">
            ({pagination.total || logs.length} records)
          </span>
        </div>

        {/* Filters & Search */}
        <div className="flex items-center gap-3 flex-wrap">
          
          {/* Level Filter Buttons */}
          <div className="flex items-center p-1 rounded-lg bg-slate-950 border border-slate-800">
            {levels.map((lvl) => (
              <button
                key={lvl}
                onClick={() => {
                  setSelectedLevel(lvl);
                  setPage(1);
                }}
                className={`px-2.5 py-1 text-xs font-medium font-mono rounded-md transition-all ${
                  selectedLevel === lvl
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Limit selector */}
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
            <option value={100}>100 / page</option>
          </select>

        </div>
      </div>

      {/* Logs Table Data */}
      <div className="overflow-x-auto max-h-[500px]">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-[#0b0f19] border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider sticky top-0 z-10">
            <tr>
              <th className="py-2.5 px-4 w-44">Timestamp</th>
              <th className="py-2.5 px-4 w-28">Level</th>
              <th className="py-2.5 px-4">Message</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
            {logs.length > 0 ? (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-4 text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString([], { 
                      month: 'short', 
                      day: '2-digit', 
                      hour: '2-digit', 
                      minute: '2-digit', 
                      second: '2-digit' 
                    })}
                  </td>
                  <td className="py-2.5 px-4 whitespace-nowrap">
                    {getLevelBadge(log.level)}
                  </td>
                  <td className="py-2.5 px-4 text-slate-200 break-all leading-relaxed">
                    {log.message}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="py-12 text-center text-slate-500 font-mono">
                  No telemetry logs found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Pagination */}
      <div className="p-3 border-t border-slate-800 bg-[#0b0f19] flex items-center justify-between text-xs text-slate-400 font-mono">
        <div>
          Page <span className="text-white font-semibold">{page}</span> of{' '}
          <span className="text-white font-semibold">{pagination.pages || 1}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 disabled:opacity-40 hover:bg-slate-800 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            disabled={page >= (pagination.pages || 1)}
            onClick={() => setPage((p) => Math.min(p + 1, pagination.pages || 1))}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 disabled:opacity-40 hover:bg-slate-800 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
