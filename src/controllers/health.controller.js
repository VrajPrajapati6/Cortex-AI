import { ApiResponse } from '../utils/apiResponse.js';
import { config } from '../config/env.config.js';

export const getHealthStatus = (req, res) => {
  const healthData = {
    status: 'UP',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  };

  return res
    .status(200)
    .json(new ApiResponse(200, 'Cortex backend server is healthy', healthData));
};
