import { buildEvidence } from './evidenceService.js';
import { scoreEvidence } from './scoringService.js';

export function runRCA(
  logs,
  requestGroups,
  edgeCounts,
  affectedService,
  latencyInfo
) {
  const services = [...new Set(logs.map(l => l.service_name))];

  const results = services.map(service => {
    const evidence = buildEvidence(
      service,
      logs,
      edgeCounts,
      affectedService,
      latencyInfo
    );

    return {
      service,
      evidence,
      score: scoreEvidence(evidence)
    };
  });

  results.sort((a, b) => b.score - a.score);

  if (results.length === 0) {
    return {
      rootCause: affectedService || 'Unknown',
      confidence: 0,
      evidence: null,
      rankings: []
    };
  }

  const root = results[0];

  return {
    rootCause: root.service,
    confidence: Math.min(
      95,
      Math.round((root.score / 140) * 100)
    ),
    evidence: root.evidence,
    rankings: results
  };
}

export function buildMainChain(edgeCounts, startService) {
  const chain = [startService];
  let current = startService;

  while (true) {
    const outgoing = Object.entries(edgeCounts)
      .filter(([k]) => k.startsWith(current + '->'))
      .sort((a, b) => b[1] - a[1]);

    if (outgoing.length === 0) break;

    const next = outgoing[0][0].split('->')[1];

    if (chain.includes(next)) break;

    chain.push(next);
    current = next;
  }

  return chain;
}
