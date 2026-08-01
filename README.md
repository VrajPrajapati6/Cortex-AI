# Cortex: AI-Powered Backend Observability & Root Cause Analysis Platform

Cortex is a comprehensive, production-inspired backend observability platform designed to continuously monitor system telemetry (Logs, CPU, and Memory usage), automatically detect system anomalies, and perform **Root Cause Analysis (RCA)** with interactive event timelines. Built with a modular Node.js/Express backend, Neon PostgreSQL database, real-time WebSockets (Socket.io), and a modern React + Tailwind CSS dashboard.

---

## 🏗️ System Architecture

The project follows a clean, decoupled monorepo architecture:

- **`server/`**: Node.js & Express backend handling data ingestion, Neon PostgreSQL persistence, background worker telemetry generation, rule-based incident lifecycle management, RCA calculation engine, and real-time Socket.io streaming.
- **`client/`**: React application built with Vite and Tailwind CSS, featuring live telemetry summary cards, custom SVG time-series charts, log explorer, and interactive Root Cause Analysis (RCA) modals.

---

## 💾 Data Persistence Schema (Neon PostgreSQL)

1. `logs`: Stores application logs enriched with distributed tracing and microservice telemetry fields:
   - `service_name`
   - `request_id`
   - `span_id`
   - `parent_span_id`
   - `event_type`
   - `endpoint`
   - `status_code`
   - `response_time_ms`
   - `timestamp`
   - `level`
   - `message`

   **Migration:**
   ```sql
   ALTER TABLE logs
   ADD COLUMN span_id UUID,
   ADD COLUMN parent_span_id UUID;
   ```
2. `system_metrics`: Stores hardware resource utilization snapshots (`cpu_usage` percentage, `memory_usage_mb` footprint, `timestamp`).
3. `service_metrics`: Stores aggregated service-level metrics (`request_count`, `error_rate`, `avg_latency`, `p95_latency`, `p99_latency`) for baseline comparison.
4. `incidents`: Tracks the lifecycle of system anomalies (`id`, `type`, `status`, `trigger_reason`, `resolution_reason`, `created_at`, `resolved_at`).

---

## ⚙️ Background Telemetry Workers

1. **Log Generator (`logGenerator.js`)**: Simulates enriched microservice traffic scenarios (e.g., Database Timeout, Cache Miss) with correlation IDs and detailed logs on a 10-second tick interval.
2. **Metrics Collector (`metricsCollector.js`)**: Samples real-time CPU utilization and memory footprint via Node.js native `os` module on a 10-second tick interval.
3. **Latency Aggregator (`latencyAggregator.js`)**: Aggregates raw logs every 60 seconds into mathematically true P95 and P99 latency percentiles per service for RCA baseline comparisons.

---

## 🚨 Automated Incident Engine & Lifecycle

Cortex monitors real-time operational streams and automatically triggers and resolves incidents:

1. **LOG Incidents**: Triggers when an `ERROR` log is recorded; auto-resolves when healthy `INFO`/`DEBUG` logs follow.
2. **CPU Incidents**: Triggers when real-time CPU load exceeds **80%**; auto-resolves when CPU load normalizes below **50%**.
3. **MEMORY Incidents**: Triggers when memory usage exceeds **90%** of total capacity; auto-resolves when memory drops below **70%**.

---

## 🩺 Service Health & SLO Layer

Cortex proactively monitors system degradation before incidents even occur using a live **Service Health Map**:
- **SLO Metrics Tracked:** `request_count`, `error_rate`, `availability %`, and `p95_latency` per service.
- **Dynamic Baselines:** Calculates a rolling 15-minute moving average of P95 latency for accurate baseline comparison.
- **Health Rules Engine:**
  - **Healthy (Green):** `error_rate < 1%` AND `p95_latency <= 2× baseline`
  - **Degraded (Yellow):** `error_rate >= 1%` OR `p95_latency > 2× baseline`
  - **Critical (Red):** `error_rate > 5%` OR `p95_latency > 5× baseline`

