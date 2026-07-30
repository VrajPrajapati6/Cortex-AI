import app from './app.js';
import { config } from './config/env.config.js';

const server = app.listen(config.port, () => {
  console.log(`[Cortex Server] Running on port ${config.port} in ${config.nodeEnv} mode`);
});

const handleShutdown = (signal) => {
  console.log(`[Cortex Server] ${signal} signal received. Closing HTTP server...`);
  server.close(() => {
    console.log('[Cortex Server] HTTP server closed gracefully.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
