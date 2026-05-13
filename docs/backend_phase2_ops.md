# Backend Phase 2 Ops

## 1) Database switch to PostgreSQL

Set `DATABASE_URL` in `.env`:

```env
DATABASE_URL=postgresql+psycopg://user:password@localhost:5432/a20
```

## 2) Run migrations (Alembic)

```bash
alembic upgrade head
```

Initial migration file is at:

- `src/backend/migrations/versions/0001_initial_schema.py`

## 3) Enable queue mode (Redis + RQ)

Set:

```env
REDIS_URL=redis://localhost:6379/0
```

Run API server as usual, then run worker in a separate process:

```bash
python src/backend/scripts/run_worker.py
```

When `REDIS_URL` is set and dependencies are installed, upload/process-url endpoints enqueue to RQ queue `video-pipeline`.
If Redis/RQ is unavailable, system falls back to FastAPI `BackgroundTasks`.

## 4) Auth mode

- Login sets `HttpOnly` cookie (`AUTH_COOKIE_NAME`, default `access_token`).
- Frontend sends `credentials: include`.
- Backend still accepts `Authorization: Bearer` for backward compatibility.
