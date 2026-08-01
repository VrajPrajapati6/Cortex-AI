import { pool } from './config/db.js';

(async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS service_metrics (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                service_name VARCHAR(255) NOT NULL,
                request_count INT DEFAULT 0,
                error_rate DECIMAL(5, 2) DEFAULT 0.0,
                avg_latency FLOAT DEFAULT 0.0,
                p95_latency FLOAT DEFAULT 0.0,
                p99_latency FLOAT DEFAULT 0.0,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("service_metrics table created.");
    } catch (err) {
        console.error(err);
    }
    process.exit();
})();
