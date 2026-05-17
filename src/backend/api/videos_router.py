import os
import uuid
from pathlib import Path

from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, HTTPException, Query, UploadFile
from sqlalchemy import delete
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
    DeletionAudit,
    Quiz,
    Question,
    QuestionOption,
    QuizAttempt,
    UserFlashcardProgress,
    Module,
    Enrollment,
    UserProgress,
)
from src.backend.services.avatar_video_service import AvatarVideoService
from src.backend.services.handsign_animation_service import (
    build_handsign_payload,
    build_render_manifest,
    expand_handsign_segments,
    normalize_glosses,
)
from src.backend.services.job_service import upsert_job_status
from src.backend.services.queue_service import enqueue_download_and_pipeline, enqueue_pipeline_job
from src.backend.services.rate_limit_service import rate_limit
from src.backend.services.storage_service import generate_presigned_upload_url, download_from_s3
from src.backend.services.video_service import VideoService

router = APIRouter(prefix="/api/videos", tags=["videos"])


def _create_deletion_audit(
    *,
    session: Session,
    entity_type: str,
    entity_id: str,
    entity_display_name: str | None,
    reason: str,
    actor: User,
) -> None:
    session.add(
        DeletionAudit(
            entity_type=entity_type,
            entity_id=entity_id,
            entity_display_name=entity_display_name,
            deleted_by_user_id=actor.id,
            deleted_by_email=actor.email,
            reason=reason.strip(),
        )
    )


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


def _get_content_metadata(video_id: str, session: Session) -> ContentMetadata | None:
    lesson_uuid = _parse_lesson_id(video_id)
    return session.exec(
        select(ContentMetadata).where(ContentMetadata.lesson_id == lesson_uuid)
    ).first()


def _ensure_handsign_editor(video_id: str, current_user: User, session: Session) -> Lesson:
    lesson = check_video_access(video_id, current_user, session)
    role_name = (current_user.role.name if current_user.role else "student").lower()
    if role_name == "admin":
        return lesson
    if lesson.module:
        course = session.get(Course, lesson.module.course_id)
        if course and course.instructor_id == current_user.id:
            return lesson
    raise HTTPException(status_code=403, detail="Only teacher/admin can review VSL gloss.")


def _ensure_lesson_owner_or_admin(video_id: str, current_user: User, session: Session) -> Lesson:
    lesson = check_video_access(video_id, current_user, session)
    role_name = (current_user.role.name if current_user.role else "student").lower()
    if role_name == "admin":
        return lesson
    if lesson.module:
        course = session.get(Course, lesson.module.course_id)
        if course and course.instructor_id == current_user.id:
            return lesson
    raise HTTPException(status_code=403, detail="Only course teacher/admin can delete lesson videos.")


def _build_personal_course_title(user: User) -> str:
    display_name = (user.full_name or "").strip()
    if not display_name:
        display_name = user.email.split("@")[0]
    return f"Khóa học cá nhân của {display_name}"


async def get_or_create_default_hierarchy(session: Session, user: User):
    # Get or create "Chung" category
    category = session.exec(select(Category).where(Category.name == "Chung")).first()
    if not category:
        category = Category(name="Chung", description="Danh muc chung")
        session.add(category)
        session.flush()
    
    personal_title = _build_personal_course_title(user)
    # Reuse legacy course title if it exists, otherwise use personalized title.
    course = session.exec(
        select(Course).where(
            Course.instructor_id == user.id,
            Course.title.in_(["Tu hoc ca nhan", personal_title]),
        )
    ).first()
    if not course:
        course = Course(
            category_id=category.id,
            instructor_id=user.id,
            title=personal_title,
            description="Không gian tự học cá nhân cho các video bạn tự tải lên.",
            is_published=False,
        )
        session.add(course)
        session.flush()
    elif course.title != personal_title:
        course.title = personal_title
        session.add(course)
        session.flush()
    
    # Get or create "Default" module
    module = session.exec(select(Module).where(Module.course_id == course.id)).first()
    if not module:
        module = Module(
            course_id=course.id,
            title="Video tự học",
            sort_order=1
        )
        session.add(module)
        session.flush()
    
    return module


def _role_name(user: User) -> str:
    return (user.role.name if user.role else "student").lower()


def _ensure_teacher_module(module_id: str | None, current_user: User, session: Session) -> Module | None:
    if not module_id:
        return None
    try:
        module_uuid = uuid.UUID(str(module_id))
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid module id.")

    module = session.get(Module, module_uuid)
    if not module:
        raise HTTPException(status_code=404, detail="Module not found.")

    course = session.get(Course, module.course_id)
    role_name = _role_name(current_user)
    if role_name == "admin" or (course and course.instructor_id == current_user.id):
        return module
    raise HTTPException(status_code=403, detail="Only course teacher/admin can upload lesson videos.")


