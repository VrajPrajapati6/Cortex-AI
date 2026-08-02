# Cortex — Distributed Observability & Root Cause Analysis Platform

Welcome to **Cortex**! This document serves as the ultimate, exhaustive guide to the entire platform. Whether you are a newcomer to the repository, a developer looking to contribute, or a senior engineer reviewing the architectural decisions, this guide leaves no stone unturned. It explains every single component, algorithm, database table, mathematical scoring system, workflow, scenario, and telemetry specification—all in plain, easy-to-understand English.

---

## 1. The Core Problem: Why Does Cortex Exist?

In modern software engineering, monolithic applications are often broken down into dozens (or hundreds) of smaller pieces called **Microservices** (for example: a User Service, an Order Service, a Payment Service, an Authentication Service, a Redis cache, and a PostgreSQL database). 

While microservices make it much easier for large teams of developers to build and deploy software independently, they make it incredibly difficult to debug problems when things go wrong in production.

Consider this scenario: A user tries to place an order, but the website shows an error. 
- The **User Service** logs an error because the checkout failed.
- The **Order Service** logs an error because it couldn't secure payment.
- The **Payment Service** logs an error because it timed out.
- The **Database** logs an error because it ran out of connections.

If you are an on-call engineer, your dashboard just lit up with hundreds of red errors across four different services. Was the Order Service actually broken? Or did it fail because the Payment Service timed out? And did the Payment Service time out because the Database was too slow? 

**Cortex** is a complete, production-inspired Observability Platform built from scratch to solve this exact problem. Cortex does three main things autonomously:
1. **Continuously Monitors** your entire distributed system (Logs, CPU load, Memory footprint, and P95/P99 latency baselines).
2. **Automatically Detects Anomalies** and triggers "Incidents" when hardware or error thresholds are breached.
3. **Performs Root Cause Analysis (RCA)** deterministically. It uses graph traversal and evidence scoring to trace the failure through the maze of microservices, pinpoint the exact service that started the fire, and explain exactly why it made that conclusion with a confidence score and concrete evidence.

---

## 2. Comprehensive System Architecture & Tech Stack

Cortex is built using a modern, decoupled Monorepo architecture (where both the frontend UI and backend API live in the same repository but operate entirely independently).

### The Frontend (client/ folder)
The visual dashboard that engineers use to monitor the system in real-time.
- **React.js & Vite**: Modular user interface built with React, compiled at lightning speed with Vite.
- **Tailwind CSS**: Utility-first styling framework used for responsive, enterprise-grade dark-mode dashboard interfaces.
- **Socket.io-Client**: Maintains a persistent, bidirectional WebSocket connection with the backend. Graphs, tables, topology maps, and incident alerts update instantly without manual page refreshes.
- **Recharts**: High-performance charting library used to render live CPU and Memory utilization area graphs.
- **Lucide React**: Vector icons used throughout the metrics cards and diagnostic panels.

### The Backend (server/ folder)
The processing engine that ingests data, runs background telemetry workers, manages auto-initialization, executes the Scenario Engine, and computes RCA algorithms.
- **Node.js & Express.js**: RESTful API server handling telemetry queries, incident management, and trace fetching.
- **Neon PostgreSQL**: Serverless relational PostgreSQL database storing logs, system metrics, service performance baselines, and incidents. Uses the native `pg` library for optimized raw SQL queries.
- **Unified Scenario Engine (`server/src/scenario/`)**: Drives synthetic telemetry generation across microservices, request trace trees, workload volume scaling, and CPU/Memory metrics in cause-and-effect unison.
- **Auto DB Schema Initializer (`initDb.js`)**: Executes `CREATE TABLE IF NOT EXISTS` and `ALTER TABLE ADD COLUMN IF NOT EXISTS` for all 4 tables on server boot, ensuring zero manual setup for developers.
- **Socket.io**: Server-side WebSocket protocol broadcasting live telemetry logs and hardware metrics directly to the dashboard.

---

## 3. Microservices & Infrastructure Inventory

Cortex models a real-world enterprise microservices ecosystem consisting of **5 Business Workflows**, **11 Pre-configured Scenarios**, and **10 Services & Storage Engines**:

### Complete Services Breakdown (10 Components)

| # | Service / System | Role & Category | Primary Function | Upstream Callers | Downstream Dependencies |
| :-: | :--- | :--- | :--- | :--- | :--- |
| **1** | **`User Service`** | Gateway API | Public ingress gateway handling checkout, auth, search, & session routes. | *Client Ingress* | `Order Service`, `Search Service`, `Authentication Service` |
| **2** | **`Order Service`** | Domain API | Handles cart checkout, discount matrix calculations, & inventory holds. | `User Service` | `Payment Service`, `Inventory Service`, `PostgreSQL` |
| **3** | **`Payment Service`** | Financial API | Charges payment methods, calls 3rd-party gateways, & writes ledgers. | `Order Service` | `Redis`, `PostgreSQL` |
| **4** | **`Search Service`** | Discovery API | Manages search indexing, cache lookups, & catalog requests. | `User Service` | `Redis`, `Product Service` |
| **5** | **`Authentication Service`** | Identity API | Handles user login verification, JWT token signing, & session validation. | `User Service` | `Redis` |
| **6** | **`Product Service`** | Domain API | Provides product catalog info, product details, & availability metadata. | `Search Service` | *None* |
| **7** | **`Inventory Service`** | Domain API | Tracks product inventory counts, stock thresholds, & reserve holds. | `Order Service` | *None* |
| **8** | **`Notification Service`** | Utility API | Handles asynchronous user alerts, email notifications, & order confirmation dispatch. | `Order Service`, `Payment Service` | *None* |
| **9** | **`Redis`** | Cache Engine | In-memory key-value cache cluster for product lookups & session tokens. | `Search Service`, `Authentication Service`, `Payment Service` | *None* |
| **10** | **`PostgreSQL`** | Relational DB | Relational database for orders, transaction ledgers, & system metrics. | `Order Service`, `Payment Service` | *None* |

