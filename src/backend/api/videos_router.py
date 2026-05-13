import os
import uuid

from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlmodel import Session, select

from src.backend import config
from src.backend.api.deps import check_video_access, validate_external_video_url
from src.backend.auth import get_current_user
from src.backend.database import get_session
from src.backend.models import Flashcard, LectureData, ProcessingJob, User, Video
from src.backend.services.ai_service import AIService
from src.backend.services.avatar_video_service import AvatarVideoService
from src.backend.services.handsign_animation_service import (
    build_render_manifest,
    expand_handsign_segments,
)
from src.backend.services.job_service import upsert_job_status
from src.backend.services.queue_service import enqueue_download_and_pipeline, enqueue_pipeline_job
from src.backend.services.video_service import VideoService

router = APIRouter(prefix="/api/videos", tags=["videos"])


@router.post("/upload")
async def upload_video(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    video_id = str(uuid.uuid4())
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".mp4", ".mov", ".avi", ".mkv"]:
        raise HTTPException(status_code=400, detail="Unsupported file format.")

    filename = f"{video_id}{ext}"
    max_upload_size_bytes = config.MAX_UPLOAD_SIZE_MB * 1024 * 1024

    try:
        video_path = await VideoService.save_video_stream(
            upload_file=file,
            filename=filename,
            max_size_bytes=max_upload_size_bytes,
        )
        session.add(
            Video(
                id=video_id,
                user_id=current_user.id,
                title=file.filename,
                storage_path=str(video_path),
                status="queued",
            )
        )
        session.commit()
        upsert_job_status(session, video_id=video_id, status="queued", progress=0)
        mode = enqueue_pipeline_job(
            video_id=video_id,
            video_path=str(video_path),
            fallback_task_adder=background_tasks.add_task,
        )
        return {
            "video_id": video_id,
            "status": "processing",
            "queue_mode": mode,
            "message": "Video uploaded and queued for processing.",
        }
    except ValueError:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum allowed size is {config.MAX_UPLOAD_SIZE_MB} MB.",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/process-url")
