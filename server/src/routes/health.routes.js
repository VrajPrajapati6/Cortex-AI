import express from 'express';
import { getServiceHealth } from '../controllers/health.controller.js';

const router = express.Router();

router.get('/services', getServiceHealth);

export default router;
