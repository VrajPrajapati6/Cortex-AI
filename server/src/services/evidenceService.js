import { dependencies } from '../config/dependencies.js';

export function buildEvidence(
  service,
  logs,
  edgeCounts,
  affectedService,
  latencyInfo
) {
  const firstError = logs
    .filter(l => l.level === 'ERROR')
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))[0];

  const propagationCount = Object.entries(edgeCounts)
    .filter(([k]) => k.startsWith(service + '->'))
    .reduce((s, [, v]) => s + v, 0);

  const errorCount = logs.filter(
    l => l.service_name === service && l.level === 'ERROR'
  ).length;

  return {
    service,
    failedFirst: firstError?.service_name === service,
    upstreamOfAffected:
      dependencies[affectedService]?.includes(service) || false,
    propagationCount,
    latencySpike: latencyInfo[service]?.spike || false,
    errorCount
  };
}
