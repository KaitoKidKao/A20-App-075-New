from sqlmodel import Session, select

from src.backend.models import ProcessingJob, Video
from src.backend.utils.datetime_utils import utc_now


def upsert_job_status(
    session: Session,
    *,
    video_id: str,
    status: str,
    progress: int | None = None,
    error_message: str | None = None,
):
    statement = select(ProcessingJob).where(
        ProcessingJob.video_id == video_id,
        ProcessingJob.job_type == "video_pipeline",
    )
    job = session.exec(statement).first()
    if not job:
        job = ProcessingJob(video_id=video_id, job_type="video_pipeline", status=status)
    job.status = status
    if progress is not None:
        job.progress = progress
    if error_message is not None:
        job.error_message = error_message
    job.updated_at = utc_now()
    session.add(job)
    session.commit()


def mark_stale_jobs_as_failed(session: Session):
    non_terminal_statuses = {
        "queued",
        "downloading",
        "extracting_audio",
        "transcribing",
        "ai_processing",
    }
    statement = select(ProcessingJob).where(ProcessingJob.status.in_(non_terminal_statuses))
    stale_jobs = session.exec(statement).all()
    for job in stale_jobs:
        job.status = "failed_restart"
        job.error_message = "Server restarted before job completion."
        job.updated_at = utc_now()
        session.add(job)
        video = session.get(Video, job.video_id)
        if video and video.status in non_terminal_statuses:
            video.status = "failed_restart"
            session.add(video)
    session.commit()
