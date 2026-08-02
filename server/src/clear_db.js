import { pool } from './config/db.js';

(async () => {
  try {
    console.log('[Database Cleaner] 🧹 Truncating all old telemetry data from PostgreSQL database...');
    
    await pool.query(`
      TRUNCATE TABLE logs, system_metrics, service_metrics, incidents RESTART IDENTITY CASCADE;
    `);

    console.log('[Database Cleaner] ✨ All database tables (logs, system_metrics, service_metrics, incidents) truncated cleanly!');
  } catch (err) {
    console.error('[Database Cleaner] ❌ Error clearing database:', err.message);
  } finally {
    await pool.end();
    process.exit();
  }
})();
