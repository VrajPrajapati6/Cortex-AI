export const getActiveIncident = async (pool, type) => {
  const result = await pool.query(
    `SELECT * FROM incidents WHERE status = 'ACTIVE' AND type = $1 ORDER BY created_at DESC LIMIT 1`,
    [type]
  );
  return result.rows[0];
};

export const triggerIncident = async (pool, type, reason) => {
  console.log(`[Incident Manager] 🚨 Triggering new ${type} incident. Reason: ${reason}`);
  const result = await pool.query(
    `INSERT INTO incidents (type, status, trigger_reason, created_at) VALUES ($1, 'ACTIVE', $2, NOW()) RETURNING *`,
    [type, reason]
  );
  return result.rows[0];
};

export const resolveIncident = async (pool, incidentId, reason) => {
  console.log(`[Incident Manager] ✅ Resolving incident ${incidentId}. Reason: ${reason}`);
  await pool.query(
    `UPDATE incidents SET status = 'RESOLVED', resolved_at = NOW(), resolution_reason = $1 WHERE id = $2`,
    [reason, incidentId]
  );
};
