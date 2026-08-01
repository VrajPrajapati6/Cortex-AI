import { pool } from '../config/db.js';

export const getHealthData = async () => {
  const now = new Date();
  const fifteenMinsAgo = new Date(now.getTime() - 15 * 60000).toISOString();

  const currentMetricsRes = await pool.query(`
    WITH RankedMetrics AS (
      SELECT 
        service_name, request_count, error_rate, avg_latency, p95_latency,
        ROW_NUMBER() OVER(PARTITION BY service_name ORDER BY timestamp DESC) as rn
      FROM service_metrics
    )
    SELECT * FROM RankedMetrics WHERE rn = 1
  `);

  const baselineRes = await pool.query(`
    SELECT service_name, AVG(p95_latency) as baseline_p95
    FROM service_metrics
    WHERE timestamp >= $1
    GROUP BY service_name
  `, [fifteenMinsAgo]);

  const baselines = {};
  baselineRes.rows.forEach(r => baselines[r.service_name] = parseFloat(r.baseline_p95) || 0);

  return currentMetricsRes.rows.map(metric => {
    const errorRate = parseFloat(metric.error_rate) || 0;
    const p95 = parseFloat(metric.p95_latency) || 0;
    const baseline = baselines[metric.service_name] || p95 || 100;

    let healthStatus = 'HEALTHY';
    if (errorRate > 5 || p95 > baseline * 5) {
      healthStatus = 'CRITICAL';
    } else if (errorRate >= 1 || p95 > baseline * 2) {
      healthStatus = 'DEGRADED';
    }

    return {
      service_name: metric.service_name,
      request_count: metric.request_count,
      error_rate: errorRate,
      avg_latency: parseFloat(metric.avg_latency) || 0,
      p95_latency: p95,
      availability: Math.max(0, 100 - errorRate).toFixed(2),
      health_status: healthStatus,
      baseline_p95: baseline.toFixed(2)
    };
  });
};

export const getServiceHealth = async (req, res) => {
  try {
    const servicesHealth = await getHealthData();
    res.json(servicesHealth);
  } catch (err) {
    console.error('Error fetching service health:', err);
    res.status(500).json({ error: 'Failed to fetch service health' });
  }
};
