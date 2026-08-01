import { pool } from '../config/db.js';
import { getHealthData } from './health.controller.js';
import { dependencies } from '../config/dependencies.js';
import { groupByRequest } from '../services/correlationService.js';
import { aggregateEdges } from '../services/propagationService.js';

export const getTopology = async (req, res) => {
  try {
    const healthNodes = await getHealthData();

    const now = new Date();
    const sixtySecondsAgo = new Date(now.getTime() - 60000).toISOString();
    
    const logsRes = await pool.query(
      `SELECT * FROM logs WHERE timestamp >= $1 AND timestamp <= $2 ORDER BY timestamp ASC`,
      [sixtySecondsAgo, now.toISOString()]
    );
    
    const requestGroups = groupByRequest(logsRes.rows);
    const activeEdgeCounts = aggregateEdges(requestGroups); 

    const nodes = healthNodes; 
    const edges = [];

    for (const [fromService, toServices] of Object.entries(dependencies)) {
      toServices.forEach(toService => {
        const edgeId = `${toService}->${fromService}`;
        const activePropCount = activeEdgeCounts[edgeId] || 0;
        
        edges.push({
          source: toService,
          target: fromService,
          activePropagationCount: activePropCount
        });
      });
    }

    res.json({ nodes, edges });
  } catch (err) {
    console.error('Error fetching topology:', err);
    res.status(500).json({ error: 'Failed to fetch topology' });
  }
};
