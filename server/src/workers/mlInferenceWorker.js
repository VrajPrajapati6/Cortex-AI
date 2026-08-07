import { getIO } from '../config/socket.js';
import { scenarioEngine } from '../scenario/index.js';
import { extractTelemetryWindowFeatures } from '../ml/scripts/featureExtractor.js';

let isRunning = false;

let mlStatusState = {
  status: 'waking_up',
  message: 'Due to Render free tier, the ML model may take 40-50 seconds to wake up from sleep. Please wait while the model initializes...'
};

let latestPrediction = null;

export const getMlStatus = () => mlStatusState;
export const getMlPrediction = () => latestPrediction;

const broadcastStatus = (status, message) => {
  mlStatusState = { status, message };
  try {
    getIO().emit('ml_status', mlStatusState);
  } catch (e) {
    // Socket not ready yet
  }
};

export const startMlInferenceWorker = () => {
  console.log('[Worker] ML Inference Pipeline started (3s interval).');
  const pythonMlUrl = process.env.PYTHON_ML_URL || 'http://127.0.0.1:5005';

  // 1. Immediate background wake-up ping on boot
  (async function wakeupPing() {
    try {
      console.log(`[Worker] [ML Wakeup] Proactively pinging ML engine at ${pythonMlUrl}...`);
      const res = await fetch(`${pythonMlUrl}/`, {
        signal: AbortSignal.timeout(60000)
      });
      if (res.ok) {
        console.log('[Worker] [ML Wakeup] ML engine is awake and ready!');
      }
    } catch (err) {
      console.log('[Worker] [ML Wakeup] ML engine waking up from sleep...');
    }
  })();

  // 2. Keep-alive ping every 3 minutes to prevent Render free-tier sleep during active sessions
  setInterval(async () => {
    try {
      await fetch(`${pythonMlUrl}/`, { signal: AbortSignal.timeout(10000) });
    } catch (e) {
      // Ignore keep-alive errors
    }
  }, 180000);

  // 3. Periodic Inference Loop (3s interval)
  setInterval(async () => {
    if (isRunning) return;
    isRunning = true;

    try {
      // Extract synthetic telemetry features
      const stateMetrics = scenarioEngine.getCurrentTelemetryState();
      const batch = scenarioEngine.generateRequestBatch();
      const logs = batch.steps || [];

      const telemetryWindow = {
        workflow: batch.workflow,
        scenario: batch.scenario,
        requestVolume: stateMetrics.requestVolume,
        logs,
        stateMetrics
      };

      const features = extractTelemetryWindowFeatures(telemetryWindow, null, null);

      // Send to Python Inference API (with 60s timeout to handle Render cold-start)
      const response = await fetch(`${pythonMlUrl}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(features),
        signal: AbortSignal.timeout(60000)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const prediction = await response.json();

      if (prediction && !prediction.error) {
        latestPrediction = {
          timestamp: new Date().toISOString(),
          is_anomaly: prediction.is_anomaly,
          predicted_incident: prediction.predicted_incident,
          primary_service: prediction.primary_service,
          features: {
            cpu_usage: features.cpu_usage,
            memory_usage: features.memory_usage,
            p95_latency: features.p95_latency
          }
        };

        if (mlStatusState.status !== 'online') {
          broadcastStatus('online', 'ML Inference Engine active');
        }

        getIO().emit('ml_prediction', latestPrediction);
      }
    } catch (err) {
      // Server is cold-starting or returning connection error
      if (mlStatusState.status !== 'waking_up') {
        broadcastStatus(
          'waking_up',
          'Due to Render free tier, the ML model may take 40-50 seconds to wake up from sleep. Please wait while the model initializes...'
        );
      }
    } finally {
      isRunning = false;
    }
  }, 3000);
};
