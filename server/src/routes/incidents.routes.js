import { Router } from 'express';
import { 
  getIncidents, 
  getIncidentLogs, 
  getIncidentMetrics, 
  getIncidentRCA 
} from '../controllers/incidents.controller.js';

const router = Router();

router.route('/')
  .get(getIncidents);

router.route('/:id/rca')
  .get(getIncidentRCA);

router.route('/:id/logs')
  .get(getIncidentLogs);

router.route('/:id/metrics')
  .get(getIncidentMetrics);

export default router;
