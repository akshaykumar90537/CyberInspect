# CyberInspect AI — Local Setup Guide (No Docker)

## How Frontend ↔ Backend connect locally

```
Browser (localhost:3000)
        │
        │  /api/v1/*  (HTTP)
        ▼
Next.js Dev Server (localhost:3000)
        │
        │  Proxy rewrites → forwards to backend
        ▼
FastAPI Backend (localhost:8000)
        │
        ├── PostgreSQL (localhost:5432)
        └── Redis      (localhost:6379)

WebSocket (ws://localhost:8000/ws/scan/{id})
        │  Direct connection — browser → backend
        └── (Next.js cannot proxy WebSocket)
```

## Step 1 — Install Prerequisites

| Tool       | Version | Download |
|------------|---------|----------|
| Node.js    | 20+     | https://nodejs.org (choose LTS) |
| Python     | 3.11+   | https://python.org |
| PostgreSQL | 15+     | https://postgresql.org/download |
| Redis      | 7+      | Windows: https://github.com/microsoftarchive/redis/releases |

## Step 2 — Create the Database

Open pgAdmin or psql and run:
```sql
CREATE DATABASE cyberinspectdb;
CREATE USER cyberinspect WITH PASSWORD 'cyberinspectpassword';
GRANT ALL PRIVILEGES ON DATABASE cyberinspectdb TO cyberinspect;
```

## Step 3 — Configure .env

```bash
cp .env.example .env
```

Minimum required changes in `.env`:
```bash
# Generate this: python -c "import secrets; print(secrets.token_hex(32))"
JWT_SECRET_KEY=your_generated_secret_here
```

Everything else works with default values.

## Step 4 — Start the Backend

Open Terminal 1:
```bash
cd backend

# First time only
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

pip install -r requirements.txt
alembic upgrade head          # Creates all database tables

# Every time
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Verify backend is running: http://localhost:8000/health
API docs: http://localhost:8000/docs

## Step 5 — Start the Frontend

Open Terminal 2:
```bash
cd frontend
npm install          # First time only
npm run dev
```

Open: http://localhost:3000

## Step 6 — Verify Connection

The top bar of the dashboard shows a small indicator:
- 🟢 "Backend connected" — everything working
- 🔴 "Backend offline"   — backend not running, check Terminal 1

## Every Day Usage

```
Terminal 1: cd backend && venv\Scripts\activate && uvicorn app.main:app --reload --port 8000
Terminal 2: cd frontend && npm run dev
```

Then open: http://localhost:3000

## Ports Used

| Service    | Port | URL |
|------------|------|-----|
| Frontend   | 3000 | http://localhost:3000 |
| Backend    | 8000 | http://localhost:8000 |
| API Docs   | 8000 | http://localhost:8000/docs |
| PostgreSQL | 5432 | (internal) |
| Redis      | 6379 | (internal) |

## Troubleshooting

**"Cannot connect to backend"**
→ Make sure uvicorn is running in Terminal 1
→ Check http://localhost:8000/health in browser

**"Database connection failed"**
→ Make sure PostgreSQL service is running
→ Check your DATABASE_URL in .env matches your postgres setup

**"Module not found" (Python)**
→ Make sure venv is activated: `venv\Scripts\activate`
→ Run: `pip install -r requirements.txt` again

**"npm error" (Node)**
→ Delete node_modules folder and run npm install again

**CORS error in browser console**
→ Make sure FRONTEND_URL=http://localhost:3000 in your .env
→ Restart the backend after changing .env
