import express from 'express';
import { getTraceByRequestId } from '../controllers/trace.controller.js';

const router = express.Router();

router.get('/:requestId', getTraceByRequestId);

export default router;
