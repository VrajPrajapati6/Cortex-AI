import { pool } from '../config/db.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export const getSummary = async (req, res, next) => {
  try {
    // 1. Total logs & count per level
    const logStatsQuery = `
      SELECT 
        COUNT(*) AS total_logs,
        COUNT(*) FILTER (WHERE level = 'INFO') AS info_count,
        COUNT(*) FILTER (WHERE level = 'WARN') AS warn_count,
        COUNT(*) FILTER (WHERE level = 'ERROR') AS error_count,
        COUNT(*) FILTER (WHERE level = 'DEBUG') AS debug_count
      FROM logs
    `;
    const logStatsRes = await pool.query(logStatsQuery);
    const logStats = logStatsRes.rows[0];

    const totalLogs = parseInt(logStats.total_logs, 10) || 0;
    const infoCount = parseInt(logStats.info_count, 10) || 0;
    const warnCount = parseInt(logStats.warn_count, 10) || 0;
    const errorCount = parseInt(logStats.error_count, 10) || 0;
    const debugCount = parseInt(logStats.debug_count, 10) || 0;

    const errorRate = totalLogs > 0 ? parseFloat(((errorCount / totalLogs) * 100).toFixed(1)) : 0;

    // 2. Metrics summary
    const latestMetricsQuery = `
      SELECT cpu_usage, memory_usage_mb, timestamp
      FROM system_metrics
      ORDER BY timestamp DESC
      LIMIT 1
    `;
    const latestMetricsRes = await pool.query(latestMetricsQuery);
    const latestMetric = latestMetricsRes.rows[0] || null;

    const avgMetricsQuery = `
      SELECT 
        AVG(cpu_usage) AS avg_cpu,
        AVG(memory_usage_mb) AS avg_mem,
        COUNT(*) AS total_metrics
      FROM (
        SELECT cpu_usage, memory_usage_mb
        FROM system_metrics
        ORDER BY timestamp DESC
        LIMIT 50
      ) sub
    `;
    const avgMetricsRes = await pool.query(avgMetricsQuery);
    const avgMetric = avgMetricsRes.rows[0] || {};

    const latestCpu = latestMetric ? parseFloat(latestMetric.cpu_usage) : 0;
    const latestMemoryMb = latestMetric ? parseFloat(latestMetric.memory_usage_mb) : 0;
    const avgCpu = avgMetric.avg_cpu ? parseFloat(parseFloat(avgMetric.avg_cpu).toFixed(1)) : 0;
    const avgMemoryMb = avgMetric.avg_mem ? parseFloat(parseFloat(avgMetric.avg_mem).toFixed(1)) : 0;
    const totalMetricsCount = parseInt(avgMetric.total_metrics, 10) || 0;

    // Determine System Health Status
    let systemStatus = 'OPERATIONAL';
    if (latestCpu > 85 || errorRate > 25) {
      systemStatus = 'CRITICAL';
    } else if (latestCpu > 70 || errorRate > 10 || warnCount > 15) {
      systemStatus = 'DEGRADED';
    }

    const summaryData = {
      systemStatus,
      totalLogs,
      logLevelBreakdown: {
        info: infoCount,
        warn: warnCount,
        error: errorCount,
        debug: debugCount
      },
      errorRate,
      latestMetrics: {
        cpuUsage: latestCpu,
        memoryUsageMb: latestMemoryMb,
        timestamp: latestMetric ? latestMetric.timestamp : null
      },
      averageMetrics: {
        cpuUsage: avgCpu,
        memoryUsageMb: avgMemoryMb
      },
      totalMetricsCount,
      lastUpdated: new Date().toISOString()
    };

    return res.status(200).json(
      new ApiResponse(200, 'Dashboard summary retrieved successfully', summaryData)
    );
  } catch (error) {
    next(new ApiError(500, `Failed to fetch summary: ${error.message}`));
  }
};