---

## 4. Logical Workflow & Scenario Telemetry Engine

Telemetry in Cortex is driven by a single source of truth: the **Scenario Engine** (`server/src/scenario/`). Rather than sampling local PC hardware independently, every telemetry window represents one coherent production state where logs, CPU load, RAM footprint, latencies, status codes, and network parameters move in cause-and-effect harmony.

### The 6-Stage System Engine Pipeline

$$\text{Business Workflow} \longrightarrow \text{Scenario} \longrightarrow \text{Incoming Request Volume} \longrightarrow \text{Request Execution} \longrightarrow \text{Sequential Logs} \longrightarrow \text{Generated Metrics}$$

1. **Step 1 — Workflow Selection**: First, select a business operation randomly from configurable probabilities (`ORDER_PLACEMENT`, `PAYMENT_PROCESSING`, `DATABASE_OPERATIONS`, `PRODUCT_SEARCH`, `USER_AUTH`).
2. **Step 2 — Scenario Selection**: Select a scenario owned *strictly* by that workflow (e.g., `Order Processing CPU Runaway` under `ORDER_PLACEMENT`).
3. **Step 3 — Request Volume Scaling**: Computes incoming user traffic volume (e.g. 140–220 users). Higher traffic volume dynamically scales target CPU % and Memory MB workload footprint.
4. **Step 4 — Sequential Request Execution**: Executes requests through realistic service chains (`User Service` $\rightarrow$ `Order Service` $\rightarrow$ `Payment Service` $\rightarrow$ `PostgreSQL`).
5. **Step 5 — Sequential Log Trail & Error Context**: Generates ordered log entries. Warnings precede errors in sequence, preserving real-world cause-and-effect debugging chains.
6. **Step 6 — Exponential Moving Average (EMA) Smoothing**: CPU and Memory metrics adjust smoothly across ticks ($\text{smoothCpu} = 0.4 \times \text{targetCpu} + 0.6 \times \text{prevCpu}$), generating organic hardware trends.

---

## 5. Comprehensive Workflow, Scenario & Telemetry Matrix

Below is the complete, high-level reference matrix covering all **5 Workflows** and **11 Scenarios**:

