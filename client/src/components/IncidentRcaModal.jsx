import React, { useState, useEffect } from "react";
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
  ListFilter,
} from "lucide-react";
import { MetricsCharts } from "./MetricsCharts";
import { LogsTable } from "./LogsTable";
import { CortexCopilot } from "./CortexCopilot";
import { API_BASE_URL } from "../config/api.config";

export const IncidentRcaModal = ({
  incidentId,
  onClose,
  logs = [],
  metrics = [],
  onTraceSelect,
}) => {
  const [rcaData, setRcaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'logs' | 'metrics'

  useEffect(() => {
    if (!incidentId) return;

    let isMounted = true;
    setLoading(true);

    fetch(`${API_BASE_URL}/api/incidents/${incidentId}/rca`)
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json.status === "SUCCESS") {
          setRcaData(json.data);
        }
      })
      .catch((err) => console.error("Error fetching RCA data:", err))
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
    <>
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-md overflow-hidden flex flex-col mb-6 relative">
        {/* Floating Copilot AI */}
        <CortexCopilot
          incidentContext={{
            rootCauseService:
              rcaData?.causalGraph?.rootCause || incident?.affectedService,
            status: incident?.status,
          }}
        />

        {/* Top Banner Navigation */}
        <div className="bg-slate-950 text-white p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-all border border-slate-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Live Dashboard
            </button>
            <div className="h-4 w-px bg-slate-800" />
            <span className="text-xs text-slate-400 font-mono">
              Incident ID: {incidentId}
            </span>
          </div>

          {incident && (
            <div className="flex items-center gap-2">
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                  incident.status === "ACTIVE"
                    ? "bg-rose-950/80 text-rose-300 border border-rose-800/60"
                    : "bg-emerald-950/80 text-emerald-300 border border-emerald-800/60"
                }`}
              >
                {incident.status}
              </span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-slate-400 font-mono">
            Analyzing Root Cause Data & Generating Timeline...
          </div>
        ) : rcaData ? (
          <div className="p-3 sm:p-6">
            {/* Header & Badges */}
            <div className="mb-4 sm:mb-6 border-b border-slate-800 pb-3 sm:pb-4">
              <div className="flex flex-wrap items-center justify-between gap-2.5 mb-2">
                <h1 className="text-base sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 shrink-0" />
                  <span>{incident?.title}</span>
                </h1>
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 text-[11px] sm:text-xs font-semibold rounded-full bg-rose-950/80 text-rose-300 border border-rose-800/60">
                    {incident?.severity} Severity
                  </span>
                  <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 text-[11px] sm:text-xs font-semibold rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 font-mono">
                    Root Cause: {incident?.affectedService}
                  </span>
                  {incident?.primaryImpactedService &&
                    incident?.primaryImpactedService !==
                      incident?.affectedService && (
                      <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 text-[11px] sm:text-xs font-semibold rounded-full bg-amber-950/80 text-amber-300 border border-amber-800/60 font-mono">
                        Impacted: {incident?.primaryImpactedService}
                      </span>
                    )}
                  <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 text-[11px] sm:text-xs font-semibold rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                    Duration: {incident?.duration}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 mt-3 text-xs text-slate-400 font-mono">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">
                    Start: {new Date(incident?.startTime).toLocaleString()}
                  </span>
                </div>
                {incident?.endTime && (
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">
                      Resolved: {new Date(incident?.endTime).toLocaleString()}
                    </span>
                  </div>
                )}
                {incident?.relatedEndpoint !== "N/A" && (
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate">
                      Endpoint: {incident?.relatedEndpoint}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-1 sm:gap-2 border-b border-slate-800 mb-6">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
                  activeTab === "overview"
                    ? "border-indigo-500 text-indigo-400 font-bold"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                Root Cause & Timeline
              </button>
              <button
                onClick={() => setActiveTab("logs")}
                className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
                  activeTab === "logs"
                    ? "border-indigo-500 text-indigo-400 font-bold"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                Incident Logs ({logs.length})
              </button>
              <button
                onClick={() => setActiveTab("metrics")}
                className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
                  activeTab === "metrics"
                    ? "border-indigo-500 text-indigo-400 font-bold"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                Incident Metrics ({metrics.length})
              </button>
            </div>

            {/* TAB 1: OVERVIEW & RCA TIMELINE */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Primary RCA Explanation Card */}
                <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/60 shadow-md">
                  <div className="flex flex-col gap-4">
                    {/* Title & Confidence */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm tracking-wider">
                        <Zap className="w-5 h-5 text-indigo-400" />
                        Root Cause:{" "}
                        {rcaData?.causalGraph?.rootCause ||
                          incident?.affectedService}
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-indigo-400 font-semibold uppercase">
                          Confidence
                        </span>
                        <span className="text-2xl font-black font-mono text-indigo-200">
                          {rcaData?.causalGraph?.confidence || 0}%
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                      {/* Propagation Chain */}
                      <div>
                        <h3 className="text-xs font-semibold text-indigo-300 uppercase mb-3 border-b border-indigo-800/60 pb-1">
                          Propagation Chain
                        </h3>
                        <div className="flex flex-col gap-2 relative">
                          {rcaData?.causalGraph?.chain?.map((svc, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-indigo-400 z-10 relative"></div>
                              {idx < rcaData?.causalGraph?.chain.length - 1 && (
                                <div className="absolute left-1 top-2 bottom-0 w-0.5 bg-indigo-800 -ml-px"></div>
                              )}
                              <span className="text-sm font-mono font-semibold text-indigo-100">
                                {svc}
                              </span>
                            </div>
                          )) || (
                            <span className="text-sm text-indigo-400 italic">
                              No propagation detected
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Evidence */}
                      <div>
                        <h3 className="text-xs font-semibold text-indigo-300 uppercase mb-3 border-b border-indigo-800/60 pb-1">
                          Evidence
                        </h3>
                        <ul className="space-y-2 text-sm text-indigo-200">
                          {rcaData?.causalGraph?.evidence?.failedFirst && (
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />{" "}
                              Failed first in the incident window
                            </li>
                          )}
                          {rcaData?.causalGraph?.evidence
                            ?.upstreamOfAffected && (
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />{" "}
                              Upstream dependency of{" "}
                              {incident?.primaryImpactedService}
                            </li>
                          )}
                          {rcaData?.causalGraph?.evidence?.propagationCount >
                            0 && (
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />{" "}
                              Propagation observed in{" "}
                              {rcaData?.causalGraph?.evidence?.propagationCount}{" "}
                              requests
                            </li>
                          )}
                          {rcaData?.causalGraph?.evidence?.latencySpike && (
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />{" "}
                              Latency spike detected
                            </li>
                          )}
                          {rcaData?.causalGraph?.evidence?.errorCount > 0 && (
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />{" "}
                              {rcaData?.causalGraph?.evidence?.errorCount}{" "}
                              downstream failures followed
                            </li>
                          )}
                          {(!rcaData?.causalGraph?.evidence ||
                            (!rcaData.causalGraph.evidence.failedFirst &&
                              !rcaData.causalGraph.evidence.upstreamOfAffected &&
                              !(rcaData.causalGraph.evidence.propagationCount > 0) &&
                              !rcaData.causalGraph.evidence.latencySpike &&
                              !(rcaData.causalGraph.evidence.errorCount > 0))) && (
                            <li className="flex items-center gap-2 text-xs font-mono text-slate-300">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              <span>Evaluated from system metrics & telemetry baseline.</span>
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Incident Diff: Before vs During */}
                {rcaData?.incidentDiff && (
                  <div className="mb-6 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
                    <div className="bg-slate-950 border-b border-slate-800 px-4 py-2.5">
                      <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-slate-400" />
                        Before vs During Incident Impact (
                        {rcaData.causalGraph.rootCause})
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800">
                      {/* P95 Latency */}
                      <div className="p-4 flex flex-col gap-3">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center border-b border-slate-800 pb-2">
                          P95 Latency
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-xl font-bold font-mono text-white">
                              {rcaData.incidentDiff.baseline.p95_latency.toFixed(
                                0,
                              )}{" "}
                              ms
                            </span>
                            <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                              Baseline
                            </span>
                          </div>

                          {(() => {
                            const base =
                              rcaData.incidentDiff.baseline.p95_latency;
                            const during =
                              rcaData.incidentDiff.during.p95_latency;
                            const delta =
                              base > 0 ? ((during - base) / base) * 100 : 0;
                            const isDegraded = delta > 0;
                            return (
                              <div
                                className={`px-2 py-1 rounded text-xs font-bold font-mono border flex items-center ${isDegraded ? "bg-rose-950/80 text-rose-300 border-rose-800/60" : "bg-emerald-950/80 text-emerald-300 border-emerald-800/60"}`}
                              >
                                {delta > 0 ? "+" : ""}
                                {delta.toFixed(1)}%
                              </div>
                            );
                          })()}

                          <div className="flex flex-col items-end">
                            <span className="text-xl font-bold font-mono text-white">
                              {rcaData.incidentDiff.during.p95_latency.toFixed(
                                0,
                              )}{" "}
                              ms
                            </span>
                            <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                              During
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Error Rate */}
                      <div className="p-4 flex flex-col gap-3 bg-slate-900/50">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center border-b border-slate-800 pb-2">
                          Error Rate
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-xl font-bold font-mono text-white">
                              {rcaData.incidentDiff.baseline.error_rate.toFixed(
                                1,
                              )}
                              %
                            </span>
                            <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                              Baseline
                            </span>
                          </div>

                          {(() => {
                            const base =
                              rcaData.incidentDiff.baseline.error_rate;
                            const during =
                              rcaData.incidentDiff.during.error_rate;
                            const delta = during - base; // absolute delta for percentages
                            const isDegraded = delta > 0;
                            return (
                              <div
                                className={`px-2 py-1 rounded text-xs font-bold font-mono border flex items-center ${isDegraded ? "bg-rose-950/80 text-rose-300 border-rose-800/60" : "bg-emerald-950/80 text-emerald-300 border-emerald-800/60"}`}
                              >
                                {delta > 0 ? "+" : ""}
                                {delta.toFixed(1)}%
                              </div>
                            );
                          })()}

                          <div className="flex flex-col items-end">
                            <span className="text-xl font-bold font-mono text-white">
                              {rcaData.incidentDiff.during.error_rate.toFixed(
                                1,
                              )}
                              %
                            </span>
                            <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                              During
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Request Volume */}
                      <div className="p-4 flex flex-col gap-3">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center border-b border-slate-800 pb-2">
                          Request Volume
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-xl font-bold font-mono text-white">
                              {rcaData.incidentDiff.baseline.request_rate.toFixed(
                                0,
                              )}{" "}
                              <span className="text-sm font-normal text-slate-500">
                                req/m
                              </span>
                            </span>
                            <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                              Baseline
                            </span>
                          </div>

                          {(() => {
                            const base =
                              rcaData.incidentDiff.baseline.request_rate;
                            const during =
                              rcaData.incidentDiff.during.request_rate;
                            const delta =
                              base > 0 ? ((during - base) / base) * 100 : 0;
                            const isDegraded = delta < -10; // 10% drop is degraded
                            return (
                              <div
                                className={`px-2 py-1 rounded text-xs font-bold font-mono border flex items-center ${isDegraded ? "bg-rose-950/80 text-rose-300 border-rose-800/60" : "bg-slate-800 text-slate-300 border-slate-700"}`}
                              >
                                {delta > 0 ? "+" : ""}
                                {delta.toFixed(1)}%
                              </div>
                            );
                          })()}

                          <div className="flex flex-col items-end">
                            <span className="text-xl font-bold font-mono text-white">
                              {rcaData.incidentDiff.during.request_rate.toFixed(
                                0,
                              )}{" "}
                              <span className="text-sm font-normal text-slate-500">
                                req/m
                              </span>
                            </span>
                            <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                              During
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Diagnostic Key Telemetry Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Total Logs & Errors */}
                  <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/80">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="text-xs font-semibold uppercase">
                        Incident Logs
                      </span>
                      <FileText className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="text-xl font-bold font-mono text-white">
                      {logSummary?.totalRelatedLogs}
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-1 flex gap-2">
                      <span className="text-rose-400 font-semibold">
                        {logSummary?.errorCount} errors
                      </span>
                      <span>{logSummary?.warnCount} warnings</span>
                    </div>
                  </div>

                  {/* Peak CPU */}
                  <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/80">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="text-xs font-semibold uppercase">
                        Peak CPU Load
                      </span>
                      <Cpu className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="text-xl font-bold font-mono text-white">
                      {metricsSummary?.maxCpuUsage}%
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-1">
                      Avg load: {metricsSummary?.avgCpuUsage}%
                    </div>
                  </div>

                  {/* Peak Memory */}
                  <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/80">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="text-xs font-semibold uppercase">
                        Peak Memory
                      </span>
                      <HardDrive className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="text-xl font-bold font-mono text-white">
                      {metricsSummary?.maxMemoryMb} MB
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-1">
                      Avg mem: {metricsSummary?.avgMemoryMb} MB
                    </div>
                  </div>

                  {/* Most Frequent Error */}
                  <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/80">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="text-xs font-semibold uppercase">
                        Frequent Error
                      </span>
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="text-xs font-semibold text-slate-200 truncate">
                      {logSummary?.mostFrequentError?.message ||
                        "None recorded"}
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-1">
                      {logSummary?.mostFrequentError
                        ? `${logSummary.mostFrequentError.count} occurrences`
                        : "0 occurrences"}
                    </div>
                  </div>
                </div>

                {/* Chronological Incident Timeline */}
                <div className="border border-slate-800 rounded-xl p-5 bg-slate-900">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <ListFilter className="w-4 h-4 text-indigo-400" />
                    Chronological Incident Event Timeline
                  </h3>

                  <div className="relative pl-6 border-l-2 border-slate-800 space-y-6">
                    {timeline.map((evt, idx) => (
                      <div key={evt.id || idx} className="relative group">
                        {/* Timeline Dot Icon */}
                        <div
                          className={`absolute -left-[31px] top-0.5 h-4 w-4 rounded-full border-2 bg-slate-900 flex items-center justify-center ${
                            evt.type === "INCIDENT_TRIGGER"
                              ? "border-rose-500 text-rose-500"
                              : evt.type === "RESOLVED"
                                ? "border-emerald-500 text-emerald-500"
                                : evt.type === "ERROR"
                                  ? "border-rose-400 text-rose-400"
                                  : evt.type === "METRIC"
                                    ? "border-cyan-500 text-cyan-500"
                                    : "border-slate-600 text-slate-400"
                          }`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className="text-xs font-bold text-slate-200">
                            {evt.title}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">
                            {new Date(evt.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 font-mono leading-relaxed">
                          {evt.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: INCIDENT LOGS */}
            {activeTab === "logs" && (
              <LogsTable
                logs={logs}
                isIncidentView={true}
                onTraceSelect={onTraceSelect}
              />
            )}

            {/* TAB 3: INCIDENT METRICS */}
            {activeTab === "metrics" && <MetricsCharts metrics={metrics} />}
          </div>
        ) : null}
      </div>
    </>
  );
};
