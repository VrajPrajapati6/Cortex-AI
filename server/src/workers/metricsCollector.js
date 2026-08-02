import { pool } from '../config/db.js';
import { getActiveIncident, triggerIncident, resolveIncident } from '../utils/incidentManager.js';
import { getIO } from '../config/socket.js';
import { scenarioEngine } from '../scenario/index.js';

export const startMetricsCollector = () => {
  console.log('[Worker] Unified Scenario Metrics Collector started (10s interval).');

  setInterval(async () => {
    // Obtain synthetic CPU & Memory metrics driven by active scenario state
    const state = scenarioEngine.getCurrentTelemetryState();
    const cpuUsage = state.cpuUsage;
    const memoryUsageMb = state.memoryUsageMb;
    const timestamp = state.timestamp;

    try {
      // 1. Insert Metrics into Database
      await pool.query(
        'INSERT INTO system_metrics (cpu_usage, memory_usage_mb, timestamp) VALUES ($1, $2, $3)',
        [cpuUsage, memoryUsageMb, timestamp]
      );
      console.log(`[Worker] [Scenario: ${state.scenarioName}] Inserted metrics: CPU ${cpuUsage}%, Mem ${memoryUsageMb}MB`);

      // 2. Incident Engine Evaluation: CPU (Threshold: >80%)
      const activeCpuIncident = await getActiveIncident(pool, 'CPU');
      let incidentChanged = false;
      
      if (cpuUsage > 80 && !activeCpuIncident) {
        await triggerIncident(pool, 'CPU', `High CPU Usage [${state.scenarioName}]: ${cpuUsage}%`);
        incidentChanged = true;
      } else if (cpuUsage < 50 && activeCpuIncident) {
        await resolveIncident(pool, activeCpuIncident.id, `CPU Usage normalized: ${cpuUsage}%`);
        incidentChanged = true;
      }

      // 3. Incident Engine Evaluation: Memory (Threshold: >8500MB ~ 85% footprint)
      const activeMemIncident = await getActiveIncident(pool, 'MEMORY');

      if (memoryUsageMb > 8500 && !activeMemIncident) {
        await triggerIncident(pool, 'MEMORY', `High Memory Usage [${state.scenarioName}]: ${memoryUsageMb}MB`);
        incidentChanged = true;
      } else if (memoryUsageMb < 6000 && activeMemIncident) {
        await resolveIncident(pool, activeMemIncident.id, `Memory Usage normalized: ${memoryUsageMb}MB`);
        incidentChanged = true;
      }

      // 4. Emit WebSockets Payload
      const io = getIO();
      io.emit('new_metrics', { cpu_usage: cpuUsage, memory_usage_mb: memoryUsageMb, timestamp });
      
      if (incidentChanged) {
        io.emit('incident_update');
      }

    } catch (error) {
      console.error('[Worker] Error inserting metrics into database:', error.message);
    }
  }, 10000);
};