| Workflow | Scenario ID | Type | Root Cause | CPU Range | RAM Range | Latency Range | Failure % | Traffic (Users) | Parameter Matrix (Retry / Queue / DB / Cache / Network / Ext API) |
| :--- | :--- | :---: | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **`ORDER_PLACEMENT`** | **`HEALTHY_CHECKOUT`** | 🟢 `HEALTHY` | *None* | $18\% - 32\%$ | $3800 - 5200\text{MB}$ | $15 - 45\text{ms}$ | $0\%$ | $120 - 200$ | Retries: 0 \| Queue: 5-25 \| DB: `HEALTHY` \| Cache: `HIT` \| Net: `OPTIMAL` \| Ext API: `HEALTHY` |
| **`ORDER_PLACEMENT`** | **`CPU_RUNAWAY_SPIKE`** | 🟡 `DEGRADED` | `Order Service` | $82\% - 95\%$ | $4800 - 5800\text{MB}$ | $1200 - 2400\text{ms}$ | $15\%$ | $140 - 220$ | Retries: 1-3 \| Queue: 45-120 \| DB: `SLOW` \| Cache: `HIT` \| Net: `OPTIMAL` \| Ext API: `HEALTHY` |
| **`ORDER_PLACEMENT`** | **`INVENTORY_HOLD_FAILURE`** | 🔴 `FAILURE` | `Order Service` | $35\% - 55\%$ | $4200 - 5400\text{MB}$ | $450 - 950\text{ms}$ | $20\%$ | $110 - 170$ | Retries: 0-1 \| Queue: 15-40 \| DB: `HEALTHY` \| Cache: `HIT` \| Net: `OPTIMAL` \| Ext API: `HEALTHY` |
| **`PAYMENT_PROCESSING`** | **`PAYMENT_SUCCESS`** | 🟢 `HEALTHY` | *None* | $20\% - 35\%$ | $4000 - 5400\text{MB}$ | $25 - 65\text{ms}$ | $0\%$ | $130 - 210$ | Retries: 0 \| Queue: 8-30 \| DB: `HEALTHY` \| Cache: `HIT` \| Net: `OPTIMAL` \| Ext API: `HEALTHY` |
| **`PAYMENT_PROCESSING`** | **`PAYMENT_GATEWAY_TIMEOUT`** | 🔴 `FAILURE` | `Payment Service` | $72\% - 88\%$ | $6400 - 7800\text{MB}$ | $2500 - 4800\text{ms}$ | $25\%$ | $100 - 180$ | Retries: 2-5 \| Queue: 80-180 \| DB: `HEALTHY` \| Cache: `HIT` \| Net: `CONGESTED` \| Ext API: `SLOW` |
| **`PAYMENT_PROCESSING`** | **`GATEWAY_CONNECTION_REFUSED`** | 🔴 `FAILURE` | `Payment Service` | $60\% - 75\%$ | $5800 - 6800\text{MB}$ | $1800 - 3200\text{ms}$ | $30\%$ | $90 - 160$ | Retries: 1-4 \| Queue: 60-130 \| DB: `HEALTHY` \| Cache: `HIT` \| Net: `JITTER` \| Ext API: `DOWN` |
| **`DATABASE_OPERATIONS`** | **`HEALTHY_DB_QUERY`** | 🟢 `HEALTHY` | *None* | $15\% - 28\%$ | $3600 - 4800\text{MB}$ | $8 - 25\text{ms}$ | $0\%$ | $160 - 240$ | Retries: 0 \| Queue: 4-20 \| DB: `HEALTHY` \| Cache: `HIT` \| Net: `OPTIMAL` \| Ext API: `HEALTHY` |
| **`DATABASE_OPERATIONS`** | **`SLOW_DB_QUERY`** | 🟡 `DEGRADED` | `PostgreSQL` | $65\% - 82\%$ | $6200 - 7600\text{MB}$ | $1500 - 3100\text{ms}$ | $12\%$ | $120 - 190$ | Retries: 1-2 \| Queue: 35-90 \| DB: `SLOW` \| Cache: `HIT` \| Net: `OPTIMAL` \| Ext API: `HEALTHY` |
| **`DATABASE_OPERATIONS`** | **`DATABASE_POOL_EXHAUSTION`** | 🔴 `CRITICAL` | `PostgreSQL` | $86\% - 97\%$ | $8900 - 9800\text{MB}$ | $3200 - 5500\text{ms}$ | $35\%$ | $80 - 150$ | Retries: 3-6 \| Queue: 110-220 \| DB: `EXHAUSTED` \| Cache: `HIT` \| Net: `OPTIMAL` \| Ext API: `HEALTHY` |
| **`PRODUCT_SEARCH`** | **`HEALTHY_SEARCH`** | 🟢 `HEALTHY` | *None* | $15\% - 28\%$ | $3600 - 4800\text{MB}$ | $10 - 35\text{ms}$ | $0\%$ | $150 - 250$ | Retries: 0 \| Queue: 5-25 \| DB: `HEALTHY` \| Cache: `HIT` \| Net: `OPTIMAL` \| Ext API: `HEALTHY` |
| **`PRODUCT_SEARCH`** | **`CACHE_MISS_STORM`** | 🟡 `DEGRADED` | `Redis` | $68\% - 84\%$ | $5900 - 7200\text{MB}$ | $1100 - 2300\text{ms}$ | $15\%$ | $130 - 210$ | Retries: 1-3 \| Queue: 50-140 \| DB: `HEALTHY` \| Cache: `MISS_STORM` \| Net: `JITTER` \| Ext API: `HEALTHY` |
| **`USER_AUTH`** | **`SUCCESSFUL_LOGIN`** | 🟢 `HEALTHY` | *None* | $14\% - 26\%$ | $3500 - 4600\text{MB}$ | $12 - 38\text{ms}$ | $0\%$ | $140 - 220$ | Retries: 0 \| Queue: 5-20 \| DB: `HEALTHY` \| Cache: `HIT` \| Net: `OPTIMAL` \| Ext API: `HEALTHY` |
| **`USER_AUTH`** | **`AUTH_SERVICE_DOWN`** | 🔴 `FAILURE` | `Authentication Service` | $70\% - 85\%$ | $6100 - 7300\text{MB}$ | $2100 - 3800\text{ms}$ | $30\%$ | $100 - 170$ | Retries: 2-4 \| Queue: 70-150 \| DB: `HEALTHY` \| Cache: `EVICT` \| Net: `JITTER` \| Ext API: `SLOW` |

---

### Detailed Workflow & Scenario Breakdowns

#### Workflow 1: `ORDER_PLACEMENT` (Place Order & Checkout)
- **Description**: Handles user checkout, order creation, discount matrix evaluation, inventory reservation, and order confirmation dispatch.
- **Default Service Topology Chain**: `User Service` $\rightarrow$ `Order Service` $\rightarrow$ `Inventory Service` $\rightarrow$ `Notification Service`

##### Scenarios under `ORDER_PLACEMENT`:
1. **`HEALTHY_CHECKOUT`** (Type: `HEALTHY`, Severity: `INFO`)
   - **Root Cause**: `NONE` (System operates normally)
   - **Telemetry Limits**: CPU $18\% - 32\%$, RAM $3800 - 5200\text{MB}$, Latency $15 - 45\text{ms}$, Failure Prob $0\%$, Traffic $120 - 200\text{ users}$.
   - **Parameter Matrix**: Retry Count $0$, Queue Length $5 - 25$, DB: `HEALTHY`, Cache: `HIT`, Network: `OPTIMAL`, External API: `HEALTHY`.
   - **Sequential Log Chain**:
     1. `User Service` [`INFO`, Status 200, Delay 0ms]: "Incoming POST request to place new order."
     2. `Order Service` [`INFO`, Status 200, Delay 15ms]: "Executing SQL: INSERT INTO orders (user_id, total)."
     3. `Payment Service` [`INFO`, Status 200, Delay 35ms]: "Processing credit card charge via payment gateway."
     4. `Notification Service` [`INFO`, Status 200, Delay 20ms]: "Order confirmation email queued for dispatch."

