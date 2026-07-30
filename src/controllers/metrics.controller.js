import { pool } from '../config/db.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export const getMetrics = async (req, res, next) => {
  try {
    const { limit = 30 } = req.query;
    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 30, 1), 100);

    const query = `
      SELECT id, cpu_usage, memory_usage_mb, timestamp
      FROM system_metrics
      ORDER BY timestamp DESC
      LIMIT $1
    `;

    const result = await pool.query(query, [parsedLimit]);

    // Reverse to chronological order (oldest to newest for charts)
    const metrics = result.rows.reverse().map(m => ({
      id: m.id,
      cpuUsage: parseFloat(m.cpu_usage) || 0,
      memoryUsageMb: parseFloat(m.memory_usage_mb) || 0,
      timestamp: m.timestamp
    }));

    return res.status(200).json(
      new ApiResponse(200, 'Metrics retrieved successfully', {
        metrics,
        count: metrics.length
      })
    );
  } catch (error) {
    next(new ApiError(500, `Failed to fetch metrics: ${error.message}`));
  }
};
