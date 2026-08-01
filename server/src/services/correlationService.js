import { pool } from '../config/db.js';

export async function getWindowLogs(start, end) {
  const result = await pool.query(
    `
    SELECT *
    FROM logs
    WHERE timestamp BETWEEN $1 AND $2
    ORDER BY timestamp ASC
    `,
    [start, end]
  );

  return result.rows;
}

export function groupByRequest(logs) {
  const groups = {};

  for (const log of logs) {
    if (!log.request_id) continue;
    if (!groups[log.request_id]) groups[log.request_id] = [];
    groups[log.request_id].push(log);
  }

  return groups;
}
