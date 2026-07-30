import pg from 'pg';
import { config } from './env.config.js';

const { Pool } = pg;

if (!config.dbUrl) {
  console.warn('[Database] Missing DATABASE_URL in environment variables.');
}

export const pool = new Pool({
  connectionString: config.dbUrl || 'postgresql://user:password@localhost:5432/db',
  ssl: {
    rejectUnauthorized: false, // Required for Neon
  }
});
