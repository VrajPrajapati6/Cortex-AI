import { pool } from './config/db.js';
(async () => {
    try {
        await pool.query(`ALTER TABLE logs ADD COLUMN IF NOT EXISTS span_id UUID, ADD COLUMN IF NOT EXISTS parent_span_id UUID;`);
        console.log("DB altered");
    } catch (err) {
        console.error(err);
    }
    process.exit();
})();
