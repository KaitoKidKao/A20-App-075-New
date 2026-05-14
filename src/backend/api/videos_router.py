import os
import uuid
from pathlib import Path

from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, UploadFile
from sqlmodel import Session, select

from src.backend import config
from src.backend.api.deps import check_video_access, validate_external_video_url
from src.backend.auth import get_current_user
from src.backend.database import get_session
from src.backend.models import (
    Category,
    Flashcard,
    ProcessingJob,
    User,
    Course,
    Lesson,
    ContentMetadata,
    Module,
)
from src.backend.services.ai_service import AIService
from src.backend.services.avatar_video_service import AvatarVideoService
from src.backend.services.handsign_animation_service import (
    build_render_manifest,
    expand_handsign_segments,
)
from src.backend.services.job_service import upsert_job_status
from src.backend.services.queue_service import enqueue_download_and_pipeline, enqueue_pipeline_job
from src.backend.services.rate_limit_service import rate_limit
from src.backend.services.video_service import VideoService

router = APIRouter(prefix="/api/videos", tags=["videos"])


def _parse_lesson_id(lesson_id: str) -> uuid.UUID:
    try:
        return uuid.UUID(str(lesson_id))
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid video id.")


def _find_existing_video_path(lesson_id: str, session: Session) -> Path | None:
    lesson_uuid = _parse_lesson_id(lesson_id)
    content = session.exec(select(ContentMetadata).where(ContentMetadata.lesson_id == lesson_uuid)).first()
    if content and content.video_url:
        candidate = Path(content.video_url)
        if candidate.exists() and candidate.is_file():
            return candidate

    for candidate in VideoService.UPLOAD_DIR.glob(f"{lesson_id}.*"):
        if candidate.is_file():
            return candidate
    return None


def _get_ai_analysis(video_id: str, session: Session) -> dict:
    lesson_uuid = _parse_lesson_id(video_id)
    content = session.exec(
        select(ContentMetadata).where(ContentMetadata.lesson_id == lesson_uuid)
    ).first()
    return content.ai_analysis if content and isinstance(content.ai_analysis, dict) else {}


async def get_or_create_default_hierarchy(session: Session, user_id: uuid.UUID):
    # Get or create "Chung" category
    category = session.exec(select(Category).where(Category.name == "Chung")).first()
    if not category:
        category = Category(name="Chung", description="Danh muc chung")
        session.add(category)
        session.flush()
    
    # Get or create "Quick Uploads" course
    course = session.exec(
        select(Course).where(
            Course.title == "Khoa hoc tai len nhanh",
            Course.instructor_id == user_id,
        )
    ).first()
    if not course:
        course = Course(
            category_id=category.id,
            instructor_id=user_id,
            title="Khoa hoc tai len nhanh",
            description="Khoa hoc chua cac video tai len nhanh",
        )
        session.add(course)
        session.flush()
    
    # Get or create "Default" module
    module = session.exec(select(Module).where(Module.course_id == course.id)).first()
    if not module:
        module = Module(
            course_id=course.id,
            title="Mac dinh",
            sort_order=1
        )
        session.add(module)
        session.flush()
    
    return module

