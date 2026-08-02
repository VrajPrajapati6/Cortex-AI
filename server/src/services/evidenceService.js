import { dependencies } from '../config/dependencies.js';

/**
 * Traverses the dependency graph to check if candidateService is a direct
 * or transitive dependency of targetService.
 */
function isDependencyOf(candidateService, targetService) {
  if (!targetService || !dependencies[targetService]) return false;
  
  const visited = new Set();
  const queue = [...dependencies[targetService]];

  while (queue.length > 0) {
    const current = queue.shift();
    if (current === candidateService) {
      return true;
    }
    visited.add(current);
    const deps = dependencies[current] || [];
    for (const dep of deps) {
      if (!visited.has(dep)) {
        queue.push(dep);
      }
    }
  }
  return false;
}

export function buildEvidence(
  service,
  logs,
  edgeCounts,
  affectedService,
  latencyInfo
) {
  // Find the chronologically earliest ERROR log in the isolation window
  const firstError = logs
    .filter(l => l.level === 'ERROR')
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))[0];

  // Count outgoing error propagation edges starting from this service
  const propagationCount = Object.entries(edgeCounts)
    .filter(([k]) => k.startsWith(service + '->'))
    .reduce((s, [, v]) => s + v, 0);

  // Count error occurrences for this service
  const errorCount = logs.filter(
    l => l.service_name === service && l.level === 'ERROR'
  ).length;

  return {
    service,
    failedFirst: firstError?.service_name === service,
    // Deep recursive dependency tree check: is this service in target's dependency graph?
    upstreamOfAffected: isDependencyOf(service, affectedService) || dependencies[affectedService]?.includes(service) || false,
    propagationCount,
    latencySpike: latencyInfo[service]?.spike || false,
    errorCount
  };
}
