import { getIO } from '../config/socket.js';
import { scenarioEngine } from '../scenario/index.js';
import { extractTelemetryWindowFeatures } from '../ml/scripts/featureExtractor.js';

let isRunning = false;
let isPythonOnline = false;

let mlStatusState = {
  status: 'waking_up',
  message: 'Due to Render free tier, the Python ML model may take 40-50 seconds to wake up from sleep. The system is auto-waking it in the background.'
};

let latestPrediction = null;

export const getMlStatus = () => mlStatusState;
export const getMlPrediction = () => latestPrediction;

const broadcastStatus = (status, message) => {
  mlStatusState = { status, message };
  try {
    getIO().emit('ml_status', mlStatusState);
  } catch (e) {
    // Socket might not be ready yet
  }
};

export const startMlInferenceWorker = () => {
  console.log('[Worker] ML Inference Pipeline started (3s interval).');
  const rawUrl = process.env.PYTHON_ML_URL || 'http://127.0.0.1:5005';
  const pythonMlUrl = rawUrl.replace(/\/+$/, ''); // Remove trailing slashes

  // 1. Immediate background wake-up ping on boot (60s timeout to trigger Render cold-start)
  (async function wakeupPing() {
    try {
      console.log(`[Worker] [ML Wakeup] Proactively pinging ML engine at ${pythonMlUrl}...`);
      const res = await fetch(`${pythonMlUrl}/`, {
        signal: AbortSignal.timeout(60000)
      });
      if (res.ok) {
        isPythonOnline = true;
        broadcastStatus('online', 'ML Inference Engine active (FastAPI + XGBoost)');
        console.log('[Worker] [ML Wakeup] Python ML engine is awake and ready!');
      }
    } catch (err) {
      console.log('[Worker] [ML Wakeup] Python ML engine is waking up from sleep in background...');
    }
  })();

  // 2. Keep-alive heartbeat ping every 2 minutes to prevent Render sleep during active sessions
  setInterval(async () => {
    try {
      const res = await fetch(`${pythonMlUrl}/`, { signal: AbortSignal.timeout(15000) });
      if (res.ok && !isPythonOnline) {
        isPythonOnline = true;
        broadcastStatus('online', 'ML Inference Engine active (FastAPI + XGBoost)');
      }
    } catch (e) {
      // Ignore keep-alive errors
    }
  }, 120000);

  // 3. Periodic Inference Loop (every 3 seconds)
  setInterval(async () => {
    if (isRunning) return;
    isRunning = true;

    try {
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

      let predictionPayload = null;

      // Attempt live Python FastAPI XGBoost model prediction
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s per tick

        const response = await fetch(`${pythonMlUrl}/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(features),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const prediction = await response.json();
          if (prediction && !prediction.error) {
            isPythonOnline = true;
            if (mlStatusState.status !== 'online') {
              broadcastStatus('online', 'ML Inference Engine active (FastAPI + XGBoost)');
            }
            predictionPayload = {
              timestamp: new Date().toISOString(),
              is_anomaly: prediction.is_anomaly,
              predicted_incident: prediction.predicted_incident,
              primary_service: prediction.primary_service,
              features: {
                cpu_usage: features.cpu_usage,
                memory_usage: features.memory_usage,
                p95_latency: features.p95_latency
              },
              source: 'fastapi_xgboost'
            };
          }
        }
      } catch (pythonErr) {
        // Python server is cold-starting on Render
        if (isPythonOnline || mlStatusState.status !== 'waking_up') {
          isPythonOnline = false;
          broadcastStatus(
            'waking_up',
            'Due to Render free tier, the Python ML model may take 40-50 seconds to wake up from sleep. The system is auto-waking it in the background.'
          );
        }
      }

      // If Python API is still warming up, immediately deliver live telemetry prediction fallback
      // so the dashboard is active and never blocked on sleep mode
      if (!predictionPayload) {
        predictionPayload = {
          timestamp: new Date().toISOString(),
          is_anomaly: features.is_anomaly,
          predicted_incident: features.incident_type,
          primary_service: features.primary_service,
          features: {
            cpu_usage: features.cpu_usage,
            memory_usage: features.memory_usage,
            p95_latency: features.p95_latency
          },
          source: 'cortex_telemetry_engine'
        };
      }

      latestPrediction = predictionPayload;
      getIO().emit('ml_prediction', latestPrediction);

    } catch (err) {
      console.error('[Worker] ML Inference Error:', err.message);
    } finally {
      isRunning = false;
    }
  }, 3000);
};
