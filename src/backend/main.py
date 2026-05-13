import os
import sys
import socket
import ipaddress
from urllib.parse import urlparse
# Thêm thư mục gốc vào sys.path để nhận diện module 'src'
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

import uuid
import logging
import asyncio
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks, Depends, Response
from fastapi.responses import FileResponse
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor

from src.backend.services.video_service import VideoService
from src.backend.services.ai_service import AIService
from src.backend.services.handsign_animation_service import (
    expand_handsign_segments,
    build_render_manifest,
)
from src.backend.services.avatar_video_service import AvatarVideoService
from src.backend import config
from src.backend.database import create_db_and_tables, get_session
from src.backend.models import User, Video, LectureData, Flashcard, ProcessingJob
from src.backend.auth import get_password_hash, verify_password, create_access_token, get_current_user
from src.backend.schemas.auth import UserCreate, Token
from sqlmodel import Session, select

# Cấu hình Logging
logging.basicConfig(
    level=getattr(logging, config.LOG_LEVEL),
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)

app = FastAPI(title="A20 Video Captioning & Summary API")

# Executor để chạy các tác vụ đồng bộ (Whisper) mà không làm nghẽn event loop
executor = ThreadPoolExecutor(max_workers=2)

# Cấu hình CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Thư mục lưu trữ trạng thái đơn giản (In-memory)
processing_status = {}


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
    job.updated_at = datetime.utcnow()
    session.add(job)
    session.commit()


def mark_stale_jobs_as_failed():
    non_terminal_statuses = {
        "queued",
        "downloading",
        "extracting_audio",
        "transcribing",
        "ai_processing",
    }
    with Session(engine) as session:
        statement = select(ProcessingJob).where(ProcessingJob.status.in_(non_terminal_statuses))
        stale_jobs = session.exec(statement).all()
        for job in stale_jobs:
            job.status = "failed_restart"
            job.error_message = "Server restarted before job completion."
            job.updated_at = datetime.utcnow()
            session.add(job)
            video = session.get(Video, job.video_id)
            if video and video.status in non_terminal_statuses:
                video.status = "failed_restart"
                session.add(video)
        session.commit()

@app.on_event("startup")
def on_startup():
    logger.info("🚀 Đang khởi tạo cơ sở dữ liệu...")
    create_db_and_tables()
    mark_stale_jobs_as_failed()

@app.on_event("shutdown")
def shutdown_event():
    logger.info("🛑 Đang dọn dẹp tài nguyên và tắt server...")
    executor.shutdown(wait=True)

def run_transcription_sync(audio_path: Path, video_id: str):
    """Hàm chạy Whisper (đồng bộ) trong thread riêng"""
    return AIService.transcribe(audio_path, video_id)

from src.backend.database import engine


def _is_public_ip(ip_str: str) -> bool:
    try:
        ip_obj = ipaddress.ip_address(ip_str)
    except ValueError:
        return False
    return not (
        ip_obj.is_private
        or ip_obj.is_loopback
        or ip_obj.is_link_local
        or ip_obj.is_reserved
        or ip_obj.is_multicast
        or ip_obj.is_unspecified
    )


def validate_external_video_url(raw_url: str) -> str:
    if not raw_url:
        raise HTTPException(status_code=400, detail="Video URL is required.")

    parsed = urlparse(raw_url.strip())
    if parsed.scheme not in {"http", "https"}:
        raise HTTPException(status_code=400, detail="Only http/https URLs are allowed.")
    if not parsed.netloc:
        raise HTTPException(status_code=400, detail="Invalid URL.")

    hostname = parsed.hostname
    if not hostname:
        raise HTTPException(status_code=400, detail="Invalid URL host.")

    lowered = hostname.lower()
    if lowered in {"localhost", "127.0.0.1", "::1"} or lowered.endswith(".local"):
        raise HTTPException(status_code=400, detail="Local addresses are not allowed.")

    try:
        resolved = socket.getaddrinfo(hostname, parsed.port or 443, proto=socket.IPPROTO_TCP)
    except socket.gaierror:
        raise HTTPException(status_code=400, detail="Unable to resolve URL host.")

    for record in resolved:
        ip = record[4][0]
        if not _is_public_ip(ip):
            raise HTTPException(status_code=400, detail="Target host is not publicly routable.")

    return raw_url.strip()