2. **`CPU_RUNAWAY_SPIKE`** (Type: `DEGRADED`, Severity: `WARN`)
   - **Root Cause**: `Order Service`
   - **Affected Services**: `Order Service`
   - **Telemetry Limits**: CPU $82\% - 95\%$, RAM $4800 - 5800\text{MB}$, Latency $1200 - 2400\text{ms}$, Failure Prob $15\%$, Traffic $140 - 220\text{ users}$.
   - **Parameter Matrix**: Retry Count $1 - 3$, Queue Length $45 - 120$, DB: `SLOW`, Cache: `HIT`, Network: `OPTIMAL`, External API: `HEALTHY`.
   - **Sequential Log Chain**:
     1. `User Service` [`INFO`, Status 200, Delay 0ms]: "Incoming POST request to place new order."
     2. `Order Service` [`WARN`, Status 200, Delay 180ms]: "High CPU utilization during discount matrix calculation."
     3. `Payment Service` [`INFO`, Status 200, Delay 40ms]: "Processing credit card charge via payment gateway."

3. **`INVENTORY_HOLD_FAILURE`** (Type: `FAILURE`, Severity: `ERROR`)
   - **Root Cause**: `Order Service`
   - **Affected Services**: `Order Service`
   - **Telemetry Limits**: CPU $35\% - 55\%$, RAM $4200 - 5400\text{MB}$, Latency $450 - 950\text{ms}$, Failure Prob $20\%$, Traffic $110 - 170\text{ users}$.
   - **Parameter Matrix**: Retry Count $0 - 1$, Queue Length $15 - 40$, DB: `HEALTHY`, Cache: `HIT`, Network: `OPTIMAL`, External API: `HEALTHY`.
   - **Sequential Log Chain**:
     1. `User Service` [`INFO`, Status 200, Delay 0ms]: "Incoming POST request to place new order."
     2. `Order Service` [`WARN`, Status 200, Delay 30ms]: "Low inventory threshold detected for SKU-9921."
     3. `Order Service` [`ERROR`, Status 400, Delay 85ms]: "Inventory reservation failed: Stock SKU-9921 exhausted."

---

#### Workflow 2: `PAYMENT_PROCESSING` (Payment Gateway Processing)
- **Description**: Executes payment authorizations, invokes 3rd-party credit card gateways, handles network retries, and records transaction ledgers in PostgreSQL.
- **Default Service Topology Chain**: `User Service` $\rightarrow$ `Order Service` $\rightarrow$ `Payment Service` $\rightarrow$ `PostgreSQL` $\rightarrow$ `Notification Service`

##### Scenarios under `PAYMENT_PROCESSING`:
1. **`PAYMENT_SUCCESS`** (Type: `HEALTHY`, Severity: `INFO`)
   - **Root Cause**: `NONE`
   - **Telemetry Limits**: CPU $20\% - 35\%$, RAM $4000 - 5400\text{MB}$, Latency $25 - 65\text{ms}$, Failure Prob $0\%$, Traffic $130 - 210\text{ users}$.
   - **Parameter Matrix**: Retry Count $0$, Queue Length $8 - 30$, DB: `HEALTHY`, Cache: `HIT`, Network: `OPTIMAL`, External API: `HEALTHY`.
   - **Sequential Log Chain**:
     1. `User Service` [`INFO`, Status 200, Delay 0ms]: "Initiating payment authorization."
     2. `Payment Service` [`INFO`, Status 200, Delay 45ms]: "Payment gateway authorized transaction."
     3. `PostgreSQL` [`INFO`, Status 200, Delay 15ms]: "Ledger transaction record committed."

2. **`PAYMENT_GATEWAY_TIMEOUT`** (Type: `FAILURE`, Severity: `ERROR`)
   - **Root Cause**: `Payment Service`
   - **Affected Services**: `Payment Service`, `Order Service`, `User Service`
   - **Telemetry Limits**: CPU $72\% - 88\%$, RAM $6400 - 7800\text{MB}$, Latency $2500 - 4800\text{ms}$, Failure Prob $25\%$, Traffic $100 - 180\text{ users}$.
   - **Parameter Matrix**: Retry Count $2 - 5$, Queue Length $80 - 180$, DB: `HEALTHY`, Cache: `HIT`, Network: `CONGESTED`, External API: `SLOW`.
   - **Sequential Log Chain**:
     1. `User Service` [`INFO`, Status 200, Delay 0ms]: "User initiated checkout process."
     2. `Order Service` [`INFO`, Status 200, Delay 15ms]: "User initiated order placement."
     3. `Payment Service` [`WARN`, Status 200, Delay 120ms]: "Payment gateway latency exceeding 3000ms threshold, initiating retry..."
     4. `Payment Service` [`ERROR`, Status 504, Delay 220ms]: "Payment gateway timeout after 5000ms: Connection refused."
     5. `Order Service` [`ERROR`, Status 400, Delay 30ms]: "Order payment failed. Reverting inventory hold."

