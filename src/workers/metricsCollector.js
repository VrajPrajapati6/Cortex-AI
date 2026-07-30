import os from 'os';
import { pool } from '../config/db.js';

export const startMetricsCollector = () => {
  console.log('[Worker] Metrics collector started (10s interval).');

  setInterval(async () => {
    // Calculate CPU Usage (simplified for a quick snapshot)
    const cpus = os.cpus();
    let totalIdle = 0, totalTick = 0;
    
    cpus.forEach(cpu => {
      for (let type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });

    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    const cpuUsage = 100 - ~~(100 * idle / total);

    // Calculate Memory Usage
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsageMb = (usedMemory / 1024 / 1024).toFixed(2);
    
    const timestamp = new Date().toISOString();

    try {
      await pool.query(
        'INSERT INTO system_metrics (cpu_usage, memory_usage_mb, timestamp) VALUES ($1, $2, $3)',
        [cpuUsage, memoryUsageMb, timestamp]
      );
      console.log(`[Worker] Inserted metrics: CPU ${cpuUsage}%, Mem ${memoryUsageMb}MB`);
    } catch (error) {
      console.error('[Worker] Error inserting metrics into database:', error.message);
    }
  }, 10000);
};
