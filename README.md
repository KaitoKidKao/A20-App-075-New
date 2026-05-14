# A20-App-075

Backend + frontend system for video upload, transcription, and AI-generated learning artifacts.

## Tech Stack

- Backend: FastAPI (`src/backend/main.py`)
- Frontend: Next.js (`src/frontend`)
- Python requirement: `>=3.12` (from `pyproject.toml`)

## Project Structure

```text
src/
  backend/
    main.py
    config.py
    auth.py
    database.py
    models/
    schemas/
    services/
    tests/
  frontend/
requirements.txt
pyproject.toml
README.md
```

## Setup

### 1. Environment Variables

Copy `.env.example` to `.env` at repo root and fill in values as needed.

Minimum for local dev:

```bash
OPENAI_API_KEY=...
SECRET_KEY=...
```

Recommended local defaults (SQLite + optional Redis queue) are already in `.env.example`:

- `DATABASE_URL=sqlite:///data/lecture_platform.db`
- `REDIS_URL=redis://localhost:6379/0`
- `NEXT_PUBLIC_API_URL=http://localhost:8000`

Generate a strong `SECRET_KEY`:

```bash
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

### 2. Backend

```bash
python -m venv venv
# Windows PowerShell
.\venv\Scripts\Activate.ps1
python -m pip install -U pip
python -m pip install -r requirements.txt
```

Initialize database schema:

```bash
python -m alembic upgrade head
```

### 3. Frontend

```bash
cd src/frontend
npm install
```

## Run

### Backend API

```bash
python -m uvicorn src.backend.main:app --reload --host 0.0.0.0 --port 8000
```

Health check:

```bash
GET /api/health
GET /api/health/deep
GET /api/metrics
```

### Frontend

```bash
cd src/frontend
npm run dev
```

Open:

- Frontend: `http://localhost:3000`
- Backend docs: `http://localhost:8000/docs`

## Optional: Redis Queue Worker (Windows-friendly)

If `REDIS_URL` is set, the backend will enqueue jobs to RQ. You must run Redis + a worker.

Run Redis with Docker:

```bash
docker run -d --name a20-redis -p 6379:6379 redis:7-alpine
```

Run the RQ worker (in another terminal):

```bash
.\venv\Scripts\Activate.ps1
python -m src.backend.scripts.run_worker
```

If Redis is unavailable, the backend falls back to FastAPI `BackgroundTasks` for local development.

## Docker / Production-like Local Stack

Run API, worker, frontend, PostgreSQL and Redis:

```bash
docker compose up --build
```

Run database migrations inside the backend container:

```bash
docker compose exec backend python -m alembic upgrade head
```

Optional MinIO profile for local object storage experiments:

```bash
docker compose --profile storage up --build
```

Useful URLs:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- Deep health: `http://localhost:8000/api/health/deep`
- Metrics JSON: `http://localhost:8000/api/metrics`

## Reprocess A Video

Use this when an uploaded video exists but transcript/AI output must be regenerated:

```bash
POST /api/videos/{video_id}/reprocess
```

The pipeline uses these main statuses:

```text
queued -> extracting_audio -> transcribing -> translating -> ai_processing -> completed
```

## Tests

Run backend tests from repository root:

```bash
python -m pytest -q src/backend/tests
```

Run frontend checks:

```bash
cd src/frontend
npm run lint
npm run typecheck
npm run build
```

Optional script:

```bash
python src/backend/tests/verify_ai_features.py
```
