import { pool } from '../config/db.js';

export const getIncidents = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT * FROM incidents ORDER BY created_at DESC LIMIT 50`
    );
    res.status(200).json({ status: 'SUCCESS', data: { incidents: result.rows } });
  } catch (error) {
    next(error);
  }
};

export const getIncidentLogs = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // First, fetch the incident to get its time window
    const incidentResult = await pool.query(
      `SELECT created_at, resolved_at FROM incidents WHERE id = $1`,
      [id]
    );

    if (incidentResult.rows.length === 0) {
      return res.status(404).json({ status: 'ERROR', message: 'Incident not found' });
    }

    const incident = incidentResult.rows[0];
    
    // Calculate time window: 1 min before created_at to 1 min after resolved_at (or current time if active)
    const startTime = new Date(new Date(incident.created_at).getTime() - 60000).toISOString();
    const endTime = incident.resolved_at 
      ? new Date(new Date(incident.resolved_at).getTime() + 60000).toISOString()
      : new Date().toISOString();

    const logsResult = await pool.query(
      `SELECT * FROM logs WHERE timestamp >= $1 AND timestamp <= $2 ORDER BY timestamp ASC LIMIT 500`,
      [startTime, endTime]
    );

    res.status(200).json({ 
      status: 'SUCCESS', 
      data: { 
        logs: logsResult.rows,
        window: { startTime, endTime }
      } 
    });
  } catch (error) {
    next(error);
  }
};

export const getIncidentMetrics = async (req, res, next) => {
  try {
    const { id } = req.params;
    const incidentResult = await pool.query(
      `SELECT created_at, resolved_at FROM incidents WHERE id = $1`,
      [id]
    );

    if (incidentResult.rows.length === 0) {
      return res.status(404).json({ status: 'ERROR', message: 'Incident not found' });
    }

    const incident = incidentResult.rows[0];
    const startTime = new Date(new Date(incident.created_at).getTime() - 60000).toISOString();
    const endTime = incident.resolved_at 
      ? new Date(new Date(incident.resolved_at).getTime() + 60000).toISOString()
      : new Date().toISOString();

    const metricsResult = await pool.query(
      `SELECT * FROM system_metrics WHERE timestamp >= $1 AND timestamp <= $2 ORDER BY timestamp ASC LIMIT 500`,
      [startTime, endTime]
    );

    res.status(200).json({ 
      status: 'SUCCESS', 
      data: { 
        metrics: metricsResult.rows
      } 
    });
  } catch (error) {
    next(error);
  }
};
