/**
 * Scenario Engine Constants & Default Configuration
 *
 * Configured for comfortable manual system exploration:
 * - Healthy duration: 60s to 120s (1 to 2 minutes of steady-state healthy traffic)
 * - Failure duration: 40s to 75s (40 to 75s of sustained failure for UI & RCA inspection)
 * - Recovery duration: 25s to 40s (Transition back to baseline)
 */

export const SCENARIO_CONSTANTS = {
  // Target Ratio: ~75% Healthy, ~25% Failure/Degraded
  HEALTHY_PROBABILITY: 0.75,
  FAILURE_PROBABILITY: 0.25,

  // Scenario Duration Ranges (in milliseconds) - Configured for manual dashboard exploration
  HEALTHY_DURATION_MS: { min: 60000, max: 120000 },
  FAILURE_DURATION_MS: { min: 40000, max: 75000 },
  RECOVERY_DURATION_MS: { min: 25000, max: 40000 },

  // System State Transition Phases
  PHASES: {
    HEALTHY: 'HEALTHY',
    DEGRADED: 'DEGRADED',
    CRITICAL: 'CRITICAL',
    RECOVERY: 'RECOVERY'
  },

  // Default Baseline Telemetry (When system is healthy)
  DEFAULT_HEALTHY_METRICS: {
    cpuMin: 18,
    cpuMax: 32,
    memoryMbMin: 3800,
    memoryMbMax: 5200,
    latencyMinMs: 15,
    latencyMaxMs: 45
  }
};
