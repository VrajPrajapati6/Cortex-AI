/**
 * Workflow Registry - Business Operations & Owned Scenario Definitions
 *
 * Each workflow represents a business operation and explicitly owns its set of scenarios.
 */

export const WORKFLOWS = {
  ORDER_PLACEMENT: {
    id: 'ORDER_PLACEMENT',
    name: 'Place Order & Checkout',
    description: 'User checkout, order creation, inventory reservation, and email dispatch.',
    defaultServiceChain: ['User Service', 'Order Service', 'Inventory Service', 'Notification Service'],
    scenarioIds: ['HEALTHY_CHECKOUT', 'CPU_RUNAWAY_SPIKE', 'INVENTORY_HOLD_FAILURE']
  },
  PAYMENT_PROCESSING: {
    id: 'PAYMENT_PROCESSING',
    name: 'Payment Gateway Processing',
    description: 'Charging payment method, payment gateway invocation, and ledger writing.',
    defaultServiceChain: ['User Service', 'Order Service', 'Payment Service', 'PostgreSQL', 'Notification Service'],
    scenarioIds: ['PAYMENT_SUCCESS', 'PAYMENT_GATEWAY_TIMEOUT', 'GATEWAY_CONNECTION_REFUSED']
  },
  DATABASE_OPERATIONS: {
    id: 'DATABASE_OPERATIONS',
    name: 'Database Access & Operations',
    description: 'Executing complex relational database queries and data transactions.',
    defaultServiceChain: ['Order Service', 'Payment Service', 'PostgreSQL'],
    scenarioIds: ['HEALTHY_DB_QUERY', 'SLOW_DB_QUERY', 'DATABASE_POOL_EXHAUSTION']
  },
  PRODUCT_SEARCH: {
    id: 'PRODUCT_SEARCH',
    name: 'Product Search & Discovery',
    description: 'Searching products, cache lookups, and inventory query.',
    defaultServiceChain: ['User Service', 'Search Service', 'Redis', 'Product Service'],
    scenarioIds: ['HEALTHY_SEARCH', 'CACHE_MISS_STORM']
  },
  USER_AUTH: {
    id: 'USER_AUTH',
    name: 'User Authentication',
    description: 'User login, token generation, and credential verification.',
    defaultServiceChain: ['User Service', 'Authentication Service', 'Redis'],
    scenarioIds: ['SUCCESSFUL_LOGIN', 'AUTH_SERVICE_DOWN']
  }
};

export const getAllWorkflows = () => Object.values(WORKFLOWS);
export const getWorkflowById = (id) => WORKFLOWS[id] || WORKFLOWS.ORDER_PLACEMENT;
