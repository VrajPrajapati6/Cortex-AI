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

---

# Comprehensive Master Dataset Analytics & Data Analysis (EDA)

This section provides an in-depth statistical audit and exploratory data analysis of the generated master dataset (`cortex_master_dataset.csv`). The dataset reflects realistic, synthetic enterprise telemetry produced by the unified **Scenario Engine** across all operational phases.

---

## 1. High-Level Dataset Metadata Snapshot

| Dataset Parameter | Value / Metric | Description & Notes |
| :--- | :---: | :--- |
| **Dataset File Path** | `server/src/ml/datasets/cortex_master_dataset.csv` | Standard master dataset artifact location |
| **Total Telemetry Samples (Rows)** | **200,000** | Total generated telemetry windows ($t$) |
| **Total Feature Attributes (Columns)** | **44** | 39 Input features + 5 Target output labels |
| **Dataset File Size** | **47.44 MB** | Uncompressed CSV file size |
| **Data Completeness & Integrity** | **100.0%** | Zero missing values, zero null cells |
| **Row Uniqueness Rate** | **100.0%** | 200,000 distinct telemetry states |
| **Total Business Workflows** | **5** | All 5 enterprise business workflows |
| **Total Pre-configured Scenarios** | **13** | All 13 scenario engine states |
| **Total Microservices Monitored** | **10** | 8 Microservices + 2 Storage/Cache Engines |

---

## 2. Feature Schema & Column Category Classification

The 44 columns in the dataset are classified into 4 functional feature groups:

### A. Identification & Reference Attributes (1 Column)
- `timestamp`: ISO-8601 millisecond timestamp representing the telemetry sampling window.

### B. Categorical Features (9 Columns)
- `workflow_name`: Active business workflow (`Place Order & Checkout`, `Payment Gateway Processing`, `Database Access & Operations`, `Product Search & Discovery`, `User Authentication`).
- `scenario_name`: Active scenario ID (`Healthy Order Checkout`, `Payment Gateway Timeout`, etc.).
- `primary_service`: Entrypoint microservice initiating the workflow execution.
- `database_state`: Relational DB state (`HEALTHY`, `SLOW`, `EXHAUSTED`).
- `cache_state`: Redis cluster state (`HIT`, `MISS_STORM`, `EVICT`).
- `network_state`: Underlying network condition (`OPTIMAL`, `JITTER`, `CONGESTED`).
- `external_api_state`: External 3rd-party gateway state (`HEALTHY`, `SLOW`, `DOWN`).
- `root_cause_service`: Ground-truth root cause service derived by scenario engine (`Order Service`, `Payment Service`, `PostgreSQL`, `Redis`, `Authentication Service`, or `NONE`).
- `first_failed_service`: Chronologically earliest service to log an error in the execution trace.

### C. Numerical Telemetry & Feature Vectors (29 Columns)
- **Traffic & Request Features**: `request_volume`, `successful_requests`, `failed_requests`, `success_rate`, `error_rate`.
- **Hardware Resources**: `cpu_usage`, `memory_usage`.
- **Latency & Performance**: `average_response_time`, `average_latency`, `p95_latency`, `p99_latency`.
- **Log Severity Counts**: `info_log_count`, `warn_log_count`, `error_log_count`, `debug_log_count`, `critical_log_count`.
- **Graph Topology & RCA Features**: `affected_services_count`, `propagation_depth`, `propagation_chain_length`, `degraded_services_count`, `healthy_services_count`, `critical_services_count`, `root_cause_confidence`.
- **Layer 3 Parameterization**: `retry_count`, `queue_length`.
- **Trend Indicators ($\Delta$ vs $t-1$)**: `cpu_trend`, `memory_trend`, `latency_trend`, `error_rate_trend`.

### D. Machine Learning Target Output Labels (5 Columns)
- `is_anomaly` *(Binary Label for Model 1)*: `0` for Healthy, `1` for Anomaly/Degraded/Critical.
- `incident_type` *(Multi-Class Label for Model 2)*: `NONE`, `LOG`, `CPU`, `MEMORY`.
- `future_cpu_usage` *(Regression Target for Model 3)*: Future CPU % at tick $t+1$.
- `future_memory_usage` *(Regression Target for Model 3)*: Future Memory MB at tick $t+1$.
- `future_p95_latency` *(Regression Target for Model 3)*: Future P95 Latency ms at tick $t+1$.

---

## 3. Data Distribution by Business Workflow

The 200,000 telemetry rows are evenly distributed across all **5 Business Workflows**:

| Business Workflow | Owned Scenarios | Total Rows | Percentage of Dataset |
| :--- | :---: | :---: | :---: |
| **`Place Order & Checkout`** | `HEALTHY_CHECKOUT`, `CPU_RUNAWAY_SPIKE`, `INVENTORY_HOLD_FAILURE` | **41,120** | **20.56%** |
| **`Payment Gateway Processing`** | `PAYMENT_SUCCESS`, `PAYMENT_GATEWAY_TIMEOUT`, `GATEWAY_CONNECTION_REFUSED` | **40,476** | **20.24%** |
| **`Product Search & Discovery`** | `HEALTHY_SEARCH`, `CACHE_MISS_STORM` | **40,344** | **20.17%** |
| **`User Authentication`** | `SUCCESSFUL_LOGIN`, `AUTH_SERVICE_DOWN` | **39,672** | **19.84%** |
| **`Database Access & Operations`** | `HEALTHY_DB_QUERY`, `SLOW_DB_QUERY`, `DATABASE_POOL_EXHAUSTION` | **38,388** | **19.19%** |
| **TOTAL** | **13 Scenarios** | **200,000** | **100.00%** |

