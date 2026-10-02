# AI Support Orchestrator

An internal support console that uses a Gemini-powered investigation workflow to analyze customer tickets, propose remediation, and require engineer approval before executing an action.

## Features

- Ticket queue with filtering and live status updates
- Gemini investigation with database and API-log analysts
- Human approval workflow for refunds and payment retries
- Persistent LangGraph checkpoints backed by PostgreSQL
- Local mock commerce API for safe demonstrations

## Requirements

- Python 3.12+
- Node.js 18+
- PostgreSQL, including a database suitable for LangGraph checkpoints
- A Gemini API key for AI investigations

## Setup

### 1. Configure the backend

From `backend`, create a local environment file:

```powershell
Copy-Item .env.example .env
```

Fill in `DATABASE_URL`, `CHECKPOINT_DB_URL`, `JWT_SECRET`, and `GOOGLE_API_KEY`. Never commit `.env` or real credentials.

Install Python dependencies:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Seed the demo user and tickets:

```powershell
python seed.py
```

### 2. Start the mock commerce API

The approval workflow calls `/api/refund` and `/api/payments/retry`. For local development, start the included mock service in a separate terminal:

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python -m uvicorn mock_commerce:app --host 127.0.0.1 --port 9000
```

This mock service simulates successful actions and does not move real money.

### 3. Start the backend

In another terminal:

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python run.py
```

The API runs at `http://localhost:8000`. On Windows, use `python run.py`; it selects the event loop required by async Psycopg.

### 4. Start the frontend

In another terminal:

```powershell
cd frontend
npm install
npm run dev
```

The console runs at `http://localhost:5173`. Set `VITE_API_URL` in `frontend/.env.local` only when the backend is not running at `http://localhost:8000`.

Demo login:

```text
Email: admin@shop.io
Password: admin123
```

Change demo credentials before using the project outside local development.

## Validation

Frontend production build:

```powershell
cd frontend
npm run build
```

Backend syntax check:

```powershell
cd backend
python -m compileall -q app run.py seed.py
```

## Security

Keep database URLs, JWT secrets, and Gemini keys in ignored environment files. If a credential has ever been committed or shared, rotate it before pushing the repository to GitHub.
