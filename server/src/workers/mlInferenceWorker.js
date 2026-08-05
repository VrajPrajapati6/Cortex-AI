
import { getIO } from '../config/socket.js';
import { scenarioEngine } from '../scenario/index.js';
import { extractTelemetryWindowFeatures } from '../ml/scripts/featureExtractor.js';

let isRunning = false;

export const startMlInferenceWorker = () => {
  console.log('[Worker] ML Inference Pipeline started (10s interval).');
  
  setInterval(async () => {
    if (isRunning) return;
    isRunning = true;
    
    try {
      // 1. Get current synthetic state
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
      
      // 2. Extract Features
      const features = extractTelemetryWindowFeatures(telemetryWindow, null, null);
      
      // 3. Send to Python Inference API
      const pythonMlUrl = process.env.PYTHON_ML_URL || 'http://127.0.0.1:5005';
      const response = await fetch(`${pythonMlUrl}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(features)
      });
      const prediction = await response.json();
      
      if (prediction && !prediction.error) {
        // 4. Emit to Frontend
        getIO().emit('ml_prediction', {
          timestamp: new Date().toISOString(),
          is_anomaly: prediction.is_anomaly,
          predicted_incident: prediction.predicted_incident,
          primary_service: prediction.primary_service,
          features: {
            cpu_usage: features.cpu_usage,
            memory_usage: features.memory_usage,
            p95_latency: features.p95_latency
          }
        });
      }
    } catch (err) {
      // Python server might not be up yet
      if (err.code !== 'ECONNREFUSED') {
        console.error('[Worker] ML Inference Error:', err.message);
      }
    } finally {
      isRunning = false;
    }
  }, 3000);
};