async def run_video_pipeline(video_id: str, video_path: Path):
    """
    Pipeline xử lý video: Tách audio -> Transcribe -> AI Summary & Metadata -> Lưu DB
    """
    try:
        with Session(engine) as session:
            # Helper để cập nhật trạng thái video
            def update_status(new_status: str):
                video = session.get(Video, video_id)
                if video:
                    video.status = new_status
                    session.add(video)
                    session.commit()
                progress_map = {
                    "queued": 0,
                    "downloading": 5,
                    "extracting_audio": 20,
                    "transcribing": 50,
                    "ai_processing": 80,
                    "completed": 100,
                }
                upsert_job_status(
                    session,
                    video_id=video_id,
                    status=new_status,
                    progress=progress_map.get(new_status, 0),
                )
                # Đồng thời cập nhật processing_status (cho tương thích ngược tạm thời)
                processing_status[video_id] = new_status

            # Bước 1: Tách âm thanh
            update_status("extracting_audio")
            logger.info(f"🎬 [{video_id}] Đang tách âm thanh...")
            audio_path = VideoService.extract_audio(video_path)
            
            # Bước 2: Nhận diện tiếng nói (Whisper)
            update_status("transcribing")
            logger.info(f"🎙️ [{video_id}] Đang nhận diện tiếng nói (Whisper CPU)...")
            
            loop = asyncio.get_event_loop()
            transcript_data = await loop.run_in_executor(executor, run_transcription_sync, audio_path, video_id)
            
            # Nếu ngôn ngữ không phải tiếng Việt, dịch sang tiếng Việt
            if transcript_data.get("language") != "vi":
                logger.info(f"🌐 [{video_id}] Ngôn ngữ là {transcript_data.get('language')}, đang dịch sang tiếng Việt...")
                transcript_data = await AIService.translate_transcript_to_vi(transcript_data)
                
            # Bước 3: Phân tích AI (Summary, Timeline, Highlights, etc.)
            update_status("ai_processing")
            logger.info(f"🧠 [{video_id}] Đang phân tích AI (Batching)...")
            
            # Gọi gộp các tính năng AI
            summary, metadata, briefing, notebook_data, handsign_data = await asyncio.gather(
                AIService.summarize(transcript_data),
                AIService.process_all_lecture_metadata(transcript_data),
                AIService.generate_pre_lecture_briefing(transcript_data),
                AIService.generate_notebook_data(transcript_data),
                AIService.generate_handsign_data(transcript_data),
            )
            
            # Bước 4: Lưu kết quả vào DB
            logger.info(f"💾 [{video_id}] Đang lưu kết quả vào bảng lecture_data...")
            lecture_entry = LectureData(
                video_id=video_id,
                transcript=transcript_data,
                summary=summary,
                timeline=metadata.get("timeline"),
                highlights=metadata.get("highlights"),
                questions=metadata.get("questions"),
                briefing=briefing,
                visual_data=notebook_data.get("visual_data"),
                cover_image_url=notebook_data.get("cover_image_url"),
                handsign_data=handsign_data
            )
            session.add(lecture_entry)

            # Lưu Flashcards
            flashcards_data = notebook_data.get("flashcards", [])
            for fc in flashcards_data:
                new_fc = Flashcard(
                    video_id=video_id,
                    front=fc.get("front"),
                    back=fc.get("back")
                )
                session.add(new_fc)
            
            update_status("completed")
            logger.info(f"✅ [{video_id}] Hoàn thành toàn bộ pipeline.")
            
    except Exception as e:
        with Session(engine) as session:
            video = session.get(Video, video_id)
            if video:
                video.status = f"failed: {str(e)}"
                session.add(video)
                session.commit()
            upsert_job_status(
                session,
                video_id=video_id,
                status="failed",
                progress=100,
                error_message=str(e),
            )
        processing_status[video_id] = f"failed: {str(e)}"
        logger.error(f"❌ [{video_id}] Lỗi pipeline: {e}")

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "Video Captioning API"}

# --- Auth Endpoints ---

@app.post("/api/auth/register", response_model=dict)
async def register(user_data: UserCreate, session: Session = Depends(get_session)):
    # Kiểm tra email tồn tại
    statement = select(User).where(User.email == user_data.email)
    existing_user = session.exec(statement).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email is already in use.")
    
    # Tạo user mới
    new_user = User(
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        full_name=user_data.full_name,
        role=user_data.role
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    return {"message": "Registration successful", "user_id": new_user.id}

@app.post("/api/auth/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    response: Response = None,
    session: Session = Depends(get_session)
):
    # Trong OAuth2PasswordRequestForm, 'username' sẽ chứa Email
    statement = select(User).where(User.email == form_data.username)
    user = session.exec(statement).first()
    
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    
    access_token = create_access_token(data={"sub": user.email})
    if response is not None:
        response.set_cookie(
            key=config.AUTH_COOKIE_NAME,
            value=access_token,
            httponly=True,
            secure=config.AUTH_COOKIE_SECURE,
            samesite=config.AUTH_COOKIE_SAMESITE,
            max_age=config.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            path="/",
        )
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "role": user.role
    }


