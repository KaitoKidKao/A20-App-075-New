# Backend Phase 2 Ops

## 1) Database switch to PostgreSQL

Set `DATABASE_URL` in `.env`:

```env
DATABASE_URL=postgresql+psycopg://user:password@localhost:5432/a20
```

## 2) Run migrations (Alembic)

```bash
python -m alembic upgrade head
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

When `REDIS_URL` is set and dependencies are installed, upload/process-url/reprocess endpoints enqueue to RQ queue `video-pipeline`.
If Redis/RQ is unavailable or enqueue fails, the system falls back to FastAPI `BackgroundTasks`.

## 4) Video pipeline states

The video pipeline persists state in `processing_jobs` and mirrors the current state on `lessons.status`.

Current non-terminal states:

- `queued`
- `downloading`
- `extracting_audio`
- `transcribing`
- `translating`
- `ai_processing`

Terminal states:

- `completed`
- `failed`
- `failed_restart`

`processing_jobs.attempts`, `processing_jobs.error_message`, and `processing_jobs.last_failed_at` are used for operational debugging and retry visibility.

## 5) Reprocess an uploaded video

Use this when a video already exists locally but transcript/AI artifacts need to be regenerated:

```bash
POST /api/videos/{video_id}/reprocess
```

The endpoint:

- checks access to the lesson/video,
- finds the local file from `content_metadata.video_url` or `data/uploads/videos/{video_id}.*`,
- resets the job to `queued`,
- re-enqueues the pipeline.

## 6) Auth mode

- Login sets `HttpOnly` cookie (`AUTH_COOKIE_NAME`, default `access_token`).
- Frontend sends `credentials: include`.
- Backend still accepts `Authorization: Bearer` for backward compatibility.
