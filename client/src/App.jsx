import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { MetricsCharts } from './components/MetricsCharts';
import { LogsTable } from './components/LogsTable';

export default function App() {
  const [summary, setSummary] = useState(null);
  const [metrics, setMetrics] = useState([]);
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [countdown, setCountdown] = useState(10);

  // Filters & Pagination State
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  const fetchDashboardData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // 1. Summary API
      const summaryRes = await fetch('/api/summary');
      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setSummary(summaryData.data);
      }

      // 2. Metrics API
      const metricsRes = await fetch('/api/metrics?limit=30');
      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setMetrics(metricsData.data.metrics || []);
      }

      // 3. Logs API
      const offset = (page - 1) * limit;
      const queryParams = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString()
      });

      if (selectedLevel && selectedLevel !== 'ALL') {
        queryParams.append('level', selectedLevel);
      }
      if (searchTerm.trim()) {
        queryParams.append('search', searchTerm.trim());
      }

      const logsRes = await fetch(`/api/logs?${queryParams.toString()}`);
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(logsData.data.logs || []);
        setPagination(logsData.data.pagination || {});
      }
    } catch (error) {
      console.error('Error fetching observability telemetry:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [selectedLevel, searchTerm, page, limit]);

  // Initial Fetch & Filter Trigger
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // 10-Second Auto Refresh Timer
  useEffect(() => {
    if (!autoRefresh) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchDashboardData();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefresh, fetchDashboardData]);

  const handleManualRefresh = () => {
    setCountdown(10);
    fetchDashboardData();
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans antialiased">
      {/* Top Navigation */}
      <Header
        systemStatus={summary?.systemStatus || 'OPERATIONAL'}
        lastUpdated={summary?.lastUpdated}
        autoRefresh={autoRefresh}
        setAutoRefresh={setAutoRefresh}
        countdown={countdown}
        onManualRefresh={handleManualRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Main Dashboard Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        
        {/* KPI Summary Cards */}
        <SummaryCards summary={summary} />

        {/* Recharts System Metrics */}
        <MetricsCharts metrics={metrics} />

        {/* Telemetry Logs Explorer */}
        <LogsTable
          logs={logs}
          pagination={pagination}
          selectedLevel={selectedLevel}
          setSelectedLevel={setSelectedLevel}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          page={page}
          setPage={setPage}
          limit={limit}
          setLimit={setLimit}
        />

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-4 px-4 text-center text-xs text-slate-500 font-mono">
        Cortex Telemetry Dashboard &bull; Live PostgreSQL Ingestion Engine &bull; Auto-refreshes every 10s
      </footer>
    </div>
  );
}
