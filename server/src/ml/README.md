# Final Master Dataset (Cortex ML)

The Machine Learning module will use a single master dataset containing operational telemetry, performance metrics, reliability metrics, RCA-derived features, and trend-based features. Each ML model (Anomaly Detection, Incident Prediction, and Incident Severity Classification) will use an appropriate subset of these features.

| Feature | Type | Source | Purpose |
|---------|------|--------|---------|
| timestamp | Time | Generated | Time reference |
| service_name | Categorical | Logs | Different services have different behavior patterns |
| cpu_usage | Numeric | Simulated | Resource utilization |
| memory_usage | Numeric | Simulated | Resource utilization |
| request_volume | Numeric | Calculated | Incoming traffic load |
| avg_latency | Numeric | Calculated | Overall service performance |
| p95_latency | Numeric | Calculated | Typical worst-case latency |
| p99_latency | Numeric | Calculated | Extreme latency observations |
| avg_response_time | Numeric | Calculated | Average request execution time |
| error_rate | Numeric | Calculated | Service reliability indicator |
| info_count | Numeric | Logs | Number of successful operations |
| warn_count | Numeric | Logs | Early warning indicator |
| error_count | Numeric | Logs | Failure trend |
| failed_requests | Numeric | Calculated | Number of failed requests |
| affected_services | Numeric | RCA | Number of impacted services |
| propagation_depth | Numeric | RCA | Depth of failure propagation |
| cpu_trend | Numeric | Calculated | CPU utilization trend compared to previous window |
| memory_trend | Numeric | Calculated | Memory utilization trend compared to previous window |
| latency_trend | Numeric | Calculated | Latency trend compared to previous window |

## Feature Categories

### Operational Metrics
- timestamp
- service_name
- cpu_usage
- memory_usage
- request_volume

### Performance Metrics
- avg_latency
- p95_latency
- p99_latency
- avg_response_time

### Reliability Metrics
- error_rate
- info_count
- warn_count
- error_count
- failed_requests

### RCA Metrics
- affected_services
- propagation_depth

### Trend Metrics
- cpu_trend
- memory_trend
- latency_trend

> **Note:** These are input features only. Target labels (outputs) will be defined separately for each ML model.

# Machine Learning Models & Target Labels

Cortex follows a multi-model Machine Learning architecture where each model solves a different problem in the observability pipeline. All models share the same master dataset but are trained with different target labels depending on their objective.

---

## Model 1 – Anomaly Detection

### Objective
Detect whether the current system behavior deviates from its learned normal operating state, even before any incident thresholds are crossed.

### Input Features
Uses operational, performance, reliability, and trend-based telemetry features from the master dataset.

### Target Label

| Label | Description |
|-------|-------------|
| `0` | Normal system behavior |
| `1` | Anomalous system behavior |

> **Output:** Predicts whether the current telemetry window is **Normal** or **Anomalous**.

---

## Model 2 – Incident Prediction

### Objective
Predict whether an incident is likely to occur in the upcoming prediction window and identify the expected incident type.

### Input Features
Uses operational, performance, reliability, and trend-based telemetry features from the master dataset.

### Target Label

| Label | Description |
|-------|-------------|
| `NONE` | No incident predicted |
| `LOG` | Log-based incident predicted |
| `CPU` | CPU resource incident predicted |
| `MEMORY` | Memory resource incident predicted |

> **Output:** Predicts the next expected incident class before the incident engine triggers it.

---

## Model 3 – Resource Forecasting

### Objective
Forecast future infrastructure health by predicting upcoming resource utilization and performance metrics.

### Input Features
Uses historical telemetry windows from the master dataset.

### Target Values

| Target | Description |
|--------|-------------|
| `future_cpu_usage` | Predicted CPU utilization for the next prediction window |
| `future_memory_usage` | Predicted Memory utilization for the next prediction window |
| `future_p95_latency` | Predicted P95 latency for the next prediction window |

> **Output:** Forecasts future resource trends, enabling Cortex to visualize expected system behavior before incidents occur.

---

## Overall Machine Learning Pipeline

```text
Historical Telemetry Dataset
            │
            ▼
Model 1 ──► Detect Anomalies
            │
            ▼
Model 2 ──► Predict Upcoming Incident
            │
            ▼
Model 3 ──► Forecast Future Resource Utilization
            │
            ▼
Proactive Backend Observability & Early Warning
```

### Summary

| Model | Problem Solved | Target |
|------|-----------------|--------|
| **Model 1** | Detect abnormal system behavior | `is_anomaly (0/1)` |
| **Model 2** | Predict the next incident type | `NONE`, `LOG`, `CPU`, `MEMORY` |
| **Model 3** | Forecast future system metrics | `future_cpu_usage`, `future_memory_usage`, `future_p95_latency` |
