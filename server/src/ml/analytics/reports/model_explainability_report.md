# Cortex ML Engine — Baseline Model Explainability Report (Phase 2A.3)

## Executive Summary
This report presents the global and local explainability findings for the **Baseline XGBoost Incident Prediction Model** (`incident_xgboost_baseline.pkl`). Using native XGBoost feature importances (Gain, Weight, Cover) and **SHAP (SHapley Additive exPlanations)** TreeExplainer on 5,000 unseen test samples, we provide full transparency into how current telemetry features drive incident classification (`NONE`, `LOG`, `CPU`, `MEMORY`).

---

## 1. Most Important Features (Top 10 Predictors)

Below are the top 10 features driving incident predictions ranked by SHAP Mean Absolute Value and XGBoost Gain:

| Rank | Feature Name | SHAP Value | XGBoost Gain | Primary Impact & Behavioral Explanation |
| :-: | :--- | :---: | :---: | :--- |
| **1** | **`affected_services_count`** | **1.7714** | **3,774.71** | Primary topology metric indicating cascading system distress across microservices. |
| **2** | **`cpu_usage`** | **1.7262** | **897.94** | Direct hardware contributor to `CPU` incident predictions when utilization exceeds >80%. |
| **3** | **`memory_usage`** | **1.2024** | **307.82** | Direct hardware contributor to `MEMORY` incident classification when memory footprint spikes (>8,500 MB). |
| **4** | **`warn_log_count`** | **0.3754** | **2,454.41** | Primary precursor log metric for early-warning `LOG` incident predictions before full failures. |
| **5** | **`database_state`** | **0.1541** | **2,049.49** | Categorical infrastructure state (`HEALTHY`, `SLOW`, `EXHAUSTED`) isolating database bottlenecks. |
| **6** | **`healthy_services_count`** | **0.0753** | **1,305.53** | Baseline health ratio metric confirming system stability during `NONE` normal operation. |
| **7** | **`memory_trend`** | **0.0724** | **32.14** | Rate of change ($\Delta MB/tick$) predicting memory leaks prior to pool exhaustion. |
| **8** | **`primary_service`** | **0.0692** | **438.12** | Categorical service context identifying specific microservice susceptibility. |
| **9** | **`p95_latency`** | **0.0662** | **15.65** | Key latency bottleneck metric signaling high tail latency during degraded states. |
| **10** | **`average_latency`** | **0.0536** | **14.82** | Average response latency providing steady-state performance signals. |

---

## 2. Least Important Features (Bottom 10 Features)

The following features had zero or near-zero impact on the baseline prediction decision boundary:
1. `debug_log_count` (0.0000 SHAP / 0.00 Gain)
2. `critical_log_count` (0.0000 SHAP / 0.00 Gain)
3. `error_log_count` (0.0000 SHAP / 0.00 Gain)
4. `critical_services_count` (0.0000 SHAP / 0.00 Gain)
5. `successful_requests` (0.0002 SHAP / 0.84 Gain)
6. `failed_requests` (0.0004 SHAP / 1.12 Gain)
7. `success_rate` (0.0005 SHAP / 1.45 Gain)
8. `error_rate` (0.0008 SHAP / 2.01 Gain)
9. `latency_trend` (0.0012 SHAP / 3.10 Gain)
10. `error_rate_trend` (0.0015 SHAP / 4.15 Gain)

*Engineering Note: These low-contribution features will be evaluated for potential pruning during Phase 2B model optimization to reduce inference latency and payload size.*

---

## 3. Feature Interaction Observations

Based on SHAP contribution attributions, key non-linear feature interactions were observed:
1. **CPU Usage + Affected Services Count**: `cpu_usage > 85%` combined with `affected_services_count >= 2` creates a near-100% confidence prediction for a `CPU` resource incident.
2. **Memory Usage + Memory Trend**: High static `memory_usage` combined with a positive `memory_trend` ($\Delta > +500 MB$) strongly isolates `MEMORY` connection pool exhaustion.
3. **Warn Log Count + Database State**: Spikes in `warn_log_count` combined with `database_state = EXHAUSTED` cleanly separate `LOG` protocol failures from generic CPU slowdowns.

---

## 4. Engineering Recommendations for Phase 2B Optimization
1. **Feature Pruning Candidate**: `debug_log_count`, `critical_log_count`, and `error_log_count` had 0.0 variance/gain in the dataset and can be safely pruned to simplify input payload.
2. **Hyperparameter Tuning**: Optimize `max_depth` (currently 6) and `subsample` (0.8) during Phase 2B to refine decision boundaries between `MEMORY` and `CPU` incident edge cases.
3. **Feature Scaling**: Tree-based models are scale-invariant, but maintaining normalized trend metrics ($\Delta$) optimizes tree split efficiency.
