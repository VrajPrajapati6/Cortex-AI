/**
 * Scenario Registry - Workflow-Specific Scenario Definitions with Layer 3 Parameterization Matrix
 *
 * Defines explicit telemetry specs and Layer 3 Parameterization Matrix for offline simulation:
 * - retryCount
 * - queueLength
 * - databaseState ('HEALTHY', 'SLOW', 'EXHAUSTED')
 * - cacheState ('HIT', 'MISS_STORM', 'EVICT')
 * - networkState ('OPTIMAL', 'JITTER', 'CONGESTED')
 * - externalApiState ('HEALTHY', 'SLOW', 'DOWN')
 */

export const SCENARIOS = {
  // --- 1. ORDER_PLACEMENT WORKFLOW SCENARIOS ---
  HEALTHY_CHECKOUT: {
    id: 'HEALTHY_CHECKOUT',
    workflowId: 'ORDER_PLACEMENT',
    name: 'Healthy Order Checkout',
    type: 'HEALTHY',
    severity: 'INFO',
    affectedServices: [],
    rootCauseService: 'NONE',
    metrics: {
      cpuMin: 18,
      cpuMax: 32,
      memoryMbMin: 3800,
      memoryMbMax: 5200,
      latencyMinMs: 15,
      latencyMaxMs: 45,
      failureProbability: 0.0,
      requestVolumeMin: 120,
      requestVolumeMax: 200
    },
    params: {
      retryCountMin: 0, retryCountMax: 0,
      queueLengthMin: 5, queueLengthMax: 25,
      databaseState: 'HEALTHY',
      cacheState: 'HIT',
      networkState: 'OPTIMAL',
      externalApiState: 'HEALTHY'
    },
    logTemplates: [
      { serviceName: 'User Service', eventType: 'API_REQUEST', endpoint: '/api/v1/checkout', level: 'INFO', message: 'Incoming POST request to place new order.', statusCode: 200, delayMs: 0 },
      { serviceName: 'Order Service', eventType: 'DATABASE_QUERY', endpoint: '/api/v1/orders', level: 'INFO', message: 'Executing SQL: INSERT INTO orders (user_id, total).', statusCode: 200, delayMs: 15 },
      { serviceName: 'Payment Service', eventType: 'PAYMENT', endpoint: '/api/v1/payments/charge', level: 'INFO', message: 'Processing credit card charge via payment gateway.', statusCode: 200, delayMs: 35 },
      { serviceName: 'Notification Service', eventType: 'NOTIFICATION', endpoint: '/api/v1/notifications/email', level: 'INFO', message: 'Order confirmation email queued for dispatch.', statusCode: 200, delayMs: 20 }
    ]
  },
  CPU_RUNAWAY_SPIKE: {
    id: 'CPU_RUNAWAY_SPIKE',
    workflowId: 'ORDER_PLACEMENT',
    name: 'Order Processing CPU Runaway',
    type: 'DEGRADED',
    severity: 'WARN',
    affectedServices: ['Order Service'],
    rootCauseService: 'Order Service',
    metrics: {
      cpuMin: 82,
      cpuMax: 95,
      memoryMbMin: 4800,
      memoryMbMax: 5800,
      latencyMinMs: 1200,
      latencyMaxMs: 2400,
      failureProbability: 0.15,
      requestVolumeMin: 140,
      requestVolumeMax: 220
    },
    params: {
      retryCountMin: 1, retryCountMax: 3,
      queueLengthMin: 45, queueLengthMax: 120,
      databaseState: 'SLOW',
      cacheState: 'HIT',
      networkState: 'OPTIMAL',
      externalApiState: 'HEALTHY'
    },
    logTemplates: [
      { serviceName: 'User Service', eventType: 'API_REQUEST', endpoint: '/api/v1/orders', level: 'INFO', message: 'Incoming POST request to place new order.', statusCode: 200, delayMs: 0 },
      { serviceName: 'Order Service', eventType: 'SYSTEM', endpoint: '/api/v1/orders/calculate', level: 'WARN', message: 'High CPU utilization during discount matrix calculation.', statusCode: 200, delayMs: 180 },
      { serviceName: 'Payment Service', eventType: 'PAYMENT', endpoint: '/api/v1/payments/charge', level: 'INFO', message: 'Processing credit card charge via payment gateway.', statusCode: 200, delayMs: 40 }
    ]
  },
  INVENTORY_HOLD_FAILURE: {
    id: 'INVENTORY_HOLD_FAILURE',
    workflowId: 'ORDER_PLACEMENT',
    name: 'Inventory Reserve Hold Out of Stock',
    type: 'FAILURE',
    severity: 'ERROR',
    affectedServices: ['Order Service'],
    rootCauseService: 'Order Service',
    metrics: {
      cpuMin: 35,
      cpuMax: 55,
      memoryMbMin: 4200,
      memoryMbMax: 5400,
      latencyMinMs: 450,
      latencyMaxMs: 950,
      failureProbability: 0.20,
      requestVolumeMin: 110,
      requestVolumeMax: 170
    },
    params: {
      retryCountMin: 0, retryCountMax: 1,
      queueLengthMin: 15, queueLengthMax: 40,
      databaseState: 'HEALTHY',
      cacheState: 'HIT',
      networkState: 'OPTIMAL',
      externalApiState: 'HEALTHY'
    },
    logTemplates: [
      { serviceName: 'User Service', eventType: 'API_REQUEST', endpoint: '/api/v1/orders', level: 'INFO', message: 'Incoming POST request to place new order.', statusCode: 200, delayMs: 0 },
      { serviceName: 'Order Service', eventType: 'ORDER', endpoint: '/api/v1/orders/reserve', level: 'WARN', message: 'Low inventory threshold detected for SKU-9921.', statusCode: 200, delayMs: 30 },
      { serviceName: 'Order Service', eventType: 'ORDER', endpoint: '/api/v1/orders/reserve', level: 'ERROR', message: 'Inventory reservation failed: Stock SKU-9921 exhausted.', statusCode: 400, delayMs: 85 }
    ]
  },

  // --- 2. PAYMENT_PROCESSING WORKFLOW SCENARIOS ---
  PAYMENT_SUCCESS: {
    id: 'PAYMENT_SUCCESS',
    workflowId: 'PAYMENT_PROCESSING',
    name: 'Payment Processing Success',
    type: 'HEALTHY',
    severity: 'INFO',
    affectedServices: [],
    rootCauseService: 'NONE',
    metrics: {
      cpuMin: 20,
      cpuMax: 35,
      memoryMbMin: 4000,
      memoryMbMax: 5400,
      latencyMinMs: 25,
      latencyMaxMs: 65,
      failureProbability: 0.0,
      requestVolumeMin: 130,
      requestVolumeMax: 210
    },
    params: {
      retryCountMin: 0, retryCountMax: 0,
      queueLengthMin: 8, queueLengthMax: 30,
      databaseState: 'HEALTHY',
      cacheState: 'HIT',
      networkState: 'OPTIMAL',
      externalApiState: 'HEALTHY'
    },
    logTemplates: [
      { serviceName: 'User Service', eventType: 'API_REQUEST', endpoint: '/api/v1/payments', level: 'INFO', message: 'Initiating payment authorization.', statusCode: 200, delayMs: 0 },
      { serviceName: 'Payment Service', eventType: 'PAYMENT', endpoint: '/api/v1/payments/charge', level: 'INFO', message: 'Payment gateway authorized transaction.', statusCode: 200, delayMs: 45 },
      { serviceName: 'PostgreSQL', eventType: 'DATABASE_QUERY', endpoint: '/api/v1/db', level: 'INFO', message: 'Ledger transaction record committed.', statusCode: 200, delayMs: 15 }
    ]
  },
  PAYMENT_GATEWAY_TIMEOUT: {
    id: 'PAYMENT_GATEWAY_TIMEOUT',
    workflowId: 'PAYMENT_PROCESSING',
    name: 'Payment Gateway Timeout',
    type: 'FAILURE',
    severity: 'ERROR',
    affectedServices: ['Payment Service', 'Order Service', 'User Service'],
    rootCauseService: 'Payment Service',
    metrics: {
      cpuMin: 72,
      cpuMax: 88,
      memoryMbMin: 6400,
      memoryMbMax: 7800,
      latencyMinMs: 2500,
      latencyMaxMs: 4800,
      failureProbability: 0.25,
      requestVolumeMin: 100,
      requestVolumeMax: 180
    },
    params: {
      retryCountMin: 2, retryCountMax: 5,
      queueLengthMin: 80, queueLengthMax: 180,
      databaseState: 'HEALTHY',
      cacheState: 'HIT',
      networkState: 'CONGESTED',
      externalApiState: 'SLOW'
    },
    logTemplates: [
      { serviceName: 'User Service', eventType: 'API_REQUEST', endpoint: '/api/v1/checkout', level: 'INFO', message: 'User initiated checkout process.', statusCode: 200, delayMs: 0 },
      { serviceName: 'Order Service', eventType: 'API_REQUEST', endpoint: '/api/v1/orders', level: 'INFO', message: 'User initiated order placement.', statusCode: 200, delayMs: 15 },
      { serviceName: 'Payment Service', eventType: 'EXTERNAL_API', endpoint: '/api/v1/payments/charge', level: 'WARN', message: 'Payment gateway latency exceeding 3000ms threshold, initiating retry...', statusCode: 200, delayMs: 120 },
      { serviceName: 'Payment Service', eventType: 'EXTERNAL_API', endpoint: '/api/v1/payments/charge', level: 'ERROR', message: 'Payment gateway timeout after 5000ms: Connection refused.', statusCode: 504, delayMs: 220 },
      { serviceName: 'Order Service', eventType: 'ORDER', endpoint: '/api/v1/orders/cancel', level: 'ERROR', message: 'Order payment failed. Reverting inventory hold.', statusCode: 400, delayMs: 30 }
    ]
  },
  GATEWAY_CONNECTION_REFUSED: {
    id: 'GATEWAY_CONNECTION_REFUSED',
    workflowId: 'PAYMENT_PROCESSING',
    name: 'Payment Gateway Connection Refused',
    type: 'FAILURE',
    severity: 'ERROR',
    affectedServices: ['Payment Service'],
    rootCauseService: 'Payment Service',
    metrics: {
      cpuMin: 60,
      cpuMax: 75,
      memoryMbMin: 5800,
      memoryMbMax: 6800,
      latencyMinMs: 1800,
      latencyMaxMs: 3200,
      failureProbability: 0.30,
      requestVolumeMin: 90,
      requestVolumeMax: 160
    },
    params: {
      retryCountMin: 1, retryCountMax: 4,
      queueLengthMin: 60, queueLengthMax: 130,
      databaseState: 'HEALTHY',
      cacheState: 'HIT',
      networkState: 'JITTER',
      externalApiState: 'DOWN'
    },
    logTemplates: [
      { serviceName: 'Payment Service', eventType: 'EXTERNAL_API', endpoint: '/api/v1/payments/charge', level: 'WARN', message: 'Gateway socket connection unstable.', statusCode: 200, delayMs: 40 },
      { serviceName: 'Payment Service', eventType: 'EXTERNAL_API', endpoint: '/api/v1/payments/charge', level: 'ERROR', message: 'Third party gateway socket closed unexpectedly.', statusCode: 502, delayMs: 150 }
    ]
  },

  // --- 3. DATABASE_OPERATIONS WORKFLOW SCENARIOS ---
  HEALTHY_DB_QUERY: {
    id: 'HEALTHY_DB_QUERY',
    workflowId: 'DATABASE_OPERATIONS',
    name: 'Healthy Database Query',
    type: 'HEALTHY',
    severity: 'INFO',
    affectedServices: [],
    rootCauseService: 'NONE',
    metrics: {
      cpuMin: 15,
      cpuMax: 28,
      memoryMbMin: 3600,
      memoryMbMax: 4800,
      latencyMinMs: 8,
      latencyMaxMs: 25,
      failureProbability: 0.0,
      requestVolumeMin: 160,
      requestVolumeMax: 240
    },
    params: {
      retryCountMin: 0, retryCountMax: 0,
      queueLengthMin: 4, queueLengthMax: 20,
      databaseState: 'HEALTHY',
      cacheState: 'HIT',
      networkState: 'OPTIMAL',
      externalApiState: 'HEALTHY'
    },
    logTemplates: [
      { serviceName: 'Order Service', eventType: 'DATABASE_QUERY', endpoint: '/api/v1/db/query', level: 'INFO', message: 'Indexed lookup query executed in 12ms.', statusCode: 200, delayMs: 12 },
      { serviceName: 'PostgreSQL', eventType: 'DATABASE_QUERY', endpoint: '/api/v1/db', level: 'INFO', message: 'PostgreSQL connection pool healthy (4/50 active).', statusCode: 200, delayMs: 8 }
    ]
  },
  SLOW_DB_QUERY: {
    id: 'SLOW_DB_QUERY',
    workflowId: 'DATABASE_OPERATIONS',
    name: 'Slow Database Sequential Scan',
    type: 'DEGRADED',
    severity: 'WARN',
    affectedServices: ['PostgreSQL'],
    rootCauseService: 'PostgreSQL',
    metrics: {
      cpuMin: 65,
      cpuMax: 82,
      memoryMbMin: 6200,
      memoryMbMax: 7600,
      latencyMinMs: 1500,
      latencyMaxMs: 3100,
      failureProbability: 0.12,
      requestVolumeMin: 120,
      requestVolumeMax: 190
    },
    params: {
      retryCountMin: 1, retryCountMax: 2,
      queueLengthMin: 35, queueLengthMax: 90,
      databaseState: 'SLOW',
      cacheState: 'HIT',
      networkState: 'OPTIMAL',
      externalApiState: 'HEALTHY'
    },
    logTemplates: [
      { serviceName: 'PostgreSQL', eventType: 'DATABASE_QUERY', endpoint: '/api/v1/db', level: 'WARN', message: 'Sequential scan detected on unindexed table query.', statusCode: 200, delayMs: 240 }
    ]
  },
  DATABASE_POOL_EXHAUSTION: {
    id: 'DATABASE_POOL_EXHAUSTION',
    workflowId: 'DATABASE_OPERATIONS',
    name: 'Database Connection Pool Exhaustion',
    type: 'CRITICAL',
    severity: 'CRITICAL',
    affectedServices: ['PostgreSQL', 'Payment Service', 'Order Service'],
    rootCauseService: 'PostgreSQL',
    metrics: {
      cpuMin: 86,
      cpuMax: 97,
      memoryMbMin: 8900,
      memoryMbMax: 9800,
      latencyMinMs: 3200,
      latencyMaxMs: 5500,
      failureProbability: 0.35,
      requestVolumeMin: 80,
      requestVolumeMax: 150
    },
    params: {
      retryCountMin: 3, retryCountMax: 6,
      queueLengthMin: 110, queueLengthMax: 220,
      databaseState: 'EXHAUSTED',
      cacheState: 'HIT',
      networkState: 'OPTIMAL',
      externalApiState: 'HEALTHY'
    },
    logTemplates: [
      { serviceName: 'Order Service', eventType: 'API_REQUEST', endpoint: '/api/v1/orders', level: 'INFO', message: 'Order status query requested.', statusCode: 200, delayMs: 0 },
      { serviceName: 'Payment Service', eventType: 'API_REQUEST', endpoint: '/api/v1/payments', level: 'INFO', message: 'Fetching ledger history from database.', statusCode: 200, delayMs: 15 },
      { serviceName: 'PostgreSQL', eventType: 'DATABASE_QUERY', endpoint: '/api/v1/db', level: 'WARN', message: 'PostgreSQL connection pool approaching capacity limits (48/50 active).', statusCode: 200, delayMs: 120 },
      { serviceName: 'PostgreSQL', eventType: 'DATABASE_ERROR', endpoint: '/api/v1/db', level: 'ERROR', message: 'Database query took too long: Pool client acquisition timeout.', statusCode: 500, delayMs: 350 },
      { serviceName: 'Payment Service', eventType: 'EXTERNAL_API', endpoint: '/api/v1/payments/charge', level: 'ERROR', message: 'Payment failed due to database connection timeout.', statusCode: 500, delayMs: 50 },
      { serviceName: 'Order Service', eventType: 'ORDER', endpoint: '/api/v1/orders/cancel', level: 'ERROR', message: 'Order query failed due to upstream database exhaustion.', statusCode: 500, delayMs: 30 }
    ]
  },

  // --- 4. PRODUCT_SEARCH WORKFLOW SCENARIOS ---
  HEALTHY_SEARCH: {
    id: 'HEALTHY_SEARCH',
    workflowId: 'PRODUCT_SEARCH',
    name: 'Healthy Product Search',
    type: 'HEALTHY',
    severity: 'INFO',
    affectedServices: [],
    rootCauseService: 'NONE',
    metrics: {
      cpuMin: 15,
      cpuMax: 28,
      memoryMbMin: 3600,
      memoryMbMax: 4800,
      latencyMinMs: 10,
      latencyMaxMs: 35,
      failureProbability: 0.0,
      requestVolumeMin: 150,
      requestVolumeMax: 250
    },
    params: {
      retryCountMin: 0, retryCountMax: 0,
      queueLengthMin: 5, queueLengthMax: 25,
      databaseState: 'HEALTHY',
      cacheState: 'HIT',
      networkState: 'OPTIMAL',
      externalApiState: 'HEALTHY'
    },
    logTemplates: [
      { serviceName: 'User Service', eventType: 'API_REQUEST', endpoint: '/api/v1/products/search', level: 'INFO', message: 'User initiated product search query.', statusCode: 200, delayMs: 0 },
      { serviceName: 'Search Service', eventType: 'CACHE_ACCESS', endpoint: '/api/v1/cache', level: 'INFO', message: 'Cache hit in Redis cluster. Returning cached products.', statusCode: 200, delayMs: 8 },
      { serviceName: 'Product Service', eventType: 'API_RESPONSE', endpoint: '/api/v1/products', level: 'INFO', message: 'Retrieved 24 products for catalog view.', statusCode: 200, delayMs: 12 }
    ]
  },
  CACHE_MISS_STORM: {
    id: 'CACHE_MISS_STORM',
    workflowId: 'PRODUCT_SEARCH',
    name: 'Redis Cache Miss Thundering Herd',
    type: 'DEGRADED',
    severity: 'WARN',
    affectedServices: ['Redis', 'Product Service'],
    rootCauseService: 'Redis',
    metrics: {
      cpuMin: 68,
      cpuMax: 84,
      memoryMbMin: 5900,
      memoryMbMax: 7200,
      latencyMinMs: 1100,
      latencyMaxMs: 2300,
      failureProbability: 0.15,
      requestVolumeMin: 130,
      requestVolumeMax: 210
    },
    params: {
      retryCountMin: 1, retryCountMax: 3,
      queueLengthMin: 50, queueLengthMax: 140,
      databaseState: 'HEALTHY',
      cacheState: 'MISS_STORM',
      networkState: 'JITTER',
      externalApiState: 'HEALTHY'
    },
    logTemplates: [
      { serviceName: 'Search Service', eventType: 'CACHE_ACCESS', endpoint: '/api/v1/cache', level: 'WARN', message: 'Cache miss storm on hot product key: redis-cluster-01.', statusCode: 200, delayMs: 140 }
    ]
  },

  // --- 5. USER_AUTH WORKFLOW SCENARIOS ---
  SUCCESSFUL_LOGIN: {
    id: 'SUCCESSFUL_LOGIN',
    workflowId: 'USER_AUTH',
    name: 'Successful User Authentication',
    type: 'HEALTHY',
    severity: 'INFO',
    affectedServices: [],
    rootCauseService: 'NONE',
    metrics: {
      cpuMin: 14,
      cpuMax: 26,
      memoryMbMin: 3500,
      memoryMbMax: 4600,
      latencyMinMs: 12,
      latencyMaxMs: 38,
      failureProbability: 0.0,
      requestVolumeMin: 140,
      requestVolumeMax: 220
    },
    params: {
      retryCountMin: 0, retryCountMax: 0,
      queueLengthMin: 5, queueLengthMax: 20,
      databaseState: 'HEALTHY',
      cacheState: 'HIT',
      networkState: 'OPTIMAL',
      externalApiState: 'HEALTHY'
    },
    logTemplates: [
      { serviceName: 'User Service', eventType: 'API_REQUEST', endpoint: '/api/v1/auth/login', level: 'INFO', message: 'User login request received.', statusCode: 200, delayMs: 0 },
      { serviceName: 'Authentication Service', eventType: 'AUTH', endpoint: '/api/v1/auth/verify', level: 'INFO', message: 'JWT token signed and session established.', statusCode: 200, delayMs: 18 }
    ]
  },
  AUTH_SERVICE_DOWN: {
    id: 'AUTH_SERVICE_DOWN',
    workflowId: 'USER_AUTH',
    name: 'Authentication Token Service Outage',
    type: 'FAILURE',
    severity: 'ERROR',
    affectedServices: ['Authentication Service', 'User Service'],
    rootCauseService: 'Authentication Service',
    metrics: {
      cpuMin: 70,
      cpuMax: 85,
      memoryMbMin: 6100,
      memoryMbMax: 7300,
      latencyMinMs: 2100,
      latencyMaxMs: 3800,
      failureProbability: 0.30,
      requestVolumeMin: 100,
      requestVolumeMax: 170
    },
    params: {
      retryCountMin: 2, retryCountMax: 4,
      queueLengthMin: 70, queueLengthMax: 150,
      databaseState: 'HEALTHY',
      cacheState: 'EVICT',
      networkState: 'JITTER',
      externalApiState: 'SLOW'
    },
    logTemplates: [
      { serviceName: 'User Service', eventType: 'API_REQUEST', endpoint: '/api/v1/auth/login', level: 'INFO', message: 'User login request received.', statusCode: 200, delayMs: 0 },
      { serviceName: 'Authentication Service', eventType: 'AUTH', endpoint: '/api/v1/auth/verify', level: 'WARN', message: 'Auth service verification delay exceeding 1500ms.', statusCode: 200, delayMs: 90 },
      { serviceName: 'Authentication Service', eventType: 'AUTH', endpoint: '/api/v1/auth/verify', level: 'ERROR', message: 'Auth service secret key verification failure.', statusCode: 500, delayMs: 190 }
    ]
  }
};

export const getScenariosForWorkflow = (workflowId) => {
  return Object.values(SCENARIOS).filter(s => s.workflowId === workflowId);
};
