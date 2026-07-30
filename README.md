# Cortex: Real-Time Observability & Telemetry Dashboard

Cortex is a comprehensive, real-time observability platform designed to monitor system telemetry (Logs, CPU, and Memory usage) and automatically track system incidents. Built with a modern Node.js backend and a React frontend, Cortex uses event-driven WebSockets to provide instantaneous system insights.

## System Architecture

The project follows a standard decoupled monorepo architecture:

- **`server/`**: A Node.js and Express backend responsible for telemetry generation, data persistence via PostgreSQL (Neon), and real-time WebSocket streaming.
- **`client/`**: A React application utilizing Vite, styled with Tailwind CSS, providing a professional, high-performance UI.

### Data Persistence

All telemetry data is persisted in a Neon PostgreSQL database. The schema consists of three primary tables:

1. `logs`: Stores application logs with varying severity levels (INFO, WARN, ERROR, DEBUG).
2. `system_metrics`: Stores hardware utilization snapshots (CPU usage percentage and Memory usage in MB).
3. `incidents`: Tracks the lifecycle of system anomalies, categorizing them by type (`LOG`, `CPU`, or `MEMORY`).

### Real-Time WebSocket Streaming

Traditional polling mechanisms have been completely replaced with a true real-time, event-driven architecture using **Socket.io**.
Whenever the background workers successfully insert a new log or metric into the database, the backend immediately emits a WebSocket event (`new_log` or `new_metrics`) to all connected clients. The React frontend maintains a persistent connection, allowing the dashboard's summary cards, data tables, and charts to update instantaneously without requiring a page refresh.

---

## Telemetry Workers

The backend utilizes independent background workers running on a 10-second interval to simulate and collect telemetry data:

1. **Log Generator (`logGenerator.js`)**: Simulates application traffic by generating categorized log messages.
2. **Metrics Collector (`metricsCollector.js`)**: Interfaces directly with the host machine's Operating System via Node's native `os` module. It calculates accurate, real-time CPU utilization over the 10-second tick and measures the host's actual memory footprint.

---

## Smart Incident Tracking

Cortex features an automated incident management pipeline that intelligently groups related anomalies. To ensure precision, incident tracking is isolated into three independent streams:

### 1. Log Incidents

- **Trigger Condition**: An `ERROR` log is generated.
- **Resolution Condition**: A healthy `INFO` or `DEBUG` log is subsequently generated.

### 2. CPU Incidents

- **Trigger Condition**: Real-time CPU usage exceeds **80%**.
- **Resolution Condition**: Real-time CPU usage drops below **50%**.

### 3. Memory Incidents

- **Trigger Condition**: Real-time memory usage exceeds **90%** of total system capacity.
- **Resolution Condition**: Real-time memory usage normalizes below **70%**.

**Incident Isolation:** Because these three streams are tracked independently, a CPU incident and a Log incident can coexist simultaneously without overlapping or falsely resolving one another.

**Root-Cause Analysis (Time-Window Isolation):** When an active or past incident is selected in the UI sidebar, the main dashboard shifts from a live data feed to an isolated time-window. It queries the database to display only the specific logs and hardware metrics that occurred precisely **1 minute before and 1 minute after** the incident triggered, providing a clear context for root-cause analysis.

---

## User Interface Design

The frontend has been engineered for clarity, performance, and professional aesthetics:

- **Clean Aesthetic**: Utilizes a high-contrast, flat light theme optimized for readability, mirroring enterprise-grade administrative dashboards.
- **Dynamic Summary Cards**: Top-level metrics (Total Logs, Error Rate, CPU, Memory) aggregate data on the fly and update dynamically as WebSocket payloads arrive.
- **Chronological Area Charts**: Real-time hardware telemetry is plotted using Recharts. The line interpolation is configured for sharp, financial-style tracking, with new data points entering smoothly from the right side of the timeline.

---

## Setup & Installation

### 1. Database Configuration

Ensure your Neon PostgreSQL database has the correct schema.

### 2. Environment Variables

In the `server/` directory, ensure you have a `.env` file containing your database connection string:

```env
PORT=5000
DATABASE_URL=postgres://[user]:[password]@[neon-hostname]/[dbname]?sslmode=require
```

### 3. Running the Application

The repository utilizes `concurrently` from the root `package.json` to streamline the development workflow.
To install dependencies and start both the Node server and the Vite React app simultaneously:

```bash
# Install dependencies for both client and server
npm install

# Start both applications
npm run dev
```

For both frontend and backend

Navigate to `http://localhost:3000` to view the live dashboard.
