import logging
import mimetypes
import time
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, RedirectResponse
from sqlalchemy import text
from sqlmodel import Session

from src.backend import config
from src.backend.api.auth_router import router as auth_router
from src.backend.api.admin_router import router as admin_router
from src.backend.api.avatar_router import router as avatar_router
from src.backend.api.videos_router import router as videos_router
from src.backend.api.course_router import router as course_router
from src.backend.api.student_router import router as student_router
from src.backend.api.deps import check_video_access
from src.backend.services.storage_service import generate_presigned_url, s3_object_exists
from src.backend.auth import get_current_user
from src.backend.database import create_db_and_tables, engine, get_session
from src.backend.models import User
from src.backend.services.job_service import mark_stale_jobs_as_failed
from src.backend.services.observability_service import configure_logging, runtime_metrics
from src.backend.services.pipeline_service import shutdown_pipeline_executor
from src.backend.services.video_service import VideoService

configure_logging(config.LOG_LEVEL, config.JSON_LOGS)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(_: FastAPI):
    create_db_and_tables()
    VideoService.ensure_dirs()
    with Session(engine) as session:
        mark_stale_jobs_as_failed(session)
    logger.info("Backend startup completed.")
    try:
        yield
    finally:
        shutdown_pipeline_executor()
        logger.info("Backend shutdown completed.")


app = FastAPI(title="A20 Video Captioning & Summary API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    started = time.perf_counter()
    response = await call_next(request)
    duration_ms = (time.perf_counter() - started) * 1000
    runtime_metrics.record_request(request.url.path, response.status_code, duration_ms)
    response.headers["X-Process-Time-ms"] = f"{duration_ms:.2f}"
    return response

app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(videos_router)
app.include_router(avatar_router)
app.include_router(course_router)
app.include_router(student_router)

@app.get("/api/video/{video_id}")
async def stream_video(
    video_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    check_video_access(video_id, current_user, session)
    for ext in (".mp4", ".mov", ".avi", ".mkv"):
        for prefix in (f"uploads/{video_id}", f"uploads/videos/{video_id}"):
            s3_key = f"{prefix}{ext}"
            if s3_object_exists(s3_key):
                url = generate_presigned_url(s3_key, expires_in=7200)
                if url:
                    return RedirectResponse(url=url, status_code=302)
    for ext in (".mp4", ".mov", ".avi", ".mkv"):
        candidate = VideoService.UPLOAD_DIR / f"{video_id}{ext}"
        if candidate.exists():
            media_type = mimetypes.guess_type(str(candidate))[0] or "video/mp4"
            return FileResponse(str(candidate), media_type=media_type)
    raise HTTPException(status_code=404, detail="Video file not found.")


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "Video Captioning API"}


@app.get("/api/health/deep")
def deep_health_check():
    checks = {
        "api": {"status": "healthy"},
        "database": {"status": "unknown"},
        "redis": {"status": "skipped"},
        "queue": {"status": "skipped"},
        "worker": {"status": "skipped"},
    }

    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        checks["database"] = {"status": "healthy"}
    except Exception as exc:
        checks["database"] = {"status": "unhealthy", "error": str(exc)}

    if config.REDIS_URL:
        try:
            from redis import Redis
            from rq import Queue, Worker

            redis_conn = Redis.from_url(config.REDIS_URL)
            redis_conn.ping()
            queue = Queue("video-pipeline", connection=redis_conn)
            workers = Worker.all(connection=redis_conn)
            checks["redis"] = {"status": "healthy"}
            checks["queue"] = {"status": "healthy", "name": queue.name, "length": len(queue)}
            checks["worker"] = {"status": "healthy" if workers else "degraded", "count": len(workers)}
        except Exception as exc:
            checks["redis"] = {"status": "unhealthy", "error": str(exc)}
            checks["queue"] = {"status": "unknown"}
            checks["worker"] = {"status": "unknown"}

    overall = "healthy" if all(
        check["status"] in {"healthy", "skipped"} for check in checks.values()
    ) else "degraded"
    return {"status": overall, "checks": checks}


@app.get("/api/metrics")
def metrics_snapshot():
    return runtime_metrics.snapshot()
