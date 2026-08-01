# Cortex: AI-Powered Backend Observability & Root Cause Analysis Platform

Cortex is a comprehensive, production-inspired backend observability platform designed to continuously monitor system telemetry (Logs, CPU, and Memory usage), automatically detect system anomalies, and perform **Root Cause Analysis (RCA)** with interactive event timelines. Built with a modular Node.js/Express backend, Neon PostgreSQL database, real-time WebSockets (Socket.io), and a modern React + Tailwind CSS dashboard.

---

## 🏗️ System Architecture

The project follows a clean, decoupled monorepo architecture:

- **`server/`**: Node.js & Express backend handling data ingestion, Neon PostgreSQL persistence, background worker telemetry generation, rule-based incident lifecycle management, RCA calculation engine, and real-time Socket.io streaming.
- **`client/`**: React application built with Vite and Tailwind CSS, featuring live telemetry summary cards, custom SVG time-series charts, log explorer, and interactive Root Cause Analysis (RCA) modals.

---

## 💾 Data Persistence Schema (Neon PostgreSQL)

1. `logs`: Stores application logs enriched with microservice telemetry fields for the Correlation Engine, including `service_name`, `request_id`, `event_type`, `endpoint`, `status_code`, `response_time_ms`, along with standard `timestamp` and severity levels.
2. `system_metrics`: Stores hardware resource utilization snapshots (`cpu_usage` percentage, `memory_usage_mb` footprint, `timestamp`).
3. `incidents`: Tracks the lifecycle of system anomalies (`id`, `type`, `status`, `trigger_reason`, `resolution_reason`, `created_at`, `resolved_at`).

---

## ⚙️ Background Telemetry Workers

1. **Log Generator (`logGenerator.js`)**: Simulates enriched microservice traffic scenarios (e.g., Database Timeout, Cache Miss) with correlation IDs and detailed logs on a 10-second tick interval.
2. **Metrics Collector (`metricsCollector.js`)**: Samples real-time CPU utilization and memory footprint via Node.js native `os` module on a 10-second tick interval.

---

## 🚨 Automated Incident Engine & Lifecycle

Cortex monitors real-time operational streams and automatically triggers and resolves incidents:

1. **LOG Incidents**: Triggers when an `ERROR` log is recorded; auto-resolves when healthy `INFO`/`DEBUG` logs follow.
2. **CPU Incidents**: Triggers when real-time CPU load exceeds **80%**; auto-resolves when CPU load normalizes below **50%**.
3. **MEMORY Incidents**: Triggers when memory usage exceeds **90%** of total capacity; auto-resolves when memory drops below **70%**.

---

## 🔍 Root Cause Analysis (RCA) Module

When any active or historical incident is selected on the dashboard, Cortex generates a deterministic **Root Cause Analysis (RCA)** report:

### 1. Telemetry Window Isolation
Queries all operational data recorded within a strict time window spanning exactly **60 seconds prior to incident trigger** up to the exact moment of creation.

### 2. Dynamic Root Cause Identification (Resource Strain Scoring)
Cortex dynamically determines the offending microservice (Root Cause) by scoring all telemetry logs in the 60-second window:
- **LOG Incidents:** Scores services based on sheer error volume (`score = error_count * 10`). Ties are broken chronologically by earliest failure.
- **CPU Incidents:** Identifies compute-bound services by calculating a base volume score plus a latency penalty (`response_time_ms / 100`).
- **MEMORY Incidents:** Identifies data-bound services by calculating a base volume score plus a massive +5 penalty for heavy data operations (e.g., `DATABASE_QUERY`, `CACHE_MISS`, `EXTERNAL_API`).

### 3. Comprehensive RCA Telemetry Breakdown
- **Incident Overview**: Title, Severity (`CRITICAL`, `HIGH`, `MEDIUM`), Status (`ACTIVE`, `RESOLVED`), Duration, Affected Service (Dynamically calculated via Strain Scoring), and Related Endpoint.
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
