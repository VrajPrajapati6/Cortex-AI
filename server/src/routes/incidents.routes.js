import { Router } from 'express';
import { getIncidents, getIncidentLogs, getIncidentMetrics } from '../controllers/incidents.controller.js';

const router = Router();

router.route('/')
  .get(getIncidents);

router.route('/:id/logs')
  .get(getIncidentLogs);

router.route('/:id/metrics')
  .get(getIncidentMetrics);

export default router;
