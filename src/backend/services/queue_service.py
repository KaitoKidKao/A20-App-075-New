import asyncio
import os
from typing import Any, Callable

from src.backend.services.pipeline_service import run_video_pipeline, run_video_pipeline_sync
from src.backend.services.video_service import VideoService

REDIS_URL = os.getenv("REDIS_URL", "").strip()


def _get_rq_queue():
    if not REDIS_URL:
        return None
    try:
        from redis import Redis
        from rq import Queue
    except Exception:
        return None
    redis_conn = Redis.from_url(REDIS_URL)
    return Queue("video-pipeline", connection=redis_conn)


def enqueue_pipeline_job(
    *,
    video_id: str,
    video_path: str,
    fallback_task_adder: Callable[[Callable[..., Any], Any], None] | None = None,
):
    queue = _get_rq_queue()
    if queue is not None:
        queue.enqueue(run_video_pipeline_sync, video_id, video_path, job_timeout=60 * 60)
        return "rq"
    if fallback_task_adder is not None:
        fallback_task_adder(run_video_pipeline, video_id, video_path)
        return "background_tasks"
    asyncio.create_task(run_video_pipeline(video_id, video_path))
    return "in_process_asyncio"


async def _download_and_run(video_id: str, url: str):
    path = await VideoService.download_video(url, video_id)
    await run_video_pipeline(video_id, path)


def enqueue_download_and_pipeline(
    *,
    video_id: str,
    url: str,
    fallback_task_adder: Callable[[Callable[..., Any], Any], None] | None = None,
):
    queue = _get_rq_queue()
    if queue is not None:
        # Worker downloads and then runs pipeline.
        queue.enqueue(_download_and_run_sync, video_id, url, job_timeout=60 * 60)
        return "rq"
    if fallback_task_adder is not None:
        fallback_task_adder(_download_and_run, video_id, url)
        return "background_tasks"
    asyncio.create_task(_download_and_run(video_id, url))
    return "in_process_asyncio"


def _download_and_run_sync(video_id: str, url: str):
    asyncio.run(_download_and_run(video_id, url))