async def _create_lesson_and_enqueue(
    *,
    file: UploadFile,
    module_id: str | None,
    current_user: User,
    session: Session,
    background_tasks: BackgroundTasks,
    video_title: str | None = None,
) -> dict:
    lesson_uuid = uuid.uuid4()
    lesson_id = str(lesson_uuid)
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in config.ALLOWED_VIDEO_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported file format for {file.filename}.")
    content_type = (file.content_type or "").lower()
    if content_type not in config.ALLOWED_VIDEO_MIME_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported video MIME type.")

    filename = f"{lesson_id}{ext}"
    max_upload_size_bytes = config.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    video_path = await VideoService.save_video_stream(
        upload_file=file,
        filename=filename,
        max_size_bytes=max_upload_size_bytes,
    )
    VideoService.validate_video_duration(video_path)

    target_module = _ensure_teacher_module(module_id, current_user, session)
    module = target_module or await get_or_create_default_hierarchy(session, current_user)
    resolved_video_title = (video_title or "").strip() or file.filename

    lesson = Lesson(
        id=lesson_uuid,
        module_id=module.id,
        title=resolved_video_title,
        content_type="video",
        status="queued",
        duration_minutes=0,
        sort_order=0
    )
    duration_seconds = VideoService.get_video_duration_seconds(video_path)
    if duration_seconds:
        lesson.duration_minutes = max(1, int(round(duration_seconds / 60)))
    session.add(lesson)
    session.commit()

    if target_module is None and _role_name(current_user) == "student":
        existing_enrollment = session.exec(
            select(Enrollment).where(
                Enrollment.user_id == current_user.id,
                Enrollment.course_id == module.course_id,
            )
        ).first()
        if not existing_enrollment:
            session.add(Enrollment(user_id=current_user.id, course_id=module.course_id))
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
        "filename": file.filename,
    }