---

## 🔍 Root Cause Analysis (RCA) Module

When any active or historical incident is selected on the dashboard, Cortex generates a deterministic **Root Cause Analysis (RCA)** report:

### 1. Telemetry Window Isolation
Queries all operational data recorded within a strict time window spanning exactly **60 seconds prior to incident trigger** up to the exact moment of creation.

### 2. Advanced Statistical Causal Engine
Cortex dynamically identifies the true Root Cause by constructing a deterministic causal graph using distributed tracing (`span_id` and `parent_span_id`):
- **Request Correlation:** The engine first isolates chaotic log streams by grouping them perfectly into request chains using the unique `request_id`.
- **Propagation Graphing:** It maps adjacent errors in a request to a statically defined architectural topology (e.g., ensuring `OrderService` actually depends on `PaymentService`), keeping only topology-valid "Failure Propagation Edges."
- **Evidence Scoring:** It grades every service in the 60s incident window across 5 strict signals (Maximum 140 pts):
  1. Failed first (+30 pts)
  2. Upstream of affected service (+25 pts)
  3. Downstream propagation (+40 pts)
  4. P95 latency increased by >3× baseline (+20 pts)
  5. Repeated propagation across independent requests (+5 pts each, capped at +25)
- **Causal Output:** It outputs the final Root Cause, a statistical Confidence %, the main Propagation Chain (e.g., `PostgreSQL -> PaymentService -> OrderService`), and concrete Evidence. Confidence is computed by normalizing the final causal score against the maximum theoretical score and is capped at 95% to avoid false certainty.

### Resource-Centric RCA Fallback
When incidents are triggered by CPU or Memory anomalies and no statistically valid propagation chain can be constructed, Cortex falls back to a resource-centric RCA strategy.
The fallback engine ranks services by:
- Peak latency increase
- Error rate increase
- Request throughput increase
- Resource pressure contribution
- Temporal proximity to the anomaly

### 3. Comprehensive RCA Telemetry Breakdown
- **Incident Overview**: Title, Severity (`CRITICAL`, `HIGH`, `MEDIUM`), Status (`ACTIVE`, `RESOLVED`), Duration, and Root Cause.
- **Log Analytics**: Total logs count, error count, warning count, info/debug counts, first error timestamp, last error timestamp, and the **most frequent error message** with occurrence count.
- **System Metrics Analytics**: Peak CPU %, Average CPU %, Peak Memory (MB), Average Memory (MB), and snapshot counts.

### 3. Chronological Incident Event Timeline
Reconstructs a timestamped vertical event timeline highlighting key operational milestones:
- ⏱️ **Telemetry Collection Window Initiated** (Baseline timestamp)
- ⚠️ **First Error Log Detected** (Earliest error message & timestamp)
- 📈 **Metric Peak Recorded** (Highest CPU % / Memory MB peak timestamp)
- 🚨 **Incident Triggered** (Creation timestamp & trigger reason)
- ✅ **Incident Resolved** (Resolution timestamp & resolution reason)

### 4. Interactive RCA Dashboard Panel
Presents an enterprise-grade Incident Details Modal featuring a **Root Cause Diagnosis Card**, diagnostic KPI grid, interactive event timeline, and tabbed scoped views for incident-specific logs and hardware charts.

---

## 🚀 Setup & Installation

### 1. Database Configuration
Ensure your Neon PostgreSQL connection URL is configured.

### 2. Environment Variables
In `server/` (or project root `.env`), ensure `DATABASE_URL` is set:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://[user]:[password]@[neon-hostname]/[dbname]?sslmode=require
```

### 3. Running the Server & Client

#### Terminal 1: Start Backend (Port 5000)
```bash
cd server
npm install
npm run dev
```

#### Terminal 2: Start Client (Port 3000)
```bash
cd client
npm install
npm run dev
```

#### Open in Browser
👉 **`http://localhost:3000`**
