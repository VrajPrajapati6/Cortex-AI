export const dependencies = {
  'User Service': ['Order Service'],
  'Order Service': ['Payment Service'],
  'Payment Service': ['Redis', 'PostgreSQL'],
  'Redis': [],
  'PostgreSQL': []
};
