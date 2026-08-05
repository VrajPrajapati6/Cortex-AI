import { pool } from '../config/db.js';

let intervalId;

export const startLogCleanupWorker = () => {
  // Run the cleanup every 30 seconds
  intervalId = setInterval(async () => {
    try {
      // Check the total number of logs
      const countRes = await pool.query('SELECT COUNT(*) FROM logs;');
      const count = parseInt(countRes.rows[0].count, 10);

      if (count > 1000) {
        // Delete all logs except the 1000 most recent ones
        await pool.query(`
          DELETE FROM logs
          WHERE id IN (
            SELECT id FROM logs
            ORDER BY created_at DESC
            OFFSET 1000
          );
        `);
        console.log(`[Worker] [Log Cleanup] Cleaned up old logs. Current count maintained at 1000.`);
      }
    } catch (error) {
      console.error('[Worker] [Log Cleanup] Failed to cleanup logs:', error.message);
    }
  }, 30000); // 30 seconds
};

export const stopLogCleanupWorker = () => {
  if (intervalId) clearInterval(intervalId);
};
