import { pool } from '../config/db.js';

export const getTraceByRequestId = async (req, res) => {
  try {
    const { requestId } = req.params;

    const result = await pool.query(
      `SELECT * FROM logs 
       WHERE request_id = $1 
       ORDER BY timestamp ASC`,
      [requestId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Trace not found for the given request ID.' });
    }

    const spans = result.rows.map(row => {
      const startTime = new Date(row.timestamp).getTime();
      const endTime = startTime + row.response_time_ms;
      return {
        id: row.id,
        span_id: row.span_id,
        parent_span_id: row.parent_span_id,
        service_name: row.service_name,
        endpoint: row.endpoint,
        event_type: row.event_type,
        level: row.level,
        status_code: row.status_code,
        message: row.message,
        response_time_ms: row.response_time_ms,
        start_time: startTime,
        end_time: endTime,
        timestamp: row.timestamp
      };
    });

    // Build hierarchical tree
    const spanMap = {};
    spans.forEach(span => {
      span.children = [];
      spanMap[span.span_id] = span;
    });

    const roots = [];
    spans.forEach(span => {
      if (span.parent_span_id && spanMap[span.parent_span_id]) {
        spanMap[span.parent_span_id].children.push(span);
      } else {
        roots.push(span);
      }
    });

    res.json({
      request_id: requestId,
      total_spans: spans.length,
      trace_tree: roots,
      flat_spans: spans
    });

  } catch (error) {
    console.error('Error fetching trace:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
