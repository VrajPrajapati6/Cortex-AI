import { pool } from '../config/db.js';

export const getIncidents = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT * FROM incidents ORDER BY created_at DESC LIMIT 50`
    );
    res.status(200).json({ status: 'SUCCESS', data: { incidents: result.rows } });
  } catch (error) {
    next(error);
  }
};

export const getIncidentLogs = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const incidentResult = await pool.query(
      `SELECT created_at, resolved_at FROM incidents WHERE id = $1`,
      [id]
    );

    if (incidentResult.rows.length === 0) {
      return res.status(404).json({ status: 'ERROR', message: 'Incident not found' });
    }

    const incident = incidentResult.rows[0];
    const startTime = new Date(new Date(incident.created_at).getTime() - 60000).toISOString();
    const endTime = incident.resolved_at 
      ? new Date(new Date(incident.resolved_at).getTime() + 60000).toISOString()
      : new Date().toISOString();

    const logsResult = await pool.query(
      `SELECT * FROM logs WHERE timestamp >= $1 AND timestamp <= $2 ORDER BY timestamp ASC LIMIT 500`,
      [startTime, endTime]
    );

    res.status(200).json({ 
      status: 'SUCCESS', 
      data: { 
        logs: logsResult.rows,
        window: { startTime, endTime }
      } 
    });
  } catch (error) {
    next(error);
  }
};

export const getIncidentMetrics = async (req, res, next) => {
  try {
    const { id } = req.params;
    const incidentResult = await pool.query(
      `SELECT created_at, resolved_at FROM incidents WHERE id = $1`,
      [id]
    );

    if (incidentResult.rows.length === 0) {
      return res.status(404).json({ status: 'ERROR', message: 'Incident not found' });
    }

    const incident = incidentResult.rows[0];
    const startTime = new Date(new Date(incident.created_at).getTime() - 60000).toISOString();
    const endTime = incident.resolved_at 
      ? new Date(new Date(incident.resolved_at).getTime() + 60000).toISOString()
      : new Date().toISOString();

    const metricsResult = await pool.query(
      `SELECT * FROM system_metrics WHERE timestamp >= $1 AND timestamp <= $2 ORDER BY timestamp ASC LIMIT 500`,
      [startTime, endTime]
    );

    res.status(200).json({ 
      status: 'SUCCESS', 
      data: { 
        metrics: metricsResult.rows
      } 
    });
  } catch (error) {
    next(error);
  }
};

// Root Cause Analysis (RCA) Endpoint Controller
export const getIncidentRCA = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Fetch target incident
    const incidentRes = await pool.query(`SELECT * FROM incidents WHERE id = $1`, [id]);
    if (incidentRes.rows.length === 0) {
      return res.status(404).json({ status: 'ERROR', message: 'Incident not found' });
    }

    const incident = incidentRes.rows[0];

    // Calculate window: 1 minute before created_at to 1 minute after resolved_at / now
    const startTime = new Date(new Date(incident.created_at).getTime() - 60000).toISOString();
    const endTime = incident.resolved_at 
      ? new Date(new Date(incident.resolved_at).getTime() + 60000).toISOString()
      : new Date().toISOString();

    // Duration calculation
    const startMs = new Date(incident.created_at).getTime();
    const endMs = incident.resolved_at ? new Date(incident.resolved_at).getTime() : Date.now();
    const durationSeconds = Math.max(Math.round((endMs - startMs) / 1000), 1);
    
    const formatDuration = (secs) => {
      if (secs < 60) return `${secs} secs`;
      const mins = Math.floor(secs / 60);
      const remainingSecs = secs % 60;
      return `${mins}m ${remainingSecs}s`;
    };

    // 2. Fetch logs within incident window
    const logsRes = await pool.query(
      `SELECT * FROM logs WHERE timestamp >= $1 AND timestamp <= $2 ORDER BY timestamp ASC`,
      [startTime, endTime]
    );
    const logs = logsRes.rows;

    let errorCount = 0;
    let warnCount = 0;
    let infoCount = 0;
    let debugCount = 0;
    let firstErrorTimestamp = null;
    let lastErrorTimestamp = null;
    const errorFrequencyMap = {};

    logs.forEach((log) => {
      const lvl = (log.level || '').toUpperCase();
      if (lvl === 'ERROR') {
        errorCount++;
        if (!firstErrorTimestamp) firstErrorTimestamp = log.timestamp;
        lastErrorTimestamp = log.timestamp;
        errorFrequencyMap[log.message] = (errorFrequencyMap[log.message] || 0) + 1;
      } else if (lvl === 'WARN') {
        warnCount++;
      } else if (lvl === 'INFO') {
        infoCount++;
      } else if (lvl === 'DEBUG') {
        debugCount++;
      }
    });

    let mostFrequentError = null;
    let maxFreq = 0;
    Object.entries(errorFrequencyMap).forEach(([msg, count]) => {
      if (count > maxFreq) {
        maxFreq = count;
        mostFrequentError = { message: msg, count };
      }
    });

    // 3. Fetch system metrics within incident window
    const metricsRes = await pool.query(
      `SELECT * FROM system_metrics WHERE timestamp >= $1 AND timestamp <= $2 ORDER BY timestamp ASC`,
      [startTime, endTime]
    );
    const metrics = metricsRes.rows;

    let totalCpu = 0;
    let maxCpu = 0;
    let totalMem = 0;
    let maxMem = 0;
    let peakMetricTimestamp = null;

    metrics.forEach((m) => {
      const cpu = parseFloat(m.cpu_usage) || 0;
      const mem = parseFloat(m.memory_usage_mb) || 0;

      totalCpu += cpu;
      if (cpu > maxCpu) {
        maxCpu = cpu;
        peakMetricTimestamp = m.timestamp;
      }

      totalMem += mem;
      if (mem > maxMem) {
        maxMem = mem;
      }
    });

    const metricsCount = metrics.length;
    const avgCpu = metricsCount > 0 ? parseFloat((totalCpu / metricsCount).toFixed(1)) : 0;
    const avgMem = metricsCount > 0 ? parseFloat((totalMem / metricsCount).toFixed(1)) : 0;

    // 4. Derive Metadata by Incident Type
    let title = `${incident.type} System Exception`;
    let severity = 'MEDIUM';
    let affectedService = 'Backend Service';
    let relatedEndpoint = '/api/v1/service';

    if (incident.type === 'CPU') {
      title = 'High CPU Utilization Threshold Exceeded';
      severity = maxCpu > 90 ? 'CRITICAL' : 'HIGH';
      affectedService = 'Compute Cluster / CPU Subsystem';
      relatedEndpoint = 'N/A';
    } else if (incident.type === 'MEMORY') {
      title = 'Memory Resource Consumption Spike';
      severity = 'CRITICAL';
      affectedService = 'Memory Manager / Buffer Pool';
      relatedEndpoint = 'N/A';
    } else if (incident.type === 'LOG') {
      title = 'Critical Application Error & Exception Spike';
      severity = 'CRITICAL';
      affectedService = 'Backend Express Router';
      relatedEndpoint = '/api/v1/telemetry';
    }

    // 5. Reconstruct Chronological Incident Timeline
    const timeline = [];

    // Milestone 1: Window Start
    timeline.push({
      id: 'evt-1',
      timestamp: startTime,
      title: 'Telemetry Collection Window Initiated',
      type: 'INFO',
      description: 'System began tracking baseline logs and metrics 60 seconds prior to incident trigger.'
    });

    // Milestone 2: First Error (if available)
    if (firstErrorTimestamp) {
      timeline.push({
        id: 'evt-2',
        timestamp: firstErrorTimestamp,
        title: 'First Error Log Detected',
        type: 'ERROR',
        description: `Error log recorded: "${logs.find(l => l.timestamp === firstErrorTimestamp)?.message || 'Application Error'}"`
      });
    }

    // Milestone 3: Peak Metric (if CPU or Memory was high)
    if (peakMetricTimestamp && maxCpu > 50) {
      timeline.push({
        id: 'evt-3',
        timestamp: peakMetricTimestamp,
        title: `CPU Utilization Peak (${maxCpu}%)`,
        type: 'METRIC',
        description: `Compute usage reached peak load of ${maxCpu}% during incident window.`
      });
    }

    // Milestone 4: Incident Triggered
    timeline.push({
      id: 'evt-4',
      timestamp: incident.created_at,
      title: `Incident Triggered: ${incident.type}`,
      type: 'INCIDENT_TRIGGER',
      description: `Incident created due to: ${incident.trigger_reason}`
    });

    // Milestone 5: Incident Resolution (if resolved)
    if (incident.resolved_at) {
      timeline.push({
        id: 'evt-5',
        timestamp: incident.resolved_at,
        title: 'Incident Resolved',
        type: 'RESOLVED',
        description: `Incident automatically resolved: ${incident.resolution_reason || 'System metrics normalized'}`
      });
    }

    // Sort timeline chronologically
    timeline.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // 6. Generate Deterministic RCA Explanation Statement
    let rootCauseExplanation = '';
    if (incident.type === 'CPU') {
      rootCauseExplanation = `Incident was triggered by CPU usage exceeding operational safety threshold (${incident.trigger_reason}). Compute load peaked at ${maxCpu}% with average load of ${avgCpu}% over the ${formatDuration(durationSeconds)} incident window.`;
    } else if (incident.type === 'MEMORY') {
      rootCauseExplanation = `Incident was triggered by high memory allocation (${incident.trigger_reason}). System memory peaked at ${maxMem} MB with average allocation of ${avgMem} MB over ${formatDuration(durationSeconds)}.`;
    } else {
      rootCauseExplanation = `Incident was triggered by an application error spike (${incident.trigger_reason}). A total of ${errorCount} error logs were recorded. Most frequent error: "${mostFrequentError?.message || 'N/A'}" (${mostFrequentError?.count || 0} occurrences).`;
    }

    const rcaResponse = {
      incident: {
        id: incident.id,
        title,
        type: incident.type,
        severity,
        status: incident.status,
        startTime: incident.created_at,
        endTime: incident.resolved_at,
        duration: formatDuration(durationSeconds),
        durationSeconds,
        triggerReason: incident.trigger_reason,
        resolutionReason: incident.resolution_reason,
        affectedService,
        relatedEndpoint
      },
      logSummary: {
        totalRelatedLogs: logs.length,
        errorCount,
        warnCount,
        infoCount,
        debugCount,
        firstErrorTimestamp,
        lastErrorTimestamp,
        mostFrequentError
      },
      metricsSummary: {
        avgCpuUsage: avgCpu,
        maxCpuUsage: maxCpu,
        avgMemoryMb: avgMem,
        maxMemoryMb: maxMem,
        metricsCount
      },
      rootCauseExplanation,
      timeline,
      window: { startTime, endTime }
    };

    res.status(200).json({
      status: 'SUCCESS',
      data: rcaResponse
    });
  } catch (error) {
    next(error);
  }
};