3. **`GATEWAY_CONNECTION_REFUSED`** (Type: `FAILURE`, Severity: `ERROR`)
   - **Root Cause**: `Payment Service`
   - **Affected Services**: `Payment Service`
   - **Telemetry Limits**: CPU $60\% - 75\%$, RAM $5800 - 6800\text{MB}$, Latency $1800 - 3200\text{ms}$, Failure Prob $30\%$, Traffic $90 - 160\text{ users}$.
   - **Parameter Matrix**: Retry Count $1 - 4$, Queue Length $60 - 130$, DB: `HEALTHY`, Cache: `HIT`, Network: `JITTER`, External API: `DOWN`.
   - **Sequential Log Chain**:
     1. `Payment Service` [`WARN`, Status 200, Delay 40ms]: "Gateway socket connection unstable."
     2. `Payment Service` [`ERROR`, Status 502, Delay 150ms]: "Third party gateway socket closed unexpectedly."

---

#### Workflow 3: `DATABASE_OPERATIONS` (Database Access & Operations)
- **Description**: Manages complex relational SQL transactions, indexing checks, and database connection pool allocation.
- **Default Service Topology Chain**: `Order Service` $\rightarrow$ `Payment Service` $\rightarrow$ `PostgreSQL`

##### Scenarios under `DATABASE_OPERATIONS`:
1. **`HEALTHY_DB_QUERY`** (Type: `HEALTHY`, Severity: `INFO`)
   - **Root Cause**: `NONE`
   - **Telemetry Limits**: CPU $15\% - 28\%$, RAM $3600 - 4800\text{MB}$, Latency $8 - 25\text{ms}$, Failure Prob $0\%$, Traffic $160 - 240\text{ users}$.
   - **Parameter Matrix**: Retry Count $0$, Queue Length $4 - 20$, DB: `HEALTHY`, Cache: `HIT`, Network: `OPTIMAL`, External API: `HEALTHY`.
   - **Sequential Log Chain**:
     1. `Order Service` [`INFO`, Status 200, Delay 12ms]: "Indexed lookup query executed in 12ms."
     2. `PostgreSQL` [`INFO`, Status 200, Delay 8ms]: "PostgreSQL connection pool healthy (4/50 active)."

2. **`SLOW_DB_QUERY`** (Type: `DEGRADED`, Severity: `WARN`)
   - **Root Cause**: `PostgreSQL`
   - **Affected Services**: `PostgreSQL`
   - **Telemetry Limits**: CPU $65\% - 82\%$, RAM $6200 - 7600\text{MB}$, Latency $1500 - 3100\text{ms}$, Failure Prob $12\%$, Traffic $120 - 190\text{ users}$.
   - **Parameter Matrix**: Retry Count $1 - 2$, Queue Length $35 - 90$, DB: `SLOW`, Cache: `HIT`, Network: `OPTIMAL`, External API: `HEALTHY`.
   - **Sequential Log Chain**:
     1. `PostgreSQL` [`WARN`, Status 200, Delay 240ms]: "Sequential scan detected on unindexed table query."

3. **`DATABASE_POOL_EXHAUSTION`** (Type: `CRITICAL`, Severity: `CRITICAL`)
   - **Root Cause**: `PostgreSQL`
   - **Affected Services**: `PostgreSQL`, `Payment Service`, `Order Service`
   - **Telemetry Limits**: CPU $86\% - 97\%$, RAM $8900 - 9800\text{MB}$, Latency $3200 - 5500\text{ms}$, Failure Prob $35\%$, Traffic $80 - 150\text{ users}$.
   - **Parameter Matrix**: Retry Count $3 - 6$, Queue Length $110 - 220$, DB: `EXHAUSTED`, Cache: `HIT`, Network: `OPTIMAL`, External API: `HEALTHY`.
   - **Sequential Log Chain**:
     1. `Order Service` [`INFO`, Status 200, Delay 0ms]: "Order status query requested."
     2. `Payment Service` [`INFO`, Status 200, Delay 15ms]: "Fetching ledger history from database."
     3. `PostgreSQL` [`WARN`, Status 200, Delay 120ms]: "PostgreSQL connection pool approaching capacity limits (48/50 active)."
     4. `PostgreSQL` [`ERROR`, Status 500, Delay 350ms]: "Database query took too long: Pool client acquisition timeout."
     5. `Payment Service` [`ERROR`, Status 500, Delay 50ms]: "Payment failed due to database connection timeout."
     6. `Order Service` [`ERROR`, Status 500, Delay 30ms]: "Order query failed due to upstream database exhaustion."

---

#### Workflow 4: `PRODUCT_SEARCH` (Product Search & Discovery)
- **Description**: Handles catalog browsing, product search indexing, and Redis cache lookups.
- **Default Service Topology Chain**: `User Service` $\rightarrow$ `Search Service` $\rightarrow$ `Redis` $\rightarrow$ `Product Service`

