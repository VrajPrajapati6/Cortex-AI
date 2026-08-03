import { pool } from './db.js';

export const initDb = async () => {
  try {
    console.log('[Database] Checking and initializing database schema...');

    // Enable pgvector extension
    await pool.query('CREATE EXTENSION IF NOT EXISTS vector;');

    // 1. logs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        request_id TEXT,
        span_id TEXT,
        parent_span_id TEXT,
        service_name TEXT,
        event_type TEXT,
        endpoint TEXT,
        status_code INTEGER,
        response_time_ms INTEGER,
        level TEXT NOT NULL,
        message TEXT NOT NULL,
        timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure columns exist if table was created in an earlier phase
    await pool.query(`
      ALTER TABLE logs 
      ADD COLUMN IF NOT EXISTS request_id TEXT,
      ADD COLUMN IF NOT EXISTS span_id TEXT,
      ADD COLUMN IF NOT EXISTS parent_span_id TEXT,
      ADD COLUMN IF NOT EXISTS service_name TEXT,
      ADD COLUMN IF NOT EXISTS event_type TEXT,
      ADD COLUMN IF NOT EXISTS endpoint TEXT,
      ADD COLUMN IF NOT EXISTS status_code INTEGER,
      ADD COLUMN IF NOT EXISTS response_time_ms INTEGER;
    `);

    // 2. system_metrics table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS system_metrics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        cpu_usage NUMERIC NOT NULL,
        memory_usage_mb NUMERIC NOT NULL,
        timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. service_metrics table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS service_metrics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        service_name VARCHAR(255) NOT NULL,
        request_count INT DEFAULT 0,
        error_rate DECIMAL(5, 2) DEFAULT 0.0,
        avg_latency FLOAT DEFAULT 0.0,
        p95_latency FLOAT DEFAULT 0.0,
        p99_latency FLOAT DEFAULT 0.0,
        timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. incidents table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS incidents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type TEXT NOT NULL,
        status TEXT NOT NULL,
        trigger_reason TEXT,
        resolution_reason TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMPTZ
      );
    `);

    // 5. runbooks table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS runbooks (
        id SERIAL PRIMARY KEY,
        service VARCHAR(255) NOT NULL,
        incident_type VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        embedding vector(3072)
      );
    `);

    console.log('[Database] ✅ Database tables initialized successfully.');
  } catch (error) {
    console.error('[Database] ❌ Error initializing database tables:', error.message);
  }
};