@router.post("/upload")
async def upload_video(
    background_tasks: BackgroundTasks,
    _: None = Depends(rate_limit("upload", config.UPLOAD_RATE_LIMIT)),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    lesson_uuid = uuid.uuid4()
    lesson_id = str(lesson_uuid)
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in config.ALLOWED_VIDEO_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Unsupported file format.")
    content_type = (file.content_type or "").lower()
    if content_type not in config.ALLOWED_VIDEO_MIME_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported video MIME type.")

    filename = f"{lesson_id}{ext}"
    max_upload_size_bytes = config.MAX_UPLOAD_SIZE_MB * 1024 * 1024

    try:
        video_path = await VideoService.save_video_stream(
            upload_file=file,
            filename=filename,
            max_size_bytes=max_upload_size_bytes,
        )
        VideoService.validate_video_duration(video_path)
        
        module = await get_or_create_default_hierarchy(session, current_user.id)
        
        lesson = Lesson(
            id=lesson_uuid,
            module_id=module.id,
            title=file.filename,
            content_type="video",
            status="queued",
            sort_order=0
        )
        session.add(lesson)
        session.commit()
        
        upsert_job_status(session, lesson_id=lesson_id, status="queued", progress=0)
        mode = enqueue_pipeline_job(
            video_id=lesson_id,
            video_path=str(video_path),
            fallback_task_adder=background_tasks.add_task,
        )
        return {
            "video_id": lesson_id,
            "status": "processing",
            "queue_mode": mode,
            "message": "Video uploaded and queued for processing.",
        }
    except ValueError as exc:
        message = str(exc)
        status_code = 413 if "size" in message.lower() or "large" in message.lower() else 400
        raise HTTPException(
            status_code=status_code,
            detail=message or f"File too large. Maximum allowed size is {config.MAX_UPLOAD_SIZE_MB} MB.",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/process-url")
async def process_url(
    background_tasks: BackgroundTasks,
    data: dict,
    _: None = Depends(rate_limit("upload", config.UPLOAD_RATE_LIMIT)),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    url = validate_external_video_url(data.get("url"))
    lesson_uuid = uuid.uuid4()
    lesson_id = str(lesson_uuid)
    
    module = await get_or_create_default_hierarchy(session, current_user.id)
    
    lesson = Lesson(
        id=lesson_uuid,
        module_id=module.id,
        title=f"Video from URL: {url[:30]}...",
        content_type="video",
        status="queued",
        sort_order=0
    )
    session.add(lesson)
    session.commit()
    
    upsert_job_status(session, lesson_id=lesson_id, status="queued", progress=0)
    mode = enqueue_download_and_pipeline(
        video_id=lesson_id,
        url=url,
        fallback_task_adder=background_tasks.add_task,
    )
    return {
        "video_id": lesson_id,
        "status": "processing",
        "queue_mode": mode,
        "message": "URL accepted and download has started.",
    }


@router.get("/me")
async def list_my_videos(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    # In the new schema, "my videos" could mean lessons in courses I teach
    # or lessons in courses I am enrolled in.
    # For now, let's just list all lessons in the "Quick Uploads" course for this user
    module = await get_or_create_default_hierarchy(session, current_user.id)
    statement = select(Lesson).where(Lesson.module_id == module.id)
    return session.exec(statement).all()


@router.post("/{video_id}/reprocess")
async def reprocess_video(
    video_id: str,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    lesson = check_video_access(video_id, current_user, session)
    video_path = _find_existing_video_path(video_id, session)
    if not video_path:
        raise HTTPException(
            status_code=404,
            detail="Khong tim thay file video da upload de xu ly lai.",
        )

    lesson.status = "queued"
    session.add(lesson)
    session.commit()
    upsert_job_status(session, lesson_id=video_id, status="queued", progress=0, error_message="")

    mode = enqueue_pipeline_job(
        video_id=video_id,
        video_path=str(video_path),
        fallback_task_adder=background_tasks.add_task,
    )
    return {
        "video_id": video_id,
        "status": "processing",
        "queue_mode": mode,
        "message": "Video reprocess has been queued.",
    }


@router.get("/{video_id}/status")
async def get_video_status(
    video_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    lesson = check_video_access(video_id, current_user, session)
    return {"video_id": video_id, "status": lesson.status}


@router.get("/{video_id}/job-status")
async def get_video_job_status(
    video_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    check_video_access(video_id, current_user, session)
    lesson_uuid = _parse_lesson_id(video_id)
    statement = select(ProcessingJob).where(
        ProcessingJob.lesson_id == lesson_uuid,
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
        "attempts": job.attempts,
        "last_failed_at": job.last_failed_at,
        "updated_at": job.updated_at,
    }


@router.get("/{video_id}/transcript")
async def get_transcript(
    video_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    check_video_access(video_id, current_user, session)
    ai_analysis = _get_ai_analysis(video_id, session)
    if "transcript" not in ai_analysis:
        return {"video_id": video_id, "message": "Phu de chua san sang."}
    transcript = ai_analysis["transcript"]
    if isinstance(transcript, dict) and "segments_by_language" not in transcript:
        segments = transcript.get("segments", [])
        lang = transcript.get("language", "vi")
        transcript["segments_by_language"] = {lang: segments}
        transcript["available_languages"] = [lang]
    return transcript


@router.get("/{video_id}/artifacts/status")
async def get_artifact_status(
    video_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    check_video_access(video_id, current_user, session)
    ai_analysis = _get_ai_analysis(video_id, session)
    return {
        "video_id": video_id,
        "artifact_status": ai_analysis.get("artifact_status", {}),
    }


@router.get("/{video_id}/summary")
async def get_summary(
    video_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    check_video_access(video_id, current_user, session)
    ai_analysis = _get_ai_analysis(video_id, session)
    if "summary" not in ai_analysis:
        return {"video_id": video_id, "message": "Tom tat chua san sang."}
    return {
        "video_id": video_id,
        "summary": ai_analysis["summary"],
        "status": ai_analysis.get("artifact_status", {}).get("summary"),
    }


@router.get("/{video_id}/timeline")
async def get_timeline(
    video_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    check_video_access(video_id, current_user, session)
    ai_analysis = _get_ai_analysis(video_id, session)
    if "timeline" not in ai_analysis:
        return {"video_id": video_id, "timeline": []}
    return {"video_id": video_id, "timeline": ai_analysis["timeline"]}


@router.get("/{video_id}/highlights")
async def get_highlights(
    video_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    check_video_access(video_id, current_user, session)
    ai_analysis = _get_ai_analysis(video_id, session)
    if "highlights" not in ai_analysis:
        return {"video_id": video_id, "highlights": []}
    return {"video_id": video_id, "highlights": ai_analysis["highlights"]}


@router.get("/{video_id}/questions")
async def get_questions(
    video_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    check_video_access(video_id, current_user, session)
    ai_analysis = _get_ai_analysis(video_id, session)
    if "questions" not in ai_analysis:
        return {"video_id": video_id, "questions": []}
    return {"video_id": video_id, "questions": ai_analysis["questions"]}


@router.get("/{video_id}/briefing")
async def get_briefing(
    video_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    check_video_access(video_id, current_user, session)
    ai_analysis = _get_ai_analysis(video_id, session)
    if "briefing" not in ai_analysis:
        return {"video_id": video_id, "message": "Briefing chua san sang."}
    return {"video_id": video_id, "briefing": ai_analysis["briefing"]}


@router.get("/{video_id}/flashcards")
async def get_flashcards(
    video_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    check_video_access(video_id, current_user, session)
    statement = select(Flashcard).where(Flashcard.lesson_id == _parse_lesson_id(video_id))
    return {"video_id": video_id, "flashcards": session.exec(statement).all()}


@router.get("/{video_id}/viz-data")
async def get_viz_data(
    video_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    check_video_access(video_id, current_user, session)
    ai_analysis = _get_ai_analysis(video_id, session)
    if "visual_data" not in ai_analysis:
        return {"video_id": video_id, "visual_data": {}, "cover_image_url": None}
    return {
        "video_id": video_id,
        "visual_data": ai_analysis["visual_data"],
        "cover_image_url": ai_analysis.get("cover_image_url"),
    }


@router.get("/{video_id}/handsign")
async def get_handsign_data(
    video_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    check_video_access(video_id, current_user, session)
    ai_analysis = _get_ai_analysis(video_id, session)
    if "handsign_data" not in ai_analysis:
        return {"video_id": video_id, "handsign_data": []}
    return {"video_id": video_id, "handsign_data": ai_analysis["handsign_data"]}


@router.post("/{video_id}/generate-avatar")
async def generate_avatar_endpoint(
    video_id: str,
    _: None = Depends(rate_limit("generate_avatar", config.AVATAR_RATE_LIMIT)),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    check_video_access(video_id, current_user, session)
    ai_analysis = _get_ai_analysis(video_id, session)
    if "handsign_data" not in ai_analysis:
        raise HTTPException(status_code=400, detail="Khong co du lieu handsign de sinh video.")
    
    cached = AvatarVideoService.get_cached_avatar_video(video_id)
    if cached:
        return cached
    
    summary = ai_analysis.get("summary")
    if not summary:
        raise HTTPException(status_code=400, detail="Video chua co tom tat tieng Viet.")
    
    summary_text = "\n".join(summary)
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


@router.get("/{video_id}/handsign-segments")
async def get_handsign_segments(
    video_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    check_video_access(video_id, current_user, session)
    ai_analysis = _get_ai_analysis(video_id, session)
    raw = ai_analysis.get("handsign_data", [])
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
    ai_analysis = _get_ai_analysis(video_id, session)
    raw = ai_analysis.get("handsign_data", [])
    if not isinstance(raw, list):
        raw = []
    segments = expand_handsign_segments(raw)
    return build_render_manifest(video_id, segments)
