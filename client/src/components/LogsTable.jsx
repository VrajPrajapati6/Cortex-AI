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
      case 'User Service': return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Authentication Service': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Product Service': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Inventory Service': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Order Service': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Payment Service': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Notification Service': return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Search Service': return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getEventTypeBadgeStyle = (eventType) => {
    switch (eventType) {
      case 'API_REQUEST':
      case 'API_RESPONSE': return 'bg-blue-50 text-blue-700';
      case 'DATABASE_QUERY': return 'bg-cyan-50 text-cyan-700';
      case 'DATABASE_ERROR': return 'bg-rose-100 text-rose-800 font-bold';
      case 'CACHE_ACCESS':
      case 'CACHE_MISS': return 'bg-amber-50 text-amber-700';
      case 'PAYMENT': return 'bg-emerald-50 text-emerald-700 font-bold';
      case 'AUTHENTICATION': return 'bg-purple-50 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden">
      
      {/* Header & Filter Controls */}
      <div className="p-4 border-b border-gray-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gray-50">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">
            {isIncidentView ? 'Incident Log Trail (±1 Min Window)' : 'Microservice Logs Explorer'}
          </h2>
          <span className="text-xs font-mono text-gray-500">
            ({isIncidentView ? displayedLogs.length : (pagination.total || logs.length)} records)
          </span>
        </div>

        {/* Filter Controls (Supported in both Global and Incident views) */}
        <div className="flex items-center gap-3 flex-wrap">
          
          {/* Log Level Filter */}
          <div className="flex bg-white rounded-md border border-gray-300 overflow-hidden text-xs">
            {levels.map((lvl) => (
              <button
                key={lvl}
                onClick={() => { setCurrentLevel && setCurrentLevel(lvl); setPage && setPage(1); }}
                className={`px-2.5 py-1.5 font-medium transition-colors ${
                  currentLevel === lvl ? 'bg-blue-600 text-white font-bold' : 'text-gray-600 hover:bg-gray-50'
                } ${lvl !== 'ALL' ? 'border-l border-gray-200' : ''}`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Service Filter Dropdown */}
          <select
            value={currentService}
            onChange={(e) => { setCurrentService && setCurrentService(e.target.value); setPage && setPage(1); }}
            className="px-2.5 py-1.5 text-xs font-mono border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {servicesList.map(s => (
              <option key={s} value={s}>{s === 'ALL' ? 'All Services' : s}</option>
            ))}
          </select>

          {/* Event Type Filter Dropdown */}
          <select
            value={currentEventType}
            onChange={(e) => { setCurrentEventType && setCurrentEventType(e.target.value); setPage && setPage(1); }}
            className="px-2.5 py-1.5 text-xs font-mono border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {eventTypesList.map(et => (
              <option key={et} value={et}>{et === 'ALL' ? 'All Event Types' : et}</option>
            ))}
          </select>

          {/* Search Input */}
          <input
            type="text"
            placeholder="Search logs / Request ID..."
            value={currentSearch}
            onChange={(e) => { setCurrentSearch && setCurrentSearch(e.target.value); setPage && setPage(1); }}
            className="px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 w-44 font-mono"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto max-h-[600px]">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-white border-b border-gray-200 text-gray-500 font-mono text-[11px] uppercase tracking-wider sticky top-0 z-10">
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
          <tbody className="divide-y divide-gray-100 text-gray-700 font-mono">
            {displayedLogs.length > 0 ? (
              displayedLogs.map((log) => (
                <tr key={log.id || Math.random()} className="hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 px-3 whitespace-nowrap text-gray-500 text-[11px]">
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
                      className={`px-2 py-0.5 rounded border text-[10px] font-bold font-mono transition-colors ${
                        onTraceSelect 
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 cursor-pointer' 
                          : 'bg-gray-100 border-gray-300 text-gray-800'
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
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.level === 'ERROR' ? 'bg-red-100 text-red-700' :
                      log.level === 'WARN' ? 'bg-yellow-100 text-yellow-800' :
                      log.level === 'INFO' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {log.level}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap text-gray-600 text-[11px]">
                    {log.endpoint || '/api'}
                    {log.status_code && (
                      <span className={`ml-1 text-[10px] font-bold ${log.status_code >= 400 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        ({log.status_code})
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-gray-900 break-all leading-relaxed">
                    {log.message}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500 font-mono">
                  No incident logs found matching criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!isIncidentView && pagination.pages > 1 && (
        <div className="p-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs font-mono text-gray-600">
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
