import { pool } from '../config/db.js';

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
      await pool.query(
        'INSERT INTO logs (level, message, timestamp) VALUES ($1, $2, $3)',
        [level, message, timestamp]
      );
      console.log(`[Worker] Inserted log: [${level}] ${message}`);
    } catch (error) {
      console.error('[Worker] Error inserting log into database:', error.message);
    }
  }, 10000);
};
