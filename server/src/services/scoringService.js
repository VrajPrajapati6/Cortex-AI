export function scoreEvidence(e) {
  let score = 0;

  if (e.failedFirst) score += 30;
  if (e.upstreamOfAffected) score += 25;
  
  if (e.propagationCount > 0) score += 40;
  score += Math.min(e.propagationCount, 5) * 5;
  
  if (e.latencySpike) score += 20;

  return score;
}
