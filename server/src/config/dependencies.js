export const dependencies = {
  'User Service': ['Order Service', 'Payment Service', 'Search Service', 'Authentication Service'],
  'Order Service': ['Payment Service', 'PostgreSQL'],
  'Payment Service': ['Notification Service', 'PostgreSQL', 'Order Service'],
  'Notification Service': [],
  'PostgreSQL': ['Payment Service'],
  'Search Service': ['Product Service', 'Redis'],
  'Product Service': [],
  'Authentication Service': ['Redis'],
  'Redis': []
};
