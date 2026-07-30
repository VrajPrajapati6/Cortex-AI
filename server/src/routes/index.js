import { Router } from 'express';
import logsRoutes from './logs.routes.js';
import metricsRoutes from './metrics.routes.js';
import summaryRoutes from './summary.routes.js';
import incidentsRoutes from './incidents.routes.js';

const router = Router();

router.use('/logs', logsRoutes);
router.use('/metrics', metricsRoutes);
router.use('/summary', summaryRoutes);
router.use('/incidents', incidentsRoutes);

export default router;
