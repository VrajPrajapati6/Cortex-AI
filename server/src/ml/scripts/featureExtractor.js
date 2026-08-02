import { runRCA } from '../../services/rcaService.js';
import { getRandomInt, getRandomFloat } from '../../scenario/scenario.utils.js';

function calculatePercentile(sortedArray, percentile) {
  if (!sortedArray || sortedArray.length === 0) return 0;
  const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
  return sortedArray[index];
}

/**
 * Extracts a complete 44-attribute feature vector from an in-memory telemetry window.
 */
export function extractTelemetryWindowFeatures(
  telemetryWindow,
  prevWindow = null,
  nextWindow = null
) {
  const { workflow, scenario, requestVolume, logs, stateMetrics } = telemetryWindow;

  // 1. Identification
  const timestamp = stateMetrics.timestamp;
  const workflow_name = workflow.name;
  const scenario_name = scenario.name;
  const primary_service = scenario.logTemplates[0]?.serviceName || 'User Service';
  const affected_services_count = scenario.affectedServices.length;

  // 2. Traffic Features
  const request_volume = requestVolume;
  const failed_requests = logs.filter(l => l.statusCode >= 400 || l.level === 'ERROR').length;
  const successful_requests = Math.max(0, request_volume - failed_requests);
  const success_rate = Number(((successful_requests / Math.max(1, request_volume)) * 100).toFixed(2));
  const error_rate = Number(((failed_requests / Math.max(1, request_volume)) * 100).toFixed(2));

  // 3. Resource Features
  const cpu_usage = stateMetrics.cpuUsage;
  const memory_usage = stateMetrics.memoryUsageMb;

  // 4. Performance Features
  const responseTimes = logs.map(l => l.responseTimeMs).sort((a, b) => a - b);
  const average_response_time = responseTimes.length > 0 
    ? Number((responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(2))
    : 0;
  const average_latency = average_response_time;
  const p95_latency = calculatePercentile(responseTimes, 95);
  const p99_latency = calculatePercentile(responseTimes, 99);

  // 5. Log Features
  const info_log_count = logs.filter(l => l.level === 'INFO').length;
  const warn_log_count = logs.filter(l => l.level === 'WARN').length;
  const error_log_count = logs.filter(l => l.level === 'ERROR').length;
  const debug_log_count = logs.filter(l => l.level === 'DEBUG').length;
  const critical_log_count = logs.filter(l => l.statusCode >= 500 || l.level === 'CRITICAL').length;

  // 6. Layer 3 Parameterization Features
  const p = scenario.params;
  const retry_count = getRandomInt(p.retryCountMin, p.retryCountMax);
  const queue_length = getRandomInt(p.queueLengthMin, p.queueLengthMax);
  const database_state = p.databaseState;
  const cache_state = p.cacheState;
  const network_state = p.networkState;
  const external_api_state = p.externalApiState;

  // 7. Trend Features (vs Previous Window)
  const prevCpu = prevWindow ? prevWindow.cpu_usage : cpu_usage;
  const prevMem = prevWindow ? prevWindow.memory_usage : memory_usage;
  const prevLat = prevWindow ? prevWindow.p95_latency : p95_latency;
  const prevErr = prevWindow ? prevWindow.error_rate : error_rate;

  const cpu_trend = Number((cpu_usage - prevCpu).toFixed(2));
  const memory_trend = Number((memory_usage - prevMem).toFixed(2));
  const latency_trend = Number((p95_latency - prevLat).toFixed(2));
  const error_rate_trend = Number((error_rate - prevErr).toFixed(2));

  // 8. Service Health Features
  const totalServicesCount = 5;
  const critical_services_count = scenario.severity === 'CRITICAL' ? scenario.affectedServices.length : (scenario.severity === 'ERROR' ? 1 : 0);
  const degraded_services_count = scenario.severity === 'WARN' ? scenario.affectedServices.length : 0;
  const healthy_services_count = Math.max(0, totalServicesCount - (critical_services_count + degraded_services_count));

  // 9. Root Cause Engine Features (Run generic RCA on in-memory logs)
  const firstError = logs.filter(l => l.level === 'ERROR').sort((a, b) => a.startOffset - b.startOffset)[0];
  const first_failed_service = firstError ? firstError.serviceName : 'NONE';

  // Group spans for edge propagation
  const edgeCounts = {};
  for (let i = 0; i < logs.length - 1; i++) {
    const parent = logs[i].serviceName;
    const child = logs[i + 1].serviceName;
    if (parent !== child) {
      const edge = `${parent}->${child}`;
      edgeCounts[edge] = (edgeCounts[edge] || 0) + 1;
    }
  }

  const rcaResult = runRCA(
    logs.map(l => ({ ...l, service_name: l.serviceName })),
    {},
    edgeCounts,
    first_failed_service,
    {}
  );

  const root_cause_service = scenario.rootCauseService || rcaResult.rootCause || 'NONE';
  const root_cause_confidence = rcaResult.confidence || (scenario.type === 'HEALTHY' ? 0 : 95);
  const propagation_chain_length = scenario.affectedServices.length;
  const propagation_depth = Math.min(4, propagation_chain_length);

  // 10. Target Columns for Models 1, 2, and 3
  const is_anomaly = scenario.type === 'HEALTHY' ? 0 : 1;

  let incident_type = 'NONE';
  if (scenario.type !== 'HEALTHY') {
    if (memory_usage > 8500) incident_type = 'MEMORY';
    else if (cpu_usage > 80) incident_type = 'CPU';
    else incident_type = 'LOG';
  }

  // Model 3: Lookahead Targets (1-window ahead values)
  const future_cpu_usage = nextWindow ? nextWindow.cpu_usage : cpu_usage;
  const future_memory_usage = nextWindow ? nextWindow.memory_usage : memory_usage;
  const future_p95_latency = nextWindow ? nextWindow.p95_latency : p95_latency;

  return {
    timestamp,
    workflow_name,
    scenario_name,
    primary_service,
    affected_services_count,
    request_volume,
    successful_requests,
    failed_requests,
    success_rate,
    error_rate,
    cpu_usage,
    memory_usage,
    average_response_time,
    average_latency,
    p95_latency,
    p99_latency,
    info_log_count,
    warn_log_count,
    error_log_count,
    debug_log_count,
    critical_log_count,
    propagation_depth,
    retry_count,
    queue_length,
    database_state,
    cache_state,
    network_state,
    external_api_state,
    cpu_trend,
    memory_trend,
    latency_trend,
    error_rate_trend,
    degraded_services_count,
    healthy_services_count,
    critical_services_count,
    root_cause_service,
    root_cause_confidence,
    first_failed_service,
    propagation_chain_length,
    is_anomaly,
    incident_type,
    future_cpu_usage,
    future_memory_usage,
    future_p95_latency
  };
}
