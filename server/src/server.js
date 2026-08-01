import app from './app.js';
import { config } from './config/env.config.js';
import { initDb } from './config/initDb.js';
import { startLogGenerator } from './workers/logGenerator.js';
import { startMetricsCollector } from './workers/metricsCollector.js';
import { startLatencyAggregator } from './workers/latencyAggregator.js';
import { initSocket } from './config/socket.js';

const server = app.listen(config.port, async () => {
  console.log(`[Cortex Server] Running on port ${config.port} in ${config.nodeEnv} mode`);
  
  // 1. Initialize Database Schema (CREATE TABLE IF NOT EXISTS for all 4 tables)
  await initDb();

  // 2. Initialize Socket.io
  initSocket(server);

  // 3. Start background workers
  startLogGenerator();
  startMetricsCollector();
  startLatencyAggregator();
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