##### Scenarios under `PRODUCT_SEARCH`:
1. **`HEALTHY_SEARCH`** (Type: `HEALTHY`, Severity: `INFO`)
   - **Root Cause**: `NONE`
   - **Telemetry Limits**: CPU $15\% - 28\%$, RAM $3600 - 4800\text{MB}$, Latency $10 - 35\text{ms}$, Failure Prob $0\%$, Traffic $150 - 250\text{ users}$.
   - **Parameter Matrix**: Retry Count $0$, Queue Length $5 - 25$, DB: `HEALTHY`, Cache: `HIT`, Network: `OPTIMAL`, External API: `HEALTHY`.
   - **Sequential Log Chain**:
     1. `User Service` [`INFO`, Status 200, Delay 0ms]: "User initiated product search query."
     2. `Search Service` [`INFO`, Status 200, Delay 8ms]: "Cache hit in Redis cluster. Returning cached products."
     3. `Product Service` [`INFO`, Status 200, Delay 12ms]: "Retrieved 24 products for catalog view."

2. **`CACHE_MISS_STORM`** (Type: `DEGRADED`, Severity: `WARN`)
   - **Root Cause**: `Redis`
   - **Affected Services**: `Redis`, `Product Service`
   - **Telemetry Limits**: CPU $68\% - 84\%$, RAM $5900 - 7200\text{MB}$, Latency $1100 - 2300\text{ms}$, Failure Prob $15\%$, Traffic $130 - 210\text{ users}$.
   - **Parameter Matrix**: Retry Count $1 - 3$, Queue Length $50 - 140$, DB: `HEALTHY`, Cache: `MISS_STORM`, Network: `JITTER`, External API: `HEALTHY`.
   - **Sequential Log Chain**:
     1. `Search Service` [`WARN`, Status 200, Delay 140ms]: "Cache miss storm on hot product key: redis-cluster-01."

---

#### Workflow 5: `USER_AUTH` (User Authentication)
- **Description**: Manages user authentication, password verification, JWT session token creation, and token revocation.
- **Default Service Topology Chain**: `User Service` $\rightarrow$ `Authentication Service` $\rightarrow$ `Redis`

##### Scenarios under `USER_AUTH`:
1. **`SUCCESSFUL_LOGIN`** (Type: `HEALTHY`, Severity: `INFO`)
   - **Root Cause**: `NONE`
   - **Telemetry Limits**: CPU $14\% - 26\%$, RAM $3500 - 4600\text{MB}$, Latency $12 - 38\text{ms}$, Failure Prob $0\%$, Traffic $140 - 220\text{ users}$.
   - **Parameter Matrix**: Retry Count $0$, Queue Length $5 - 20$, DB: `HEALTHY`, Cache: `HIT`, Network: `OPTIMAL`, External API: `HEALTHY`.
   - **Sequential Log Chain**:
     1. `User Service` [`INFO`, Status 200, Delay 0ms]: "User login request received."
     2. `Authentication Service` [`INFO`, Status 200, Delay 18ms]: "JWT token signed and session established."

2. **`AUTH_SERVICE_DOWN`** (Type: `FAILURE`, Severity: `ERROR`)
   - **Root Cause**: `Authentication Service`
   - **Affected Services**: `Authentication Service`, `User Service`
   - **Telemetry Limits**: CPU $70\% - 85\%$, RAM $6100 - 7300\text{MB}$, Latency $2100 - 3800\text{ms}$, Failure Prob $30\%$, Traffic $100 - 170\text{ users}$.
   - **Parameter Matrix**: Retry Count $2 - 4$, Queue Length $70 - 150$, DB: `HEALTHY`, Cache: `EVICT`, Network: `JITTER`, External API: `SLOW`.
   - **Sequential Log Chain**:
     1. `User Service` [`INFO`, Status 200, Delay 0ms]: "User login request received."
     2. `Authentication Service` [`WARN`, Status 200, Delay 90ms]: "Auth service verification delay exceeding 1500ms."
     3. `Authentication Service` [`ERROR`, Status 500, Delay 190ms]: "Auth service secret key verification failure."

---

## 6. Database Schema (In-Depth)

To support real-time observability, distributed tracing, and RCA scoring, Cortex relies on four relational database tables.

### A. The `logs` Table
Stores every event across all microservices in real-time with distributed trace context.
- `id`: UUID primary key.
- `request_id`: Unique ID assigned to a user request chain (e.g. `REQ-20260802-A563-000001`). All services invoked during this request share the same ID.
- `span_id`: Unique ID for the specific step/function in the execution tree.
- `parent_span_id`: References the calling service's `span_id`, building hierarchical trace execution trees.
- `service_name`: Microservice name (`User Service`, `Order Service`, `Payment Service`, `Search Service`, `Authentication Service`, `Redis`, `PostgreSQL`).
- `event_type`: Event category (`API_REQUEST`, `DATABASE_QUERY`, `PAYMENT`, `CACHE_ACCESS`, `AUTH`, `NOTIFICATION`, `SYSTEM`).
- `endpoint`: API route or query endpoint (`/api/v1/payments/charge`).
- `status_code`: HTTP status code (e.g. 200, 400, 500, 504).
- `response_time_ms`: Function execution duration in milliseconds.
- `level`: Log severity level (`INFO`, `WARN`, `ERROR`, `DEBUG`).
- `message`: Log entry description text.
- `timestamp`: Precise millisecond timestamp of entry.

### B. The `system_metrics` Table
Snapshots of hardware resources.
- `id`: Primary key.
- `cpu_usage`: Synthetic CPU usage percentage (0–100%).
- `memory_usage_mb`: Synthetic RAM memory consumed in Megabytes.
- `timestamp`: Snapshot timestamp.

