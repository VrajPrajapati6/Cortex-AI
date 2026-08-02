import { pool } from '../config/db.js';
import { getActiveIncident, triggerIncident, resolveIncident } from '../utils/incidentManager.js';
import { getIO } from '../config/socket.js';
import { scenarioEngine } from '../scenario/index.js';

export const startLogGenerator = () => {
  console.log('[Worker] Unified Scenario Log Generator started (10s interval).');
  
  setInterval(async () => {
    // Generate 2 request batches per 10s tick for rich steady-state telemetry
    const requestsCount = 2;
    
    for (let r = 0; r < requestsCount; r++) {
      const batch = scenarioEngine.generateRequestBatch();
      const requestId = batch.requestId;
      const computedSteps = batch.steps;

      let parentSpanId = null;
      const baseDate = new Date();

      for (const step of computedSteps) {
        const spanStartDate = new Date(baseDate.getTime() + step.startOffset);
        const timestamp = spanStartDate.toISOString();

        try {
          // 1. Insert Enriched Telemetry Log into PostgreSQL
          const insertRes = await pool.query(
            `INSERT INTO logs 
              (service_name, request_id, event_type, level, message, endpoint, status_code, response_time_ms, timestamp, span_id, parent_span_id) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
             RETURNING *`,
            [
              step.serviceName,
              requestId,
              step.eventType,
              step.level,
              step.message,
              step.endpoint,
              step.statusCode,
              step.responseTimeMs,
              timestamp,
              step.spanId,
              parentSpanId
            ]
          );

          const insertedLog = insertRes.rows[0];
          console.log(`[Worker] [${step.serviceName}] [${requestId}] [${step.responseTimeMs}ms] ${step.message}`);

          // Update parent for next step in execution chain
          parentSpanId = step.spanId;

          // 2. Incident Engine Evaluation: LOG
          const activeIncident = await getActiveIncident(pool, 'LOG');
          let incidentChanged = false;

          if (step.level === 'ERROR' && !activeIncident) {
            await triggerIncident(pool, 'LOG', `Critical Log [${step.serviceName}]: ${step.message}`);
            incidentChanged = true;
          } else if ((step.level === 'INFO' || step.level === 'DEBUG') && activeIncident) {
            await resolveIncident(pool, activeIncident.id, `Healthy Log received [${step.serviceName}]`);
            incidentChanged = true;
          }

          // 3. Emit Socket.io WebSocket Payload
          const io = getIO();
          io.emit('new_log', insertedLog);

          if (incidentChanged) {
            io.emit('incident_update');
          }

        } catch (error) {
          console.error('[Worker] Error inserting log into database:', error.message);
        }
      }
    }
  }, 10000);
};
