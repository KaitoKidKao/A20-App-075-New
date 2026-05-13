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

### 1. Backend

```bash
uv venv
# Linux/macOS
source .venv/bin/activate
# Windows PowerShell
# .\.venv\Scripts\Activate.ps1

uv pip install -r requirements.txt
```

Create `.env` from `.env.example` and set required values (at least `OPENAI_API_KEY`; set `SECRET_KEY` for stable auth tokens).

### 2. Frontend

```bash
cd src/frontend
npm install
```

## Run

### Backend API

```bash
uvicorn src.backend.main:app --reload --host 0.0.0.0 --port 8000
```

Health check:

```bash
GET /api/health
```

### Frontend

```bash
cd src/frontend
npm run dev
```

## Tests

Run backend tests from repository root:

```bash
pytest src/backend/tests/test_auth.py
pytest src/backend/tests/test_db.py
```

Optional script:

```bash
python src/backend/tests/verify_ai_features.py
```