### C. The `service_metrics` Table
Stores historical baseline performance per microservice calculated by background aggregators.
- `id`: Primary key.
- `service_name`: Specific microservice name.
- `request_count`: Total requests processed in the aggregation window.
- `error_rate`: Percentage of failed requests ($\frac{\text{errorCount}}{\text{totalCount}} \times 100\%$).
- `avg_latency`: Average execution speed (ms).
- `p95_latency`: 95th Percentile latency (ms). 95% of requests ran faster than this benchmark.
- `p99_latency`: 99th Percentile latency (ms).
- `timestamp`: Aggregation window timestamp.

### D. The `incidents` Table
Tracks system outage lifecycles.
- `id`: UUID primary key.
- `type`: Incident category (`LOG`, `CPU`, `MEMORY`).
- `status`: State (`ACTIVE` or `RESOLVED`).
- `trigger_reason`: Explanation of why Cortex opened the incident.
- `resolution_reason`: Explanation of why Cortex auto-resolved it.
- `created_at` & `resolved_at`: Outage duration timestamps.

---

## 7. Background Telemetry Workers

Cortex uses three background scripts ("Workers") running continuously on the server:

### 1. The Log Generator (`logGenerator.js`)
- **Interval**: Runs every **10 seconds**.
- **Function**: Executes 2 complete user interaction request batches per tick driven by active Workflow $\rightarrow$ Scenario state.
- **Trace Tree Math**: Generates shared `request_id` hashes, assigns parent-child `span_id` references, staggers start times, and dynamically calculates parent response times so child durations are cleanly encapsulated within parent execution spans.

### 2. The Metrics Collector (`metricsCollector.js`)
- **Interval**: Runs every **10 seconds**.
- **Function**: Fetches synthetic CPU % and Memory MB metrics from `scenarioEngine.getCurrentTelemetryState()`, applies EMA smoothing, writes snapshots to `system_metrics`, and streams live updates via WebSockets.

### 3. The Latency Aggregator (`latencyAggregator.js`)
- **Interval**: Runs every **60 seconds**.
- **Function**: Aggregates raw logs from the preceding 60 seconds, groups by service, computes exact **P95 and P99 latencies** and error rates, and updates `service_metrics` baselines.

---

## 8. Live Service Map & Topology Dependency Graph

### A. Live Service Health Map (SLOs)
Renders real-time microservice health based on rolling error rates and latency vs. 15-minute baselines:
- 🟢 **Healthy**: Error rate $< 1\%$, latency within baseline limits.
- 🟡 **Degraded**: Error rate $\ge 1\%$ OR latency $> 2\times$ baseline.
- 🔴 **Critical**: Error rate $> 5\%$ OR latency $> 5\times$ baseline.

### B. Topology Dependency Graph with Pulsing Failure Edges
- Draws an interactive SVG map of microservice dependencies (`User Service` $\rightarrow$ `Order Service` $\rightarrow$ `Payment Service` $\rightarrow$ `Redis` / `PostgreSQL`).
- **Active Failure Propagation Edges**: If an error spreads between two services within the last 60 seconds, the connecting edge **glows bright crimson red and pulses in real time**, indicating the active blast radius of the outage.

---

## 9. Mathematical Root Cause Analysis (RCA) Engine

When an incident occurs, `rcaService.js` executes a deterministic RCA analysis across all services involved in the outage window. The engine is **100% generic** and evaluates raw database telemetry without hardcoded scenario shortcuts.

### Step 1: Isolation Window ($\pm 60$ Seconds)
Draws a time window from `created_at - 60 seconds` to `(resolved_at || NOW) + 60 seconds` to capture pre-incident lead-up events and live updates.

### Step 2: Trace Tree Reconstruction
Groups window telemetry by `request_id`, linking `span_id` and `parent_span_id` to reconstruct the exact microservice execution hierarchy.

### Step 3: The 140-Point Evidence Scoring System (`scoringService.js`)
Evaluates candidate services using a 5-rule rubric:

$$\text{Total Score} = \text{FirstFail (30)} + \text{Upstream (25)} + \text{Propagation (40+25)} + \text{LatencySpike (20)}$$

