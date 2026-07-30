import { pool } from '../config/db.js';
import { getActiveIncident, triggerIncident, resolveIncident } from '../utils/incidentManager.js';
import { getIO } from '../config/socket.js';

const logLevels = ['INFO', 'WARN', 'ERROR', 'DEBUG'];
const sampleMessages = [
  'User logged in successfully.',
  'Failed to process payment.',
  'Cache miss for key: user_profile.',
  'Database query took too long.',
  'New item added to cart.',
  'Invalid email format provided.',
  'Connected to third-party API.',
];

export const startLogGenerator = () => {
  console.log('[Worker] Log generator started (10s interval).');
  
  setInterval(async () => {
    const level = logLevels[Math.floor(Math.random() * logLevels.length)];
    const message = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
    const timestamp = new Date().toISOString();

    try {
      // 1. Insert Log
      await pool.query(
        'INSERT INTO logs (level, message, timestamp) VALUES ($1, $2, $3)',
        [level, message, timestamp]
      );
      console.log(`[Worker] Inserted log: [${level}] ${message}`);

      // 2. Incident Logic
      const activeIncident = await getActiveIncident(pool, 'LOG');

      let incidentChanged = false;
      if (level === 'ERROR' && !activeIncident) {
        await triggerIncident(pool, 'LOG', `Critical Log: [${level}] ${message}`);
        incidentChanged = true;
      } else if ((level === 'INFO' || level === 'DEBUG') && activeIncident) {
        await resolveIncident(pool, activeIncident.id, `Normal Log received: [${level}]`);
        incidentChanged = true;
      }

      const io = getIO();
      // Emit the new log to clients
      io.emit('new_log', { id: Math.random().toString(36).substring(7), level, message, timestamp });
      
      if (incidentChanged) {
        io.emit('incident_update');
      }

    } catch (error) {
      console.error('[Worker] Error inserting log into database:', error.message);
    }
  }, 10000);
};
