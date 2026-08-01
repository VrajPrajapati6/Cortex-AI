import { dependencies } from '../config/dependencies.js';

export function buildEdges(requestLogs) {
  const errors = requestLogs
    .filter(l => l.level === 'ERROR')
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const edges = [];

  for (let i = 0; i < errors.length - 1; i++) {
    const from = errors[i];
    const to = errors[i + 1];

    const valid =
      dependencies[to.service_name]?.includes(from.service_name);

    const delta =
      new Date(to.timestamp) - new Date(from.timestamp);

    if (valid && delta <= 5000) {
      edges.push({
        from: from.service_name,
        to: to.service_name
      });
    }
  }

  return edges;
}

export function aggregateEdges(requestGroups) {
  const edgeCounts = {};

  for (const requestId in requestGroups) {
    const edges = buildEdges(requestGroups[requestId]);

    for (const edge of edges) {
      const key = `${edge.from}->${edge.to}`;
      edgeCounts[key] = (edgeCounts[key] || 0) + 1;
    }
  }

  return edgeCounts;
}
