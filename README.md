# Cortex – AI-Powered Backend Observability & Root Cause Analysis Platform

## Task 1: Project Initialization

This is the baseline setup for the **Cortex** backend monitoring system built with **Node.js**, **Express.js**, and **ES Modules**.

---

## 📁 Project Architecture & Directory Structure

```
d:/Cortex/
├── .env                  # Environment variables
├── .env.example          # Environment template
├── .gitignore            # Git ignore rules
├── package.json          # Node package dependencies & scripts
├── README.md             # Project documentation
└── src/
    ├── app.js            # Express application configuration
    ├── server.js         # Entry point & server bootstrapping
    ├── config/           # Centralized environment configuration
    │   └── env.config.js
    ├── controllers/      # HTTP request controllers
    │   └── health.controller.js
    ├── routes/           # API routes definitions
    │   ├── index.js
    │   └── health.routes.js
    ├── services/         # Business logic layer (simulations, processing)
    │   └── .gitkeep
    ├── middlewares/      # Express middlewares (error handling, 404)
    │   └── error.middleware.js
    ├── workers/          # Background worker tasks
    │   └── .gitkeep
    ├── utils/            # Shared utilities (apiResponse, apiError)
    │   ├── apiError.js
    │   └── apiResponse.js
    └── data/
        └── temp/         # Temporary local storage for logs and metrics
            └── .gitkeep
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env` file (copied from `.env.example`):
```env
PORT=5000
NODE_ENV=development
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Health Check
Access health endpoint:
```http
GET http://localhost:5000/health
```

Sample Response:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Cortex backend server is healthy",
  "data": {
    "status": "UP",
    "uptime": 12.34,
    "timestamp": "2026-07-30T18:15:00.000Z",
    "environment": "development"
  }
}
```
