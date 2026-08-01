import express from 'express';
import { getServiceHealth } from '../controllers/health.controller.js';
import { getTopology } from '../controllers/topology.controller.js';

const router = express.Router();

router.get('/services', getServiceHealth);
router.get('/topology', getTopology);

export default router;
