export function scoreEvidence(e) {
  let score = 0;

  if (e.failedFirst) score += 30;
  if (e.upstreamOfAffected) score += 25;
  
  score += Math.min(e.propagationCount, 10) * 4;
  if (e.latencySpike) score += 20;
  score += Math.min(e.errorCount, 10) * 2;

  return score;
}
