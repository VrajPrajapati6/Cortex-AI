import { pool } from '../config/db.js';
import { getActiveIncident, triggerIncident, resolveIncident } from '../utils/incidentManager.js';
import { getIO } from '../config/socket.js';

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
      { serviceName: 'Payment Service', eventType: 'EXTERNAL_API', endpoint: '/api/v1/payments/charge', level: 'ERROR', message: 'Payment gateway timeout after 5000ms: Connection refused.', statusCode: 504, delayMs: 120 },
      { serviceName: 'Order Service', eventType: 'ORDER', endpoint: '/api/v1/orders/cancel', level: 'WARN', message: 'Order payment failed. Reverting inventory hold.', statusCode: 400, delayMs: 30 }
    ]
  },
  // Scenario 3: Product Search & Cache Miss Flow
  {
    name: 'Search & Cache Miss Flow',
    steps: [
      { serviceName: 'Search Service', eventType: 'API_REQUEST', endpoint: '/api/v1/search', level: 'INFO', message: 'Search query executing: query="laptop".', statusCode: 200, delayMs: 0 },
      { serviceName: 'Product Service', eventType: 'CACHE_MISS', endpoint: '/api/v1/products', level: 'WARN', message: 'Cache miss for key: product_catalog_laptop. Falling back to DB.', statusCode: 200, delayMs: 25 },
      { serviceName: 'Product Service', eventType: 'DATABASE_QUERY', endpoint: '/api/v1/products', level: 'INFO', message: 'Executing database query for catalog items.', statusCode: 200, delayMs: 85 }
    ]
  },
  // Scenario 4: Authentication Exception Flow
  {
    name: 'Authentication Exception Flow',
    steps: [
      { serviceName: 'Authentication Service', eventType: 'AUTHENTICATION', endpoint: '/api/v1/auth/login', level: 'WARN', message: 'Invalid credentials provided for user payload.', statusCode: 401, delayMs: 0 },
      { serviceName: 'User Service', eventType: 'SYSTEM', endpoint: '/api/v1/users/lockout', level: 'INFO', message: 'Failed attempt logged for IP 192.168.1.45.', statusCode: 401, delayMs: 10 }
    ]
  },
  // Scenario 5: Database Timeout Flow
  {
    name: 'Database Timeout Flow',
    steps: [
      { serviceName: 'Inventory Service', eventType: 'API_REQUEST', endpoint: '/api/v1/inventory/check', level: 'INFO', message: 'Inventory lookup for item SKU-88492.', statusCode: 200, delayMs: 0 },
      { serviceName: 'Inventory Service', eventType: 'DATABASE_ERROR', endpoint: '/api/v1/inventory/check', level: 'ERROR', message: 'Database query took too long: Pool client acquisition timeout.', statusCode: 500, delayMs: 300 }
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

    for (const step of scenario.steps) {
      const timestamp = new Date().toISOString();
      const responseTimeMs = step.delayMs + Math.floor(Math.random() * 25);

      try {
        // 1. Insert Enriched Telemetry Log into PostgreSQL
        const insertRes = await pool.query(
          `INSERT INTO logs 
            (service_name, request_id, event_type, level, message, endpoint, status_code, response_time_ms, timestamp) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
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
            timestamp
          ]
        );

        const insertedLog = insertRes.rows[0];
        console.log(`[Worker] [${step.serviceName}] [${requestId}] [${step.eventType}] [${step.level}] ${step.message}`);

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
          timestamp
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
