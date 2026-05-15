# Phase 8 - DevOps, CI/CD va Observability

## Muc tieu

Phase 8 giup du an co the build, test, deploy va debug theo mot quy trinh lap lai duoc. Pham vi da trien khai gom CI, Docker, healthcheck va metrics runtime co ban.

## CI/CD

Workflow `.github/workflows/ci.yml` hien chay ba job:

- `backend`
  - Cai Python 3.12.
  - Cai `requirements.txt`.
  - Chay `python -m alembic upgrade head`.
  - Chay `python -m pytest -q src/backend/tests`.
- `frontend`
  - Cai Node 20.
  - Chay `npm ci`.
  - Chay `npm run lint`.
  - Chay `npm run typecheck`.
  - Chay `npm run build`.
- `docker`
  - Build image backend.
  - Build image frontend.

## Docker

Da them:

- `Dockerfile.backend`
- `src/frontend/Dockerfile`
- `.dockerignore`
- `src/frontend/.dockerignore`
- `docker-compose.yml` production-like

Compose gom:

- `postgres`
- `redis`
- `backend`
- `worker`
- `frontend`
- `minio` voi profile `storage`

Chay stack local:

```powershell
docker compose up --build
```

Chay them MinIO neu muon thu object storage local:

```powershell
docker compose --profile storage up --build
```

Chay migration trong container backend:

```powershell
docker compose exec backend python -m alembic upgrade head
```

## Healthcheck va metrics

Endpoint moi:

- `GET /api/health`
  - Kiem tra API co song hay khong.
- `GET /api/health/deep`
  - Kiem tra API, database, Redis, queue va worker.
- `GET /api/metrics`
  - Tra ve metrics runtime co ban: uptime, request count, error count, average duration, top paths.

Compose healthcheck:

- Postgres: `pg_isready`
- Redis: `redis-cli ping`
- Backend: `/api/health`
- Frontend: fetch trang root

## Logging

Da them `JSON_LOGS`.

- Local nen de `JSON_LOGS=false`.
- Production/container nen de `JSON_LOGS=true` de log co cau truc, de ingest vao Loki/ELK/Cloud Logging.

Vi du `.env`:

```env
LOG_LEVEL=INFO
JSON_LOGS=true
```

## Gioi han con lai

- Metrics hien tai la in-memory, se reset khi restart container.
- Chua co Prometheus exporter rieng.
- MinIO moi co trong compose, app chua chuyen upload sang object storage.
- Chua co CD deploy tu dong len server/cloud.

## Buoc tiep theo

- Them Prometheus `/metrics` format neu can monitoring nghiem tuc.
- Them alert cho failed jobs va queue length cao.
- Dua media storage sang S3/R2/MinIO adapter.
- Them release workflow rieng cho production.
