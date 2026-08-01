import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  HardDrive, 
  FileText, 
  ArrowLeft, 
  Activity, 
  Zap, 
  AlertOctagon, 
  Info, 
  ListFilter 
} from 'lucide-react';
import { MetricsCharts } from './MetricsCharts';
import { LogsTable } from './LogsTable';

export const IncidentRcaModal = ({ incidentId, onClose, logs = [], metrics = [] }) => {
  const [rcaData, setRcaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'logs' | 'metrics'

  useEffect(() => {
    if (!incidentId) return;

    let isMounted = true;
    setLoading(true);

    fetch(`http://localhost:5000/api/incidents/${incidentId}/rca`)
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json.status === 'SUCCESS') {
          setRcaData(json.data);
        }
      })
      .catch((err) => console.error('Error fetching RCA data:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [incidentId]);

  if (!incidentId) return null;

  const incident = rcaData?.incident;
  const logSummary = rcaData?.logSummary;
  const metricsSummary = rcaData?.metricsSummary;
  const timeline = rcaData?.timeline || [];

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col mb-6">
      
      {/* Top Banner Navigation */}
      <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Live Dashboard
          </button>
          <div className="h-4 w-px bg-slate-700" />
          <span className="text-xs text-slate-400 font-mono">Incident ID: {incidentId}</span>
        </div>

        {incident && (
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
              incident.status === 'ACTIVE' 
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            }`}>
              {incident.status}
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="p-12 text-center text-sm text-gray-500 font-mono">
          Analyzing Root Cause Data & Generating Timeline...
        </div>
      ) : rcaData ? (
        <div className="p-6">
          
          {/* Header & Badges */}
          <div className="mb-6 border-b border-gray-100 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-rose-500" />
                {incident?.title}
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-800">
                  {incident?.severity} Severity
                </span>
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800 font-mono">
                  Root Cause: {incident?.affectedService}
                </span>
                {incident?.primaryImpactedService && incident?.primaryImpactedService !== incident?.affectedService && (
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800 font-mono">
                    Impacted: {incident?.primaryImpactedService}
                  </span>
                )}
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 font-mono">
                  Duration: {incident?.duration}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 text-xs text-gray-600 font-mono">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span>Start: {new Date(incident?.startTime).toLocaleString()}</span>
              </div>
              {incident?.endTime && (
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Resolved: {new Date(incident?.endTime).toLocaleString()}</span>
                </div>
              )}
              {incident?.relatedEndpoint !== 'N/A' && (
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Endpoint: {incident?.relatedEndpoint}</span>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'overview'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Root Cause & Timeline
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'logs'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Incident Logs ({logs.length})
            </button>
            <button
              onClick={() => setActiveTab('metrics')}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'metrics'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Incident Metrics ({metrics.length})
            </button>
          </div>

          {/* TAB 1: OVERVIEW & RCA TIMELINE */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Primary RCA Explanation Card */}
              <div className="p-4 rounded-lg bg-indigo-50/70 border border-indigo-200">
                <div className="flex flex-col gap-4">
                  {/* Title & Confidence */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm tracking-wider">
                      <Zap className="w-5 h-5 text-indigo-600" />
                      Root Cause: {rcaData?.causalGraph?.rootCause || incident?.affectedService}
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-indigo-700 font-semibold uppercase">Confidence</span>
                      <span className="text-2xl font-black font-mono text-indigo-900">{rcaData?.causalGraph?.confidence || 0}%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                    {/* Propagation Chain */}
                    <div>
                      <h3 className="text-xs font-semibold text-indigo-800 uppercase mb-3 border-b border-indigo-200 pb-1">Propagation Chain</h3>
                      <div className="flex flex-col gap-2 relative">
                        {rcaData?.causalGraph?.chain?.map((svc, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 z-10 relative"></div>
                            {idx < rcaData?.causalGraph?.chain.length - 1 && (
                              <div className="absolute left-1 top-2 bottom-0 w-0.5 bg-indigo-200 -ml-px"></div>
                            )}
                            <span className="text-sm font-mono font-semibold text-indigo-950">{svc}</span>
                          </div>
                        )) || (
                          <span className="text-sm text-indigo-600 italic">No propagation detected</span>
                        )}
                      </div>
                    </div>

                    {/* Evidence */}
                    <div>
                      <h3 className="text-xs font-semibold text-indigo-800 uppercase mb-3 border-b border-indigo-200 pb-1">Evidence</h3>
                      <ul className="space-y-2 text-sm text-indigo-900">
                        {rcaData?.causalGraph?.evidence?.failedFirst && (
                          <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Failed first in the incident window</li>
                        )}
                        {rcaData?.causalGraph?.evidence?.upstreamOfAffected && (
                          <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Upstream dependency of {incident?.primaryImpactedService}</li>
                        )}
                        {rcaData?.causalGraph?.evidence?.propagationCount > 0 && (
                          <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Propagation observed in {rcaData?.causalGraph?.evidence?.propagationCount} requests</li>
                        )}
                        {rcaData?.causalGraph?.evidence?.latencySpike && (
                          <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Latency spike detected</li>
                        )}
                        {rcaData?.causalGraph?.evidence?.errorCount > 0 && (
                          <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> {rcaData?.causalGraph?.evidence?.errorCount} downstream failures followed</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Diagnostic Key Telemetry Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Total Logs & Errors */}
                <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between text-gray-500 mb-1">
                    <span className="text-xs font-semibold uppercase">Incident Logs</span>
                    <FileText className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div className="text-xl font-bold font-mono text-gray-900">
                    {logSummary?.totalRelatedLogs}
                  </div>
                  <div className="text-xs text-gray-500 font-mono mt-1 flex gap-2">
                    <span className="text-rose-600 font-semibold">{logSummary?.errorCount} errors</span>
                    <span>{logSummary?.warnCount} warnings</span>
                  </div>
                </div>

                {/* Peak CPU */}
                <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between text-gray-500 mb-1">
                    <span className="text-xs font-semibold uppercase">Peak CPU Load</span>
                    <Cpu className="w-4 h-4 text-cyan-500" />
                  </div>
                  <div className="text-xl font-bold font-mono text-gray-900">
                    {metricsSummary?.maxCpuUsage}%
                  </div>
                  <div className="text-xs text-gray-500 font-mono mt-1">
                    Avg load: {metricsSummary?.avgCpuUsage}%
                  </div>
                </div>

                {/* Peak Memory */}
                <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between text-gray-500 mb-1">
                    <span className="text-xs font-semibold uppercase">Peak Memory</span>
                    <HardDrive className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className="text-xl font-bold font-mono text-gray-900">
                    {metricsSummary?.maxMemoryMb} MB
                  </div>
                  <div className="text-xs text-gray-500 font-mono mt-1">
                    Avg mem: {metricsSummary?.avgMemoryMb} MB
                  </div>
                </div>

                {/* Most Frequent Error */}
                <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between text-gray-500 mb-1">
                    <span className="text-xs font-semibold uppercase">Frequent Error</span>
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-xs font-semibold text-gray-900 truncate">
                    {logSummary?.mostFrequentError?.message || 'None recorded'}
                  </div>
                  <div className="text-xs text-gray-500 font-mono mt-1">
                    {logSummary?.mostFrequentError ? `${logSummary.mostFrequentError.count} occurrences` : '0 occurrences'}
                  </div>
                </div>

              </div>

              {/* Chronological Incident Timeline */}
              <div className="border border-gray-200 rounded-lg p-5 bg-white">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <ListFilter className="w-4 h-4 text-indigo-600" />
                  Chronological Incident Event Timeline
                </h3>

                <div className="relative pl-6 border-l-2 border-gray-200 space-y-6">
                  {timeline.map((evt, idx) => (
                    <div key={evt.id || idx} className="relative group">
                      
                      {/* Timeline Dot Icon */}
                      <div className={`absolute -left-[31px] top-0.5 h-4 w-4 rounded-full border-2 bg-white flex items-center justify-center ${
                        evt.type === 'INCIDENT_TRIGGER' ? 'border-rose-500 text-rose-500' :
                        evt.type === 'RESOLVED' ? 'border-emerald-500 text-emerald-500' :
                        evt.type === 'ERROR' ? 'border-rose-400 text-rose-400' :
                        evt.type === 'METRIC' ? 'border-cyan-500 text-cyan-500' :
                        'border-gray-400 text-gray-400'
                      }`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-xs font-bold text-gray-900">{evt.title}</span>
                        <span className="text-[11px] font-mono text-gray-500">
                          {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5 font-mono leading-relaxed">
                        {evt.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: INCIDENT LOGS */}
          {activeTab === 'logs' && (
            <LogsTable logs={logs} isIncidentView={true} />
          )}

          {/* TAB 3: INCIDENT METRICS */}
          {activeTab === 'metrics' && (
            <MetricsCharts metrics={metrics} />
          )}

        </div>
      ) : null}

    </div>
  );
};
