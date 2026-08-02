import { SCENARIO_CONSTANTS } from './scenario.constants.js';
import { getAllWorkflows } from './workflow.registry.js';
import { getScenariosForWorkflow } from './scenario.registry.js';
import { getRandomInt, getRandomFloat } from './scenario.utils.js';

class ScenarioState {
  constructor() {
    this.requestCounter = 1;

    // Step 1: Select initial Workflow
    const workflows = getAllWorkflows();
    this.activeWorkflow = workflows[getRandomInt(0, workflows.length - 1)];

    // Step 2: Select Scenario owned strictly by that Workflow
    const workflowScenarios = getScenariosForWorkflow(this.activeWorkflow.id);
    this.currentScenario = workflowScenarios[getRandomInt(0, workflowScenarios.length - 1)];

    this.phase = this.currentScenario.type === 'HEALTHY'
      ? SCENARIO_CONSTANTS.PHASES.HEALTHY
      : (this.currentScenario.type === 'CRITICAL' ? SCENARIO_CONSTANTS.PHASES.CRITICAL : SCENARIO_CONSTANTS.PHASES.DEGRADED);

    this.startTime = Date.now();
    this.durationMs = this.currentScenario.type === 'HEALTHY'
      ? getRandomInt(SCENARIO_CONSTANTS.HEALTHY_DURATION_MS.min, SCENARIO_CONSTANTS.HEALTHY_DURATION_MS.max)
      : getRandomInt(SCENARIO_CONSTANTS.FAILURE_DURATION_MS.min, SCENARIO_CONSTANTS.FAILURE_DURATION_MS.max);

    // Initial state tracking for gradual smoothing & trend creation
    const m = this.currentScenario.metrics;
    this.currentCpu = getRandomInt(m.cpuMin, m.cpuMax);
    this.currentMemoryMb = getRandomFloat(m.memoryMbMin, m.memoryMbMax, 2);

    console.log(`[Scenario Engine] 🎯 Initial Hierarchy -> Workflow: "${this.activeWorkflow.name}" | Scenario: "${this.currentScenario.name}" (${this.phase}) for ${Math.round(this.durationMs / 1000)}s`);
  }

  /**
   * Checks if current scenario duration has expired and transitions via 2-step hierarchy:
   * System -> 1. Select Workflow -> 2. Select Scenario owned by that Workflow
   */
  evaluateTransition() {
    const elapsed = Date.now() - this.startTime;
    if (elapsed < this.durationMs) {
      return false; // Still active
    }

    // Step 1: Randomly select a Workflow
    const workflows = getAllWorkflows();
    this.activeWorkflow = workflows[getRandomInt(0, workflows.length - 1)];

    // Step 2: Select a Scenario owned strictly by that Workflow
    const workflowScenarios = getScenariosForWorkflow(this.activeWorkflow.id);
    this.currentScenario = workflowScenarios[getRandomInt(0, workflowScenarios.length - 1)];

    this.phase = this.currentScenario.type === 'HEALTHY'
      ? SCENARIO_CONSTANTS.PHASES.HEALTHY
      : (this.currentScenario.type === 'CRITICAL' ? SCENARIO_CONSTANTS.PHASES.CRITICAL : SCENARIO_CONSTANTS.PHASES.DEGRADED);

    this.durationMs = this.currentScenario.type === 'HEALTHY'
      ? getRandomInt(SCENARIO_CONSTANTS.HEALTHY_DURATION_MS.min, SCENARIO_CONSTANTS.HEALTHY_DURATION_MS.max)
      : getRandomInt(SCENARIO_CONSTANTS.FAILURE_DURATION_MS.min, SCENARIO_CONSTANTS.FAILURE_DURATION_MS.max);

    this.startTime = Date.now();
    console.log(`[Scenario Engine] 🔄 Transition -> Workflow: "${this.activeWorkflow.name}" | Scenario: "${this.currentScenario.name}" (${this.phase}) for ${Math.round(this.durationMs / 1000)}s`);
    return true;
  }

  /**
   * Generates organic synthetic CPU and Memory metrics for active scenario state.
   * Features: Workload Scaling & Exponential Smoothing (EMA) for gradual ramp-up and recovery trends.
   */
  generateSyntheticMetrics() {
    this.evaluateTransition();

    const m = this.currentScenario.metrics;

    // 1. Calculate incoming request volume (users) for this interval
    const requestVolume = getRandomInt(m.requestVolumeMin, m.requestVolumeMax);
    const volumeRatio = (requestVolume - m.requestVolumeMin) / Math.max(1, m.requestVolumeMax - m.requestVolumeMin);

    // 2. Workload influence: higher traffic volume scales target CPU & Memory within configured bounds
    const targetCpu = Math.min(100, Math.round(m.cpuMin + (m.cpuMax - m.cpuMin) * volumeRatio + getRandomInt(-2, 3)));
    const targetMemoryMb = Math.min(16000, Number((m.memoryMbMin + (m.memoryMbMax - m.memoryMbMin) * volumeRatio + getRandomFloat(-50, 50)).toFixed(2)));

    // 3. Gradual smoothing (EMA): smooth transition between ticks (40% new target + 60% previous state)
    this.currentCpu = Math.min(100, Math.max(5, Math.round(0.4 * targetCpu + 0.6 * this.currentCpu)));
    this.currentMemoryMb = Math.max(1000, Number((0.4 * targetMemoryMb + 0.6 * this.currentMemoryMb).toFixed(2)));

    const remainingSec = Math.max(0, Math.round((this.durationMs - (Date.now() - this.startTime)) / 1000));

    return {
      cpuUsage: this.currentCpu,
      memoryUsageMb: this.currentMemoryMb,
      requestVolume,
      workflowId: this.activeWorkflow.id,
      workflowName: this.activeWorkflow.name,
      scenarioId: this.currentScenario.id,
      scenarioName: this.currentScenario.name,
      phase: this.phase,
      remainingSec,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Returns current active workflow and scenario snapshot.
   */
  getActiveState() {
    this.evaluateTransition();
    return {
      workflow: this.activeWorkflow,
      scenario: this.currentScenario
    };
  }

  /**
   * Increments and returns request sequence counter.
   */
  getNextRequestNum() {
    return this.requestCounter++;
  }
}

export const scenarioState = new ScenarioState();