@router.post("/presign-upload")
async def presign_upload(
    data: dict,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Create lesson record and return a presigned S3 PUT URL for direct browser upload."""
    filename = data.get("filename", "video.mp4")
    content_type = data.get("content_type", "video/mp4")
    module_id = data.get("module_id")
    video_title = (data.get("video_title") or "").strip() or filename

    ext = os.path.splitext(filename)[1].lower()
    if ext not in config.ALLOWED_VIDEO_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported file format: {filename}")
    if content_type.lower() not in config.ALLOWED_VIDEO_MIME_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported video MIME type.")

    lesson_uuid = uuid.uuid4()
    lesson_id = str(lesson_uuid)
    s3_key = f"uploads/{lesson_id}{ext}"

    upload_url = generate_presigned_upload_url(s3_key, content_type)
    if not upload_url:
        raise HTTPException(status_code=503, detail="S3 not configured. Use /upload instead.")

    target_module = _ensure_teacher_module(module_id, current_user, session)
    module = target_module or await get_or_create_default_hierarchy(session, current_user)

    lesson = Lesson(
        id=lesson_uuid,
        module_id=module.id,
        title=video_title,
        content_type="video",
        status="pending_upload",
        duration_minutes=0,
        sort_order=0,
    )
    session.add(lesson)

    if target_module is None and _role_name(current_user) == "student":
        existing = session.exec(
            select(Enrollment).where(
                Enrollment.user_id == current_user.id,
                Enrollment.course_id == module.course_id,
            )
        ).first()
        if not existing:
            session.add(Enrollment(user_id=current_user.id, course_id=module.course_id))

    session.commit()
    return {"video_id": lesson_id, "upload_url": upload_url, "s3_key": s3_key, "expires_in": 3600}


@router.post("/{video_id}/confirm-upload")
async def confirm_upload(
    video_id: str,
    background_tasks: BackgroundTasks,
    data: dict,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Called after browser finishes uploading to S3. Downloads file and enqueues pipeline."""
    lesson = check_video_access(video_id, current_user, session)
    s3_key = data.get("s3_key", "")
    if not s3_key:
        raise HTTPException(status_code=400, detail="s3_key is required.")

    ext = os.path.splitext(s3_key)[1].lower()
    local_path = VideoService.UPLOAD_DIR / f"{video_id}{ext}"
    VideoService.ensure_dirs()

    if not download_from_s3(s3_key, local_path):
        raise HTTPException(status_code=502, detail="Failed to download video from S3.")

    VideoService.validate_video_duration(local_path)

    duration_seconds = VideoService.get_video_duration_seconds(local_path)
    if duration_seconds:
        lesson.duration_minutes = max(1, int(round(duration_seconds / 60)))
    lesson.status = "queued"
    session.add(lesson)
    session.commit()

    upsert_job_status(session, lesson_id=video_id, status="queued", progress=0)
    mode = enqueue_pipeline_job(
        video_id=video_id,
        video_path=str(local_path),
        fallback_task_adder=background_tasks.add_task,
    )
    return {
        "video_id": video_id,
        "status": "processing",
        "queue_mode": mode,
        "message": "Video upload confirmed and queued for processing.",
    }


@router.post("/upload")
async def upload_video(
    background_tasks: BackgroundTasks,
    _: None = Depends(rate_limit("upload", config.UPLOAD_RATE_LIMIT)),
    file: UploadFile = File(...),
    module_id: str | None = Form(default=None),
    video_title: str | None = Form(default=None),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    try:
        return await _create_lesson_and_enqueue(
            file=file,
            module_id=module_id,
            current_user=current_user,
            session=session,
            background_tasks=background_tasks,
            video_title=video_title,
        )
    except HTTPException:
        raise
    except ValueError as exc:
        message = str(exc)
        status_code = 413 if "size" in message.lower() or "large" in message.lower() else 400
        raise HTTPException(
            status_code=status_code,
            detail=message or f"File too large. Maximum allowed size is {config.MAX_UPLOAD_SIZE_MB} MB.",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload-batch")
async def upload_videos_batch(
    background_tasks: BackgroundTasks,
    _: None = Depends(rate_limit("upload", config.UPLOAD_RATE_LIMIT)),
    files: list[UploadFile] = File(...),
    module_id: str | None = Form(default=None),
    video_titles: list[str] | None = Form(default=None),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    if not files:
        raise HTTPException(status_code=400, detail="No files provided.")
    if len(files) > 20:
        raise HTTPException(status_code=400, detail="Maximum 20 files per batch.")

    results: list[dict] = []
    for index, file in enumerate(files):
        video_title = None
        if video_titles and index < len(video_titles):
            video_title = (video_titles[index] or "").strip() or None
        try:
            res = await _create_lesson_and_enqueue(
                file=file,
                module_id=module_id,
                current_user=current_user,
                session=session,
                background_tasks=background_tasks,
                video_title=video_title,
            )
            results.append({"ok": True, **res})
        except HTTPException as exc:
            results.append({"ok": False, "filename": file.filename, "error": exc.detail})
        except Exception as exc:
            results.append({"ok": False, "filename": file.filename, "error": str(exc)})

    success_count = len([r for r in results if r.get("ok")])
    return {
        "status": "completed",
        "total": len(files),
        "success_count": success_count,
        "failed_count": len(files) - success_count,
        "items": results,
    }


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
    
    module = await get_or_create_default_hierarchy(session, current_user)
    
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
    module = await get_or_create_default_hierarchy(session, current_user)
    lessons = session.exec(
        select(Lesson).where(Lesson.module_id == module.id).order_by(Lesson.created_at.desc())
    ).all()
    result = []
    for lesson in lessons:
        content = session.exec(select(ContentMetadata).where(ContentMetadata.lesson_id == lesson.id)).first()
        progress = session.exec(
            select(UserProgress).where(
                UserProgress.user_id == current_user.id,
                UserProgress.lesson_id == lesson.id,
            )
        ).first()
        result.append(
            {
                "id": str(lesson.id),
                "title": lesson.title,
                "status": lesson.status,
                "created_at": lesson.created_at,
                "video_url": content.video_url if content else None,
                "progress_percent": progress.progress_percent if progress else 0,
                "completion_status": progress.completion_status if progress else "not_started",
            }
        )
    return result


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
    questions = ai_analysis.get("questions") or ai_analysis.get("quizzes", [])
    return {"video_id": video_id, "questions": questions}


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
    ai_analysis = _get_ai_analysis(video_id, session)
    return {"video_id": video_id, "flashcards": ai_analysis.get("flashcards", [])}


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
    raw = ai_analysis.get("handsign_data", [])
    avatar = AvatarVideoService.get_cached_avatar_video(video_id)
    payload = build_handsign_payload(video_id, raw, avatar=avatar)
    payload["handsign_data"] = payload["glosses"]
    return payload


@router.put("/{video_id}/handsign")
async def update_handsign_data(
    video_id: str,
    data: dict,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    _ensure_handsign_editor(video_id, current_user, session)
    content = _get_content_metadata(video_id, session)
    if not content:
        raise HTTPException(status_code=404, detail="Khong tim thay metadata cua bai hoc.")

    glosses = data.get("glosses", data.get("handsign_data", []))
    review_status = str(data.get("review_status") or "reviewed")
    normalized = [
        {**gloss, "review_status": review_status, "source": gloss.get("source") or "human_review"}
        for gloss in normalize_glosses(glosses)
    ]

    ai_analysis = dict(content.ai_analysis or {})
    ai_analysis["handsign_data"] = normalized
    artifact_status = dict(ai_analysis.get("artifact_status") or {})
    artifact_status["handsign_data"] = {
        "status": "ready" if normalized else "empty",
        "error": None,
        "review_status": review_status if normalized else "empty",
    }
    ai_analysis["artifact_status"] = artifact_status
    ai_analysis["handsign_review"] = {
        "status": review_status if normalized else "empty",
        "reviewed_by": current_user.email,
    }
    content.ai_analysis = ai_analysis
    session.add(content)
    session.commit()

    avatar = AvatarVideoService.get_cached_avatar_video(video_id)
    payload = build_handsign_payload(video_id, normalized, avatar=avatar)
    payload["handsign_data"] = payload["glosses"]
    return payload


@router.post("/{video_id}/generate-avatar")
async def generate_avatar_endpoint(
    video_id: str,
    _: None = Depends(rate_limit("generate_avatar", config.AVATAR_RATE_LIMIT)),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    check_video_access(video_id, current_user, session)
    ai_analysis = _get_ai_analysis(video_id, session)
    glosses = normalize_glosses(ai_analysis.get("handsign_data", []))
    if not glosses:
        raise HTTPException(status_code=400, detail="Khong co du lieu handsign de sinh video.")
    
    cached = AvatarVideoService.get_cached_avatar_video(video_id)
    if cached and cached.get("status") == "ready":
        return cached

    gloss_text = " ".join(str(item.get("word", "")) for item in glosses if item.get("word"))
    result = await AvatarVideoService.generate_avatar_video(video_id, gloss_text, glosses)
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
        return AvatarVideoService.build_avatar_state(
            video_id,
            status="not_generated",
            avatar_video_url=None,
        )
    return cached


@router.get("/{video_id}/handsign-segments")
async def get_handsign_segments(
    video_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    check_video_access(video_id, current_user, session)
    ai_analysis = _get_ai_analysis(video_id, session)
    raw = normalize_glosses(ai_analysis.get("handsign_data", []))
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
    raw = normalize_glosses(ai_analysis.get("handsign_data", []))
    segments = expand_handsign_segments(raw)
    return build_render_manifest(video_id, segments)


@router.delete("/{video_id}")
async def delete_video(
    video_id: str,
    reason: str = Query(..., min_length=3, max_length=500),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    lesson = _ensure_lesson_owner_or_admin(video_id, current_user, session)
    lesson_uuid = lesson.id

    # Best-effort filesystem cleanup
    content = session.exec(select(ContentMetadata).where(ContentMetadata.lesson_id == lesson_uuid)).first()
    candidate_paths: list[Path] = []
    if content and content.video_url:
        candidate_paths.append(Path(content.video_url))
    candidate_paths.extend(VideoService.UPLOAD_DIR.glob(f"{video_id}.*"))
    for file_path in candidate_paths:
        try:
            if file_path.exists() and file_path.is_file():
                file_path.unlink()
        except Exception:
            # Ignore file cleanup failures; DB cleanup still proceeds.
            pass

    flashcards = session.exec(select(Flashcard).where(Flashcard.lesson_id == lesson_uuid)).all()
    flashcard_ids = [flashcard.id for flashcard in flashcards]
    if flashcard_ids:
        session.exec(delete(UserFlashcardProgress).where(UserFlashcardProgress.flashcard_id.in_(flashcard_ids)))
    session.exec(delete(Flashcard).where(Flashcard.lesson_id == lesson_uuid))

    quizzes = session.exec(select(Quiz).where(Quiz.lesson_id == lesson_uuid)).all()
    quiz_ids = [quiz.id for quiz in quizzes]
    if quiz_ids:
        question_ids = [question.id for question in session.exec(select(Question).where(Question.quiz_id.in_(quiz_ids))).all()]
        if question_ids:
            session.exec(delete(QuestionOption).where(QuestionOption.question_id.in_(question_ids)))
        session.exec(delete(Question).where(Question.quiz_id.in_(quiz_ids)))
        session.exec(delete(QuizAttempt).where(QuizAttempt.quiz_id.in_(quiz_ids)))
        session.exec(delete(Quiz).where(Quiz.lesson_id == lesson_uuid))

    session.exec(delete(UserProgress).where(UserProgress.lesson_id == lesson_uuid))
    session.exec(delete(ProcessingJob).where(ProcessingJob.lesson_id == lesson_uuid))
    session.exec(delete(ContentMetadata).where(ContentMetadata.lesson_id == lesson_uuid))
    _create_deletion_audit(
        session=session,
        entity_type="lesson",
        entity_id=str(lesson.id),
        entity_display_name=lesson.title,
        reason=reason,
        actor=current_user,
    )
    session.delete(lesson)
    session.commit()

    return {"video_id": video_id, "deleted": True}
