/**
 * JSDoc Type Definitions for Scenario Engine
 *
 * @typedef {Object} WorkflowSpec
 * @property {string} id - Unique Workflow ID
 * @property {string} name - Human-readable workflow name (e.g. 'Payment Processing')
 * @property {string} description - Description of user business operation
 * @property {string[]} defaultServiceChain - Sequence of microservices involved
 *
 * @typedef {Object} ScenarioTelemetrySpec
 * @property {number} cpuMin - Minimum CPU percentage
 * @property {number} cpuMax - Maximum CPU percentage
 * @property {number} memoryMbMin - Minimum Memory footprint in MB
 * @property {number} memoryMbMax - Maximum Memory footprint in MB
 * @property {number} latencyMinMs - Minimum intrinsic function latency in ms
 * @property {number} latencyMaxMs - Maximum intrinsic function latency in ms
 * @property {number} failureProbability - Failure probability percentage (0 to 1)
 * @property {number} requestVolumeMin - Minimum requests generated per batch
 * @property {number} requestVolumeMax - Maximum requests generated per batch
 *
 * @typedef {Object} ScenarioSpec
 * @property {string} id - Unique Scenario ID
 * @property {string} workflowId - Parent Workflow ID
 * @property {string} name - Scenario name (e.g. 'Payment Gateway Timeout')
 * @property {string} type - 'HEALTHY' | 'FAILURE' | 'DEGRADED'
 * @property {string} severity - 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL'
 * @property {string[]} affectedServices - Microservices impacted by scenario
 * @property {string|null} rootCauseService - Primary service causing failure
 * @property {ScenarioTelemetrySpec} metrics - Expected CPU, Memory, Latency, and Traffic specs
 * @property {Array} logTemplates - Log step definitions for trace trees
 *
 * @typedef {Object} SystemStateSnapshot
 * @property {string} activeWorkflowId
 * @property {string} activeScenarioId
 * @property {string} phase - 'HEALTHY' | 'DEGRADED' | 'CRITICAL' | 'RECOVERY'
 * @property {number} cpuUsage
 * @property {number} memoryUsageMb
 * @property {number} scenarioStartTime
 * @property {number} scenarioDurationMs
 */

export {};
