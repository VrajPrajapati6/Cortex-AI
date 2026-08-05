import { pool } from '../config/db.js';
import { scenarioState } from '../scenario/scenario.state.js';
import { getIO } from '../config/socket.js';

let intervalId;

export const startLogCleanupWorker = () => {
  // Check total log count every 30 seconds
  intervalId = setInterval(async () => {
    try {
      // Check total log count in the database
      const countRes = await pool.query('SELECT COUNT(*) FROM logs;');
      const count = parseInt(countRes.rows[0].count, 10);

      // When total logs reach or exceed 2000, wipe all transient runtime data
      if (count >= 1000) {
        // Truncate all runtime/transient data tables in one atomic transaction
        // runbooks table is NOT touched - it stores static RAG vector embeddings
        await pool.query(`
          TRUNCATE TABLE logs, system_metrics, service_metrics, incidents RESTART IDENTITY;
        `);

        // Reset scenario engine: restart request counter and transition workflow from 0
        scenarioState.requestCounter = 1;
        scenarioState.forceTransition();

        // Notify connected WebSocket clients to refresh their UI dashboards
        try {
          getIO().emit('incident_update');
        } catch (sockErr) {
          // Socket might not be initialized yet on first boot - safe to ignore
        }

        console.log(`[Worker] [DB Cleanup] 🧹 Log threshold hit (${count} >= 1000). Wiped logs, system_metrics, service_metrics, incidents. Workflow restarted from 0.`);
      }
    } catch (error) {
      console.error('[Worker] [DB Cleanup] Error during cleanup check:', error.message);
    }
  }, 30000); // 30s check interval (production-friendly, low DB load)
};

export const stopLogCleanupWorker = () => {
  if (intervalId) clearInterval(intervalId);
};