1. **First to Fail (+30 pts)**: Service logged the chronologically earliest `ERROR` log in the isolation window.
2. **Upstream Dependency Tree Position (+25 pts)**: Uses deep recursive graph traversal ([evidenceService.js](file:///d:/Cortex/server/src/services/evidenceService.js)) down `dependencies.js`. Any deep underlying dependency (`Payment Service`, `PostgreSQL`, `Redis`) earns **+25 points**.
3. **Downstream Error Propagation (+40 pts)**: Service failure traveled upward and broke calling upstream services.
4. **Propagation Multiplier (+5 to +25 pts)**: $+5$ points per impacted downstream service (capped at 5 services).
5. **Latency Degradation (+20 pts)**: Service latency spiked $>2\times$ its 15-minute baseline.

---

## 10. Microservice & Incident Log Explorer

The dashboard provides a log exploration table supporting both global live streaming and isolated incident window trails:
- **Real-Time Keyword Search**: Search across log messages, Request IDs, service names, and endpoints.
- **Log Level Filters**: Filter by `ALL`, `INFO`, `WARN`, `ERROR`, or `DEBUG`.
- **Service Name Filter**: Target specific microservices (`Payment Service`, `Order Service`, `PostgreSQL`, etc.).
- **Event Type Filter**: Filter by category (`API_REQUEST`, `DATABASE_QUERY`, `PAYMENT`, `CACHE_ACCESS`, `AUTH`).
- **Single-Row Controls Layout**: Header layout separates title and record counts vertically while aligning all filter dropdowns cleanly in a single horizontal row.

---

## 11. Incident Impact Diff & Distributed Trace Explorer

### Incident Impact Diff (Before vs. During)
Compares the root cause service's 15-minute pre-incident baseline metrics to active incident metrics, displaying percentage shifts (e.g. `P95 Latency increased by +2233%`).

### Distributed Trace Explorer (Waterfall Gantt View)
Clicking any `Request ID` opens a modal rendering a horizontal Gantt chart:
- Visualizes start offsets and call durations for each service span.
- Illustrates network call nesting (e.g. `User Service` waiting for `Order Service`).
- Highlights failing spans in crimson red.

---

## 12. Codebase Directory Structure

```text
Cortex Monorepo Structure
│
├── client/ (React Frontend)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx                 # Top bar & live WebSocket status
│   │   │   ├── SummaryCards.jsx           # Telemetry count, CPU load, RAM, Error rate
│   │   │   ├── MetricsCharts.jsx          # Live CPU & Memory Recharts area graphs
│   │   │   ├── ServiceHealthMap.jsx       # Grid of microservice SLO indicators
│   │   │   ├── TopologyGraph.jsx          # SVG map with active failure propagation edges
│   │   │   ├── LogsTable.jsx              # Microservice & Incident log trail explorer
│   │   │   ├── IncidentsList.jsx          # Outage history sidebar cards
│   │   │   ├── IncidentRcaModal.jsx       # Root cause diagnostic modal & impact diff
│   │   │   └── TraceExplorerModal.jsx    # Waterfall Gantt chart for distributed tracing
│   │   ├── App.jsx                        # Main dashboard state & WebSockets
│   │   └── main.jsx                       # Entry point
│
└── server/ (Node.js Backend)
    ├── src/
    │   ├── config/
    │   │   ├── db.js                      # Neon PostgreSQL pool setup
    │   │   ├── initDb.js                  # Auto-executes CREATE TABLE IF NOT EXISTS on boot
    │   │   ├── dependencies.js            # Microservice topology mapping
    │   │   ├── env.config.js              # Environment variables
    │   │   └── socket.js                  # Socket.io WebSocket server
    │   ├── scenario/                      # Unified Scenario Telemetry Engine
    │   │   ├── scenario.constants.js      # Timing ratios, durations, phase definitions
    │   │   ├── scenario.types.js          # JSDoc interfaces
    │   │   ├── workflow.registry.js       # Business Workflows Registry
    │   │   ├── scenario.registry.js       # Workflow-Owned Scenarios & Telemetry Matrix
    │   │   ├── scenario.state.js          # 2-Step Hierarchy State & EMA Smoothing
    │   │   ├── scenario.engine.js         # Request Batching & Trace Tree Calculations
    │   │   ├── scenario.utils.js          # Math helpers & cryptographic request IDs
    │   │   └── index.js                   # Barrel exports
    │   ├── controllers/                   # API handlers (Health, Topology, Incidents, Traces)
    │   ├── services/                      # Modular Business & Diagnostic Logic
    │   │   ├── rcaService.js              # RCA execution & propagation chain traversal
    │   │   ├── scoringService.js          # 140-Point evidence scoring algorithm
    │   │   ├── evidenceService.js         # Gathers 5 diagnostic rubric metrics with deep DFS graph
    │   │   ├── propagationService.js      # Detects active error edges across requests
    │   │   └── correlationService.js      # Fetches log windows & groups spans by request_id
    │   ├── workers/
    │   │   ├── logGenerator.js            # Executes scenario-driven trace tree request batches
    │   │   ├── metricsCollector.js        # Reads scenario state with EMA trend smoothing
    │   │   └── latencyAggregator.js       # Calculates P95/P99 latency baselines (60s)
    │   ├── app.js                         # Express app configuration & middleware
    │   └── server.js                      # Entry point (App listen, initDb, launch workers)
```

---

## 13. Setup & Local Installation Guide

### Prerequisites
- Node.js (v18 or higher)
- A Neon PostgreSQL Database connection string (`postgresql://...`)

### 1. Configure Backend Environment
Create a `.env` file inside `server/`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://[user]:[password]@[neon-hostname]/[dbname]?sslmode=require
```

### 2. Run Backend Server (Terminal 1)
```bash
cd server
npm install
npm run dev
```
*Note: The backend automatically executes `initDb.js` on boot, creating all 4 database tables (`logs`, `system_metrics`, `service_metrics`, `incidents`) if missing, and immediately starts data workers.*

### 3. Run Frontend Dashboard (Terminal 2)
```bash
cd client
npm install
npm run dev
```
*Note: The dashboard opens on `http://localhost:5173` or `http://localhost:3000`.*

---

End of Documentation  
Cortex represents a massive undertaking in understanding distributed systems, telemetry generation, algorithmic graph traversal, and real-time frontend data visualization. Enjoy exploring the code!