import { pool } from '../config/db.js';

function calculatePercentile(sortedArray, percentile) {
  if (sortedArray.length === 0) return 0;
  const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
  return sortedArray[index];
}

export const startLatencyAggregator = () => {
  console.log('[Worker] P95/P99 Latency Aggregator started (60s interval).');
  
  setInterval(async () => {
    try {
      const now = new Date();
      const sixtySecondsAgo = new Date(now.getTime() - 60000);
      
      const logsRes = await pool.query(
        `SELECT service_name, level, response_time_ms FROM logs WHERE timestamp >= $1 AND timestamp <= $2`,
        [sixtySecondsAgo.toISOString(), now.toISOString()]
      );
      
      const logs = logsRes.rows;
      if (logs.length === 0) return;
      
      const serviceGroups = {};
      logs.forEach(log => {
        const s = log.service_name;
        if (!serviceGroups[s]) {
          serviceGroups[s] = { latencies: [], errorCount: 0, totalCount: 0 };
        }
        serviceGroups[s].latencies.push(parseFloat(log.response_time_ms) || 0);
        serviceGroups[s].totalCount++;
        if (log.level === 'ERROR') {
          serviceGroups[s].errorCount++;
        }
      });
      
      for (const [serviceName, data] of Object.entries(serviceGroups)) {
        if (data.totalCount === 0) continue;
        
        data.latencies.sort((a, b) => a - b);
        
        const avgLat = data.latencies.reduce((a, b) => a + b, 0) / data.totalCount;
        const p95 = calculatePercentile(data.latencies, 95);
        const p99 = calculatePercentile(data.latencies, 99);
        const errorRate = (data.errorCount / data.totalCount) * 100;
        
        await pool.query(
          `INSERT INTO service_metrics 
            (service_name, request_count, error_rate, avg_latency, p95_latency, p99_latency, timestamp) 
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            serviceName,
            data.totalCount,
            errorRate,
            avgLat,
            p95,
            p99,
            now.toISOString()
          ]
        );
      }
    } catch (err) {
      console.error('[Worker] Error aggregating latencies:', err.message);
    }
  }, 3000); // run every 1 minute
};
