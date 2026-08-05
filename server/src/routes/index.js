import { Router } from 'express';
import logsRoutes from './logs.routes.js';
import metricsRoutes from './metrics.routes.js';
import summaryRoutes from './summary.routes.js';
import incidentsRoutes from './incidents.routes.js';
import healthRoutes from './health.routes.js';
import traceRoutes from './trace.routes.js';
import authRoutes from './auth.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/logs', logsRoutes);
router.use('/metrics', metricsRoutes);
router.use('/summary', summaryRoutes);
router.use('/incidents', incidentsRoutes);
router.use('/health', healthRoutes);
router.use('/traces', traceRoutes);

export default router;