@app.post("/api/auth/logout")
async def logout(response: Response):
    response.delete_cookie(key=config.AUTH_COOKIE_NAME, path="/")
    return {"message": "Logged out"}

# --- Video Endpoints ---

@app.post("/api/videos/upload")
async def upload_video(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Endpoint upload video: stream file to disk, create DB record, and enqueue pipeline.
    """
    video_id = str(uuid.uuid4())
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".mp4", ".mov", ".avi", ".mkv"]:
        raise HTTPException(status_code=400, detail="Unsupported file format.")

    filename = f"{video_id}{ext}"
    max_upload_size_bytes = config.MAX_UPLOAD_SIZE_MB * 1024 * 1024

    try:
        logger.info(f"[{video_id}] Receiving file from {current_user.email}: {file.filename}")
        video_path = await VideoService.save_video_stream(
            upload_file=file,
            filename=filename,
            max_size_bytes=max_upload_size_bytes,
        )

        new_video = Video(
            id=video_id,
            user_id=current_user.id,
            title=file.filename,
            storage_path=str(video_path),
            status="queued"
        )
        session.add(new_video)
        session.commit()

        upsert_job_status(
            session,
            video_id=video_id,
            status="queued",
            progress=0,
        )
        processing_status[video_id] = "queued"
        background_tasks.add_task(run_video_pipeline, video_id, video_path)

        return {
            "video_id": video_id,
            "status": "processing",
            "message": "Video uploaded and queued for processing."
        }
    except ValueError as e:
        logger.warning(f"Upload rejected for {video_id}: {e}")
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum allowed size is {config.MAX_UPLOAD_SIZE_MB} MB.",
        )
    except Exception as e:
        logger.error(f"Upload error for {video_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/videos/process-url")
async def process_url(
    background_tasks: BackgroundTasks, 
    data: dict,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Tiếp nhận URL video, tạo record DB và tải xuống để xử lý.
    """
    url = validate_external_video_url(data.get("url"))
    
    video_id = str(uuid.uuid4())
    
    # Tạo record ban đầu
    new_video = Video(
        id=video_id,
        user_id=current_user.id,
        title=f"Video from URL: {url[:30]}...",
        storage_path="", # Sẽ cập nhật sau khi tải xong
        status="queued"
    )
    session.add(new_video)
    session.commit()
    upsert_job_status(
        session,
        video_id=video_id,
        status="queued",
        progress=0,
    )

    async def download_and_run_pipeline(vid: str, vurl: str):
        try:
            with Session(engine) as sub_session:
                video = sub_session.get(Video, vid)
                if video:
                    video.status = "downloading"
                    sub_session.add(video)
                    sub_session.commit()
                upsert_job_status(
                    sub_session,
                    video_id=vid,
                    status="downloading",
                    progress=5,
                )
            
            processing_status[vid] = "downloading"
            vpath = await VideoService.download_video(vurl, vid)
            
            # Cập nhật path sau khi tải xong
            with Session(engine) as sub_session:
                video = sub_session.get(Video, vid)
                if video:
                    video.storage_path = str(vpath)
                    sub_session.add(video)
                    sub_session.commit()

            await run_video_pipeline(vid, vpath)
        except Exception as e:
            with Session(engine) as sub_session:
                video = sub_session.get(Video, vid)
                if video:
                    video.status = f"failed_download: {str(e)}"
                    sub_session.add(video)
                    sub_session.commit()
                upsert_job_status(
                    sub_session,
                    video_id=vid,
                    status="failed",
                    progress=100,
                    error_message=str(e),
                )
            processing_status[vid] = f"failed_download: {str(e)}"
            logger.error(f"❌ Lỗi tải video {vid}: {e}")

    # Đưa vào hàng chờ
    processing_status[video_id] = "queued"
    background_tasks.add_task(download_and_run_pipeline, video_id, url)
    
    return {
        "video_id": video_id,
        "status": "processing",
        "message": "URL accepted and download has started."
    }

@app.get("/api/videos/me")
async def list_my_videos(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Lấy danh sách video của người dùng hiện tại"""
    statement = select(Video).where(Video.user_id == current_user.id)
    videos = session.exec(statement).all()
    return videos

@app.get("/api/videos/{video_id}/status")
async def get_video_status(
    video_id: str, 
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Kiểm tra trạng thái xử lý của video (có kiểm tra quyền)"""
    video = session.get(Video, video_id)
    if not video:
        raise HTTPException(status_code=404, detail="Không tìm thấy video.")
    
    # Kiểm tra quyền: Chỉ chủ sở hữu hoặc Admin mới được xem
    if video.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Bạn không có quyền xem trạng thái video này.")
        
    return {"video_id": video_id, "status": video.status}


@app.get("/api/videos/{video_id}/job-status")
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

# Helper kiểm tra quyền truy cập dữ liệu bài giảng
def check_video_access(video_id: str, user: User, session: Session):
    video = session.get(Video, video_id)
    if not video:
        raise HTTPException(status_code=404, detail="Không tìm thấy video.")
    if video.user_id != user.id and user.role != "admin":
        raise HTTPException(status_code=403, detail="Bạn không có quyền truy cập dữ liệu này.")
    return video

@app.get("/api/videos/{video_id}/transcript")
async def get_transcript(
    video_id: str, 
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Lấy kết quả phụ đề (có kiểm tra quyền)"""
    check_video_access(video_id, current_user, session)
    lecture = session.get(LectureData, video_id)
    if not lecture or not lecture.transcript:
        return {"video_id": video_id, "message": "Phụ đề chưa sẵn sàng."}
    return lecture.transcript

@app.get("/api/videos/{video_id}/summary")
async def get_summary(
    video_id: str, 
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Lấy tóm tắt (có kiểm tra quyền)"""
    check_video_access(video_id, current_user, session)
    lecture = session.get(LectureData, video_id)
    if not lecture or not lecture.summary:
        return {"video_id": video_id, "message": "Tóm tắt chưa sẵn sàng."}
    return {"video_id": video_id, "summary": lecture.summary}

@app.get("/api/videos/{video_id}/timeline")
async def get_timeline(
    video_id: str, 
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Lấy timeline (có kiểm tra quyền)"""
    check_video_access(video_id, current_user, session)
    lecture = session.get(LectureData, video_id)
    if not lecture or not lecture.timeline:
        return {"video_id": video_id, "timeline": []}
    return {"video_id": video_id, "timeline": lecture.timeline}

@app.get("/api/videos/{video_id}/highlights")
async def get_highlights(
    video_id: str, 
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Lấy highlights (có kiểm tra quyền)"""
    check_video_access(video_id, current_user, session)
    lecture = session.get(LectureData, video_id)
    if not lecture or not lecture.highlights:
        return {"video_id": video_id, "highlights": []}
    return {"video_id": video_id, "highlights": lecture.highlights}

@app.get("/api/videos/{video_id}/questions")
async def get_questions(
    video_id: str, 
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Lấy questions (có kiểm tra quyền)"""
    check_video_access(video_id, current_user, session)
    lecture = session.get(LectureData, video_id)
    if not lecture or not lecture.questions:
        return {"video_id": video_id, "questions": []}
    return {"video_id": video_id, "questions": lecture.questions}

@app.get("/api/videos/{video_id}/briefing")
async def get_briefing(
    video_id: str, 
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Lấy briefing (có kiểm tra quyền)"""
    check_video_access(video_id, current_user, session)
    lecture = session.get(LectureData, video_id)
    if not lecture or not lecture.briefing:
        return {"video_id": video_id, "message": "Briefing chưa sẵn sàng."}
    return {"video_id": video_id, "briefing": lecture.briefing}

@app.get("/api/videos/{video_id}/flashcards")
async def get_flashcards(
    video_id: str, 
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Lấy danh sách flashcards của video (có kiểm tra quyền)"""
    check_video_access(video_id, current_user, session)
    statement = select(Flashcard).where(Flashcard.video_id == video_id)
    flashcards = session.exec(statement).all()
    return {"video_id": video_id, "flashcards": flashcards}

@app.get("/api/videos/{video_id}/viz-data")
async def get_viz_data(
    video_id: str, 
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Lấy dữ liệu trực quan hóa (charts) cho video (có kiểm tra quyền)"""
    check_video_access(video_id, current_user, session)
    lecture = session.get(LectureData, video_id)
    if not lecture or not lecture.visual_data:
        return {"video_id": video_id, "visual_data": {}, "cover_image_url": None}
    return {
        "video_id": video_id, 
        "visual_data": lecture.visual_data,
        "cover_image_url": lecture.cover_image_url
    }

@app.get("/api/videos/{video_id}/handsign")
async def get_handsign_data(
    video_id: str, 
    current_user: User = Depends(get_current_user), 
    session: Session = Depends(get_session)
):
    """
    Lấy dữ liệu chuỗi từ khóa thủ ngữ (ASL Glosses) cho video.
    """
    check_video_access(video_id, current_user, session)
    lecture = session.get(LectureData, video_id)
    if not lecture or not lecture.handsign_data:
        return {"video_id": video_id, "handsign_data": []}
        
    return {
        "video_id": video_id, 
        "handsign_data": lecture.handsign_data
    }

@app.post("/api/videos/{video_id}/generate-avatar")
async def generate_avatar_endpoint(
    video_id: str,
    current_user: User = Depends(get_current_user), 
    session: Session = Depends(get_session)
):
    """
    Sinh video Avatar thực tế qua Replicate API dựa trên Glosses.
    """
    check_video_access(video_id, current_user, session)
    lecture = session.get(LectureData, video_id)
    if not lecture or not lecture.handsign_data:
        raise HTTPException(status_code=400, detail="Không có dữ liệu handsign để sinh video.")

    # Kiểm tra cache
    cached = AvatarVideoService.get_cached_avatar_video(video_id)
    if cached:
        return cached

    # Sử dụng tóm tắt (summary) để làm dữ liệu sinh Video Avatar
    if not lecture.summary:
        raise HTTPException(status_code=400, detail="Video chưa có tóm tắt tiếng Việt.")
    
    summary_text = "\n".join(lecture.summary)
    
    # Sinh các từ khóa VSL từ văn bản tóm tắt
    summary_glosses = await AIService.generate_handsign_from_text(summary_text)

    # Sinh video (chỉ tập trung vào phần tóm tắt để AI kiểm soát tay tốt hơn)
    result = await AvatarVideoService.generate_avatar_video(video_id, summary_text, summary_glosses)
    
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
        
    return result

@app.get("/api/videos/{video_id}/avatar")
async def get_avatar_video(
    video_id: str,
    current_user: User = Depends(get_current_user), 
    session: Session = Depends(get_session)
):
    """Lấy thông tin video Avatar đã tạo"""
    check_video_access(video_id, current_user, session)
    cached = AvatarVideoService.get_cached_avatar_video(video_id)
    if not cached:
        return {"video_id": video_id, "avatar_video_url": None}
    return cached

@app.get("/api/avatar-video/{video_id}")
async def serve_avatar_video(
    video_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Serve file video avatar đã concat từ local disk.
    Thẻ <video> không gửi được header Authorization, nên accept token qua query param.
    """
    # Xác thực bằng query parameter token
    check_video_access(video_id, current_user, session)

    video_path = AvatarVideoService.get_avatar_video_path(video_id)
    if not video_path.exists():
        raise HTTPException(status_code=404, detail="Avatar video file not found.")
    return FileResponse(
        path=str(video_path),
        media_type="video/mp4",
        filename=f"{video_id}_avatar.mp4"
    )

@app.get("/api/videos/{video_id}/handsign-segments")
async def get_handsign_segments(
    video_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Giai đoạn 0/1: chuỗi gloss mở rộng thành các đoạn [start, end] để nội suy tay / export render.
    """
    check_video_access(video_id, current_user, session)
    lecture = session.get(LectureData, video_id)
    raw = lecture.handsign_data if lecture and lecture.handsign_data else []
    if not isinstance(raw, list):
        raw = []
    segments = expand_handsign_segments(raw)
    return {"video_id": video_id, "segments": segments}


@app.get("/api/videos/{video_id}/handsign-export")
async def get_handsign_export_manifest(
    video_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Giai đoạn 1: manifest JSON (timeline + HamNoSys) cho Blender/Unity — không render trong API.
    """
    check_video_access(video_id, current_user, session)
    lecture = session.get(LectureData, video_id)
    raw = lecture.handsign_data if lecture and lecture.handsign_data else []
    if not isinstance(raw, list):
        raw = []
    segments = expand_handsign_segments(raw)
    return build_render_manifest(video_id, segments)


if __name__ == "__main__":
    import uvicorn
    # Đảm bảo các thư mục tồn tại
    VideoService.ensure_dirs()
    AIService.TRANSCRIPT_DIR.mkdir(parents=True, exist_ok=True)
    AIService.AI_RESULTS_DIR.mkdir(parents=True, exist_ok=True)

    
    logger.info("🚀 Starting A20 Backend Server on port 8000 with reload...")
    uvicorn.run("src.backend.main:app", host="0.0.0.0", port=8000, reload=True)


