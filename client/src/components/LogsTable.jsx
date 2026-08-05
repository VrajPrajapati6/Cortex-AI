import React, { useState, useMemo } from 'react';

export const LogsTable = ({
  logs = [],
  pagination = {},
  selectedLevel,
  setSelectedLevel,
  selectedService = 'ALL',
  setSelectedService,
  selectedEventType = 'ALL',
  setSelectedEventType,
  searchTerm,
  setSearchTerm,
  page,
  setPage,
  limit,
  setLimit,
  isIncidentView = false,
  onTraceSelect
}) => {
  // Local state for incident view filtering if props are not provided
  const [localLevel, setLocalLevel] = useState('ALL');
  const [localService, setLocalService] = useState('ALL');
  const [localEventType, setLocalEventType] = useState('ALL');
  const [localSearch, setLocalSearch] = useState('');

  const currentLevel = isIncidentView && !setSelectedLevel ? localLevel : (selectedLevel || 'ALL');
  const setCurrentLevel = isIncidentView && !setSelectedLevel ? setLocalLevel : setSelectedLevel;

  const currentService = isIncidentView && !setSelectedService ? localService : (selectedService || 'ALL');
  const setCurrentService = isIncidentView && !setSelectedService ? setLocalService : setSelectedService;

  const currentEventType = isIncidentView && !setSelectedEventType ? localEventType : (selectedEventType || 'ALL');
  const setCurrentEventType = isIncidentView && !setSelectedEventType ? setLocalEventType : setSelectedEventType;

  const currentSearch = isIncidentView && !setSearchTerm ? localSearch : (searchTerm || '');
  const setCurrentSearch = isIncidentView && !setSearchTerm ? setLocalSearch : setSearchTerm;

  const levels = ['ALL', 'INFO', 'WARN', 'ERROR', 'DEBUG'];

  const servicesList = [
    'ALL',
    'User Service',
    'Authentication Service',
    'Product Service',
    'Inventory Service',
    'Order Service',
    'Payment Service',
    'Notification Service',
    'Search Service'
  ];

  const eventTypesList = [
    'ALL',
    'API_REQUEST',
    'API_RESPONSE',
    'DATABASE_QUERY',
    'DATABASE_ERROR',
    'CACHE_ACCESS',
    'CACHE_MISS',
    'AUTHENTICATION',
    'PAYMENT',
    'ORDER',
    'INVENTORY',
    'NOTIFICATION',
    'EXTERNAL_API',
    'SYSTEM'
  ];

  // Client-side filtering when in Incident View
  const displayedLogs = useMemo(() => {
    if (!isIncidentView) return logs;

    return logs.filter((log) => {
      const levelMatch = currentLevel === 'ALL' || (log.level || '').toUpperCase() === currentLevel;
      const sName = log.service_name || log.serviceName || 'System';
      const serviceMatch = currentService === 'ALL' || sName === currentService;
      const eType = log.event_type || log.eventType || 'SYSTEM';
      const typeMatch = currentEventType === 'ALL' || eType === currentEventType;

      const query = currentSearch.trim().toLowerCase();
      const searchMatch = !query ||
        (log.message || '').toLowerCase().includes(query) ||
        (log.request_id || log.requestId || '').toLowerCase().includes(query) ||
        sName.toLowerCase().includes(query) ||
        (log.endpoint || '').toLowerCase().includes(query);

      return levelMatch && serviceMatch && typeMatch && searchMatch;
    });
  }, [logs, isIncidentView, currentLevel, currentService, currentEventType, currentSearch]);

  const getServiceBadgeStyle = (service) => {
    switch (service) {
      case 'User Service': return 'bg-sky-950/80 text-sky-300 border-sky-800/60';
      case 'Authentication Service': return 'bg-purple-950/80 text-purple-300 border-purple-800/60';
      case 'Product Service': return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60';
      case 'Inventory Service': return 'bg-amber-950/80 text-amber-300 border-amber-800/60';
      case 'Order Service': return 'bg-indigo-950/80 text-indigo-300 border-indigo-800/60';
      case 'Payment Service': return 'bg-rose-950/80 text-rose-300 border-rose-800/60';
      case 'Notification Service': return 'bg-teal-950/80 text-teal-300 border-teal-800/60';
      case 'Search Service': return 'bg-cyan-950/80 text-cyan-300 border-cyan-800/60';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getEventTypeBadgeStyle = (eventType) => {
    switch (eventType) {
      case 'API_REQUEST':
      case 'API_RESPONSE': return 'bg-blue-950/80 text-blue-300';
      case 'DATABASE_QUERY': return 'bg-cyan-950/80 text-cyan-300';
      case 'DATABASE_ERROR': return 'bg-rose-950/80 text-rose-300 font-bold';
      case 'CACHE_ACCESS':
      case 'CACHE_MISS': return 'bg-amber-950/80 text-amber-300';
      case 'PAYMENT': return 'bg-emerald-950/80 text-emerald-300 font-bold';
      case 'AUTHENTICATION': return 'bg-purple-950/80 text-purple-300';
      default: return 'bg-slate-800 text-slate-300';
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-md flex flex-col h-full overflow-hidden">

      {/* Header & Filter Controls */}
      <div className="p-3 sm:p-3.5 border-b border-slate-800 flex flex-col xl:flex-row xl:items-center justify-between gap-3 bg-slate-900/90">
        <div className="flex flex-col">
          <h2 className="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider whitespace-nowrap">
            {isIncidentView ? 'Incident Log Trail' : 'Microservice Logs Explorer'}
          </h2>
          <span className="text-[11px] font-mono text-slate-400 font-medium">
            {isIncidentView ? `±1 Min Isolation Window • (${displayedLogs.length} records)` : `(${pagination.total || logs.length} records)`}
          </span>
        </div>

        {/* Filter Controls (Responsive Wrapping Layout) */}
        <div className="flex flex-wrap items-center gap-2 max-w-full">

          {/* Log Level Filter */}
          <div className="flex bg-slate-800 rounded-md border border-slate-700 overflow-x-auto text-xs shadow-xs shrink-0 max-w-full">
            {levels.map((lvl) => (
              <button
                key={lvl}
                onClick={() => { setCurrentLevel && setCurrentLevel(lvl); setPage && setPage(1); }}
                className={`px-2.5 py-1 font-semibold transition-colors ${currentLevel === lvl ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-700'
                  } ${lvl !== 'ALL' ? 'border-l border-slate-700' : ''}`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Service Filter Dropdown */}
          <select
            value={currentService}
            onChange={(e) => { setCurrentService && setCurrentService(e.target.value); setPage && setPage(1); }}
            className="px-2 py-1 text-xs font-mono border border-slate-700 rounded-md bg-slate-800 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs cursor-pointer grow sm:grow-0 max-w-[140px] truncate"
          >
            {servicesList.map(s => (
              <option key={s} value={s}>{s === 'ALL' ? 'All Services' : s}</option>
            ))}
          </select>

          {/* Event Type Filter Dropdown */}
          <select
            value={currentEventType}
            onChange={(e) => { setCurrentEventType && setCurrentEventType(e.target.value); setPage && setPage(1); }}
            className="px-2 py-1 text-xs font-mono border border-slate-700 rounded-md bg-slate-800 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs cursor-pointer grow sm:grow-0 max-w-[140px] truncate"
          >
            {eventTypesList.map(et => (
              <option key={et} value={et}>{et === 'ALL' ? 'All Event Types' : et}</option>
            ))}
          </select>

          {/* Search Input */}
          <input
            type="text"
            placeholder="Search logs / RequestID"
            value={currentSearch}
            onChange={(e) => { setCurrentSearch && setCurrentSearch(e.target.value); setPage && setPage(1); }}
            className="px-2.5 py-1 text-xs border border-slate-700 rounded-md bg-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full sm:w-44 font-mono shadow-xs shrink-0"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto max-h-[600px]">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider sticky top-0 z-10">
            <tr>
              <th className="py-3 px-3 w-40 font-medium">Timestamp</th>
              <th className="py-3 px-3 w-36 font-medium">Service Name</th>
              <th className="py-3 px-3 w-44 font-medium">Request ID</th>
              <th className="py-3 px-3 w-36 font-medium">Event Type</th>
              <th className="py-3 px-3 w-20 font-medium">Level</th>
              <th className="py-3 px-3 w-36 font-medium">Endpoint</th>
              <th className="py-3 px-3 font-medium">Message</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-slate-300 font-mono">
            {displayedLogs.length > 0 ? (
              displayedLogs.map((log, idx) => (
                <tr key={log.id ? `log-${log.id}` : `log-${log.timestamp}-${log.request_id || idx}`} className="hover:bg-slate-800/60 transition-colors">
                  <td className="py-2.5 px-3 whitespace-nowrap text-slate-400 text-[11px]">
                    {new Date(log.timestamp).toLocaleString([], {
                      month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'
                    })}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getServiceBadgeStyle(log.service_name || log.serviceName)}`}>
                      {log.service_name || log.serviceName || 'System'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <button
                      onClick={() => onTraceSelect && onTraceSelect(log.request_id || log.requestId)}
                      disabled={!onTraceSelect}
                      className={`px-2 py-0.5 rounded border text-[10px] font-bold font-mono transition-colors ${onTraceSelect
                          ? 'bg-indigo-950/80 border-indigo-800/80 text-indigo-300 hover:bg-indigo-900/80 cursor-pointer'
                          : 'bg-slate-800 border-slate-700 text-slate-300'
                        }`}
                      title={onTraceSelect ? "View Distributed Trace Waterfall" : ""}
                    >
                      {log.request_id || log.requestId || 'N/A'}
                    </button>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${getEventTypeBadgeStyle(log.event_type || log.eventType)}`}>
                      {log.event_type || log.eventType || 'SYSTEM'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      log.level === 'ERROR' ? 'bg-rose-950/80 text-rose-300 border-rose-800/60' :
                      log.level === 'WARN' ? 'bg-amber-950/80 text-amber-300 border-amber-800/60' :
                      log.level === 'INFO' ? 'bg-blue-950/80 text-blue-300 border-blue-800/60' :
                      'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {log.level}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap text-slate-400 text-[11px]">
                    {log.endpoint || '/api'}
                    {log.status_code && (
                      <span className={`ml-1 text-[10px] font-bold ${log.status_code >= 400 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        ({log.status_code})
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-slate-200 break-all leading-relaxed">
                    {log.message}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500 font-mono">
                  No incident logs found matching criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!isIncidentView && pagination.pages > 1 && (
        <div className="p-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs font-mono text-slate-400">
          <div>Page <span className="font-semibold text-slate-200">{page}</span> of {pagination.pages}</div>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              className="px-3 py-1 bg-slate-800 border border-slate-700 rounded text-slate-200 hover:bg-slate-700 disabled:opacity-50"
            >
              Prev
            </button>
            <button
              disabled={page >= pagination.pages}
              onClick={() => setPage(p => Math.min(p + 1, pagination.pages))}
              className="px-3 py-1 bg-slate-800 border border-slate-700 rounded text-slate-200 hover:bg-slate-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
