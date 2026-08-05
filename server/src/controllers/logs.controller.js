import { pool } from '../config/db.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export const getLogs = async (req, res, next) => {
  try {
    const { level, service_name, request_id, event_type, search, limit = 50, offset = 0 } = req.query;

    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);
    const parsedOffset = Math.max(parseInt(offset, 10) || 0, 0);

    const conditions = [];
    const values = [];

    if (level && level.toUpperCase() !== 'ALL') {
      values.push(level.toUpperCase());
      conditions.push(`level = $${values.length}`);
    }

    if (service_name && service_name.trim() !== '' && service_name.toUpperCase() !== 'ALL') {
      values.push(service_name.trim());
      conditions.push(`service_name = $${values.length}`);
    }

    if (request_id && request_id.trim() !== '') {
      values.push(request_id.trim());
      conditions.push(`request_id = $${values.length}`);
    }

    if (event_type && event_type.trim() !== '' && event_type.toUpperCase() !== 'ALL') {
      values.push(event_type.trim());
      conditions.push(`event_type = $${values.length}`);
    }

    if (search && search.trim() !== '') {
      values.push(`%${search.trim()}%`);
      conditions.push(`(message ILIKE $${values.length} OR request_id ILIKE $${values.length} OR service_name ILIKE $${values.length})`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*) FROM logs ${whereClause}`;
    const countResult = await pool.query(countQuery, values);
    const totalLogs = parseInt(countResult.rows[0].count, 10);

    const query = `
      SELECT 
        id, 
        service_name, 
        request_id, 
        event_type, 
        level, 
        message, 
        endpoint, 
        status_code, 
        response_time_ms, 
        timestamp
      FROM logs
      ${whereClause}
      ORDER BY timestamp DESC, id DESC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;

    const queryValues = [...values, parsedLimit, parsedOffset];
    const logsResult = await pool.query(query, queryValues);

    return res.status(200).json(
      new ApiResponse(200, 'Logs retrieved successfully', {
        logs: logsResult.rows,
        pagination: {
          total: totalLogs,
          limit: parsedLimit,
          offset: parsedOffset,
          page: Math.floor(parsedOffset / parsedLimit) + 1,
          pages: Math.ceil(totalLogs / parsedLimit) || 1
        }
      })
    );
  } catch (error) {
    next(new ApiError(500, `Failed to fetch logs: ${error.message}`));
  }
};
