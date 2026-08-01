import { pool } from '../config/db.js';
import { getActiveIncident, triggerIncident, resolveIncident } from '../utils/incidentManager.js';
import { getIO } from '../config/socket.js';
import crypto from 'crypto';

const requestFlowScenarios = [
  // Scenario 1: Order Placement Flow
  {
    name: 'Order Placement Flow',
    steps: [
      { serviceName: 'User Service', eventType: 'API_REQUEST', endpoint: '/api/v1/orders', level: 'INFO', message: 'Incoming POST request to place new order.', statusCode: 200, delayMs: 0 },
      { serviceName: 'Order Service', eventType: 'DATABASE_QUERY', endpoint: '/api/v1/orders', level: 'INFO', message: 'Executing SQL: INSERT INTO orders (user_id, total).', statusCode: 200, delayMs: 15 },
      { serviceName: 'Payment Service', eventType: 'PAYMENT', endpoint: '/api/v1/payments/charge', level: 'INFO', message: 'Processing credit card charge via payment gateway.', statusCode: 200, delayMs: 45 },
      { serviceName: 'Notification Service', eventType: 'NOTIFICATION', endpoint: '/api/v1/notifications/email', level: 'INFO', message: 'Order confirmation email queued for dispatch.', statusCode: 200, delayMs: 20 }
    ]
  },
  // Scenario 2: Payment Gateway Timeout Flow
  {
    name: 'Payment Gateway Timeout Flow',
    steps: [
      { serviceName: 'User Service', eventType: 'API_REQUEST', endpoint: '/api/v1/checkout', level: 'INFO', message: 'User initiated checkout process.', statusCode: 200, delayMs: 0 },
      { serviceName: 'Order Service', eventType: 'API_REQUEST', endpoint: '/api/v1/orders', level: 'INFO', message: 'User initiated order.', statusCode: 200, delayMs: 15 },
      { serviceName: 'Payment Service', eventType: 'EXTERNAL_API', endpoint: '/api/v1/payments/charge', level: 'ERROR', message: 'Payment gateway timeout after 5000ms: Connection refused.', statusCode: 504, delayMs: 120 },
      { serviceName: 'Order Service', eventType: 'ORDER', endpoint: '/api/v1/orders/cancel', level: 'ERROR', message: 'Order payment failed. Reverting inventory hold.', statusCode: 400, delayMs: 30 }
    ]
  },
  // Scenario 3: Database Propagation Flow
  {
    name: 'Database Propagation Flow',
    steps: [
      { serviceName: 'Order Service', eventType: 'API_REQUEST', endpoint: '/api/v1/orders', level: 'INFO', message: 'Order query.', statusCode: 200, delayMs: 0 },
      { serviceName: 'Payment Service', eventType: 'API_REQUEST', endpoint: '/api/v1/payments', level: 'INFO', message: 'Payment query.', statusCode: 200, delayMs: 15 },
      { serviceName: 'PostgreSQL', eventType: 'DATABASE_ERROR', endpoint: '/api/v1/db', level: 'ERROR', message: 'Database query took too long: Pool client acquisition timeout.', statusCode: 500, delayMs: 300 },
      { serviceName: 'Payment Service', eventType: 'EXTERNAL_API', endpoint: '/api/v1/payments/charge', level: 'ERROR', message: 'Payment failed due to db.', statusCode: 500, delayMs: 50 },
      { serviceName: 'Order Service', eventType: 'ORDER', endpoint: '/api/v1/orders/cancel', level: 'ERROR', message: 'Order failed due to payment.', statusCode: 500, delayMs: 30 }
    ]
  }
];

let requestCounter = 1;

export const startLogGenerator = () => {
  console.log('[Worker] Enriched Microservice Log generator started (10s interval).');
  
  setInterval(async () => {
    // Generate unique Request ID for this microservice request chain
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const reqNum = String(requestCounter++).padStart(6, '0');
    const requestId = `REQ-${dateStr}-${reqNum}`;

    // Select random scenario
    const scenario = requestFlowScenarios[Math.floor(Math.random() * requestFlowScenarios.length)];

    let parentSpanId = null;

    for (const step of scenario.steps) {
      const timestamp = new Date().toISOString();
      const responseTimeMs = step.delayMs + Math.floor(Math.random() * 25);
      const spanId = crypto.randomUUID();

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
            responseTimeMs,
            timestamp,
            spanId,
            parentSpanId
          ]
        );

        const insertedLog = insertRes.rows[0];
        console.log(`[Worker] [${step.serviceName}] [${requestId}] [${step.eventType}] [${step.level}] ${step.message}`);

        // Update parent for next step (simple chain propagation)
        parentSpanId = spanId;

        // 2. Incident Detection Evaluation
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
        io.emit('new_log', {
          id: insertedLog.id,
          service_name: step.serviceName,
          request_id: requestId,
          event_type: step.eventType,
          level: step.level,
          message: step.message,
          endpoint: step.endpoint,
          status_code: step.statusCode,
          response_time_ms: responseTimeMs,
          timestamp,
          span_id: spanId,
          parent_span_id: parentSpanId
        });

        if (incidentChanged) {
          io.emit('incident_update');
        }
      } catch (error) {
        console.error('[Worker] Error inserting enriched log into PostgreSQL:', error.message);
      }
    }
  }, 10000);
};
