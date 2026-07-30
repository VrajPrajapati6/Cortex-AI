import os from 'os';
import { pool } from '../config/db.js';
import { getActiveIncident, triggerIncident, resolveIncident } from '../utils/incidentManager.js';
import { getIO } from '../config/socket.js';

let previousCpuTimes = null;

const getCpuTimes = () => {
  const cpus = os.cpus();
  let totalIdle = 0, totalTick = 0;
  cpus.forEach(cpu => {
    for (let type in cpu.times) {
      totalTick += cpu.times[type];
    }
    totalIdle += cpu.times.idle;
  });
  return { idle: totalIdle, total: totalTick };
};

export const startMetricsCollector = () => {
  console.log('[Worker] Metrics collector started (10s interval).');

  // Seed the previous reading so the first tick calculates correctly
  previousCpuTimes = getCpuTimes();

  setInterval(async () => {
    // Calculate Real-Time CPU Usage
    const currentCpuTimes = getCpuTimes();
    
    const idleDifference = currentCpuTimes.idle - previousCpuTimes.idle;
    const totalDifference = currentCpuTimes.total - previousCpuTimes.total;
    
    let cpuUsage = 100 - ~~(100 * idleDifference / totalDifference);
    if (cpuUsage < 0) cpuUsage = 0;
    if (isNaN(cpuUsage)) cpuUsage = 0;

    previousCpuTimes = currentCpuTimes;

    // Calculate Memory Usage
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsageMb = (usedMemory / 1024 / 1024).toFixed(2);
    
    const timestamp = new Date().toISOString();

    try {
      // 1. Insert Metrics
      await pool.query(
        'INSERT INTO system_metrics (cpu_usage, memory_usage_mb, timestamp) VALUES ($1, $2, $3)',
        [cpuUsage, memoryUsageMb, timestamp]
      );
      console.log(`[Worker] Inserted metrics: CPU ${cpuUsage}%, Mem ${memoryUsageMb}MB`);

      // 2. Incident Logic: CPU
      const activeCpuIncident = await getActiveIncident(pool, 'CPU');
      let incidentChanged = false;
      
      if (cpuUsage > 80 && !activeCpuIncident) {
        await triggerIncident(pool, 'CPU', `High CPU Usage: ${cpuUsage}%`);
        incidentChanged = true;
      } else if (cpuUsage < 50 && activeCpuIncident) {
        await resolveIncident(pool, activeCpuIncident.id, `CPU Usage normalized: ${cpuUsage}%`);
        incidentChanged = true;
      }

      // 3. Incident Logic: Memory (Threshold: >90% total memory)
      const memoryUsagePercent = (usedMemory / totalMemory) * 100;
      const activeMemIncident = await getActiveIncident(pool, 'MEMORY');

      if (memoryUsagePercent > 90 && !activeMemIncident) {
        await triggerIncident(pool, 'MEMORY', `High Memory Usage: ${memoryUsageMb}MB (${memoryUsagePercent.toFixed(1)}%)`);
        incidentChanged = true;
      } else if (memoryUsagePercent < 70 && activeMemIncident) {
        await resolveIncident(pool, activeMemIncident.id, `Memory Usage normalized: ${memoryUsageMb}MB (${memoryUsagePercent.toFixed(1)}%)`);
        incidentChanged = true;
      }

      const io = getIO();
      // Emit the new metrics to clients
      io.emit('new_metrics', { cpu_usage: cpuUsage, memory_usage_mb: memoryUsageMb, timestamp });
      
      if (incidentChanged) {
        io.emit('incident_update');
      }

    } catch (error) {
      console.error('[Worker] Error inserting metrics into database:', error.message);
    }
  }, 10000);
};
