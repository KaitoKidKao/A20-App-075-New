import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session

from src.backend import config
from src.backend.api.auth_router import router as auth_router
from src.backend.api.avatar_router import router as avatar_router
from src.backend.api.videos_router import router as videos_router
from src.backend.database import create_db_and_tables, engine
from src.backend.services.job_service import mark_stale_jobs_as_failed
from src.backend.services.pipeline_service import shutdown_pipeline_executor
from src.backend.services.video_service import VideoService

logging.basicConfig(level=getattr(logging, config.LOG_LEVEL), format="%(asctime)s [%(levelname)s] %(message)s")
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

app.include_router(auth_router)
app.include_router(videos_router)
app.include_router(avatar_router)

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "Video Captioning API"}