async def process_url(
    background_tasks: BackgroundTasks,
    data: dict,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    url = validate_external_video_url(data.get("url"))
    video_id = str(uuid.uuid4())
    session.add(
        Video(
            id=video_id,
            user_id=current_user.id,
            title=f"Video from URL: {url[:30]}...",
            storage_path="",
            status="queued",
        )
    )
    session.commit()
    upsert_job_status(session, video_id=video_id, status="queued", progress=0)
    mode = enqueue_download_and_pipeline(
        video_id=video_id,
        url=url,
        fallback_task_adder=background_tasks.add_task,
    )
    return {
        "video_id": video_id,
        "status": "processing",
        "queue_mode": mode,
        "message": "URL accepted and download has started.",
    }


@router.get("/me")
async def list_my_videos(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    statement = select(Video).where(Video.user_id == current_user.id)
    return session.exec(statement).all()


@router.get("/{video_id}/status")
async def get_video_status(
    video_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    video = session.get(Video, video_id)
    if not video:
        raise HTTPException(status_code=404, detail="Khong tim thay video.")
    if video.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Ban khong co quyen xem trang thai video nay.")
    return {"video_id": video_id, "status": video.status}


@router.get("/{video_id}/job-status")
async def get_video_job_status(
    video_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    check_video_access(video_id, current_user, session)
    statement = select(ProcessingJob).where(
        ProcessingJob.video_id == video_id,
        ProcessingJob.job_type == "video_pipeline",
    )
    job = session.exec(statement).first()
    if not job:
        return {"video_id": video_id, "status": "not_found", "progress": 0}
    return {
        "video_id": video_id,
        "status": job.status,
        "progress": job.progress,
        "error_message": job.error_message,
        "updated_at": job.updated_at,
    }


@router.get("/{video_id}/transcript")
async def get_transcript(
    video_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    check_video_access(video_id, current_user, session)
    lecture = session.get(LectureData, video_id)
    if not lecture or not lecture.transcript:
        return {"video_id": video_id, "message": "Phu de chua san sang."}
    return lecture.transcript


@router.get("/{video_id}/summary")
async def get_summary(
    video_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    check_video_access(video_id, current_user, session)
    lecture = session.get(LectureData, video_id)
    if not lecture or not lecture.summary:
        return {"video_id": video_id, "message": "Tom tat chua san sang."}
    return {"video_id": video_id, "summary": lecture.summary}


@router.get("/{video_id}/timeline")
async def get_timeline(
    video_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    check_video_access(video_id, current_user, session)
    lecture = session.get(LectureData, video_id)
    if not lecture or not lecture.timeline:
        return {"video_id": video_id, "timeline": []}
    return {"video_id": video_id, "timeline": lecture.timeline}


@router.get("/{video_id}/highlights")
async def get_highlights(
    video_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    check_video_access(video_id, current_user, session)
    lecture = session.get(LectureData, video_id)
    if not lecture or not lecture.highlights:
        return {"video_id": video_id, "highlights": []}
    return {"video_id": video_id, "highlights": lecture.highlights}


@router.get("/{video_id}/questions")
async def get_questions(
    video_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    check_video_access(video_id, current_user, session)
    lecture = session.get(LectureData, video_id)
    if not lecture or not lecture.questions:
        return {"video_id": video_id, "questions": []}
    return {"video_id": video_id, "questions": lecture.questions}


@router.get("/{video_id}/briefing")
async def get_briefing(
    video_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    check_video_access(video_id, current_user, session)
    lecture = session.get(LectureData, video_id)
    if not lecture or not lecture.briefing:
        return {"video_id": video_id, "message": "Briefing chua san sang."}
    return {"video_id": video_id, "briefing": lecture.briefing}


@router.get("/{video_id}/flashcards")
async def get_flashcards(
    video_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    check_video_access(video_id, current_user, session)
    statement = select(Flashcard).where(Flashcard.video_id == video_id)
    return {"video_id": video_id, "flashcards": session.exec(statement).all()}


@router.get("/{video_id}/viz-data")
async def get_viz_data(
    video_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    check_video_access(video_id, current_user, session)
    lecture = session.get(LectureData, video_id)
    if not lecture or not lecture.visual_data:
        return {"video_id": video_id, "visual_data": {}, "cover_image_url": None}
    return {
        "video_id": video_id,
        "visual_data": lecture.visual_data,
        "cover_image_url": lecture.cover_image_url,
    }


@router.get("/{video_id}/handsign")
async def get_handsign_data(
    video_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    check_video_access(video_id, current_user, session)
    lecture = session.get(LectureData, video_id)
    if not lecture or not lecture.handsign_data:
        return {"video_id": video_id, "handsign_data": []}
    return {"video_id": video_id, "handsign_data": lecture.handsign_data}


@router.post("/{video_id}/generate-avatar")
async def generate_avatar_endpoint(
    video_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    check_video_access(video_id, current_user, session)
    lecture = session.get(LectureData, video_id)
    if not lecture or not lecture.handsign_data:
        raise HTTPException(status_code=400, detail="Khong co du lieu handsign de sinh video.")
    cached = AvatarVideoService.get_cached_avatar_video(video_id)
    if cached:
        return cached
    if not lecture.summary:
        raise HTTPException(status_code=400, detail="Video chua co tom tat tieng Viet.")
    summary_text = "\n".join(lecture.summary)
    summary_glosses = await AIService.generate_handsign_from_text(summary_text)
    result = await AvatarVideoService.generate_avatar_video(video_id, summary_text, summary_glosses)
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    return result


@router.get("/{video_id}/avatar")
async def get_avatar_video(
    video_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    check_video_access(video_id, current_user, session)
    cached = AvatarVideoService.get_cached_avatar_video(video_id)
    if not cached:
        return {"video_id": video_id, "avatar_video_url": None}
    return cached


@router.get("/avatar-video/{video_id}")
async def serve_avatar_video(
    video_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    check_video_access(video_id, current_user, session)
    video_path = AvatarVideoService.get_avatar_video_path(video_id)
    if not video_path.exists():
        raise HTTPException(status_code=404, detail="Avatar video file not found.")
    return FileResponse(
        path=str(video_path),
        media_type="video/mp4",
        filename=f"{video_id}_avatar.mp4",
    )


@router.get("/{video_id}/handsign-segments")
async def get_handsign_segments(
    video_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    check_video_access(video_id, current_user, session)
    lecture = session.get(LectureData, video_id)
    raw = lecture.handsign_data if lecture and lecture.handsign_data else []
    if not isinstance(raw, list):
        raw = []
    segments = expand_handsign_segments(raw)
    return {"video_id": video_id, "segments": segments}


@router.get("/{video_id}/handsign-export")
async def get_handsign_export_manifest(
    video_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    check_video_access(video_id, current_user, session)
    lecture = session.get(LectureData, video_id)
    raw = lecture.handsign_data if lecture and lecture.handsign_data else []
    if not isinstance(raw, list):
        raw = []
    segments = expand_handsign_segments(raw)
    return build_render_manifest(video_id, segments)