---

## 4. Data Distribution by Scenario

Below is the detailed row breakdown for each of the **13 Scenarios**:

| # | Scenario Name | Scenario Type | Severity | Parent Workflow | Row Count | Percentage |
| :-: | :--- | :---: | :---: | :--- | :---: | :---: |
| **1** | **`Redis Cache Miss Thundering Herd`** | 🟡 `DEGRADED` | `WARN` | Product Search & Discovery | **20,220** | **10.11%** |
| **2** | **`Authentication Token Service Outage`** | 🔴 `FAILURE` | `ERROR` | User Authentication | **20,208** | **10.10%** |
| **3** | **`Healthy Product Search`** | 🟢 `HEALTHY` | `INFO` | Product Search & Discovery | **20,124** | **10.06%** |
| **4** | **`Successful User Authentication`** | 🟢 `HEALTHY` | `INFO` | User Authentication | **19,464** | **9.73%** |
| **5** | **`Healthy Order Checkout`** | 🟢 `HEALTHY` | `INFO` | Place Order & Checkout | **13,956** | **6.98%** |
| **6** | **`Payment Gateway Connection Refused`** | 🔴 `FAILURE` | `ERROR` | Payment Gateway Processing | **13,740** | **6.87%** |
| **7** | **`Order Processing CPU Runaway`** | 🟡 `DEGRADED` | `WARN` | Place Order & Checkout | **13,608** | **6.80%** |
| **8** | **`Payment Processing Success`** | 🟢 `HEALTHY` | `INFO` | Payment Gateway Processing | **13,584** | **6.79%** |
| **9** | **`Inventory Reserve Hold Out of Stock`** | 🔴 `FAILURE` | `ERROR` | Place Order & Checkout | **13,556** | **6.78%** |
| **10** | **`Slow Database Sequential Scan`** | 🟡 `DEGRADED` | `WARN` | Database Access & Operations | **13,224** | **6.61%** |
| **11** | **`Payment Gateway Timeout`** | 🔴 `FAILURE` | `ERROR` | Payment Gateway Processing | **13,152** | **6.58%** |
| **12** | **`Database Connection Pool Exhaustion`** | 🔴 `CRITICAL` | `CRITICAL` | Database Access & Operations | **12,888** | **6.44%** |
| **13** | **`Healthy Database Query`** | 🟢 `HEALTHY` | `INFO` | Database Access & Operations | **12,276** | **6.14%** |
| **TOTAL** | — | — | — | — | **200,000** | **100.00%** |

---

## 5. Machine Learning Target Label Distributions

### Model 1: Anomaly Detection (`is_anomaly`)
- **Normal / Healthy (`0`)**: **79,404 samples** (39.70%)
- **Anomalous / Degraded / Failure (`1`)**: **120,596 samples** (60.30%)
- *Balance Note*: Healthy-to-anomalous ratio (~40% / 60%) provides optimal class representation for binary classifiers like Random Forest and SVM without suffering from extreme class imbalance.

### Model 2: Incident Type Classification (`incident_type`)
- **`NONE` (Healthy / Baseline)**: **79,404 samples** (39.70%)
- **`LOG` (Log & Status Code Failures)**: **88,496 samples** (44.25%)
- **`CPU` (CPU Overload & Processing Spikes)**: **21,605 samples** (10.80%)
- **`MEMORY` (RAM Leak & Pool Exhaustion)**: **10,495 samples** (5.25%)
- *Distribution Note*: Mirrors realistic production outage distributions where log/protocol failures occur most frequently, followed by CPU spikes and memory exhaustion events.

### Model 3: Telemetry Forecasting Targets (Continuous Values)
- **`future_cpu_usage`**: Range $14.0\% - 97.0\%$, Mean $\approx 48.5\%$
- **`future_memory_usage`**: Range $3,500\text{ MB} - 9,800\text{ MB}$, Mean $\approx 5,420\text{ MB}$
- **`future_p95_latency`**: Range $8.0\text{ ms} - 5,500.0\text{ ms}$, Mean $\approx 920\text{ ms}$

---

## 6. Key Telemetry Attribute Ranges & Summary Statistics

Below is the summary statistical range for core numeric input attributes across the entire 200,000 dataset:

| Telemetry Attribute | Minimum | Maximum | Mean / Typical Baseline | Units |
| :--- | :---: | :---: | :---: | :---: |
| **`request_volume`** | $80$ | $250$ | $165.4$ | Users / Batch |
| **`cpu_usage`** | $14.0\%$ | $97.0\%$ | $48.2\%$ | Utilization % |
| **`memory_usage`** | $3,500.0$ | $9,800.0$ | $5,410.5$ | Megabytes (MB) |
| **`p95_latency`** | $8.0$ | $5,500.0$ | $915.2$ | Milliseconds (ms) |
| **`error_rate`** | $0.0\%$ | $35.0\%$ | $8.4\%$ | Failed % |
| **`retry_count`** | $0$ | $6$ | $1.2$ | Retries / Req |
| **`queue_length`** | $4$ | $220$ | $54.8$ | Queued Reqs |
| **`cpu_trend`** | $-35.0$ | $+42.0$ | $\pm 1.8$ | $\Delta$ % |
| **`memory_trend`** | $-600.0$ | $+850.0$ | $\pm 25.0$ | $\Delta$ MB |
| **`latency_trend`** | $-450.0$ | $+1,800.0$ | $\pm 45.0$ | $\Delta$ ms |

