import React, { useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import { Header } from "./components/Header";
import { SummaryCards } from "./components/SummaryCards";
import { MetricsCharts } from "./components/MetricsCharts";
import { LogsTable } from "./components/LogsTable";
import { IncidentsList } from "./components/IncidentsList";
import { IncidentRcaModal } from "./components/IncidentRcaModal";
import ServiceHealthMap from "./components/ServiceHealthMap";
import TopologyGraph from "./components/TopologyGraph";
import { TraceExplorerModal } from "./components/TraceExplorerModal";

const socket = io("http://localhost:5000");

export default function App() {
  const [summary, setSummary] = useState(null);
  const [metrics, setMetrics] = useState([]);
  const [logs, setLogs] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [pagination, setPagination] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [selectedIncidentId, setSelectedIncidentId] = useState(null);
  const [selectedTraceId, setSelectedTraceId] = useState(null);

  // Filters & Pagination State
  const [selectedLevel, setSelectedLevel] = useState("ALL");
  const [selectedService, setSelectedService] = useState("ALL");
  const [selectedEventType, setSelectedEventType] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  const fetchDashboardData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Always fetch incidents list
      const incRes = await fetch("http://localhost:5000/api/incidents");
      if (incRes.ok) {
        const incData = await incRes.json();
        setIncidents(incData.data.incidents || []);
      }

      if (selectedIncidentId) {
        // Fetch incident-specific logs
        const incLogsRes = await fetch(
          `http://localhost:5000/api/incidents/${selectedIncidentId}/logs`,
        );
        if (incLogsRes.ok) {
          const logsData = await incLogsRes.json();
          setLogs(logsData.data.logs || []);
        }

        // Fetch incident-specific metrics
        const incMetricsRes = await fetch(
          `http://localhost:5000/api/incidents/${selectedIncidentId}/metrics`,
        );
        if (incMetricsRes.ok) {
          const metricsData = await incMetricsRes.json();
          setMetrics(metricsData.data.metrics || []);
        }
      } else {
        // Fetch global summary
        const summaryRes = await fetch("http://localhost:5000/api/summary");
        if (summaryRes.ok) {
          const summaryData = await summaryRes.json();
          setSummary(summaryData.data);
        }

        // Fetch global metrics
        const metricsRes = await fetch(
          "http://localhost:5000/api/metrics?limit=30",
        );
        if (metricsRes.ok) {
          const metricsData = await metricsRes.json();
          setMetrics(metricsData.data.metrics || []);
        }

        // Fetch global logs with enriched metadata filters
        const offset = (page - 1) * limit;
        const queryParams = new URLSearchParams({
          limit: limit.toString(),
          offset: offset.toString(),
        });

        if (selectedLevel && selectedLevel !== "ALL")
          queryParams.append("level", selectedLevel);
        if (selectedService && selectedService !== "ALL")
          queryParams.append("service_name", selectedService);
        if (selectedEventType && selectedEventType !== "ALL")
          queryParams.append("event_type", selectedEventType);
        if (searchTerm.trim()) queryParams.append("search", searchTerm.trim());

        const logsRes = await fetch(
          `http://localhost:5000/api/logs?${queryParams.toString()}`,
        );
        if (logsRes.ok) {
          const logsData = await logsRes.json();
          setLogs(logsData.data.logs || []);
          setPagination(logsData.data.pagination || {});
        }
      }
    } catch (error) {
      console.error("Error fetching telemetry:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [
    selectedLevel,
    selectedService,
    selectedEventType,
    searchTerm,
    page,
    limit,
    selectedIncidentId,
  ]);

  // Initial Data Fetch
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Real-time WebSocket Listeners
  useEffect(() => {
    const handleNewLog = (newLog) => {
      if (!selectedIncidentId && page === 1) {
        const matchesLevel =
          selectedLevel === "ALL" || newLog.level === selectedLevel;
        const matchesService =
          selectedService === "ALL" || newLog.service_name === selectedService;
        const matchesType =
          selectedEventType === "ALL" ||
          newLog.event_type === selectedEventType;

        if (matchesLevel && matchesService && matchesType) {
          setLogs((prev) => [newLog, ...prev].slice(0, limit));
        }
      }
      setSummary((prev) => {
        if (!prev) return prev;
        const isError = newLog.level === "ERROR";
        const newTotalLogs = (prev.totalLogs || 0) + 1;
        const newErrorCount =
          (prev.logLevelBreakdown?.error || 0) + (isError ? 1 : 0);
        return {
          ...prev,
          totalLogs: newTotalLogs,
          errorRate:
            newTotalLogs > 0
              ? Math.round((newErrorCount / newTotalLogs) * 100)
              : 0,
          logLevelBreakdown: {
            ...prev.logLevelBreakdown,
            [(newLog.level || "").toLowerCase()]:
              (prev.logLevelBreakdown?.[(newLog.level || "").toLowerCase()] ||
                0) + 1,
          },
        };
      });
    };

    const handleNewMetrics = (newMetric) => {
      if (!selectedIncidentId) {
        setMetrics((prev) => [...prev, newMetric].slice(-30));
      }
      setSummary((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          latestMetrics: {
            cpuUsage: newMetric.cpu_usage,
            memoryUsageMb: newMetric.memory_usage_mb,
          },
        };
      });
    };

    const handleIncidentUpdate = () => {
      fetchDashboardData();
    };

    socket.on("new_log", handleNewLog);
    socket.on("new_metrics", handleNewMetrics);
    socket.on("incident_update", handleIncidentUpdate);

    return () => {
      socket.off("new_log", handleNewLog);
      socket.off("new_metrics", handleNewMetrics);
      socket.off("incident_update", handleIncidentUpdate);
    };
  }, [
    selectedIncidentId,
    page,
    limit,
    selectedLevel,
    selectedService,
    selectedEventType,
    fetchDashboardData,
  ]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans">
      <Header
        systemStatus={
          summary?.systemStatus ||
          (incidents.some((i) => i.status === "ACTIVE")
            ? "CRITICAL"
            : "OPERATIONAL")
        }
        lastUpdated={summary?.lastUpdated}
        isRefreshing={isRefreshing}
        onManualRefresh={fetchDashboardData}
      />

      <main className="flex-1 w-full max-w-screen-2xl mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar: Incidents */}
        <div className="w-80 flex-shrink-0 hidden md:block sticky top-6 h-[calc(100vh-120px)]">
          <IncidentsList
            incidents={incidents}
            selectedIncidentId={selectedIncidentId}
            onSelect={setSelectedIncidentId}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedIncidentId ? (
            /* Root Cause Analysis (RCA) Incident Panel */
            <IncidentRcaModal
              incidentId={selectedIncidentId}
              onClose={() => setSelectedIncidentId(null)}
              logs={logs}
              metrics={metrics}
              onTraceSelect={setSelectedTraceId}
            />
          ) : (
            /* Normal Live Monitoring View */
            <>
              <SummaryCards summary={summary} />

              <ServiceHealthMap />
              <TopologyGraph />

              <div className="mb-6">
                <MetricsCharts metrics={metrics} />
              </div>

              <div className="flex-1">
                <LogsTable
                  logs={logs}
                  pagination={pagination}
                  selectedLevel={selectedLevel}
                  setSelectedLevel={setSelectedLevel}
                  selectedService={selectedService}
                  setSelectedService={setSelectedService}
                  selectedEventType={selectedEventType}
                  setSelectedEventType={setSelectedEventType}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  page={page}
                  setPage={setPage}
                  limit={limit}
                  setLimit={setLimit}
                  isIncidentView={false}
                  onTraceSelect={setSelectedTraceId}
                />
              </div>
            </>
          )}
        </div>
      </main>

      {selectedTraceId && (
        <TraceExplorerModal 
          requestId={selectedTraceId} 
          onClose={() => setSelectedTraceId(null)} 
        />
      )}
    </div>
  );
}
