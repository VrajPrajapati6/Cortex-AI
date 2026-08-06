import { pool } from "../config/db.js";
import { getIO } from "../config/socket.js";

let intervalId;

export const startLogCleanupWorker = () => {
  // Check total log count every 180 seconds
  intervalId = setInterval(async () => {
    try {
      // Check total log count in the database
      const countRes = await pool.query("SELECT COUNT(*) FROM logs;");
      const count = parseInt(countRes.rows[0].count, 10);

      // When total logs exceed 1000, delete oldest excess logs to retain fresh 1000 logs
      if (count > 1000) {
        const deleteRes = await pool.query(`
          DELETE FROM logs
          WHERE id NOT IN (
            SELECT id FROM logs
            ORDER BY timestamp DESC, id DESC
            LIMIT 1000
          );
        `);

        if (deleteRes.rowCount > 0) {
          console.log(
            `[Worker] [DB Cleanup] 🧹 Log threshold exceeded (${count} > 1000). Deleted ${deleteRes.rowCount} oldest log(s). Retained 1000 fresh logs.`
          );

          // Delete incidents whose associated logs have been pruned
          const deleteIncidentsRes = await pool.query(`
            DELETE FROM incidents
            WHERE created_at < (SELECT MIN(timestamp) FROM logs);
          `);

          if (deleteIncidentsRes.rowCount > 0) {
            console.log(
              `[Worker] [DB Cleanup] 🧹 Deleted ${deleteIncidentsRes.rowCount} incident(s) with no remaining logs.`
            );
          }

          // Notify frontend clients via WebSocket so UI updates live without refresh
          try {
            getIO().emit("logs_pruned");
            getIO().emit("incident_update");
          } catch (sockErr) {
            // Socket might not be initialized yet on startup
          }
        }
      }
    } catch (error) {
      console.error(
        "[Worker] [DB Cleanup] Error during cleanup check:",
        error.message
      );
    }
  }, 180000); // 180s check interval
};

export const stopLogCleanupWorker = () => {
  if (intervalId) clearInterval(intervalId);
};
