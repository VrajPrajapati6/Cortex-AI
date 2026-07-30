import { Router } from 'express';
import logsRoutes from './logs.routes.js';
import metricsRoutes from './metrics.routes.js';
import summaryRoutes from './summary.routes.js';

const router = Router();

router.use('/logs', logsRoutes);
router.use('/metrics', metricsRoutes);
router.use('/summary', summaryRoutes);

export default router;
