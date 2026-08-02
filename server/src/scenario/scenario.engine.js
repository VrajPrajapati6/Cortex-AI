import { scenarioState } from './scenario.state.js';
import { generateRequestId, getRandomInt } from './scenario.utils.js';
import crypto from 'crypto';

class ScenarioEngine {
  /**
   * Returns current synthetic telemetry metrics for active scenario state.
   */
  getCurrentTelemetryState() {
    return scenarioState.generateSyntheticMetrics();
  }

  /**
   * Generates a request batch and log tree based on active Workflow -> Scenario.
   */
  generateRequestBatch() {
    const { workflow, scenario } = scenarioState.getActiveState();
    const requestNum = scenarioState.getNextRequestNum();
    const requestId = generateRequestId(requestNum);

    // Determine if this specific request fails based on scenario failure probability
    const isFailedRequest = Math.random() < scenario.metrics.failureProbability;

    let currentStartTimeOffset = 0;
    const computedSteps = [];
    const baseTemplates = scenario.logTemplates;

    // Top-down pass: assign start times and span IDs
    for (let i = 0; i < baseTemplates.length; i++) {
      const template = baseTemplates[i];
      let level = template.level;
      let statusCode = template.statusCode;
      let message = template.message;

      // If scenario specifies healthy request, force INFO 200
      if (!isFailedRequest && level === 'ERROR') {
        level = 'INFO';
        statusCode = 200;
        message = message.replace('failed', 'completed successfully').replace('timeout', 'processed within limits');
      }

      const intrinsicTime = template.delayMs + getRandomInt(5, 25);

      computedSteps.push({
        ...template,
        level,
        statusCode,
        message,
        spanId: crypto.randomUUID(),
        startOffset: currentStartTimeOffset,
        intrinsicTime
      });

      // Child starts 5-15ms after parent
      currentStartTimeOffset += getRandomInt(5, 15);
    }

    // Bottom-up pass: calculate encompassing parent response times
    for (let i = computedSteps.length - 1; i >= 0; i--) {
      const step = computedSteps[i];
      if (i === computedSteps.length - 1) {
        step.responseTimeMs = step.intrinsicTime;
      } else {
        const child = computedSteps[i + 1];
        const childEndTime = child.startOffset + child.responseTimeMs;
        const minEndTime = childEndTime + getRandomInt(2, 10);
        const parentIntrinsicEndTime = step.startOffset + step.intrinsicTime;

        const finalEndTime = Math.max(minEndTime, parentIntrinsicEndTime);
        step.responseTimeMs = finalEndTime - step.startOffset;
      }
    }

    return {
      requestId,
      workflow,
      scenario,
      isFailedRequest,
      steps: computedSteps
    };
  }
}

export const scenarioEngine = new ScenarioEngine();
